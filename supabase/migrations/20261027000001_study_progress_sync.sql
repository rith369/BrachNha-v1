-- ═════════════════════════════════════════════════════════════════════════════
-- Study progress that used to live on one phone only (27 Oct 2026)
--
-- Six store fields never left the device: flashcard review state (cardReviews),
-- the cards a student writes (studentCards), the cards they star
-- (starredCards), the log of every grade (reviewHistory), and the attempt
-- history of practice quizzes (quizResults) and past papers (paperResults).
-- Signing in on a new phone, or clearing the browser, lost all of them even
-- with an account. These tables are their server copies.
--
-- ONE TABLE PER FIELD, NOT A jsonb BLOB ON profiles. A blob would have to be
-- re-sent whole on every push (a thousand review-log entries for one grade),
-- and a new column on profiles would make the existing profiles upsert fail
-- outright on a project where this file has not been applied yet. Separate
-- tables mean the app can ship before or after this migration: a missing
-- table fails only its own request, and the student's work stays local.
--
-- WRITTEN INCREMENTALLY. src/lib/supabase-sync.ts pushes only what changed
-- since the last push (src/lib/sync-marks.ts remembers what was sent), so a
-- grade costs one card_reviews row and one card_review_log row, not a
-- snapshot. Nothing here is cross-user: every table is own rows only.
--
-- Keys are the app's own ids (card ids, "math-1-1-1", "2025-math"), text and
-- not foreign keys, for the reason 20260916000001 gives: content lives in
-- content_items by key, and a renamed key should stop matching rather than
-- reject the write.
-- ═════════════════════════════════════════════════════════════════════════════

begin;

-- ── card_reviews — store field: cardReviews ──────────────────────────────────
-- Each card's CURRENT spaced-repetition state (utils/spaced-repetition.ts),
-- one row per (student, card), overwritten on every grade.
create table if not exists public.card_reviews (
  user_id          uuid not null references public.profiles (id) on delete cascade,
  card_id          text not null check (char_length(card_id) between 1 and 200),
  phase            text not null check (phase in ('new', 'learning', 'review', 'relearning')),
  interval_days    integer not null default 0 check (interval_days >= 0),
  due_at           date not null,
  review_count     integer not null default 0 check (review_count >= 0),
  lapses           integer not null default 0 check (lapses >= 0),
  last_grade       text check (last_grade in ('again', 'hard', 'good', 'easy')),
  last_reviewed_at timestamptz,
  updated_at       timestamptz not null default now(),
  primary key (user_id, card_id)
);

-- ── student_cards — store field: studentCards ────────────────────────────────
-- Cards a student writes into an official deck. deck_key is the deck they sit
-- in ("biology-1-1"); card_id is minted on the device (crypto.randomUUID).
create table if not exists public.student_cards (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  card_id    text not null check (char_length(card_id) between 1 and 100),
  deck_key   text not null check (char_length(deck_key) between 1 and 100),
  front      text not null check (char_length(front) between 1 and 4000),
  back       text not null check (char_length(back) between 1 and 4000),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (user_id, card_id)
);

-- ── starred_cards — store field: starredCards ────────────────────────────────
-- A bookmark, official or student card alike. A row exists while it is starred.
create table if not exists public.starred_cards (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  card_id    text not null check (char_length(card_id) between 1 and 200),
  created_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

-- ── card_review_log — store field: reviewHistory ─────────────────────────────
-- One row per grade, ever; never updated. The device keeps the newest 1000 and
-- the pull reads back the same number.
create table if not exists public.card_review_log (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  card_id     text not null check (char_length(card_id) between 1 and 200),
  grade       text not null check (grade in ('again', 'hard', 'good', 'easy')),
  reviewed_at timestamptz not null,
  primary key (user_id, card_id, reviewed_at)
);

create index if not exists card_review_log_user_time_idx
  on public.card_review_log (user_id, reviewed_at desc);

-- ── quiz_results — store field: quizResults ──────────────────────────────────
-- A finished practice-quiz sitting. answers and question_ms are index-aligned
-- with the quiz version it was taken on, which is why version is kept: the
-- history screen re-marks an old attempt against THAT version.
create table if not exists public.quiz_results (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  quiz_key    text not null check (char_length(quiz_key) between 1 and 100),
  version     integer check (version >= 1),
  taken_at    timestamptz not null,
  score       integer not null check (score >= 0),
  total       integer not null check (total > 0),
  pct         numeric(5,2) not null check (pct between 0 and 100),
  ms          bigint not null check (ms >= 0),
  question_ms jsonb not null default '[]'::jsonb
              check (jsonb_typeof(question_ms) = 'array' and pg_column_size(question_ms) <= 65536),
  answers     jsonb not null default '[]'::jsonb
              check (jsonb_typeof(answers) = 'array' and pg_column_size(answers) <= 65536),
  constraint quiz_results_score_within_total check (score <= total),
  primary key (user_id, quiz_key, taken_at)
);

create index if not exists quiz_results_user_time_idx
  on public.quiz_results (user_id, taken_at desc);

-- ── paper_results — store field: paperResults ────────────────────────────────
-- A sat past paper. answers maps a question id to the option picked. leaves is
-- how many times the student left the exam screen (null: not recorded).
create table if not exists public.paper_results (
  user_id   uuid not null references public.profiles (id) on delete cascade,
  paper_key text not null check (char_length(paper_key) between 1 and 100),
  version   integer check (version >= 1),
  taken_at  timestamptz not null,
  score     integer not null check (score >= 0),
  total     integer not null check (total > 0),
  pct       numeric(5,2) not null check (pct between 0 and 100),
  ms        bigint not null check (ms >= 0),
  answers   jsonb not null default '{}'::jsonb
            check (jsonb_typeof(answers) = 'object' and pg_column_size(answers) <= 65536),
  leaves    integer check (leaves >= 0),
  constraint paper_results_score_within_total check (score <= total),
  primary key (user_id, paper_key, taken_at)
);

create index if not exists paper_results_user_time_idx
  on public.paper_results (user_id, taken_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — own rows only, in this file so a table never exists without its rules
-- (the 20260913000001 pattern).
--
-- card_reviews and student_cards can be UPDATED: they hold a card's current
-- state and a card the student edits. The other four are insert-once — a grade,
-- a star, an attempt — and the app writes them with ON CONFLICT DO NOTHING, so
-- they get no update policy. Every table allows DELETE: un-starring, deleting
-- your own card, and "use this device" on the account-conflict screen, which
-- replaces the account's copy with this device's.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.card_reviews    enable row level security;
alter table public.student_cards   enable row level security;
alter table public.starred_cards   enable row level security;
alter table public.card_review_log enable row level security;
alter table public.quiz_results    enable row level security;
alter table public.paper_results   enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'card_reviews', 'student_cards', 'starred_cards',
    'card_review_log', 'quiz_results', 'paper_results'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || ': read own', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)',
      t || ': read own', t);

    execute format('drop policy if exists %I on public.%I', t || ': insert own', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',
      t || ': insert own', t);

    execute format('drop policy if exists %I on public.%I', t || ': delete own', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',
      t || ': delete own', t);
  end loop;

  foreach t in array array['card_reviews', 'student_cards'] loop
    execute format('drop policy if exists %I on public.%I', t || ': update own', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      t || ': update own', t);
  end loop;
end
$$;

commit;
