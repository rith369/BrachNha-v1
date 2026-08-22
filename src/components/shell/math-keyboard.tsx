import { useEffect, useRef } from "react";
import { Delete, Keyboard } from "lucide-react";
import { MATH_TABS, type MathKey, type MathTabId } from "@/data/math-keys";
import { useT } from "@/data/translations";
import { cn } from "@/utils/cn";
import type { Lang } from "@/types";

/**
 * The math symbol keyboard that stands in for the OS keyboard in the chat
 * composer. See components/shell/chat-overlay.tsx for the mode swap.
 *
 * THE ONE RULE: every button here handles `onPointerDown` with
 * `preventDefault()`. Without it, pressing a key blurs the input, the browser
 * collapses `selectionStart` to the end of the value, and every symbol appends
 * to the end instead of landing at the cursor.
 */

const TAB_LABELS: Record<MathTabId, "mathTabBasic" | "mathTabAlgebra" | "mathTabCalculus" | "mathTabPhysics" | "mathTabChemistry"> = {
  basic: "mathTabBasic",
  algebra: "mathTabAlgebra",
  calculus: "mathTabCalculus",
  physics: "mathTabPhysics",
  chemistry: "mathTabChemistry",
};

/** Fixed so switching modes never resizes the message list. Roughly the height
 *  of a portrait Android keyboard; the key grid scrolls inside it. */
const PANEL_HEIGHT = "h-[268px]";

export function MathKeyboard({
  lang,
  tab,
  onTabChange,
  onInsert,
  onBackspace,
  onHide,
}: {
  lang: Lang;
  tab: MathTabId;
  onTabChange: (tab: MathTabId) => void;
  onInsert: (key: MathKey) => void;
  onBackspace: () => void;
  onHide: () => void;
}) {
  const t = useT(lang);
  const keys = MATH_TABS.find((s) => s.id === tab)?.keys ?? [];
  const repeat = useHoldRepeat(onBackspace);

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col border-t border-purple/10 bg-white",
        PANEL_HEIGHT
      )}
    >
      {/* Tabs. Five Khmer labels do not fit across a 360px screen, so the strip
          scrolls sideways rather than wrapping to a second row or truncating. */}
      <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-purple/10 px-2 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MATH_TABS.map((s) => (
          <button
            key={s.id}
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => onTabChange(s.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold whitespace-nowrap transition",
              s.id === tab
                ? "bg-linear-to-r from-pink to-purple text-white"
                : "bg-purple/8 text-purple hover:bg-purple/15"
            )}
          >
            <span className="text-sm">{s.icon}</span>
            {t[TAB_LABELS[s.id]]}
          </button>
        ))}
      </div>

      {/* Keys */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-6 gap-1.5">
          {keys.map((key, i) => (
            <button
              key={`${key.label}-${i}`}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => onInsert(key)}
              className={cn(
                "flex h-11 items-center justify-center rounded-xl border border-purple/12 bg-bg text-base font-bold text-text transition active:scale-95 active:bg-purple/15",
                key.wide && "col-span-2 text-sm"
              )}
            >
              {key.label}
            </button>
          ))}
        </div>
      </div>

      {/* Space / backspace / back to the OS keyboard */}
      <div className="flex shrink-0 items-center gap-1.5 border-t border-purple/10 p-2">
        <button
          onPointerDown={(e) => e.preventDefault()}
          onClick={onHide}
          aria-label={t.textKeyboard}
          className="flex h-11 w-14 shrink-0 items-center justify-center rounded-xl bg-purple/10 text-purple transition active:scale-95"
        >
          <Keyboard className="size-5" strokeWidth={2.25} />
        </button>
        <button
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => onInsert({ label: " " })}
          className="h-11 flex-1 rounded-xl border border-purple/12 bg-bg text-xs font-extrabold text-muted transition active:scale-95 active:bg-purple/15"
        >
          {t.spaceKey}
        </button>
        <button
          {...repeat}
          aria-label={t.backspaceKey}
          className="flex h-11 w-14 shrink-0 items-center justify-center rounded-xl bg-pink/10 text-pink transition active:scale-95"
        >
          <Delete className="size-5" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}

/**
 * Press-and-hold to repeat, for backspace. Deleting a mistyped formula one tap
 * at a time is miserable on a phone.
 */
function useHoldRepeat(action: () => void) {
  // Kept in a ref, refreshed after every render: each repeat tick has to call
  // the LATEST handler, since the parent's backspace closes over the current
  // input value. A stale closure would delete the same character forever.
  const actionRef = useRef(action);
  useEffect(() => {
    actionRef.current = action;
  });

  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stop() {
    if (delayRef.current) clearTimeout(delayRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    delayRef.current = null;
    tickRef.current = null;
  }

  // A pointer released outside the button never fires onPointerUp, so the
  // interval has to be cleaned up on unmount as well.
  useEffect(() => stop, []);

  return {
    onPointerDown(e: React.PointerEvent) {
      e.preventDefault();
      actionRef.current();
      delayRef.current = setTimeout(() => {
        // Slow enough that React has committed the previous delete and the
        // caret has been restored before the next tick reads the DOM.
        tickRef.current = setInterval(() => actionRef.current(), 80);
      }, 400);
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
  };
}
