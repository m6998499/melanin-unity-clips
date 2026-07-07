insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'clip-submissions-v2',
  'clip-submissions-v2',
  false,
  5368709120,
  array['video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.video_submissions
alter column storage_bucket set default 'clip-submissions-v2';

drop policy if exists "public can submit pending videos" on public.video_submissions;
create policy "public can submit pending videos"
on public.video_submissions
for insert
to anon
with check (
  status = 'pending_review'
  and storage_bucket in ('clip-submissions', 'clip-submissions-v2')
  and uploader_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);

drop policy if exists "public can upload pending clip submissions" on storage.objects;
create policy "public can upload pending clip submissions"
on storage.objects
for insert
to anon
with check (
  bucket_id in ('clip-submissions', 'clip-submissions-v2')
  and (storage.foldername(name))[1] = 'pending'
);

drop policy if exists "admins can read clip submissions" on storage.objects;
create policy "admins can read clip submissions"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('clip-submissions', 'clip-submissions-v2')
  and public.is_admin(auth.uid())
);
