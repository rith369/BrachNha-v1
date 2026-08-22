import type { Lang } from "@/types";
import { useT } from "@/data/translations";
import type { TranslationKey } from "@/data/translations";
import type { SubjectPrediction } from "@/utils/gradePrediction";

const STRONG_THRESHOLD = 80;
const WEAK_THRESHOLD = 65;

export function PredictionFactors({
  lang,
  subjects,
  consistencyPct,
  trendDeltaPct,
}: {
  lang: Lang;
  subjects: SubjectPrediction[];
  consistencyPct: number;
  trendDeltaPct: number;
}) {
  const t = useT(lang);

  const strongSubjects = subjects
    .filter((s) => s.countsTowardOverall && s.pct >= STRONG_THRESHOLD)
    .map((s) => t[s.subject as TranslationKey] ?? s.subject);

  const weakSubjects = subjects
    .filter((s) => s.countsTowardOverall && s.pct < WEAK_THRESHOLD)
    .map((s) => t[s.subject as TranslationKey] ?? s.subject);

  const positives: string[] = [
    ...strongSubjects.map((name) =>
      lang === "en" ? `Strong ${name} performance` : `សមិទ្ធផល${name}រឹងមាំ`
    ),
    ...(consistencyPct >= 70
      ? [lang === "en" ? "Good study consistency" : "ភាពទៀងទាត់ក្នុងការសិក្សាល្អ"]
      : []),
  ];

  const improvements: string[] = [
    ...weakSubjects.map((name) =>
      lang === "en" ? `${name} performance` : `សមិទ្ធផល${name}`
    ),
    ...(trendDeltaPct < 0
      ? [lang === "en" ? "Recent quiz accuracy dipped" : "ភាពត្រឹមត្រូវលំហាត់ថ្មីៗធ្លាក់ចុះ"]
      : []),
    ...(consistencyPct < 70
      ? [lang === "en" ? "Study consistency" : "ភាពទៀងទាត់ក្នុងការសិក្សា"]
      : []),
  ];

  return (
    <div className="rounded-2xl border border-purple/10 bg-white p-4 shadow-[0_2px_12px_rgba(139,43,226,0.08)]">
      <div className="mb-3 font-heading text-sm font-extrabold">
        {t.whatsAffecting}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 text-[11px] font-extrabold tracking-wide text-mint uppercase">
            {t.positiveFactors}
          </div>
          <ul className="flex flex-col gap-1">
            {positives.length === 0 && (
              <li className="text-xs font-bold text-muted">—</li>
            )}
            {positives.map((line) => (
              <li key={line} className="flex items-start gap-1.5 text-xs font-bold">
                <span className="text-mint">✓</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-1.5 text-[11px] font-extrabold tracking-wide text-pink uppercase">
            {t.areasToImprove}
          </div>
          <ul className="flex flex-col gap-1">
            {improvements.length === 0 && (
              <li className="text-xs font-bold text-muted">—</li>
            )}
            {improvements.map((line) => (
              <li key={line} className="flex items-start gap-1.5 text-xs font-bold">
                <span className="text-pink">⚠</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
