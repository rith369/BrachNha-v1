-- ============================================================================
-- BrachNha — the team's photo-report review page (/admin/reports)
-- ============================================================================
--
-- 20261001000002 let students report a battle photo; reviewing one meant
-- copying a path into the Storage browser. This adds what a review PAGE needs:
--
--   * app_admins — who the team is. NO client policies: nobody can read or
--     write it over the REST API. Add a team member by hand in the SQL editor:
--
--       insert into public.app_admins (user_id)
--       select id from auth.users where email = 'someone@example.com';
--
--   * is_app_admin() — "is the caller on that list". SECURITY DEFINER so it can
--     read app_admins past RLS, and it reads only the caller's own row.
--   * resolution columns on photo_reports, so a decision is RECORDED rather
--     than the report row deleted: "kept" or "deleted", when, and by whom.
--   * admin_photo_reports() — open reports grouped by photo, with the photo
--     owner's display name.
--   * admin_resolve_photo() — mark every open report on one photo as kept or
--     deleted.
--   * two Storage policies letting an admin VIEW and DELETE any file in
--     competition-work. They call is_app_admin(), which reads app_admins,
--     never storage.objects, so the recursion trap recorded in
--     20260916000003 cannot happen.
--
-- Being an admin is checked HERE, in every function and policy. The page in
-- the app is only a screen over these; a student who opens /admin/reports gets
-- nothing back from any of them.
--
-- Re-runnable.
-- ============================================================================

create table if not exists public.app_admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.app_admins a where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_app_admin() from public;
revoke all on function public.is_app_admin() from anon;
grant execute on function public.is_app_admin() to authenticated;

-- ── Recording the decision ──────────────────────────────────────────────────

alter table public.photo_reports
  add column if not exists resolution  text
    check (resolution in ('kept', 'deleted')),
  add column if not exists resolved_at timestamptz,
  add column if not exists resolved_by uuid references auth.users (id) on delete set null;

create index if not exists photo_reports_open_idx
  on public.photo_reports (photo_path) where resolution is null;

-- ── The review list ─────────────────────────────────────────────────────────

create or replace function public.admin_photo_reports()
returns table (
  photo_path     text,
  competition_id text,
  owner_id       uuid,
  owner_name     text,
  reports        integer,
  reasons        text[],
  first_reported timestamptz,
  last_reported  timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'admin_photo_reports: not an admin' using errcode = '42501';
  end if;

  return query
  select
    r.photo_path,
    min(r.competition_id),
    -- The owner is the second folder of the path; the path's CHECK guarantees
    -- a uuid-shaped segment, and the join is on text so a malformed one simply
    -- finds no profile instead of failing the whole list.
    min(p.id),
    min(p.display_name),
    count(*)::integer,
    array_agg(distinct r.reason),
    min(r.created_at),
    max(r.created_at)
  from public.photo_reports r
  left join public.profiles p
    on p.id::text = split_part(r.photo_path, '/', 2)
  where r.resolution is null
  group by r.photo_path
  order by max(r.created_at) desc;
end;
$$;

revoke all on function public.admin_photo_reports() from public;
revoke all on function public.admin_photo_reports() from anon;
grant execute on function public.admin_photo_reports() to authenticated;

create or replace function public.admin_resolve_photo(
  p_photo_path text,
  p_resolution text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed integer;
begin
  if not public.is_app_admin() then
    raise exception 'admin_resolve_photo: not an admin' using errcode = '42501';
  end if;
  if p_resolution not in ('kept', 'deleted') then
    raise exception 'admin_resolve_photo: bad resolution' using errcode = '22023';
  end if;

  update public.photo_reports r
  set resolution = p_resolution,
      resolved_at = now(),
      resolved_by = auth.uid()
  where r.photo_path = p_photo_path and r.resolution is null;
  get diagnostics changed = row_count;
  return changed;
end;
$$;

revoke all on function public.admin_resolve_photo(text, text) from public;
revoke all on function public.admin_resolve_photo(text, text) from anon;
grant execute on function public.admin_resolve_photo(text, text) to authenticated;

-- ── Storage: an admin can view and delete any battle photo ──────────────────

drop policy if exists "competition work: admin read" on storage.objects;
create policy "competition work: admin read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'competition-work' and public.is_app_admin());

drop policy if exists "competition work: admin delete" on storage.objects;
create policy "competition work: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'competition-work' and public.is_app_admin());
