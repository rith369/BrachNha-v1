import { Link, useNavigate } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useT } from "@/data/translations";
import type { TranslationKey } from "@/data/translations";
import { dailyHours } from "@/utils/roadmap";
import { daysUntilExam, formatExamDate, monthsUntilExam } from "@/utils/exam-date";
import { PLEDGE_COPY } from "@/features/commitment/copy";
import { ContentNotice } from "@/features/practice/components/content-waiting";
import { CommitmentBanner } from "./commitment-banner";
import { DailyTasks } from "@/features/home/components/daily-tasks";
import { retryContent } from "@/lib/content";
import { PageTitle } from "@/components/page-title";
import { cn } from "@/utils/cn";
import { Map as MapIcon } from "lucide-react";
import type { Lang } from "@/types";
import {
  monthLabel,
  monthProgressLabel,
  pastCountLabel,
  roadmapCopy,
  studiedTodayLabel,
  toStudyLabel,
  waitingLabel,
} from "../copy";
import type { PlanMonth } from "../study-plan";
import { useStudyPlan } from "../use-study-plan";

const SUBJECT_ICONS: Record<string, string> = {
  math: "📐",
  physics: "⚛️",
  chemistry: "🧪",
  biology: "🧬",
  history: "📜",
  khmer: "📖",
  english: "🗣️",
  french: "🗣️",
};

function monthIcon(month: PlanMonth): string {
  if (month.isExam) return "🎯";
  return SUBJECT_ICONS[month.subjects[0] ?? ""] ?? "📚";
}

/** The row's second line: what the month holds, in the month's own tense. */
function monthProgress(month: PlanMonth, lang: Lang): string | null {
  const total = month.items.length;
  if (total === 0) return null;
  if (month.status === "past") return pastCountLabel(month.done, lang);
  if (month.status === "current") return monthProgressLabel(month.done, total, lang);
  return toStudyLabel(total, lang);
}

function PathConnector({ flip }: { flip: boolean }) {
  return (
    <svg
      viewBox="0 0 300 70"
      preserveAspectRatio="none"
      className={`h-[70px] w-full drop-shadow-[0_0_10px_var(--path-glow)] ${flip ? "scale-x-[-1]" : ""}`}
    >
      <path
        d="M40,0 C40,35 260,35 260,70"
        fill="none"
        stroke="url(#roadmapPathGrad)"
        strokeWidth={4}
        strokeLinecap="round"
      />
    </svg>
  );
}

// Derived from the live accent tokens rather than repeating their hexes, so the
// pulse follows the theme — the raw rgba these replaced were hardcoded copies
// of the light-mode pink and yellow.
const GLOW_PINK = {
  "--glow-color": "color-mix(in oklab, var(--color-pink) 45%, transparent)",
  "--glow-color-strong": "color-mix(in oklab, var(--color-pink) 65%, transparent)",
} as React.CSSProperties;

const GLOW_GOLD = {
  "--glow-color": "color-mix(in oklab, var(--color-yellow) 45%, transparent)",
  "--glow-color-strong": "color-mix(in oklab, var(--color-yellow) 65%, transparent)",
} as React.CSSProperties;

