import { useState } from "react";
import { Check, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import { toKhmerDigits } from "@/utils/khmer-num";
import type { ReviewGrade, ReviewResult } from "@/utils/spaced-repetition";
import type { DeckProgress, QueueCard } from "../review";
import { SwipeableFlashcard } from "./swipeable-flashcard";
import { FlashcardSummary } from "./flashcard-summary";

/**
 * An EMPTY queue reaching ReviewSession means there is truly no card anywhere
 * to show — NOT "nothing due," which no longer stops a caller opening a session
 * at all (see flashcard-runner.tsx and practice-review.tsx, both of which fall
 * back to the whole deck/catalog when nothing is scheduled). This is the honest
 * screen for the one case neither fallback can fix: no deck has any content.
 *
 * Its own component rather than a branch inside ReviewSession purely so that
 * branch can be an early return placed ABOVE the closures that read `current` —
 * see the comment there for why that ordering is load-bearing under the React
 * Compiler rather than cosmetic.
 */
function EmptyQueue({ onExit }: { onExit: () => void }) {
  return (
    <FocusLayout
      progressPct={100}
      onExit={onExit}
      footer={<FocusButton onClick={onExit}>← ត្រឡប់</FocusButton>}
    >
      <div className="text-center">
        <div className="mb-2 text-4xl">📭</div>
        <div className="font-heading mb-1 text-lg font-extrabold">
          គ្មានកាតនៅឡើយទេ
        </div>
        <div className="text-sm font-bold text-muted">
          មិនទាន់មានកាតសរសេរនៅត្រង់នេះទេ។
        </div>
      </div>
    </FocusLayout>
  );
}

/**
 * The actual review loop — flip any time, swipe (phone/tablet) or tap ✕/✓ to
 * rate, step back to re-read a card you already answered, repeat until the
 * queue is empty, then a summary.
 *
 * ONE component for BOTH the per-lesson deck (flashcard-runner.tsx, after its
 * intro screen) and the Daily Review aggregate (pages/practice-review.tsx),
 * because the loop itself — flip, grade, advance, finish — is identical either
 * way; only where the cards came from and where "back"
 * (exit, not step-back — see below) goes differ, and both are just props
 * here. Same lift-on-second-caller pattern as utils/rewards.ts and
 * shell/stat-bar.tsx.
 *
 * TWO STUDENT-FACING OPTIONS, ចងចាំ (know it) and មិនទាន់ចងចាំ (don't know
 * it yet), NOT the scheduler's four-way Again/Hard/Good/Easy — that
 * simplification is a UI decision, not a scheduler one. `rate()` still calls
 * `gradeCard` with a real `ReviewGrade`, mapping ចងចាំ → "good" and
 * មិនទាន់ចងចាំ → "again", so the scheduler in utils/spaced-repetition.ts and
 * its future FSRS replacement never see anything different — only this one
 * mapping line would need to change if the UI ever grew Hard/Easy back.
 *
 * A CARD IS SHOWN ONCE PER SESSION. "Again" used to push the card back onto
 * this session's own queue so it came round again before the sitting ended;
 * that was overruled — see AGAIN_INTERVAL_DAYS in utils/spaced-repetition.ts.
 * The queue is therefore a frozen SNAPSHOT of the prop (`useState(queue)` with
 * no setter), which is load-bearing rather than leftover: grading writes to the
 * store, the caller recomputes `cardsFor`/`dueCardsFor` from it on that render,
 * and a live `queue` prop would resize itself under the index mid-session.
 *
 * THE ✕/✓ PAIR LIVES IN FocusLayout's `footer` SLOT, not inline in the body,
 * specifically so `onBack` (FocusLayout's own step-BACKWARDS-within-the-task
 * affordance, same one SectionDetail uses) can sit beside it the way the
 * shell already expects — "the row is items-stretch so the back button takes
 * its height from the action button beside it." Stepping back only changes
 * which card is ON SCREEN; it does NOT undo a grade already committed to
 * `cardReviews` — the same view-only semantics FocusLayout's own doc comment
 * describes ("let me re-read that," not "let me take that back"). A student
 * who wants to change a rating can simply rate the card again the next time it
 * comes round.
 */
export function ReviewSession({
  queue,
  title,
  progress,
  onExit,
}: {
  queue: QueueCard[];
  /** Shown on the summary screen — the lesson name for a per-lesson session,
   *  or "ការពិនិត្យប្រចាំថ្ងៃ" for the aggregate. */
  title: string;
  /** The WHOLE deck's progress, for the summary's ring — passed straight
   *  through rather than derived here, because this component only ever sees
   *  the session's own queue and a session is usually a subset of a deck.
   *  The caller reads it live from the store, so it reflects the grades made
   *  during this very session. */
  progress?: DeckProgress;
  onExit: () => void;
}) {
  const { gradeCard, completeTask, starredCards, toggleStarredCard } =
    useBrachNhaStore(
      useShallow((s) => ({
        gradeCard: s.gradeCard,
        completeTask: s.completeTask,
        starredCards: s.starredCards,
        toggleStarredCard: s.toggleStarredCard,
      }))
    );

  const [liveQueue] = useState(queue);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<ReviewResult[]>([]);

  const done = index >= liveQueue.length;
  const current = liveQueue[index];

  // BOTH TERMINAL SCREENS RETURN BEFORE `rate` IS DEFINED, AND THAT ORDER IS
  // LOAD-BEARING UNDER THE REACT COMPILER — it is not just tidiness. `rate`
  // reads `current.card.id`, and because that is the ONLY way it touches
  // `current`, the compiler narrows its memo dependency to that exact property
  // path and emits the check as `$[n] !== current.card.id` at the point the
  // closure is built. On the render right after the last card is graded
  // `index === liveQueue.length`, so `current` is undefined and that dependency
  // check throws before any `if (done)` placed below it could return. It is a
  // real crash (blank screen, "Cannot read properties of undefined") and it is
  // invisible in the source, which reads as a perfectly ordinary guarded early
  // return. Keep every early return that guards `current` ABOVE the closures
  // that read into it. (It survived an earlier version of this file only
  // because `rate` also used `current` as a whole value, which made the
  // compiler depend on the safe `current` instead of `current.card.id`.)
  if (liveQueue.length === 0) return <EmptyQueue onExit={onExit} />;
  if (done) {
    return (
      <FlashcardSummary
        title={title}
        results={results}
        progress={progress}
        onExit={onExit}
      />
    );
  }

  function rate(grade: ReviewGrade) {
    gradeCard(current.card.id, grade);
    setResults((r) => [
      ...r,
      { cardId: current.card.id, grade, reviewedAt: new Date().toISOString() },
    ]);

    const nextIndex = index + 1;

    if (nextIndex >= liveQueue.length) {
      // Ticks the SAME tasks.flashcards field Home's checklist and Roadmap's
      // Daily Mission read — one real completion, whether this session came
      // from a single lesson or the Daily Review aggregate.
      completeTask("flashcards");
    }

    setIndex(nextIndex);
    setFlipped(false);
  }

  // The two running-tally pills above the card — same idea as the reference
  // this screen is modelled on. Read straight off this session's own
  // `results` rather than a separate counter, so they can't disagree with
  // the summary screen that reads the same array.
  const knowSoFar = results.filter((r) => r.grade === "good").length;
  const dontKnowSoFar = results.filter((r) => r.grade === "again").length;

  return (
    <FocusLayout
      progressPct={(index / liveQueue.length) * 100}
      onExit={onExit}
      showStats
      meta={`${toKhmerDigits(index + 1)} / ${toKhmerDigits(liveQueue.length)}`}
      onBack={
        index > 0
          ? () => {
              setIndex(index - 1);
              setFlipped(false);
            }
          : undefined
      }
      footer={
        <div className="flex items-stretch gap-3">
          <button
            onClick={() => rate("again")}
            aria-label="មិនទាន់ចងចាំ"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-pink/30 bg-pink/8 py-3.5 text-sm font-extrabold text-pink transition hover:bg-pink/15 active:scale-[0.98]"
          >
            <X className="size-5" strokeWidth={3} />
            មិនទាន់ចងចាំ
          </button>
          <button
            onClick={() => rate("good")}
            aria-label="ចងចាំ"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-mint/30 bg-mint/8 py-3.5 text-sm font-extrabold text-mint transition hover:bg-mint/15 active:scale-[0.98]"
          >
            <Check className="size-5" strokeWidth={3} />
            ចងចាំ
          </button>
        </div>
      }
    >
      <div>
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="rounded-full border border-pink/30 px-3 py-1 text-xs font-extrabold text-pink">
            {toKhmerDigits(dontKnowSoFar)}
          </span>
          <span className="rounded-full border border-mint/30 px-3 py-1 text-xs font-extrabold text-mint">
            {toKhmerDigits(knowSoFar)}
          </span>
        </div>

        {/* KEYED ON THE QUEUE POSITION, NOT ON card.id. SwipeableFlashcard owns
            transient state (drag offset, whether a fly-off is playing) that
            must reset between one presentation and the next, and a changing key
            is what resets it without an effect. The position is the honest
            identity for that state — one key per PRESENTATION, which is the
            unit the state belongs to — and a card.id key was a real shipped bug
            when the same card could follow itself: React kept the instance
            mounted still holding its flyingOut, so the card sat at opacity 0,
            translated 500px off-screen, refusing every pointerdown on its own
            `if (flyingOut) return`, and only the ✕/✓ buttons below still worked.
            The requeue that produced that case is gone now (see this file's
            header), so nothing currently repeats an id — which is exactly why
            this stays: it costs nothing and it is not conditional on that. */}
        <SwipeableFlashcard
          key={`${index}-${current.card.id}`}
          card={current.card}
          flipped={flipped}
          onFlip={() => setFlipped((f) => !f)}
          onSwipe={(direction) => rate(direction === "know" ? "good" : "again")}
          starred={starredCards.includes(current.card.id)}
          onToggleStar={() => toggleStarredCard(current.card.id)}
        />
      </div>
    </FocusLayout>
  );
}
