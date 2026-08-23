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
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8 md:px-6 lg:px-8">
        <div className="font-heading mb-4 bg-brand-tri bg-clip-text pr-14 text-xl font-extrabold text-transparent">
          📈 Progress
        </div>
        {/* One column on a phone, two from md (tablet) and no further. Columns
            land at ~352px on a tablet and ~470–620px on a laptop, all
            comfortably inside the range these cards already handle — a 320px
            phone renders them at 288px — which is why nothing inside the cards
            needs a breakpoint. items-start stops a short card stretching to
            match a tall neighbour.

            A third column at 2xl was tried and reverted: SubjectBreakdown is a
            long list and the two charts are short, so three columns left a
            large hole rather than filling the screen. Card HEIGHT, not
            available width, is what caps this at two. */}
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          {/* The score donut is the summary for everything below it, so it
              keeps the full width rather than sitting in a column. */}
          <div className="md:col-span-2">
            <ScoreHero />
          </div>
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
