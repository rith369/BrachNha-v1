import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { go, problemsOn, scrollsSideways, startApp, text } from "./setup.mjs";

/**
 * /admin/kruai warns before the whole-app KruAI limit runs out (security audit,
 * 6 Nov 2026): a handful of accounts can use the shared pool up and stop KruAI for
 * every student until midnight, and this page is where an admin can see it coming.
 *
 * The fake database answers "not an admin" for everyone, so this page alone is told
 * otherwise, and admin_kruai_overview() returns the usage each case needs.
 */

let app;
before(async () => {
  app = await startApp();
});
after(async () => {
  await app.close();
});

const overview = (todayUnits, appDaily = 300) => ({
  today: "2026-11-06",
  user_daily: 30,
  app_daily: appDaily,
  today_units: todayUnits,
  today_students: 4,
  daily: [{ day: "2026-11-06", units: todayUnits, students: 4 }],
  top: [{ id: "a", name: "សុខ", email: "a@example.com", units: 30, blocked: false }],
  blocked: [],
});

async function openAdmin(units, viewport) {
  const { ctx, page, problems } = await app.open(viewport ? { viewport } : {});
  const json = (body) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  await page.route("**/rpc/is_app_admin", (r) => r.fulfill(json(true)));
  await page.route("**/rpc/has_role", (r) => r.fulfill(json(true)));
  await page.route("**/rpc/admin_kruai_overview", (r) => r.fulfill(json(overview(units))));
  await go(page, "/admin/kruai");
  return { ctx, page, problems };
}

const WARNINGS = {
  half: "ត្រូវបានប្រើអស់ពាក់កណ្ដាលហើយ",
  near: "ជិតអស់ហើយ",
  out: "KruAI បានឈប់សម្រាប់សិស្សទាំងអស់",
};

for (const [units, expected] of [
  [149, null],
  [150, "half"],
  [240, "near"],
  [300, "out"],
]) {
  test(`${units} of 300 units today shows ${expected ?? "no"} warning`, async () => {
    const { ctx, page, problems } = await openAdmin(units);
    const body = await text(page);
    assert.ok(body.includes(`${units} ក្នុងចំណោម 300 ឯកតា`), "the Today card did not render");
    for (const [level, words] of Object.entries(WARNINGS)) {
      assert.equal(body.includes(words), level === expected, `${level} warning at ${units}`);
    }
    assert.equal(await page.locator('[role="alert"]').count(), expected ? 1 : 0);
    assert.deepEqual(await problemsOn(page, problems), []);
    await ctx.close();
  });
}

test("the warning fits the 320px floor", async () => {
  const { ctx, page, problems } = await openAdmin(300, { width: 320, height: 568 });
  assert.ok((await text(page)).includes(WARNINGS.out));
  assert.equal(await scrollsSideways(page), false);
  assert.deepEqual(await problemsOn(page, problems), []);
  await ctx.close();
});
