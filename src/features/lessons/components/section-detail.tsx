import { lazy, Suspense, useState } from "react";
import { useNavigate } from "react-router";
import {
  CircleCheck,
  CircleX,
  ClipboardCheck,
  Lightbulb,
  NotebookPen,
  Trophy,
  TriangleAlert,
} from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { lessonKeyOf } from "@/features/progress/content-keys";
import { useShallow } from "zustand/react/shallow";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import {
  focusBody,
  focusCard,
  focusOption,
  focusPrompt,
} from "@/utils/focus-styles";
// Shared with the practice quiz, so the two cannot pay differently for the same
// action. See the header of utils/rewards.ts.
import { QUIZ_COINS, QUIZ_XP } from "@/utils/rewards";
import { MathText } from "@/components/shell/math-text";
import { Callout } from "./callout";
import { SectionVideoPlayer } from "./section-video";
import type { SectionBlock, SectionContent, SectionQuestion } from "@/types";
import { markLessonFinished } from "@/lib/install-prompt";
import { useFocusScrollTop } from "@/hooks/use-focus-scroll-top";

// three.js + react-three-fiber + drei is a large dependency needed only by the
// sections that carry a model. Behind React.lazy so it downloads on opening one
// of those, not on every section — the same boundary lesson-detail.tsx uses, and
// the same chunk, since both point at this module.
const BrainModelViewer = lazy(() =>
  import("./brain-model-viewer").then((m) => ({ default: m.BrainModelViewer }))
);

/**
 * One SECTION of the real curriculum — the runner behind a playable node on a
 * subject path.
 *
 * TWO steps, each holding several blocks:
 *
 *   0  សេចក្ដីផ្ដើម  +  ឧទាហរណ៍  +  3D model  +  សំណួរ
 *   1  មេរៀន  +  ចំណាំសំខាន់ៗ  +  កំហុស  → done
 *
 * The quiz is INSIDE step 0, under the examples, not a step of its own. It went
 * that way on purpose: the questions are scenarios about everyday life, which is
 * what the examples block just finished being, so they land as "now you try"
 * rather than as a test at the end. Step 0 will not advance until every question
 * is answered.
 *
 * It ran as five one-block steps first. Two is what was asked for, and the
 * grouping is the content's own: step 0 is the orientation — why this matters,
 * then what it looks like in life — and step 1 is the substance a student is
 * accountable for. Every block still renders in its own callout, so merging
 * steps cost nothing structurally; only the step boundaries moved.
 *
 * សេចក្ដីផ្ដើម and មេរៀន carry NO heading. The section title above the first is
 * already its heading, and មេរៀនសង្ខេប was explicitly asked to lose its label —
 * so within each step the unlabelled block leads and the labelled ones follow,
 * which is also what keeps the two readable as one flow rather than a stack.
 *
 * NO EMOJI anywhere in here: headings take Lucide icons, the same swap the rest
 * of the app made because emoji render differently on every handset.
 *
 * Deliberately SEPARATE from lesson-detail.tsx rather than a branch inside it.
 * That component runs the older content/summary/funFact/tip/didYouKnow shape for
 * the two legacy lessons; this one runs the curriculum shape every future
 * section uses. One component doing both would be a permanent fork down the
 * middle of every step.
 *
 * What it does NOT re-invent: the task frame. FocusLayout, FocusButton and the
 * focus-styles size ladder are shared with the lesson flow, the mock exam and
 * the placement test, which is the whole reason those exist — three screens
 * hand-rolling their own progress bar is how they drifted apart the first time.
 *
 * KHMER-ONLY, like the rest of the Study feature. The content itself only exists
 * in Khmer; see the note on SectionContent in types/index.ts.
 */

