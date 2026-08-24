import { HomeHeader } from "@/features/home/components/home-header";
import { MotivationHero } from "@/features/home/components/motivation-hero";
import { StatPills } from "@/features/home/components/stat-pills";
import { GradePredictionWidget } from "@/features/home/components/grade-prediction-widget";
import { LessonPreviewList } from "@/features/home/components/lesson-preview-list";
import { DailyTasks } from "@/features/home/components/daily-tasks";
import { BottomNav } from "@/components/shell/bottom-nav";

export default function HomePage() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8 md:px-6 lg:px-8">
        {/* DOM order is unchanged from the single-column version on purpose —
            the grade card still sits between StatPills and LessonPreviewList,
            so a phone renders exactly what it did before. Only the lg column
            spans are new. */}
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          {/* Greeting, hero and stat pills are the page's masthead: full width
              at every size, stacked as before. */}
          <div className="space-y-4 md:col-span-2">
            <HomeHeader />
            <MotivationHero />
            <StatPills />
          </div>
          {/* One compact row (icon, grade, chevron), so it reads as a banner
              across the full width rather than as a column item. Left in a
              column on its own it is ~76px tall against the ~330px Study list
              beside it, which is what left a hole here before. */}
          <div className="md:col-span-2">
            <GradePredictionWidget />
          </div>
          {/* Study and Missions are both list cards of similar height, so they
              pair off into the row below with no span on either — the DOM order
              alone puts Study in column 1 and Missions in column 2. */}
          <LessonPreviewList />
          <DailyTasks />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
