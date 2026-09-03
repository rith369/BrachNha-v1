import { Link } from "react-router";
import { Check, Play } from "lucide-react";
import { cn } from "@/utils/cn";
import { SUBJECT_STYLE } from "../subject-styles";
import type { SubjectId } from "../subjects";
import type { Session, SessionStatus } from "../sessions";

/**
 * One stop on a subject's path.
 *
 * THE "LIP" IS THE WHOLE LOOK. A Duolingo-style node is a solid disc sitting on
 * a darker slab of the same colour, so it reads as a physical button standing
 * proud of the page, and it presses INTO that slab when tapped. That is the one
 * visual cue doing most of the work here, and it is pure CSS — no artwork.
 *
 * It is built from a `0 Npx 0` box-shadow (a hard offset with no blur, so it
 * reads as an edge rather than a shadow) plus a translate on :active that moves
 * the disc down by exactly the amount the lip shrinks. Both properties are
 * compositor-friendly, which matters because these sit on a scrolling page —
 * see the animation rules in globals.css.
 *
 * The lip colour is `color-mix(... black)` rather than the app's darkened
 * `--color-subj-*` scale ON PURPOSE: that scale is *lighter* than the fill in
 * dark mode, which would make the button look lit from below. Mixing toward
 * black is the only rule that stays correct in both themes.
 *
 * LOCKED NODES LOOK IDENTICAL TO A PLAYABLE ONE — full colour, Play icon, the
 * same lip — on the user's explicit request: a path of dashed grey circles with
 * lock icons reads as "you can't have this," while a path that already looks
 * finished reads as "this is coming," which is the impression wanted even
 * before any section has content. This is a deliberate, requested exception to
 * the app's general rule of never letting something look tappable when it
 * isn't (see PracticeLessonList's empty rows, sidebar-nav.tsx's `href: null`
 * rows, the survey's StudiedStep — all of which stay visibly dimmed on
 * purpose). The one thing that still separates a locked node from a real one:
 * it renders as a <div>, never a <Link> — content or not, a tap must not
 * navigate somewhere empty.
 */

/** How tall the lip is, and therefore how far the disc travels when pressed. */
const LIP = 5;

export function SessionNode({
  session,
  status,
  subjectId,
  isNext,
}: {
  session: Session;
  status: SessionStatus;
  subjectId: SubjectId;
  /** The first playable session — gets the START bubble. */
  isNext?: boolean;
}) {
  const c = SUBJECT_STYLE[subjectId];
  const locked = status === "locked";

  const Icon = status === "done" ? Check : Play;

  // A finished node keeps its colour but steps back, so the path reads as a
  // trail of ground already covered rather than a row of equal buttons.
  // Locked nodes deliberately do NOT branch here any more — see the header
  // comment — so they get the same full-colour fill as a playable node.
  const fill =
    status === "done"
      ? `color-mix(in srgb, ${c.fill} 45%, var(--color-surface))`
      : c.fill;
  const lip =
    status === "done"
      ? `color-mix(in srgb, ${c.fill} 32%, var(--color-surface))`
      : `color-mix(in srgb, ${c.fill} 62%, black)`;

  const disc = (
    <span
      className="relative flex size-16 items-center justify-center rounded-full text-white transition-[transform,box-shadow] duration-75 active:translate-y-[5px] active:shadow-[0_0_0_var(--lip)] md:size-18"
      style={
        {
          backgroundColor: fill,
          boxShadow: `0 ${LIP}px 0 ${lip}`,
          "--lip": lip,
        } as React.CSSProperties
      }
    >
      <Icon
        className={cn("size-6 md:size-7", status !== "done" && "fill-current")}
        strokeWidth={status === "done" ? 3.25 : 0}
      />
    </span>
  );

  const body = (
    <>
      {/* The bubble is absolutely positioned so it cannot push the node down and
          break the connector geometry, which is computed from row positions. */}
      {isNext && (
        <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2">
          <span
            className="animate-start-bob relative block rounded-lg px-2.5 py-1 text-[10px] font-extrabold whitespace-nowrap text-white shadow-panel-sm"
            style={{ backgroundColor: c.fill }}
          >
            ចាប់ផ្តើម
            {/* the tail */}
            <span
              className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45"
              style={{ backgroundColor: c.fill }}
            />
          </span>
        </span>
      )}

      {disc}

      <span
        className={cn(
          "mt-2 rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-extrabold shadow-panel-sm md:text-xs",
          c.text
        )}
      >
        {session.label}
      </span>

      {/* The section NAME, not just its number. A Duolingo unit gets away with
          "1, 2, 3" because a student already knows what the unit is; here the
          curriculum titles ARE the screen, so they render. Up to three lines —
          a taller label only pushes the next connector down, and the connector
          is its own fixed-height element between rows, so no geometry breaks. */}
      <span
        className={cn(
          // overflow-wrap:anywhere, not a Tailwind break-* utility: Khmer has
          // no spaces, so a section name is one unbreakable run and would
          // otherwise render as a single line wider than the node's own box.
          "mt-1 line-clamp-3 text-center text-[10px] leading-snug font-bold text-balance text-text [overflow-wrap:anywhere] md:text-[11px]"
        )}
      >
        {session.title}
      </span>
    </>
  );

  const wrap = "relative flex w-28 flex-col items-center md:w-32";

  if (locked) {
    return (
      <div
        className={wrap}
        aria-disabled="true"
        aria-label={`${session.label} ${session.title}`}
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      to={session.href!}
      className={wrap}
      aria-label={`${session.label} ${session.title}`}
    >
      {body}
    </Link>
  );
}
