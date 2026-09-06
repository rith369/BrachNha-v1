// ============================================================
// DEMO DATA — Streak
// ------------------------------------------------------------
// Fake, fixed data on purpose, the same call already made for
// Progress, Game, Grade Prediction and Leaderboard. The brief
// for this screen asked for a static prototype: hardcoded
// numbers, simulated interactions, no backend and no real
// streak calculation.
//
// ── THE STREAK NUMBER ITSELF IS NOT IN HERE ──
// It is the store's own `streak` field, seeded from
// DEMO_SEED_STREAK in lib/store.ts, and StreakView reads it
// straight off the store. That is deliberate and it is the fix
// for a real bug: this file used to export its own DEMO_STREAK
// of 12 while the store seeded 3, so Home's stat pill and the
// global StatBar said 3 a few pixels above a hero saying 12.
// One fact, two hardcoded numbers, guaranteed to disagree.
//
// So DO NOT reintroduce a streak constant here. Everything
// below is the surrounding demo state — which days are ticked,
// which tasks are outstanding — and none of it is the count.
//
// What real data would have to exist to switch this over:
//   • a daily activity log — one row per student per day, with
//     whether the daily goal was met. The `daily_activity`
//     table in supabase/migrations already has the shape and
//     the date column for exactly this; nothing writes the
//     goal-met flag yet.
//   • a real streak derivation over that log, including the
//     timezone question (a "day" for a student in Phnom Penh
//     is not a UTC day) and what a missed day does — reset to
//     zero, or a freeze/grace day. Neither is designed yet,
//     which is the other reason this is not wired up.
//   • today's goal read from the store's real `tasks`, which
//     Home's daily checklist and Roadmap's Daily Mission
//     already share. DEMO_DAILY_TASKS below is deliberately
//     keyed the same way so that swap is a rename, not a
//     redesign.
// ============================================================

/** How far the simulated "Complete Today's Goal" tap moves the store's count. */
export const CELEBRATION_STREAK_GAIN = 1;

export type WeekdayId = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface DemoStreakDay {
  id: WeekdayId;
  /** Daily goal met — NOT "opened the app". */
  done: boolean;
}

/**
 * Monday-first, because the brief's tracker reads MON→SUN.
 *
 * Six done and today outstanding is the state the whole screen is built around:
 * the brief asks for the tap to complete today, fill this cell and push the
 * streak to 13, none of which is possible from a week that is already full.
 */
export const TODAY_ID: WeekdayId = "sun";

export const DEMO_WEEK: readonly DemoStreakDay[] = [
  { id: "mon", done: true },
  { id: "tue", done: true },
  { id: "wed", done: true },
  { id: "thu", done: true },
  { id: "fri", done: true },
  { id: "sat", done: true },
  { id: "sun", done: false },
];

export type DailyTaskId = "lesson" | "practice" | "flashcards";

export interface DemoDailyTask {
  id: DailyTaskId;
  done: boolean;
}

/**
 * The three rows are the store's REAL `Tasks` keys — lesson / practice /
 * flashcards — the same three Home's daily checklist and Roadmap's Daily
 * Mission already share one completion state for. Keeping the ids identical is
 * what makes the eventual swap to live data a rename rather than a redesign.
 *
 * TWO OF THREE, NOT THREE OF THREE. The brief's goal card says "3 / 3 tasks
 * completed · Streak maintained!" and also says today is not yet ticked on the
 * weekly tracker, that the button completes it, and that doing so takes the
 * streak from 12 to 13 — which cannot all be true of a day that is already
 * finished. 3/3 is plainly the state the brief is describing AFTER the tap (it
 * asks for the ring at 100% in the same breath), so the card opens one task
 * short and lands on 3/3 the moment the button is pressed. Every other stated
 * behaviour then holds.
 *
 * One outstanding rather than three also makes a single "Complete Today's Goal"
 * button honest — it finishes the one thing that is left, instead of silently
 * clearing a whole day's work in one tap.
 */
export const DEMO_DAILY_TASKS: readonly DemoDailyTask[] = [
  { id: "lesson", done: true },
  { id: "practice", done: true },
  { id: "flashcards", done: false },
];
