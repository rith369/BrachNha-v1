-- ============================================================================
-- BrachNha — KruAI limits and pausing, from the admin area (/admin/kruai)
-- ============================================================================
--
-- Step B of docs/plans/admin-roles.md.
--
-- Until now KruAI's two daily limits (30 units a student, 300 for the whole
-- app) were constants inside kruai_take (20260929000001), changed only by
-- editing the SQL, and server/chat-handler.ts kept a COPY of the student limit
-- to show "questions left". This moves both into the database:
--
--   * app_settings: one row, 'kruai_limits' = {"user_daily":30,"app_daily":300}.
--     NO client policies; read by kruai_take, written by
--     admin_set_kruai_limits(), which is OWNER ONLY (it decides how fast the
--     prepaid credit can be spent).
--   * kruai_blocks: students whose KruAI is paused. NO client policies;
--     written by admin_set_kruai_block(), which any admin may call.
--   * kruai_take now reads the limits from app_settings, refuses a paused
--     student (reason 'blocked'), and returns the student limit it used
--     (`user_limit`), so the server's "questions left" can never disagree with
--     the limit that was enforced.
--
-- THE LIMITS ARE STILL NEVER A PARAMETER OF kruai_take. Any student can call it
-- directly with their own token, so a limit passed as an argument would be one
-- they choose. They are read inside the function, from a table no student can
-- write.
--
-- A BAD SETTINGS ROW CANNOT TAKE KRUAI DOWN. kruai_take treats a missing row, a
-- missing key or a non-number as the old defaults (30 / 300) and clamps
-- whatever it reads to the same bounds the setter enforces. A row edited by hand
-- in the SQL editor can therefore make the limits odd, never make every
-- question fail.
--
-- kruai_take's RETURN TYPE CHANGES (one column added at the end), which
-- `create or replace` cannot do, so it is dropped and created again. All of it
-- is one transaction, so no request ever finds the function missing. The
-- server reads `user_limit` and falls back to 30 when it is absent, so the
-- server and this migration can ship in either order.
--
-- admin_students also gains a column (`kruai_blocked`, for the Pause toggle on
-- /admin/students), so it is dropped and re-created the same way, with the body
-- from 20261002000002 unchanged apart from that column.
--
-- Re-runnable.
-- ============================================================================

begin;

-- ── Settings ────────────────────────────────────────────────────────────────

