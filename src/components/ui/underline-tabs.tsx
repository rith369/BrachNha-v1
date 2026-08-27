import { cn } from "@/utils/cn";

export interface UnderlineTab<T extends string> {
  id: T;
  label: string;
}

/**
 * Underline tabs over one list.
 *
 * Deliberately NOT leaderboard-controls.tsx's filled pills: those answer "what
 * are we ranking by?", where every option is an equal peer and the control is
 * the main interaction on the screen. These are a quiet filter over a single
 * list, and an underline is the lighter treatment that says so.
 *
 * Generic over the tab id so each caller keeps its own literal union rather than
 * widening to string — the Study page's "foundation" | "all" and the exam page's
 * "past" | "generated". Labels are the caller's page copy, which matters because
 * both callers are Khmer-only screens (LESSONS_PAGE_LANG / EXAM_PAGE_LANG) and
 * the copy belongs beside the constant that governs it.
 */
export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: readonly UnderlineTab<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("mb-4 flex border-b border-purple/10", className)}
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              // -mb-px so the active underline sits ON the container's border
              // rather than 1px above it, which reads as a misaligned seam.
              "-mb-px flex-1 border-b-2 px-2 pb-2.5 text-sm font-extrabold transition md:text-base",
              active
                ? "border-purple text-purple"
                : "border-transparent text-muted hover:text-text"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
