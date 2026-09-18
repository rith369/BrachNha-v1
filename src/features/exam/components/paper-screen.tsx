import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore, type PaperResult } from "@/lib/store";
import type { PastPaper } from "../papers";
import { paperResultsFor, type PaperAnswers } from "../paper-scoring";
import { PaperDetail } from "./paper-detail";
import { PastPaperRunner, type PaperAttempt } from "./past-paper-runner";
import { PastPaperResults } from "./past-paper-results";

/** Which of the paper's three screens is on. */
type Mode =
  | { kind: "detail" }
  | { kind: "run" }
  | { kind: "result"; answers: PaperAnswers; ms: number; leaves?: number };

/**
 * One paper, end to end: its detail screen, the run, and the review — the whole
 * of `/exam/subjects/:paperKey`.
 *
 * IT OWNS THE REWARDS, which used to live in exam-view.tsx's handlePaperSubmit.
 * The rules are unchanged and still the ones CLAUDE.md records: XP,
 * recordQuestions/recordSession for the content log, and deliberately NOT
 * addExamResult — that array captions Home's "from mock exams" pill and feeds
 * chat-prompt.ts an average it states to KruAI as fact, so a MoEYS past paper in
 * it would make both wrong.
 *
 * WHAT IS NEW IS `addPaperResult`. A past paper finally has a history of its
 * own, which is exactly the "separate persisted field, not a widening of
 * examResults" this file's predecessor promised. It stores the answers as well
 * as the score, so a row in that history reopens the real review rather than a
 * remembered percentage.
 *
 * THE THREE SCREENS ARE ONE ROUTE, not three. A run cannot be linked to — it
 * only exists while its clock is running — and a review belongs to an attempt
 * rather than to a URL. What the phone's back button steps through is
 * detail → the tab list, which is the boundary that matters.
 */
export function PaperScreen({ paper }: { paper: PastPaper }) {
  const { addXp, addPaperResult, recordQuestions, recordSession, results } =
    useBrachNhaStore(
      useShallow((s) => ({
        addXp: s.addXp,
        addPaperResult: s.addPaperResult,
        recordQuestions: s.recordQuestions,
        recordSession: s.recordSession,
        results: s.paperResults,
      }))
    );

  const [mode, setMode] = useState<Mode>({ kind: "detail" });

  function handleSubmit(attempt: PaperAttempt) {
    // XP for the attempt, on the same 20-per-correct rule every other exam
    // pays — the effort is the same whoever wrote the questions.
    addXp(attempt.score * 20);
    recordQuestions(paper.subject.id, attempt.total, attempt.score);
    recordSession(paper.subject.id);
    addPaperResult({
      paperKey: paper.key,
      score: attempt.score,
      total: attempt.total,
      pct: attempt.pct,
      ms: attempt.ms,
      answers: attempt.answers,
      leaves: attempt.leaves,
    });
    setMode({
      kind: "result",
      answers: attempt.answers,
      ms: attempt.ms,
      leaves: attempt.leaves,
    });
  }

  function openResult(result: PaperResult) {
    setMode({
      kind: "result",
      answers: result.answers,
      ms: result.ms,
      leaves: result.leaves,
    });
  }

  // The route guarantees it; the guard keeps the type honest.
  if (!paper.content) return null;
  const content = paper.content;

  // A question is on screen. No scroller here: FocusLayout brings its own, and
  // nesting two makes every touch drag pay a scroll-chaining resolution first.
  if (mode.kind === "run") {
    return (
      <div className="min-h-0 flex-1">
        <PastPaperRunner
          content={content}
          kicker={paper.title}
          onExit={() => setMode({ kind: "detail" })}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8">
      <div className="mx-auto w-full max-w-2xl">
        {mode.kind === "result" ? (
          <PastPaperResults
            content={content}
            answers={mode.answers}
            ms={mode.ms}
            leaves={mode.leaves}
            title={paper.title}
            onRetake={() => setMode({ kind: "run" })}
            onBack={() => setMode({ kind: "detail" })}
          />
        ) : (
          <PaperDetail
            paper={paper}
            results={paperResultsFor(results, paper.key)}
            onStart={() => setMode({ kind: "run" })}
            onOpenResult={openResult}
          />
        )}
      </div>
    </div>
  );
}
