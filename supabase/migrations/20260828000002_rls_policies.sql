-- ============================================================================
-- BrachNha — row level security
-- ============================================================================
--
-- Every table in 20260828000001 holds one student's private study record, so
-- the rule is the same everywhere: you can see and change your own rows and
-- nobody else's. There is no shared or public data in this schema at all.
--
-- Two conventions used throughout:
--
--   * `(select auth.uid())` rather than a bare `auth.uid()`. Wrapping it in a
--     scalar subquery lets Postgres evaluate it ONCE per statement instead of
--     once per row, which is the difference between an index scan and a seq
--     scan on a table of any size. This is Supabase's own documented
--     recommendation and it matters most on chat_messages, the only table here
--     that grows without a cap per user.
--
--   * Separate policies per command rather than one `for all`. An `update`
--     policy needs both `using` (which existing rows may I target) and
--     `with check` (what may the row look like afterwards); folding them into
--     `for all` makes it easy to get the second half wrong and let a row be
--     updated INTO someone else's ownership.
--
-- Enabling RLS without a policy denies everything, so the enable and the
-- policies have to land together — which is why they are one migration.
--
-- Deliberately absent: any cross-user read. The leaderboard needs one and is
-- fixed demo data until it gets a proper aggregate (a view or a security-definer
-- function exposing rank and display name only). Do not add a "profiles are
-- readable by everyone" policy to make that screen work — it would expose
-- email, age and location along with it.
-- ============================================================================

alter table public.profiles                enable row level security;
alter table public.pending_placement_tests enable row level security;
alter table public.commitments             enable row level security;
alter table public.daily_activity          enable row level security;
alter table public.exam_results            enable row level security;
alter table public.completed_sessions      enable row level security;
alter table public.conversations           enable row level security;
alter table public.chat_messages           enable row level security;

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles — keyed on `id`, not `user_id`: the row IS the user.
--
-- INSERT is allowed but only for your OWN id, which is what makes the client's
-- upsert safe. The row is normally created by the on_auth_user_created trigger
-- (security definer, so it bypasses these policies entirely) and the client
-- never needs to insert at all. The policy exists so that a project where that
-- trigger did not get installed degrades to "the client creates its own row"
-- instead of silently updating zero rows forever — a failure mode that looks
-- exactly like working code.
--
-- DELETE stays closed: a profile disappears when its auth.users row does, via
-- the cascade. There is no reason for a client to delete one directly, and an
-- accidental one would take every dependent row with it.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own"
  on public.profiles for update
  to authenticated
  using      ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Everything else is owned through user_id and gets the full four.
-- ─────────────────────────────────────────────────────────────────────────────

-- pending_placement_tests
drop policy if exists "pending_placement_tests: read own"   on public.pending_placement_tests;
create policy "pending_placement_tests: read own"
  on public.pending_placement_tests for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "pending_placement_tests: insert own" on public.pending_placement_tests;
create policy "pending_placement_tests: insert own"
  on public.pending_placement_tests for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "pending_placement_tests: update own" on public.pending_placement_tests;
create policy "pending_placement_tests: update own"
  on public.pending_placement_tests for update to authenticated
  using      ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "pending_placement_tests: delete own" on public.pending_placement_tests;
create policy "pending_placement_tests: delete own"
  on public.pending_placement_tests for delete to authenticated
  using ((select auth.uid()) = user_id);

-- commitments
drop policy if exists "commitments: read own"   on public.commitments;
create policy "commitments: read own"
  on public.commitments for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "commitments: insert own" on public.commitments;
create policy "commitments: insert own"
  on public.commitments for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "commitments: update own" on public.commitments;
create policy "commitments: update own"
  on public.commitments for update to authenticated
  using      ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "commitments: delete own" on public.commitments;
create policy "commitments: delete own"
  on public.commitments for delete to authenticated
  using ((select auth.uid()) = user_id);

-- daily_activity
drop policy if exists "daily_activity: read own"   on public.daily_activity;
create policy "daily_activity: read own"
  on public.daily_activity for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "daily_activity: insert own" on public.daily_activity;
create policy "daily_activity: insert own"
  on public.daily_activity for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "daily_activity: update own" on public.daily_activity;
create policy "daily_activity: update own"
  on public.daily_activity for update to authenticated
  using      ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "daily_activity: delete own" on public.daily_activity;
create policy "daily_activity: delete own"
  on public.daily_activity for delete to authenticated
  using ((select auth.uid()) = user_id);

-- exam_results
drop policy if exists "exam_results: read own"   on public.exam_results;
create policy "exam_results: read own"
  on public.exam_results for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "exam_results: insert own" on public.exam_results;
create policy "exam_results: insert own"
  on public.exam_results for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "exam_results: update own" on public.exam_results;
create policy "exam_results: update own"
  on public.exam_results for update to authenticated
  using      ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "exam_results: delete own" on public.exam_results;
create policy "exam_results: delete own"
  on public.exam_results for delete to authenticated
  using ((select auth.uid()) = user_id);

-- completed_sessions
drop policy if exists "completed_sessions: read own"   on public.completed_sessions;
create policy "completed_sessions: read own"
  on public.completed_sessions for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "completed_sessions: insert own" on public.completed_sessions;
create policy "completed_sessions: insert own"
  on public.completed_sessions for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "completed_sessions: update own" on public.completed_sessions;
create policy "completed_sessions: update own"
  on public.completed_sessions for update to authenticated
  using      ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "completed_sessions: delete own" on public.completed_sessions;
create policy "completed_sessions: delete own"
  on public.completed_sessions for delete to authenticated
  using ((select auth.uid()) = user_id);

-- conversations
drop policy if exists "conversations: read own"   on public.conversations;
create policy "conversations: read own"
  on public.conversations for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "conversations: insert own" on public.conversations;
create policy "conversations: insert own"
  on public.conversations for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "conversations: update own" on public.conversations;
create policy "conversations: update own"
  on public.conversations for update to authenticated
  using      ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "conversations: delete own" on public.conversations;
create policy "conversations: delete own"
  on public.conversations for delete to authenticated
  using ((select auth.uid()) = user_id);

-- chat_messages
drop policy if exists "chat_messages: read own"   on public.chat_messages;
create policy "chat_messages: read own"
  on public.chat_messages for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "chat_messages: insert own" on public.chat_messages;
create policy "chat_messages: insert own"
  on public.chat_messages for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "chat_messages: update own" on public.chat_messages;
create policy "chat_messages: update own"
  on public.chat_messages for update to authenticated
  using      ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "chat_messages: delete own" on public.chat_messages;
create policy "chat_messages: delete own"
  on public.chat_messages for delete to authenticated
  using ((select auth.uid()) = user_id);
