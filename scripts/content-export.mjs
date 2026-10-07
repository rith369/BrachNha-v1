// Downloads every PUBLISHED deck, quiz, lesson section, past paper and game
// question pool into content/fixture.json.
//
//   npm run content:export
//
// The fixture is what a development server shows when Supabase is not
// configured (src/lib/content.ts), and scripts/shots.mjs runs that way. Run
// this after publishing changes on /admin/content so development matches what
// students see.
//
// The code copies this script once exported from are gone: decks and quizzes
// moved into the database on 3 Oct 2026 (docs/plans/content-in-database.md),
// lesson sections and past papers on 7 Oct 2026
// (docs/plans/sections-and-papers-in-database.md), the game questions on 7 Oct
// 2026 too. The database is the only copy.
//
// Reads with the publishable key from .env (content_current, which anyone may
// call), checks every item with src/utils/content-check.ts, and refuses to
// write a file with an error in it.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const outFile = path.join(root, "content", "fixture.json");
const KINDS = ["deck", "quiz", "section", "paper", "game"];

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

async function download() {
  const url = env("VITE_SUPABASE_URL").replace(/\/+$/, "");
  const key = env("VITE_SUPABASE_ANON_KEY");
  if (!url || !key) {
    console.error("content:export: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are needed (.env).");
    process.exit(1);
  }
  const items = [];
  for (const kind of KINDS) {
    const res = await fetch(`${url}/rest/v1/rpc/content_current`, {
      method: "POST",
      headers: { apikey: key, "content-type": "application/json" },
      body: JSON.stringify({ p_kind: kind }),
    });
    if (!res.ok) throw new Error(`content_current(${kind}) answered ${res.status}`);
    const rows = await res.json();
    items.push(
      ...rows
        .map((r) => ({ kind, key: r.key, body: r.body }))
        .sort((a, b) => a.key.localeCompare(b.key))
    );
  }
  return items;
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
  const items = await download();
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
    const count = (kind) => items.filter((i) => i.kind === kind).length;
    console.log(
      `content:export: wrote ${path.relative(root, outFile)}: ` +
        KINDS.filter((k) => count(k) > 0)
          .map((k) => `${count(k)} ${k}(s)`)
          .join(", ") +
        (warnings ? `, ${warnings} warning(s)` : "") +
        "."
    );
  }
} finally {
  await server.close();
}
