import { Link } from "react-router";
import { Rocket, Map } from "lucide-react";
import type { Lang } from "@/types";
import { useT } from "@/data/translations";
import type { RecommendedAction } from "../demo-data";
import type { SimulationDirection } from "../use-grade-prediction";

export function RecommendedActions({
  lang,
  actions,
  limitingFactorName,
  onSimulate,
}: {
  lang: Lang;
  actions: RecommendedAction[];
  limitingFactorName: string;
  onSimulate: (direction: SimulationDirection) => void;
}) {
  const t = useT(lang);

  return (
    <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
      <div className="mb-3 flex items-center gap-1.5 font-heading text-sm font-extrabold">
        <Rocket className="size-4 text-pink" strokeWidth={2.5} />
        {t.recommendedActions}
      </div>

      <div className="flex flex-col gap-2.5">
        {actions.map((a, i) => (
          <Link
            key={a.titleEn}
            to={a.href}
            className="flex items-center gap-3 rounded-xl border border-purple/10 bg-purple/4 px-3 py-2.5 transition-transform active:scale-[0.98]"
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-purple/10 text-xs font-extrabold text-purple">
              {i + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-extrabold">
                {lang === "en" ? a.titleEn : a.titleKm}
              </div>
              <div className="truncate text-[11px] font-bold text-muted">
                {lang === "en" ? a.descriptionEn : a.descriptionKm}
              </div>
            </div>
            <div className="shrink-0 text-[11px] font-extrabold text-purple">
              {a.duration}
            </div>
          </Link>
        ))}
      </div>

      <div className="my-3 border-t border-purple/10" />

      <div className="mb-2 text-[11px] font-extrabold tracking-wide text-muted uppercase">
        {t.tryItLive}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSimulate("good")}
          className="flex-1 rounded-xl bg-linear-to-r from-[var(--brand-mint)] to-[var(--brand-blue)] px-3 py-2.5 text-xs font-extrabold text-on-brand shadow-mint-cta transition-transform active:scale-[0.97]"
        >
          {lang === "en" ? "✓ Complete a Physics Quiz" : "✓ បញ្ចប់លំហាត់រូបវិទ្យា"}
        </button>
        <button
          onClick={() => onSimulate("poor")}
          className="flex-1 rounded-xl border border-pink/20 bg-pink/8 px-3 py-2.5 text-xs font-extrabold text-pink transition-transform active:scale-[0.97]"
        >
          {lang === "en" ? "✕ Skip Studying" : "✕ រំលងការសិក្សា"}
        </button>
      </div>

      <div className="mt-3 rounded-xl bg-purple/5 p-3">
        <div className="mb-0.5 text-[10px] font-extrabold tracking-wide text-muted uppercase">
          {t.mainLimitingFactor}
        </div>
        <div className="mb-2 text-sm font-extrabold text-pink">
          {limitingFactorName}
        </div>
        <Link
          to="/roadmap"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-tri px-4 py-2.5 text-xs font-extrabold text-white"
        >
          <Map className="size-3.5" strokeWidth={2.5} />
          {t.viewRoadmap}
        </Link>
      </div>
    </div>
  );
}
