-- ============================================================================
-- BrachNha — initial schema
-- ============================================================================
--
-- This is the database half of what `localStorage["brachnha"]` holds today.
-- Every table here corresponds to a slice of `partializeState` in
-- src/lib/store.ts; the mapping is spelled out per table below so the two can
-- be checked against each other.
--
-- What is deliberately NOT here:
--
--   * Curriculum content — lessons, sections, subjects, past papers. Those live
--     in src/data/*.ts and stay there. Most subjects have no content yet and
--     the curriculum shape is still moving; pinning it to a schema now would
--     make every content edit a migration. Revisit when content stabilises.
--   * UI state — chatOpen / drawerOpen / pledgeOpen / focusMode. The store
--     already excludes these from persistence because they are how the app
--     looks right now, not what the student has done. A database has even less
--     business holding them.
--   * Leaderboard rosters. That screen is fixed demo data on purpose (see
--     CLAUDE.md). Cross-student ranking needs reads across users, which the RLS
--     in 20260828000002 deliberately forbids. When it goes live it wants its
--     own aggregate view, not a hole in these policies.
--
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Shared trigger: keep updated_at honest
--
-- search_path is pinned to '' (and every reference below fully qualified)
-- because a function that resolves names through a caller-controlled
-- search_path is the classic Postgres privilege-escalation shape. Supabase's
-- own database linter flags it.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles — one row per account, 1:1 with auth.users
--
-- Store fields folded in here: userName, userEmail, userAge, userLocation,
-- userLanguage, lang, theme, xp, level, coins, streak, surveyed, pledgeSeen,
-- and the four UserData fields (grade / strengths / weaknesses / studied).
--
-- The survey answers are denormalised onto this row rather than given their own
-- table because the app only ever reads the CURRENT answers — completeSurvey()
-- overwrites. If survey history is wanted later it should be an append-only
-- survey_responses table beside this one, not a widening of these columns.
--
-- `age` is smallint here although the store carries it as a string: the login
-- form is <input type="number" min=1 max=120>, so the string is always a
-- number or empty, and "" maps to null. The sync layer casts on both edges.
--
-- `streak` defaults to 0, not the store's 3. That 3 is a demo seed for a
-- brand-new local profile; a database row should not invent three days of work
-- nobody did.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  display_name   text        not null default '',
  email          text,
  age            smallint    check (age is null or (age between 1 and 120)),
  location       text,
  study_language text        check (study_language in ('english', 'french')),
  ui_lang        text        not null default 'en'    check (ui_lang in ('en', 'km')),
  theme          text        not null default 'light' check (theme in ('light', 'dark')),

  xp             integer     not null default 0 check (xp    >= 0),
  level          integer     not null default 1 check (level >= 1),
  coins          integer     not null default 0 check (coins >= 0),
  streak         integer     not null default 0 check (streak >= 0),

  surveyed       boolean     not null default false,
  studied        boolean     not null default false,
  grade          text        not null default '',
  strengths      text[]      not null default '{}',
  weaknesses     text[]      not null default '{}',
  pledge_seen    boolean     not null default false,

  -- Which conversation the mentor reopens on. Deliberately NO foreign key to
  -- public.conversations: the sync writes the profile row before the
  -- conversation rows, and a constraint here would reject that ordering for a
  -- value that is only ever a UI convenience. null means "a blank chat".
  active_conversation_id text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.profiles is
  'One row per account. Mirrors the identity + progression slice of the Zustand store.';

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-create the profile row when an auth user is created.
--
-- security definer because the trigger fires as the (unprivileged) signing-up
-- user, who has no rights on public.profiles yet. Doing it here rather than in
-- the client removes the race where the first write lands before the row
-- exists, and means the client never needs an INSERT path at all.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- pending_placement_tests — store field: pendingPlacementTests[]
--
-- unique(user_id, subject) mirrors schedulePlacementTest(), which filters the
-- subject out before re-adding it. Nothing books one any more (see CLAUDE.md),
-- so this is normally empty — it exists because the route and the roadmap card
-- that read it are still live.
--
-- scheduled_date is nullable even though the UI never wrote a null: the roadmap
-- card already guards against undated entries left over from the scrapped
-- scheduling flow, and a NOT NULL here would reject them on sync instead.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.pending_placement_tests (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  subject        text not null,
  scheduled_date date,
  created_at     timestamptz not null default now(),
  unique (user_id, subject)
);

create index if not exists pending_placement_tests_user_idx
  on public.pending_placement_tests (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- commitments — store field: commitment
--
-- The store keeps exactly one (signCommitment overwrites). This table keeps ALL
-- of them, newest by signed_at being the live one. Re-signing is a real event a
-- student may want to look back on, rows are tiny, and "latest wins" is one
-- order-by rather than a destructive write.
--
-- grade / months / hours_per_day / mission_* are a SNAPSHOT taken at signing
-- time, not live reads — see the Commitment type. `months` stays text because
-- it is display copy frozen at signing, not a number to compute with.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.commitments (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles (id) on delete cascade,
  kind               text not null check (kind in ('drawn', 'typed')),
  signature          text not null,
  signed_at          timestamptz not null default now(),
  grade              text    not null default '',
  months             text    not null default '',
  hours_per_day      numeric(4,1) not null default 0 check (hours_per_day >= 0),
  mission_lessons    integer not null default 0 check (mission_lessons    >= 0),
  mission_practice   integer not null default 0 check (mission_practice   >= 0),
  mission_flashcards integer not null default 0 check (mission_flashcards >= 0),
  created_at         timestamptz not null default now(),
  -- Same reason as exam_results: the store holds one unsaved Commitment with no
  -- id, so the signing timestamp is what identifies it. Re-signing produces a
  -- new signed_at and therefore a new row, which is how the history accrues.
  unique (user_id, signed_at)
);

create index if not exists commitments_user_signed_idx
  on public.commitments (user_id, signed_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- daily_activity — store field: tasks (plus the counters the app cannot keep)
--
-- The store's `tasks` is only ever TODAY: resetDailyTasks() wipes it and
-- nothing from yesterday survives. Giving the row a date is the one place this
-- schema deliberately does more than mirror the store, because it is what turns
-- the Progress heatmap and the leaderboard's study-time board from fixed demo
-- data into something real. features/progress/demo-data.ts and
-- utils/leaderboard.ts both name a "daily activity log" as the missing piece —
-- this is that log.
--
-- questions_answered / xp_earned / study_minutes are written by nothing yet.
-- They are here so the row has somewhere to put them when it is wired up; an
-- empty column costs nothing, a migration on a live table costs a deploy.
--
-- study_minutes must mean ACTIVE minutes when it is finally populated. Counting
-- "app was open" would make leaving a phone unlocked a winning strategy, which
-- is the exact thing the leaderboard is built to argue against.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.daily_activity (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles (id) on delete cascade,
  activity_date      date not null default current_date,

  task_lesson        boolean not null default false,
  task_practice      boolean not null default false,
  task_flashcards    boolean not null default false,
  task_challenge     boolean not null default false,

  questions_answered integer not null default 0 check (questions_answered >= 0),
  xp_earned          integer not null default 0 check (xp_earned          >= 0),
  study_minutes      integer not null default 0 check (study_minutes      >= 0),

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (user_id, activity_date)
);

create index if not exists daily_activity_user_date_idx
  on public.daily_activity (user_id, activity_date desc);

drop trigger if exists daily_activity_touch_updated_at on public.daily_activity;
create trigger daily_activity_touch_updated_at
  before update on public.daily_activity
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- exam_results — store field: examResults[]
--
-- `kind` is the important column. The store's array holds GENERATED MOCK EXAMS
-- ONLY, and three things downstream depend on that: Home's stat pill captioned
-- "from mock exams", chat-prompt.ts stating an average to KruAI as fact, and
-- the generated-exam tab rendering the array unfiltered as "Previous Results".
-- Placement attempts and past-paper attempts are excluded from it for exactly
-- that reason.
--
-- Widening the array would have broken all three. A `kind` column instead lets
-- the other two attempt types be recorded without ever being mistaken for a
-- mock: the client filters kind = 'mock' when it rebuilds examResults. This is
-- the "separate persisted pastPaperResults" follow-up CLAUDE.md flags, done as
-- a column rather than a second table because the row shape is identical.
--
-- `pct` is stored rather than derived so a row keeps the percentage the student
-- was actually shown, even if rounding in the app ever changes.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.exam_results (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles (id) on delete cascade,
  kind      text not null default 'mock' check (kind in ('mock', 'past_paper', 'placement')),
  subject   text,
  score     integer      not null check (score >= 0),
  total     integer      not null check (total >  0),
  pct       numeric(5,2) not null check (pct between 0 and 100),
  taken_at  timestamptz  not null default now(),
  constraint exam_results_score_within_total check (score <= total),
  -- Natural key for the sync's upsert. The store's ExamResult carries no id —
  -- it is `{score,total,pct,date}` and `date` is an ISO string minted at submit
  -- time — so without this the same attempt would insert a fresh row on every
  -- push. Millisecond precision makes a genuine collision within one kind for
  -- one student not a real case.
  unique (user_id, kind, taken_at)
);

create index if not exists exam_results_user_taken_idx
  on public.exam_results (user_id, kind, taken_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- completed_sessions — store field: completedSessions[]
--
-- Holds LESSON ids, not a separate session id — that is what lets the lesson
-- flow mark a subject-path node done with the id it already has. The unique
-- constraint is what makes the sync idempotent, matching completeSession().
--
-- completed_at is new: the store's flat array of ids has no timestamps, so
-- "when did they finish this" is a question the app currently cannot answer.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.completed_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  lesson_id    text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists completed_sessions_user_idx
  on public.completed_sessions (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- conversations / chat_messages — store fields: conversations[], activeConversationId
--
-- The store nests msgs inside each conversation; here they are rows, so a long
-- history does not have to be rewritten as one blob on every streamed chunk.
--
-- `conversations.id` is TEXT, not uuid, on purpose. The id is minted on the
-- client by newId() in store.ts, which falls back to a `c<base36>` string when
-- crypto.randomUUID is unavailable (it needs a secure context). A uuid column
-- would reject those, and every id already sitting in a student's localStorage
-- from before this migration. The id has to round-trip whatever the client
-- already has.
--
-- chat_messages carries its own user_id — denormalised from the conversation —
-- so the RLS policy is a column comparison rather than a join back to
-- conversations on every row read.
--
-- `seq` preserves order explicitly. created_at cannot: appendChatChunk writes a
-- streaming reply character-group by character-group, and two rows inserted in
-- the same millisecond would have no defined order.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.conversations (
  id         text primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  title      text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_updated_idx
  on public.conversations (user_id, updated_at desc);

create table if not exists public.chat_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id text not null references public.conversations (id) on delete cascade,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  seq             integer not null check (seq >= 0),
  role            text    not null check (role in ('user', 'bot')),
  content         text    not null default '',
  created_at      timestamptz not null default now(),
  unique (conversation_id, seq)
);

create index if not exists chat_messages_conversation_idx
  on public.chat_messages (conversation_id, seq);
