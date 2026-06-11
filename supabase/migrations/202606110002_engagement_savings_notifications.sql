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

alter table journals enable row level security;
alter table rewards enable row level security;
alter table donation_allocations enable row level security;
alter table user_badges enable row level security;
alter table notification_settings enable row level security;

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
