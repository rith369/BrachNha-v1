import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useBrachNhaStore } from "@/lib/store";
import { prefetchBody, useContentManifest } from "@/lib/content";
import { entryVersion } from "@/utils/content-manifest";
import { buildStudyFeed, type StudyFeed } from "./study-feed";

/** How many of the feed's top items to download ahead of a tap. */
const PREFETCH_TOP = 3;

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
  // What is published: a deck or quiz the student cannot open is not offered.
  const manifest = useContentManifest();
  const feed = buildStudyFeed({
    ...input,
    manifest,
    weaknesses: userData.weaknesses ?? [],
    strengths: userData.strengths ?? [],
  });

  // THE LIKELY NEXT TAP, downloaded while the phone is idle: the top decks,
  // quizzes and lesson sections on the card. Not a past paper, which is larger
  // and fetched when its own screen opens. lib/content.ts keeps them for good,
  // so this is paid once per version. One string, so the effect runs when the
  // top items change rather than on every render. Both cards call this hook; a body
  // already loading or held is not asked for twice.
  const ahead = feed.items
    .slice(0, PREFETCH_TOP)
    .flatMap((item) =>
      item.kind === "flashcards"
        ? [`deck ${item.lessonKey}`]
        : item.kind === "quiz"
          ? [`quiz ${item.id.replace(/^quiz:quiz-/, "")}`]
          : item.kind === "section"
            ? [`section ${item.id.replace(/^section:/, "")}`]
            : []
    )
    .join(",");
  useEffect(() => {
    if (!ahead) return;
    const run = () => {
      for (const entry of ahead.split(",")) {
        const [kind, key] = entry.split(" ") as ["deck" | "quiz" | "section", string];
        const version = entryVersion(manifest, kind, key);
        if (version !== null) prefetchBody(kind, key, version);
      }
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(run, 1500);
    return () => window.clearTimeout(id);
  }, [ahead, manifest]);

  return feed;
}
