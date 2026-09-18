import { useState } from "react";
import { Link } from "react-router";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Info,
  Layers,
  Timer,
} from "lucide-react";
import type { PaperResult } from "@/lib/store";
import { MAX_EXAM_LEAVES } from "@/hooks/use-leave-guard";
import { formatKmDate } from "@/utils/khmer-dates";
import { UnderlineTabs } from "@/components/ui/underline-tabs";
import { SubjectArt } from "@/features/lessons/components/subject-art";
import { clockLabel } from "../paper-scoring";
import { scoreColor } from "../score-styles";
import { paperQuestions, type PastPaper } from "../papers";

type DetailTab = "detail" | "history";

/**
 * A paper's own screen: what it is, what sitting it involves, and every attempt
 * already made at it — with the Start button at the end rather than at the tap
 * that got here.
 *
 * THE CARD NO LONGER STARTS THE EXAM. Tapping a paper on /exam/subjects used to
 * drop straight into the first question with a 60-minute clock already running,
 * which is a real exam's worst property reproduced with none of its warning.
 * This is the screen that says what is about to happen first — the user's
 * request, and the shape the reference design asks for.
 *
 * EVERY NUMBER ON IT IS DERIVED OR PRINTED, never invented. The question count
 * comes from paperQuestions(), the parts from the sections, the minutes and the
 * points off the paper's own header. The reference sketch also shows a
 * difficulty ("Medium"), and there is none here: nobody graded this paper's
 * difficulty, so the tile is absent rather than guessed — the same rule that
 * keeps a made-up chapter title out of the Study path.
 *
 * THE START BUTTON IS GATED ON ACCEPTING THE RULES — one of them ends the paper
 * after the third absence from the screen (hooks/use-leave-guard.ts), and a
 * penalty nobody agreed to is one a student first meets by being punished by it.
 * The tick is re-asked on every visit, since this screen unmounts while the
 * paper is being sat.
 *
 * "BEFORE YOU BEGIN" DESCRIBES THIS RUNNER, not a generic exam. The sketch
 * promises "you can mark questions for review"; PastPaperRunner has no such
 * control, so that line is not here. Each bullet is a fact about the code: the
 * clock starts on mount, ← steps back, the writing part is on paper, running
 * out submits rather than discards, and the review comes after submitting.
 *
 * Khmer-only per EXAM_PAGE_LANG, Latin digits per CLAUDE.md.
 */
