import { Link } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { useT, type TranslationKey } from "@/data/translations";
import { ContentNotice } from "@/features/practice/components/content-waiting";
import type { StudyItem, StudyKind } from "@/features/home/study-feed";
import { retryContent } from "@/lib/content";
import { useBrachNhaStore } from "@/lib/store";
import type { ContentManifest } from "@/utils/content-manifest";
import { cn } from "@/utils/cn";
import { activityLabel, monthLabel, monthProgressLabel, roadmapCopy } from "../copy";
import { monthActivity, type PlanMonth } from "../study-plan";
import { DailyMission } from "./daily-mission";

const KIND: Record<
  StudyKind,
  { icon: LucideIcon; label: "kindSection" | "kindFlashcards" | "kindQuiz" | "kindPaper" }
> = {
  section: { icon: BookOpen, label: "kindSection" },
  flashcards: { icon: Layers, label: "kindFlashcards" },
  quiz: { icon: ClipboardList, label: "kindQuiz" },
  paper: { icon: FileText, label: "kindPaper" },
};

/**
 * One month of the plan, opened from its row on the Roadmap: Today's goal if it is
 * this month, then the month's items in order, each going straight to its lesson,
 * deck, quiz or paper. Nothing is locked: a student may work ahead.
 *
 * NOT A DAY-BY-DAY CALENDAR, deliberately. A fixed day's work is a day behind the
 * moment one is missed, and "Today" here is only ever the next unfinished items.
 *
 * `month` is resolved by the page, so a missing one never reaches a closure here
 * (the React Compiler rule in review-session.tsx).
 */
export function MonthView({
  month,
  manifest,
}: {
  month: PlanMonth;
  manifest: ContentManifest;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const contentLog = useBrachNhaStore((s) => s.contentLog);
  const activityLog = useBrachNhaStore((s) => s.activityLog);
  const t = useT(lang);
  const c = roadmapCopy(lang);
  const activity = activityLabel(monthActivity(month.key, contentLog, activityLog), lang);
  const left = month.items.length - month.done;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-36 lg:pb-10">
      <div className="mb-4 flex items-center gap-2">
        <Link
          to="/roadmap"
          aria-label={t.yourRoadmap}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-panel-sm transition hover:text-purple"
        >
          <ArrowLeft className="size-4" strokeWidth={2.5} aria-hidden />
        </Link>
        <div className="min-w-0">
          <h1 className="font-heading text-xl leading-tight font-extrabold text-text">
            {monthLabel(month.key, lang)}
          </h1>
          {month.subjects.length > 0 && (
            <p className="truncate text-xs font-bold text-muted">
              {month.subjects.map((s) => t[s as TranslationKey] ?? s).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {month.status === "current" && <DailyMission title={c.today} />}

      {month.isExam && (
        <Link
          to="/exam/simulation"
          className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-neo-yellow p-4 text-ink shadow-panel transition active:scale-[0.98]"
        >
          <GraduationCap className="size-6 shrink-0" strokeWidth={2.5} aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="font-heading text-sm font-extrabold">{c.simulationTitle}</div>
            <div className="text-xs font-bold">{c.simulationBlurb}</div>
          </div>
          <ChevronRight className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
        </Link>
      )}

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-panel">
        <div className="mb-1 font-heading text-sm font-extrabold">
          {month.status === "past"
            ? c.planPast
            : month.status === "current"
              ? c.planCurrent
              : c.planFuture}
        </div>
        {month.status === "current" && month.items.length > 0 && (
          <div className="text-xs font-bold text-muted">
            {left === 0
              ? c.monthComplete
              : monthProgressLabel(month.done, month.items.length, lang)}
          </div>
        )}
        {activity && (
          <div className="mt-0.5 text-[11px] font-bold text-muted">{activity}</div>
        )}

        {manifest.status !== "ready" ? (
          <ContentNotice
            state={manifest.status === "failed" ? "offline" : "loading"}
            onRetry={retryContent}
          />
        ) : month.items.length === 0 ? (
          <p className="mt-2 text-xs leading-relaxed font-bold text-muted">
            {month.status === "past" ? c.pastEmpty : c.futureEmpty}
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {month.items.map((item) => (
              <PlanRow key={item.id} item={item} />
            ))}
          </ul>
        )}

        {month.status === "current" && left > 0 && (
          <p className="mt-3 text-[11px] leading-relaxed font-bold text-muted">
            {c.rollForward}
          </p>
        )}
      </div>
    </div>
  );
}

function PlanRow({ item }: { item: StudyItem }) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = useT(lang);
  const c = roadmapCopy(lang);
  const { icon: Icon, label } = KIND[item.kind];

  return (
    <li>
      <Link
        to={item.href}
        className="flex items-center gap-3 rounded-xl border border-border bg-control p-2.5 transition active:scale-[0.98]"
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            item.done ? "bg-mint/30" : "bg-purple/10"
          )}
        >
          {item.done ? (
            <Check className="size-4 text-mint" strokeWidth={3} aria-hidden />
          ) : (
            <Icon className="size-4 text-purple" strokeWidth={2.5} aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          {/* Muted, not struck through: a line runs straight through Khmer
              letters and makes the title hard to read. The tick says it is done. */}
          <div
            className={cn(
              "truncate text-sm font-extrabold",
              item.done ? "text-muted" : "text-text"
            )}
          >
            {item.title}
          </div>
          <div className="truncate text-[11px] font-bold text-muted">
            {t[item.subject as TranslationKey] ?? item.subject} · {c[label]}
          </div>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted" strokeWidth={2.5} aria-hidden />
      </Link>
    </li>
  );
}
