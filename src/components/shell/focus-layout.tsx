import { useState } from "react";
import { X } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";

/**
 * The full-screen task shell used by every lesson and test — Duolingo's lesson
 * shape: a close button and progress bar pinned on top, the exercise centred in
 * whatever space is left, and one action button pinned to the bottom.
 *
 * Deliberately ONE component shared by the lesson flow, the mock exam and the
 * placement test. They previously each hand-rolled their own progress bar and
 * inline buttons, which is how they drifted apart; a change to the task
 * experience should now be a change to this file.
 *
 * The navigation itself is hidden elsewhere — useFocusMode() drives AppShell's
 * `hideChrome` and BottomNav — because the shell owns that chrome, not this.
 */
export function FocusLayout({
  progressPct,
  onExit,
  confirmExit = false,
  meta,
  footer,
  children,
}: {
  /** 0–100. Drives the top bar; the caller keeps owning what "progress" means. */
  progressPct: number;
  onExit: () => void;
  /** Ask before leaving. For screens where exiting discards work (the exam). */
  confirmExit?: boolean;
  /** Optional right-hand status, e.g. "3 answered" or "Q2 / 10". */
  meta?: React.ReactNode;
  /** Pinned bottom action area. Render a disabled button rather than nothing
   *  when the student can't continue yet — an appearing/disappearing bar makes
   *  the content jump. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const lang = useBrachNhaStore((s) => s.lang);
  const [confirming, setConfirming] = useState(false);

  // Two-tap confirm rather than a dialog, matching Profile's logout and the
  // chat's delete-conversation. One less overlay to reason about, and it can't
  // escape the shell the way a portalled dialog would.
  if (confirming) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="font-heading mb-2 text-lg font-extrabold">
          {lang === "en" ? "Leave and lose progress?" : "ចាកចេញ ហើយបាត់បង់វឌ្ឍនភាព?"}
        </div>
        <p className="mb-6 max-w-xs text-sm font-bold text-muted">
          {lang === "en"
            ? "Your answers on this attempt won't be saved."
            : "ចម្លើយរបស់អ្នកនៅលើការប៉ុនប៉ងនេះនឹងមិនត្រូវបានរក្សាទុកទេ។"}
        </p>
        <div className="flex w-full max-w-xs flex-col gap-2.5">
          <button
            onClick={() => setConfirming(false)}
            className="rounded-2xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-cta"
          >
            {lang === "en" ? "Keep going" : "បន្តទៀត"}
          </button>
          <button
            onClick={onExit}
            className="rounded-2xl border border-pink/30 bg-pink/8 px-6 py-3 text-sm font-extrabold text-pink"
          >
            {lang === "en" ? "Leave" : "ចាកចេញ"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top bar. Spans the full width so its bottom edge reads as one line,
          with its contents capped to the same width as the body below — all
          three bands carry the identical max-w so their edges stay aligned. */}
      <div className="shrink-0 border-b border-purple/10">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3 md:max-w-3xl md:gap-4 md:px-6 md:py-4">
          <button
            onClick={() => (confirmExit ? setConfirming(true) : onExit())}
            aria-label={lang === "en" ? "Exit" : "ចេញ"}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-purple/8 hover:text-text md:size-10"
          >
            <X className="size-5 md:size-6" strokeWidth={2.5} />
          </button>
          <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-purple/10 md:h-3.5">
            <div
              className="h-full rounded-full bg-brand transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, progressPct))}%` }}
            />
          </div>
          {meta && (
            <div className="shrink-0 text-xs font-extrabold text-muted md:text-sm">
              {meta}
            </div>
          )}
        </div>
      </div>

      {/* Body. min-h-full + justify-center is the important pair: a short step
          sits in the middle of the screen (the whole point on a laptop), while
          a long one overflows and scrolls from the top instead of being
          centred out of view. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-4 py-6 md:max-w-3xl md:px-6 md:py-10">
          {children}
        </div>
      </div>

      {footer && (
        <div className="shrink-0 border-t border-purple/10 bg-surface">
          <div className="mx-auto w-full max-w-2xl px-4 py-3 md:max-w-3xl md:px-6 md:py-4">
            {footer}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The standard bottom-bar button, so the three task screens don't each invent
 * their own. Full width, because at this size it's the only action.
 */
export function FocusButton({
  onClick,
  disabled,
  variant = "primary",
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        "w-full rounded-2xl px-6 py-3.5 text-sm font-extrabold transition disabled:opacity-40 md:py-4 md:text-base lg:text-lg " +
        (variant === "primary"
          ? "bg-brand text-white shadow-cta"
          : "border border-purple/20 bg-purple/8 text-purple")
      }
    >
      {children}
    </button>
  );
}
