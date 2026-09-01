import { getSupabase } from "@/lib/supabase";
import { useBrachNhaStore } from "@/lib/store";
import type { ExamResult } from "@/lib/store";
import type { Commitment, Conversation, PendingPlacementTest } from "@/types";
import type { InsertOf, Tables } from "@/types/database";

/**
 * Maps the Zustand store onto the Supabase schema, in both directions.
 *
 * ── The shape of the whole thing ──────────────────────────────────────────
 *
 * The app stays OFFLINE-FIRST. zustand/persist keeps writing the full state to
 * localStorage exactly as it did before, and every screen keeps reading from
 * the store synchronously. Supabase is a second, slower copy that trails
 * behind — never something the UI waits on, and never something whose absence
 * changes what renders. That is not caution for its own sake: this app is for
 * students on Cambodian mobile data, where "the network is down" is a Tuesday.
 *
 * So every function here is failure-tolerant by construction. A rejected
 * request logs and returns; the student's work is already safe in localStorage
 * and the next push carries it.
 *
 * ── Which copy wins ───────────────────────────────────────────────────────
 *
 * Local. Always, except one case: a session that exists while the store is
 * empty (`userName === ""`), which means the browser has credentials but no
 * study data — a fresh install against an existing account. Only then do we
 * pull and hydrate. Otherwise we push.
 *
 * The rule is deliberately lopsided. A wrong pull silently overwrites work the
 * student just did with a stale server copy, and they have no way to get it
 * back; a wrong push overwrites a server copy that is a backup of that same
 * device. The costs are not symmetrical, so the tie does not go to the middle.
 *
 * ── What this does NOT give you yet ───────────────────────────────────────
 *
 * Multi-device sync. use-supabase-sync.ts signs students in ANONYMOUSLY, and an
 * anonymous session lives in one browser's localStorage — a second device gets
 * a different anonymous user and therefore a different, empty account. What
 * this layer buys today is durable backup and server-side history. Real
 * roaming needs the anonymous user linked to an email, which is a change in the
 * auth hook, not in here: every table is already keyed on auth.uid() and the
 * pull path below is exactly what a second device would run.
 */

const MAX_CHAT_MSGS = 40; // mirrors the cap in lib/store.ts

type StoreState = ReturnType<typeof useBrachNhaStore.getState>;

/** Anything that reaches Supabase goes through here, so one dead request can
 *  never take a screen with it. Named rather than inline so the intent is
 *  greppable: these failures are expected, not swallowed bugs. */
async function attempt(label: string, run: () => PromiseLike<unknown>) {
  try {
    const result = (await run()) as { error?: { message: string } | null };
    if (result?.error) {
      console.warn(`[sync] ${label}: ${result.error.message}`);
    }
  } catch (err) {
    console.warn(`[sync] ${label}:`, err);
  }
}

// ── store → row ─────────────────────────────────────────────────────────────

/** `userAge` is a string in the store because it comes off an <input>; the
 *  column is smallint. "" and anything non-numeric become null rather than 0,
 *  since 0 would be a claim about the student's age and null is the truth. */
function ageToColumn(age: string): number | null {
  const n = Number.parseInt(age, 10);
  return Number.isFinite(n) && n >= 1 && n <= 120 ? n : null;
}

function profileRow(userId: string, s: StoreState): InsertOf<"profiles"> {
  return {
    id: userId,
    display_name: s.userName,
    email: s.userEmail || null,
    age: ageToColumn(s.userAge),
    location: s.userLocation || null,
    // The store uses "" for "not chosen"; the column's check constraint only
    // accepts the two real values or null.
    study_language: s.userLanguage || null,
    ui_lang: s.lang,
    theme: s.theme,
    xp: s.xp,
    level: s.level,
    coins: s.coins,
    streak: s.streak,
    surveyed: s.surveyed,
    studied: s.userData.studied,
    grade: s.userData.grade,
    strengths: s.userData.strengths,
    weaknesses: s.userData.weaknesses,
    pledge_seen: s.pledgeSeen,
    active_conversation_id: s.activeConversationId,
  };
}

// ── row → store ─────────────────────────────────────────────────────────────

