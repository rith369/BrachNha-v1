import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Info } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * "What does this number mean?" — a small explanation that opens on HOVER with
 * a mouse and on TAP with a finger.
 *
 * Built for the Progress page, where a student had to ask what 88% meant, why a
 * subject had no bar, and how two cards differed. Numbers stay uncluttered and
 * the explanation is one gesture away, the same trade the subject chart's short
 * axis labels already make.
 *
 * ── HOVER WITH A MOUSE, TAP WITH A FINGER ──────────────────────────────────
 *
 * It shipped TAP-ONLY, on the reasoning that hover-to-open plus click-to-toggle
 * flickers shut on a laptop the moment the click lands. The user asked for what
 * other apps do instead — point at it and it appears, or touch it — and the
 * flicker turned out to be avoidable rather than inherent: the click is judged
 * by WHAT made it. `onPointerDown` records the pointer type, and a click from a
 * mouse only ever OPENS (it is already open from the hover, so a toggle would
 * shut it under the cursor), while a touch or a keyboard Enter toggles.
 *
 * Hover is filtered to `pointerType === "mouse"`. A touch fires pointerenter
 * too, and treating that as a hover would open on the tap's way in and let the
 * click immediately toggle it shut again.
 *
 * Two delays, both short. HOVER_OPEN_MS stops a pointer sweeping across the
 * four stat tiles from flashing four explanations in a row. HOVER_CLOSE_MS is
 * the grace for crossing the GAP between trigger and popup: the popup is a
 * descendant of the wrapper, so arriving on it fires pointerenter again and
 * cancels the close — without the grace, the popup would vanish in the 6px
 * between the two and could never be reached to be read.
 *
 * Also closes on a tap or click elsewhere and on Escape, the rule
 * ActivityHeatmap's day cells already follow.
 *
 * ── TWO TRIGGER SHAPES, AND NO MARKER ───────────────────────────────────────
 *
 * With no `trigger` it is an ⓘ beside a card title, and `label` names it for a
 * screen reader. With a `trigger` the number ITSELF becomes the control — the
 * thing a student is actually wondering about — and its visible text names the
 * button, so `label` is ignored rather than overriding "88%" with a sentence.
 *
 * Number triggers carry NO visible marker. They briefly had a dotted underline,
 * the textbook "this has a definition" mark, and the user found it ugly under
 * every figure — reasonably, since hover now reveals the explanation to a mouse
 * without any hint. A mouse still gets `cursor-help` on the way in; each card's
 * ⓘ is what tells a phone user that the card explains itself.
 *
 * The popup is a SIBLING of the button, never a child: a button may only hold
 * phrasing content, and a tap inside the explanation would otherwise toggle it
 * shut. That is also why triggers are built from spans.
 *
 * ── MEASURED, NOT ALIGNED ───────────────────────────────────────────────────
 *
 * The heatmap aligns its tooltip from the grid column it knows the cell is in.
 * A shared component knows nothing about where it sits, and the failure is not
 * cosmetic: every page scroller here is `overflow-y-auto`, which forces
 * overflow-x to auto too, so a popup poking past the edge makes the whole page
 * scroll sideways — a hard failure in scripts/shots.mjs. So on open it centres
 * under the trigger, clamps inside the nearest clipping ancestor, and flips
 * above when there is no room below.
 *
 * The position is written straight to the element's style in a LAYOUT effect,
 * not held in state: a layout effect runs before paint, so the popup never
 * visibly jumps, and a setState there is exactly what oxlint's
 * react(set-state-in-effect) forbids.
 */

/** Clear space kept between the popup and whatever edge would cut it off. */
const EDGE = 8;

/** Gap between the trigger and the popup. */
const GAP = 6;

/** A mouse must rest this long before the popup opens — see the header. */
const HOVER_OPEN_MS = 150;

/** Grace after a mouse leaves, long enough to cross GAP into the popup. */
const HOVER_CLOSE_MS = 120;

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * The visible area the popup has to fit inside: the nearest ancestor that clips
 * (anything but `overflow: visible`), intersected with the viewport. The first
 * match is the one that matters — AppShell's outer `overflow-hidden` wrapper is
 * further up than each page's own scroller.
 */
function clipBox(from: HTMLElement): Box {
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  for (let el = from.parentElement; el && el !== document.body; el = el.parentElement) {
    const style = getComputedStyle(el);
    if (style.overflowX !== "visible" || style.overflowY !== "visible") {
      const r = el.getBoundingClientRect();
      return {
        left: Math.max(0, r.left),
        top: Math.max(0, r.top),
        right: Math.min(vw, r.right),
        bottom: Math.min(vh, r.bottom),
      };
    }
  }
  return { left: 0, top: 0, right: vw, bottom: vh };
}

