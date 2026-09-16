-- ============================================================================
-- BrachNha — photos of working are PER QUESTION now, and several per question
-- ============================================================================
--
-- 20260914000001 stored ONE photo per student per competition, at
-- `{competition_id}/{user_id}.jpg`. That was the wrong unit, and the user found
-- it at once: a photo of "my whole paper" does not tell a classmate which
-- working belongs to which question, and one answer often runs to several pages.
-- The exchange is only useful at the level a student actually asks about — "you
-- got question 3 and I didn't, show me YOUR question 3".
--
-- ── THE NEW PATH ───────────────────────────────────────────────────────────
--
--   {competition_id}/{user_id}/{question_index}-{photo_id}.jpg
--
-- Still "the path is the identity": no table records a photo, so neither
-- competitions nor competition_attempts needs a write after its insert. What
-- changed is how a reader finds them — it LISTS the student's folder rather than
-- deriving a single name, and the question each photo belongs to is read back
-- out of its filename.
--
-- The owner moved from the FILENAME to the second FOLDER segment, which is why
-- every policy is rewritten rather than amended.
--
-- ── OLD PHOTOS ─────────────────────────────────────────────────────────────
--
-- A file already at the old single-photo path stays readable and deletable by
-- the same people as before: every ownership test below is
--   coalesce(folder[2], filename-without-.jpg)
-- which is the new owner for the new shape and the old owner for the old one
-- (folder[2] is NULL when there is only one folder segment). Nothing in the app
-- shows those files any more, because they belong to no question. They are
-- expected to be a handful of test uploads at most.
--
-- ── WHAT THE DATABASE NOW ENFORCES THAT IT DID NOT ─────────────────────────
--
--   * at most SIX photos per student per question
--   * a question index the competition actually has
--   * one strict filename shape, so nothing else can be parked in the bucket
--
-- The per-student storage cost this bounds was a flagged risk of the first
-- version, which capped each FILE at 2MB and never the number of files.
--
-- Re-runnable, like every migration before it.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- READ — the same three cases as before, with the owner read from its new place.
--
--   your own                    — always
--   you created the competition — every joiner's working
--   you joined it               — the CREATOR's working and nobody else's
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "competition work: read own, yours to judge, or the creator's"
  on storage.objects;
create policy "competition work: read own, yours to judge, or the creator's"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'competition-work'
    and (
      coalesce(
        (storage.foldername(name))[2],
        split_part(storage.filename(name), '.', 1)
      ) = (select auth.uid()::text)
      or exists (
        select 1
        from public.competitions c
        where c.id = (storage.foldername(name))[1]
          and c.creator_id = (select auth.uid())
      )
      or (
        exists (
          select 1
          from public.competition_attempts a
          where a.competition_id = (storage.foldername(name))[1]
            and a.user_id = (select auth.uid())
        )
        and exists (
          select 1
          from public.competitions c
          where c.id = (storage.foldername(name))[1]
            and c.creator_id::text = coalesce(
              (storage.foldername(name))[2],
              split_part(storage.filename(name), '.', 1)
            )
        )
      )
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- WRITE — only the NEW shape can be created.
--
-- `objects.name` is written out in full inside the counting subquery, and that
-- is load-bearing rather than fussy: the subquery reads storage.objects too, so
-- a bare `name` there would resolve to the INNER row and every count would
-- compare a file with itself.
--
-- The question number is pulled with regexp_match rather than a cast of
-- split_part, because Postgres does not promise to evaluate the shape check
-- first — a cast of a non-numeric prefix would raise instead of returning false.
-- A non-match yields NULL, and NULL < n is not true, so the row is refused.
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
    and (
      select count(*)
      from storage.objects o
      where o.bucket_id = 'competition-work'
        and o.name like
          (storage.foldername(objects.name))[1] || '/' ||
          (storage.foldername(objects.name))[2] || '/' ||
          (regexp_match(storage.filename(objects.name), '^([0-9]{1,2})-'))[1] || '-%'
    ) < 6
  );

-- NO UPDATE POLICY ANY MORE. The single-photo version needed one so a blurry
-- photo could be overwritten in place. Every photo now has its own id, so a
-- retake is a delete and a new file — and a policy that is not needed is surface
-- that is not there.
drop policy if exists "competition work: replace own" on storage.objects;

drop policy if exists "competition work: delete own" on storage.objects;
create policy "competition work: delete own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'competition-work'
    and coalesce(
      (storage.foldername(name))[2],
      split_part(storage.filename(name), '.', 1)
    ) = (select auth.uid()::text)
  );
