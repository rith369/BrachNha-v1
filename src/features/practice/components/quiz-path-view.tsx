import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp
} from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { cn } from "@/utils/cn";
import { SUBJECT_STYLE } from "@/features/lessons/subject-styles";
import { SubjectArt } from "@/features/lessons/components/subject-art";
import type { SubjectId, SubjectMeta } from "@/features/lessons/subjects";
import {
  lessonHeading,
  sessionStatus,
  type Chapter,
  type PathLesson
} from "@/features/lessons/sessions";
import { QuizPathNode } from "./quiz-path-node";
import {
  nextQuizSectionId,
  quizPathFor,
  quizPathProgress
} from "../quiz-path";

/**
 * Mimo-style quiz path — a zigzag trail of square nodes over a dot-grid
 * background, headed by the same TWO-TIER header subject-path-view.tsx's
 * Duolingo-style trail uses: an illustrated subject summary card with a
 * progress bar, then a solid-fill lesson banner. Shown instead of
 * PracticeLessonList for a subject whose Quiz tab has a `quizPathFor()` entry —
 * math and physics today; see quiz-path.ts.
 *
 * IT RENDERS THE REAL CURRICULUM SHAPE: chapter → lesson → sections, ONE BANNER
 * PER LESSON followed by that lesson's own squares, which is what "a lesson has
 * many sections" looks like on screen and is the same structure biology's Study
 * path draws. It used to be one flat run of six nodes under a single banner
 * naming whatever was current; that shape cannot express a lesson at all.
 *
 * NOTHING ON IT IS AUTHORED AS PROGRESS. Statuses come from `sessionStatus()`
 * against the store's `completedSessions`, and every counter comes from
 * `quizPathProgress()`, so a fresh student starts at the first node of the first
 * lesson and every tick was earned. The ចាប់ផ្តើម bubble sits on the first
 * unfinished section — see nextQuizSectionId() for why that rule differs from
 * the Study path's by design.
 *
 * THE HEADER IS DELIBERATELY THE SAME TREATMENT AS THE LESSON PATH'S, not a
 * simplified stand-in — reusing proven pieces (SubjectArt, the progress bar,
 * the fill-plus-lip banner) rather than inventing a thinner one is what makes
 * this look like a finished screen instead of a placeholder. The path ITSELF
 * still reads as a different material from the lesson trail — square lip
 * badges instead of circular ones (see quiz-path-node.tsx), a right-angle
 * "elbow" connector instead of a smooth diagonal S-curve, and a dot-grid
 * backdrop the lesson path doesn't have.
 *
 * STILL BUILT ON THE SAME IDEA subject-path-view.tsx's CENTRES array is: one
 * array of percentages is both where a node's centre sits and where the
 * connector either side of it is drawn to, so the two can never disagree.
 * CENTRES here starts and swings differently (50/78/50/22 vs 30/50/70/50) on
 * purpose, so the two trails don't just look different up close, they read
 * with a different rhythm at a glance.
 *
 * NOT a focus route — same call /subjects/:subjectId already makes. A student
 * here is choosing what to do, not mid-task, so the app's navigation stays.
 *
 * KHMER-ONLY, like the rest of the Study and Practice features.
 */

/** Node-centre percentages, cycled to zigzag the trail. See the file header for
 *  why these differ from subject-path-view.tsx's CENTRES. */
const CENTRES = [50, 78, 50, 22] as const;
const centreAt = (i: number) => CENTRES[i % CENTRES.length];

/**
 * The connector between two consecutive nodes: a VERTICAL leg down from the
 * node above, a true HORIZONTAL leg bridging the gap, then a VERTICAL leg into
 * the node below — three segments, two 90° turns — rather than
 * subject-path-view.tsx's smooth diagonal cubic S-curve.
 *
 * The first version of this connector got the shape wrong in a way that only
 * showed up once it sat next to a real Mimo screenshot: its middle segment ran
 * from y 17 to y 23 while x also moved, i.e. a shallow DIAGONAL, not a flat
 * bridge — so every turn read as a soft wave rather than a right angle. This
 * one's middle segment holds y CONSTANT (`L {from} 20 L {to} 20`), so it is
 * genuinely horizontal regardless of how the viewBox gets stretched, and the
 * two turns are genuine 90° corners for `strokeLinejoin="round"` to round —
 * which is what makes them read as a bracket rather than a curve. Horizontal
 * and vertical lines stay horizontal and vertical under ANY scaling, even the
 * non-uniform one `preserveAspectRatio="none"` applies here, so the shape holds
 * at every breakpoint without special-casing the aspect ratio.
 *
 * `vector-effect="non-scaling-stroke"` keeps the line weight — and critically,
 * the ROUNDED CORNERS it produces — a constant, genuinely circular size on
 * screen, rather than the ellipse a non-uniformly-scaled stroke would draw.
 */
