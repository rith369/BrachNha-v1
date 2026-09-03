/**
 * A deliberately SIMPLIFIED spaced-repetition scheduler — day-interval math,
 * not a memory model. This is a prototype, and the brief for it is explicit:
 * don't build FSRS/SM-2 now, but structure the code so a real one can replace
 * this file later without touching the UI.
 *
 * THAT SWAP BOUNDARY IS THIS FILE. Every caller — the review runner, the
 * due-card queries in features/practice/review.ts — only ever calls
 * `schedule(state, grade, now)` and reads `ReviewState`/`isDue`. A future FSRS
 * integration means replacing the body of `schedule` (and, if FSRS's own state
 * shape needs more fields, extending `ReviewState`) — the call sites do not
 * change, because they already only depend on this narrow interface rather than
 * reaching into scheduling internals.
 *
 * Pure, no React and no store import — same shape as utils/rewards.ts and
 * utils/focus-styles.ts. The store (lib/store.ts) is what wires this to
 * `cardReviews`; this file has no idea a store exists.
 */

export type ReviewGrade = "again" | "hard" | "good" | "easy";

/**
 * Where a card sits in the learning cycle:
 *  - "new"        never graded
 *  - "learning"   graded at least once, still working toward its first real
 *                 interval (only reachable by grading a "new" card "again")
 *  - "review"     graduated — has a real multi-day interval
 *  - "relearning" a REVIEW card that lapsed ("again"), stepping back down
 *                 before it re-enters "review"
 */
export type CardPhase = "new" | "learning" | "review" | "relearning";

export interface ReviewState {
  phase: CardPhase;
  /** Current interval in days. 0 while "new"/"learning"/just-lapsed. */
  intervalDays: number;
  /** ISO calendar date ("yyyy-mm-dd") this card is next due. Compared by date
   *  only, not exact time — a card due today is due the whole day. */
  dueAt: string;
  reviewCount: number;
  /** Times a REVIEW card has been graded "again". Not incremented for a "new"
   *  card's first "again" — that is normal first-pass forgetting, not a lapse. */
  lapses: number;
  lastGrade: ReviewGrade | null;
  lastReviewedAt: string | null;
}

/** One graded card during a session — kept locally by the runner to build the
 *  end-of-session summary; never persisted on its own (cardReviews is what
 *  persists, this is just the log of how we got there). */
export interface ReviewResult {
  cardId: string;
  grade: ReviewGrade;
  reviewedAt: string;
}

/**
 * Days until a card graded "again" comes back. ONE day, deliberately, and
 * deliberately NOT zero: a card the student just said they don't remember must
 * not reappear in the sitting they said it in. That was the first behaviour
 * here — "again" set `dueAt` to today and the runner pushed the card back onto
 * its own queue — and it was overruled: being shown a card again seconds after
 * admitting you don't know it teaches recognition, not recall, and the student
 * asked for those cards to come back LATER instead. They are not stranded until
 * tomorrow either; the intro screen's មិនទាន់ចងចាំ pile opens exactly this set
 * on demand, whenever the student wants another pass (see flashcard-runner.tsx).
 */
const AGAIN_INTERVAL_DAYS = 1;

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

/** A card with no review record yet: "new" and due immediately, so it shows up
 *  in today's queue the first time it's ever seen. */
export function initialReviewState(now: Date = new Date()): ReviewState {
  return {
    phase: "new",
    intervalDays: 0,
    dueAt: toDateKey(now),
    reviewCount: 0,
    lapses: 0,
    lastGrade: null,
    lastReviewedAt: null,
  };
}

/**
 * Grade a card and return its next state.
 *
 * The interval table, deterministic on purpose:
 *
 *  - "again" on ANY card schedules it AGAIN_INTERVAL_DAYS out (phase
 *    "learning"/"relearning", interval reset to 0 so the next good grade
 *    graduates it from the bottom of the ladder rather than scaling a stale
 *    number). See that constant for why it is a day rather than "later in
 *    this same session," which is what it used to be.
 *  - "again" on a REVIEW card additionally counts as a lapse and resets its
 *    interval — it was going to be trusted with a multi-day gap and wasn't
 *    ready.
 *  - Grading a new/learning/relearning card anything OTHER than "again"
 *    graduates it straight into "review" with a short first interval
 *    (1 / 3 / 7 days for hard / good / easy). No multi-step learning ladder —
 *    "do not over-engineer this" is the instruction this follows.
 *  - Grading an established REVIEW card scales its existing interval
 *    (×1.2 / ×2 / ×2.5 for hard / good / easy), floored at 1 day.
 */
export function schedule(
  state: ReviewState,
  grade: ReviewGrade,
  now: Date = new Date()
): ReviewState {
  const base = {
    reviewCount: state.reviewCount + 1,
    lastGrade: grade,
    lastReviewedAt: now.toISOString(),
  };

  if (grade === "again") {
    const wasReview = state.phase === "review" || state.phase === "relearning";
    return {
      ...state,
      ...base,
      phase: wasReview ? "relearning" : "learning",
      intervalDays: 0,
      dueAt: addDays(now, AGAIN_INTERVAL_DAYS),
      lapses: wasReview ? state.lapses + 1 : state.lapses,
    };
  }

  const graduating = state.phase !== "review";
  if (graduating) {
    const days = grade === "hard" ? 1 : grade === "good" ? 3 : 7;
    return {
      ...state,
      ...base,
      phase: "review",
      intervalDays: days,
      dueAt: addDays(now, days),
    };
  }

  const multiplier = grade === "hard" ? 1.2 : grade === "good" ? 2 : 2.5;
  const days = Math.max(1, Math.round(state.intervalDays * multiplier));
  return {
    ...state,
    ...base,
    phase: "review",
    intervalDays: days,
    dueAt: addDays(now, days),
  };
}

/** A card is due once its scheduled date has arrived — today or earlier. */
export function isDue(state: ReviewState, now: Date = new Date()): boolean {
  return state.dueAt <= toDateKey(now);
}

/**
 * Days from now until a card's `dueAt` — 0 for anything already due. Exists
 * because "0 due, 0 new" on its own reads as an error to a student who just
 * finished reviewing everything; this is what turns that into "next review in
 * 3 days," so the wait is explained rather than silent. See the intro screen
 * in flashcard-runner.tsx for where this is shown.
 */
export function daysUntilDue(state: ReviewState, now: Date = new Date()): number {
  const todayMs = new Date(toDateKey(now)).getTime();
  const dueMs = new Date(state.dueAt).getTime();
  return Math.max(0, Math.round((dueMs - todayMs) / 86_400_000));
}
