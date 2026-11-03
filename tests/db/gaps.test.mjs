import assert from "node:assert/strict";
import { before, test } from "node:test";
import { freshDb, outcome } from "./setup.mjs";

/** Hidden content, photo uploads and the error log, from 20261103000008. */

let h;
let A;
let B;
before(async () => {
  h = await freshDb();
  A = await h.student("Sok");
  B = await h.student("Dara");
  await h.db.exec(`
    insert into public.content_items (kind, key, version, item_count) values
      ('quiz', 'math-1-1-1', 2, 1), ('quiz', 'math-1-1-2', null, 1), ('quiz', 'math-1-1-3', null, 1);
    insert into public.content_versions (kind, key, version, body) values
      ('quiz', 'math-1-1-1', 1, '{"v":1}'), ('quiz', 'math-1-1-1', 2, '{"v":2}'),
      ('quiz', 'math-1-1-2', 1, '{"secret":true}'), ('quiz', 'math-1-1-2', 2, '{"secret":true}');
    insert into public.competitions (id, creator_id, creator_name, subject, difficulty, minutes, questions, creator_score, creator_ms, total)
      values ('bat', '${A}', 'A', 'math', 'mix', 10, '[{}]', 1, 1, 1);
    insert into storage.objects (bucket_id, name) values
      ('competition-work', 'bat/${A}/0-abcdef123.jpg'), ('competition-work', 'bat/${A}/0-abcdef999.jpg');
  `);
});

// ── Hidden content ──────────────────────────────────────────────────────────

const LIVE = "math-1-1-1";
const HIDDEN = "math-1-1-2";
const versions = (run, key) =>
  run(async () => (await h.db.query(`select version from public.content_versions where kind = 'quiz' and key = $1 order by version`, [key])).rows.map((r) => r.version));

for (const [who, run] of [
  ["a guest", (fn) => h.asGuest(fn)],
  ["a student", (fn) => h.asStudent(A, fn)],
]) {
  test(`${who} reads every version of a published item, because old attempts need them`, async () => {
    assert.deepEqual(await versions(run, LIVE), [1, 2]);
  });

  test(`${who} cannot read a hidden item, by name or by listing everything`, async () => {
    assert.deepEqual(await versions(run, HIDDEN), []);
    const all = await run(async () => (await h.db.query(`select key from public.content_versions`)).rows.map((r) => r.key));
    assert.ok(!all.includes(HIDDEN));
  });

  test(`${who}: content_current and the list hold only what is published`, async () => {
    const current = await run(async () => (await h.db.query(`select * from public.content_current('quiz')`)).rows);
    assert.equal(current.length, 1);
    assert.ok(JSON.stringify(current).includes('"v":2'));
    assert.ok(!JSON.stringify(current).includes("secret"));
    const items = await run(async () => (await h.db.query(`select key from public.content_items`)).rows.map((r) => r.key));
    assert.deepEqual(items, [LIVE]);
  });
}

test("publishing again makes it readable at once, and hiding closes it at once", async () => {
  await h.db.query(`update public.content_items set version = 2 where key = $1`, [HIDDEN]);
  assert.deepEqual(await versions((fn) => h.asGuest(fn), HIDDEN), [1, 2]);
  await h.db.query(`update public.content_items set version = null where key = $1`, [HIDDEN]);
  assert.deepEqual(await versions((fn) => h.asGuest(fn), HIDDEN), []);
});

test("nobody can write content directly", async () => {
  assert.notEqual(
    await outcome(() => h.asStudent(A, () => h.db.exec(`insert into public.content_versions (kind, key, version, body) values ('quiz', '${LIVE}', 9, '{}')`))),
    "accepted"
  );
  assert.equal(await outcome(() => h.asStudent(A, () => h.db.exec(`update public.content_items set version = 1 where key = '${LIVE}'`))), "42501");
  assert.equal((await h.one(`select version from public.content_items where key = $1`, [LIVE])).version, 2);
  assert.equal(await outcome(() => h.asStudent(A, () => h.db.query(`select * from public.content_drafts`))), "42501", "a student read drafts");
});

// ── Photos ──────────────────────────────────────────────────────────────────

const upload = (uid, name) => h.asStudent(uid, () => h.db.query(`insert into storage.objects (bucket_id, name) values ('competition-work', $1)`, [name]));

test("a photo upload is refused while the feature is off", async () => {
  assert.equal(await outcome(() => upload(A, `bat/${A}/0-new000000.jpg`)), "42501");
  assert.equal(await h.count("storage.objects", "name like '%new000000%'"), 0);
});

