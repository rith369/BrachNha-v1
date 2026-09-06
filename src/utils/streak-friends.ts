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
 * Pure, and it takes the day's two booleans rather than reading any roster —
 * same direction as utils/leaderboard.ts and utils/streak.ts, so utils/ never
 * points at features/.
 */

/**
 * `atRisk` is the honest word for TODAY and only for today: the day is not over,
 * so one person still being outstanding is a warning rather than a verdict.
 *
 * ON A PAST DAY THE SAME COMBINATION MEANS THE STREAK ACTUALLY BROKE. The demo
 * week deliberately contains no such day, so the distinction never has to be
 * drawn on screen — but a real implementation has to decide it, along with the
 * timezone and grace-day questions recorded in features/streak/demo-data.ts.
 * Splitting `atRisk` into "at risk (today)" and "broke (past)" is the first
 * thing this type should grow when the data becomes real.
 */
export type SharedDayStatus = "kept" | "atRisk" | "broken";

export interface SharedDay {
  /** The student's own goal, met. */
  you: boolean;
  /** The friend's goal, met. */
  friend: boolean;
}

export function sharedDayStatus({ you, friend }: SharedDay): SharedDayStatus {
  if (you && friend) return "kept";
  if (you || friend) return "atRisk";
  return "broken";
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
  status: SharedDayStatus;
  /** Both done — the only state in which the streak advances. */
  kept: boolean;
  waitingOnFriend: boolean;
  waitingOnYou: boolean;
}

export function sharedToday(day: SharedDay): SharedToday {
  return {
    ...day,
    status: sharedDayStatus(day),
    kept: day.you && day.friend,
    waitingOnFriend: !day.friend,
    waitingOnYou: !day.you,
  };
}

/**
 * The streak as it stands, given the run behind today and today's own outcome.
 *
 * DERIVED, never stored, so the header, the milestone bar and the milestone
 * grid cannot disagree about the number — the same reason sessionStatus() on
 * the subject path is derived. The +1 lands only on `kept`, which is the rule
 * in one line: finishing your own goal while your friend has not moves nothing.
 */
export function sharedStreakToday(base: number, today: SharedToday): number {
  return today.kept ? base + 1 : base;
}
