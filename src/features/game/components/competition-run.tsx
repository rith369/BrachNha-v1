import { useCallback, useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";
import { FocusLayout } from "@/components/shell/focus-layout";
import { useBrachNhaStore } from "@/lib/store";
import { gameCopy, num } from "../copy";
import { cn } from "@/utils/cn";
import { GameQuestion } from "./game-question";
import type { ExamQuestion } from "@/types";

/** What a finished run reports. `ms` is the tie-break — see outcomeOf(). */
export interface RunResult {
  score: number;
  total: number;
  ms: number;
}

function clock(ms: number, lang: "en" | "km"): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${num(Math.floor(s / 60), lang)}:${num(
    String(s % 60).padStart(2, "0"),
    lang
  )}`;
}

/**
 * The quiz itself, shared by the creator's first run and every joiner's.
 *
 * ONE CLOCK FOR THE WHOLE RUN, set by whoever created the competition. That is
 * what makes two runs comparable — both students had the same total budget, so
 * the only difference is what they did with it. Running out does NOT discard the
 * attempt: it submits whatever was answered, because the alternative punishes a
 * slow reader with nothing at all while a fast one keeps a full score, and the
 * unanswered questions already cost them the points.
 *
 * THE ORDER OF THE THREE PARTS BELOW IS LOAD-BEARING: every hook first,
 * unconditionally; then the terminal guard; then the closures that read into
 * `questions[index]`.
 *
 * A hook cannot be skipped, so the usual `if (done) return <Summary/>` at the
 * very top — the shape quiz-runner.tsx and review-session.tsx use — is not
 * available to a component that owns a timer. Putting the guard above the
 * effects would change the hook count between renders; putting the closures
 * above the guard re-opens the React Compiler crash, where the compiler narrows
 * a closure's memo dependency to the exact property path it reads
 * (`question.correct`) and emits that check where the closure is BUILT, above
 * any guard later in source order. Splitting the difference — hooks, then guard,
 * then closures — satisfies both, and the per-question state lives in the keyed
 * child so nothing here needs a per-question effect at all.
 *
 * That crash only reproduces on the LAST question. Exercise the end of a run.
 */
export function CompetitionRun({
  questions,
  minutes,
  kicker,
  onFinish,
  onExit,
}: {
  questions: ExamQuestion[];
  minutes: number;
  /** Small label above the clock — the subject, or whose competition this is. */
  kicker: string;
  onFinish: (result: RunResult) => void;
  onExit: () => void;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = gameCopy(lang);

  // Fixed at MOUNT. Date.now() in a render body is the same purity violation
  // Math.random() would be: the compiler may memoise around it, and the deadline
  // would drift under an unrelated re-render.
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  // Fires onFinish exactly once. The two endings — answering the last question
  // and the clock expiring — can land on the same render, and without this the
  // run would be reported twice and scored twice.
  const reported = useRef(false);

  const total = questions.length;
  const deadline = startedAt + minutes * 60_000;
  const expired = now >= deadline;
  const done = index >= total;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (reported.current || (!done && !expired)) return;
    reported.current = true;
    // Capped at the deadline so a backgrounded tab, which stops firing the
    // interval, cannot report a run longer than the budget it was given.
    onFinish({ score, total, ms: Math.min(Date.now(), deadline) - startedAt });
  }, [done, expired, score, total, deadline, startedAt, onFinish]);

  // Stable across renders so the child's own effect does not re-fire on every
  // clock tick — which would restart its confirm delay ~4 times a second and the
  // run would never advance.
  const handleAnswer = useCallback((correct: boolean) => {
    if (correct) setScore((s) => s + 1);
    setIndex((i) => i + 1);
  }, []);

  // Terminal guard: below every hook, above every closure that reads into
  // questions[index]. The effect above has already reported; this render is the
  // one frame before the caller swaps this component out.
  if (done || expired) {
    return (
      <FocusLayout progressPct={100} onExit={onExit}>
        <div className="text-center text-sm font-bold text-muted">
          {t.saving}
        </div>
      </FocusLayout>
    );
  }

  const remaining = deadline - now;
  // Under a minute the bar is nearly drained anyway; the colour is what actually
  // communicates it at a glance.
  const low = remaining <= 30_000;

  return (
    <FocusLayout
      progressPct={(index / total) * 100}
      onExit={onExit}
      // Leaving discards the run, so it asks first — the mock exam's call. No
      // onBack: a scored answer is final.
      confirmExit
      meta={`${num(index + 1, lang)} / ${num(total, lang)}`}
    >
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate text-xs font-extrabold text-muted md:text-sm">
            {kicker}
          </span>
          <span
            className={cn(
              "shrink-0 text-xs font-extrabold tabular-nums md:text-sm",
              low ? "text-pink" : "text-muted"
            )}
          >
            {clock(remaining, lang)}
          </span>
        </div>

        {/* scaleX, never an animated width: a width change is layout + paint on
            every tick, and performance rule 2 is that only transform and opacity
            may animate. origin-left drains it from the right. */}
        <div className="mb-3 flex items-center gap-2 md:mb-4">
          <Timer
            className={cn("size-4 shrink-0", low ? "text-pink" : "text-muted")}
            strokeWidth={2.5}
            aria-hidden
          />
          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-purple/10">
            <div
              className={cn(
                "h-full w-full origin-left rounded-full",
                low ? "bg-pink" : "bg-brand"
              )}
              style={{
                transform: `scaleX(${Math.max(0, remaining) / (minutes * 60_000)})`,
                transition: "transform 250ms linear",
              }}
            />
          </div>
        </div>

        {/* Keyed on the POSITION — see the header of game-question.tsx. */}
        <GameQuestion
          key={index}
          question={questions[index]}
          onAnswer={handleAnswer}
        />
      </div>
    </FocusLayout>
  );
}
