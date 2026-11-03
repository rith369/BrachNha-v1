import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Check, ChevronLeft, FlaskConical, Hourglass, Lock, Play, ShieldAlert } from "lucide-react";
import { MAX_EXAM_LEAVES } from "@/hooks/use-leave-guard";
import { retryBody, useContentBody } from "@/lib/content";
import {
  clearSimulationDraft,
  readSimulationDraft,
  writeSimulationDraft,
} from "@/lib/simulation-draft";
import {
  useBrachNhaStore,
  type SimulationAttempt,
  type SimulationSitting,
} from "@/lib/store";
import { ContentNotice } from "@/features/practice/components/content-waiting";
import { cn } from "@/utils/cn";
import { SIMULATION_WINDOW_HOURS, simulationWindowEnd } from "@/utils/simulation-window";
import { clockLabel, scorePaper, type PaperAnswers } from "../paper-scoring";
import { paperTitle, parsePaperKey, toPastPaperContent } from "../papers";
import { recordPaperAttempt } from "../record-paper-attempt";
import { SIMULATION_SESSION_BY_ID, type SimulationSession } from "../simulation";
import { PastPaperRunner, type PaperAttempt } from "./past-paper-runner";

/** How a paper is being entered: from the start, or back into a running clock. */
interface Entry {
  startedAt: number;
  answers: PaperAnswers;
  leaves: number;
  index: number;
}

const EXIT_COPY = {
  title: "ចាកចេញពីអេក្រង់ប្រឡង?",
  body: "នាឡិកានៅតែដំណើរការ។ ចម្លើយរបស់អ្នកត្រូវបានរក្សាទុក ហើយការត្រឡប់ចូលវិញរាប់ជាការចាកចេញមួយដង។",
};

/** The paper's own name, or the session's while a stale key cannot be read. */
function sittingTitle(sitting: SimulationSitting): string {
  const parsed = parsePaperKey(sitting.paperKey);
  return parsed ? paperTitle(parsed.subject) : sitting.paperKey;
}

/**
 * The Simulation between papers and during one: the two days, the paper up next,
 * and the runner once it starts.
 *
 * THE CLOCK STARTS ON THE TAP AND NEVER STOPS. The start time is saved, and the
 * deadline is worked out from it, so closing the app or reloading gains nothing.
 * Start stays off until the paper has downloaded, so a slow connection cannot eat
 * into the time.
 *
 * COMING BACK COUNTS AS LEAVING. Otherwise a student could close the app, look an
 * answer up, and return with no penalty, where switching apps would have counted.
 * The same accepted cost as hooks/use-leave-guard.ts: a crash counts too. The
 * answers are kept (lib/simulation-draft.ts), so it never costs them their work.
 *
 * ANY HOURS, BUT ALL WITHIN 2 DAYS (the user's rule). The days are labels and an
 * order, not dates: a student may sit all seven in one day. The limit runs from
 * the first paper's start (utils/simulation-window.ts). A paper running when it
 * ends keeps its own timer, then the attempt ends and what was not sat scores 0.
 *
 * NO SCORES UNTIL THE END, as in the real exam. The result screen has them.
 *
 * Khmer only, per EXAM_PAGE_LANG.
 */
