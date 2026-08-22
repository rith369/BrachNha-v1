import type { MathKey, MathTabId } from "@/data/math-keys";

/**
 * Caret arithmetic for the math keyboard.
 *
 * Pure functions only — this is `utils/`, not `lib/`. Nothing here touches the
 * DOM or the store; the caller reads `selectionStart`/`selectionEnd` off the
 * input, passes them in, and applies the returned value + caret itself.
 */

export interface EditResult {
  value: string;
  caret: number;
}

/** Splices a key's text in at the cursor, replacing any selected range. */
export function applyInsert(
  value: string,
  start: number,
  end: number,
  key: MathKey
): EditResult {
  const text = key.insert ?? key.label;
  const from = Math.min(start, end);
  const to = Math.max(start, end);

  // key.caret counts back from the end of the inserted text, so a "()" key with
  // caret -1 drops the cursor between the brackets. Clamped so a bad entry in
  // math-keys.ts can never push the caret outside the text it just inserted.
  const offset = Math.min(0, Math.max(-text.length, key.caret ?? 0));

  return {
    value: value.slice(0, from) + text + value.slice(to),
    caret: from + text.length + offset,
  };
}

type SegmentData = { segment: string; index: number };
type SegmenterLike = { segment(input: string): Iterable<SegmentData> };
type SegmenterCtor = new (
  locales?: string | string[],
  options?: { granularity?: "grapheme" | "word" | "sentence" }
) => SegmenterLike;

let segmenter: SegmenterLike | null | undefined;

function graphemeSegmenter(): SegmenterLike | null {
  if (segmenter !== undefined) return segmenter;
  const ctor = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter;
  segmenter = ctor ? new ctor(undefined, { granularity: "grapheme" }) : null;
  return segmenter;
}

/**
 * How many UTF-16 code units the last user-perceived character occupies.
 *
 * This is the difference between backspace working and backspace shredding
 * Khmer. Khmer stacks coeng consonants (U+17D2 + a consonant) and vowel signs
 * as combining marks, so "ក្ស" is three code points that render as one glyph —
 * `slice(0, -1)` would delete the final consonant and leave a naked coeng sign
 * hanging off the previous letter. Emoji and the superscript/subscript pairs in
 * math-keys.ts have the same problem in milder form.
 */
function lastClusterLength(text: string): number {
  if (!text) return 0;

  const seg = graphemeSegmenter();
  if (seg) {
    let last = 0;
    for (const { index } of seg.segment(text)) last = index;
    return text.length - last;
  }

  // Fallback for engines without Intl.Segmenter: step back over any combining
  // marks (\p{M} covers Khmer's Mn/Mc signs), then take the base character —
  // which may itself be a surrogate pair.
  let i = text.length;
  while (i > 0) {
    const cp = text.codePointAt(charStart(text, i))!;
    const size = cp > 0xffff ? 2 : 1;
    i -= size;
    if (!/\p{M}/u.test(String.fromCodePoint(cp))) break;
  }
  return text.length - i;
}

/** Index of the code point that ends at `end`, accounting for surrogate pairs. */
function charStart(text: string, end: number): number {
  const prev = text.charCodeAt(end - 1);
  if (prev >= 0xdc00 && prev <= 0xdfff && end >= 2) {
    const before = text.charCodeAt(end - 2);
    if (before >= 0xd800 && before <= 0xdbff) return end - 2;
  }
  return end - 1;
}

/** Deletes the selection, or one whole grapheme cluster before the cursor. */
export function applyBackspace(
  value: string,
  start: number,
  end: number
): EditResult {
  const from = Math.min(start, end);
  const to = Math.max(start, end);

  if (from !== to) {
    return { value: value.slice(0, from) + value.slice(to), caret: from };
  }
  if (from === 0) return { value, caret: 0 };

  const cut = from - lastClusterLength(value.slice(0, from));
  return { value: value.slice(0, cut) + value.slice(from), caret: cut };
}

/**
 * Which tab to open on, based on the page the chat overlay is sitting on top of.
 *
 * The overlay is global — `chatOpen` is a bare boolean in the store and the FAB
 * renders on every page — so the route is the only honest signal of what the
 * student was looking at. Lesson ids are `<subject>-<topic>` (see
 * getLessonData in features/lessons/components/lesson-detail.tsx).
 */
export function defaultMathTab(pathname: string | null): MathTabId {
  const match = pathname?.match(/^\/lessons\/([^/?#]+)/);
  if (!match) return "basic";

  const [subject, topic] = decodeURIComponent(match[1]).split("-");
  if (subject === "physics") return "physics";
  if (subject === "chemistry") return "chemistry";
  // Math is the one subject that spans two tabs; only "limits" is calculus
  // among the lessons that exist today.
  if (subject === "math") return topic === "limits" ? "calculus" : "algebra";
  return "basic";
}
