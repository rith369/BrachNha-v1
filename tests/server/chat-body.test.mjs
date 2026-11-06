import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "vite";
import { repoRoot } from "../db/setup.mjs";

/**
 * /api/chat stops reading a body once it is too large, instead of holding all of it
 * first (security audit, 6 Nov 2026). Runs the real handler with no keys and no
 * database: every case here is answered before either would be asked.
 */

let server;
let handleChat;
before(async () => {
  server = await createServer({ root: repoRoot, configFile: false, server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom", logLevel: "error", optimizeDeps: { noDiscovery: true, include: [] } });
  ({ handleChat } = await server.ssrLoadModule("/server/chat-handler.ts"));
});
after(async () => {
  await server.close();
});

/** Matches MAX_BODY_BYTES in chat-handler.ts: text plus two photos. */
const MAX_BODY_BYTES = 64 * 1024 + 2 * 1_500_000;
const CHUNK = 64 * 1024;

/** A chunked request with no content-length that never ends by itself. */
function endlessRequest(headers = {}) {
  let pulled = 0;
  // highWaterMark 0: no read-ahead, so `pulled` counts only what the handler asked for.
  const body = new ReadableStream(
    {
      pull(controller) {
        pulled += CHUNK;
        controller.enqueue(new Uint8Array(CHUNK).fill(0x61));
      },
    },
    { highWaterMark: 0 }
  );
  const req = new Request("http://localhost/api/chat", { method: "POST", body, duplex: "half", headers });
  return { req, pulled: () => pulled };
}

test("a body with no length that keeps coming is refused at the cap, not read to the end", async () => {
  const { req, pulled } = endlessRequest();
  const res = await handleChat(req);
  assert.equal(res.status, 413);
  assert.ok(pulled() <= MAX_BODY_BYTES + 2 * CHUNK, `read ${pulled()} bytes`);
});

test("a declared length over the cap is refused before reading", async () => {
  const { req, pulled } = endlessRequest({ "content-length": String(MAX_BODY_BYTES + 1) });
  const res = await handleChat(req);
  assert.equal(res.status, 413);
  assert.equal(pulled(), 0);
});

test("an ordinary body is still read and parsed", async () => {
  const res = await handleChat(
    new Request("http://localhost/api/chat", { method: "POST", body: JSON.stringify({ messages: [] }) })
  );
  assert.equal(res.status, 400);
  assert.equal(await res.text(), "No message.");
});

test("while KruAI is switched off, a real question is refused before anything is called", async (t) => {
  const { KRUAI_ENABLED } = await server.ssrLoadModule("/src/data/kruai-switch.ts");
  if (KRUAI_ENABLED) return t.skip("KruAI is switched on");
  // No keys and no database here: a refusal from anywhere later would be a
  // different status or message, and a call to Google would hang or throw.
  const res = await handleChat(
    new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [{ role: "user", text: "សួស្តី" }], lang: "km" }),
    })
  );
  assert.equal(res.status, 503);
  assert.equal(await res.text(), "🔒 KruAI ត្រូវបានបិទសិនសម្រាប់ពេលនេះ។");
});

test("a body split in the middle of a Khmer letter still parses", async () => {
  // Each Khmer letter is 3 bytes; 1-byte chunks split every one of them. The bytes
  // are joined before decoding, so nothing is turned into a replacement character.
  const json = JSON.stringify({ messages: [], note: "សួស្តី" });
  const bytes = new TextEncoder().encode(json);
  let i = 0;
  const body = new ReadableStream({
    pull(c) {
      if (i < bytes.length) c.enqueue(bytes.slice(i, ++i));
      else c.close();
    },
  });
  const res = await handleChat(new Request("http://localhost/api/chat", { method: "POST", body, duplex: "half" }));
  assert.equal(res.status, 400);
  assert.equal(await res.text(), "No message.");
});
