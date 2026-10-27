import { useEffect } from "react";
import { useBrachNhaStore } from "@/lib/store";
import { upgradeReviews } from "@/utils/fsrs";

/**
 * Gives cards graded before FSRS (27 Oct 2026) their memory model, once, when a
 * flashcard screen opens: their history is replayed from the review log, or
 * estimated where the log no longer holds all of it (`upgradeReviews`).
 *
 * HERE, not in the store's persist `merge`, for the same reason the store does
 * not schedule: the FSRS library must stay out of the entry chunk, and these are
 * the lazy screens that already load it. Cards pulled from another phone are
 * caught the same way. Until it runs, a card simply has no percentage (see
 * `retrievability`), and grading one before then still works: `schedule()`
 * estimates a missing model on the spot.
 *
 * A store write, not component state, so oxlint's set-state-in-effect does not
 * apply; and it writes only when a card changed, so an ordinary visit arms no
 * sync push.
 */
export function useFsrsUpgrade() {
  useEffect(() => {
    const s = useBrachNhaStore.getState();
    const next = upgradeReviews(s.cardReviews, s.reviewHistory);
    if (next) s.setCardReviews(next);
  }, []);
}
