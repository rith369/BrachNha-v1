import { allSubjects, type SubjectMeta } from "@/features/lessons/subjects";
import type {
  Competition,
  CompetitionAttempt,
  ExamQuestion,
  GameDifficulty,
  GameQuestionBody,
} from "@/types";
import { gameCount, type ContentManifest } from "@/utils/content-manifest";
import type { JoinerAttempt } from "@/lib/competitions";
import { avatarSeedFor } from "@/utils/avatar-seed";

/**
 * The most questions a match will ask. A CEILING, never a target — a subject
 * with fewer plays what it has, and nothing pads or repeats to reach this
 * number. Padding would invent content.
 */
export const MATCH_QUESTIONS = 10;

/**
 * The whole-quiz budgets a creator may choose from, in minutes.
 *
 * ONE CLOCK FOR THE WHOLE QUIZ, not a per-question countdown. That is what makes
 * two runs comparable: both students had the same total time, so the only
 * difference is what they did with it. A per-question clock was built first and
 * removed — with a total budget as well it put two clocks on one screen that
 * could contradict each other.
 *
 * A fixed list rather than a free number field: three taps beats a keyboard on a
 * phone, and it stops a competition being posted with a budget nobody would
 * take (nine seconds, or four hours).
 */
/**
 * The time budgets a creator may choose from, in minutes.
 *
 * THIS IS THE WHOLE RUN, never one question. A per-question limit was built
 * first and removed at the user's request, for a reason worth keeping: there is
 * no honest number for "how long should one question take" — it varies by
 * subject, by question, and by student — so any limit would be invented. What
 * replaced it is a per-question STOPWATCH that counts up (see game-question.tsx),
 * which tells a student how long they spent without pretending to know how long
 * they should have.
 *
 * Widened from 3/5/10 on the user's instruction. Competitions already posted
 * with the old values keep working — `minutes` is just a number on the row, so
 * there is nothing to migrate.
 */
export const MATCH_MINUTES = [10, 20, 30] as const;

/** The difficulty chips on the create screen, in order. Bilingual — the
 *  feature follows the store’s lang; see features/game/copy.ts. */
export const DIFFICULTIES: {
  id: GameDifficulty;
  label: { en: string; km: string };
}[] = [
  { id: "easy", label: { en: "Basic", km: "ងាយ" } },
  { id: "medium", label: { en: "Medium", km: "មធ្យម" } },
  { id: "hard", label: { en: "Hard", km: "ពិបាក" } },
  { id: "mix", label: { en: "Mix", km: "ចម្រុះ" } },
];

/**
 * A subject's question pool as a Battle uses it. The pools live in the
 * database (Admin → Content → Game questions, kind `game`, keyed by subject),
 * so the team fixes a question without a code change; they were
 * data/game-questions.ts until 7 Oct 2026, with a fallback to the mock-exam
 * questions for a subject that had none (every such subject has a pool now).
 *
 * The stored id is dropped: a Battle FREEZES the questions it drew onto the
 * competition row (lib/competitions.ts), so an edit to the pool reaches new
 * Battles only, and nothing downstream reads an id.
 *
 * ONE TEXT, shown whatever the app's language: content is Khmer (English for
 * the English subject) and is never translated. ExamQuestion keeps its
 * { en, km } pair because the mock exam and placement test share it, so the
 * one text fills both. A version from before 20261007000002 still holds a
 * pair; its Khmer is used.
 */
export function toGameQuestions(body: readonly GameQuestionBody[]): ExamQuestion[] {
  return body.map((g) => ({
    q: { en: oneText(g.q), km: oneText(g.q) },
    options: [...g.options],
    correct: g.correct,
    ...(g.difficulty ? { difficulty: g.difficulty } : {}),
    ...(g.explanation ? { explanation: g.explanation } : {}),
  }));
}

function oneText(q: unknown): string {
  if (typeof q === "string") return q;
  if (typeof q === "object" && q !== null && typeof (q as { km?: unknown }).km === "string") {
    return (q as { km: string }).km;
  }
  return "";
}

export interface GameSubject {
  subject: SubjectMeta;
  /** Questions in the subject's published pool. 0 means the tile is dimmed
   *  and not tappable: playability is DERIVED from content existing. */
  count: number;
}

/**
 * One card per subject, built from the catalog rather than from what has
 * content — 7 cards, not 8, since allSubjects() drops the language the student
 * didn't choose. The counts come from the manifest, so this downloads no pool.
 *
 * Filtering to subjects that HAVE questions could render zero cards, and zero
 * cards is not a screen. Same reasoning as papersForYear().
 */
