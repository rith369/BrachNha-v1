/**
 * The link that gets a friend into one specific competition.
 *
 * THERE IS NOTHING NEW BEHIND THIS. `/game/play/:competitionId` has been a real,
 * linkable route since the joiner side was built — a student arriving cold
 * fetches the competition and plays it. What was missing was never the link, it
 * was a way to SEND it, which is all the invite panel adds.
 *
 * `origin` is INJECTED rather than read from `window` in here, for the same
 * reason pickQuestions() takes its `rand`: this file is a pure query layer, and
 * a module that reaches for a browser global cannot be called from anywhere
 * else. The caller passes `window.location.origin`.
 *
 * THE ORIGIN IS WHY A QR IS ONLY HALF-TESTABLE IN DEVELOPMENT. A code generated
 * on a laptop at `localhost:5178` encodes exactly that, and a phone pointed at
 * the screen cannot reach it. Scanning is a deployed-site test; everything up to
 * and including "does it decode to the right string" is not.
 */
export function competitionInviteUrl(
  origin: string,
  competitionId: string
): string {
  // No trailing-slash handling needed — `location.origin` never carries one, by
  // definition. Stripping it anyway would suggest it sometimes does.
  return `${origin}/game/play/${competitionId}`;
}
