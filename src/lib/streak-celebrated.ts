/**
 * The last day a streak page threw confetti for a finished daily goal.
 *
 * The page celebrates once per day, on the first visit after the goal is met:
 * the goal is finished elsewhere (a lesson, a quiz, a deck), so there is no tap
 * on this page to celebrate, and confetti on every visit would stop meaning
 * anything by the third. A DEVICE fact in its own key for the reasons
 * lib/intro-seen.ts gives; if storage is missing the worst case is confetti
 * twice, which is harmless.
 *
 * `scope` keeps the shared streaks apart: each friend's page celebrates the day
 * the PAIR kept, once, under its own key (at most 20, one per friend). The solo
 * page passes none and keeps the key it always had.
 */

const STORAGE_KEY = "brachnha-streak-celebrated";

function keyFor(scope?: string): string {
  return scope ? `${STORAGE_KEY}:${scope}` : STORAGE_KEY;
}

export function celebratedOn(day: string, scope?: string): boolean {
  try {
    return localStorage.getItem(keyFor(scope)) === day;
  } catch {
    return true;
  }
}

export function markCelebrated(day: string, scope?: string): void {
  try {
    localStorage.setItem(keyFor(scope), day);
  } catch {
    // Nothing to do.
  }
}
