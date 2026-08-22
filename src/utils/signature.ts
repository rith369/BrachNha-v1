// A hand-drawn signature, stored as SVG path data rather than a base64 PNG.
// The store persists to localStorage and already caps chat history for size
// (MAX_CHAT_MSGS / MAX_CONVERSATIONS in lib/store.ts) — a dataURL screenshot of
// a canvas would run to tens of KB, while a simplified path is a couple of KB,
// stays crisp at any render size, and can be tinted with var(--color-purple).

/** Every signature is captured in this coordinate space, so it renders at any
 *  size without the pad and the display having to agree on pixel dimensions. */
export const SIGNATURE_VIEWBOX = { w: 600, h: 200 };

export interface Point {
  x: number;
  y: number;
}
export type Stroke = Point[];

/** Points closer together than this (in viewBox units) are dropped — a finger
 *  fires pointermove far more often than the curve actually changes. */
const MIN_POINT_DISTANCE = 2;

/** Hard ceiling across all strokes, so an idle scribble can't bloat storage. */
const MAX_POINTS = 2500;

/** A path shorter than this is a stray tap, not a signature. */
const MIN_MEANINGFUL_POINTS = 4;

export function shouldKeepPoint(last: Point | undefined, next: Point): boolean {
  if (!last) return true;
  return Math.hypot(next.x - last.x, next.y - last.y) >= MIN_POINT_DISTANCE;
}

export function countPoints(strokes: Stroke[]): number {
  return strokes.reduce((total, stroke) => total + stroke.length, 0);
}

export function isAtPointLimit(strokes: Stroke[]): boolean {
  return countPoints(strokes) >= MAX_POINTS;
}

function round(n: number): string {
  // One decimal is well below the resolution of a fingertip at this scale and
  // roughly halves the stored string versus full float precision.
  return (Math.round(n * 10) / 10).toString();
}

/** Serializes strokes to SVG path data: one "M …" subpath per stroke. */
export function strokesToPath(strokes: Stroke[]): string {
  return strokes
    .filter((stroke) => stroke.length > 0)
    .map((stroke) => {
      const [first, ...rest] = stroke;
      const head = `M${round(first.x)} ${round(first.y)}`;
      // A single-point stroke (a dot — think the tittle on an "i") still needs
      // a segment, otherwise strokeLinecap has nothing to round and it vanishes.
      if (rest.length === 0) return `${head}L${round(first.x)} ${round(first.y)}`;
      return head + rest.map((p) => `L${round(p.x)} ${round(p.y)}`).join("");
    })
    .join("");
}

/** Guards the Commit button: true for an empty pad or an accidental tap. */
export function isBlankSignature(path: string): boolean {
  if (!path.trim()) return true;
  const commands = path.match(/[ML]/g);
  return !commands || commands.length < MIN_MEANINGFUL_POINTS;
}
