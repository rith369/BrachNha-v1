/**
 * The last day the Streak page threw confetti for a finished daily goal.
 *
 * The page celebrates once per day, on the first visit after the goal is met:
 * the goal is finished elsewhere (a lesson, a quiz, a deck), so there is no tap
 * on this page to celebrate, and confetti on every visit would stop meaning
 * anything by the third. A DEVICE fact in its own key for the reasons
 * lib/intro-seen.ts gives; if storage is missing the worst case is confetti
 * twice, which is harmless.
 */

const STORAGE_KEY = "brachnha-streak-celebrated";

export function celebratedOn(day: string): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === day;
  } catch {
    return true;
  }
}

export function markCelebrated(day: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, day);
  } catch {
    // Nothing to do.
  }
}
