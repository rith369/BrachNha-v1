import { useEffect } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { useBrachNhaStore } from "@/lib/store";
import { resetSyncCache } from "@/lib/supabase-sync";
import { clearAuthPending, hasAuthTraces, userFromSession } from "@/lib/auth";

/**
 * Resolves who is signed in, and keeps it resolved.
 *
 * Mounted once, from AppShell, beside useSupabaseSync(). It is the ONLY
 * onAuthStateChange subscriber in the app — the sync hook used to keep a second
 * one, and two listeners for one event stream is how they drift.
 *
 * ── Why subscribe only, with no getSession() ──────────────────────────────
 *
 * onAuthStateChange emits INITIAL_SESSION to every new subscriber once the
 * client has initialised, carrying the session or null. So `getSession()` AND
 * subscribing is a double read of the same fact with a race between them.
 * Subscribing alone is strictly simpler and cannot disagree with itself.
 *
 * The catch: INITIAL_SESSION MUST be handled. Miss it and authStatus never
 * leaves "loading" for a browser whose stored session is stale and fails to
 * refresh — a permanent splash screen with nothing in the console.
 */

/**
 * A legacy anonymous session is signed out at most once per page load.
 *
 * Module scope, not a ref: React StrictMode mounts this effect twice in
 * development and each pass gets its own ref, which is exactly the failure the
 * old signInInFlight guard existed to prevent. This is the same shape for the
 * opposite operation.
 */
let anonSignOutDone = false;

/** How long to wait for the SDK before assuming there is no session.
 *  Only reachable for a student with stored auth traces and no local profile —
 *  a fresh sign-in, or a cleared cache. They land on the entry screen and can
 *  tap Google again, which is a far better outcome than an endless splash. */
const RESOLVE_TIMEOUT_MS = 8_000;

export function useAuthSession() {
  const setAuthSession = useBrachNhaStore((s) => s.setAuthSession);

  useEffect(() => {
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | undefined;
    let timeout: number | undefined;

    const settleEmpty = () => {
      if (cancelled) return;
      clearAuthPending();
      setAuthSession("ready", null);
    };

    // Unconfigured is a supported state, not an error — see lib/supabase.ts.
    // The app runs entirely out of localStorage and the gate in AppShell gives
    // full access, because there is no server here to hold an account.
    if (!isSupabaseConfigured) {
      settleEmpty();
      return;
    }

    // The fast path. No stored session, no OAuth parameters in the URL, no
    // pending sign-in — so there is nothing to resolve and the ~40KB SDK is
    // never downloaded. Read hasAuthTraces()'s comment before touching this:
    // getting it wrong swallows every Google callback.
    if (!hasAuthTraces()) {
      settleEmpty();
      return;
    }

    timeout = window.setTimeout(() => {
      if (useBrachNhaStore.getState().authStatus === "loading") settleEmpty();
    }, RESOLVE_TIMEOUT_MS);

    void (async () => {
      let db;
      try {
        db = await getSupabase();
      } catch (err) {
        // A failed chunk fetch (offline, a stale deploy) must not strand the
        // student on a splash screen forever.
        console.warn("[auth] could not load the Supabase client:", err);
        settleEmpty();
        return;
      }
      if (!db || cancelled) {
        if (!db) settleEmpty();
        return;
      }

      const { data } = db.auth.onAuthStateChange((event, session) => {
        if (cancelled) return;

        if (event === "SIGNED_OUT") {
          // Whoever ended it — the Profile button, an expiry, another tab
          // broadcasting over BroadcastChannel — the next account on this
          // device must not inherit this one's "already pushed" bookkeeping.
          // This moved here from the sync hook's own listener; it is the only
          // thing that catches a sign-out this app did not initiate.
          resetSyncCache();
          clearAuthPending();
          setAuthSession("ready", null);
          return;
        }

        const user = userFromSession(session);

        // userFromSession returns null for an anonymous user, so `session &&
        // !user` is exactly the legacy background-backup identity. Those were
        // never a login; sign it out so its token stops being refreshed on
        // every load, and treat the student as not signed in.
        //
        // Deferred to a fresh task: Supabase runs this callback while holding
        // its own auth lock, and calling back into the client from inside it
        // can deadlock.
        if (session && !user && !anonSignOutDone) {
          anonSignOutDone = true;
          setTimeout(() => {
            void db.auth.signOut({ scope: "local" }).catch(() => {
              // Best effort. Being unable to drop a session we already ignore
              // changes nothing the student can see.
            });
          }, 0);
        }

        clearAuthPending();
        setAuthSession("ready", user);
      });

      subscription = data.subscription;
      // The effect can be torn down while the SDK chunk is still in flight.
      if (cancelled) subscription.unsubscribe();
    })();

    return () => {
      cancelled = true;
      if (timeout !== undefined) clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, [setAuthSession]);
}
