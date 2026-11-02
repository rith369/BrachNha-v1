-- ============================================================================
-- BrachNha: the 2-day Bac II Simulation's saved attempts (3 Nov 2026)
-- ============================================================================
--
-- One row per attempt at the whole simulation, the server copy of the store's
-- `simulations`. A student can sit Day 1 on one phone and needs it back on a new
-- one, the same reason paper_results exists.
--
-- A SEPARATE TABLE, AND THE APP CAN SHIP BEFORE OR AFTER THIS FILE. A missing
-- table fails only its own request, and the attempt stays on the device
-- (see 20261027000001 for the same reasoning).
--
-- ONE jsonb COLUMN FOR THE SITTINGS, NOT A ROW PER PAPER. An attempt is only ever
-- read and written whole, and a sitting has no meaning outside its attempt. Each
-- sitting's answers are the size paper_results already allows, so the check below
-- is seven of those plus room for the rest.
--
-- AN UPDATE POLICY, UNLIKE paper_results: an attempt grows as each paper is sat.
-- A DELETE POLICY: giving up on an unfinished attempt removes it.
--
-- THE SCORE IS WRITTEN BY THE STUDENT'S OWN DEVICE, like every other number under
-- own-row RLS. Nothing ranks on it. Revisit before anything rewards it.
-- ============================================================================

begin;

create table if not exists public.simulation_attempts (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  id          text not null check (char_length(id) between 1 and 100),
  started_at  timestamptz not null,
  updated_at  timestamptz not null,
  finished_at timestamptz,
  -- A run an admin started with some papers missing. Never shown as a real result.
  test        boolean not null default false,
  sittings    jsonb not null default '[]'::jsonb
              check (jsonb_typeof(sittings) = 'array' and pg_column_size(sittings) <= 524288),
  primary key (user_id, id)
);

create index if not exists simulation_attempts_user_time_idx
  on public.simulation_attempts (user_id, started_at desc);

alter table public.simulation_attempts enable row level security;

drop policy if exists "simulation_attempts: read own" on public.simulation_attempts;
create policy "simulation_attempts: read own"
  on public.simulation_attempts for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "simulation_attempts: insert own" on public.simulation_attempts;
create policy "simulation_attempts: insert own"
  on public.simulation_attempts for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "simulation_attempts: update own" on public.simulation_attempts;
create policy "simulation_attempts: update own"
  on public.simulation_attempts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "simulation_attempts: delete own" on public.simulation_attempts;
create policy "simulation_attempts: delete own"
  on public.simulation_attempts for delete to authenticated
  using ((select auth.uid()) = user_id);

commit;
