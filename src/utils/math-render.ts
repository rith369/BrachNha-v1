/**
 * Splits a mentor reply into plain-text and LaTeX segments.
 *
 * Pure function — the KaTeX call itself lives in
 * components/shell/math-text.tsx. The model is told to emit `$…$` for inline
 * math and `$$…$$` for display math (see data/bac2-format.ts).
 *
 * The important case is STREAMING. `appendChatChunk` fills the bubble a few
 * characters at a time, so mid-reply the text routinely ends in an unclosed
 * delimiter — `…រូបមន្ត $\fra`. An unterminated `$` is therefore treated as
 * ordinary text, not as math-so-far: the student sees the raw fragment for a
 * moment and it snaps into typeset math the instant the closing `$` arrives.
 * Never try to render partial TeX; KaTeX chokes and the bubble flickers red.
 */

export type MathSegment =
  | { type: "text"; value: string }
  | { type: "math"; value: string; display: boolean };

/** Khmer block, U+1780–U+17FF. */
const KHMER = /[ក-៿]/;

/**
 * Is this really a formula, or two stray dollar signs that happened to pair up
 * across a sentence?
 *
 * KaTeX substitutes its own math fonts, which carry no Khmer glyphs, so Khmer
 * caught between two dollar signs renders as a row of empty boxes. The prompt
 * forbids the model from putting Khmer inside math (data/bac2-format.ts), but
 * "the model was told not to" is not a guarantee — one stray `$` in a long
 * Khmer answer would otherwise turn a whole paragraph into tofu, which is a
 * far worse failure than showing a literal dollar sign.
 *
 * Inline math additionally may not span a newline; that is the usual TeX rule
 * and it stops an unmatched `$` from swallowing the rest of a reply.
 */
function looksLikeMath(tex: string, display: boolean): boolean {
  if (!tex.trim()) return false;
  if (KHMER.test(tex)) return false;
  if (display) return true;

  // Inline math may not span a newline, and — the usual TeX/markdown rule —
  // may not have whitespace hugging either delimiter. That is what keeps the
  // two dollars in "costs $ and $x^2$" from pairing with each other and
  // stealing the real formula that follows.
  if (tex.includes("\n")) return false;
  return !/^\s|\s$/.test(tex);
}

export function splitMath(input: string): MathSegment[] {
  const segments: MathSegment[] = [];
  let buffer = "";
  let i = 0;

  const flush = () => {
    if (buffer) segments.push({ type: "text", value: buffer });
    buffer = "";
  };

  while (i < input.length) {
    const char = input[i];

    // \$ is an escaped literal dollar sign.
    if (char === "\\" && input[i + 1] === "$") {
      buffer += "$";
      i += 2;
      continue;
    }

    if (char === "$") {
      const display = input[i + 1] === "$";
      const delim = display ? "$$" : "$";
      const close = input.indexOf(delim, i + delim.length);

      if (close === -1) {
        // Unterminated: either mid-stream, or a stray dollar. Literal text.
        buffer += input.slice(i);
        break;
      }

      const tex = input.slice(i + delim.length, close);
      if (!looksLikeMath(tex, display)) {
        // Not a formula. Emit just this delimiter as text and keep scanning
        // from the next character, so a genuine `$…$` later in the line can
        // still open correctly.
        buffer += delim;
        i += delim.length;
        continue;
      }

      flush();
      segments.push({ type: "math", value: tex, display });
      i = close + delim.length;
      continue;
    }

    buffer += char;
    i++;
  }

  flush();
  return tidyDisplayGaps(segments);
}

/**
 * Bubbles render with `whitespace-pre-wrap`, and the model naturally puts a
 * newline either side of a display formula. Since a `$$` block is already its
 * own block element, those newlines would show up as an extra blank line above
 * and below it. Absorb one on each side.
 */
function tidyDisplayGaps(segments: MathSegment[]): MathSegment[] {
  segments.forEach((segment, i) => {
    if (segment.type !== "math" || !segment.display) return;

    const before = segments[i - 1];
    if (before?.type === "text") {
      before.value = before.value.replace(/\n[ \t]*$/, "");
    }
    const after = segments[i + 1];
    if (after?.type === "text") {
      after.value = after.value.replace(/^[ \t]*\n/, "");
    }
  });

  return segments.filter((s) => s.type !== "text" || s.value !== "");
}
