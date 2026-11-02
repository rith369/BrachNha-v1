/**
 * The KruAI test set: real questions through the real handler and the real
 * model, each reply checked against what a good answer must do. So a change to the
 * prompt or the model can be measured rather than guessed at.
 *
 *   npm run eval:kruai                     every case
 *   npm run eval:kruai -- --quick          the smaller set, about 20 model calls
 *   npm run eval:kruai -- --only a,b       just these cases
 *   npm run eval:kruai -- --tag math       just this tag
 *   npm run eval:kruai -- --self-test      prove the checks work. No model, no quota
 *
 * FREE KEYS ONLY. It reads GEMINI_API_KEYS from .env.local and clears every other
 * Gemini key, so a run can never spend the prepaid production credit. It needs
 * the real handler in dev mode, so sign-in and the daily limit are skipped.
 *
 * NOTHING HERE SHIPS: scripts/ is never bundled. Results go to results/, git-ignored.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer, loadEnv } from "vite";
import katex from "katex";
import { CASES, PROFILE } from "./cases.mjs";
import { checkReply, hasForm, khmerShare, normalise, passed } from "./checks.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const RESULTS = join(HERE, "results");

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at === -1 ? fallback : args[at + 1];
};

const DELAY_MS = Number(option("delay", 4000));
/** Waits after a busy answer. The free tier's limit is per minute. */
const BUSY_WAITS_MS = [30_000, 60_000, 90_000];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const server = await createServer({
  root: ROOT,
  configFile: false,
  // No hot reload: nothing here is a page, and its port clashes with a running dev server.
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: "custom",
  logLevel: "error",
  // Nothing here is a browser page, so no dependency scan of the app's entry.
  optimizeDeps: { noDiscovery: true, include: [] },
});
const { splitMath } = await server.ssrLoadModule("/src/utils/math-render.ts");
const tools = { splitMath, katex };

async function finish(code) {
  await server.close();
  process.exit(code);
}