export function PaperDetail({
  paper,
  results,
  onStart,
  onOpenResult,
}: {
  paper: PastPaper;
  /** This paper's attempts, newest first — see paperResultsFor(). */
  results: PaperResult[];
  onStart: () => void;
  onOpenResult: (result: PaperResult) => void;
}) {
  const [tab, setTab] = useState<DetailTab>("detail");
  // Re-asked every time, because this component unmounts while the paper is
  // being sat: coming back from a run or a review lands on an unticked box.
  const [agreed, setAgreed] = useState(false);
  const content = paper.content;

  // The route resolves the paper before mounting this, so content is present;
  // the guard keeps the type honest rather than asserting.
  if (!content) return null;

  const questions = paperQuestions(content).length;
  const best = results.reduce<PaperResult | null>(
    (top, r) => (top === null || r.pct > top.pct ? r : top),
    null
  );

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        to="/exam/subjects"
        className="mb-3 inline-flex items-center gap-1 text-xs font-extrabold text-muted transition hover:text-text md:text-sm"
      >
        <ChevronLeft className="size-4 shrink-0" strokeWidth={2.5} />
        វិញ្ញាសារតាមមុខវិជ្ជា
      </Link>

      <div className="mb-4 flex items-center gap-3 pr-14">
        <SubjectArt
          subject={paper.subject}
          className="size-14 shrink-0 rounded-xl md:size-16"
        />
        <div className="min-w-0">
          <div className="font-heading truncate bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
            {paper.title}
          </div>
          <div className="text-xs font-bold text-muted md:text-sm">
            សម័យប្រឡង {paper.year}
          </div>
        </div>
      </div>

      <UnderlineTabs
        tabs={[
          { id: "detail", label: "ព័ត៌មានវិញ្ញាសា" },
          {
            id: "history",
            label: results.length
              ? `ប្រវត្តិធ្វើតេស្ត (${results.length})`
              : "ប្រវត្តិធ្វើតេស្ត",
          },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "detail" ? (
        <>
          {/* What the app holds of this paper, when that is not the whole of
              it. The maths paper is parts I to III of VII and is answered by
              choosing rather than by writing — a student must not discover
              either of those by starting. */}
          {content.note && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-blue/25 bg-blue/5 p-3.5 text-xs font-bold text-text md:text-sm">
              <Info className="mt-0.5 size-4 shrink-0 text-blue" strokeWidth={2.5} />
              <span>{content.note}</span>
            </div>
          )}

          <div className="mb-4 grid grid-cols-2 gap-2.5 rounded-2xl border border-purple/10 bg-surface p-3.5 shadow-panel md:gap-3 md:p-4">
            <Stat
              icon={<FileText className="size-4" strokeWidth={2.5} />}
              value={`${questions} សំណួរ`}
              label="គិតពិន្ទុ"
            />
            <Stat
              icon={<Clock className="size-4" strokeWidth={2.5} />}
              value={`${content.minutes} នាទី`}
              label="រយៈពេលប្រឡង"
            />
            {content.points !== undefined && (
              <Stat
                icon={<Award className="size-4" strokeWidth={2.5} />}
                value={`${content.points} ពិន្ទុ`}
                label="លើវិញ្ញាសាពិត"
              />
            )}
            <Stat
              icon={<Layers className="size-4" strokeWidth={2.5} />}
              value={`${content.sections.length + (content.writing ? 1 : 0)} ផ្នែក`}
              label="ក្នុងវិញ្ញាសា"
            />
          </div>

          <div className="mb-4">
            <div className="font-heading mb-2 text-sm font-extrabold md:text-base">
              មាតិកាវិញ្ញាសា
            </div>
            <div className="flex flex-wrap gap-2">
              {content.sections.map((section) => (
                <span
                  key={section.id}
                  className="rounded-full border border-purple/15 bg-purple/8 px-3 py-1 text-xs font-extrabold text-purple md:text-sm"
                >
                  {section.title}
                </span>
              ))}
              {content.writing && (
                <span className="rounded-full border border-purple/15 bg-purple/8 px-3 py-1 text-xs font-extrabold text-purple md:text-sm">
                  {content.writing.title}
                </span>
              )}
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-purple/10 bg-surface p-3.5 shadow-panel md:p-4">
            <div className="font-heading mb-2 text-sm font-extrabold md:text-base">
              មុននឹងចាប់ផ្តើម
            </div>
            <ul className="list-outside list-disc space-y-1 pl-4 text-xs font-semibold text-text md:text-sm">
              <li>នាឡិកា {content.minutes} នាទី ចាប់ផ្តើមភ្លាមៗ។</li>
              <li>អ្នកអាចថយក្រោយទៅសំណួរមុន ហើយកែចម្លើយបាន។</li>
              {content.writing && (
                <li>
                  ផ្នែកសរសេរត្រូវសរសេរលើក្រដាស — កម្មវិធីមិនគិតពិន្ទុផ្នែកនេះទេ។
                </li>
              )}
              <li>បើអស់ម៉ោង ចម្លើយដែលឆ្លើយរួចនឹងត្រូវដាក់ស្នើ មិនបាត់បង់ទេ។</li>
              <li>លទ្ធផល ចម្លើយត្រឹមត្រូវ និងការពន្យល់ បង្ហាញក្រោយដាក់ស្នើ។</li>
              {/* The one rule that can END the paper, so it is said here and
                  again on the exam's first screen. */}
              <li className="text-pink">
                ហាមចាកចេញពីកម្មវិធី ឬ បិទអេក្រង់។ ការចាកចេញលើសពី{" "}
                {MAX_EXAM_LEAVES} ដង នឹងធ្វើឱ្យការប្រឡងត្រូវបញ្ចប់ភ្លាមៗ។
              </li>
            </ul>
          </div>

          {best && (
            <div className="mb-4 rounded-2xl border border-mint/25 bg-mint/8 p-3.5 text-xs font-extrabold text-text md:text-sm">
              ពិន្ទុល្អបំផុតរបស់អ្នក៖{" "}
              <span className={scoreColor(best.pct)}>{best.pct}%</span> (
              {best.score}/{best.total})
            </div>
          )}

          {/* THE RULES HAVE TO BE ACCEPTED BEFORE THE CLOCK CAN START, at the
              user's request. A native checkbox rather than a styled div: it is
              keyboard-reachable, announces its own state, and the whole row is
              the target because <label> wraps it. `accent-*` colours the tick
              with the brand fill, which is a fill under a white mark and so
              takes --brand-purple rather than the per-theme scale. */}
          <label className="mb-3 flex cursor-pointer items-start gap-3 rounded-2xl border border-purple/15 bg-surface p-3.5 shadow-panel">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-[var(--brand-purple)]"
            />
            <span className="text-xs font-bold text-text md:text-sm">
              ខ្ញុំបានអាន និងយល់ព្រមតាមបទបញ្ជានៃការប្រឡង
            </span>
          </label>

          <button
            onClick={onStart}
            disabled={!agreed}
            className="block w-full rounded-2xl bg-brand px-6 py-3.5 text-sm font-extrabold text-white shadow-cta transition disabled:opacity-40 disabled:shadow-none md:text-base"
          >
            {results.length ? "ធ្វើម្តងទៀត →" : "ចាប់ផ្តើមប្រឡង →"}
          </button>
        </>
      ) : (
        <HistoryList results={results} onOpenResult={onOpenResult} />
      )}
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple/8 text-purple">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="font-heading truncate text-sm font-extrabold text-text md:text-base">
          {value}
        </div>
        <div className="truncate text-[10px] font-bold text-muted md:text-xs">
          {label}
        </div>
      </div>
    </div>
  );
}

