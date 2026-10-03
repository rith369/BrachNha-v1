// Downloads every PUBLISHED flashcard deck and practice quiz into
// content/fixture.json.
//
//   npm run content:export
//
// The fixture is what a development server shows when Supabase is not
// configured (src/lib/content.ts), and scripts/shots.mjs runs that way. Run
// this after publishing changes on /admin/content so development matches what
// students see.
//
// Until 3 Oct 2026 this script exported the decks and quizzes written in the
// code, for the one-time move into the database. That code is gone; the
// database is the only copy now (docs/plans/content-in-database.md).
//
// Reads with the publishable key from .env (content_current, which anyone may
// call), checks every item with src/utils/content-check.ts, and refuses to
// write a file with an error in it.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const outFile = path.join(root, "content", "fixture.json");

function env(name) {
  if (process.env[name]) return process.env[name].trim();
  for (const file of [".env.local", ".env"]) {
    try {
      for (const line of readFileSync(path.join(root, file), "utf8").split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
        if (m && m[1] === name) return m[2].replace(/^["']|["']$/g, "");
      }
    } catch {
      // No such file.
    }
  }
  return "";
}

const url = env("VITE_SUPABASE_URL").replace(/\/+$/, "");
const key = env("VITE_SUPABASE_ANON_KEY");
if (!url || !key) {
  console.error("content:export: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are needed (.env).");
  process.exit(1);
}

async function current(kind) {
  const res = await fetch(`${url}/rest/v1/rpc/content_current`, {
    method: "POST",
    headers: { apikey: key, "content-type": "application/json" },
    body: JSON.stringify({ p_kind: kind }),
  });
  if (!res.ok) throw new Error(`content_current(${kind}) answered ${res.status}`);
  const rows = await res.json();
  return rows
    .map((r) => ({ kind, key: r.key, body: r.body }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

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
  const items = [...(await current("deck")), ...(await current("quiz"))];
  const { checkContent, describeIssue } = await server.ssrLoadModule("/src/utils/content-check.ts");

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
