import type { CSSProperties } from "react";
import { cn } from "@/utils/cn";

/**
 * The confetti burst, fired once when the daily goal is completed.
 *
 * PARTICLES ARE A FIXED TABLE, not Math.random(). A random burst re-rolls on
 * every render, so a single re-render mid-flight would teleport every particle
 * onto a new path; computing it once at module scope also means the same
 * satisfying shape every time rather than an occasional dud where six of the
 * fourteen happen to go the same way.
 *
 * Offsets are polar — an angle and a radius, resolved to dx/dy here — with an
 * upward bias, because a burst that spreads evenly in all directions reads as
 * an explosion and one that leans up reads as celebration. Nothing travels more
 * than 96px from centre: the card is at least 256px wide at the 320px floor, so
 * the burst stays inside it and cannot widen the page. That matters —
 * scripts/shots.mjs treats a sideways-scrolling page as a hard failure.
 *
 * Colours come from the per-theme `--color-*` scale, not `--brand-*`. These are
 * small shapes sitting on a surface rather than fills under white text, which
 * is what makes them correct in dark mode with no `dark:` override.
 */
interface Particle {
  dx: number;
  dy: number;
  rot: number;
  delay: number;
  tone: string;
  round?: boolean;
  small?: boolean;
}

const PARTICLES: Particle[] = [
  { dx: -8, dy: -96, rot: -150, delay: 0, tone: "bg-yellow" },
  { dx: 41, dy: -71, rot: 120, delay: 40, tone: "bg-pink", round: true },
  { dx: 90, dy: -52, rot: -90, delay: 20, tone: "bg-purple" },
  { dx: 73, dy: -10, rot: 200, delay: 90, tone: "bg-mint", small: true },
  { dx: 87, dy: 28, rot: -60, delay: 60, tone: "bg-blue", round: true },
  { dx: 52, dy: 58, rot: 160, delay: 110, tone: "bg-yellow", small: true },
  { dx: 14, dy: 67, rot: -200, delay: 30, tone: "bg-pink" },
  { dx: -27, dy: 84, rot: 80, delay: 100, tone: "bg-purple", round: true },
  { dx: -55, dy: 50, rot: -130, delay: 50, tone: "bg-mint" },
  { dx: -95, dy: 25, rot: 190, delay: 80, tone: "bg-blue", small: true },
  { dx: -66, dy: -55, rot: -70, delay: 10, tone: "bg-pink", round: true },
  { dx: -33, dy: -62, rot: 140, delay: 120, tone: "bg-yellow" },
  { dx: -78, dy: -17, rot: -180, delay: 70, tone: "bg-purple", small: true },
  { dx: 94, dy: 14, rot: 100, delay: 15, tone: "bg-mint", round: true },
];

/**
 * Renders nothing until `active`. The caller mounts it inside the hero card's
 * `relative` wrapper and clears `active` on a timer, which unmounts the
 * particles rather than leaving fourteen finished animations parked in the DOM.
 *
 * `aria-hidden` and `pointer-events-none`: this is decoration over a card that
 * has a real button in it, and it must not be announced or swallow a tap. The
 * words a screen reader needs are in the header's own live status line.
 */
export function CelebrationAnimation({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* Anchored to the centre of the card, which is where the flame sits, so
          the burst appears to come out of it. */}
      <div className="absolute top-1/2 left-1/2">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className={cn(
              "animate-streak-confetti absolute",
              p.small ? "size-1.5" : "size-2",
              p.round ? "rounded-full" : "rounded-[2px]",
              p.tone
            )}
            style={
              {
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
                "--rot": `${p.rot}deg`,
                animationDelay: `${p.delay}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
