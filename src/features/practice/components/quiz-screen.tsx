import { useState } from "react";
import { useNavigate } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore, type QuizResult } from "@/lib/store";
import type { SectionQuestion } from "@/types";
import { lessonKeyOf } from "@/features/progress/content-keys";
import { quizSessionId } from "../quiz-path";
import { QuizDetail } from "./quiz-detail";
import { QuizResults } from "./quiz-results";
import { QuizRunner, type QuizAttempt } from "./quiz-runner";

/** Which of the section's three screens is on. */
type Mode =
  | { kind: "detail" }
  | { kind: "run" }
  | { kind: "result"; attempt: QuizAttempt };

/**
 * One quiz section, end to end: its detail screen, the sitting, and the review.
 *
 * MODELLED ON PaperScreen, deliberately and almost line for line, because it is
 * the same shape: a thing you can attempt more than once, with a history of
 * attempts and a review that reopens from a stored one. Copying that structure
 * is what keeps the two from drifting into two different ideas of what an
 * attempt is.
 *
 * THE THREE SCREENS ARE ONE ROUTE, not three. A sitting cannot be linked to and
 * a review belongs to an attempt rather than to a URL. What the phone's back
 * button steps through is detail → the path, which is the boundary that matters.
 *
 * IT OWNS WHAT THE ATTEMPT COUNTS AS, which used to be scattered through
 * QuizRunner's `finish()`. Per-question XP still belongs to the runner, paid as
 * each answer lands — that is what makes this practice rather than a test — but
 * the daily task, the content-log session, the path node and the history row all
 * belong to the SITTING, so one place decides them.
 *
 * KHMER-ONLY. See PRACTICE_PAGE_LANG in ../practice.
 */
export function QuizScreen({
  questions,
  subjectId,
  contentKey,
  title,
}: {
  questions: SectionQuestion[];
  subjectId: string;
  /** The content key — `"math-1-1-1"`, what PRACTICE_QUIZZES is keyed by and
   *  what this section's history rows are filed under. */
  contentKey: string;
  /** What this section is called, for the detail and review headings. */
  title: string;
}) {
  const navigate = useNavigate();
  const { addQuizResult, completeSession, completeTask, recordSession, results } =
    useBrachNhaStore(
      useShallow((s) => ({
        addQuizResult: s.addQuizResult,
        completeSession: s.completeSession,
        completeTask: s.completeTask,
        recordSession: s.recordSession,
        results: s.quizResults,
      }))
    );

  const [mode, setMode] = useState<Mode>({ kind: "detail" });

  // Newest first, and only this section's. Derived on every render rather than
  // held in state, so an attempt finished a moment ago is already in the list
  // behind the review.
  const history = results
    .filter((r) => r.quizKey === contentKey)
    .slice()
    .reverse();

  function exit() {
    navigate(`/practice/quiz/${subjectId}`);
  }

  function handleSubmit(attempt: QuizAttempt) {
    // The SAME `tasks.practice` field Home's daily checklist and Roadmap's
    // Daily Mission read, so a finished quiz is one real completion rather than
    // a second tracker beside the self-reported one.
    completeTask("practice");
    // lessonKeyOf, because contentKey is a SECTION key here — the quiz path
    // routes at `math-1-1-1`, three numbers, where every other writer in the app
    // holds a lesson key. The content log's documented grain is the lesson.
    recordSession(lessonKeyOf(contentKey));
    // Ticks this section's node on the quiz path, which derives every status
    // from completedSessions rather than authoring one. quizSessionId() rather
    // than the bare key because that path shares one progress list with the
    // Study path, whose section ids ARE the bare keys — the prefix is what keeps
    // a foundation-review section from ticking a Bac II quiz node.
    completeSession(quizSessionId(contentKey));
    addQuizResult({
      quizKey: contentKey,
      score: attempt.score,
      total: attempt.total,
      pct: attempt.pct,
      ms: attempt.ms,
      questionMs: attempt.questionMs,
      answers: attempt.answers,
    });
    setMode({ kind: "result", attempt });
  }

  /** Reopen a stored attempt — the review re-marks from the questions, so an
   *  old row gives back the real explanations rather than a percentage. */
  function openResult(result: QuizResult) {
    setMode({
      kind: "result",
      attempt: {
        score: result.score,
        total: result.total,
        pct: result.pct,
        ms: result.ms,
        questionMs: result.questionMs,
        answers: result.answers,
      },
    });
  }

  if (mode.kind === "run") {
    return (
      <QuizRunner
        questions={questions}
        subjectId={subjectId}
        contentKey={contentKey}
        mode="quiz"
        onSubmit={handleSubmit}
      />
    );
  }

  if (mode.kind === "result") {
    return (
      <QuizResults
        questions={questions}
        attempt={mode.attempt}
        title={title}
        onRetake={() => setMode({ kind: "run" })}
        onBack={exit}
      />
    );
  }

  return (
    <QuizDetail
      questions={questions}
      title={title}
      history={history}
      onStart={() => setMode({ kind: "run" })}
      onOpenResult={openResult}
      onExit={exit}
    />
  );
}
