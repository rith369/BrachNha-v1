import { useState } from "react";
import { Flame } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { SubjectCard } from "./subject-card";
import { UnderlineTabs } from "@/components/ui/underline-tabs";
import {
  SUBJECT_TABS,
  allSubjects,
  foundationSubjects,
  type SubjectTab,
} from "../subjects";

/**
 * The Study page: a two-tab, staggered grid of SUBJECT tiles.
 *
 * It used to be a flat list of individual LESSONS — one compact row per lesson,
 * built by hand from whatever happened to exist in data/lessons.ts. That grew a
 * row per lesson and gave a subject no identity of its own. The page is now
 * organised around subjects, which is the shape that survives real content
 * arriving.
 *
 * KHMER-ONLY, on purpose. See LESSONS_PAGE_LANG in ../subjects for the why.
 *
 * Two deliberate departures from the reference design, both forced by the fact
 * that this is a bottom-nav tab inside existing app chrome rather than a
 * standalone screen:
 *
 *  - No back arrow. You do not "go back" from a tab; BottomNav is how you leave.
 *  - The streak chip is NOT top-right. TopBar's floating hamburger already owns
 *    `absolute top-3 right-4`. The header therefore follows the app's existing
 *    convention — title left, pr-14 on the header block to clear the hamburger —
 *    with the streak sitting inside that reserved space.
 */
export function LessonsList() {
  const { streak, userLanguage } = useBrachNhaStore(
    useShallow((s) => ({
      streak: s.streak,
      userLanguage: s.userLanguage,
    }))
  );

  // Component state, not store state: this is how the screen is being looked at
  // right now, not something a reload should inherit. Same call as the
  // leaderboard's metric/period. Default matches the reference.
  const [tab, setTab] = useState<SubjectTab>("foundation");

  const subjects =
    tab === "foundation" ? foundationSubjects() : allSubjects(userLanguage);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3 pr-14">
        <div className="font-heading bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
          វគ្គសិក្សា
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full border border-purple/20 bg-purple/8 px-2.5 py-1">
          <Flame className="size-3.5 text-pink" strokeWidth={2.5} />
          <span className="text-xs font-extrabold text-purple">{streak}</span>
        </div>
      </div>

      <UnderlineTabs tabs={SUBJECT_TABS} value={tab} onChange={setTab} />

      {/*
        CSS multi-column, not a grid: the reference's staggered look comes from
        cards of differing height flowing into balanced columns, which is what
        `columns-*` does natively and `grid` does not.

        TWO COLUMNS AT PHONE WIDTH is a deliberate exception to the app's
        `grid-cols-1 md:grid-cols-2` rule. That rule protects dense stat cards
        that need ~288px to stay legible; these are image tiles and read fine at
        ~144px, the way an app-store grid does. 320px is the floor and is checked.
      */}
      <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
        {subjects.map((s) => (
          <SubjectCard key={s.id} subject={s} />
        ))}
      </div>
    </div>
  );
}
