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
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pt-4 pb-20">
        <HomeHeader />
        <MotivationHero />
        <StatPills />
        <GradePredictionWidget />
        <LessonPreviewList />
        <DailyTasks />
      </div>
      <BottomNav />
    </div>
  );
}
