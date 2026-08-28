import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import { toKhmerDigits } from "@/utils/khmer-num";
import { StatBar } from "@/components/shell/stat-bar";
import { SubjectArt } from "./subject-art";
import { SessionNode } from "./session-node";
import { SUBJECT_STYLE } from "../subject-styles";
import type { SubjectMeta } from "../subjects";
import type { PathLesson } from "../sessions";
import { allSessions, chaptersFor, pathProgress, sessionStatus } from "../sessions";

/**
 * A subject's session path — what a student sees after tapping a subject card.
 *
 * Modelled on Duolingo/Mimo: a winding trail of short sessions rather than one
 * long lesson page. The reference for this screen was a dark space-themed game
 * map; the STRUCTURE was taken (winding path, numbered nodes, locks, a stat bar)
 * and the LOOK deliberately was not — it renders in the app's own identity, in
 * the subject's own colour, and works in light and dark like every other screen.
 *
 * Specifically NOT copied from the reference, all deliberate: the starfield, the
 * planet artwork, the two side rails of icon buttons, the premium badge, the
 * mascot, and the keys/energy/gems currency bar. The stat bar here shows only
 * what the app genuinely tracks — see StatBar.
 *
 * KHMER-ONLY, like the rest of the Study feature. See LESSONS_PAGE_LANG.
 */

/**
 * Where each node's CENTRE sits, as a percentage across the column. Cycling
 * through these is what makes the trail snake rather than run straight down.
 *
 * This array is the single source of truth for the layout: the node is placed at
 * its percentage and the connector is drawn between two of them, so the curve
 * always lands exactly on the circles. Drawing the connector from a separate
 * fixed path is what made the first version look like a broken trail.
 *
 * Bounds matter, and they have already moved once. The widest part of a node is
 * its LABEL BLOCK, not the disc — 112px at the 320px floor (w-28) once section
 * titles started rendering — so a centre needs 56px of clearance, which is ~19%
 * of a 288px column. The original 22/78 were computed for a bare 64px disc and
 * would now clip a title off the edge. 30/70 leaves 30px at both ends.
 */
const CENTRES = [30, 50, 70, 50] as const;

const centreAt = (i: number) => CENTRES[i % CENTRES.length];

/**
 * The dashed curve between two consecutive nodes.
 *
 * Drawn in a 0–100 viewBox with `preserveAspectRatio="none"`, so the x values ARE
 * the same percentages the nodes are positioned at and the two cannot drift.
 *
 * A CUBIC with both control points VERTICALLY ALIGNED with their own endpoint —
 * not a quadratic through one midpoint. This is the whole reason the trail looks
 * smooth. A quadratic leaves each endpoint aimed at its single control point,
 * i.e. diagonally, so where one segment ended at a node and the next began, the
 * two tangents disagreed and every node had a visible kink in the line through
 * it. Vertical control points make each segment leave and arrive straight up and
 * down, so consecutive segments share a tangent and read as one continuous
 * snake.
 *
 * The control points sit at 55% rather than 50% of the height, which flattens
 * the curve slightly as it passes a node and keeps the bend in the middle of the
 * gap where there is room for it.
 */
