/**
 * Which bundled avatar a person gets, derived from their account id.
 *
 * WHY DERIVED RATHER THAN THEIR REAL PHOTO — this is a privacy decision, not a
 * shortcut, and it is worth not re-litigating. Only the CURRENT student's Google
 * photo is available to the app (`authUser.avatarUrl`). Showing anyone else's
 * would mean copying their photo URL onto the public competition row the way
 * `creator_name` already is — which publishes every student's face to everyone
 * in the app. For a school app that is a real step, and nothing about the
 * feature needs it: a face here exists to tell two classmates apart, which a
 * consistent cartoon does just as well.
 *
 * A student's own real photo still shows where only they see it: Profile, and
 * the hero card on /game.
 *
 * TWO PROPERTIES THIS MUST KEEP:
 *
 * 1. DETERMINISTIC AND ARITHMETIC. Never Math.random(), never anything seeded by
 *    the clock. The same student must get the same face on every device, in
 *    every session, and — the part that actually matters — on every OTHER
 *    student's screen. A face that differs between two people looking at the
 *    same competition is worse than no face at all. It is pure for the same
 *    reason the rest of the app's derivations are: it can be called during
 *    render without the React Compiler having anything to memoise incorrectly.
 *
 * 2. THE LIST ORDER IS PART OF THE OUTPUT. Adding a 31st avatar, or reordering
 *    these, reshuffles who looks like whom. That is fine today — nobody has
 *    learned these faces yet — and it would not be once students recognise each
 *    other in a classroom. If the set ever needs to grow after that point,
 *    APPEND rather than insert, and accept that appending still shifts the
 *    modulo for everyone. Doing it properly at that stage means storing the
 *    chosen seed per account instead of deriving it.
 */

/**
 * The avatars bundled in `public/avatars/`, which is the only place they come
 * from — `components/ui/avatar.tsx` points a plain <img> at `/avatars/{seed}.svg`
 * and there is NO live generation to fall back on. DiceBear's API was dropped
 * after it proved unreachable on some networks.
 *
 * So adding one means adding the SVG file AND its name here. A name in this list
 * with no file on disk renders a broken image.
 */
export const AVATAR_SEEDS = [
  "bopha",
  "borey",
  "chanlina",
  "chenda",
  "dara",
  "daravuth",
  "kimnak",
  "kunthea",
  "leakhena",
  "lina",
  "makara",
  "malis",
  "nita",
  "panharith",
  "piseth",
  "rattana",
  "rithy",
  "samnang",
  "sereypich",
  "sokhatin",
  "sokunthea",
  "sopheak",
  "sothea",
  "sovann",
  "sreyneang",
  "sreyroth",
  "theary",
  "vannak",
  "vichea",
  "visal",
] as const;

/**
 * FNV-1a, 32-bit. Chosen because it is a few lines, has no dependencies, and
 * spreads short similar strings — which uuids sharing a prefix very much are —
 * far better than summing char codes, the obvious version that would put half a
 * classroom on the same face.
 *
 * `>>> 0` after each step keeps it in unsigned 32-bit range; without it the
 * multiply overflows into a float and the result stops being stable.
 */
function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/**
 * A stable avatar for a person.
 *
 * `key` should be an account id wherever one is known — it is stable even if the
 * student renames themselves. A display name is the accepted fallback for older
 * records that never stored an id; two students sharing a name then share a
 * face, which their names still tell apart.
 *
 * An empty key returns the first seed rather than throwing: a missing id is a
 * normal state (a competition posted before sign-in existed), and a broken
 * avatar is not worth a crash.
 */
export function avatarSeedFor(key: string): string {
  if (!key) return AVATAR_SEEDS[0];
  return AVATAR_SEEDS[hash(key) % AVATAR_SEEDS.length];
}
