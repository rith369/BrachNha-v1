import { GradePredictionView } from "@/features/grade-prediction/components/grade-prediction-view";
import { BottomNav } from "@/components/shell/bottom-nav";
import { PageTitle } from "@/components/page-title";
import { useBrachNhaStore } from "@/lib/store";
import { T } from "@/data/translations";
import { Target } from "lucide-react";

export default function GradePredictionPage() {
  const lang = useBrachNhaStore((s) => s.lang);
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8 md:px-6 lg:px-8">
        <PageTitle
          icon={Target}
          fill="pink"
          title={T[lang].gradePrediction}
          subtitle={
            lang === "en"
              ? "Your likely Bac II grade, from the work you have done."
              : "និទ្ទេស Bac II ដែលអ្នកទំនងជាទទួលបាន តាមការរៀនរបស់អ្នក។"
          }
        />
        <GradePredictionView />
      </div>
      <BottomNav />
    </div>
  );
}