// ── self-test ───────────────────────────────────────────────────────────────
if (flag("self-test")) {
  let good = 0;
  const bad = [];
  const expectOk = (name, reply, expect, id) => {
    const r = checkReply(reply, expect, tools, { tokens: 10 }).find((c) => c.id === id);
    if (r?.ok) good++;
    else bad.push(`${name}: expected ${id} to pass (${r?.detail ?? "no such check"})`);
  };
  const expectFail = (name, reply, expect, id) => {
    const r = checkReply(reply, expect, tools, { tokens: 10 }).find((c) => c.id === id);
    if (r && !r.ok) good++;
    else bad.push(`${name}: expected ${id} to fail`);
  };
  const KM = "នេះជាចម្លើយរបស់បងសម្រាប់ប្អូន ដោយសរសេរជាភាសាខ្មែរ។";

  expectOk("Khmer prose", KM, {}, "in-khmer");
  expectFail("English prose", "This is an answer written entirely in English.", {}, "in-khmer");
  expectOk("formula beside Khmer does not count as English", `${KM} $\\frac{abcdefgh}{ijklmnop}$`, {}, "in-khmer");
  expectFail("em dash", `${KM} — ${KM}`, {}, "no-em-dash");
  expectOk("no em dash", KM, {}, "no-em-dash");
  expectFail("Khmer numeral", `${KM} ១២`, {}, "latin-digits");
  expectOk("Latin digits", `${KM} 12`, {}, "latin-digits");
  expectFail("vendor name", `${KM} Gemini`, {}, "no-vendor-name");
  expectFail("vendor name, any case", `${KM} GOOGLE`, {}, "no-vendor-name");
  expectFail("sparkle", `${KM} ✨`, {}, "no-sparkle");
  expectOk("good formula", `${KM} $\\frac{1}{2}$`, {}, "math-renders");
  expectFail("broken formula", `${KM} $\\frac{1}{$`, {}, "math-renders");
  expectFail("raw LaTeX in prose", `${KM} \\frac{1}{2}`, {}, "math-renders");
  expectFail("lost backslash", `${KM} $mathrm{H_2O}$`, {}, "math-renders");
  expectFail("stray dollar", `${KM} តម្លៃ $ នេះ`, {}, "math-renders");
  expectOk("money is fine", `${KM} $20`, {}, "math-renders");
  expectOk("guided", `🧭 ${KM}`, { guided: true }, "guides-first");
  expectFail("not guided", KM, { guided: true }, "guides-first");
  expectFail("guided when it should not be", `🧭 ${KM}`, { guided: false }, "answers-directly");
  expectOk("right answer", `${KM} $x = 3$`, { answer: ["=3"] }, "correct-answer");
  expectOk("right answer, spaced", `${KM} $$ L = \\dfrac{1}{2} $$`, { answer: ["=\\frac{1}{2}"] }, "correct-answer");
  expectFail("wrong answer", `${KM} $x = 4$`, { answer: ["=3"] }, "correct-answer");
  expectFail("first digit is not the answer", `${KM} $x = 30$`, { answer: ["=3"] }, "correct-answer");
  expectFail("3x is not 3", `${KM} $y = 3x$`, { answer: ["=3"] }, "correct-answer");
  expectFail("3/2 is not 3", `${KM} $y = 3/2$`, { answer: ["=3"] }, "correct-answer");
  expectOk("no leak", `🧭 ${KM} $x \\to 1$`, { leak: ["=3"] }, "does-not-give-answer");
  expectFail("leak", `🧭 ${KM} $L = 3$`, { leak: ["=3"] }, "does-not-give-answer");
  expectOk("mentions", `${KM} ស៊ីកូត`, { mentions: [["ស៊ីកូត", "zygote"]] }, "mentions:ស៊ីកូត");
  expectOk("mentions, other form", `${KM} ZYGOTE`, { mentions: [["ស៊ីកូត", "zygote"]] }, "mentions:ស៊ីកូត");
  expectFail("does not mention", KM, { mentions: [["ស៊ីកូត", "zygote"]] }, "mentions:ស៊ីកូត");
  expectFail("forbidden", `${KM} ❤`, { forbid: ["❤"] }, "forbids:❤");
  expectOk("formal", `${KM} ចម្លើយ ដូចនេះ`, { formal: true }, "formal-answer");
  expectFail("not formal", KM, { formal: true }, "formal-answer");
  expectOk("table", `${KM}\n| ក | ខ |\n| :--- | :--- |\n| 1 | 2 |`, { table: true }, "has-table");
  expectFail("no table", KM, { table: true }, "has-table");
  expectOk("sibling", KM, { sibling: true }, "sibling-voice");
  expectOk("by name", "សួស្តី Panharith សូមខំរៀន", { sibling: true, name: "Panharith" }, "sibling-voice");
  expectFail("neither", "សូមខំរៀន", { sibling: true, name: "Panharith" }, "sibling-voice");
  if (checkReply(KM, { curated: true }, tools, { tokens: null }).find((c) => c.id === "curated-free")?.ok) good++;
  else bad.push("curated: no tokens should pass");
  expectFail("curated used the model", KM, { curated: true }, "curated-free");
  if (!checkReply(KM, {}, tools, { tokens: null }).find((c) => c.id === "not-cut-off")?.ok) good++;
  else bad.push("a reply with no usage report should fail not-cut-off");
  expectOk("finished", KM, {}, "not-cut-off");
  expectFail("word dash", `${KM}\nខ្មែរ - ភាសា`, {}, "no-word-dash");
  expectOk("a range is not a word dash", `${KM}\n1975 - 1979`, {}, "no-word-dash");

  const same = (a, b) => normalise(a) === normalise(b);
  for (const [a, b] of [
    ["$\\dfrac{1}{2}$", "\\frac{1}{2}"],
    ["\\left(x\\right)", "(x)"],
    ["\\mathrm{H_2O}", "H_2O"],
    ["H₂O", "H_2O"],
    ["\\mathrm{H}_{2}\\mathrm{O}", "H_2O"],
    ["e^{x}", "e^x"],
    ["y²", "y^2"],
    ["− 3", "-3"],
  ]) {
    if (same(a, b)) good++;
    else bad.push(`normalise: "${a}" and "${b}" should match`);
  }
  if (hasForm("$\\lim = \\frac{133}{260}$", "=\\frac{133}{260}")) good++;
  else bad.push("hasForm on a fraction");
  if (khmerShare("ខ្មែរ abc", splitMath) > 0.4) good++;
  else bad.push("khmerShare");

  // Every case must be well formed, or a run wastes quota finding out.
  const ids = new Set();
  for (const c of CASES) {
    if (ids.has(c.id)) bad.push(`duplicate case ${c.id}`);
    ids.add(c.id);
    if (!c.turns?.length || !c.tags?.length) bad.push(`case ${c.id} has no turns or tags`);
    for (const t of c.turns) {
      if (typeof t.say !== "string" || !t.say.trim()) bad.push(`case ${c.id}: empty turn`);
      const check = checkReply(t.say, t.expect, tools, { tokens: 0 });
      if (!Array.isArray(check)) bad.push(`case ${c.id}: bad expect`);
      // The question itself must render, or the test sends broken maths.
      const problem = splitMath(t.say).find((s) => {
        if (s.type !== "math") return false;
        try {
          katex.renderToString(s.value, { throwOnError: true });
          return false;
        } catch {
          return true;
        }
      });
      if (problem) bad.push(`case ${c.id}: the question's formula does not render: ${problem.value}`);
    }
  }

  console.log(`self-test: ${good} passed, ${bad.length} failed. ${CASES.length} cases, ${CASES.reduce((n, c) => n + c.turns.length, 0)} model calls in a full run, ${CASES.filter((c) => c.quick).reduce((n, c) => n + c.turns.length, 0)} in --quick.`);
  for (const line of bad) console.log(`  ✗ ${line}`);
  await finish(bad.length ? 1 : 0);
}

