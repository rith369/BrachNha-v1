import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { go, problemsOn, scrollsSideways, startApp, text } from "./setup.mjs";

/**
 * KruAI is switched off (src/data/kruai-switch.ts, 6 Nov 2026) and the corner button
 * is Feedback, a link to the team's Telegram, for guests and signed-in students alike.
 * If KruAI is switched back on, these tests are expected to fail and should go.
 */

const TELEGRAM = "https://t.me/Captain_Alexandros";

let app;
before(async () => {
  app = await startApp();
});
after(async () => {
  await app.close();
});

for (const guest of [false, true]) {
  test(`${guest ? "a guest" : "a signed-in student"} gets Feedback, not KruAI, in the corner`, async () => {
    const { ctx, page, problems } = await app.open({ guest });
    for (const route of ["/", "/lessons", "/practice", "/profile"]) {
      await go(page, route);
      const fab = page.getByTestId("feedback-fab");
      assert.equal(await fab.count(), 1, `no Feedback button on ${route}`);
      assert.equal(await page.getByRole("button", { name: "KruAI", exact: true }).count(), 0, `KruAI button on ${route}`);
    }
    // The KruAI greeting bubble lived on the KruAI button, so it must be gone too.
    assert.ok(!(await text(page)).includes("តើមានអ្វីអាចឱ្យខ្ញុំជួយបាន"));
    assert.deepEqual(await problemsOn(page, problems), []);
    await ctx.close();
  });
}

test("Feedback explains first, and the Open Telegram button inside goes to the team", async () => {
  const { ctx, page, problems } = await app.open();
  // The Leaderboard leaves a gutter for the corner button. On Home it rests over
  // a lesson row at first and fades click-through, so a tap there reaches the row.
  await go(page, "/leaderboard");
  const dialog = page.getByTestId("feedback-dialog");
  assert.equal(await dialog.count(), 0, "the explanation is open before any tap");

  await page.getByTestId("feedback-fab").click();
  await dialog.waitFor();
  const body = await dialog.innerText();
  assert.ok(body.includes("ប្រាប់យើងពីបញ្ហា"), body);
  assert.ok(body.includes("រូបថតអេក្រង់ជួយបានច្រើន"), body);
  assert.ok(body.includes("Telegram: @Captain_Alexandros"), body);
  // Not clicked: it would leave for Telegram. Its address is what matters.
  const go_ = dialog.getByRole("link", { name: "បើក Telegram" });
  assert.equal(await go_.getAttribute("href"), TELEGRAM);
  assert.equal(await go_.getAttribute("target"), "_blank");
  assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), "បើក Telegram");

  // Three ways to close it: Not now, a tap outside, Escape. Every tap explains again.
  await dialog.getByRole("button", { name: "ពេលក្រោយ" }).click();
  assert.equal(await dialog.count(), 0, "Not now did not close it");
  await page.getByTestId("feedback-fab").click();
  await dialog.click({ position: { x: 5, y: 5 } });
  assert.equal(await dialog.count(), 0, "a tap outside did not close it");
  await page.getByTestId("feedback-fab").click();
  await page.keyboard.press("Escape");
  assert.equal(await dialog.count(), 0, "Escape did not close it");

  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("the sign-up form no longer promises KruAI", async () => {
  // Signed in with Google but no profile yet: the gate shows the sign-up form.
  const { ctx, page } = await app.open({ state: { userName: "", surveyed: false } });
  await go(page, "/");
  const body = await text(page);
  assert.ok(body.includes("បង្កើតគណនីរបស់អ្នក"), "the sign-up form did not open");
  assert.ok(body.includes("ព័ត៌មានបន្តិចដើម្បីឲ្យផែនការសិក្សាសាកសមនឹងអ្នក។"), body.slice(0, 400));
  assert.ok(!body.includes("KruAI និងផែនការសិក្សា"));
  await ctx.close();
});

test("the Feedback button fits the 320px floor in dark mode", async () => {
  const { ctx, page, problems } = await app.open({ theme: "dark", viewport: { width: 320, height: 568 } });
  await go(page, "/leaderboard");
  await page.getByTestId("feedback-fab").waitFor();
  assert.equal(await scrollsSideways(page), false);
  await page.getByTestId("feedback-fab").click();
  await page.getByTestId("feedback-dialog").waitFor();
  assert.equal(await scrollsSideways(page), false, "the open explanation scrolls sideways");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});
