import { Link, useNavigate } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { Check, ChevronRight, Flame, Trophy } from "lucide-react";
import { FocusButton, FocusLayout } from "@/components/shell/focus-layout";
import { MathText } from "@/components/shell/math-text";
import { useBrachNhaStore } from "@/lib/store";
import { useContentManifest } from "@/lib/content";
import { useStudyFeed } from "@/features/home/use-study-feed";
import { taskHref } from "@/features/home/task-links";
import { clockLabel } from "@/features/exam/paper-scoring";
import { todayKey } from "@/utils/day";
import { DAILY_GOAL_TASKS, goalTasksDone } from "@/utils/streak";
import type { Tasks } from "@/types";
import { cn } from "@/utils/cn";
import { chaptersFor, lessonHeading } from "../sessions";
import { findSubject } from "../subjects";

/** What the finished section reports to this screen. Every figure is
 *  measured, never authored: the old screen printed a fixed "+20 XP" that was
 *  wrong whenever a quiz answer paid or the day's lesson task had already. */
export interface SectionSummary {
  /** Questions answered correctly, and how many the section had (may be 0). */
  correct: number;
  questions: number;
  /** XP and coins the store actually gained while the section was open. */
  xp: number;
  coins: number;
  /** From opening the section to finishing it. */
  ms: number;
}

const GOAL_LABEL: Record<(typeof DAILY_GOAL_TASKS)[number], string> = {
  lesson: "មេរៀន",
  practice: "Quiz",
  flashcards: "Flashcard",
};

/**
 * The screen after a lesson section (27 Oct 2026, the user's approved layout):
 * a yellow hero, three real numbers, this lesson's progress, today's goal, and
 * the next section as the main button.
 *
 * ITS OWN FocusLayout, rendered in place of the section's, because its footer
 * is different and it reads things the section runner has no business with
 * (the path, the daily goal, the study feed for the goal's links).
 *
 * Lesson progress counts the way the path's own banner does (finished playable
 * sections over every node of the lesson), so the two never disagree.
 */
export function SectionComplete({
  sectionId,
  title,
  summary,
}: {
  sectionId: string;
  title: string;
  summary: SectionSummary;
}) {
  const navigate = useNavigate();
  const manifest = useContentManifest();
  const feed = useStudyFeed();
  const { completedSessions, tasks, tasksDate, streak } = useBrachNhaStore(
    useShallow((s) => ({
      completedSessions: s.completedSessions,
      tasks: s.tasks,
      tasksDate: s.tasksDate,
      streak: s.streak,
    }))
  );

  const subject = findSubject(sectionId.split("-")[0]);
  const pathHref = subject ? `/subjects/${subject.id}` : "/lessons";
  const chapters = subject ? chaptersFor(subject.id, manifest) : [];

  // Where this section sits, and the next playable one after it in path order.
  const sessions = chapters.flatMap((c) =>
    c.lessons.flatMap((lesson) => lesson.sessions.map((s) => ({ s, lesson })))
  );
  const at = sessions.findIndex((x) => x.s.id === sectionId);
  const here = at >= 0 ? sessions[at] : null;
  const next = at >= 0 ? sessions.slice(at + 1).find((x) => x.s.href) : undefined;

  const lessonDone = here
    ? here.lesson.sessions.filter((x) => x.href && completedSessions.includes(x.id)).length
    : 0;
  const lessonTotal = here ? here.lesson.sessions.length : 0;

  // Today's ticks only: a checklist stamped on another day is yesterday's.
  const today: Tasks | null = tasksDate === todayKey() ? tasks : null;
  const goalDone = today ? goalTasksDone(today) : 0;
  const goalLeft = DAILY_GOAL_TASKS.length - goalDone;

  const footer = next?.s.href ? (
    <div className="flex gap-2.5">
      <FocusButton variant="secondary" onClick={() => navigate(pathHref)}>
        ← ផ្លូវមេរៀន
      </FocusButton>
      <FocusButton onClick={() => navigate(next.s.href!)}>ផ្នែកបន្ទាប់ →</FocusButton>
    </div>
  ) : (
    <FocusButton onClick={() => navigate(pathHref)}>← ផ្លូវមេរៀន</FocusButton>
  );

  const tiles = [
    ...(summary.questions > 0
      ? [{ value: `${summary.correct}/${summary.questions}`, label: "ត្រឹមត្រូវ" }]
      : []),
    { value: `+${summary.xp} XP`, label: `+${summary.coins} កាក់` },
    { value: clockLabel(summary.ms), label: "ប្រើពេល" },
  ];

  return (
    <FocusLayout
      progressPct={100}
      onExit={() => navigate(pathHref)}
      showStats
      meta="2 / 2"
      footer={footer}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 md:gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-neo-yellow p-4 text-ink shadow-panel md:p-5">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-neo-orange shadow-hard-sm md:size-16">
            <Trophy className="size-8 text-ink md:size-9" strokeWidth={2.25} aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="font-heading text-xl font-extrabold md:text-2xl">
              បញ្ចប់ផ្នែកនេះ!
            </div>
            <div className="mt-0.5 text-sm font-bold [overflow-wrap:anywhere] md:text-base">
              {here && <span className="tabular-nums">{here.s.label} · </span>}
              <MathText text={title} />
            </div>
          </div>
        </div>

        <div className={cn("grid gap-2.5", tiles.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
          {tiles.map((t) => (
            <div
              key={t.label}
              className="rounded-2xl border border-border bg-surface px-2 py-3 text-center shadow-panel-sm"
            >
              <div className="font-heading text-lg font-extrabold whitespace-nowrap tabular-nums md:text-2xl">
                {t.value}
              </div>
              <div className="mt-0.5 text-xs font-bold text-muted md:text-sm">{t.label}</div>
            </div>
          ))}
        </div>

        {here && lessonTotal > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-panel-sm">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <div className="min-w-0 text-sm font-extrabold md:text-base">
                {lessonHeading(here.lesson.number, here.lesson.title)}
              </div>
              <div className="shrink-0 text-xs font-extrabold text-muted tabular-nums md:text-sm">
                {lessonDone}/{lessonTotal} ផ្នែក
              </div>
            </div>
            <div className="h-3 overflow-hidden rounded-full border border-border bg-chart-track">
              <div
                className="h-full bg-mint"
                style={{ width: `${Math.round((lessonDone / lessonTotal) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-panel-sm">
          <div className="mb-2.5 text-sm font-extrabold md:text-base">
            គោលដៅថ្ងៃនេះ{" "}
            <span className="text-muted tabular-nums">
              {goalDone}/{DAILY_GOAL_TASKS.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DAILY_GOAL_TASKS.map((key) =>
              today?.[key] ? (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-mint/30 px-3 py-1.5 text-xs font-extrabold md:text-sm"
                >
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                  {GOAL_LABEL[key]}
                </span>
              ) : (
                <Link
                  key={key}
                  to={taskHref(key, feed.items)}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-extrabold shadow-hard-sm transition active:translate-y-0.5 active:shadow-none md:text-sm"
                >
                  {GOAL_LABEL[key]}
                  <ChevronRight className="size-3.5" strokeWidth={3} aria-hidden />
                </Link>
              )
            )}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-muted md:text-sm">
            <Flame className="size-4 shrink-0 text-pink" strokeWidth={2.5} aria-hidden />
            {goalLeft > 0
              ? `ធ្វើ ${goalLeft} ទៀតដើម្បីរក្សា Streak`
              : `បានរក្សា Streak ហើយ! Streak ${streak} ថ្ងៃ`}
          </div>
        </div>
      </div>
    </FocusLayout>
  );
}
