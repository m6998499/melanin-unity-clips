create extension if not exists "pgcrypto";

alter table public.video_submissions
  add column if not exists owner_delete_token uuid,
  add column if not exists upload_state text not null default 'completed';

alter table public.video_submissions
  alter column storage_bucket set default 'clip-submissions';

alter table public.video_submissions
  drop constraint if exists video_submissions_upload_state_check;

alter table public.video_submissions
  add constraint video_submissions_upload_state_check
  check (upload_state in ('pending', 'uploading', 'completed', 'failed', 'deleted'));

create index if not exists video_submissions_owner_delete_token_idx
  on public.video_submissions (owner_delete_token);

create index if not exists video_submissions_status_created_idx
  on public.video_submissions (status, created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'clip-submissions',
  'clip-submissions',
  false,
  52428800,
  array['video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp', 'video/x-matroska']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can upload pending clip submissions" on storage.objects;
create policy "public can upload pending clip submissions"
on storage.objects
for insert
to anon
with check (
  bucket_id = 'clip-submissions'
  and (storage.foldername(name))[1] = 'pending'
);

drop policy if exists "public cannot overwrite clip submissions" on storage.objects;
create policy "public cannot overwrite clip submissions"
on storage.objects
for update
to anon
using (false)
with check (false);

drop policy if exists "admins can read clip submissions" on storage.objects;
create policy "admins can read clip submissions"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'clip-submissions'
  and public.is_admin(auth.uid())
);

drop policy if exists "public can submit pending videos" on public.video_submissions;
create policy "public can submit pending videos"
on public.video_submissions
for insert
to anon
with check (
  status = 'pending_review'
  and storage_bucket = 'clip-submissions'
  and storage_path like 'pending/%'
  and file_type in ('video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp', 'video/x-matroska')
  and file_size > 0
  and file_size <= 52428800
  and uploader_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);
