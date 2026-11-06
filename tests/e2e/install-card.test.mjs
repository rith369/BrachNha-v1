import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { go, problemsOn, scrollsSideways, startApp, text } from "./setup.mjs";

/**
 * The "Install BrachNha" card on Profile (features/install/components/install-card.tsx),
 * asked for 6 Nov 2026: Android installs with the browser's own dialog, an iPhone shows
 * the two steps, Telegram asks for Chrome or Safari, and anything that cannot install,
 * or already has, shows no card at all.
 */

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const TELEGRAM_ANDROID =
  "Mozilla/5.0 (Linux; Android 13; SM-A135F Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 Telegram-Android/10.14.5";

let app;
before(async () => {
  app = await startApp();
});
after(async () => {
  await app.close();
});

/** Profile, with the automatic pop-up snoozed so it does not cover the card. */
async function profile({ userAgent, before: setup, viewport } = {}) {
  const { ctx, page, problems } = await app.open({ userAgent, ...(viewport ? { viewport } : {}) });
  await page.addInitScript(() => {
    localStorage.setItem("brachnha-install", JSON.stringify({ snoozeUntil: Date.now() + 86_400_000 }));
  });
  if (setup) await page.addInitScript(setup);
  await go(page, "/profile");
  return { ctx, page, problems, card: page.getByTestId("install-card") };
}

/** What Chrome fires when the site may be installed, with a prompt() we can watch. */
function offerInstall(page) {
  return page.evaluate(() => {
    const e = new Event("beforeinstallprompt", { cancelable: true });
    e.prompt = async () => {
      window.__prompted = (window.__prompted ?? 0) + 1;
    };
    e.userChoice = Promise.resolve({ outcome: "accepted" });
    window.dispatchEvent(e);
  });
}

test("a browser that cannot install shows no card", async () => {
  const { ctx, page, problems, card } = await profile();
  assert.equal(await card.count(), 0);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("Android: Install opens the browser's own dialog, and the card goes once installed", async () => {
  const { ctx, page, problems, card } = await profile();
  await offerInstall(page);
  await card.waitFor();
  assert.ok((await card.innerText()).includes("ដំឡើង BrachNha"));
  // A tap on the WORDS, not the pill: the whole card is the button.
  await card.getByText("ដាក់ BrachNha នៅលើអេក្រង់ដើម").click();
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => window.__prompted), 1);
  assert.equal(await card.count(), 0, "the card should go once the app is installed");
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("iPhone: Install shows the two steps in the card", async () => {
  const { ctx, page, problems, card } = await profile({ userAgent: IPHONE });
  await card.waitFor();
  assert.ok(!(await card.innerText()).includes("Add to Home Screen"));
  // A tap on the ICON opens the steps; a second tap closes them again.
  await card.locator("img").click();
  const body = await card.innerText();
  assert.ok(body.includes("Share") && body.includes("Add to Home Screen"), body);
  assert.equal(await card.getByRole("button").first().getAttribute("aria-expanded"), "true");
  await card.locator("img").click();
  assert.ok(!(await card.innerText()).includes("Add to Home Screen"));
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("Telegram: asks for the real browser, then shows the manual way and the link to this page", async () => {
  const { ctx, page, problems, card } = await profile({
    userAgent: TELEGRAM_ANDROID,
    before: () => {
      window.TelegramWebviewProxy = { postEvent() {} };
    },
  });
  await card.waitFor();
  assert.ok((await card.innerText()).includes("Chrome ឬ Safari"));
  // The title, not the Open in Browser bar under it.
  await card.getByText("ដំឡើង BrachNha", { exact: true }).click();
  await page.waitForTimeout(1900);
  const body = await card.innerText();
  assert.ok(body.includes("សូមបើកដោយដៃ"), body);
  assert.match(body, /\/profile/);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});

test("an installed app shows no card, even if the browser offers to install", async () => {
  const { ctx, page, card } = await profile({
    before: () => {
      const real = window.matchMedia.bind(window);
      window.matchMedia = (q) =>
        q.includes("display-mode: standalone") ? { matches: true, media: q, addEventListener() {}, removeEventListener() {} } : real(q);
    },
  });
  await offerInstall(page);
  await page.waitForTimeout(200);
  assert.equal(await card.count(), 0);
  await ctx.close();
});

test("the card fits the 320px floor in all three forms", async () => {
  for (const userAgent of [undefined, IPHONE, TELEGRAM_ANDROID]) {
    const { ctx, page, card } = await profile({
      userAgent,
      viewport: { width: 320, height: 640 },
      before: () => {
        window.TelegramWebviewProxy = undefined;
      },
    });
    if (!userAgent) await offerInstall(page);
    await card.waitFor();
    assert.equal(await scrollsSideways(page), false, `sideways scroll with ${userAgent ?? "Android"}`);
    assert.ok(!(await text(page)).includes("មានបញ្ហាបច្ចេកទេស"));
    await ctx.close();
  }
});
