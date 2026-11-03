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
 * THE RULE (the user's, 3 Nov 2026): A DAY COUNTS ONCE ANY 1 MISSION IS FINISHED,
 * that is, once one row of the card reaches today's target: the day's lessons, the
 * day's quizzes, a flashcard review or the daily challenge. Reaching all four opens
 * a gift instead of being what keeps the streak, so a busy day still counts and a
 * full one is still worth doing. Just opening the app doesn't count, and neither
 * does studying short of a target, which still fills the day in on the Profile
 * calendar, more faintly.
 *
 * It used to need all of lesson, practice and flashcards. Days that met that
 * remain streak days; days that did not stay as they were.
 */

import type { ActivityLog, DaySections, Tasks } from "@/types";
import { addDaysKey, parseDayKey } from "@/utils/day";

/** The day's four missions. Reaching all of them opens the gift. */
export const MISSIONS = ["lesson", "practice", "flashcards", "challenge"] as const;

/** A flashcard review counts with at least this many cards, or the whole deck if
 *  it is smaller. Otherwise one card would keep a streak. */
export const MIN_REVIEW_CARDS = 5;

/** A section counts once a day, so a list stamped on another day is empty. The same
 *  section counts again tomorrow: going back over old work is real study. */
export function sectionsCountedToday(sections: DaySections, today: string): string[] {
  return sections.date === today ? sections.ids : [];
}

export function allMissionsDone(tasks: Tasks): boolean {
  return MISSIONS.every((key) => tasks[key]);
}

/** How many of today's missions are done: the "2 of 4". */
export function missionsDone(tasks: Tasks): number {
  return MISSIONS.filter((key) => tasks[key]).length;
}

// Optional chaining is load-bearing, not tidiness: an absent day is undefined,
// and a device that ran the first, XP-only version of this log holds plain
// numbers, whose `.goal` is simply undefined — false, rather than a crash.
function goalMet(log: ActivityLog, day: string): boolean {
  return log[day]?.goal === true;
}

/** The day holds a streak together: a goal day, or a missed one a protection covered. */
export function dayKept(log: ActivityLog, day: string): boolean {
  return goalMet(log, day) || log[day]?.streakProtected === true;
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
 *
 * A protected day keeps the run going without adding to it.
 */
export function currentStreak(log: ActivityLog, today: string): number {
  let day = goalMet(log, today) ? today : previousDay(today);
  let count = 0;
  while (dayKept(log, day)) {
    if (goalMet(log, day)) count += 1;
    day = previousDay(day);
  }
  return count;
}

/**
 * The missed days to spend protections on, newest first, or none. Only a whole gap
 * is worth covering: a protection spent on part of one would save nothing, so the
 * student keeps them and the streak breaks.
 *
 * `checkedOn` is the last day this ran, which judged every day before it. A gap
 * reaching further back was already lost, so buying a protection afterwards cannot
 * bring an old streak back. It only protects the days ahead.
 */
export function protectableDays(
  log: ActivityLog,
  today: string,
  held: number,
  checkedOn: string
): string[] {
  const gap: string[] = [];
  let day = previousDay(today);
  while (!dayKept(log, day)) {
    if (gap.length === held || day < checkedOn) return [];
    gap.push(day);
    day = previousDay(day);
  }
  // Nothing to save when the run behind the gap has no real day in it.
  return gap.length > 0 && currentStreak(log, day) > 0 ? gap : [];
}

/** The longest run anywhere in the log. Always >= currentStreak, since the
 *  current run is one of the runs it considers. */
export function bestStreak(log: ActivityLog, since?: string): number {
  // YYYY-MM-DD sorts chronologically as a plain string, which is also what
  // makes `d >= since` a date comparison. With `since`, a run that started
  // before it counts only its days inside the window — the leaderboard's
  // monthly board, matching streak_month in 20260916000004_leaderboard.sql.
  const days = Object.keys(log)
    .filter((d) => dayKept(log, d) && (since === undefined || d >= since))
    .sort();

  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of days) {
    const joined = prev !== null && previousDay(day) === prev;
    run = (joined ? run : 0) + (goalMet(log, day) ? 1 : 0);
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
