import { Link } from "react-router";
import { Check, ChevronRight, Flame, ListChecks, BookOpen, PencilLine, Layers, Target, PartyPopper, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { T } from "@/data/translations";
import type { Tasks } from "@/types";
import { cn } from "@/utils/cn";
import { todayKey } from "@/utils/day";
import { monthsUntilExam } from "@/utils/exam-date";
import { dailyTargets } from "@/utils/roadmap";
import { missionCopy, missionTargetLabel } from "../mission-copy";
import { useStudyFeed } from "../use-study-feed";
import { taskHref } from "../task-links";
import { MissionGift } from "./mission-gift";
import { ProtectionNotice } from "./protection-notice";

/**
 * Today's missions, on Home, the Roadmap and the current month's page. A row is a
 * LINK to where that work is done, never a checkbox: it ticks only when its count
 * reaches today's target (from the target grade and months left), because each
 * task has a real completion behind it now —
 *
 *   lesson      finishing a section, each once a day (section-detail)
 *   practice    finishing a practice quiz          (quiz-screen)
 *   flashcards  finishing a flashcard review       (review-session)
 *   challenge   finishing a Game battle or an exam (game-create/-play, exam-view, paper-screen)
 *
 * Tap-to-tick used to be the only way "practice" could ever complete, because
 * no practice quiz existed; math 1.1's quiz ended that, so the self-report went.
 *
 * THE ROWS STAY GENERAL, with no lesson named on them: ANY finished lesson, quiz or
 * review ticks its row and pays the XP, so naming one would suggest only that one
 * counts. A tap still opens the suggested next item; what to study is named on the
 * Study card and in the Roadmap's month list. This one card is used on Home, the
 * Roadmap and the current month's page, so they cannot drift apart.
 */

const TASK_META: { key: keyof Tasks; icon: LucideIcon }[] = [
  { key: "lesson", icon: BookOpen },
  { key: "practice", icon: PencilLine },
  { key: "flashcards", icon: Layers },
  { key: "challenge", icon: Target },
];

const TASK_LABEL_KEY: Record<keyof Tasks, "completeLesson" | "practice" | "reviewCards" | "dailyChallengeTask"> = {
  lesson: "completeLesson",
  practice: "practice",
  flashcards: "reviewCards",
  challenge: "dailyChallengeTask",
};

export function DailyTasks() {
  const { lang, tasks, dayCounts, grade, streakKept } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      tasks: s.tasks,
      dayCounts: s.dayCounts,
      grade: s.userData.grade,
      streakKept: s.activityLog[todayKey()]?.goal === true,
    }))
  );
  const feed = useStudyFeed();
  const t = T[lang];
  const m = missionCopy(lang);
  const targets = dailyTargets(grade, monthsUntilExam());
  const allDone = Object.values(tasks).every(Boolean);

  // The same next item the Study card shows (task-links.ts), so the mission,
  // the card beside it and the Streak page never disagree on where to go.
  const hrefFor = (key: keyof Tasks) => taskHref(key, feed.items);

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 font-heading text-sm font-extrabold">
        <ListChecks className="size-4 text-purple" strokeWidth={2.5} />
        {t.todayChallenge}
      </div>
      <Card>
        {!allDone ? (
          <>
            <div className="mb-1 text-xs font-bold text-muted">
              {t.todaysPlan}
            </div>
            {TASK_META.map(({ key, icon: TaskIcon }) => {
              const done = tasks[key];
              const target = targets[key];
              const label =
                missionTargetLabel(key, target, lang) ?? t[TASK_LABEL_KEY[key]];
              // Done is a plain row: there is nothing left to go and do.
              if (done) {
                return (
                  <div
                    key={key}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 opacity-60"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-mint/15">
                      <Check className="size-4 text-mint" strokeWidth={2.5} />
                    </span>
                    <span className="flex-1 text-sm font-bold line-through">
                      {label}
                    </span>
                  </div>
                );
              }
              return (
                <Link
                  key={key}
                  to={hrefFor(key)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-purple/5 active:scale-[0.98]"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-purple/8">
                    <TaskIcon className="size-3.5 text-purple" strokeWidth={2.25} />
                  </span>
                  <span className="flex-1 text-sm font-bold">{label}</span>
                  {target > 1 && (
                    <span className="text-xs font-extrabold text-muted tabular-nums">
                      {dayCounts[key]}/{target}
                    </span>
                  )}
                  <span className="rounded-full bg-purple/15 px-2 py-1 text-[10px] font-extrabold text-purple-strong">
                    +20 XP
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted" />
                </Link>
              );
            })}
          </>
        ) : (
          <div className="py-5 text-center">
            <PartyPopper className="mx-auto mb-2 size-10 text-mint" strokeWidth={2} />
            <div className="font-heading text-sm font-extrabold text-mint-strong">
              {t.completedMsg}
            </div>
          </div>
        )}
        <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
          <p
            className={cn(
              "flex items-center gap-1.5 text-xs font-bold",
              streakKept ? "text-mint-strong" : "text-muted"
            )}
          >
            <Flame
              className="size-4 shrink-0"
              fill={streakKept ? "currentColor" : "none"}
              strokeWidth={2.5}
              aria-hidden
            />
            {streakKept ? m.streakKept : m.streakHint}
          </p>
          <ProtectionNotice />
          <MissionGift />
        </div>
      </Card>
    </div>
  );
}
