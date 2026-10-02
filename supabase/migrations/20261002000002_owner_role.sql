-- ============================================================================
-- BrachNha — the OWNER role
-- ============================================================================
--
-- 20261002000001 made every admin equal, which left two holes, both found by
-- testing on the real project:
--
--   * Any admin could remove any other admin and then delete their account, so
--     a second admin could take the app over from the first.
--   * "Delete my account" on Profile never looked at roles. The only admin
--     deleted themselves there, the role went with the account (cascade), and
--     the team was left with NO admin at all, fixable only in the SQL editor.
--
-- The fix is one role above admin:
--
--   * OWNER has every admin power (is_app_admin() is true for an owner) and is
--     the ONLY one who can make or remove admins (admin_set_role).
--   * The owner role itself is never granted or removed from the app. Only the
--     SQL editor can set it:
--
--       insert into public.user_roles (user_id, role)
--       select id, 'owner' from auth.users where email = 'someone@example.com';
--
--   * An owner's account cannot be deleted from the app at all: not by an
--     admin (admin_delete_user) and not by the owner on Profile
--     (delete_my_account). Remove the owner row in the SQL editor first.
--
-- An ordinary admin can still delete their OWN account on Profile; with an
-- owner always there, the team can no longer end up with nobody in charge.
--
-- The old "never remove the last admin" rule is gone: only the owner manages
-- admins, and the owner is an admin by definition, so there is always one.
--
-- Re-runnable. Apply in one go (one transaction).
-- ============================================================================

begin;

-- ── The role list ───────────────────────────────────────────────────────────

-- Drop EVERY check constraint on the table rather than one by name: if the
-- old one were named differently, a drop-by-name would miss it silently and
-- the old "admin only" check would go on refusing 'owner'. The role check is
-- the table's only check constraint.
do $$
declare
  c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.user_roles'::regclass and contype = 'c'
  loop
    execute format('alter table public.user_roles drop constraint %I', c.conname);
  end loop;
end;
$$;

alter table public.user_roles
  add constraint user_roles_role_check check (role in ('admin', 'owner'));

-- An owner is an admin everywhere is_app_admin() is asked: every admin_*
-- function, the photo-report review and both admin Storage policies.
create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role in ('admin', 'owner')
  );
$$;

revoke all on function public.is_app_admin() from public;
revoke all on function public.is_app_admin() from anon;
grant execute on function public.is_app_admin() to authenticated;

-- ── Only the owner manages admins ───────────────────────────────────────────
--
-- p_role may only be 'admin': the owner role is set in the SQL editor and
-- nowhere else (hint 'owner_only' for a caller who is not the owner).

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
  if not public.has_role('owner') then
    raise exception 'admin_set_role: owner only'
      using errcode = '42501', hint = 'owner_only';
  end if;
  if p_role is null or p_role <> 'admin' then
    raise exception 'admin_set_role: only the admin role is managed here'
      using errcode = '22023';
  end if;
  if p_user is null then
    raise exception 'admin_set_role: no user' using errcode = '22023';
  end if;

  if p_grant then
    insert into public.user_roles (user_id, role, granted_by)
    values (p_user, 'admin', auth.uid())
    on conflict (user_id, role) do nothing;
  else
    delete from public.user_roles r
    where r.user_id = p_user and r.role = 'admin';
  end if;
end;
$$;

revoke all on function public.admin_set_role(uuid, text, boolean) from public;
revoke all on function public.admin_set_role(uuid, text, boolean) from anon;
grant execute on function public.admin_set_role(uuid, text, boolean) to authenticated;

-- ── An owner cannot be deleted from the app ─────────────────────────────────

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
  if exists (
    select 1 from public.user_roles r where r.user_id = p_user and r.role = 'owner'
  ) then
    raise exception 'admin_delete_user: the owner'
      using errcode = 'P0001', hint = 'owner';
  end if;
  if exists (
    select 1 from public.user_roles r where r.user_id = p_user and r.role = 'admin'
  ) then
    raise exception 'admin_delete_user: an admin'
      using errcode = 'P0001', hint = 'admin';
  end if;

  delete from auth.users u where u.id = p_user;
  return found;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public;
revoke all on function public.admin_delete_user(uuid) from anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;

-- The admin delete (src/lib/admin-tools.ts) calls this FIRST and clears the
-- student's photos before admin_delete_user() runs. So it refuses the same
-- accounts, with the same hints: a refusal then comes before any photo is
-- touched, rather than after the photos are already gone.
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
  if p_user = auth.uid() then
    raise exception 'admin_user_competition_ids: own account'
      using errcode = 'P0001', hint = 'self';
  end if;
  if exists (
    select 1 from public.user_roles r where r.user_id = p_user and r.role = 'owner'
  ) then
    raise exception 'admin_user_competition_ids: the owner'
      using errcode = 'P0001', hint = 'owner';
  end if;
  if exists (
    select 1 from public.user_roles r where r.user_id = p_user and r.role = 'admin'
  ) then
    raise exception 'admin_user_competition_ids: an admin'
      using errcode = 'P0001', hint = 'admin';
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

-- The same rule on Profile. This is the one that went wrong: the client also
-- checks first (so no photo is removed before a refusal), but this is the gate.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'delete_my_account: not signed in' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.user_roles r where r.user_id = uid and r.role = 'owner'
  ) then
    raise exception 'delete_my_account: the owner'
      using errcode = 'P0001', hint = 'owner';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public;
revoke all on function public.delete_my_account() from anon;
grant execute on function public.delete_my_account() to authenticated;

-- ── admin_students says who the owner is ────────────────────────────────────
--
-- A new output column changes the function's type, which create or replace
-- cannot do, so it is dropped and created again inside this transaction.

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
  is_owner       boolean
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
