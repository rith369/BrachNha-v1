import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Variants,
} from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/shell/wordmark";
import { cn } from "@/utils/cn";
import { INTRO_SKIP, INTRO_SLIDES, type IntroSlide } from "../copy";
import { ACCENT, TONE_TILE, glow } from "../styles";
import { IntroArt } from "./intro-art";

/**
 * Three "why science" screens, shown once per device, then straight to Home as
 * a guest (there is no entry screen). Rendered by AppShell's gate rather than a
 * route, like LoginView and SurveyView — see the gate in components/shell/app-shell.tsx for exactly
 * who sees it.
 *
 * Four ways forward, all ending in the same `go()`: the big button, a
 * horizontal swipe, the arrow keys, and the progress dots. Only the button
 * FINISHES the intro (or រំលង, which skips it) — a swipe past the last screen
 * does nothing, so nobody leaves by accident mid-gesture.
 *
 * `lang="km"` on the root: the page is Khmer whatever the UI language, and the
 * attribute is what lets the browser pick Khmer line-breaking and fonts.
 */

/** How far a horizontal drag must travel before it counts as a swipe. */
const SWIPE_PX = 60;

const EASE = [0.22, 1, 0.36, 1] as const;

// Direction-aware: the new screen comes in from the side the student is
// moving towards. `custom` carries +1 (forward) or -1 (back).
const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir * 48, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: EASE, staggerChildren: 0.06 },
  },
  exit: (dir: number) => ({
    x: dir * -48,
    opacity: 0,
    transition: { duration: 0.18, ease: "easeIn" },
  }),
};

const itemVariants: Variants = {
  enter: { y: 14, opacity: 0 },
  center: { y: 0, opacity: 1, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0 },
};

export function IntroView({ onDone }: { onDone: () => void }) {
  const [[index, dir], setPage] = useState<[number, number]>([0, 1]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const total = INTRO_SLIDES.length;
  const slide = INTRO_SLIDES[index];
  const last = index === total - 1;
  const accent = ACCENT[slide.accent];

  function go(next: number) {
    if (next < 0 || next >= total || next === index) return;
    setPage([next, next > index ? 1 : -1]);
    // One scroller serves all three screens, and swapping its children does
    // not touch scrollTop — the focus-layout lesson. Instant, never smooth.
    scrollRef.current?.scrollTo({ top: 0 });
  }

  function onPrimary() {
    if (last) onDone();
    else go(index + 1);
  }

  // Arrow keys for a laptop. Steps only, never finishes, same as a swipe.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && index < total - 1) {
        setPage([index + 1, 1]);
      } else if (e.key === "ArrowLeft" && index > 0) {
        setPage([index - 1, -1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, total]);

  return (
    <MotionConfig reducedMotion="user">
      <div
        lang="km"
        className="relative flex h-full w-full flex-col overflow-hidden bg-bg"
      >
        {/* ── Background: two soft glows that crossfade with the screen, over
            the quiz path's dot grid. Gradients rather than blur filters, so
            nothing here is repainted while the screen animates. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--color-border) 1.2px, transparent 1.2px)",
              backgroundSize: "22px 22px",
              maskImage:
                "radial-gradient(ellipse at 50% 35%, black 20%, transparent 75%)",
            }}
          />
          <AnimatePresence initial={false}>
            <motion.div
              key={slide.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.6 } }}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
            >
              <div
                className="absolute -top-[20%] -left-[30%] size-[90%] rounded-full"
                style={{ background: glow(accent.glowA, 22) }}
              />
              <div
                className="absolute -right-[30%] -bottom-[15%] size-[85%] rounded-full"
                style={{ background: glow(accent.glowB, 18) }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Header: the name, and a way out. */}
        <div className="relative flex shrink-0 items-center justify-between px-5 pt-5 md:px-8 md:pt-6">
          <Wordmark />
          {/* Kept in the layout on the last screen (invisible) so the header
              does not shift as it disappears. */}
          <button
            onClick={onDone}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-bold text-muted transition hover:text-purple",
              last && "invisible",
            )}
            tabIndex={last ? -1 : 0}
          >
            {INTRO_SKIP}
          </button>
        </div>

        {/* ── The screen itself. Scrolls on a short phone; centred otherwise. */}
        <div
          ref={scrollRef}
          className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
          // A short fade at the bottom edge, so a screen taller than the phone
          // reads as "more below" rather than as text sliced by the footer.
          style={{
            maskImage:
              "linear-gradient(to bottom, black calc(100% - 28px), transparent)",
          }}
        >
          <div className="flex min-h-full flex-col justify-center px-5 pt-5 pb-7 md:px-8">
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.div
                key={slide.id}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="mx-auto w-full max-w-md lg:max-w-4xl"
              >
                {/* The drag lives on an inner element so it never fights the
                    slide-in animation over the same `x`. */}
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  dragSnapToOrigin
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -SWIPE_PX) go(index + 1);
                    else if (info.offset.x > SWIPE_PX) go(index - 1);
                  }}
                  className="cursor-grab touch-pan-y active:cursor-grabbing"
                >
                  <SlideBody slide={slide} kickerClass={accent.kicker} />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Footer: where you are, and the one big button. */}
        <div className="relative shrink-0 px-5 pt-2 pb-6 md:px-8 md:pb-8">
          {/* On a laptop this sits under the TEXT column of the two-column
              layout: the right half, less half the gap (lg:gap-14 → pl-7). */}
          <div className="mx-auto w-full max-w-md lg:max-w-4xl">
            <div className="lg:ml-auto lg:w-1/2 lg:pl-7">
              <div className="mb-4 flex items-center justify-center gap-3 lg:justify-start">
                <div className="flex items-center gap-1.5">
                  {INTRO_SLIDES.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => go(i)}
                      aria-label={`${i + 1} / ${total}`}
                      aria-current={i === index ? "step" : undefined}
                      className="grid h-6 place-items-center px-0.5"
                    >
                      <span
                        className={cn(
                          "block h-2 rounded-full transition-all duration-300",
                          i === index ? "w-7 bg-brand" : "w-2 bg-border",
                        )}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-extrabold tracking-wider text-muted tabular-nums">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(total).padStart(2, "0")}
                </span>
              </div>

              <div className="flex items-stretch gap-3">
                {index > 0 && (
                  <button
                    onClick={() => go(index - 1)}
                    aria-label="ថយក្រោយ"
                    className="grid w-14 shrink-0 place-items-center rounded-2xl border border-border bg-surface text-muted shadow-panel-sm transition hover:text-purple active:scale-95"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                )}
                {/* The app's primary CTA on the path nodes' hard lip, pressed
                  flush into it on tap. */}
                <button
                  onClick={onPrimary}
                  className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 text-base font-extrabold text-on-brand shadow-[0_5px_0_color-mix(in_srgb,var(--brand-purple)_55%,black)] transition-[transform,box-shadow] active:translate-y-[5px] active:shadow-none"
                >
                  <span>{slide.cta}</span>
                  <ArrowRight className="size-5 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

