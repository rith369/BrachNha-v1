import assert from "node:assert/strict";
import { before, test } from "node:test";
import { freshDb, outcome } from "./setup.mjs";

/**
 * "Own rows only", on every table a student's device writes to. One shape, run on
 * each, because the cost of this rule failing once is one student reading another's.
 */

// A row of each, with the columns the app really sends.
const OWN_TABLES = {
  commitments: (u, k) => `insert into public.commitments (user_id, kind, signature, signed_at) values ('${u}', 'typed', 'Sok', now() + interval '${k} seconds')`,
  daily_activity: (u, k) => `insert into public.daily_activity (user_id, activity_date, xp_earned) values ('${u}', current_date - ${k}, 10)`,
  daily_content_activity: (u, k) => `insert into public.daily_content_activity (user_id, activity_date, content_key) values ('${u}', current_date, 'quiz:math-${k}')`,
  exam_results: (u, k) => `insert into public.exam_results (user_id, score, total, pct, taken_at) values ('${u}', 1, 2, 50, now() + interval '${k} seconds')`,
  completed_sessions: (u, k) => `insert into public.completed_sessions (user_id, lesson_id) values ('${u}', 'lesson-${k}')`,
  conversations: (u, k) => `insert into public.conversations (id, user_id) values ('conv-${u}-${k}', '${u}')`,
  card_reviews: (u, k) => `insert into public.card_reviews (user_id, card_id, phase, due_at) values ('${u}', 'card-${k}', 'new', current_date)`,
  student_cards: (u, k) => `insert into public.student_cards (user_id, card_id, deck_key, front, back, created_at, updated_at) values ('${u}', 'card-${k}', 'deck', 'f', 'b', now(), now())`,
  starred_cards: (u, k) => `insert into public.starred_cards (user_id, card_id) values ('${u}', 'card-${k}')`,
  card_review_log: (u, k) => `insert into public.card_review_log (user_id, card_id, grade, reviewed_at) values ('${u}', 'card', 'good', now() + interval '${k} seconds')`,
  quiz_results: (u, k) => `insert into public.quiz_results (user_id, quiz_key, taken_at, score, total, pct, ms) values ('${u}', 'quiz', now() + interval '${k} seconds', 1, 2, 50, 1)`,
  paper_results: (u, k) => `insert into public.paper_results (user_id, paper_key, taken_at, score, total, pct, ms) values ('${u}', 'paper', now() + interval '${k} seconds', 1, 2, 50, 1)`,
  simulation_attempts: (u, k) => `insert into public.simulation_attempts (user_id, id, started_at, updated_at) values ('${u}', 'sim-${k}', now(), now())`,
  question_mistakes: (u, k) => `insert into public.question_mistakes (user_id, ref, last_wrong_at) values ('${u}', 'quiz:math-1-1-1#q${k}', now())`,
};

let h;
let A;
let B;
before(async () => {
  h = await freshDb();
  A = await h.student("Sok");
  B = await h.student("Dara");
});

for (const [table, row] of Object.entries(OWN_TABLES)) {
  test(`${table}: a student reaches only their own rows`, async () => {
    const t = `public.${table}`;
    await h.asStudent(A, () => h.db.exec(row(A, 1)));
    await h.asStudent(B, () => h.db.exec(row(B, 2)));

    assert.notEqual(await outcome(() => h.asStudent(A, () => h.db.exec(row(B, 3)))), "accepted", "wrote a row under someone else");
    assert.notEqual(await outcome(() => h.asGuest(() => h.db.exec(row(A, 4)))), "accepted", "a guest wrote a row");

    const seen = await h.asStudent(A, () => h.db.query(`select user_id from ${t}`));
    assert.ok(seen.rows.length >= 1 && seen.rows.every((r) => r.user_id === A), "read someone else's row");
    assert.equal((await h.asGuest(() => h.db.query(`select 1 from ${t}`))).rows.length, 0, "a guest read a row");

    // A policy-blocked update or delete reports nothing and changes nothing.
    await h.asStudent(A, () => h.db.exec(`delete from ${t} where user_id = '${B}'`));
    assert.equal(await h.count(t, "user_id = $1", [B]), 1, "deleted someone else's row");

    const update = await outcome(() => h.asStudent(A, () => h.db.exec(`update ${t} set user_id = '${B}' where user_id = '${A}'`)));
    assert.equal(await h.count(t, "user_id = $1", [B]), 1, `handed a row to someone else (${update})`);
  });
}

test("chat messages: own rows only, and they go with the conversation", async () => {
  const row = (who, conv, seq) => `insert into public.chat_messages (conversation_id, user_id, seq, role, content) values ('${conv}', '${who}', ${seq}, 'user', 'សួស្តី')`;
  await h.asStudent(A, () => h.db.exec(`insert into public.conversations (id, user_id) values ('chat-a', '${A}')`));
  await h.asStudent(A, () => h.db.exec(row(A, "chat-a", 0)));
  assert.notEqual(await outcome(() => h.asStudent(A, () => h.db.exec(row(B, "chat-a", 1)))), "accepted");
  assert.equal((await h.asStudent(B, () => h.db.query(`select 1 from public.chat_messages where conversation_id = 'chat-a'`))).rows.length, 0);
  await h.asStudent(A, () => h.db.exec(`delete from public.conversations where id = 'chat-a'`));
  assert.equal(await h.count("public.chat_messages", "conversation_id = 'chat-a'"), 0);
});