export function SimulationSit({
  attempt,
  current,
}: {
  attempt: SimulationAttempt;
  /** The page guarantees one, and shows the result when there is none left. */
  current: SimulationSitting;
}) {
  const [entry, setEntry] = useState<Entry | null>(null);
  const session = SIMULATION_SESSION_BY_ID[current.sessionId];
  const body = useContentBody("paper", current.paperKey, current.version);
  // The timetable's minutes, so the clock is the one the briefing promised.
  const content =
    body.status === "ready"
      ? { ...toPastPaperContent(body.body), minutes: session.minutes }
      : null;

  function submit(paperAttempt: PaperAttempt) {
    const store = useBrachNhaStore.getState();
    const live = store.simulations
      .find((a) => a.id === attempt.id)
      ?.sittings.find((s) => s.sessionId === current.sessionId);
    // Once only: the clock and the submit button can both land here.
    if (!live || live.result) return;
    const parsed = parsePaperKey(current.paperKey);
    if (parsed && content) {
      recordPaperAttempt(
        { key: current.paperKey, subjectId: parsed.subject.id, version: current.version },
        paperAttempt,
        content
      );
    }
    store.finishSimulationSitting(attempt.id, current.sessionId, {
      score: paperAttempt.score,
      total: paperAttempt.total,
      pct: paperAttempt.pct,
      ms: paperAttempt.ms,
      answers: paperAttempt.answers,
      leaves: paperAttempt.leaves,
    });
    clearSimulationDraft();
    setEntry(null);
  }

  function start() {
    const store = useBrachNhaStore.getState();
    store.startSimulationSitting(attempt.id, current.sessionId);
    const startedAt = useBrachNhaStore
      .getState()
      .simulations.find((a) => a.id === attempt.id)
      ?.sittings.find((s) => s.sessionId === current.sessionId)?.startedAt;
    if (startedAt) setEntry({ startedAt: Date.parse(startedAt), answers: {}, leaves: 0, index: 0 });
  }

  function resume(startedAt: string) {
    const draft = readSimulationDraft(attempt.id, current.sessionId);
    setEntry({
      startedAt: Date.parse(startedAt),
      answers: draft?.answers ?? {},
      leaves: (draft?.leaves ?? 0) + 1,
      index: draft?.index ?? 0,
    });
  }

  /** The clock ran out while the student was away: what they had answered counts. */
  function submitDraft() {
    if (!content) return;
    const draft = readSimulationDraft(attempt.id, current.sessionId);
    const answers = draft?.answers ?? {};
    const marked = scorePaper(content, answers);
    submit({
      score: marked.score,
      total: marked.total,
      pct: marked.pct,
      answers,
      ms: session.minutes * 60_000,
      leaves: draft?.leaves ?? 0,
    });
  }

  if (entry && content) {
    return (
      <div className="min-h-0 flex-1">
        <PastPaperRunner
          key={current.sessionId}
          content={content}
          kicker={sittingTitle(current)}
          startedAt={entry.startedAt}
          initialAnswers={entry.answers}
          initialLeaves={entry.leaves}
          initialIndex={entry.index}
          exitCopy={EXIT_COPY}
          onProgress={(progress) =>
            writeSimulationDraft({
              attemptId: attempt.id,
              sessionId: current.sessionId,
              ...progress,
            })
          }
          onExit={() => setEntry(null)}
          onSubmit={submit}
        />
      </div>
    );
  }

  const firstOfDay2 =
    session.day === 2 &&
    attempt.sittings.some((s) => SIMULATION_SESSION_BY_ID[s.sessionId].day === 1) &&
    attempt.sittings.every(
      (s) => SIMULATION_SESSION_BY_ID[s.sessionId].day === 2 || s.result
    ) &&
    !attempt.sittings.some(
      (s) => SIMULATION_SESSION_BY_ID[s.sessionId].day === 2 && (s.result || s.startedAt)
    );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          to="/exam/simulation"
          className="inline-flex items-center gap-1 text-xs font-extrabold text-muted transition hover:text-text sm:text-sm"
        >
          <ChevronLeft className="size-4 shrink-0" strokeWidth={2.5} />
          ប្រឡងបាក់ឌុបសាកល្បង
        </Link>

        <h1 className="font-heading mt-3 text-2xl font-extrabold text-text">
          ថ្ងៃទី {session.day}
        </h1>
        {firstOfDay2 && (
          <p className="mt-1 text-sm font-bold text-muted">
            ថ្ងៃទី 1 ចប់ហើយ។ ចាប់ផ្តើមថ្ងៃទី 2 ពេលណាក៏បាន ក្នុងពេលដែលនៅសល់។
          </p>
        )}

        {attempt.test && (
          <div className="mt-3 flex items-start gap-2 rounded-2xl border border-border bg-neo-yellow p-3 text-xs font-bold text-ink">
            <FlaskConical className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} />
            <span>ការសាកល្បងសម្រាប់ក្រុមការងារ។ មិនទាន់មានវិញ្ញាសាគ្រប់មុខវិជ្ជាទេ។</span>
          </div>
        )}

        <WindowCard attempt={attempt} />

        <div className="mt-4">
          {current.startedAt ? (
            <RunningCard
              key={current.sessionId}
              title={sittingTitle(current)}
              deadline={Date.parse(current.startedAt) + session.minutes * 60_000}
              ready={content !== null}
              attemptId={attempt.id}
              sessionId={current.sessionId}
              onContinue={() => current.startedAt && resume(current.startedAt)}
              onExpired={submitDraft}
            />
          ) : (
            <StartCard
              key={current.sessionId}
              title={sittingTitle(current)}
              session={session}
              ready={content !== null}
              firstOfAll={simulationWindowEnd(attempt) === null}
              paperCount={attempt.sittings.length}
              onStart={start}
            />
          )}
          {(body.status === "loading" || body.status === "offline" || body.status === "missing") && (
            <div className="mt-3">
              <ContentNotice
                state={body.status === "loading" ? "loading" : "offline"}
                onRetry={() => retryBody("paper", current.paperKey, current.version)}
              />
            </div>
          )}
        </div>

        <Timetable attempt={attempt} current={current} />
        <GiveUp attemptId={attempt.id} />
      </div>
    </div>
  );
}

