import { useBrachNhaStore } from "@/lib/store";
import { track } from "@/lib/telemetry";
import type { SubjectId } from "@/features/lessons/subjects";
import type { PaperAttempt } from "./components/past-paper-runner";

/**
 * What a finished past paper counts as, wherever it was sat: on its own screen
 * (paper-screen.tsx) or as a session of the Simulation (simulation-sit.tsx).
 *
 * XP, the content log and the paper's own history, and deliberately NOT
 * addExamResult: that array captions Home's old "from mock exams" figure and feeds
 * chat-prompt.ts an average it states to KruAI as fact, so a MoEYS past paper in
 * it would make both wrong.
 */
export function recordPaperAttempt(
  paper: { key: string; subjectId: SubjectId; version: number },
  attempt: PaperAttempt
): void {
  const store = useBrachNhaStore.getState();
  // XP for the attempt, on the same 20-per-correct rule every other exam pays:
  // the effort is the same whoever wrote the questions.
  store.addXp(attempt.score * 20);
  store.recordQuestions(paper.subjectId, attempt.total, attempt.score);
  store.recordSession(paper.subjectId);
  // A finished paper counts as the daily challenge, beside a Game battle. See
  // pages/game-create.tsx.
  store.completeTask("challenge");
  track("exam_done", {
    kind: "paper",
    paper: paper.key,
    score: attempt.score,
    total: attempt.total,
  });
  store.addPaperResult({
    paperKey: paper.key,
    version: paper.version,
    score: attempt.score,
    total: attempt.total,
    pct: attempt.pct,
    ms: attempt.ms,
    answers: attempt.answers,
    leaves: attempt.leaves,
  });
}
