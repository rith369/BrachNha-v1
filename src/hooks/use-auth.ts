import { useBrachNhaStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { AuthFeature, AuthStatus, AuthUser } from "@/types";

/**
 * Everything the UI asks about who the student is.
 *
 * One place, so protecting another feature later is a call rather than a new
 * piece of auth reasoning. See CLAUDE.md's auth section for the state model.
 */

export interface AuthInfo {
  status: AuthStatus;
  user: AuthUser | null;
  /** A REAL, non-anonymous Supabase session exists. The only honest answer to
   *  "is this student authenticated". */
  isAuthenticated: boolean;
  /** Chose to look around without an account. */
  isGuest: boolean;
  /**
   * May this student use the account-only features?
   *
   * `isAuthenticated`, OR Supabase is not configured at all. That second half
   * is not a loophole — with no project there is no account to have, no server
   * to protect and no AI credits to spend (the endpoint refuses to run
   * unverified in production). It is the same degradation the mentor already
   * does for a missing GEMINI_API_KEY, and it is what keeps `npm run preview`,
   * a fresh fork and scripts/shots.mjs working exactly as they did before.
   */
  hasFullAccess: boolean;
}

/**
 * Built from single-field selectors rather than one object selector.
 *
 * A selector returning `{ ... }` is the documented Zustand infinite-loop bug —
 * a new object every render breaks reference equality. `useShallow` would fix
 * it; separate primitive selectors avoid the question and are cheaper, since
 * each subscribes to one field instead of re-running on any of four.
 */
export function useAuth(): AuthInfo {
  const status = useBrachNhaStore((s) => s.authStatus);
  const user = useBrachNhaStore((s) => s.authUser);
  const guestMode = useBrachNhaStore((s) => s.guestMode);

  const isAuthenticated = user !== null;

  return {
    status,
    user,
    isAuthenticated,
    isGuest: !isAuthenticated && guestMode,
    hasFullAccess: isAuthenticated || !isSupabaseConfigured,
  };
}

/**
 * The guard. `requireAuth("chat")` returns true to proceed, or opens the login
 * prompt and returns false.
 *
 * ── The returned function reads the store IMPERATIVELY, and must keep doing so ──
 *
 * This is the React Compiler hazard CLAUDE.md documents at length. If the
 * closure read a selector value — `if (authUser.id)`, say — the compiler would
 * narrow its memo dependency to that property path and emit the check
 * `$[n] !== authUser.id` at the point the closure is BUILT, which is here, in
 * the hook body, with no guard above it. `authUser` is legitimately null for
 * every guest, so that check throws on the home screen for exactly the people
 * this hook exists to serve. Neither tsc nor oxlint can see it.
 *
 * getState() also removes the stale-closure question: the answer is read when
 * the button is tapped, not when the component last rendered.
 */
export function useRequireAuth(): (feature: AuthFeature) => boolean {
  const openAuthPrompt = useBrachNhaStore((s) => s.openAuthPrompt);

  return (feature: AuthFeature): boolean => {
    if (!isSupabaseConfigured) return true;

    const { authStatus, authUser } = useBrachNhaStore.getState();
    if (authUser) return true;

    // Still resolving. Do NOT nag — a returning student renders the app before
    // the session lands (see the gate in app-shell.tsx), and a login prompt
    // thrown at someone who is in fact signed in is worse than a moment's
    // optimism. The server verifies the token regardless, so nothing protected
    // actually runs on this branch.
    if (authStatus === "loading") return true;

    openAuthPrompt(feature);
    return false;
  };
}

/**
 * The name to greet the student by.
 *
 * A guest has no `userName` on purpose — writing a placeholder into the store
 * would push it to profiles.display_name, put it on the leaderboard and
 * pre-fill it into the pledge signature, and survive a later Google sign-in.
 * The fallback belongs at render time, in one place, which is here.
 */
export function useDisplayName(): string {
  const lang = useBrachNhaStore((s) => s.lang);
  const userName = useBrachNhaStore((s) => s.userName);
  // A primitive, so the selector's reference check is stable.
  const googleName = useBrachNhaStore((s) => s.authUser?.name ?? "");

  return userName || googleName || (lang === "en" ? "Guest" : "ភ្ញៀវ");
}
