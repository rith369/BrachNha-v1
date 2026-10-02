-- ============================================================================
-- BrachNha — announcements, and students reporting a mistake in a question
-- ============================================================================
--
-- Step C of docs/plans/admin-roles.md.
--
--   * announcements: a short message the team shows every student as a banner
--     under the app bar (src/components/shell/announcement-banner.tsx). The
--     LIVE ones are readable by anyone, guests included (anon), because the
--     banner fetches them with the publishable key and no session. Nothing
--     else is readable, and nothing is writable from a client: admins publish
--     and end them through admin_publish_announcement() and
--     admin_end_announcement(), so the database, not the page, records who
--     published what.
--
--   * content_reports: a signed-in student flags a quiz or exam question as
--     wrong, mistyped or unclear. They are written ONLY through
--     report_content(), never by a client insert, because that function caps
--     how many a student may send a day: a policy cannot count a student's own
--     rows (a policy on a table must never query that same table; see
--     20260916000003). Students may read their own reports. The team reviews
--     them on /admin/mistakes and marks them fixed or not a mistake. The FIX
--     itself is a code edit to the question, which then goes through
--     check:quiz; this table only records that someone asked.
--
-- A content_ref NAMES a question without copying its text, so a report stays
-- small and points at whatever the question says today:
--
--   section:biology-3-1-1#0-2      a section-quiz question (step-index)
--   quiz:math-1-1-1#3              a practice-quiz question (index)
--   paper:2025-math#l1             a past-paper question (its id)
--
-- Re-runnable. One transaction.
-- ============================================================================

begin;

-- ── Announcements ───────────────────────────────────────────────────────────

