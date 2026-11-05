import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, test } from "node:test";
import { content, go, options, problemsOn, saved, scrollsSideways, settle, startApp, text } from "./setup.mjs";

/**
 * The 2-day Bac II Simulation, which no one can usefully test by hand: seven papers, two
 * days and a 48-hour clock. The sample content has two real papers, so the other five are
 * small stand-ins with the same shape. Maths and English stay real, so the longest runs of
 * the real paper screen are in here.
 */

const small = (name) => ({
  minutes: 60,
  points: 50,
  sections: [{
    id: "a", title: `${name} part`, instruction: "Pick one",
    questions: [
      { id: "q1", q: `${name} one`, options: ["A1", "B1", "C1", "D1"], correct: "B1", explanation: "because one" },
      { id: "q2", q: `${name} two`, options: ["A2", "B2", "C2", "D2"], correct: "C2", explanation: "because two" },
    ],
  }],
});
const SMALL = ["history", "biology", "chemistry", "khmer", "physics"];
const ORDER = [
  ["history", "2025-history"], ["biology", "2025-biology"], ["chemistry", "2025-chemistry"], ["language", "2025-english"],
  ["khmer", "2025-khmer"], ["physics", "2025-physics"], ["math", "2025-math"],
];
const BODIES = {
  ...Object.fromEntries(SMALL.map((s) => [`2025-${s}`, small(s)])),
  "2025-english": content("paper", "2025-english"),
  "2025-math": content("paper", "2025-math"),
};

const hoursAgo = (h) => new Date(Date.now() - h * 3600_000).toISOString();
const done = (sessionId, paperKey, h = 2) => ({
  sessionId, paperKey, version: 1, startedAt: hoursAgo(h),
  result: { finishedAt: hoursAgo(h - 1), score: 2, total: 2, pct: 100, ms: 60000, answers: {}, leaves: 0 },
});
const pending = (sessionId, paperKey) => ({ sessionId, paperKey, version: 1 });
const attempt = (sittings) => ({ id: "att-1", startedAt: hoursAgo(60), updatedAt: hoursAgo(60), finishedAt: null, test: false, sittings });

let app;
before(async () => {
  app = await startApp();
});
after(async () => {
  await app.close();
});
beforeEach(() => {
  app.db.extra = SMALL.map((s) => ({ kind: "paper", key: `2025-${s}`, body: BODIES[`2025-${s}`] }));
});
afterEach(() => {
  app.db.extra = [];
});

const START_SIM = "Start Simulation";
const ENTER = "Enter Day 1 Exam";
const SIT = "ចាប់ផ្តើមប្រឡង";
const NEXT = "បន្ត →";

const begin = async (page) => {
  await go(page, "/exam/simulation");
  await page.getByRole("button", { name: START_SIM }).first().click();
  await page.getByRole("button", { name: ENTER }).click();
  await settle(page, 200);
};
/** One whole paper, from its start button to its submit: right by the real data, or blank. */
async function sit(page, key, { blank = false } = {}) {
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole("button", { name: SIT }).click();
  await settle(page, 200);
  const questions = BODIES[key].sections.flatMap((s) => s.questions ?? []);
  let answered = 0;
  for (let step = 0; step < 200; step++) {
    const buttons = options(page);
    if (!blank && (await buttons.count())) {
      const q = questions[answered];
      if (q) await buttons.nth(q.options.indexOf(q.correct)).click();
      answered++;
    }
    const next = page.getByRole("button", { name: NEXT, exact: true });
    if (!(await next.count())) break;
    await next.click();
    await page.waitForTimeout(40);
  }
  await page.getByRole("button", { name: /ដាក់ស្នើ/ }).click();
  await settle(page, 250);
}

