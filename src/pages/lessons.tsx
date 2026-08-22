import { LessonsList } from "@/features/lessons/components/lessons-list";
import { BottomNav } from "@/components/shell/bottom-nav";

export default function LessonsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20">
        <LessonsList />
      </div>
      <BottomNav />
    </div>
  );
}
