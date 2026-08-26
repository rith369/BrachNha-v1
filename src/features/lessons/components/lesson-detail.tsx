import { lazy, Suspense, useState } from "react";
import { useNavigate } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useT } from "@/data/translations";
import { FocusLayout, FocusButton } from "@/components/shell/focus-layout";
import {
  focusCard,
  focusPrompt,
  focusBody,
  focusLabel,
  focusOption,
} from "@/utils/focus-styles";
import { LESSONS, FOUNDATION, FLASHCARDS, PRACTICE } from "@/data/lessons";
import type { Lesson } from "@/types";

// Three.js + react-three-fiber + drei together are a meaningfully large
// dependency, only needed for the one lesson with a 3D model. Split off
// behind React.lazy so it downloads only when that lesson is opened, not on
// every visit to the lessons feature. See the header of
// brain-model-viewer.tsx.
const BrainModelViewer = lazy(() =>
  import("./brain-model-viewer").then((m) => ({ default: m.BrainModelViewer }))
);

const TOTAL_STEPS = 6;

function getLessonData(lessonId: string): Lesson {
  if (lessonId === "math-foundation") return FOUNDATION.math;
  if (lessonId === "biology-foundation") return FOUNDATION.biology;
  const [cat, topic] = lessonId.split("-");
  return LESSONS[cat][topic];
}

function getCategoryAndTopic(lessonId: string) {
  const cat = lessonId.split("-")[0];
  const topic = lessonId.includes("foundation")
    ? "foundation"
    : lessonId.split("-")[1];
  return { cat, topic };
}