function PhaseNode({
  icon,
  isFirst,
  isLast,
}: {
  icon: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  // Brand fills, not the lifted accents: these are saturated discs carrying an
  // emoji, and the dark-mode accents would make them shout. The middle node is
  // a tint, so it correctly follows the lifted token instead.
  //
  // ONLY the two endpoints pulse. Every node used to, which meant the number of
  // animating discs tracked the months left on the countdown — around twelve of
  // them glowing at once on the screen a student lands on straight out of the
  // survey. A path where everything pulses points at nothing, and the middle
  // nodes never even set --glow-color, so they were borrowing the FAB's purple
  // glow by accident. The start and finish markers are what the eye needs here.
  const nodeClasses = isFirst
    ? "bg-[var(--brand-purple)] animate-fab-pulse"
    : isLast
      ? "bg-[var(--brand-pink)] animate-fab-pulse"
      : "bg-purple/10";

  return (
    <div
      style={isFirst ? GLOW_PINK : isLast ? GLOW_GOLD : undefined}
      // ring-bg, not ring-white: the halo's job is to knock the node out of the
      // path connector running behind it, so it has to match the page.
      // `relative` anchors .animate-fab-pulse's glow layer — see globals.css.
      className={`relative ring-4 ring-bg flex size-16 shrink-0 items-center justify-center rounded-full text-3xl ${nodeClasses}`}
    >
      {icon}
    </div>
  );
}

export function RoadmapView() {
  const {
    lang,
    userData,
    commitment,
    setPledgeOpen,
  } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      userData: s.userData,
      commitment: s.commitment,
      setPledgeOpen: s.setPledgeOpen,
    }))
  );
  const t = useT(lang);
  const c = roadmapCopy(lang);
  const navigate = useNavigate();
  const { plan, manifest, activityLog, today } = useStudyPlan();

  const hrs = dailyHours(userData.grade, monthsUntilExam());
  const minutesToday = activityLog[today]?.minutes ?? 0;

  // Derived from the fixed exam date, so it counts down on its own instead of
  // holding whatever the student once typed.
  const daysLeft = daysUntilExam();

  // Khmer has no capitals, and wide letter spacing pulls a Khmer cluster apart.
  const label = cn(
    "text-[11px] font-extrabold text-muted",
    lang === "en" && "tracking-widest uppercase"
  );
  const subjectName = (s: string) => t[s as TranslationKey] ?? s;

  // A month with nothing in it reads differently depending on when it is.
  const monthTitle = (m: PlanMonth) => {
    if (m.isExam) return c.examTitle;
    if (m.subjects.length > 0) {
      return `${c.focusOn} ${m.subjects.slice(0, 2).map(subjectName).join(" & ")}${
        m.subjects.length > 2 ? ` +${m.subjects.length - 2}` : ""
      }`;
    }
    return m.status === "past" ? c.nothingRecorded : c.mixedPractice;
  };

  return (
    // Capped and centred rather than widened into columns: the roadmap is a
    // sequential path through phases, and reading it as one top-to-bottom
    // journey is the point. Two columns would break that order.
    <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-36 lg:pb-10">
      <PageTitle
        icon={MapIcon}
        fill="orange"
        title={t.yourRoadmap}
        subtitle={t.bacStudy}
        className="mb-5"
      />

      {commitment && (
        <CommitmentBanner
          commitment={commitment}
          lang={lang}
          onResign={() => setPledgeOpen(true)}
        />
      )}

      {/* Target grade + time left + recommended hours */}
      <div className="mb-4 rounded-2xl border border-border bg-surface p-4 shadow-panel">
        <div className="mb-3.5 flex items-center gap-2.5">
          <span className="text-xl">🎯</span>
          <div>
            <div className={label}>{c.targetGrade}</div>
            <div className="font-heading text-xl font-extrabold text-yellow">
              {userData.grade || "—"}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className={label}>{t.examDate}</div>
            {/* The count carries the emphasis and the words ride small beside
                it — at 320px "350 Days Left" all at text-xl wraps mid-phrase. */}
            <div className="font-heading text-xl font-extrabold text-pink">
              {daysLeft} <span className="text-xs">{t.daysLeft}</span>
            </div>
            <div className="text-[11px] font-bold text-muted">
              {formatExamDate(lang)}
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-purple/5 p-3.5 text-center">
          <div className={cn("mb-1.5", label)}>⏰ {t.recommendedTime}</div>
          <div className="font-heading text-4xl font-bold text-[var(--brand-flame-from)]">
            {hrs}
          </div>
          <div className="text-sm font-bold text-muted">{t.hoursPerDay}</div>
          <div className="mt-1 text-[11px] text-muted">{t.basedOn}</div>
          <div className="mt-1 text-xs font-extrabold text-text">
            {studiedTodayLabel(minutesToday, lang)}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <DailyTasks />
      </div>

      {/* Phases */}
      <div className="mb-4">
        <div className="mb-3 font-heading text-sm font-extrabold">
          🗺️ {t.roadmapPhases}
        </div>
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <defs>
            <linearGradient id="roadmapPathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-pink)" />
              <stop offset="50%" stopColor="var(--color-purple)" />
              <stop offset="100%" stopColor="var(--color-blue)" />
            </linearGradient>
          </defs>
        </svg>
        {/* Not until the list of what exists has arrived: before that every month
            would read as empty, and every weak subject as coming soon. */}
        {manifest.status !== "ready" ? (
          <ContentNotice
            state={manifest.status === "failed" ? "offline" : "loading"}
            onRetry={retryContent}
          />
        ) : (
          <>
            {plan.waiting.length > 0 && (
              <p className="mb-3 text-xs leading-relaxed font-bold text-muted">
                {waitingLabel(plan.waiting.map(subjectName).join(", "), lang)}
              </p>
            )}
            <div className="flex flex-col">
              {plan.months.map((m, i) => {
                const isCurrent = m.status === "current";
                const isLast = i === plan.months.length - 1;
                const onRight = i % 2 === 1;
                const progress = monthProgress(m, lang);

                return (
                  <div key={m.key}>
                    {i > 0 && <PathConnector flip={i % 2 === 0} />}
                    <Link
                      to={`/roadmap/${m.key}`}
                      className={`flex items-center gap-3 ${onRight ? "flex-row-reverse" : ""}`}
                    >
                      <PhaseNode icon={monthIcon(m)} isFirst={isCurrent} isLast={isLast} />
                      <div className="max-w-[210px] rounded-2xl border border-border bg-surface p-3 shadow-panel-sm">
                        <div className="text-[11px] font-extrabold text-muted">
                          {monthLabel(m.key, lang)}
                        </div>
                        <div className="text-sm font-extrabold">{monthTitle(m)}</div>
                        {progress && (
                          <div className="mt-0.5 text-[10px] font-bold text-muted">{progress}</div>
                        )}
                        {isCurrent && (
                          <div className="mt-1 inline-block rounded-full bg-pink/10 px-2 py-0.5 text-[10px] font-extrabold text-pink">
                            {m.done === 0 ? c.startNow : c.thisMonth}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Unsigned students are asked to commit to the plan they just read
          before they start; once signed, this is the plain "start" CTA again. */}
      <button
        onClick={() => (commitment ? navigate("/") : setPledgeOpen(true))}
        className="w-full rounded-2xl bg-brand-tri bg-[length:200%_auto] px-6 py-3.5 text-sm font-extrabold text-white shadow-cta animate-shimmer"
      >
        {commitment ? t.studyNow : PLEDGE_COPY[lang].readyToCommit}
      </button>
    </div>
  );
}
