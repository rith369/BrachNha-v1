-- ============================================================================
-- BrachNha — the leaderboard's cross-student read
-- ============================================================================
--
-- The leaderboard shows real students beside the app's fixed sample cohort
-- (each sample row carries a visible "Sample" mark). The sample rows live in
-- src/features/leaderboard/demo-data.ts; this function supplies the real ones.
--
-- WHY A FUNCTION AND NOT A POLICY. Every table here is own-rows-only, and
-- 20260828000002 explicitly refuses "profiles are readable by everyone": that
-- row holds email, age and location. A SECURITY DEFINER function can read past
-- RLS and hand back ONLY a display name and a few numbers, which is the whole
-- of what a ranking needs. Same shape as my_competition_work_count in
-- 20260916000003, and it queries no table from inside that table's own policy,
-- so the recursion trap recorded there cannot happen here.
--
-- WHO IS LISTED:
--   * non-anonymous accounts only — that is every Google sign-in, and it hides
--     the ~205 anonymous rows the screenshot harness once created, without
--     deleting anything;
--   * with a display name — an account that never finished the profile form
--     has nothing to show;
--   * NOT the caller. The viewer's own row is built on their device from the
--     live store, which is always fresher than the copy that trails it here.
--
-- WHAT IT COUNTS, per window (week = last 7 days, month = last 30, inclusive of
-- today):
--   * XP     — sum of daily_activity.xp_earned; all-time is profiles.xp, which
--              includes XP earned before the daily log existed.
--   * minutes — sum of daily_activity.study_minutes (ACTIVE minutes; see
--              hooks/use-study-timer.ts).
--   * streak — DERIVED from the three goal flags, never read from
--              profiles.streak. That column is only recomputed on the student's
--              own device when the day rolls over, so a student who stops opening
--              the app would keep their last streak on the board forever.
--              streak_now follows utils/streak.ts's currentStreak(): the run of
--              goal days ending today, or ending yesterday while today is open.
--
-- p_today is the CLIENT's local date, because day keys are local dates (see
-- utils/day.ts) and the server's current_date is UTC. It is clamped to within a
-- day of the server's date so a caller cannot slide the windows anywhere else.
--
-- KNOWN AND ACCEPTED: every number here was written by the student's own device.
-- This is not cheat-proof, and was built knowing that.
--
-- Re-runnable.
-- ============================================================================

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
      where a.task_lesson and a.task_practice and a.task_flashcards
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

-- Signed-in students only. A guest has no account and is not shown other
-- students' names; they see the sample cohort and their own row.
revoke all on function public.leaderboard(date) from public;
revoke all on function public.leaderboard(date) from anon;
grant execute on function public.leaderboard(date) to authenticated;