/**
 * Every attempt at this paper, newest first.
 *
 * A ROW REOPENS ITS REVIEW rather than just showing a score — the attempt kept
 * its answers (see PaperResult in lib/store.ts) and the review screen re-marks
 * from them, so the explanations for a paper sat last week are still there. That
 * is what makes keeping a history worth more than a number.
 *
 * The empty state is a sentence, not an invented row: a student who has not sat
 * the paper has no history, and that is an ordinary state rather than an error.
 */
function HistoryList({
  results,
  onOpenResult,
}: {
  results: PaperResult[];
  onOpenResult: (result: PaperResult) => void;
}) {
  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-purple/10 bg-surface p-5 text-center text-sm font-bold text-muted shadow-panel">
        អ្នកមិនទាន់បានធ្វើវិញ្ញាសានេះនៅឡើយទេ។
      </div>
    );
  }

  return (
    <div>
      {results.map((result) => (
        <button
          key={result.date}
          onClick={() => onOpenResult(result)}
          className="mb-2.5 flex w-full items-center gap-3 rounded-2xl border border-purple/10 bg-surface p-3.5 text-left shadow-panel transition hover:brightness-[1.03] active:brightness-95"
        >
          <span
            className={`font-heading shrink-0 text-lg font-extrabold ${scoreColor(result.pct)}`}
          >
            {result.pct}%
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-extrabold text-text md:text-sm">
              {result.score}/{result.total} ត្រឹមត្រូវ
            </span>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] font-bold text-muted md:text-xs">
              {formatKmDate(new Date(result.date))}
              <span className="inline-flex items-center gap-1">
                <Timer className="size-3 shrink-0" strokeWidth={2.5} />
                {clockLabel(result.ms)}
              </span>
              {/* Only when the rule actually ended it: a clean attempt says
                  nothing, and one that merely used a warning is not the
                  student's business to be reminded of forever. */}
              {result.leaves !== undefined && result.leaves > MAX_EXAM_LEAVES && (
                <span className="text-pink">បញ្ចប់មុនកំណត់</span>
              )}
            </span>
          </span>
          <ChevronRight
            className="size-5 shrink-0 text-muted"
            strokeWidth={2.5}
          />
        </button>
      ))}
    </div>
  );
}
