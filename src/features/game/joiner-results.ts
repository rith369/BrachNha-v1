import { useEffect, useSyncExternalStore } from "react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { fetchAttemptsFor, type JoinerAttempt } from "@/lib/competitions";

/**
 * Who has played the competitions THIS student created, for the hub.
 *
 * THE BUG THIS FIXES. Every card on /game read only the store, and the store
 * only ever holds this student's OWN runs: the competitions they created and
 * the attempts they made at other people's. A joiner's attempt is written by
 * the joiner's device, straight to the server, so the creator's phone never
 * heard about it. The creator's hub said "Waiting for a joiner" forever, and
 * only the competition's review page (which fetches) knew better.
 *
 * So the hub asks, once per visit: every attempt at this student's SHARED
 * competitions (a competition that never reached the server cannot have been
 * played). The read policy on competition_attempts already limits the answer to
 * competitions the caller created, so this is the same call the review page
 * makes, just for all of them at once.
 *
 * A MODULE, NOT A STORE FIELD, for the same reason lib/admin-status.ts is one:
 * the server is the only source of these rows, and they are refetched on every
 * visit, so persisting them would only add a copy that can go stale. Keeping the
 * last answer in module scope means a second visit in the same session paints
 * with it at once instead of flashing "Waiting for a joiner" first. Keyed by
 * user id, so switching accounts never shows the previous account's joiners.
 *
 * Offline, a guest, or Supabase unconfigured: an empty list, and the hub looks
 * exactly as it did before. Nothing here blocks first paint.
 */

interface State {
  userId: string | null;
  results: JoinerAttempt[];
}

const EMPTY: JoinerAttempt[] = [];
let state: State = { userId: null, results: EMPTY };
let inFlight: string | null = null;
const listeners = new Set<() => void>();

function emit(next: State) {
  state = next;
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function load(userId: string, ids: string[]) {
  const key = `${userId}|${ids.join(",")}`;
  if (inFlight === key) return;
  inFlight = key;
  void (async () => {
    const res = await fetchAttemptsFor(ids);
    if (inFlight !== key) return;
    inFlight = null;
    // A failure keeps whatever this account had already, rather than wiping a
    // correct list because the network blinked.
    if (res.ok) emit({ userId, results: res.data });
  })();
}

/** Every joiner's run at this student's shared competitions, best first. */
export function useJoinerResults(): JoinerAttempt[] {
  const { userId, idsKey } = useBrachNhaStore(
    useShallow((s) => ({
      userId: s.authUser?.id ?? null,
      idsKey: s.competitions
        .filter((c) => c.sharedAt)
        .map((c) => c.id)
        .join(","),
    }))
  );

  // Runs on every visit to the hub (a fresh mount), so a joiner who played
  // while the student was elsewhere shows up the next time they open it.
  useEffect(() => {
    if (!userId || !idsKey) return;
    load(userId, idsKey.split(","));
  }, [userId, idsKey]);

  const snapshot = useSyncExternalStore(subscribe, () => state);
  return userId && snapshot.userId === userId && idsKey ? snapshot.results : EMPTY;
}