/**
 * How long is left of the 2 days, once they have started. It is also what ends
 * the attempt when they run out: on the tick, or on arriving after they already
 * have. The store decides, so a paper still running is left alone.
 */
function WindowCard({ attempt }: { attempt: SimulationAttempt }) {
  const end = simulationWindowEnd(attempt);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const over = end !== null && now >= end;
  // updatedAt too: handing in the paper that was running is what lets it end.
  useEffect(() => {
    if (over) useBrachNhaStore.getState().expireOverdueSimulations();
  }, [over, attempt.updatedAt]);

  if (end === null) return null;

  const minutes = Math.ceil(Math.max(0, end - now) / 60_000);
  return (
    <div className="mt-3 flex items-start gap-2 rounded-2xl border border-border bg-surface p-3 text-xs font-bold text-text shadow-panel-sm">
      <Hourglass className="mt-0.5 size-4 shrink-0 text-purple" strokeWidth={2.5} />
      <span>
        {over
          ? "អស់ពេល 2 ថ្ងៃហើយ។ ដាក់ស្នើវិញ្ញាសានេះ ដើម្បីមើលលទ្ធផល។"
          : `នៅសល់ ${Math.floor(minutes / 60)} ម៉ោង ${minutes % 60} នាទី ដើម្បីធ្វើគ្រប់វិញ្ញាសា។`}
      </span>
    </div>
  );
}

/** The next paper, with the rule to agree to before its clock starts. */
function StartCard({
  title,
  session,
  ready,
  firstOfAll,
  paperCount,
  onStart,
}: {
  title: string;
  session: SimulationSession;
  ready: boolean;
  /** No paper started yet, so this tap also starts the 2 days. */
  firstOfAll: boolean;
  paperCount: number;
  onStart: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-panel">
      <div className="text-xs font-extrabold text-purple">វិញ្ញាសាបន្ទាប់</div>
      <div className="font-heading mt-1 text-lg font-extrabold text-text">{title}</div>
      <div className="mt-0.5 text-xs font-bold text-muted">
        {session.minutes} នាទី · {session.points} ពិន្ទុ
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-pink/8 p-3 text-xs font-bold text-text">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-pink" strokeWidth={2.5} />
        <span>
          នាឡិកាចាប់ផ្តើមភ្លាមៗ ហើយមិនឈប់ទេ។ ការចាកចេញលើសពី {MAX_EXAM_LEAVES} ដង
          នឹងធ្វើឱ្យវិញ្ញាសានេះបញ្ចប់ភ្លាមៗ។
        </span>
      </div>

      {firstOfAll && (
        <div className="mt-2 flex items-start gap-2 rounded-xl border border-border bg-neo-yellow p-3 text-xs font-bold text-ink">
          <Hourglass className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} />
          <span>
            នៅពេលចាប់ផ្តើមវិញ្ញាសានេះ អ្នកមានពេល {SIMULATION_WINDOW_HOURS} ម៉ោង
            ដើម្បីធ្វើទាំង {paperCount} វិញ្ញាសា នៅម៉ោងណាក៏បាន។ វិញ្ញាសាដែលមិនបានធ្វើទាន់ពេលនឹងបាន 0 ពិន្ទុ។
          </span>
        </div>
      )}

      <label className="mt-3 flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="size-4 shrink-0 accent-[var(--brand-purple)]"
        />
        <span className="text-xs font-bold text-text">
          ខ្ញុំបានអាន និងយល់ព្រមតាមបទបញ្ជានៃការប្រឡង
        </span>
      </label>

      <button
        type="button"
        onClick={onStart}
        disabled={!agreed || !ready}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-cta transition-[transform,box-shadow] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50"
      >
        <Play className="size-4 fill-white" />
        ចាប់ផ្តើមប្រឡង
      </button>
    </div>
  );
}

