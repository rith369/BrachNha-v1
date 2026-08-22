import { GradePredictionView } from "@/features/grade-prediction/components/grade-prediction-view";
import { BottomNav } from "@/components/shell/bottom-nav";

export default function GradePredictionPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20">
        <div className="font-heading mb-4 bg-linear-to-r from-pink via-purple to-blue bg-clip-text pr-14 text-xl font-extrabold text-transparent">
          🔮 Grade Prediction
        </div>
        <GradePredictionView />
      </div>
      <BottomNav />
    </div>
  );
}
