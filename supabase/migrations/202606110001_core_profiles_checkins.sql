create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  age integer check (age is null or age >= 18),
  cigarette_brand text,
  cigarette_brands text[] not null default '{}',
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
alter table profiles add column if not exists cigarette_brands text[] not null default '{}';
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

alter table profiles enable row level security;
alter table daily_checkins enable row level security;
alter table craving_logs enable row level security;

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
