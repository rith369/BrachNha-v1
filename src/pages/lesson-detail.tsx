import { Navigate, useParams } from "react-router";
import { LessonDetail } from "@/features/lessons/components/lesson-detail";
import { lessonDataFor } from "@/data/lessons";

/**
 * Was app/lessons/[lessonId]/page.tsx, where Next awaited `params` on the
 * server. Client-side routing has the param synchronously, so there is nothing
 * to await — `lessonId` is only ever undefined if this renders outside its
 * route, which the router prevents.
 *
 * A lesson id with no lesson behind it redirects to the Study page rather than
 * erroring, exactly as pages/section-detail.tsx does for a section. This route
 * was the one exception: it passed the raw param straight through, and the
 * unguarded `LESSONS[cat][topic]` lookup on the other side threw during render
 * for anything unknown. It is only reachable by a typed URL or a stale link,
 * and there is a perfectly good page one level up.
 */
export default function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const lesson = lessonId ? lessonDataFor(lessonId) : null;

  if (!lessonId || !lesson) return <Navigate to="/lessons" replace />;

  return <LessonDetail lessonId={lessonId} lesson={lesson} />;
}
