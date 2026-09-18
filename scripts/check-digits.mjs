/**
 * Fails if a Khmer numeral (U+17E0-U+17E9) appears anywhere the app can ship it.
 *
 * THE RULE: every number BrachNha shows a student is written with Latin digits
 * (0-9), in both languages. Khmer prose, Khmer numbers. See "Digits are Latin
 * everywhere" in CLAUDE.md for the reasoning; this script is the enforcement,
 * because the two scripts are visually distinct but nothing in `tsc` or oxlint
 * can see the difference between "១២" and "12" in a string literal.
 *
 * It scans `src/` and `index.html` — everything that reaches a browser, plus
 * the comments beside it, deliberately. A comment quoting "ជំពូក ១" teaches the
 * old convention to the next person reading the file, which is exactly how this
 * came back the first time.
 *
 * NOT scanned: report.md (a dated changelog — old entries describe what shipped
 * then and must not be rewritten), CLAUDE.md (it has to be able to name the
 * characters it is banning), and scripts/ (dev tooling, never served).
 *
 *   node scripts/check-digits.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath, not `.pathname` — the repo path contains a space, which a
// URL percent-encodes and `readdirSync` then cannot find.
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const KHMER_DIGITS = /[\u17E0-\u17E9]/;

/** Latin equivalents, so the report shows what the line was trying to say. */
const LATIN = "0123456789";
const toLatin = (s) =>
  s.replace(/[\u17E0-\u17E9]/g, (d) => LATIN[d.codePointAt(0) - 0x17e0]);

function* files(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* files(full);
    else if (/\.(ts|tsx|css|html|json)$/.test(entry)) yield full;
  }
}

const targets = [...files(join(ROOT, "src")), join(ROOT, "index.html")];
const hits = [];

for (const file of targets) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    if (KHMER_DIGITS.test(line)) {
      hits.push({ file: relative(ROOT, file), line: i + 1, text: line.trim() });
    }
  });
}

if (hits.length === 0) {
  console.log(`✓ no Khmer numerals in ${targets.length} files — digits are Latin`);
  process.exit(0);
}

console.error(`✗ ${hits.length} line(s) carry Khmer numerals. Digits are Latin everywhere:\n`);
for (const h of hits) {
  console.error(`  ${h.file}:${h.line}`);
  console.error(`    ${h.text}`);
  console.error(`    → ${toLatin(h.text)}\n`);
}
console.error("See \"Digits are Latin everywhere\" in CLAUDE.md.");
process.exit(1);
