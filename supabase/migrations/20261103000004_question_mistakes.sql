-- ============================================================================
-- BrachNha: the questions a student got wrong and has not fixed (3 Nov 2026)
-- ============================================================================
--
-- The server copy of the store's `mistakes`, behind /practice/mistakes. One row per
-- (student, question). A row is deleted the moment the student answers that
-- question correctly, so this is a to-do list and not a history.
--
-- BY REFERENCE, NOT A COPY. `ref` names a question the way a mistake report does
-- ("quiz:math-1-1-1#q4", utils/content-ref.ts), so a fix published on Admin ->
-- Content reaches it, and a question removed there simply stops resolving. Text,
-- not a foreign key, for the reason 20260916000001 gives.
--
-- THE APP CAN SHIP BEFORE OR AFTER THIS FILE. A missing table fails only its own
-- request, and the list stays on the phone until the table exists.
-- ============================================================================

begin;

create table if not exists public.question_mistakes (
  user_id       uuid not null references public.profiles (id) on delete cascade,
  ref           text not null check (char_length(ref) between 1 and 120),
  times         integer not null default 1 check (times >= 1),
  last_wrong_at timestamptz not null,
  primary key (user_id, ref)
);

alter table public.question_mistakes enable row level security;

drop policy if exists "question_mistakes: read own" on public.question_mistakes;
create policy "question_mistakes: read own"
  on public.question_mistakes for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "question_mistakes: insert own" on public.question_mistakes;
create policy "question_mistakes: insert own"
  on public.question_mistakes for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "question_mistakes: update own" on public.question_mistakes;
create policy "question_mistakes: update own"
  on public.question_mistakes for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "question_mistakes: delete own" on public.question_mistakes;
create policy "question_mistakes: delete own"
  on public.question_mistakes for delete to authenticated
  using ((select auth.uid()) = user_id);

commit;
