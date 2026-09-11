// ============================================================
// DEMO DATA — Streak
// ------------------------------------------------------------
// Fake, fixed data on purpose, the same call already made for
// Progress, Game, Grade Prediction and Leaderboard. The brief
// for this screen asked for a static prototype: hardcoded
// numbers, simulated interactions, no backend and no real
// streak calculation.
//
// ── THE STREAK NUMBER ITSELF IS NOT IN HERE — AND IT IS REAL ──
// It is the store's own `streak` field, which StreakView reads
// straight off the store. It is DERIVED now, from the store's
// `activityLog` by currentStreak() in utils/streak.ts; it used
// to be a seeded DEMO_SEED_STREAK of 12 that nothing
// incremented. Before that, this file exported its own
// DEMO_STREAK of 12 while the store seeded 3, so Home's pill
// said 3 a few pixels above a hero saying 12 — one fact, two
// hardcoded numbers, guaranteed to disagree.
//
// So DO NOT reintroduce a streak constant here.
//
// The questions this comment used to list as undesigned are
// settled: a day counts ONLY WHEN THE DAILY GOAL IS COMPLETE
// (lesson + practice + flashcards — DAILY_GOAL_TASKS in
// utils/streak.ts), which is exactly what STREAK_COPY's rule
// line already told students; a day is the student's LOCAL day
// (utils/day.ts); a missed day resets to zero (no freeze or
// grace day); and the log syncs through daily_activity.
//
// ⚠ STILL DEMO — ON THE USER'S DECISION, 11 SEP 2026. Asked
// directly, they chose to keep this page's simulated pieces:
//   • DEMO_DAILY_TASKS and the "Complete Today's Goal" button
//     (+1 and confetti, local, gone on reload).
//   • DEMO_WEEK / TODAY_ID — the weekly tracker's ticks.
// Both now sit beside a REAL count and disagree with Profile's
// study calendar, which reads the real activityLog. When they
// are made real: the week is the last seven day keys, ticked
// iff activityLog[day]?.goal; the goal card reads the store's
// `tasks` (keyed identically, so that swap is a rename); and the
// button cannot stay a simulation beside a real streak.
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
