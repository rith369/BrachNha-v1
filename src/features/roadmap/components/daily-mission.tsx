import { Link } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { useT } from "@/data/translations";
import { taskHref } from "@/features/home/task-links";
import { useStudyFeed } from "@/features/home/use-study-feed";
import type { StudyKind } from "@/features/home/study-feed";
import { useBrachNhaStore } from "@/lib/store";
import type { Tasks } from "@/types";
import { roadmapCopy } from "../copy";

const ROWS: {
  key: keyof Tasks;
  kind: StudyKind;
  icon: string;
  label: "lessonLabel" | "practiceLabel" | "flashcardsLabel";
}[] = [
  { key: "lesson", kind: "section", icon: "📚", label: "lessonLabel" },
  { key: "practice", kind: "quiz", icon: "✏️", label: "practiceLabel" },
  { key: "flashcards", kind: "flashcards", icon: "🗂️", label: "flashcardsLabel" },
];

/**
 * Today's goal: one lesson, one quiz, one flashcard review. Each row names the
 * next item and goes straight to it, through the same taskHref() Home and the
 * Streak page use, so all three agree on what is next.
 *
 * IT USED TO SAY "20 PRACTICE TODAY", from a time-budget estimate, while finishing
 * one quiz ticked the row. It now says what actually ticks it. (The signed pledge
 * still quotes that estimate as a goal: computeDailyMission in utils/roadmap.ts.)
 *
 * No Done button: a row ticks only when the work is finished, never on a tap.
 */
export function DailyMission({ title }: { title: string }) {
  const { lang, tasks } = useBrachNhaStore(
    useShallow((s) => ({ lang: s.lang, tasks: s.tasks }))
  );
  const t = useT(lang);
  const c = roadmapCopy(lang);
  const feed = useStudyFeed();
  const allDone = ROWS.every((row) => tasks[row.key]);

  return (
    <div className="mb-4 rounded-2xl border border-border bg-surface p-4 shadow-panel">
      <div className="mb-3 flex items-center gap-1.5 font-heading text-sm font-extrabold">
        🎯 {title}
      </div>
      {allDone ? (
        <div className="py-2 text-center text-sm font-extrabold text-mint">
          {t.missionDone}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {ROWS.map((row) => {
            const done = tasks[row.key];
            const next = feed.items.find((i) => i.kind === row.kind);
            return (
              <div
                key={row.key}
                className="flex items-center gap-3 rounded-xl bg-purple/5 px-3 py-2.5"
              >
                <span className="text-xl">{row.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold">{c[row.label]}</div>
                  <div className="truncate text-xs font-bold text-muted">
                    {done ? c.done : (next?.title ?? c.finishOne)}
                  </div>
                </div>
                {!done && (
                  <Link
                    to={taskHref(row.key, feed.items)}
                    className="shrink-0 rounded-full bg-purple/10 px-2.5 py-1 text-[11px] font-extrabold text-purple"
                  >
                    {c.go}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