test("the whole Simulation: 7 papers across 2 days, to the real grade", async () => {
  const { ctx, page, problems } = await app.open();
  await begin(page);
  assert.ok(page.url().endsWith("/exam/simulation/sit"), page.url());
  let s = await saved(page);
  assert.deepEqual(s.simulations[0].sittings.map((x) => x.sessionId), ORDER.map(([a]) => a), "the papers are out of order");
  assert.equal(s.simulations[0].sittings[3].paperKey, "2025-english", "the language paper should be the student's own");
  assert.ok(!s.simulations[0].sittings[0].startedAt, "entering should not start the clock");

  // Day 1. Nothing shows a score between papers.
  for (const [i, [, key]] of ORDER.slice(0, 4).entries()) {
    await sit(page, key);
    s = await saved(page);
    assert.ok(s.simulations[0].sittings[i].result, `${key} did not save`);
    assert.ok(!page.url().includes("/result/"), "the result opened early");
  }
  assert.ok((await text(page)).includes("ថ្ងៃទី 1 ចប់ហើយ"), "Day 1 should say it has finished");
  assert.equal(s.simulations[0].finishedAt, null);

  // A score cannot be read early by typing its address.
  await go(page, `/exam/simulation/result/${s.simulations[0].id}`);
  assert.ok(page.url().endsWith("/exam/simulation/sit"), "the result opened before the end");

  // Day 2 opens at once. The last paper is left blank, the last item of the whole flow.
  await sit(page, "2025-khmer");
  await sit(page, "2025-physics");
  await sit(page, "2025-math", { blank: true });

  assert.ok(/\/exam\/simulation\/result\//.test(page.url()), `the last paper should end on the result: ${page.url()}`);
  s = await saved(page);
  assert.ok(s.simulations[0].finishedAt, "the Simulation did not finish");
  assert.equal(s.paperResults.length, 7, "each paper should count in its own history, once");

  // Everything right but maths: 350 of 475, which is a C. The language paper is not counted.
  await page.getByText("350 / 475").waitFor({ timeout: 8000 });
  const body = await text(page);
  assert.ok(body.includes("74%"), "wrong percentage");
  assert.ok(body.includes("0/125"), "maths should be 0 of 125");
  assert.ok(body.includes("50/50"), "a full paper should be 50 of 50");
  assert.equal(await scrollsSideways(page), false);
  assert.deepEqual(await problemsOn(page, problems), []);

  // A paper reopens for review, and back again.
  await page.getByRole("button", { name: /ប្រវត្តិវិទ្យា/ }).first().click();
  await settle(page, 300);
  assert.ok((await text(page)).includes("history one"), "the review did not open");
  await page.getByRole("button", { name: "← ត្រឡប់" }).click();
  await settle(page, 200);
  assert.ok((await text(page)).includes("350 / 475"));

  // Listed as a past result, and a new one can start.
  await go(page, "/exam/simulation");
  const briefing = await text(page);
  assert.ok(briefing.includes("លទ្ធផលមុនៗ") && briefing.includes("350 ពិន្ទុ"), "the briefing should list it");
  assert.ok((await page.getByRole("button", { name: START_SIM }).count()) > 0);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("with papers missing, a student sees coming soon and cannot start", async () => {
  app.db.extra = [];
  const { ctx, page, problems } = await app.open();
  await go(page, "/exam");
  assert.ok((await text(page)).includes("ឆាប់ៗនេះ"));
  await go(page, "/exam/simulation");
  assert.equal(await page.getByRole("button", { name: START_SIM }).count(), 0);
  await go(page, "/exam/simulation/sit");
  assert.ok(page.url().endsWith("/exam/simulation"), "the sit screen opened with no attempt");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("the clock only starts on the first paper, and a reload keeps the answer", async () => {
  const { ctx, page, problems } = await app.open();
  await begin(page);
  const start = page.getByRole("button", { name: SIT });
  assert.ok(await start.isDisabled(), "a paper starts without agreeing to the rules");
  assert.ok((await text(page)).includes("48 ម៉ោង"), "the rule should be stated first");
  assert.ok(!(await text(page)).includes("នៅសល់"), "the 2 days are counting already");

  await page.locator('input[type="checkbox"]').check();
  await start.click();
  await settle(page, 200);
  assert.ok((await saved(page)).simulations[0].sittings[0].startedAt, "starting should start the clock");
  await page.getByRole("button", { name: NEXT, exact: true }).click();
  await page.getByRole("button", { name: "B1", exact: true }).click();
  await settle(page, 200);

  // Closing the app counts as leaving, and the answer is still there.
  await page.reload();
  await settle(page);
  assert.ok((await text(page)).includes("1/2"), "coming back should count as one absence");
  await page.getByRole("button", { name: "បន្តប្រឡង →" }).click();
  await settle(page, 200);
  await page.getByRole("button", { name: "បន្តប្រឡង →" }).click();
  await settle(page, 200);
  const b1 = page.getByRole("button", { name: "B1", exact: true });
  assert.ok((await b1.getAttribute("class")).includes("bg-purple/30"), "the answer was lost");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("a paper whose time ran out while away is submitted, and counted once", async () => {
  const sittings = ORDER.map(([a, b], i) => (i === 0 ? done(a, b) : i === 1 ? { ...pending(a, b), startedAt: hoursAgo(3) } : pending(a, b)));
  const { ctx, page, problems } = await app.open({ state: { simulations: [attempt(sittings)] } });
  await page.addInitScript(() => {
    localStorage.setItem("brachnha-simulation-draft", JSON.stringify({ attemptId: "att-1", sessionId: "biology", answers: { q1: "A1", q2: "C2" }, leaves: 1, index: 2 }));
  });
  await go(page, "/exam/simulation/sit");
  await page.waitForTimeout(800);
  const s = await saved(page);
  const bio = s.simulations[0].sittings[1];
  assert.equal(bio.result?.score, 1, JSON.stringify(bio.result));
  assert.equal(bio.result.answers.q2, "C2");
  assert.equal(bio.result.leaves, 1);
  assert.equal(bio.result.ms, 90 * 60000, "time should be held to the paper's budget");
  assert.equal(s.paperResults.length, 1, "counted more than once");
  assert.ok((await text(page)).includes("គីមីវិទ្យា"), "the next paper should be chemistry");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("after the 48 hours, it ends with what was sat, and the rest count as zero", async () => {
  const sittings = ORDER.map(([a, b], i) => (i === 0 ? done(a, b, 50) : i === 1 ? done(a, b, 49) : pending(a, b)));
  const { ctx, page, problems } = await app.open({ state: { simulations: [attempt(sittings)] } });
  await go(page, "/exam/simulation/sit");
  await page.waitForTimeout(800);
  assert.ok(/\/exam\/simulation\/result\/att-1$/.test(page.url()), page.url());
  const s = await saved(page);
  const a = s.simulations[0];
  assert.equal(a.finishedAt, new Date(Date.parse(a.sittings[0].startedAt) + 48 * 3600_000).toISOString(), "it should end at exactly 48 hours");
  await page.getByText("125 / 475").waitFor({ timeout: 8000 });
  const body = await text(page);
  assert.ok(body.includes("26%"));
  assert.ok(body.includes("អស់ពេល 2 ថ្ងៃ"), "it should say the 2 days ran out");
  assert.ok((body.match(/មិនបានធ្វើ/g) ?? []).length >= 5, "the missed papers should say so");
  assert.equal(s.xp ?? 0, 0, "no XP for papers not sat");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("just inside the 48 hours, it is still running", async () => {
  const sittings = ORDER.map(([a, b], i) => (i === 0 ? done(a, b, 47) : pending(a, b)));
  const { ctx, page, problems } = await app.open({ state: { simulations: [attempt(sittings)] } });
  await go(page, "/exam/simulation/sit");
  assert.ok(page.url().endsWith("/exam/simulation/sit"), page.url());
  assert.equal((await saved(page)).simulations[0].finishedAt, null);
  assert.ok((await text(page)).includes("នៅសល់"), "it should show the time left");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("giving up removes the attempt and keeps the papers already sat", async () => {
  const { ctx, page, problems } = await app.open();
  await begin(page);
  await sit(page, "2025-history");
  await page.getByRole("button", { name: "បោះបង់ការប្រឡងសាកល្បងនេះ" }).click();
  await settle(page, 200);
  await page.getByRole("button", { name: "បោះបង់", exact: true }).click();
  await settle(page);
  const s = await saved(page);
  assert.equal(s.simulations.length, 0);
  assert.equal(s.paperResults.length, 1, "the paper's own history was lost");
  assert.ok(page.url().endsWith("/exam/simulation"), page.url());
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("a signed-in student's attempt reaches the account, and old addresses go somewhere sensible", async () => {
  const { ctx, page, problems } = await app.open();
  await begin(page);
  await sit(page, "2025-history");
  await page.waitForTimeout(4000);
  const sent = JSON.stringify(app.db.writes.filter((w) => w.url.includes("/rest/v1/simulation_attempts")).map((w) => w.body));
  assert.ok(sent.includes("2025-history"), "the attempt was never sent");
  await go(page, "/exam/simulation/result/no-such-attempt");
  assert.ok(page.url().endsWith("/exam/simulation"), page.url());
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

for (const [theme, viewport] of [["dark", { width: 320, height: 568 }]]) {
  test(`the result fits a small phone in ${theme}`, async () => {
    const sittings = ORDER.map(([a, b]) => done(a, b));
    const { ctx, page, problems } = await app.open({ theme, viewport, state: { simulations: [attempt(sittings)] } });
    await go(page, "/exam/simulation/sit");
    await page.waitForTimeout(800);
    assert.ok(/\/result\//.test(page.url()), page.url());
    assert.equal(await scrollsSideways(page), false);
    assert.deepEqual(await problemsOn(page, problems), []);
    await ctx.close();
  });
}
