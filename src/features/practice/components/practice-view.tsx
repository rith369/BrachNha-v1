import { useState } from "react";
import { useBrachNhaStore } from "@/lib/store";
import { UnderlineTabs } from "@/components/ui/underline-tabs";
import { PracticeSubjectCard } from "./practice-subject-card";
import { PRACTICE_TABS, subjectsFor, type PracticeMode } from "../practice";

/**
 * The practice hub: two tabs — Flashcard and Quiz — over the subject catalog.
 *
 * Shaped after the Mock Exam screen, which is two tabs over one exam catalog,
 * and framed like the Study page, whose staggered tile grid is the right shape
 * for choosing a subject. Both were deliberate: this is a third screen in the
 * same family, and it should not invent a fourth layout.
 *
 * KHMER-ONLY, on purpose. See PRACTICE_PAGE_LANG in ../practice for the why.
 *
 * Two departures from a standalone design, the same two the Study and Exam pages
 * make, because this is a drawer destination inside existing app chrome:
 *
 *  - No back arrow. You do not "go back" from a nav destination.
 *  - Title left with pr-14 on the header, because TopBar's floating hamburger
 *    already owns `absolute top-3 right-4`.
 *
 * The tab is component state, not store state: it is how the screen is being
 * looked at right now, not something a reload should inherit. Same call as the
 * leaderboard's metric/period and the exam page's year.
 */
export function PracticeView() {
  const userLanguage = useBrachNhaStore((s) => s.userLanguage);
  const [mode, setMode] = useState<PracticeMode>("flashcards");

  const subjects = subjectsFor(mode, userLanguage);

  return (
    <div>
      <div className="font-heading mb-4 bg-brand-tri bg-clip-text pr-14 text-xl font-extrabold text-transparent">
        ការអនុវត្ត
      </div>

      <UnderlineTabs tabs={PRACTICE_TABS} value={mode} onChange={setMode} />

      {/*
        CSS multi-column, not a grid: the staggered look comes from cards of
        differing height flowing into balanced columns, which is what `columns-*`
        does natively and `grid` does not.

        TWO COLUMNS AT PHONE WIDTH is the same deliberate exception the Study
        page makes to the app's `grid-cols-1 md:grid-cols-2` rule — that rule
        protects dense stat cards needing ~288px, while these are image tiles
        that read fine at ~144px. 320px is the floor and is checked.
      */}
      <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
        {subjects.map((s) => (
          <PracticeSubjectCard key={s.id} subject={s} mode={mode} />
        ))}
      </div>
    </div>
  );
}
