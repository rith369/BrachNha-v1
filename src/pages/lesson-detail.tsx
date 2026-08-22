import { useParams } from "react-router";
import { LessonDetail } from "@/features/lessons/components/lesson-detail";

/**
 * Was app/lessons/[lessonId]/page.tsx, where Next awaited `params` on the
 * server. Client-side routing has the param synchronously, so there is nothing
 * to await — `lessonId` is only ever undefined if this renders outside its
 * route, which the router prevents.
 */
export default function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  return <LessonDetail lessonId={lessonId ?? ""} />;
}
