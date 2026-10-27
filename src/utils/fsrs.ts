/**
 * The flashcard scheduler: FSRS, the memory model Anki uses, through the
 * official `ts-fsrs` library (MIT, no dependencies).
 *
 * WHAT IT ADDS OVER THE OLD SCHEDULER. That one multiplied a card's wait by a
 * fixed factor per grade, so reviewing a card early as often as a student liked
 * kept doubling its wait, and it knew nothing about time. FSRS keeps two numbers
 * per card, STABILITY (days until the chance of remembering falls to 90%) and
 * DIFFICULTY (1 to 10), and from them and the days since the last review it can
 * say how likely the student is to remember the card right now
 * (`retrievability`). That figure is what the lesson's flashcard screen shows.
 * Reviewing early barely moves stability, so it can no longer inflate a card.
 *
 * THE SETTINGS, each a decision (the user's: 90% target, lesson total shown):
 *  - request_retention 0.9: a card comes back when the chance of remembering
 *    it has fallen to about 90%. Higher means more reviews a day.
 *  - enable_short_term false: no same-day learning steps (FSRS would otherwise
 *    bring a forgotten card back in minutes). Every graded card is "review".
 *  - enable_fuzz false: the same history always gives the same date, so a due
 *    date cannot differ between a student's two phones or between test runs.
 *  - maximum_interval: MAX_INTERVAL_DAYS. FSRS reports 366 at its own cap, so
 *    the interval is clamped here as well.
 *  - "again" is always AGAIN_INTERVAL_DAYS (tomorrow), overriding the 2 days
 *    FSRS sometimes gives a lapsed card it knew well.
 *
 * DEFAULT PARAMETERS, NOT FITTED ONES. FSRS can be trained on a student's own
 * history; that needs hundreds of reviews and an optimiser, and is not done
 * here. The defaults come from millions of reviews by other learners, so the
 * percentage is an honest estimate for an average learner, not for this one.
 *
 * LAZY ON PURPOSE. Only the flashcard screens import this file (review-session,
 * flashcard-runner, practice-review, all lazy routes), so the library never
 * reaches the entry chunk. utils/spaced-repetition.ts holds what the store and
 * Home need without it. Don't import this from the store.
 */

import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card,
  type Grade,
} from "ts-fsrs";
import { addDaysKey } from "@/utils/day";
import {
  AGAIN_INTERVAL_DAYS,
  initialReviewState,
  MAX_INTERVAL_DAYS,
  type CardPhase,
  type ReviewGrade,
  type ReviewResult,
  type ReviewState,
} from "@/utils/spaced-repetition";

/** The chance of remembering a card is allowed to fall to before it is due. */
export const TARGET_RETENTION = 0.9;

const scheduler = fsrs(
  generatorParameters({
    request_retention: TARGET_RETENTION,
    maximum_interval: MAX_INTERVAL_DAYS,
    enable_fuzz: false,
    enable_short_term: false,
  })
);

const RATING: Record<ReviewGrade, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

const PHASE: Record<State, CardPhase> = {
  [State.New]: "new",
  [State.Learning]: "learning",
  [State.Review]: "review",
  [State.Relearning]: "relearning",
};

/** Four decimals: plenty for a date that is rounded to a day anyway, and it
 *  keeps the synced number from changing in its 15th digit. */
const round4 = (n: number) => Math.round(n * 10_000) / 10_000;

function validDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "yyyy-mm-dd" as LOCAL midnight, the way utils/day.ts reads a day key. */
function dayKeyDate(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

/**
 * A memory model for a card graded before FSRS whose history is not all in the
 * review log (it keeps the newest 1000 grades). At 90% retention FSRS waits
 * about `stability` days, so the card's current wait is the honest estimate of
 * it; difficulty starts mid-scale and rises with each lapse.
 */
function estimate(state: ReviewState): { stability: number; difficulty: number } {
  const forgot = state.lastGrade === "again" || state.lastGrade === "hard";
  const stability = state.intervalDays > 0 ? state.intervalDays : forgot ? 0.5 : 2;
  const difficulty = Math.min(10, Math.max(1, 5 + state.lapses));
  return { stability, difficulty };
}

function toCard(state: ReviewState, now: Date): Card {
  if (state.reviewCount === 0) return createEmptyCard(now);
  const model =
    state.stability !== undefined &&
    state.difficulty !== undefined &&
    Number.isFinite(state.stability) &&
    Number.isFinite(state.difficulty) &&
    state.stability > 0
      ? { stability: state.stability, difficulty: state.difficulty }
      : estimate(state);
  // A last review LATER than now (a phone clock set back, or a card synced
  // from a phone whose clock runs ahead) makes FSRS throw "Invalid delta_t",
  // which in the review screen would silently swallow the grade. Treat it as
  // reviewed just now.
  const last = validDate(state.lastReviewedAt);
  const lastReview = last && last.getTime() <= now.getTime() ? last : now;
  return {
    due: dayKeyDate(state.dueAt) ?? now,
    stability: model.stability,
    difficulty: model.difficulty,
    elapsed_days: 0,
    scheduled_days: state.intervalDays,
    learning_steps: 0,
    reps: state.reviewCount,
    lapses: state.lapses,
    // With no short-term steps every graded card is a review card to FSRS,
    // including ones the old scheduler left "learning" or "relearning".
    state: State.Review,
    last_review: lastReview,
  };
}

/** Grade a card and return its next state. The only scheduler in the app. */
export function schedule(
  state: ReviewState,
  grade: ReviewGrade,
  now: Date = new Date()
): ReviewState {
  const next = scheduler.next(toCard(state, now), now, RATING[grade]).card;
  const intervalDays =
    grade === "again"
      ? AGAIN_INTERVAL_DAYS
      : Math.min(MAX_INTERVAL_DAYS, Math.max(1, next.scheduled_days));
  return {
    phase: PHASE[next.state],
    intervalDays,
    dueAt: addDaysKey(now, intervalDays),
    reviewCount: state.reviewCount + 1,
    lapses: next.lapses,
    lastGrade: grade,
    lastReviewedAt: now.toISOString(),
    stability: round4(next.stability),
    difficulty: round4(next.difficulty),
  };
}

/**
 * The chance, 0 to 1, that the student remembers this card right now. Null for
 * a card never graded, and for one with no memory model yet (graded before
 * FSRS and not yet upgraded): a guess presented as a measurement is the thing
 * the old "~N%" line was removed for.
 */
export function retrievability(state: ReviewState, now: Date): number | null {
  if (state.reviewCount === 0) return null;
  if (state.stability === undefined || state.difficulty === undefined) return null;
  try {
    const r = scheduler.get_retrievability(toCard(state, now), now, false);
    return Number.isFinite(r) ? Math.min(1, Math.max(0, r)) : null;
  } catch {
    // A figure on a screen is not worth a crash; the card simply has none.
    return null;
  }
}

/** The average over the cards that have one, or null when none do. */
export function averageRetrievability(
  states: ReviewState[],
  now: Date
): number | null {
  let sum = 0;
  let n = 0;
  for (const s of states) {
    const r = retrievability(s, now);
    if (r === null) continue;
    sum += r;
    n += 1;
  }
  return n ? sum / n : null;
}

/**
 * Gives every card graded before FSRS a memory model. Returns a NEW map when
 * at least one card changed, or null when there is nothing to do, so a caller
 * writes to the store only when it must.
 *
 * Where the review log holds the card's WHOLE history (as many grades as its
 * reviewCount), the history is REPLAYED through FSRS, as if FSRS had been there
 * from the first grade: real stability, difficulty and due date. Otherwise the
 * card keeps its date and gets an estimate (see `estimate`). Either way the
 * next grade is pure FSRS.
 */
export function upgradeReviews(
  reviews: Record<string, ReviewState>,
  history: ReviewResult[]
): Record<string, ReviewState> | null {
  const byCard = new Map<string, ReviewResult[]>();
  for (const e of history) {
    if (!validDate(e.reviewedAt)) continue;
    const list = byCard.get(e.cardId);
    if (list) list.push(e);
    else byCard.set(e.cardId, [e]);
  }

  let out: Record<string, ReviewState> | null = null;
  for (const [id, state] of Object.entries(reviews)) {
    if (state.stability !== undefined && state.difficulty !== undefined) continue;
    if (state.reviewCount === 0) continue;

    const log = (byCard.get(id) ?? [])
      .slice()
      .sort((a, b) => (a.reviewedAt < b.reviewedAt ? -1 : a.reviewedAt > b.reviewedAt ? 1 : 0));

    let next: ReviewState;
    if (log.length > 0 && log.length >= state.reviewCount) {
      next = initialReviewState(new Date(log[0].reviewedAt));
      for (const e of log) next = schedule(next, e.grade, new Date(e.reviewedAt));
    } else {
      const model = estimate(state);
      next = {
        ...state,
        stability: round4(model.stability),
        difficulty: round4(model.difficulty),
      };
    }
    (out ??= { ...reviews })[id] = next;
  }
  return out;
}
