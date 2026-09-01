import { Link } from "react-router";
import { Layers, ListChecks } from "lucide-react";
import { cn } from "@/utils/cn";
import { toKhmerDigits } from "@/utils/khmer-num";
import { SUBJECT_STYLE } from "@/features/lessons/subject-styles";
import { SubjectArt } from "@/features/lessons/components/subject-art";
import type { SubjectMeta } from "@/features/lessons/subjects";
import { readyLessonCount, type PracticeMode } from "../practice";
import { quizPathFor } from "../quiz-path";

/**
 * One subject tile on the practice hub.
 *
 * A THIRD subject card, beside Study's subject-card.tsx and the exam page's
 * past-paper-card.tsx. Those two already coexist rather than sharing one
 * configurable component, because each screen wants a different shell, a
 * different action and a different count; this follows that precedent instead of
 * growing a third set of props on either. What IS shared is what should be:
 * SubjectArt and SUBJECT_STYLE, imported from features/lessons — the same
 * cross-feature direction as Profile reusing Home's StatPills.
 *
 * A SUBJECT WITH NOTHING WRITTEN IS A PLAIN <div>, dimmed, with a ឆាប់ៗនេះ chip
 * and no mode badge — never a <Link>. Same rule as subject-card.tsx's
 * zero-lesson tile (which this card is deliberately modelled on), the survey's
 * StudiedStep and sidebar-nav.tsx's `href: null` rows: a control that answers a
 * tap with silence reads as broken, so it must not look tappable.
 *
 * This card shipped tappable-when-empty for one revision, borrowing the
 * past-paper-card departure on the grounds that the tap was "not silent" —
 * it landed on a lesson list. That was overruled, and correctly: a screen of
 * rows that are themselves all pending is silence with extra steps, and the two
 * subject grids in the app now behave identically instead of one being the
 * exception. Don't "restore" it for the plain lesson list.
 *
 * ONE DELIBERATE EXCEPTION: a subject with a `quizPathFor()` entry stays
 * tappable on Quiz even at zero real lesson content, because unlike the plain
 * list it does NOT land on a screen of rows that are themselves all pending —
 * it lands on the Mimo-style path (see quiz-path-view.tsx), which is a finished
 * screen with real content to look at (colour, progress, a trail of nodes), even
 * though the nodes on it are still a design sample. The tap is not silent, so
 * the "nothing empty is tappable" rule does not apply to it — the same logic
 * that keeps PastPaperCard tappable on an empty paper. Physics is the only
 * subject in this state today; it opens up automatically for any subject added
 * to QUIZ_PATHS in ../quiz-path, no second flag to set here.
 *
 * The count is lessons with content IN THIS MODE, so switching tabs can change
 * both the number and whether the tile is tappable — a subject may have a quiz
 * written and no deck.
 */
export function PracticeSubjectCard({
  subject,
  mode,
}: {
  subject: SubjectMeta;
  mode: PracticeMode;
}) {
  const style = SUBJECT_STYLE[subject.id];
  const ready = readyLessonCount(subject.id, mode);
  const preview = mode === "quiz" && quizPathFor(subject.id) !== null;
  const openable = ready > 0 || preview;
  const Icon = mode === "flashcards" ? Layers : ListChecks;

  const body = (
    <>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="font-heading min-w-0 text-sm font-extrabold text-text md:text-base">
          {subject.name}
        </div>
        {/* The badge is the tile's only affordance, so it appears only when the
            tile is actually tappable — the same pairing subject-card.tsx makes
            with its play button. The ONE place the supplied hex is used as-is:
            a solid fill under a white glyph, the role that palette was picked
            for. Inline style rather than a class because --subject-* is
            deliberately not mapped into @theme — see subject-styles.ts. */}
        {openable && (
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-white shadow-panel-sm"
            style={{ backgroundColor: style.fill }}
          >
            <Icon className="size-3.5" strokeWidth={2.5} />
          </span>
        )}
      </div>

      <SubjectArt subject={subject} />

      <div className="mt-2">
        {ready > 0 ? (
          <span
            className={cn(
              "flex items-center gap-1 text-[10px] font-bold md:text-xs",
              style.text
            )}
          >
            <Icon className="size-3 shrink-0" strokeWidth={2.5} />
            {toKhmerDigits(ready)} មេរៀន
          </span>
        ) : preview ? (
          // Distinct from both the real-count chip above and the dimmed
          // ឆាប់ៗនេះ below: this tile IS tappable, but honestly says what's
          // behind it is a look, not a finished lesson set yet.
          <span
            className={cn(
              "flex items-center gap-1 text-[10px] font-bold md:text-xs",
              style.text
            )}
          >
            <Icon className="size-3 shrink-0" strokeWidth={2.5} />
            គំរូការរចនា
          </span>
        ) : (
          <span className="inline-block rounded-full bg-surface/70 px-2 py-0.5 text-[10px] font-extrabold text-muted">
            ឆាប់ៗនេះ
          </span>
        )}
      </div>
    </>
  );

  // break-inside-avoid: the grid is CSS multi-column, so without this a card can
  // be sliced across the column boundary mid-render.
  const shell = cn(
    "mb-3 block break-inside-avoid rounded-2xl border p-3 shadow-panel",
    style.card
  );

  if (!openable) {
    return <div className={cn(shell, "opacity-60")}>{body}</div>;
  }

  return (
    <Link
      to={`/practice/${mode}/${subject.id}`}
      className={cn(shell, "transition hover:brightness-[1.03]")}
    >
      {body}
    </Link>
  );
}
