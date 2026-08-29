import { useEffect, useRef } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { useBrachNhaStore } from "@/lib/store";
import {
  pullRemoteState,
  pushLocalState,
  resetSyncCache,
} from "@/lib/supabase-sync";

/**
 * Keeps the account signed in and the store backed up, and does nothing else.
 *
 * Mounted once, from AppShell. It renders nothing, returns nothing, and no
 * screen reads from it — which is the point. If Supabase is unconfigured, the
 * project is unreachable, or anonymous sign-in is turned off, this hook logs
 * and stops, and the app behaves exactly as it did before Supabase existed.
 *
 * ── Identity ──────────────────────────────────────────────────────────────
 *
 * Sign-in is ANONYMOUS, and that is what lets the login screen stay untouched.
 * BrachNha's "login" asks for a name and a language; it has never been an
 * authentication step and turning it into one would be a product change nobody
 * asked for. signInAnonymously() mints a real auth.users row with no email and
 * no password, so auth.uid() exists, every RLS policy works, and the student
 * sees no difference at all.
 *
 * The upgrade path is deliberate rather than accidental: calling
 * supabase.auth.updateUser({ email }) later converts that same anonymous user
 * into a permanent one, keeping the uid and therefore every row already written
 * against it. Nothing in the schema or the sync layer changes when that day
 * comes — this hook is the only file that would.
 *
 * ANONYMOUS SIGN-INS MUST BE ENABLED for any of this to do anything:
 * Supabase dashboard → Authentication → Sign In / Providers → Anonymous
 * sign-ins. It is off by default. With it off, signInAnonymously() returns a
 * 422 and this hook takes the same path as "no network".
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
type Client = NonNullable<Awaited<ReturnType<typeof getSupabase>>>;

/**
 * The one in-flight anonymous sign-in, shared across effect runs.
 *
 * React StrictMode mounts every effect TWICE in development, and both passes
 * get past `getSession()` — which correctly answers "no session" to both —
 * before the first sign-in request comes back. Without this guard, one page
 * load creates TWO anonymous users. Only the second keeps a session, so the
 * first is an orphan: no profile data is ever pushed to it, and it sits in the
 * Authentication board forever as a blank row.
 *
 * Module scope rather than a ref on purpose: the two StrictMode passes have
 * different refs, and the whole point is that they share one request.
 *
 * Cleared on failure so a later attempt can retry, and on sign-out so the next
 * student on this device does not get handed the previous one's resolved id.
 */
let signInInFlight: Promise<string | null> | null = null;

function signInAnonymouslyOnce(db: Client): Promise<string | null> {
  signInInFlight ??= db.auth
    .signInAnonymously()
    .then(({ data, error }) => {
      if (error) {
        signInInFlight = null;
        console.warn(
          `[sync] anonymous sign-in failed: ${error.message}. ` +
            "Enable it under Authentication → Providers → Anonymous sign-ins. " +
            "The app keeps working locally either way."
        );
        return null;
      }
      return data.user?.id ?? null;
    })
    .catch((err: unknown) => {
      signInInFlight = null;
      console.warn("[sync] anonymous sign-in failed:", err);
      return null;
    });

  return signInInFlight;
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
 * missing here is a field that silently never reaches the server.
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
    a.examResults !== b.examResults ||
    a.completedSessions !== b.completedSessions ||
    a.conversations !== b.conversations ||
    a.activeConversationId !== b.activeConversationId
  );
}

export function useSupabaseSync() {
  // A boolean, not the name itself: this effect cares whether someone is logged
  // in, and re-running it on every keystroke of a name change would be noise.
  const hasName = useBrachNhaStore((s) => s.userName !== "");

  // Distinguishes "first look at a browser that already has credentials" from
  // "the store was just cleared". Both are `hasName === false` with a live
  // session, and they need opposite handling — pull vs sign out.
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    void (async () => {
      // Pulls the SDK chunk on first use. Deliberately inside the effect rather
      // than at module scope, so it is fetched after first paint instead of
      // before it — see lib/supabase.ts.
      const db = await getSupabase();
      if (!db || cancelled) return;

      const {
        data: { session },
      } = await db.auth.getSession();
      if (cancelled) return;

      const isFirstRun = !bootstrapped.current;
      bootstrapped.current = true;

      if (!hasName) {
        if (!session) return;
        if (isFirstRun) {
          // Credentials but no study data: a cleared cache or a reinstall, not
          // a logout. Adopt whatever the server still holds rather than
          // stranding the student on a fresh Login screen with their account
          // sitting right there.
          await pullRemoteState(session.user.id);
        } else {
          // The store emptied while this hook was already running, which only
          // logout() does. End the session too — otherwise the next student on
          // this device signs straight back into the previous one's account.
          await db.auth.signOut();
          resetSyncCache();
          signInInFlight = null;
        }
        return;
      }

      const userId = session?.user.id ?? (await signInAnonymouslyOnce(db));

      if (cancelled || !userId) return;
      await pushLocalState(userId, useBrachNhaStore.getState());
    })();

    return () => {
      cancelled = true;
    };
  }, [hasName]);

  // ── the ongoing backup ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let debounceTimer: number | undefined;
    let maxWaitTimer: number | undefined;
    let flushing = false;

    const clearTimers = () => {
      if (debounceTimer !== undefined) clearTimeout(debounceTimer);
      if (maxWaitTimer !== undefined) clearTimeout(maxWaitTimer);
      debounceTimer = undefined;
      maxWaitTimer = undefined;
    };

    const flush = async () => {
      clearTimers();
      // One push at a time. A push is several round trips, and two overlapping
      // ones would race on the same rows for no benefit — the second would only
      // ever write what the first was already writing.
      if (flushing) return;
      const state = useBrachNhaStore.getState();
      if (!state.userName) return;

      flushing = true;
      try {
        const db = await getSupabase();
        if (!db) return;
        const {
          data: { session },
        } = await db.auth.getSession();
        if (session) await pushLocalState(session.user.id, state);
      } finally {
        flushing = false;
      }
    };

    const unsubscribe = useBrachNhaStore.subscribe((state, prev) => {
      if (!syncRelevantChange(state, prev)) return;
      if (!state.userName) return;

      if (debounceTimer !== undefined) clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => void flush(), PUSH_DEBOUNCE_MS);

      // Started on the first unsaved change and left alone by later ones, so it
      // measures age-of-oldest-change rather than restarting like the debounce.
      if (maxWaitTimer === undefined) {
        maxWaitTimer = window.setTimeout(() => void flush(), PUSH_MAX_WAIT_MS);
      }
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
  }, []);
}
