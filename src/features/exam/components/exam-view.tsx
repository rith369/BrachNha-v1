import { useState } from "react";
import { useBrachNhaStore, type ExamResult } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { UnderlineTabs } from "@/components/ui/underline-tabs";
import { MOCK_QS } from "@/data/questions";
import { EXAM_TABS, type ExamTab, type PastPaper } from "../papers";
import { ExamRunner, type ExamScore } from "./exam-runner";
import { ExamResults } from "./exam-results";
import { GeneratedExamPanel } from "./generated-exam-panel";
import { PastPapersPanel } from "./past-papers-panel";

/** Which kind of attempt is in flight. The distinction outlives the run, because
 *  it also decides what Retake restarts. */
type Run = { kind: "generated" } | { kind: "past"; paper: PastPaper };

/**
 * The /exam screen: two tabs over one exam catalog, plus the runner and results
 * that both tabs share.
 *
 * KHMER-ONLY, on purpose. See EXAM_PAGE_LANG in ../papers for the why and for
 * the two carve-outs it does NOT cover.
 *
 * Two departures from the reference design, both because this is a bottom-nav
 * tab inside existing app chrome rather than a standalone screen — the same two
 * the Study page makes:
 *
 *  - No back arrow. You do not "go back" from a tab; BottomNav is how you leave.
 *  - Title left with pr-14 on the header, because TopBar's floating hamburger
 *    already owns `absolute top-3 right-4`.
 *
 * THIS COMPONENT OWNS ITS OWN FRAME, unlike the Study page where lessons.tsx
 * supplies the padding. That is deliberate: the two branches need different
 * frames — the tabbed and results screens want a padded scroller, while the
 * runner brings FocusLayout's own and must not be nested inside a second one.
 */
export function ExamView() {
  const { addXp, addExamResult } = useBrachNhaStore(
    useShallow((s) => ({ addXp: s.addXp, addExamResult: s.addExamResult }))
  );

  const [tab, setTab] = useState<ExamTab>("past");
  const [run, setRun] = useState<Run | null>(null);
  const [finished, setFinished] = useState<
    { run: Run; result: ExamResult } | null
  >(null);

  function handleSubmit(score: ExamScore) {
    const result: ExamResult = { ...score, date: new Date().toISOString() };

    // XP for both kinds: it is the app's effort currency, and withholding it
    // from the harder artefact would be backwards.
    addXp(score.score * 20);

    // But a PAST-PAPER attempt deliberately does NOT go into examResults. That
    // array captions Home's stat pill "from mock exams", feeds chat-prompt.ts's
    // "average mock-exam percentage" to KruAI as a fact about the student, and
    // is rendered UNFILTERED by Tab B's Previous Results list — so a past-paper
    // attempt would show up under the wrong tab on this very screen. Same rule
    // that already keeps placement-test attempts out.
    //
    // When past papers get a history of their own it should be a SEPARATE
    // persisted field, not a widening of this one.
    if (run?.kind === "generated") addExamResult(result);

    if (run) setFinished({ run, result });
    setRun(null);
  }

  // A question is on screen. No overflow-y-auto here: FocusLayout has its own
  // scroller, and nesting two means every touch drag pays a scroll-chaining
  // resolution before anything moves. min-h-0 flex-1 is what gives FocusLayout's
  // h-full a definite height to resolve against.
  if (run) {
    return (
      <div className="min-h-0 flex-1">
        <ExamRunner
          questions={run.kind === "past" ? run.paper.questions : MOCK_QS}
          kicker={run.kind === "past" ? run.paper.subject.name : undefined}
          onExit={() => setRun(null)}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8">
      <div className="mx-auto w-full max-w-2xl">
        {finished ? (
          <ExamResults
            result={finished.result}
            onRetake={() => {
              setRun(finished.run);
              setFinished(null);
            }}
            onBack={() => setFinished(null)}
          />
        ) : (
          <>
            <div className="font-heading mb-4 bg-brand-tri bg-clip-text pr-14 text-xl font-extrabold text-transparent">
              វិញ្ញាសារត្រៀមប្រឡងបាក់ឌុប
            </div>

            <UnderlineTabs tabs={EXAM_TABS} value={tab} onChange={setTab} />

            {tab === "past" ? (
              <PastPapersPanel
                onStartPaper={(paper) => setRun({ kind: "past", paper })}
              />
            ) : (
              <GeneratedExamPanel
                onStart={() => setRun({ kind: "generated" })}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