function SlideBody({
  slide,
  kickerClass,
}: {
  slide: IntroSlide;
  kickerClass: string;
}) {
  return (
    // One column on a phone and tablet; from lg the picture moves beside the
    // text, which is what lets the tallest screen fit an 800px laptop.
    <div className="text-center lg:grid lg:grid-cols-2 lg:items-center lg:gap-14 lg:text-left">
      <motion.div variants={itemVariants} className="mb-5 lg:mb-0">
        <IntroArt slide={slide} />
      </motion.div>

      <div>
        {slide.kicker && (
          <motion.div variants={itemVariants} className="mb-3">
            <span
              className={cn(
                "inline-block rounded-full px-3.5 py-1 text-sm font-extrabold",
                kickerClass,
              )}
            >
              {slide.kicker}
            </span>
          </motion.div>
        )}

        {/* Generous line-height and a little bottom padding: bg-clip-text paints
          only inside the box, and Khmer subscripts hang below the baseline. */}
        <motion.h1
          variants={itemVariants}
          className="mb-2 bg-clip-text pb-1 font-heading text-[26px] leading-[1.5] font-extrabold text-transparent md:text-3xl md:leading-[1.5]"
          // The per-theme --color-* scale, NOT bg-brand-tri: this is text, and
          // the brand purple is ~2.7:1 on the dark background.
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--color-pink), var(--color-purple), var(--color-blue))",
          }}
        >
          {slide.title}
        </motion.h1>

        {slide.lead.map((p) => (
          <motion.p
            key={p}
            variants={itemVariants}
            className="mx-auto max-w-md text-[15px] lg:mx-0 leading-[1.85] font-semibold text-muted"
          >
            {p}
          </motion.p>
        ))}

        {slide.points && slide.pointsLayout === "grid" && (
          <motion.div
            variants={itemVariants}
            className="mt-4 grid grid-cols-2 gap-2.5 text-left"
          >
            {slide.points.map((pt) => (
              <div
                key={pt.label}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3 shadow-panel-sm"
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-xl",
                    TONE_TILE[pt.tone],
                  )}
                >
                  <pt.icon className="size-5" strokeWidth={2.25} />
                </span>
                <span className="text-sm leading-[1.6] font-bold [overflow-wrap:anywhere] text-text">
                  {pt.label}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {slide.points && slide.pointsLayout === "steps" && (
          <motion.ol
            variants={itemVariants}
            className="mx-auto mt-4 flex max-w-md flex-col lg:mx-0 gap-2.5 text-left"
          >
            {slide.points.map((pt, i) => (
              <li
                key={pt.label}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-panel-sm"
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl",
                    TONE_TILE[pt.tone],
                  )}
                >
                  <pt.icon className="size-5" strokeWidth={2.25} />
                </span>
                <span className="flex-1 text-sm leading-[1.6] font-bold [overflow-wrap:anywhere] text-text">
                  {pt.label}
                </span>
                <span className="text-xs font-extrabold text-muted tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </li>
            ))}
          </motion.ol>
        )}

        {slide.outro?.map((p) => (
          <motion.p
            key={p}
            variants={itemVariants}
            className="mx-auto mt-3.5 max-w-md lg:mx-0 text-[15px] leading-[1.85] font-bold text-text"
          >
            {p}
          </motion.p>
        ))}
      </div>
    </div>
  );
}
