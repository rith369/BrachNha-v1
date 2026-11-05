import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "vite";
import { repoRoot } from "../db/setup.mjs";

/** Which keys KruAI may use. Getting this wrong sends students' questions to the free tier. */

let server;
let resolveApiKeys;
before(async () => {
  server = await createServer({ root: repoRoot, configFile: false, server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom", logLevel: "error", optimizeDeps: { noDiscovery: true, include: [] } });
  ({ resolveApiKeys } = await server.ssrLoadModule("/server/gemini-keys.ts"));
});
after(async () => {
  await server.close();
});

const LEFTOVERS = {
  GEMINI_API_KEYS: "free-a,free-b",
  GEMINI_API_KEY_1: "free-1",
  GEMINI_API_KEY_2: "free-2",
  GEMINI_API_KEY_3: "free-3",
  GEMINI_API_KEY_4: "free-4",
  GEMINI_API_KEY_5: "free-5",
};

test("on Vercel, leftover free keys are ignored and only the paid key is used", () => {
  assert.deepEqual(resolveApiKeys({ VERCEL: "1", GEMINI_API_KEY: "paid", ...LEFTOVERS }), ["paid"]);
});

test("on Vercel, a list inside GEMINI_API_KEY still gives one key", () => {
  assert.deepEqual(resolveApiKeys({ VERCEL: "1", GEMINI_API_KEY: ' "paid" , free-a' }), ["paid"]);
});

test("on Vercel with no GEMINI_API_KEY, KruAI has no key rather than falling back to a free one", () => {
  assert.deepEqual(resolveApiKeys({ VERCEL: "1", ...LEFTOVERS }), []);
  assert.deepEqual(resolveApiKeys({ VERCEL: "1", GEMINI_API_KEY: "  ", ...LEFTOVERS }), []);
});

test("production counts too, in case Vercel's own variable is not exposed", () => {
  assert.deepEqual(resolveApiKeys({ NODE_ENV: "production", GEMINI_API_KEY: "paid", ...LEFTOVERS }), ["paid"]);
});

test("on a computer, the whole pool is used, without repeats, for testing on free keys", () => {
  assert.deepEqual(resolveApiKeys({ GEMINI_API_KEYS: "a, b", GEMINI_API_KEY: "b", GEMINI_API_KEY_1: '"c"', GEMINI_API_KEY_5: "d" }), ["a", "b", "c", "d"]);
});

test("on a computer with no keys, there are none", () => {
  assert.deepEqual(resolveApiKeys({}), []);
});
