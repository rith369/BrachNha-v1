import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/utils/cn";
import { focusBody, focusPrompt } from "@/utils/focus-styles";
import type { PracticeCard } from "@/types";

/** Horizontal drag distance, in px, that commits a swipe rather than snapping
 *  back. Distinct from the much smaller TAP_THRESHOLD below — a real drag has
 *  to travel noticeably before it counts as a rating, or an easy flick would
 *  grade a card the student only meant to nudge. */
const SWIPE_THRESHOLD = 110;
/** Movement below this, in either axis, still counts as a TAP (flips the
 *  card) rather than the start of a drag — without it, the small hand-jitter
 *  every real touch has would flip the card AND immediately start a drag. */
const TAP_THRESHOLD = 8;
/** How long the fly-off animation plays before the parent is told to advance.
 *  Must match the CSS transition duration below, or the card either jumps
 *  before the animation finishes or the parent advances a beat too late. */
const FLYOFF_MS = 220;

/**
 * DRAG-TO-RATE IS PHONE/TABLET ONLY, below the app's own `lg` breakpoint
 * (1024px — the same number every other `lg:` in this codebase means). A
 * mouse-drag technically works (Pointer Events don't care which device fired
 * them), but dragging a card any real distance with a mouse is awkward in a
 * way a thumb swipe isn't, and the app already has a wider desktop layout
 * with room for real buttons — see review-session.tsx's Back/rating buttons,
 * which are the intended desktop path. Tap-to-flip is NOT gated by this: it
 * stays available at every width, on every device.
 */
function isDragViewport(): boolean {
  return typeof window !== "undefined" && window.innerWidth < 1024;
}

/**
 * One flashcard, Quizlet-style: tap anywhere to flip, drag left/right to rate
 * — right for ចងចាំ (know it), left for មិនទាន់ចងចាំ (don't know it yet) —
 * and a star to mark it important. Replaces the old Show-Answer-then-four-
 * buttons flow entirely; see review-session.tsx for why the grade vocabulary
 * this reports through is still the scheduler's real four-way `ReviewGrade`
 * underneath (ចងចាំ maps to "good", មិនទាន់ចងចាំ to "again") — the SIMPLER
 * choice is a UI decision, not a scheduler change, so FSRS is still a drop-in
 * later; see spaced-repetition.ts.
 *
 * KEYED ON THE QUEUE POSITION BY THE CALLER, NOT ON card.id. This component
 * owns real transient state (drag position, whether a fly-off is playing) that
 * has no business surviving into the next card — remounting is what resets it
 * for free rather than needing an effect to do it by hand. It must remount on
 * every ADVANCE, not merely on every change of card — a card.id key once left
 * this component mounted mid-fly-off, with the card invisible and deaf to
 * touch, in the one case where the same card could follow itself. See
 * review-session.tsx's own comment at the call site.
 *
 * MOVE AND UP ARE HANDLED ON `window`, NOT AS REACT PROPS ON THE DRAGGED
 * ELEMENT ITSELF — this is the load-bearing decision in this file. The first
 * version attached `onPointerMove`/`onPointerUp` directly to the card the way
 * `onPointerDown` still is, and it broke in a very specific, easy-to-miss way:
 * `pointerdown` and every `pointermove` fired correctly (confirmed with
 * on-page logging, X coordinates tracking the drag exactly), but `pointerup`
 * after any real movement NEVER reached the component at all — silently, no
 * error, the card just stayed stuck wherever the last move had dragged it.
 * `setPointerCapture`, splitting `perspective` off the transformed element,
 * and reading refs instead of closed-over state were all tried and none of
 * them were it. The actual cause: the element being hit-tested for pointerup
 * is the same element being moved by the drag's own CSS `transform`, and by
 * release time by a real user its on-screen (painted) box and its DOM-tree
 * hit-test box had drifted out of sync with the pointer's true position enough
 * that the browser's hit test for pointerup simply missed it — a known class
 * of bug with dragging a transformed element via its own listeners, not a
 * quirk unique to this component. Binding to `window` sidesteps it entirely:
 * a window-level pointerup fires regardless of what happens to be under the
 * cursor, filtered to THIS gesture by matching `pointerId` against the one
 * captured at `pointerdown`. `pointerdown` itself stays a normal React prop
 * on the element, since it always fires at the card's ORIGINAL, untransformed
 * position — before any drag transform has been applied — which is exactly
 * the one moment in the gesture that was never actually broken.
 *
 * TAP VS DRAG VS SCROLL is disambiguated by distance and then by AXIS, not by
 * a separate button: movement under TAP_THRESHOLD is a tap (flip); past it,
 * the axis of that first movement decides whether the gesture rates the card
 * or scrolls its face; a rating past SWIPE_THRESHOLD commits, anything short
 * of it snaps back to centre. See the `gesture` ref for why three answers are
 * needed rather than two.
 *
 * TWO TRANSFORMS, NESTED, NOT ONE. The outer wrapper carries the drag
 * (`translateX` + a slight `rotate` — the same "card being flicked" tilt
 * Tinder/Quizlet both use), and an inner wrapper carries the existing flip
 * (`rotateY` in its own `perspective` container — the same technique
 * lesson-detail.tsx's step 2 uses, deliberately on a SEPARATE element from the
 * drag transform rather than sharing one). CSS transforms compose through the
 * DOM, so a card can be mid-flip AND mid-drag at once with no special-casing —
 * matching "they always can flip always."
 */