function storeFromProfile(row: Tables<"profiles">) {
  return {
    userName: row.display_name,
    userEmail: row.email ?? "",
    userAge: row.age === null ? "" : String(row.age),
    userLocation: row.location ?? "",
    userLanguage: row.study_language ?? ("" as const),
    lang: row.ui_lang,
    theme: row.theme,
    xp: row.xp,
    level: row.level,
    coins: row.coins,
    streak: row.streak,
    surveyed: row.surveyed,
    pledgeSeen: row.pledge_seen,
    activeConversationId: row.active_conversation_id,
    userData: {
      grade: row.grade,
      strengths: row.strengths,
      weaknesses: row.weaknesses,
      studied: row.studied,
    },
  };
}

function commitmentFromRow(row: Tables<"commitments">): Commitment {
  return {
    kind: row.kind,
    signature: row.signature,
    signedAt: row.signed_at,
    grade: row.grade,
    months: row.months,
    hoursPerDay: Number(row.hours_per_day),
    mission: {
      lessons: row.mission_lessons,
      practice: row.mission_practice,
      flashcards: row.mission_flashcards,
    },
  };
}

// ── push ────────────────────────────────────────────────────────────────────

/**
 * Writes the whole local state up as a set of upserts.
 *
 * A full snapshot rather than a diff of what changed. The payload is small and
 * hard-capped by the store itself (20 conversations x 40 messages, a handful of
 * exam results), and a snapshot has no way to drift out of step with the store
 * the way an incremental log does. Diffing would buy bytes this app does not
 * need to save and cost a class of bug it cannot afford.
 */
export async function pushLocalState(userId: string, s: StoreState) {
  const db = await getSupabase();
  if (!db) return;

  await attempt("profiles", () =>
    db.from("profiles").upsert(profileRow(userId, s), { onConflict: "id" })
  );

  // ── pending placement tests: replace the set ──
  // resolvePlacementTest() REMOVES an entry, so an upsert alone would leave a
  // resolved test on the server forever. Delete-then-insert is correct here
  // precisely because the local list is the complete authoritative set.
  const pendingRows: InsertOf<"pending_placement_tests">[] =
    s.pendingPlacementTests.map((p: PendingPlacementTest) => ({
      user_id: userId,
      subject: p.subject,
      scheduled_date: p.scheduledDate || null,
    }));
  const keepSubjects = s.pendingPlacementTests.map((p) => p.subject);
  await attempt("pending_placement_tests: prune", () => {
    const q = db.from("pending_placement_tests").delete().eq("user_id", userId);
    return keepSubjects.length
      ? q.not("subject", "in", `(${keepSubjects.map(quoteIn).join(",")})`)
      : q;
  });
  if (pendingRows.length) {
    await attempt("pending_placement_tests: upsert", () =>
      db
        .from("pending_placement_tests")
        .upsert(pendingRows, { onConflict: "user_id,subject" })
    );
  }

  // ── commitment: append-only history, newest is live ──
  if (s.commitment) {
    const c = s.commitment;
    await attempt("commitments", () =>
      db.from("commitments").upsert(
        {
          user_id: userId,
          kind: c.kind,
          signature: c.signature,
          signed_at: c.signedAt,
          grade: c.grade,
          months: c.months,
          hours_per_day: c.hoursPerDay,
          mission_lessons: c.mission.lessons,
          mission_practice: c.mission.practice,
          mission_flashcards: c.mission.flashcards,
        },
        { onConflict: "user_id,signed_at" }
      )
    );
  }

  // ── today's tasks ──
  // The store's `tasks` is only ever today (resetDailyTasks wipes it), so it
  // lands on today's row. Yesterday's row is left exactly as it was, which is
  // the whole point of giving the table a date — it is the activity log the
  // Progress heatmap needs and the store cannot keep.
  await attempt("daily_activity", () =>
    db.from("daily_activity").upsert(
      {
        user_id: userId,
        activity_date: today(),
        task_lesson: s.tasks.lesson,
        task_practice: s.tasks.practice,
        task_flashcards: s.tasks.flashcards,
        task_challenge: s.tasks.challenge,
      },
      { onConflict: "user_id,activity_date" }
    )
  );

  // ── exam results ──
  // kind is 'mock' for everything in this array by definition: exam-view.tsx
  // only calls addExamResult when run.kind === "generated". Past-paper and
  // placement attempts get their own kind when they are wired up, and are what
  // the column exists for.
  if (s.examResults.length) {
    const rows: InsertOf<"exam_results">[] = s.examResults.map(
      (r: ExamResult) => ({
        user_id: userId,
        kind: "mock" as const,
        score: r.score,
        total: r.total,
        pct: r.pct,
        taken_at: r.date,
      })
    );
    await attempt("exam_results", () =>
      db
        .from("exam_results")
        .upsert(rows, { onConflict: "user_id,kind,taken_at" })
    );
  }

  // ── completed sessions ──
  // No prune step, unlike the pending tests above: nothing in the app ever
  // un-completes a lesson, so a row missing locally means the local copy is
  // behind, not that the lesson was undone.
  if (s.completedSessions.length) {
    const rows: InsertOf<"completed_sessions">[] = s.completedSessions.map(
      (lessonId: string) => ({ user_id: userId, lesson_id: lessonId })
    );
    await attempt("completed_sessions", () =>
      db
        .from("completed_sessions")
        .upsert(rows, { onConflict: "user_id,lesson_id", ignoreDuplicates: true })
    );
  }

  await pushConversations(userId, s.conversations);
}

