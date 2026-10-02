import { getSupabase, isSupabaseConfigured } from "./supabase";
import { signOutAccount } from "./auth";
import { deleteCompetitionFolder, deleteUserFolder } from "./competition-photos";
import { useBrachNhaStore } from "./store";
import type { FailReason, Result } from "./competitions";

/** One competition a student took part in, and whether they created it. */
export interface PhotoFolder {
  competitionId: string;
  /** The creator's competitions go away with them, joiners' attempts included,
   *  so for those the WHOLE competition folder is cleared, joiners' photos too. */
  created: boolean;
}

/**
 * Remove one student's battle photos, folder by folder, BEFORE their account is
 * deleted. Shared by "Delete my account" below and the admin delete in
 * lib/admin-tools.ts.
 *
 * Photos have no foreign key, so the account delete cannot reach them. IF ANY
 * FOLDER FAILS, STOP: deleting the account then would leave photos of a
 * student's handwriting with nothing left pointing at them.
 *
 * A competition the student CREATED is cleared WHOLE: it is deleted with them,
 * and every joiner's attempt with it, so the joiners' photos would otherwise be
 * left with nothing pointing at them. Both callers may do that: an admin through
 * the admin Storage policies, a student through "creator delete"
 * (20261002000003), which lets a creator remove any file in their own
 * competition's folder. For a competition they only JOINED, just their own
 * folder goes ("delete own").
 */
export async function clearPhotoFolders(
  userId: string,
  folders: PhotoFolder[]
): Promise<Result<null>> {
  for (const f of folders) {
    const removed = f.created
      ? await deleteCompetitionFolder(f.competitionId)
      : await deleteUserFolder(f.competitionId, userId);
    if (!removed.ok) return removed;
  }
  return { ok: true, data: null };
}

/**
 * "Delete my account", from Profile.
 *
 * THREE STEPS, IN THIS ORDER, and the order is the whole design:
 *
 *  1. FIND every competition the student took part in: the ones they created
 *     and the ones they joined, from the server and from this device. This has
 *     to happen first because those rows are the only record of where their
 *     photos are, and step 3 deletes them.
 *  2. REMOVE their photos through the Storage API (clearPhotoFolders above):
 *     their own folder in a competition they joined, the WHOLE folder of one
 *     they created. Supabase refuses a direct SQL delete on storage. If any
 *     folder fails, stop and let the student try again.
 *  3. CALL delete_my_account() (20261001000002), which deletes the auth user;
 *     every table cascades from it.
 *
 * Then the session is dropped and the store reset, which returns the app to the
 * entry screen. What stays on the device is only device settings (theme, the
 * intro having been seen), the same as after Logout.
 */
export async function deleteMyAccount(): Promise<Result<null>> {
  if (!isSupabaseConfigured) return { ok: false, reason: "unconfigured" };
  const db = await getSupabase();
  if (!db) return { ok: false, reason: "unconfigured" };

  const { data } = await db.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) return { ok: false, reason: "unauthenticated" };

  const fail = (reason: FailReason): Result<null> => ({ ok: false, reason });

  // 0. The owner's account cannot be deleted from the app (20261002000002).
  //    delete_my_account() refuses it too, but only at step 3, after the
  //    photos are gone, so ask first. Profile hides the button for the owner;
  //    this is for a screen that was open before the role was set.
  const owner = await db.rpc("has_role", { p_role: "owner" });
  if (owner.error || owner.data === true) return fail("failed");

  // 1. Every competition this student is in, and which of them they created.
  //    The store's `competitions` are the ones this student created; one that
  //    never reached the server has no photos, so clearing it finds nothing.
  const createdIds = new Set<string>();
  const joinedIds = new Set<string>();
  const created = await db.from("competitions").select("id").eq("creator_id", uid);
  const joined = await db
    .from("competition_attempts")
    .select("competition_id")
    .eq("user_id", uid);
  if (created.error || joined.error) return fail("failed");
  const local = useBrachNhaStore.getState();
  for (const r of created.data) createdIds.add(r.id);
  for (const c of local.competitions) createdIds.add(c.id);
  for (const r of joined.data) joinedIds.add(r.competition_id);
  for (const a of local.competitionAttempts) joinedIds.add(a.competitionId);

  // 2. Their photos, one folder at a time (a handful at most). A competition
  //    they created is cleared whole, joiners' photos included.
  const folders: PhotoFolder[] = [
    ...[...createdIds].map((competitionId) => ({ competitionId, created: true })),
    ...[...joinedIds]
      .filter((id) => !createdIds.has(id))
      .map((competitionId) => ({ competitionId, created: false })),
  ];
  const cleared = await clearPhotoFolders(uid, folders);
  if (!cleared.ok) return fail("failed");

  // 3. The account, and with it every row.
  const { error } = await db.rpc("delete_my_account");
  if (error) {
    if (import.meta.env.DEV) console.warn("[account-deletion]", error.message);
    return fail("failed");
  }

  await signOutAccount();
  useBrachNhaStore.getState().logout();
  return { ok: true, data: null };
}
