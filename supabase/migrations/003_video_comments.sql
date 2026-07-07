create table if not exists public.video_comments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.video_submissions(id) on delete cascade,
  author_name text not null default 'Guest',
  body text not null check (char_length(body) between 1 and 500),
  status text not null default 'visible' check (status in ('visible', 'hidden', 'removed')),
  created_at timestamptz not null default now()
);

create index if not exists video_comments_submission_created_idx
  on public.video_comments (submission_id, created_at);

alter table public.video_comments enable row level security;

drop policy if exists "Public can read visible video comments" on public.video_comments;
create policy "Public can read visible video comments"
on public.video_comments
for select
to anon
using (status = 'visible');

drop policy if exists "Public can add visible video comments" on public.video_comments;
create policy "Public can add visible video comments"
on public.video_comments
for insert
to anon
with check (status = 'visible');
