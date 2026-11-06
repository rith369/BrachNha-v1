import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { BASE, content, go, options, problemsOn, saved, scrollsSideways, settle, startApp, text } from "./setup.mjs";

/**
 * Tab B, teacher papers (20261106000001): whole papers in the Bac II format, many per
 * subject, keyed "new-{subject}-{n}". The sample has none, so this adds three to the
 * stand-in database, numbered 1, 2 and 10 so the order is checked as numbers, not text.
 */

let app;
const math = content("paper", "2025-math");
const mathQuestions = math.sections.flatMap((s) => s.questions ?? []);
const NEXT = "បន្ត →";

before(async () => {
  app = await startApp();
  app.db.extra = ["new-math-1", "new-math-2", "new-math-10"].map((key) => ({ kind: "paper", key, body: math }));
});
after(async () => {
  app.db.extra = [];
  await app.close();
});

test("subject cards, a subject's papers in number order, and one paper sat to the end", async () => {
  const { ctx, page, problems } = await app.open({ viewport: { width: 320, height: 720 } });
  await go(page, "/exam/subjects");
  await page.getByRole("tab", { name: "វិញ្ញាសារបង្កើតថ្មី" }).click();
  await settle(page, 200);
  assert.ok(page.url().includes("tab=generated"), page.url());

  // A subject with no papers says so and explains itself on a tap.
  await page.getByRole("button", { name: /វិញ្ញាសាររូបវិទ្យា/ }).click();
  await settle(page, 200);
  assert.ok((await text(page)).includes("មាតិកាវិញ្ញាសារនេះកំពុងរៀបចំ"), "no notice on an empty subject");

  // Math opens its own list.
  await page.getByRole("button", { name: /វិញ្ញាសារគណិតវិទ្យា/ }).click();
  await settle(page, 300);
  assert.ok(page.url().includes("subject=math"), page.url());
  const rows = await page.locator('a[href^="/exam/subjects/new-math-"]').allInnerTexts();
  assert.deepEqual(
    rows.map((r) => r.split("\n")[0].trim()),
    ["វិញ្ញាសារទី 1", "វិញ្ញាសារទី 2", "វិញ្ញាសារទី 10"]
  );
  assert.ok(rows[0].includes(`${mathQuestions.length} សំណួរ`), rows[0]);
  assert.equal(await scrollsSideways(page), false, "the list scrolls sideways at 320px");

  // The phone's back button steps from the papers to the subject cards.
  await page.goBack();
  await settle(page, 200);
  assert.ok(!page.url().includes("subject="), page.url());
  await page.goForward();
  await settle(page, 300);

  // The LAST paper in the list, sat to the end.
  await page.getByRole("link", { name: /វិញ្ញាសារទី 10/ }).click();
  await settle(page);
  assert.equal(new URL(page.url()).pathname, "/exam/subjects/new-math-10");
  assert.equal(await page.locator("h1").innerText(), "វិញ្ញាសារទី 10");
  assert.ok((await text(page)).includes("គណិតវិទ្យា · វិញ្ញាសារបង្កើតថ្មី"), "the subject is not named on the paper");

  await page.locator('input[type="checkbox"]').check();
  await page.getByRole("button", { name: /ចាប់ផ្តើម/ }).last().click();
  await settle(page, 300);
  let answered = 0;
  for (let step = 0; step < 200; step++) {
    const buttons = options(page);
    if (await buttons.count()) {
      if (answered === 0) await buttons.nth(mathQuestions[0].options.indexOf(mathQuestions[0].correct)).click();
      answered++;
    }
    const next = page.getByRole("button", { name: NEXT, exact: true });
    if (!(await next.count())) break;
    await next.click();
    await page.waitForTimeout(60);
  }
  assert.equal(answered, mathQuestions.length, "the paper skipped or repeated a question");
  await page.getByRole("button", { name: /ដាក់ស្នើ/ }).click();
  await settle(page);

  const s = await saved(page);
  assert.equal(s.paperResults.length, 1);
  assert.equal(s.paperResults[0].paperKey, "new-math-10");
  assert.equal(s.paperResults[0].score, 1);

  // Back to the detail, then up to math's list, where the paper now shows its score.
  await page.getByRole("button", { name: /← ត្រឡប់/ }).first().click();
  await settle(page);
  await page.getByRole("link", { name: /វិញ្ញាសារតាមមុខវិជ្ជា/ }).click();
  await settle(page, 300);
  assert.ok(page.url().includes("tab=generated") && page.url().includes("subject=math"), page.url());
  const pct = s.paperResults[0].pct;
  assert.ok((await page.getByRole("link", { name: /វិញ្ញាសារទី 10/ }).innerText()).includes(`${pct}%`));

  // The Mock Exam page counts it.
  await go(page, "/exam");
  assert.ok((await text(page)).includes(`${pct}%`), "the exam page's average left the teacher paper out");

  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("a teacher paper that is not there goes back to its subject's list", async () => {
  const { ctx, page, problems } = await app.open();
  await page.goto(`${BASE}/exam/subjects/new-math-5`);
  await page.waitForURL(/subject=math/, { timeout: 8000 });
  assert.ok((await text(page)).includes("វិញ្ញាសារទី 2"));
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("teacher papers stay out of Home's study feed", async () => {
  const { ctx, page, problems } = await app.open();
  await go(page, "/");
  assert.equal(await page.locator('a[href^="/exam/subjects/new-"]').count(), 0);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});
