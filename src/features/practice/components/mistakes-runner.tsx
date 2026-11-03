import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { CheckCircle2 } from "lucide-react";
import { QuizFeedback } from "@/components/feedback-accordion";
import { ReportMistake } from "@/components/report-mistake";
import { FocusButton, FocusLayout } from "@/components/shell/focus-layout";
import { MathText } from "@/components/shell/math-text";
import { resolveContentRef, type ContentSets, type ResolvedQuestion } from "@/features/admin/content-ref";
import { useFocusScrollTop } from "@/hooks/use-focus-scroll-top";
import { prefetchBody, retryBody, useContentBody } from "@/lib/content";
import { useBrachNhaStore } from "@/lib/store";
import { focusBody, focusCard, focusOption, focusPrompt } from "@/utils/focus-styles";
import { QUIZ_COINS, QUIZ_XP } from "@/utils/rewards";
import { mistakeProgressKey, type LiveMistake } from "../mistakes";
import { ContentNotice } from "./content-waiting";

const EXIT_TO = "/practice/mistakes";

/**
 * One round of "practice what I got wrong".
 *
 * THE QUEUE IS FROZEN when the round starts: a right answer removes the question from
 * the store straight away, and a live list would shrink under the index.
 *
 * A wrong answer here does not come back in the same round, for the reason flashcards
 * do not: seeing a question again seconds after being shown the answer teaches
 * recognition, not recall. It stays on the list for the next round.
 *
 * Each question is fetched when it comes on screen, and the next one is warmed. A round
 * of 20 from several papers must not download every paper first.
 */
export function MistakesRunner({ queue: initial }: { queue: LiveMistake[] }) {
  const [queue] = useState(initial);
  const [index, setIndex] = useState(0);
  const [fixed, setFixed] = useState(0);
  useFocusScrollTop(index);

  const next = queue[index + 1];
  useEffect(() => {
    if (next) prefetchBody(next.parsed.kind, next.parsed.key, next.version);
  }, [next]);

  const current = queue[index];
  // Above everything that reads into it: `current` is undefined once the round is over.
  if (!current) return <RoundOver total={queue.length} fixed={fixed} />;

  return (
    <MistakeStep
      key={index}
      mistake={current}
      number={index + 1}
      total={queue.length}
      onRight={() => setFixed((n) => n + 1)}
      onNext={() => setIndex(index + 1)}
    />
  );
}

/** Fetches this question, then hands it to a component that can rely on having it. */
function MistakeStep({
  mistake,
  number,
  total,
  onRight,
  onNext,
}: {
  mistake: LiveMistake;
  number: number;
  total: number;
  onRight: () => void;
  onNext: () => void;
}) {
  const navigate = useNavigate();
  const { kind, key } = mistake.parsed;
  const body = useContentBody(kind, key, mistake.version);
  const progressPct = ((number - 1) / total) * 100;
  const exit = () => navigate(EXIT_TO);

  if (body.status === "loading" || body.status === "offline") {
    return (
      <FocusLayout progressPct={progressPct} onExit={exit} meta={`${number} / ${total}`}>
        <ContentNotice state={body.status} onRetry={() => retryBody(kind, key, mistake.version)} />
      </FocusLayout>
    );
  }

  const sets: ContentSets = { quiz: {}, section: {}, paper: {} };
  if (body.status === "ready") (sets[kind] as Record<string, unknown>)[key] = body.body;
  const question = resolveContentRef(mistake.ref, sets);

  if (!question) return <GoneStep mistake={mistake} progressPct={progressPct} number={number} total={total} onNext={onNext} />;

  return (
    <QuestionStep
      mistake={mistake}
      question={question}
      progressPct={progressPct}
      number={number}
      total={total}
      onRight={onRight}
      onNext={onNext}
    />
  );
}

/**
 * The question was removed or renumbered since it was missed. Said plainly, and the
 * tap takes it off the list, because no answer could ever clear it.
 */
function GoneStep({
  mistake,
  progressPct,
  number,
  total,
  onNext,
}: {
  mistake: LiveMistake;
  progressPct: number;
  number: number;
  total: number;
  onNext: () => void;
}) {
  const navigate = useNavigate();
  return (
    <FocusLayout
      progressPct={progressPct}
      onExit={() => navigate(EXIT_TO)}
      meta={`${number} / ${total}`}
      footer={
        <FocusButton
          onClick={() => {
            useBrachNhaStore.getState().noteAnswers([{ ref: mistake.ref, right: true }]);
            onNext();
          }}
        >
          បន្ត →
        </FocusButton>
      }
    >
      <div className={focusCard}>
        <p className={`text-text ${focusBody}`}>សំណួរនេះត្រូវបានផ្លាស់ប្តូរ ហើយមិនមានទៀតទេ។</p>
      </div>
    </FocusLayout>
  );
}

