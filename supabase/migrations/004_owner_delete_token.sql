alter table public.video_submissions
add column if not exists owner_delete_token uuid;

create index if not exists video_submissions_owner_delete_token_idx
on public.video_submissions (owner_delete_token);
