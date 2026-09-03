import { useNavigate } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import {
  allCards,
  allDueCards,
  deckProgress,
} from "@/features/practice/review";
import { ReviewSession } from "@/features/practice/components/review-session";

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
 * Today this reduces to "whatever Biology has," since it's the only subject
 * with a written deck — allDueCards() is written against the whole catalog so
 * nothing here changes as more decks get content.
 *
 * DUE-NESS DOESN'T GATE ACCESS HERE EITHER — same rule flashcard-runner.tsx
 * follows: due cards first when there are any, else the whole catalog's
 * cards, so this page never opens onto a dead "nothing to review" screen as
 * long as SOME deck somewhere has content.
 */
export default function PracticeReviewPage() {
  const navigate = useNavigate();
  const { studentCards, cardReviews } = useBrachNhaStore(
    useShallow((s) => ({
      studentCards: s.studentCards,
      cardReviews: s.cardReviews,
    }))
  );

  const due = allDueCards(studentCards, cardReviews);
  const everything = allCards(studentCards, cardReviews);
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
