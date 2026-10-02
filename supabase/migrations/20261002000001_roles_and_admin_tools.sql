-- ============================================================================
-- BrachNha — roles, and the admin area's Students and Dashboard pages
-- ============================================================================
--
-- Step A of docs/plans/admin-roles.md. Three things:
--
--   * user_roles replaces app_admins (20261001000003). One row per (student,
--     role). The only role today is 'admin'; a Teacher role later is a wider
--     CHECK and nothing more. NO client policies: nobody can read or write it
--     over the REST API. It is reached only through the functions below.
--
--   * has_role(role) answers for the CALLER only, and is_app_admin() becomes
--     has_role('admin'). Everything already built on is_app_admin() keeps
--     working unchanged: admin_photo_reports(), admin_resolve_photo() and the
--     two admin Storage policies on competition-work.
--
--   * The admin functions behind /admin and /admin/students. Each one is
--     SECURITY DEFINER, refuses a caller who is not an admin (errcode 42501),
--     and is granted to `authenticated` only. The pages in the app are only a
--     screen over these; a student who opens /admin gets nothing back.
--
-- THE ORDER INSIDE THE TRANSACTION IS LOAD-BEARING. is_app_admin() reads
-- app_admins until it is redefined, so: create user_roles, copy the admins
-- across, redefine is_app_admin(), and only then drop app_admins. All of it is
-- one transaction, so there is no moment where the team has no admins, and a
-- failure anywhere leaves the old setup exactly as it was.
--
-- Add an admin by hand in the SQL editor (the first one, or any time):
--
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users where email = 'someone@example.com';
--
-- After that, admins can add and remove each other on /admin/students.
--
-- Re-runnable.
-- ============================================================================

begin;

-- ── Roles ───────────────────────────────────────────────────────────────────

