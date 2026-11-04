import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { go, problemsOn, scrollsSideways, settle, startApp, text } from "./setup.mjs";

/**
 * Every main screen opens, in both themes and at the 320px floor. This cannot say a
 * screen is RIGHT. It catches the commonest way one breaks: a crash, a blocked resource,
 * or a page that scrolls sideways on a small phone.
 */

const ROUTES = [
  "/", "/lessons", "/subjects/math", "/subjects/biology", "/sections/math-1-1-1", "/practice",
  "/practice/flashcards/biology", "/practice/flashcards/biology/1-1", "/practice/quiz/math",
  "/practice/quiz/math/1-1-1", "/practice/review", "/practice/mistakes", "/exam", "/exam/subjects",
  "/exam/subjects/2025-math", "/exam/subjects/2025-english", "/exam/simulation", "/game", "/game/create",
  "/progress", "/grade-prediction", "/leaderboard", "/streak", "/streak/friends", "/roadmap", "/profile",
  "/privacy", "/no-such-page",
];

let app;
before(async () => {
  app = await startApp();
});
after(async () => {
  await app.close();
});

for (const [theme, viewport] of [
  ["light", { width: 390, height: 844 }],
  ["dark", { width: 320, height: 568 }],
]) {
  test(`every screen opens: ${theme} at ${viewport.width}px`, async () => {
    const { ctx, page, problems } = await app.open({ theme, viewport });
    const broken = [];
    for (const route of ROUTES) {
      await go(page, route);
      const found = await problemsOn(page, problems);
      if (found.length) broken.push(`${route}: ${found.join("; ")}`);
      if (await scrollsSideways(page)) broken.push(`${route}: scrolls sideways`);
      if ((await text(page)).trim().length < 10) broken.push(`${route}: nothing on it`);
      problems.length = 0;
    }
    await ctx.close();
    assert.deepEqual(broken, []);
  });
}

test("a brand-new phone: the intro, then Home as a guest", async () => {
  const { ctx, page, problems } = await app.open({ fresh: true, viewport: { width: 360, height: 640 } });
  await go(page, "/");
  // Through the intro, however many screens it has, to the end.
  for (let i = 0; i < 8; i++) {
    const next = page.getByRole("button", { name: /បន្ត|ចាប់ផ្តើម|Next|Start|Continue|Get started/ }).first();
    if (!(await next.count())) break;
    await next.click();
    await settle(page, 300);
  }
  const body = await text(page);
  assert.ok(body.trim().length > 40, "nothing after the intro");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("the logo in the page is replaced once the app has started", async () => {
  const { ctx, page, problems } = await app.open();
  await go(page, "/");
  assert.equal(await page.locator('#root > div > img[alt="BrachNha"]').count(), 0);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("the browser tab title has no em dash", async () => {
  const { ctx, page } = await app.open();
  await go(page, "/");
  assert.ok(!(await page.title()).includes("—"), await page.title());
  await ctx.close();
});
