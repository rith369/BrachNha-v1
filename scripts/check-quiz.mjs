// Content check for the practice quizzes — the things tsc and oxlint cannot see.
//
//   npm run check:quiz
//
// To a typechecker every field below is just a string. Nothing else in the repo
// can tell you that an option list has two entries spelled the same, that
// `correct` is not actually one of the options, that a `$` was never closed, or
// that a Khmer word ended up inside `$…$` where KaTeX has no glyphs for it and
// renders a row of empty boxes.
//
// THE METHOD IS THE APP'S OWN PATH, which is the only thing worth trusting here:
// it runs the real `splitMath` and then the real `katex.renderToString` with
// `throwOnError: true`. CLAUDE.md records why eyeballing is not enough — the
// garbled LaTeX in the mentor prompt rendered without a single error.
//
// Loaded through Vite's ssrLoadModule because data/*.ts uses `.js` specifiers
// that only resolve under a bundler; plain `node` cannot import it. Same reason
// server/vite-chat-plugin.ts exists.
//
// Dev tooling: lives in scripts/, never bundled, and is not itself scanned by
// check-digits.mjs.

import katex from "katex";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

/** U+1780–U+17FF. Khmer inside math is the failure this exists to catch. */
const KHMER = /[ក-៿]/;

const problems = [];
let checked = 0;

function fail(where, message) {
  problems.push(`${where}\n    ${message}`);
}

/**
 * Every `$…$` in a string, typeset exactly as the app would.
 *
 * `splitMath` deliberately REFUSES to treat some `$…$` as math — Khmer inside,
 * whitespace hugging the delimiters, an inline span crossing a newline — and
 * returns it as literal text instead. That is correct behaviour in the chat,
 * where it protects a streamed reply, and a BUG in authored content: it means
 * the student reads raw LaTeX. So a `$` left in a TEXT segment is an error
 * here, even though nothing throws.
 */
function checkMath(splitMath, where, text) {
  if (typeof text !== "string" || !text.includes("$")) return;
  checked += 1;

  for (const segment of splitMath(text)) {
    if (segment.type === "text") {
      if (segment.value.includes("$")) {
        fail(
          where,
          `a "$" survived into plain text — unclosed, padded, or split across a newline: ${JSON.stringify(segment.value.slice(0, 80))}`
        );
      }
      continue;
    }
    if (KHMER.test(segment.value)) {
      fail(
        where,
        `Khmer inside $…$ — KaTeX has no Khmer glyphs, this renders as empty boxes: ${JSON.stringify(segment.value.slice(0, 60))}`
      );
      continue;
    }
    try {
      katex.renderToString(segment.value, {
        displayMode: segment.display,
        throwOnError: true,
        strict: "ignore",
        trust: false,
        output: "html",
      });
    } catch (err) {
      fail(where, `KaTeX refused ${JSON.stringify(segment.value)}: ${err.message}`);
    }
  }
}

/** Shared by a quiz question and a drill question — same rules, both are MCQ. */
function checkChoices(where, options, correct) {
  if (!Array.isArray(options) || options.length < 2) {
    fail(where, `needs at least 2 options, has ${options?.length ?? 0}`);
    return;
  }
  if (new Set(options).size !== options.length) {
    fail(where, "two options are spelled identically");
  }
  if (!options.includes(correct)) {
    // The single most likely authoring error: `correct` retyped rather than
    // copied, so a stray space or a different prefix marks every student wrong.
    fail(
      where,
      `\`correct\` is not one of the options — copy it from the option, never retype it.\n    correct: ${JSON.stringify(correct)}\n    options: ${JSON.stringify(options)}`
    );
  }
}

function checkDrill(splitMath, where, drill) {
  checkMath(splitMath, `${where} prompt`, drill.prompt);
  checkMath(splitMath, `${where} explanation`, drill.explanation);
  for (const opt of drill.options ?? []) checkMath(splitMath, `${where} option`, opt);
  checkChoices(where, drill.options, drill.correct);
}

const { createServer } = await import("vite");
const server = await createServer({
  root,
  server: { middlewareMode: true },
  appType: "custom",
  // No vite.config.ts: it pulls in the React Compiler babel plugin and
  // Tailwind, neither of which a data check needs. The one thing that IS
  // needed from it is the `@/` alias, restated here — `import type` is erased
  // so most of it never resolves, but a value import would.
  configFile: false,
  resolve: { alias: { "@": path.join(root, "src") } },
  // Stops Vite crawling app.tsx to pre-bundle the whole route table, which is
  // where the alias warnings came from — nothing here needs optimised deps.
  optimizeDeps: { noDiscovery: true, include: [] },
  logLevel: "error",
});

try {
  const { PRACTICE_QUIZZES } = await server.ssrLoadModule("/src/data/practice.ts");
  const { splitMath } = await server.ssrLoadModule("/src/utils/math-render.ts");

  const keys = Object.keys(PRACTICE_QUIZZES);
  if (keys.length === 0) {
    console.log("check:quiz — PRACTICE_QUIZZES is empty, nothing to check.");
  }

  for (const key of keys) {
    PRACTICE_QUIZZES[key].forEach((question, qi) => {
      const where = `${key} · question ${qi + 1}`;
      checkMath(splitMath, `${where} q`, question.q);
      checkMath(splitMath, `${where} explanation`, question.explanation);
      if (question.scenario) checkMath(splitMath, `${where} scenario`, question.scenario);
      for (const opt of question.options ?? []) checkMath(splitMath, `${where} option`, opt);
      checkChoices(where, question.options, question.correct);

      const help = question.help;
      if (!help) return;
      for (const line of help.note ?? []) checkMath(splitMath, `${where} note`, line);
      if (help.mistake) checkMath(splitMath, `${where} mistake`, help.mistake);
      (help.questions ?? []).forEach((d, di) =>
        checkDrill(splitMath, `${where} · similar ${di + 1}`, d)
      );
      (help.foundation ?? []).forEach((d, di) =>
        checkDrill(splitMath, `${where} · foundation ${di + 1}`, d)
      );
    });
  }

  if (problems.length) {
    console.error(`\ncheck:quiz — ${problems.length} problem(s):\n`);
    for (const p of problems) console.error("  " + p + "\n");
    process.exitCode = 1;
  } else {
    const n = keys.reduce((s, k) => s + PRACTICE_QUIZZES[k].length, 0);
    console.log(
      `check:quiz — ok. ${n} question(s) across ${keys.length} quiz(zes); ${checked} string(s) with math typeset cleanly.`
    );
  }
} finally {
  // Without this the process never exits — see CLAUDE.md's re-measure snippet.
  await server.close();
}
