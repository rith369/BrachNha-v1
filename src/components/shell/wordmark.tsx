import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface WordmarkProps {
  /**
   * The small line under the name. A node rather than a string because Home
   * puts its level/XP row here, complete with Lucide icons, while the sidebar
   * and the onboarding screens pass plain translated text.
   */
  subtitle?: ReactNode;
  className?: string;
}

/**
 * The app's name lockup: logo mark + "BrachNha" + an optional line under it.
 *
 * Rendered in four places (Home header, the Login and Survey headers, and
 * SidebarNav — which is itself both the drawer and the desktop sidebar), and it
 * must stay one component. Before this existed the four spelled the gradient
 * classes out by hand and had already drifted: each carried a DIFFERENT
 * decoration next to the name (⚔️ on login and survey, ✨ in the sidebar, a
 * Lucide <Sparkles> on Home). The logo replaces all of them — it is the
 * decoration now, and a mark plus an emoji reads as clutter.
 *
 * The mark is a plain <img> at /logo/brachnha.svg, the same approach as
 * components/ui/avatar.tsx: bundled in public/, referenced by URL, no import.
 * alt is empty and aria-hidden is set because the name is right beside it as
 * real text — announcing "BrachNha logo, BrachNha" is noise for a screen
 * reader.
 *
 * The artwork carries its own opaque white background (it was supplied as an
 * app-icon tile), so `rounded-[26%]` clips it into that tile shape rather than
 * letting a hard white square sit on the dark theme's surface. That is why
 * there is no dark: variant here — the mark is a light badge in both themes,
 * which is what an app icon is.
 */
export function Wordmark({ subtitle, className }: WordmarkProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src="/logo/brachnha.svg"
        alt=""
        aria-hidden="true"
        className="size-10 shrink-0 rounded-[26%] object-cover shadow-panel-sm"
      />
      <div className="min-w-0">
        <div className="font-heading bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
          BrachNha
        </div>
        {subtitle}
      </div>
    </div>
  );
}
