create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  author_name text not null,
  message text not null check (char_length(message) between 3 and 180),
  streak_at_post integer not null default 0 check (streak_at_post >= 0),
  badge text,
  support_count integer not null default 0 check (support_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists community_posts_created_at_idx
on community_posts (created_at desc);

create table if not exists community_post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts(id) on delete cascade,
  reporter_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, reporter_id)
);

alter table community_posts enable row level security;
alter table community_post_reports enable row level security;

drop policy if exists "community_posts authenticated can read" on community_posts;
create policy "community_posts authenticated can read"
on community_posts for select
using (auth.role() = 'authenticated');

drop policy if exists "community_posts own insert" on community_posts;
create policy "community_posts own insert"
on community_posts for insert
with check (auth.uid() = user_id);

drop policy if exists "community_posts own delete" on community_posts;
create policy "community_posts own delete"
on community_posts for delete
using (auth.uid() = user_id);

drop policy if exists "community_post_reports own data" on community_post_reports;
create policy "community_post_reports own data"
on community_post_reports for all
using (auth.uid() = reporter_id)
with check (auth.uid() = reporter_id);

create or replace function public.support_community_post(post_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update community_posts
  set support_count = support_count + 1
  where id = post_id;
$$;

revoke all on function public.support_community_post(uuid) from public;
grant execute on function public.support_community_post(uuid) to authenticated;
