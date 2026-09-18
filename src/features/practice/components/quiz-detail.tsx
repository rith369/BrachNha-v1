import { useState } from "react";
import { ChevronRight, History, ListChecks, Timer, Trophy } from "lucide-react";
import { FocusButton, FocusLayout } from "@/components/shell/focus-layout";
import { UnderlineTabs } from "@/components/ui/underline-tabs";
import { clockLabel } from "@/features/exam/paper-scoring";
import { scoreColor } from "@/features/exam/score-styles";
import type { QuizResult } from "@/lib/store";
import type { SectionQuestion } from "@/types";
import { cn } from "@/utils/cn";
import { formatKmDate } from "@/utils/khmer-dates";

/**
 * What a student sees when they tap a section on the quiz path: what is in it,
 * how they have done before, and the button that starts it.
 *
 * IT SHOWS EVERY TIME, not only after the section is finished. One route and
 * one screen, with the button reading ចាប់ផ្តើម before the first attempt and
 * ធ្វើម្តងទៀត after — rather than a square that does two different things
 * depending on state. Same shape PaperDetail already gives a past paper.
 *
 * EVERY NUMBER IS DERIVED. The question count comes from the array, the exercise
 * count from the questions' own `help`, and the best score from the history —
 * none of it authored beside the content, which is the rule lessonCountFor()
 * exists to enforce. The reference design's "difficulty" tile is simply absent:
 * nobody graded these, so there is nothing to put in it.
 */
export function QuizDetail({
  questions,
  title,
  history,
  onStart,
  onOpenResult,
  onExit,
}: {
  questions: SectionQuestion[];
  title: string;
  /** This section's attempts, newest first. */
  history: QuizResult[];
  onStart: () => void;
  onOpenResult: (result: QuizResult) => void;
  onExit: () => void;
}) {
  const [tab, setTab] = useState<"info" | "history">("info");

  const exercises = questions.reduce(
    (n, q) => n + (q.help?.questions.length ?? 0) + (q.help?.foundation?.length ?? 0),
    0
  );
  const best = history.reduce((b, r) => Math.max(b, r.pct), 0);
  const done = history.length > 0;

  return (
    <FocusLayout
      progressPct={0}
      onExit={onExit}
      meta={done ? `${history.length}` : undefined}
      footer={
        <FocusButton onClick={onStart}>
          {done ? "ធ្វើម្តងទៀត →" : "ចាប់ផ្តើម →"}
        </FocusButton>
      }
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="font-heading mb-1 text-xl font-extrabold md:text-2xl">
          {title}
        </div>
        <div className="mb-4 text-xs font-bold text-muted md:text-sm">
          Quiz · ការអនុវត្ត
        </div>

        {/* The history tab only exists once there IS one — an empty tab is a
            promise of something to look at. Same rule the starred list and the
            retention line follow: absent rather than empty. */}
        {done && (
          <UnderlineTabs
            tabs={[
              { id: "info" as const, label: "ព័ត៌មាន" },
              { id: "history" as const, label: "ប្រវត្តិ" },
            ]}
            value={tab}
            onChange={setTab}
          />
        )}

        {tab === "info" || !done ? (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <Stat
                icon={ListChecks}
                value={`${questions.length}`}
                label="សំណួរ"
              />
              <Stat
                icon={Trophy}
                value={done ? `${best}%` : "—"}
                label="ពិន្ទុល្អបំផុត"
                tone={done ? scoreColor(best) : undefined}
              />
            </div>

            <div className="rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
              <div className="font-heading mb-2 text-sm font-extrabold md:text-base">
                មុននឹងចាប់ផ្តើម
              </div>
              {/* Each line is a fact about THIS runner, not a generic promise —
                  the rule PaperDetail's own list is written to. */}
              <ul className="list-outside list-disc space-y-1.5 pl-4 text-xs font-semibold text-text md:text-sm">
                <li>ឆ្លើយរួច មិនអាចប្ដូរចម្លើយបានទេ។</li>
                <li>ក្រោយឆ្លើយ អ្នកឃើញដំណោះស្រាយ ចំណាំ និងកំហុសញឹកញាប់ភ្លាមៗ។</li>
                {exercises > 0 && (
                  <li>មានលំហាត់បន្ថែម {exercises} សម្រាប់ហាត់តាមសំណួរនីមួយៗ។</li>
                )}
                <li>មាននាឡិកាកត់ត្រាពេលវេលា តែគ្មានកំណត់ពេលទេ។</li>
                <li>អ្នកអាចធ្វើម្តងទៀតបានគ្រប់ពេល។</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2.5">
            {history.map((r) => (
              <button
                key={r.date}
                type="button"
                onClick={() => onOpenResult(r)}
                className="flex w-full items-center gap-3 rounded-2xl border border-purple/10 bg-surface p-3.5 text-left shadow-panel-sm transition hover:brightness-[1.03] active:scale-[0.985]"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple/8">
                  <History className="size-5 text-purple" strokeWidth={2.5} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "font-heading block text-sm font-extrabold md:text-base",
                      scoreColor(r.pct)
                    )}
                  >
                    {r.score}/{r.total} · {r.pct}%
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 text-xs font-bold text-muted">
                    <Timer className="size-3.5 shrink-0" strokeWidth={2.5} />
                    {clockLabel(r.ms)}
                    <span>{formatKmDate(new Date(r.date))}</span>
                  </span>
                </span>
                <ChevronRight
                  className="size-5 shrink-0 text-muted"
                  strokeWidth={2.5}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </FocusLayout>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof ListChecks;
  value: string;
  label: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-purple/10 bg-surface p-3.5 shadow-panel-sm">
      <Icon className="mb-1 size-4 text-muted" strokeWidth={2.5} />
      <div
        className={cn(
          "font-heading text-lg font-extrabold md:text-xl",
          tone ?? "text-text"
        )}
      >
        {value}
      </div>
      <div className="text-[11px] font-bold text-muted md:text-xs">{label}</div>
    </div>
  );
}
