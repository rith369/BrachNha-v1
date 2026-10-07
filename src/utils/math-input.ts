import type { VirtualKeyboardName } from "mathlive";

/**
 * Caret arithmetic for the chat composer.
 *
 * Pure functions only — this is `utils/`, not `lib/`. Nothing here touches the
 * DOM or the store; the caller reads `selectionStart`/`selectionEnd` off the
 * input, passes them in, and applies the returned value + caret itself.
 */

export interface EditResult {
  value: string;
  caret: number;
}

/** Splices text in at the cursor, replacing any selected range. */
export function applyInsert(
  value: string,
  start: number,
  end: number,
  text: string
): EditResult {
  const from = Math.min(start, end);
  const to = Math.max(start, end);

  return {
    value: value.slice(0, from) + text + value.slice(to),
    caret: from + text.length,
  };
}

/**
 * Which virtual keyboard layout to open on, based on the page the chat overlay
 * is sitting on top of.
 *
 * The overlay is global — `chatOpen` is a bare boolean in the store and the FAB
 * renders on every page — so the route is the only honest signal of what the
 * student was looking at. Section ids are `<subject>-<chapter>-<lesson>-<n>`,
 * so the subject is the first segment of the id.
 *
 * These are MathLive's stock layout names, so the mapping is coarser than the
 * five hand-built tabs it replaces: physics and chemistry both want Greek
 * letters within reach, everything else starts on the digits.
 */
export function defaultMathLayout(pathname: string | null): VirtualKeyboardName {
  const subject = subjectFromPath(pathname);
  if (subject === "physics" || subject === "chemistry") return "greek";
  return "numeric";
}

/**
 * The subject a route is about, or null.
 *
 * TWO PATTERNS, because the subject sits in a different place in each. On a
 * section it is the first id segment (`biology-3-1-1`); on a practice route
 * the mode comes first, so the subject is its own third segment
 * (`/practice/quiz/physics/1-1`).
 */
function subjectFromPath(pathname: string | null): string | null {
  const practice = pathname?.match(/^\/practice\/[^/?#]+\/([^/?#]+)/);
  if (practice) return decodeURIComponent(practice[1]);

  const section = pathname?.match(/^\/sections\/([^/?#]+)/);
  if (section) return decodeURIComponent(section[1]).split("-")[0];

  return null;
}
