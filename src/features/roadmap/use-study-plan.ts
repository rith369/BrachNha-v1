import { useShallow } from "zustand/react/shallow";
import { useContentManifest } from "@/lib/content";
import { useBrachNhaStore } from "@/lib/store";
import { buildProgressSummary } from "@/features/progress/summary";
import { todayKey } from "@/utils/day";
import { BAC2_EXAM_DATE } from "@/utils/exam-date";
import { buildStudyPlan } from "./study-plan";

/** The plan and what it was built from, read from the live store. Shared by the
 *  Roadmap and each month's page, so a row and the page it opens cannot differ. */
export function useStudyPlan() {
  // userData is selected whole and unpacked below: a `?? []` inside the selector
  // would mint a fresh array per call, the trap use-study-feed.ts records.
  const { userData, examResults, ...input } = useBrachNhaStore(
    useShallow((s) => ({
      userLanguage: s.userLanguage,
      userData: s.userData,
      completedSessions: s.completedSessions,
      cardReviews: s.cardReviews,
      studentCards: s.studentCards,
      paperResults: s.paperResults,
      contentLog: s.contentLog,
      activityLog: s.activityLog,
      examResults: s.examResults,
    }))
  );
  const manifest = useContentManifest();
  const today = todayKey();

  const plan = buildStudyPlan({
    ...input,
    manifest,
    weaknesses: userData.weaknesses ?? [],
    strengths: userData.strengths ?? [],
    scores: buildProgressSummary(input.contentLog, input.activityLog, examResults, today).subjects,
    today,
    examMonth: todayKey(BAC2_EXAM_DATE).slice(0, 7),
  });

  return { plan, manifest, contentLog: input.contentLog, activityLog: input.activityLog, today };
}
