import { Flame } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * The page's main visual: a warm gradient disc with a filled flame in it.
 *
 * A LUCIDE FLAME, NOT 🔥, although the brief writes the emoji throughout. The
 * app swapped every emoji icon for Lucide because emoji render differently on
 * every handset — a fire that shows up flat orange on one phone and 3D on the
 * next is the exact inconsistency that change was made to stop, and this one is
 * 96px tall and is the first thing on the screen. `fill="currentColor"` is what
 * turns Lucide's outline into the solid shape the emoji implied.
 *
 * The disc takes `bg-flame` and the glyph is white; that pairing is 4.2:1 at
 * the orange end, comfortably past the 3:1 a non-text graphic needs. See the
 * token's own note in globals.css for why --brand-yellow could not be used.
 *
 * `--shadow-flame` is a STATIC halo. It is tempting to pulse it and that is
 * exactly what the FAB used to do before it was rewritten: box-shadow is a
 * paint property, so animating it repaints every frame forever. The idle
 * breathe and the completion pop are both pure `transform`.
 */
export function StreakFlame({
  /** Fires the one-shot overshoot when the daily goal is completed. */
  celebrating = false,
  className,
}: {
  celebrating?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-flame relative flex size-24 items-center justify-center rounded-full shadow-flame md:size-28",
        // The pop replaces the breathe rather than stacking with it — two
        // animations on one element fight over `transform` and the last one
        // declared silently wins.
        celebrating ? "animate-streak-pop" : "animate-streak-breathe",
        className
      )}
    >
      {/* Sized as a FRACTION of the disc, not in fixed pixels, because the
          friends summary reuses this component at size-16 via `className` —
          twMerge lets the override win on the disc, and a hardcoded size-12
          glyph would then fill 75% of a 64px circle instead of half of it. */}
      <Flame
        className="size-1/2 text-white"
        fill="currentColor"
        strokeWidth={1.5}
        aria-hidden
      />
    </div>
  );
}
