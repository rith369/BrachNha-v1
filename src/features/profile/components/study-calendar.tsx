import { useState, type CSSProperties } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  GraduationCap,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Card } from "@/components/ui/card";
import { MAX_ACTIVITY_DAYS, useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";
import { daysLabel, weekdayLabel } from "@/features/streak/copy";
import type { WeekdayId } from "@/features/streak/demo-data";
import type { Lang } from "@/types";
import { addDaysKey, parseDayKey, todayKey } from "@/utils/day";
import { BAC2_EXAM_DATE, daysUntilExam } from "@/utils/exam-date";
import { DAILY_GOAL_TASKS, bestStreak, goalTasksDone } from "@/utils/streak";
import {
  addMonths,
  buildMonthGrid,
  compareMonths,
  monthOf,
  type YearMonth,
} from "@/utils/study-calendar";
import { cn } from "@/utils/cn";
import { KM_MONTHS } from "@/utils/khmer-dates";

// Sunday first, matching buildMonthGrid and the Progress heatmap.
const WEEK: WeekdayId[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// Hand-written Khmer month names, shared with the Progress page — see
// utils/khmer-dates.ts for why they are not taken from Intl.
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

/** Under a FUTURE month's title, where "goal done on 0 days" would be true and
 *  useless. The same countdown Home's hero shows, from the same function. */
function examCountdownLabel(days: number, lang: Lang): string {
  if (lang === "km") return `នៅសល់ ${days} ថ្ងៃ ដល់ Bac II`;
  return `${days} ${days === 1 ? "day" : "days"} until Bac II`;
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
 * The streak flame, as a CSS MASK rather than an SVG icon.
 *
 * The path is Lucide's own Flame (lucide-react 1.33) — the same glyph as the
 * streak in StatBar, the stat pills and the Streak page — drawn filled AND
 * stroked, as those filled flames are, so the silhouette matches. It is a mask
 * because the fill is a GRADIENT: an SVG would need its own <linearGradient>
 * with an id unique on the page, times ~30 flames a month (the problem
 * daily-goal-card.tsx's ring comment describes). A mask takes any CSS
 * background instead.
 *
 * The viewBox is CROPPED to the flame (x 4–20, y 2–23, stroke included)
 * rather than Lucide's 24×24 square. The square is mostly empty margin, so
 * uncropped the flame filled barely two thirds of its cell and a two-digit
 * number spilled past its body. Cropped, it fills the cell's height, and the
 * round body (centre at y 15) lands 13/21 of the way down — the figure the
 * cells' shared baseline is set from.
 */
const FLAME_PATH =
  "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4";
const FLAME_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="4 2 16 21"><path d="${FLAME_PATH}" fill="#000" stroke="#000" stroke-width="2" stroke-linejoin="round"/></svg>`
)}")`;
const FLAME_MASK_STYLE: CSSProperties = {
  maskImage: FLAME_MASK,
  WebkitMaskImage: FLAME_MASK,
  maskSize: "contain",
  WebkitMaskSize: "contain",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskPosition: "center",
};

/**
 * Orange at the tip, the flame ramp's pink from halfway down. The white day
 * number sits in that lower half, and that is what the split is for:
 * `--brand-flame-to` is 4.6:1 with white, clearing 4.5:1 for small text, while
 * the orange end is 4.2:1 and would not — globals.css reserves the full ramp
 * for large text and glyphs for exactly that reason. Both are `--brand-*`, so
 * identical in both themes.
 */
const FLAME_FILL =
  "linear-gradient(to bottom, var(--brand-flame-from), var(--brand-flame-to) 50%)";

function FlameShape({
  className,
  fill,
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("absolute inset-0", className)}
      style={{ ...FLAME_MASK_STYLE, backgroundImage: fill }}
    />
  );
}

/**
 * A month of study days, on Profile.
 *
 * Everything on it is DERIVED from the store's activityLog — the same record
 * the streak is computed from — so the flames, the streak and the best streak
 * cannot disagree with each other or with the stat pills above.
 *
 * NO CIRCLES, AT THE USER'S REQUEST — the days look like a streak. A day the
 * daily goal was finished is a BIG FLAME with the number inside it: those are
 * the days the streak counts, so a run of flames IS the streak, visibly. A day
 * with study but an unfinished goal is a smaller, faint flame: real work,
 * shown, but not a streak day — full-size flames there would draw an unbroken
 * run beside a streak that says it broke. Today is an underline, the exam day a
 * graduation cap.
 *
 * Every number sits on ONE baseline, low in the cell where the flame's round
 * body is, whether or not a flame is drawn — so a row reads as a row, and a
 * flame never lifts its number out of line with its neighbours.
 *
 * Days are `<div>`s with an aria-label, never buttons: there is nothing behind
 * a day to open, and a control that answers a tap with silence reads as broken
 * (sidebar-nav.tsx's `href: null` rows, subject-card.tsx's zero-lesson tile).
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

  // The arrows go anywhere in a fixed window, not just to months with data.
  // They used to stop at the first logged month and at this one, which on a
  // new install meant two faded arrows that did nothing when tapped — read,
  // correctly, as broken.
  //
  // BACK as far as the log can hold (MAX_ACTIVITY_DAYS) and no further: before
  // that no day can ever have been recorded. FORWARD to the exam month — the one
  // future date this app knows is coming, read from BAC2_EXAM_DATE so rolling to
  // the next cohort moves it too — and never short of this month, so the
  // calendar still reaches today after the exam has passed.
  const firstMonth = monthOf(
    parseDayKey(addDaysKey(new Date(), -MAX_ACTIVITY_DAYS))
  );
  const examMonth = monthOf(BAC2_EXAM_DATE);
  const lastMonth =
    compareMonths(examMonth, thisMonth) > 0 ? examMonth : thisMonth;
  const canPrev = compareMonths(shown, firstMonth) > 0;
  const canNext = compareMonths(shown, lastMonth) < 0;
  const onThisMonth = compareMonths(shown, thisMonth) === 0;
  const futureMonth = compareMonths(shown, thisMonth) > 0;

  const examDay = todayKey(BAC2_EXAM_DATE);
  const examShown = compareMonths(shown, examMonth) === 0;

  const loggedDays = Object.keys(activityLog);
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
        {/* The way home from up to a year either side. Absent, not disabled,
            on this month — there is nowhere for it to go. */}
        {!onThisMonth && (
          <button
            onClick={() => setShown(thisMonth)}
            className="ml-auto rounded-full border border-purple/20 bg-purple/8 px-2.5 py-0.5 font-body text-[11px] font-extrabold text-purple transition active:scale-95"
          >
            {t.calendarToday}
          </button>
        )}
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
          <div
            className={cn(
              "text-[11px] font-bold",
              examShown && futureMonth ? "text-pink" : "text-muted"
            )}
          >
            {examShown && futureMonth
              ? `${t.examDate}${lang === "km" ? "៖" : ":"} ${dayLabel(BAC2_EXAM_DATE, lang)}`
              : futureMonth
                ? examCountdownLabel(daysUntilExam(), lang)
                : goalDaysLabel(goalDaysInMonth, lang)}
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

      <div className="grid grid-cols-7 gap-y-1">
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
            const isExam = day === examDay;
            const date = parseDayKey(day);
            const status = goal
              ? `${t.calendarGoalDone} · ${xp} XP`
              : studied
                ? `${t.calendarStudied} · ${xp} XP`
                : isFuture
                  ? null
                  : t.calendarNotStudied;
            const label = [
              isToday ? t.calendarToday : dayLabel(date, lang),
              isExam ? t.examDate : null,
              status,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <div
                key={day}
                // A future day has nothing to announce — except the exam.
                aria-label={isFuture && !isExam ? undefined : label}
                className={cn(
                  // Taller than wide, as the flame is (16:21), so it fills the
                  // cell's height. The bottom padding puts every number's
                  // centre where the flame's round body is — 13/21 down — so
                  // numbers share one baseline, flame or not.
                  "relative mx-auto flex h-11 w-9 items-end justify-center pb-[9px] text-xs font-extrabold md:h-12 md:w-10 md:pb-2.5",
                  goal
                    ? "text-white"
                    : studied
                      ? "text-purple"
                      : isExam
                        ? "text-pink"
                        : isToday
                          ? "text-text"
                          : isFuture
                            ? "text-muted/40"
                            : "text-muted"
                )}
              >
                {goal && <FlameShape fill={FLAME_FILL} />}
                {/* Three quarters the size, inset in PERCENT so its body stays
                    centred on the number at both cell sizes. */}
                {!goal && studied && (
                  <FlameShape className="inset-x-[17%] top-[18%] bottom-[9%] bg-purple/20" />
                )}
                {/* Pink, the per-theme scale — a small mark, not a fill under
                    white text. On the day itself it still shows over a flame. */}
                {isExam && (
                  <GraduationCap
                    aria-hidden
                    className={cn(
                      "absolute top-0 left-1/2 size-3.5 -translate-x-1/2",
                      goal ? "text-white" : "text-pink"
                    )}
                    strokeWidth={2.5}
                  />
                )}
                <span className="relative">{date.getDate()}</span>
                {/* Today: an underline rather than a ring. White over a
                    flame, where purple would sink into the pink. */}
                {isToday && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute bottom-0.5 left-1/2 h-0.5 w-3.5 -translate-x-1/2 rounded-full",
                      goal ? "bg-white" : "bg-purple"
                    )}
                  />
                )}
              </div>
            );
          })}
      </div>

      {/* The marks need a key: the tint is the one a student would otherwise
          read as "almost counted". The exam joins only on the month it is in,
          and the row wraps rather than squeezes at the 320px floor. */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] font-bold text-muted">
        <span className="flex items-center gap-1.5">
          <span className="relative size-4">
            <FlameShape fill={FLAME_FILL} />
          </span>
          {t.calendarGoalDone}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="relative size-4">
            <FlameShape className="inset-0.5 bg-purple/25" />
          </span>
          {t.calendarStudied}
        </span>
        {examShown && (
          <span className="flex items-center gap-1.5 text-pink">
            <GraduationCap className="size-3.5" strokeWidth={2.5} aria-hidden />
            {t.examDate}
          </span>
        )}
      </div>

      {!goalToday && (
        <p className="mt-3 text-center text-xs font-bold text-muted">
          {goalNudge(doneToday, streak, lang)}
        </p>
      )}
    </Card>
  );
}