export function LessonDetail({ lessonId }: { lessonId: string }) {
  const navigate = useNavigate();
  const { lang, completeTask } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      completeTask: s.completeTask,
    }))
  );
  const t = useT(lang);

  const [step, setStep] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const ld = getLessonData(lessonId);
  const { cat, topic } = getCategoryAndTopic(lessonId);
  const cards = (FLASHCARDS[cat] || []).filter((c) => c.topic === topic);
  const question = (PRACTICE[cat] || [])[0];
  const pct = Math.round((step / TOTAL_STEPS) * 100);

  function goBack() {
    navigate("/lessons");
  }

  function finishQuiz() {
    completeTask("lesson");
    setStep(6);
  }

  // Step 4 (Did You Know) only exists for some lessons, and step 5 (Quiz)
  // only exists for subjects with a practice question. Rather than render
  // a step then immediately jump away from it in an effect (what the
  // original app did — a React anti-pattern that also cascades renders),
  // the "Continue" buttons below decide the correct next step directly.
  function afterFunFact() {
    if (ld.didYouKnow) setStep(4);
    else if (question) setStep(5);
    else finishQuiz();
  }

  function afterDidYouKnow() {
    if (question) setStep(5);
    else finishQuiz();
  }

  // Every step's action, pinned to FocusLayout's bottom bar instead of sitting
  // at the end of its content block. One place to read the flow from, and the
  // button stays reachable without scrolling on a long step.
  const cont = lang === "en" ? "Continue →" : "បន្ត →";
  const footer =
    step === 0 ? (
      <FocusButton onClick={() => setStep(1)}>
        {lang === "en" ? "Start Learning 🚀" : "ចាប់ផ្តើម 🚀"}
      </FocusButton>
    ) : step === 1 ? (
      <FocusButton onClick={() => setStep(2)}>{cont}</FocusButton>
    ) : step === 2 ? (
      // Advances whether or not this lesson has flashcards. The old inline
      // button lived inside `cards.length > 0`, so a lesson without them had
      // no way forward at all — the student was stuck on the step.
      <FocusButton
        onClick={() => {
          setStep(3);
          setFlipped(false);
        }}
      >
        {cards.length > 0 ? (lang === "en" ? "Got it! →" : "យល់! →") : cont}
      </FocusButton>
    ) : step === 3 ? (
      <FocusButton onClick={afterFunFact}>{cont}</FocusButton>
    ) : step === 4 ? (
      <FocusButton onClick={afterDidYouKnow}>
        {lang === "en" ? "Quiz Time! 🎯" : "Quiz! 🎯"}
      </FocusButton>
    ) : step === 5 ? (
      // Disabled rather than absent until an answer is picked: a button that
      // appears out of nowhere shifts the layout under the student's thumb.
      <FocusButton onClick={finishQuiz} disabled={!selected}>
        {cont}
      </FocusButton>
    ) : (
      <FocusButton onClick={goBack}>
        {lang === "en" ? "← Back to Quests" : "← ត្រឡប់"}
      </FocusButton>
    );

  return (
    <FocusLayout
      progressPct={pct}
      onExit={goBack}
      meta={`${step} / ${TOTAL_STEPS}`}
      footer={footer}
    >
      <div>
        {/* Step 0 — Intro */}
        {step === 0 && (
          <div className="text-center">
            <div className="mb-3 text-5xl md:mb-5 md:text-7xl">{ld.icon || "📖"}</div>
            <div className="mb-2 text-[10px] font-extrabold tracking-widest text-muted uppercase md:text-xs">
              {lang === "en" ? "Quest Importance" : "សារៈសំខាន់"}
            </div>
            <div className="font-heading mb-1.5 bg-linear-to-br from-pink to-yellow bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
              {ld.importance}
            </div>
            <div className="mb-2 text-xl font-extrabold md:text-3xl">{ld.title[lang]}</div>
            <div className="text-sm font-bold text-muted md:text-base">
              {lang === "en"
                ? "Step by step learning quest!"
                : "រៀនជាជំហានៗ!"}
            </div>
          </div>
        )}

        {/* Step 1 — Content + summary */}
        {step === 1 && (
          <div>
            {ld.model3d && (
              <Suspense
                fallback={
                  <div
                    className={`mb-3 flex h-64 items-center justify-center md:mb-4 md:h-80 lg:h-96 ${focusCard}`}
                  >
                    {lang === "en"
                      ? "Loading 3D model…"
                      : "កំពុងផ្ទុកម៉ូឌែល 3D…"}
                  </div>
                }
              >
                <div className="mb-3 h-64 w-full overflow-hidden rounded-2xl border border-purple/15 bg-surface md:mb-4 md:h-80 lg:h-96">
                  <BrainModelViewer model={ld.model3d} lang={lang} />
                </div>
              </Suspense>
            )}
            <div className="mb-3 text-xs font-extrabold text-muted md:mb-4 md:text-sm">
              📖 {lang === "en" ? "Lesson Content" : "មាតិកា"}
            </div>
            {/* whitespace-pre-line so a lesson can be written as real
                paragraphs. HTML collapses newlines by default, which turned
                the multi-paragraph brain lesson into one unreadable run-on
                block. Lessons with no blank lines in them render identically
                either way, so this is safe for all of them. */}
            <div
              className={`mb-3 rounded-2xl border border-blue/15 bg-blue/8 p-4 text-blue whitespace-pre-line md:mb-4 md:p-6 ${focusBody}`}
            >
              {ld.content[lang]}
            </div>
            <div className="rounded-2xl border border-purple/15 bg-purple/8 p-4 md:p-6">
              <div className={`mb-1 text-purple ${focusLabel}`}>
                📝 {t.summary}
              </div>
              <div className={`whitespace-pre-line ${focusBody}`}>
                {ld.summary[lang]}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Flashcard flip */}
        {step === 2 && (
          <div>
            <div className="mb-2 text-xs font-extrabold text-muted md:mb-4 md:text-sm">
              🎴 {lang === "en" ? "Flashcard" : "Flashcard"}
            </div>
            {cards.length > 0 ? (
              <button
                  onClick={() => setFlipped((f) => !f)}
                  className="w-full [perspective:1000px]"
                >
                  <div
                    className="relative h-52 w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] md:h-64 lg:h-72"
                    style={{
                      transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
                    }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-purple/15 bg-surface p-6 text-center [backface-visibility:hidden]">
                      <div className="mb-3 text-3xl md:text-5xl">❓</div>
                      <div className="text-base font-extrabold md:text-xl">
                        {cards[0].q[lang]}
                      </div>
                      <div className="mt-3 text-xs font-bold text-muted">
                        👆 {lang === "en" ? "Tap to reveal" : "ចុចដើម្បីមើល"}
                      </div>
                    </div>
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-mint/25 bg-mint/8 p-6 text-center [backface-visibility:hidden]"
                      style={{ transform: "rotateY(180deg)" }}
                    >
                      <div className="mb-3 text-3xl md:text-5xl">✅</div>
                      <div className="text-base font-extrabold text-mint md:text-xl">
                        {cards[0].a[lang]}
                      </div>
                      <div className="mt-3 text-xs font-bold text-muted">
                        👆 {lang === "en" ? "Tap to flip back" : "ចុចត្រឡប់"}
                      </div>
                    </div>
                  </div>
                </button>
            ) : (
              <div className="py-10 text-center text-sm font-bold text-muted">
                No flashcards yet
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Fun fact + tip */}
        {step === 3 && (
          <div>
            <div className="mb-3 rounded-2xl border border-yellow/25 bg-yellow/10 p-4 md:mb-4 md:p-6">
              <div className={`mb-1 text-yellow ${focusLabel}`}>
                🎉 {t.funFact}
              </div>
              <div className={focusBody}>{ld.funFact[lang]}</div>
            </div>
            <div className="rounded-2xl border border-pink/20 bg-pink/8 p-4 md:p-6">
              <div className={`mb-1 text-pink ${focusLabel}`}>
                💡 {t.surpriseTip}
              </div>
              <div className={focusBody}>{ld.tip[lang]}</div>
            </div>
          </div>
        )}

        {/* Step 4 — Did you know (only reachable when the lesson has this content) */}
        {step === 4 && ld.didYouKnow && (
          <div>
            <div className="rounded-2xl border border-mint/25 bg-mint/8 p-6 text-center md:p-8">
              <div className="mb-2.5 text-4xl md:text-6xl">🧠</div>
              <div className={`mb-1 text-mint ${focusLabel}`}>
                {t.didYouKnow}
              </div>
              <div className={focusBody}>{ld.didYouKnow[lang]}</div>
            </div>
          </div>
        )}

        {/* Step 5 — Practice quiz */}
        {step === 5 && question && (
          <div>
            <div className="mb-3 text-xs font-extrabold text-muted md:mb-4 md:text-sm">
              ✍️ {lang === "en" ? "Practice Quiz" : "Quiz"}
            </div>
            <div className={focusCard}>
              <div className={`mb-4 md:mb-6 ${focusPrompt}`}>
                {question.q[lang]}
              </div>
              <div className="flex flex-col gap-2 md:gap-3">
                {question.options.map((opt) => {
                  const isCorrect = opt === question.correct;
                  const isPicked = opt === selected;
                  const state = !selected
                    ? "neutral"
                    : isCorrect
                      ? "correct"
                      : isPicked
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
                <div
                  className={
                    "mt-3 rounded-2xl p-4 md:mt-4 md:p-6 " +
                    (selected === question.correct
                      ? "border border-mint/25 bg-mint/8"
                      : "border border-pink/20 bg-pink/8")
                  }
                >
                  <div
                    className={
                      "mb-1 " +
                      focusLabel +
                      " " +
                      (selected === question.correct
                        ? "text-mint"
                        : "text-pink")
                    }
                  >
                    {selected === question.correct ? t.correct : t.incorrect}
                  </div>
                  <div className={focusBody}>{question.explanation[lang]}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 6 — Completion */}
        {step === 6 && (
          <div className="text-center">
            <div className="mb-3 text-6xl md:mb-5 md:text-8xl">🎉</div>
            <div className="font-heading mb-2.5 bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent md:text-3xl">
              {lang === "en" ? "Quest Complete!" : "ភារកិច្ចបញ្ចប់!"}
            </div>
            <div className="mx-auto mb-3 w-fit rounded-2xl bg-brand px-6 py-3 text-center text-white">
              <div className="text-lg font-extrabold">+20 XP</div>
              <div className="text-xs font-bold opacity-90">
                {lang === "en" ? "Experience Earned" : "ពិន្ទុទទួលបាន"}
              </div>
            </div>
            <div className="text-xs font-bold text-muted">{ld.title[lang]}</div>
          </div>
        )}
      </div>
    </FocusLayout>
  );
}