/** A paper whose clock is running while the student is off its screen. */
function RunningCard({
  title,
  deadline,
  ready,
  attemptId,
  sessionId,
  onContinue,
  onExpired,
}: {
  title: string;
  deadline: number;
  ready: boolean;
  attemptId: string;
  sessionId: string;
  onContinue: () => void;
  onExpired: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  // Read once as this card mounts, in a lazy initial state rather than in the
  // render body: the React Compiler treats a call in render as pure and would
  // keep its first answer, leaving the count stale after each return. The card
  // is unmounted while the paper is on screen, so this is always fresh.
  const [leaves] = useState(() => readSimulationDraft(attemptId, sessionId)?.leaves ?? 0);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const expired = now >= deadline;
  // Held in a ref so the effect below fires on expiry and readiness only, not on
  // every tick's fresh closure.
  const onExpiredRef = useRef(onExpired);
  useEffect(() => {
    onExpiredRef.current = onExpired;
  });
  useEffect(() => {
    // Needs the paper to mark the answers, so a phone that is offline at this
    // moment submits when it has it.
    if (expired && ready) onExpiredRef.current();
  }, [expired, ready]);

  const lastChance = leaves + 1 > MAX_EXAM_LEAVES;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-panel">
      <div className="flex items-center gap-1.5 text-xs font-extrabold text-pink">
        <Hourglass className="size-3.5 shrink-0" strokeWidth={2.5} />
        កំពុងប្រឡង
      </div>
      <div className="font-heading mt-1 text-lg font-extrabold text-text">{title}</div>
      <div className="font-heading mt-1 text-3xl font-extrabold text-text">
        {clockLabel(deadline - now)}
      </div>
      <p className="mt-2 text-xs font-bold text-muted">
        {lastChance
          ? "អ្នកបានចាកចេញគ្រប់ចំនួនហើយ។ ការត្រឡប់ចូលនឹងបញ្ចប់វិញ្ញាសានេះ ហើយដាក់ស្នើចម្លើយដែលបានឆ្លើយ។"
          : `នាឡិកាមិនបានឈប់ទេ។ ការត្រឡប់ចូលវិញរាប់ជាការចាកចេញលើកទី ${leaves + 1}/${MAX_EXAM_LEAVES}។`}
      </p>
      <button
        type="button"
        onClick={onContinue}
        disabled={!ready || expired}
        className="mt-3 block w-full rounded-2xl border border-border bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-cta transition-[transform,box-shadow] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50"
      >
        {lastChance ? "បញ្ចប់វិញ្ញាសា" : "បន្តប្រឡង →"}
      </button>
    </div>
  );
}

/** Both days at a glance: done, up next, or still to come. */
function Timetable({
  attempt,
  current,
}: {
  attempt: SimulationAttempt;
  current: SimulationSitting;
}) {
  return (
    <div className="mt-5 flex flex-col gap-4">
      {([1, 2] as const).map((day) => {
        const sittings = attempt.sittings.filter(
          (s) => SIMULATION_SESSION_BY_ID[s.sessionId].day === day
        );
        if (sittings.length === 0) return null;
        return (
          <div key={day}>
            <div className="mb-2 text-xs font-extrabold text-muted">ថ្ងៃទី {day}</div>
            <div className="flex flex-col gap-2">
              {sittings.map((sitting) => {
                const session = SIMULATION_SESSION_BY_ID[sitting.sessionId];
                const isCurrent = sitting.sessionId === current.sessionId;
                return (
                  <div
                    key={sitting.sessionId}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border border-border p-2.5",
                      isCurrent ? "bg-surface" : "bg-bg",
                      !isCurrent && !sitting.result && "opacity-60"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-lg border border-border text-ink",
                        sitting.result ? "bg-neo-mint" : isCurrent ? "bg-neo-yellow" : "bg-control"
                      )}
                    >
                      {sitting.result ? (
                        <Check className="size-4" strokeWidth={3} />
                      ) : isCurrent ? (
                        <Play className="size-3.5" strokeWidth={2.5} />
                      ) : (
                        <Lock className="size-3.5 text-text" strokeWidth={2.5} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1 truncate text-sm font-bold text-text">
                      {sittingTitle(sitting)}
                    </div>
                    <span className="shrink-0 text-xs font-bold text-muted">
                      {session.minutes} នាទី
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Two taps. Papers already sat stay in their own history and keep their XP. */
function GiveUp({ attemptId }: { attemptId: string }) {
  const [confirming, setConfirming] = useState(false);
  const abandon = useBrachNhaStore((s) => s.abandonSimulation);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="mt-6 block w-full py-2 text-center text-xs font-bold text-muted underline"
      >
        បោះបង់ការប្រឡងសាកល្បងនេះ
      </button>
    );
  }
  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-4 text-center shadow-panel-sm">
      <p className="text-sm font-bold text-text">
        បោះបង់មែនទេ? វិញ្ញាសាដែលបានធ្វើរួចនៅតែមានក្នុងប្រវត្តិរបស់វា ប៉ុន្តែអ្នកនឹងមិនទទួលបាននិទ្ទេសទេ។
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-extrabold text-text"
        >
          បន្តទៀត
        </button>
        <button
          type="button"
          onClick={() => {
            clearSimulationDraft();
            abandon(attemptId);
          }}
          className="rounded-xl border border-border bg-pink/30 px-3 py-2.5 text-xs font-extrabold text-text"
        >
          បោះបង់
        </button>
      </div>
    </div>
  );
}
