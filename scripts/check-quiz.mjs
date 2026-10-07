// Content check for the game questions, the last question content still
// written in code — the things tsc and oxlint cannot see. (Flashcards, practice
// quizzes, lesson sections and past papers live in the database;
// `npm run check:content` checks those, with the same rules.)
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
      // A "$" IMMEDIATELY FOLLOWED BY A DIGIT IS MONEY, NOT A BROKEN FORMULA.
      // The English paper's vocabulary note says "The room costs $20", and
      // there is no way to escape a dollar in a plain string that MathText
      // renders — `\$` would print as `\$`. This is the same carve-out
      // utils/math-render.ts already makes in the other direction: it refuses
      // to treat `+` or `=` as a TeX marker precisely so prose prices are not
      // typeset. Anything else — a dollar before a space, a letter or a
      // backslash — is an unclosed, padded or newline-split span, which means
      // the student reads raw LaTeX.
      const dollars = (segment.value.match(/\$/g) ?? []).length;
      const prices = (segment.value.match(/\$\d/g) ?? []).length;
      if (dollars > prices) {
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
  const { splitMath } = await server.ssrLoadModule("/src/utils/math-render.ts");

  // Practice quizzes, flashcard decks, lesson sections and past papers are not
  // here any more: they live in the database (docs/plans/content-in-database.md,
  // docs/plans/sections-and-papers-in-database.md) and are checked with the
  // same rules by the editor and by `npm run check:content`.

  // ── game match questions ────────────────────────────────────────────────
  const { GAME_QUESTIONS } = await server.ssrLoadModule("/src/data/game-questions.ts");
  const gameKeys = Object.keys(GAME_QUESTIONS);
  let gameQuestions = 0;

  for (const subj of gameKeys) {
    GAME_QUESTIONS[subj].forEach((question, qi) => {
      gameQuestions += 1;
      const where = `game · ${subj} · question ${qi + 1}`;
      checkMath(splitMath, `${where} q.en`, question.q.en);
      checkMath(splitMath, `${where} q.km`, question.q.km);
      checkMath(splitMath, `${where} explanation`, question.explanation);
      for (const opt of question.options ?? [])
        checkMath(splitMath, `${where} option`, opt);
      checkChoices(where, question.options, question.correct);
    });
  }

  if (problems.length) {
    console.error(`\ncheck:quiz — ${problems.length} problem(s):\n`);
    for (const p of problems) console.error("  " + p + "\n");
    process.exitCode = 1;
  } else {
    console.log(
      `check:quiz — ok. ` +
        `${gameQuestions} question(s) across ${gameKeys.length} game subject(s); ` +
        `${checked} string(s) with math typeset cleanly.`
    );
  }
} finally {
  // Without this the process never exits — see CLAUDE.md's re-measure snippet.
  await server.close();
}
