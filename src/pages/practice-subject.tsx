import { Navigate, useParams } from "react-router";
import { PracticeLessonList } from "@/features/practice/components/practice-lesson-list";
import { QuizPathView } from "@/features/practice/components/quiz-path-view";
import { findSubject } from "@/features/lessons/subjects";
import { isQuizSubjectActive, parseMode } from "@/features/practice/practice";
import { quizPathShape } from "@/features/practice/quiz-path";
import { ContentNotice } from "@/features/practice/components/content-waiting";
import { BottomNav } from "@/components/shell/bottom-nav";
import { retryContent, useContentManifest } from "@/lib/content";

/**
 * `/practice/:mode/:subjectId` — one subject's lessons, for one mode.
 *
 * An unknown mode or subject redirects to the hub rather than rendering an
 * error: this is only reachable by a hand-typed URL or a stale link, and there
 * is a perfectly good page one level up. Same call pages/subject-path.tsx makes.
 *
 * Deliberately NOT a focus route. The student is choosing what to do, not
 * mid-task, so the navigation stays — exactly as /subjects/:subjectId does.
 *
 * TWO RENDERINGS FOR THE SAME ROUTE SHAPE. Quiz mode checks quizPathShape() and,
 * when it has an entry, renders the Mimo-style QuizPathView instead of the
 * ordinary PracticeLessonList row list — today that is math and physics (see
 * quiz-path.ts). Every other subject, and Flashcard
 * mode on every subject including physics, keeps the plain list. That check lives
 * here rather than inside PracticeLessonList so the two stay two components,
 * not one branching on a mode it otherwise has no reason to know about.
 */
export default function PracticeSubjectPage() {
  const { mode, subjectId } = useParams<{ mode: string; subjectId: string }>();
  // What is published decides which rows and nodes open. On a returning device
  // it is already stored, so this is only ever "loading" on a first open.
  const manifest = useContentManifest();
  const parsed = parseMode(mode);
  const subject = findSubject(subjectId);

  if (!parsed || !subject) return <Navigate to="/practice" replace />;

  // Only active quiz subjects (math) are accessible in Quiz mode.
  if (parsed === "quiz" && !isQuizSubjectActive(subject.id)) {
    return <Navigate to="/practice" replace />;
  }

  const showPath = parsed === "quiz" && quizPathShape(subject.id) !== null;

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8 md:px-6 lg:px-8">
        {manifest.status !== "ready" ? (
          <ContentNotice
            state={manifest.status === "failed" ? "offline" : "loading"}
            onRetry={retryContent}
          />
        ) : showPath ? (
          <QuizPathView subject={subject} manifest={manifest} />
        ) : (
          <PracticeLessonList subject={subject} mode={parsed} manifest={manifest} />
        )}
      </div>
      <BottomNav />
    </div>
  );
}
