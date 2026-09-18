import { useCallback, useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";
import { FocusLayout } from "@/components/shell/focus-layout";
import { useBrachNhaStore } from "@/lib/store";
import { clockLabel, gameCopy } from "../copy";
import { cn } from "@/utils/cn";
import { GameQuestion } from "./game-question";
import type { ExamQuestion } from "@/types";

/** What a finished run reports. `ms` is the tie-break — see outcomeOf(). */
export interface RunResult {
  score: number;
  total: number;
  ms: number;
  /**
   * Which option was picked for each question, positionally matched to
   * `questions` and ALWAYS of length `total`.
   *
   * The padding matters: a run that the clock ends leaves the tail unanswered,
   * and reporting a short array would make the review screen's positional
   * pairing silently wrong for the joiner's half against the creator's. Null is
   * the explicit "never answered this one".
   */
  answers: (string | null)[];
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
  // Appended one per answered question, so its length is always `index` and it
  // is naturally short when the clock ends the run — padded to `total` at the
  // moment it is reported.
  const [picks, setPicks] = useState<string[]>([]);
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
    onFinish({
      score,
      total,
      // Capped at the deadline so a backgrounded tab, which stops firing the
      // interval, cannot report a run longer than the budget it was given.
      ms: Math.min(Date.now(), deadline) - startedAt,
      // Padded to the full length here rather than at every reader: a run the
      // clock ended has fewer picks than questions, and the review screen pairs
      // the two sides BY POSITION.
      answers: Array.from({ length: total }, (_, i) => picks[i] ?? null),
    });
  }, [done, expired, score, total, deadline, startedAt, picks, onFinish]);

  // Stable across renders so the child's own effect does not re-fire on every
  // clock tick — which would restart its confirm delay ~4 times a second and the
  // run would never advance. Every update is a functional one, so it needs no
  // dependency on the values it changes.
  const handleAnswer = useCallback((correct: boolean, picked: string) => {
    if (correct) setScore((s) => s + 1);
    setPicks((p) => [...p, picked]);
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
      meta={`${index + 1} / ${total}`}
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
            <span className="font-bold">{t.timeLeft} </span>
            {clockLabel(remaining)}
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
          // The parent already ticks for the countdown, so the per-question
          // stopwatch reads that same value rather than starting a second
          // interval beside it.
          now={now}
        />
      </div>
    </FocusLayout>
  );
}
