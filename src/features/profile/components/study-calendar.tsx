import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";
import { daysLabel, weekdayLabel } from "@/features/streak/copy";
import type { WeekdayId } from "@/features/streak/demo-data";
import type { Lang } from "@/types";
import { parseDayKey, todayKey } from "@/utils/day";
import { DAILY_GOAL_TASKS, bestStreak, goalTasksDone } from "@/utils/streak";
import {
  addMonths,
  buildMonthGrid,
  compareMonths,
  monthOf,
  type YearMonth,
} from "@/utils/study-calendar";
import { cn } from "@/utils/cn";

// Sunday first, matching buildMonthGrid and the Progress heatmap.
const WEEK: WeekdayId[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// Hand-written, NOT Intl. Desktop Chrome was measured reporting no Khmer
// locale data at all — Intl.DateTimeFormat.supportedLocalesOf(["km"]) is
// empty — and it formats "km-KH" in English without complaint; Android builds
// ship trimmed locale data too. The streak screens hand-write their Khmer
// weekday initials for the same reason. Digits stay Latin, matching them.
const KM_MONTHS = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

function monthLabel({ year, month }: YearMonth, lang: Lang): string {
  if (lang === "km") return `${KM_MONTHS[month]} ${year}`;
  return new Date(year, month, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function dayLabel(date: Date, lang: Lang): string {
  if (lang === "km") return `${date.getDate()} ${KM_MONTHS[date.getMonth()]}`;
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function goalDaysLabel(days: number, lang: Lang): string {
  if (lang === "km") return `បញ្ចប់គោលដៅ ${days} ថ្ងៃ`;
  return `Goal done on ${days} ${days === 1 ? "day" : "days"}`;
}

/** Shown only while today's goal is still open — with how far along it is,
 *  because "finish your goal" means little without "you are 2 of 3 there". */
function goalNudge(done: number, streak: number, lang: Lang): string {
  const of = `${done} / ${DAILY_GOAL_TASKS.length}`;
  if (lang === "km") {
    return streak > 0
      ? `បញ្ចប់គោលដៅថ្ងៃនេះ (${of}) ដើម្បីរក្សា Streak របស់អ្នកកុំឲ្យដាច់។`
      : `បញ្ចប់គោលដៅថ្ងៃនេះ (${of}) ដើម្បីចាប់ផ្តើម Streak របស់អ្នក។`;
  }
  return streak > 0
    ? `Finish today's goal (${of}) to keep your streak going.`
    : `Finish today's goal (${of}) to start your streak.`;
}

function Stat({
  icon: Icon,
  tone,
  value,
  label,
}: {
  icon: LucideIcon;
  tone: string;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-purple/8 px-3 py-2.5">
      <Icon className={cn("size-5 shrink-0", tone)} strokeWidth={2.25} />
      <div className="min-w-0">
        <div className={cn("font-heading text-sm font-extrabold", tone)}>
          {value}
        </div>
        {/* Wraps rather than truncates: at the 320px floor each box has ~70px
            for text, and "Current str…" says less than two short lines do. */}
        <div className="text-[11px] leading-tight font-bold text-muted">
          {label}
        </div>
      </div>
    </div>
  );
}

/**
 * A month of study days, on Profile.
 *
 * Everything on it is DERIVED from the store's activityLog — the same record
 * the streak is computed from — so the filled days, the streak and the best
 * streak cannot disagree with each other or with the stat pills above.
 *
 * TWO KINDS OF MARKED DAY, because the streak rule has two kinds of day in it.
 * A day the daily goal was completed is a SOLID circle — those are the days the
 * streak counts, so the solid runs on the grid are the streak, visibly. A day
 * with study but an unfinished goal is a faint TINT: real work, shown, but not a
 * streak day. Filling those solid too would draw an unbroken run next to a
 * streak that says it broke.
 *
 * Days are `<div>`s with an aria-label, never buttons: there is nothing behind
 * a day to open, and a control that answers a tap with silence reads as broken
 * (sidebar-nav.tsx's `href: null` rows, subject-card.tsx's zero-lesson tile).
 *
 * Goal days are `bg-brand` under a white number — the brand scale is the one
 * cleared for white text in both themes. Not the flame ramp: globals.css
 * reserves that for large text and glyphs, and a 12px digit on it misses 4.5:1.
 * The tint is the per-theme `/10` purple, correct in dark with no override.
 */
export function StudyCalendar() {
  const { lang, streak, activityLog, tasks, tasksDate } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      streak: s.streak,
      activityLog: s.activityLog,
      tasks: s.tasks,
      tasksDate: s.tasksDate,
    }))
  );
  const t = useT(lang);

  const today = todayKey();
  const thisMonth = monthOf(new Date());
  const [shown, setShown] = useState<YearMonth>(thisMonth);

  // Paging back stops at the first month anything was logged: an arrow into
  // months of empty grid before the student ever opened the app shows nothing
  // true. Forward stops at this month — the future has no days to report.
  const loggedDays = Object.keys(activityLog).sort();
  const earliest = loggedDays.length
    ? monthOf(parseDayKey(loggedDays[0]))
    : thisMonth;
  const canPrev = compareMonths(shown, earliest) > 0;
  const canNext = compareMonths(shown, thisMonth) < 0;

  const monthPrefix = `${shown.year}-${String(shown.month + 1).padStart(2, "0")}-`;
  const goalDaysInMonth = loggedDays.filter(
    (d) => d.startsWith(monthPrefix) && activityLog[d]?.goal === true
  ).length;
  const best = bestStreak(activityLog);
  const goalToday = activityLog[today]?.goal === true;
  // `tasks` is only ever today's — but only once the rollover has stamped it,
  // so a checklist from yesterday must read as nothing done yet.
  const doneToday = tasksDate === today ? goalTasksDone(tasks) : 0;

  return (
    <Card className="gap-0">
      <div className="mb-3 flex items-center gap-2 font-heading text-sm font-extrabold">
        <CalendarDays className="size-4 text-purple" strokeWidth={2.5} />
        {t.studyCalendar}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <Stat
          icon={Flame}
          tone="text-yellow"
          value={daysLabel(streak, lang)}
          label={t.calendarCurrentStreak}
        />
        <Stat
          icon={Trophy}
          tone="text-purple"
          value={daysLabel(best, lang)}
          label={t.calendarBestStreak}
        />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setShown(addMonths(shown, -1))}
          disabled={!canPrev}
          aria-label={t.previousMonth}
          className="rounded-lg p-1.5 text-purple transition hover:bg-purple/8 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="size-4" strokeWidth={2.75} />
        </button>
        <div className="text-center">
          <div className="text-sm font-extrabold">{monthLabel(shown, lang)}</div>
          <div className="text-[11px] font-bold text-muted">
            {goalDaysLabel(goalDaysInMonth, lang)}
          </div>
        </div>
        <button
          onClick={() => setShown(addMonths(shown, 1))}
          disabled={!canNext}
          aria-label={t.nextMonth}
          className="rounded-lg p-1.5 text-purple transition hover:bg-purple/8 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight className="size-4" strokeWidth={2.75} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1.5">
        {WEEK.map((id) => (
          <div
            key={id}
            className="pb-1 text-center text-[10px] font-extrabold text-muted"
          >
            {weekdayLabel(id, lang)}
          </div>
        ))}
        {buildMonthGrid(shown)
          .flat()
          .map((day, i) => {
            if (day === null) return <div key={`pad-${i}`} />;

            const entry = activityLog[day];
            const xp = entry?.xp ?? 0;
            const goal = entry?.goal === true;
            const studied = xp > 0;
            const isToday = day === today;
            const isFuture = day > today;
            const date = parseDayKey(day);
            const label = [
              isToday ? t.calendarToday : dayLabel(date, lang),
              goal
                ? `${t.calendarGoalDone} · ${xp} XP`
                : studied
                  ? `${t.calendarStudied} · ${xp} XP`
                  : t.calendarNotStudied,
            ].join(" · ");

            return (
              <div
                key={day}
                aria-label={isFuture ? undefined : label}
                className={cn(
                  "mx-auto flex size-8 items-center justify-center rounded-full text-xs font-extrabold md:size-9",
                  goal
                    ? "bg-brand text-white"
                    : studied
                      ? "bg-purple/10 text-purple"
                      : isFuture
                        ? "text-muted/40"
                        : "text-muted",
                  isToday &&
                    (goal
                      ? "ring-2 ring-purple/40 ring-offset-2 ring-offset-card"
                      : cn("ring-2 ring-purple", !studied && "text-text"))
                )}
              >
                {date.getDate()}
              </div>
            );
          })}
      </div>

      {/* The two marks need a key: the tint is the one a student would
          otherwise read as "almost counted". */}
      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-bold text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-brand" aria-hidden />
          {t.calendarGoalDone}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-purple/15" aria-hidden />
          {t.calendarStudied}
        </span>
      </div>

      {!goalToday && (
        <p className="mt-3 text-center text-xs font-bold text-muted">
          {goalNudge(doneToday, streak, lang)}
        </p>
      )}
    </Card>
  );
}
