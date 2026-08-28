import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * A left-border callout card — a coloured stripe down the left edge over a soft
 * tint of the same colour.
 *
 * This is the shape the whole section flow is built out of, so it is ONE
 * component rather than four hand-rolled cards; four copies of a card is exactly
 * how the app's name lockup drifted into four different versions before
 * shell/wordmark.tsx existed.
 *
 * Colours come from the per-theme `--color-*` scale, NEVER `--brand-*`. These
 * are borders and text — not a fill sitting under white text — which is the
 * split globals.css documents at length. The payoff is that every tone here is
 * already correct in dark mode with no `dark:` override.
 *
 * THE COLOUR IS THE STRIPE, AND ONLY THE STRIPE. The card body is the app's
 * neutral `bg-surface` with a neutral hairline, and the label is ordinary text.
 * An earlier version tinted the background and the label too; with four of these
 * stacked on one screen the page turned into a colour chart and the stripe — the
 * thing that actually distinguishes one block from another — stopped reading as
 * a signal. One coloured element per card is the rule here; don't reintroduce a
 * `bg-{tone}/8`.
 *
 * Tailwind cannot see a class assembled at runtime, so `TONE` spells every
 * variant out. Same reason subject-styles.ts lists all eight subjects.
 */
export type CalloutTone = "blue" | "yellow" | "purple" | "pink" | "mint";

const TONE: Record<CalloutTone, string> = {
  blue: "border-l-blue",
  yellow: "border-l-yellow",
  purple: "border-l-purple",
  pink: "border-l-pink",
  mint: "border-l-mint",
};

export function Callout({
  tone,
  label,
  children,
  className,
}: {
  tone: CalloutTone;
  /** Optional heading row above the body. */
  label?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // border-l-4 over a neutral hairline: the stripe is the identity of the
        // card, the hairline just closes the other three sides. Both are `border`
        // so the left edge overrides rather than adds.
        "rounded-xl border border-border border-l-4 bg-surface p-4 md:p-5",
        TONE[tone],
        className
      )}
    >
      {label && (
        <div className="mb-2 text-xs font-extrabold text-text md:text-sm">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
