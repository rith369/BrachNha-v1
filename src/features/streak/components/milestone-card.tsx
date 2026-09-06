import { Check, Flame, Lock } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import type { RankedMilestone } from "@/utils/streak";
import { milestoneDaysLabel, useStreakCopy } from "../copy";

/**
 * One rung of the ladder, in one of three states.
 *
 * A `<div>`, never a button or a link, in every state. There is nothing behind
 * a milestone to open — it is a status readout — and this codebase's standing
 * rule is that a control which answers a tap with silence reads as broken
 * (sidebar-nav.tsx's `href: null` rows, the survey's StudiedStep,
 * subject-card.tsx's zero-lesson tile).
 *
 * The three states are told apart by MORE THAN COLOUR: reached gets a tick,
 * next gets a filled flame and a ring, locked gets a padlock and drops to 60%.
 * Colour alone would leave the whole distinction invisible to anyone who cannot
 * separate mint from purple, and the grid is the one place on this page where
 * the state IS the information.
 *
 * Tints are the `/8` and `/30` alpha scale over the per-theme `--color-*`
 * tokens, which is what makes every state correct on dark with no `dark:`
 * override — see the two-accent-scales note in globals.css.
 */
export function MilestoneCard({ milestone }: { milestone: RankedMilestone }) {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);

  const { status } = milestone;
  const reached = status === "reached";
  const next = status === "next";

  const badge = reached ? c.reached : next ? c.next : c.locked;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-colors",
        reached && "border-mint/30 bg-mint/8",
        next && "border-purple/40 bg-purple/8 ring-2 ring-purple/15",
        !reached && !next && "border-border bg-surface opacity-60"
      )}
    >
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-full",
          reached && "bg-mint text-white",
          next && "bg-flame text-white",
          !reached && !next && "bg-control text-muted"
        )}
      >
        {reached ? (
          <Check className="size-4.5" strokeWidth={3.5} aria-hidden />
        ) : next ? (
          <Flame className="size-4.5" fill="currentColor" strokeWidth={1.5} aria-hidden />
        ) : (
          <Lock className="size-4" strokeWidth={2.5} aria-hidden />
        )}
      </div>

      <div className="font-heading text-sm font-extrabold text-text">
        {milestoneDaysLabel(milestone.days, lang)}
      </div>

      {/* [overflow-wrap:anywhere] rather than a Tailwind break-* utility: Khmer
          has no spaces, so a two-word label is one unbreakable run and would
          otherwise render wider than the card at the 320px floor. Same reason
          subject-path-view.tsx's node titles carry it. */}
      <div className="text-[10px] leading-snug font-bold text-muted [overflow-wrap:anywhere]">
        {milestone.label[lang]}
      </div>

      <div
        className={cn(
          "mt-0.5 rounded-full px-2 py-0.5 text-[9px] font-extrabold",
          reached && "bg-mint/15 text-mint",
          next && "bg-purple/15 text-purple",
          !reached && !next && "bg-control text-muted"
        )}
      >
        {badge}
      </div>
    </div>
  );
}