/**
 * Renders a lesson/example/note block: optional lead paragraph, then items.
 *
 * EVERY string goes through MathText, not out as a bare string. Authored section
 * content is written in LaTeX — the maths sections arrive as `$$ (+3)+(+5)=+8 $$`
 * and `$a-b=a+(-b)$` — and without this the student reads the raw source. Hand
 * converting it to Unicode instead was rejected for the reason recorded for the
 * 2025 maths paper: it is a transcription risk with no upper bound on how
 * quietly it fails, and the author writes in LaTeX anyway.
 *
 * FREE FOR THE SECTIONS THAT DON'T USE IT. `splitMath` leaves a dollar-free
 * string untouched and MathText short-circuits it to one inline node, so the
 * four biology sections — which contain zero `$` — render exactly as before.
 * And it costs no bytes: `math-text-*.js` is already a shared chunk warmed at
 * idle for every student, because quiz-runner.tsx imports it and practice-run is
 * in app.tsx's routeModules.
 *
 * `<div>` rather than `<p>` for the lead and the trailing paragraph, because
 * MathText emits a block `<table>` for a Markdown table — the sign table in
 * math-1-1-1 is one — and a table inside a `<p>` is invalid HTML that the parser
 * silently unnests.
 *
 * KHMER MUST NEVER GO INSIDE `$…$`: KaTeX swaps in maths fonts with no Khmer
 * coverage and renders a row of empty boxes. `splitMath` refuses such a span as
 * a second guard, but authored content should not rely on it.
 */
