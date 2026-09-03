/**
 * What the summary screen says to a student who has just finished a review.
 *
 * DETERMINISTIC, keyed to how the session actually went — not random, and not
 * one fixed sentence. Random would say something different for the same result
 * on a re-read of the same screen, which reads as the app not paying attention;
 * one fixed sentence congratulating everybody equally is worse than none,
 * because a student who got two out of ten knows it isn't true.
 *
 * NEVER SCOLDS, INCLUDING AT ZERO. The bottom band is the one that matters
 * most: a student who remembered nothing is the one most likely to close the
 * app, so that line names the effort and points at the next step rather than
 * the score. Same reasoning as the leaderboard's forward-only messaging for
 * the current user — see CLAUDE.md, "Messaging is forward-only".
 *
 * KHMER-ONLY, like the rest of this feature — see PRACTICE_PAGE_LANG in
 * ./practice.ts. Pure and store-free, same shape as utils/rewards.ts.
 */
export interface Encouragement {
  /** The headline — short enough to hold one line on a 320px screen. */
  title: string;
  /** The follow-up, naming what to do next. */
  detail: string;
}

/**
 * @param remembered how many cards were rated ចងចាំ this session
 * @param total how many cards were reviewed this session
 */
export function encouragementFor(
  remembered: number,
  total: number
): Encouragement {
  if (total === 0) {
    return {
      title: "ធ្វើបានល្អ!",
      detail: "បន្តរៀនរាល់ថ្ងៃ អ្នកនឹងចាំបានកាន់តែច្រើន។",
    };
  }

  const pct = (remembered / total) * 100;

  if (pct === 100) {
    return {
      title: "អស្ចារ្យណាស់!",
      detail: "អ្នកចងចាំបានគ្រប់កាតទាំងអស់។ បន្តរក្សាល្បឿននេះ!",
    };
  }
  if (pct >= 75) {
    return {
      title: "អ្នកកំពុងធ្វើបានល្អណាស់!",
      detail: "បន្តផ្តោតលើកាតដែលពិបាក អ្នកជិតបានហើយ។",
    };
  }
  if (pct >= 40) {
    return {
      title: "រីកចម្រើនល្អ!",
      detail: "កាតដែលអ្នកមិនទាន់ចាំ នឹងវិលមកវិញនៅពេលក្រោយ។",
    };
  }
  if (pct > 0) {
    return {
      title: "ចាប់ផ្តើមបានល្អ!",
      detail: "រាល់ការពិនិត្យម្តងៗ ជួយឱ្យអ្នកចាំបានយូរជាងមុន។",
    };
  }
  return {
    title: "អ្នកបានព្យាយាមហើយ!",
    detail: "កាតទាំងនេះនឹងវិលមកវិញ។ សាកល្បងម្តងទៀត អ្នកនឹងចាំបាន។",
  };
}