/**
 * Conversations, and only the ones that actually moved.
 *
 * Messages are replaced wholesale per changed conversation rather than
 * upserted by position, because position is not stable: store.ts caps a
 * conversation at MAX_CHAT_MSGS with `slice(-40)`, which drops from the FRONT
 * and shifts every remaining message's index down by one. An upsert keyed on
 * that index would quietly rewrite the wrong rows.
 *
 * `signatureOf` is what keeps this cheap. A streamed reply grows through
 * appendChatChunk without touching `updatedAt`, so a timestamp comparison alone
 * would never notice the reply arriving; including the message count and the
 * last message's length catches the stream and settles as soon as it ends.
 */
const lastPushedSignature = new Map<string, string>();

function signatureOf(c: Conversation): string {
  const last = c.msgs[c.msgs.length - 1];
  return `${c.updatedAt}:${c.msgs.length}:${last ? last.text.length : 0}`;
}

async function pushConversations(userId: string, conversations: Conversation[]) {
  const db = await getSupabase();
  if (!db) return;

  const liveIds = conversations.map((c) => c.id);

  // Deleting a conversation is a real user action (two taps, matching the
  // Logout confirm), so it has to reach the server.
  await attempt("conversations: prune", () => {
    const q = db.from("conversations").delete().eq("user_id", userId);
    return liveIds.length
      ? q.not("id", "in", `(${liveIds.map(quoteIn).join(",")})`)
      : q;
  });
  for (const id of [...lastPushedSignature.keys()]) {
    if (!liveIds.includes(id)) lastPushedSignature.delete(id);
  }

  for (const c of conversations) {
    const signature = signatureOf(c);
    if (lastPushedSignature.get(c.id) === signature) continue;

    await attempt("conversations: upsert", () =>
      db.from("conversations").upsert(
        {
          id: c.id,
          user_id: userId,
          title: c.title,
          created_at: c.createdAt,
          updated_at: c.updatedAt,
        },
        { onConflict: "id" }
      )
    );

    await attempt("chat_messages: clear", () =>
      db.from("chat_messages").delete().eq("conversation_id", c.id)
    );

    if (c.msgs.length) {
      const rows: InsertOf<"chat_messages">[] = c.msgs
        .slice(-MAX_CHAT_MSGS)
        .map((m, seq) => ({
          conversation_id: c.id,
          user_id: userId,
          seq,
          role: m.role,
          content: m.text,
        }));
      await attempt("chat_messages: insert", () =>
        db.from("chat_messages").insert(rows)
      );
    }

    lastPushedSignature.set(c.id, signature);
  }
}

// ── pull ────────────────────────────────────────────────────────────────────

