import { useT } from "@/data/translations";
import type { Lang } from "@/types";
import { cn } from "@/utils/cn";

/**
 * "Sample" — the mark on every made-up student on the board.
 *
 * The sample cohort is kept beside real students on the condition that each of
 * its rows says so, so this is not decoration: a row from fromDemo() must never
 * render without it. Real students and the viewer get no mark.
 *
 * Same "not real" look as components/preview-tag.tsx — dashed outline,
 * `text-text` rather than `text-muted` because muted is under AA at this size —
 * shrunk to sit inline beside a name. A <span>: there is nothing to open.
 */
export function SampleMark({
  lang,
  className,
}: {
  lang: Lang;
  className?: string;
}) {
  const t = useT(lang);
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border border-dashed border-border px-1.5 py-px text-[9px] leading-tight font-extrabold text-text",
        className
      )}
    >
      {t.sampleLabel}
    </span>
  );
}
