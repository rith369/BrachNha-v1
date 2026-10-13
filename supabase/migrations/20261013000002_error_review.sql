-- ============================================================================
-- BrachNha — the team's error review (/admin/errors)
-- ============================================================================
--
-- client_errors (20261001000001) has been filling since 1 Oct 2026, and the
-- /admin dashboard shows its 20 most frequent messages of the last 7 days. What
-- nobody could do was say "this one is FIXED" and have it leave the list, or
-- notice a new error without opening the dashboard. This adds both.
--
-- AN ERROR IS GROUPED BY ITS MESSAGE, exactly as the dashboard groups it, so
-- the two screens agree on what "one error" is.
--
-- "FIXED" IS A TIMESTAMP, NOT A FLAG. client_error_fixes holds, per message,
-- when it was marked fixed. An error is OPEN when it happened after that
-- moment (or was never marked). So a fix that did not work, or a bug that
-- comes back, reopens itself with no one having to remember to look. Marking
-- it again moves the timestamp forward.
--
-- NOTHING NAMES A STUDENT. The page shows how many students and guests hit an
-- error, never who: the developer needs the count to judge how bad it is, not
-- the person. The browser string and the route of the latest occurrence ARE
-- shown, because they are what makes a bug reproducible.
--
-- Admin only, like every admin_* function: is_app_admin() (20261002000001,
-- which is true for the owner too), raising 42501 for anyone else.
--
-- Apply AFTER 20261001000001 and 20261002000001. Re-runnable.
-- ============================================================================

create table if not exists public.client_error_fixes (
  message  text primary key check (char_length(message) <= 500),
  fixed_at timestamptz not null default now(),
  fixed_by uuid references auth.users (id) on delete set null
);

-- No client policies: written by admin_fix_client_error(), read inside the
-- two admin functions below.
alter table public.client_error_fixes enable row level security;

-- The latest occurrence of one message, looked up per group below.
create index if not exists client_errors_message_idx
  on public.client_errors (message, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- admin_client_errors(): the whole page in one call
-- ─────────────────────────────────────────────────────────────────────────────
--
-- {
--   today:  'YYYY-MM-DD' (Phnom Penh),
--   daily:  [{ day, count, students }]  the last 14 days, zeros included,
--   groups: [{ message, count, count_7d, students, guests, first_seen,
--              last_seen, fixed_at, since_fix, open, route, version, stack,
--              user_agent, routes }]
-- }
--
-- groups covers the last 30 days, at most 100 messages, open ones first and
-- then the most frequent. `since_fix` counts occurrences after fixed_at (null
-- when never marked). `routes` is up to 5 pages it happened on, most frequent
-- first. route / version / stack / user_agent are the LATEST occurrence's.

create or replace function public.admin_client_errors()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  today  date := (now() at time zone 'Asia/Phnom_Penh')::date;
  result jsonb;
begin
  if not public.is_app_admin() then
    raise exception 'admin_client_errors: not an admin' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'today', today,
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'day', d.day,
        'count', (
          select count(*) from public.client_errors e
          where (e.created_at at time zone 'Asia/Phnom_Penh')::date = d.day
        ),
        'students', (
          select count(distinct e.user_id) from public.client_errors e
          where (e.created_at at time zone 'Asia/Phnom_Penh')::date = d.day
        )
      ) order by d.day), '[]'::jsonb)
      from (
        select generate_series(today - 13, today, interval '1 day')::date as day
      ) d
    ),
    'groups', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'message', g.message,
        'count', g.n,
        'count_7d', g.n7,
        'students', g.who,
        'guests', g.guests,
        'first_seen', g.first_seen,
        'last_seen', g.last_seen,
        'fixed_at', g.fixed_at,
        'since_fix', g.since_fix,
        'open', g.is_open,
        'route', latest.route,
        'version', latest.app_version,
        'stack', latest.stack,
        'user_agent', latest.user_agent,
        'routes', (
          select coalesce(jsonb_agg(r.route order by r.n desc, r.route), '[]'::jsonb)
          from (
            select e.route, count(*) as n
            from public.client_errors e
            where e.message = g.message
              and e.created_at > now() - interval '30 days'
              and e.route is not null
            group by e.route
            order by count(*) desc, e.route
            limit 5
          ) r
        )
      ) order by g.is_open desc, g.n desc, g.last_seen desc), '[]'::jsonb)
      from (
        select
          e.message,
          count(*) as n,
          count(*) filter (where e.created_at > now() - interval '7 days') as n7,
          count(distinct e.user_id) as who,
          count(*) filter (where e.user_id is null) as guests,
          min(e.created_at) as first_seen,
          max(e.created_at) as last_seen,
          f.fixed_at,
          case when f.fixed_at is null then null
               else count(*) filter (where e.created_at > f.fixed_at) end as since_fix,
          max(e.created_at) > coalesce(f.fixed_at, '-infinity'::timestamptz) as is_open
        from public.client_errors e
        left join public.client_error_fixes f on f.message = e.message
        where e.created_at > now() - interval '30 days'
        group by e.message, f.fixed_at
        order by
          max(e.created_at) > coalesce(f.fixed_at, '-infinity'::timestamptz) desc,
          count(*) desc,
          max(e.created_at) desc
        limit 100
      ) g
      cross join lateral (
        select e.route, e.app_version, e.stack, e.user_agent
        from public.client_errors e
        where e.message = g.message
        order by e.created_at desc
        limit 1
      ) latest
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_client_errors() from public;
revoke all on function public.admin_client_errors() from anon;
grant execute on function public.admin_client_errors() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- admin_fix_client_error(message): mark one error fixed, as of now
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.admin_fix_client_error(p_message text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'admin_fix_client_error: not an admin' using errcode = '42501';
  end if;
  if p_message is null or char_length(p_message) = 0 or char_length(p_message) > 500 then
    raise exception 'admin_fix_client_error: bad message' using errcode = '22023';
  end if;

  insert into public.client_error_fixes (message, fixed_at, fixed_by)
  values (p_message, now(), auth.uid())
  on conflict (message) do update
    set fixed_at = now(),
        fixed_by = auth.uid();
end;
$$;

revoke all on function public.admin_fix_client_error(text) from public;
revoke all on function public.admin_fix_client_error(text) from anon;
grant execute on function public.admin_fix_client_error(text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- admin_open_client_errors(): the menu badge's number
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Open messages of the last 30 days: the same rule and window as `open` in
-- admin_client_errors(), so the badge and the page cannot disagree. Cheap: no
-- details, no lateral lookups.

create or replace function public.admin_open_client_errors()
returns integer
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  if not public.is_app_admin() then
    raise exception 'admin_open_client_errors: not an admin' using errcode = '42501';
  end if;

  select count(*) into n
  from (
    select e.message
    from public.client_errors e
    left join public.client_error_fixes f on f.message = e.message
    where e.created_at > now() - interval '30 days'
    group by e.message, f.fixed_at
    having max(e.created_at) > coalesce(f.fixed_at, '-infinity'::timestamptz)
  ) open_errors;

  return n;
end;
$$;

revoke all on function public.admin_open_client_errors() from public;
revoke all on function public.admin_open_client_errors() from anon;
grant execute on function public.admin_open_client_errors() to authenticated;
