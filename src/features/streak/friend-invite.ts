/**
 * The link that adds one student as a friend: /friend/{their account id}.
 *
 * SHORT ON PURPOSE, not /streak/friends/invite/…: every character goes into the
 * QR code, and a shorter link draws bigger squares in the same space, which is
 * what a phone camera needs.
 *
 * `origin` is injected for the reason features/game/invite.ts gives.
 */
const PREFIX = "/friend/";

const ACCOUNT_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function friendInviteUrl(origin: string, userId: string): string {
  return `${origin}${PREFIX}${userId}`;
}

/**
 * The survey normally ends by sending a new student to the Roadmap. One who
 * arrived on an invite link has to stay on it, or they sign in, answer four
 * questions and lose the friend they came for.
 */
export function isFriendInvitePath(pathname: string): boolean {
  return pathname.startsWith(PREFIX);
}

/** A link cut short by a chat app reaches the page as a bad id. Checked before
 *  asking the database, which would refuse it with a type error. */
export function isAccountId(value: string | undefined): value is string {
  return value !== undefined && ACCOUNT_ID.test(value);
}