test("leftover photos can be read and deleted by their owner, and by no one else", async () => {
  const seen = await h.asStudent(A, () => h.db.query(`select name from storage.objects where bucket_id = 'competition-work'`));
  assert.equal(seen.rows.length, 2);

  const stranger = await h.student("Stranger");
  const strangerSaw = await h.asStudent(stranger, () => h.db.query(`select name from storage.objects where bucket_id = 'competition-work'`));
  assert.equal(strangerSaw.rows.length, 0);

  const notMine = await h.asStudent(B, () => h.db.query(`delete from storage.objects where name = $1`, [`bat/${A}/0-abcdef999.jpg`]));
  assert.equal(notMine.affectedRows, 0);

  const replaced = await h.asStudent(A, () => h.db.query(`update storage.objects set name = name where name = $1`, [`bat/${A}/0-abcdef999.jpg`]));
  assert.equal(replaced.affectedRows, 0);

  const mine = await h.asStudent(A, () => h.db.query(`delete from storage.objects where name = $1`, [`bat/${A}/0-abcdef123.jpg`]));
  assert.equal(mine.affectedRows, 1);
});

// ── The error log ───────────────────────────────────────────────────────────

const report = (run, n, tag = "m") =>
  run(async () => {
    for (let i = 0; i < n; i++) await h.db.query(`select public.log_client_error($1, 's', '/r', 'v', 'ua')`, [`${tag}-${i}`]);
  });
const guest = (fn) => h.asGuest(fn);
const signed = (uid) => (fn) => h.asStudent(uid, fn);
const reset = () => h.db.exec(`delete from public.client_errors`);
const errors = (where = "true") => h.count("public.client_errors", where);

test("guests and students can both report an error", async () => {
  await reset();
  await report(guest, 1);
  await report(signed(A), 1);
  assert.equal(await errors("user_id is null"), 1);
  assert.equal(await errors(`user_id = '${A}'`), 1);
});

test("nobody can read or write the log directly", async () => {
  await reset();
  await report(signed(A), 1);
  assert.equal((await h.asStudent(A, () => h.db.query(`select * from public.client_errors`))).rows.length, 0);
  assert.notEqual(await outcome(() => guest(() => h.db.exec(`insert into public.client_errors (message) values ('forged')`))), "accepted");
});

test("long text is cut, and an empty message is not saved", async () => {
  await reset();
  await signed(A)(() => h.db.query(`select public.log_client_error($1, $1, $1, $1, $1)`, ["x".repeat(100000)]));
  const row = await h.one(`select message, stack, route, app_version, user_agent from public.client_errors`);
  assert.deepEqual(
    [row.message.length, row.stack.length, row.route.length, row.app_version.length, row.user_agent.length],
    [500, 4000, 200, 40, 300]
  );
  await reset();
  await signed(A)(() => h.db.query(`select public.log_client_error('', 's', 'r', 'v', 'u')`));
  assert.equal(await errors(), 0);
});

test("20 an hour from one student, and 200 an hour from guests", async () => {
  await reset();
  await report(signed(A), 40);
  assert.equal(await errors(`user_id = '${A}'`), 20);
  await reset();
  await report(guest, 250);
  assert.equal(await errors(), 200);
});

test("300 a day from guests: over it drops quietly, and students can still report", async () => {
  await h.db.exec(`update public.client_errors set created_at = now() - interval '2 hours'`);
  await report(guest, 250, "more");
  assert.equal(await errors("user_id is null"), 300);
  assert.equal(await outcome(() => report(guest, 1, "over")), "accepted", "no second error for a client already in trouble");
  await report(signed(B), 1, "student");
  assert.equal(await errors(`user_id = '${B}'`), 1);

  await h.db.exec(`update public.client_errors set created_at = now() - interval '25 hours' where user_id is null`);
  await report(guest, 1, "tomorrow");
  assert.equal(await errors(`message = 'tomorrow-0'`), 1);
});

test("2000 a day from everyone", async () => {
  await reset();
  await h.db.exec(`insert into public.client_errors (user_id, message, created_at) select '${A}', 'x', now() - interval '2 hours' from generate_series(1, 2000)`);
  await report(signed(B), 1, "full");
  await report(guest, 1, "full-guest");
  assert.equal(await errors(`message like 'full%'`), 0);
});

test("a report clears rows older than 45 days by itself, and keeps newer ones", async () => {
  await reset();
  await h.db.exec(`insert into public.client_errors (message, created_at) values ('ancient', now() - interval '50 days'), ('recent', now() - interval '40 days')`);
  let swept = false;
  // About 1 report in 50. 1000 tries misses with a chance of about 1 in 600 million.
  for (let i = 0; i < 1000 && !swept; i++) {
    await h.db.exec(`delete from public.client_errors where message like 'sweep%'`);
    await report(signed(A), 1, "sweep");
    swept = (await errors(`message = 'ancient'`)) === 0;
  }
  assert.ok(swept);
  assert.equal(await errors(`message = 'recent'`), 1);
});
