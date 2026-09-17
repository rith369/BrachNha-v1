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

/** Something that appears in TeX and essentially never in a sentence: a
 *  backslash command, a super/subscript, or a brace. See looksLikeMath. */
const TEX_MARKER = /\\[A-Za-z]|[\^_{}]/;

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
  if (!/^\s|\s$/.test(tex)) return true;

  // ...EXCEPT when what sits between the padded dollars is unmistakably TeX.
  //
  // The model writes `$ \mathrm{CH_4} $` often, and no prompt instruction
  // stops it. Measured on "balance the combustion of CH₄" once the prompt's
  // LaTeX rules were fixed (data/bac2-format.ts): 5 of 6 answers padded
  // their formulas, 30 raw dollar signs in one reply, and an explicit "no
  // space inside the dollars" rule changed nothing (3 of 3 still padded). The
  // student saw the source code of every formula.
  //
  // So the whitespace rule now guards only what it was written for — prose
  // dollars pairing up. " and " contains no backslash command, no ^ or _ and
  // no brace, so "costs $ and $x^2$" still refuses to pair the wrong two. A
  // padded span that DOES contain one is a formula by any reading, and KaTeX
  // ignores spaces in math mode, so it renders identically unpadded.
  return TEX_MARKER.test(tex);
}

/** A text-mode command whose argument the model fills with words. Sticky, so it
 *  matches only at the index it is pointed at. */
const TEXT_COMMAND = /\\(?:text|textrm|mathrm|mbox)\s*\{/y;

/** Index of the `}` closing a group whose `{` sits just before `start`, or -1.
 *  An escaped `\{` or `\}` does not count. */
function closingBrace(tex: string, start: number): number {
  let depth = 1;
  for (let i = start; i < tex.length; i++) {
    const ch = tex[i];
    if (ch === "\\") {
      i++;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return i;
  }
  return -1;
}

/**
 * A formula with Khmer words inside `\text{…}`, split into math and plain text —
 * or null when it is anything less clear-cut than that.
 *
 * The model writes `$\mathrm{Au} + \mathrm{H_2O} \to \text{គ្មានប្រតិកម្ម}$`
 * ("no reaction") although data/bac2-format.ts tells it not to put Khmer in
 * \text{}. The Khmer guard in looksLikeMath then refuses the WHOLE formula and
 * the student reads raw LaTeX — the same all-or-nothing failure the padding
 * rule had, and prompt instructions have already been shown not to fix that
 * class of habit (see the padding note in looksLikeMath).
 *
 * So the Khmer comes OUT of the formula instead: the math before and after it
 * is typeset, and the words become an ordinary text segment in the page's
 * Khmer font. That keeps the guard's promise — KaTeX never receives a Khmer
 * glyph — while no longer throwing the chemistry away with it.
 *
 * Returns null, leaving today's safe behaviour, whenever the split would be a
 * guess:
 *   - Khmer anywhere OUTSIDE a text command (prose dollars in a Khmer sentence
 *     look exactly like that, and must stay text);
 *   - a text command nested inside a group, e.g. `\frac{\text{ខ្មែរ}}{2}` —
 *     cutting there would leave unbalanced braces;
 *   - a text argument holding a backslash or a dollar, which is not plain words;
 *   - inline math spanning a newline, the same rule looksLikeMath applies.
 *
 * Every piece is emitted INLINE, even from a `$$…$$` block: a display formula
 * followed by its own words on the next line reads worse than one flowing line.
 */
function liftKhmerText(tex: string, display: boolean): MathSegment[] | null {
  if (!display && tex.includes("\n")) return null;

  const parts: MathSegment[] = [];
  let math = "";
  let depth = 0;
  let lifted = false;

  const pushMath = () => {
    const value = math.trim();
    if (value) parts.push({ type: "math", value, display: false });
    math = "";
  };

  let i = 0;
  while (i < tex.length) {
    const ch = tex[i];

    if (ch === "\\" && depth === 0) {
      TEXT_COMMAND.lastIndex = i;
      const command = TEXT_COMMAND.exec(tex);
      if (command) {
        const open = i + command[0].length;
        const close = closingBrace(tex, open);
        if (close === -1) return null;
        const words = tex.slice(open, close);

        if (KHMER.test(words)) {
          if (words.includes("\\") || words.includes("$")) return null;
          pushMath();
          parts.push({ type: "text", value: words.trim() });
          lifted = true;
        } else {
          // A text command with no Khmer in it is ordinary TeX. Keep it whole.
          math += tex.slice(i, close + 1);
        }
        i = close + 1;
        continue;
      }
    }

    if (ch === "\\") {
      // Any other command or escaped character, copied as a unit so an escaped
      // brace is never counted as a group.
      math += tex.slice(i, i + 2);
      i += 2;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    math += ch;
    i++;
  }
  pushMath();

  if (!lifted) return null;
  // Khmer left in a math piece was not inside a top-level text command.
  if (parts.some((p) => p.type === "math" && KHMER.test(p.value))) return null;

  // Space the words off the formula beside them; the delimiters that used to
  // separate them are gone.
  return parts.map((part, n) => {
    if (part.type !== "text") return part;
    const before = parts[n - 1]?.type === "math" ? " " : "";
    const after = parts[n + 1]?.type === "math" ? " " : "";
    return { type: "text", value: `${before}${part.value}${after}` };
  });
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
        // A formula refused only because Khmer sits inside a \text{…} can be
        // split into math and plain text rather than shown as raw source.
        // See liftKhmerText.
        const lifted = KHMER.test(tex) ? liftKhmerText(tex, display) : null;
        if (lifted) {
          flush();
          segments.push(...lifted);
          i = close + delim.length;
          continue;
        }

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
