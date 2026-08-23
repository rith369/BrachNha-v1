import { useState } from "react";
import { useT } from "@/data/translations";
import type { TranslationKey } from "@/data/translations";
import type { Lang } from "@/types";
import {
  getQuestionsBySubject,
  scorePlacementTest,
  isWeakFromScore,
} from "@/utils/placement";
import { FocusLayout } from "@/components/shell/focus-layout";
import {
  focusCard,
  focusKicker,
  focusPrompt,
  focusOption,
} from "@/utils/focus-styles";

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
  focus = false,
}: {
  subject: string;
  lang: Lang;
  onComplete: (pct: number, isWeak: boolean) => void;
  onCancel: () => void;
  /** Take over the whole screen (the /placement-test route). Defaults to false
   *  because the survey renders this inline inside a step card, where a
   *  full-screen takeover would swallow the survey itself. */
  focus?: boolean;
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
            background: `conic-gradient(${scoreColorHex(result.pct)} ${deg}deg, var(--color-chart-track) ${deg}deg)`,
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
          className="w-full rounded-2xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-cta"
        >
          {lang === "en" ? "Continue →" : "បន្ត →"}
        </button>
      </div>
    );
  }

  const q = questions[idx];
  const progressPct = ((idx + 1) / questions.length) * 100;

  // The question card and the button row are identical in both modes; only the
  // frame around them differs. Built once and placed into whichever wrapper the
  // caller asked for, so the survey's inline test and the full-screen route
  // cannot drift apart.
  //
  // The md:/lg: size steps apply ONLY in focus mode. Inline, this renders inside
  // a survey step card on a page that is itself narrow at every width, so
  // scaling it by viewport would blow it out of its container.
  const questionCard = (
    <div className={focus ? focusCard : "rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel"}>
        <div
          className={
            "mb-2.5 text-purple " +
            (focus
              ? focusKicker
              : "text-[11px] font-extrabold tracking-widest uppercase")
          }
        >
          {t[subject as TranslationKey] ?? subject}
        </div>
        <div
          className={
            (focus ? "mb-4 md:mb-6 " + focusPrompt : "mb-4 text-base font-extrabold")
          }
        >
          {q.q[lang]}
        </div>
        <div className={focus ? "flex flex-col gap-2 md:gap-3" : "flex flex-col gap-2"}>
          {q.options.map((opt) => (
            <button
              key={opt}
              onClick={() => setAnswers({ ...answers, [idx]: opt })}
              className={
                (focus
                  ? focusOption
                  : "rounded-xl border px-4 py-3 text-left text-sm font-bold transition") +
                " " +
                (answers[idx] === opt
                  ? "border-purple/40 bg-purple/10 text-purple"
                  : "border-purple/10 bg-surface text-text hover:bg-purple/5")
              }
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
  );

  const controls = (
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
          className="flex-1 rounded-2xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-cta"
        >
          {lang === "en" ? "Next →" : "បន្ត →"}
        </button>
      ) : (
        <button
          disabled={answeredCount < questions.length}
          onClick={() => setResult(scorePlacementTest(questions, answers))}
          className="flex-1 rounded-2xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-cta disabled:opacity-50"
        >
          {t.seeResult}
        </button>
      )}
    </div>
  );

  // Full-screen task, used by the /placement-test/:subject route.
  if (focus) {
    return (
      <FocusLayout
        progressPct={progressPct}
        onExit={onCancel}
        confirmExit
        meta={`Q${idx + 1}/${questions.length}`}
        footer={controls}
      >
        {questionCard}
      </FocusLayout>
    );
  }

  // Inline mode — the default, and what the survey's WeaknessStep renders. It
  // sits inside a card mid-survey, so it must NOT take over the screen.
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
          className="h-full rounded-full bg-brand transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="mb-4">{questionCard}</div>
      {controls}
    </div>
  );
}
