/**
 * The flashcard review STATE and the cheap questions about it: is a card due,
 * what does a fresh one look like, and the one-year repair.
 *
 * THE SCHEDULER ITSELF IS NOT HERE ANY MORE. Since 27 Oct 2026 the next state
 * after a grade comes from FSRS (the memory model Anki uses), in
 * utils/fsrs.ts. The split is about BYTES: this file is imported by the store
 * and by Home's study feed, both in the entry chunk every student downloads
 * first, and the FSRS library is ~13 KB gzipped. utils/fsrs.ts is reached only
 * from the flashcard screens, which are lazy routes, so the library downloads
 * when a student opens flashcards and never before. Do not import utils/fsrs.ts
 * from anything the entry chunk reaches; check `dist/assets/index-*.js` for
 * "request_retention" after touching either file.
 *
 * Pure, no React and no store import — same shape as utils/rewards.ts and
 * utils/focus-styles.ts.
 */

import { addDaysKey, todayKey } from "@/utils/day";

export type ReviewGrade = "again" | "hard" | "good" | "easy";

/**
 * FSRS's card states. With the settings in utils/fsrs.ts (no same-day learning
 * steps) a graded card is always "review"; "learning" and "relearning" survive
 * only on cards graded by the old scheduler, and nothing reads the phase to
 * decide anything on screen.
 */
export type CardPhase = "new" | "learning" | "review" | "relearning";

export interface ReviewState {
  phase: CardPhase;
  /** Days from the last grade to `dueAt`. */
  intervalDays: number;
  /** ISO calendar date ("yyyy-mm-dd") this card is next due. Compared by date
   *  only, not exact time — a card due today is due the whole day. */
  dueAt: string;
  reviewCount: number;
  /** Times a card the student knew was then graded "again". */
  lapses: number;
  lastGrade: ReviewGrade | null;
  lastReviewedAt: string | null;
  /**
   * FSRS's memory model (utils/fsrs.ts). STABILITY is how many days until the
   * chance of remembering falls to 90%; DIFFICULTY is 1 (easy) to 10 (hard).
   * OPTIONAL because cards graded before FSRS have neither: utils/fsrs.ts
   * rebuilds them from the review log the first time a flashcard screen opens
   * (`upgradeReviews`).
   */
  stability?: number;
  difficulty?: number;
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
 *
 * FSRS would sometimes say 2 days for a lapsed card it knew well; utils/fsrs.ts
 * overrides that to this, because "a card you forgot comes back tomorrow" is the
 * rule the students were told.
 */
export const AGAIN_INTERVAL_DAYS = 1;

/**
 * The longest a card may wait: a year, which is past the Bac II for any
 * student using the app. Without it a card graded "good" over and over (a
 * student may review early as often as they like) doubled its wait each time,
 * until the due date stopped being a real date: "NaN-NaN-NaN" after about 20
 * grades, and a card that never came due again, which the sync also refuses to
 * upload. `repairReviewState` fixes cards stored before this cap existed.
 */
export const MAX_INTERVAL_DAYS = 365;

// LOCAL calendar dates, from the app's one day helper — never
// toISOString().slice(0, 10). Both of these used to be UTC-derived (and
// `addDays` did its arithmetic locally and then formatted in UTC, which is
// worse than either alone), so for a student in Phnom Penh studying between
// midnight and 07:00 every interval landed a day short and an "again" card came
// due again the same morning. See utils/day.ts for the full account.
const toDateKey = todayKey;
const addDays = addDaysKey;

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
 * A stored state from before MAX_INTERVAL_DAYS, brought back inside it: the
 * interval capped, and the due date at most a year after the card was last
 * graded (or from today, if that date is unreadable). Returns the SAME object
 * when nothing is wrong, so a load with no broken cards changes nothing.
 */
export function repairReviewState(
  state: ReviewState,
  now: Date = new Date()
): ReviewState {
  const validDue = /^\d{4}-\d{2}-\d{2}$/.test(state.dueAt);
  const last = state.lastReviewedAt ? new Date(state.lastReviewedAt) : null;
  const base = last && !Number.isNaN(last.getTime()) ? last : now;
  const latest = addDays(base, MAX_INTERVAL_DAYS);
  const intervalOk =
    Number.isFinite(state.intervalDays) &&
    state.intervalDays >= 0 &&
    state.intervalDays <= MAX_INTERVAL_DAYS;
  if (validDue && intervalOk && state.dueAt <= latest) return state;
  return {
    ...state,
    intervalDays: intervalOk ? state.intervalDays : MAX_INTERVAL_DAYS,
    dueAt: validDue && state.dueAt <= latest ? state.dueAt : latest,
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
