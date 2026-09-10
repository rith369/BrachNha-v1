import type { Session } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { resetSyncCache } from "@/lib/supabase-sync";

/**
 * Google sign-in, sign-out, and the one question that has to be answered
 * BEFORE the Supabase SDK is downloaded.
 *
 * The session is the ONLY proof of authentication in this app. The store's
 * `guestMode` flag says the student chose to look around without an account; it
 * grants nothing, and nothing may ever be unlocked by reading it. See the auth
 * section of CLAUDE.md.
 */

/** Where supabase-js keeps the session. Must match `storageKey` in supabase.ts. */
export const AUTH_STORAGE_KEY = "brachnha-auth";

/** Our own "a sign-in is in progress" marker, written immediately before the
 *  redirect to Google and cleared once a session resolves. See hasAuthTraces(). */
export const AUTH_PENDING_KEY = "brachnha-auth-pending";

/** The identity, flattened out of the session. Never persisted — it is
 *  re-derived from Supabase on every load, because a value sitting in
 *  localStorage is not evidence of anything. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
}

/**
 * Should we load the Supabase SDK at all?
 *
 * The SDK is ~40KB and lazily imported (see lib/supabase.ts). A student who has
 * never signed in should never pay for it, so the session bootstrap wants to
 * answer "definitely not signed in" without the import. Getting this wrong in
 * the OTHER direction is fatal, and the trap is not obvious:
 *
 *   The SDK's own _initialize() is the ONLY thing that parses an OAuth callback
 *   out of the URL, and it runs when the client is CONSTRUCTED. On the redirect
 *   back from Google there is no stored session yet — the SDK is what writes
 *   it. So "no stored session, skip the import" would swallow every single
 *   sign-in and bounce the student back to the entry screen, with nothing in
 *   the console to explain it.
 *
 * Hence three independent tells, any one of which forces the slow path:
 *
 *  1. A localStorage key STARTING WITH the auth key. A prefix scan, not an
 *     exact match: the PKCE flow parks code verifiers under suffixed keys
 *     ("brachnha-auth-code-verifier" and friends) before any session exists.
 *  2. OAuth parameters in the URL — query or hash, success or failure. The
 *     error cases matter as much as the happy one: without them a declined
 *     consent screen lands back on the entry screen saying nothing at all.
 *  3. Our own sentinel, set before the redirect. This is the version-proof one:
 *     it does not depend on the SDK's internal key layout, so an upgrade that
 *     renames its storage cannot quietly break sign-in.
 *
 * Never throws. Private-browsing and locked-down browsers make even reading
 * localStorage throw, and the right answer there is "take the slow path"
 * rather than "crash before first paint".
 */
export function hasAuthTraces(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key !== null && key.startsWith(AUTH_STORAGE_KEY)) return true;
    }
  } catch {
    return true;
  }

  const params = `${window.location.search} ${window.location.hash}`;
  return (
    params.includes("code=") ||
    params.includes("access_token=") ||
    params.includes("error=") ||
    params.includes("error_description=") ||
    params.includes("error_code=")
  );
}

function markPending(on: boolean): void {
  try {
    if (on) localStorage.setItem(AUTH_PENDING_KEY, "1");
    else localStorage.removeItem(AUTH_PENDING_KEY);
  } catch {
    // A browser that refuses storage also refuses the session, so sign-in was
    // never going to survive the redirect. Nothing to recover here.
  }
}

/** Clears the sentinel. Called once a session resolves, either way. */
export function clearAuthPending(): void {
  markPending(false);
}

/**
 * Flatten a session into the shape the app renders.
 *
 * Google puts the display name under two different metadata keys depending on
 * the payload, so both are tried before falling back to the local part of the
 * email — a student should never see an empty greeting.
 */
export function userFromSession(session: Session | null): AuthUser | null {
  if (!session) return null;
  const u = session.user;

  // An anonymous user is NOT authenticated. Those were the old background-backup
  // identity, never a login, and treating one as signed in would hand a guest
  // the mentor and the roadmap.
  if (u.is_anonymous) return null;

  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const email = u.email ?? "";

  return {
    id: u.id,
    email,
    name: str(meta.full_name) || str(meta.name) || email.split("@")[0] || "",
    avatarUrl: str(meta.avatar_url) || str(meta.picture),
  };
}

/**
 * Start the Google redirect. Resolves to an error message, or null on success —
 * though on success the page is already navigating away, so the caller's
 * success branch is mostly unreachable.
 *
 * `redirectTo` keeps the current pathname, so a student who signed in from a
 * prompt on /practice comes back to /practice rather than Home. That URL has to
 * be allowed in Supabase → Authentication → URL Configuration → Redirect URLs,
 * and a Vercel preview gets a fresh hostname on every deploy — so that list
 * needs a wildcard or OAuth fails on every preview.
 */
export async function signInWithGoogle(): Promise<string | null> {
  if (!isSupabaseConfigured) return "unconfigured";

  markPending(true);
  try {
    const db = await getSupabase();
    if (!db) {
      markPending(false);
      return "unconfigured";
    }

    const { error } = await db.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
      },
    });

    if (error) {
      markPending(false);
      console.warn("[auth] Google sign-in failed:", error.message);
      return error.message;
    }
    return null;
  } catch (err) {
    markPending(false);
    console.warn("[auth] Google sign-in failed:", err);
    return err instanceof Error ? err.message : "unknown";
  }
}

/**
 * End the session on this device, explicitly.
 *
 * `scope: "local"` rather than the default global sign-out. A global one needs
 * the network, and one that fails offline leaves the session sitting in
 * localStorage — so the next reload reads "credentials but no study data" as a
 * fresh install and pulls back the very account the student just left. It would
 * also, now that accounts are real, revoke the session on every other device
 * they own, which is not what a logout button on one phone should mean.
 *
 * Never throws — the caller's local logout has to happen either way.
 */
export async function signOutAccount(): Promise<void> {
  resetSyncCache();
  clearAuthPending();
  if (!isSupabaseConfigured) return;
  try {
    const db = await getSupabase();
    await db?.auth.signOut({ scope: "local" });
  } catch (err) {
    console.warn("[auth] sign-out failed:", err);
  }
}

/**
 * A fresh access token for the KruAI request, or null.
 *
 * Read at send time rather than held anywhere. getSession() refreshes an expired
 * token on the spot, and — more importantly — the Zustand store is persisted, so
 * a token parked in state would be written to localStorage on every unrelated
 * update. Credentials do not belong in the study-data blob.
 */
export async function getAccessToken(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const db = await getSupabase();
    if (!db) return null;
    const {
      data: { session },
    } = await db.auth.getSession();
    if (!session || session.user.is_anonymous) return null;
    return session.access_token;
  } catch (err) {
    console.warn("[auth] could not read access token:", err);
    return null;
  }
}
