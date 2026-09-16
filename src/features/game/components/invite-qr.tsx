import { encode } from "uqr";

/**
 * A scannable QR code for a competition's invite link.
 *
 * ── THIS FILE IS THE LAZY BOUNDARY ─────────────────────────────────────────
 *
 * It is the ONLY module that imports `uqr`, and its caller reaches it through
 * React.lazy — so the encoder downloads when a student taps Invite and never
 * before. Same boundary KaTeX, MathLive and three.js already sit behind, and it
 * breaks the same way: one static import of this file from anywhere collapses
 * `uqr` into the entry chunk, silently, with only the build output to show it.
 * CHECK `dist/assets/` STILL HAS ITS OWN invite-qr CHUNK after touching this.
 *
 * ── WHY A LIBRARY AT ALL, WHEN image-compress.ts REFUSED ONE ───────────────
 *
 * Because the platform does not do this. A browser can decode and re-encode a
 * photograph, which is why compressing one needed no dependency; nothing in a
 * browser generates a QR code. Doing it by hand means Reed-Solomon error
 * correction — roughly 400 lines of finicky polynomial arithmetic over GF(256)
 * — which is exactly the kind of code to take from someone who has tested it.
 *
 * `uqr` rather than `qrcode`, which is the popular one: that package depends on
 * `yargs` and `pngjs` for its Node command-line tool, and a terminal argument
 * parser has no business in a bundle served to a phone. uqr is MIT, has ZERO
 * dependencies, ships its own types, and hands back a raw module matrix.
 */

/**
 * THE QUIET ZONE IS PART OF THE CODE, NOT PADDING AROUND IT. The spec requires
 * four clear modules on every side; scanners use it to find the symbol's edges,
 * and without it many simply never lock on. uqr defaults this to 1, so it has to
 * be passed — the default is the one thing here that looks safe and is not.
 */
const QUIET_ZONE = 4;

/**
 * Error correction "M" (15%), NOT the highest available.
 *
 * Higher levels are tempting and wrong here: every step up adds modules, so the
 * same link is drawn at a finer pitch in the same space — which makes the code
 * HARDER for a phone camera to resolve, not easier. A screen is a clean, lit,
 * undamaged surface; it needs no more than M. Redundancy is for print that gets
 * creased and dirty.
 */
const ECC = "M" as const;

export function InviteQr({ url }: { url: string }) {
  const qr = encode(url, { ecc: ECC, border: QUIET_ZONE });

  // ONE PATH, NOT ONE RECT PER MODULE. A link this long lands around 33x33, so
  // a rect apiece is ~500 DOM nodes for a single graphic. Each dark module
  // contributes a closed 1x1 subpath, which the renderer fills as one shape.
  let d = "";
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.data[y][x]) d += `M${x} ${y}h1v1h-1z`;
    }
  }

  return (
    // DARK-ON-WHITE IN BOTH THEMES, AND THIS IS THE ONE PLACE IN THE APP THAT
    // DELIBERATELY IGNORES THE THEME TOKENS. A QR code is a machine-readable
    // target rather than a themed graphic: the spec assumes dark modules on a
    // light ground, and while many modern scanners cope with an inverted code,
    // plenty of older ones do not. So it keeps its own white card on the dark
    // theme instead of inheriting `bg-surface`. Don't "fix" this to match.
    <div className="rounded-2xl bg-white p-3 shadow-panel-sm">
      <svg
        viewBox={`0 0 ${qr.size} ${qr.size}`}
        // The intrinsic grid is tiny, so the browser would smooth it into grey
        // mush when scaled up. crispEdges keeps every module a hard square,
        // which is the whole basis of the contrast a scanner reads.
        shapeRendering="crispEdges"
        className="block h-auto w-full"
        role="img"
        aria-label={url}
      >
        {/* The quiet zone is already inside the matrix as false modules, so the
            white ground has to cover the full viewBox rather than the code. */}
        <rect width={qr.size} height={qr.size} fill="#ffffff" />
        <path d={d} fill="#000000" />
      </svg>
    </div>
  );
}