create table if not exists public.app_settings (
  key        text primary key check (char_length(key) <= 60),
  value      jsonb not null,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

insert into public.app_settings (key, value)
values ('kruai_limits', '{"user_daily": 30, "app_daily": 300}'::jsonb)
on conflict (key) do nothing;

-- ── Paused students ─────────────────────────────────────────────────────────

create table if not exists public.kruai_blocks (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  reason     text check (char_length(reason) <= 200),
  blocked_by uuid references auth.users (id) on delete set null,
  blocked_at timestamptz not null default now()
);

alter table public.kruai_blocks enable row level security;

-- ── The limits, read safely ─────────────────────────────────────────────────
--
-- One place that turns the settings row into two usable numbers, used by
-- kruai_take and by the admin overview so the page shows exactly what is
-- enforced. Not granted to anyone: only these security definer functions call
-- it.

create or replace function public.kruai_limits()
returns table (user_daily integer, app_daily integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v jsonb;
  u integer;
  a integer;
begin
  select s.value into v from public.app_settings s where s.key = 'kruai_limits';

  if jsonb_typeof(v -> 'user_daily') = 'number' then
    u := round((v ->> 'user_daily')::numeric)::integer;
  end if;
  if jsonb_typeof(v -> 'app_daily') = 'number' then
    a := round((v ->> 'app_daily')::numeric)::integer;
  end if;

  -- The setter's bounds, applied again here so a hand-edited row cannot set a
  -- limit of 0 (every question refused) or a million.
  return query select
    least(greatest(coalesce(u, 30), 1), 200),
    least(greatest(coalesce(a, 300), 1), 10000);
end;
$$;

revoke all on function public.kruai_limits() from public;
revoke all on function public.kruai_limits() from anon;
revoke all on function public.kruai_limits() from authenticated;

-- ── kruai_take, reading the limits and the pause list ───────────────────────

drop function if exists public.kruai_take(integer);

create function public.kruai_take(p_units integer)
returns table (
  allowed    boolean,
  user_units integer,
  all_units  integer,
  reason     text,
  user_limit integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid        uuid    := auth.uid();
  today      date    := (now() at time zone 'Asia/Phnom_Penh')::date;
  user_daily integer;
  app_daily  integer;
  mine       integer;
  everyone   integer;
begin
  if uid is null then
    raise exception 'kruai_take: not signed in' using errcode = '42501';
  end if;
  if p_units is null or p_units < 1 or p_units > 10 then
    raise exception 'kruai_take: units out of range' using errcode = '22023';
  end if;

  select l.user_daily, l.app_daily into user_daily, app_daily
  from public.kruai_limits() l;

  -- One take at a time. Without it two questions arriving together could both
  -- read "29 of 30" and both be allowed.
  perform pg_advisory_xact_lock(hashtext('public.kruai_take'));

  select u.units into mine
  from public.kruai_usage u
  where u.user_id = uid and u.usage_date = today;
  mine := coalesce(mine, 0);

  select coalesce(sum(u.units), 0)::integer into everyone
  from public.kruai_usage u
  where u.usage_date = today;

  -- Refused calls change NOTHING, so a student hammering at a refusal cannot
  -- eat into the whole app's count.
  if exists (select 1 from public.kruai_blocks b where b.user_id = uid) then
    return query select false, mine, everyone, 'blocked'::text, user_daily;
    return;
  end if;
  if mine + p_units > user_daily then
    return query select false, mine, everyone, 'user'::text, user_daily;
    return;
  end if;
  if everyone + p_units > app_daily then
    return query select false, mine, everyone, 'app'::text, user_daily;
    return;
  end if;

  insert into public.kruai_usage (user_id, usage_date, units)
  values (uid, today, p_units)
  on conflict (user_id, usage_date)
  do update set units = public.kruai_usage.units + excluded.units;

  return query select true, mine + p_units, everyone + p_units, null::text, user_daily;
end;
$$;

revoke all on function public.kruai_take(integer) from public;
revoke all on function public.kruai_take(integer) from anon;
grant execute on function public.kruai_take(integer) to authenticated;

-- ── admin_kruai_overview ────────────────────────────────────────────────────
--
-- One jsonb for the whole /admin/kruai page:
--
--   today, user_daily, app_daily   the limits in force (from kruai_limits())
--   today_units, today_students    units spent today and by how many students
--   daily                          14 days of { day, units, students }
--   top                            the 10 heaviest students today:
--                                  { id, name, email, units, blocked }
--   blocked                        every paused student:
--                                  { id, name, email, reason, blocked_at,
--                                    blocked_by_name }
--
-- Units, not dollars: what a unit costs is only in the server's log lines.

create or replace function public.admin_kruai_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  today      date := (now() at time zone 'Asia/Phnom_Penh')::date;
  user_daily integer;
  app_daily  integer;
  result     jsonb;
begin
  if not public.is_app_admin() then
    raise exception 'admin_kruai_overview: not an admin' using errcode = '42501';
  end if;

  select l.user_daily, l.app_daily into user_daily, app_daily
  from public.kruai_limits() l;

  select jsonb_build_object(
    'today', today,
    'user_daily', user_daily,
    'app_daily', app_daily,
    'today_units', (
      select coalesce(sum(q.units), 0) from public.kruai_usage q where q.usage_date = today
    ),
    'today_students', (
      select count(*) from public.kruai_usage q where q.usage_date = today and q.units > 0
    ),
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'day', d.day,
        'units', coalesce((select sum(q.units) from public.kruai_usage q where q.usage_date = d.day), 0),
        'students', (select count(*) from public.kruai_usage q where q.usage_date = d.day and q.units > 0)
      ) order by d.day), '[]'::jsonb)
      from (select today - 13 + i as day from generate_series(0, 13) i) d
    ),
    'top', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', t.user_id,
        'name', coalesce(p.display_name, ''),
        'email', coalesce(u.email::text, ''),
        'units', t.units,
        'blocked', exists (select 1 from public.kruai_blocks b where b.user_id = t.user_id)
      ) order by t.units desc, u.email), '[]'::jsonb)
      from (
        select q.user_id, q.units from public.kruai_usage q
        where q.usage_date = today and q.units > 0
        order by q.units desc
        limit 10
      ) t
      join auth.users u on u.id = t.user_id
      left join public.profiles p on p.id = t.user_id
    ),
    'blocked', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', b.user_id,
        'name', coalesce(p.display_name, ''),
        'email', coalesce(u.email::text, ''),
        'reason', coalesce(b.reason, ''),
        'blocked_at', b.blocked_at,
        'blocked_by_name', coalesce(bp.display_name, '')
      ) order by b.blocked_at desc), '[]'::jsonb)
      from public.kruai_blocks b
      join auth.users u on u.id = b.user_id
      left join public.profiles p on p.id = b.user_id
      left join public.profiles bp on bp.id = b.blocked_by
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_kruai_overview() from public;
revoke all on function public.admin_kruai_overview() from anon;
grant execute on function public.admin_kruai_overview() to authenticated;

