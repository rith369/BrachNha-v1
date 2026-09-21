import { useEffect, useRef, useState } from "react";
import { ShieldAlert, Timer } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { MathText } from "@/components/shell/math-text";
import { useLeaveGuard, MAX_EXAM_LEAVES } from "@/hooks/use-leave-guard";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import {
  focusCard,
  focusKicker,
  focusLabel,
  focusOption,
  focusPrompt,
} from "@/utils/focus-styles";
import { cn } from "@/utils/cn";
import type { PaperQuestion, PaperSection, PastPaperContent } from "@/types";
import { clockLabel, scorePaper, type PaperAnswers } from "../paper-scoring";
import { PaperGapFillStep } from "./paper-gap-fill";
import { PaperWritingStep } from "./paper-writing-step";

/** What a finished attempt reports. The parent decides what it counts as. */
export interface PaperAttempt {
  score: number;
  total: number;
  pct: number;
  answers: PaperAnswers;
  /** How long it took, capped at the paper's own budget. */
  ms: number;
  /**
   * Counted absences from the exam screen — see hooks/use-leave-guard.ts.
   * Greater than MAX_EXAM_LEAVES means the paper ENDED because of them, which
   * is derived rather than stored as a second flag so the two cannot disagree.
   */
  leaves: number;
}

type Step =
  | { kind: "intro"; section: PaperSection }
  | { kind: "gaps"; section: PaperSection }
  | { kind: "question"; section: PaperSection; question: PaperQuestion }
  | { kind: "writing" };

/**
 * A real MoEYS past paper, sat the way it is printed: numbered parts, each with
 * its instruction and worked example, a gap-fill over a shared passage, and a
 * writing task at the end.
 *
 * A SECOND RUNNER, NOT A BRANCH INSIDE ExamRunner. That component answers a flat
 * ExamQuestion[] and still serves every generated paper unchanged; a paper has
 * sections, a passage, a word bank, a clock and an unmarkable essay, and one
 * component serving both shapes would be a fork down the middle of every step —
 * the same call SectionDetail makes against lesson-detail.tsx. WHAT IS SHARED IS
 * THE FRAME: FocusLayout/FocusButton and the utils/focus-styles.ts ladder, which
 * exist precisely so the task screens cannot drift.
 *
 * IT PERFORMS NO STORE WRITES, like ExamRunner: it reports through onSubmit and
 * exam-view.tsx decides what the attempt counted as.
 *
 * THE CLOCK IS THE PAPER'S OWN (`content.minutes`, off the printed header), and
 * it is computed from a deadline stamped at mount rather than by counting ticks,
 * so a backgrounded tab cannot gain time — the pattern competition-run.tsx uses.
 * RUNNING OUT DOES NOT DISCARD THE ATTEMPT: it submits whatever is answered,
 * because the unanswered questions already cost the marks and throwing the paper
 * away would punish a slow reader twice.
 *
 * THE ORDER OF THE THREE PARTS BELOW IS LOAD-BEARING — every hook first, then
 * the terminal guard, then the closures that read into `steps[index]`. A hook
 * cannot be skipped and this component owns a timer, so the usual `if (done)
 * return` at the very top is not available; putting the closures above the guard
 * re-opens the React Compiler crash where a closure's memo dependency is
 * narrowed to a property path and checked where the closure is BUILT. See
 * competition-run.tsx for the fuller argument.
 *
 * Khmer chrome per EXAM_PAGE_LANG — only FocusLayout's shared exit confirm stays
 * lang-driven, since the lesson flow uses it too.
 */
