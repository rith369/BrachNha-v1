import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { content, contentItems, go, options, problemsOn, saved, scrollsSideways, settle, startApp, text } from "./setup.mjs";

/** A student doing a lesson, from the subject path to the finish, and what it leaves behind. */

let app;
before(async () => {
  app = await startApp();
});
after(async () => {
  await app.close();
});

const CONTINUE = "បន្ត →";

/** Answers every question left on this step, by the real data: right unless `wrong` says so. */
async function answerAll(page, questions, wrong = () => false) {
  for (const [i, q] of questions.entries()) {
    const pick = wrong(i) ? q.options.findIndex((o) => o !== q.correct) : q.options.indexOf(q.correct);
    // Answered questions disable their buttons, so the enabled ones are always the next question's.
    await options(page).nth(pick).click();
    await page.waitForTimeout(120);
  }
}

test("the whole lesson: from the path, through both steps, to the finish", async () => {
  const section = content("section", "math-1-1-1");
  const { ctx, page, problems } = await app.open();

  await go(page, "/subjects/math");
  await page.locator('a[href="/sections/math-1-1-1"]').first().click();
  await page.waitForURL("**/sections/math-1-1-1");
  await settle(page);
  assert.ok((await text(page)).includes(section.title.replace(/\$/g, "").slice(0, 6)) || (await page.locator(".katex").count()) > 0);

  // A quiz that can be walked past is not a quiz.
  const onward = page.getByRole("button", { name: CONTINUE });
  assert.ok(await onward.isDisabled(), "Continue works before the questions are answered");

  // The first answer wrong, the rest right.
  await answerAll(page, section.quiz, (i) => i === 0);
  assert.ok(await onward.isEnabled(), "Continue stays off after every question is answered");
  let s = await saved(page);
  assert.equal(s.mistakes.length, 1, "the wrong answer should be on the mistakes list");
  assert.ok(s.mistakes[0].ref.startsWith("section:math-1-1-1#"), s.mistakes[0].ref);

  await onward.click();
  await settle(page, 200);
  if (section.quizHarder?.length) {
    assert.ok(await onward.isDisabled(), "the second step can be walked past");
    await answerAll(page, section.quizHarder);
  }
  await onward.click();
  await settle(page);

  // The finish screen reports what really happened.
  const total = section.quiz.length + (section.quizHarder?.length ?? 0);
  const body = await text(page);
  assert.ok(body.includes(`${total - 1}/${total}`), `expected ${total - 1}/${total} on the finish screen`);

  s = await saved(page);
  assert.ok(s.completedSessions.includes("math-1-1-1"), "the lesson is not marked finished");
  assert.ok(s.xp >= (total - 1) * 10, `XP ${s.xp}`);
  assert.equal(s.mistakes.length, 1);
  assert.equal(s.dayCounts.lesson, 1);
  assert.deepEqual(await problemsOn(page, problems), []);

  // On to the next section, which is the path the student actually takes.
  await page.getByRole("button", { name: "ផ្នែកបន្ទាប់ →" }).click();
  await settle(page);
  assert.ok(/\/sections\/math-1-1-\d/.test(page.url()) && !page.url().endsWith("math-1-1-1"), page.url());
  assert.deepEqual(await problemsOn(page, problems), []);

  // Finished survives closing the app.
  await page.reload();
  await settle(page);
  assert.ok((await saved(page)).completedSessions.includes("math-1-1-1"));
  await ctx.close();
});

