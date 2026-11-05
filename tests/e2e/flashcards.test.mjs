import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { content, go, problemsOn, saved, settle, startApp, text } from "./setup.mjs";

/** A student working through a flashcard deck, and what it leaves behind. */

let app;
before(async () => {
  app = await startApp();
});
after(async () => {
  await app.close();
});

const DECK = "biology-1-1";
const ROUTE = "/practice/flashcards/biology/1-1";
const cards = content("deck", DECK);
const KNOW = "ចងចាំ";
const AGAIN = "មិនទាន់ចងចាំ";

const start = async (page) => {
  await go(page, ROUTE);
  await page.getByRole("button", { name: /ចាប់ផ្តើមពិនិត្យ|ពិនិត្យម្តងទៀត/ }).click();
  await settle(page, 150);
};
const grade = async (page, name) => {
  await page.getByRole("button", { name, exact: true }).click();
  await page.waitForTimeout(250);
};
/** Grades the whole deck, the last card included, where a crash shows if there is one. */
const gradeAll = async (page, pick) => {
  for (let i = 0; i < cards.length; i++) await grade(page, pick(i));
  await settle(page, 200);
};

test("a whole deck: flipped, graded to the last card, and the summary adds up", async () => {
  const { ctx, page, problems } = await app.open();
  await go(page, ROUTE);
  assert.ok((await text(page)).includes(`ចាប់ផ្តើមពិនិត្យ (${cards.length})`), "every card should be due on a first visit");
  await page.getByRole("button", { name: /ចាប់ផ្តើមពិនិត្យ/ }).click();
  await settle(page, 150);

  // The first card's question shows, and a tap turns it over.
  assert.ok((await text(page)).includes(cards[0].front), "the first card's question is not on screen");
  await page.getByText(cards[0].front).first().click();
  await page.waitForTimeout(500);
  assert.ok((await text(page)).includes(cards[0].back), "flipping did not show the answer");

  // Don't know the first two, know the rest.
  await gradeAll(page, (i) => (i < 2 ? AGAIN : KNOW));

  const body = await text(page);
  assert.ok(body.includes(`${cards.length} កាត`), "the summary should count every card");
  const s = await saved(page);
  assert.equal(s.reviewHistory.length, cards.length);
  assert.equal(Object.keys(s.cardReviews).length, cards.length);
  assert.ok(cards.every((c) => s.cardReviews[c.id]), "a card has no saved progress");
  // A card the student knew comes back later than one they did not.
  assert.ok(
    s.cardReviews[cards.at(-1).id].dueAt > s.cardReviews[cards[0].id].dueAt,
    `known ${s.cardReviews[cards.at(-1).id].dueAt}, unknown ${s.cardReviews[cards[0].id].dueAt}`
  );
  assert.equal(s.xp, cards.length * 4 + (s.tasks.flashcards ? 20 : 0), `XP ${s.xp}`);
  assert.equal(s.mistakes?.length ?? 0, 0);
  assert.deepEqual(await problemsOn(page, problems), []);

  // Back on the deck, the piles say what happened, and it survives closing the app.
  await page.getByRole("button", { name: /ត្រឡប់/ }).first().click();
  await settle(page);
  await go(page, ROUTE);
  const deck = await text(page);
  assert.ok(deck.includes(String(cards.length - 2)), "the remembered pile is wrong");
  await page.reload();
  await settle(page);
  assert.equal(Object.keys((await saved(page)).cardReviews).length, cards.length);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("cards just graded are not due again today, so only the unknown come back", async () => {
  const { ctx, page, problems } = await app.open();
  await start(page);
  await gradeAll(page, (i) => (i === 0 ? AGAIN : KNOW));
  await go(page, ROUTE);
  const button = await page.getByRole("button", { name: /ចាប់ផ្តើមពិនិត្យ|ពិនិត្យម្តងទៀត/ }).innerText();
  assert.ok(!button.includes(`(${cards.length})`) || button.includes("ពិនិត្យម្តងទៀត"), `still all due: ${button}`);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("stepping back re-reads a card and does not grade it twice", async () => {
  const { ctx, page, problems } = await app.open();
  await start(page);
  await grade(page, KNOW);
  await grade(page, KNOW);
  await page.getByRole("button", { name: "ថយក្រោយ" }).click();
  await page.waitForTimeout(250);
  assert.ok((await text(page)).includes(cards[1].front), "Back did not return to the card before");
  await grade(page, KNOW);
  for (let i = 2; i < cards.length; i++) await grade(page, KNOW);
  await settle(page, 200);
  assert.ok((await text(page)).includes(`${cards.length} កាត`), "the summary counted a card twice");
  const s = await saved(page);
  assert.equal(Object.keys(s.cardReviews).length, cards.length);
  assert.equal(s.reviewHistory.length, cards.length, "a re-read card was graded twice");
  assert.equal(s.xp, cards.length * 4 + (s.tasks.flashcards ? 20 : 0), "a re-read card paid XP twice");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("Back and grade, again and again, is not free XP", async () => {
  const { ctx, page, problems } = await app.open();
  await start(page);
  await grade(page, KNOW);
  const xp = (await saved(page)).xp;
  for (let i = 0; i < 5; i++) {
    await page.getByRole("button", { name: "ថយក្រោយ" }).click();
    await page.waitForTimeout(150);
    await grade(page, KNOW);
  }
  const s = await saved(page);
  assert.equal(s.xp, xp, "stepping back and grading paid XP again");
  assert.equal(s.reviewHistory.length, 1);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("a swipe grades a card, and a small nudge does not", async () => {
  const { ctx, page, problems } = await app.open();
  await start(page);
  const box = await page.getByText(cards[0].front).first().boundingBox();
  const y = box.y + box.height / 2;
  const drag = async (dx) => {
    await page.mouse.move(195, y);
    await page.mouse.down();
    await page.mouse.move(195 + dx / 2, y, { steps: 4 });
    await page.mouse.move(195 + dx, y, { steps: 4 });
    await page.mouse.up();
    await page.waitForTimeout(600);
  };
  await drag(15);
  assert.equal((await saved(page)).reviewHistory?.length ?? 0, 0, "a nudge graded the card");
  await drag(170);
  const s = await saved(page);
  assert.equal(s.reviewHistory.length, 1, "a swipe did not grade the card");
  assert.ok((await text(page)).includes(cards[1].front), "a swipe did not move on");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("a star is saved and the card shows in the Important pile", async () => {
  const { ctx, page, problems } = await app.open();
  await start(page);
  await page.getByRole("button", { name: /សម្គាល់ថា/ }).click();
  await page.waitForTimeout(150);
  assert.deepEqual((await saved(page)).starredCards, [cards[0].id]);
  await go(page, ROUTE);
  await page.getByRole("button", { name: /សំខាន់/ }).first().click();
  await settle(page, 200);
  assert.ok((await text(page)).includes(cards[0].front), "the starred card is not in the pile");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("a signed-in student's grades reach the account", async () => {
  const { ctx, page, problems } = await app.open();
  await start(page);
  await gradeAll(page, () => KNOW);
  await page.waitForTimeout(4000);
  const sent = JSON.stringify(app.db.writes.filter((w) => w.url.includes("/rest/v1/card_reviews")).map((w) => w.body));
  assert.ok(cards.every((c) => sent.includes(c.id)), "a graded card was never sent");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("a guest's grades stay on the phone", async () => {
  const { ctx, page, problems } = await app.open({ guest: true });
  const before = app.db.writes.length;
  await start(page);
  await gradeAll(page, () => KNOW);
  assert.equal(Object.keys((await saved(page)).cardReviews).length, cards.length);
  const sent = app.db.writes.slice(before).filter((w) => w.url.includes("/rest/v1/card_reviews"));
  assert.deepEqual(sent, []);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("the daily review gathers due cards from every deck and finishes", async () => {
  const { ctx, page, problems } = await app.open();
  await go(page, "/practice/review");
  await settle(page, 500);
  const start = page.getByRole("button", { name: /ចាប់ផ្តើម|ពិនិត្យ/ }).first();
  if (await start.count()) {
    await start.click();
    await settle(page, 200);
  }
  await grade(page, KNOW);
  await grade(page, AGAIN);
  const s = await saved(page);
  assert.equal(s.reviewHistory.length, 2);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("a hidden deck sends the student back rather than crashing", async () => {
  app.db.hidden.add(DECK);
  const { ctx, page, problems } = await app.open();
  await go(page, ROUTE);
  app.db.hidden.delete(DECK);
  assert.ok(!page.url().endsWith(ROUTE), page.url());
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});
