import { useEffect, useRef, useState } from "react";
import { useBrachNhaStore } from "@/lib/store";
import { milestoneProgress, rankMilestones } from "@/utils/streak";
import { useStreakCopy } from "../copy";
import {
  CELEBRATION_STREAK_GAIN,
  DEMO_DAILY_TASKS,
  DEMO_WEEK,
  TODAY_ID,
} from "../demo-data";
import { STREAK_MILESTONES } from "../milestones";
import { DailyGoalCard } from "./daily-goal-card";
import { MilestoneCard } from "./milestone-card";
import { MilestoneProgress } from "./milestone-progress";
import { StreakHeader } from "./streak-header";
import { WeeklyStreak } from "./weekly-streak";

/** How long the confetti stays mounted. Matches the 1.1s keyframe plus the
 *  longest per-particle stagger (120ms), with a little slack so nothing is cut
 *  off mid-flight. */
const CELEBRATION_MS = 1400;

/**
 * The whole page's state, which is two booleans and some derivation.
 *
 * `completed` is the ONE piece of state that matters — everything visible is
 * derived from it, so the streak count, the week's last cell, the goal ring,
 * the milestone bar and the milestone grid cannot disagree about whether today
 * is done. That is the same reason sessionStatus() on the subject path is
 * derived rather than stored.
 *
 * `celebrating` is separate and short-lived: it drives the one-shot animations
 * only, and clears on a timer while `completed` stays true. Folding them into
 * one flag would either leave the confetti on the screen forever or revert the
 * streak when it finished.
 *
 * NOTHING HERE TOUCHES THE STORE. The brief asked for a static prototype, and
 * this is also the honest thing: `completeTask()` awards real XP and coins, so
 * wiring this button to it would pay a student for pressing a demo. See
 * ../demo-data.ts for what real tracking would need — and for the fact that the
 * global StatBar above this page shows the REAL streak, which is 3 by default
 * and will disagree with the 12 below it until that swap happens.
 */
export function StreakView() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  // THE STORE IS THE SOURCE. Home's stat pill, the global StatBar and this page
  // all read the same field, which is what stops them showing different numbers
  // for one fact — see ../demo-data.ts for the bug that caused.
  const base = useBrachNhaStore((s) => s.streak);

  const [completed, setCompleted] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // Clears a pending timer if the student navigates away mid-burst, so the
  // callback cannot fire against an unmounted component.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const complete = () => {
    if (completed) return;
    setCompleted(true);
    setCelebrating(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCelebrating(false), CELEBRATION_MS);
  };

  // The +1 is LOCAL and is not written back — the brief asked for a prototype
  // with no persistence, so a reload returns to the store's number. For the few
  // seconds it differs, this page and the StatBar disagree by one; that is a
  // deliberate demo action rather than the resting state disagreeing.
  const streak = completed ? base + CELEBRATION_STREAK_GAIN : base;

  const tasks = DEMO_DAILY_TASKS.map((t) => ({
    ...t,
    done: completed || t.done,
  }));

  const week = DEMO_WEEK.map((d) => ({
    ...d,
    done: d.id === TODAY_ID ? completed || d.done : d.done,
  }));

  const milestones = rankMilestones(STREAK_MILESTONES, streak);
  const progress = milestoneProgress(STREAK_MILESTONES, streak);

  return (
    <div className="flex flex-col gap-4">
      <StreakHeader
        streak={streak}
        celebrating={celebrating}
        completed={completed}
      />

      <WeeklyStreak week={week} todayId={TODAY_ID} />

      <DailyGoalCard tasks={tasks} onComplete={complete} />

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