function ElbowConnector({
  from,
  to,
  color
}: {
  from: number;
  to: number;
  color: string;
}) {
  return (
    <svg
      className="h-14 w-full md:h-16"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={`M ${from} 0 L ${from} 20 L ${to} 20 L ${to} 40`}
        fill="none"
        stroke={color}
        strokeOpacity={0.5}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * The chapter/lesson quick-jump list — the same idea, the same row shape and now
 * the same GRAIN as subject-path-view.tsx's ChapterJumpList: one row per LESSON,
 * not per node. That is what makes it worth having on a real path — math is
 * eight lessons of six sections, and a list of forty-eight unnamed squares would
 * be no easier to scan than the trail itself.
 *
 * A chapter heading is skipped for a `flat` subject, the same rule the banner's
 * kicker follows, so math's eight lessons read as one list rather than sitting
 * under a "ជំពូក 1" that groups nothing.
 */
function QuizJumpList({
  chapters,
  subjectId,
  completed,
  onPick
}: {
  chapters: Chapter[];
  subjectId: SubjectId;
  completed: string[];
  onPick: (lesson: PathLesson) => void;
}) {
  const c = SUBJECT_STYLE[subjectId];

  return (
    <div className="flex flex-col">
      {chapters.map((chapter) => (
        <div key={chapter.number}>
          {!chapter.flat && (
            <div
              className={cn(
                "mt-6 mb-2.5 flex items-baseline gap-1.5 truncate text-[11px] font-extrabold first:mt-0 md:text-xs",
                c.text
              )}
            >
              <span>ជំពូក {chapter.number}</span>
              {chapter.title && (
                <span className="truncate text-muted">· {chapter.title}</span>
              )}
            </div>
          )}
          <div className="flex flex-col gap-2.5">
            {chapter.lessons.map((lesson) => {
              const total = lesson.sessions.length;
              const done = lesson.sessions.filter((s) =>
                completed.includes(s.id)
              ).length;
              // Only a FULLY finished lesson steps back, the one distinction
              // QuizPathNode draws for its own discs — so a lesson with nothing
              // written keeps reading as "coming", not "forbidden".
              const allDone = total > 0 && done === total;

              return (
                <button
                  key={`${chapter.number}-${lesson.number}`}
                  type="button"
                  onClick={() => onPick(lesson)}
                  className={cn(
                    "flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left shadow-panel-sm transition hover:brightness-[1.03] active:scale-[0.985] md:gap-4 md:px-5 md:py-4",
                    c.card
                  )}
                >
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white md:size-11"
                    style={{
                      backgroundColor: allDone
                        ? `color-mix(in srgb, ${c.fill} 45%, var(--color-surface))`
                        : c.fill,
                    }}
                  >
                    {allDone ? (
                      <Check className="size-5" strokeWidth={3} />
                    ) : (
                      <BookOpen className="size-4.5" strokeWidth={2.25} />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="font-heading block truncate text-sm font-extrabold text-text md:text-base">
                      {lessonHeading(lesson.number, lesson.title)}
                    </span>
                    <span
                      className={cn("mt-0.5 block text-xs font-bold", c.text)}
                    >
                      {done}/{total} សម្រេច
                    </span>
                  </span>

                  <ChevronRight
                    className={cn("size-5 shrink-0", c.text)}
                    strokeWidth={2.5}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function QuizPathView({ subject }: { subject: SubjectMeta }) {
  const completedSessions = useBrachNhaStore((s) => s.completedSessions);
  const c = SUBJECT_STYLE[subject.id];
  const chapters = quizPathFor(subject.id) ?? [];

  const progress = quizPathProgress(chapters, completedSessions);
  const pct = progress.total
    ? Math.round((progress.done / progress.total) * 100)
    : 0;
  const nextId = nextQuizSectionId(chapters, completedSessions);

  // Same tap-to-jump interaction as subject-path-view.tsx's header card —
  // "path" is the zigzag trail, "jump" swaps it for a flat lesson list.
  const [mode, setMode] = useState<"path" | "jump">("path");
  function toggleMode() {
    setMode((m) => (m === "path" ? "jump" : "path"));
  }

  // Keyed by "{chapter}-{lesson}" so a jump pick can scrollIntoView the right
  // lesson BANNER once the path view has remounted — the banner rather than the
  // node, because the banner names the thing about to be done, which is the
  // same call subject-path-view.tsx's landing rule makes. scrollIntoView, not
  // manual getBoundingClientRect math: this component does not own its scroll
  // container (practice-subject.tsx's page does), so it cannot compute an offset
  // against a scroller it has no ref to.
  const bannerRefs = useRef(new Map<string, HTMLDivElement>());
  const [jumpTarget, setJumpTarget] = useState<string | null>(null);
  function handleJumpPick(lesson: PathLesson) {
    setMode("path");
    setJumpTarget(lessonKeyOf(chapters, lesson));
  }
  useEffect(() => {
    if (!jumpTarget) return;
    bannerRefs.current
      .get(jumpTarget)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [jumpTarget]);

  return (
    <div className="mx-auto w-full max-w-md">
      {/* THE BACK LINK AND THE SUBJECT CARD FOLLOW THE SCROLL. A path is long —
          math is 48 nodes over eight lessons — so without this the way out and
          the progress bar are only visible at the very top, and a student deep
          in lesson six has neither.

          `-top-4` IS THE WHOLE TRICK, AND `top-0` IS THE BUG IT FIXES. A sticky
          element is pinned against the scrollport's PADDING box, not its border
          box — and this page's scroller carries `pt-4`
          (pages/practice-subject.tsx). So `top-0` parked the block 16px BELOW
          the top of the scroll area and the trail slid through that band in
          plain sight: measured at 390px, scrollport top 38, block top 54, one
          blue node visibly peeking over the card. `-top-4` cancels exactly that
          padding.

          The rest of the offsets follow from it:

          - `-mt-4` pulls the block up by the same 16px and `pt-4` pads it back
            INSIDE, so its BACKGROUND covers the band while the back link keeps
            its breathing room. Stuck and unstuck positions then coincide, so
            the header does not jump as it pins.
          - `bg-bg`, the PAGE token, not `bg-surface`: this band is the page
            showing through behind the card, so it has to be the same colour
            the page is in both themes.
          - `z-20` clears the trail below, including the node's own `z-10`
            START bubble, which would otherwise ride over the card.
          - `pb-3` replaces the two children's own `mb-3` — margin below a
            sticky element is outside its background box, so a gap there is one
            more strip the trail shows through. */}
      <div className="sticky -top-4 z-20 -mt-4 bg-bg pt-4 pb-3">
        <Link
          to="/practice"
          className="mb-3 inline-flex items-center gap-1 pr-14 text-xs font-extrabold text-muted transition hover:text-text md:text-sm"
        >
          <ChevronLeft className="size-4 shrink-0" strokeWidth={2.5} />
          ការអនុវត្ត
        </Link>

        {/* Subject summary card — SubjectArt + name + a progress bar over the
          WHOLE path, the exact treatment subject-path-view.tsx's own header
          uses, reused rather than re-invented. bg-surface with the subject's
          tinted border, never a solid fill: this is a card holding text and a
          thin bar, not a fill under white text — see subject-styles.ts.
          A BUTTON, same as that header: tapping it opens QuizJumpList below in
          place of the trail. */}
        <button
          type="button"
          onClick={toggleMode}
          aria-expanded={mode === "jump"}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl border p-3 text-left shadow-panel transition hover:brightness-[1.03]",
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
          {mode === "jump" ? (
            <ChevronUp
              className={cn("size-4 shrink-0", c.text)}
              strokeWidth={3}
            />
          ) : (
            <ChevronDown
              className={cn("size-4 shrink-0", c.text)}
              strokeWidth={3}
            />
          )}
        </button>
      </div>

      {mode === "jump" ? (
        <QuizJumpList
          chapters={chapters}
          subjectId={subject.id}
          completed={completedSessions}
          onPick={handleJumpPick}
        />
      ) : (
        // One flat list of lesson blocks rather than nested maps, so `first:`
        // below resolves against the lesson blocks themselves — nested arrays
        // would make the first block a sibling of the header button instead.
        <div>
          {chapters.flatMap((chapter) =>
            chapter.lessons.map((lesson) => {
              const key = `${chapter.number}-${lesson.number}`;
              const done = lesson.sessions.filter((s) =>
                completedSessions.includes(s.id)
              ).length;

              return (
                <div key={key} className="mt-8 first:mt-0">
                  {/* Lesson banner — SAME treatment as subject-path-view.tsx's
                    unit banner: a solid subject-colour fill under white text,
                    carrying its own lip so it reads as one material with the
                    squares below it. ONE PER LESSON, which is the whole point
                    of this shape: it is what tells a student where one lesson's
                    sections end and the next lesson begins. The chapter kicker
                    is skipped for a flat subject — a bare number grouping
                    nothing is worse than no kicker. */}
                  <div
                    ref={(el) => {
                      if (el) bannerRefs.current.set(key, el);
                      else bannerRefs.current.delete(key);
                    }}
                    className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-white"
                    style={{
                      backgroundColor: c.fill,
                      boxShadow: `0 4px 0 color-mix(in srgb, ${c.fill} 62%, black)`,
                    }}
                  >
                    <div className="min-w-0">
                      {!chapter.flat && (
                        <div className="truncate text-[10px] font-bold opacity-80">
                          ជំពូក {chapter.number}
                          {chapter.title && ` · ${chapter.title}`}
                        </div>
                      )}
                      <div className="font-heading truncate text-sm font-extrabold">
                        {lessonHeading(lesson.number, lesson.title)}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-extrabold">
                      {done}/
                      {lesson.sessions.length}
                    </span>
                  </div>

                  {/* The dot grid — a pure-CSS radial-gradient tile, no image.
                    Uses --color-border, which is already a low-alpha tint
                    defined per theme, so the dots stay subtle and correct in
                    both themes with no extra token. ONE PANEL PER LESSON rather
                    than one around the whole path, so the grouping the banner
                    announces is visible as a block rather than only implied.
                    pt-10 gives the ចាប់ផ្តើម bubble room to sit above the first
                    node without colliding with the banner — the same clearance
                    subject-path-view.tsx reserves for its own bubble. */}
                  <div
                    className="relative mt-3 overflow-hidden rounded-3xl border border-purple/10 bg-surface/40 px-6 pt-10 pb-10"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, var(--color-border) 1.5px, transparent 1.5px)",
                      backgroundSize: "22px 22px",
                    }}
                  >
                    {lesson.sessions.map((session, i) => (
                      <div key={session.id}>
                        {i > 0 && (
                          <ElbowConnector
                            from={centreAt(i - 1)}
                            to={centreAt(i)}
                            color={c.fill}
                          />
                        )}
                        {/* paddingLeft + -translate-x-1/2 puts the node's CENTRE
                          on its percentage — the same coordinate the connector
                          is drawn to. */}
                        <div
                          className="flex"
                          style={{ paddingLeft: `${centreAt(i)}%` }}
                        >
                          <div className="-translate-x-1/2">
                            <QuizPathNode
                              session={session}
                              status={sessionStatus(session, completedSessions)}
                              subjectId={subject.id}
                              isNext={session.id === nextId}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <p className="mt-4 text-center text-[11px] font-bold text-muted">
        សំណួរនៃផ្នែកនីមួយៗនឹងបន្ថែមនាពេលក្រោយ
      </p>
    </div>
  );
}

/** A lesson's "{chapter}-{lesson}" key, found by identity — the same object the
 *  jump list was handed, so no id has to be threaded through the callback. */
function lessonKeyOf(chapters: Chapter[], lesson: PathLesson): string {
  const chapter = chapters.find((ch) => ch.lessons.includes(lesson));
  return `${chapter?.number ?? 1}-${lesson.number}`;
}
