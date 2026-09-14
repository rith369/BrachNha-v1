import { GAME_QUESTIONS } from "@/data/game-questions";
import { GENERATED_EXAM_QUESTIONS } from "@/data/generated-exams";
import { allSubjects, type SubjectId, type SubjectMeta } from "@/features/lessons/subjects";
import type {
  CompetitionAttempt,
  ExamQuestion,
  GameDifficulty,
} from "@/types";

/**
 * The most questions a match will ask. A CEILING, never a target — a subject
 * with fewer plays what it has, and nothing pads or repeats to reach this
 * number. Padding would invent content, which is the one thing the empty-record
 * discipline in data/game-questions.ts exists to prevent.
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
  { id: "easy", label: { en: "Easy", km: "ងាយ" } },
  { id: "medium", label: { en: "Medium", km: "មធ្យម" } },
  { id: "hard", label: { en: "Hard", km: "ពិបាក" } },
  { id: "mix", label: { en: "Mix", km: "ចម្រុះ" } },
];

/**
 * A subject's match questions.
 *
 * THE FALLBACK IS THE ONE JUDGEMENT CALL IN THIS FILE, and deleting one `??`
 * clause reverses it. GAME_QUESTIONS is empty today, so without it every card on
 * /game would be dimmed and nothing would be playable at all — which is a state
 * /practice deliberately shipped in, so it would be defensible. Against that:
 * MOCK_QS already holds 5 real math and 5 real biology questions that students
 * are shown elsewhere in the app, and this is the same argument
 * data/generated-exams.ts makes for deriving from them ("retiring the old UI
 * must not also retire the only way a student could take any exam here"). It is
 * also what gives scripts/shots.mjs a real match to photograph.
 *
 * An authored GAME_QUESTIONS entry replaces the fallback for that subject
 * wholesale — it is not merged with it.
 */
export function gameQuestionsFor(id: SubjectId): ExamQuestion[] {
  return (GAME_QUESTIONS[id] ?? GENERATED_EXAM_QUESTIONS[id] ?? []).slice(
    0,
    MATCH_QUESTIONS
  );
}

export interface GameSubject {
  subject: SubjectMeta;
  /** Empty means the tile is dimmed and not tappable — playability is DERIVED
   *  from content existing, never authored beside it. */
  questions: ExamQuestion[];
}

/**
 * One card per subject, built from the catalog rather than from what has
 * content — 7 cards, not 8, since allSubjects() drops the language the student
 * didn't choose.
 *
 * Filtering to subjects that HAVE questions would render zero cards today, and
 * zero cards is not a screen. Same reasoning as papersForYear().
 */
export function gameSubjects(userLanguage: string | undefined): GameSubject[] {
  return allSubjects(userLanguage).map((subject) => ({
    subject,
    questions: gameQuestionsFor(subject.id),
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
 * Same rule as sessionStatus(), levelForCount() and lessonCountFor(): a status
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
 * Today no question carries a difficulty at all, so every filter is a no-op and
 * a competition is a shuffled slice of the subject's pool — the accepted
 * prototype behaviour, not a bug. Tagging content later starts the filter
 * working with no code change here.
 *
 * FALLS BACK TO THE UNFILTERED POOL rather than returning nothing when a
 * difficulty matches no question. An empty set would post a competition nobody
 * can play, which is worse than one whose questions are easier than advertised —
 * and the create screen cannot know how a future tagged pool is distributed.
 */
export function pickQuestions(
  id: SubjectId,
  difficulty: GameDifficulty,
  rand: () => number = Math.random
): ExamQuestion[] {
  const pool = gameQuestionsFor(id);
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
 * DERIVED from the attempts themselves, never stored.
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
export function gameStats(attempts: CompetitionAttempt[]): GameStats {
  let wins = 0;
  let losses = 0;
  let draws = 0;
  for (const a of attempts) {
    const outcome = outcomeOf(
      { score: a.score, ms: a.ms },
      { score: a.opponentScore, ms: a.opponentMs }
    );
    if (outcome === "win") wins++;
    else if (outcome === "loss") losses++;
    else draws++;
  }

  const played = attempts.length;
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
