import type { IntroSlide, IntroTone } from "./copy";

/**
 * Class strings and fills for the intro, in a .ts rather than beside the
 * components: a non-component export from a .tsx trips oxlint's
 * only-export-components rule (the reason utils/focus-styles.ts exists).
 *
 * Every class is spelled out whole because Tailwind cannot see one assembled
 * at runtime — `text-${tone}` produces no CSS.
 */

/** Icons and labels: the per-theme --color-* scale, lifted in dark. */
export const TONE_TEXT: Record<IntroTone, string> = {
  purple: "text-purple",
  pink: "text-pink",
  blue: "text-blue",
  mint: "text-mint",
  yellow: "text-yellow",
};

/** A tinted tile behind an icon. The /10 tints are correct in both themes. */
export const TONE_TILE: Record<IntroTone, string> = {
  purple: "bg-purple/10 text-purple",
  pink: "bg-pink/10 text-pink",
  blue: "bg-blue/10 text-blue",
  mint: "bg-mint/10 text-mint",
  yellow: "bg-yellow/10 text-yellow",
};

interface Accent {
  /** The artwork's disc: a FILL under a white glyph, so the --brand-* scale. */
  fill: string;
  /** Its lip, mixed toward black like the path nodes (see session-node.tsx). */
  lip: string;
  /** The two soft glows behind the page. Per-theme, since they tint a surface. */
  glowA: string;
  glowB: string;
  kicker: string;
}

export const ACCENT: Record<IntroSlide["accent"], Accent> = {
  brand: {
    fill: "linear-gradient(135deg, var(--brand-pink), var(--brand-purple))",
    lip: "color-mix(in srgb, var(--brand-purple) 55%, black)",
    glowA: "var(--color-purple)",
    glowB: "var(--color-pink)",
    kicker: "bg-purple/10 text-purple",
  },
  ocean: {
    fill: "linear-gradient(135deg, var(--brand-blue), var(--brand-purple))",
    lip: "color-mix(in srgb, var(--brand-purple) 55%, black)",
    glowA: "var(--color-blue)",
    glowB: "var(--color-mint)",
    kicker: "bg-blue/10 text-blue",
  },
  flame: {
    fill: "linear-gradient(135deg, var(--brand-flame-from), var(--brand-flame-to))",
    lip: "color-mix(in srgb, var(--brand-flame-to) 55%, black)",
    // Pink leads, not yellow: a yellow glow over the dark background turns
    // olive-brown. Yellow stays as the smaller second glow.
    glowA: "var(--color-pink)",
    glowB: "var(--color-yellow)",
    kicker: "bg-pink/10 text-pink",
  },
};

/** A soft radial glow, drawn as a gradient rather than a blur filter. */
export function glow(color: string, strength: number): string {
  return `radial-gradient(closest-side, color-mix(in srgb, ${color} ${strength}%, transparent), transparent)`;
}
