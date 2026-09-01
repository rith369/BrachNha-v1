import { Link } from "react-router";
import { ChevronLeft, ChevronRight, Layers, ListChecks } from "lucide-react";
import { cn } from "@/utils/cn";
import { toKhmerDigits } from "@/utils/khmer-num";
import { SUBJECT_STYLE } from "@/features/lessons/subject-styles";
import { SubjectArt } from "@/features/lessons/components/subject-art";
import type { SubjectMeta } from "@/features/lessons/subjects";
import { practiceLessonsFor, type PracticeLesson, type PracticeMode } from "../practice";

/**
 * One subject's lessons, for one mode — the middle screen between the hub and a
 * runner.
 *
 * CAPPED AT max-w-2xl. A list read top to bottom is a sequence, and the app puts
 * every one of those in the narrow content column (the leaderboard, the exam
 * tabs, every reading and answering screen) rather than in the widening card
 * grid the hub uses. At 1600px a two-column split would put a lesson name at one
 * end of the screen and its state at the other.
 *
 * It is NOT a focus route: the student is choosing what to do, not mid-task, so
 * the navigation stays — exactly the call /subjects/:subjectId already makes.
 *
 * KHMER-ONLY. See PRACTICE_PAGE_LANG in ../practice.
 */

/** Chapter banner. A titleless chapter shows its number alone — an empty string
 *  is the pending marker in lessons/sessions.ts, and a made-up Khmer title is
 *  worse than none. Prose keeps Khmer numerals, per utils/khmer-num.ts. */
function ChapterKicker({
  number,
  title,
  first,
}: {
  number: number;
  title: string;
  first: boolean;
}) {
  return (
    // `first` is a prop rather than Tailwind's `first:` variant: each kicker is
    // the first child of its own row wrapper, so the CSS pseudo-class would
    // match every one of them and collapse the gap between chapters.
    <div
      className={cn(
        "mb-2 text-xs font-extrabold text-muted md:text-sm",
        first ? "mt-0" : "mt-6"
      )}
    >
      ជំពូក {toKhmerDigits(number)}
      {title && ` · ${title}`}
    </div>
  );
}

function LessonRow({
  lesson,
  subject,
  mode,
}: {
  lesson: PracticeLesson;
  subject: SubjectMeta;
  mode: PracticeMode;
}) {
  const style = SUBJECT_STYLE[subject.id];
  const Icon = mode === "flashcards" ? Layers : ListChecks;
  const unit = mode === "flashcards" ? "កាត" : "សំណួរ";

  const body = (
    <>
      <div className="min-w-0 flex-1">
        {/* The lesson's own title, alone — exactly what subject-path-view.tsx
            renders under a chapter banner, so the two screens name a lesson the
            same way. Prefixing "មេរៀនទី N" here would read "មេរៀនទី ១ · មេរៀនទី ១"
            on every lesson whose real name hasn't been supplied yet, since that
            placeholder title IS its number. */}
        <div className="font-heading truncate text-sm font-extrabold text-text md:text-base">
          {lesson.title}
        </div>
        <div className="mt-1">
          {lesson.count > 0 ? (
            <span
              className={cn(
                "flex items-center gap-1 text-[11px] font-bold md:text-xs",
                style.text
              )}
            >
              <Icon className="size-3 shrink-0" strokeWidth={2.5} />
              {toKhmerDigits(lesson.count)} {unit}
            </span>
          ) : (
            <span className="inline-block rounded-full bg-purple/8 px-2 py-0.5 text-[10px] font-extrabold text-muted">
              ឆាប់ៗនេះ
            </span>
          )}
        </div>
      </div>
      {lesson.count > 0 && (
        <ChevronRight
          className={cn("size-5 shrink-0", style.text)}
          strokeWidth={2.5}
        />
      )}
    </>
  );

  const shell =
    "mb-2.5 flex items-center gap-3 rounded-2xl border border-purple/10 bg-surface p-3.5 shadow-panel";

  // A lesson with nothing written is a plain dimmed <div>, never a disabled
  // <Link>. Same precedent as sidebar-nav.tsx's `href: null` rows, the survey's
  // StudiedStep and subject-card.tsx's zero-lesson tile: a control that answers
  // a tap with silence reads as broken, so it must not look tappable. Every row
  // is in this state today — see data/practice.ts.
  if (lesson.count === 0) {
    return <div className={cn(shell, "opacity-60")}>{body}</div>;
  }

  return (
    <Link
      to={`/practice/${mode}/${subject.id}/${lesson.ref}`}
      className={cn(shell, "transition hover:brightness-[1.03]")}
    >
      {body}
    </Link>
  );
}

export function PracticeLessonList({
  subject,
  mode,
}: {
  subject: SubjectMeta;
  mode: PracticeMode;
}) {
  const lessons = practiceLessonsFor(subject.id, mode);
  const label = mode === "flashcards" ? "Flashcard" : "Quiz";

  // Group by chapter for the kicker, without re-deriving the list: the lessons
  // already arrive in chapter order, so a row heads its chapter iff the row
  // before it belongs to a different one.
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        to="/practice"
        className="mb-3 inline-flex items-center gap-1 text-xs font-extrabold text-muted transition hover:text-text md:text-sm"
      >
        <ChevronLeft className="size-4 shrink-0" strokeWidth={2.5} />
        ការអនុវត្ត
      </Link>

      <div className="mb-4 flex items-center gap-3 pr-14">
        <SubjectArt
          subject={subject}
          className="size-14 shrink-0 rounded-xl md:size-16"
        />
        <div className="min-w-0">
          <div className="font-heading truncate bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent">
            {subject.name}
          </div>
          <div className="text-xs font-bold text-muted md:text-sm">{label}</div>
        </div>
      </div>

      {lessons.map((lesson, i) => (
        <div key={lesson.key}>
          {(i === 0 ||
            lessons[i - 1].chapterNumber !== lesson.chapterNumber) && (
            <ChapterKicker
              number={lesson.chapterNumber}
              title={lesson.chapterTitle}
              first={i === 0}
            />
          )}
          <LessonRow lesson={lesson} subject={subject} mode={mode} />
        </div>
      ))}
    </div>
  );
}