// ── free keys only ──────────────────────────────────────────────────────────
function freeKeys() {
  const file = join(ROOT, ".env.local");
  if (!existsSync(file)) return "";
  const line = readFileSync(file, "utf8").split(/\r?\n/).find((l) => l.startsWith("GEMINI_API_KEYS="));
  return line ? line.slice("GEMINI_API_KEYS=".length).replace(/^["']|["']$/g, "").trim() : "";
}

const keys = freeKeys();
if (!keys) {
  console.error("No GEMINI_API_KEYS in .env.local. This test only runs on free keys, so it stopped.");
  await finish(2);
}
for (const name of ["GEMINI_API_KEY", "GEMINI_API_KEY_1", "GEMINI_API_KEY_2", "GEMINI_API_KEY_3", "GEMINI_API_KEY_4", "GEMINI_API_KEY_5"]) {
  delete process.env[name];
}
process.env.GEMINI_API_KEYS = keys;

// Dev mode needs no sign-in only when no Supabase address is set, but the prompt
// needs the published decks and sections, which come from that address. So the
// address is set just while the real content module fills its 10-minute copy, and
// cleared before each question. Nothing in the app changes for this.
const env = loadEnv("development", ROOT, "");
const contentUrl = env.VITE_SUPABASE_URL ?? "";
const contentKey = env.VITE_SUPABASE_ANON_KEY ?? "";
const { publishedContent } = await server.ssrLoadModule("/server/content-source.ts");
const { handleChat } = await server.ssrLoadModule("/server/chat-handler.ts");

function clearSupabaseEnv() {
  for (const name of ["SUPABASE_URL", "VITE_SUPABASE_URL", "SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"]) {
    delete process.env[name];
  }
}
async function refreshContent() {
  process.env.VITE_SUPABASE_URL = contentUrl;
  process.env.VITE_SUPABASE_ANON_KEY = contentKey;
  const content = await publishedContent();
  clearSupabaseEnv();
  return content;
}

// ── asking ──────────────────────────────────────────────────────────────────
const NO_ANSWER = /^(⏳|⚠️|🔑|🔒)/u;

/** One question through the real handler. Tokens come from the handler's own log. */
async function ask(messages, screen) {
  let tokens = null;
  let model = null;
  const realInfo = console.info;
  const realWarn = console.warn;
  const realError = console.error;
  console.info = (...a) => {
    const m = /tokens in=(\S+) out=(\S+) thought=(\S+).*model=(\S+)/.exec(String(a[0]));
    if (m) {
      tokens = { in: Number(m[1]), out: Number(m[2]), thought: Number(m[3]) };
      model = m[4];
    }
  };
  console.warn = () => {};
  console.error = () => {};
  try {
    const res = await handleChat(
      new Request("http://eval.local/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages, lang: "km", profile: PROFILE, screen: screen ?? {} }),
      })
    );
    const text = await res.text();
    // The usage event arrives as the stream closes.
    await sleep(50);
    return { status: res.status, text, tokens, model };
  } finally {
    console.info = realInfo;
    console.warn = realWarn;
    console.error = realError;
  }
}

async function askWithRetry(messages, screen) {
  let last;
  for (let attempt = 0; attempt <= BUSY_WAITS_MS.length; attempt++) {
    last = await ask(messages, screen);
    if (last.status === 200 && last.text.trim() && !NO_ANSWER.test(last.text.trim())) return { ...last, answered: true };
    if (attempt < BUSY_WAITS_MS.length) {
      console.log(`    busy (${last.status}), waiting ${BUSY_WAITS_MS[attempt] / 1000}s`);
      await sleep(BUSY_WAITS_MS[attempt]);
    }
  }
  return { ...last, answered: false };
}

// ── which cases ─────────────────────────────────────────────────────────────
const only = option("only", "")?.split(",").filter(Boolean) ?? [];
const tag = option("tag", "");
const chosen = CASES.filter(
  (c) =>
    (!flag("quick") || c.quick) &&
    (!only.length || only.includes(c.id)) &&
    (!tag || c.tags.includes(tag))
);
if (!chosen.length) {
  console.error("No cases match.");
  await finish(2);
}

// ── the run ─────────────────────────────────────────────────────────────────
const content = await refreshContent();
console.log(
  `${chosen.length} cases. Content: ${Object.keys(content.decks ?? {}).length} decks, ${Object.keys(content.sections ?? {}).length} sections.\n`
);

const started = new Date();
const results = [];
for (const c of chosen) {
  await refreshContent();
  const history = [];
  const turns = [];
  let status = "pass";

  for (const turn of c.turns) {
    history.push({ role: "user", text: turn.say });
    const answer = await askWithRetry(history, c.screen);
    if (!answer.answered) {
      turns.push({ say: turn.say, reply: answer.text, noAnswer: true, checks: [] });
      status = "no-answer";
      break;
    }
    const checks = checkReply(answer.text, turn.expect, tools, { tokens: answer.tokens });
    turns.push({ say: turn.say, reply: answer.text, tokens: answer.tokens, model: answer.model, checks });
    if (!passed(checks)) status = "fail";
    history.push({ role: "bot", text: answer.text });
    await sleep(DELAY_MS);
  }

  results.push({ id: c.id, tags: c.tags, review: !!c.review, status, turns });
  const mark = status === "pass" ? "✓" : status === "fail" ? "✗" : "?";
  console.log(`${mark} ${c.id}`);
  for (const [i, t] of turns.entries()) {
    for (const r of t.checks.filter((x) => !x.ok)) {
      console.log(`    turn ${i + 1} ${r.hard ? "FAIL" : "note"} ${r.id}: ${r.detail}`);
    }
  }
}

// ── the report ──────────────────────────────────────────────────────────────
const count = (s) => results.filter((r) => r.status === s).length;
const usage = results.flatMap((r) => r.turns).map((t) => t.tokens).filter(Boolean);
const sum = (k) => usage.reduce((n, u) => n + (u[k] || 0), 0);
const models = [...new Set(results.flatMap((r) => r.turns).map((t) => t.model).filter(Boolean))];

console.log(`\n${count("pass")} passed, ${count("fail")} failed, ${count("no-answer")} got no answer (the model was busy), of ${results.length}.`);
console.log(`Model calls with usage: ${usage.length}. Tokens in ${sum("in")}, out ${sum("out")}, thought ${sum("thought")}. Model: ${models.join(", ") || "none"}.`);

const byTag = {};
for (const r of results) {
  if (r.status === "no-answer") continue;
  for (const t of r.tags) {
    byTag[t] ??= { pass: 0, all: 0 };
    byTag[t].all++;
    if (r.status === "pass") byTag[t].pass++;
  }
}
console.log(Object.entries(byTag).map(([t, s]) => `${t} ${s.pass}/${s.all}`).join("  ·  "));

// Compared with the last run of the same cases, which is the point of the file.
mkdirSync(RESULTS, { recursive: true });
const previousName = readdirSync(RESULTS).filter((f) => f.endsWith(".json")).sort().at(-1);
if (previousName) {
  const before = JSON.parse(readFileSync(join(RESULTS, previousName), "utf8"));
  const was = new Map(before.results.map((r) => [r.id, r.status]));
  const worse = results.filter((r) => was.get(r.id) === "pass" && r.status === "fail").map((r) => r.id);
  const better = results.filter((r) => was.get(r.id) === "fail" && r.status === "pass").map((r) => r.id);
  console.log(`Since ${previousName}: ${better.length} newly passing${better.length ? ` (${better.join(", ")})` : ""}, ${worse.length} newly failing${worse.length ? ` (${worse.join(", ")})` : ""}.`);
}

const stamp = started.toISOString().replace(/[:.]/g, "-");
writeFileSync(join(RESULTS, `${stamp}.json`), JSON.stringify({ started: started.toISOString(), models, results }, null, 2));

// The replies, for a person to read: the one part no script can do.
const md = [`# KruAI test run, ${started.toISOString()}`, "", `${count("pass")} passed, ${count("fail")} failed, ${count("no-answer")} got no answer.`, ""];
for (const r of results) {
  const mark = r.status === "pass" ? "PASS" : r.status === "fail" ? "FAIL" : "NO ANSWER";
  md.push(`## ${mark}: ${r.id}${r.review ? " (a person should read this one)" : ""}`, "");
  for (const t of r.turns) {
    md.push(`**Student:** ${t.say}`, "", `**KruAI:**`, "", t.reply, "");
    const missed = t.checks.filter((x) => !x.ok);
    if (missed.length) md.push(...missed.map((x) => `- ${x.hard ? "FAIL" : "note"} ${x.id}: ${x.detail}`), "");
  }
  md.push("---", "");
}
writeFileSync(join(RESULTS, "latest.md"), md.join("\n"));
console.log(`\nReplies to read: scripts/kruai-eval/results/latest.md`);

await finish(count("fail") ? 1 : 0);
