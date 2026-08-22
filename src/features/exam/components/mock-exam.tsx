import { useState } from "react";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useT } from "@/data/translations";
import { MOCK_QS } from "@/data/questions";

function scoreColor(pct: number) {
  if (pct >= 80) return "text-mint";
  if (pct >= 60) return "text-yellow";
  return "text-pink";
}
function scoreColorHex(pct: number) {
  if (pct >= 80) return "var(--color-mint)";
  if (pct >= 60) return "var(--color-yellow)";
  return "var(--color-pink)";
}

export function MockExam() {
  const { lang, addXp, examResults, addExamResult } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      addXp: s.addXp,
      examResults: s.examResults,
      addExamResult: s.addExamResult,
    }))
  );
  const t = useT(lang);

  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [done, setDone] = useState(false);
  const [lastResult, setLastResult] = useState<
    (typeof examResults)[number] | null
  >(null);

  function startExam() {
    setStarted(true);
    setIdx(0);
    setAnswers({});
    setDone(false);
  }

  function submit() {
    let score = 0;
    MOCK_QS.forEach((q, i) => {
      if (answers[i] === q.correct) score++;
    });
    const pct = Math.round((score / MOCK_QS.length) * 100);
    const result = {
      score,
      total: MOCK_QS.length,
      pct,
      date: new Date().toISOString(),
    };
    addExamResult(result);
    addXp(score * 20);
    setLastResult(result);
    setDone(true);
  }

  // ── Screen 1: intro + previous results ──
  if (!started) {
    return (
      <div className="px-4 pt-4 pb-20">
        <div className="font-heading mb-0.5 bg-linear-to-r from-pink via-purple to-blue bg-clip-text pr-14 text-xl font-extrabold text-transparent">
          📝 {t.mockExam}
        </div>
        <div className="mb-4 pr-14 text-xs font-bold text-muted">
          Bac II Simulation
        </div>

        <div className="mb-4 rounded-2xl border border-purple/10 bg-white p-7 text-center shadow-[0_2px_12px_rgba(139,43,226,0.08)]">
          <div className="mb-3 text-5xl">🎯</div>
          <div className="mb-2 text-lg font-extrabold">
            {t.startMockExam}
          </div>
          <div className="mb-4 text-sm font-bold text-muted">
            {t.examInstructions}
          </div>
          <div className="font-heading mb-1 text-4xl font-bold text-purple">
            {MOCK_QS.length}
          </div>
          <div className="mb-5 text-xs font-bold text-muted">Questions</div>
          <button
            onClick={startExam}
            className="rounded-2xl bg-linear-to-r from-pink to-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(139,43,226,0.35)]"
          >
            {t.startMockExam}
          </button>
        </div>

        {examResults.length > 0 && (
          <div className="rounded-2xl border border-purple/10 bg-white p-4 shadow-[0_2px_12px_rgba(139,43,226,0.08)]">
            <div className="mb-3 text-sm font-extrabold">
              {lang === "en" ? "Previous Results" : "លទ្ធផលមុន"}
            </div>
            <div className="flex flex-col gap-2">
              {[...examResults]
                .slice(-3)
                .reverse()
                .map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-purple/8 bg-purple/4 px-3 py-2.5"
                  >
                    <div>
                      <div className="text-sm font-extrabold">
                        {r.score}/{r.total}
                      </div>
                      <div className="text-[11px] font-bold text-muted">
                        {new Date(r.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div
                      className={`font-heading text-xl font-bold ${scoreColor(r.pct)}`}
                    >
                      {r.pct}%
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Screen 2: results ──
  if (done && lastResult) {
    const pct = lastResult.pct;
    const deg = Math.round((pct / 100) * 360);
    const readiness =
      pct >= 80
        ? lang === "en"
          ? "Excellent! You're ready!"
          : "ល្អណាស់!"
        : pct >= 60
          ? lang === "en"
            ? "Good! Keep practicing!"
            : "ល្អ!"
          : lang === "en"
            ? "Keep studying! You can do it!"
            : "ប្រឹងសិក្សា!";

    return (
      <div className="px-4 pt-4 pb-20 text-center">
        <div
          className="mx-auto mb-5 flex size-32 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(${scoreColorHex(pct)} ${deg}deg, rgba(139,43,226,0.1) ${deg}deg)`,
          }}
        >
          <div className="flex size-24 flex-col items-center justify-center rounded-full bg-bg">
            <div className={`font-heading text-2xl font-bold ${scoreColor(pct)}`}>
              {pct}%
            </div>
            <div className="text-[9px] font-bold text-muted">Score</div>
          </div>
        </div>
        <div className="mb-1.5 text-xl font-extrabold">{t.examScore}</div>
        <div className="mb-4 text-sm font-bold text-muted">
          {lastResult.score}/{lastResult.total} correct
        </div>
        <div
          className={`mb-5 rounded-2xl border p-4 text-left ${
            pct >= 80
              ? "border-mint/25 bg-mint/8"
              : pct >= 60
                ? "border-yellow/25 bg-yellow/10"
                : "border-pink/20 bg-pink/8"
          }`}
        >
          <div className={`mb-1 text-xs font-extrabold ${scoreColor(pct)}`}>
            {t.bacReadiness}
          </div>
          <div className="text-sm font-semibold">{readiness}</div>
        </div>
        <button
          onClick={startExam}
          className="mb-2.5 block w-full rounded-2xl bg-linear-to-r from-pink to-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(139,43,226,0.35)]"
        >
          {t.retakeExam}
        </button>
        <button
          onClick={() => setStarted(false)}
          className="block w-full rounded-2xl border border-purple/20 bg-purple/8 px-6 py-3 text-sm font-extrabold text-purple"
        >
          {lang === "en" ? "← Back" : "← ត្រឡប់"}
        </button>
      </div>
    );
  }

  // ── Screen 3: taking the exam ──
  const q = MOCK_QS[idx];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="px-4 pt-4 pb-20">
      <div className="mb-2.5 flex items-center justify-between pr-14">
        <div className="text-xs font-bold text-muted">
          Q{idx + 1} / {MOCK_QS.length}
        </div>
        <div className="text-xs font-extrabold text-purple">
          {answeredCount} answered
        </div>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-purple/10">
        <div
          className="h-full rounded-full bg-linear-to-r from-pink to-purple transition-all duration-300"
          style={{ width: `${((idx + 1) / MOCK_QS.length) * 100}%` }}
        />
      </div>

      <div className="mb-4 rounded-2xl border border-purple/10 bg-white p-4 shadow-[0_2px_12px_rgba(139,43,226,0.08)]">
        <div className="mb-2.5 text-[11px] font-extrabold tracking-widest text-purple uppercase">
          {q.subj === "math" ? t.math : t.biology}
        </div>
        <div className="mb-4 text-base font-extrabold">{q.q[lang]}</div>
        <div className="flex flex-col gap-2">
          {q.options.map((opt) => (
            <button
              key={opt}
              onClick={() => setAnswers({ ...answers, [idx]: opt })}
              className={
                "rounded-xl border px-4 py-3 text-left text-sm font-bold transition " +
                (answers[idx] === opt
                  ? "border-purple/40 bg-purple/10 text-purple"
                  : "border-purple/10 bg-white text-text hover:bg-purple/5")
              }
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2.5">
        {idx > 0 && (
          <button
            onClick={() => setIdx(idx - 1)}
            className="flex-1 rounded-2xl border border-purple/20 bg-purple/8 px-6 py-3 text-sm font-extrabold text-purple"
          >
            ← {lang === "en" ? "Prev" : "មុន"}
          </button>
        )}
        {idx < MOCK_QS.length - 1 ? (
          <button
            onClick={() => setIdx(idx + 1)}
            className="flex-1 rounded-2xl bg-linear-to-r from-pink to-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(139,43,226,0.35)]"
          >
            {lang === "en" ? "Next →" : "បន្ត →"}
          </button>
        ) : (
          <button
            disabled={answeredCount < MOCK_QS.length}
            onClick={submit}
            className="flex-1 rounded-2xl bg-linear-to-r from-pink to-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(139,43,226,0.35)] disabled:opacity-50"
          >
            {t.submitExam}
          </button>
        )}
      </div>
    </div>
  );
}