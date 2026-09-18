import { useState } from "react";
import { Check, ChevronDown, Timer, X } from "lucide-react";
import { FocusButton, FocusLayout } from "@/components/shell/focus-layout";
import { MathText } from "@/components/shell/math-text";
import { SkillDrill } from "@/components/skill-drill";
import { clockLabel } from "@/features/exam/paper-scoring";
import { scoreColor, scoreColorHex } from "@/features/exam/score-styles";
import type { SectionQuestion } from "@/types";
import { cn } from "@/utils/cn";
import type { QuizAttempt } from "./quiz-runner";

/**
 * The review after a sitting — the mark, then every question, COLLAPSED.
 *
 * COLLAPSED IS THE WHOLE POINT. Ten questions, each with a solution, a rule, a
 * mistake and four exercises, is several screens of wall; a student who has just
 * finished came to see how they did. Tapping a row opens that question's full
 * answer — which is the same material the runner showed inline, rendered by the
 * same SkillDrill, so the two cannot say different things.
 *
 * WRONG ANSWERS OPEN FIRST. Nothing is hidden from a student who got it right,
 * but the rows worth reading are the ones they missed, and making them tap
 * every row to find out which is work the screen can do for them.
 *
 * IT RE-MARKS FROM THE QUESTIONS rather than trusting the attempt's own numbers,
 * the rule PastPaperResults follows: the headline and the rows are then one
 * derivation, so they cannot disagree. That is also what lets a history row from
 * last week reopen the real explanations instead of a remembered percentage.
 */
export function QuizResults({
  questions,
  attempt,
  title,
  onRetake,
  onBack,
}: {
  questions: SectionQuestion[];
  attempt: QuizAttempt;
  title: string;
  onRetake: () => void;
  onBack: () => void;
}) {
  const marked = questions.map((q, i) => ({
    q,
    answer: attempt.answers[i] ?? null,
    ms: attempt.questionMs[i] ?? 0,
    ok: attempt.answers[i] === q.correct,
  }));
  const score = marked.filter((m) => m.ok).length;
  const pct = questions.length
    ? Math.round((score / questions.length) * 100)
    : 0;
  const deg = Math.round((pct / 100) * 360);
  const slowest = marked.reduce(
    (worst, m, i) => (m.ms > marked[worst].ms ? i : worst),
    0
  );
  // Only worth naming when there is something to name. clockLabel() rounds to
  // whole seconds, so on a very fast sitting every question reads 0:00 and
  // "slowest: question 1 (0:00)" is noise dressed as a finding.
  const showSlowest = questions.length > 1 && marked[slowest].ms >= 1000;

  return (
    <FocusLayout
      progressPct={100}
      onExit={onBack}
      footer={<FocusButton onClick={onRetake}>ធ្វើម្តងទៀត →</FocusButton>}
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex size-28 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(${scoreColorHex(pct)} ${deg}deg, var(--color-chart-track) ${deg}deg)`,
            }}
          >
            <div className="flex size-21 flex-col items-center justify-center rounded-full bg-bg">
              <div
                className={cn(
                  "font-heading text-2xl font-bold",
                  scoreColor(pct)
                )}
              >
                {pct}%
              </div>
              <div className="text-[9px] font-bold text-muted">ពិន្ទុ</div>
            </div>
          </div>

          <div className="font-heading mb-1 text-lg font-extrabold">{title}</div>
          <div className="mb-1 text-sm font-bold text-muted">
            {score}/{questions.length} ត្រឹមត្រូវ
          </div>
          <div className="mb-5 inline-flex items-center gap-1 text-xs font-bold text-muted">
            <Timer className="size-3.5 shrink-0" strokeWidth={2.5} />
            ប្រើពេល {clockLabel(attempt.ms)}
            {showSlowest && (
              <span>
                {" "}
                · យឺតបំផុត សំណួរ {slowest + 1} ({clockLabel(marked[slowest].ms)})
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {marked.map((m, i) => (
            <ReviewRow key={i} index={i} {...m} />
          ))}
        </div>
      </div>
    </FocusLayout>
  );
}

/**
 * One question in the review.
 *
 * Its own component so the open/closed state is per row rather than one map in
 * the parent, and so the closure that renders the body cannot be built above a
 * guard — the React Compiler narrowing the repo documents in review-session.tsx.
 */
function ReviewRow({
  q,
  index,
  answer,
  ms,
  ok,
}: {
  q: SectionQuestion;
  index: number;
  answer: string | null;
  ms: number;
  ok: boolean;
}) {
  // Wrong rows open on arrival; right ones stay shut until asked for.
  const [open, setOpen] = useState(!ok);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border",
        ok ? "border-mint/25 bg-mint/8" : "border-pink/20 bg-pink/8"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-2.5 p-3.5 text-left"
      >
        <span
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white",
            ok ? "bg-mint" : "bg-pink"
          )}
        >
          {ok ? (
            <Check className="size-3.5" strokeWidth={3} />
          ) : (
            <X className="size-3.5" strokeWidth={3} />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="mb-0.5 flex items-center gap-2 text-[11px] font-extrabold text-muted md:text-xs">
            សំណួរ {index + 1}
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Timer className="size-3 shrink-0" strokeWidth={2.5} />
              {clockLabel(ms)}
            </span>
          </span>
          <span className="block text-sm font-bold text-text md:text-base">
            <MathText text={q.q} />
          </span>
        </span>

        <ChevronDown
          className={cn(
            "mt-0.5 size-5 shrink-0 text-muted transition-transform",
            open && "rotate-180"
          )}
          strokeWidth={2.5}
        />
      </button>

      {open && (
        <div className="px-3.5 pb-3.5">
          <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-extrabold md:text-sm">
            <span className={ok ? "text-mint" : "text-pink"}>
              ចម្លើយរបស់អ្នក:{" "}
              {answer === null ? "មិនបានឆ្លើយ" : <MathText text={answer} />}
            </span>
            {!ok && (
              <span className="text-mint">
                ចម្លើយត្រឹមត្រូវ: <MathText text={q.correct} />
              </span>
            )}
          </div>

          <div className="text-xs font-semibold text-text md:text-sm">
            <MathText text={q.explanation} />
          </div>

          {/* The same rule, mistake and exercises the runner showed inline —
              one component, so a review cannot teach something the quiz did
              not. Collapsed here whatever the answer was: the student has
              already been offered them once. */}
          {q.help && <SkillDrill help={q.help} />}
        </div>
      )}
    </div>
  );
}
