import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ListChecks, Timer } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import {
  focusBody,
  focusCard,
  focusOption,
  focusPrompt,
} from "@/utils/focus-styles";
import { QUIZ_COINS, QUIZ_XP } from "@/utils/rewards";
import { clockLabel } from "@/features/exam/paper-scoring";
import { QuizFeedback } from "@/components/feedback-accordion";
import { MathText } from "@/components/shell/math-text";
import type { SectionQuestion } from "@/types";
import type { PracticeMode } from "../practice";
import { lessonKeyOf } from "@/features/progress/content-keys";

/**
 * A lesson's quiz, one question at a time.
 *
 * THIS IS PRACTICE, NOT A TEST, and every difference from ExamRunner follows
 * from that one decision:
 *
 *  - Answering is final and reveals the result and the explanation IMMEDIATELY.
 *    There is no submit-at-the-end, because the point is to make a student
 *    commit while the explanation is one tap away — the same shape SectionDetail
 *    already uses for the questions inside a section.
 *  - KruAI stays reachable. Focus mode here comes from the ROUTE
 *    (isPracticeRunRoute in utils/focus-routes.ts), not from the store's
 *    `focusMode` flag, which useMentorBlocked() reads as "a mock exam is being
 *    answered". hooks/use-focus-mode.ts warns that borrowing that flag for a
 *    second reason is exactly how the two questions come apart; this doesn't.
 *  - No confirmExit. Leaving discards nothing — answers are scored and paid for
 *    as they are given, so there is no attempt to lose.
 *  - The result NEVER reaches addExamResult. `examResults` captions Home's stat
 *    pill "from mock exams" and feeds chat-prompt.ts an average mock-exam
 *    percentage it states to KruAI as fact, which is why past-paper and
 *    placement-test attempts are already kept out. A practice quiz is the same
 *    case; when practice deserves a history it should be a separate persisted
 *    field, not a widening of this one.
 *
 * TWO CLOCKS, AND BOTH COUNT UP. One for the sitting, one for the question on
 * screen. Neither is a limit and nothing runs out: CLAUDE.md records why a
 * per-question COUNTDOWN was built for the Game and then removed — there is no
 * honest number for how long one question should take, so any limit would be
 * invented, and a practice quiz has even less claim to one than a race against
 * another student. They measure, so a student can see themselves getting
 * faster; that is all.
 *
 * The times are kept in STATE, written only from event handlers. A ref mutated
 * during render would trip oxlint's react(purity), and an effect syncing them
 * would trip react(set-state-in-effect); the start of question N+1 is stamped
 * by the tap that advances to it, which is the one moment that cannot be wrong.
 *
 * IT REPORTS THE ATTEMPT OUT rather than recording it — `onSubmit` — the same
 * shape PastPaperRunner and ExamRunner use. Per-question XP stays here because
 * it is paid as each answer lands, which is the whole point of practice; what
 * belongs to the ATTEMPT (the history row, the daily task, the path node) is
 * QuizScreen's, so one place decides what a finished sitting counts as.
 *
 * KHMER-ONLY. See PRACTICE_PAGE_LANG in ../practice.
 */

/** What a finished sitting reports out. */
export interface QuizAttempt {
  score: number;
  total: number;
  pct: number;
  /** Whole sitting, milliseconds. */
  ms: number;
  /** Per question, index-aligned. */
  questionMs: number[];
  answers: (string | null)[];
}

