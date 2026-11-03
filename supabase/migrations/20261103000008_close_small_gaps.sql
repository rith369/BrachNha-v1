-- ============================================================================
-- BrachNha: three small gaps from the security review
-- ============================================================================
--
-- 1. PHOTO UPLOADS STOP. The Battle photo feature has been off in the app since 27 Oct
--    2026 (WORK_PHOTOS_ENABLED), but the database still took uploads from anyone
--    calling it directly, and each one uses storage. Only the upload policy goes.
--    Photos already there can still be read, reported and deleted, and account deletion
--    still clears them.
--    TO TURN THE FEATURE BACK ON, also restore "competition work: upload own" from
--    20260916000003.
--
-- 2. HIDDEN CONTENT IS HIDDEN. Hiding an item only took it off the list. Its text
--    stayed readable by anyone asking for it by name, and so did anything published and
--    later withdrawn. Now a version can only be read while its item is published.
--    OLD VERSIONS OF A PUBLISHED ITEM STAY READABLE: a student reopening an old attempt
--    loads the version they took.
--    NOT undone: a phone keeps what it already downloaded (lib/content.ts).
--    ADMIN SCREENS ARE NOT AFFECTED: they read through security definer functions, and
--    so do the Battle checks, so a Battle from a hidden pool still shares. No is_app_admin()
--    in this policy, because anon has no right to call it and every guest's read would fail.
--
-- 3. THE ERROR LOG IS HELD DOWN. Rows were never deleted, and the only limits were per
--    student and per hour, with guests sharing 200 an hour. A script needs no account for
--    that, so it could write about 1.4 GB in 60 days. Now:
--      - 300 rows a day from guests, and 2000 a day from everyone, as a total.
--      - Rows older than 45 days are deleted. Admin → Errors reads 30 days back at most.
--    Guests have their own smaller limit so a flood from a script with no account cannot
--    use up the room that signed-in students' errors need. Over a limit the call is
--    dropped quietly, as before: a client already in trouble must not get a second error.
--    No scheduled job, which would need another extension: the deleting happens on about
--    1 report in 50, so the log only needs cleaning while it is being written to.
--
-- ORDER DOES NOT MATTER. The app does not upload photos or read hidden versions.
--
-- Re-runnable.
-- ============================================================================

begin;

-- ── 1. Photo uploads ────────────────────────────────────────────────────────

drop policy if exists "competition work: upload own" on storage.objects;
drop policy if exists "competition work: replace own" on storage.objects;

-- ── 2. Hidden content ───────────────────────────────────────────────────────

drop policy if exists "content_versions: read all" on public.content_versions;
drop policy if exists "content_versions: read while published" on public.content_versions;
create policy "content_versions: read while published"
  on public.content_versions for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.content_items i
      where i.kind = content_versions.kind
        and i.key = content_versions.key
        and i.version is not null
    )
  );

-- ── 3. The error log ────────────────────────────────────────────────────────

create or replace function public.log_client_error(
  p_message text,
  p_stack   text,
  p_route   text,
  p_version text,
  p_ua      text
)
returns void
language plpgsql
security definer
-- Empty search_path and every name schema-qualified, as in kruai_take().
set search_path = ''
as $$
declare
  -- A crash loop on one device must not fill the table. Over a cap the call is
  -- DROPPED quietly rather than raising: the client is already in trouble and
  -- must not get a second error from reporting the first.
  per_user_hour constant integer := 20;
  anon_hour     constant integer := 200;
  anon_day      constant integer := 300;
  everyone_day  constant integer := 2000;
  uid  uuid := auth.uid();
  seen integer;
begin
  if p_message is null or char_length(p_message) = 0 then
    return;
  end if;

  if uid is null then
    select count(*) into seen from public.client_errors e
    where e.user_id is null and e.created_at > now() - interval '1 hour';
    if seen >= anon_hour then return; end if;
    select count(*) into seen from public.client_errors e
    where e.user_id is null and e.created_at > now() - interval '1 day';
    if seen >= anon_day then return; end if;
  else
    select count(*) into seen from public.client_errors e
    where e.user_id = uid and e.created_at > now() - interval '1 hour';
    if seen >= per_user_hour then return; end if;
  end if;

  select count(*) into seen from public.client_errors e
  where e.created_at > now() - interval '1 day';
  if seen >= everyone_day then return; end if;

  insert into public.client_errors (user_id, message, stack, route, app_version, user_agent)
  values (
    uid,
    left(p_message, 500),
    left(p_stack, 4000),
    left(p_route, 200),
    left(p_version, 40),
    left(p_ua, 300)
  );

  if random() < 0.02 then
    delete from public.client_errors e where e.created_at < now() - interval '45 days';
  end if;
end;
$$;

-- What is already there, so this does not wait for the next report.
delete from public.client_errors where created_at < now() - interval '45 days';

commit;

-- What the SQL editor shows afterwards: true, if all three are in place.
select
  not exists (
    select 1 from pg_catalog.pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname in ('competition work: upload own', 'competition work: replace own')
  )
  and exists (
    select 1 from pg_catalog.pg_policies
    where schemaname = 'public' and tablename = 'content_versions'
      and policyname = 'content_versions: read while published'
  )
  and not exists (
    select 1 from pg_catalog.pg_policies
    where schemaname = 'public' and tablename = 'content_versions'
      and policyname = 'content_versions: read all'
  )
  and pg_catalog.pg_get_functiondef('public.log_client_error(text, text, text, text, text)'::pg_catalog.regprocedure) like '%everyone_day%'
  as gaps_closed;
