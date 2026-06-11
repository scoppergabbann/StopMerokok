create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  age integer check (age is null or age >= 18),
  cigarette_brand text,
  smoking_baseline_per_day integer not null check (smoking_baseline_per_day >= 0),
  smoking_started_age integer check (smoking_started_age is null or smoking_started_age >= 0),
  smoking_started_year integer check (smoking_started_year is null or smoking_started_year >= 1900),
  today_smoked_count integer check (today_smoked_count is null or today_smoked_count >= 0),
  pack_price numeric not null check (pack_price >= 0),
  sticks_per_pack integer not null check (sticks_per_pack > 0),
  target_type text not null check (target_type in ('quit_total', 'reduce_slowly', 'seven_days', 'thirty_days')),
  reason_to_quit text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles add column if not exists age integer check (age is null or age >= 18);
alter table profiles add column if not exists cigarette_brand text;
alter table profiles add column if not exists smoking_started_age integer check (smoking_started_age is null or smoking_started_age >= 0);
alter table profiles add column if not exists smoking_started_year integer check (smoking_started_year is null or smoking_started_year >= 1900);
alter table profiles add column if not exists today_smoked_count integer check (today_smoked_count is null or today_smoked_count >= 0);

create table if not exists daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  status text not null check (status in ('smoke_free', 'reduced', 'relapsed')),
  smoked_count integer not null default 0 check (smoked_count >= 0),
  mood text,
  trigger text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists craving_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date timestamptz not null default now(),
  status text not null check (status in ('passed', 'smoked')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  mood text,
  story text,
  challenge text,
  gratitude text,
  tomorrow_focus text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  category text,
  target_amount numeric not null check (target_amount >= 0),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table rewards add column if not exists category text;

create table if not exists donation_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  reward_id uuid references rewards(id) on delete set null,
  title text not null,
  amount numeric not null check (amount > 0),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  badge_name text not null,
  badge_description text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, badge_name)
);

create table if not exists notification_settings (
  user_id uuid primary key references profiles(id) on delete cascade,
  enabled boolean not null default false,
  reminder_hour integer not null default 20 check (reminder_hour >= 0 and reminder_hour <= 23),
  last_notified_date date,
  updated_at timestamptz not null default now()
);

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

alter table profiles enable row level security;
alter table daily_checkins enable row level security;
alter table craving_logs enable row level security;
alter table journals enable row level security;
alter table rewards enable row level security;
alter table donation_allocations enable row level security;
alter table user_badges enable row level security;
alter table notification_settings enable row level security;
alter table community_posts enable row level security;
alter table community_post_reports enable row level security;

drop policy if exists "profiles own data" on profiles;
create policy "profiles own data"
on profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "daily_checkins own data" on daily_checkins;
create policy "daily_checkins own data"
on daily_checkins for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "craving_logs own data" on craving_logs;
create policy "craving_logs own data"
on craving_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "journals own data" on journals;
create policy "journals own data"
on journals for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "rewards own data" on rewards;
create policy "rewards own data"
on rewards for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "donation_allocations own data" on donation_allocations;
create policy "donation_allocations own data"
on donation_allocations for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_badges own data" on user_badges;
create policy "user_badges own data"
on user_badges for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "notification_settings own data" on notification_settings;
create policy "notification_settings own data"
on notification_settings for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

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

create or replace function public.get_leaderboard(limit_count integer default 20)
returns table (
  user_id uuid,
  name text,
  checkin_count bigint,
  smoke_free_days bigint,
  reduced_days bigint,
  relapse_days bigint,
  current_streak bigint,
  last_checkin date,
  consistency_score numeric
)
language sql
security definer
set search_path = public
as $$
  with smoke_free_days as (
    select distinct user_id, date
    from daily_checkins
    where status = 'smoke_free'
  ),
  numbered_smoke_free_days as (
    select
      user_id,
      date,
      date - (row_number() over (partition by user_id order by date))::int as streak_group
    from smoke_free_days
  ),
  latest_groups as (
    select distinct on (user_id)
      user_id,
      streak_group
    from numbered_smoke_free_days
    order by user_id, date desc
  ),
  streaks as (
    select
      numbered_smoke_free_days.user_id,
      count(*)::bigint as current_streak,
      max(numbered_smoke_free_days.date) as last_smoke_free_date
    from numbered_smoke_free_days
    join latest_groups
      on latest_groups.user_id = numbered_smoke_free_days.user_id
      and latest_groups.streak_group = numbered_smoke_free_days.streak_group
    group by numbered_smoke_free_days.user_id
  ),
  aggregates as (
    select
      profiles.id as user_id,
      profiles.name,
      count(daily_checkins.id)::bigint as checkin_count,
      count(*) filter (where daily_checkins.status = 'smoke_free')::bigint as smoke_free_days,
      count(*) filter (where daily_checkins.status = 'reduced')::bigint as reduced_days,
      count(*) filter (where daily_checkins.status = 'relapsed')::bigint as relapse_days,
      max(daily_checkins.date) as last_checkin
    from profiles
    join daily_checkins on daily_checkins.user_id = profiles.id
    group by profiles.id, profiles.name
  )
  select
    aggregates.user_id,
    aggregates.name,
    aggregates.checkin_count,
    aggregates.smoke_free_days,
    aggregates.reduced_days,
    aggregates.relapse_days,
    coalesce(streaks.current_streak, 0)::bigint as current_streak,
    aggregates.last_checkin,
    (
      coalesce(streaks.current_streak, 0) * 100
      + aggregates.smoke_free_days * 2
    )::numeric as consistency_score
  from aggregates
  join streaks on streaks.user_id = aggregates.user_id
  where
    streaks.last_smoke_free_date = (timezone('Asia/Jakarta', now()))::date
    and coalesce(streaks.current_streak, 0) > 0
  order by streaks.current_streak desc, consistency_score desc, aggregates.checkin_count desc
  limit greatest(1, least(limit_count, 100));
$$;

revoke all on function public.get_leaderboard(integer) from public;
grant execute on function public.get_leaderboard(integer) to authenticated;
