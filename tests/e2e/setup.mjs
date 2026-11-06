import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

/**
 * Real screens in real Chrome: the production build (build.mjs), served with the REAL
 * headers from vercel.json, so a page the security policy would break fails here.
 *
 * NOT REAL, and so not tested here: the database, which is a small stand-in that remembers
 * what is written; Google sign-in, since a signed-in session is seeded into the browser;
 * a real phone; and KruAI. Google Fonts come from the network when there is one, and
 * the tests do not depend on them.
 *
 * What the database actually allows is checked by tests/db. These check the screens.
 */

const here = dirname(fileURLToPath(import.meta.url));
export const repoRoot = join(here, "..", "..");
export const DIST = join(repoRoot, "node_modules", ".cache", "brachnha-e2e");
export const APP_PORT = 5301;
export const DB_PORT = 5302;
export const BASE = `http://localhost:${APP_PORT}`;
export const UID = "11111111-2222-3333-4444-555555555555";

const fixture = JSON.parse(readFileSync(join(repoRoot, "content", "fixture.json"), "utf8"));
/** One piece of the sample content, exactly as the database would hand it over. */
export const content = (kind, key) => fixture.items.find((i) => i.kind === kind && i.key === key)?.body;
export const contentItems = () => fixture.items;

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml",
  ".png": "image/png", ".webp": "image/webp", ".ico": "image/x-icon", ".glb": "model/gltf-binary",
  ".woff2": "font/woff2", ".mp3": "audio/mpeg",
};

function appServer() {
  const vercel = JSON.parse(readFileSync(join(repoRoot, "vercel.json"), "utf8"));
  const headers = Object.fromEntries(vercel.headers[0].headers.map((h) => [h.key, h.value]));
  // The stand-in database is on another origin, so it joins the policy here and only here.
  headers["Content-Security-Policy"] = headers["Content-Security-Policy"].replace(
    "connect-src 'self'",
    `connect-src 'self' http://localhost:${DB_PORT}`
  );
  return createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/\\/g, "/");
    let file = join(DIST, path);
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, "index.html");
    res.writeHead(200, { ...headers, "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
}

/**
 * Just enough of Supabase's REST API. It remembers Battles so a joiner can find one, and
 * records every write so a test can see what the app sent.
 */
function databaseServer() {
  const db = {
    writes: [],
    competitions: [],
    attempts: [],
    hidden: new Set(),
    /** Content on top of the sample, for a test that needs what the sample does not have. */
    extra: [],
    /** Set to answer the next post_competition with this error, as the real function does. */
    postError: null,
    attemptError: null,
  };
  const items = () => [...fixture.items, ...db.extra].filter((i) => !db.hidden.has(i.key));
  const manifest = () =>
    items().map((i) => ({
      kind: i.kind,
      key: i.key,
      version: 1,
      item_count: Array.isArray(i.body)
        ? i.body.length
        : i.kind === "paper"
          ? i.body.sections.flatMap((s) => s.questions ?? s.gapFill?.gaps ?? []).length
          : (i.body.quiz ?? []).length + (i.body.quizHarder ?? []).length,
      item_ids: i.kind === "deck" ? i.body.map((c) => c.id) : [],
    }));

  const server = createServer((req, res) => {
    const url = req.url;
    const cors = {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "*",
      "access-control-allow-methods": "*",
      "access-control-expose-headers": "*",
      "content-type": "application/json",
    };
    const send = (status, body) => {
      res.writeHead(status, cors);
      res.end(typeof body === "string" ? body : JSON.stringify(body));
    };
    if (req.method === "OPTIONS") return send(204, "");

    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      const single = (req.headers.accept ?? "").includes("vnd.pgrst.object");
      const param = (name) => {
        const m = new RegExp(`[?&]${name}=eq\\.([^&]+)`).exec(url);
        return m ? decodeURIComponent(m[1]) : null;
      };
      const body = raw ? JSON.parse(raw) : null;
      if (req.method !== "GET") db.writes.push({ url, method: req.method, body });

      if (url.includes("/auth/v1/")) return send(200, {});

      if (url.includes("/rpc/post_competition_attempt")) {
        if (db.attemptError) return send(400, db.attemptError);
        const battle = db.competitions.find((c) => c.id === body.p_competition);
        const score = body.p_answers.filter((a, i) => a === battle?.questions[i]?.correct).length;
        db.attempts.push({ competition_id: body.p_competition, user_id: UID, user_name: "សុខ", score, ms: body.p_ms, answers: body.p_answers, played_at: new Date().toISOString() });
        return send(204, "");
      }
      if (url.includes("/rpc/post_competition")) {
        if (db.postError) return send(400, db.postError);
        const score = body.p_answers.filter((a, i) => a === body.p_questions[i]?.correct).length;
        db.competitions.push({
          id: body.p_id, creator_id: UID, creator_name: "សុខ", subject: body.p_subject,
          difficulty: body.p_difficulty, minutes: body.p_minutes, questions: body.p_questions,
          creator_answers: body.p_answers, creator_score: score, creator_ms: body.p_ms,
          total: body.p_questions.length, created_at: new Date().toISOString(),
        });
        return send(204, "");
      }
      if (url.includes("/rpc/content_current")) {
        return send(200, items().filter((i) => i.kind === body.p_kind).map((i) => ({ key: i.key, version: 1, body: i.body })));
      }
      if (url.includes("/rpc/is_app_admin") || url.includes("/rpc/has_role")) return send(200, "false");
      if (url.includes("/rpc/my_competition_work_count") || url.includes("/rpc/friend_count")) return send(200, "0");
      if (url.includes("/rpc/")) return send(200, []);

      if (url.includes("/content_items")) return send(200, manifest());
      if (url.includes("/content_versions")) {
        const item = items().find((i) => i.kind === param("kind") && i.key === param("key"));
        return send(200, item ? [{ body: item.body, published_at: "2026-01-01T00:00:00Z" }] : []);
      }
      if (url.includes("/competition_attempts")) {
        const id = param("competition_id");
        const rows = db.attempts.filter((a) => !id || a.competition_id === id);
        return send(200, single ? (rows[0] ?? null) : rows);
      }
      if (url.includes("/competitions")) {
        const id = param("id");
        const rows = id ? db.competitions.filter((c) => c.id === id) : db.competitions;
        return send(200, single ? (rows[0] ?? null) : rows);
      }
      if (req.method !== "GET") return send(201, []);
      return send(200, single ? null : []);
    });
  });
  return { server, db };
}

