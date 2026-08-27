import { Link } from "react-router";
import { BookOpen, Clock, Play } from "lucide-react";
import { cn } from "@/utils/cn";
import { SUBJECT_STYLE } from "../subject-styles";
import { SubjectArt } from "./subject-art";
import {
  MINUTES_PER_LESSON,
  firstLessonId,
  lessonCountFor,
  type SubjectId,
  type SubjectMeta,
} from "../subjects";

function Meta({ count, id }: { count: number; id: SubjectId }) {
  const tone = SUBJECT_STYLE[id].text;
  return (
    <div className="flex items-center gap-3 text-[10px] font-bold text-muted md:text-xs">
      <span className="flex items-center gap-1">
        <BookOpen className={cn("size-3 shrink-0", tone)} strokeWidth={2.5} />
        {count} មេរៀន
      </span>
      <span className="flex items-center gap-1">
        <Clock className={cn("size-3 shrink-0", tone)} strokeWidth={2.5} />
        {count * MINUTES_PER_LESSON} នាទី
      </span>
    </div>
  );
}

/**
 * One subject tile.
 *
 * A subject with no lessons yet renders as a plain <div>, dimmed, with a
 * "ឆាប់ៗនេះ" chip and no play button — NOT a disabled Link. Same precedent as
 * sidebar-nav.tsx's `href: null` rows and the survey's StudiedStep: a control
 * that answers a tap with silence reads as broken, so it must not look tappable.
 * Most subjects are in this state today.
 */
export function SubjectCard({ subject }: { subject: SubjectMeta }) {
  const c = SUBJECT_STYLE[subject.id];
  const count = lessonCountFor(subject.id);
  const href = firstLessonId(subject.id);

  const body = (
    <>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="font-heading min-w-0 text-sm font-extrabold text-text md:text-base">
          {subject.name}
        </div>
        {href && (
          // The ONE place the supplied hex is used as-is: a solid fill with a
          // white glyph on it, which is the role that palette was picked for.
          // Inline style rather than a class because --subject-* is deliberately
          // not mapped into @theme — see globals.css.
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-white shadow-panel-sm"
            style={{ backgroundColor: c.fill }}
          >
            <Play className="size-3 fill-current" strokeWidth={0} />
          </span>
        )}
      </div>

      <SubjectArt subject={subject} />

      <p className="mt-2 line-clamp-2 text-[11px] font-semibold text-muted md:text-xs">
        {subject.blurb}
      </p>

      <div className="mt-2">
        {count > 0 ? (
          <Meta count={count} id={subject.id} />
        ) : (
          <span className="inline-block rounded-full bg-surface/70 px-2 py-0.5 text-[10px] font-extrabold text-muted">
            ឆាប់ៗនេះ
          </span>
        )}
      </div>
    </>
  );

  // break-inside-avoid: the grid is CSS multi-column, so without this a card
  // can be sliced across the column boundary mid-render.
  const shell = cn(
    "mb-3 block break-inside-avoid rounded-2xl border p-3 shadow-panel",
    c.card
  );

  if (!href) {
    return <div className={cn(shell, "opacity-60")}>{body}</div>;
  }

  return (
    <Link to={`/lessons/${href}`} className={cn(shell, "transition hover:brightness-[1.03]")}>
      {body}
    </Link>
  );
}