export function gameSubjects(
  userLanguage: string | undefined,
  manifest: ContentManifest
): GameSubject[] {
  return allSubjects(userLanguage).map((subject) => ({
    subject,
    count: gameCount(manifest, subject.id),
  }));
}

/** One side of a comparison: what they scored and how long they took. */
export interface Run {
  score: number;
  ms: number;
}

/** How a match ended, from the student's side. */
export type MatchOutcome = "win" | "loss" | "draw";

/**
 * DERIVED from the two runs, never stored beside them.
 *
 * Same rule as sessionStatus() and levelForCount(): a status
 * kept alongside the numbers it describes is a second copy waiting to disagree
 * with them. (ExamResult.pct is stored and derivable, but it predates the rule —
 * don't propagate it.)
 *
 * SPEED BREAKS TIES, which is why this takes runs rather than two bare numbers.
 * With a handful of questions a draw is the likeliest outcome of all, and "you
 * both got 4" is a flat thing to show someone who just raced. Time is already
 * being recorded for the competition's own clock, so the tie-break costs nothing
 * and is the fairer reading: same answers, less time, better run.
 *
 * A genuine draw — same score AND the same millisecond — is still possible and
 * still reported as one. It is just vanishingly rare rather than the common case.
 */
export function outcomeOf(mine: Run, theirs: Run): MatchOutcome {
  if (mine.score !== theirs.score) {
    return mine.score > theirs.score ? "win" : "loss";
  }
  if (mine.ms !== theirs.ms) return mine.ms < theirs.ms ? "win" : "loss";
  return "draw";
}

/**
 * The question set for a new competition, frozen onto it at creation.
 *
 * `rand` IS INJECTED so this stays pure: the caller rolls it inside an event
 * handler, never during render. Math.random() in a render body is a purity
 * violation the React Compiler may memoise around — the rule the streak page's
 * fixed confetti table and the deleted bot planner both existed to honour.
 *
 * An UNTAGGED question passes every difficulty, and "mix" accepts everything.
 * The pool is passed in (the subject's published questions, through
 * toGameQuestions), so this stays pure and downloads nothing.
 *
 * FALLS BACK TO THE UNFILTERED POOL rather than returning nothing when a
 * difficulty matches no question. An empty set would post a competition nobody
 * can play, which is worse than one whose questions are easier than advertised —
 * and the create screen cannot know how a future tagged pool is distributed.
 */
export function pickQuestions(
  pool: readonly ExamQuestion[],
  difficulty: GameDifficulty,
  rand: () => number = Math.random
): ExamQuestion[] {
  const matching =
    difficulty === "mix"
      ? pool
      : pool.filter((q) => !q.difficulty || q.difficulty === difficulty);
  const chosen = matching.length > 0 ? matching : pool;

  // Fisher-Yates on a COPY: the pool is module-level shared data, and shuffling
  // it in place would reorder it for every other reader.
  const shuffled = [...chosen];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, MATCH_QUESTIONS);
}

/** Win/loss/draw across this student's attempts, plus the bar segments. */
export interface GameStats {
  played: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  winPct: number;
  drawPct: number;
  lossPct: number;
}

/**
 * One finished match, from THIS student's side, whichever side they were on.
 *
 * Every match is one joiner against one creator, so a student is in a match in
 * two ways: they JOINED someone else's competition (a CompetitionAttempt, on
 * this device), or someone joined THEIRS (a JoinerAttempt, fetched by
 * joiner-results.ts). The hub's history, stats and hero card all read this one
 * shape so the two cannot be counted differently in different places.
 */
export interface MatchRow {
  /** Unique per match: a student has one attempt per competition. */
  key: string;
  competitionId: string;
  subject: string;
  total: number;
  myScore: number;
  myMs: number;
  opponentName: string;
  opponentSeed: string;
  opponentScore: number;
  opponentMs: number;
  /** When the match was decided: the joiner's run, whoever the joiner was. */
  playedAt: string;
  /** Someone else played THIS student's competition. Its review opens on them. */
  asCreator: boolean;
  /** The joiner's account id when asCreator, for the review's preselection. */
  joinerId: string | null;
}

/**
 * Every match this student has been in, NEWEST FIRST.
 *
 * A joiner row whose competition is no longer on this device is skipped: its
 * subject, total and the creator's own run all live on that local row, and a
 * half-empty match is worse than a missing one.
 */
