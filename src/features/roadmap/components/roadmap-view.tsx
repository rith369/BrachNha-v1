import { Link, useNavigate } from "react-router";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useT } from "@/data/translations";
import type { TranslationKey } from "@/data/translations";
import {
  buildRoadmapPhases,
  computeDailyMission,
  GRADE_HOURS,
  type RoadmapPhase,
} from "@/utils/roadmap";
import {
  daysUntilExam,
  formatExamDate,
  monthsUntilExam,
} from "@/utils/exam-date";
import type { Tasks } from "@/types";
import { PLEDGE_COPY } from "@/features/commitment/copy";
import { CommitmentBanner } from "./commitment-banner";

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
  phase,
  isFirst,
  isLast,
}: {
  phase: RoadmapPhase;
  isFirst: boolean;
  isLast: boolean;
}) {
  // Brand fills, not the lifted accents: these are saturated discs carrying an
  // emoji, and the dark-mode accents would make them shout. The middle node is
  // a tint, so it correctly follows the lifted token instead.
  const nodeClasses = isFirst
    ? "bg-linear-to-br from-[var(--brand-pink)] via-[var(--brand-purple)] to-[var(--brand-blue)] animate-fab-pulse"
    : isLast
      ? "bg-linear-to-br from-[var(--brand-yellow)] to-[var(--brand-pink)] animate-fab-pulse"
      : "bg-purple/10 animate-fab-pulse";

  return (
    <div
      style={isFirst ? GLOW_PINK : isLast ? GLOW_GOLD : undefined}
      // ring-bg, not ring-white: the halo's job is to knock the node out of the
      // path connector running behind it, so it has to match the page.
      className={`ring-4 ring-bg flex size-16 shrink-0 items-center justify-center rounded-full text-3xl ${nodeClasses}`}
    >
      {phase.icon}
    </div>
  );
}