function Connector({ from, to }: { from: number; to: number }) {
  return (
    <svg
      className="h-16 w-full text-purple/35 md:h-20"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={`M ${from} 0 C ${from} 22, ${to} 18, ${to} 40`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="4 7"
        strokeLinecap="round"
        // Without this the 3.5x horizontal / 1.2x vertical stretch that
        // preserveAspectRatio="none" applies would smear the stroke and the dash
        // gaps unevenly along the curve.
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}


/**
 * The mascot slot.
 *
 * A character beside the path is the one part of the Duolingo look that CANNOT
 * be done in CSS, so this is deliberately a hole waiting for artwork rather than
 * something invented here. Drop a file at `public/mascot/idle.webp` and it
 * appears; until then this renders nothing at all.
 *
 * `onError` removing it is what makes "nothing" the default — without it a
 * missing file paints the browser's broken-image glyph. It is
 * `pointer-events-none` and absolutely positioned so it can never sit between a
 * student and a session node, and `sticky` so it rides along as the path
 * scrolls rather than being left at the top.
 *
 * Hidden below md: on a 320px phone the path already uses the full width, and a
 * character parked over it would cover the very nodes it is meant to cheer on.
 */
function Mascot() {
  return (
    <img
      src="/mascot/idle.webp"
      alt=""
      aria-hidden="true"
      loading="lazy"
      onError={(e) => e.currentTarget.remove()}
      className="pointer-events-none sticky bottom-6 left-0 hidden h-28 w-auto select-none md:block"
    />
  );
}

export function SubjectPathView({ subject }: { subject: SubjectMeta }) {
  const completedSessions = useBrachNhaStore((s) => s.completedSessions);
  const c = SUBJECT_STYLE[subject.id];

  const chapters = chaptersFor(subject.id);
  const progress = pathProgress(chapters, completedSessions);

  // The one session the START bubble points at: the first that is playable and
  // not yet finished. Computed across every chapter rather than per chapter, so
  // exactly one bubble can ever render.
  const nextId =
    allSessions(chapters).find(
      (x) => x.href && !completedSessions.includes(x.id)
    )?.id ?? null;
  const pct = progress.total
    ? Math.round((progress.done / progress.total) * 100)
    : 0;

  // WHERE THE PAGE OPENS.
  //
  // A path is long — biology is 43 nodes — so landing at the very top means
  // scrolling past everything already behind you to reach today's work. The page
  // opens at the LESSON in progress, banner first, because the banner is what
  // names the thing about to be done.
  //
  // Two sources, and the order is the point. Normally it is the lesson holding
  // the first unfinished playable session — the same one the START bubble points
  // at, so the landing and the bubble cannot disagree. Until content exists there
  // IS no playable session, and an authored `openHere` marks the lesson being
  // worked on instead. That flag retires itself the moment real content lands,
  // which is why it is the fallback and not an override.
  //
  // TWO SEPARATE PASSES, deliberately, not one loop testing both rules per
  // lesson. Interleaved, an `openHere` on an EARLIER lesson would win over a
  // real unfinished session further down the path — the fallback beating the
  // rule it is supposed to stand in for. Rule 2 may only run once rule 1 has
  // been ruled out across the whole path.
  const lessons = chapters.flatMap((ch) => ch.lessons);
  const landingLesson: PathLesson | null =
    (nextId
      ? lessons.find((l) => l.sessions.some((x) => x.id === nextId))
      : undefined) ??
    lessons.find((l) => l.openHere) ??
    null;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const landingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const target = landingRef.current;
    if (!scroller || !target) return;
    // Instant, never smooth: an animated scroll on first paint reads as the page
    // glitching rather than as a deliberate position. Measured from bounding
    // rects rather than offsetTop so it does not depend on which ancestor
    // happens to be positioned.
    scroller.scrollTop +=
      target.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top -
      8;
  }, [subject.id]);

  return (
    <div className="flex h-full flex-col">
      {/* A back arrow IS correct here, unlike on the Study tab: this is a pushed
          screen rather than a bottom-nav destination. pr-14 clears TopBar's
          floating hamburger, the app's standard header convention. */}
      <div className="shrink-0 px-4 pt-4 pb-3">
        <div className="mb-3 flex items-center justify-between gap-2 pr-14">
          <Link
            to="/lessons"
            aria-label="ត្រឡប់"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-purple/20 bg-purple/8 text-purple transition hover:bg-purple/15"
          >
            <ArrowLeft className="size-4.5" strokeWidth={2.5} />
          </Link>
          <StatBar />
        </div>

        <div
          className={cn(
            "mx-auto flex w-full max-w-md items-center gap-3 rounded-2xl border p-3 shadow-panel",
            c.card
          )}
        >
          <SubjectArt
            subject={subject}
            className="size-16 shrink-0 rounded-xl"
          />
          <div className="min-w-0 flex-1">
            <div className="font-heading truncate text-base font-extrabold text-text">
              {subject.name}
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${pct}%`, backgroundColor: c.fill }}
                />
              </div>
              <span className="shrink-0 text-[10px] font-extrabold text-muted">
                {progress.done}/{progress.total}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* One scroller per screen, as every page in this app owns exactly one —
          AppShell's wrapper is overflow-hidden. pb clears the FAB and BottomNav. */}
      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 lg:pb-10"
      >
        {/* max-w-md, not max-w-2xl: the winding offsets are percentages, so a
            wide column would fling the nodes far apart and break the trail into
            disconnected islands. This is a path, not a reading column. */}
        <div className="mx-auto w-full max-w-md">
          {chapters.flatMap((chapter) =>
            chapter.lessons.map((lesson) => {
              // Per-LESSON. Each widening of this scope hid the bug one level
              // longer: it was whole-path, then per-chapter, and with a single
              // lesson per chapter those two numbers coincide — it would only
              // have surfaced once a real curriculum landed and every banner
              // claimed the same total.
              const done = lesson.sessions.filter(
                (x) => x.href && completedSessions.includes(x.id)
              ).length;

              return (
                <div
                  key={`${chapter.number}.${lesson.number}`}
                  ref={lesson === landingLesson ? landingRef : undefined}
                >
                  {/* A filled banner rather than a hairline divider, which is
                      what gives the path its "unit" feel. It carries the same
                      lip as the nodes, so the page reads as one material.

                      The kicker is the CHAPTER: the curriculum has three levels
                      and the third has to appear somewhere, which is exactly
                      what Duolingo's own unit header does. It used to repeat
                      the subject name, which the card directly above says. */}
                  <div
                    className="mt-8 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-white first:mt-0"
                    style={{
                      backgroundColor: c.fill,
                      boxShadow: `0 4px 0 color-mix(in srgb, ${c.fill} 62%, black)`,
                    }}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[10px] font-bold opacity-80">
                        ជំពូក {toKhmerDigits(chapter.number)}
                        {chapter.title && ` · ${chapter.title}`}
                      </div>
                      <div className="font-heading truncate text-sm font-extrabold">
                        {lesson.title}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-extrabold">
                      {done}/{lesson.sessions.length}
                    </span>
                  </div>

                  {/* pt-10 is not decoration. The first node's START bubble
                      sits at -top-8, so anything less and the bubble collides
                      with the banner it is meant to sit under. */}
                  <div className="pt-10">
                  {lesson.sessions.map((session, i) => {
                    const status = sessionStatus(session, completedSessions);
                    return (
                      <div key={session.id}>
                        {i > 0 && (
                          <Connector from={centreAt(i - 1)} to={centreAt(i)} />
                        )}
                        {/* paddingLeft + -translate-x-1/2 puts the node's CENTRE
                            on its percentage, which is the coordinate the
                            connector is drawn to. Margin alone would place its
                            left edge there and the curve would miss by half a
                            node. */}
                        <div
                          className="flex"
                          style={{ paddingLeft: `${centreAt(i)}%` }}
                        >
                          <div className="-translate-x-1/2">
                            <SessionNode
                              session={session}
                              status={status}
                              subjectId={subject.id}
                              isNext={session.id === nextId}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              );
            })
          )}
          <Mascot />
        </div>
      </div>
    </div>
  );
}
