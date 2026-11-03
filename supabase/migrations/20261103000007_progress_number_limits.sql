-- ============================================================================
-- BrachNha: progress numbers that cannot be real are held down
-- ============================================================================
--
-- THE HOLE. The phone works out XP, coins, streak and study minutes and sends the
-- result, and the database only checked that a number was not negative. Anyone calling
-- the database directly could write a million XP or mark months of past days as studied,
-- and go straight to the top of the leaderboard.
--
-- THIS LIMITS CHEATING, IT DOES NOT END IT. A number the database cannot see earned can
-- only be held to what is possible. Someone could still claim up to the daily limit.
-- Checking each reward on the server would mean moving every award off the phone.
--
-- TOO-HIGH NUMBERS ARE CUT, NOT REFUSED, for the reason in 20261103000006: sync failures
-- are silent, so a refused profile save would stop a real student's progress saving with
-- nothing on screen. The phone keeps its own number either way: localStorage is the live
-- copy, so a student never sees their own progress go down on the phone they study on.
--
-- THE LIMITS, and why they are safe for a real student:
--
--   5000 XP a day. The most any one thing pays is 20 XP for a right answer on a past
--   paper, and the largest paper has about 45 questions, so about 900 XP. A Simulation
--   Day 1 at full marks is about 3600. 5000 is also 500 right quiz answers, or 1250
--   flashcards. Scored from utils/rewards.ts and content/fixture.json.
--
--   960 study minutes a day, which is 16 hours.
--
--   Total XP and coins: 5000 for each day since the account was made, plus two days. The
--   two days are for a student who studied as a guest and signed in later: their XP comes
--   up all at once, and any cut part is restored as the days pass, because every push
--   resends the full total.
--
--   Streak: days since the account was made, plus the 14-day window below.
--
--   2 streak protections, MAX_STREAK_PROTECTIONS in utils/rewards.ts.
--
-- OLD DAYS CANNOT BE WRITTEN. The app only ever sends the last 14 days
-- (ACTIVITY_PUSH_DAYS in lib/supabase-sync.ts), so a row further back, or more than a day
-- ahead, is forged or a broken clock. It is skipped silently and the rest of the batch
-- goes in. 15 rather than 14 so a phone's clock a little off still gets through.
--
-- KEEP THESE IN STEP. Raising a reward in utils/rewards.ts, or adding a larger paper,
-- may mean raising 5000 here.
--
-- ORDER DOES NOT MATTER. There is no app change.
--
-- Re-runnable.
-- ============================================================================

begin;

-- ── What is already there ───────────────────────────────────────────────────
-- Before the triggers, because the daily trigger would skip these old rows.

update public.daily_activity set xp_earned = 5000 where xp_earned > 5000;
update public.daily_activity set study_minutes = 960 where study_minutes > 960;

-- ── Profiles ────────────────────────────────────────────────────────────────

-- security definer to read auth.users. profiles.created_at would be easier, but a
-- student can write that column on their own row.
create or replace function public.limit_profile_numbers()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  today date := (now() at time zone 'Asia/Phnom_Penh')::date;
  born  date;
  age   integer;
begin
  select (u.created_at at time zone 'Asia/Phnom_Penh')::date into born
  from auth.users u
  where u.id = new.id;

  age := greatest(today - coalesce(born, today), 0);

  new.xp := least(new.xp, 5000 * (age + 2));
  new.coins := least(new.coins, 5000 * (age + 2));
  new.streak := least(new.streak, age + 15);
  new.streak_protections := least(new.streak_protections, 2);
  return new;
end;
$$;

-- ── Days ────────────────────────────────────────────────────────────────────

create or replace function public.limit_daily_activity_numbers()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  today date := (now() at time zone 'Asia/Phnom_Penh')::date;
begin
  if new.activity_date not between today - 15 and today + 1 then
    return null;
  end if;
  if tg_op = 'UPDATE' and old.activity_date < today - 15 then
    return null;
  end if;

  new.xp_earned := least(new.xp_earned, 5000);
  new.study_minutes := least(new.study_minutes, 960);
  return new;
end;
$$;

-- Fired by the table, never called.
revoke all on function public.limit_profile_numbers() from public, anon, authenticated;
revoke all on function public.limit_daily_activity_numbers() from public, anon, authenticated;

drop trigger if exists profiles_limit_numbers on public.profiles;
create trigger profiles_limit_numbers
  before insert or update on public.profiles
  for each row execute function public.limit_profile_numbers();

drop trigger if exists daily_activity_limit_numbers on public.daily_activity;
create trigger daily_activity_limit_numbers
  before insert or update on public.daily_activity
  for each row execute function public.limit_daily_activity_numbers();

-- ── Totals already too high ─────────────────────────────────────────────────
-- Other students read these. This only touches a row over its limit; the trigger cuts it.

update public.profiles p
set xp = p.xp
from auth.users u
where u.id = p.id
  and (
    p.xp > 5000 * (greatest((now() at time zone 'Asia/Phnom_Penh')::date
                            - (u.created_at at time zone 'Asia/Phnom_Penh')::date, 0) + 2)
    or p.coins > 5000 * (greatest((now() at time zone 'Asia/Phnom_Penh')::date
                                  - (u.created_at at time zone 'Asia/Phnom_Penh')::date, 0) + 2)
    or p.streak_protections > 2
  );

commit;

-- What the SQL editor shows afterwards: true, if both triggers are in place.
select
  (select count(*) from pg_catalog.pg_trigger where tgname in (
     'profiles_limit_numbers', 'daily_activity_limit_numbers'
   )) = 2
  as limits_in_place;