export function RoadmapView() {
  const {
    lang,
    userData,
    tasks,
    completeTask,
    pendingPlacementTests,
    commitment,
    setPledgeOpen,
  } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      userData: s.userData,
      tasks: s.tasks,
      completeTask: s.completeTask,
      pendingPlacementTests: s.pendingPlacementTests,
      commitment: s.commitment,
      setPledgeOpen: s.setPledgeOpen,
    }))
  );
  const t = useT(lang);
  const navigate = useNavigate();

  // Nothing in the survey books a placement test any more, so this is only ever
  // non-empty for an account that scheduled one before that changed. Undated
  // entries are dropped rather than rendered — `new Date("")` is Invalid Date.
  const scheduledTests = pendingPlacementTests.filter((p) => p.scheduledDate);

  const hrs = GRADE_HOURS[userData.grade] || 2;

  // Both derived from the fixed exam date, so the plan tightens on its own as
  // the exam approaches instead of holding whatever the student once typed.
  const daysLeft = daysUntilExam();
  const monthsLeft = monthsUntilExam();

  const phases = buildRoadmapPhases(
    userData.weaknesses,
    monthsLeft,
    (s) => t[s as TranslationKey] ?? s,
    lang
  );

  const mission = computeDailyMission(userData.grade, monthsLeft);
  const missionRows: {
    key: keyof Tasks;
    icon: string;
    label: string;
    count: number;
    href: string;
  }[] = [
    {
      key: "lesson",
      icon: "📚",
      label: lang === "en" ? "Lessons" : "មេរៀន",
      count: mission.lessons,
      href: "/lessons",
    },
    {
      key: "practice",
      icon: "✏️",
      label: lang === "en" ? "Practice" : "អនុវត្ត",
      count: mission.practice,
      href: "/exam",
    },
    {
      key: "flashcards",
      icon: "🗂️",
      label: lang === "en" ? "Flashcards" : "កាតទន្លាប់",
      count: mission.flashcards,
      href: "/lessons",
    },
  ];
  const allMissionsDone = missionRows.every((row) => tasks[row.key]);

  return (
    // Capped and centred rather than widened into columns: the roadmap is a
    // sequential path through phases, and reading it as one top-to-bottom
    // journey is the point. Two columns would break that order.
    <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-36 lg:pb-10">
      <div className="mb-5 pr-14">
        <div className="font-heading bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
          {t.yourRoadmap} 🗺️
        </div>
        <div className="text-xs font-bold text-muted">{t.bacStudy}</div>
      </div>

      {commitment && (
        <CommitmentBanner
          commitment={commitment}
          lang={lang}
          onResign={() => setPledgeOpen(true)}
        />
      )}

      {/* Target grade + time left + recommended hours */}
      <div className="mb-4 rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
        <div className="mb-3.5 flex items-center gap-2.5">
          <span className="text-xl">🎯</span>
          <div>
            <div className="text-[11px] font-extrabold tracking-widest text-muted uppercase">
              Target Grade
            </div>
            <div className="font-heading text-xl font-extrabold text-yellow">
              {userData.grade || "—"}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[11px] font-extrabold tracking-widest text-muted uppercase">
              {t.examDate}
            </div>
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
          <div className="mb-1.5 text-[11px] font-extrabold tracking-widest text-muted uppercase">
            ⏰ {t.recommendedTime}
          </div>
          <div className="font-heading bg-linear-to-br from-pink to-yellow bg-clip-text text-4xl font-bold text-transparent">
            {hrs}
          </div>
          <div className="text-sm font-bold text-muted">{t.hoursPerDay}</div>
          <div className="mt-1 text-[11px] text-muted">{t.basedOn}</div>
        </div>
      </div>

      {/* Pending placement tests. Undated entries are filtered out rather than
          rendered — `new Date("")` is Invalid Date, and a test with no day has
          nothing useful to say here anyway. */}
      {scheduledTests.length > 0 && (
        <div className="mb-4 rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
          <div className="mb-3 flex items-center gap-1.5 font-heading text-sm font-extrabold">
            📅 {t.pendingTests}
          </div>
          <div className="flex flex-col gap-2">
            {scheduledTests.map((p) => {
              const overdue = new Date(p.scheduledDate) <= new Date();
              return (
                <div
                  key={p.subject}
                  className="flex items-center gap-3 rounded-xl bg-purple/5 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold">
                      {t[p.subject as TranslationKey] ?? p.subject}
                    </div>
                    <div
                      className={`text-xs font-bold ${overdue ? "text-pink" : "text-muted"}`}
                    >
                      {overdue
                        ? t.overdue
                        : `${t.scheduledFor} ${new Date(p.scheduledDate).toLocaleDateString()}`}
                    </div>
                  </div>
                  <Link
                    to={`/placement-test/${p.subject}`}
                    className="shrink-0 rounded-full bg-brand px-2.5 py-1 text-[11px] font-extrabold text-white"
                  >
                    {t.takeTestNow}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Mission */}
      <div className="mb-4 rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
        <div className="mb-3 flex items-center gap-1.5 font-heading text-sm font-extrabold">
          🎯 {t.dailyMission}
        </div>
        {!allMissionsDone ? (
          <div className="flex flex-col gap-2">
            {missionRows.map((row) => {
              const done = tasks[row.key];
              return (
                <div
                  key={row.key}
                  className="flex items-center gap-3 rounded-xl bg-purple/5 px-3 py-2.5"
                >
                  <span className="text-xl">{row.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold">{row.label}</div>
                    <div className="text-xs font-bold text-muted">
                      {done
                        ? lang === "en"
                          ? "Done ✓"
                          : "ធ្វើរួច ✓"
                        : `${row.count} ${lang === "en" ? "today" : "ថ្ងៃនេះ"}`}
                    </div>
                  </div>
                  {!done && (
                    <>
                      <Link
                        to={row.href}
                        className="shrink-0 rounded-full bg-purple/10 px-2.5 py-1 text-[11px] font-extrabold text-purple"
                      >
                        {lang === "en" ? "Go →" : "ទៅ →"}
                      </Link>
                      <button
                        onClick={() => completeTask(row.key)}
                        className="shrink-0 rounded-full bg-brand px-2.5 py-1 text-[11px] font-extrabold text-white"
                      >
                        {lang === "en" ? "Done" : "ចប់"}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-2 text-center text-sm font-extrabold text-mint">
            {t.missionDone}
          </div>
        )}
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
        <div className="flex flex-col">
          {phases.map((p, i) => {
            const isFirst = i === 0;
            const isLast = i === phases.length - 1;
            const isMissingContent = p.subjects.length > 0 && !p.hasLessonContent;
            const onRight = i % 2 === 1;

            return (
              <div key={i}>
                {i > 0 && <PathConnector flip={i % 2 === 0} />}
                <Link
                  to={p.hasLessonContent ? "/lessons" : "/exam"}
                  className={`flex items-center gap-3 ${onRight ? "flex-row-reverse" : ""}`}
                >
                  <PhaseNode phase={p} isFirst={isFirst} isLast={isLast} />
                  <div className="max-w-[210px] rounded-2xl border border-purple/10 bg-surface p-3 shadow-panel-sm">
                    <div className="text-[11px] font-extrabold text-muted">
                      {t.month} {p.month}
                      {isMissingContent && ` · ${t.comingSoon}`}
                    </div>
                    <div className="text-sm font-extrabold">{p.title}</div>
                    {isFirst && (
                      <div className="mt-1 inline-block rounded-full bg-pink/10 px-2 py-0.5 text-[10px] font-extrabold text-pink">
                        {lang === "en" ? "Start now" : "ចាប់ផ្តើមឥឡូវនេះ"}
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
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