function QuestionStep({
  mistake,
  question,
  progressPct,
  number,
  total,
  onRight,
  onNext,
}: {
  mistake: LiveMistake;
  question: ResolvedQuestion;
  progressPct: number;
  number: number;
  total: number;
  onRight: () => void;
  onNext: () => void;
}) {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState<string | null>(null);

  function pick(option: string) {
    if (answer) return;
    setAnswer(option);
    const right = option === question.correct;
    const store = useBrachNhaStore.getState();
    store.noteAnswers([{ ref: mistake.ref, right }]);
    // The same pay and the same log as any other practice answer. It cannot be
    // farmed: a right answer here removes the question from the list.
    if (right) {
      store.addXp(QUIZ_XP, QUIZ_COINS);
      onRight();
    }
    store.recordQuestions(mistakeProgressKey(mistake.parsed), 1, right ? 1 : 0);
  }

  return (
    <FocusLayout
      progressPct={progressPct}
      onExit={() => navigate(EXIT_TO)}
      showStats
      meta={`${number} / ${total}`}
      footer={
        <FocusButton onClick={onNext} disabled={!answer}>
          {number === total ? "បញ្ចប់ →" : "បន្ត →"}
        </FocusButton>
      }
    >
      <div className={focusCard}>
        <div className="mb-2.5 text-xs font-extrabold text-purple md:text-sm">{question.title}</div>

        {/* A past paper's sub-question means nothing without its exercise. */}
        {question.statement && (
          <div className="mb-4 rounded-xl border border-border bg-control p-3 text-sm leading-relaxed font-semibold whitespace-pre-line text-text md:p-4 md:text-base">
            <MathText text={question.statement} />
          </div>
        )}
        {question.scenario && (
          <p className={`mb-3 whitespace-pre-line text-muted ${focusBody}`}>
            <MathText text={question.scenario} />
          </p>
        )}
        <div className={`mb-4 md:mb-6 ${focusPrompt}`}>
          <MathText text={question.prompt} />
        </div>

        <div className="flex flex-col gap-2 md:gap-3">
          {question.options.map((option) => {
            const state = !answer
              ? "neutral"
              : option === question.correct
                ? "correct"
                : option === answer
                  ? "wrong"
                  : "neutral";
            return (
              <button
                key={option}
                type="button"
                disabled={!!answer}
                onClick={() => pick(option)}
                className={
                  focusOption +
                  " " +
                  (state === "correct"
                    ? "border-border bg-mint/30 text-text"
                    : state === "wrong"
                      ? "border-border bg-pink/30 text-text"
                      : "border-border bg-surface text-text hover:bg-purple/5")
                }
              >
                <MathText text={option} />
              </button>
            );
          })}
        </div>

        {answer && (
          <>
            <QuizFeedback
              answer={answer}
              correct={question.correct}
              explanation={question.explanation}
              help={question.help}
            />
            <ReportMistake contentRef={mistake.ref} className="mt-3" />
          </>
        )}
      </div>
    </FocusLayout>
  );
}

/** How the round went, and whether there is more. */
function RoundOver({ total, fixed }: { total: number; fixed: number }) {
  const navigate = useNavigate();
  const left = useBrachNhaStore((s) => s.mistakes.length);
  return (
    <FocusLayout progressPct={100} onExit={() => navigate(EXIT_TO)}>
      <div className={`${focusCard} text-center`}>
        <CheckCircle2 className="mx-auto size-12 text-mint" strokeWidth={2} />
        <div className={`mt-2 ${focusPrompt}`}>បានកែ {fixed}/{total} សំណួរ</div>
        <p className={`mt-1 text-muted ${focusBody}`}>
          {left > 0 ? `នៅសល់ ${left} សំណួរក្នុងបញ្ជី។` : "មិនមានកំហុសនៅសល់ទេ។"}
        </p>
        <Link
          to={EXIT_TO}
          className="mt-4 block rounded-2xl border border-border bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-cta"
        >
          ត្រឡប់ទៅបញ្ជី
        </Link>
      </div>
    </FocusLayout>
  );
}
