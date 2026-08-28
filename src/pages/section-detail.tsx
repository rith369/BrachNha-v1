import { Navigate, useParams } from "react-router";
import { SectionDetail } from "@/features/lessons/components/section-detail";
import { sectionContentFor } from "@/data/sections";

/**
 * `/sections/:sectionId` — one section of the real curriculum.
 *
 * Its own route rather than a shape squeezed into `/lessons/:lessonId`: a
 * section id is `subject-chapter-lesson-index` ("biology-3-1-1") and a lesson id
 * is `subject-topic` ("biology-brain"), so one pattern matching both would be
 * ambiguous in exactly the way `/subjects/:subjectId` was kept out of
 * `/lessons/` to avoid.
 *
 * A section with no content redirects to the Study page rather than erroring —
 * it is only reachable by a typed URL or a stale link, and there is a perfectly
 * good page one level up.
 *
 * This IS a focus route (see utils/focus-routes.ts): the navigation goes, but
 * the KruAI mentor stays, same as a lesson — asking "why is this true?"
 * mid-lesson is the product working, not a leak.
 */
export default function SectionDetailPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const section = sectionId ? sectionContentFor(sectionId) : null;

  if (!sectionId || !section) return <Navigate to="/lessons" replace />;

  return <SectionDetail sectionId={sectionId} section={section} />;
}
