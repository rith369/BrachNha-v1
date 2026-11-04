import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { content, go, options, problemsOn, saved, settle, startApp, text, UID } from "./setup.mjs";

/** A student creating a Battle, and another student joining one. */

let app;
before(async () => {
  app = await startApp();
});
after(async () => {
  await app.close();
});
beforeEach(() => {
  app.db.competitions.length = 0;
  app.db.attempts.length = 0;
  app.db.writes.length = 0;
  app.db.postError = null;
  app.db.attemptError = null;
});

const pool = content("game", "math");
const frozen = pool.slice(0, 3).map((g) => ({
  q: { en: g.q, km: g.q },
  options: g.options,
  correct: g.correct,
  explanation: g.explanation,
}));
const OTHER = "99999999-2222-3333-4444-555555555555";
const theirBattle = () => ({
  id: "their-battle", creator_id: OTHER, creator_name: "ដារា", subject: "math", difficulty: "mix", minutes: 10,
  questions: frozen, creator_answers: frozen.map((q) => q.correct), creator_score: 2, creator_ms: 60000,
  total: 3, created_at: new Date().toISOString(),
});

/** Answers each question as it comes. A Battle moves on by itself after a short pause. */
async function play(page, count, pick = () => 0) {
  for (let i = 0; i < count; i++) {
    await options(page).first().waitFor({ timeout: 8000 });
    await options(page).nth(pick(i)).click();
    await page.waitForTimeout(700);
    // Some questions wait for a Next button rather than moving on.
    const next = page.getByRole("button", { name: /បន្ត|→/ }).first();
    if (i < count - 1 && (await next.count()) && (await next.isEnabled().catch(() => false)) && !(await options(page).count())) {
      await next.click().catch(() => {});
      await page.waitForTimeout(150);
    }
  }
}

async function createBattle(page) {
  await go(page, "/game/create");
  await page.getByRole("button", { name: /គណិតវិទ្យា/ }).first().click();
  await settle(page);
  await page.getByRole("button", { name: "ចាប់ផ្តើមលេង" }).click();
  await settle(page, 200);
  await play(page, 10);
  await settle(page);
}

for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }]) {
  test(`creating a Battle at ${viewport.width}px: played, shared, and on the hub`, async () => {
    const { ctx, page, problems } = await app.open({ viewport });
    await createBattle(page);

    assert.equal(app.db.competitions.length, 1, "the Battle never reached the database");
    const sent = app.db.writes.find((w) => w.url.includes("/rpc/post_competition"));
    assert.equal(sent.body.p_questions.length, 10);
    assert.equal(sent.body.p_subject, "math");
    // The database throws out anything that is not the pool's, word for word (tests/db).
    assert.ok(
      sent.body.p_questions.every((q) => pool.some((g) => (typeof g.q === "string" ? g.q : g.q.km) === q.q.km && JSON.stringify(g.options) === JSON.stringify(q.options))),
      "a question sent is not the pool's"
    );
    assert.ok(sent.body.p_answers.every((a, i) => sent.body.p_questions[i].options.includes(a)));
    assert.ok(!app.db.writes.some((w) => /\/rest\/v1\/competitions/.test(w.url)), "wrote straight to the table");
    for (const key of ["p_score", "p_name", "creator_name", "creator_score"]) assert.ok(!(key in sent.body), `sent ${key}`);

    const body = await text(page);
    assert.ok(body.includes("រង់ចាំមិត្តភក្តិ"), "the posted screen should say it is waiting for a friend");
    const s = await saved(page);
    assert.equal(s.competitions.length, 1);
    assert.ok(s.competitions[0].sharedAt, "not marked as shared");
    assert.ok(s.xp > 0 || s.competitions[0].creatorScore === 0);
    assert.equal(s.tasks.challenge, true, "a Battle counts as the day's challenge");
    assert.deepEqual(await problemsOn(page, problems), []);

    // On to the answers, and home to the hub.
    await page.getByRole("button", { name: "មើលចម្លើយ" }).click();
    await settle(page);
    assert.ok(page.url().includes("/game/review/"), page.url());
    assert.deepEqual(await problemsOn(page, problems), []);
    await go(page, "/game");
    assert.ok((await text(page)).includes("បើកចំហរង់ចាំ"), "the hub should show it open for joiners");
    assert.deepEqual(await problemsOn(page, problems), []);
    await ctx.close();
  });
}

