import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { content, go, options, settle, startApp } from "./setup.mjs";

/**
 * What a screen reader finds its way by: one main section and one main heading, on every
 * screen. Invisible to a sighted student, so nothing else would notice it going missing.
 */

const ROUTES = [
  "/", "/lessons", "/subjects/math", "/sections/math-1-1-1", "/practice", "/practice/flashcards/biology",
  "/practice/flashcards/biology/1-1", "/practice/quiz/math", "/practice/quiz/math/1-1-1", "/practice/review",
  "/practice/mistakes", "/exam", "/exam/subjects", "/exam/subjects/2025-math", "/exam/simulation", "/game",
  "/game/create", "/progress", "/grade-prediction", "/leaderboard", "/streak", "/streak/friends", "/roadmap",
  "/profile", "/privacy", "/no-such-page",
];

let app;
before(async () => {
  app = await startApp();
});
after(async () => {
  await app.close();
});

/** Headings a phone would read out, so one hidden with a dimmed-out step does not count. */
const structure = (page) =>
  page.evaluate(() => ({
    main: document.querySelectorAll("main").length,
    h1: [...document.querySelectorAll("h1")]
      .filter((h) => h.getClientRects().length > 0)
      .map((h) => h.textContent.trim().replace(/\s+/g, " ").slice(0, 50)),
  }));

const assertOne = async (page, where) => {
  const s = await structure(page);
  assert.equal(s.main, 1, `${where}: ${s.main} main sections`);
  assert.equal(s.h1.length, 1, `${where}: headings ${JSON.stringify(s.h1)}`);
  assert.ok(s.h1[0].length > 0, `${where}: an empty heading`);
};

test("every screen has one main section and one main heading", async () => {
  const { ctx, page } = await app.open();
  const wrong = [];
  for (const route of ROUTES) {
    await go(page, route);
    await assertOne(page, route).catch((e) => wrong.push(e.message));
  }
  await ctx.close();
  assert.deepEqual(wrong, []);
});

test("a guest's screens, and the first-run screens, have them too", async () => {
  const guest = await app.open({ guest: true });
  const wrong = [];
  for (const route of ["/", "/lessons", "/roadmap", "/game", "/game/create", "/profile"]) {
    await go(guest.page, route);
    await assertOne(guest.page, `guest ${route}`).catch((e) => wrong.push(e.message));
  }
  await guest.ctx.close();

  const fresh = await app.open({ fresh: true });
  await go(fresh.page, "/");
  await assertOne(fresh.page, "the intro").catch((e) => wrong.push(e.message));
  await fresh.ctx.close();

  const naming = await app.open({ state: { userName: "" } });
  await go(naming.page, "/");
  await assertOne(naming.page, "the name form").catch((e) => wrong.push(e.message));
  await naming.ctx.close();

  const survey = await app.open({ state: { surveyed: false } });
  await go(survey.page, "/");
  await assertOne(survey.page, "the survey").catch((e) => wrong.push(e.message));
  await survey.ctx.close();
  assert.deepEqual(wrong, []);
});

test("inside the tasks too: a lesson's steps, a running paper and a running quiz", async () => {
  const wrong = [];
  const check = (page, where) => assertOne(page, where).catch((e) => wrong.push(e.message));
  const { ctx, page } = await app.open();

  const section = content("section", "math-1-1-1");
  await go(page, "/sections/math-1-1-1");
  for (const q of section.quiz) {
    await options(page).nth(q.options.indexOf(q.correct)).click();
    await page.waitForTimeout(80);
  }
  await page.getByRole("button", { name: "បន្ត →" }).click();
  await settle(page, 150);
  await check(page, "a lesson's second step");
  for (const q of section.quizHarder ?? []) {
    await options(page).nth(q.options.indexOf(q.correct)).click();
    await page.waitForTimeout(80);
  }
  await page.getByRole("button", { name: "បន្ត →" }).click();
  await settle(page);
  await check(page, "a lesson's finish");

  await go(page, "/exam/subjects/2025-math");
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole("button", { name: /ចាប់ផ្តើម/ }).last().click();
  await settle(page, 200);
  await check(page, "a running paper");
  await page.getByRole("button", { name: "បន្ត →" }).click();
  await page.waitForTimeout(100);
  await check(page, "a paper's question");

  await go(page, "/practice/quiz/math/1-1-1");
  await page.getByRole("button", { name: /ចាប់ផ្តើម/ }).first().click();
  await settle(page, 200);
  await check(page, "a running quiz");

  await go(page, "/game/create");
  await page.getByRole("button", { name: /គណិតវិទ្យា/ }).first().click();
  await settle(page);
  await page.getByRole("button", { name: "ចាប់ផ្តើមលេង" }).click();
  await settle(page, 200);
  await check(page, "a running Battle");
  await ctx.close();
  assert.deepEqual(wrong, []);
});
