/**
 * Supabase connectivity + schema check.
 *
 *   node scripts/supabase-check.mjs
 *
 * Answers, in order, the four questions that go wrong when a Supabase project
 * "doesn't work", and stops at the first one that fails so the output names a
 * cause rather than a symptom:
 *
 *   1. Are the env values there and shaped like a Supabase URL and key?
 *   2. Is the project reachable, and does it accept the key?
 *   3. Are anonymous sign-ins enabled? (off by default — the app's auth needs it)
 *   4. Do the tables from supabase/migrations exist?
 *
 * Dev tooling, so it lives outside src/ and never bundles — same placement and
 * reasoning as shots.mjs and webp.mjs. No dependencies: Node 22's global fetch
 * and a hand-rolled .env read, because adding dotenv to run one script would be
 * a dependency for the whole repo.
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const TABLES = [
  "profiles",
  "pending_placement_tests",
  "commitments",
  "daily_activity",
  "exam_results",
  "completed_sessions",
  "conversations",
  "chat_messages",
];

const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad = (m) => console.log(`  \x1b[31m✗\x1b[0m ${m}`);
const warn = (m) => console.log(`  \x1b[33m!\x1b[0m ${m}`);
const step = (m) => console.log(`\n\x1b[1m${m}\x1b[0m`);

/** Vite loads .env then .env.local, later winning. Mirrored here so this script
 *  reads exactly what `npm run dev` would. */
function loadEnv() {
  const env = {};
  for (const file of [".env", ".env.local"]) {
    const path = resolve(root, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      env[trimmed.slice(0, eq).trim()] = trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

async function main() {
  step("1. Environment");
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    bad("VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing from .env(.local)");
    console.log("\n  Copy .env.example to .env and fill both in from");
    console.log("  Supabase dashboard → Project Settings → API keys.\n");
    process.exit(1);
  }
  let host;
  try {
    host = new URL(url).host;
  } catch {
    bad(`VITE_SUPABASE_URL is not a URL: ${url}`);
    process.exit(1);
  }
  ok(`URL   ${host}`);
  // Both the legacy JWT (eyJ…) and the current publishable format are valid.
  const shape = key.startsWith("sb_publishable_")
    ? "publishable"
    : key.startsWith("eyJ")
      ? "legacy anon JWT"
      : "unrecognised";
  if (shape === "unrecognised") {
    warn(`key does not look like an anon/publishable key (${key.slice(0, 8)}…)`);
    warn("if this is a secret/service_role key, remove it — VITE_ ships to the browser");
  } else {
    ok(`key   ${shape}, ${key.length} chars`);
  }

  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  step("2. Reachability");
  let settings;
  try {
    const res = await fetch(`${url}/auth/v1/settings`, { headers });
    if (res.status === 401) {
      bad("401 — the project is up but rejected this key. Wrong key, or it was rotated.");
      process.exit(1);
    }
    if (!res.ok) {
      bad(`unexpected ${res.status} from /auth/v1/settings`);
      process.exit(1);
    }
    settings = await res.json();
    ok("project reachable, key accepted");
  } catch (err) {
    bad(`cannot reach ${host} — ${err.message}`);
    console.log("\n  Check the URL, your network, and that the project is not paused.");
    console.log("  A free-tier project pauses after a week of inactivity.\n");
    process.exit(1);
  }

  step("3. Auth configuration");
  // NESTED under `external`, not a flat external_anonymous_users field — the
  // flat name is what the docs' prose implies and it is simply absent from the
  // payload, so reading it gives `undefined` and this check reports "disabled"
  // on a correctly configured project. Verified against a live project.
  const anonEnabled = Boolean(settings.external?.anonymous_users);
  if (anonEnabled) {
    ok("anonymous sign-ins enabled");
  } else {
    bad("anonymous sign-ins DISABLED — the app cannot create accounts");
    console.log(
      "    Dashboard → Authentication → Sign In / Providers → Anonymous sign-ins"
    );
  }
  if (settings.disable_signup) warn("signups are disabled project-wide");

  step("4. Schema");
  let missing = 0;
  for (const table of TABLES) {
    const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=0`, {
      headers,
    });
    if (res.status === 404) {
      bad(`${table} — not found`);
      missing++;
    } else if (res.ok || res.status === 401 || res.status === 403) {
      // 200 with no rows is the expected answer for an unauthenticated read of
      // an RLS-protected table: the policies below only grant `authenticated`,
      // so anon simply matches nothing. Reaching the table at all is the point.
      ok(`${table}`);
    } else {
      const body = await res.text();
      warn(`${table} — ${res.status} ${body.slice(0, 120)}`);
    }
  }

  console.log();
  if (missing) {
    bad(`${missing} of ${TABLES.length} tables missing — migrations not applied yet`);
    console.log("\n  Apply them: see supabase/README.md\n");
    process.exit(1);
  }
  if (!anonEnabled) {
    bad("schema is in place, but anonymous sign-ins are still off");
    process.exit(1);
  }
  ok("all checks passed\n");
}

main().catch((err) => {
  bad(err.stack ?? String(err));
  process.exit(1);
});
