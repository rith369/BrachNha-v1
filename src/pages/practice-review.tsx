import { useNavigate } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { retryAll, retryContent, useAllBodies, useContentManifest } from "@/lib/content";
import { toPracticeCards } from "@/utils/content-manifest";
import type { PracticeCard } from "@/types";
import {
  allCards,
  allDueCards,
  deckProgress,
} from "@/features/practice/review";
import { ReviewSession } from "@/features/practice/components/review-session";
import { ContentWaitingScreen } from "@/features/practice/components/content-waiting";

/**
 * `/practice/review` — the Daily Review aggregate: due cards pulled from
 * EVERY flashcard deck at once, rather than one lesson at a time.
 *
 * Reuses ReviewSession verbatim — the loop (flip, grade, requeue-on-Again,
 * finish) does not care whether its queue came from one deck or many, so
 * this page's whole job is building that queue and handing it over.
 *
 * A FOCUS ROUTE (see utils/focus-routes.ts) but not an assessment route —
 * same call the per-lesson runner makes: this teaches, it doesn't measure, so
 * KruAI stays reachable.
 *
 * EVERY DECK IS NEEDED HERE, so they come through lib/content.ts's
 * useAllBodies: whatever this phone already holds is reused and the rest
 * arrives in one request. ReviewSession freezes its queue when it mounts, so it
 * is mounted only once the decks are in, never on an empty first render.
 *
 * DUE-NESS DOESN'T GATE ACCESS HERE EITHER — same rule flashcard-runner.tsx
 * follows: due cards first when there are any, else the whole catalog's
 * cards, so this page never opens onto a dead "nothing to review" screen as
 * long as SOME deck somewhere has content.
 */
export default function PracticeReviewPage() {
  const navigate = useNavigate();
  const manifest = useContentManifest();
  const decks = useAllBodies("deck", manifest);
  const { studentCards, cardReviews } = useBrachNhaStore(
    useShallow((s) => ({
      studentCards: s.studentCards,
      cardReviews: s.cardReviews,
    }))
  );

  if (manifest.status === "failed") {
    return (
      <ContentWaitingScreen state="offline" onRetry={retryContent} onExit={() => navigate("/practice")} />
    );
  }
  if (decks.status !== "ready") {
    return (
      <ContentWaitingScreen
        state={decks.status}
        onRetry={() => retryAll("deck", manifest)}
        onExit={() => navigate("/practice")}
      />
    );
  }

  const official: Record<string, PracticeCard[]> = {};
  for (const [key, body] of Object.entries(decks.bodies)) official[key] = toPracticeCards(body, "");

  const due = allDueCards(official, studentCards, cardReviews);
  const everything = allCards(official, studentCards, cardReviews);
  const queue = due.length > 0 ? due : everything;

  return (
    <ReviewSession
      queue={queue}
      title="ការពិនិត្យប្រចាំថ្ងៃ"
      // The whole CATALOG is this screen's equivalent of a deck — it reviews
      // across every subject, so its progress ring measures the same scope it
      // draws its queue from. Recomputed each render, so grading during the
      // session is already reflected by the time the summary shows it.
      progress={deckProgress(everything)}
      onExit={() => navigate("/practice")}
    />
  );
}
