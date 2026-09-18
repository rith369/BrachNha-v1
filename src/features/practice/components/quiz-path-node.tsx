import { Link } from "react-router";
import { Check, Zap } from "lucide-react";
import { cn } from "@/utils/cn";
import { SUBJECT_STYLE } from "@/features/lessons/subject-styles";
import type { SubjectId } from "@/features/lessons/subjects";
import type { Session, SessionStatus } from "@/features/lessons/sessions";

/**
 * One stop on the Mimo-style quiz path — a rounded SQUARE badge, deliberately
 * distinct from SessionNode's circular Duolingo-style disc on the lesson path,
 * so the two trails read as two different materials rather than one component
 * recoloured. `session-node.tsx` keeps that same distinction from its own
 * reference image, and this one from a Mimo screenshot, so both should look
 * unmistakably different from each other on screen.
 *
 * THE "LIP" PRESS EFFECT AND THE START BUBBLE ARE KEPT IDENTICAL to
 * SessionNode's, because both are what make either shape read as a physical
 * button on a real path rather than a flat icon on its own: a `0 5px 0`
 * box-shadow (a hard edge, no blur) in a colour mixed TOWARD BLACK — the only
 * mix that stays correct in both themes, since the app's lighter
 * --color-subj-* scale would light a dark-theme button from below — and the
 * same tail-pointing "ចាប់ផ្តើម" pill above whichever node is next. See
 * session-node.tsx for the fuller version of both arguments.
 *
 * A LOCKED NODE LOOKS IDENTICAL TO A PLAYABLE ONE — full colour, same lip, same
 * glyph. This node used to draw locked as a dashed grey outline with a padlock,
 * which was right while the path was six sample nodes and wrong the moment it
 * became a real curriculum: a whole path of dashed grey squares reads as "you
 * can't have this", where a path that already looks finished reads as "this is
 * coming". That is the user's explicit call on the Study path, recorded at
 * length in session-node.tsx, and it applies here for the same reason. The one
 * thing that still separates locked from playable: it renders as a <div>, never
 * a <Link> — a tap must not navigate somewhere empty.
 *
 * WHICH IS WHY THIS IS A <Link> AT ALL NOW. Every node used to be inert, because
 * the path was fixed sample data with nothing behind any id. The path is derived
 * now (see quiz-path.ts): `session.href` is non-null if and only if a quiz is
 * actually written for that section, so the node turns into a real link on its
 * own the day the content lands. Today none is written, so every node is still a
 * <div> — the same end state, reached by a rule instead of by hand.
 */

/** How tall the lip is, and therefore how far the node travels when pressed. */
const LIP = 5;

const STATUS_LABEL: Record<SessionStatus, string> = {
  done: "បញ្ចប់",
  current: "អាចធ្វើបាន",
  locked: "មិនទាន់មាន",
};

export function QuizPathNode({
  session,
  status,
  subjectId,
  isNext,
}: {
  session: Session;
  status: SessionStatus;
  subjectId: SubjectId;
  /** The section a student starts from — gets the START bubble. */
  isNext?: boolean;
}) {
  const c = SUBJECT_STYLE[subjectId];
  const done = status === "done";

  const Icon = done ? Check : Zap;

  // A finished node steps back in colour — same rule as SessionNode — so the
  // trail reads as ground already covered, not a row of equal buttons.
  const fill = done
    ? `color-mix(in srgb, ${c.fill} 45%, var(--color-surface))`
    : c.fill;
  const lip = done
    ? `color-mix(in srgb, ${c.fill} 32%, var(--color-surface))`
    : `color-mix(in srgb, ${c.fill} 62%, black)`;

  const badge = (
    <span
      className={cn(
        "relative flex size-16 items-center justify-center rounded-2xl text-white duration-75 md:size-18",
        // Only a real link presses — a node that sank under a tap that does
        // nothing would be claiming to do something. Same `--lip` handoff
        // session-node.tsx uses: a Tailwind arbitrary value cannot hold a
        // color-mix() with a var() inside it.
        session.href &&
          "transition-[transform,box-shadow] active:translate-y-[5px] active:shadow-[0_0_0_var(--lip)]"
      )}
      style={
        {
          backgroundColor: fill,
          boxShadow: `0 ${LIP}px 0 ${lip}`,
          "--lip": lip,
        } as React.CSSProperties
      }
    >
      <Icon
        className={cn("size-6 md:size-7", !done && "fill-current")}
        strokeWidth={done ? 3.25 : 0}
      />
    </span>
  );

  const label = `${session.label}${session.title ? ` · ${session.title}` : ""} — ${STATUS_LABEL[status]}`;

  return (
    // relative: the START bubble below is absolutely positioned against THIS
    // wrapper, not the page, so it cannot push the node down and break the
    // connector geometry — the same reason session-node.tsx's wrap is relative.
    <div className="relative">
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

      {session.href ? (
        <Link to={session.href} aria-label={label} className="block">
          {badge}
        </Link>
      ) : (
        <div role="img" aria-label={label}>
          {badge}
        </div>
      )}
    </div>
  );
}
