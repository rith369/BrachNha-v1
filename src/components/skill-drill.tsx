import { useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { MathText } from "@/components/shell/math-text";
import type { DrillQuestion, SkillHelp } from "@/types";
import { cn } from "@/utils/cn";

/**
 * The rule behind a question, the mistake students make on it, and exercises to
 * try straight away.
 *
 * MOVED HERE FROM features/exam/ the moment a second caller appeared, which is
 * the same lift shell/wordmark.tsx and shell/stat-bar.tsx got. It takes the
 * `help` OBJECT rather than a skill id now: it used to reach into
 * data/papers/english-drills.ts itself, and a shared component importing one
 * subject's drill corpus would drag the whole of it into every chunk that
 * renders a question. The caller does the lookup.
 *
 * WHEN it is shown differs per caller, and that is deliberate. The English paper
 * shows it only under a WRONG answer — a student who has just proved the skill
 * does not need to be sent to practise it. The math practice quiz shows it under
 * EVERY answer, because practice is not measurement and a student who wants more
 * reps should always be able to get them. Neither rule lives here.
 *
 * PRACTICE, NOT MEASUREMENT — answering reveals the result and the explanation
 * immediately, there is no submit at the end, and nothing is scored. Getting one
 * wrong here is the point of being here.
 *
 * IT AWARDS NOTHING, AND IT MUST NOT RECORD ANYTHING. The parent quiz or paper
 * pays its own XP once; paying again per drill question would make a wrong
 * answer the most profitable thing on the screen, and calling recordQuestions()
 * for four drills per question would inflate the Progress content log fourfold
 * for one section. That is why this file has no store import at all.
 *
 * Collapsed until asked for: a review list of twenty questions with four
 * exercises hanging off each is a wall, and the student came to see their marks.
 */

/**
 * One group of exercises, with its OWN answer state.
 *
 * A separate component for two reasons, and both are bugs it prevents rather
 * than tidiness. (1) One `picks` map shared by both groups would key similar-1
 * and foundation-1 on the same index, so answering either would instantly mark
 * and lock the other. (2) `help.foundation` is optional, and the React Compiler
 * narrows a closure's memo dependency to the exact property path it reads and
 * emits that check where the closure is BUILT — so a `setPicks` handler reading
 * `help.foundation[qi]` above the `help.foundation && (…)` guard would throw for
 * every English entry, which has none. Taking a non-optional array as a prop
 * makes both unrepresentable. Same move, same reason, as QuizSummary in
 * quiz-runner.tsx.
 */
function DrillGroup({
  questions,
  heading,
}: {
  questions: DrillQuestion[];
  heading: string;
}) {
  const [picks, setPicks] = useState<Record<number, string>>({});

  return (
    <div>
      <div className="mb-1.5 text-[11px] font-extrabold text-muted md:text-xs">
        {heading}
      </div>
      <div className="space-y-3">
        {questions.map((question, qi) => {
          const picked = picks[qi];
          return (
            // Keyed on POSITION, not on the prompt. These lists are static and
            // never reorder, and two limit exercises can legitimately read the
            // same — a duplicate key inside one map is a React warning plus
            // state that jumps between siblings.
            <div
              key={qi}
              className="rounded-xl border border-purple/10 bg-surface p-3"
            >
              <div className="mb-2 text-xs font-extrabold text-text md:text-sm">
                {qi + 1}. <MathText text={question.prompt} />
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
                      <MathText text={opt} />
                    </button>
                  );
                })}
              </div>
              {picked && (
                <div className="mt-2 text-[11px] font-semibold text-muted md:text-xs">
                  <MathText text={question.explanation} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SkillDrill({
  help,
  defaultOpen = false,
}: {
  help: SkillHelp;
  /** Open on arrival — what the practice quiz passes after a wrong answer, so
   *  the exercises are in front of the student who actually needs them. */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panel = useRef<HTMLDivElement>(null);

  const total = help.questions.length + (help.foundation?.length ?? 0);

  function expand() {
    setOpen(true);
    // Four exercise cards open below the fold, so on a phone the button
    // otherwise appears to do nothing. rAF because the panel does not exist
    // until this state change has painted; `nearest` so a panel already in
    // view is left alone. This component does not own its scroll container —
    // FocusLayout's body does — which is why it asks the DOM rather than
    // computing an offset, the same call QuizJumpList makes.
    requestAnimationFrame(() =>
      panel.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    );
  }

  return (
    <div className="mt-3">
      <div className="rounded-xl border border-blue/20 bg-blue/5 p-3">
        <div className="mb-1 text-[11px] font-extrabold text-blue md:text-xs">
          ចំណាំ · {help.label}
        </div>
        <ul className="list-outside list-disc space-y-1 pl-4 text-xs font-semibold text-text md:text-sm">
          {help.note.map((line) => (
            <li key={line}>
              <MathText text={line} />
            </li>
          ))}
        </ul>
      </div>

      {/* The mistake gets its OWN box rather than a fourth bullet in the note.
          The note says what is true; this says what goes wrong, and the two
          read past each other when they are one list. Pink stripe, no pink
          fill — one coloured element per card, the Callout rule. */}
      {help.mistake && (
        <div className="mt-2 rounded-xl border border-pink/20 border-l-4 border-l-pink bg-surface p-3">
          <div className="mb-1 text-[11px] font-extrabold text-pink md:text-xs">
            កំហុសញឹកញាប់
          </div>
          <div className="text-xs font-semibold text-text md:text-sm">
            <MathText text={help.mistake} />
          </div>
        </div>
      )}

      {!open ? (
        <button
          onClick={expand}
          className="mt-2 w-full rounded-xl border border-purple/20 bg-purple/8 px-4 py-2 text-xs font-extrabold text-purple transition hover:bg-purple/12 md:text-sm"
        >
          ហាត់បន្ថែម · លំហាត់ {total}
        </button>
      ) : (
        <div ref={panel} className="mt-2 space-y-3">
          <DrillGroup questions={help.questions} heading="លំហាត់ស្រដៀងគ្នា" />
          {help.foundation && (
            <DrillGroup
              questions={help.foundation}
              heading="លំហាត់មូលដ្ឋានគ្រឹះ"
            />
          )}
        </div>
      )}
    </div>
  );
}