create table if not exists public.user_roles (
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('admin')),
  granted_by uuid references auth.users (id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

alter table public.user_roles enable row level security;

-- Carry the existing team across. Guarded so a second run, after app_admins is
-- gone, does nothing rather than failing.
do $$
begin
  if to_regclass('public.app_admins') is not null then
    insert into public.user_roles (user_id, role, granted_at)
    select a.user_id, 'admin', a.created_at
    from public.app_admins a
    on conflict (user_id, role) do nothing;
  end if;
end;
$$;

-- Whether the CALLER has a role. Takes no user id, so called directly over the
-- REST API it can never tell anyone who else is on the team.
create or replace function public.has_role(p_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role = p_role
  );
$$;

revoke all on function public.has_role(text) from public;
revoke all on function public.has_role(text) from anon;
grant execute on function public.has_role(text) to authenticated;

-- Same name, same signature, new body: every caller keeps working.
create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role('admin');
$$;

revoke all on function public.is_app_admin() from public;
revoke all on function public.is_app_admin() from anon;
grant execute on function public.is_app_admin() to authenticated;

drop table if exists public.app_admins;

-- ── admin_set_role ──────────────────────────────────────────────────────────
--
-- Grant or remove a role. Refuses to remove the LAST admin, so the team cannot
-- lock itself out of the admin area (hint 'last_admin'). The advisory lock
-- serialises role changes, so two admins removing each other at the same moment
-- cannot both pass the check.

create or replace function public.admin_set_role(
  p_user  uuid,
  p_role  text,
  p_grant boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'admin_set_role: not an admin' using errcode = '42501';
  end if;
  if p_role is null or p_role not in ('admin') then
    raise exception 'admin_set_role: unknown role' using errcode = '22023';
  end if;
  if p_user is null then
    raise exception 'admin_set_role: no user' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext('public.user_roles'));

  if p_grant then
    insert into public.user_roles (user_id, role, granted_by)
    values (p_user, p_role, auth.uid())
    on conflict (user_id, role) do nothing;
  else
    if p_role = 'admin'
      and exists (
        select 1 from public.user_roles r
        where r.user_id = p_user and r.role = 'admin'
      )
      and (select count(*) from public.user_roles r where r.role = 'admin') <= 1
    then
      raise exception 'admin_set_role: last admin'
        using errcode = 'P0001', hint = 'last_admin';
    end if;
    delete from public.user_roles r
    where r.user_id = p_user and r.role = p_role;
  end if;
end;
$$;

revoke all on function public.admin_set_role(uuid, text, boolean) from public;
revoke all on function public.admin_set_role(uuid, text, boolean) from anon;
grant execute on function public.admin_set_role(uuid, text, boolean) to authenticated;

-- ── admin_students ──────────────────────────────────────────────────────────
--
-- Real students (never the ~205 anonymous screenshot-harness accounts), newest
-- activity first. Search matches the display name or the email. At most 50
-- rows: this is a lookup screen, not an export.
--
-- "Last seen" is the latest usage event of any kind (20261001000001), so it is
-- null for anyone who has not opened the app since telemetry shipped.

create or replace function public.admin_students(
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
  is_admin       boolean
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

-- ── admin_user_competition_ids ──────────────────────────────────────────────
--
-- Every competition one student is in, for the photo cleanup that has to run
-- BEFORE their account is deleted (src/lib/admin-tools.ts). `created` matters:
-- a creator's competitions disappear with them, taking every joiner's attempt
-- along, so for those the client clears the WHOLE competition folder, not only
-- the student's own, or the joiners' photos would be left pointing at nothing.

create or replace function public.admin_user_competition_ids(p_user uuid)
returns table (competition_id text, created boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'admin_user_competition_ids: not an admin' using errcode = '42501';
  end if;

  return query
  select c.id, true from public.competitions c where c.creator_id = p_user
  union
  select a.competition_id, false
  from public.competition_attempts a
  where a.user_id = p_user
    and not exists (
      select 1 from public.competitions c2
      where c2.id = a.competition_id and c2.creator_id = p_user
    );
end;
$$;

revoke all on function public.admin_user_competition_ids(uuid) from public;
revoke all on function public.admin_user_competition_ids(uuid) from anon;
grant execute on function public.admin_user_competition_ids(uuid) to authenticated;

-- ── admin_delete_user ───────────────────────────────────────────────────────
--
-- Deletes one student's auth user; every table cascades, exactly as
-- delete_my_account() does for the student themselves. Photos are NOT reached
-- by the cascade, so the client clears them first and only then calls this.
--
-- Refuses the caller's own account (hint 'self': use Profile, which also signs
-- out) and another admin's (hint 'admin': remove the role first, which the
-- last-admin rule then guards).

create or replace function public.admin_delete_user(p_user uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'admin_delete_user: not an admin' using errcode = '42501';
  end if;
  if p_user is null then
    raise exception 'admin_delete_user: no user' using errcode = '22023';
  end if;
  if p_user = auth.uid() then
    raise exception 'admin_delete_user: own account'
      using errcode = 'P0001', hint = 'self';
  end if;
  if exists (select 1 from public.user_roles r where r.user_id = p_user) then
    raise exception 'admin_delete_user: has a role'
      using errcode = 'P0001', hint = 'admin';
  end if;

  delete from auth.users u where u.id = p_user;
  return found;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public;
revoke all on function public.admin_delete_user(uuid) from anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;

-- ── admin_dashboard ─────────────────────────────────────────────────────────
--
-- One call for the whole /admin page, as jsonb:
--
--   today, tracked_since  the first day any usage event was recorded. Days
--                         before it read 0 because nothing was counting, not
--                         because nobody came; the page says so.
--   totals                students, active today / 7 days / 30 days, new this
--                         week, KruAI units today, crashes in the last 7 days.
--   daily                 30 days of { day, active, new }. "active" counts
--                         app_open, which log_event accepts once per student
--                         per Phnom Penh day, so it IS daily active students.
--   events                the last 7 days by event name: { name, count,
--                         students }.
--   retention             the last 4 COMPLETE weekly cohorts: of the students
--                         who joined in that week, how many opened the app again
--                         in their second week (days 7 to 13 after joining).
--                         `measurable` is false when that window starts before
--                         tracked_since, so an old cohort is never shown as 0%.
--   crashes               the 20 most frequent error messages of the last 7
--                         days: { message, count, students, last_seen, route,
--                         version }.
--
-- Only real (non-anonymous) accounts count as students.

create or replace function public.admin_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  today   date := (now() at time zone 'Asia/Phnom_Penh')::date;
  since   date;
  result  jsonb;
begin
  if not public.is_app_admin() then
    raise exception 'admin_dashboard: not an admin' using errcode = '42501';
  end if;

  select min(e.event_date) into since from public.app_events e;

  with students as (
    select u.id, (u.created_at at time zone 'Asia/Phnom_Penh')::date as joined
    from auth.users u
    where coalesce(u.is_anonymous, false) = false
  ),
  opens as (
    select e.user_id, e.event_date
    from public.app_events e
    where e.name = 'app_open'
  ),
  days as (
    -- Integer offsets rather than a date series: date + integer is a date, with
    -- no timestamp (and no session time zone) in between.
    select today - 29 + i as day
    from generate_series(0, 29) i
  ),
  cohorts as (
    -- k = 0 is the newest complete cohort: everyone in it has had their whole
    -- second week (days 7 to 13) by today.
    select k, today - 13 - 7 * k - 6 as starts, today - 13 - 7 * k as ends
    from generate_series(0, 3) k
  )
  select jsonb_build_object(
    'today', today,
    'tracked_since', since,
    'totals', jsonb_build_object(
      'students', (select count(*) from students),
      'active_today', (select count(distinct o.user_id) from opens o where o.event_date = today),
      'active_7d', (select count(distinct o.user_id) from opens o where o.event_date > today - 7),
      'active_30d', (select count(distinct o.user_id) from opens o where o.event_date > today - 30),
      'new_7d', (select count(*) from students s where s.joined > today - 7),
      'kruai_today', (select coalesce(sum(q.units), 0) from public.kruai_usage q where q.usage_date = today),
      'crashes_7d', (select count(*) from public.client_errors c where c.created_at > now() - interval '7 days')
    ),
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'day', d.day,
        'active', (select count(distinct o.user_id) from opens o where o.event_date = d.day),
        'new', (select count(*) from students s where s.joined = d.day)
      ) order by d.day), '[]'::jsonb)
      from days d
    ),
    'events', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'name', ev.name, 'count', ev.n, 'students', ev.who
      ) order by ev.n desc), '[]'::jsonb)
      from (
        select e.name, count(*) as n, count(distinct e.user_id) as who
        from public.app_events e
        where e.event_date > today - 7
        group by e.name
      ) ev
    ),
    'retention', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'starts', c.starts,
        'ends', c.ends,
        'joined', (select count(*) from students s where s.joined between c.starts and c.ends),
        'returned', (
          select count(*) from students s
          where s.joined between c.starts and c.ends
            and exists (
              select 1 from opens o
              where o.user_id = s.id
                and o.event_date between s.joined + 7 and s.joined + 13
            )
        ),
        'measurable', since is not null and since <= c.starts + 7
      ) order by c.k), '[]'::jsonb)
      from cohorts c
    ),
    'crashes', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'message', cr.message, 'count', cr.n, 'students', cr.who,
        'last_seen', cr.last_seen, 'route', cr.route, 'version', cr.version
      ) order by cr.n desc, cr.last_seen desc), '[]'::jsonb)
      from (
        select c.message, count(*) as n, count(distinct c.user_id) as who,
               max(c.created_at) as last_seen, max(c.route) as route,
               max(c.app_version) as version
        from public.client_errors c
        where c.created_at > now() - interval '7 days'
        group by c.message
        order by count(*) desc, max(c.created_at) desc
        limit 20
      ) cr
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_dashboard() from public;
revoke all on function public.admin_dashboard() from anon;
grant execute on function public.admin_dashboard() to authenticated;

commit;
