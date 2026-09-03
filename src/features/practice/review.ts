import { deckFor } from "@/data/practice";
import { chaptersFor } from "@/features/lessons/sessions";
import type { PracticeCard } from "@/types";
import {
  initialReviewState,
  isDue,
  type ReviewState,
} from "@/utils/spaced-repetition";
import { FLASHCARD_SUBJECTS, practiceKey } from "./practice";

/**
 * Pure queries over the flashcard review state — no store import, no React.
 * Takes `studentCards`/`cardReviews` as plain arguments (the same shape the
 * store holds them in) rather than reading the store directly, so these stay
 * callable from anywhere, including the store's own actions if a future one
 * ever needs a due count. Same pattern as `pathProgress(chapters, completed)`
 * in features/lessons/sessions.ts.
 */

/** One card paired with its current review state — a fresh "new" state for any
 *  card that has never been graded. */
export interface QueueCard {
  card: PracticeCard;
  deckKey: string;
  state: ReviewState;
}

/** Every card behind one deck key — official plus this student's own — each
 *  paired with its review state. */
export function cardsFor(
  deckKey: string,
  studentCards: Record<string, PracticeCard[]>,
  cardReviews: Record<string, ReviewState>,
  now: Date = new Date()
): QueueCard[] {
  const all = [...deckFor(deckKey), ...(studentCards[deckKey] ?? [])];
  return all.map((card) => ({
    card,
    deckKey,
    state: cardReviews[card.id] ?? initialReviewState(now),
  }));
}

/** The due subset of one deck — new cards plus anything scheduled today or
 *  earlier. This is what "Start Review" actually queues up. */
export function dueCardsFor(
  deckKey: string,
  studentCards: Record<string, PracticeCard[]>,
  cardReviews: Record<string, ReviewState>,
  now: Date = new Date()
): QueueCard[] {
  return cardsFor(deckKey, studentCards, cardReviews, now).filter((qc) =>
    isDue(qc.state, now)
  );
}

/**
 * Every flashcard deck key that could have content, across the flashcard tab's
 * whole subject scope (FLASHCARD_SUBJECTS — physics/chemistry/biology/history,
 * matching the tab itself). Used to build the Daily Review aggregate; a key
 * with nothing written just contributes zero cards, exactly like every other
 * derived-count in this feature.
 */
export function allDeckKeys(): string[] {
  return FLASHCARD_SUBJECTS.flatMap((subjectId) =>
    chaptersFor(subjectId).flatMap((chapter) =>
      chapter.lessons.map((lesson) =>
        practiceKey(subjectId, chapter.number, lesson.number)
      )
    )
  );
}

/** Due cards across EVERY deck — the Daily Review queue. Today this reduces to
 *  "whatever Biology has," since it is the only subject with real content; the
 *  function is written to the full catalog so nothing here needs to change as
 *  more decks are written. */
export function allDueCards(
  studentCards: Record<string, PracticeCard[]>,
  cardReviews: Record<string, ReviewState>,
  now: Date = new Date()
): QueueCard[] {
  return allDeckKeys().flatMap((key) =>
    dueCardsFor(key, studentCards, cardReviews, now)
  );
}

/** EVERY card across every deck, due or not — the fallback queue for
 *  "review anyway" when nothing is due. See allDueCards for the same idea
 *  scoped to one deck. */
export function allCards(
  studentCards: Record<string, PracticeCard[]>,
  cardReviews: Record<string, ReviewState>,
  now: Date = new Date()
): QueueCard[] {
  return allDeckKeys().flatMap((key) =>
    cardsFor(key, studentCards, cardReviews, now)
  );
}

/**
 * THE THREE PILES the lesson's intro screen opens onto — remembered, not
 * remembered, important. Read off `lastGrade`, which the scheduler already
 * writes on every grade, rather than a parallel list that could disagree with
 * the review state: a card IS in a pile because of how it was last answered,
 * which is the only definition that can't drift.
 *
 * A never-graded card (`lastGrade: null`) is in NEITHER of the first two, on
 * purpose — it hasn't been remembered or forgotten yet, and lumping new cards
 * into "not remembered" would tell a student they failed something they have
 * never been shown. Those cards are reached through the main Start button,
 * which is what queues due-and-new work.
 *
 * The two-vs-four asymmetry is the same one review-session.tsx documents: the
 * UI offers two options but the scheduler's vocabulary is still four, so "hard"
 * folds in with "again" and "easy" with "good" rather than being dropped.
 */
export function rememberedCards(cards: QueueCard[]): QueueCard[] {
  return cards.filter(
    (qc) => qc.state.lastGrade === "good" || qc.state.lastGrade === "easy"
  );
}

export function notRememberedCards(cards: QueueCard[]): QueueCard[] {
  return cards.filter(
    (qc) => qc.state.lastGrade === "again" || qc.state.lastGrade === "hard"
  );
}

/** Starred is the student's own bookmark, not a review outcome, so this one
 *  takes the flat id list the store keeps rather than reading ReviewState. */
export function importantCards(
  cards: QueueCard[],
  starredCards: string[]
): QueueCard[] {
  return cards.filter((qc) => starredCards.includes(qc.card.id));
}

/**
 * How much of a set of cards the student has actually learned. Derived, never
 * stored — same rule `lessonCountFor()` follows: a stored progress figure
 * drifts from the review state it claims to describe the first time a card is
 * added, deleted or reset.
 *
 * `total` counts the WHOLE set, including cards never graded, because those are
 * what the uncoloured part of the ring represents — and because the remembered
 * share has to be of the whole lesson, not of the handful answered so far. One
 * card right out of twenty is 5% of the lesson learned, not 100%.
 *
 * Lives here rather than beside the component that draws it because it is a
 * pure query over QueueCards exactly like its neighbours above — and because a
 * non-component export from a `.tsx` trips oxlint's `only-export-components`,
 * the rule utils/focus-styles.ts and features/lessons/subject-styles.ts both
 * exist to satisfy.
 */
export interface DeckProgress {
  remembered: number;
  notRemembered: number;
  total: number;
}

export function deckProgress(cards: QueueCard[]): DeckProgress {
  return {
    remembered: rememberedCards(cards).length,
    notRemembered: notRememberedCards(cards).length,
    total: cards.length,
  };
}

/** How many cards were graded today, across every deck — read straight off
 *  `lastReviewedAt`, never a separate counter that could drift from it. Feeds
 *  the Daily Review card's "reviewed" stat and the mock recommendations. */
export function reviewedTodayCount(
  cardReviews: Record<string, ReviewState>,
  now: Date = new Date()
): number {
  const today = now.toISOString().slice(0, 10);
  return Object.values(cardReviews).filter(
    (s) => s.lastReviewedAt?.slice(0, 10) === today
  ).length;
}