/**
 * Reads the account back out of Supabase and into the store.
 *
 * Only ever called for an empty store — see the "which copy wins" note above.
 * If the profile row is missing (a project where the migrations have not been
 * applied, or an account created before the trigger existed) this returns false
 * and the caller pushes instead, which is the right recovery: the local copy
 * becomes the server copy rather than the student being handed a blank account.
 */
export async function pullRemoteState(userId: string): Promise<boolean> {
  const db = await getSupabase();
  if (!db) return false;

  const { data: profile, error } = await db
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn(`[sync] pull profiles: ${error.message}`);
    return false;
  }
  if (!profile || !profile.display_name) return false;

  const [pending, commitments, exams, sessions, conversations] =
    await Promise.all([
      db
        .from("pending_placement_tests")
        .select("*")
        .eq("user_id", userId),
      db
        .from("commitments")
        .select("*")
        .eq("user_id", userId)
        .order("signed_at", { ascending: false })
        .limit(1),
      db
        .from("exam_results")
        .select("*")
        .eq("user_id", userId)
        .eq("kind", "mock")
        .order("taken_at", { ascending: true }),
      db.from("completed_sessions").select("*").eq("user_id", userId),
      db
        .from("conversations")
        .select("*, chat_messages(seq, role, content)")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false }),
    ]);

  const todayRow = await db
    .from("daily_activity")
    .select("*")
    .eq("user_id", userId)
    .eq("activity_date", today())
    .maybeSingle();

  type MessageRow = Pick<Tables<"chat_messages">, "seq" | "role" | "content">;
  type ConversationWithMessages = Tables<"conversations"> & {
    chat_messages: MessageRow[] | null;
  };

  const restored: Conversation[] = (
    (conversations.data ?? []) as ConversationWithMessages[]
  ).map((row) => ({
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // PostgREST does not promise an order for an embedded resource, so the
    // ordering the `seq` column exists for has to be applied here.
    msgs: [...(row.chat_messages ?? [])]
      .sort((a, b) => a.seq - b.seq)
      .map((m) => ({ role: m.role, text: m.content })),
  }));

  const latestCommitment = commitments.data?.[0];
  const activeId = profile.active_conversation_id;

  useBrachNhaStore.setState({
    ...storeFromProfile(profile),
    pendingPlacementTests: (pending.data ?? []).map((p) => ({
      subject: p.subject,
      scheduledDate: p.scheduled_date ?? "",
    })),
    commitment: latestCommitment ? commitmentFromRow(latestCommitment) : null,
    examResults: (exams.data ?? []).map((r) => ({
      score: r.score,
      total: r.total,
      pct: Number(r.pct),
      date: r.taken_at,
    })),
    completedSessions: (sessions.data ?? []).map((r) => r.lesson_id),
    conversations: restored,
    // Guard against pointing at a conversation that did not come back — the
    // overlay would render an empty thread it cannot explain.
    activeConversationId:
      activeId && restored.some((c) => c.id === activeId) ? activeId : null,
    tasks: todayRow.data
      ? {
          lesson: todayRow.data.task_lesson,
          practice: todayRow.data.task_practice,
          flashcards: todayRow.data.task_flashcards,
          challenge: todayRow.data.task_challenge,
        }
      : { lesson: false, practice: false, flashcards: false, challenge: false },
  });

  for (const c of restored) lastPushedSignature.set(c.id, signatureOf(c));
  return true;
}

/** Drops the per-conversation push cache. Called on sign-out: the next account
 *  to use this browser must not inherit another student's "already pushed"
 *  bookkeeping and skip writing their first conversation. */
export function resetSyncCache() {
  lastPushedSignature.clear();
}

// ── helpers ─────────────────────────────────────────────────────────────────

/** Local calendar date as YYYY-MM-DD. Deliberately NOT toISOString().slice(0,10),
 *  which is UTC: for a student in Phnom Penh (UTC+7) that rolls the day over at
 *  7am, so a morning lesson would be filed under yesterday. */
function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** PostgREST's `in` filter takes a bare comma-separated list, so any value
 *  containing a comma, quote or paren has to be quoted and escaped or it is
 *  read as several values. Lesson and conversation ids are tame today; this is
 *  here so that stays true when they are not. */
function quoteIn(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}
