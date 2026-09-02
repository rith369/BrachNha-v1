import { useState } from "react";
import { useBrachNhaStore } from "@/lib/store";
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
 * One deliberate departure from the reference design, forced by the fact that
 * this is a bottom-nav tab inside existing app chrome rather than a standalone
 * screen: no back arrow. You do not "go back" from a tab; BottomNav is how you
 * leave.
 *
 * The reference's own streak chip is gone from this header — it used to sit in
 * the `pr-14` space reserved for TopBar's floating hamburger, but AppShell's
 * global StatBar (see app-shell.tsx) now shows streak, plus level/XP/coins, on
 * every ordinary screen including this one. Keeping a second streak number here
 * would just be the same value shown twice a few pixels apart.
 */
export function LessonsList() {
  const userLanguage = useBrachNhaStore((s) => s.userLanguage);

  // Component state, not store state: this is how the screen is being looked at
  // right now, not something a reload should inherit. Same call as the
  // leaderboard's metric/period. Default matches the reference.
  const [tab, setTab] = useState<SubjectTab>("foundation");

  const subjects =
    tab === "foundation" ? foundationSubjects() : allSubjects(userLanguage);

  return (
    <div>
      <div className="font-heading mb-4 bg-brand-tri bg-clip-text pr-14 text-xl font-extrabold text-transparent">
        វគ្គសិក្សា
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
