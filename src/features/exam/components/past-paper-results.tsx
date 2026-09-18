import { useEffect, useRef, useState } from "react";
import { Check, PenLine, Timer, X } from "lucide-react";
import type { PastPaperContent } from "@/types";
import { cn } from "@/utils/cn";
import { scoreColor, scoreColorHex } from "../score-styles";
import {
  clockLabel,
  scorePaper,
  type PaperAnswers,
  type ReviewItem,
} from "../paper-scoring";
import { SkillDrill } from "./skill-drill";

/**
 * The results screen for a real past paper: the mark, how it was earned part by
 * part, then every question with the right answer and why.
 *
 * A SEPARATE SCREEN FROM ExamResults, which stays exactly as it is for the
 * generated papers. That one shows a percentage and nothing else, which is all
 * there is to say about a five-question practice test; a past paper has parts, a
 * clock, a writing task it could not mark and twenty explanations to give back.
 *
 * THE SCORE IS THE OBJECTIVE QUESTIONS ONLY, and the card under it says so. The
 * printed paper is out of 50, but the pages supplied do not give the per-part
 * split, so converting to 50 would be a number nobody wrote.
 *
 * Re-marked here from `content` + `answers` rather than taking the runner's
 * numbers: one function owns what a paper is out of (paper-scoring.ts), so the
 * headline and the review list cannot disagree.
 */
export function PastPaperResults({
  content,
  answers,
  ms,
  title,
  onRetake,
  onBack,
}: {
  content: PastPaperContent;
  answers: PaperAnswers;
  ms: number;
  title: string;
  onRetake: () => void;
  onBack: () => void;
}) {
  const marked = scorePaper(content, answers);
  const pct = marked.pct;
  const deg = Math.round((pct / 100) * 360);
  const topRef = useRef<HTMLDivElement>(null);

  // The mark is the first thing a student wants, and the page scroller keeps
  // whatever position the screen before it left — so a paper submitted from the
  // bottom of the writing step would open half-way down the review. scrollIntoView
  // rather than a ref to the scroller: this screen does not own it, and the
  // nearest scrollable ancestor is whichever page mounted it.
  useEffect(() => {
    topRef.current?.scrollIntoView({ block: "start" });
  }, []);

  return (
    <div ref={topRef}>
      <div className="text-center">
        <div
          className="mx-auto mb-5 flex size-32 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(${scoreColorHex(pct)} ${deg}deg, var(--color-chart-track) ${deg}deg)`,
          }}
        >
          <div className="flex size-24 flex-col items-center justify-center rounded-full bg-bg">
            <div
              className={`font-heading text-2xl font-bold ${scoreColor(pct)}`}
            >
              {pct}%
            </div>
            <div className="text-[9px] font-bold text-muted">ពិន្ទុ</div>
          </div>
        </div>

        <div className="font-heading mb-1.5 text-xl font-extrabold">{title}</div>
        <div className="mb-1 text-sm font-bold text-muted">
          {marked.score}/{marked.total} ត្រឹមត្រូវ
        </div>
        <div className="mb-5 inline-flex items-center gap-1 text-xs font-bold text-muted">
          <Timer className="size-3.5 shrink-0" strokeWidth={2.5} />
          ប្រើពេល {clockLabel(ms)} / {content.minutes} នាទី
        </div>
      </div>

      {/* Part by part — where the marks went, which is the first thing a
          student wants after the total. */}
      <div className="mb-5 rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
        {marked.sections.map((section) => (
          <div key={section.id} className="mb-3 last:mb-0">
            <div className="mb-1 flex items-center justify-between gap-3 text-xs font-extrabold md:text-sm">
              <span className="min-w-0 truncate text-text">{section.title}</span>
              <span className={scoreColor(pctOf(section.score, section.total))}>
                {section.score}/{section.total}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-purple/10">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${pctOf(section.score, section.total)}%` }}
              />
            </div>
          </div>
        ))}

        {content.writing && (
          <div className="mt-3 border-t border-purple/10 pt-3 text-xs font-bold text-muted md:text-sm">
            {content.writing.title} · មិនគិតពិន្ទុក្នុងកម្មវិធី —
            ពិនិត្យដោយខ្លួនឯងខាងក្រោម។
          </div>
        )}
      </div>

      {marked.sections.map((section) => (
        <div key={section.id} className="mb-5">
          <div className="font-heading mb-2 text-base font-extrabold">
            {section.title}
          </div>
          {section.items.map((item) => (
            <ReviewRow key={item.id} item={item} />
          ))}
        </div>
      ))}

      {content.writing && <WritingReview writing={content.writing} />}

      <button
        onClick={onRetake}
        className="mb-2.5 block w-full rounded-2xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-cta"
      >
        ប្រឡងម្តងទៀត
      </button>
      <button
        onClick={onBack}
        className="block w-full rounded-2xl border border-purple/20 bg-purple/8 px-6 py-3 text-sm font-extrabold text-purple"
      >
        ← ត្រឡប់
      </button>
    </div>
  );
}

