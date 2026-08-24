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
    <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
      <div className="mb-3 font-heading text-sm font-extrabold">
        {t.whatsAffecting}
      </div>
      {/* These breakpoints track the PAGE GRID, not the viewport, because the
          grid is what decides this card's real width:
            sm (640)  — page is still one full-width column, so two lists fit
            md (768)  — card drops into a 2-col grid at ~352px: back to one list
            2xl(1536) — still 2-col, but the shell is wide enough that a column
                        is ~600px, so two lists fit again
          Without the md reset the lists render at ~176px each on a tablet, far
          narrower than the 288px a 320px phone already gives them. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 2xl:grid-cols-2">
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