-- ── admin_set_kruai_limits (owner only) ─────────────────────────────────────

create or replace function public.admin_set_kruai_limits(
  p_user_daily integer,
  p_app_daily  integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'admin_set_kruai_limits: not an admin' using errcode = '42501';
  end if;
  if not public.has_role('owner') then
    raise exception 'admin_set_kruai_limits: owner only'
      using errcode = '42501', hint = 'owner_only';
  end if;
  if p_user_daily is null or p_user_daily < 1 or p_user_daily > 200
     or p_app_daily is null or p_app_daily < 1 or p_app_daily > 10000 then
    raise exception 'admin_set_kruai_limits: out of range'
      using errcode = '22023', hint = 'range';
  end if;

  insert into public.app_settings (key, value, updated_by, updated_at)
  values (
    'kruai_limits',
    jsonb_build_object('user_daily', p_user_daily, 'app_daily', p_app_daily),
    auth.uid(),
    now()
  )
  on conflict (key) do update
  set value = excluded.value,
      updated_by = excluded.updated_by,
      updated_at = excluded.updated_at;
end;
$$;

revoke all on function public.admin_set_kruai_limits(integer, integer) from public;
revoke all on function public.admin_set_kruai_limits(integer, integer) from anon;
grant execute on function public.admin_set_kruai_limits(integer, integer) to authenticated;

-- ── admin_set_kruai_block (any admin) ───────────────────────────────────────
--
-- Pause or resume KruAI for one student. Pausing refuses the caller's own
-- account (hint 'self') and anyone holding a role (hint 'owner' or 'admin'):
-- admins cannot silence each other or the owner. Resuming is always allowed,
-- so a pause left on someone who later became an admin can still be lifted.

create or replace function public.admin_set_kruai_block(
  p_user    uuid,
  p_blocked boolean,
  p_reason  text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'admin_set_kruai_block: not an admin' using errcode = '42501';
  end if;
  if p_user is null then
    raise exception 'admin_set_kruai_block: no user' using errcode = '22023';
  end if;

  if p_blocked then
    if p_user = auth.uid() then
      raise exception 'admin_set_kruai_block: own account'
        using errcode = 'P0001', hint = 'self';
    end if;
    if exists (
      select 1 from public.user_roles r where r.user_id = p_user and r.role = 'owner'
    ) then
      raise exception 'admin_set_kruai_block: the owner'
        using errcode = 'P0001', hint = 'owner';
    end if;
    if exists (
      select 1 from public.user_roles r where r.user_id = p_user and r.role = 'admin'
    ) then
      raise exception 'admin_set_kruai_block: an admin'
        using errcode = 'P0001', hint = 'admin';
    end if;

    insert into public.kruai_blocks (user_id, reason, blocked_by, blocked_at)
    values (
      p_user,
      nullif(left(btrim(coalesce(p_reason, '')), 200), ''),
      auth.uid(),
      now()
    )
    on conflict (user_id) do update
    set reason = excluded.reason,
        blocked_by = excluded.blocked_by,
        blocked_at = excluded.blocked_at;
  else
    delete from public.kruai_blocks b where b.user_id = p_user;
  end if;
end;
$$;

revoke all on function public.admin_set_kruai_block(uuid, boolean, text) from public;
revoke all on function public.admin_set_kruai_block(uuid, boolean, text) from anon;
grant execute on function public.admin_set_kruai_block(uuid, boolean, text) to authenticated;

-- ── admin_students, now saying whose KruAI is paused ────────────────────────

drop function if exists public.admin_students(text, integer);

create function public.admin_students(
  p_search text default '',
  p_limit  integer default 50
)
returns table (
  id             uuid,
  display_name   text,
  email          text,
  joined_at      timestamptz,
  last_seen      timestamptz,
  xp             integer,
  level          integer,
  streak         integer,
  active_days_30 integer,
  kruai_today    integer,
  kruai_7d       integer,
  is_admin       boolean,
  is_owner       boolean,
  kruai_blocked  boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  today   date := (now() at time zone 'Asia/Phnom_Penh')::date;
  needle  text := nullif(btrim(coalesce(p_search, '')), '');
  pattern text;
  lim     integer := least(greatest(coalesce(p_limit, 50), 1), 50);
begin
  if not public.is_app_admin() then
    raise exception 'admin_students: not an admin' using errcode = '42501';
  end if;

  if needle is not null then
    -- A typed % or _ is a character, not a wildcard.
    pattern := '%' || replace(replace(replace(left(needle, 80),
      '\', '\\'), '%', '\%'), '_', '\_') || '%';
  end if;

  return query
  select
    u.id,
    coalesce(p.display_name, ''),
    coalesce(u.email::text, ''),
    u.created_at,
    seen.last_seen,
    coalesce(p.xp, 0),
    coalesce(p.level, 1),
    coalesce(p.streak, 0),
    coalesce(act.days, 0)::integer,
    coalesce(k.today_units, 0)::integer,
    coalesce(k.week_units, 0)::integer,
    exists (
      select 1 from public.user_roles r
      where r.user_id = u.id and r.role = 'admin'
    ),
    exists (
      select 1 from public.user_roles r
      where r.user_id = u.id and r.role = 'owner'
    ),
    exists (
      select 1 from public.kruai_blocks b where b.user_id = u.id
    )
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join lateral (
    select max(e.created_at) as last_seen
    from public.app_events e where e.user_id = u.id
  ) seen on true
  left join lateral (
    select count(distinct e.event_date) as days
    from public.app_events e
    where e.user_id = u.id and e.name = 'app_open'
      and e.event_date > today - 30
  ) act on true
  left join lateral (
    select
      sum(q.units) filter (where q.usage_date = today) as today_units,
      sum(q.units) filter (where q.usage_date > today - 7) as week_units
    from public.kruai_usage q
    where q.user_id = u.id and q.usage_date > today - 7
  ) k on true
  where coalesce(u.is_anonymous, false) = false
    and (
      pattern is null
      or p.display_name ilike pattern
      or u.email::text ilike pattern
    )
  order by seen.last_seen desc nulls last, u.created_at desc
  limit lim;
end;
$$;

revoke all on function public.admin_students(text, integer) from public;
revoke all on function public.admin_students(text, integer) from anon;
grant execute on function public.admin_students(text, integer) to authenticated;

commit;
