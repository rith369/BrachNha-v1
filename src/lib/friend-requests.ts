import { useEffect, useSyncExternalStore } from "react";
import { useBrachNhaStore } from "./store";
import { getSupabase, isSupabaseConfigured } from "./supabase";

/**
 * How many friend requests are waiting for the signed-in student, for the badge
 * on the "Streak with Friends" menu row (sidebar-nav.tsx).
 *
 * A MODULE, NOT A STORE FIELD, for the reasons lib/admin-status.ts gives: it is
 * re-asked on every load rather than persisted, and both menus (the drawer and
 * the desktop sidebar) mount at once, so one shared answer means one request.
 * Keyed by user id, so switching accounts asks again. A guest asks nothing.
 *
 * The friends page reports the count it actually loaded, and every accept or
 * decline after that, through setIncomingRequests(), so the badge follows
 * without asking the server again.
 */

/** Requests waiting for this student: a head-only count through the
 *  friendships read-own policy, no names and no goal days. Null on any failure.
 *  Here rather than in lib/friends.ts because the menu is in the entry chunk
 *  and the rest of the friend calls need not be. */
async function countIncomingRequests(userId: string): Promise<number | null> {
  if (!isSupabaseConfigured) return null;
  const db = await getSupabase();
  if (!db) return null;
  const { count, error } = await db
    .from("friendships")
    .select("id", { count: "exact", head: true })
    .eq("addressee_id", userId)
    .eq("status", "pending");
  if (error) return null;
  return count ?? 0;
}

let incoming: number | null = null;
let askedFor: string | null = null;
const listeners = new Set<() => void>();

function emit(next: number | null) {
  if (next === incoming) return;
  incoming = next;
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function load(userId: string | null) {
  if (userId === askedFor) return;
  askedFor = userId;
  emit(null);
  if (!userId) return;
  void countIncomingRequests(userId).then((count) => {
    if (askedFor === userId) emit(count);
  });
}

export function setIncomingRequests(count: number) {
  if (askedFor) emit(count);
}

export function useIncomingRequests(): number | null {
  const userId = useBrachNhaStore((s) => s.authUser?.id ?? null);
  useEffect(() => {
    load(userId);
  }, [userId]);
  return useSyncExternalStore(subscribe, () => incoming);
}