export function findChrome() {
  const paths = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  const found = paths.find(existsSync);
  if (!found) throw new Error("No Chrome or Edge found. Set CHROME_PATH to one.");
  return found;
}

/** Everything one test file needs. Files run one at a time: the ports are fixed. */
export async function startApp() {
  if (!existsSync(join(DIST, "index.html"))) {
    throw new Error("No test build. Run this through `npm run test:e2e`, which builds it first.");
  }
  const app = appServer();
  const { server: dbServer, db } = databaseServer();
  await new Promise((r) => app.listen(APP_PORT, r));
  await new Promise((r) => dbServer.listen(DB_PORT, r));
  const browser = await chromium.launch({
    executablePath: findChrome(),
    args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
  });

  /**
   * A phone with a student on it. Real students read Khmer at a narrow width, so that is
   * the default. `guest` has no account.
   */
  async function open({ guest = false, fresh = false, theme = "light", viewport = { width: 390, height: 844 }, state = {}, userAgent } = {}) {
    const ctx = await browser.newContext({ viewport, hasTouch: true, serviceWorkers: "block", ...(userAgent ? { userAgent } : {}) });
    const page = await ctx.newPage();
    const problems = [];
    page.on("pageerror", (e) => problems.push(`page error: ${e.message}`));
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (e) => {
        (window.__blocked ??= []).push(`${e.effectiveDirective} ${e.blockedURI}`);
      });
    });
    if (!fresh) {
      await page.addInitScript(
        ({ UID, guest, theme, state }) => {
          if (sessionStorage.getItem("seeded")) return;
          sessionStorage.setItem("seeded", "1");
          localStorage.setItem(
            "brachnha",
            JSON.stringify({
              state: {
                lang: "km", theme, userName: guest ? "" : "សុខ", userLanguage: "english", surveyed: true,
                pledgeSeen: true, syncedUserId: guest ? null : UID,
                userData: { studied: false, strengths: [], weaknesses: ["math"], grade: "A" },
                ...state,
              },
              version: 4,
            })
          );
          localStorage.setItem("brachnha-kruai-hint", JSON.stringify({ found: true, shows: 9 }));
          localStorage.setItem("brachnha-intro", "1");
          if (!guest) {
            localStorage.setItem(
              "brachnha-auth",
              JSON.stringify({
                access_token: "x.y.z", token_type: "bearer", expires_in: 3600,
                expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: "r",
                user: { id: UID, aud: "authenticated", role: "authenticated", email: "t@t.t", is_anonymous: false, app_metadata: {}, user_metadata: { full_name: "សុខ" } },
              })
            );
          }
        },
        { UID, guest, theme, state }
      );
    }
    return { ctx, page, problems };
  }

  return {
    db,
    open,
    close: async () => {
      await browser.close();
      await new Promise((r) => app.close(r));
      await new Promise((r) => dbServer.close(r));
    },
  };
}

export const settle = async (page, ms = 400) => {
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(ms);
};
export const go = async (page, route) => {
  await page.goto(`${BASE}${route}`);
  await settle(page);
};
/** What the phone has saved. localStorage is the live copy, so this is the student's truth. */
export const saved = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("brachnha")).state);
export const text = (page) => page.evaluate(() => document.body.innerText);
export const scrollsSideways = (page) =>
  page.evaluate(() => {
    const el = document.scrollingElement;
    if (el.scrollWidth > el.clientWidth + 1) return true;
    return [...document.querySelectorAll(".overflow-y-auto")].some((e) => e.scrollWidth > e.clientWidth + 1);
  });
/** No crash and nothing blocked by the security policy, which is how a broken screen often shows. */
export const problemsOn = async (page, problems) => {
  const blocked = await page.evaluate(() => window.__blocked ?? []).catch(() => []);
  const boundary = (await text(page).catch(() => "")).includes("មានបញ្ហាបច្ចេកទេស");
  return [...problems, ...blocked.map((b) => `blocked: ${b}`), ...(boundary ? ["the app's error screen is showing"] : [])];
};
/** The answer buttons of a question: the same markup in lessons, papers, quizzes and Battles. */
export const options = (page) => page.locator(".flex.flex-col.gap-2 > button:not([disabled])");
