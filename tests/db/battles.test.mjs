import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { createServer } from "vite";
import { freshDb, outcome, repoRoot } from "./setup.mjs";

/**
 * Battles can only be written through functions that check them, with questions
 * built by the APP'S OWN code, so the client and the database must really agree on
 * what a question looks like.
 */

const fixture = JSON.parse(readFileSync(`${repoRoot}/content/fixture.json`, "utf8"));
const pool = fixture.items.find((i) => i.kind === "game" && i.key === "math").body;

let h;
let server;
let qs;
let A;
let B;

const post = (uid, { id, subject = "math", difficulty = "mix", minutes = 10, questions = qs, answers = questions.map((q) => q.correct), ms = 5000 }) =>
  h.asStudent(uid, () =>
    h.db.query(`select public.post_competition($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7)`, [
      id, subject, difficulty, minutes, JSON.stringify(questions), JSON.stringify(answers), ms,
    ])
  );
const join = (uid, competition, answers, ms = 5000) =>
  h.asStudent(uid, () => h.db.query(`select public.post_competition_attempt($1,$2::jsonb,$3)`, [competition, JSON.stringify(answers), ms]));

before(async () => {
  server = await createServer({ root: repoRoot, server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom", logLevel: "error", optimizeDeps: { noDiscovery: true, include: [] } });
  const { toGameQuestions, pickQuestions } = await server.ssrLoadModule("/src/features/game/game.ts");
  qs = pickQuestions(toGameQuestions(pool), "mix");

  h = await freshDb();
  await h.db.query(`insert into public.content_versions (kind, key, version, body) values ('game', 'math', 1, $1::jsonb)`, [JSON.stringify(pool)]);
  A = await h.student("Sok");
  B = await h.student(" Dara ");
});
after(async () => {
  await server.close();
});

test("what the app sends is accepted, and the server decides the name, score and time", async () => {
  assert.equal(qs.length, 10);
  assert.equal(await outcome(() => post(A, { id: "good" })), "accepted");
  const row = await h.one(`select * from public.competitions where id = 'good'`);
  assert.equal(row.creator_name, "Sok");
  assert.equal(row.creator_id, A);
  assert.equal(row.creator_score, 10);
  assert.equal(row.total, 10);
  assert.equal(row.questions[0].q.km, qs[0].q.km);
  assert.equal(row.questions[0].correct, qs[0].correct);
  assert.equal(row.questions[0].explanation, qs[0].explanation);
  assert.ok(Math.abs(new Date(row.created_at) - Date.now()) < 60000);
});

test("posting the same Battle twice is a duplicate, which the app reads as shared", async () => {
  await post(A, { id: "twice" });
  assert.equal(await outcome(() => post(A, { id: "twice" })), "23505");
});

test("no client can write straight to the tables", async () => {
  const forged = `insert into public.competitions (id, creator_id, creator_name, subject, difficulty, minutes, questions, creator_score, creator_ms, total) values ('forged', '${A}', 'BrachNha', 'math', 'mix', 10, '[]', 1, 1, 1)`;
  assert.notEqual(await outcome(() => h.asStudent(A, () => h.db.exec(forged))), "accepted");
  assert.notEqual(
    await outcome(() => h.asStudent(A, () => h.db.exec(`insert into public.competition_attempts (competition_id, user_id, user_name, score, ms) values ('good', '${A}', 'x', 1, 1)`))),
    "accepted"
  );
});

test("forged questions are refused", async () => {
  const insult = [{ q: { en: "insult", km: "insult" }, options: ["a", "b"], correct: "a" }];
  assert.equal(await outcome(() => post(A, { id: "f1", questions: insult })), "unknown_question");

  const wrongKey = [{ ...qs[0], correct: qs[0].options.find((o) => o !== qs[0].correct) }];
  assert.equal(await outcome(() => post(A, { id: "f2", questions: wrongKey })), "unknown_question");

  const edited = [{ ...qs[0], options: [...qs[0].options.slice(0, -1), "abuse here"] }];
  assert.equal(await outcome(() => post(A, { id: "f3", questions: edited, answers: [null] })), "unknown_question");

  assert.equal(await outcome(() => post(A, { id: "f4", subject: "biology", questions: [qs[0]], answers: [null] })), "unknown_question");
});

test("extra text on a real question is thrown away, and the pool's copy is stored", async () => {
  await post(A, { id: "padded", questions: [{ ...qs[0], explanation: "abuse here" }], answers: [null] });
  const row = await h.one(`select questions from public.competitions where id = 'padded'`);
  assert.equal(row.questions[0].explanation, qs[0].explanation);
});

test("answers must be options of the question", async () => {
  assert.equal(await outcome(() => post(A, { id: "a1", questions: [qs[0]], answers: ["abuse here"] })), "bad_answer");
  assert.equal(await outcome(() => post(A, { id: "a2", questions: [qs[0]], answers: [{ x: 1 }] })), "bad_answer");
  assert.equal(await outcome(() => post(A, { id: "a3", answers: [null] })), "bad_shape");
  assert.equal(await outcome(() => post(A, { id: "a4", questions: [], answers: [] })), "bad_shape");
  assert.equal(await outcome(() => post(A, { id: "../x y", questions: [qs[0]], answers: [null] })), "bad_id");
});

test("time is held to the budget, and blanks score nothing", async () => {
  await post(A, { id: "slow", minutes: 10, ms: 99999999, questions: [qs[0]], answers: [null] });
  assert.equal((await h.one(`select creator_ms m from public.competitions where id = 'slow'`)).m, 600000);
  await post(A, { id: "blank", answers: qs.map(() => null) });
  assert.equal((await h.one(`select creator_score s from public.competitions where id = 'blank'`)).s, 0);
});

test("a question from an older published version still shares", async () => {
  const q = "ចាស់";
  await h.db.query(`insert into public.content_versions (kind, key, version, body) values ('game', 'physics', 1, $1::jsonb), ('game', 'physics', 2, $2::jsonb)`, [
    JSON.stringify([{ id: "q1", q: { en: "old", km: q }, options: ["a", "b"], correct: "b" }]),
    JSON.stringify([{ id: "q1", q: "ថ្មី", options: ["a", "b"], correct: "a" }]),
  ]);
  assert.equal(await outcome(() => post(A, { id: "old-pool", subject: "physics", questions: [{ q: { en: q, km: q }, options: ["a", "b"], correct: "b" }], answers: ["b"] })), "accepted");
});

test("only a real account with a name can post or join", async () => {
  const nameless = await h.student("");
  const anonymous = await h.student("Ghost", { anonymous: true });
  assert.equal(await outcome(() => post(nameless, { id: "n1" })), "not_signed_in");
  assert.equal(await outcome(() => post(anonymous, { id: "n2" })), "not_signed_in");
  assert.equal(await outcome(() => join(anonymous, "good", qs.map(() => null))), "not_signed_in");
  assert.notEqual(
    await outcome(() => h.asGuest(() => h.db.query(`select public.post_competition('x','math','mix',10,'[]'::jsonb,'[]'::jsonb,1)`))),
    "accepted"
  );
  assert.equal(
    await outcome(() => h.asStudent(null, () => h.db.query(`select public.post_competition('x','math','mix',10,'[]'::jsonb,'[]'::jsonb,1)`))),
    "not_signed_in"
  );
});

test("joining: the server scores it, once, and an answer must be an option", async () => {
  await post(A, { id: "to-join" });
  const answers = qs.map((q, i) => (i < 3 ? q.correct : q.options.find((o) => o !== q.correct)));
  assert.equal(await outcome(() => join(B, "to-join", answers)), "accepted");

  const row = await h.one(`select * from public.competition_attempts where competition_id = 'to-join'`);
  assert.equal(row.user_name, "Dara", "the name is the account's, trimmed");
  assert.equal(row.score, 3);

  assert.equal(await outcome(() => join(B, "to-join", answers)), "23505");
  assert.equal(await outcome(() => join(A, "to-join", answers)), "own");
  assert.equal(await outcome(() => join(B, "no-such-battle", answers)), "missing");

  await post(A, { id: "to-join-2" });
  assert.equal(await outcome(() => join(B, "to-join-2", qs.map(() => "abuse here"))), "bad_answer");
  assert.equal(await outcome(() => join(B, "to-join-2", [null])), "bad_shape");
});

test("students can still browse, and a creator sees who played", async () => {
  const seen = await h.asStudent(B, () => h.db.query(`select id from public.competitions`));
  assert.ok(seen.rows.length >= 3);
  const played = await h.asStudent(A, () => h.db.query(`select score from public.competition_attempts where competition_id = 'to-join'`));
  assert.equal(played.rows.length, 1);
});

test("20 new Battles a day: the 21st is refused, and only for that student", async () => {
  const c = await h.student("Chan");
  const d = await h.student("Dina");
  for (let i = 1; i <= 20; i++) assert.equal(await outcome(() => post(c, { id: `cap-${i}` })), "accepted", `Battle ${i}`);

  assert.equal(await outcome(() => post(c, { id: "cap-21" })), "too_many");
  assert.equal(await h.count("public.competitions", "id = 'cap-21'"), 0);
  // Already up there: must still read as shared, or its label never clears.
  assert.equal(await outcome(() => post(c, { id: "cap-5" })), "23505");
  assert.equal(await outcome(() => post(d, { id: "other-1" })), "accepted");
});

test("the 20 are counted by the day in Phnom Penh, not UTC", async () => {
  const e = await h.student("Eng");
  const midnight = `((now() at time zone 'Asia/Phnom_Penh')::date at time zone 'Asia/Phnom_Penh')`;
  await h.db.exec(`
    insert into public.competitions (id, creator_id, creator_name, subject, difficulty, minutes, questions, creator_score, creator_ms, total, created_at)
    select 'yest-' || g, '${e}', 'x', 'math', 'mix', 10, '[]', 1, 1, 1, ${midnight} - interval '1 second' from generate_series(1, 20) g;
  `);
  assert.equal(await outcome(() => post(e, { id: "today-1" })), "accepted");
  await h.db.exec(`
    insert into public.competitions (id, creator_id, creator_name, subject, difficulty, minutes, questions, creator_score, creator_ms, total, created_at)
    select 'edge-' || g, '${e}', 'x', 'math', 'mix', 10, '[]', 1, 1, 1, ${midnight} from generate_series(1, 19) g;
  `);
  assert.equal(await outcome(() => post(e, { id: "today-2" })), "too_many");
});
