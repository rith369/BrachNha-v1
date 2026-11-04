import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, FlaskConical, Hourglass, Info, ShieldAlert } from "lucide-react";
import { retryBody, useContentBody } from "@/lib/content";
import type { SimulationAttempt, SimulationSitting } from "@/lib/store";
import { ContentNotice } from "@/features/practice/components/content-waiting";
import { cn } from "@/utils/cn";
import { toPastPaperContent } from "../papers";
import {
  SIMULATION_BASE_POINTS,
  SIMULATION_SESSION_BY_ID,
  simulationOutcome,
  type SimulationRow,
} from "../simulation";
import { PastPaperResults } from "./past-paper-results";

/**
 * A finished Simulation: the grade, then each subject, each opening its paper's
 * full review. Nothing is shown between papers, so this is the first place a
 * student sees how any of them went.
 *
 * Khmer only, per EXAM_PAGE_LANG. Every number comes from simulationOutcome().
 */
export function SimulationResult({ attempt }: { attempt: SimulationAttempt }) {
  const [open, setOpen] = useState<SimulationRow | null>(null);
  const outcome = simulationOutcome(attempt);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8">
      <div className="mx-auto w-full max-w-2xl">
        {open && open.sitting.result ? (
          <PaperReview
            sitting={open.sitting}
            title={open.subjectName}
            onBack={() => setOpen(null)}
          />
        ) : (
          <>
            <Link
              to="/exam/simulation"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-muted transition hover:text-text sm:text-sm"
            >
              <ChevronLeft className="size-4 shrink-0" strokeWidth={2.5} />
              ប្រឡងបាក់ឌុបសាកល្បង
            </Link>

            {attempt.test && (
              <div className="mt-3 flex items-start gap-2 rounded-2xl border border-border bg-neo-yellow p-3 text-xs font-bold text-ink">
                <FlaskConical className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} />
                <span>
                  ការសាកល្បងសម្រាប់ក្រុមការងារ។ លទ្ធផលនេះគិតតែលើវិញ្ញាសាដែលមានប៉ុណ្ណោះ។
                </span>
              </div>
            )}

            {outcome.missed > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-2xl border border-border bg-pink/8 p-3 text-xs font-bold text-text">
                <Hourglass className="mt-0.5 size-4 shrink-0 text-pink" strokeWidth={2.5} />
                <span>
                  អស់ពេល 2 ថ្ងៃ មុនពេលធ្វើគ្រប់វិញ្ញាសា។ វិញ្ញាសា {outcome.missed} ដែលមិនបានធ្វើ បាន 0 ពិន្ទុ។
                </span>
              </div>
            )}

            <div
              className={cn(
                "mt-3 rounded-2xl border border-border p-5 text-center text-ink shadow-panel",
                outcome.band.fill
              )}
            >
              <div className="text-xs font-extrabold">និទ្ទេស</div>
              <div className="font-heading text-6xl font-extrabold">{outcome.band.grade}</div>
              <div className="font-heading mt-1 text-lg font-extrabold">
                {outcome.base} / {SIMULATION_BASE_POINTS} ពិន្ទុ
              </div>
              <div className="text-xs font-bold">{outcome.pct}%</div>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-border bg-surface p-3 text-xs font-bold text-muted">
              <Info className="mt-0.5 size-4 shrink-0 text-purple" strokeWidth={2.5} />
              <span>
                ពិន្ទុនេះជាការប៉ាន់ស្មាន ពីចំនួនសំណួរដែលឆ្លើយត្រូវ មិនមែនពិន្ទុពីគ្រូដែលកែសំណេរទេ។
                ភាសាបរទេសជាមុខវិជ្ជាបន្ថែម ដូច្នេះមិនរាប់ក្នុងនិទ្ទេសទេ។
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              {([1, 2] as const).map((day) => {
                const rows = outcome.rows.filter((row) => row.session.day === day);
                if (rows.length === 0) return null;
                return (
                  <div key={day}>
                    <div className="mb-2 text-xs font-extrabold text-muted">ថ្ងៃទី {day}</div>
                    <div className="flex flex-col gap-2">
                      {rows.map((row) =>
                        row.missed ? (
                          // Not a button: there are no answers to review.
                          <div
                            key={row.session.id}
                            className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-bg p-3"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-extrabold text-text">
                                {row.subjectName}
                              </div>
                              <div className="text-xs font-bold text-muted">មិនបានធ្វើ</div>
                            </div>
                            <span className="font-heading shrink-0 text-sm font-extrabold text-text">
                              0/{row.session.points}
                            </span>
                          </div>
                        ) : (
                        <button
                          key={row.session.id}
                          type="button"
                          onClick={() => setOpen(row)}
                          className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface p-3 text-left shadow-panel-sm transition-[transform,box-shadow] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-extrabold text-text">
                              {row.subjectName}
                            </div>
                            <div className="text-xs font-bold text-muted">
                              {row.session.id === "language"
                                ? `${row.pct}% · មុខវិជ្ជាបន្ថែម`
                                : `${row.pct}%`}
                            </div>
                            {row.endedEarly && (
                              <div className="mt-0.5 flex items-center gap-1 text-xs font-bold text-pink-strong">
                                <ShieldAlert className="size-3 shrink-0" strokeWidth={2.5} />
                                បញ្ចប់មុនម៉ោង ដោយសារការចាកចេញ
                              </div>
                            )}
                          </div>
                          <span className="font-heading shrink-0 text-sm font-extrabold text-text">
                            {row.earned}/{row.session.points}
                          </span>
                          <ChevronRight className="size-4 shrink-0 text-muted" strokeWidth={2.5} />
                        </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** One paper's review, against the version that was sat. Versions never change. */
function PaperReview({
  sitting,
  title,
  onBack,
}: {
  sitting: SimulationSitting;
  title: string;
  onBack: () => void;
}) {
  const body = useContentBody("paper", sitting.paperKey, sitting.version);
  const { result } = sitting;

  if (body.status !== "ready" || !result) {
    return (
      <>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1 text-xs font-extrabold text-muted"
        >
          <ChevronLeft className="size-4 shrink-0" strokeWidth={2.5} />
          ត្រឡប់
        </button>
        <ContentNotice
          state={body.status === "loading" ? "loading" : "offline"}
          onRetry={() => retryBody("paper", sitting.paperKey, sitting.version)}
        />
      </>
    );
  }

  return (
    <PastPaperResults
      paperKey={sitting.paperKey}
      content={{
        ...toPastPaperContent(body.body),
        minutes: SIMULATION_SESSION_BY_ID[sitting.sessionId].minutes,
      }}
      answers={result.answers}
      ms={result.ms}
      leaves={result.leaves}
      title={title}
      onBack={onBack}
    />
  );
}
