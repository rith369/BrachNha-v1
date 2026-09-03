import type { ReviewState } from "@/utils/spaced-repetition";

/**
 * A MOCK retention estimate. NOT a machine-learning prediction, not FSRS's own
 * retrievability estimate, not scientifically calibrated to anything — a
 * small deterministic formula off numbers the scheduler already tracks
 * (review count, lapses), so the UI has a plausible-looking percentage to show
 * where a real model would eventually plug in.
 *
 * Kept in its OWN file, separate from utils/spaced-repetition.ts, specifically
 * so the real scheduler and this mock can never be confused for one thing —
 * swapping in a real prediction later (e.g. reading FSRS's own retrievability
 * output) means replacing this file's one function, and nothing that imports
 * it needs to change shape (still a 0–100 number per ReviewState).
 *
 * Never displayed as a bare number in the UI — always with an "ប្រហាក់ប្រហែល"
 * (approximate) label, so it reads as an estimate rather than a fact.
 */
export function mockRetentionPct(state: ReviewState): number | null {
  // Nothing to estimate for a card that has never been reviewed.
  if (state.reviewCount === 0) return null;
  const raw = 50 + state.reviewCount * 8 - state.lapses * 12;
  return Math.max(10, Math.min(97, Math.round(raw)));
}

/** Average mock retention across a set of review states, ignoring cards with
 *  nothing to estimate yet. Null when none of them have been reviewed. */
export function averageMockRetention(states: ReviewState[]): number | null {
  const values = states
    .map(mockRetentionPct)
    .filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
