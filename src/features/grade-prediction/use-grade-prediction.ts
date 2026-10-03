import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { useContentManifest } from "@/lib/content";
import { todayKey } from "@/utils/day";
import { buildRealPrediction, type RealPrediction } from "./real-prediction";

/**
 * The store read behind the Grade Prediction page AND the Home widget, so the
 * two cannot show different grades. Both used to read a fixed demo student;
 * see real-prediction.ts for what replaced it.
 *
 * No useMemo: the React Compiler memoizes on the selected fields itself.
 */
export function useGradePrediction(): RealPrediction {
  const input = useBrachNhaStore(
    useShallow((s) => ({
      contentLog: s.contentLog,
      activityLog: s.activityLog,
      examResults: s.examResults,
      paperResults: s.paperResults,
      completedSessions: s.completedSessions,
      userLanguage: s.userLanguage,
    }))
  );
  const manifest = useContentManifest();
  return buildRealPrediction(
    { ...input, userLanguage: input.userLanguage || "english", manifest },
    todayKey()
  );
}