test("the last lesson in the sample content finishes with no next one", async () => {
  // The crash this guards against shows only at the end of a list.
  const sections = contentItems().filter((i) => i.kind === "section" && i.key.startsWith("math-1-1-"));
  const last = sections.map((i) => i.key).sort((a, b) => Number(a.split("-").at(-1)) - Number(b.split("-").at(-1))).at(-1);
  const section = content("section", last);
  const { ctx, page, problems } = await app.open();
  await go(page, `/sections/${last}`);
  await answerAll(page, section.quiz ?? []);
  const onward = page.getByRole("button", { name: CONTINUE });
  await onward.click();
  await settle(page, 200);
  await answerAll(page, section.quizHarder ?? []);
  await onward.click();
  await settle(page);
  assert.ok((await saved(page)).completedSessions.includes(last));
  await page.getByRole("button", { name: /ផ្លូវមេរៀន/ }).first().click();
  await settle(page);
  assert.ok(page.url().endsWith("/subjects/math"), page.url());
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("a guest can do a lesson, and it stays on the phone", async () => {
  const section = content("section", "math-1-1-1");
  const { ctx, page, problems } = await app.open({ guest: true });
  const before = app.db.writes.length;
  await go(page, "/sections/math-1-1-1");
  await answerAll(page, section.quiz);
  await page.getByRole("button", { name: CONTINUE }).click();
  await settle(page, 200);
  await answerAll(page, section.quizHarder ?? []);
  await page.getByRole("button", { name: CONTINUE }).click();
  await settle(page);
  assert.ok((await saved(page)).completedSessions.includes("math-1-1-1"));
  const synced = app.db.writes.slice(before).filter((w) => /\/rest\/v1\/(profiles|completed_sessions|daily_activity)/.test(w.url));
  assert.deepEqual(synced, [], "a guest's progress was sent to the database");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("a signed-in student's finished lesson reaches the account", async () => {
  const section = content("section", "math-1-1-1");
  const { ctx, page, problems } = await app.open();
  await go(page, "/sections/math-1-1-1");
  await answerAll(page, section.quiz);
  await page.getByRole("button", { name: CONTINUE }).click();
  await settle(page, 200);
  await answerAll(page, section.quizHarder ?? []);
  await page.getByRole("button", { name: CONTINUE }).click();
  await settle(page);
  // Sync trails the phone by seconds.
  await page.waitForTimeout(4000);
  const sent = app.db.writes.filter((w) => w.url.includes("/rest/v1/completed_sessions"));
  assert.ok(JSON.stringify(sent.map((w) => w.body)).includes("math-1-1-1"), "the finished lesson was never sent");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("a hidden lesson sends the student back to the path", async () => {
  app.db.hidden.add("math-1-1-2");
  const { ctx, page, problems } = await app.open();
  await go(page, "/sections/math-1-1-2");
  await settle(page);
  assert.ok(page.url().endsWith("/subjects/math"), page.url());
  app.db.hidden.delete("math-1-1-2");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

// ── The lesson with the 3D model ────────────────────────────────────────────

const TILE = /ម៉ូឌែល 3D/;

for (const [theme, viewport] of [
  ["light", { width: 390, height: 844 }],
  ["dark", { width: 320, height: 568 }],
]) {
  test(`3D: nothing downloads until a tap, then it works (${theme} at ${viewport.width}px)`, async () => {
    const { ctx, page, problems } = await app.open({ theme, viewport });
    const fetched = [];
    page.on("request", (r) => fetched.push(r.url()));
    await go(page, "/sections/biology-3-1-1");
    assert.ok(!fetched.some((u) => u.includes("brain.glb") || u.includes("brain-model-viewer")), "the model downloaded by itself");
    assert.equal(await page.locator("canvas").count(), 0);
    assert.equal(await scrollsSideways(page), false);

    const tile = page.getByRole("button", { name: TILE });
    assert.ok((await tile.innerText()).includes("1 MB"), "the tile should say what it costs");
    await tile.click();
    await page.locator("canvas").first().waitFor({ timeout: 30000 });
    await settle(page, 2500);
    assert.ok(fetched.some((u) => u.includes("brain.glb")));

    // Tapping a part names it, which needs the compressed model to have kept its part names.
    const c = page.locator("canvas").first();
    await c.scrollIntoViewIfNeeded();
    const box = await c.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(1000);
    const label = await page.evaluate(() =>
      [...document.querySelectorAll("div")]
        .filter((d) => d.className.includes?.("whitespace-nowrap") && d.className.includes?.("bg-elevated"))
        .map((d) => d.innerText)
        .join("|")
    );
    assert.ok(label.length > 0, "tapping a part named nothing");
    assert.ok(!/Sculpted|Plane/.test(label), `a raw mesh name reached the student: ${label}`);
    assert.deepEqual(await problemsOn(page, problems), []);
    await ctx.close();
  });
}

test("3D: a failed download keeps the lesson, and Try again works", async () => {
  const { ctx, page } = await app.open();
  let block = true;
  await ctx.route("**/models/brain.glb", (route) => (block ? route.abort("failed") : route.continue()));
  await go(page, "/sections/biology-3-1-1");
  await page.getByRole("button", { name: TILE }).click();
  const retry = page.getByRole("button", { name: "ព្យាយាមម្តងទៀត" });
  await retry.waitFor({ timeout: 20000 });
  assert.ok((await text(page)).includes("មិនអាចផ្ទុកម៉ូឌែល 3D"));
  assert.ok((await page.getByText("ឧទាហរណ៍").count()) >= 1, "the lesson disappeared with the model");
  block = false;
  await retry.click();
  await page.locator("canvas").first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1500);
  assert.equal(await retry.count(), 0);
  await ctx.close();
});
