import { LeaderboardView } from "@/features/leaderboard/components/leaderboard-view";
import { COHORT_LABEL } from "@/features/leaderboard/demo-data";
import { BottomNav } from "@/components/shell/bottom-nav";
import { useBrachNhaStore } from "@/lib/store";
import { useT } from "@/data/translations";

export default function LeaderboardPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  const t = useT(lang);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8 md:px-6 lg:px-8">
        {/* One column, capped at the app's standard reading width — see the
            note in leaderboard-view.tsx. The header sits inside the same cap so
            the title lines up with the cards rather than floating off to the
            left of them on a laptop. */}
        <div className="mx-auto w-full max-w-2xl">
          <div className="font-heading mb-0.5 bg-brand-tri bg-clip-text pr-14 text-xl font-extrabold text-transparent">
            🏆 {t.leaderboard}
          </div>
          <div className="mb-4 pr-14 text-xs font-bold text-muted">
            {COHORT_LABEL[lang]} · {t.leaderboardSubtitle}
          </div>
          <LeaderboardView />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
