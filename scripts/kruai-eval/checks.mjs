/**
 * What makes a KruAI reply pass. PURE: it takes a reply and returns results, so
 * `--self-test` can prove each check catches what it claims to without a model.
 *
 * HARD checks are the rules students rely on (a wrong answer, an em dash, a
 * formula that shows as raw LaTeX). SOFT checks are reported and do not fail a
 * case, because the model has reasonable freedom there.
 *
 * WHAT THIS CANNOT JUDGE: whether the Khmer reads naturally, or whether the
 * reasoning between the question and a correct final answer is sound. A person
 * reads a sample for that, and `results/latest.md` is written for them.
 */

const KHMER_LETTER = /[ក-៝]/g;
const LATIN_LETTER = /[A-Za-z]/g;
const KHMER_DIGIT = /[០-៩]/;
const VENDOR = /gemini|google|openai|chatgpt|gpt-|anthropic|claude|llama|deepmind/i;
const GUIDE_MARK = "🧭";

const SUBSCRIPT = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };
const SUPERSCRIPT = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };

/**
 * One spelling for the many ways the model writes the same maths, so an answer
 * key needs one or two forms rather than twenty.
 */
export function normalise(input) {
  let s = input
    .replace(/\$/g, "")
    .replace(/\\left|\\right|\\displaystyle/g, "")
    .replace(/\\[,;:! ]/g, "")
    .replace(/\\[dt]frac/g, "\\frac")
    .replace(/[₀-₉]/g, (c) => `_${SUBSCRIPT[c]}`)
    .replace(/[⁰¹²³⁴-⁹]/g, (c) => `^${SUPERSCRIPT[c]}`)
    .replace(/[−–]/g, "-");
  // Twice, for a wrapper inside a wrapper.
  for (let i = 0; i < 2; i++) {
    s = s.replace(/\\(?:mathrm|text|mathbf|boxed)\{([^{}]*)\}/g, "$1");
  }
  return s
    .replace(/_\{(\w)\}/g, "_$1")
    .replace(/\^\{(\w)\}/g, "^$1")
    .replace(/\s+/g, "");
}

/**
 * Is this form in the reply, as a whole value? "=3" must not match "=30", "=3x"
 * or "=3/2", or a wrong answer could pass on the right answer's first digit.
 */
export function hasForm(reply, form) {
  const text = normalise(reply);
  const needle = normalise(form);
  let at = text.indexOf(needle);
  while (at !== -1) {
    const next = text[at + needle.length] ?? "";
    if (!/[0-9a-zA-Z.\\/^]/.test(next)) return true;
    at = text.indexOf(needle, at + 1);
  }
  return false;
}

const hasAny = (reply, forms) => forms.some((form) => hasForm(reply, form));

/** A plain phrase, in any case and any spacing: Khmer or Latin. */
function mentions(reply, terms) {
  const text = normalise(reply).toLowerCase();
  return terms.some((term) => text.includes(normalise(term).toLowerCase()));
}

function textSegments(reply, splitMath) {
  return splitMath(reply).filter((s) => s.type === "text").map((s) => s.value);
}

/** How much of the reply's prose is Khmer rather than Latin. */
export function khmerShare(reply, splitMath) {
  const prose = textSegments(reply, splitMath).join(" ");
  const khmer = prose.match(KHMER_LETTER)?.length ?? 0;
  const latin = prose.match(LATIN_LETTER)?.length ?? 0;
  return khmer + latin === 0 ? 0 : khmer / (khmer + latin);
}

function mathProblem(reply, { splitMath, katex }) {
  for (const seg of splitMath(reply)) {
    if (seg.type === "math") {
      try {
        katex.renderToString(seg.value, { throwOnError: true, displayMode: seg.display });
      } catch (err) {
        return `KaTeX refused "${seg.value.slice(0, 50)}": ${String(err.message).slice(0, 60)}`;
      }
      // KaTeX accepts these and prints the letters "mathrm", so nothing errors.
      if (/(^|[^\\a-zA-Z])(mathrm|frac|sqrt|theta|times|rightarrow|cdot)\b/.test(seg.value)) {
        return `a command lost its backslash: "${seg.value.slice(0, 50)}"`;
      }
    } else {
      if (/\\[a-zA-Z]{2,}/.test(seg.value)) return `raw LaTeX on screen: "${seg.value.slice(0, 50)}"`;
      // "$20" is money. Any other dollar left in the text is a formula that did
      // not render, and the student reads its source.
      if (/\$(?!\d)/.test(seg.value)) return `a stray $ on screen: "${seg.value.slice(0, 50)}"`;
    }
  }
  return null;
}

