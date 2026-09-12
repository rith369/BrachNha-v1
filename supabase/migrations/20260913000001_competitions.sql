-- ============================================================================
-- BrachNha — competitions (the Game feature)
-- ============================================================================
--
-- THIS IS THE FIRST CROSS-USER DATA IN THE SCHEMA. Every table before it holds
-- one student's private record and every one of the 29 existing policies is
-- `(select auth.uid()) = <owner>`. A competition is deliberately different: one
-- student posts a challenge and ANY signed-in student can read it and take it.
--
-- WHY THAT IS SAFE, and it is the whole security argument for this file:
-- a competition row carries a subject, a difficulty, a time budget, a frozen
-- question set, the creator's score, and the creator's DISPLAY NAME. It carries
-- no email, no age, no location and no id you could look a person up by beyond
-- the uid that RLS already keys on.
--
-- `creator_name` IS DENORMALISED FOR EXACTLY THIS REASON. The result screen has
-- to name who you were up against. The obvious way to get that is a policy
-- letting everyone read `profiles` — and 20260828000002_rls_policies.sql
-- explicitly forbids that, because `profiles` holds email, age and location and
-- the leaderboard hit the same temptation first. Copying the name onto the row
-- is what lets the competition be world-readable while `profiles` stays
-- owner-only. DO NOT replace it with a join.
--
-- The cost, stated so it is not mistaken for a bug: renaming yourself does not
-- rename your old competitions.
--
-- Re-runnable, like the three migrations before it.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- competitions — store field: competitions[]
--
-- `id` is TEXT, not uuid, for the same reason conversations.id is: it is minted
-- client-side by newId() in lib/store.ts, which falls back to a `c<base36>`
-- string when crypto.randomUUID is unavailable. A uuid column would reject
-- those and every id already sitting in a student's localStorage.
--
-- `questions` is jsonb holding the FROZEN set the creator answered. Not an index
-- or a seed into data/game-questions.ts: a joiner must answer exactly what the
-- creator answered for as long as the competition exists, and since content is
-- explicitly arriving later, an edit to that file is not hypothetical.
--
-- `creator_ms` is the tie-break. Equal scores rank on who finished faster, so
-- the time is part of the result rather than decoration — see outcomeOf().
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.competitions (
  id           text primary key,
  creator_id   uuid not null references public.profiles (id) on delete cascade,
  creator_name text not null default '',
  subject      text not null,
  difficulty   text not null default 'mix'
                 check (difficulty in ('easy', 'medium', 'hard', 'mix')),
  minutes      integer not null check (minutes between 1 and 180),
  questions    jsonb   not null default '[]'::jsonb,
  creator_score integer not null check (creator_score >= 0),
  creator_ms   integer not null check (creator_ms >= 0),
  total        integer not null check (total > 0),
  created_at   timestamptz not null default now(),
  constraint competitions_score_within_total check (creator_score <= total)
);

-- The browse list is "newest first, not mine", so it reads created_at desc and
-- filters on creator_id.
create index if not exists competitions_created_idx
  on public.competitions (created_at desc);

create index if not exists competitions_creator_idx
  on public.competitions (creator_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- competition_attempts — store field: competitionAttempts[]
--
-- One row per student per competition: `unique (competition_id, user_id)` is
-- what stops someone re-rolling a bad run until they beat the creator. The
-- client treats a duplicate-key error as "already played", not as a failure.
--
-- The opponent's half of the comparison is NOT stored here — it lives on the
-- competition, which is readable by everyone, so a result can always be
-- rebuilt. (The local CompetitionAttempt DOES carry it, for a different reason:
-- a joiner has no reason to keep the competition on their device, and the
-- history list has to render offline.)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.competition_attempts (
  id             uuid primary key default gen_random_uuid(),
  competition_id text not null references public.competitions (id) on delete cascade,
  user_id        uuid not null references public.profiles (id) on delete cascade,
  user_name      text not null default '',
  score          integer not null check (score >= 0),
  ms             integer not null check (ms >= 0),
  played_at      timestamptz not null default now(),
  unique (competition_id, user_id)
);

create index if not exists competition_attempts_competition_idx
  on public.competition_attempts (competition_id, score desc, ms asc);

-- Every FK wants an index on the referencing side; 20260904000001 added the one
-- chat_messages was missing for the same reason.
create index if not exists competition_attempts_user_idx
  on public.competition_attempts (user_id, played_at desc);

-- ============================================================================
-- Row level security
-- ============================================================================
-- Enabling RLS without a policy denies everything, so these land together with
-- the tables above.

alter table public.competitions         enable row level security;
alter table public.competition_attempts enable row level security;

-- ─────────────────────────────────────────────────────────────────────────────
-- competitions
--
-- READ IS OPEN TO EVERY SIGNED-IN STUDENT — the first policy in this schema
-- whose `using` clause is not an ownership test. That is the feature: a
-- competition nobody else can see is not a competition. See this file's header
-- for why the row is safe to expose, and note `to authenticated`: an anonymous
-- caller with just the publishable key still gets nothing.
--
-- Writing stays owner-only, so nobody can post under someone else's name or
-- edit the score they are being measured against.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "competitions: read all" on public.competitions;
create policy "competitions: read all"
  on public.competitions for select
  to authenticated
  using (true);

drop policy if exists "competitions: insert own" on public.competitions;
create policy "competitions: insert own"
  on public.competitions for insert
  to authenticated
  with check ((select auth.uid()) = creator_id);

-- No UPDATE policy at all, and that is deliberate rather than an omission: a
-- competition is a fixed challenge. Letting a creator edit the score or the
-- questions after people have played it would silently rewrite results that
-- have already been shown. It is insert-once, delete-if-you-must.
drop policy if exists "competitions: delete own" on public.competitions;
create policy "competitions: delete own"
  on public.competitions for delete
  to authenticated
  using ((select auth.uid()) = creator_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- competition_attempts — NARROWER THAN THE COMPETITION ITSELF
--
-- Readable if it is yours, OR if you created the competition it belongs to.
-- That is exactly the product rule: every joiner competes against the CREATOR,
-- not against each other, so a joiner sees only their own result, and the
-- creator sees everyone who took their challenge.
--
-- The `exists` subquery is the reason competitions has its own read policy
-- rather than relying on this one: RLS on competitions applies inside here too,
-- and a creator must be able to see the row to match on it.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "competition_attempts: read own or on own competition"
  on public.competition_attempts;
create policy "competition_attempts: read own or on own competition"
  on public.competition_attempts for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1
      from public.competitions c
      where c.id = competition_attempts.competition_id
        and c.creator_id = (select auth.uid())
    )
  );

drop policy if exists "competition_attempts: insert own" on public.competition_attempts;
create policy "competition_attempts: insert own"
  on public.competition_attempts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- No UPDATE, for the same reason competitions has none: an attempt is a result,
-- and a result that can be edited after the fact is not one. The unique
-- constraint above already makes a second run impossible.
drop policy if exists "competition_attempts: delete own" on public.competition_attempts;
create policy "competition_attempts: delete own"
  on public.competition_attempts for delete
  to authenticated
  using ((select auth.uid()) = user_id);
