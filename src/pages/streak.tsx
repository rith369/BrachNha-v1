import { Flame } from "lucide-react";
import { BottomNav } from "@/components/shell/bottom-nav";
import { StreakView } from "@/features/streak/components/streak-view";
import { useStreakCopy } from "@/features/streak/copy";
import { useBrachNhaStore } from "@/lib/store";

/**
 * Thin route file, the same shape as pages/leaderboard.tsx: the scroll
 * container, the page title, the feature, the bottom nav.
 *
 * ONE COLUMN AT max-w-2xl, not a widening dashboard grid. This is a reading
 * screen with a single emotional focal point — the count — and the app's rule
 * is that those cap at 672px rather than spreading into columns. The brief
 * asked for "a centered content layout with a comfortable maximum width", which
 * is the same thing said from the other direction. The title sits inside the
 * cap so it lines up with the cards instead of drifting off to their left on a
 * laptop.
 */
export default function StreakPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  const c = useStreakCopy(lang);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 md:px-6 lg:px-8 lg:pb-8">
        <div className="mx-auto w-full max-w-2xl">
          {/* pr-14 keeps the title clear of TopBar's floating hamburger, which
              is absolutely positioned at top-3 right-4. */}
          <div className="mb-4 flex items-center gap-2 pr-14">
            <Flame
              className="size-5 shrink-0 text-pink"
              fill="currentColor"
              strokeWidth={1.5}
              aria-hidden
            />
            <h1 className="font-heading bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
              {c.title}
            </h1>
          </div>

          <StreakView />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
