// ============================================================
// DEMO DATA — Friend Streak (the SHARED streak)
// ------------------------------------------------------------
// Fake, fixed data, for the same reason ./demo-data.ts is, plus
// one that is specific to this screen: the app has no concept
// of a friend at all. There is no friendship model, no invite,
// no accept, and RLS lets a student read their OWN rows and
// nothing else — so Dara's goal state could not be fetched
// today even if the relationship existed.
//
// What real data would have to exist to switch this over:
//   • a friendship model — an invite/accept pair, since a
//     one-sided "following" turns a SHARED streak into a
//     stranger's progress bar you cannot influence;
//   • cross-user reads, the SAME blocker the leaderboard is
//     waiting on. It wants a view or a `security definer`
//     function exposing display name, avatar and today's
//     goal-met flag ONLY — never a "profiles are readable by
//     everyone" policy, which hands out email, age and
//     location with it;
//   • a shared-streak derivation, which is harder than the
//     solo one: two people in two timezones have two different
//     "todays", and the pair needs one. Whose day boundary
//     wins is undesigned, as are grace days;
//   • somewhere for a reminder to GO. Today it is local state
//     that forgets on reload. A real one is a notification,
//     which the app does not send, and which needs its own
//     consent story before it sends the first one.
//
// ── THE COUNT IS NOT IN HERE EITHER ──
// FriendStreakView reads the store's `streak` field, the same
// one Home's stat pill, the global StatBar and the solo Streak
// page read. The two pages measure different things — this one
// only counts days BOTH people finished — so they are not
// required by logic to agree, but starting level is what makes
// the shared rule legible: the student sees the same number
// they see everywhere else and learns that HERE it moves only
// when Dara moves too. Don't add a constant for it.
// ============================================================

import type { SharedDay } from "@/utils/streak-friends";
import type { WeekdayId } from "./demo-data";

export interface Participant {
  /** Fallback only for the student — the components read the real name off the
   *  store, exactly as the leaderboard's own row does. */
  name: string;
  /** Matches a file in public/avatars/. There is no live generation fallback. */
  avatarSeed: string;
}

/** The brief names them Panha and Dara. */
export const YOU: Participant = { name: "Panha", avatarSeed: "panharith" };
export const FRIEND: Participant = { name: "Dara", avatarSeed: "dara" };

/**
 * TODAY OPENS WITH NEITHER GOAL DONE, and that is a deliberate departure worth
 * knowing about.
 *
 * The brief contradicts itself here: its data section says today starts with
 * "Panha ✅ / Dara ⏳", and its interaction section then asks for a "Complete
 * Today's Goal" button that "changes Panha's state to completed" — which cannot
 * do anything if Panha is already done. A button that is dead the moment the
 * page loads is the exact pattern this codebase avoids everywhere
 * (sidebar-nav.tsx's `href: null` rows, subject-card.tsx's zero-lesson tile).
 *
 * Starting both outstanding makes BOTH prototype controls live and walks the
 * whole emotional loop the brief describes — finish yours, wait, then watch the
 * pair complete — and every line of its copy still appears, just sequenced:
 * "You're done! Now waiting for Dara." after the first tap, and "You and Dara
 * kept the streak alive!" after the second. The at-risk framing is true from
 * the first paint either way, because the streak is at risk while ANYONE is
 * outstanding.
 */
export const TODAY_START: SharedDay = { you: false, friend: false };

export interface SharedWeekDay {
  id: WeekdayId;
  day: SharedDay;
}

/**
 * Monday-first, matching the solo page's tracker.
 *
 * Six days both-complete and today undecided. NO PAST DAY HAS ONLY ONE PERSON
 * DONE, on purpose — see the note on `SharedDayStatus` in
 * utils/streak-friends.ts: on a past day that combination means the streak
 * actually broke rather than being "at risk", and the demo should not display a
 * state whose real meaning the app has not decided yet.
 */
export const TODAY_ID: WeekdayId = "sun";

export const SHARED_WEEK: readonly SharedWeekDay[] = [
  { id: "mon", day: { you: true, friend: true } },
  { id: "tue", day: { you: true, friend: true } },
  { id: "wed", day: { you: true, friend: true } },
  { id: "thu", day: { you: true, friend: true } },
  { id: "fri", day: { you: true, friend: true } },
  { id: "sat", day: { you: true, friend: true } },
  { id: "sun", day: TODAY_START },
];
