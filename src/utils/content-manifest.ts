import type { ContentKind, DeckCardBody, PracticeCard, QuizQuestionBody } from "@/types";

/**
 * WHAT IS PUBLISHED: the small list a student's phone downloads once per app
 * load (lib/content.ts), one entry per flashcard deck, practice quiz, lesson
 * section, past paper and Battle question pool. It is the database's
 * `content_items` table (supabase/migrations/20261003000001, 20261003000002
 * and 20261007000001), published rows only.
 *
 * Everything that decides what EXISTS (a lesson row's count, a quiz node's
 * link, a Study-path node's link, an exam card, Home's study feed, the
 * prediction's playable sections) reads this rather than a body, so those
 * screens never download a single lesson. A body is fetched only when a deck,
 * quiz, section or paper is opened, or a Battle is about to be created.
 *
 * PURE, and passed in as an ARGUMENT to every function that reads it. The
 * React Compiler memoises a component on what it reads; a helper that reached
 * into module state on its own would be memoised around and keep showing an
 * old answer after the manifest arrived.
 */

export interface ContentEntry {
  version: number;
  /** Cards, questions, a section's questions (may be 0: a section need not
   *  ask any), or a paper's scored questions and gaps. The database's
   *  content_count(). */
  count: number;
}

export interface DeckEntry extends ContentEntry {
  /** The card ids, in order. Review history is keyed by them, so Home and
   *  Progress can count due cards without the cards themselves. */
  ids: string[];
}

export type QuizEntry = ContentEntry;
export type SectionEntry = ContentEntry;
export type PaperEntry = ContentEntry;
export type GameEntry = ContentEntry;

export interface ContentManifest {
  /**
   * "loading": nothing read yet on this device (the first ever open).
   * "ready": a list is in hand, from the network or from the device's copy.
   * "failed": the first ever open, and the network did not answer.
   */
  status: "loading" | "ready" | "failed";
  deck: Record<string, DeckEntry>;
  quiz: Record<string, QuizEntry>;
  section: Record<string, SectionEntry>;
  paper: Record<string, PaperEntry>;
  /** Battle question pools, keyed by subject id ("math"). */
  game: Record<string, GameEntry>;
}

/** For callers that need the curriculum's SHAPE and not what is published
 *  (the admin's list of places, a path's structure). */
export const EMPTY_MANIFEST: ContentManifest = {
  status: "ready",
  deck: {},
  quiz: {},
  section: {},
  paper: {},
  game: {},
};

/** A key as the database stores it, per kind (content_key_ok() in SQL, with
 *  the subject checked separately where it matters): "biology-1-1",
 *  "math-1-1-1", "biology-3-1-1", "2025-math", "math". */
export const CONTENT_KEY: Record<ContentKind, RegExp> = {
  deck: /^[a-z]+-\d{1,3}-\d{1,3}$/,
  quiz: /^[a-z]+-\d{1,3}-\d{1,3}(-\d{1,3})?$/,
  section: /^[a-z]+-\d{1,3}-\d{1,3}-\d{1,3}$/,
  paper: /^20\d{2}-[a-z]+$/,
  game: /^[a-z]+$/,
};

/** The published entry for one item, or null. `Object.hasOwn`, never `in`:
 *  the key can come from a URL, and "constructor" is `in` every object. */
export function contentEntry(
  manifest: ContentManifest,
  kind: ContentKind,
  key: string
): ContentEntry | null {
  const map: Record<string, ContentEntry> = manifest[kind];
  return Object.hasOwn(map, key) ? map[key] : null;
}

export function deckEntry(manifest: ContentManifest, key: string): DeckEntry | null {
  return Object.hasOwn(manifest.deck, key) ? manifest.deck[key] : null;
}

export function quizEntry(manifest: ContentManifest, key: string): QuizEntry | null {
  return contentEntry(manifest, "quiz", key);
}

/** Whether a lesson section is published. NOT its count: a section with no
 *  questions is still a section a student can read. */
export function sectionPublished(manifest: ContentManifest, id: string): boolean {
  return contentEntry(manifest, "section", id) !== null;
}

/** Whether a subject has at least one published lesson section. */
export function subjectHasSections(manifest: ContentManifest, subjectId: string): boolean {
  return Object.keys(manifest.section).some((id) => id.startsWith(`${subjectId}-`));
}

/** Questions in a subject's published Battle pool, 0 when there is none. */
export function gameCount(manifest: ContentManifest, subjectId: string): number {
  return contentEntry(manifest, "game", subjectId)?.count ?? 0;
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
  return contentEntry(manifest, kind, key)?.version ?? null;
}

/**
 * A body's count, the same rule as the database's content_count(): for the
 * development fixture, which has bodies and no manifest of its own.
 */
export function bodyCount(kind: ContentKind, body: unknown): number {
  if (kind === "deck" || kind === "quiz" || kind === "game") return Array.isArray(body) ? body.length : 0;
  if (typeof body !== "object" || body === null) return 0;
  const b = body as Record<string, unknown>;
  const len = (v: unknown) => (Array.isArray(v) ? v.length : 0);
  if (kind === "section") return len(b.quiz) + len(b.quizHarder);
  const parts = Array.isArray(b.sections) ? (b.sections as Record<string, unknown>[]) : [];
  return parts.reduce((n, p) => {
    const gaps = (p?.gapFill as { gaps?: { example?: boolean }[] } | undefined)?.gaps;
    return n + len(p?.questions) + (Array.isArray(gaps) ? gaps.filter((g) => !g?.example).length : 0);
  }, 0);
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
