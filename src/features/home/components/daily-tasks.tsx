import { Link } from "react-router";
import { Check, ChevronRight, ListChecks, BookOpen, PencilLine, Layers, Target, PartyPopper, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { T } from "@/data/translations";
import type { Tasks } from "@/types";
import { useStudyFeed } from "../use-study-feed";
import type { StudyKind } from "../study-feed";

/**
 * Today's missions. A row is a LINK to where that work is done, never a
 * checkbox: it ticks only when the work is actually finished, because each
 * task has a real completion behind it now —
 *
 *   lesson      finishing a section or lesson     (section-detail, lesson-detail)
 *   practice    finishing a practice quiz          (quiz-screen)
 *   flashcards  finishing a flashcard review       (review-session)
 *   challenge   finishing a Game battle or an exam (game-create/-play, exam-view, paper-screen)
 *
 * Tap-to-tick used to be the only way "practice" could ever complete, because
 * no practice quiz existed; math 1.1's quiz ended that, so the self-report went.
 * Roadmap's Daily Mission reads the same `tasks` and lost its Done button for
 * the same reason.
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

/** Which study-feed item a task's link should open, when one exists. */
const TASK_KIND: Partial<Record<keyof Tasks, StudyKind>> = {
  lesson: "section",
  practice: "quiz",
  flashcards: "flashcards",
};

/** Where a task goes when the feed has nothing of that kind left. */
const TASK_FALLBACK: Record<keyof Tasks, string> = {
  lesson: "/lessons",
  practice: "/practice",
  flashcards: "/practice",
  challenge: "/exam",
};

export function DailyTasks() {
  const { lang, tasks } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      tasks: s.tasks,
    }))
  );
  const feed = useStudyFeed();
  const t = T[lang];
  const allDone = Object.values(tasks).every(Boolean);

  // The same next item the Study card shows, so the mission and the card
  // beside it never send a student to two different places.
  function hrefFor(key: keyof Tasks): string {
    const kind = TASK_KIND[key];
    const item = kind ? feed.items.find((i) => i.kind === kind) : undefined;
    return item?.href ?? TASK_FALLBACK[key];
  }

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
              const label = t[TASK_LABEL_KEY[key]];
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
                  <span className="rounded-full bg-purple/15 px-2 py-1 text-[10px] font-extrabold text-purple">
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
            <div className="font-heading text-sm font-extrabold text-mint">
              {t.completedMsg}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
