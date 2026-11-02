-- ============================================================================
-- BrachNha — daily targets, the new streak rule and the daily gift
-- ============================================================================
--
-- THE USER'S DECISIONS (3 Nov 2026):
--   * each mission has a daily target from the target grade and months left;
--   * a day counts for the streak once the student finishes ANY 1 mission (the
--     day's lessons, the day's quizzes, a flashcard review or the daily challenge);
--   * reaching ALL FOUR opens a gift.
--
-- SO A STREAK DAY NO LONGER MEANS "ALL THREE TASK FLAGS". A day with only the quiz
-- mission has task_lesson false and still counts. `streak_day` says so directly.
--
-- OLD DAYS KEEP COUNTING. The rule reads `streak_day or (all three flags)`, so a
-- day that met the old goal still counts with no backfill, and a day that did not
-- stays as it was. Nobody's history changes.
--
-- leaderboard() and my_friends() are copied verbatim from the migrations that last
-- defined them, with only that one condition changed, so a read of them and a read
-- of the student's own calendar follow the same rule.
--
-- The counts are for a phone restored on the same day: the store is the live copy.
-- All of it is the student's own row, under the existing own-rows policies.
--
-- Re-runnable, in one transaction. Apply BEFORE the app that writes these columns
-- ships: until then its push of today's row is refused.
-- ============================================================================

begin;

alter table public.daily_activity
  add column if not exists streak_day   boolean not null default false,
  add column if not exists lessons_done integer not null default 0 check (lessons_done >= 0),
  add column if not exists quizzes_done integer not null default 0 check (quizzes_done >= 0),
  add column if not exists reviews_done integer not null default 0 check (reviews_done >= 0),
  add column if not exists gift_opened  boolean not null default false;

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
  -- so grouping on it collapses each unbroken run of goal days into one row.
  runs as (
    select
      i.user_id,
      min(i.d) as start_d,
      max(i.d) as end_d,
      count(*)::integer as len
    from (
      select
        a.user_id,
        a.activity_date as d,
        a.activity_date
          - (row_number() over (partition by a.user_id order by a.activity_date))::integer as grp
      from public.daily_activity a
      cross join bounds b
      where (a.streak_day or (a.task_lesson and a.task_practice and a.task_flashcards))
        and a.activity_date <= b.today
        and a.user_id in (select s.id from students s)
    ) i
    group by i.user_id, i.grp
  ),
  streaks as (
    select
      r.user_id,
      -- At most one run can end today or yesterday: two such runs would touch.
      coalesce(max(r.len) filter (where r.end_d >= b.today - 1), 0)::integer as streak_now,
      -- The part of each run that falls inside the 30-day window.
      coalesce(max(greatest(0, r.end_d - greatest(r.start_d, b.today - 29) + 1)), 0)::integer as streak_month,
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

create or replace function public.my_friends(p_today date)
returns table (
  id            uuid,
  other_id      uuid,
  display_name  text,
  status        text,
  outgoing      boolean,
  since         date,
  goal_days     date[]
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
    ), '{}'::date[]) else '{}'::date[] end
  from mine m
  left join public.profiles p on p.id = m.other_id
  order by m.created_at;
$$;

commit;
