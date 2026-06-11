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