export function QuizRunner({
  questions,
  subjectId,
  contentKey,
  mode,
  onSubmit,
}: {
  questions: SectionQuestion[];
  subjectId: string;
  /** The lesson key this quiz belongs to ("biology-3-1"), for the content log
   *  Progress reads. Passed in rather than rebuilt from subjectId + lessonRef,
   *  because pages/practice-run.tsx already has it. */
  contentKey: string;
  /** Carried only so the X returns to the list the student came from. */
  mode: PracticeMode;
  /** Handed the finished sitting. QuizScreen decides what it counts as. */
  onSubmit: (attempt: QuizAttempt) => void;
}) {
  const navigate = useNavigate();
  const { addXp, recordQuestions } = useBrachNhaStore(
    useShallow((s) => ({ addXp: s.addXp, recordQuestions: s.recordQuestions }))
  );

  const [index, setIndex] = useState(0);
  // Keyed by question index rather than a single value, so stepping back shows
  // the locked previous answer. An index is safe as the key: the questions come
  // from static data and the array never reorders while this is mounted.
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Lazy initial state, so the clock starts when the runner mounts rather than
  // whenever a render happens to run. `starts` stamps the moment each question
  // came on screen; `spent` freezes it the moment the question is answered.
  const [startedAt] = useState(() => Date.now());
  const [starts, setStarts] = useState<Record<number, number>>(() => ({
    0: Date.now(),
  }));
  const [spent, setSpent] = useState<Record<number, number>>({});
  const [now, setNow] = useState(() => Date.now());

  // One interval for both clocks — the Game's rule, so a second timer is never
  // started beside the first. setState from the interval CALLBACK, never
  // synchronously in the effect body, which is what react(set-state-in-effect)
  // objects to.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const total = questions.length;
  const done = index >= total;
  const answer = answers[index] ?? null;
  const score = questions.filter((q, i) => answers[i] === q.correct).length;

  function exit() {
    navigate(`/practice/${mode}/${subjectId}`);
  }

  function finish() {
    onSubmit({
      score,
      total,
      pct: total === 0 ? 0 : Math.round((score / total) * 100),
      ms: Date.now() - startedAt,
      questionMs: questions.map((_, i) => spent[i] ?? 0),
      answers: questions.map((_, i) => answers[i] ?? null),
    });
  }

  /**
   * THIS EARLY RETURN MUST STAY ABOVE `answerQuestion` — it is not stylistic.
   *
   * `questions[index]` is undefined once `finish()` sets `index = total`, and
   * `answerQuestion` reads INTO it (`question.correct`). The React Compiler
   * narrows a closure's memo dependency to the exact property path it reads and
   * emits that check where the closure is BUILT, which is above any guard that
   * comes later in source order — so a guard expressed only as a JSX ternary
   * (which is what this used to be) protects nothing, and the dependency check
   * throws on the render after the final answer.
   *
   * That is the crash documented in review-session.tsx, which is why the
   * terminal screen is a separate component here: it makes the guard a one-line
   * return that can sit above the closure. Neither tsc nor oxlint can see this,
   * and it only reproduces on the LAST question — so exercise the end of the
   * flow after touching this file.
   */
  if (done) {
    // Unreachable in practice — finish() hands the attempt up and QuizScreen
    // swaps this component out for the review in the same commit. It stays as a
    // one-line guard above `answerQuestion` for the reason the comment above
    // gives: the guard's JOB is to sit there, not to be reached.
    return null;
  }

  const question = questions[index];

  /**
   * Reward figures and the reasoning behind them live in utils/rewards.ts,
   * shared with SectionDetail so the two cannot pay differently for the same
   * action.
   *
   * Awarded ONCE per question and only on the first tap, which is guaranteed
   * rather than guarded: `answers[index]` is set in the same handler and the
   * option buttons are `disabled` from then on, so stepping back and forward
   * cannot re-answer a question or bank its XP twice.
   */
  function answerQuestion(option: string) {
    if (answers[index]) return;
    const right = option === question.correct;
    setAnswers((prev) => ({ ...prev, [index]: option }));
    if (right) addXp(QUIZ_XP, QUIZ_COINS);
    // lessonKeyOf, because contentKey is a SECTION key here — the quiz path
    // routes at `math-1-1-1`, three numbers, where every other writer in the
    // app holds a lesson key already (section-detail.tsx collapses the same
    // way). The content log's documented grain is the lesson; logging the
    // section would put two grains in one record for one real lesson.
    recordQuestions(lessonKeyOf(contentKey), 1, right ? 1 : 0);
    // Freeze this question's clock at the tap. It keeps ticking on screen only
    // while the question is unanswered, so the time reported is thinking time
    // rather than however long the student then spent reading the explanation
    // and the exercises under it.
    setSpent((prev) =>
      prev[index] !== undefined
        ? prev
        : { ...prev, [index]: Date.now() - (starts[index] ?? startedAt) }
    );
  }

  /** Advance, stamping the next question's start in the same tap. */
  function next() {
    const to = index + 1;
    setStarts((prev) => (prev[to] === undefined ? { ...prev, [to]: Date.now() } : prev));
    setIndex(to);
  }

  // Live while the question is open, frozen once it is answered.
  const questionMs = spent[index] ?? now - (starts[index] ?? startedAt);

  const footer = (
    // Disabled until answered rather than absent: a button that appears out of
    // nowhere shifts the layout under the student's thumb.
    <FocusButton
      onClick={() => (index === total - 1 ? finish() : next())}
      disabled={!answer}
    >
      {index === total - 1 ? "បញ្ចប់ →" : "បន្ត →"}
    </FocusButton>
  );

  return (
    <FocusLayout
      progressPct={(index / total) * 100}
      onExit={exit}
      // Absent on the first question — the X is the only way out there.
      onBack={index > 0 ? () => setIndex(index - 1) : undefined}
      showStats
      meta={`${index + 1} / ${total} · ${clockLabel(now - startedAt)}`}
      footer={footer}
    >
      <div>
        <div className="mb-3 flex items-center gap-1.5 text-xs font-extrabold text-muted md:mb-4 md:text-sm">
          <ListChecks className="size-4 shrink-0" strokeWidth={2.5} />
          Quiz
          {/* The question's own clock, beside the label rather than in the top
              bar: at the 320px floor that row is already a 32px button, a
              flexible progress bar and "3 / 10", and a fourth chip would leave
              the bar a few pixels wide — the same argument FocusLayout's
              showStats row settles the same way. */}
          <span className="ml-auto inline-flex items-center gap-1 tabular-nums">
            <Timer className="size-3.5 shrink-0" strokeWidth={2.5} />
            {clockLabel(questionMs)}
          </span>
        </div>

        <div className={focusCard}>
          {question.scenario && (
            <p className={`mb-3 whitespace-pre-line text-muted ${focusBody}`}>
              <MathText text={question.scenario} />
            </p>
          )}
          {/* MathText, not a bare string, so a maths question can carry LaTeX —
              `$\lim_{x 	o 3}(2x^2-5x+1)$` typesets, and a question with no
              dollar signs (every biology one) comes back as a single text
              segment, i.e. exactly what it rendered before. */}
          <div className={`mb-4 md:mb-6 ${focusPrompt}`}>
            <MathText text={question.q} />
          </div>

          <div className="flex flex-col gap-2 md:gap-3">
            {question.options.map((opt) => {
              // `correct` is compared by string equality, so an option's
              // ក./ខ./គ./ឃ. prefix has to be carried in the data's `correct`
              // too — see SectionQuestion in types/index.ts.
              const state = !answer
                ? "neutral"
                : opt === question.correct
                  ? "correct"
                  : opt === answer
                    ? "wrong"
                    : "neutral";
              return (
                <button
                  key={opt}
                  disabled={!!answer}
                  onClick={() => answerQuestion(opt)}
                  className={
                    focusOption +
                    " " +
                    (state === "correct"
                      ? "border-mint/40 bg-mint/10 text-mint"
                      : state === "wrong"
                        ? "border-pink/40 bg-pink/10 text-pink"
                        : "border-purple/10 bg-surface text-text hover:bg-purple/5")
                  }
                >
                  <MathText text={opt} />
                </button>
              );
            })}
          </div>

          {answer && (
            <QuizFeedback
              key={index}
              answer={answer}
              correct={question.correct}
              explanation={question.explanation}
              help={question.help}
            />
          )}
        </div>
      </div>
    </FocusLayout>
  );
}
