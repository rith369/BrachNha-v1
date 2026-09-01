import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/utils/cn";
import { toKhmerDigits } from "@/utils/khmer-num";
import { SUBJECT_STYLE } from "@/features/lessons/subject-styles";
import { SubjectArt } from "@/features/lessons/components/subject-art";
import type { SubjectMeta } from "@/features/lessons/subjects";
import { QuizPathNode } from "./quiz-path-node";
import { quizPathFor } from "../quiz-path";

/**
 * Mimo-style quiz path — a zigzag trail of square nodes over a dot-grid
 * background, headed by the same TWO-TIER header subject-path-view.tsx's
 * Duolingo-style trail uses: an illustrated subject summary card with a
 * progress bar, then a solid-fill chapter/lesson banner naming what's current.
 * Shown instead of PracticeLessonList for a subject whose Quiz tab has a
 * `quizPathFor()` entry — physics only today; see quiz-path.ts for why.
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
  color,
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

export function QuizPathView({ subject }: { subject: SubjectMeta }) {
  const c = SUBJECT_STYLE[subject.id];
  const nodes = quizPathFor(subject.id) ?? [];

  const doneCount = nodes.filter((n) => n.status === "done").length;
  const total = nodes.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const current = nodes.find((n) => n.status === "current") ?? null;

  return (
    <div className="mx-auto w-full max-w-md">
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
          thin bar, not a fill under white text — see subject-styles.ts. */}
      <div
        className={cn(
          "mb-3 flex items-center gap-3 rounded-2xl border p-3 shadow-panel",
          c.card
        )}
      >
        <SubjectArt subject={subject} className="size-16 shrink-0 rounded-xl" />
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
              {toKhmerDigits(doneCount)}/{toKhmerDigits(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Chapter/lesson banner — SAME treatment as subject-path-view.tsx's unit
          banner: a solid subject-colour fill under white text, carrying its own
          lip so it reads as one material with the nodes below it. Unlike the
          lesson path, where one banner precedes EACH lesson as the trail
          scrolls past it, this path has exactly one — naming the current stop,
          since per-node titles were moved off the trail itself (there is
          nothing to print under six identical sample squares yet). */}
      {current && (
        <div
          className="mb-8 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-white"
          style={{
            backgroundColor: c.fill,
            boxShadow: `0 4px 0 color-mix(in srgb, ${c.fill} 62%, black)`,
          }}
        >
          <div className="min-w-0">
            <div className="truncate text-[10px] font-bold opacity-80">
              ជំពូក {toKhmerDigits(current.chapterNumber)}
            </div>
            <div className="font-heading truncate text-sm font-extrabold">
              {current.title}
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-extrabold">
            {toKhmerDigits(doneCount)}/{toKhmerDigits(total)}
          </span>
        </div>
      )}

      {/* The dot grid — a pure-CSS radial-gradient tile, no image. Uses
          --color-border, which is already a low-alpha subject-purple tint
          defined per theme, so the dots stay subtle and correct in both
          themes with no extra token. pt-10 gives the ចាប់ផ្តើម bubble on the
          current node room to sit above it without colliding with the banner
          — the same clearance subject-path-view.tsx reserves for its own
          bubble, and for the same reason. */}
      <div
        className="relative overflow-hidden rounded-3xl border border-purple/10 bg-surface/40 px-6 pt-10 pb-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-border) 1.5px, transparent 1.5px)",
          backgroundSize: "22px 22px",
        }}
      >
        {nodes.map((node, i) => (
          <div key={node.id}>
            {i > 0 && (
              <ElbowConnector
                from={centreAt(i - 1)}
                to={centreAt(i)}
                color={c.fill}
              />
            )}
            {/* paddingLeft + -translate-x-1/2 puts the node's CENTRE on its
                percentage — the same coordinate the connector is drawn to. */}
            <div className="flex" style={{ paddingLeft: `${centreAt(i)}%` }}>
              <div className="-translate-x-1/2">
                <QuizPathNode node={node} subjectId={subject.id} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] font-bold text-muted">
        គំរូការរចនា — មេរៀន និងសំណួរពិតនឹងបន្ថែមនាពេលក្រោយ
      </p>
    </div>
  );
}
