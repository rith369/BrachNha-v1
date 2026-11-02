/**
 * The Simulation's 2-day limit: from the moment a student starts their first
 * paper, they have this long to sit them all, at whatever hours they like.
 *
 * Here rather than in features/exam/simulation.ts because the store enforces it
 * too, and lib/ does not import from features/. Pure, and it takes `now` as an
 * argument, so the rule is testable against a fixed time.
 */

export const SIMULATION_WINDOW_HOURS = 48;

interface WindowAttempt {
  sittings: readonly { startedAt?: string; result?: unknown }[];
}

/**
 * When the 2 days end, in milliseconds, or null before the first paper starts.
 * DERIVED FROM THE SITTINGS, so there is no second start time to disagree with
 * them and no new column to store. Pressing Enter starts nothing: opening the
 * screen must not use up a student's time.
 */
export function simulationWindowEnd(attempt: WindowAttempt): number | null {
  const starts = attempt.sittings
    .filter((s) => s.startedAt)
    .map((s) => Date.parse(s.startedAt as string))
    .filter((t) => !Number.isNaN(t));
  return starts.length === 0
    ? null
    : Math.min(...starts) + SIMULATION_WINDOW_HOURS * 3_600_000;
}

/**
 * The 2 days are over and the attempt should end.
 *
 * NOT WHILE A PAPER IS RUNNING. Its own timer decides that one, so nobody is cut
 * off mid-paper by the bigger limit. The attempt ends once it has been handed in.
 */
export function simulationOverdue(attempt: WindowAttempt, now: number): boolean {
  const end = simulationWindowEnd(attempt);
  return (
    end !== null && now >= end && !attempt.sittings.some((s) => s.startedAt && !s.result)
  );
}
