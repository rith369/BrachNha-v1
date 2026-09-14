import { Check, Minus } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import { gameCopy, num } from "../copy";
import type { ExamQuestion } from "@/types";

/**
 * Question by question: what the right answer was, what you picked, and what
 * they picked.
 *
 * THIS IS THE HALF THAT TEACHES. A competition used to record only that you got
 * 3 out of 5, which is a score — it says nothing about which three, and nothing
 * a student can act on. Both sides' picks side by side turn a result into the
 * one question worth asking afterwards: where did we differ, and who was right?
 *
 * THE CONTENT IS NOT TRANSLATED, on the user's explicit instruction —
 * `question.q[lang]` and the options render exactly as supplied, and only the
 * chrome around them follows the store's language. See features/game/copy.ts.
 *
 * ── Two things in the rendering that are decisions ─────────────────────────
 *
 * THE RIGHT ANSWER IS ALWAYS MARKED, even on a question both students missed.
 * The alternative — showing only who was wrong — is a scoreboard for a moment
 * that should be a lesson, and it is the same forward-only rule the leaderboard
 * and the flashcard summary already hold to.
 *
 * A PICK IS A NAMED CHIP, NOT A COLOUR. Mint-for-right and pink-for-wrong on the
 * option itself would leave two students' choices indistinguishable whenever
 * they picked the same wrong option — which is exactly the case worth talking
 * about. The colour says whether the OPTION is correct; the chips say who chose
 * it, and they read without being able to tell mint from pink.
 */
export function AnswerReview({
  questions,
  mine,
  theirs,
  theirsLabel,
}: {
  questions: ExamQuestion[];
  /** This student's picks, positionally matched to `questions`. */
  mine: (string | null)[];
  /** The opponent's picks, or undefined when there is nobody to compare
   *  against — a creator whose competition nobody has joined yet. */
  theirs?: (string | null)[];
  theirsLabel?: string;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);

  return (
    <div className="flex flex-col gap-3">
      {questions.map((question, i) => {
        const myPick = mine[i] ?? null;
        const theirPick = theirs?.[i] ?? null;

        return (
          <div
            key={i}
            className="rounded-2xl border border-purple/10 bg-surface p-3 shadow-panel-sm md:p-4"
          >
            <div className="mb-1 text-[10px] font-extrabold text-muted md:text-xs">
              {t.questionLabel} {num(i + 1, lang)}
            </div>
            <div className="mb-3 text-sm font-extrabold md:text-base">
              {question.q[lang]}
            </div>

            <div className="flex flex-col gap-1.5">
              {question.options.map((opt) => {
                const correct = opt === question.correct;
                const isMine = opt === myPick;
                const isTheirs = opt === theirPick;

                return (
                  <div
                    key={opt}
                    className={cn(
                      "flex items-start gap-2 rounded-xl border px-2.5 py-2 text-xs font-bold md:text-sm",
                      correct
                        ? "border-mint/40 bg-mint/10 text-mint"
                        : isMine || isTheirs
                          ? "border-pink/30 bg-pink/8 text-text"
                          : "border-purple/10 bg-control text-muted"
                    )}
                  >
                    {correct && (
                      <Check
                        className="mt-0.5 size-3.5 shrink-0"
                        strokeWidth={3}
                        aria-hidden
                      />
                    )}
                    <span className="min-w-0 flex-1">{opt}</span>
                    <span className="flex shrink-0 flex-wrap justify-end gap-1">
                      {isMine && <PickChip>{t.you}</PickChip>}
                      {isTheirs && theirsLabel && (
                        <PickChip>{theirsLabel}</PickChip>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* An unanswered question is stated rather than left as an option
                row with no chip on it — silence there looks like a bug, and the
                clock running out is a real and ordinary way to finish. */}
            {(myPick === null || (theirs && theirPick === null)) && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold text-muted">
                <Minus className="size-3 shrink-0" strokeWidth={3} aria-hidden />
                {myPick === null && (
                  <span>
                    {t.you}: {t.noAnswer}
                  </span>
                )}
                {theirs && theirPick === null && theirsLabel && (
                  <span>
                    {theirsLabel}: {t.noAnswer}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Who picked this option. Neutral purple in both cases — the option's own
 *  colour already says whether it was right, and tinting the chip by
 *  correctness would say it twice. */
function PickChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="max-w-20 truncate rounded-full bg-purple/15 px-1.5 py-0.5 text-[9px] font-extrabold text-purple">
      {children}
    </span>
  );
}
