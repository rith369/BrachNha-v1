import { useState } from "react";
import type { PaperGapFill } from "@/types";
import type { PaperAnswers } from "../paper-scoring";
import { cn } from "@/utils/cn";
import { focusCard, focusKicker } from "@/utils/focus-styles";

/**
 * The Reading part: one passage with numbered gaps, and the word bank below it.
 *
 * THE WHOLE PART IS ONE STEP, not one step per gap. A gap-fill is solved by
 * reading around it — the easy gaps are what make the hard ones obvious — and
 * paging through eleven screens would hide the very context the exercise is
 * about. It is also how the paper itself is printed.
 *
 * THE GESTURE: tap a gap to select it, tap a word to drop it in. A word already
 * used somewhere else MOVES rather than duplicating, because the paper's box
 * holds one of each word; the chip it left behind becomes empty again. Tapping
 * the selected gap a second time clears it. After a drop, selection advances to
 * the next empty gap so the common case — working through in order — needs no
 * second tap.
 *
 * GAP 1 IS THE PAPER'S OWN EXAMPLE: rendered already filled and not selectable,
 * and it is excluded from the score by paperQuestions()/scorePaper().
 *
 * Selection is component state rather than the runner's: it is where the eye
 * is, not an answer, and it does not survive leaving the part — coming back to
 * the passage should land on the first gap still to do.
 */
export function PaperGapFillStep({
  gapFill,
  answers,
  onChange,
}: {
  gapFill: PaperGapFill;
  answers: PaperAnswers;
  /** `word === null` clears the gap. The runner owns the answer map. */
  onChange: (gapId: string, word: string | null) => void;
}) {
  const answerable = gapFill.gaps.filter((gap) => !gap.example);
  const firstEmpty = answerable.find((gap) => !answers[gap.id]);
  const [activeId, setActiveId] = useState<string | null>(
    firstEmpty?.id ?? answerable[0]?.id ?? null
  );

  const byNumber = new Map(gapFill.gaps.map((gap) => [gap.number, gap]));
  // Which gap each word is sitting in, so a bank chip can show as used and a
  // re-use can vacate its old home. Words are unique in the box, so one pass is
  // enough.
  const placedIn = new Map<string, string>();
  for (const gap of gapFill.gaps) {
    const word = gap.example ? gap.correct : answers[gap.id];
    if (word) placedIn.set(word, gap.id);
  }

  function pickWord(word: string) {
    if (!activeId) return;
    const previous = placedIn.get(word);
    if (previous === activeId) return;
    if (previous) onChange(previous, null);
    onChange(activeId, word);

    // `answers` is this render's copy, so the gap just filled is still listed
    // as empty — excluded by id rather than by re-reading it. A gap the word was
    // MOVED out of is now empty and may legitimately be next.
    const next = answerable.find(
      (gap) => gap.id !== activeId && (gap.id === previous || !answers[gap.id])
    );
    setActiveId(next?.id ?? null);
  }

  function tapGap(gapId: string) {
    if (activeId === gapId && answers[gapId]) {
      onChange(gapId, null);
      return;
    }
    setActiveId(gapId);
  }

  const filled = answerable.filter((gap) => answers[gap.id]).length;

  return (
    <div className={focusCard}>
      <div className={`mb-2.5 text-purple ${focusKicker}`}>
        {gapFill.title}
      </div>

      {/* leading-loose so the inline gap chips don't crowd the lines above and
          below them — a chip is taller than the text it sits in. */}
      <p className="text-sm leading-loose font-semibold whitespace-pre-line text-text md:text-base md:leading-loose">
        {gapFill.body.split(/(\{\d+\})/).map((piece, i) => {
          const match = piece.match(/^\{(\d+)\}$/);
          if (!match) return <span key={i}>{piece}</span>;

          const gap = byNumber.get(Number(match[1]));
          if (!gap) return <span key={i}>{piece}</span>;

          const word = gap.example ? gap.correct : answers[gap.id];
          const active = activeId === gap.id;

          if (gap.example) {
            return (
              <span
                key={i}
                className="mx-0.5 inline-block rounded-lg border border-purple/15 bg-purple/8 px-2 py-0.5 text-xs font-extrabold text-muted md:text-sm"
              >
                ({gap.number}) {word}
              </span>
            );
          }

          return (
            <button
              key={i}
              onClick={() => tapGap(gap.id)}
              aria-label={`ចន្លោះ ${gap.number}`}
              className={cn(
                "mx-0.5 inline-block min-w-16 rounded-lg border px-2 py-0.5 text-center text-xs font-extrabold transition md:text-sm",
                active
                  ? "border-purple/50 bg-purple/15 text-purple"
                  : word
                    ? "border-purple/20 bg-surface text-text"
                    : "border-dashed border-purple/30 bg-purple/5 text-muted"
              )}
            >
              ({gap.number}) {word ?? "______"}
            </button>
          );
        })}
      </p>

      {/* STICKY, and that is the difference between usable and not: the passage
          is taller than a phone screen, so a bank pinned to the bottom of the
          card would have the student scrolling down to pick a word and back up
          to see where it went. The negative margins let it span the card's full
          width so its top border reads as one line; bg-surface is what stops the
          passage showing through. */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-5 border-t border-purple/10 bg-surface px-4 pt-4 pb-1 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-muted md:text-sm">
            ជ្រើសពាក្យដាក់ក្នុងចន្លោះ
          </span>
          <span className="text-xs font-extrabold text-purple md:text-sm">
            {filled}/{answerable.length}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {gapFill.wordBank.map((word) => {
            const usedIn = placedIn.get(word);
            const gap = gapFill.gaps.find((g) => g.id === usedIn);
            const locked = gap?.example ?? false;
            return (
              <button
                key={word}
                onClick={() => pickWord(word)}
                disabled={locked || !activeId}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-bold transition disabled:opacity-40 md:text-base",
                  usedIn
                    ? "border-purple/15 bg-purple/8 text-muted line-through"
                    : "border-purple/15 bg-surface text-text hover:bg-purple/5"
                )}
              >
                {word}
              </button>
            );
          })}
        </div>

        {!activeId && (
          <div className="mt-3 text-xs font-bold text-muted">
            ចុចលើចន្លោះណាមួយ ដើម្បីជ្រើសពាក្យដាក់វា។
          </div>
        )}
      </div>
    </div>
  );
}
