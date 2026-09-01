import { Navigate, useParams } from "react-router";
import { PracticeLessonList } from "@/features/practice/components/practice-lesson-list";
import { QuizPathView } from "@/features/practice/components/quiz-path-view";
import { findSubject } from "@/features/lessons/subjects";
import { parseMode } from "@/features/practice/practice";
import { quizPathFor } from "@/features/practice/quiz-path";
import { BottomNav } from "@/components/shell/bottom-nav";

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
 * TWO RENDERINGS FOR THE SAME ROUTE SHAPE. Quiz mode checks quizPathFor() and,
 * when it has an entry, renders the Mimo-style QuizPathView instead of the
 * ordinary PracticeLessonList row list — today that is physics only, and it is
 * fixed sample data (see quiz-path.ts). Every other subject, and Flashcard mode
 * on every subject including physics, keeps the plain list. That check lives
 * here rather than inside PracticeLessonList so the two stay two components,
 * not one branching on a mode it otherwise has no reason to know about.
 */
export default function PracticeSubjectPage() {
  const { mode, subjectId } = useParams<{ mode: string; subjectId: string }>();
  const parsed = parseMode(mode);
  const subject = findSubject(subjectId);

  if (!parsed || !subject) return <Navigate to="/practice" replace />;

  const showPath = parsed === "quiz" && quizPathFor(subject.id) !== null;

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8 md:px-6 lg:px-8">
        {showPath ? (
          <QuizPathView subject={subject} />
        ) : (
          <PracticeLessonList subject={subject} mode={parsed} />
        )}
      </div>
      <BottomNav />
    </div>
  );
}
