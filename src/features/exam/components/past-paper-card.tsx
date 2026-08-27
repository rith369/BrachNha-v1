import { PenLine } from "lucide-react";
import { cn } from "@/utils/cn";
import { SUBJECT_STYLE } from "@/features/lessons/subject-styles";
import { SubjectArt } from "@/features/lessons/components/subject-art";
import type { PastPaper } from "../papers";

/**
 * One past-paper row: a wide illustration banner, the paper's name, its blurb,
 * and the តេស្ត action.
 *
 * THE BANNER'S CROP RATIO IS HELD CONSTANT, not its height. This card triples
 * in width from 288px on a 320px phone to the 672px content cap, so a fixed
 * height would have meant a 2.8:1 band on a phone and a 5.25:1 slot on a laptop
 * — and these are 4:3 illustrations, so that wide a crop decapitated every one
 * of them (verified in shots/exam-1440.png before this was changed). aspect-
 * [11/4] keeps the phone at the height the reference design uses and lets the
 * band grow with the card, and max-h-44 stops it ballooning into a hero image
 * that fits barely one card on a laptop screen.
 *
 * It still needs NO internal breakpoint, so the card honours "nothing inside a
 * card needs a breakpoint" — the ratio does the work a breakpoint would.
 * overflow-hidden on the shell plus rounded-none on the art is what makes the
 * image meet the card's rounded top corners.
 *
 * NO break-inside-avoid here. That belongs to the Study page's tiles, which flow
 * in a CSS multi-column; this list is ordinary block flow.
 *
 * The shell is the app's NEUTRAL surface. Subject colour appears only in the art
 * gradient and — for a paper that actually has questions — the action fill.
 *
 * THE តេស្ត BUTTON STAYS TAPPABLE ON AN EMPTY PAPER, and that is a deliberate
 * departure from this app's usual rule (sidebar-nav.tsx's `href: null` rows, the
 * survey's StudiedStep, subject-card.tsx's zero-lesson tile all render a
 * non-tappable div because a control that answers a tap with silence reads as
 * broken). It was chosen for this screen: the tap is NOT silent, it explains
 * itself, and the ឆាប់ៗនេះ chip means a student learns the state without having
 * to tap at all — the same principle as StudiedStep's note being rendered
 * unconditionally rather than on press. Don't "fix" it back to a dimmed div.
 *
 * The button's two looks are the honest signal: a pending paper gets the neutral
 * outline pill from the reference design, a paper with real questions gets the
 * subject fill under white text. Every paper is pending today, so the screen
 * matches the reference now and gains the distinction for free when content
 * lands. The fill is an inline style because --subject-* is deliberately not
 * mapped into @theme — see subject-styles.ts.
 */
export function PastPaperCard({
  paper,
  notice,
  onTest,
}: {
  paper: PastPaper;
  /** Show the coming-soon line under this card. Owned by the panel so only one
   *  card can ever show it. */
  notice: boolean;
  onTest: () => void;
}) {
  const ready = paper.questions.length > 0;
  const style = SUBJECT_STYLE[paper.subject.id];

  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-purple/10 bg-surface shadow-panel">
      <SubjectArt subject={paper.subject} className="aspect-[11/4] max-h-44 rounded-none" />

      <div className="p-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* min-w-0 + truncate: without them a long Khmer paper name pushes the
              action button off the card at 320px. */}
          <div className="min-w-0 flex-1">
            <div className="font-heading truncate text-sm font-extrabold text-text md:text-base">
              {paper.title}
            </div>
            <div className="mt-0.5 truncate text-[11px] font-semibold text-muted md:text-xs">
              {paper.blurb}
            </div>
          </div>

          <button
            onClick={onTest}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-extrabold transition",
              ready
                ? "text-white shadow-panel-sm"
                : "border border-purple/15 bg-purple/8 text-purple hover:bg-purple/12"
            )}
            style={ready ? { backgroundColor: style.fill } : undefined}
          >
            <PenLine className="size-3.5 shrink-0" strokeWidth={2.5} />
            តេស្ត
          </button>
        </div>

        {!ready && (
          <span className="mt-2 inline-block rounded-full bg-purple/8 px-2 py-0.5 text-[10px] font-extrabold text-muted">
            ឆាប់ៗនេះ
          </span>
        )}

        {notice && (
          <div
            role="status"
            className="mt-2 rounded-xl border border-purple/10 bg-purple/5 px-3 py-2 text-[11px] font-bold text-muted"
          >
            មាតិកាវិញ្ញាសារនេះកំពុងរៀបចំ។ សូមរង់ចាំបន្តិច។
          </div>
        )}
      </div>
    </div>
  );
}
