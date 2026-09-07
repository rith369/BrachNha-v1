/**
 * The app's ONE definition of "what day is it".
 *
 * Pure, no React and no store import — same shape as utils/rewards.ts and
 * utils/spaced-repetition.ts.
 *
 * ── Why this file exists ──────────────────────────────────────────────────
 *
 * The day boundary used to be computed in two incompatible ways. The Supabase
 * sync layer had a private local-calendar helper with a comment explaining that
 * UTC is wrong here; utils/spaced-repetition.ts and features/practice/review.ts
 * each independently used `toISOString().slice(0, 10)`, which is UTC.
 *
 * For a student in Phnom Penh (UTC+7) the UTC day rolls over at 07:00 local, so
 * between midnight and 07:00 every UTC-derived "today" is YESTERDAY. That made
 * every flashcard interval land a day short, and a card graded "again" at 05:00
 * came due again at 07:00 the same morning — the exact thing
 * AGAIN_INTERVAL_DAYS exists to prevent.
 *
 * So: one helper, local calendar, and NEVER toISOString().slice(0, 10) for a
 * date key anywhere in this app. A full ISO timestamp for an INSTANT is fine and
 * unaffected — this is only about collapsing an instant to a calendar day.
 *
 * Local means the DEVICE's timezone, not Cambodia's. A student who travels gets
 * their own local midnight, which is the honest answer to "is it still today for
 * me" and matches what every other app on their phone does.
 */

/** The local calendar date as `YYYY-MM-DD`. Sorts and compares lexicographically,
 *  which is what lets `dueAt <= todayKey()` work as a date comparison. */
export function todayKey(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** `todayKey` for a date `days` from `base`, with the arithmetic done in local
 *  time too. Doing the arithmetic locally and then formatting in UTC — which is
 *  what this replaced — silently shifts the result by a day near the boundary. */
export function addDaysKey(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return todayKey(d);
}
