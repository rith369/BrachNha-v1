import { Wordmark } from "@/components/shell/wordmark";

/**
 * Shown while the session is being resolved.
 *
 * ── Who actually sees this ────────────────────────────────────────────────
 *
 * Almost nobody, and that is deliberate. The gate in app-shell.tsx renders it
 * ONLY for a student who has no local profile and has not chosen guest — i.e.
 * someone who would be looking at the entry screen anyway. A returning student
 * gets the app immediately and the session resolves behind it.
 *
 * That restraint is the whole design. Gating the whole tree on "loading" would
 * put a dynamic import — and, for an expired token, a network round trip — in
 * front of first paint for every returning student, on an app whose entry chunk
 * was got to 183KB on purpose and whose audience is on Cambodian mobile data.
 * See the comment at the top of lib/supabase.ts.
 *
 * No spinner: this resolves in a few hundred milliseconds and a spinner that
 * flashes for one frame reads worse than a still logo. Same reasoning as the
 * `<Suspense fallback={null}>` on every lazy route.
 */
export function AuthSplash() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-bg px-6">
      <Wordmark
        subtitle={
          <div className="text-xs font-bold text-muted">Bac II Quest</div>
        }
      />
    </div>
  );
}
