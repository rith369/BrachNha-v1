import { Navigate, useParams } from "react-router";
import { PaperScreen } from "@/features/exam/components/paper-screen";
import { pastPaperCard, withContent } from "@/features/exam/papers";
import { ContentNotice } from "@/features/practice/components/content-waiting";
import { BottomNav } from "@/components/shell/bottom-nav";
import { retryBody, retryContent, useContentBody, useContentManifest } from "@/lib/content";

/**
 * `/exam/subjects/:paperKey` — one past paper's detail, run and review.
 *
 * `paperKey` is `"{year}-{subjectId}"`, the key the database stores the paper
 * under. pastPaperCard() builds the same object the card list does, so the
 * paper's own screen cannot be titled differently from the card that opened it.
 *
 * THE PAPER COMES FROM THE DATABASE (lib/content.ts) since step B of
 * docs/plans/sections-and-papers-in-database.md: the manifest says whether it
 * is published and at which version, and only then is its body downloaded (or
 * read from the phone, if it was opened before). A redirect to the tab list
 * happens only once the manifest has ANSWERED that it is missing, never while
 * it is still loading: a slow phone must not be bounced back for being slow.
 *
 * NOT A FOCUS ROUTE. The detail screen is a place, so the navigation stays; the
 * runner hides it by setting the store's `focusMode` on mount, exactly as the
 * generated-exam runner already does from inside /exam/subjects.
 *
 * The page supplies no scroller once the paper is in — PaperScreen needs a
 * different frame per screen (the runner brings FocusLayout's own and must not
 * be nested inside a second one).
 */
export default function ExamPaperPage() {
  const { paperKey = "" } = useParams<{ paperKey: string }>();
  const manifest = useContentManifest();
  const card = pastPaperCard(paperKey, manifest);
  const version = card?.version ?? null;
  // Called on every render, before any early return (a hook cannot be
  // skipped). With version null it answers "missing" and fetches nothing.
  const body = useContentBody("paper", paperKey, version);

  if (manifest.status === "ready" && (!card || version === null || body.status === "missing")) {
    return <Navigate to="/exam/subjects" replace />;
  }

  if (manifest.status !== "ready" || !card || version === null || body.status !== "ready") {
    const offline = manifest.status === "failed" || body.status === "offline";
    return (
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8">
          <div className="mx-auto w-full max-w-2xl">
            <ContentNotice
              state={offline ? "offline" : "loading"}
              onRetry={() =>
                manifest.status === "failed" || version === null
                  ? retryContent()
                  : retryBody("paper", paperKey, version)
              }
            />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PaperScreen paper={withContent(card, body.body, version)} />
      <BottomNav />
    </div>
  );
}
