// Checks flashcard decks and practice quizzes stored as JSON, with the same
// rules the editor on /admin/content applies (src/utils/content-check.ts).
//
//   npm run check:content                      every .json under content/
//   npm run check:content -- content/new/x.json   one file
//   npm run check:content -- --live content/fixture.json
//
// --live downloads what is PUBLISHED (content_current, with the publishable
// key from .env / .env.local, read-only) and compares it item by item with the
// file. That is how the one-time import is proven exact: every item in the
// file must be live, with the same body.
//
// A file is `{ "format": 1, "items": [{ "kind", "key", "body" }, …] }` (what
// content-export.mjs writes) or just the array.
//
// Dev tooling, outside src/, never bundled.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const args = process.argv.slice(2);
const live = args.includes("--live");
const files = args.filter((a) => a !== "--live");

function jsonFilesUnder(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return jsonFilesUnder(full);
    return name.endsWith(".json") ? [full] : [];
  });
}

function itemsOf(file) {
  const parsed = JSON.parse(readFileSync(file, "utf8"));
  const items = Array.isArray(parsed) ? parsed : parsed.items;
  if (!Array.isArray(items)) throw new Error(`${file}: no "items" list`);
  return items;
}

/** JSON with object keys sorted. Postgres stores jsonb with its own key
 *  order, so a body read back is equal but not byte-identical. */
function canon(v) {
  if (Array.isArray(v)) return `[${v.map(canon).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canon(v[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v);
}

/** Vite loads .env then .env.local, the later winning; mirrored here as in
 *  supabase-check.mjs. */
function loadEnv() {
  const env = {};
  for (const name of [".env", ".env.local"]) {
    const file = path.join(root, name);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
  return env;
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

let errors = 0;
try {
  const { checkContent, describeIssue } = await server.ssrLoadModule("/src/utils/content-check.ts");
  const targets = files.length ? files.map((f) => path.resolve(f)) : jsonFilesUnder(path.join(root, "content"));
  if (targets.length === 0) console.log("check:content: no files under content/.");

  for (const file of targets) {
    const rel = path.relative(root, file);
    let items;
    try {
      items = itemsOf(file);
    } catch (err) {
      console.error(`  ${rel}: ${err.message}`);
      errors += 1;
      continue;
    }
    let fileErrors = 0;
    let warnings = 0;
    const seen = new Set();
    for (const item of items) {
      const label = `${item.kind} ${item.key}`;
      if (seen.has(`${item.kind}:${item.key}`)) {
        console.log(`  ${rel} · ${label}: error: in the file twice`);
        fileErrors += 1;
      }
      seen.add(`${item.kind}:${item.key}`);
      if ((item.kind !== "deck" && item.kind !== "quiz") || !Array.isArray(item.body)) {
        console.log(`  ${rel} · ${label}: error: needs a kind (deck or quiz) and a body list`);
        fileErrors += 1;
        continue;
      }
      for (const issue of checkContent(item.kind, item.body)) {
        console.log(`  ${rel} · ${label}: ${describeIssue(issue)}`);
        if (issue.level === "error") fileErrors += 1;
        else warnings += 1;
      }
    }
    errors += fileErrors;
    const n = items.reduce((s, i) => s + (Array.isArray(i.body) ? i.body.length : 0), 0);
    console.log(
      `check:content: ${rel}: ${items.length} item(s), ${n} card(s) and question(s), ` +
        `${fileErrors} error(s), ${warnings} warning(s).`
    );

    if (!live) continue;
    const env = loadEnv();
    const url = env.VITE_SUPABASE_URL;
    const key = env.VITE_SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      console.error("  --live needs VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env");
      errors += 1;
      continue;
    }
    const published = new Map();
    for (const kind of ["deck", "quiz"]) {
      const res = await fetch(`${url}/rest/v1/rpc/content_current?p_kind=${kind}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      if (!res.ok) {
        console.error(`  --live: content_current(${kind}) answered ${res.status}: ${(await res.text()).slice(0, 160)}`);
        errors += 1;
        continue;
      }
      for (const row of await res.json()) published.set(`${kind}:${row.key}`, row);
    }
    let same = 0;
    for (const item of items) {
      const row = published.get(`${item.kind}:${item.key}`);
      if (!row) {
        console.log(`  live · ${item.kind} ${item.key}: error: not published`);
        errors += 1;
      } else if (canon(row.body) !== canon(item.body)) {
        console.log(`  live · ${item.kind} ${item.key}: error: published version ${row.version} differs from the file`);
        errors += 1;
      } else {
        same += 1;
      }
    }
    const extra = [...published.keys()].filter(
      (k) => !items.some((i) => `${i.kind}:${i.key}` === k)
    );
    console.log(
      `check:content: live: ${same} of ${items.length} item(s) published exactly as in the file` +
        (extra.length ? `; ${extra.length} more published item(s) not in the file: ${extra.join(", ")}` : "") +
        "."
    );
  }
} finally {
  await server.close();
}
if (errors) process.exitCode = 1;