export function SwipeableFlashcard({
  card,
  flipped,
  onFlip,
  onSwipe,
  starred,
  onToggleStar,
}: {
  card: PracticeCard;
  flipped: boolean;
  onFlip: () => void;
  onSwipe: (direction: "know" | "dontKnow") => void;
  starred: boolean;
  onToggleStar: () => void;
}) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  // Which way the fly-off is playing, or null the rest of the time. Distinct
  // from `dragging`: once this is set the pointer has already been released
  // and the card is animating on its own, ignoring further input.
  const [flyingOut, setFlyingOut] = useState<"know" | "dontKnow" | null>(null);
  const start = useRef({ x: 0, y: 0 });
  // Cached once per gesture, at pointerdown, rather than re-read on every
  // move — a resize mid-drag (real, if rare, on a foldable or a resized
  // browser window) can't flip the rule out from under an in-progress drag.
  const dragAllowed = useRef(true);
  // Refs, not just the state above — the window-level handlers below read
  // these for the actual grading decision so they always see the LATEST
  // value the instant it's written, with no dependency on a render having
  // happened yet. `dragX`/`dragging` state still exists purely to drive the
  // visual transform/opacity below.
  const dragXRef = useRef(0);
  const draggingRef = useRef(false);
  // Which pointer this gesture belongs to, or null between gestures — how the
  // window-level listeners (which see every pointer on the page) know which
  // events are theirs.
  const activePointerId = useRef<number | null>(null);
  // WHAT THIS GESTURE TURNED OUT TO BE. Needed once the card faces became
  // scrollable: a finger dragged UP to read the rest of a long answer is not a
  // rating and is not a tap either, and without a third answer here it was
  // both — it nudged the card sideways, and on release the "never crossed the
  // drag threshold" branch flipped the card out from under the reader. The
  // FIRST movement past TAP_THRESHOLD decides, by axis, and the decision is
  // then frozen for the rest of the gesture so a drag that curves doesn't
  // change its mind halfway.
  //   "pending" — hasn't moved enough to be anything yet; releasing = a tap
  //   "drag"    — horizontal, on a viewport where dragging is allowed: rates
  //   "scroll"  — vertical, or any movement where dragging isn't allowed:
  //               the browser scrolls the face, and release does nothing
  const gesture = useRef<"pending" | "drag" | "scroll">("pending");

  function onPointerDown(e: React.PointerEvent) {
    if (flyingOut) return;
    dragAllowed.current = isDragViewport();
    start.current = { x: e.clientX, y: e.clientY };
    activePointerId.current = e.pointerId;
    // Reset here, not only at the end of a completed gesture — belt and
    // braces against any leftover state from an interrupted previous one.
    gesture.current = "pending";
    draggingRef.current = false;
    dragXRef.current = 0;
    setDragging(false);
    setDragX(0);
  }

  // See this file's own header comment for why move/up live here rather than
  // as React props on the dragged element.
  useEffect(() => {
    function handleMove(e: PointerEvent) {
      if (e.pointerId !== activePointerId.current) return;
      if (flyingOut) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;

      if (gesture.current === "pending") {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < TAP_THRESHOLD) return;
        // Mostly-horizontal, and only where dragging is allowed at all, is a
        // rating. Everything else — vertical, or any real movement on a
        // desktop viewport — is left to the browser, which scrolls the face.
        gesture.current =
          dragAllowed.current && Math.abs(dx) >= Math.abs(dy) ? "drag" : "scroll";
      }
      if (gesture.current !== "drag") return;

      draggingRef.current = true;
      dragXRef.current = dx;
      setDragging(true);
      setDragX(dx);
    }

    function handleUp(e: PointerEvent) {
      if (e.pointerId !== activePointerId.current) return;
      activePointerId.current = null;
      if (flyingOut) return;

      if (gesture.current === "pending") {
        // Never moved enough to become anything — a tap, so flip.
        onFlip();
        return;
      }

      if (gesture.current === "scroll") {
        // The reader scrolled the face (or mouse-dragged on desktop). Not a
        // rating, and pointedly NOT a flip either.
        return;
      }

      if (Math.abs(dragXRef.current) > SWIPE_THRESHOLD) {
        const direction = dragXRef.current > 0 ? "know" : "dontKnow";
        setFlyingOut(direction);
        // Let the fly-off transition actually play before the parent swaps
        // in the next card — calling onSwipe immediately would unmount this
        // component (it's keyed on card.id) mid-animation.
        setTimeout(() => onSwipe(direction), FLYOFF_MS);
        return;
      }

      // Short of the threshold: snap back rather than commit anything.
      draggingRef.current = false;
      dragXRef.current = 0;
      setDragging(false);
      setDragX(0);
    }

    // CANCEL IS NOT A RELEASE, and pointing both at handleUp was wrong once
    // the faces became scrollable. `touch-action: pan-y` hands vertical
    // panning to the browser, and the moment the browser claims the gesture as
    // a native scroll it fires `pointercancel` — often before the finger has
    // travelled TAP_THRESHOLD, so handleUp would still have been sitting in
    // its "never moved, so it's a tap" branch and flipped the card out from
    // under someone who was only scrolling to read the rest of the answer.
    // Cancel means "this gesture is no longer yours": drop it, decide nothing.
    function handleCancel(e: PointerEvent) {
      if (e.pointerId !== activePointerId.current) return;
      activePointerId.current = null;
      gesture.current = "pending";
      draggingRef.current = false;
      dragXRef.current = 0;
      setDragging(false);
      setDragX(0);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleCancel);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleCancel);
    };
  }, [flyingOut, onFlip, onSwipe]);

  // Fly-off sends the card well past either edge of a phone-width column,
  // with a fuller tilt than the live drag ever reaches and a fade so it
  // reads as leaving rather than teleporting.
  const flyTransform =
    flyingOut === "know"
      ? "translateX(140%) rotate(24deg)"
      : flyingOut === "dontKnow"
        ? "translateX(-140%) rotate(-24deg)"
        : undefined;

  const rotate = Math.max(-12, Math.min(12, dragX / 12));
  const knowHint = dragging ? Math.max(0, Math.min(1, dragX / SWIPE_THRESHOLD)) : 0;
  const dontKnowHint = dragging ? Math.max(0, Math.min(1, -dragX / SWIPE_THRESHOLD)) : 0;

  return (
    <div>
      <div
        onPointerDown={onPointerDown}
        className="relative touch-pan-y select-none"
        style={{
          transform: flyTransform ?? `translateX(${dragX}px) rotate(${rotate}deg)`,
          opacity: flyingOut ? 0 : 1,
          // No transition while actively dragging — the card has to track the
          // finger 1:1. Both the snap-back and the fly-off want one, which is
          // exactly the two moments `dragging` is false but dragX/flyingOut
          // still have a value to animate away from.
          transition: dragging
            ? "none"
            : `transform ${flyingOut ? FLYOFF_MS : 200}ms ease-out, opacity ${FLYOFF_MS}ms ease-out`,
        }}
      >
        {/* Direction hints — the same "stamp fading in" cue Tinder/Quizlet
            both use, so a student learns the gesture from the drag itself
            rather than from an instruction line. mint/pink match the tones
            the old Good/Again buttons used, so the colour vocabulary carries
            over even though the buttons are gone. */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-start justify-end rounded-2xl border-4 border-mint p-4"
          style={{ opacity: knowHint }}
        >
          <span className="rounded-lg bg-mint px-2.5 py-1 text-xs font-extrabold text-white">
            ចងចាំ
          </span>
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-start justify-start rounded-2xl border-4 border-pink p-4"
          style={{ opacity: dontKnowHint }}
        >
          <span className="rounded-lg bg-pink px-2.5 py-1 text-xs font-extrabold text-white">
            មិនទាន់ចងចាំ
          </span>
        </div>

        {/* perspective lives on its own element, one level in from the drag
            transform above — see this file's header comment for why the two
            were split apart. */}
        <div className="[perspective:1000px]">
          <div
            className="relative h-52 w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] md:h-64 lg:h-72"
            style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}
          >
            {/* BOTH FACES SCROLL. The card is a fixed height so the deck
                doesn't jump between a one-line card and a long one, which means
                a long answer HAS to go somewhere — before this it simply
                overflowed, printing over the swipe hint below and out past the
                card's own rounded edge. `min-h-full` + `justify-center` on the
                inner block is what keeps a SHORT answer vertically centred
                while a long one starts at the top and scrolls: centring on the
                scroll container itself would push the overflow above the scroll
                origin, where it cannot be reached. `overscroll-contain` stops a
                flick that reaches the end of the card from carrying on into the
                page behind it. */}
            <div className="absolute inset-0 touch-pan-y overflow-y-auto overscroll-contain rounded-2xl border border-purple/15 bg-surface p-6 shadow-panel [backface-visibility:hidden]">
              <div className="flex min-h-full flex-col items-center justify-center text-center">
                <div className={cn("whitespace-pre-line", focusPrompt)}>
                  {card.front}
                </div>
              </div>
            </div>
            <div
              className="absolute inset-0 touch-pan-y overflow-y-auto overscroll-contain rounded-2xl border border-mint/25 bg-mint/8 p-6 shadow-panel [backface-visibility:hidden]"
              style={{ transform: "rotateY(180deg)" }}
            >
              <div className="flex min-h-full flex-col items-center justify-center text-center">
                {/* Plain `text-text`, NOT `text-mint`. The answer is the
                    longest body of reading on the screen and mint-on-mint is
                    genuinely hard to read at length — the tint is carried by
                    the card's own background and border, which is enough to
                    tell the two faces apart without colouring the prose. */}
                <div className={cn("whitespace-pre-line text-text", focusPrompt)}>
                  {card.back}
                </div>
                <div className={cn("mt-3 text-muted", focusBody)}>
                  {card.front}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Star is a SIBLING of the flip container above, not a child of it —
            it used to sit inside that container with its own
            backface-visibility:hidden, which meant it inherited the
            container's rotateY(180deg) when flipped and, having no
            counter-rotation of its own, ended up showing ITS OWN backface —
            invisible and unclickable — the moment the card flipped. Sitting
            outside the rotating layer means it is never subject to that
            rotation at all, so it stays visible and tappable on both faces,
            which was always the intent. stopPropagation keeps a tap on it
            from also registering as a tap-to-flip on the card underneath. */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={starred ? "លុបចេញពីសំខាន់" : "សម្គាល់ថាសំខាន់"}
          aria-pressed={starred}
          className="absolute top-3 right-3 z-20 flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-purple/8 hover:text-yellow"
        >
          <Star
            className={cn("size-4.5", starred && "fill-current text-yellow")}
            strokeWidth={2.5}
          />
        </button>
      </div>

      <div className="mt-3 text-center text-xs font-bold text-muted">
        <span className="lg:hidden">
          ចុចដើម្បីត្រឡប់ • អូសស្តាំ = ចងចាំ • អូសឆ្វេង = មិនទាន់ចងចាំ
        </span>
        {/* Above `lg` the drag is disabled (see isDragViewport) in favour of
            the Back/✕/✓ buttons review-session.tsx renders there — a mouse
            has to click those anyway, so the hint just says what's still
            true at that width. */}
        <span className="hidden lg:inline">ចុចដើម្បីត្រឡប់</span>
      </div>
    </div>
  );
}
