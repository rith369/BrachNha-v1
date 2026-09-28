import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { buildStudyFeed, type StudyFeed } from "./study-feed";

/** The Study card's feed, read from the live store. Shared by the Study card and
 *  the Missions card, so a mission's "go" link and the card beside it point at
 *  the same next thing. */
export function useStudyFeed(): StudyFeed {
  // userData is selected whole and unpacked below: a `?? []` inside the
  // selector would mint a fresh array per call and useShallow would never see
  // two equal snapshots — the infinite-render trap CLAUDE.md records.
  const { userData, ...input } = useBrachNhaStore(
    useShallow((s) => ({
      userLanguage: s.userLanguage,
      userData: s.userData,
      completedSessions: s.completedSessions,
      cardReviews: s.cardReviews,
      studentCards: s.studentCards,
      paperResults: s.paperResults,
      contentLog: s.contentLog,
    }))
  );
  return buildStudyFeed({
    ...input,
    weaknesses: userData.weaknesses ?? [],
    strengths: userData.strengths ?? [],
  });
}
