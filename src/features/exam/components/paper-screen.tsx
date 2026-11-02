import { useState } from "react";
import { useBrachNhaStore, type PaperResult } from "@/lib/store";
import type { ReactNode } from "react";
import type { PastPaperContent } from "@/types";
import { retryBody, useContentBody } from "@/lib/content";
import { ContentNotice } from "@/features/practice/components/content-waiting";
import { toPastPaperContent, type PastPaper } from "../papers";
import { paperResultsFor, type PaperAnswers } from "../paper-scoring";
import { recordPaperAttempt } from "../record-paper-attempt";
import { PaperDetail } from "./paper-detail";
import { PastPaperRunner, type PaperAttempt } from "./past-paper-runner";
import { PastPaperResults } from "./past-paper-results";

/** Which of the paper's three screens is on. A result carries the VERSION it
 *  was sat on, which may be older than the one published now. */
type Mode =
  | { kind: "detail" }
  | { kind: "run" }
  | { kind: "result"; answers: PaperAnswers; ms: number; leaves?: number; version: number };

/**
 * The review of an attempt sat on an OLDER version of this paper. Answers are
 * keyed by question id, so they still mark correctly, but the explanations and
 * any fixed answer are the old version's, which is what the student had. That
 * version is downloaded (once; versions never change) and reviewed against.
 */
function OlderVersionReview({
  paperKey,
  version,
  fallback,
  render,
}: {
  paperKey: string;
  version: number;
  /** Today's paper, used only if the old version cannot be found. */
  fallback: PastPaperContent;
  render: (content: PastPaperContent) => ReactNode;
}) {
  const old = useContentBody("paper", paperKey, version);
  if (old.status === "loading" || old.status === "offline") {
    return (
      <ContentNotice
        state={old.status}
        onRetry={() => retryBody("paper", paperKey, version)}
      />
    );
  }
  return <>{render(old.status === "ready" ? toPastPaperContent(old.body) : fallback)}</>;
}

/**
 * One paper, end to end: its detail screen, the run, and the review — the whole
 * of `/exam/subjects/:paperKey`.
 *
 * What a finished attempt counts as is record-paper-attempt.ts, shared with the
 * Simulation. A paper's history stores the answers as well as the score, so a row
 * in it reopens the real review rather than a remembered percentage.
 *
 * THE THREE SCREENS ARE ONE ROUTE, not three. A run cannot be linked to — it
 * only exists while its clock is running — and a review belongs to an attempt
 * rather than to a URL. What the phone's back button steps through is
 * detail → the tab list, which is the boundary that matters.
 */
export function PaperScreen({ paper }: { paper: PastPaper }) {
  const results = useBrachNhaStore((s) => s.paperResults);

  const [mode, setMode] = useState<Mode>({ kind: "detail" });

  function handleSubmit(attempt: PaperAttempt) {
    recordPaperAttempt(
      { key: paper.key, subjectId: paper.subject.id, version: paper.version ?? 1 },
      attempt
    );
    setMode({
      kind: "result",
      answers: attempt.answers,
      ms: attempt.ms,
      leaves: attempt.leaves,
      version: paper.version ?? 1,
    });
  }

  function openResult(result: PaperResult) {
    setMode({
      kind: "result",
      answers: result.answers,
      ms: result.ms,
      leaves: result.leaves,
      version: result.version ?? 1,
    });
  }

  // The route guarantees it; the guard keeps the type honest.
  if (!paper.content) return null;
  const content = paper.content;

  /** The review, against the content the attempt was sat on. */
  function renderReview(sat: PastPaperContent, r: Extract<Mode, { kind: "result" }>) {
    return (
      <PastPaperResults
        paperKey={paper.key}
        content={sat}
        answers={r.answers}
        ms={r.ms}
        leaves={r.leaves}
        title={paper.title}
        onRetake={() => setMode({ kind: "run" })}
        onBack={() => setMode({ kind: "detail" })}
      />
    );
  }

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
          mode.version === paper.version ? (
            renderReview(content, mode)
          ) : (
            <OlderVersionReview
              key={mode.version}
              paperKey={paper.key}
              version={mode.version}
              fallback={content}
              render={(sat) => renderReview(sat, mode)}
            />
          )
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
