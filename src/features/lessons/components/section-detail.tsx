import { useState } from "react";
import { useNavigate } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import {
  focusBody,
  focusCard,
  focusOption,
  focusPrompt,
} from "@/utils/focus-styles";
import { Callout } from "./callout";
import type { SectionBlock, SectionContent } from "@/types";

/**
 * One SECTION of the real curriculum — the runner behind a playable node on a
 * subject path.
 *
 * Four steps, in the order the content is written in:
 *   0 មេរៀនសង្ខេប → 1 ឧទាហរណ៍ → 2 ចំណាំសំខាន់ៗ → 3 កំហុស → [4 quiz] → done
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

/** Renders a lesson/example/note block: optional lead paragraph, then items. */
function Block({ block }: { block: SectionBlock }) {
  return (
    <>
      {block.intro && (
        // whitespace-pre-line so paragraphs written as paragraphs survive —
        // HTML collapses newlines, which is what turned the long brain lesson
        // into one unreadable run-on block before lesson-detail.tsx got this.
        <p className={`mb-3 whitespace-pre-line ${focusBody}`}>{block.intro}</p>
      )}
      <div className="flex flex-col gap-2.5">
        {block.items.map((item, i) => (
          <div key={i} className={focusBody}>
            {item.label && (
              <span className="font-extrabold text-text">{item.label}៖ </span>
            )}
            {item.body && (
              <span className="whitespace-pre-line">{item.body}</span>
            )}
            {item.items && (
              <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-5">
                {item.items.map((sub, j) => (
                  <li key={j} className="whitespace-pre-line">
                    {sub}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </>
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
  const { completeTask, completeSession } = useBrachNhaStore(
    useShallow((s) => ({
      completeTask: s.completeTask,
      completeSession: s.completeSession,
    }))
  );

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const quiz = section.quiz;
  // The quiz counts as a step only when a question exists. Counting it in the
  // total regardless would leave the progress bar stopping at 80% on every
  // section that has no question — which today is all of them.
  const total = quiz ? 5 : 4;
  const pct = Math.round((Math.min(step, total) / total) * 100);

  function exit() {
    navigate(`/subjects/${sectionId.split("-")[0]}`);
  }

  function finish() {
    completeTask("lesson");
    // completedSessions matches on the SECTION id, which is the same string the
    // path node carries — there is no second id to keep in step.
    completeSession(sectionId);
    setStep(total);
  }

  // Deciding the next step in the handler, not by rendering a step and escaping
  // it in an effect. That render-time-setState pattern is the one lesson-detail
  // records having been ported in and then removed.
  const afterMistakes = () => (quiz ? setStep(4) : finish());

  const cont = "បន្ត →";
  const footer =
    step === 0 ? (
      <FocusButton onClick={() => setStep(1)}>{cont}</FocusButton>
    ) : step === 1 ? (
      <FocusButton onClick={() => setStep(2)}>{cont}</FocusButton>
    ) : step === 2 ? (
      <FocusButton onClick={() => setStep(3)}>{cont}</FocusButton>
    ) : step === 3 ? (
      <FocusButton onClick={afterMistakes}>
        {quiz ? "តេស្ត! 🎯" : cont}
      </FocusButton>
    ) : step === 4 && quiz ? (
      // Disabled rather than absent until an answer is picked: a button that
      // appears out of nowhere shifts the layout under the student's thumb.
      <FocusButton onClick={finish} disabled={!selected}>
        {cont}
      </FocusButton>
    ) : (
      <FocusButton onClick={exit}>← ត្រឡប់</FocusButton>
    );

  return (
    <FocusLayout
      progressPct={pct}
      onExit={exit}
      meta={`${Math.min(step, total)} / ${total}`}
      footer={footer}
    >
      <div>
        {step === 0 && (
          <div>
            <div className="mb-3 text-xl font-extrabold md:mb-4 md:text-3xl">
              {section.title}
            </div>
            <Callout tone="blue" label="📖 មេរៀនសង្ខេប">
              <Block block={section.lesson} />
            </Callout>
          </div>
        )}

        {step === 1 && (
          <Callout tone="yellow" label="💡 ឧទាហរណ៍">
            <Block block={section.examples} />
          </Callout>
        )}

        {step === 2 && (
          <Callout tone="purple" label="📝 ចំណាំសំខាន់ៗ">
            <Block block={section.notes} />
          </Callout>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-3">
            <div className="text-xs font-extrabold text-muted md:text-sm">
              ⚠️ កំហុសឆ្គងដែលសិស្សតែងតែយល់ច្រឡំ
            </div>
            {section.mistakes.map((m, i) => (
              // The misconception is the OUTER card and the truth is nested
              // inside it, rather than two cards side by side: the pairing is
              // the teaching, and separating them lets a student read the wrong
              // half on its own.
              <Callout key={i} tone="pink" label="❌ យល់ច្រឡំថា">
                <p className={`whitespace-pre-line ${focusBody}`}>{m.wrong}</p>
                {/* bg-control, not the default bg-surface: the outer card is
                    already surface, so a nested one on the same background
                    would have nothing but its stripe to separate it. `cn` is
                    twMerge, so this overrides rather than stacks. */}
                <Callout tone="mint" label="✍️ ការពិត" className="mt-3 bg-control">
                  <p className={`whitespace-pre-line ${focusBody}`}>{m.right}</p>
                </Callout>
              </Callout>
            ))}
          </div>
        )}

        {step === 4 && quiz && (
          <div className={focusCard}>
            <div className={`mb-4 md:mb-6 ${focusPrompt}`}>{quiz.q}</div>
            <div className="flex flex-col gap-2 md:gap-3">
              {quiz.options.map((opt) => {
                const state = !selected
                  ? "neutral"
                  : opt === quiz.correct
                    ? "correct"
                    : opt === selected
                      ? "wrong"
                      : "neutral";
                return (
                  <button
                    key={opt}
                    disabled={!!selected}
                    onClick={() => !selected && setSelected(opt)}
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
            {selected && (
              <Callout
                tone={selected === quiz.correct ? "mint" : "pink"}
                label={
                  selected === quiz.correct ? "ត្រឹមត្រូវ!" : "មិនត្រឹមត្រូវ"
                }
                className="mt-3 md:mt-4"
              >
                <p className={focusBody}>{quiz.explanation}</p>
              </Callout>
            )}
          </div>
        )}

        {step >= total && (
          <div className="text-center">
            <div className="mb-3 text-6xl md:mb-5 md:text-8xl">🎉</div>
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
