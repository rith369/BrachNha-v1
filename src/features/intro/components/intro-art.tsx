import type { IntroSlide } from "../copy";
import { ACCENT, TONE_TEXT, glow } from "../styles";
import { cn } from "@/utils/cn";

/**
 * The picture at the top of each intro screen, built from CSS and Lucide
 * glyphs rather than an image: zero bytes to download, correct in both themes,
 * and the same visual language as the rest of the app (the disc sits on the
 * same hard-offset "lip" as the path nodes).
 *
 * Four layers, back to front: a soft halo, a slowly turning dashed orbit, a
 * faint inner ring, and the filled disc with the hero glyph. Four small tiles
 * float around it. Only transform loops, and both are in globals.css's
 * reduced-motion block.
 */

/** Where the four floating tiles sit. Fixed, so nothing reflows per slide. */
const ORBIT_SPOTS = [
  "left-[2%] top-[4%]",
  "-right-[2%] top-[20%]",
  "-left-[4%] bottom-[18%]",
  "right-[6%] bottom-[0%]",
];

/** Staggers the float so the four tiles do not bob in unison. */
const ORBIT_DELAYS = ["0s", "-1.1s", "-2.3s", "-0.6s"];

export function IntroArt({ slide }: { slide: IntroSlide }) {
  const accent = ACCENT[slide.accent];
  const Hero = slide.hero;

  return (
    <div
      aria-hidden
      className="relative mx-auto size-48 shrink-0 [@media(max-height:680px)]:size-36 lg:size-72 lg:[@media(max-height:680px)]:size-56"
    >
      <div
        className="absolute -inset-[10%] rounded-full"
        style={{ background: glow(accent.glowA, 28) }}
      />
      <div
        className="animate-intro-spin absolute inset-0 rounded-full border-2 border-dashed"
        style={{
          borderColor: `color-mix(in srgb, ${accent.glowA} 40%, transparent)`,
        }}
      />
      <div className="absolute inset-[13%] rounded-full border border-border bg-surface/70" />
      <div
        className="absolute inset-[24%] grid place-items-center rounded-full"
        style={{
          background: accent.fill,
          boxShadow: `0 7px 0 ${accent.lip}, 0 22px 40px -12px ${accent.lip}`,
        }}
      >
        <Hero className="size-[46%] text-on-brand" strokeWidth={1.75} />
      </div>

      {slide.orbit.map(([Icon, tone], i) => (
        <div
          key={i}
          className={cn(
            "animate-intro-float absolute grid size-11 place-items-center rounded-2xl border border-border bg-surface shadow-panel",
            "[@media(max-height:680px)]:size-9",
            ORBIT_SPOTS[i],
          )}
          style={{ animationDelay: ORBIT_DELAYS[i] }}
        >
          <Icon className={cn("size-5", TONE_TEXT[tone])} strokeWidth={2.25} />
        </div>
      ))}
    </div>
  );
}
