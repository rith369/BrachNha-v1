import { useState } from "react";
import { useNavigate } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useT } from "@/data/translations";
import { LESSONS, FOUNDATION, FLASHCARDS, PRACTICE } from "@/data/lessons";
import type { Lesson } from "@/types";

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

  return (
    <div className="flex h-full flex-col">
      {/* Header: exit + step counter + progress bar */}
      <div className="shrink-0 px-4 pt-4 pb-3">
        <div className="mb-2.5 flex items-center justify-between pr-14">
          <button
            onClick={goBack}
            className="text-xs font-extrabold text-text"
          >
            ← {lang === "en" ? "Exit" : "ចេញ"}
          </button>
          <div className="text-xs font-bold text-muted">
            {step} / {TOTAL_STEPS}
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-purple/10">
          <div
            className="h-full rounded-full bg-linear-to-r from-pink to-purple transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-36">
        {/* Step 0 — Intro */}
        {step === 0 && (
          <div className="text-center">
            <div className="mb-3 text-5xl">{ld.icon || "📖"}</div>
            <div className="mb-2 text-[10px] font-extrabold tracking-widest text-muted uppercase">
              {lang === "en" ? "Quest Importance" : "សារៈសំខាន់"}
            </div>
            <div className="font-heading mb-1.5 bg-linear-to-br from-pink to-yellow bg-clip-text text-4xl font-bold text-transparent">
              {ld.importance}
            </div>
            <div className="mb-2 text-xl font-extrabold">{ld.title[lang]}</div>
            <div className="mb-6 text-sm font-bold text-muted">
              {lang === "en"
                ? "Step by step learning quest!"
                : "រៀនជាជំហានៗ!"}
            </div>
            <button
              onClick={() => setStep(1)}
              className="rounded-2xl bg-linear-to-r from-pink to-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(139,43,226,0.35)]"
            >
              {lang === "en" ? "Start Learning 🚀" : "ចាប់ផ្តើម 🚀"}
            </button>
          </div>
        )}

        {/* Step 1 — Content + summary */}
        {step === 1 && (
          <div>
            <div className="mb-3 text-xs font-extrabold text-muted">
              📖 {lang === "en" ? "Lesson Content" : "មាតិកា"}
            </div>
            <div className="mb-3 rounded-2xl border border-blue/15 bg-blue/8 p-4 text-sm font-semibold text-blue">
              {ld.content[lang]}
            </div>
            <div className="rounded-2xl border border-purple/15 bg-purple/8 p-4">
              <div className="mb-1 text-xs font-extrabold text-purple">
                📝 {t.summary}
              </div>
              <div className="text-sm font-semibold">{ld.summary[lang]}</div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="mt-4 rounded-2xl bg-linear-to-r from-pink to-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(139,43,226,0.35)]"
            >
              {lang === "en" ? "Continue →" : "បន្ត →"}
            </button>
          </div>
        )}

        {/* Step 2 — Flashcard flip */}
        {step === 2 && (
          <div>
            <div className="mb-2 text-xs font-extrabold text-muted">
              🎴 {lang === "en" ? "Flashcard" : "Flashcard"}
            </div>
            {cards.length > 0 ? (
              <>
                <button
                  onClick={() => setFlipped((f) => !f)}
                  className="mb-4 w-full [perspective:1000px]"
                >
                  <div
                    className="relative h-52 w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d]"
                    style={{
                      transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
                    }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-purple/15 bg-white p-6 text-center [backface-visibility:hidden]">
                      <div className="mb-3 text-3xl">❓</div>
                      <div className="text-base font-extrabold">
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
                      <div className="mb-3 text-3xl">✅</div>
                      <div className="text-base font-extrabold text-mint">
                        {cards[0].a[lang]}
                      </div>
                      <div className="mt-3 text-xs font-bold text-muted">
                        👆 {lang === "en" ? "Tap to flip back" : "ចុចត្រឡប់"}
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setStep(3);
                    setFlipped(false);
                  }}
                  className="rounded-2xl bg-linear-to-r from-pink to-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(139,43,226,0.35)]"
                >
                  {lang === "en" ? "Got it! →" : "យល់! →"}
                </button>
              </>
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
            <div className="mb-3 rounded-2xl border border-yellow/25 bg-yellow/10 p-4">
              <div className="mb-1 text-xs font-extrabold text-yellow">
                🎉 {t.funFact}
              </div>
              <div className="text-sm font-semibold">{ld.funFact[lang]}</div>
            </div>
            <div className="rounded-2xl border border-pink/20 bg-pink/8 p-4">
              <div className="mb-1 text-xs font-extrabold text-pink">
                💡 {t.surpriseTip}
              </div>
              <div className="text-sm font-semibold">{ld.tip[lang]}</div>
            </div>
            <button
              onClick={afterFunFact}
              className="mt-4 rounded-2xl bg-linear-to-r from-pink to-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(139,43,226,0.35)]"
            >
              {lang === "en" ? "Continue →" : "បន្ត →"}
            </button>
          </div>
        )}

        {/* Step 4 — Did you know (only reachable when the lesson has this content) */}
        {step === 4 && ld.didYouKnow && (
          <div>
            <div className="rounded-2xl border border-mint/25 bg-mint/8 p-6 text-center">
              <div className="mb-2.5 text-4xl">🧠</div>
              <div className="mb-1 text-xs font-extrabold text-mint">
                {t.didYouKnow}
              </div>
              <div className="text-sm font-semibold">
                {ld.didYouKnow[lang]}
              </div>
            </div>
            <button
              onClick={afterDidYouKnow}
              className="mt-4 rounded-2xl bg-linear-to-r from-pink to-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(139,43,226,0.35)]"
            >
              {lang === "en" ? "Quiz Time! 🎯" : "Quiz! 🎯"}
            </button>
          </div>
        )}

        {/* Step 5 — Practice quiz */}
        {step === 5 && question && (
          <div>
            <div className="mb-3 text-xs font-extrabold text-muted">
              ✍️ {lang === "en" ? "Practice Quiz" : "Quiz"}
            </div>
            <div className="rounded-2xl border border-purple/10 bg-white p-4 shadow-[0_2px_12px_rgba(139,43,226,0.08)]">
              <div className="mb-4 text-base font-extrabold">
                {question.q[lang]}
              </div>
              <div className="flex flex-col gap-2">
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
                        "rounded-xl border px-4 py-3 text-left text-sm font-bold transition " +
                        (state === "correct"
                          ? "border-mint/40 bg-mint/10 text-mint"
                          : state === "wrong"
                            ? "border-pink/40 bg-pink/10 text-pink"
                            : "border-purple/10 bg-white text-text hover:bg-purple/5")
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
                    "mt-3 rounded-2xl p-4 " +
                    (selected === question.correct
                      ? "border border-mint/25 bg-mint/8"
                      : "border border-pink/20 bg-pink/8")
                  }
                >
                  <div
                    className={
                      "mb-1 text-xs font-extrabold " +
                      (selected === question.correct
                        ? "text-mint"
                        : "text-pink")
                    }
                  >
                    {selected === question.correct ? t.correct : t.incorrect}
                  </div>
                  <div className="text-sm font-semibold">
                    {question.explanation[lang]}
                  </div>
                </div>
              )}
            </div>
            {selected && (
              <button
                onClick={finishQuiz}
                className="mt-4 rounded-2xl bg-linear-to-r from-pink to-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(139,43,226,0.35)]"
              >
                {lang === "en" ? "Continue →" : "បន្ត →"}
              </button>
            )}
          </div>
        )}

        {/* Step 6 — Completion */}
        {step === 6 && (
          <div className="text-center">
            <div className="mb-3 text-6xl">🎉</div>
            <div className="font-heading mb-2.5 bg-linear-to-r from-pink via-purple to-blue bg-clip-text text-xl font-extrabold text-transparent">
              {lang === "en" ? "Quest Complete!" : "ភារកិច្ចបញ្ចប់!"}
            </div>
            <div className="mx-auto mb-3 w-fit rounded-2xl bg-linear-to-r from-pink to-purple px-6 py-3 text-center text-white">
              <div className="text-lg font-extrabold">+20 XP</div>
              <div className="text-xs font-bold opacity-90">
                {lang === "en" ? "Experience Earned" : "ពិន្ទុទទួលបាន"}
              </div>
            </div>
            <div className="mb-5 text-xs font-bold text-muted">
              {ld.title[lang]}
            </div>
            <button
              onClick={goBack}
              className="rounded-2xl bg-linear-to-r from-pink to-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(139,43,226,0.35)]"
            >
              {lang === "en" ? "← Back to Quests" : "← ត្រឡប់"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}