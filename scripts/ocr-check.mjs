// Flags pages of OCR output that a Khmer reader should look at FIRST.
//
//   node scripts/ocr-check.mjs sources/ocr/biology-png/gemini-3-flash-preview
//
// It cannot tell whether a Khmer word is the right one — only a person can, and
// nothing here should be read as "the rest is correct". What it catches is the
// class of failure that is mechanical and therefore invisible to a reader
// skimming for sense:
//
//   - a script the book does not contain. Measured 18 Sep 2026: the model
//     dropped the Arabic word نبات into a Khmer sentence on page 227. The book
//     has no Arabic, so any Arabic/Thai/Chinese/… run is invented.
//   - LaTeX where a DRAWN structure was (see the figure rule in ocr-pages.mjs) —
//     stacking commands are the signature of a molecule drawing being copied as
//     if it were one line of text.
//   - Khmer inside $…$, which KaTeX renders as empty boxes in the app (the same
//     rule utils/math-render.ts enforces on KruAI's answers).
//   - a page that came back suspiciously short, or empty, or still holding the
//     model's own chat ("Here is the transcription…", a stray ```markdown).
//   - [?], which the prompt asks for where a word is unreadable.
//
// Exit code is 1 when anything is flagged, so a full run can stop and ask.

import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir || !fs.existsSync(dir)) {
  console.error("Usage: node scripts/ocr-check.mjs <folder of .md files>");
  process.exit(1);
}

/** Scripts that have no business in a Khmer textbook. Latin, Greek and Khmer
 *  are all legitimate here: scientific names, symbols, the text itself. */
const FOREIGN = [
  ["Arabic", /[؀-ۿݐ-ݿ]+/g],
  ["Thai", /[฀-๿]+/g],
  ["Lao", /[຀-໿]+/g],
  ["Myanmar", /[က-႟]+/g],
  ["Devanagari", /[ऀ-ॿ]+/g],
  ["Hebrew", /[֐-׿]+/g],
  ["CJK", /[぀-ヿ一-鿿가-힯]+/g],
  ["Cyrillic", /[Ѐ-ӿ]+/g],
];

const KHMER = /[ក-៿]/;
/** LaTeX that only appears when a drawing is being forced into one line. */
const STACKED = /\\(overset|underset|stackrel|diagup|diagdown|substack)/g;
const CHATTER = /^(here is|here's|```markdown|i have transcribed|the page contains)/i;
const SHORT_CHARS = 200;

let flagged = 0;
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();

for (const file of files) {
  const text = fs.readFileSync(path.join(dir, file), "utf8");
  const notes = [];

  for (const [name, re] of FOREIGN) {
    const hits = [...text.matchAll(re)].map((m) => m[0]);
    if (hits.length) notes.push(`${name} text: ${hits.slice(0, 5).join(" ")}`);
  }

  const stacked = text.match(STACKED);
  if (stacked) notes.push(`${stacked.length} stacked-LaTeX commands — a drawn structure copied as a formula?`);

  // Same delimiters splitMath uses; a Khmer glyph between them renders as boxes.
  for (const m of text.matchAll(/\$([^$\n]{1,400})\$/g)) {
    if (KHMER.test(m[1])) {
      notes.push(`Khmer inside $…$: ${m[1].slice(0, 40)}`);
      break;
    }
  }

  const unknown = (text.match(/\[\?\]/g) ?? []).length;
  if (unknown) notes.push(`${unknown} unreadable word(s) marked [?]`);

  const trimmed = text.trim();
  if (!trimmed) notes.push("EMPTY");
  else if (trimmed.length < SHORT_CHARS) notes.push(`only ${trimmed.length} characters — a mostly-picture page, or a failed read`);
  if (CHATTER.test(trimmed)) notes.push("starts with the model talking rather than the page");
  if (!KHMER.test(trimmed) && trimmed.length > 0) notes.push("no Khmer at all");

  if (notes.length) {
    flagged++;
    console.log(`${file}\n  - ${notes.join("\n  - ")}`);
  }
}

console.log(`\n${files.length} pages checked, ${flagged} to look at by hand.`);
process.exit(flagged ? 1 : 0);
