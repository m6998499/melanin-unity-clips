create extension if not exists "pgcrypto";

create type public.video_status as enum ('draft', 'pending_review', 'published', 'rejected', 'removed');
create type public.report_status as enum ('open', 'reviewed', 'dismissed', 'action_taken');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table public.upload_permissions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  caption text,
  category text not null,
  video_url text not null,
  thumbnail_url text,
  status public.video_status not null default 'pending_review',
  view_count bigint not null default 0,
  report_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  reason text not null,
  details text,
  status public.report_status not null default 'open',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
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

create or replace function public.can_upload(user_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.upload_permissions where lower(email) = lower(user_email));
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.admin_roles enable row level security;
alter table public.upload_permissions enable row level security;
alter table public.videos enable row level security;
alter table public.reports enable row level security;
alter table public.app_settings enable row level security;

create policy "profiles self read" on public.profiles for select using (auth.uid() = id or public.is_admin(auth.uid()));
create policy "profiles self update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "categories public read" on public.categories for select using (is_active = true);
create policy "categories admin write" on public.categories for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admin roles admin read" on public.admin_roles for select using (public.is_admin(auth.uid()));
create policy "admin roles admin write" on public.admin_roles for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "upload permissions admin read" on public.upload_permissions for select using (public.is_admin(auth.uid()));
create policy "upload permissions admin write" on public.upload_permissions for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "videos public published read" on public.videos for select using (status = 'published' or user_id = auth.uid() or public.is_admin(auth.uid()));
create policy "videos approved insert" on public.videos for insert with check (
  auth.uid() = user_id and (public.is_admin(auth.uid()) or public.can_upload((auth.jwt() ->> 'email')))
);
create policy "videos owner draft update" on public.videos for update using (auth.uid() = user_id and status in ('draft', 'pending_review')) with check (auth.uid() = user_id);
create policy "videos admin update" on public.videos for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "videos admin delete" on public.videos for delete using (public.is_admin(auth.uid()));
create policy "reports insert authenticated" on public.reports for insert with check (auth.uid() = reporter_id or reporter_id is null);
create policy "reports admin read" on public.reports for select using (public.is_admin(auth.uid()));
create policy "reports admin update" on public.reports for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "settings public read" on public.app_settings for select using (true);
create policy "settings admin write" on public.app_settings for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

insert into public.categories (name, slug) values
  ('Education', 'education'),
  ('Motivation', 'motivation'),
  ('Lifestyle', 'lifestyle'),
  ('Entrepreneurship', 'entrepreneurship'),
  ('Culture', 'culture'),
  ('Entertainment', 'entertainment'),
  ('Wellness', 'wellness'),
  ('Local Business', 'local-business'),
  ('Community', 'community'),
  ('Comedy', 'comedy'),
  ('News Commentary', 'news-commentary'),
  ('Creator Content', 'creator-content')
on conflict do nothing;