/**
 * Every rule for one reply.
 * `expect` comes from cases.mjs; `tools` is the app's own { splitMath, katex }.
 */
export function checkReply(reply, expect, tools, meta = {}) {
  const out = [];
  const hard = (id, ok, detail = "") => out.push({ id, ok, hard: true, detail: ok ? "" : detail });
  const soft = (id, ok, detail = "") => out.push({ id, ok, hard: false, detail: ok ? "" : detail });

  // ── every reply ──────────────────────────────────────────────────────────
  hard("not-empty", reply.trim().length > 0, "empty reply");
  // Every answer from the model ends with a usage report. None means the stream
  // stopped early with no error, and the student sees a cut-off answer as if it
  // were finished. (A curated answer never reaches the model, so it has none.)
  if (!expect.curated) hard("not-cut-off", meta.tokens !== null && meta.tokens !== undefined, "the stream ended early, so this answer is cut off");
  const share = khmerShare(reply, tools.splitMath);
  const minShare = expect.khmerShare ?? 0.5;
  hard("in-khmer", share >= minShare, `only ${Math.round(share * 100)}% of the prose is Khmer`);
  hard("no-em-dash", !reply.includes("—"), "contains an em dash");
  hard("latin-digits", !KHMER_DIGIT.test(reply), "contains a Khmer numeral");
  hard("no-vendor-name", !VENDOR.test(reply), `names a vendor: ${VENDOR.exec(reply)?.[0]}`);
  hard("no-sparkle", !reply.includes("✨"), "contains the sparkle emoji");
  const problem = mathProblem(reply, tools);
  hard("math-renders", problem === null, problem ?? "");
  const wordDash = textSegments(reply, tools.splitMath).some((t) =>
    /\p{L} [-–] \p{L}/u.test(t)
  );
  soft("no-word-dash", !wordDash, "a dash between words");

  // ── this reply ───────────────────────────────────────────────────────────
  const guided = reply.trimStart().startsWith(GUIDE_MARK);
  if (expect.guided === true) hard("guides-first", guided, "expected a guided reply starting with 🧭");
  if (expect.guided === false) hard("answers-directly", !guided, "guided when it should answer directly");

  if (expect.answer) {
    hard("correct-answer", hasAny(reply, expect.answer), `expected one of: ${expect.answer.join("  |  ")}`);
  }
  if (expect.leak) {
    const leaked = expect.leak.find((form) => hasForm(reply, form));
    hard("does-not-give-answer", !leaked, `gave away ${leaked}`);
  }
  for (const group of expect.mentions ?? []) {
    hard(`mentions:${group[0]}`, mentions(reply, group), `expected one of: ${group.join("  |  ")}`);
  }
  for (const pattern of expect.forbid ?? []) {
    const re = new RegExp(pattern, "iu");
    hard(`forbids:${pattern}`, !re.test(reply), `must not say: ${re.exec(reply)?.[0]}`);
  }
  if (expect.formal) {
    hard(
      "formal-answer",
      /ចម្លើយ/.test(reply) && /ដូចនេះ/.test(reply),
      "no formal exam answer (ចម្លើយ … ដូចនេះ)"
    );
  }
  if (expect.table) hard("has-table", /^\s*\|.*\|\s*$/m.test(reply) && /\|\s*:?-{2,}/.test(reply), "no table");
  if (expect.noTable) soft("no-table", !/\|\s*:?-{2,}/.test(reply), "a table where none was wanted");
  if (expect.steps === true) soft("has-steps", /^\s*1\s*[.)]/m.test(reply), "long form expected numbered steps");
  if (expect.steps === false) soft("no-steps", !/^\s*2\s*[.)]/m.test(reply), "short form expected no numbered steps");
  if (expect.maxChars) soft("short", reply.length <= expect.maxChars, `${reply.length} characters, wanted ${expect.maxChars} or fewer`);
  if (expect.sibling) {
    hard("sibling-voice", /ប្អូន/.test(reply) || (expect.name ? reply.includes(expect.name) : false), "does not call the student ប្អូន or by name");
  }
  if (expect.curated) hard("curated-free", meta.tokens === null, "used the model; expected a curated answer");
  return out;
}

export function passed(results) {
  return results.every((r) => !r.hard || r.ok);
}
