import { Link } from "react-router";
import { Rocket, Map } from "lucide-react";
import type { Lang } from "@/types";
import { useT } from "@/data/translations";
import type { StudyKind } from "@/features/home/study-feed";

/** One row: a real piece of content from the study feed, or a fallback page. */
export interface RecommendedAction {
  id: string;
  kind: StudyKind | "page";
  /** Khmer content title (content is Khmer-only), or a page label. */
  title: string;
  context: string;
  href: string;
}

const KIND_LABEL: Record<RecommendedAction["kind"], { en: string; km: string }> = {
  section: { en: "Lesson", km: "មេរៀន" },
  quiz: { en: "Quiz", km: "Quiz" },
  flashcards: { en: "Flashcard", km: "Flashcard" },
  paper: { en: "Past paper", km: "វិញ្ញាសារឆ្នាំចាស់" },
  page: { en: "Practice", km: "លំហាត់" },
};

/**
 * The next pieces of real content, weakest subject first. These used to be
 * three hand-written Physics rows plus two buttons that simulated a quiz; both
 * belonged to the demo student this page no longer shows.
 */
export function RecommendedActions({
  lang,
  actions,
  limitingFactorName,
}: {
  lang: Lang;
  actions: RecommendedAction[];
  limitingFactorName: string | null;
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
            key={a.id}
            to={a.href}
            className="flex items-center gap-3 rounded-xl border border-purple/10 bg-purple/4 px-3 py-2.5 transition-transform active:scale-[0.98]"
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-purple/10 text-xs font-extrabold text-purple">
              {i + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-extrabold">{a.title}</div>
              {a.context && (
                <div className="truncate text-[11px] font-bold text-muted">
                  {a.context}
                </div>
              )}
            </div>
            <div className="shrink-0 text-[11px] font-extrabold text-purple">
              {KIND_LABEL[a.kind][lang]}
            </div>
          </Link>
        ))}
      </div>

      {limitingFactorName && (
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
      )}
    </div>
  );
}
