-- ============================================================================
-- BrachNha — a creator may delete the photos in their own competition
-- ============================================================================
--
-- THE GAP. A student who deletes their account on Profile takes their
-- competitions with them (cascade), and every joiner's attempt with those. The
-- joiners' photos of their working stay in the competition-work bucket, under
-- {competition}/{joiner}/…, with nothing left pointing at them: the student
-- could only remove their OWN folder ("delete own"), and only the admin delete
-- (20261002000001) could reach the rest.
--
-- THE FIX. One Storage policy: the creator of a competition may delete any file
-- in that competition's folder. "Delete my account" (src/lib/account-deletion.ts)
-- then clears the whole folder of every competition the student created, before
-- the account goes.
--
-- WHY THIS IS NOT A NEW POWER. A creator can already delete their whole
-- competition ("competitions: delete own", 20260913000001), which deletes every
-- joiner's attempt with it, and can already VIEW every joiner's photos in it
-- (the read policy, 20260916000002). Deleting those photos is strictly less than
-- either. Joiners still cannot touch each other's photos, or the creator's.
--
-- It reads public.competitions, never storage.objects, so the recursion trap
-- recorded in 20260916000003 cannot happen.
--
-- Re-runnable.
-- ============================================================================

drop policy if exists "competition work: creator delete" on storage.objects;
create policy "competition work: creator delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'competition-work'
    and exists (
      select 1 from public.competitions c
      where c.id = (storage.foldername(name))[1]
        and c.creator_id = (select auth.uid())
    )
  );
