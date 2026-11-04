import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { content, go, options, problemsOn, saved, settle, startApp, text } from "./setup.mjs";

/** A student sitting a real past paper, start to finish. */

let app;
before(async () => {
  app = await startApp();
});
after(async () => {
  await app.close();
});

const NEXT = "បន្ត →";
const math = content("paper", "2025-math");
const mathQuestions = math.sections.flatMap((s) => s.questions ?? []);

/** Past the rules, which must be agreed to first. */
async function startPaper(page, key) {
  await go(page, `/exam/subjects/${key}`);
  const start = page.getByRole("button", { name: /ចាប់ផ្តើម|ធ្វើម្តងទៀត/ }).last();
  assert.ok(await start.isDisabled(), "a paper can start before the rules are agreed to");
  await page.locator('input[type="checkbox"]').check();
  await start.click();
  await settle(page, 300);
}

/** Every part opens on a short intro, so the first question is one step or more in. */
async function toFirstQuestion(page) {
  for (let i = 0; i < 5 && !(await options(page).count()); i++) {
    await page.getByRole("button", { name: NEXT, exact: true }).click();
    await page.waitForTimeout(60);
  }
}

/**
 * Walks a paper to its submit button. `pick` chooses an option index for a question shown,
 * or null to leave it blank. A step with no options (a section's intro, the writing part)
 * just moves on.
 */
async function walk(page, pick) {
  let answered = 0;
  for (let step = 0; step < 200; step++) {
    const buttons = options(page);
    if (await buttons.count()) {
      const choice = pick(answered);
      if (choice !== null) await buttons.nth(choice).click();
      answered++;
    }
    const next = page.getByRole("button", { name: NEXT, exact: true });
    if (!(await next.count())) return answered;
    await next.click();
    await page.waitForTimeout(60);
  }
  throw new Error("the paper never reached its submit button");
}

