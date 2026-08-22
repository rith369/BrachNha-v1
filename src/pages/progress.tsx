import { ScoreHero } from "@/features/progress/components/score-hero";
import { ScoreTrendChart } from "@/features/progress/components/score-trend-chart";
import { SubjectBarChart } from "@/features/progress/components/subject-bar-chart";
import { SubjectBreakdown } from "@/features/progress/components/subject-breakdown";
import { FocusAreas } from "@/features/progress/components/focus-areas";
import { ActivityHeatmap } from "@/features/progress/components/activity-heatmap";
import { AiInsights } from "@/features/progress/components/ai-insights";
import { BottomNav } from "@/components/shell/bottom-nav";

export default function ProgressPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20">
        <div className="font-heading mb-4 bg-linear-to-r from-pink via-purple to-blue bg-clip-text pr-14 text-xl font-extrabold text-transparent">
          📈 Progress
        </div>
        <div className="flex flex-col gap-4">
          <ScoreHero />
          <ScoreTrendChart />
          <SubjectBarChart />
          <SubjectBreakdown />
          <FocusAreas />
          <ActivityHeatmap />
          <AiInsights />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