function pctOf(score: number, total: number): number {
  return total === 0 ? 0 : Math.round((score / total) * 100);
}

/**
 * One question in the review.
 *
 * A WRONG ANSWER GETS MORE THAN A CROSS: the explanation, then the rule behind
 * it and a short drill (SkillDrill). A right answer gets the explanation only —
 * it is worth knowing WHY it was right, but a student who has just proved the
 * skill does not need to be sent to practise it.
 *
 * An unanswered question reads "មិនបានឆ្លើយ" rather than showing an empty chip:
 * the clock running out and a wrong guess are different things.
 */
function ReviewRow({ item }: { item: ReviewItem }) {
  return (
    <div
      className={cn(
        "mb-2.5 rounded-2xl border p-3.5",
        item.ok ? "border-mint/25 bg-mint/8" : "border-pink/20 bg-pink/8"
      )}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full text-white",
            item.ok ? "bg-mint" : "bg-pink"
          )}
        >
          {item.ok ? (
            <Check className="size-3.5" strokeWidth={3} />
          ) : (
            <X className="size-3.5" strokeWidth={3} />
          )}
        </span>
        <span className="text-[11px] font-extrabold text-muted md:text-xs">
          {item.label}
        </span>
      </div>

      <div className="mb-2 text-sm font-bold text-text md:text-base">
        {item.prompt}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-extrabold md:text-sm">
        <span className={item.ok ? "text-mint" : "text-pink"}>
          ចម្លើយរបស់អ្នក: {item.answer ?? "មិនបានឆ្លើយ"}
        </span>
        {!item.ok && (
          <span className="text-mint">ចម្លើយត្រឹមត្រូវ: {item.correct}</span>
        )}
      </div>

      <div className="mt-2 text-xs font-semibold text-text md:text-sm">
        {item.explanation}
      </div>

      {!item.ok && <SkillDrill skill={item.skill} />}
    </div>
  );
}

/** The writing task: the checklist to mark yourself against, then the model. */
function WritingReview({
  writing,
}: {
  writing: NonNullable<PastPaperContent["writing"]>;
}) {
  const [showModel, setShowModel] = useState(false);

  return (
    <div className="mb-5 rounded-2xl border border-purple/10 bg-surface p-4 shadow-panel">
      <div className="font-heading mb-1 flex items-center gap-1.5 text-base font-extrabold">
        <PenLine className="size-4 shrink-0 text-purple" strokeWidth={2.5} />
        {writing.title}
      </div>
      <div className="mb-3 text-sm font-semibold text-text">{writing.prompt}</div>

      <div className="mb-3 rounded-xl border border-purple/10 bg-purple/5 p-3">
        <div className="mb-1.5 text-[11px] font-extrabold text-purple md:text-xs">
          ពិនិត្យអត្ថបទរបស់អ្នក
        </div>
        <ul className="list-outside list-disc space-y-1 pl-4 text-xs font-semibold text-text md:text-sm">
          {writing.checklist.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      {/* Behind a tap on purpose: an essay to copy, sitting open above the
          student's own attempt, is the one thing this card must not be. */}
      {!showModel ? (
        <button
          onClick={() => setShowModel(true)}
          className="w-full rounded-xl border border-purple/20 bg-purple/8 px-4 py-2 text-xs font-extrabold text-purple transition hover:bg-purple/12 md:text-sm"
        >
          មើលអត្ថបទគំរូ
        </button>
      ) : (
        <div className="rounded-xl border border-purple/10 bg-control p-3">
          <div className="mb-1.5 text-[11px] font-extrabold text-muted md:text-xs">
            អត្ថបទគំរូ · សរសេរដោយ BrachNha
          </div>
          <div className="space-y-2 text-sm font-semibold text-text md:text-base">
            {writing.modelEssay.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
