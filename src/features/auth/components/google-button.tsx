import { useState } from "react";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";
import { signInWithGoogle } from "@/lib/auth";
import { cn } from "@/utils/cn";

/**
 * "Continue with Google" — the one place the sign-in redirect is started.
 *
 * Shared by the entry screen, the login-required prompt and Profile's upgrade
 * row, for the same reason shell/wordmark.tsx exists: three hand-written copies
 * of a branded button drift, and this one carries a trademark.
 */

/**
 * Google's own four-colour mark, inlined.
 *
 * Lucide has no Google glyph, and Google's branding rules require the real mark
 * on a "Sign in with Google" button rather than a generic key or person icon —
 * so this is one of the few places in the app where an SVG path is written out
 * instead of importing an icon. It sits on a white chip in both themes because
 * the mark is only approved on white or its own solid blue.
 */
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

interface GoogleButtonProps {
  /** "primary" is the app's gradient CTA; "outline" is for places where Google
   *  is offered beside something else that owns the emphasis. */
  variant?: "primary" | "outline";
  className?: string;
}

export function GoogleButton({
  variant = "primary",
  className,
}: GoogleButtonProps) {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = useT(lang);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // `busy` stays true on success and is never cleared — the page is already
  // navigating to Google, and flipping the label back would flash "Continue
  // with Google" at someone who is on their way out.
  async function start() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    const error = await signInWithGoogle();
    if (error) {
      setBusy(false);
      setFailed(true);
    }
  }

  return (
    <div className={className}>
      <button
        onClick={() => void start()}
        disabled={busy}
        className={cn(
          "flex w-full items-center justify-center gap-2.5 rounded-2xl px-6 py-3.5 text-sm font-extrabold transition disabled:opacity-60",
          variant === "primary"
            ? "bg-brand text-white shadow-cta active:scale-[0.98]"
            : "border border-purple/20 bg-surface text-text active:scale-[0.98]"
        )}
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white">
          <GoogleMark className="size-4" />
        </span>
        {busy ? t.signingIn : t.continueWithGoogle}
      </button>

      {failed && (
        <p className="mt-2 text-center text-xs font-bold text-pink">
          {t.signInFailed}
        </p>
      )}
    </div>
  );
}
