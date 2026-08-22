import { MockExam } from "@/features/exam/components/mock-exam";
import { BottomNav } from "@/components/shell/bottom-nav";

export default function ExamPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <MockExam />
      </div>
      <BottomNav />
    </div>
  );
}
