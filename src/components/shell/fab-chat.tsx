import { useEffect, useRef, useState } from "react";
import { Bot, X } from "lucide-react";
import { motion } from "framer-motion";
import { useBrachNhaStore } from "@/lib/store";
import {
  markKruAiFound,
  recordKruAiHintShown,
  shouldShowKruAiHint,
} from "@/lib/kruai-hint";
import { useFabPlacement } from "@/hooks/use-fab-placement";
import { useRequireAuth } from "@/hooks/use-auth";
import { cn } from "@/utils/cn";

/** Lets the first screen paint and settle before the bubble appears. */
const HINT_DELAY_MS = 900;
/** Long enough to read twice; it is a pointer, not something to dismiss. */
const HINT_VISIBLE_MS = 10_000;

const HINT_COPY = {
  en: { hello: "Hi!", ask: "What can I help you with?", close: "Close" },
  km: { hello: "សួស្តី!", ask: "តើមានអ្វីអាចឱ្យខ្ញុំជួយបាន?", close: "បិទ" },
} as const;

export function FabChat() {
  const setChatOpen = useBrachNhaStore((s) => s.setChatOpen);
  const requireAuth = useRequireAuth();

  const btnRef = useRef<HTMLButtonElement>(null);
  // Resting offset, and whether it covers a control (hooks/use-fab-placement.ts).
  const { offset, obscuring } = useFabPlacement(btnRef);

  // The greeting bubble (see lib/kruai-hint.ts). Decided once per mount; the
  // module-level flag there stops a remount from greeting twice in one visit.
  const lang = useBrachNhaStore((s) => s.lang);
  const [hintEligible] = useState(shouldShowKruAiHint);
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    if (!hintEligible) return;
    let hideId = 0;
    const showId = window.setTimeout(() => {
      recordKruAiHintShown();
      setHintVisible(true);
      hideId = window.setTimeout(() => setHintVisible(false), HINT_VISIBLE_MS);
    }, HINT_DELAY_MS);
    return () => {
      clearTimeout(showId);
      clearTimeout(hideId);
    };
  }, [hintEligible]);

  const openMentor = () => {
    markKruAiFound();
    setHintVisible(false);
    if (!requireAuth("chat")) return;
    setChatOpen(true);
  };

  const hint = HINT_COPY[lang];

  return (
    <>
    {hintVisible && (
      <motion.div
        initial={{ opacity: 0, scale: 0.85, x: 8 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        style={{ transformOrigin: "right center" }}
        // right-20 / lg:right-22 = the FAB's own right offset plus its 52px
        // width plus a 12px gap, so the tail lands just short of the button.
        className={cn(
          "absolute right-20 z-40 flex max-w-[14rem] items-start lg:right-22",
          offset
        )}
      >
        <button
          type="button"
          onClick={openMentor}
          className="relative rounded-2xl border border-border bg-elevated py-2 pr-7 pl-3 text-left text-sm leading-snug font-semibold text-purple-strong shadow-panel [overflow-wrap:anywhere]"
        >
          {/* Two lines, the greeting and then the question, so a narrow
              phone never breaks the Khmer question mid-phrase. */}
          <span className="block">{hint.hello}</span>
          <span className="block">{hint.ask}</span>
          {/* The tail: a square turned 45° with only its two outer borders,
              so it reads as one outline with the bubble. */}
          <span
            aria-hidden
            className="absolute top-1/2 -right-1.5 size-3 -translate-y-1/2 rotate-45 border-t border-r border-border bg-elevated"
          />
        </button>
        {/* A sibling, never nested: a button inside a button is invalid. */}
        <button
          type="button"
          onClick={() => {
            markKruAiFound();
            setHintVisible(false);
          }}
          aria-label={hint.close}
          className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full text-muted hover:text-text"
        >
          <X className="size-3.5" />
        </button>
      </motion.div>
    )}
    <button
      ref={btnRef}
      // The FAB stays VISIBLE for a guest and raises the login prompt instead
      // of opening. Hiding it would leave nothing on screen to say the mentor
      // exists; this way the lock is the advertisement. The real gate is the
      // bearer token the endpoint demands — see server/chat-handler.ts.
      onClick={openMentor}
      aria-label="KruAI"
      className={cn(
        "animate-fab-pulse absolute right-4 z-40 flex size-13 items-center justify-center rounded-2xl border border-border bg-[var(--brand-purple)] shadow-cta-lg transition-opacity duration-150 lg:right-6",
        // Faded and click-through rather than hidden outright: it stays
        // legible that the mentor is still there, one scroll away, while
        // guaranteeing the control underneath — not the FAB — receives the
        // tap. This is the actual fix for the Roadmap Daily Mission case: no
        // static offset clears all three action rows in every content state
        // (signed vs. skipped pledge changes what renders above the list), so
        // this catches whichever one the offset below doesn't.
        //
        // Except while the greeting is up. On Home the FAB lands over a lesson
        // row at first paint, which is exactly where a new student arrives, so
        // fading it there would point the greeting at a see-through button.
        // For those few seconds the FAB and its bubble win; the fade returns
        // the moment the bubble goes.
        obscuring && !hintVisible && "pointer-events-none opacity-30",
        offset
      )}
    >
      <Bot className="size-6 text-white" strokeWidth={2.25} />
    </button>
    </>
  );
}
