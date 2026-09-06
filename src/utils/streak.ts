/**
 * Streak milestone maths — pure, and deliberately ignorant of where the numbers
 * come from.
 *
 * Same split as utils/leaderboard.ts and utils/gradePrediction.ts: this file
 * owns the derivation and declares the shape it needs, while the ladder itself
 * lives in features/streak/milestones.ts and the (currently fake) streak value
 * in features/streak/demo-data.ts. utils/ never imports from features/, so the
 * arrow only ever points this way.
 *
 * NOTHING HERE IS DEMO DATA. When real per-day tracking lands, the streak
 * number handed in stops being hardcoded and every function below keeps
 * working unchanged — which is the point of taking it as an argument rather
 * than reading the store.
 */

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
