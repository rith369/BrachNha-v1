import type { ContentKind, DeckCardBody, PracticeCard, QuizQuestionBody } from "@/types";

/**
 * WHAT IS PUBLISHED: the small list a student's phone downloads once per app
 * load (lib/content.ts), one entry per flashcard deck and practice quiz. It is
 * the database's `content_items` table (supabase/migrations/20261003000001),
 * published rows only.
 *
 * Everything that decides what EXISTS (a lesson row's count, a quiz node's
 * link, Home's study feed, the prediction's playable sections) reads this
 * rather than a body, so those screens never download a single lesson. A body
 * is fetched only when a deck or quiz is opened.
 *
 * PURE, and passed in as an ARGUMENT to every function that reads it. The
 * React Compiler memoises a component on what it reads; a helper that reached
 * into module state on its own would be memoised around and keep showing an
 * old answer after the manifest arrived.
 */

export interface DeckEntry {
  version: number;
  count: number;
  /** The card ids, in order. Review history is keyed by them, so Home and
   *  Progress can count due cards without the cards themselves. */
  ids: string[];
}

export interface QuizEntry {
  version: number;
  count: number;
}

export interface ContentManifest {
  /**
   * "loading": nothing read yet on this device (the first ever open).
   * "ready": a list is in hand, from the network or from the device's copy.
   * "failed": the first ever open, and the network did not answer.
   */
  status: "loading" | "ready" | "failed";
  deck: Record<string, DeckEntry>;
  quiz: Record<string, QuizEntry>;
}

/** For callers that need the curriculum's SHAPE and not what is published
 *  (the admin's list of places, a path's structure). */
export const EMPTY_MANIFEST: ContentManifest = { status: "ready", deck: {}, quiz: {} };

/** A key as the database stores it: "biology-1-1", "math-1-1-1". */
export const CONTENT_KEY = /^[a-z]+-\d{1,3}-\d{1,3}(-\d{1,3})?$/;

/** The published entry for a deck, or null. `Object.hasOwn`, never `in`: the
 *  key can come from a URL, and "constructor" is `in` every object. */
export function deckEntry(manifest: ContentManifest, key: string): DeckEntry | null {
  return Object.hasOwn(manifest.deck, key) ? manifest.deck[key] : null;
}

export function quizEntry(manifest: ContentManifest, key: string): QuizEntry | null {
  return Object.hasOwn(manifest.quiz, key) ? manifest.quiz[key] : null;
}

/** Cards in a published deck, 0 when there is none. */
export function deckCount(manifest: ContentManifest, key: string): number {
  return deckEntry(manifest, key)?.count ?? 0;
}

/** Questions in a published quiz, 0 when there is none. */
export function quizCount(manifest: ContentManifest, key: string): number {
  return quizEntry(manifest, key)?.count ?? 0;
}

export function entryVersion(
  manifest: ContentManifest,
  kind: ContentKind,
  key: string
): number | null {
  return (kind === "deck" ? deckEntry(manifest, key) : quizEntry(manifest, key))?.version ?? null;
}

/**
 * A stored card as the app's PracticeCard. The timestamps are when this
 * version was published: nothing reads them for an official card, but the type
 * asks for them and a made-up date would be worse than a real one.
 */
export function toPracticeCards(body: DeckCardBody[], publishedAt: string): PracticeCard[] {
  return body.map((card) => ({
    id: card.id,
    front: card.front,
    back: card.back,
    source: "official",
    createdAt: publishedAt,
    updatedAt: publishedAt,
  }));
}

/** Quiz bodies are already the SectionQuestion shape, with their stable ids. */
export type QuizBody = QuizQuestionBody[];
