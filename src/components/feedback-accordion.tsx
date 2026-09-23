import { useState } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  CircleCheck,
  CircleX,
  Layers,
  Repeat,
  X,
} from "lucide-react";
import { MathText } from "@/components/shell/math-text";
import { DrillGroup } from "@/components/skill-drill";
import { cn } from "@/utils/cn";
import { focusBody } from "@/utils/focus-styles";
import type { SkillHelp } from "@/types";

/**
 * A single tappable row that expands/collapses its content.
 *
 * The visual language matches ReviewRow in quiz-results.tsx — a horizontal bar
 * with icon + label + chevron, expanding content below — so the feedback
 * accordion feels native to the practice flow rather than a separate widget.
 *
 * Colour is the LEFT STRIPE only, the same rule Callout follows: one coloured
 * element per card, so four stacked rows don't turn the screen into a rainbow.
 */
function AccordionRow({
  icon: Icon,
  label,
  tone,
  open,
  onToggle,
  children,
  badge,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  /** The accent colour for the left stripe and icon. */
  tone: "pink" | "mint" | "purple" | "blue" | "yellow";
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  /** Optional trailing badge, e.g. exercise count. */
  badge?: string;
}) {
  const toneMap = {
    pink: { stripe: "border-l-pink", icon: "text-pink" },
    mint: { stripe: "border-l-mint", icon: "text-mint" },
    purple: { stripe: "border-l-purple", icon: "text-purple" },
    blue: { stripe: "border-l-blue", icon: "text-blue" },
    yellow: { stripe: "border-l-yellow", icon: "text-yellow" },
  };
  const t = toneMap[tone];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border border-l-4 bg-surface transition-colors",
        t.stripe
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left"
      >
        <Icon
          className={cn("size-4 shrink-0", t.icon)}
          strokeWidth={2.5}
        />
        <span className="min-w-0 flex-1 text-xs font-extrabold text-text md:text-sm">
          {label}
        </span>
        {badge && (
          <span className="text-[10px] font-bold text-muted md:text-[11px]">
            {badge}
          </span>
        )}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted transition-transform",
            open && "rotate-180"
          )}
          strokeWidth={2.5}
        />
      </button>

      {open && (
        <div className="border-t border-border px-3.5 pb-3.5 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * The 4-row accordion feedback shown after answering a quiz question.
 *
 * Replaces the old wall of Callout + SkillDrill with four tappable rows that
 * expand on demand, so the student sees one line each and opens what they want.
 *
 * 1. ហេតុអ្វី? (Why?) — correct/wrong + explanation + rule + common mistake
 * 2. លំហាត់ស្រដៀងគ្នា (Similar Exercise) — DrillGroup
 * 3. លំហាត់គ្រឹះ (Foundation Exercise) — DrillGroup
 * 4. រៀន (Learn) — placeholder, content coming later
 *
 * "Why?" auto-opens on a wrong answer. Everything else starts collapsed.
 *
 * IT AWARDS NOTHING AND RECORDS NOTHING — the same rule SkillDrill follows.
 * The parent quiz runner handles XP and the content log.
 */
export function QuizFeedback({
  answer,
  correct,
  explanation,
  help,
}: {
  /** The option the student picked. */
  answer: string;
  /** The correct option. */
  correct: string;
  /** The explanation for the correct answer. */
  explanation: string;
  /** The SkillHelp object, if the question has one. */
  help?: SkillHelp;
}) {
  const isCorrect = answer === correct;

  // Why? auto-opens on wrong answer; the student needs to see why.
  const [whyOpen, setWhyOpen] = useState(!isCorrect);
  const [similarOpen, setSimilarOpen] = useState(false);
  const [foundationOpen, setFoundationOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);

  return (
    <div className="mt-3 flex flex-col gap-2 md:mt-4">
      {/* Row 1: Why? */}
      <AccordionRow
        icon={isCorrect ? CircleCheck : CircleX}
        label={isCorrect ? "ត្រឹមត្រូវ! — ហេតុអ្វី?" : "មិនត្រឹមត្រូវ — ហេតុអ្វី?"}
        tone={isCorrect ? "mint" : "pink"}
        open={whyOpen}
        onToggle={() => setWhyOpen((v) => !v)}
      >
        {/* The answer + explanation */}
        <div className="mb-2 flex items-start gap-2">
          <span
            className={cn(
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white",
              isCorrect ? "bg-mint" : "bg-pink"
            )}
          >
            {isCorrect ? (
              <Check className="size-3" strokeWidth={3} />
            ) : (
              <X className="size-3" strokeWidth={3} />
            )}
          </span>
          <p className={cn(focusBody, "flex-1")}>
            <MathText text={explanation} />
          </p>
        </div>

        {/* The rule note, if available */}
        {help && (
          <div className="mt-3 rounded-lg border border-blue/20 bg-blue/5 p-2.5">
            <div className="mb-1 text-[11px] font-extrabold text-blue md:text-xs">
              ចំណាំ · {help.label}
            </div>
            <ul className="list-outside list-disc space-y-0.5 pl-4 text-xs font-semibold text-text md:text-sm">
              {help.note.map((line) => (
                <li key={line}>
                  <MathText text={line} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* The common mistake, if available */}
        {help?.mistake && (
          <div className="mt-2 rounded-lg border border-pink/20 border-l-4 border-l-pink bg-surface p-2.5">
            <div className="mb-1 text-[11px] font-extrabold text-pink md:text-xs">
              កំហុសញឹកញាប់
            </div>
            <div className="text-xs font-semibold text-text md:text-sm">
              <MathText text={help.mistake} />
            </div>
          </div>
        )}
      </AccordionRow>

      {/* Rows 2-4 only show when the question has help data */}
      {help && (
        <>
          {/* Row 2: Similar Exercise */}
          <AccordionRow
            icon={Repeat}
            label="លំហាត់ស្រដៀងគ្នា"
            tone="purple"
            open={similarOpen}
            onToggle={() => setSimilarOpen((v) => !v)}
            badge={`${help.questions.length}`}
          >
            <DrillGroup
              questions={help.questions}
              heading="លំហាត់ស្រដៀងគ្នា"
            />
          </AccordionRow>

          {/* Row 3: Foundation Exercise (only if the question has prerequisites) */}
          {help.foundation && (
            <AccordionRow
              icon={Layers}
              label="លំហាត់គ្រឹះ"
              tone="blue"
              open={foundationOpen}
              onToggle={() => setFoundationOpen((v) => !v)}
              badge={`${help.foundation.length}`}
            >
              <DrillGroup
                questions={help.foundation}
                heading="លំហាត់មូលដ្ឋានគ្រឹះ"
              />
            </AccordionRow>
          )}

          {/* Row 4: Learn (placeholder for future content) */}
          <AccordionRow
            icon={BookOpen}
            label="រៀន"
            tone="yellow"
            open={learnOpen}
            onToggle={() => setLearnOpen((v) => !v)}
          >
            <div className="flex flex-col items-center gap-1.5 py-4 text-center">
              <BookOpen className="size-8 text-yellow/40" strokeWidth={1.5} />
              <p className="text-xs font-bold text-muted md:text-sm">
                មកដល់ឆាប់ៗ
              </p>
              <p className="text-[11px] text-muted/70 md:text-xs">
                មេរៀនលម្អិតនឹងមកដល់នៅទីនេះ
              </p>
            </div>
          </AccordionRow>
        </>
      )}
    </div>
  );
}
