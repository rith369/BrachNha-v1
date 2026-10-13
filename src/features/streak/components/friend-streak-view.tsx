import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { Trash2 } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { celebratedOn, markCelebrated } from "@/lib/streak-celebrated";
import { removeFriendship, type FriendFail, type FriendRow } from "@/lib/friends";
import { milestoneProgress, rankMilestones } from "@/utils/streak";
import {
  myGoalOn,
  pairStreak,
  sharedDayStatus,
  sharedToday,
} from "@/utils/streak-friends";
import { avatarSeedFor } from "@/utils/avatar-seed";
import { addDaysKey, parseDayKey, todayKey } from "@/utils/day";
import { cn } from "@/utils/cn";
import { useStudyFeed } from "@/features/home/use-study-feed";
import { taskHref } from "@/features/home/task-links";
import {
  bestStreakLabel,
  dailyTaskLabel,
  friendFailLabel,
  friendsSinceLabel,
  useStreakCopy,
} from "../copy";
import { SHARED_MILESTONES } from "../shared-milestones";
import {
  WEEKDAY_BY_INDEX,
  type DailyTaskId,
  type Participant,
  type SharedWeekDay,
} from "../types";
import { FriendStreakHeader } from "./friend-streak-header";
import { MilestoneCard } from "./milestone-card";
import { MilestoneProgress } from "./milestone-progress";
import { SharedGoalCard } from "./shared-goal-card";
import { SharedWeek } from "./shared-week";

/** Matches the solo page: the 1.1s confetti keyframe plus its longest stagger. */
const CELEBRATION_MS = 1400;

const GOAL: DailyTaskId[] = ["lesson", "practice", "flashcards"];

/**
 * One friend's shared streak: whose it is, whether today counted, the week
 * behind it and the milestones ahead.
 *
 * REAL since 13 Oct 2026 (it was a prototype with an invented "Dara" and a
 * Simulate button). Two sources, and which is which matters:
 *
 *  - YOUR days are this device's `activityLog`, which `completeTask()` writes
 *    the moment the last goal task lands, so finishing a lesson shows here at
 *    once rather than after a sync;
 *  - YOUR FRIEND'S days are `friend.goalDays` from my_friends, which reach the
 *    server a few seconds after their phone records them (and only once it is
 *    online). useFriends() asks again whenever the app comes back to the front.
 *
 * The count is `pairStreak()`: the days both finished, from the day you became
 * friends, counted with the solo streak's own rule.
 *
 * The parent keys this on the friend's id, so the once-a-day celebration check
 * (a lazy initial state, the solo page's pattern) runs per friend.
 */
export function FriendStreakView({
  friend,
  onRemoved,
}: {
  /** An ACCEPTED friendship (`since` set). */
  friend: FriendRow & { since: string };
  onRemoved: () => void;
}) {
  const { lang, userName, myId, activityLog, tasks, tasksDate } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      userName: s.userName,
      myId: s.authUser?.id ?? "",
      activityLog: s.activityLog,
      tasks: s.tasks,
      tasksDate: s.tasksDate,
    }))
  );
  const c = useStreakCopy(lang);
  const feed = useStudyFeed();
  const today = todayKey();

  const you: Participant = {
    name: userName || c.noName,
    // The same face your friend sees for you: derived from your account id.
    avatarSeed: avatarSeedFor(myId),
  };
  const them: Participant = {
    name: friend.name || c.noName,
    avatarSeed: avatarSeedFor(friend.otherId),
  };

  const friendDays = new Set(friend.goalDays);
  const day = { you: myGoalOn(activityLog, today), friend: friendDays.has(today) };
  const todayState = sharedToday(day);
  const streak = pairStreak(activityLog, friend.goalDays, friend.since, today);

  const [celebrating, setCelebrating] = useState(
    () => todayState.kept && !celebratedOn(today, friend.id)
  );
  useEffect(() => {
    if (!celebrating) return;
    markCelebrated(today, friend.id);
    const timer = window.setTimeout(() => setCelebrating(false), CELEBRATION_MS);
    return () => window.clearTimeout(timer);
  }, [celebrating, today, friend.id]);

  const base = parseDayKey(today);
  const week: SharedWeekDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const key = addDaysKey(base, -i);
    const cell = { you: myGoalOn(activityLog, key), friend: friendDays.has(key) };
    week.push({
      id: WEEKDAY_BY_INDEX[parseDayKey(key).getDay()],
      key,
      day: cell,
      status: sharedDayStatus(cell, {
        isToday: key === today,
        beforeStart: key < friend.since,
      }),
    });
  }

  // Your next open goal task, while your half of today is still open.
  const todayTasks = tasksDate === today ? tasks : null;
  const nextId = day.you ? undefined : GOAL.find((id) => !todayTasks?.[id]);
  const next = nextId
    ? { label: dailyTaskLabel(nextId, lang), href: taskHref(nextId, feed.items) }
    : null;

  const milestones = rankMilestones(SHARED_MILESTONES, streak.current);
  const progress = milestoneProgress(SHARED_MILESTONES, streak.current);

  return (
    <div className="flex flex-col gap-4">
      <FriendStreakHeader
        streak={streak.current}
        today={todayState}
        you={you}
        friend={them}
        celebrating={celebrating}
      />

      <div className="-mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-bold text-muted">
        <span>{bestStreakLabel(streak.best, lang)}</span>
        <span aria-hidden>·</span>
        <span>{friendsSinceLabel(friend.since, lang)}</span>
      </div>

      <SharedGoalCard today={todayState} you={you} friend={them} next={next} />

      <SharedWeek week={week} todayKey={today} you={you} friend={them} />

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

      <RemoveFriend friendshipId={friend.id} onRemoved={onRemoved} />
    </div>
  );
}

/** Two taps: the first arms it and says what is lost, the second removes. */
function RemoveFriend({
  friendshipId,
  onRemoved,
}: {
  friendshipId: string;
  onRemoved: () => void;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);
  const navigate = useNavigate();
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<FriendFail | null>(null);

  async function remove() {
    if (!armed) {
      setArmed(true);
      return;
    }
    setBusy(true);
    setError(null);
    const r = await removeFriendship(friendshipId);
    setBusy(false);
    if (!r.ok) {
      setError(r.reason);
      return;
    }
    onRemoved();
    navigate("/streak/friends", { replace: true });
  }

  return (
    <div className="flex flex-col items-center gap-1.5 pt-2">
      <button
        type="button"
        onClick={() => void remove()}
        disabled={busy}
        className={cn(
          "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition",
          armed
            ? "border border-border bg-pink/30 text-text"
            : "text-muted hover:text-text"
        )}
      >
        <Trash2 className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
        {c.removeFriend}
      </button>
      {armed && !error && (
        <p className="text-center text-[11px] font-bold text-muted">{c.removeConfirm}</p>
      )}
      {error && (
        <p role="alert" className="text-center text-[11px] font-bold text-muted">
          {friendFailLabel(error, lang)}
        </p>
      )}
    </div>
  );
}
