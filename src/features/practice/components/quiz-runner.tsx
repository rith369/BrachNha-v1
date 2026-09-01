import { useState } from "react";
import { useNavigate } from "react-router";
import { CircleCheck, CircleX, ListChecks, Trophy } from "lucide-react";
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
import { toKhmerDigits } from "@/utils/khmer-num";
import { Callout } from "@/features/lessons/components/callout";
import type { SectionQuestion } from "@/types";
import type { PracticeMode } from "../practice";

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
 * KHMER-ONLY. See PRACTICE_PAGE_LANG in ../practice.
 */
export function QuizRunner({
  questions,
  subjectId,
  mode,
  title,
}: {
  questions: SectionQuestion[];
  subjectId: string;
  /** Carried only so the X returns to the list the student came from. */
  mode: PracticeMode;
  /** The lesson's name, shown on the completion screen. */
  title: string;
}) {
  const navigate = useNavigate();
  const { addXp, completeTask } = useBrachNhaStore(
    useShallow((s) => ({ addXp: s.addXp, completeTask: s.completeTask }))
  );

  const [index, setIndex] = useState(0);
  // Keyed by question index rather than a single value, so stepping back shows
  // the locked previous answer. An index is safe as the key: the questions come
  // from static data and the array never reorders while this is mounted.
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const total = questions.length;
  const done = index >= total;
  const question = questions[index];
  const answer = answers[index] ?? null;
  const score = questions.filter((q, i) => answers[i] === q.correct).length;

  function exit() {
    navigate(`/practice/${mode}/${subjectId}`);
  }

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
    setAnswers((prev) => ({ ...prev, [index]: option }));
    if (option === question.correct) addXp(QUIZ_XP, QUIZ_COINS);
  }

  function finish() {
    // The SAME `tasks.practice` field Home's daily checklist and Roadmap's Daily
    // Mission read, so a finished quiz is one real completion rather than a
    // second tracker beside the self-reported one.
    completeTask("practice");
    setIndex(total);
  }

  const footer = done ? (
    <FocusButton onClick={exit}>← ត្រឡប់</FocusButton>
  ) : (
    // Disabled until answered rather than absent: a button that appears out of
    // nowhere shifts the layout under the student's thumb.
    <FocusButton
      onClick={() => (index === total - 1 ? finish() : setIndex(index + 1))}
      disabled={!answer}
    >
      {index === total - 1 ? "បញ្ចប់ →" : "បន្ត →"}
    </FocusButton>
  );

  return (
    <FocusLayout
      progressPct={(Math.min(index, total) / total) * 100}
      onExit={exit}
      // Absent on the first question (the X is the only way out) and on the
      // completion screen, where the quiz is already banked.
      onBack={index > 0 && !done ? () => setIndex(index - 1) : undefined}
      showStats
      meta={`${toKhmerDigits(Math.min(index + 1, total))} / ${toKhmerDigits(total)}`}
      footer={footer}
    >
      {done ? (
        <div className="text-center">
          <Trophy
            className="mx-auto mb-3 size-14 text-yellow md:mb-5 md:size-20"
            strokeWidth={2}
          />
          <div className="font-heading mb-2.5 bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent md:text-3xl">
            បញ្ចប់ Quiz!
          </div>
          <div className="mx-auto mb-3 w-fit rounded-2xl bg-brand px-6 py-3 text-center text-white">
            <div className="text-lg font-extrabold">
              {toKhmerDigits(score)} / {toKhmerDigits(total)}
            </div>
            <div className="text-xs font-bold opacity-90">ចម្លើយត្រឹមត្រូវ</div>
          </div>
          <div className="text-xs font-bold text-muted">{title}</div>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex items-center gap-1.5 text-xs font-extrabold text-muted md:mb-4 md:text-sm">
            <ListChecks className="size-4 shrink-0" strokeWidth={2.5} />
            Quiz
          </div>

          <div className={focusCard}>
            {question.scenario && (
              <p className={`mb-3 whitespace-pre-line text-muted ${focusBody}`}>
                {question.scenario}
              </p>
            )}
            <div className={`mb-4 md:mb-6 ${focusPrompt}`}>{question.q}</div>

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
                    {opt}
                  </button>
                );
              })}
            </div>

            {answer && (
              <Callout
                tone={answer === question.correct ? "mint" : "pink"}
                icon={answer === question.correct ? CircleCheck : CircleX}
                label={
                  answer === question.correct ? "ត្រឹមត្រូវ!" : "មិនត្រឹមត្រូវ"
                }
                className="mt-3 md:mt-4"
              >
                <p className={focusBody}>{question.explanation}</p>
              </Callout>
            )}
          </div>
        </div>
      )}
    </FocusLayout>
  );
}
