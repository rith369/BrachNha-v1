import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";
import type { AuthFeature } from "@/types";
import { GoogleButton } from "./google-button";

/**
 * "Login required" — the one modal every locked feature raises.
 *
 * Rendered by AppShell as an `absolute inset-0` sibling, next to
 * CommitmentOverlay, and driven by the store's `authPrompt`. Two consequences
 * worth keeping:
 *
 *  • NOT components/ui/sheet.tsx. That portals to document.body with fixed
 *    positioning and would escape the max-w-lg app frame — the same trap that
 *    keeps ChatOverlay and CommitmentOverlay off it.
 *  • Store-driven rather than prop-drilled, so a component anywhere can call
 *    requireAuth() without threading a callback up to the shell.
 *
 * AppShell mounts it as {authPrompt && <AuthPromptOverlay />}, so this component
 * never renders with a null feature — which is why there is no early return
 * here guarding one. That matters: an internal `if (!authPrompt) return null`
 * above a closure reading into it is the React Compiler crash CLAUDE.md
 * documents.
 */

/** A record rather than a switch, so adding a value to AuthFeature is a type
 *  error until its wording exists. A locked feature with no explanation is
 *  worse than one that is simply unavailable. */
const REASON: Record<AuthFeature, "loginRequiredRoadmap" | "loginRequiredChat"> =
  {
    roadmap: "loginRequiredRoadmap",
    chat: "loginRequiredChat",
  };

export function AuthPromptOverlay() {
  const { lang, authPrompt, closeAuthPrompt } = useBrachNhaStore(
    useShallow((s) => ({
      lang: s.lang,
      authPrompt: s.authPrompt,
      closeAuthPrompt: s.closeAuthPrompt,
    }))
  );
  const t = useT(lang);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--scrim)] p-6 backdrop-blur-[4px]"
      // Tapping the scrim dismisses, like any dialog. The card stops the event
      // so a tap inside it is not read as a tap outside.
      onClick={closeAuthPrompt}
      role="dialog"
      aria-modal="true"
      aria-label={t.loginRequired}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-surface p-6 text-center shadow-panel"
      >
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-purple/10">
          <Lock className="size-6 text-purple" strokeWidth={2.5} />
        </div>

        <h2 className="mb-2 font-heading text-lg font-extrabold text-text">
          {t.loginRequired}
        </h2>
        <p className="mb-5 text-sm font-bold text-muted">
          {authPrompt ? t[REASON[authPrompt]] : ""}
        </p>

        <GoogleButton />

        {/* "Maybe later", not "Continue as Guest": they already ARE a guest, and
            a button that restates their current state does nothing. */}
        <button
          onClick={closeAuthPrompt}
          className="mt-2 w-full py-2 text-xs font-extrabold text-muted active:scale-[0.98]"
        >
          {t.maybeLater}
        </button>
      </motion.div>
    </motion.div>
  );
}
