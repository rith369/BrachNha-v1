import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { useBrachNhaStore, type ExamResult } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { UnderlineTabs } from "@/components/ui/underline-tabs";
import { EXAM_TABS, type ExamPaper, type ExamTab } from "../papers";
import { ExamRunner, type ExamScore } from "./exam-runner";
import { ExamResults } from "./exam-results";
import { GeneratedPapersPanel } from "./generated-papers-panel";
import { PastPapersPanel } from "./past-papers-panel";

/**
 * A generated paper being answered. Tab B stopped being one fixed mixed-subject
 * test the moment it became a per-subject card list, so a run needs to know
 * WHICH subject's paper it is — see generatedPapers() in ../papers.
 *
 * REAL PAST PAPERS ARE NOT RUN HERE ANY MORE. Tapping one opens its own screen
 * at /exam/subjects/:paperKey (pages/exam-paper.tsx), which shows what the paper
 * is and its history before anything starts a 60-minute clock.
 */
type Run = { kind: "generated"; paper: ExamPaper };

/**
 * The /exam/subjects screen: two tabs over one exam catalog, plus the runner
 * and results that both tabs share. Reached from the chooser at /exam
 * (exam-hub.tsx), which is why it carries a back link up to it.
 *
 * KHMER-ONLY, on purpose. See EXAM_PAGE_LANG in ../papers for the why and for
 * the two carve-outs it does NOT cover.
 *
 * Title left with pr-14 on the header, because TopBar's floating hamburger
 * already owns `absolute top-3 right-4`.
 *
 * THIS COMPONENT OWNS ITS OWN FRAME, unlike the Study page where lessons.tsx
 * supplies the padding. That is deliberate: the two branches need different
 * frames — the tabbed and results screens want a padded scroller, while the
 * runner brings FocusLayout's own and must not be nested inside a second one.
 */
export function ExamView() {
  const { addXp, addExamResult, recordQuestions, recordSession } =
    useBrachNhaStore(
      useShallow((s) => ({
        addXp: s.addXp,
        addExamResult: s.addExamResult,
        recordQuestions: s.recordQuestions,
        recordSession: s.recordSession,
      }))
    );

  const navigate = useNavigate();

  const [tab, setTab] = useState<ExamTab>("past");
  const [run, setRun] = useState<Run | null>(null);
  const [finished, setFinished] = useState<
    { run: Run; result: ExamResult } | null
  >(null);
  function handleSubmit(score: ExamScore) {
    const subject = run?.paper.subject.id;
    const result: ExamResult = {
      ...score,
      date: new Date().toISOString(),
      subject,
    };

    // XP for both kinds: it is the app's effort currency, and withholding it
    // from the harder artefact would be backwards.
    addXp(score.score * 20);

    // BOTH KINDS ARE RECORDED HERE, unlike examResults below — and that
    // asymmetry is deliberate rather than an oversight. examResults captions
    // Home's "from mock exams" pill and feeds chat-prompt.ts an average it
    // states to KruAI as fact, so a past paper in it would make those two
    // wrong. The content log has no such caption to break, and a past paper is
    // unambiguously questions this student answered. Don't "fix" the mismatch.
    if (subject) {
      recordQuestions(subject, score.total, score.score);
      recordSession(subject);
    }

    // Only a GENERATED paper reaches examResults — which is now every run this
    // component owns, since real past papers moved to their own screen. The
    // rule it encodes has not changed: that array captions Home's "from mock
    // exams" pill and feeds chat-prompt.ts's average, and a real MoEYS paper is
    // the opposite end of that spectrum. A past-paper attempt lands in
    // `paperResults` instead — the separate persisted field this comment used
    // to ask for. See features/exam/components/paper-screen.tsx.
    addExamResult(result);

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
          questions={run.paper.questions}
          kicker={run.paper.subject.name}
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
            {/* Up to the /exam chooser. A Link, not navigate(-1): history could
                have come from anywhere, and this always means "up one level" —
                same call practice-lesson-list.tsx makes. */}
            <Link
              to="/exam"
              className="mb-3 inline-flex items-center gap-1 text-xs font-extrabold text-muted transition hover:text-text md:text-sm"
            >
              <ChevronLeft className="size-4 shrink-0" strokeWidth={2.5} />
              វិញ្ញាសារត្រៀមប្រឡង
            </Link>

            <div className="font-heading mb-4 bg-brand-tri bg-clip-text pr-14 text-xl font-extrabold text-transparent">
              វិញ្ញាសារតាមមុខវិជ្ជា
            </div>

            <UnderlineTabs tabs={EXAM_TABS} value={tab} onChange={setTab} />

            {tab === "past" ? (
              // A real paper OPENS ITS OWN SCREEN rather than starting here —
              // the detail and history live at /exam/subjects/:paperKey, and
              // nothing starts a 60-minute clock on the tap that opened a card.
              <PastPapersPanel
                onStartPaper={(paper) => navigate(`/exam/subjects/${paper.key}`)}
              />
            ) : (
              <GeneratedPapersPanel
                onStartPaper={(paper) => setRun({ kind: "generated", paper })}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
