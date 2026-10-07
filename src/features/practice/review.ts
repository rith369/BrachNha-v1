import type { PracticeCard } from "@/types";
import { todayKey } from "@/utils/day";
import type { ContentManifest } from "@/utils/content-manifest";
import {
  initialReviewState,
  isDue,
  type ReviewState,
} from "@/utils/spaced-repetition";

/**
 * Pure queries over the flashcard review state — no store import, no React.
 * Takes `studentCards`/`cardReviews` as plain arguments (the same shape the
 * store holds them in) rather than reading the store directly, so these stay
 * callable from anywhere, including the store's own actions if a future one
 * ever needs a due count. Same pattern as `pathProgress(chapters, completed)`
 * in features/lessons/sessions.ts.
 *
 * THE OFFICIAL CARDS ARE AN ARGUMENT TOO, since they live in the database now
 * (lib/content.ts) and arrive only when a deck is opened. What only needs to
 * COUNT (Home's feed, Progress's tips) uses deckStates(), which works from the
 * manifest's card ids and so downloads no deck at all.
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
  official: PracticeCard[],
  studentCards: Record<string, PracticeCard[]>,
  cardReviews: Record<string, ReviewState>,
  now: Date = new Date()
): QueueCard[] {
  const all = [...official, ...(studentCards[deckKey] ?? [])];
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
  official: PracticeCard[],
  studentCards: Record<string, PracticeCard[]>,
  cardReviews: Record<string, ReviewState>,
  now: Date = new Date()
): QueueCard[] {
  return cardsFor(deckKey, official, studentCards, cardReviews, now).filter((qc) =>
    isDue(qc.state, now)
  );
}

/** A card's review state without its text: enough to count with. */
export interface CardState {
  id: string;
  deckKey: string;
  state: ReviewState;
}

/** One deck's cards as ids and states: the official ids from the manifest,
 *  then this student's own cards. No deck body needed. */
export function deckStates(
  deckKey: string,
  officialIds: string[],
  studentCards: Record<string, PracticeCard[]>,
  cardReviews: Record<string, ReviewState>,
  now: Date = new Date()
): CardState[] {
  const ids = [...officialIds, ...(studentCards[deckKey] ?? []).map((c) => c.id)];
  return ids.map((id) => ({ id, deckKey, state: cardReviews[id] ?? initialReviewState(now) }));
}

/** Deck keys in curriculum order ("biology-2-1" before "biology-10-1"). */
function byCurriculum(keys: string[]): string[] {
  return [...keys].sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
}

/**
 * Cards due again that the student HAS graded before, across every published
 * deck, for Progress's study tips. A never-seen card is "due" to the scheduler,
 * and counting those would nag a student about a deck they have never opened.
 */
export function gradedDueCount(
  manifest: ContentManifest,
  studentCards: Record<string, PracticeCard[]>,
  cardReviews: Record<string, ReviewState>,
  now: Date = new Date()
): number {
  return Object.keys(manifest.deck).reduce(
    (n, key) =>
      n +
      deckStates(key, manifest.deck[key].ids, studentCards, cardReviews, now).filter(
        (c) => cardReviews[c.id] !== undefined && isDue(c.state, now)
      ).length,
    0
  );
}

/** Due cards across EVERY published deck: the Daily Review queue. `decks` is
 *  every deck's official cards (lib/content.ts's useAllBodies). */
export function allDueCards(
  decks: Record<string, PracticeCard[]>,
  studentCards: Record<string, PracticeCard[]>,
  cardReviews: Record<string, ReviewState>,
  now: Date = new Date()
): QueueCard[] {
  return byCurriculum(Object.keys(decks)).flatMap((key) =>
    dueCardsFor(key, decks[key], studentCards, cardReviews, now)
  );
}

/** EVERY card across every published deck, due or not: the fallback queue
 *  for "review anyway" when nothing is due. */
export function allCards(
  decks: Record<string, PracticeCard[]>,
  studentCards: Record<string, PracticeCard[]>,
  cardReviews: Record<string, ReviewState>,
  now: Date = new Date()
): QueueCard[] {
  return byCurriculum(Object.keys(decks)).flatMap((key) =>
    cardsFor(key, decks[key], studentCards, cardReviews, now)
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
export function rememberedCards<T extends { state: ReviewState }>(cards: T[]): T[] {
  return cards.filter(
    (qc) => qc.state.lastGrade === "good" || qc.state.lastGrade === "easy"
  );
}

export function notRememberedCards<T extends { state: ReviewState }>(cards: T[]): T[] {
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
 * stored — the app-wide rule for counts: a stored progress figure
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

export function deckProgress(cards: { state: ReviewState }[]): DeckProgress {
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
  // `lastReviewedAt` is a full ISO INSTANT, so slicing it gives the UTC date.
  // Parse it back and re-derive the LOCAL day, matching every other day
  // boundary in the app — see utils/day.ts. Slicing both sides looked
  // self-consistent and was: consistently seven hours out for the audience.
  const today = todayKey(now);
  return Object.values(cardReviews).filter(
    (s) => s.lastReviewedAt !== null && todayKey(new Date(s.lastReviewedAt)) === today
  ).length;
}
