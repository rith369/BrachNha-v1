-- ============================================================================
-- BrachNha — what each side ANSWERED, and a photo of their working
-- ============================================================================
--
-- Two additions to the Game feature, for one product reason: a competition used
-- to record only that you got 3 out of 5. That is a score, not a lesson. After a
-- run the two students now compare WHAT THEY PICKED question by question, and
-- swap a photo of the working they did on paper — the multiple choice gives the
-- score, the photo shows the method, which is the half that actually teaches.
--
-- ── 1. answers: two new jsonb columns ──────────────────────────────────────
--
-- Stored rather than derived because there is nothing to derive them from: the
-- option a student chose is gone the moment the run ends. They are written ONCE,
-- in the same insert as the score, so neither table needs the UPDATE policy that
-- 20260913000001 deliberately withholds.
--
-- `creator_answers` rides on a world-readable row. That is safe for the same
-- reason the row already is, and gives away nothing new: `questions` on that same
-- row has always carried each question's `correct` field, so the answer key was
-- already in every reader's hands. What a person PICKED is not more sensitive
-- than the score derived from it, which has been public since the feature shipped.
--
-- ── 2. THE FIRST STORAGE BUCKET IN THIS PROJECT ────────────────────────────
--
-- Everything in the schema before this is text and numbers a student typed or
-- earned. This is the first time BrachNha stores a FILE a student made, and the
-- first row of data in it that the app cannot read, summarise or reason about.
-- Three consequences worth having in mind before widening it:
--
--   - It is PRIVATE (`public = false`). A public bucket hands out a permanent
--     unguessable-but-unexpiring URL to anyone who ever sees it; these are read
--     through short-lived signed URLs so access stays a live decision rather
--     than a link somebody kept.
--   - THE PATH IS THE IDENTITY: `{competition_id}/{user_id}.jpg`, and both
--     halves are load-bearing. Every policy below reads the owner out of the
--     filename rather than trusting storage.objects.owner, whose type and name
--     have changed across Supabase versions. It also means no `photo_path`
--     column is needed anywhere — the path is derivable from ids the client
--     already holds, which is what keeps both tables insert-only.
--   - `file_size_limit` is a hard stop, not the real control. The client
--     compresses to roughly 200-350KB before uploading (utils/image-compress.ts);
--     2MB is headroom for a caller that somehow skips it, on an audience paying
--     for Cambodian mobile data in both directions.
--
-- Re-runnable, like the four migrations before it.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. The answers
--
-- An ARRAY OF THE OPTION TEXT, positionally matched to `questions`, with null
-- for a question the clock ran out on. The text rather than an index because
-- `correct` is compared by string equality everywhere else in this app (see
-- SectionQuestion in types/index.ts) — an index would be a second representation
-- of the same answer, free to drift the day options are reordered.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.competitions
  add column if not exists creator_answers jsonb not null default '[]'::jsonb;

alter table public.competition_attempts
  add column if not exists answers jsonb not null default '[]'::jsonb;

-- Rows written before this migration keep '[]', which the client reads as "this
-- match predates answer recording" and says so, rather than drawing a review
-- screen where every question looks unanswered.

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. The bucket
-- ─────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'competition-work',
  'competition-work',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================================
-- Storage row level security
-- ============================================================================
-- storage.objects already has RLS enabled by Supabase; these are policies on it.
-- Every one of them is scoped to `bucket_id = 'competition-work'` FIRST, so none
-- can affect any other bucket this project may grow.

-- ─────────────────────────────────────────────────────────────────────────────
-- READ — THE NARROWEST POLICY IN THE SCHEMA, and it mirrors the product rule
-- competition_attempts already encodes: every joiner competes against the
-- CREATOR, never against each other.
--
--   your own working            — always
--   you created the competition — every joiner's working, because they are all
--                                 competing against you
--   you joined the competition  — the CREATOR's working, AND NOBODY ELSE'S.
--                                 The last `exists` is what enforces that: it
--                                 requires the file's owner (read out of the
--                                 filename) to be the creator, so a joiner
--                                 cannot reach a second joiner's photo by
--                                 guessing their uid.
--
-- The reciprocity the UI applies on top of this — you see theirs once you have
-- uploaded yours — is deliberately NOT here. It is a nudge toward the exchange,
-- not a security boundary, and encoding it in SQL would mean a student who
-- photographed their work on a dead connection silently loses access to a
-- classmate's once it comes back.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "competition work: read own, yours to judge, or the creator's"
  on storage.objects;
create policy "competition work: read own, yours to judge, or the creator's"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'competition-work'
    and (
      split_part(storage.filename(name), '.', 1) = (select auth.uid()::text)
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
            and c.creator_id::text = split_part(storage.filename(name), '.', 1)
        )
      )
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- WRITE — you may only ever write a file named after yourself, in the folder of
-- a competition you actually took part in. Both halves matter: the first stops
-- anyone uploading under a classmate's name, the second stops the bucket being
-- used as free file hosting by posting into a competition you never played.
--
-- The participation check is what makes ORDER OF OPERATIONS load-bearing on the
-- client: the competition (or the attempt) has to have reached the server before
-- the photo can. A failed publish therefore means a failed upload, which is
-- correct — there is nothing for the photo to hang off yet.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "competition work: upload own" on storage.objects;
create policy "competition work: upload own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'competition-work'
    and split_part(storage.filename(name), '.', 1) = (select auth.uid()::text)
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
  );

-- UPDATE exists here although the two tables above deliberately have none, and
-- the difference is real: a score is a RESULT and must not be editable after
-- someone has been shown it, but a photo is an ARTEFACT — the first one is
-- blurry, or has a thumb over the working, more often than not. Retaking
-- replaces your own file and nothing else; the score it sits beside is
-- untouchable either way.
drop policy if exists "competition work: replace own" on storage.objects;
create policy "competition work: replace own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'competition-work'
    and split_part(storage.filename(name), '.', 1) = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'competition-work'
    and split_part(storage.filename(name), '.', 1) = (select auth.uid()::text)
  );

drop policy if exists "competition work: delete own" on storage.objects;
create policy "competition work: delete own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'competition-work'
    and split_part(storage.filename(name), '.', 1) = (select auth.uid()::text)
  );