create table if not exists public.announcements (
  id         bigint generated always as identity primary key,
  body_km    text not null check (char_length(btrim(body_km)) between 1 and 300),
  body_en    text check (body_en is null or char_length(body_en) <= 300),
  tone       text not null default 'info' check (tone in ('info', 'success', 'warning')),
  -- An APP path only. Not '//…' (a browser reads that as another site) and no
  -- backslash (some browsers read '/\' the same way), so a banner can never
  -- send a student off BrachNha.
  link       text check (
    link is null
    or (
      char_length(link) <= 200
      and link ~ '^/[A-Za-z0-9/_?=&.%#-]*$'
      and left(link, 2) <> '//'
    )
  ),
  starts_at  timestamptz not null default now(),
  ends_at    timestamptz,
  active     boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists announcements_live_idx
  on public.announcements (created_at desc) where active;

alter table public.announcements enable row level security;

grant select on public.announcements to anon, authenticated;

drop policy if exists "announcements: read live" on public.announcements;
create policy "announcements: read live"
  on public.announcements for select
  to anon, authenticated
  using (
    active
    and starts_at <= now()
    and (ends_at is null or ends_at > now())
  );

-- Every announcement, newest first, for /admin/announcements.
create or replace function public.admin_announcements()
returns table (
  id              bigint,
  body_km         text,
  body_en         text,
  tone            text,
  link            text,
  starts_at       timestamptz,
  ends_at         timestamptz,
  active          boolean,
  live            boolean,
  created_at      timestamptz,
  created_by_name text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'admin_announcements: not an admin' using errcode = '42501';
  end if;

  return query
  select
    a.id, a.body_km, a.body_en, a.tone, a.link, a.starts_at, a.ends_at, a.active,
    (a.active and a.starts_at <= now() and (a.ends_at is null or a.ends_at > now())),
    a.created_at,
    coalesce(p.display_name, '')
  from public.announcements a
  left join public.profiles p on p.id = a.created_by
  order by a.created_at desc
  limit 50;
end;
$$;

revoke all on function public.admin_announcements() from public;
revoke all on function public.admin_announcements() from anon;
grant execute on function public.admin_announcements() to authenticated;

-- Publish one, live from now. Refusals carry a hint the page can name:
-- 'body' (Khmer text missing or too long), 'link', 'ends' (not in the future).
create or replace function public.admin_publish_announcement(
  p_body_km text,
  p_body_en text,
  p_tone    text,
  p_link    text,
  p_ends_at timestamptz
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  km   text := btrim(coalesce(p_body_km, ''));
  en   text := nullif(btrim(coalesce(p_body_en, '')), '');
  lnk  text := nullif(btrim(coalesce(p_link, '')), '');
  new_id bigint;
begin
  if not public.is_app_admin() then
    raise exception 'admin_publish_announcement: not an admin' using errcode = '42501';
  end if;
  if char_length(km) < 1 or char_length(km) > 300 or char_length(coalesce(en, '')) > 300 then
    raise exception 'admin_publish_announcement: bad text'
      using errcode = '22023', hint = 'body';
  end if;
  if coalesce(p_tone, '') not in ('info', 'success', 'warning') then
    raise exception 'admin_publish_announcement: bad tone' using errcode = '22023';
  end if;
  if lnk is not null and (
    char_length(lnk) > 200
    or lnk !~ '^/[A-Za-z0-9/_?=&.%#-]*$'
    or left(lnk, 2) = '//'
  ) then
    raise exception 'admin_publish_announcement: bad link'
      using errcode = '22023', hint = 'link';
  end if;
  if p_ends_at is not null and p_ends_at <= now() then
    raise exception 'admin_publish_announcement: ends in the past'
      using errcode = '22023', hint = 'ends';
  end if;

  insert into public.announcements (body_km, body_en, tone, link, ends_at, created_by)
  values (km, en, p_tone, lnk, p_ends_at, auth.uid())
  returning announcements.id into new_id;
  return new_id;
end;
$$;

revoke all on function public.admin_publish_announcement(text, text, text, text, timestamptz) from public;
revoke all on function public.admin_publish_announcement(text, text, text, text, timestamptz) from anon;
grant execute on function public.admin_publish_announcement(text, text, text, text, timestamptz) to authenticated;

-- End one now. It stays in the list (as ended), so the team can see what was
-- said and when.
create or replace function public.admin_end_announcement(p_id bigint)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_app_admin() then
    raise exception 'admin_end_announcement: not an admin' using errcode = '42501';
  end if;

  update public.announcements a
  set active = false,
      ends_at = case when a.ends_at is null or a.ends_at > now() then now() else a.ends_at end
  where a.id = p_id;
  return found;
end;
$$;

revoke all on function public.admin_end_announcement(bigint) from public;
revoke all on function public.admin_end_announcement(bigint) from anon;
grant execute on function public.admin_end_announcement(bigint) to authenticated;

-- ── Mistake reports ─────────────────────────────────────────────────────────

create table if not exists public.content_reports (
  id          bigint generated always as identity primary key,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  content_ref text not null check (
    char_length(content_ref) <= 120
    and content_ref ~ '^(section|quiz|paper):[a-z0-9-]{1,60}#[A-Za-z0-9_.-]{1,40}$'
  ),
  kind        text not null check (kind in ('wrong_answer', 'typo', 'unclear', 'other')),
  note        text check (note is null or char_length(note) <= 300),
  created_at  timestamptz not null default now(),
  resolution  text check (resolution in ('fixed', 'not_mistake')),
  resolved_at timestamptz,
  resolved_by uuid references auth.users (id) on delete set null,
  unique (reporter_id, content_ref)
);

create index if not exists content_reports_open_idx
  on public.content_reports (content_ref) where resolution is null;
create index if not exists content_reports_reporter_idx
  on public.content_reports (reporter_id, created_at desc);

alter table public.content_reports enable row level security;

-- Read through the policy below. Stated rather than left to the project's
-- default grants, like the announcements grant above. No insert or update:
-- writes go through report_content() and the admin functions only.
grant select on public.content_reports to authenticated;

drop policy if exists "content_reports: read own" on public.content_reports;
create policy "content_reports: read own"
  on public.content_reports for select
  to authenticated
  using ((select auth.uid()) = reporter_id);

-- The ONLY way a report is written. Returns true for a new report (or one
-- reopened after the team had closed it) and false when this student already
-- has an open report on that question, which the screen treats as success.
-- At most 30 a day per student (hint 'too_many').
create or replace function public.report_content(
  p_ref  text,
  p_kind text,
  p_note text default ''
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid  uuid := auth.uid();
  v_note text := nullif(left(btrim(coalesce(p_note, '')), 300), '');
  recent integer;
  changed integer;
begin
  if uid is null then
    raise exception 'report_content: not signed in' using errcode = '42501';
  end if;
  if p_kind is null or p_kind not in ('wrong_answer', 'typo', 'unclear', 'other') then
    raise exception 'report_content: bad kind' using errcode = '22023';
  end if;
  if p_ref is null or char_length(p_ref) > 120
     or p_ref !~ '^(section|quiz|paper):[a-z0-9-]{1,60}#[A-Za-z0-9_.-]{1,40}$' then
    raise exception 'report_content: bad ref' using errcode = '22023';
  end if;

  select count(*) into recent
  from public.content_reports r
  where r.reporter_id = uid and r.created_at > now() - interval '1 day';
  if recent >= 30 then
    raise exception 'report_content: too many today'
      using errcode = 'P0001', hint = 'too_many';
  end if;

  insert into public.content_reports (reporter_id, content_ref, kind, note)
  values (uid, p_ref, p_kind, v_note)
  on conflict (reporter_id, content_ref) do update
  set kind = excluded.kind,
      note = excluded.note,
      created_at = now(),
      resolution = null,
      resolved_at = null,
      resolved_by = null
  where public.content_reports.resolution is not null;

  get diagnostics changed = row_count;
  return changed > 0;
end;
$$;

revoke all on function public.report_content(text, text, text) from public;
revoke all on function public.report_content(text, text, text) from anon;
grant execute on function public.report_content(text, text, text) to authenticated;

-- Open reports, one row per question, most-reported first.
create or replace function public.admin_content_reports()
returns table (
  content_ref    text,
  reports        integer,
  kinds          text[],
  notes          text[],
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
    raise exception 'admin_content_reports: not an admin' using errcode = '42501';
  end if;

  return query
  select
    r.content_ref,
    count(*)::integer,
    array_agg(distinct r.kind),
    -- The 5 newest notes that say something.
    (array_agg(r.note order by r.created_at desc)
       filter (where r.note is not null and r.note <> ''))[1:5],
    min(r.created_at),
    max(r.created_at)
  from public.content_reports r
  where r.resolution is null
  group by r.content_ref
  order by count(*) desc, max(r.created_at) desc;
end;
$$;

revoke all on function public.admin_content_reports() from public;
revoke all on function public.admin_content_reports() from anon;
grant execute on function public.admin_content_reports() to authenticated;

-- Close every open report on one question.
create or replace function public.admin_resolve_content(
  p_ref        text,
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
    raise exception 'admin_resolve_content: not an admin' using errcode = '42501';
  end if;
  if p_resolution is null or p_resolution not in ('fixed', 'not_mistake') then
    raise exception 'admin_resolve_content: bad resolution' using errcode = '22023';
  end if;

  update public.content_reports r
  set resolution = p_resolution,
      resolved_at = now(),
      resolved_by = auth.uid()
  where r.content_ref = p_ref and r.resolution is null;

  get diagnostics changed = row_count;
  return changed;
end;
$$;

revoke all on function public.admin_resolve_content(text, text) from public;
revoke all on function public.admin_resolve_content(text, text) from anon;
grant execute on function public.admin_resolve_content(text, text) to authenticated;

commit;
