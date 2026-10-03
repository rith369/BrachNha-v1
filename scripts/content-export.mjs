// Writes every flashcard deck and practice quiz in the code to one file, for
// the one-time move into the database (docs/plans/content-in-database.md).
//
//   npm run content:export
//
// The file, content/fixture.json, is two things at once:
//   - what the owner imports on /admin/content (with "publish now"), and
//   - what the app reads in development when Supabase is not configured.
//
// Each quiz question gets its stable id here, `q1`, `q2`… in today's order,
// so the first published version of a quiz asks its questions in exactly the
// order students have been answering them. Card ids are kept as they are: a
// student's spaced-repetition history is keyed by them.
//
// Every item is run through src/utils/content-check.ts first, and the export
// refuses to write a file with an error in it.
//
// Loaded through Vite's ssrLoadModule for the same reason check-quiz.mjs is:
// data/*.ts uses `.js` specifiers that only resolve under a bundler.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const outFile = path.join(root, "content", "fixture.json");

const { createServer } = await import("vite");
const server = await createServer({
  root,
  server: { middlewareMode: true },
  appType: "custom",
  configFile: false,
  resolve: { alias: { "@": path.join(root, "src") } },
  optimizeDeps: { noDiscovery: true, include: [] },
  logLevel: "error",
});

try {
  const { PRACTICE_DECKS, PRACTICE_QUIZZES } = await server.ssrLoadModule("/src/data/practice.ts");
  const { checkContent, describeIssue } = await server.ssrLoadModule("/src/utils/content-check.ts");

  const items = [];
  for (const key of Object.keys(PRACTICE_DECKS).sort()) {
    const body = PRACTICE_DECKS[key].map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
    }));
    items.push({ kind: "deck", key, body });
  }
  for (const key of Object.keys(PRACTICE_QUIZZES).sort()) {
    // JSON drops undefined fields, so a question without a scenario or help
    // stores neither, exactly as the code wrote it.
    const body = PRACTICE_QUIZZES[key].map((question, i) => ({
      id: `q${i + 1}`,
      ...JSON.parse(JSON.stringify(question)),
    }));
    items.push({ kind: "quiz", key, body });
  }

  let errors = 0;
  let warnings = 0;
  for (const item of items) {
    for (const issue of checkContent(item.kind, item.body)) {
      if (issue.level === "error") errors += 1;
      else warnings += 1;
      console.log(`  ${item.kind} ${item.key}: ${describeIssue(issue)}`);
    }
  }
  if (errors > 0) {
    console.error(`\ncontent:export: ${errors} error(s); nothing written.`);
    process.exitCode = 1;
  } else {
    mkdirSync(path.dirname(outFile), { recursive: true });
    writeFileSync(outFile, JSON.stringify({ format: 1, items }, null, 2) + "\n");
    const decks = items.filter((i) => i.kind === "deck");
    const quizzes = items.filter((i) => i.kind === "quiz");
    const cards = decks.reduce((n, i) => n + i.body.length, 0);
    const questions = quizzes.reduce((n, i) => n + i.body.length, 0);
    console.log(
      `content:export: wrote ${path.relative(root, outFile)}: ${decks.length} deck(s), ` +
        `${cards} card(s), ${quizzes.length} quiz(zes), ${questions} question(s)` +
        (warnings ? `, ${warnings} warning(s)` : "") +
        "."
    );
  }
} finally {
  await server.close();
}
