import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { celebratedOn, markCelebrated } from "@/lib/streak-celebrated";
import { isGoalComplete, milestoneProgress, rankMilestones } from "@/utils/streak";
import { addDaysKey, parseDayKey, todayKey } from "@/utils/day";
import { useStudyFeed } from "@/features/home/use-study-feed";
import { taskHref } from "@/features/home/task-links";
import { useStreakCopy } from "../copy";
import { STREAK_MILESTONES } from "../milestones";
import { WEEKDAY_BY_INDEX, type DailyTask, type StreakDay } from "../types";
import { DailyGoalCard } from "./daily-goal-card";
import { MilestoneCard } from "./milestone-card";
import { MilestoneProgress } from "./milestone-progress";
import { StreakHeader } from "./streak-header";
import { WeeklyStreak } from "./weekly-streak";

/** How long the confetti stays mounted. Matches the 1.1s keyframe plus the
 *  longest per-particle stagger (120ms), with a little slack so nothing is cut
 *  off mid-flight. */
const CELEBRATION_MS = 1400;

const GOAL: DailyTask["id"][] = ["lesson", "practice", "flashcards"];

/**
 * The student's own streak, today's real goal and the real last seven days.
 *
 * THIS WAS A PROTOTYPE until 1 Oct 2026: a fixed week, a goal card that opened
 * at 2/3, and a "Complete Today's Goal" button that added a local +1 and threw
 * confetti without touching the store. All of it reads the store now:
 *
 *  - the count is the store's `streak`, which `currentStreak()` derives;
 *  - the goal card is `tasks`, treated as empty when `tasksDate` is not today
 *    (the same rule Profile's study calendar uses), and every task still open
 *    links to where that work is done, via the same task-links.ts Home uses;
 *  - the week is the last seven days of `activityLog[day].goal`.
 *
 * There is no button that completes anything here any more. The goal is
 * finished by doing a lesson, a quiz and a flashcard deck, and the confetti
 * fires once per day on the first visit after that (lib/streak-celebrated.ts).
 */
export function StreakView() {
  const { lang, streak, activityLog, tasks, tasksDate } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      streak: s.streak,
      activityLog: s.activityLog,
      tasks: s.tasks,
      tasksDate: s.tasksDate,
    }))
  );
  const c = useStreakCopy(lang);
  const feed = useStudyFeed();
  const today = todayKey();

  const todayTasks = tasksDate === today ? tasks : null;
  const completed = todayTasks !== null && isGoalComplete(todayTasks);

  // Lazily, so the check runs once per mount rather than on every render.
  const [celebrating, setCelebrating] = useState(
    () => completed && !celebratedOn(today)
  );
  useEffect(() => {
    if (!celebrating) return;
    markCelebrated(today);
    const timer = window.setTimeout(() => setCelebrating(false), CELEBRATION_MS);
    return () => window.clearTimeout(timer);
  }, [celebrating, today]);

  const goal: DailyTask[] = GOAL.map((id) => ({
    id,
    done: todayTasks?.[id] ?? false,
  }));
  const links = Object.fromEntries(
    GOAL.map((id) => [id, taskHref(id, feed.items)])
  ) as Record<DailyTask["id"], string>;

  const base = parseDayKey(today);
  const week: StreakDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const key = addDaysKey(base, -i);
    week.push({
      id: WEEKDAY_BY_INDEX[parseDayKey(key).getDay()],
      key,
      done: activityLog[key]?.goal === true,
    });
  }

  const milestones = rankMilestones(STREAK_MILESTONES, streak);
  const progress = milestoneProgress(STREAK_MILESTONES, streak);

  return (
    <div className="flex flex-col gap-4">
      <StreakHeader
        streak={streak}
        celebrating={celebrating}
        completed={completed}
      />

      <WeeklyStreak week={week} todayKey={today} />

      <DailyGoalCard tasks={goal} links={links} />

      {/* Absent, not empty, once every rung is behind the student. */}
      {progress && <MilestoneProgress progress={progress} />}

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-sm font-extrabold md:text-base">
          {c.milestones}
        </h2>
        {/* Two columns at the 320px floor is safe here for the same reason the
            Study page's subject tiles are: these are compact status tiles at
            ~136px, not the dense stat cards the grid-cols-1 md:grid-cols-2 rule
            protects. Six cards divide evenly by both 2 and 3, so neither
            breakpoint leaves a hole in the last row. */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {milestones.map((m) => (
            <MilestoneCard key={m.days} milestone={m} />
          ))}
        </div>
      </section>
    </div>
  );
}