export function matchRows(
  attempts: CompetitionAttempt[],
  competitions: Competition[],
  joiners: JoinerAttempt[]
): MatchRow[] {
  const rows: MatchRow[] = attempts.map((a) => ({
    key: `a-${a.id}`,
    competitionId: a.competitionId,
    subject: a.subject,
    total: a.total,
    myScore: a.score,
    myMs: a.ms,
    opponentName: a.opponentName,
    // opponentId is optional: attempts recorded before it existed fall back to
    // the name, which is stable enough to tell two classmates apart.
    opponentSeed: avatarSeedFor(a.opponentId ?? a.opponentName),
    opponentScore: a.opponentScore,
    opponentMs: a.opponentMs,
    playedAt: a.playedAt,
    asCreator: false,
    joinerId: null,
  }));
  const mine = new Map(competitions.map((c) => [c.id, c]));
  for (const j of joiners) {
    const c = mine.get(j.competitionId);
    if (!c) continue;
    rows.push({
      key: `j-${j.competitionId}-${j.userId}`,
      competitionId: c.id,
      subject: c.subject,
      total: c.total,
      myScore: c.creatorScore,
      myMs: c.creatorMs,
      opponentName: j.userName,
      opponentSeed: avatarSeedFor(j.userId),
      opponentScore: j.score,
      opponentMs: j.ms,
      playedAt: j.playedAt,
      asCreator: true,
      joinerId: j.userId,
    });
  }
  // ISO timestamps sort as strings.
  return rows.sort((x, y) => (x.playedAt < y.playedAt ? 1 : x.playedAt > y.playedAt ? -1 : 0));
}

/** The outcome of one match, from this student's side. */
export function rowOutcome(r: MatchRow): MatchOutcome {
  return outcomeOf(
    { score: r.myScore, ms: r.myMs },
    { score: r.opponentScore, ms: r.opponentMs }
  );
}

/**
 * DERIVED from the matches themselves, never stored. Both kinds count: a joiner
 * beating this student's competition is a loss for them exactly as losing at
 * someone else's is.
 *
 * The card this feeds used to carry seven hand-authored numbers, and they
 * disagreed: `winRate: 75` sat beside bar segments describing a 69% win share.
 * Two copies of one fact, exactly what levelForCount() and sessionStatus() exist
 * to prevent.
 *
 * TWO ROUNDS PLUS A REMAINDER, not three independent ones. Rounding each of the
 * three shares separately lets them sum to 101, and the bar then overflows its
 * own track by a pixel at some ratios — the kind of thing that only shows up
 * with real data at one particular win count.
 *
 * winRate is 0 when nothing has been played, because the alternative is a
 * division by zero rendered on screen as "NaN%".
 */
export function gameStats(rows: MatchRow[]): GameStats {
  let wins = 0;
  let losses = 0;
  let draws = 0;
  for (const r of rows) {
    const outcome = rowOutcome(r);
    if (outcome === "win") wins++;
    else if (outcome === "loss") losses++;
    else draws++;
  }

  const played = rows.length;
  if (played === 0) {
    return {
      played: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      winPct: 0,
      drawPct: 0,
      lossPct: 0,
    };
  }

  const winPct = Math.round((wins / played) * 100);
  const drawPct = Math.round((draws / played) * 100);
  return {
    played,
    wins,
    losses,
    draws,
    winRate: winPct,
    winPct,
    drawPct,
    lossPct: 100 - winPct - drawPct,
  };
}

/**
 * This student's attempt at a given competition, or undefined.
 *
 * ONE ATTEMPT PER COMPETITION IS THE PRODUCT RULE — replaying until you beat the
 * creator would make the score meaningless, which is why the database carries
 * unique (competition_id, user_id). This is how the UI agrees with that rule
 * instead of offering a Play button that leads nowhere useful.
 *
 * Pure, and takes the list as an argument like every other query in this file,
 * so it can be called from a component or a page without reaching into the
 * store.
 */
export function attemptFor(
  attempts: CompetitionAttempt[],
  competitionId: string
): CompetitionAttempt | undefined {
  return attempts.find((a) => a.competitionId === competitionId);
}

/**
 * Chip colours per outcome, shared by the browse list and the history card so
 * a win cannot be mint in one and yellow in the other. Spelled out rather than
 * assembled at runtime — Tailwind cannot see a class built from a variable.
 */
export const OUTCOME_STYLE: Record<MatchOutcome, string> = {
  win: "bg-mint/15 text-mint",
  loss: "bg-pink/15 text-pink",
  draw: "bg-yellow/15 text-yellow",
};