test("a whole paper: the rules, every question, submit, the result, the history", async () => {
  const { ctx, page, problems } = await app.open();
  await startPaper(page, "2025-math");

  // Right on the first three by the real data, blank on the rest.
  const shown = await walk(page, (i) => (i < 3 ? mathQuestions[i].options.indexOf(mathQuestions[i].correct) : null));
  assert.equal(shown, mathQuestions.length, "the paper skipped or repeated a question");

  const submit = page.getByRole("button", { name: /ដាក់ស្នើ/ });
  assert.ok((await submit.innerText()).includes(`3/${mathQuestions.length}`), await submit.innerText());
  await submit.click();
  await settle(page);

  const body = await text(page);
  assert.ok(body.includes(`3/${mathQuestions.length}`), "the result does not show the score");
  const s = await saved(page);
  assert.equal(s.paperResults.length, 1);
  assert.equal(s.paperResults[0].paperKey, "2025-math");
  assert.equal(s.paperResults[0].score, 3);
  assert.equal(s.paperResults[0].total, mathQuestions.length);
  assert.equal(s.xp >= 3 * 20, true, `XP ${s.xp}`);
  assert.equal(s.mistakes.length, 0, "a blank is not a mistake");
  assert.ok((await problemsOn(page, problems)).length === 0, (await problemsOn(page, problems)).join());

  // Back, and the attempt is in the history, and it reopens.
  await page.getByRole("button", { name: /← ត្រឡប់/ }).first().click();
  await settle(page);
  await page.getByRole("tab", { name: /ប្រវត្តិធ្វើតេស្ត/ }).click();
  await settle(page, 200);
  assert.ok((await text(page)).includes("ប្រវត្តិធ្វើតេស្ត (1)"));
  await page.getByRole("button", { name: /ត្រឹមត្រូវ/ }).first().click();
  await settle(page, 300);
  assert.ok((await text(page)).includes(`3/${mathQuestions.length}`), "the old attempt did not reopen");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("wrong answers go on the mistakes list, and a changed answer counts as changed", async () => {
  const { ctx, page, problems } = await app.open();
  await startPaper(page, "2025-math");
  await toFirstQuestion(page);
  const first = mathQuestions[0];
  const wrong = first.options.findIndex((o) => o !== first.correct);
  // A picked answer can be changed before submitting: wrong, then right, on the first.
  await options(page).nth(wrong).click();
  await options(page).nth(first.options.indexOf(first.correct)).click();
  await page.getByRole("button", { name: NEXT, exact: true }).click();
  await page.waitForTimeout(60);
  const second = mathQuestions[1];
  await options(page).nth(second.options.findIndex((o) => o !== second.correct)).click();
  await walk(page, () => null);
  await page.getByRole("button", { name: /ដាក់ស្នើ/ }).click();
  await settle(page);
  const s = await saved(page);
  assert.equal(s.paperResults[0].score, 1);
  assert.deepEqual(s.mistakes.map((m) => m.ref), [`paper:2025-math#${second.id}`]);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("the English paper: gap fill and writing, walked to the end", async () => {
  // A different shape from maths, so it takes different branches of the same runner.
  const { ctx, page, problems } = await app.open();
  await startPaper(page, "2025-english");
  await walk(page, () => 0);
  await page.getByRole("button", { name: /ដាក់ស្នើ/ }).click();
  await settle(page);
  const s = await saved(page);
  assert.equal(s.paperResults.length, 1);
  assert.equal(s.paperResults[0].paperKey, "2025-english");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("the clock running out submits what was answered", async () => {
  const { ctx, page, problems } = await app.open();
  await page.clock.install();
  await startPaper(page, "2025-math");
  await toFirstQuestion(page);
  const q = mathQuestions[0];
  await options(page).nth(q.options.indexOf(q.correct)).click();
  // fastForward fires each due timer once. runFor would tick through every second of it.
  await page.clock.fastForward(math.minutes * 60 * 1000 + 5000);
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("brachnha")).state.paperResults?.length === 1, null, { timeout: 15000 });
  const s = await saved(page);
  assert.equal(s.paperResults[0].score, 1, "what was answered should still count");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

// The rule: under 2 seconds is forgiven, so a phone's permission sheet costs nothing. Two real
// absences warn. The third ends the paper, with what was answered still counting.
const away = async (page, ms) => {
  const set = (hidden) =>
    page.evaluate((h) => {
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => (h ? "hidden" : "visible") });
      Object.defineProperty(document, "hidden", { configurable: true, get: () => h });
      document.dispatchEvent(new Event("visibilitychange"));
    }, hidden);
  await set(true);
  await page.waitForTimeout(ms);
  await set(false);
  await page.waitForTimeout(250);
};

test("leaving: a flicker is forgiven, an absence warns, and the answer is kept", async () => {
  const { ctx, page, problems } = await app.open();
  await startPaper(page, "2025-math");
  await toFirstQuestion(page);
  const q = mathQuestions[0];
  await options(page).nth(q.options.indexOf(q.correct)).click();

  await away(page, 300);
  assert.ok(!(await text(page)).includes("ការព្រមាន"), "a flicker counted as leaving");

  await away(page, 2200);
  assert.ok((await text(page)).includes("ការព្រមាន"), "no warning after really leaving");
  await page.getByRole("button", { name: "បន្តប្រឡង →" }).click();
  await page.waitForTimeout(200);

  await walk(page, () => null);
  const submit = await page.getByRole("button", { name: /ដាក់ស្នើ/ }).innerText();
  assert.ok(submit.includes(`1/${mathQuestions.length}`), submit);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("leaving a third time ends the paper, and what was answered still counts", async () => {
  const { ctx, page, problems } = await app.open();
  await startPaper(page, "2025-math");
  await toFirstQuestion(page);
  const q = mathQuestions[0];
  await options(page).nth(q.options.indexOf(q.correct)).click();
  for (let i = 0; i < 2; i++) {
    await away(page, 2200);
    await page.getByRole("button", { name: "បន្តប្រឡង →" }).click();
    await page.waitForTimeout(200);
  }
  assert.equal((await saved(page)).paperResults?.length ?? 0, 0, "the paper ended too early");
  await away(page, 2200);
  await settle(page);
  const s = await saved(page);
  assert.equal(s.paperResults.length, 1, "the third absence did not end the paper");
  assert.equal(s.paperResults[0].score, 1);
  assert.equal(s.paperResults[0].leaves, 3);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});
