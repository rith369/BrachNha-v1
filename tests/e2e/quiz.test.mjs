import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { content, go, options, problemsOn, saved, settle, startApp, text } from "./setup.mjs";

/** A student doing a practice quiz, start to finish, and coming back to it. */

let app;
before(async () => {
  app = await startApp();
});
after(async () => {
  await app.close();
});

const KEY = "math-1-1-1";
const ROUTE = "/practice/quiz/math/1-1-1";
const questions = content("quiz", KEY);
const NEXT = "បន្ត →";
const FINISH = "បញ្ចប់ →";

const start = async (page) => {
  await go(page, ROUTE);
  await page.getByRole("button", { name: /ចាប់ផ្តើម|ធ្វើម្តងទៀត/ }).first().click();
  await settle(page, 200);
};
const pick = (q, wrong) => (wrong ? q.options.findIndex((o) => o !== q.correct) : q.options.indexOf(q.correct));
/** Every question in `list`, by the real data, through to Finish on the last. */
async function answerAll(page, list, wrong = () => false) {
  for (const [i, q] of list.entries()) {
    await options(page).nth(pick(q, wrong(i))).click();
    await page.waitForTimeout(100);
    await page.getByRole("button", { name: i === list.length - 1 ? FINISH : NEXT, exact: true }).click();
    await page.waitForTimeout(100);
  }
  await settle(page, 200);
}

test("a whole quiz: every question, the last one, the result, and the history", async () => {
  const { ctx, page, problems } = await app.open();
  await go(page, "/practice/quiz/math");
  await page.locator(`a[href="${ROUTE}"]`).first().click();
  await settle(page);
  assert.ok(page.url().endsWith(ROUTE), page.url());
  await page.getByRole("button", { name: /ចាប់ផ្តើម/ }).first().click();
  await settle(page, 200);

  // A quiz that can be walked past is not a quiz.
  assert.ok(await page.getByRole("button", { name: NEXT, exact: true }).isDisabled(), "Continue works with no answer");

  // The first two wrong, the rest right.
  await answerAll(page, questions, (i) => i < 2);

  const right = questions.length - 2;
  const body = await text(page);
  assert.ok(body.includes(`${right}/${questions.length}`), "the result does not show the score");
  const s = await saved(page);
  assert.equal(s.quizResults.length, 1);
  assert.equal(s.quizResults[0].quizKey, KEY);
  assert.equal(s.quizResults[0].score, right);
  assert.equal(s.quizResults[0].answers.length, questions.length);
  assert.equal(s.mistakes.length, 2);
  assert.ok(s.mistakes.every((m) => m.ref.startsWith(`quiz:${KEY}#`)), JSON.stringify(s.mistakes));
  assert.ok(s.xp >= right * 10, `XP ${s.xp}`);
  assert.equal(s.dayCounts.practice, 1);
  assert.deepEqual(await problemsOn(page, problems), []);

  // Back on the quiz, the attempt is in its history and reopens.
  await page.getByRole("button", { name: /ត្រឡប់ក្រោយ/ }).click();
  await settle(page);
  await go(page, ROUTE);
  await page.getByRole("tab", { name: /ប្រវត្តិ/ }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: new RegExp(`${right}/${questions.length}`) }).first().click();
  await settle(page, 200);
  assert.ok((await text(page)).includes(`${right}/${questions.length}`), "the old attempt did not reopen");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("retrying only the wrong ones: clears them from the mistakes list", async () => {
  const { ctx, page, problems } = await app.open();
  await start(page);
  await answerAll(page, questions, (i) => i < 2);
  await page.getByRole("button", { name: /ធ្វើសំណួរខុសម្តងទៀត \(2\)/ }).click();
  await settle(page, 200);
  // Only the two wrong ones come back, in order, and the second is the last.
  await answerAll(page, questions.slice(0, 2));
  const s = await saved(page);
  assert.equal(s.mistakes.length, 0, "getting them right should clear them");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("a perfect score offers the whole quiz again, and a second attempt is added", async () => {
  const { ctx, page, problems } = await app.open();
  await start(page);
  await answerAll(page, questions);
  assert.ok((await text(page)).includes(`${questions.length}/${questions.length}`));
  assert.equal((await saved(page)).mistakes?.length ?? 0, 0);
  await page.getByRole("button", { name: "ធ្វើម្តងទៀត →" }).click();
  await settle(page, 200);
  await answerAll(page, questions, (i) => i === questions.length - 1);
  const s = await saved(page);
  assert.equal(s.quizResults.length, 2);
  assert.equal(s.quizResults[1].score, questions.length - 1);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("an answered question shows why, and cannot be changed for more XP", async () => {
  const { ctx, page, problems } = await app.open();
  await start(page);
  const q = questions[0];
  await options(page).nth(pick(q, false)).click();
  await page.waitForTimeout(150);
  const xp = (await saved(page)).xp;
  assert.equal(await options(page).count(), 0, "the options should lock once answered");
  assert.equal((await saved(page)).xp, xp);
  assert.ok((await page.getByRole("button", { name: NEXT, exact: true }).isEnabled()), "Continue stays off after answering");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("a signed-in student's result reaches the account, and a guest's does not", async () => {
  const signed = await app.open();
  await start(signed.page);
  await answerAll(signed.page, questions);
  await signed.page.waitForTimeout(4000);
  const sent = app.db.writes.filter((w) => w.url.includes("/rest/v1/quiz_results"));
  assert.ok(JSON.stringify(sent.map((w) => w.body)).includes(KEY), "the result was never sent");
  await signed.ctx.close();

  const guest = await app.open({ guest: true });
  const before = app.db.writes.length;
  await start(guest.page);
  await answerAll(guest.page, questions);
  assert.equal((await saved(guest.page)).quizResults.length, 1);
  assert.deepEqual(app.db.writes.slice(before).filter((w) => w.url.includes("/rest/v1/quiz_results")), []);
  assert.deepEqual(await problemsOn(guest.page, guest.problems), []);
  await guest.ctx.close();
});

test("practising what I got wrong: the list, a round, and an emptied list", async () => {
  const { ctx, page, problems } = await app.open();
  await start(page);
  await answerAll(page, questions, (i) => i === 0);
  await go(page, "/practice");
  assert.ok((await text(page)).includes("កំហុសរបស់ខ្ញុំ"), "the mistakes card is missing");
  await go(page, "/practice/mistakes/run");
  await settle(page, 300);
  await options(page).nth(pick(questions[0], false)).click();
  await page.waitForTimeout(250);
  assert.equal((await saved(page)).mistakes.length, 0, "a right answer should clear it");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("a hidden quiz sends the student back rather than crashing", async () => {
  app.db.hidden.add(KEY);
  const { ctx, page, problems } = await app.open();
  await go(page, ROUTE);
  app.db.hidden.delete(KEY);
  assert.ok(!page.url().endsWith(ROUTE), page.url());
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});
