// Checks content stored as JSON (flashcard decks, practice quizzes, lesson
// sections and past papers) with the same rules the editor on /admin/content
// applies (src/utils/content-check.ts).
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
// It also checks the pictures and 3D models a section may name: the editor's
// lists (src/features/admin/section-media.ts) must name exactly the files in
// public/sections/ and public/models/, and every poster or model a file
// names must exist there.
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

const LIST_KINDS = new Set(["deck", "quiz", "game"]);
const OBJECT_KINDS = new Set(["section", "paper"]);

/** Cards or questions; a section's questions; a paper's scored questions and
 *  gaps. The same count the database keeps (content_count). */
function countOf(item) {
  const b = item.body;
  if (LIST_KINDS.has(item.kind)) return Array.isArray(b) ? b.length : 0;
  if (item.kind === "section") return (b.quiz?.length ?? 0) + (b.quizHarder?.length ?? 0);
  return (b.sections ?? []).reduce(
    (n, p) => n + (p.questions?.length ?? 0) + (p.gapFill?.gaps ?? []).filter((g) => !g.example).length,
    0
  );
}

/** The files a folder under public/ ships, as the app's URL paths. */
function shipped(dir, ext) {
  const full = path.join(root, "public", dir);
  if (!existsSync(full)) return [];
  return readdirSync(full)
    .filter((n) => n.endsWith(ext))
    .map((n) => `/${dir}/${n}`)
    .sort();
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
  const { SECTION_POSTERS, SECTION_MODELS } = await server.ssrLoadModule("/src/features/admin/section-media.ts");

  // The editor's pick lists must be exactly what the app ships.
  const posters = shipped("sections", ".webp");
  const models = shipped("models", ".glb");
  for (const [name, list, files] of [
    ["SECTION_POSTERS", SECTION_POSTERS, posters],
    ["SECTION_MODELS", SECTION_MODELS, models],
  ]) {
    const a = [...list].sort().join(",");
    if (a !== files.join(",")) {
      console.log(`  section-media.ts: error: ${name} (${a}) is not the files under public/ (${files.join(",")})`);
      errors += 1;
    }
  }

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
      const fits = LIST_KINDS.has(item.kind)
        ? Array.isArray(item.body)
        : OBJECT_KINDS.has(item.kind) && item.body && typeof item.body === "object" && !Array.isArray(item.body);
      if (!fits) {
        console.log(`  ${rel} · ${label}: error: needs a kind (deck, quiz, section or paper) and a body of its shape`);
        fileErrors += 1;
        continue;
      }
      if (item.kind === "section") {
        const poster = item.body.video?.poster;
        const model = item.body.model3d?.src;
        if (poster && !posters.includes(poster)) {
          console.log(`  ${rel} · ${label}: error: poster ${poster} is not under public/`);
          fileErrors += 1;
        }
        if (model && !models.includes(model)) {
          console.log(`  ${rel} · ${label}: error: model ${model} is not under public/`);
          fileErrors += 1;
        }
      }
      for (const issue of checkContent(item.kind, item.body)) {
        console.log(`  ${rel} · ${label}: ${describeIssue(issue)}`);
        if (issue.level === "error") fileErrors += 1;
        else warnings += 1;
      }
    }
    errors += fileErrors;
    const n = items.reduce((s, i) => s + (i.body && typeof i.body === "object" ? countOf(i) : 0), 0);
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
    const kinds = [...new Set(items.map((i) => i.kind))];
    for (const kind of kinds) {
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
