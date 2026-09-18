import { Navigate, useParams } from "react-router";
import { PaperScreen } from "@/features/exam/components/paper-screen";
import { pastPaperByKey } from "@/features/exam/papers";
import { BottomNav } from "@/components/shell/bottom-nav";

/**
 * `/exam/subjects/:paperKey` — one past paper's detail, run and review.
 *
 * `paperKey` is the key PAST_PAPERS is keyed by, `"{year}-{subjectId}"`, and
 * pastPaperByKey() resolves it into the same object the card list builds, so
 * the paper's own screen cannot be titled differently from the card that opened
 * it. An unknown or contentless key redirects to the tab list rather than
 * erroring: it is only reachable by a typed URL or a stale link, and there is a
 * perfectly good page one level up — the same call pages/practice-subject.tsx
 * and pages/subject-path.tsx make.
 *
 * NOT A FOCUS ROUTE. The detail screen is a place, so the navigation stays; the
 * runner hides it by setting the store's `focusMode` on mount, exactly as the
 * generated-exam runner already does from inside /exam/subjects.
 *
 * The page supplies no scroller — PaperScreen needs a different frame per
 * screen (the runner brings FocusLayout's own and must not be nested inside a
 * second one), the same reason pages/exam-subjects.tsx leaves it to ExamView.
 */
export default function ExamPaperPage() {
  const { paperKey } = useParams<{ paperKey: string }>();
  const paper = pastPaperByKey(paperKey ?? "");

  if (!paper) return <Navigate to="/exam/subjects" replace />;

  return (
    <div className="flex h-full flex-col">
      <PaperScreen paper={paper} />
      <BottomNav />
    </div>
  );
}
