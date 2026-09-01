import { Check, Lock, Zap } from "lucide-react";
import { cn } from "@/utils/cn";
import { SUBJECT_STYLE } from "@/features/lessons/subject-styles";
import type { SubjectId } from "@/features/lessons/subjects";
import type { QuizPathNode as QuizPathNodeData } from "../quiz-path";

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
 * EVERY NODE HERE IS A PLAIN, NON-INTERACTIVE BLOCK, regardless of status —
 * including "done" and "current". This renders quiz-path.ts's fixed SAMPLE
 * data, and there is nothing behind any of these ids yet. A tappable node that
 * leads nowhere is exactly the broken-app pattern this codebase avoids
 * everywhere else (subject-card.tsx's zero-lesson tile,
 * practice-subject-card.tsx's now-fixed empty tile). Once real content lands at
 * these ids, this becomes a <Link> the way SessionNode already is.
 */

const STATUS_LABEL: Record<QuizPathNodeData["status"], string> = {
  done: "បញ្ចប់",
  current: "បន្ទាប់",
  locked: "ចាក់សោ",
};

export function QuizPathNode({
  node,
  subjectId,
}: {
  node: QuizPathNodeData;
  subjectId: SubjectId;
}) {
  const c = SUBJECT_STYLE[subjectId];
  const locked = node.status === "locked";
  const done = node.status === "done";
  const current = node.status === "current";

  const Icon = done ? Check : locked ? Lock : Zap;

  // A finished node steps back in colour — same rule as SessionNode — so the
  // trail reads as ground already covered, not a row of equal buttons.
  const fill = done
    ? `color-mix(in srgb, ${c.fill} 45%, var(--color-surface))`
    : c.fill;
  const lip = done
    ? `color-mix(in srgb, ${c.fill} 32%, var(--color-surface))`
    : `color-mix(in srgb, ${c.fill} 62%, black)`;

  return (
    // relative: the START bubble below is absolutely positioned against THIS
    // wrapper, not the page, so it cannot push the node down and break the
    // connector geometry — the same reason session-node.tsx's wrap is relative.
    <div className="relative">
      {current && (
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

      <div
        role="img"
        aria-label={`ជំពូក ${node.chapterNumber} · ${node.title} — ${STATUS_LABEL[node.status]}`}
        className={cn(
          "flex size-16 shrink-0 items-center justify-center rounded-2xl md:size-18",
          locked
            ? "border-2 border-dashed border-muted/40 bg-control text-muted"
            : "text-white"
        )}
        style={
          locked
            ? undefined
            : { backgroundColor: fill, boxShadow: `0 5px 0 ${lip}` }
        }
      >
        <Icon
          className={cn("size-6 md:size-7", !locked && !done && "fill-current")}
          strokeWidth={done ? 3.25 : locked ? 2.75 : 0}
        />
      </div>
    </div>
  );
}
