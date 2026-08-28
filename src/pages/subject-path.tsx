import { Navigate, useParams } from "react-router";
import { SubjectPathView } from "@/features/lessons/components/subject-path-view";
import { findSubject } from "@/features/lessons/subjects";
import { BottomNav } from "@/components/shell/bottom-nav";

/**
 * `/subjects/:subjectId` — a subject's session path.
 *
 * Its own top-level route rather than a child of `/lessons`, because
 * `/lessons/:lessonId` already exists and a lesson id is `subject-topic`
 * ("biology-brain"). Nesting a bare subject under it would give the router two
 * patterns that both match one segment, which is the kind of ambiguity that
 * silently resolves the wrong way later.
 *
 * An unknown id redirects to the Study page rather than rendering an error —
 * this is only reachable by a hand-typed URL or a stale link, and there is a
 * perfectly good page one level up.
 *
 * Unlike the lesson flow this is NOT a focus route: the student is choosing what
 * to do, not mid-task, so the navigation stays.
 */
export default function SubjectPathPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const subject = findSubject(subjectId);

  if (!subject) return <Navigate to="/lessons" replace />;

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <SubjectPathView subject={subject} />
      </div>
      <BottomNav />
    </div>
  );
}
