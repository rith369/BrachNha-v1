import { useEffect } from "react";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { publishCompetition } from "@/lib/competitions";

/**
 * Uploads competitions that were saved locally but never reached the server.
 *
 * WHY THIS EXISTS. The local write happens first and unconditionally, so a
 * competition survives a failed publish — offline, signed out, or (as actually
 * happened) posted before the tables existed at all. Without a retry those rows
 * sit on one device forever while the hub calls them "open for joiners", which
 * is false: nobody can see them. That was a real bug on a real account, not a
 * hypothetical.
 *
 * A DUPLICATE COUNTS AS SUCCESS. `competitions.id` is the primary key, so a
 * unique violation means the row is already up there — which is exactly what a
 * publish that succeeded moments before the app closed looks like. Treating it
 * as a failure would retry forever and never clear the label.
 *
 * `unconfigured` and `unauthenticated` STOP THE WHOLE PASS rather than failing
 * each row in turn: neither is fixed by trying the next competition, and a guest
 * browsing the hub should cost nothing.
 *
 * THE IN-FLIGHT GUARD IS MODULE-LEVEL, not a ref. StrictMode mounts every effect
 * twice in development with its own copy of any ref, and this one CREATES A
 * REMOTE ROW — the same trap that once produced two anonymous users per page
 * load (see use-supabase-sync.ts). Module scope is what makes "once per browser"
 * mean once.
 */
const inFlight = new Set<string>();

async function sharePending(
  userId: string,
  markShared: (id: string) => void
): Promise<void> {
  // Read imperatively rather than closing over the array: this runs from an
  // effect that deliberately does not depend on `competitions`, so the value at
  // call time is the one that matters.
  const pending = useBrachNhaStore
    .getState()
    .competitions.filter(
      (c) => !c.sharedAt && c.creatorId === userId && !inFlight.has(c.id)
    );

  for (const competition of pending) {
    inFlight.add(competition.id);
    try {
      const res = await publishCompetition(competition);
      if (res.ok || res.reason === "duplicate") {
        markShared(competition.id);
        continue;
      }
      // Nothing further will work on this pass. The rows stay pending and the
      // next visit tries again.
      if (res.reason === "unconfigured" || res.reason === "unauthenticated") {
        return;
      }
      // "failed" — a transient network error. Move on; this row retries later.
    } finally {
      inFlight.delete(competition.id);
    }
  }
}

/**
 * Mounted once, by the Game hub. It runs on arrival rather than on a timer:
 * that is the moment a student is looking at the list these rows belong to, and
 * a background retry loop would spend a phone's battery on a table nobody is
 * reading.
 */
export function useSharePendingCompetitions(): void {
  const { authStatus, authUserId, markCompetitionShared } = useBrachNhaStore(
    useShallow((s) => ({
      authStatus: s.authStatus,
      authUserId: s.authUser?.id ?? "",
      markCompetitionShared: s.markCompetitionShared,
    }))
  );

  useEffect(() => {
    // Wait for the session: RLS rejects an unauthenticated insert, so firing
    // early would burn the pass and mark nothing.
    if (authStatus === "loading" || !authUserId) return;
    // Not cancelled on unmount. This writes to the store, not to component
    // state, so finishing after the page closes is correct rather than a leak —
    // and abandoning a half-done pass would leave rows pending for no reason.
    void sharePending(authUserId, markCompetitionShared);
  }, [authStatus, authUserId, markCompetitionShared]);
}
