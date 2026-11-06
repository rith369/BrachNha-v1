import assert from "node:assert/strict";
import { before, test } from "node:test";
import { freshDb } from "./setup.mjs";

/** Which keys the content tables accept, from content_key_ok() (latest: 20261106000001). */

let h;
before(async () => {
  h = await freshDb();
});

const ok = async (kind, key) =>
  (await h.db.query(`select public.content_key_ok($1, $2) as ok`, [kind, key])).rows[0].ok;

test("a paper key is a past paper's year and subject, or a teacher paper's subject and number", async () => {
  for (const key of ["2025-math", "2021-english", "new-math-1", "new-biology-42", "new-khmer-999"]) {
    assert.equal(await ok("paper", key), true, key);
  }
  for (const key of ["new-math-0", "new-math-1000", "new-math-01", "new-xyz-1", "new-math", "math-new-1", "1999-math", "new-math-1-2"]) {
    assert.equal(await ok("paper", key), false, key);
  }
});

test("the other kinds are unchanged", async () => {
  assert.equal(await ok("deck", "biology-1-1"), true);
  assert.equal(await ok("quiz", "math-1-1-1"), true);
  assert.equal(await ok("section", "biology-3-1-1"), true);
  assert.equal(await ok("game", "math"), true);
  assert.equal(await ok("game", "new-math-1"), false);
  assert.equal(await ok("deck", "new-math-1"), false);
});

test("a teacher paper can be stored, and a bad key cannot", async () => {
  await h.db.exec(`insert into public.content_items (kind, key, version, item_count) values ('paper', 'new-math-3', null, 0)`);
  await assert.rejects(
    h.db.exec(`insert into public.content_items (kind, key, version, item_count) values ('paper', 'new-math-0', null, 0)`)
  );
});