export function PastPaperRunner({
  content,
  kicker,
  onExit,
  onSubmit,
}: {
  content: PastPaperContent;
  /** The paper's name, shown above every step. */
  kicker: string;
  onExit: () => void;
  onSubmit: (attempt: PaperAttempt) => void;
}) {
  const setFocusMode = useBrachNhaStore((s) => s.setFocusMode);
  const stepRef = useRef<HTMLDivElement>(null);

  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<PaperAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  // Fires onSubmit exactly once: pressing ដាក់ស្នើ, the clock expiring and the
  // leave allowance running out can all land on the same render.
  const reported = useRef(false);

  // Leaving the app or letting the screen lock ends the paper on the third
  // time. It SUBMITS rather than discards — a dropped call or an automatic
  // screen-off is indistinguishable from looking something up, so the student
  // keeps whatever they had answered. See hooks/use-leave-guard.ts.
  const guard = useLeaveGuard({
    active: !submitted,
    onExceeded: () => setSubmitted(true),
  });

  // Mount means focus on, unmount means focus off — copied from ExamRunner,
  // where the cleanup is the load-bearing half: a browser-back out of a running
  // paper would otherwise leave the app with no navigation at all.
  useEffect(() => {
    setFocusMode(true);
    return () => setFocusMode(false);
  }, [setFocusMode]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  // Back to the top of the task's scroller on every step change. The reading
  // passage is several screens tall, so without this the next question opens
  // wherever the passage was left — which reads as a step that failed to load.
  // Instant, never smooth: an animated scroll on arrival reads as a glitch,
  // the same call subject-path-view.tsx makes.
  useEffect(() => {
    stepRef.current?.closest("[data-focus-body]")?.scrollTo({ top: 0 });
  }, [index]);

  const deadline = startedAt + content.minutes * 60_000;
  const expired = now >= deadline;

  useEffect(() => {
    if (reported.current || (!submitted && !expired)) return;
    reported.current = true;
    const marked = scorePaper(content, answers);
    onSubmit({
      score: marked.score,
      total: marked.total,
      pct: marked.pct,
      answers,
      ms: Math.min(Date.now(), deadline) - startedAt,
      leaves: guard.leaves,
    });
  }, [
    submitted,
    expired,
    content,
    answers,
    deadline,
    startedAt,
    guard.leaves,
    onSubmit,
  ]);

  const steps: Step[] = [];
  for (const section of content.sections) {
    steps.push({ kind: "intro", section });
    if (section.gapFill) steps.push({ kind: "gaps", section });
    for (const question of section.questions ?? [])
      steps.push({ kind: "question", section, question });
  }
  if (content.writing) steps.push({ kind: "writing" });

  const step = steps[index];

  // Terminal guard: the attempt is on its way out, and the parent is about to
  // swap this component for the results screen. Nothing below may read `step`.
  if (!step) return null;

  const scored = scorePaper(content, answers).total;
  const answeredCount = Object.keys(answers).length;
  const last = index === steps.length - 1;

  function setAnswer(id: string, value: string | null) {
    setAnswers((prev) => {
      if (value === null) {
        const { [id]: _dropped, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: value };
    });
  }

  return (
    <FocusLayout
      progressPct={((index + 1) / steps.length) * 100}
      onExit={onExit}
      confirmExit
      meta={
        <span
          className={cn(
            "inline-flex items-center gap-1",
            // Under a minute the clock is the only thing that matters.
            deadline - now <= 60_000 && "text-pink",
          )}
        >
          <Timer className="size-3.5 shrink-0" strokeWidth={2.5} />
          {clockLabel(deadline - now)}
        </span>
      }
      // No stepping back out of the warning: it has one thing to say and one
      // button to answer it with.
      onBack={index > 0 && !guard.warning ? () => setIndex(index - 1) : undefined}
      footer={
        guard.warning ? (
          <FocusButton onClick={guard.acknowledge}>បន្តប្រឡង →</FocusButton>
        ) : last ? (
          <FocusButton onClick={() => setSubmitted(true)}>
            ដាក់ស្នើ · {answeredCount}/{scored}
          </FocusButton>
        ) : (
          <FocusButton onClick={() => setIndex(index + 1)}>បន្ត →</FocusButton>
        )
      }
    >
      {guard.warning && <LeaveWarning leaves={guard.leaves} />}

      {/* Hidden rather than unmounted while the warning is up: unmounting would
          throw away the gap-fill step's own selection state, so a student who
          took a call would come back to the passage with no gap chosen. */}
      <div ref={stepRef} className={cn(guard.warning && "hidden")}>
        {/* The rule, where it is unavoidable: on the very first screen of the
            paper. It also sits in the detail screen's "before you begin" list,
            because by here the clock is already running. */}
        {index === 0 && <LeaveRuleBanner />}

        {step.kind === "intro" && <SectionIntro section={step.section} />}

        {step.kind === "gaps" && step.section.gapFill && (
          <PaperGapFillStep
            gapFill={step.section.gapFill}
            answers={answers}
            onChange={setAnswer}
          />
        )}

        {step.kind === "question" && (
          <div className={focusCard}>
            <div className={`mb-2.5 text-purple ${focusKicker}`}>
              {kicker} · {step.section.title}
            </div>
            {/* MathText, not plain text: a maths paper's prompt is LaTeX inside
                `$…$`, and an English paper's is a sentence with no dollars in
                it — splitMath leaves that untouched, so one renderer serves
                both. Khmer stays OUTSIDE the delimiters; see the data file. */}
            <div className={`mb-4 md:mb-6 ${focusPrompt}`}>
              <MathText text={step.question.q.en} />
            </div>
            <div className="flex flex-col gap-2 md:gap-3">
              {step.question.options.map((opt) => {
                const id = step.question.id;
                return (
                  <button
                    key={opt}
                    onClick={() => setAnswer(id, opt)}
                    className={cn(
                      focusOption,
                      answers[id] === opt
                        ? "border-purple/40 bg-purple/10 text-purple"
                        : "border-purple/10 bg-surface text-text hover:bg-purple/5",
                    )}
                  >
                    <MathText text={opt} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step.kind === "writing" && content.writing && (
          <PaperWritingStep writing={content.writing} />
        )}
      </div>
    </FocusLayout>
  );
}

/**
 * The rule, stated before the student can break it.
 *
 * Pink and plain: this is the one thing on the screen that can end the paper,
 * and the app genuinely cannot stop it happening — it can only count. The
 * wording is the user's own.
 */
function LeaveRuleBanner() {
  return (
    <div className="mb-3 flex items-start gap-2 rounded-2xl border border-pink/25 bg-pink/8 p-3.5 text-xs font-bold text-text md:text-sm">
      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-pink" strokeWidth={2.5} />
      <span>
        បម្រាម: ហាមចាកចេញពីកម្មវិធី ឬ បិទអេក្រង់។ ការចាកចេញលើសពី{" "}
        {MAX_EXAM_LEAVES} ដង នឹងធ្វើឱ្យការប្រឡងត្រូវបញ្ចប់ភ្លាមៗ។
      </span>
    </div>
  );
}

/**
 * Shown on RETURN, after an absence that counted.
 *
 * It says which attempt this was out of how many, because "you have been
 * warned" without a number leaves a student guessing how much rope is left. The
 * clock kept running while they were away, and the copy says so rather than
 * letting them discover it.
 */
function LeaveWarning({ leaves }: { leaves: number }) {
  const last = leaves >= MAX_EXAM_LEAVES;
  return (
    <div className={`${focusCard} border-pink/25 bg-pink/8`}>
      <div className={`mb-2.5 flex items-center gap-1.5 text-pink ${focusKicker}`}>
        <ShieldAlert className="size-4 shrink-0" strokeWidth={2.5} />
        ការព្រមាន
      </div>
      <div className={`mb-3 ${focusPrompt}`}>
        អ្នកបានចាកចេញពីអេក្រង់ប្រឡង {leaves}/{MAX_EXAM_LEAVES} ដង
      </div>
      <p className="text-sm font-semibold text-text md:text-base">
        {last
          ? "បើចាកចេញម្តងទៀត ការប្រឡងនឹងបញ្ចប់ភ្លាមៗ ហើយចម្លើយដែលឆ្លើយរួចនឹងត្រូវដាក់ស្នើ។"
          : "សូមនៅលើអេក្រង់នេះរហូតដល់ដាក់ស្នើ។ ការបិទអេក្រង់ ឬ ការចេញទៅកម្មវិធីផ្សេង ក៏រាប់ដែរ។"}
      </p>
      <p className="mt-2 text-xs font-bold text-muted md:text-sm">
        នាឡិកាមិនបានឈប់ទេ ពេលអ្នកចាកចេញ។
      </p>
    </div>
  );
}

/** The part's own cover: its number, instruction and the paper's worked example. */
function SectionIntro({ section }: { section: PaperSection }) {
  const count = section.gapFill
    ? section.gapFill.gaps.filter((gap) => !gap.example).length
    : (section.questions?.length ?? 0);

  return (
    <div className={focusCard}>
      <div className={`mb-2.5 text-purple ${focusKicker}`}>
        {count} សំណួរ
      </div>
      <div className={`mb-3 ${focusPrompt}`}>{section.title}</div>

      {/* THE WHOLE EXERCISE, BEFORE ANY OF ITS SUB-QUESTIONS — the user's rule.
          A written maths part is one exercise with lettered sub-parts, and
          meeting it as a run of isolated taps hides the shape the real exam
          actually has. So the paper's own wording is printed here first, and
          the multiple-choice steps that follow are only how the app marks it.

          MathText + whitespace-pre-line: the statement is LaTeX inside `$…$`
          with Khmer prose around it, and its line breaks are the paper's
          lettered layout. */}
      {section.statement && (
        <div className="mb-4 rounded-xl border border-border bg-control p-3 text-sm leading-relaxed font-semibold whitespace-pre-line text-text md:p-4 md:text-base">
          <MathText text={section.statement} />
        </div>
      )}

      {/* The instruction is how to ANSWER it here, so it reads as the app's
          voice rather than the paper's — which is exactly why it sits under the
          statement rather than above it. */}
      <p className="text-sm font-semibold text-text md:text-base">
        <MathText text={section.instruction} />
      </p>

      {section.example && (
        <div className="mt-4 rounded-xl border border-purple/10 bg-purple/5 p-3 md:p-4">
          <div className={`mb-1 text-purple ${focusLabel}`}>ឧទាហរណ៍</div>
          <p className="text-sm font-semibold text-text md:text-base">
            {section.example}
          </p>
        </div>
      )}
    </div>
  );
}
