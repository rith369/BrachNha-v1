-- ============================================================================
-- BrachNha — streak protection
-- ============================================================================
--
-- THE USER'S DECISIONS (3 Nov 2026):
--   * a student holds at most 2 protections, from a gift (sometimes) or bought with
--     coins;
--   * one is used by itself on a missed day, and the streak stays the same rather
--     than going up, because nobody studied that day;
--   * a protection keeps a shared streak with a friend alive too.
--
-- SO A RUN IS NO LONGER "CONSECUTIVE GOAL DAYS". A protected day joins two runs but
-- adds nothing to the count. leaderboard() and my_friends() are copied verbatim from
-- 20261103000001 with only that changed.
--
-- my_friends() has to be DROPPED first, because it returns one more column and
-- `create or replace` cannot change what a function returns. It is back, with its
-- grants, before the transaction ends. The app already out there ignores the new
-- column, and the new app treats a missing one as no protected days.
--
-- Both columns are the student's own row, under the existing own-rows policies.
--
-- Re-runnable, in one transaction. Apply BEFORE the app that writes these columns
-- ships: until then its pushes of the profile and of a protected day are refused.
-- ============================================================================

begin;

alter table public.profiles
  add column if not exists streak_protections integer not null default 0
    check (streak_protections >= 0);

alter table public.daily_activity
  add column if not exists streak_protected boolean not null default false;

create or replace function public.leaderboard(p_today date)
returns table (
  id            uuid,
  display_name  text,
  xp_week       integer,
  xp_month      integer,
  xp_all        integer,
  minutes_week  integer,
  minutes_month integer,
  minutes_all   integer,
  streak_now    integer,
  streak_month  integer,
  streak_all    integer
)
language sql
stable
security definer
-- Empty search_path and every name schema-qualified: the standard hardening
-- for a SECURITY DEFINER function, as in 20260828000001.
set search_path = ''
as $$
  with bounds as (
    select least(
      greatest(coalesce(p_today, current_date), current_date - 1),
      current_date + 1
    ) as today
  ),
  students as (
    select p.id, p.display_name, p.xp
    from public.profiles p
    join auth.users u on u.id = p.id
    where coalesce(u.is_anonymous, false) = false
      and btrim(p.display_name) <> ''
      and p.id is distinct from (select auth.uid())
  ),
  activity as (
    select
      a.user_id,
      coalesce(sum(a.xp_earned)     filter (where a.activity_date >= b.today - 6),  0)::integer as xp_week,
      coalesce(sum(a.xp_earned)     filter (where a.activity_date >= b.today - 29), 0)::integer as xp_month,
      coalesce(sum(a.study_minutes) filter (where a.activity_date >= b.today - 6),  0)::integer as minutes_week,
      coalesce(sum(a.study_minutes) filter (where a.activity_date >= b.today - 29), 0)::integer as minutes_month,
      coalesce(sum(a.study_minutes), 0)::integer as minutes_all
    from public.daily_activity a
    cross join bounds b
    where a.activity_date <= b.today
      and a.user_id in (select s.id from students s)
    group by a.user_id
  ),
  -- Gaps and islands: consecutive dates minus their row number share a value,
  -- so grouping on it collapses each unbroken run of kept days into one row. A
  -- protected day holds a run together, but only goal days are counted.
  runs as (
    select
      i.user_id,
      max(i.d) as end_d,
      (count(*) filter (where i.is_goal))::integer as len,
      (count(*) filter (where i.is_goal and i.d >= b.today - 29))::integer as len_month
    from (
      select
        a.user_id,
        a.activity_date as d,
        (a.streak_day or (a.task_lesson and a.task_practice and a.task_flashcards)) as is_goal,
        a.activity_date
          - (row_number() over (partition by a.user_id order by a.activity_date))::integer as grp
      from public.daily_activity a
      cross join bounds b
      where (a.streak_day or a.streak_protected or (a.task_lesson and a.task_practice and a.task_flashcards))
        and a.activity_date <= b.today
        and a.user_id in (select s.id from students s)
    ) i
    cross join bounds b
    group by i.user_id, i.grp
  ),
  streaks as (
    select
      r.user_id,
      -- At most one run can end today or yesterday: two such runs would touch.
      coalesce(max(r.len) filter (where r.end_d >= b.today - 1), 0)::integer as streak_now,
      -- The part of each run that falls inside the 30-day window.
      coalesce(max(r.len_month), 0)::integer as streak_month,
      coalesce(max(r.len), 0)::integer as streak_all
    from runs r
    cross join bounds b
    group by r.user_id
  )
  select
    s.id,
    s.display_name,
    coalesce(act.xp_week, 0),
    coalesce(act.xp_month, 0),
    s.xp,
    coalesce(act.minutes_week, 0),
    coalesce(act.minutes_month, 0),
    coalesce(act.minutes_all, 0),
    coalesce(st.streak_now, 0),
    coalesce(st.streak_month, 0),
    coalesce(st.streak_all, 0)
  from students s
  left join activity act on act.user_id = s.id
  left join streaks st on st.user_id = s.id
  order by s.xp desc, s.display_name
  limit 200;
$$;

drop function if exists public.my_friends(date);

create function public.my_friends(p_today date)
returns table (
  id             uuid,
  other_id       uuid,
  display_name   text,
  status         text,
  outgoing       boolean,
  since          date,
  goal_days      date[],
  protected_days date[]
)
language sql
stable
security definer
set search_path = ''
as $$
  with bounds as (
    select least(
      greatest(coalesce(p_today, current_date), current_date - 1),
      current_date + 1
    ) as today
  ),
  mine as (
    select
      f.id,
      case when f.requester_id = (select auth.uid()) then f.addressee_id else f.requester_id end as other_id,
      f.status,
      f.requester_id = (select auth.uid()) as outgoing,
      case when f.status = 'accepted'
        then (f.accepted_at at time zone 'Asia/Phnom_Penh')::date end as since,
      f.created_at
    from public.friendships f
    where (select auth.uid()) in (f.requester_id, f.addressee_id)
  )
  select
    m.id,
    m.other_id,
    btrim(coalesce(p.display_name, '')),
    m.status,
    m.outgoing,
    m.since,
    case when m.status = 'accepted' then coalesce((
      select array_agg(a.activity_date order by a.activity_date)
      from public.daily_activity a, bounds b
      where a.user_id = m.other_id
        and (a.streak_day or (a.task_lesson and a.task_practice and a.task_flashcards))
        and a.activity_date >= greatest(m.since, b.today - 400)
        and a.activity_date <= b.today
    ), '{}'::date[]) else '{}'::date[] end,
    case when m.status = 'accepted' then coalesce((
      select array_agg(a.activity_date order by a.activity_date)
      from public.daily_activity a, bounds b
      where a.user_id = m.other_id
        and a.streak_protected
        and a.activity_date >= greatest(m.since, b.today - 400)
        and a.activity_date <= b.today
    ), '{}'::date[]) else '{}'::date[] end
  from mine m
  left join public.profiles p on p.id = m.other_id
  order by m.created_at;
$$;

revoke all on function public.my_friends(date) from public, anon;
grant execute on function public.my_friends(date) to authenticated;

commit;
