import { Check, ListChecks, BookOpen, PencilLine, Layers, Target, PartyPopper, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { T } from "@/data/translations";
import type { Tasks } from "@/types";

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
  const { lang, tasks, completeTask } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      tasks: s.tasks,
      completeTask: s.completeTask,
    }))
  );
  const t = T[lang];
  const allDone = Object.values(tasks).every(Boolean);

  function complete(key: keyof Tasks) {
    completeTask(key);
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
              return (
                <button
                  key={key}
                  onClick={() => complete(key)}
                  disabled={done}
                  className={`flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition active:scale-[0.98] ${
                    done ? "opacity-60" : "hover:bg-purple/5"
                  }`}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-purple/8">
                    {done ? (
                      <Check className="size-4 text-mint" strokeWidth={2.5} />
                    ) : (
                      <TaskIcon className="size-3.5 text-purple" strokeWidth={2.25} />
                    )}
                  </span>
                  <span className="flex-1 text-sm font-bold">
                    {t[TASK_LABEL_KEY[key]]}
                  </span>
                  {!done && (
                    <span className="rounded-full bg-purple/15 px-2 py-1 text-[10px] font-extrabold text-purple">
                      +20 XP
                    </span>
                  )}
                </button>
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