test("a profile: read and changed by its owner only, and guests see nothing", async () => {
  const mine = await h.asStudent(A, () => h.db.query(`select id, email from public.profiles`));
  assert.deepEqual(mine.rows.map((r) => r.id), [A]);
  assert.equal((await h.asGuest(() => h.db.query(`select 1 from public.profiles`))).rows.length, 0);
  await h.asStudent(A, () => h.db.query(`update public.profiles set display_name = 'hacked' where id = $1`, [B]));
  assert.equal((await h.one(`select display_name d from public.profiles where id = $1`, [B])).d, "Dara");
});

test("the leaderboard gives no email, age or location, and needs no one else's row", async () => {
  await h.db.query(`update public.profiles set location = 'Phnom Penh', age = 18 where id = $1`, [B]);
  const board = await h.asStudent(A, () => h.db.query(`select * from public.leaderboard(current_date)`));
  const row = board.rows.find((r) => r.id === B);
  assert.ok(row, "another student is missing from the board");
  assert.deepEqual(
    Object.keys(row).filter((k) => /mail|age|location/i.test(k)),
    []
  );
  assert.ok(!JSON.stringify(row).includes("@test"), "an email reached the leaderboard");
  assert.ok(!board.rows.some((r) => r.id === A), "the board should leave out the reader, who is drawn from the phone");
});

test("guests cannot read the leaderboard, search students or friends", async () => {
  for (const sql of [
    `select * from public.leaderboard(current_date)`,
    `select * from public.search_students('So')`,
    `select * from public.my_friends(current_date)`,
  ]) {
    assert.notEqual(await outcome(() => h.asGuest(() => h.db.query(sql))), "accepted", sql);
  }
});

test("search shows a name and nothing else about a student", async () => {
  const found = await h.asStudent(A, () => h.db.query(`select * from public.search_students('Dara')`));
  assert.deepEqual(Object.keys(found.rows[0]).sort(), ["display_name", "id", "relation"]);
});

test("deleting an account takes every row with it", async () => {
  const gone = await h.student("Gone");
  for (const [table, row] of Object.entries(OWN_TABLES)) {
    await h.asStudent(gone, () => h.db.exec(row(gone, 1)));
    assert.equal(await h.count(`public.${table}`, "user_id = $1", [gone]), 1, table);
  }
  await h.db.query(`delete from auth.users where id = $1`, [gone]);
  for (const table of Object.keys(OWN_TABLES)) {
    assert.equal(await h.count(`public.${table}`, "user_id = $1", [gone]), 0, `${table} kept a row`);
  }
  assert.equal(await h.count("public.profiles", "id = $1", [gone]), 0);
});

test("simulation attempts: seven full papers fit, a huge blob and bad shapes do not", async () => {
  const insert = (id, sittings) =>
    h.db.query(`insert into public.simulation_attempts (user_id, id, started_at, updated_at, sittings) values ($1, $2, now(), now(), $3::jsonb)`, [A, id, sittings]);
  const answers = (n) => Object.fromEntries(Array.from({ length: n }, (_, i) => [`q${i}`, crypto.randomUUID()]));
  const seven = JSON.stringify(
    Array.from({ length: 7 }, () => ({ sessionId: "history", paperKey: "2025-math", version: 1, result: { score: 1, total: 60, pct: 2, ms: 1, leaves: 0, finishedAt: "2026-11-01T00:00:00Z", answers: answers(60) } }))
  );
  assert.equal(await outcome(() => insert("seven", seven)), "accepted");
  assert.notEqual(await outcome(() => insert("huge", JSON.stringify(Array.from({ length: 7 }, () => ({ answers: answers(4000) }))))), "accepted");
  assert.notEqual(await outcome(() => insert("object", "{}")), "accepted");
  assert.notEqual(await outcome(() => insert("", "[]")), "accepted");
  assert.notEqual(await outcome(() => insert("x".repeat(101), "[]")), "accepted");
});

test("saved mistakes: an upsert stays in place, and bad values are refused", async () => {
  const ref = "quiz:math-1-1-1#q9";
  const upsert = (times) =>
    h.asStudent(A, () => h.db.query(
      `insert into public.question_mistakes (user_id, ref, times, last_wrong_at) values ($1, $2, $3, now())
       on conflict (user_id, ref) do update set times = excluded.times`, [A, ref, times]));
  await upsert(1);
  await upsert(2);
  assert.equal((await h.one(`select times from public.question_mistakes where user_id = $1 and ref = $2`, [A, ref])).times, 2);
  assert.notEqual(await outcome(() => upsert(0)), "accepted");
  assert.notEqual(await outcome(() => h.db.query(`insert into public.question_mistakes (user_id, ref, last_wrong_at) values ($1, $2, now())`, [A, "x".repeat(121)])), "accepted");
});
