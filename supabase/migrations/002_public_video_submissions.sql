create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'video_status') then
    create type public.video_status as enum ('draft', 'pending_review', 'published', 'rejected', 'removed');
  end if;
end $$;

create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.admin_roles where user_id = uid);
$$;

create table if not exists public.video_submissions (
  id uuid primary key default gen_random_uuid(),
  uploader_email text not null,
  title text not null check (char_length(title) between 2 and 120),
  caption text,
  category text not null,
  storage_bucket text not null default 'clip-submissions',
  storage_path text not null,
  original_filename text,
  file_type text,
  file_size bigint,
  status public.video_status not null default 'pending_review',
  admin_notes text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.video_submissions enable row level security;

drop policy if exists "public can submit pending videos" on public.video_submissions;
create policy "public can submit pending videos"
on public.video_submissions
for insert
to anon
with check (
  status = 'pending_review'
  and storage_bucket = 'clip-submissions'
  and uploader_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);

drop policy if exists "admins can read submissions" on public.video_submissions;
create policy "admins can read submissions"
on public.video_submissions
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "admins can update submissions" on public.video_submissions;
create policy "admins can update submissions"
on public.video_submissions
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'clip-submissions',
  'clip-submissions',
  false,
  1073741824,
  array['video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update
set
  public = excluded.public,
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

drop policy if exists "admins can read clip submissions" on storage.objects;
create policy "admins can read clip submissions"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'clip-submissions'
  and public.is_admin(auth.uid())
);
