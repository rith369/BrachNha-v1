import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { clockLabel, gameCopy } from "../copy";
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
  now,
}: {
  question: ExamQuestion;
  /**
   * Reports BOTH whether it was right and WHICH option was chosen.
   *
   * Two arguments rather than one, and the pair is deliberate. The picked option
   * is what the review screen shows afterwards, and correctness is what the run
   * scores — but handing back only the option would force the parent's handler to
   * read `questions[index].correct` to score it, which is exactly the closure
   * over `questions[index]` that competition-run.tsx's header explains cannot
   * exist above its terminal guard. This component already has the question in
   * hand, so it answers both questions here and the parent's handler stays free
   * of any dependency at all.
   */
  onAnswer: (correct: boolean, picked: string) => void;
  /** The run's ticking clock, passed down rather than duplicated. */
  now: number;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);
  const [picked, setPicked] = useState<string | null>(null);

  // THE PER-QUESTION STOPWATCH — it counts UP and has no limit.
  //
  // A per-question COUNTDOWN was built first and removed at the user's request,
  // and the reasoning is worth keeping: there is no honest number for how long
  // one question should take — it varies by subject, by question and by student
  // — so any limit would be invented, and the one budget that IS real is the
  // whole run. This tells a student how long they have spent without pretending
  // to know how long they should have.
  //
  // `startedAt` is a lazy initialiser, fixed at MOUNT. The parent keys this
  // component on the queue position, so a new question is a new mount and the
  // stopwatch restarts for free. Date.now() in the render body would be the same
  // purity violation Math.random() is — the compiler may memoise around it.
  const [startedAt] = useState(() => Date.now());
  // Frozen when the answer is committed, so the number stops at what the student
  // actually took rather than creeping through the confirm delay.
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  const spent = (stoppedAt ?? now) - startedAt;

  // The advance. In an effect rather than the click handler so the cleanup runs
  // on unmount — a pending timeout that fires after the run has finished would
  // score a question the student never saw.
  useEffect(() => {
    if (picked === null) return;
    const id = setTimeout(
      () => onAnswer(picked === question.correct, picked),
      CONFIRM_MS
    );
    return () => clearTimeout(id);
  }, [picked, question.correct, onAnswer]);

  return (
    <div className={focusCard}>
      {/* Counts up, no limit. Muted and small: it is information, not pressure —
          the countdown above is the only thing that actually runs out. */}
      <div className="mb-3 flex items-center justify-end gap-1 text-[10px] font-bold text-muted md:text-xs">
        <Timer className="size-3 shrink-0" strokeWidth={2.5} aria-hidden />
        {t.thisQuestion} {clockLabel(spent, lang)}
      </div>
      <div className={cn("mb-4 md:mb-6", focusPrompt)}>{question.q[lang]}</div>
      <div className="flex flex-col gap-2 md:gap-3">
        {question.options.map((opt) => (
          <button
            key={opt}
            disabled={picked !== null}
            onClick={() => {
              setPicked(opt);
              setStoppedAt(Date.now());
            }}
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
