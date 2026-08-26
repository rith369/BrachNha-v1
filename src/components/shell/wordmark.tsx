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
 * The mark is a plain <img> in public/, the same approach as
 * components/ui/avatar.tsx: bundled, referenced by URL, no import. alt is empty
 * and aria-hidden is set because the name is right beside it as real text —
 * announcing "BrachNha logo, BrachNha" is noise for a screen reader.
 *
 * It is a 96px RASTER, not the source SVG. The supplied artwork is 426
 * auto-traced paths — 431KB, 169KB gzipped, more than half the weight of the
 * entire JS bundle — for something drawn at 40px. The WebP is 4.6KB and
 * pixel-indistinguishable at this size. The master SVG is kept, unshipped, in
 * design/ (see the README there for how to re-render it).
 *
 * <picture> rather than a bare <img>: WebP is effectively universal now, but
 * the PNG fallback costs nothing at runtime — the browser fetches exactly one —
 * and this audience is on whatever handset they have.
 *
 * width/height are set so the box is reserved before the image arrives; without
 * them the name beside it shifts sideways on first paint.
 *
 * The artwork carries its own opaque white background (it was supplied as an
 * app-icon tile), so `rounded-[26%]` clips it into that tile shape rather than
 * letting a hard white square sit on the dark theme's surface. That is why
 * there is no dark: variant here — the mark is a light badge in both themes,
 * which is what an app icon is. The raster is cropped square to match the
 * object-cover below, so the two agree rather than fighting.
 */
export function Wordmark({ subtitle, className }: WordmarkProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <picture>
        <source srcSet="/logo/brachnha.webp" type="image/webp" />
        <img
          src="/logo/brachnha.png"
          alt=""
          aria-hidden="true"
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-[26%] object-cover shadow-panel-sm"
        />
      </picture>
      <div className="min-w-0">
        <div className="font-heading bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
          BrachNha
        </div>
        {subtitle}
      </div>
    </div>
  );
}
