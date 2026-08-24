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
 * student was looking at. Lesson ids are `<subject>-<topic>` (see
 * getLessonData in features/lessons/components/lesson-detail.tsx).
 *
 * These are MathLive's stock layout names, so the mapping is coarser than the
 * five hand-built tabs it replaces: physics and chemistry both want Greek
 * letters within reach, everything else starts on the digits.
 */
export function defaultMathLayout(pathname: string | null): VirtualKeyboardName {
  const match = pathname?.match(/^\/lessons\/([^/?#]+)/);
  if (!match) return "numeric";

  const [subject] = decodeURIComponent(match[1]).split("-");
  if (subject === "physics" || subject === "chemistry") return "greek";
  return "numeric";
}
