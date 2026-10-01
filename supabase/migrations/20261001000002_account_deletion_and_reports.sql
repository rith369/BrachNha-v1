-- ============================================================================
-- BrachNha — delete my account, and report a photo
-- ============================================================================
--
-- Two safety pieces asked for before real students use the app (1 Oct 2026).
--
-- ── delete_my_account() ─────────────────────────────────────────────────────
--
-- Until now deleting an account meant emailing the team (src/pages/privacy.tsx).
-- This lets a signed-in student do it from Profile.
--
-- ONE DELETE IS ENOUGH FOR THE TABLES. Every table that holds a student's rows
-- references auth.users or profiles ON DELETE CASCADE (20260828000001,
-- 20260913000001, 20260916000001, 20260929000001, 20261001000001 and the
-- photo_reports table below), so removing the auth user removes all of them.
--
-- NOT THE PHOTOS. Files in the competition-work bucket have no foreign key, and
-- Supabase refuses a direct SQL delete on storage tables. The client therefore
-- removes the student's own folders through the Storage API FIRST
-- (src/lib/account-deletion.ts), while the competition rows that say where those
-- folders are still exist, and only then calls this function.
--
-- It takes no argument and deletes auth.uid() only, so calling it directly can
-- delete nobody but the caller.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'delete_my_account: not signed in' using errcode = '42501';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public;
revoke all on function public.delete_my_account() from anon;
grant execute on function public.delete_my_account() to authenticated;

-- ── photo_reports ───────────────────────────────────────────────────────────
--
-- A competition's "show your working" photos are seen by the other student in
-- that competition (20260916000002). Until now a student shown something
-- unpleasant could only close the screen. A report lands here; the team reviews
-- them in the dashboard and deletes the photo from Storage by hand
-- (supabase/README.md has the query). There is no automatic action: one report
-- hiding a photo for everyone would let anyone hide a classmate's work.

create table if not exists public.photo_reports (
  id             bigint generated always as identity primary key,
  reporter_id    uuid not null references auth.users (id) on delete cascade,
  competition_id text not null check (char_length(competition_id) <= 80),
  -- The same shape lib/competition-photos.ts writes and 20260916000003 checks:
  -- {competition}/{owner uuid}/{question}-{photoId}.jpg
  photo_path     text not null check (
    photo_path ~ '^[^/]{1,80}/[0-9a-f-]{36}/[0-9]{1,2}-[A-Za-z0-9]{6,40}\.jpg$'
  ),
  reason         text not null default 'inappropriate'
                 check (reason in ('inappropriate', 'not_work', 'other')),
  created_at     timestamptz not null default now(),
  -- One report per student per photo; a second tap is a no-op, not a pile-on.
  unique (reporter_id, photo_path)
);

create index if not exists photo_reports_created_idx
  on public.photo_reports (created_at desc);

alter table public.photo_reports enable row level security;

-- Insert your own report, and only about a photo you could actually see: it
-- must sit in a competition you created or joined, inside that competition's
-- folder, and not be your own. The checks read competitions and
-- competition_attempts, never photo_reports itself, so the recursion trap
-- recorded in 20260916000003 cannot happen here.
drop policy if exists "photo_reports: insert own" on public.photo_reports;
create policy "photo_reports: insert own"
  on public.photo_reports for insert
  to authenticated
  with check (
    reporter_id = (select auth.uid())
    and split_part(photo_path, '/', 1) = competition_id
    and split_part(photo_path, '/', 2) <> (select auth.uid())::text
    and (
      exists (
        select 1 from public.competitions c
        where c.id = photo_reports.competition_id and c.creator_id = (select auth.uid())
      )
      or exists (
        select 1 from public.competition_attempts a
        where a.competition_id = photo_reports.competition_id
          and a.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists "photo_reports: read own" on public.photo_reports;
create policy "photo_reports: read own"
  on public.photo_reports for select
  to authenticated
  using (reporter_id = (select auth.uid()));

-- No update and no delete policy: a report is a record of something that
-- happened, and editing one after the fact would hide that it was made.
