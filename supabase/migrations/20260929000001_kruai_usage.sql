-- KruAI daily limits: how many questions each student, and the whole app, may
-- ask per day once the model is PAID (a prepaid Google credit).
--
-- WHY IN THE DATABASE. server/rate-limit.ts counts in memory, per serverless
-- instance, and Vercel runs several and restarts them freely — its own header
-- says a daily counter held that way "would reset on every cold start and mean
-- almost nothing". A money limit has to be ONE count shared by every instance,
-- and this project already has the one shared store the endpoint can reach.
--
-- UNITS, not questions: server/chat-handler.ts charges 1 for a text question
-- and 3 for one carrying a photo, which costs the model several times more. A
-- curated answer (server/chat-cache.ts) costs nothing and is not charged.
--
-- THE LIMITS ARE CONSTANTS IN THE FUNCTION, deliberately not parameters. The
-- server calls kruai_take with the STUDENT'S OWN token, so any student can also
-- call it directly over the REST API — a limit passed as an argument would be a
-- limit they choose. To change them, re-run the `create or replace function`
-- below with new numbers (SQL editor, like every migration here).
--
-- Why a student calling it directly is harmless: it only ever increments the
-- CALLER's row, only by 1–10, and only while under both limits. So the most
-- they can do is spend their own 30 without asking anything — they cannot
-- refund themselves (no negative units) and cannot push the whole-app count
-- past what their own limit already allows.

create table if not exists public.kruai_usage (
  user_id    uuid    not null references auth.users (id) on delete cascade,
  -- The day in Phnom Penh, computed by the function below — never sent by the
  -- client, so a student cannot move their usage to another day.
  usage_date date    not null,
  units      integer not null default 0 check (units >= 0),
  primary key (user_id, usage_date)
);

-- The whole-app sum reads every row for one day.
create index if not exists kruai_usage_date_idx
  on public.kruai_usage (usage_date);

alter table public.kruai_usage enable row level security;

-- Read your own usage (so the app could one day show "N left today"). NO insert
-- or update policy: the only writer is kruai_take, which runs as its owner.
drop policy if exists "kruai_usage: read own" on public.kruai_usage;
create policy "kruai_usage: read own"
  on public.kruai_usage for select
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.kruai_take(p_units integer)
returns table (allowed boolean, user_units integer, all_units integer, reason text)
language plpgsql
security definer
-- Empty search_path and every name schema-qualified: the standard hardening for
-- a security definer function, same as leaderboard() and
-- my_competition_work_count().
set search_path = ''
as $$
declare
  -- The two numbers to change. See the header.
  user_daily constant integer := 30;
  app_daily  constant integer := 300;

  uid      uuid    := auth.uid();
  today    date    := (now() at time zone 'Asia/Phnom_Penh')::date;
  mine     integer;
  everyone integer;
begin
  if uid is null then
    raise exception 'kruai_take: not signed in' using errcode = '42501';
  end if;
  if p_units is null or p_units < 1 or p_units > 10 then
    raise exception 'kruai_take: units out of range' using errcode = '22023';
  end if;

  -- One take at a time. Without it two questions arriving together could both
  -- read "29 of 30" and both be allowed. Held only for this transaction, which
  -- is a couple of index lookups long.
  perform pg_advisory_xact_lock(hashtext('public.kruai_take'));

  select u.units into mine
  from public.kruai_usage u
  where u.user_id = uid and u.usage_date = today;
  mine := coalesce(mine, 0);

  select coalesce(sum(u.units), 0)::integer into everyone
  from public.kruai_usage u
  where u.usage_date = today;

  -- Refused calls change NOTHING, so a student hammering at their limit cannot
  -- eat into the whole app's count.
  if mine + p_units > user_daily then
    return query select false, mine, everyone, 'user'::text;
    return;
  end if;
  if everyone + p_units > app_daily then
    return query select false, mine, everyone, 'app'::text;
    return;
  end if;

  insert into public.kruai_usage (user_id, usage_date, units)
  values (uid, today, p_units)
  on conflict (user_id, usage_date)
  do update set units = public.kruai_usage.units + excluded.units;

  return query select true, mine + p_units, everyone + p_units, null::text;
end;
$$;

revoke all on function public.kruai_take(integer) from public;
revoke all on function public.kruai_take(integer) from anon;
grant execute on function public.kruai_take(integer) to authenticated;
