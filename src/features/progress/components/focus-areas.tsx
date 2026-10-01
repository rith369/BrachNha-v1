import { useBrachNhaStore } from "@/lib/store";
import { T } from "@/data/translations";
import { PROGRESS_COPY } from "../copy";
import { MIN_SAMPLE, type ProgressSummary } from "../summary";
import { buildFocusAreas, type FocusLabel } from "../focus-areas";

const ICON: Record<FocusLabel, string> = {
  needWork: "⚠️",
  strongest: "⭐",
  declining: "📉",
  improved: "🚀",
};

export function FocusAreas({ summary }: { summary: ProgressSummary }) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = PROGRESS_COPY[lang];
  const areas = buildFocusAreas(summary);

  return (
    <div>
      <div className="mb-3 font-heading text-sm font-extrabold">
        {c.focusTitle}
      </div>
      {areas.length === 0 ? (
        <div className="rounded-2xl border border-purple/10 bg-surface p-3.5 text-xs font-bold text-muted shadow-panel-sm">
          {c.focusEmpty(MIN_SAMPLE)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {areas.map((a) => (
            <div
              key={a.label}
              className={
                "rounded-2xl border p-3.5 " +
                (a.kind === "weak"
                  ? "border-pink/20 bg-pink/6"
                  : "border-mint/20 bg-mint/6")
              }
            >
              <div className="mb-1.5 text-lg">{ICON[a.label]}</div>
              {/* Uppercase and letter-spacing in English only: Khmer has no case,
                  and tracking pulls a Khmer cluster visibly apart. */}
              <div
                className={
                  "mb-1 text-[10px] font-extrabold " +
                  (lang === "en" ? "tracking-wide uppercase " : "") +
                  (a.kind === "weak" ? "text-pink" : "text-mint")
                }
              >
                {c.focusLabel[a.label]}
              </div>
              <div className="text-sm font-extrabold">{T[lang][a.subject]}</div>
              <div className="text-[10px] font-bold text-muted">
                {a.pct !== null ? c.focusScore(a.pct) : c.focusTrend(a.pts ?? 0)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
