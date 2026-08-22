import { useState } from "react";
import { useT } from "@/data/translations";
import type { TranslationKey } from "@/data/translations";
import type { Lang } from "@/types";
import {
  getQuestionsBySubject,
  scorePlacementTest,
  isWeakFromScore,
} from "@/utils/placement";

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

export function PlacementTestRunner({
  subject,
  lang,
  onComplete,
  onCancel,
}: {
  subject: string;
  lang: Lang;
  onComplete: (pct: number, isWeak: boolean) => void;
  onCancel: () => void;
}) {
  const t = useT(lang);
  const questions = getQuestionsBySubject(subject);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<
    { score: number; total: number; pct: number } | null
  >(null);

  const answeredCount = Object.keys(answers).length;

  if (result) {
    const deg = Math.round((result.pct / 100) * 360);
    const weak = isWeakFromScore(result.pct);
    return (
      <div className="py-4 text-center">
        <div
          className="mx-auto mb-4 flex size-28 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(${scoreColorHex(result.pct)} ${deg}deg, rgba(139,43,226,0.1) ${deg}deg)`,
          }}
        >
          <div className="flex size-20 flex-col items-center justify-center rounded-full bg-bg">
            <div
              className={`font-heading text-xl font-bold ${scoreColor(result.pct)}`}
            >
              {result.pct}%
            </div>
            <div className="text-[8px] font-bold text-muted">
              {t.yourScore}
            </div>
          </div>
        </div>
        <div className="mb-4 text-sm font-bold text-muted">
          {result.score}/{result.total} correct
        </div>
        <div
          className={`mb-4 rounded-xl border p-3 text-sm font-extrabold ${
            weak
              ? "border-pink/20 bg-pink/8 text-pink"
              : "border-mint/25 bg-mint/8 text-mint"
          }`}
        >
          {weak ? t.weak : t.notWeak}
        </div>
        <button
          onClick={() => onComplete(result.pct, weak)}
          className="w-full rounded-2xl bg-linear-to-r from-pink to-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(139,43,226,0.35)]"
        >
          {lang === "en" ? "Continue →" : "បន្ត →"}
        </button>
      </div>
    );
  }

  const q = questions[idx];

  return (
    <div className="py-2">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-xs font-bold text-muted">
          Q{idx + 1} / {questions.length}
        </div>
        <div className="text-xs font-extrabold text-purple">
          {answeredCount} answered
        </div>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-purple/10">
        <div
          className="h-full rounded-full bg-linear-to-r from-pink to-purple transition-all duration-300"
          style={{ width: `${((idx + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="mb-4 rounded-2xl border border-purple/10 bg-white p-4 shadow-[0_2px_12px_rgba(139,43,226,0.08)]">
        <div className="mb-2.5 text-[11px] font-extrabold tracking-widest text-purple uppercase">
          {t[subject as TranslationKey] ?? subject}
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
        <button
          onClick={idx > 0 ? () => setIdx(idx - 1) : onCancel}
          className="flex-1 rounded-2xl border border-purple/20 bg-purple/8 px-6 py-3 text-sm font-extrabold text-purple"
        >
          ← {idx > 0 ? (lang === "en" ? "Prev" : "មុន") : (lang === "en" ? "Back" : "ត្រឡប់")}
        </button>
        {idx < questions.length - 1 ? (
          <button
            onClick={() => setIdx(idx + 1)}
            className="flex-1 rounded-2xl bg-linear-to-r from-pink to-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(139,43,226,0.35)]"
          >
            {lang === "en" ? "Next →" : "បន្ត →"}
          </button>
        ) : (
          <button
            disabled={answeredCount < questions.length}
            onClick={() => setResult(scorePlacementTest(questions, answers))}
            className="flex-1 rounded-2xl bg-linear-to-r from-pink to-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(139,43,226,0.35)] disabled:opacity-50"
          >
            {t.seeResult}
          </button>
        )}
      </div>
    </div>
  );
}
