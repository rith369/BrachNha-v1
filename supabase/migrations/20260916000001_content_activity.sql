-- ═════════════════════════════════════════════════════════════════════════════
-- daily_content_activity — store field: contentLog
--
-- WHAT THIS ADDS THAT NOTHING HAD: a scored question, attributed to a subject.
--
-- daily_activity (20260828000001) records that a day earned XP and whether the
-- daily goal was met. It has never recorded what the XP was FOR — which is the
-- single reason every per-subject number on the Progress dashboard was demo
-- data, and why exam_results.subject has sat nullable and unwritten: the
-- store's ExamResult had no subject field to supply it from.
--
-- ONE ROW PER (student, day, piece of content). A "content key" is either a
-- LESSON key ('biology-3-1') or a bare subject id ('biology') for work not
-- attached to a lesson — an exam paper. The subject is the first segment of
-- both; see features/progress/content-keys.ts, which is the only place that
-- parse is allowed to happen.
--
-- TEXT, NOT A FOREIGN KEY, and that is deliberate. Lessons, sections and decks
-- live in src/data/*.ts and never in this database (see "Content stays in
-- src/data/" in CLAUDE.md), so there is nothing here to reference. A key for
-- content that has since been renamed simply stops matching the catalog and its
-- rows drop out of the per-subject totals, which is the honest outcome — better
-- than a constraint that would have rejected the write at the time.
--
-- AGGREGATE, NOT AN EVENT LOG. A row per question would grow with the fastest-
-- growing quantity in the app and would need a cap the way reviewHistory does,
-- and a cap silently truncates exactly the history the 30-day trend reads. This
-- grows with days × content touched instead, so answering 200 questions in one
-- lesson costs the same as answering 2.
--
-- `reviewed` counts flashcard grades and is deliberately NOT part of accuracy:
-- a grade is a self-report, not a scored answer, and mixing the two would make
-- "average score" a blend of measured and claimed. The CHECK below constrains
-- correct against answered only, for exactly that reason.
-- ═════════════════════════════════════════════════════════════════════════════
create table if not exists public.daily_content_activity (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  activity_date date not null,
  content_key   text not null,

  answered      integer not null default 0 check (answered >= 0),
  correct       integer not null default 0 check (correct  >= 0),
  reviewed      integer not null default 0 check (reviewed >= 0),
  sessions      integer not null default 0 check (sessions >= 0),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint daily_content_correct_within_answered check (correct <= answered),
  unique (user_id, activity_date, content_key)
);

-- The dashboard reads a window ending today and walks backwards, so the index
-- matches daily_activity's rather than inventing a second shape.
create index if not exists daily_content_activity_user_date_idx
  on public.daily_content_activity (user_id, activity_date desc);

drop trigger if exists daily_content_activity_touch_updated_at
  on public.daily_content_activity;
create trigger daily_content_activity_touch_updated_at
  before update on public.daily_content_activity
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — own rows only.
--
-- Policies live in THIS file rather than in 20260828000002_rls_policies.sql,
-- following the pattern 20260913000001_competitions.sql set: a table and the
-- rules that make it safe arrive together, so applying one without the other is
-- not something a hand-run migration can get half right.
--
-- `(select auth.uid())` rather than a bare `auth.uid()` so Postgres evaluates it
-- once per statement instead of once per row — the same form every other policy
-- in this schema uses. There is no cross-user read here: unlike competitions,
-- nothing about one student's per-subject accuracy is another student's
-- business. When the leaderboard finally needs cross-user numbers it wants a
-- `security definer` function exposing rank and display name only, NOT a policy
-- widening on this table.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.daily_content_activity enable row level security;

drop policy if exists "daily_content_activity: read own" on public.daily_content_activity;
create policy "daily_content_activity: read own"
  on public.daily_content_activity for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "daily_content_activity: insert own" on public.daily_content_activity;
create policy "daily_content_activity: insert own"
  on public.daily_content_activity for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- UPDATE is allowed here, unlike competitions/competition_attempts: the client
-- upserts a running per-day total, so a second question answered on the same
-- day in the same lesson is an update to a row it already wrote. A score is a
-- result and must not be rewritten; a counter is a counter.
drop policy if exists "daily_content_activity: update own" on public.daily_content_activity;
create policy "daily_content_activity: update own"
  on public.daily_content_activity for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "daily_content_activity: delete own" on public.daily_content_activity;
create policy "daily_content_activity: delete own"
  on public.daily_content_activity for delete
  to authenticated
  using ((select auth.uid()) = user_id);
