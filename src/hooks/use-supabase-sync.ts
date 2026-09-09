import { useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useBrachNhaStore } from "@/lib/store";
import {
  fetchRemoteSnapshot,
  pullRemoteState,
  pushLocalState,
} from "@/lib/supabase-sync";

/**
 * Keeps a signed-in student's study data backed up, and does nothing else.
 *
 * Mounted once, from AppShell. It renders nothing, returns nothing, and no
 * screen reads from it — which is the point. If Supabase is unconfigured, the
 * project is unreachable, or the student is a guest, this hook stops and the
 * app behaves exactly as it did before Supabase existed.
 *
 * ── Identity: Google only, since real login landed ────────────────────────
 *
 * This used to call signInAnonymously() for anybody with a name in the store,
 * so every student silently got an auth.users row and every screenshot run
 * created a hundred more. Both are gone. A session now comes from one place —
 * the student pressing "Continue with Google" — and hooks/use-auth-session.ts
 * owns it. This hook only reads the resolved identity out of the store.
 *
 * A GUEST THEREFORE SYNCS NOTHING, and that is the honest meaning of having no
 * account: their work lives in localStorage, which is where the live copy has
 * always been anyway.
 *
 * ── The pull/push decision ────────────────────────────────────────────────
 *
 * `pushLocalState` writes a FULL DESTRUCTIVE SNAPSHOT — it deletes server
 * conversations absent from the local list and overwrites xp/level/coins/
 * streak. That was safe while anonymous auth guaranteed one device was one
 * account. With Google it is not: a student who taps "Continue as Guest" on a
 * school computer, does a lesson, then signs in, would have pushed that empty
 * account straight over the one on their phone.
 *
 * So the decision keys on `syncedUserId` — the account this DEVICE last synced
 * with — rather than on whether the store happens to be empty:
 *
 *   same account as last time  → push, as before
 *   new account, empty device  → pull (a reinstall, or a second device)
 *   new account, blank server  → push (first sign-in; upload what they have)
 *   new account, both have data → ASK. Nothing is written either way until the
 *                                 student picks, in AccountConflictView.
 */

/** How long the store has to stay still before a push goes out. Generous on
 *  purpose: a streamed KruAI reply fires an update per chunk, and pushing each
 *  one would mean hundreds of writes for a single answer. */
const PUSH_DEBOUNCE_MS = 2_500;

/** ...but a stream can outrun the debounce indefinitely, so a push also goes
 *  out this long after the FIRST unsaved change no matter what. Without it, a
 *  student whose app never sits still for 2.5s would never be backed up. */
const PUSH_MAX_WAIT_MS = 15_000;

type StoreState = ReturnType<typeof useBrachNhaStore.getState>;

/**
 * Pushes are SERIALIZED and COALESCED through here, module-wide.
 *
 * Two things can start a push — the identity effect and the debounced store
 * subscription — and until this existed the only guard was a `flushing` boolean
 * local to one of them. That matters because `pushConversations` clears a
 * conversation's messages and re-inserts them: two pushes interleaving there
 * can land a delete after the other's insert and drop a reply.
 *
 * Coalesced rather than queued: a push always writes the CURRENT full snapshot,
 * so a second request arriving mid-push does not need its own round trip — it
 * only needs the running one to go again afterwards with fresher state. The
 * do/while is what guarantees the LAST requested push always sees the latest
 * store, rather than being dropped as a duplicate.
 */
let pushRunning = false;
let pushQueued = false;

async function runPush(userId: string): Promise<void> {
  if (pushRunning) {
    pushQueued = true;
    return;
  }
  pushRunning = true;
  try {
    do {
      pushQueued = false;
      await pushLocalState(userId, useBrachNhaStore.getState());
    } while (pushQueued);
  } finally {
    pushRunning = false;
  }
}

/**
 * Is this a change worth a network request?
 *
 * Exactly the fields the store persists, minus the UI flags it excludes —
 * opening the drawer or the chat is not study data and must not cost a write.
 * Reference comparison is enough because every action in store.ts replaces the
 * objects it touches rather than mutating them.
 *
 * Keep this in step with `partializeState` in lib/store.ts: a persisted field
 * missing here is a field that silently never reaches the server. TWO persisted
 * fields are deliberately absent — `guestMode` and `syncedUserId` — and
 * partializeState says why at its own definition.
 */
function syncRelevantChange(a: StoreState, b: StoreState): boolean {
  return (
    a.userName !== b.userName ||
    a.userEmail !== b.userEmail ||
    a.userAge !== b.userAge ||
    a.userLocation !== b.userLocation ||
    a.userLanguage !== b.userLanguage ||
    a.lang !== b.lang ||
    a.theme !== b.theme ||
    a.surveyed !== b.surveyed ||
    a.userData !== b.userData ||
    a.pendingPlacementTests !== b.pendingPlacementTests ||
    a.commitment !== b.commitment ||
    a.pledgeSeen !== b.pledgeSeen ||
    a.xp !== b.xp ||
    a.level !== b.level ||
    a.coins !== b.coins ||
    a.streak !== b.streak ||
    a.tasks !== b.tasks ||
    // No column of its own — daily_activity keys on activity_date, which the
    // push derives itself. Listed anyway to keep the one-to-one with
    // partializeState that the comment above promises, so the next person
    // auditing the two lists finds them the same length.
    a.tasksDate !== b.tasksDate ||
    a.examResults !== b.examResults ||
    a.completedSessions !== b.completedSessions ||
    a.conversations !== b.conversations ||
    a.activeConversationId !== b.activeConversationId
  );
}

