import { useEffect, useState } from "react";
import { useBrachNhaStore } from "@/lib/store";
import { focusCard, focusOption, focusPrompt } from "@/utils/focus-styles";
import { cn } from "@/utils/cn";
import type { ExamQuestion } from "@/types";

/** How long the chosen option stays highlighted before the run advances. Long
 *  enough to see the tap registered, short enough not to spend the clock on it. */
const CONFIRM_MS = 260;

/**
 * ONE question of a competition.
 *
 * NO REVEAL OF THE CORRECT ANSWER, unlike the practice quiz. A competition is
 * scored against another student, so showing the answer mid-run would hand a
 * second joiner an advantage the creator never had, and the clock is running
 * either way. Same call ExamRunner makes for the mock exam.
 *
 * KEYED ON THE QUEUE POSITION by its parent, which is what resets the selection
 * between questions and what runs this component's timeout cleanup — so the
 * confirm delay from question N can never fire during question N+1. Keying on
 * the question's text or id would not do that: a pool can legitimately contain
 * two questions that compare equal, and the same payload twice in a row is
 * exactly the case a manual test walks past. See the third swipe bug in
 * swipeable-flashcard.tsx for the full version of this rule.
 *
 * It never has to guard a missing question — it is only mounted with one.
 */
export function GameQuestion({
  question,
  onAnswer,
}: {
  question: ExamQuestion;
  onAnswer: (correct: boolean) => void;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const [picked, setPicked] = useState<string | null>(null);

  // The advance. In an effect rather than the click handler so the cleanup runs
  // on unmount — a pending timeout that fires after the run has finished would
  // score a question the student never saw.
  useEffect(() => {
    if (picked === null) return;
    const id = setTimeout(() => onAnswer(picked === question.correct), CONFIRM_MS);
    return () => clearTimeout(id);
  }, [picked, question.correct, onAnswer]);

  return (
    <div className={focusCard}>
      <div className={cn("mb-4 md:mb-6", focusPrompt)}>{question.q[lang]}</div>
      <div className="flex flex-col gap-2 md:gap-3">
        {question.options.map((opt) => (
          <button
            key={opt}
            disabled={picked !== null}
            onClick={() => setPicked(opt)}
            className={cn(
              focusOption,
              // Neutral purple, NOT mint or pink: this marks what was chosen,
              // not whether it was right. Colouring it by correctness here would
              // be the reveal this screen deliberately does not do.
              picked === opt
                ? "border-purple/40 bg-purple/10 text-purple"
                : "border-purple/10 bg-surface text-text hover:bg-purple/5"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
