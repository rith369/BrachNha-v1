import { getSupabase, isSupabaseConfigured } from "./supabase";
import { signOutAccount } from "./auth";
import { deleteMyFolder } from "./competition-photos";
import { useBrachNhaStore } from "./store";
import type { FailReason, Result } from "./competitions";

/**
 * "Delete my account", from Profile.
 *
 * THREE STEPS, IN THIS ORDER, and the order is the whole design:
 *
 *  1. FIND every competition the student took part in — the ones they created
 *     and the ones they joined, from the server and from this device. This has
 *     to happen first because those rows are the only record of where their
 *     photos are, and step 3 deletes them.
 *  2. REMOVE their photo folder in each, through the Storage API. Photos have no
 *     foreign key, so the account delete cannot reach them, and Supabase refuses
 *     a direct SQL delete on storage. IF ANY FOLDER FAILS, STOP: deleting the
 *     account then would leave photos of a student's handwriting with nothing
 *     left pointing at them. The student sees an error and can try again.
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

  // 1. Every competition this student is in.
  const ids = new Set<string>();
  const created = await db.from("competitions").select("id").eq("creator_id", uid);
  const joined = await db
    .from("competition_attempts")
    .select("competition_id")
    .eq("user_id", uid);
  if (created.error || joined.error) return fail("failed");
  for (const r of created.data) ids.add(r.id);
  for (const r of joined.data) ids.add(r.competition_id);
  const local = useBrachNhaStore.getState();
  for (const c of local.competitions) ids.add(c.id);
  for (const a of local.competitionAttempts) ids.add(a.competitionId);

  // 2. Their photos, one folder at a time (a handful at most).
  for (const id of ids) {
    const removed = await deleteMyFolder(id, uid);
    if (!removed.ok) return fail("failed");
  }

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