test("a Battle that cannot be shared stays on the phone and says so", async () => {
  app.db.postError = { code: "XX000", message: "boom" };
  const { ctx, page, problems } = await app.open();
  await createBattle(page);
  assert.ok((await text(page)).includes("សូមពិនិត្យអ៊ីនធឺណិត"), "should blame the connection");
  assert.equal((await page.getByRole("button", { name: /អញ្ជើញ/ }).count()), 0, "an invite that cannot work is on screen");
  const s = await saved(page);
  assert.equal(s.competitions.length, 1, "the student's own record was lost");
  assert.ok(!s.competitions[0].sharedAt);
  assert.deepEqual(await problemsOn(page, problems), []);

  // And it shares by itself on a later visit to the hub.
  app.db.postError = null;
  await go(page, "/game");
  await page.waitForTimeout(1500);
  assert.equal(app.db.competitions.length, 1, "the hub did not retry");
  assert.ok((await saved(page)).competitions[0].sharedAt);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("the 21st Battle in a day says it is today's limit, and shares the next day", async () => {
  app.db.postError = { code: "P0001", hint: "too_many", message: "too many today" };
  const { ctx, page, problems } = await app.open();
  await createBattle(page);
  const body = await text(page);
  assert.ok(body.includes("ថ្ងៃនេះអ្នកបានចែករំលែកការប្រកួតគ្រប់ចំនួនហើយ"), "should say it is today's limit");
  assert.ok(!body.includes("សូមពិនិត្យអ៊ីនធឺណិត"), "should not blame the connection");
  assert.equal((await saved(page)).competitions.length, 1, "the run was lost");
  assert.deepEqual(await problemsOn(page, problems), []);

  app.db.postError = null;
  await go(page, "/game");
  await page.waitForTimeout(1500);
  assert.ok((await saved(page)).competitions[0].sharedAt, "it should share by itself the next day");
  await ctx.close();
});

test("a Battle already up there reads as shared", async () => {
  app.db.postError = { code: "23505", message: "duplicate" };
  const { ctx, page, problems } = await app.open();
  await createBattle(page);
  assert.ok((await saved(page)).competitions[0].sharedAt);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }]) {
  test(`joining someone's Battle at ${viewport.width}px: played, scored against them, recorded`, async () => {
    app.db.competitions.push(theirBattle());
    const { ctx, page, problems } = await app.open({ viewport });
    await go(page, "/game");
    assert.ok((await text(page)).includes("ដារា"), "their Battle is not on the hub");

    await go(page, "/game/play/their-battle");
    const start = page.getByRole("button", { name: /លេង|ចាប់ផ្តើម/ }).first();
    if (await start.count()) await start.click();
    await settle(page, 200);
    // All three right, by the real data.
    await play(page, 3, (i) => frozen[i].options.indexOf(frozen[i].correct));
    await settle(page);

    const sent = app.db.writes.find((w) => w.url.includes("/rpc/post_competition_attempt"));
    assert.ok(sent, "the attempt never reached the database");
    assert.equal(sent.body.p_competition, "their-battle");
    assert.deepEqual(sent.body.p_answers, frozen.map((q) => q.correct));
    assert.ok(!("p_score" in sent.body), "the phone must not send a score");
    assert.ok(!app.db.writes.some((w) => /\/rest\/v1\/competition_attempts/.test(w.url)));

    const s = await saved(page);
    assert.equal(s.competitionAttempts.length, 1);
    assert.equal(s.competitionAttempts[0].score, 3);
    assert.equal(s.competitionAttempts[0].opponentName, "ដារា");
    // 10 for each right answer, and 20 for the day's challenge mission (utils/rewards.ts).
    assert.equal(s.xp, 3 * 10 + 20);
    assert.deepEqual(await problemsOn(page, problems), []);

    // Played: it leaves the list of what can be played.
    await go(page, "/game");
    assert.deepEqual(await problemsOn(page, problems), []);
    await ctx.close();
  });
}

test("a Battle already played cannot be played again for more XP", async () => {
  app.db.competitions.push(theirBattle());
  app.db.attempts.push({ competition_id: "their-battle", user_id: UID, user_name: "សុខ", score: 1, ms: 1000, answers: [null, null, null], played_at: new Date().toISOString() });
  const { ctx, page, problems } = await app.open();
  await go(page, "/game/play/their-battle");
  await settle(page);
  assert.equal((await options(page).count()), 0, "the questions are on screen again");
  assert.equal((await saved(page)).xp ?? 0, 0);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("a Battle that no longer exists says so rather than crashing", async () => {
  const { ctx, page, problems } = await app.open();
  await go(page, "/game/play/no-such-battle");
  await settle(page);
  assert.equal((await options(page).count()), 0);
  assert.ok((await text(page)).trim().length > 10);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});
