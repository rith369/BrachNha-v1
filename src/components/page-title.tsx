import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * A page title with its mark: a Lucide icon on a neo fill tile, the title in
 * plain ink, and an optional line under it.
 *
 * It replaced `bg-brand-tri bg-clip-text text-transparent` titles that carried
 * an EMOJI. Clipped text paints every glyph with the background, emoji
 * included, so "📈 Progress" drew a solid purple square where the chart should
 * be. The icon tile gives each page its own colour instead of every title
 * being the same purple.
 *
 * `FILL` is spelled out because Tailwind cannot see a class assembled at
 * runtime. The neo fills are identical in both themes and always carry ink.
 */
const FILL = {
  mint: "bg-neo-mint",
  yellow: "bg-neo-yellow",
  pink: "bg-neo-pink",
  blue: "bg-neo-blue",
  orange: "bg-neo-orange",
} as const;

export function PageTitle({
  icon: Icon,
  fill,
  title,
  subtitle,
  className,
}: {
  icon: LucideIcon;
  fill: keyof typeof FILL;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl border border-border text-ink shadow-hard-sm",
          FILL[fill]
        )}
      >
        <Icon className="size-6" strokeWidth={2.5} aria-hidden />
      </div>
      <div className="min-w-0">
        <h1 className="font-heading text-xl leading-tight font-extrabold text-text md:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-xs font-bold text-muted md:text-sm">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
