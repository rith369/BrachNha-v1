import { useEffect, useRef, useState } from "react";
import { useBrachNhaStore } from "@/lib/store";
import { milestoneProgress, rankMilestones } from "@/utils/streak";
import { sharedStreakToday, sharedToday } from "@/utils/streak-friends";
import { useStreakCopy } from "../copy";
import {
  FRIEND,
  SHARED_WEEK,
  TODAY_ID,
  TODAY_START,
  YOU,
} from "../friend-streak-demo-data";
import { SHARED_MILESTONES } from "../shared-milestones";
import { FriendStreakHeader } from "./friend-streak-header";
import { MilestoneCard } from "./milestone-card";
import { MilestoneProgress } from "./milestone-progress";
import { SharedGoalCard } from "./shared-goal-card";
import { SharedWeek } from "./shared-week";

/** Matches the solo page: the 1.1s confetti keyframe plus its longest stagger. */
const CELEBRATION_MS = 1400;

/**
 * The whole page's state: two booleans for today, one for the reminder, one for
 * the burst.
 *
 * EVERYTHING VISIBLE IS DERIVED FROM THE FIRST TWO — the count, the header
 * rings, the week's last cell, the goal rows, the milestone bar and the
 * milestone grid — so nothing on the page can disagree about whether today
 * counted. `sharedStreakToday()` is where the product rule actually lives: it
 * adds a day only when both are true, which is why finishing your own goal
 * leaves the number where it was.
 *
 * `finishDay` TAKES BOTH NEXT VALUES rather than each control flipping its own
 * flag, so the celebration fires on the transition into "both done" whichever
 * button got there second. The two can legitimately be pressed in either order,
 * and an `onComplete` that only knew about its own half would miss the case
 * where the friend was simulated first.
 *
 * NOTHING HERE TOUCHES THE STORE. The brief asked for a static prototype, and
 * `completeTask()` awards real XP and coins — wiring the button to it would pay
 * a student for pressing a demo. See ../friend-streak-demo-data.ts for what a
 * real version needs.
 */
export function FriendStreakView() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  // Days already banked, read off the store so this page opens on the same
  // number Home's stat pill, the StatBar and /streak show — see
  // ../friend-streak-demo-data.ts.
  const base = useBrachNhaStore((s) => s.streak);

  const [day, setDay] = useState(TODAY_START);
  const [reminded, setReminded] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // Clears a pending timer if the student navigates away mid-burst, so the
  // callback cannot fire against an unmounted component.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const finishDay = (you: boolean, friend: boolean) => {
    const wasKept = day.you && day.friend;
    setDay({ you, friend });
    if (!wasKept && you && friend) {
      setCelebrating(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCelebrating(false), CELEBRATION_MS);
    }
  };

  const today = sharedToday(day);
  const streak = sharedStreakToday(base, today);

  // Today's cell in the week comes from live state, not the authored row, so
  // the tracker and the goal card cannot drift apart.
  const week = SHARED_WEEK.map((d) => (d.id === TODAY_ID ? { ...d, day } : d));

  const milestones = rankMilestones(SHARED_MILESTONES, streak);
  const progress = milestoneProgress(SHARED_MILESTONES, streak);

  return (
    <div className="flex flex-col gap-4">
      <FriendStreakHeader
        streak={streak}
        today={today}
        you={YOU}
        friend={FRIEND}
        celebrating={celebrating}
      />

      <SharedGoalCard
        today={today}
        you={YOU}
        friend={FRIEND}
        reminded={reminded}
        onComplete={() => finishDay(true, day.friend)}
        onRemind={() => setReminded(true)}
        onSimulateFriend={() => finishDay(day.you, true)}
      />

      <SharedWeek week={week} todayId={TODAY_ID} you={YOU} friend={FRIEND} />

      {/* Absent, not empty, once every rung is behind the pair. */}
      {progress && <MilestoneProgress progress={progress} />}

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-sm font-extrabold md:text-base">
          {c.sharedMilestones}
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {milestones.map((m) => (
            <MilestoneCard key={m.days} milestone={m} />
          ))}
        </div>
      </section>
    </div>
  );
}
