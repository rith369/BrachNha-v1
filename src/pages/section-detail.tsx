import { Navigate, useNavigate, useParams } from "react-router";
import { SectionDetail } from "@/features/lessons/components/section-detail";
import { findSubject } from "@/features/lessons/subjects";
import { ContentWaitingScreen } from "@/features/practice/components/content-waiting";
import { retryBody, retryContent, useContentBody, useContentManifest } from "@/lib/content";
import { entryVersion } from "@/utils/content-manifest";

/**
 * `/sections/:sectionId` — one section of the real curriculum.
 *
 * Its own route rather than a shape squeezed into `/lessons/:lessonId`: a
 * section id is `subject-chapter-lesson-index` ("biology-3-1-1") and a lesson id
 * is `subject-topic` ("biology-brain"), so one pattern matching both would be
 * ambiguous in exactly the way `/subjects/:subjectId` was kept out of
 * `/lessons/` to avoid.
 *
 * THE SECTION COMES FROM THE DATABASE (lib/content.ts) since step B of
 * docs/plans/sections-and-papers-in-database.md: the manifest says whether it
 * is published and at which version, and only then is its body downloaded (or
 * read from the phone, if it was opened before). Anything opened once works
 * offline afterwards. A section that is not published redirects to its subject's
 * path, but only once the manifest has ANSWERED that, never while it loads: a
 * slow phone must not be bounced back for being slow.
 *
 * This IS a focus route (see utils/focus-routes.ts): the navigation goes, but
 * the KruAI mentor stays, same as a lesson — asking "why is this true?"
 * mid-lesson is the product working, not a leak. So the waiting screen keeps
 * FocusLayout's X as the way out.
 */
export default function SectionDetailPage() {
  const navigate = useNavigate();
  const { sectionId = "" } = useParams<{ sectionId: string }>();
  const manifest = useContentManifest();
  const version = entryVersion(manifest, "section", sectionId);
  // Called on every render, before any early return (a hook cannot be
  // skipped). With version null it answers "missing" and fetches nothing.
  const body = useContentBody("section", sectionId, version);

  const subject = findSubject(sectionId.split("-")[0]);
  const back = subject ? `/subjects/${subject.id}` : "/lessons";

  if (manifest.status === "ready" && (version === null || body.status === "missing")) {
    return <Navigate to={back} replace />;
  }
  if (manifest.status !== "ready") {
    return (
      <ContentWaitingScreen
        state={manifest.status === "failed" ? "offline" : "loading"}
        onRetry={retryContent}
        onExit={() => navigate(back)}
      />
    );
  }
  if (version === null || body.status !== "ready") {
    return (
      <ContentWaitingScreen
        state={body.status === "offline" ? "offline" : "loading"}
        onRetry={() => (version === null ? retryContent() : retryBody("section", sectionId, version))}
        onExit={() => navigate(back)}
      />
    );
  }

  // Keyed on the id, so moving straight to another section starts it afresh
  // rather than carrying one section's answers into the next.
  return <SectionDetail key={sectionId} sectionId={sectionId} section={body.body} />;
}
