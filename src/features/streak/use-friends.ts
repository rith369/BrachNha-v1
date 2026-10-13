import { useEffect, useSyncExternalStore } from "react";
import { useBrachNhaStore } from "@/lib/store";
import { fetchFriends, type FriendFail, type FriendRow } from "@/lib/friends";
import { setIncomingRequests } from "@/lib/friend-requests";
import { todayKey } from "@/utils/day";

/**
 * The signed-in student's friendships, shared by the list (/streak/friends) and
 * each friend's page (/streak/friends/:friendId).
 *
 * A MODULE CACHE, so moving between the list and a friend shows what was
 * already loaded at once while a fresh copy is fetched behind it
 * (stale-while-revalidate). It is fetched on every visit and again whenever the
 * app comes back to the front, because the friend's "done today" changes on
 * THEIR phone and the only way to see it is to ask.
 *
 * Keyed by user id, so a different account never sees the previous one's
 * friends, even for a frame: a snapshot for another id reads as loading.
 */

interface Snapshot {
  userId: string | null;
  /** Rows have arrived at least once for this user. */
  loaded: boolean;
  rows: FriendRow[];
  /** The last fetch failed; rows (if any) are from an earlier one. */
  error: FriendFail | null;
}

const EMPTY: Snapshot = { userId: null, loaded: false, rows: [], error: null };

let snapshot: Snapshot = EMPTY;
let seq = 0;
const listeners = new Set<() => void>();

function emit(next: Snapshot) {
  snapshot = next;
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function refresh(userId: string) {
  if (snapshot.userId !== userId) emit({ ...EMPTY, userId });
  const token = ++seq;
  void fetchFriends(todayKey()).then((r) => {
    // A newer fetch, or another account, has taken over.
    if (token !== seq || snapshot.userId !== userId) return;
    if (r.ok) {
      emit({ userId, loaded: true, rows: r.data, error: null });
      setIncomingRequests(
        r.data.filter((f) => f.status === "pending" && !f.outgoing).length
      );
    } else {
      emit({ ...snapshot, error: r.reason });
    }
  });
}

export interface FriendsState {
  /** Nothing has arrived yet (and nothing has failed). */
  loading: boolean;
  /** The first fetch failed, so there is nothing to show. */
  failed: boolean;
  rows: FriendRow[];
  reload: () => void;
}

export function useFriends(): FriendsState {
  const userId = useBrachNhaStore((s) => s.authUser?.id ?? null);

  useEffect(() => {
    if (!userId) return;
    refresh(userId);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh(userId);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [userId]);

  const snap = useSyncExternalStore(subscribe, () => snapshot);
  const mine = userId !== null && snap.userId === userId;

  return {
    loading: !mine || (!snap.loaded && snap.error === null),
    failed: mine && !snap.loaded && snap.error !== null,
    rows: mine ? snap.rows : [],
    reload: () => {
      if (userId) refresh(userId);
    },
  };
}
