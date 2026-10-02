-- ============================================================================
-- BrachNha — fix the photo-report list (/admin/reports always failed)
-- ============================================================================
--
-- 20261001000003's admin_photo_reports() took min(p.id) over a uuid column.
-- Postgres has no min() for uuid, and a plpgsql body is only resolved when the
-- function RUNS, so the migration applied cleanly and then every call failed
-- with "function min(uuid) does not exist". The review page could only say
-- "Could not load reports", and the menu badge never got a count.
--
-- The owner and their name are now GROUPED BY rather than aggregated: a photo
-- path names exactly one owner (its second folder), so grouping by the path
-- and that owner's profile is the same set of rows, with no aggregate needed.
--
-- Same signature, so `create or replace` is enough and the grants stay.
-- Re-runnable.
-- ============================================================================

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
    p.id,
    p.display_name,
    count(*)::integer,
    array_agg(distinct r.reason),
    min(r.created_at),
    max(r.created_at)
  from public.photo_reports r
  -- The owner is the second folder of the path; joining on text means a
  -- malformed segment finds no profile instead of failing the whole list.
  left join public.profiles p
    on p.id::text = split_part(r.photo_path, '/', 2)
  where r.resolution is null
  group by r.photo_path, p.id, p.display_name
  order by max(r.created_at) desc;
end;
$$;
