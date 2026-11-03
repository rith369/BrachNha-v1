import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { MistakesRunner } from "@/features/practice/components/mistakes-runner";
import { ContentWaitingScreen } from "@/features/practice/components/content-waiting";
import { filterMistakes, liveMistakes, sessionQueue } from "@/features/practice/mistakes";
import { retryContent, useContentManifest } from "@/lib/content";
import { useBrachNhaStore } from "@/lib/store";
import type { ContentManifest } from "@/utils/content-manifest";

/**
 * `/practice/mistakes/run`: one round, optionally `?subject=` or `?lesson=`.
 *
 * A focus route (nav hidden) but not an assessment, so KruAI stays: this is practice.
 * A static path, so it outranks `practice/:mode/:subjectId` in the route table.
 *
 * Waits for the manifest, because the round is built from it.
 */
export default function PracticeMistakesRunPage() {
  const navigate = useNavigate();
  const manifest = useContentManifest();

  if (manifest.status !== "ready") {
    return (
      <ContentWaitingScreen
        state={manifest.status === "failed" ? "offline" : "loading"}
        onRetry={retryContent}
        onExit={() => navigate("/practice/mistakes")}
      />
    );
  }
  return <Round manifest={manifest} />;
}

/**
 * THE ROUND IS FIXED ONCE, as this mounts. Rebuilt on every render, clearing the last
 * mistake would empty it and bounce the student away before the summary. An empty
 * start (a stale link, or a list already cleared) goes back to the list.
 */
function Round({ manifest }: { manifest: ContentManifest }) {
  const [params] = useSearchParams();
  const [queue] = useState(() =>
    sessionQueue(
      filterMistakes(liveMistakes(useBrachNhaStore.getState().mistakes, manifest), {
        subject: params.get("subject") ?? undefined,
        lesson: params.get("lesson") ?? undefined,
      })
    )
  );
  if (queue.length === 0) return <Navigate to="/practice/mistakes" replace />;
  return <MistakesRunner queue={queue} />;
}
