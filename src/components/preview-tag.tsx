import { Eye } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";
import { cn } from "@/utils/cn";

/**
 * "Preview · sample data" — the mark on every screen that still runs on fixed
 * demo numbers: Progress, Grade Prediction (the page and Home's card), Game,
 * the Leaderboard and Streak with Friends.
 *
 * It exists because those numbers sit directly under the REAL global StatBar.
 * Progress's top row says 1,240 XP and a 12-day streak, the Leaderboard's "You"
 * row says 2,430 XP, and the bar above both says what the student has actually
 * earned — often 0. Nothing on screen said which to believe, and the person
 * building the app could not tell either.
 *
 * THE TAGS ARE THE LIST OF WHAT IS STILL FAKE. A new demo screen gets one; a
 * screen that switches to real data loses it. /streak is deliberately untagged:
 * its count is real, and its demo goal card is a recorded product decision.
 *
 * A <span>, never a button — there is nothing behind it to open, and a control
 * that answers a tap with silence reads as broken. The dashed outline is the
 * app's existing "not real" look, borrowed from the friends page's "Prototype
 * only" control. The words are `text-text` rather than `text-muted`: light-theme
 * muted is ~3.8:1 on white, under AA at this size, and the words are the whole
 * point. `bg-surface` is what lets it sit across a card's border line.
 *
 * Block-level (`flex w-fit`), not inline: every caller puts it on a line of its
 * own under a page title, or pins it absolutely to a card's edge, and an inline
 * pill in a block would pick up the parent's line-height as stray space.
 *
 * Here rather than in components/ui/, which holds primitives with no app state:
 * this one reads the language from the store.
 */
export function PreviewTag({ className }: { className?: string }) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = useT(lang);

  return (
    <span
      className={cn(
        "flex w-fit items-center gap-1 rounded-full border border-dashed border-border bg-surface px-2 py-0.5 text-[10px] font-extrabold text-text",
        className
      )}
    >
      <Eye className="size-3 shrink-0 text-muted" strokeWidth={2.5} aria-hidden />
      {t.previewTag}
    </span>
  );
}
