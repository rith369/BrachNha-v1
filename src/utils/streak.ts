/**
 * Streak maths — pure, and deliberately ignorant of where the numbers come from.
 *
 * Same split as utils/leaderboard.ts and utils/gradePrediction.ts: this file
 * owns the derivation and declares the shape it needs, while the milestone
 * ladder lives in features/streak/milestones.ts. utils/ never imports from
 * features/, so the arrow only ever points this way.
 *
 * Two halves. The milestone functions take a streak NUMBER and never cared
 * where it came from — which is why they needed no change when the number
 * stopped being a hardcoded seed. `currentStreak` / `bestStreak` are where that
 * number now comes FROM: the store's `activityLog`, one entry per day studied.
 *
 * THE RULE: A DAY COUNTS ONLY WHEN THE DAILY GOAL IS COMPLETE — the user's
 * decision, and what the Streak page has always told students ("just opening
 * the app doesn't count"). Studying without finishing the goal still fills the
 * day in on the Profile calendar, more faintly, but it does not extend a streak.
 */

import type { ActivityLog, Tasks } from "@/types";
import { addDaysKey, parseDayKey } from "@/utils/day";

/**
 * The daily goal: the three tasks the Streak page's goal card and Roadmap's
 * Daily Mission already name. `challenge` is an extra row on Home's checklist,
 * not part of the goal.
 */
export const DAILY_GOAL_TASKS = ["lesson", "practice", "flashcards"] as const;

export function isGoalComplete(tasks: Tasks): boolean {
  return DAILY_GOAL_TASKS.every((key) => tasks[key]);
}

/** How many of today's goal tasks are done — the "1 / 3" in the calendar. */
export function goalTasksDone(tasks: Tasks): number {
  return DAILY_GOAL_TASKS.filter((key) => tasks[key]).length;
}

// Optional chaining is load-bearing, not tidiness: an absent day is undefined,
// and a device that ran the first, XP-only version of this log holds plain
// numbers, whose `.goal` is simply undefined — false, rather than a crash.
function goalMet(log: ActivityLog, day: string): boolean {
  return log[day]?.goal === true;
}

function previousDay(day: string): string {
  return addDaysKey(parseDayKey(day), -1);
}

/**
 * The streak as it stands on `today`: the run of consecutive goal-complete days
 * ending today — or ending YESTERDAY when today's goal is not done yet.
 *
 * That second clause is the whole design. A streak is not broken until the day
 * is over: a student who finished the goal every day this week and opens the
 * app at 7am has an unbroken streak waiting for today's work, and only a full
 * day without the goal takes it to 0. Counting strictly from today would show 0
 * every morning and break every streak at midnight.
 *
 * `today` is an argument rather than a todayKey() call so the rule is testable
 * against a fixed date, and so the store computes it once per update.
 */
export function currentStreak(log: ActivityLog, today: string): number {
  let day = goalMet(log, today) ? today : previousDay(today);
  let count = 0;
  while (goalMet(log, day)) {
    count += 1;
    day = previousDay(day);
  }
  return count;
}

/** The longest run anywhere in the log. Always >= currentStreak, since the
 *  current run is one of the runs it considers. */
export function bestStreak(log: ActivityLog): number {
  // YYYY-MM-DD sorts chronologically as a plain string.
  const days = Object.keys(log)
    .filter((d) => goalMet(log, d))
    .sort();

  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of days) {
    run = prev !== null && previousDay(day) === prev ? run + 1 : 1;
    best = Math.max(best, run);
    prev = day;
  }
  return best;
}

export interface StreakMilestone {
  /** Consecutive days needed to reach it. */
  days: number;
  label: { en: string; km: string };
}

/**
 * `next` is the single closest unreached milestone — the one the student is
 * currently working toward. Everything past it is `locked`, which here means
 * "further away", not "unavailable": nothing in this app gates content behind a
 * streak, and a locked milestone still says exactly what it is and what it
 * costs.
 */
export type MilestoneStatus = "reached" | "next" | "locked";

export interface RankedMilestone extends StreakMilestone {
  status: MilestoneStatus;
}

export interface MilestoneProgress {
  /** The milestone being worked toward. */
  target: StreakMilestone;
  /** The streak as it stands — the numerator of "12 / 14 days". */
  current: number;
  /** Days still to go. Always >= 1: a reached milestone is never the target. */
  remaining: number;
  /** 0–100, for the bar. */
  pct: number;
}

/** Ascending by days, without mutating the caller's array. */
function byDays(milestones: readonly StreakMilestone[]): StreakMilestone[] {
  return [...milestones].sort((a, b) => a.days - b.days);
}

/**
 * Tags every milestone against the streak.
 *
 * Sorted first rather than trusting the authored order, because "the next one"
 * is only meaningful in ascending order and a ladder written out of sequence
 * would otherwise mark the wrong card as next — a silent wrong answer rather
 * than a visible one.
 */
export function rankMilestones(
  milestones: readonly StreakMilestone[],
  streak: number
): RankedMilestone[] {
  let nextTaken = false;

  return byDays(milestones).map((m) => {
    if (streak >= m.days) return { ...m, status: "reached" };
    if (!nextTaken) {
      nextTaken = true;
      return { ...m, status: "next" };
    }
    return { ...m, status: "locked" };
  });
}

/**
 * Progress toward the closest unreached milestone, or `null` once every one has
 * been passed.
 *
 * Null rather than a saturated 100% on purpose: a student past the last rung
 * has no next milestone, and a bar pinned full under the words "0 days until
 * your next milestone" describes something that does not exist. The caller
 * renders nothing instead — the same absent-rather-than-empty rule the starred
 * card list and the retention line already follow.
 *
 * The denominator is the TARGET's threshold, not the gap from the previous
 * milestone, so the bar reads "12 / 14 days" exactly as the label beside it
 * does. Measuring 7 → 14 instead would put the bar at 71% while the label said
 * 12 of 14, and one of the two would be wrong.
 */
export function milestoneProgress(
  milestones: readonly StreakMilestone[],
  streak: number
): MilestoneProgress | null {
  const target = byDays(milestones).find((m) => streak < m.days);
  if (!target) return null;

  return {
    target,
    current: streak,
    remaining: target.days - streak,
    pct: Math.max(0, Math.min(100, Math.round((streak / target.days) * 100))),
  };
}