/** Does this device hold work worth protecting? A name is the marker the rest
 *  of the app already uses for "someone has been here"; xp/completedSessions
 *  catch a student who got as far as doing a lesson before filling anything in. */
function deviceHasWork(s: StoreState): boolean {
  return (
    s.userName !== "" ||
    s.xp > 0 ||
    s.completedSessions.length > 0 ||
    s.conversations.length > 0
  );
}

export function useSupabaseSync() {
  // The resolved identity, from use-auth-session.ts.
  //
  // A STRING, not the AuthUser object: the auth listener builds a fresh object
  // on every event, and TOKEN_REFRESHED fires roughly hourly while the
  // visibility handler re-ticks on every tab focus. Depending on the object
  // would fire a full destructive push — including the delete-and-reinsert of
  // every conversation's messages — every time a student switched tabs.
  const userId = useBrachNhaStore((s) => s.authUser?.id ?? null);
  const setSyncedUserId = useBrachNhaStore((s) => s.setSyncedUserId);
  const setAccountConflict = useBrachNhaStore((s) => s.setAccountConflict);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    // No session means no backup. A guest is not an error state.
    if (!userId) return;

    let cancelled = false;

    void (async () => {
      const state = useBrachNhaStore.getState();

      // The ordinary case: this device already belongs to this account.
      if (state.syncedUserId === userId) {
        await runPush(userId);
        return;
      }

      // A different account than this device last synced with — a first
      // sign-in, a second device, or a shared computer. Nothing may be written
      // until we know which side has what.
      if (!deviceHasWork(state)) {
        // Nothing local to lose, so adopt whatever the account holds. This is
        // the reinstall / second-device path, and it is why signing in on a new
        // phone restores a student's work.
        await pullRemoteState(userId);
        if (cancelled) return;
        setSyncedUserId(userId);
        return;
      }

      const remote = await fetchRemoteSnapshot(userId);
      if (cancelled) return;

      if (!remote) {
        // A brand-new account: handle_new_user() made the row, nothing has ever
        // filled it in. Upload what the student built up as a guest — the whole
        // point of being able to sign in later.
        setSyncedUserId(userId);
        await runPush(userId);
        return;
      }

      // Both sides have real work and they are not the same account. This is
      // the case that used to destroy data silently. Ask.
      setAccountConflict({
        userId,
        local: {
          name: state.userName,
          level: state.level,
          xp: state.xp,
          streak: state.streak,
        },
        remote,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, setSyncedUserId, setAccountConflict]);

  // ── the ongoing backup ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let debounceTimer: number | undefined;
    let maxWaitTimer: number | undefined;

    const clearTimers = () => {
      if (debounceTimer !== undefined) clearTimeout(debounceTimer);
      if (maxWaitTimer !== undefined) clearTimeout(maxWaitTimer);
      debounceTimer = undefined;
      maxWaitTimer = undefined;
    };

    const arm = () => {
      if (debounceTimer !== undefined) clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => void flush(), PUSH_DEBOUNCE_MS);

      // Started on the first unsaved change and left alone by later ones, so it
      // measures age-of-oldest-change rather than restarting like the debounce.
      if (maxWaitTimer === undefined) {
        maxWaitTimer = window.setTimeout(() => void flush(), PUSH_MAX_WAIT_MS);
      }
    };

    // One push at a time — that guard lives in runPush, at module scope,
    // because it has to cover the identity effect too and a local boolean here
    // never could.
    const flush = async () => {
      const s = useBrachNhaStore.getState();

      // "loading" is NOT "signed out". The SDK import can easily outlast the
      // 2.5s debounce on mobile data, and clearing the timers on that branch
      // would cancel the push with nothing left to re-arm it — the student's
      // work would sit unsaved until they happened to change something else.
      if (s.authStatus === "loading") {
        arm();
        return;
      }

      clearTimers();
      // A guest, or a conflict still waiting on the student: either way there
      // is no account this snapshot may be written to.
      if (!s.authUser || s.accountConflict) return;
      if (s.syncedUserId !== s.authUser.id) return;

      await runPush(s.authUser.id);
    };

    const unsubscribe = useBrachNhaStore.subscribe((state, prev) => {
      if (!syncRelevantChange(state, prev)) return;
      // Cheap pre-filter only; flush() re-checks against fresher state.
      if (!state.authUser && state.authStatus === "ready") return;
      arm();
    });

    // A phone browser can discard a backgrounded tab without warning and never
    // fire unload, so `hidden` is the last reliable moment to write. Anything
    // still sitting in the debounce goes now.
    const onHidden = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    document.addEventListener("visibilitychange", onHidden);

    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      clearTimers();
      unsubscribe();
    };
    // Mounted once. Everything time-varying — the session, the conflict, the
    // synced account — is read through getState() inside flush(), so that the
    // store subscription is not torn down and rebuilt on every auth event.
  }, []);
}