export function InfoTip({
  children,
  label,
  trigger,
  className,
  triggerClassName,
}: {
  /** The explanation. Phrasing content only — it renders inside a span. */
  children: ReactNode;
  /** Screen-reader name for the ⓘ. Ignored when `trigger` is given. */
  label?: string;
  /** Makes this content the tap target instead of an ⓘ. Spans, not divs. */
  trigger?: ReactNode;
  className?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  // ONE pending hover intent, not an open timer and a close timer: each new
  // intent replaces the last, so a leave followed quickly by a re-enter (the
  // pointer crossing GAP into the popup) cannot race into a shut popup.
  const hoverTimer = useRef<number | undefined>(undefined);
  // What pressed the trigger — decides whether its click opens or toggles.
  const pressedBy = useRef("");

  const hoverTo = (next: boolean, ms: number) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(next), ms);
  };

  // A timer still pending when the card unmounts (navigating away mid-hover)
  // would set state on a component that no longer exists.
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  // Only listening while open, so a page full of these costs nothing until one
  // is tapped. A tap inside the wrapper is the trigger (which toggles itself) or
  // the popup (which should stay open to be read), so neither closes it here.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const button = buttonRef.current;
    const tip = tipRef.current;
    if (!open || !wrap || !button || !tip) return;

    const bound = clipBox(wrap);
    const origin = wrap.getBoundingClientRect();
    const anchor = button.getBoundingClientRect();
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;

    // Centred under the trigger, then pulled back inside the visible area.
    const centred = anchor.left + anchor.width / 2 - width / 2;
    const left = Math.min(
      Math.max(centred, bound.left + EDGE),
      bound.right - EDGE - width
    );

    // Below by default; above only when below would be cut off AND above fits.
    // Near the bottom of a long page scrolling would reveal it anyway, so
    // flipping into a space that also clips would be strictly worse.
    const below = anchor.bottom + GAP;
    const above = anchor.top - GAP - height;
    const top =
      below + height > bound.bottom - EDGE && above >= bound.top + EDGE
        ? above
        : below;

    // Written relative to the wrapper, which is the popup's containing block.
    tip.style.left = `${left - origin.left}px`;
    tip.style.top = `${top - origin.top}px`;
  }, [open]);

  return (
    // Hover lives on the WRAPPER, not the button, because the wrapper also
    // contains the popup — so moving from the trigger onto the explanation
    // counts as still being here.
    <span
      ref={wrapRef}
      className={cn("relative inline-flex", className)}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") hoverTo(true, HOVER_OPEN_MS);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") hoverTo(false, HOVER_CLOSE_MS);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        onPointerDown={(e) => {
          pressedBy.current = e.pointerType;
        }}
        onClick={() => {
          window.clearTimeout(hoverTimer.current);
          // A mouse has already opened it by hovering, so a toggle here would
          // shut it under the cursor. A finger, a pen, or the keyboard (no
          // pointerdown at all, so "") toggles.
          if (pressedBy.current === "mouse") setOpen(true);
          else setOpen((o) => !o);
          pressedBy.current = "";
        }}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        aria-label={trigger ? undefined : label}
        className={cn(
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple",
          trigger
            ? "cursor-help rounded-md"
            : // -m-1 p-1 widens the tap target without moving the title's layout.
              "-m-1 cursor-pointer rounded-full p-1 text-muted transition-colors hover:text-text aria-expanded:text-purple",
          triggerClassName
        )}
      >
        {trigger ?? (
          <Info className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
        )}
      </button>
      {open && (
        // Reset every text property a title can hand down — "Overall
        // Readiness" is uppercase and letter-spaced, the score is a heading
        // font, a stat tile is centred — or the explanation inherits them.
        //
        // The font is the BODY's own stack, sans-serif included, and NOT the
        // `font-body` utility: --font-body carries no generic fallback (body
        // adds it in globals.css), so before Nunito arrives on a slow
        // connection that utility renders in the browser's default serif.
        <span
          ref={tipRef}
          id={id}
          role="tooltip"
          className="absolute top-0 left-0 z-30 block w-56 max-w-[calc(100vw-2rem)] rounded-lg border border-purple/15 bg-elevated px-3 py-2 text-left [font-family:var(--font-body),sans-serif] text-[11px] leading-snug font-bold tracking-normal whitespace-normal normal-case text-text no-underline shadow-panel-sm"
        >
          {children}
        </span>
      )}
    </span>
  );
}
