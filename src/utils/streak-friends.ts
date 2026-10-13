/**
 * A SHARED streak between two friends.
 *
 * The one rule this whole file exists to encode: **a day only counts when BOTH
 * people finish their daily goal.** One of them doing the work is not half a
 * day's credit — it is no credit, and the streak stops moving.
 *
 * That is what makes this different from `utils/streak.ts` next door, which
 * measures one student against themselves. Nothing here ranks anybody: an
 * earlier version of this file ranked a group of friends by their individual
 * streaks, and it was replaced wholesale because a leaderboard of separate
 * streaks says "beat your friends" where this says "carry each other".
 *
 * REAL since 13 Oct 2026. The pair's days are the INTERSECTION of the two
 * students' goal days, from the day they became friends (`since`) onwards,
 * and the count reuses `currentStreak()` / `bestStreak()` on that intersection.
 * So the pair streak follows exactly the solo rule: alive until today is over,
 * broken only by a whole day that was not kept. A new pair starts at 0 (the
 * user's call): earlier days both happened to finish do not count.
 *
 * The student's own days come from their device's `activityLog` (fresher than
 * the server); the friend's from `my_friends` (lib/friends.ts).
 *
 * Pure. utils/ never points at features/.
 */

import type { ActivityLog } from "@/types";
import { bestStreak, currentStreak } from "./streak";

/**
 * One day of the pair's week.
 *
 * `atRisk` is TODAY ONLY: the day is not over, so anyone still outstanding is a
 * warning rather than a verdict. A PAST day that was not kept by both is
 * `broken`, whether one of them or neither finished. `before` is a day before
 * the two became friends, which can never count either way.
 */
export type SharedDayStatus = "kept" | "atRisk" | "broken" | "before";

export interface SharedDay {
  /** The student's own goal, met. */
  you: boolean;
  /** The friend's goal, met. */
  friend: boolean;
}

export function sharedDayStatus(
  { you, friend }: SharedDay,
  where: { isToday: boolean; beforeStart: boolean }
): SharedDayStatus {
  if (where.beforeStart) return "before";
  if (you && friend) return "kept";
  return where.isToday ? "atRisk" : "broken";
}

/**
 * Today, told from both sides, so the UI never has to re-derive the four cases
 * and disagree with itself about which message goes with which state.
 *
 * `waitingOnFriend` and `waitingOnYou` are deliberately separate booleans
 * rather than one "who are we waiting for" enum: both can be true at once, and
 * an enum would force that case to pick a side.
 */
export interface SharedToday extends SharedDay {
  /** Both done: the only state in which today counts. */
  kept: boolean;
  waitingOnFriend: boolean;
  waitingOnYou: boolean;
}

export function sharedToday(day: SharedDay): SharedToday {
  return {
    ...day,
    kept: day.you && day.friend,
    waitingOnFriend: !day.friend,
    waitingOnYou: !day.you,
  };
}

/** Whether the student met their own goal on `day`, from their device. */
export function myGoalOn(log: ActivityLog, day: string): boolean {
  return log[day]?.goal === true;
}

/**
 * The days the PAIR kept: both met the goal, on or after `since`. Shaped as an
 * ActivityLog so the solo streak functions can count it unchanged.
 *
 * YYYY-MM-DD compares as a date when compared as a string, which is what makes
 * `day >= since` correct.
 */
export function pairLog(
  myLog: ActivityLog,
  friendDays: readonly string[],
  since: string
): ActivityLog {
  const log: ActivityLog = {};
  for (const day of friendDays) {
    if (day >= since && myGoalOn(myLog, day)) log[day] = { xp: 0, goal: true };
  }
  return log;
}

export interface PairStreak {
  /** The run ending today, or yesterday while today is still open. */
  current: number;
  /** The longest run since they became friends. */
  best: number;
}

export function pairStreak(
  myLog: ActivityLog,
  friendDays: readonly string[],
  since: string,
  today: string
): PairStreak {
  const log = pairLog(myLog, friendDays, since);
  return { current: currentStreak(log, today), best: bestStreak(log) };
}
