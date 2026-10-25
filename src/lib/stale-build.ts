/**
 * A page left open across a deploy asks for files that no longer exist.
 *
 * Every split route (and KaTeX, MathLive, the Supabase SDK…) is a hashed chunk
 * fetched on first use. A deploy renames them all and the old names stop being
 * served from the production domain, so a student who opened the app before
 * the deploy and taps a screen they have not visited yet gets "Failed to fetch
 * dynamically imported module", which the error boundary showed as a crash.
 * Phones keep the app open for days, so this is ordinary, not rare. The same
 * thing happens on `vite dev` after the server restarts under a sleeping tab.
 *
 * The cure is a reload, which picks up the new build. This does it once, by
 * itself, so the student lands on the new version instead of an error screen.
 *
 * Two guards, because a reload that cannot help must never loop:
 *  - OFFLINE: a missing chunk there is the network, not a deploy, and a reload
 *    would only swap the error for the offline page. The boundary's error
 *    screen (with its own Reload button) is the honest answer.
 *  - ONCE PER RELOAD_WINDOW_MS: stamped in sessionStorage, so if the fresh
 *    page fails the same way (a broken deploy, a real 404) the second failure
 *    shows the error screen rather than reloading forever. No storage, no
 *    stamp, no automatic reload: without the guard it is not safe.
 *
 * Reached from three places: the `vite:preloadError` event (production builds,
 * every dynamic import, React.lazy or not), the error boundary (catches the
 * same failure in dev, where there is no preload helper), and telemetry, which
 * stays quiet about failures a reload is already fixing.
 */

const STAMP_KEY = "brachnha-stale-reload";
const RELOAD_WINDOW_MS = 30_000;

let reloading = false;

/** Chrome, Firefox and Safari word a failed dynamic import differently. */
export function isChunkLoadError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? "");
  return /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS/i.test(
    message
  );
}

/** True while a reload this module started is under way. */
export function isReloadingForNewBuild(): boolean {
  return reloading;
}

/**
 * Reloads the page if that is safe, and says whether it did. A second call in
 * the same page load answers true without reloading again.
 */
export function reloadForNewBuild(): boolean {
  if (reloading) return true;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return false;
  try {
    const last = Number(sessionStorage.getItem(STAMP_KEY) ?? 0);
    if (Date.now() - last < RELOAD_WINDOW_MS) return false;
    sessionStorage.setItem(STAMP_KEY, String(Date.now()));
  } catch {
    return false;
  }
  reloading = true;
  window.location.reload();
  return true;
}

let installed = false;

/** Called once from main.tsx. Vite fires this event in built code only. */
export function installStaleBuildReload(): void {
  if (installed) return;
  installed = true;
  window.addEventListener("vite:preloadError", () => {
    // Not preventDefault: the import still rejects as it would have, so
    // nothing downstream is handed an undefined module while the page goes.
    reloadForNewBuild();
  });
}
