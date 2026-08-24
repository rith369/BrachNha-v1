import { useEffect, useRef, useState } from "react";
import { CornerDownLeft } from "lucide-react";
import { MathfieldElement } from "mathlive";
// Ships the KaTeX faces MathLive typesets with, as normal Vite assets. Pairs
// with `fontsDirectory = null` below — without the import MathLive renders in a
// fallback face; without the null it ALSO injects its own stylesheet pointing
// at a ./fonts directory that does not exist in the build, and 404s.
import "mathlive/fonts.css";
import { useT } from "@/data/translations";
import { cn } from "@/utils/cn";
import type { VirtualKeyboardName } from "mathlive";
import type { Lang } from "@/types";

/**
 * The math half of the chat composer: a MathLive field to build a formula in,
 * with MathLive's own virtual keyboard below it, and a button that drops the
 * result into the message as `$…$`.
 *
 * STAGING, NOT THE MESSAGE BOX. The composer's text <input> stays the message,
 * because a math field cannot hold Khmer — MathLive typesets in KaTeX faces,
 * which have no Khmer coverage, so prose would come out as empty boxes. Keeping
 * the two separate is what lets a student write Khmer around their formula.
 *
 * THIS MODULE IS THE LAZY BOUNDARY. MathLive is ~840KB of JS plus twenty font
 * files. chat-overlay.tsx reaches it through React.lazy precisely so all of
 * that downloads on the first tap of Σ rather than when the mentor opens — the
 * same reasoning as AppShell's lazy ChatOverlay, and it matters more here.
 * A static import of this file anywhere would silently undo that.
 */

/**
 * Height of the box the keyboard is mounted into, before it has been measured.
 *
 * The box has to be explicit — MathLive's keyboard is `height: 100%` of its
 * container (its own rule, whenever it is not a child of <body>), so it fills
 * the reserved space rather than defining it. Its backdrop is bottom-anchored
 * inside that space, which means too SMALL a box clips the toolbar off the top
 * and too large leaves a dead gap under the field. The real height also changes
 * with the layout — `abc` carries more rows than `123` — so this is only the
 * opening guess, replaced by the measurement below. Roughly a 4-row layout.
 */
const FALLBACK_HEIGHT = 232;

export function MathFieldPanel({
  lang,
  layout,
  onInsert,
}: {
  lang: Lang;
  /** Which stock layout opens first — see defaultMathLayout(). */
  layout: VirtualKeyboardName;
  onInsert: (latex: string) => void;
}) {
  const t = useT(lang);
  const hostRef = useRef<HTMLDivElement>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<MathfieldElement | null>(null);
  const [empty, setEmpty] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(FALLBACK_HEIGHT);

  // Refreshed after every render so the listeners set up on mount always call
  // the current handler rather than the one captured on the first pass.
  const insertRef = useRef(onInsert);
  useEffect(() => {
    insertRef.current = onInsert;
  });

  function commit() {
    const mf = fieldRef.current;
    const latex = mf?.value.trim();
    if (!mf || !latex) return;
    insertRef.current(latex);
    mf.value = "";
    setEmpty(true);
    mf.focus();
  }

  useEffect(() => {
    // Statics, so they have to be set before the first field is constructed.
    MathfieldElement.fontsDirectory = null;
    // Otherwise every keypress fetches a .wav we do not ship.
    MathfieldElement.soundsDirectory = null;

    // Built imperatively rather than as <math-field> in JSX: this is the only
    // web component in the app, and going through the constructor keeps it
    // typed without adding a JSX intrinsic-element declaration for one element.
    const mf = new MathfieldElement();
    // We own show/hide — the panel's mount/unmount is the toggle.
    mf.mathVirtualKeyboardPolicy = "manual";
    mf.className = "block w-full text-lg";
    hostRef.current?.append(mf);
    fieldRef.current = mf;

    const handleInput = () => setEmpty(mf.value.trim() === "");
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      commit();
    };
    mf.addEventListener("input", handleInput);
    mf.addEventListener("keydown", handleKeyDown);

    // Scoped to our own element instead of the default document.body, so the
    // keyboard stays inside the app frame. Same trap that keeps ChatOverlay off
    // ui/sheet: anything portalled to the body escapes the max-w-lg column.
    const kb = window.mathVirtualKeyboard;
    kb.container = keyboardRef.current;
    kb.layouts = layoutOrder(layout);
    mf.focus();
    kb.show();

    // Match the reserved box to what the keyboard actually needs, and keep
    // matching it when the student switches layout (abc is taller than 123).
    // The backdrop is built asynchronously by show(), hence the frame's wait.
    let observer: ResizeObserver | undefined;
    const frame = requestAnimationFrame(() => {
      const backdrop = keyboardRef.current?.querySelector(".MLK__backdrop");
      if (!backdrop) return;
      observer = new ResizeObserver(([entry]) => {
        // scrollHeight, not contentRect: the bottom row's border-bottom sits
        // outside the content box, and .ML__keyboard is overflow-hidden, so
        // measuring the content alone shaves the last row's edge off.
        const h = Math.ceil(
          Math.max(entry.target.scrollHeight, entry.contentRect.height)
        );
        if (h > 0) setKeyboardHeight(h);
      });
      observer.observe(backdrop);
    });

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      mf.removeEventListener("input", handleInput);
      mf.removeEventListener("keydown", handleKeyDown);
      kb.hide();
      // The keyboard is a global singleton; leaving it pointed at a detached
      // node leaks it and breaks the next mount.
      kb.container = null;
      mf.remove();
      fieldRef.current = null;
    };
    // commit() only reads refs, which are stable for the panel's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  return (
    <div className="mathkb mx-auto flex w-full max-w-2xl shrink-0 flex-col border-t border-purple/10 bg-surface">
      <div className="flex items-center gap-2 px-3 py-2">
        <div
          ref={hostRef}
          className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-purple/15 bg-control px-3 py-2"
        />
        <button
          onPointerDown={(e) => e.preventDefault()}
          onClick={commit}
          disabled={empty}
          aria-label={t.insertFormula}
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition disabled:opacity-40",
            "active:scale-95"
          )}
        >
          <CornerDownLeft className="size-4.5" strokeWidth={2.5} />
        </button>
      </div>
      <div
        ref={keyboardRef}
        className="relative w-full"
        style={{ height: keyboardHeight }}
      />
    </div>
  );
}

/** The chosen layout first, then the rest — MathLive opens on layouts[0]. */
function layoutOrder(first: VirtualKeyboardName): VirtualKeyboardName[] {
  const rest: VirtualKeyboardName[] = ["numeric", "symbols", "greek", "alphabetic"];
  return [first, ...rest.filter((name) => name !== first)];
}
