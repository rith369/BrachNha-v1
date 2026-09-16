-- ============================================================================
-- BrachNha — fix: every photo upload was refused by 20260916000002
-- ============================================================================
--
-- THE BUG. The upload policy in 20260916000002 enforced six photos per question
-- by counting rows with a subquery on storage.objects — from INSIDE a policy on
-- storage.objects. Postgres expands a table's row security policies when it
-- rewrites a query, and while it is expanding them it refuses to meet the SAME
-- table again inside one: "infinite recursion detected in policy for relation
-- objects". That is raised at rewrite time, so it did not fail when the policy
-- was CREATED — it failed on every INSERT, which is every upload. The app
-- reported it as "Could not upload".
--
-- It is the classic Supabase trap (a `profiles` policy that reads `profiles`),
-- and the fix is the standard one: do the count in a SECURITY DEFINER function.
-- A function body is planned on its own rather than inlined into the policy, so
-- there is no recursion to detect.
--
-- WHY THIS FUNCTION IS SAFE TO EXPOSE. Anything in `public` is callable over the
-- REST API. A version taking any folder would let a signed-in student ask how
-- many photos ANOTHER student has on a question — which leaks who has played
-- and uploaded, the very thing listWorkPhotos is written to never reveal. So it
-- takes no user id at all: it reads auth.uid() itself and can only ever count
-- the CALLER's own files. The worst a direct call reveals is your own count.
--
-- 20260916000002 is left as applied rather than edited: a migration that has
-- already run is history, and changing it would make the repo disagree with the
-- project it was run on. This file replaces the one policy that was wrong.
--
-- Re-runnable.
-- ============================================================================

create or replace function public.my_competition_work_count(
  p_competition text,
  p_question integer
)
returns integer
language sql
stable
security definer
-- Empty search_path, so nothing a caller creates can shadow `storage.objects` or
-- `auth.uid` — the standard hardening for any SECURITY DEFINER function, and
-- why every name below is schema-qualified.
set search_path = ''
as $$
  select count(*)::integer
  from storage.objects o
  where o.bucket_id = 'competition-work'
    and o.name like
      p_competition || '/' || (select auth.uid()::text) || '/' || p_question::text || '-%';
$$;

-- Callable by signed-in students only — which is what the upload policy runs as.
-- Same revoke-then-grant shape 20260904000001 applied to handle_new_user.
revoke all on function public.my_competition_work_count(text, integer) from public;
revoke all on function public.my_competition_work_count(text, integer) from anon;
grant execute on function public.my_competition_work_count(text, integer) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- The upload policy, identical to 20260916000002's except for the count, which
-- now goes through the function above instead of a subquery on this table.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "competition work: upload own" on storage.objects;
create policy "competition work: upload own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'competition-work'
    and array_length(storage.foldername(name), 1) = 2
    and (storage.foldername(name))[2] = (select auth.uid()::text)
    and storage.filename(name) ~ '^[0-9]{1,2}-[A-Za-z0-9]{6,40}\.jpg$'
    -- you took part: created it, or have an attempt at it
    and (
      exists (
        select 1
        from public.competitions c
        where c.id = (storage.foldername(name))[1]
          and c.creator_id = (select auth.uid())
      )
      or exists (
        select 1
        from public.competition_attempts a
        where a.competition_id = (storage.foldername(name))[1]
          and a.user_id = (select auth.uid())
      )
    )
    -- the question exists in this competition
    and exists (
      select 1
      from public.competitions c
      where c.id = (storage.foldername(name))[1]
        and (regexp_match(storage.filename(name), '^([0-9]{1,2})-'))[1]::int
            < jsonb_array_length(c.questions)
    )
    -- fewer than six already on this question
    and public.my_competition_work_count(
      (storage.foldername(name))[1],
      (regexp_match(storage.filename(name), '^([0-9]{1,2})-'))[1]::int
    ) < 6
  );
