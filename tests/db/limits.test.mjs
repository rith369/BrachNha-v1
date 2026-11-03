import assert from "node:assert/strict";
import { before, test } from "node:test";
import { freshDb, outcome } from "./setup.mjs";

/**
 * Text that is too long and numbers that cannot be real are CUT, never refused: sync
 * failures are silent, so a refusal would stop a real student saving with nothing on
 * screen. So the tests here check both halves: the forged value is held down, and the
 * real one comes through exactly.
 */

const BIG = "n".repeat(1_000_000);
let h;
before(async () => {
  h = await freshDb();
});

const today = async () => (await h.one(`select (now() at time zone 'Asia/Phnom_Penh')::date::text d`)).d;
const dayOff = (from, n) => new Date(Date.parse(`${from}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const profile = (id) => h.one(`select * from public.profiles where id = $1`, [id]);

test("a giant profile save is cut, not refused, and the XP in it is kept", async () => {
  const s = await h.student("Sok", { daysOld: 30 });
  const list = `{${Array(1000).fill("w".repeat(500)).join(",")}}`;
  const saved = await outcome(() =>
    h.asStudent(s, () =>
      h.db.query(
        `insert into public.profiles (id, display_name, email, location, grade, xp, strengths, weaknesses, active_conversation_id)
         values ($1, $2, $2, $2, $2, 777, $3::text[], '{math,physics}', $2)
         on conflict (id) do update set display_name = excluded.display_name, email = excluded.email, location = excluded.location,
           grade = excluded.grade, xp = excluded.xp, strengths = excluded.strengths, weaknesses = excluded.weaknesses,
           active_conversation_id = excluded.active_conversation_id`,
        [s, BIG, list]
      )
    )
  );
  assert.equal(saved, "accepted");
  const row = await profile(s);
  assert.equal(row.display_name.length, 40);
  assert.equal(row.email.length, 320);
  assert.equal(row.location.length, 100);
  assert.equal(row.grade.length, 100);
  assert.equal(row.active_conversation_id.length, 100);
  assert.equal(row.strengths.length, 50);
  assert.equal(row.strengths[0].length, 100);
  assert.deepEqual(row.weaknesses, ["math", "physics"], "a short list keeps its order");
  assert.equal(row.xp, 777);
});

test("real names and lists are untouched, and empty stays empty", async () => {
  const s = await h.student("សុខ ពិសិដ្ឋ");
  assert.equal((await profile(s)).display_name, "សុខ ពិសិដ្ឋ");
  const atLimit = "ក".repeat(40);
  await h.asStudent(s, () =>
    h.db.query(`update public.profiles set display_name = $2, location = null, grade = '', strengths = '{}', weaknesses = '{"គណិតវិទ្យា","រូបវិទ្យា"}' where id = $1`, [s, atLimit])
  );
  const row = await profile(s);
  assert.equal(row.display_name, atLimit);
  assert.equal(row.location, null);
  assert.equal(row.grade, "");
  assert.deepEqual(row.strengths, []);
  assert.deepEqual(row.weaknesses, ["គណិតវិទ្យា", "រូបវិទ្យា"]);
});

test("a chat push with one giant message goes in whole, and real ones are untouched", async () => {
  const s = await h.student("Sok");
  const reply = "ក".repeat(25000);
  const pushed = await outcome(() =>
    h.asStudent(s, async () => {
      await h.db.query(`insert into public.conversations (id, user_id, title) values ('c1', $1, $2)`, [s, BIG]);
      const values = Array.from({ length: 40 }, (_, i) => `('c1', '${s}', ${i}, 'bot', ${i === 39 ? `repeat('m', 100000)` : `'សួស្តី ${i}'`})`).join(",");
      await h.db.exec(`insert into public.chat_messages (conversation_id, user_id, seq, role, content) values ${values}`);
      await h.db.query(`insert into public.chat_messages (conversation_id, user_id, seq, role, content) values ('c1', $1, 40, 'bot', $2)`, [s, reply]);
    })
  );
  assert.equal(pushed, "accepted");
  assert.equal(await h.count("public.chat_messages", "conversation_id = 'c1'"), 41);
  assert.equal((await h.one(`select char_length(content) n from public.chat_messages where conversation_id = 'c1' and seq = 39`)).n, 30000);
  assert.equal((await h.one(`select content c from public.chat_messages where conversation_id = 'c1' and seq = 0`)).c, "សួស្តី 0");
  assert.equal((await h.one(`select content c from public.chat_messages where conversation_id = 'c1' and seq = 40`)).c, reply);
  assert.equal((await h.one(`select char_length(title) n from public.conversations where id = 'c1'`)).n, 200);
});

test("the longest real signature is untouched, and a giant one is cut", async () => {
  const s = await h.student("Sok");
  const sig = "L1000.5 1000.5".repeat(2500);
  await h.asStudent(s, async () => {
    await h.db.query(`insert into public.commitments (user_id, kind, signature, signed_at) values ($1, 'drawn', $2, now())`, [s, sig]);
    await h.db.query(`insert into public.commitments (user_id, kind, signature, signed_at, grade, months) values ($1, 'drawn', $2, now() + interval '1 second', $2, $2)`, [s, BIG]);
  });
  const rows = await h.rows(`select signature, grade from public.commitments where user_id = $1 order by signed_at`, [s]);
  assert.equal(rows[0].signature, sig);
  assert.equal(rows[1].signature.length, 60000);
  assert.equal(rows[1].grade.length, 100);
});

test("long ids and keys are refused, and normal ones pass", async () => {
  const s = await h.student("Sok");
  const refused = async (sql, args) => assert.equal(await outcome(() => h.asStudent(s, () => h.db.query(sql, args))), "23514", sql);
  await refused(`insert into public.conversations (id, user_id) values ($1, $2)`, ["i".repeat(101), s]);
  await refused(`insert into public.completed_sessions (user_id, lesson_id) values ($1, $2)`, [s, "l".repeat(201)]);
  await refused(`insert into public.daily_content_activity (user_id, activity_date, content_key) values ($1, current_date, $2)`, [s, "k".repeat(201)]);
  await refused(`insert into public.exam_results (user_id, subject, score, total, pct) values ($1, $2, 1, 2, 50)`, [s, "s".repeat(101)]);
  await refused(`insert into public.pending_placement_tests (user_id, subject) values ($1, $2)`, [s, "s".repeat(101)]);

  const normal = await outcome(() =>
    h.asStudent(s, async () => {
      await h.db.query(`insert into public.conversations (id, user_id) values ($1, $2)`, [crypto.randomUUID(), s]);
      await h.db.query(`insert into public.completed_sessions (user_id, lesson_id) values ($1, 'biology-1-1')`, [s]);
      await h.db.query(`insert into public.daily_content_activity (user_id, activity_date, content_key) values ($1, current_date, 'section:biology-1-1')`, [s]);
      await h.db.query(`insert into public.exam_results (user_id, subject, score, total, pct) values ($1, null, 1, 2, 50)`, [s]);
    })
  );
  assert.equal(normal, "accepted");
});

test("a faked total is held to what the account's age allows", async () => {
  const s = await h.student("Cheat", { daysOld: 30 });
  const cap = 5000 * 32;
  const saved = await outcome(() =>
    h.asStudent(s, () =>
      h.db.query(`update public.profiles set xp = 1000000, coins = 1000000, streak = 9999, streak_protections = 50, created_at = '2000-01-01' where id = $1`, [s])
    )
  );
  assert.equal(saved, "accepted", "the cheat must not be told");
  const row = await profile(s);
  assert.equal(row.xp, cap);
  assert.equal(row.coins, cap);
  assert.equal(row.streak, 45);
  assert.equal(row.streak_protections, 2);

  // Changing the profile's own date bought nothing: the age is read from auth.users.
  await h.asStudent(s, () => h.db.query(`update public.profiles set xp = 1000000 where id = $1`, [s]));
  assert.equal((await profile(s)).xp, cap);
});

test("a real student's numbers come through exactly", async () => {
  const s = await h.student("Honest", { daysOld: 30 });
  const day = await today();
  const saved = await outcome(() =>
    h.asStudent(s, async () => {
      await h.db.query(`update public.profiles set xp = 12480, coins = 3120, streak = 30, streak_protections = 2 where id = $1`, [s]);
      await h.db.query(`insert into public.daily_activity (user_id, activity_date, xp_earned, study_minutes, streak_day) values ($1, $2, 3600, 420, true)`, [s, day]);
      const rows = Array.from({ length: 14 }, (_, i) => `('${s}', '${dayOff(day, -(i + 1))}', ${100 + i}, ${30 + i})`).join(",");
      await h.db.exec(`insert into public.daily_activity (user_id, activity_date, xp_earned, study_minutes) values ${rows}
        on conflict (user_id, activity_date) do update set xp_earned = excluded.xp_earned, study_minutes = excluded.study_minutes`);
      await h.db.query(`update public.daily_activity set xp_earned = 5000, study_minutes = 960 where user_id = $1 and activity_date = $2`, [s, dayOff(day, -1)]);
    })
  );
  assert.equal(saved, "accepted");
  const row = await profile(s);
  assert.deepEqual([row.xp, row.coins, row.streak, row.streak_protections], [12480, 3120, 30, 2]);
  assert.equal(await h.count("public.daily_activity", "user_id = $1", [s]), 15, "all 14 past days and today");
  assert.equal((await h.one(`select xp_earned x from public.daily_activity where user_id = $1 and activity_date = $2`, [s, day])).x, 3600);
  const limit = await h.one(`select xp_earned x, study_minutes m from public.daily_activity where user_id = $1 and activity_date = $2`, [s, dayOff(day, -1)]);
  assert.deepEqual([limit.x, limit.m], [5000, 960], "exactly the limit is kept");
});

test("a faked day is held to 5000 XP and 16 hours", async () => {
  const s = await h.student("Cheat", { daysOld: 30 });
  const day = await today();
  const saved = await outcome(() =>
    h.asStudent(s, () => h.db.query(`insert into public.daily_activity (user_id, activity_date, xp_earned, study_minutes) values ($1, $2, 1000000, 100000)`, [s, day]))
  );
  assert.equal(saved, "accepted");
  const row = await h.one(`select xp_earned x, study_minutes m from public.daily_activity where user_id = $1`, [s]);
  assert.deepEqual([row.x, row.m], [5000, 960]);
});

test("old days cannot be written, edited or moved to, and nothing is refused", async () => {
  const s = await h.student("Cheat", { daysOld: 30 });
  const day = await today();
  const values = Array.from({ length: 100 }, (_, i) => `('${s}', '${dayOff(day, -i)}', true)`).join(",");
  const batch = await outcome(() =>
    h.asStudent(s, () => h.db.exec(`insert into public.daily_activity (user_id, activity_date, streak_day) values ${values} on conflict (user_id, activity_date) do update set streak_day = excluded.streak_day`))
  );
  assert.equal(batch, "accepted");
  assert.equal(await h.count("public.daily_activity", "user_id = $1", [s]), 16, "only the last 16 days landed");

  const future = await outcome(() => h.asStudent(s, () => h.db.query(`insert into public.daily_activity (user_id, activity_date, xp_earned) values ($1, $2, 100)`, [s, dayOff(day, 30)])));
  assert.equal(future, "accepted");
  assert.equal(await h.count("public.daily_activity", "user_id = $1 and activity_date = $2", [s, dayOff(day, 30)]), 0);

  // An old row from before, written past the trigger.
  await h.db.query(`alter table public.daily_activity disable trigger daily_activity_limit_numbers`);
  await h.db.query(`insert into public.daily_activity (user_id, activity_date, xp_earned) values ($1, $2, 400)`, [s, dayOff(day, -60)]);
  await h.db.query(`alter table public.daily_activity enable trigger daily_activity_limit_numbers`);

  await h.asStudent(s, () => h.db.query(`update public.daily_activity set streak_day = true, xp_earned = 1 where user_id = $1 and activity_date = $2`, [s, dayOff(day, -60)]));
  const old = await h.one(`select streak_day s, xp_earned x from public.daily_activity where user_id = $1 and activity_date = $2`, [s, dayOff(day, -60)]);
  assert.deepEqual([old.s, old.x], [false, 400], "an old day was edited");

  await h.asStudent(s, () => h.db.query(`update public.daily_activity set activity_date = $2 where user_id = $1 and activity_date = $3`, [s, dayOff(day, -200), day]));
  assert.equal(await h.count("public.daily_activity", "user_id = $1 and activity_date = $2", [s, dayOff(day, -200)]), 0, "a day moved far back");
});

test("a guest's history comes up on a new account, and a cut total returns with age", async () => {
  const s = await h.student("New");
  const day = await today();
  const saved = await outcome(() =>
    h.asStudent(s, async () => {
      await h.db.query(`update public.profiles set xp = 6000, streak = 10 where id = $1`, [s]);
      const rows = Array.from({ length: 10 }, (_, i) => `('${s}', '${dayOff(day, -(i + 1))}', true)`).join(",");
      await h.db.exec(`insert into public.daily_activity (user_id, activity_date, streak_day) values ${rows}`);
    })
  );
  assert.equal(saved, "accepted");
  assert.deepEqual([(await profile(s)).xp, (await profile(s)).streak], [6000, 10]);

  await h.asStudent(s, () => h.db.query(`update public.profiles set xp = 60000 where id = $1`, [s]));
  assert.equal((await profile(s)).xp, 10000, "a new account cannot claim it all");

  await h.db.query(`update auth.users set created_at = now() - interval '12 days' where id = $1`, [s]);
  await h.asStudent(s, () => h.db.query(`update public.profiles set xp = 60000 where id = $1`, [s]));
  assert.equal((await profile(s)).xp, 60000, "every push resends the total, so it comes back");
});

test("an account's age is counted in Phnom Penh days", async () => {
  const s = await h.student("Late");
  const day = await today();
  await h.db.query(`update auth.users set created_at = ($2::timestamp + interval '1 minute') at time zone 'Asia/Phnom_Penh' where id = $1`, [s, day]);
  await h.asStudent(s, () => h.db.query(`update public.profiles set xp = 999999 where id = $1`, [s]));
  assert.equal((await profile(s)).xp, 10000, "00:01 today is age 0");

  await h.db.query(`update auth.users set created_at = ($2::timestamp - interval '1 minute') at time zone 'Asia/Phnom_Penh' where id = $1`, [s, day]);
  await h.asStudent(s, () => h.db.query(`update public.profiles set xp = 999999 where id = $1`, [s]));
  assert.equal((await profile(s)).xp, 15000, "23:59 yesterday is age 1");
});

test("what other students see on the leaderboard is the held number", async () => {
  const cheat = await h.student("Board Cheat", { daysOld: 30 });
  const reader = await h.student("Reader");
  const day = await today();
  await h.asStudent(cheat, async () => {
    await h.db.query(`update public.profiles set xp = 2000000000 where id = $1`, [cheat]);
    const rows = Array.from({ length: 100 }, (_, i) => `('${cheat}', '${dayOff(day, -i)}', true, 1000000, 100000)`).join(",");
    await h.db.exec(`insert into public.daily_activity (user_id, activity_date, streak_day, xp_earned, study_minutes) values ${rows}`);
  });
  const board = await h.asStudent(reader, () => h.db.query(`select * from public.leaderboard($1)`, [day]));
  const row = board.rows.find((r) => r.id === cheat);
  assert.equal(row.xp_all, 160000);
  assert.ok(row.xp_week <= 35000, `week ${row.xp_week}`);
  assert.ok(row.minutes_week <= 6720, `minutes ${row.minutes_week}`);
  assert.ok(row.streak_now <= 16 && row.streak_all <= 16, `streak ${row.streak_now}`);
});

// ── How many rows ───────────────────────────────────────────────────────────

const at = (i) => `(now() + (${i} || ' seconds')::interval)`;
const ROW_LIMITS = [
  ["commitments", 100, (u, i, n) => `insert into public.commitments (user_id, kind, signature, signed_at) select '${u}', 'typed', 'x', ${at("g")} from generate_series(${i}, ${i + n - 1}) g`],
  ["exam_results", 1000, (u, i, n) => `insert into public.exam_results (user_id, score, total, pct, taken_at) select '${u}', 1, 2, 50, ${at("g")} from generate_series(${i}, ${i + n - 1}) g`],
  ["completed_sessions", 5000, (u, i, n) => `insert into public.completed_sessions (user_id, lesson_id, completed_at) select '${u}', 'l-' || g, ${at("g")} from generate_series(${i}, ${i + n - 1}) g`],
  ["pending_placement_tests", 50, (u, i, n) => `insert into public.pending_placement_tests (user_id, subject, created_at) select '${u}', 's-' || g, ${at("g")} from generate_series(${i}, ${i + n - 1}) g`],
  ["card_reviews", 20000, (u, i, n) => `insert into public.card_reviews (user_id, card_id, phase, due_at, updated_at) select '${u}', 'c-' || g, 'new', current_date, ${at("g")} from generate_series(${i}, ${i + n - 1}) g`],
  ["student_cards", 2000, (u, i, n) => `insert into public.student_cards (user_id, card_id, deck_key, front, back, created_at, updated_at) select '${u}', 'c-' || g, 'd', 'f', 'b', ${at("g")}, ${at("g")} from generate_series(${i}, ${i + n - 1}) g`],
  ["starred_cards", 20000, (u, i, n) => `insert into public.starred_cards (user_id, card_id, created_at) select '${u}', 'c-' || g, ${at("g")} from generate_series(${i}, ${i + n - 1}) g`],
  ["card_review_log", 5000, (u, i, n) => `insert into public.card_review_log (user_id, card_id, grade, reviewed_at) select '${u}', 'c', 'good', ${at("g")} from generate_series(${i}, ${i + n - 1}) g`],
  ["quiz_results", 200, (u, i, n) => `insert into public.quiz_results (user_id, quiz_key, taken_at, score, total, pct, ms) select '${u}', 'q', ${at("g")}, 1, 2, 50, 1 from generate_series(${i}, ${i + n - 1}) g`],
  ["paper_results", 200, (u, i, n) => `insert into public.paper_results (user_id, paper_key, taken_at, score, total, pct, ms) select '${u}', 'p', ${at("g")}, 1, 2, 50, 1 from generate_series(${i}, ${i + n - 1}) g`],
  ["simulation_attempts", 30, (u, i, n) => `insert into public.simulation_attempts (user_id, id, started_at, updated_at) select '${u}', 's-' || g, ${at("g")}, now() from generate_series(${i}, ${i + n - 1}) g`],
  ["question_mistakes", 1000, (u, i, n) => `insert into public.question_mistakes (user_id, ref, last_wrong_at) select '${u}', 'r-' || g, ${at("g")} from generate_series(${i}, ${i + n - 1}) g`],
  ["daily_content_activity", 30000, (u, i, n) => `insert into public.daily_content_activity (user_id, activity_date, content_key) select '${u}', current_date, 'k-' || g from generate_series(${i}, ${i + n - 1}) g`],
];

for (const [table, cap, sql] of ROW_LIMITS) {
  test(`${table}: held to ${cap}, nothing refused, and the newest stay`, async () => {
    const s = await h.student("Script");
    const other = await h.student("Other");
    await h.asStudent(other, () => h.db.exec(sql(other, 0, 1)));

    // Past the limit in chunks the size the app sends, plus one big one.
    const n = Math.ceil(cap / 2) + 5;
    assert.equal(await outcome(() => h.asStudent(s, () => h.db.exec(sql(s, 0, n)))), "accepted");
    assert.equal(await h.count(`public.${table}`, "user_id = $1", [s]), n === cap ? cap : Math.min(n, cap));
    assert.equal(await outcome(() => h.asStudent(s, () => h.db.exec(sql(s, n, n)))), "accepted");
    assert.equal(await h.count(`public.${table}`, "user_id = $1", [s]), cap);

    assert.equal(await h.count(`public.${table}`, "user_id = $1", [other]), 1, "another student's rows moved");
  });
}

test("the oldest rows are the ones that go", async () => {
  const s = await h.student("Script");
  await h.asStudent(s, () => h.db.exec(`insert into public.quiz_results (user_id, quiz_key, taken_at, score, total, pct, ms) select '${s}', 'q', '2026-01-01'::timestamptz + (g || ' days')::interval, g % 2, 2, 50, 1 from generate_series(1, 300) g`));
  const range = await h.one(`select min(taken_at) a, max(taken_at) b from public.quiz_results where user_id = $1`, [s]);
  assert.equal(Math.round((new Date(range.b) - new Date(range.a)) / 86400000), 199);
  assert.equal(new Date(range.b).toISOString().slice(0, 10), new Date(Date.parse("2026-01-01T00:00:00Z") + 300 * 86400000).toISOString().slice(0, 10));
});

test("the largest real chat pushes whole, and pushing again keeps it", async () => {
  const s = await h.student("Real");
  const push = (c, text) =>
    h.asStudent(s, async () => {
      await h.db.query(`insert into public.conversations (id, user_id, title) values ($1, $2, 't') on conflict (id) do update set title = excluded.title`, [`${s}-${c}`, s]);
      await h.db.query(`delete from public.chat_messages where conversation_id = $1`, [`${s}-${c}`]);
      await h.db.exec(`insert into public.chat_messages (conversation_id, user_id, seq, role, content) select '${s}-${c}', '${s}', g, 'bot', '${text}' from generate_series(0, 39) g`);
    });
  for (let c = 0; c < 20; c++) await push(c, "សួស្តី");
  assert.equal(await h.count("public.chat_messages", "user_id = $1", [s]), 800);
  await push(0, "ថ្មី");
  assert.equal(await h.count("public.chat_messages", "user_id = $1", [s]), 800);
});

test("chat and conversations are held, and no message outlives its conversation", async () => {
  const s = await h.student("Script");
  await h.asStudent(s, async () => {
    await h.db.query(`insert into public.conversations (id, user_id) values ($1, $2)`, [`one-${s}`, s]);
    for (let round = 0; round < 3; round++) {
      await h.db.exec(`insert into public.chat_messages (conversation_id, user_id, seq, role, content) select 'one-${s}', '${s}', g, 'bot', 'x' from generate_series(${round * 500}, ${round * 500 + 499}) g`);
    }
  });
  assert.equal(await h.count("public.chat_messages", "user_id = $1", [s]), 1000);

  await h.asStudent(s, () => h.db.exec(`insert into public.conversations (id, user_id, updated_at) select '${s}-extra-' || g, '${s}', ${at("g")} from generate_series(1, 60) g`));
  assert.equal(await h.count("public.conversations", "user_id = $1", [s]), 50);
  assert.equal(await h.count("public.chat_messages m", `not exists (select 1 from public.conversations c where c.id = m.conversation_id)`), 0);
});

test("upserting rows a student already has loses nothing", async () => {
  const s = await h.student("Real");
  const cards = `insert into public.card_reviews (user_id, card_id, phase, due_at) select '${s}', 'c-' || g, 'new', current_date from generate_series(1, 500) g on conflict (user_id, card_id) do update set phase = excluded.phase`;
  assert.equal(await outcome(() => h.asStudent(s, () => h.db.exec(cards))), "accepted");
  assert.equal(await outcome(() => h.asStudent(s, () => h.db.exec(cards))), "accepted");
  assert.equal(await h.count("public.card_reviews", "user_id = $1", [s]), 500);
  const ignore = `insert into public.completed_sessions (user_id, lesson_id) values ('${s}', 'l-1') on conflict do nothing`;
  assert.equal(await outcome(() => h.asStudent(s, () => h.db.exec(ignore))), "accepted");
  assert.equal(await outcome(() => h.asStudent(s, () => h.db.exec(ignore))), "accepted");
  assert.equal(await h.count("public.completed_sessions", "user_id = $1", [s]), 1);
});

test("the real event function works at its limit, keeping the new event", async () => {
  const s = await h.student("Script");
  await h.db.exec(`insert into public.app_events (user_id, name, event_date, created_at) select '${s}', 'lesson_done', current_date - 1, now() - interval '1 day' from generate_series(1, 30000)`);
  assert.equal(await h.count("public.app_events", "user_id = $1", [s]), 30000);
  assert.equal(await outcome(() => h.asStudent(s, () => h.db.query(`select public.log_event('lesson_done', '{}'::jsonb)`))), "accepted");
  assert.equal(await h.count("public.app_events", "user_id = $1", [s]), 30000);
  assert.equal(await h.count("public.app_events", "user_id = $1 and event_date = (now() at time zone 'Asia/Phnom_Penh')::date", [s]), 1);
});

test("500 rows onto a full table does not slow a real save down", async () => {
  const s = await h.student("Script");
  await h.db.exec(`insert into public.card_reviews (user_id, card_id, phase, due_at, updated_at) select '${s}', 'x-' || g, 'new', current_date, now() - interval '1 day' from generate_series(1, 20000) g`);
  const start = Date.now();
  await h.asStudent(s, () => h.db.exec(`insert into public.card_reviews (user_id, card_id, phase, due_at) select '${s}', 'y-' || g, 'new', current_date from generate_series(1, 500) g`));
  const ms = Date.now() - start;
  assert.ok(ms < 2000, `took ${ms} ms`);
  assert.equal(await h.count("public.card_reviews", "user_id = $1", [s]), 20000);
});
