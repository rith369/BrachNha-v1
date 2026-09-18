import { useState } from "react";
import { Check, X } from "lucide-react";
import { SKILLS } from "@/data/papers/english-drills";
import type { SkillId } from "@/types";
import { cn } from "@/utils/cn";

/**
 * What a student gets under a WRONG answer: the rule, then two or three similar
 * exercises to try straight away.
 *
 * PRACTICE, NOT MEASUREMENT — so it is the shape section-detail.tsx and the
 * practice quiz use rather than the exam's: answering reveals the result and the
 * explanation immediately, there is no submit at the end, and nothing is scored
 * or recorded. Getting one wrong here is the point of being here.
 *
 * IT AWARDS NOTHING. The paper's own XP is paid by exam-view.tsx when the
 * attempt lands; paying again per drill question would make a wrong answer on
 * the exam the most profitable thing on the screen.
 *
 * Collapsed until asked for: a review list of twenty questions with three
 * exercises hanging off each is a wall, and the student came to see their marks.
 */
export function SkillDrill({ skill }: { skill: SkillId }) {
  const help = SKILLS[skill];
  const [open, setOpen] = useState(false);
  const [picks, setPicks] = useState<Record<number, string>>({});

  return (
    <div className="mt-3">
      <div className="rounded-xl border border-blue/20 bg-blue/5 p-3">
        <div className="mb-1 text-[11px] font-extrabold text-blue md:text-xs">
          ចំណាំ · {help.label}
        </div>
        <ul className="list-outside list-disc space-y-1 pl-4 text-xs font-semibold text-text md:text-sm">
          {help.note.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-2 w-full rounded-xl border border-purple/20 bg-purple/8 px-4 py-2 text-xs font-extrabold text-purple transition hover:bg-purple/12 md:text-sm"
        >
          ហាត់បន្ថែម · លំហាត់ស្រដៀងគ្នា {help.questions.length}
        </button>
      ) : (
        <div className="mt-2 space-y-3">
          {help.questions.map((question, qi) => {
            const picked = picks[qi];
            return (
              <div
                key={question.prompt}
                className="rounded-xl border border-purple/10 bg-surface p-3"
              >
                <div className="mb-2 text-xs font-extrabold text-text md:text-sm">
                  {qi + 1}. {question.prompt}
                </div>
                <div className="flex flex-col gap-1.5">
                  {question.options.map((opt) => {
                    const isCorrect = opt === question.correct;
                    const chosen = picked === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() =>
                          setPicks((prev) =>
                            // Answering is final, like the practice quiz: a
                            // second guess after seeing the answer teaches
                            // nothing.
                            prev[qi] ? prev : { ...prev, [qi]: opt }
                          )
                        }
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-bold transition md:text-sm",
                          !picked
                            ? "border-purple/10 bg-surface text-text hover:bg-purple/5"
                            : isCorrect
                              ? "border-mint/30 bg-mint/10 text-mint"
                              : chosen
                                ? "border-pink/30 bg-pink/8 text-pink"
                                : "border-purple/10 bg-surface text-muted"
                        )}
                      >
                        {picked && isCorrect && (
                          <Check className="size-3.5 shrink-0" strokeWidth={3} />
                        )}
                        {picked && chosen && !isCorrect && (
                          <X className="size-3.5 shrink-0" strokeWidth={3} />
                        )}
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {picked && (
                  <div className="mt-2 text-[11px] font-semibold text-muted md:text-xs">
                    {question.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