function Block({ block }: { block: SectionBlock }) {
  return (
    <>
      {block.intro && (
        // whitespace-pre-line so paragraphs written as paragraphs survive —
        // HTML collapses newlines, which is what turned the long brain lesson
        // into one unreadable run-on block before lesson-detail.tsx got this.
        <div className={`mb-3 whitespace-pre-line ${focusBody}`}>
          <MathText text={block.intro} />
        </div>
      )}
      {/* Bulleted, not bare paragraphs. Every one of these blocks is a LIST —
          "the four systems", "what the lesson covers", "two worked examples" —
          and without a marker the items ran together into one wall of Khmer
          with only the bold label to break them up. list-outside keeps the
          wrapped lines aligned under the text rather than under the bullet. */}
      <ul className="flex list-outside list-disc flex-col gap-2.5 pl-5">
        {block.items.map((item, i) => (
          <li key={i} className={focusBody}>
            {item.label && (
              <span className="font-extrabold text-text">
                <MathText text={item.label} />៖{" "}
              </span>
            )}
            {item.body && (
              <span className="whitespace-pre-line">
                <MathText text={item.body} />
              </span>
            )}
            {item.items && (
              <ul className="mt-1.5 flex list-outside list-[circle] flex-col gap-1 pl-5">
                {item.items.map((sub, j) => (
                  <li key={j} className="whitespace-pre-line">
                    <MathText text={sub} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {block.outro && (
        <div className={`mt-3 whitespace-pre-line ${focusBody}`}>
          <MathText text={block.outro} />
        </div>
      )}
    </>
  );
}

/**
 * One multiple-choice question.
 *
 * Answering is final and reveals the result immediately — there is no submit,
 * and no score is kept. These sit inside the teaching part of the section
 * rather than at the end of it: the point is to make a student commit to an
 * answer while the explanation is still one tap away, not to measure them. The
 * section is not an assessment route, and KruAI stays reachable throughout.
 */
function QuizQuestion({
  question,
  answer,
  onAnswer,
}: {
  question: SectionQuestion;
  answer: string | null;
  onAnswer: (opt: string) => void;
}) {
  return (
    <div className={focusCard}>
      {question.scenario && (
        <p className={`mb-3 whitespace-pre-line text-muted ${focusBody}`}>
          <MathText text={question.scenario} />
        </p>
      )}
      <div className={`mb-4 md:mb-6 ${focusPrompt}`}>
        <MathText text={question.q} />
      </div>
      <div className="flex flex-col gap-2 md:gap-3">
        {question.options.map((opt) => {
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
              onClick={() => !answer && onAnswer(opt)}
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
        <Callout
          tone={answer === question.correct ? "mint" : "pink"}
          icon={answer === question.correct ? CircleCheck : CircleX}
          label={answer === question.correct ? "ត្រឹមត្រូវ!" : "មិនត្រឹមត្រូវ"}
          className="mt-3 md:mt-4"
        >
          <p className={focusBody}>
            <MathText text={question.explanation} />
          </p>
        </Callout>
      )}
    </div>
  );
}

export function SectionDetail({
  sectionId,
  section,
}: {
  sectionId: string;
  section: SectionContent;
}) {
  const navigate = useNavigate();
  const {
    lang,
    addXp,
    completeTask,
    completeSession,
    recordQuestions,
    recordSession,
  } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      addXp: s.addXp,
      completeTask: s.completeTask,
      completeSession: s.completeSession,
      recordQuestions: s.recordQuestions,
      recordSession: s.recordSession,
    }))
  );

  // The LESSON this section belongs to — "biology-3-1-1" -> "biology-3-1".
  // Computed here rather than inside the handlers because it depends only on a
  // prop, and both handlers want it.
  const contentKey = lessonKeyOf(sectionId);

  const [step, setStep] = useState(0);
  // Back to the top of the task's scroller on every step change; without
  // it a long step leaves the next one opening at the bottom. See the hook.
  useFocusScrollTop(step);
  // Keyed by "{step}-{index}", NOT by index alone. There are two quizzes now —
  // the easier half on step 0 and the applied half on step 1 — and a bare index
  // would make question 0 of one answer question 0 of the other, marking a
  // question the student has never seen. The questions come from static data and
  // neither array reorders while the component is mounted, so the index half of
  // the key is stable.
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // THE SPLIT IS THE SECTION'S TEACHING ORDER, not a difficulty label the UI
  // shows. Step 0 may only ask what the video and the examples have covered;
  // anything the RULES on step 1 are needed for belongs in quizHarder, or the
  // question is asked before it is taught.
  const quiz = section.quiz ?? [];
  const quizHarder = section.quizHarder ?? [];
  // Always two steps. The quiz used to be a third, and moving it inline under
  // the examples is what removed it — see the step map at the top of the file.
  const total = 2;
  const pct = Math.round((Math.min(step, total) / total) * 100);

  // Every question must be answered before leaving step 0. A quiz that can be
  // walked past is not a quiz, and nothing is lost by asking: answering reveals
  // the explanation rather than scoring anyone.
  const quizDone = quiz.every((_, i) => answers[`0-${i}`]);
  const quizHarderDone = quizHarder.every((_, i) => answers[`1-${i}`]);

  /**
   * The reward figures and the reasoning behind them live in utils/rewards.ts,
   * shared with the practice quiz.
   *
   * Awarded ONCE per question and only on the first tap, which is guaranteed
   * rather than guarded: `answers[i]` is set in the same handler and the option
   * buttons are `disabled` from then on, so a question cannot be re-answered.
   */
  function answerQuestion(
    key: string,
    question: SectionQuestion,
    option: string
  ) {
    if (answers[key]) return;
    // The QUESTION is passed in rather than looked up by index. Two lists means
    // an index alone no longer identifies a question, and it also keeps this
    // closure from reading INTO a possibly-undefined array element — the
    // property path the React Compiler narrows a memo dependency onto, which is
    // the crash review-session.tsx documents.
    const right = option === question.correct;
    setAnswers((prev) => ({ ...prev, [key]: option }));
    if (right) addXp(QUIZ_XP, QUIZ_COINS);
    // The same once-per-question guarantee the XP relies on covers this, so the
    // count cannot be inflated by re-tapping. Progress reads this and nothing
    // else for its per-subject figures.
    recordQuestions(contentKey, 1, right ? 1 : 0);
  }

  function exit() {
    navigate(`/subjects/${sectionId.split("-")[0]}`);
  }

  function finish() {
    completeTask("lesson");
    recordSession(contentKey);
    // completedSessions matches on the SECTION id, which is the same string the
    // path node carries — there is no second id to keep in step.
    completeSession(sectionId);
    // Queues the "add to home screen" pop-up for when the student leaves the
    // completion screen — once per device. See lib/install-prompt.ts.
    markLessonFinished();
    setStep(total);
  }

  const cont = "បន្ត →";
  const footer =
    step === 0 ? (
      // Disabled rather than absent while the quiz is unanswered: a button that
      // appears out of nowhere shifts the layout under the student's thumb.
      <FocusButton onClick={() => setStep(1)} disabled={!quizDone}>
        {cont}
      </FocusButton>
    ) : step === 1 ? (
      // Same rule as step 0: a quiz that can be walked past is not a quiz.
      <FocusButton onClick={finish} disabled={!quizHarderDone}>
        {cont}
      </FocusButton>
    ) : (
      <FocusButton onClick={exit}>← ត្រឡប់</FocusButton>
    );

  // Back is available on every step except the first (where the X is the only
  // way out) and the completion screen (where the section is already banked —
  // stepping back into the quiz from there would let it be re-answered after
  // the XP had been awarded).
  const canGoBack = step > 0 && step < total;

  return (
    <FocusLayout
      progressPct={pct}
      onExit={exit}
      onBack={canGoBack ? () => setStep(step - 1) : undefined}
      showStats
      meta={`${Math.min(step, total)} / ${total}`}
      footer={footer}
    >
      <div>
        {step === 0 && (
          <div className="flex flex-col gap-3">
            <div className="text-xl font-extrabold md:text-3xl">
              <MathText text={section.title} />
            </div>
            {section.video && (
              <SectionVideoPlayer video={section.video} title={section.title} />
            )}
            <Callout tone="mint">
              <Block block={section.intro} />
            </Callout>
            <Callout tone="yellow" icon={Lightbulb} label="ឧទាហរណ៍">
              <Block block={section.examples} />
            </Callout>

            {section.model3d && (
              <Suspense
                fallback={
                  <div
                    className={`flex h-64 items-center justify-center md:h-80 lg:h-96 ${focusCard}`}
                  >
                    កំពុងផ្ទុកម៉ូឌែល 3D…
                  </div>
                }
              >
                <div className="h-64 w-full overflow-hidden rounded-2xl border border-purple/15 bg-surface md:h-80 lg:h-96">
                  <BrainModelViewer model={section.model3d} lang={lang} />
                </div>
              </Suspense>
            )}

            {quiz.length > 0 && (
              <>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-extrabold text-muted md:text-sm">
                  <ClipboardCheck className="size-4 shrink-0" strokeWidth={2.5} />
                  សំណួរ
                </div>
                {quiz.map((q, i) => (
                  <QuizQuestion
                    key={i}
                    question={q}
                    answer={answers[`0-${i}`] ?? null}
                    onAnswer={(opt) => answerQuestion(`0-${i}`, q, opt)}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-3">
            <Callout tone="blue">
              <Block block={section.lesson} />
            </Callout>

            <Callout tone="purple" icon={NotebookPen} label="ចំណាំសំខាន់ៗ">
              <Block block={section.notes} />
            </Callout>

            <div className="mt-1 flex items-center gap-1.5 text-xs font-extrabold text-muted md:text-sm">
              <TriangleAlert className="size-4 shrink-0" strokeWidth={2.5} />
              កំហុសឆ្គងដែលសិស្សតែងតែយល់ច្រឡំ
            </div>
            {section.mistakes.map((m, i) => (
              // The misconception is the OUTER card and the truth is nested
              // inside it, rather than two cards side by side: the pairing is
              // the teaching, and separating them lets a student read the wrong
              // half on its own.
              <Callout key={i} tone="pink" icon={CircleX} label="យល់ច្រឡំថា">
                <p className={`whitespace-pre-line ${focusBody}`}>
                  <MathText text={m.wrong} />
                </p>
                {/* bg-control, not the default bg-surface: the outer card is
                    already surface, so a nested one on the same background
                    would have nothing but its stripe to separate it. `cn` is
                    twMerge, so this overrides rather than stacks. */}
                <Callout
                  tone="mint"
                  icon={CircleCheck}
                  label="ការពិត"
                  className="mt-3 bg-control"
                >
                  <p className={`whitespace-pre-line ${focusBody}`}>
                    <MathText text={m.right} />
                  </p>
                </Callout>
              </Callout>
            ))}

            {/* The applied practice, LAST on the step — after the rules, the
                notes and the mistakes, so every question here has been taught
                before it is asked. Same heading and the same component as
                step 0's; only the list differs. */}
            {quizHarder.length > 0 && (
              <>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-extrabold text-muted md:text-sm">
                  <ClipboardCheck className="size-4 shrink-0" strokeWidth={2.5} />
                  សំណួរអនុវត្ត
                </div>
                {quizHarder.map((q, i) => (
                  <QuizQuestion
                    key={i}
                    question={q}
                    answer={answers[`1-${i}`] ?? null}
                    onAnswer={(opt) => answerQuestion(`1-${i}`, q, opt)}
                  />
                ))}
              </>
            )}
          </div>
        )}


        {step >= total && (
          <div className="text-center">
            <Trophy
              className="mx-auto mb-3 size-14 text-yellow md:mb-5 md:size-20"
              strokeWidth={2}
            />
            <div className="font-heading mb-2.5 bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent md:text-3xl">
              បញ្ចប់ផ្នែកនេះ!
            </div>
            <div className="mx-auto mb-3 w-fit rounded-2xl bg-brand px-6 py-3 text-center text-white">
              <div className="text-lg font-extrabold">+20 XP</div>
              <div className="text-xs font-bold opacity-90">ពិន្ទុទទួលបាន</div>
            </div>
            <div className="text-xs font-bold text-muted">{section.title}</div>
          </div>
        )}
      </div>
    </FocusLayout>
  );
}
