import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { Bot } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useFocusMode, useHasBottomNav } from "@/hooks/use-focus-mode";
import { cn } from "@/utils/cn";

/**
 * True if some OTHER clickable control is actually sitting under the FAB's
 * circle right now. Sampled across a dense grid rather than a handful of
 * fixed points — an underlying button is often small relative to the FAB's
 * own 56px box (a Daily Mission "Done" pill is roughly 47×24), so a real
 * overlap can sit entirely within one quadrant and a sparse center-plus-
 * corners sample can miss it outright. A 6x6 grid costs nothing here: this
 * only runs on scroll/resize/route-change, throttled to one check per frame.
 *
 * This exists because no fixed offset is safe everywhere the FAB floats: it's
 * absolutely positioned over the bottom-right of whatever page is on screen
 * (see StickyUserCard's own comment on the leaderboard, which reserves a
 * gutter for exactly this reason), and some screens — the Roadmap's Daily
 * Mission list is the dense case — stack three action rows back to back with
 * no gap wide enough for the FAB's own height to rest in without touching one
 * of them. Rather than guess a magic number per page, ask the DOM directly.
 */
function findControlUnder(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  const steps = 5; // 6 points per axis, inset from the very edge
  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const x = r.left + (r.width * i) / steps;
      const y = r.top + (r.height * j) / steps;
      const stack = document.elementsFromPoint(x, y);
      const under = stack.find((n) => n !== el && !el.contains(n));
      if (under?.closest("button, a")) return true;
    }
  }
  return false;
}

export function FabChat() {
  const setChatOpen = useBrachNhaStore((s) => s.setChatOpen);
  const { pathname } = useLocation();
  // Only ever true here for a LESSON: the shell doesn't render the FAB at all on
  // the two assessments, which are the other focus screens.
  const focusMode = useFocusMode();
  // Roadmap and Profile render no BottomNav at all — see isBottomNavRoute for
  // why that means the FAB needs a different resting offset there.
  const hasBottomNav = useHasBottomNav();

  const btnRef = useRef<HTMLButtonElement>(null);
  const [obscuring, setObscuring] = useState(false);

  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;

    let raf = 0;
    const check = () => {
      raf = 0;
      setObscuring(findControlUnder(el));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };

    schedule();
    // capture: true so this still fires for scroll events on the nested
    // overflow-y-auto container every page scrolls internally — a plain
    // bubble-phase listener on window would never see them, since scroll
    // doesn't bubble.
    document.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
    // Re-checks on route change too — navigating to a new page swaps the
    // content under the FAB's fixed screen position without firing scroll or
    // resize.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <button
      ref={btnRef}
      onClick={() => setChatOpen(true)}
      aria-label="KruAI"
      className={cn(
        "animate-fab-pulse absolute right-4 z-40 flex size-13 items-center justify-center rounded-full bg-linear-to-br from-[var(--brand-pink)] to-[var(--brand-purple)] shadow-cta-lg transition-opacity duration-150 lg:right-6",
        // Faded and click-through rather than hidden outright: it stays
        // legible that the mentor is still there, one scroll away, while
        // guaranteeing the control underneath — not the FAB — receives the
        // tap. This is the actual fix for the Roadmap Daily Mission case: no
        // static offset clears all three action rows in every content state
        // (signed vs. skipped pledge changes what renders above the list), so
        // this catches whichever one the offset below doesn't.
        obscuring && "pointer-events-none opacity-30",
        focusMode
          ? // A lesson swaps BottomNav for FocusLayout's pinned action bar, which
            // is taller — and taller again once the button grows at md/lg. These
            // clear it with room to spare rather than sitting on its edge.
            "bottom-22 md:bottom-26 lg:bottom-28"
          : hasBottomNav
            ? // bottom-20 clears BottomNav; from lg there is no BottomNav, so it
              // drops to a normal corner offset instead of floating in dead space.
              "bottom-20 lg:bottom-6"
            : // No BottomNav on this route at any width (Roadmap, Profile), so
              // there's nothing to clear — use the same plain corner offset the
              // lg case above already relies on. This gets the FAB clear of
              // BottomNav-shaped content in the common case; the obscuring
              // check above is what handles the rest.
              "bottom-6"
      )}
    >
      <Bot className="size-6 text-white" strokeWidth={2.25} />
    </button>
  );
}
