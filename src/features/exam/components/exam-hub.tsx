import type { ReactNode } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Library,
  Sparkles,
  Target,
} from "lucide-react";
import { useBrachNhaStore } from "@/lib/store";
import { allSubjects } from "@/features/lessons/subjects";
import { SubjectArt } from "@/features/lessons/components/subject-art";
import { BAC2_EXAM_DATE, daysUntilExam } from "@/utils/exam-date";
import { KM_MONTHS } from "@/utils/khmer-dates";

/**
 * `/exam` — the landing screen: pick HOW to sit an exam before picking WHAT.
 *
 * Three blocks, top to bottom:
 *
 *  1. A COUNTDOWN card — the "know where you stand" half of the page. Every
 *     number on it is real: days from `daysUntilExam()`, and the attempt count
 *     and average from `examResults`, which holds generated mock exams only
 *     (the same array Home's "from mock exams" pill reads, so the two agree).
 *  2. វិញ្ញាសារតាមមុខវិជ្ជា (Subject Mock Exams) — a `<Link>` to
 *     `/exam/subjects`, the two-tab screen that is the whole of what `/exam`
 *     used to be.
 *  3. ប្រឡងបាក់ឌុបសាកល្បង (Bac II Simulation) — a `<Link>` to
 *     `/exam/simulation`, the briefing screen for the full 2-day exam.
 *
 * THE TWO-TAB SCREEN IS ITS OWN ROUTE, not a state inside this component, so the
 * phone's back button steps from the tabs back to this chooser instead of
 * leaving the exam feature altogether — the reason /practice's levels are
 * routes too.
 *
 * NEOBRUTALISM, like the rest of the app: both cards carry a 2px
 * `border-border` outline and a hard `shadow-panel`, and each sinks into that
 * shadow on `:active`. The subject card is a flat `bg-brand` under WHITE text.
 * The simulation card KEEPS its "exam hall at night" look (the user's call: a
 * flat neo-blue read as cheap): the `bg-night` gradient, the dot texture, the
 * yellow glow and yellow accents, under white text. It is the same block that
 * closes exam-simulation-view.tsx, so the two read as one feature. Its glow
 * and watermark sit past their own box ON PURPOSE and are clipped by the
 * card's `overflow-hidden`; without that clip they would make the page scroll
 * sideways, since every page scroller is `overflow-y-auto`.
 *
 * KHMER-ONLY, like the rest of the exam feature — see EXAM_PAGE_LANG in
 * ../papers — with Latin digits, and month names from KM_MONTHS rather than
 * `Intl`, which prints `km-KH` in English on desktop Chrome.
 *
 * Stacked on a phone, side by side from `md`: at 320px two columns left each
 * card ~136px and broke the Khmer titles mid-word.
 */
/** A card that sinks into its own hard shadow when pressed. */
const PRESS =
  "transition-[transform,box-shadow,filter] duration-75 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";

export function ExamHub() {
  const userLanguage = useBrachNhaStore((s) => s.userLanguage);
  const examResults = useBrachNhaStore((s) => s.examResults);

  const subjects = allSubjects(userLanguage);
  const days = daysUntilExam();
  const examDate = `${BAC2_EXAM_DATE.getDate()} ${
    KM_MONTHS[BAC2_EXAM_DATE.getMonth()]
  } ${BAC2_EXAM_DATE.getFullYear()}`;
  const average =
    examResults.length > 0
      ? Math.round(
          examResults.reduce((sum, r) => sum + r.pct, 0) / examResults.length
        )
      : null;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-4">
          <div className="font-heading bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent md:text-2xl">
            វិញ្ញាសារត្រៀមប្រឡងបាក់ឌុប
          </div>
          <div className="mt-1 text-xs font-bold text-muted md:text-sm">
            ត្រៀមប្រឡងឱ្យបានឆ្លាតវៃ។ ដឹងពីកម្រិតរបស់ខ្លួន។
          </div>
        </div>

        {/* ── Countdown ── */}
        <div className="mb-5 rounded-3xl border border-border bg-surface p-4 shadow-panel md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-neo-yellow px-2.5 py-1 text-[10px] font-extrabold text-ink shadow-panel-sm md:text-xs">
                <CalendarClock className="size-3.5 shrink-0" strokeWidth={2.5} />
                ប្រឡងបាក់ឌុប · {examDate}
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading text-5xl leading-tight font-extrabold text-purple md:text-6xl">
                  {days}
                </span>
                <span className="text-sm font-extrabold text-text md:text-base">
                  ថ្ងៃទៀត
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 md:w-72">
              <StatTile
                icon={<ClipboardCheck className="size-4" strokeWidth={2.5} />}
                label="វិញ្ញាសារបានធ្វើ"
                value={String(examResults.length)}
              />
              <StatTile
                icon={<Target className="size-4" strokeWidth={2.5} />}
                label="ពិន្ទុមធ្យម"
                value={average === null ? "—" : `${average}%`}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 md:gap-4">
          {/* ── Subject Mock Exams ── */}
          <Link
            to="/exam/subjects"
            className={`relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-brand p-4 text-white shadow-panel hover:brightness-105 md:p-5 ${PRESS}`}
          >
            <Library
              className="pointer-events-none absolute -right-6 -bottom-8 size-40 rotate-12 text-white/10"
              strokeWidth={1.5}
            />

            <div className="relative flex items-start justify-between gap-3">
              <IconTile>
                <Library className="size-6" strokeWidth={2.25} />
              </IconTile>
              <span className="rounded-full border border-ink bg-white px-2.5 py-1 text-[10px] font-extrabold text-ink md:text-xs">
                {subjects.length} មុខវិជ្ជា
              </span>
            </div>

            <div className="font-heading relative mt-4 text-lg font-extrabold md:text-xl">
              វិញ្ញាសារតាមមុខវិជ្ជា
            </div>
            <div className="relative mt-1 text-xs font-semibold text-white/90 md:text-sm">
              វិញ្ញាសារឆ្នាំចាស់ និងវិញ្ញាសារបង្កើតថ្មី សម្រាប់មុខវិជ្ជានីមួយៗ។
            </div>

            <div className="relative mt-auto flex items-center justify-between gap-3 pt-5">
              <div className="flex -space-x-2.5">
                {subjects.map((subject) => (
                  <SubjectArt
                    key={subject.id}
                    subject={subject}
                    className="aspect-square size-7 rounded-full ring-2 ring-white/80"
                  />
                ))}
              </div>
              <span className="flex shrink-0 items-center gap-1 rounded-full border border-ink bg-neo-yellow px-3 py-1.5 text-xs font-extrabold text-ink shadow-hard-sm md:text-sm">
                ចាប់ផ្តើម
                <ArrowRight className="size-3.5 shrink-0" strokeWidth={3} />
              </span>
            </div>
          </Link>

          {/* ── Bac II Simulation ── */}
          <Link
            to="/exam/simulation"
            className={`relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-night p-4 text-white shadow-panel hover:brightness-110 md:p-5 ${PRESS}`}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
                maskImage:
                  "linear-gradient(to bottom left, black, transparent 70%)",
              }}
            />
            <div className="pointer-events-none absolute -top-12 -right-10 size-36 rounded-full bg-[var(--brand-yellow)]/20 blur-2xl" />
            <GraduationCap
              className="pointer-events-none absolute -right-6 -bottom-8 size-40 -rotate-12 text-white/10"
              strokeWidth={1.5}
            />

            <div className="relative flex items-start justify-between gap-3">
              <GlassIcon>
                <GraduationCap
                  className="size-6 text-[var(--brand-yellow)]"
                  strokeWidth={2.25}
                />
              </GlassIcon>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold text-[var(--brand-yellow)] md:text-xs">
                <Sparkles className="size-3 shrink-0" strokeWidth={2.75} />
                2 ថ្ងៃពេញ
              </span>
            </div>

            <div className="font-heading relative mt-4 text-lg font-extrabold md:text-xl">
              ប្រឡងបាក់ឌុបសាកល្បង
            </div>
            <div className="relative mt-1 text-xs font-semibold text-white/85 md:text-sm">
              សាកល្បងប្រឡងបាក់ឌុបពេញលេញ រយៈពេល 2 ថ្ងៃ 7 មុខវិជ្ជា។
            </div>

            <div className="relative mt-auto flex flex-wrap items-center justify-between gap-2 pt-5">
              <div className="grid grid-cols-2 gap-1.5">
                {["ថ្ងៃទី 1", "ថ្ងៃទី 2"].map((day) => (
                  <div
                    key={day}
                    className="flex items-center gap-1 rounded-lg whitespace-nowrap border border-dashed border-white/25 bg-white/5 px-2 py-1 text-[11px] font-extrabold"
                  >
                    <CalendarDays
                      className="size-3 shrink-0 text-[var(--brand-yellow)]"
                      strokeWidth={2.5}
                    />
                    {day}
                  </div>
                ))}
              </div>

              <span className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--brand-yellow)] px-3 py-1.5 text-xs font-extrabold text-[#1e1b4b] md:text-sm">
                ព័ត៌មានលម្អិត
                <ArrowRight className="size-3.5 shrink-0" strokeWidth={3} />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-bg px-3 py-2.5 shadow-panel-sm">
      <div className="flex items-center gap-1.5 text-purple">
        {icon}
        <span className="truncate text-[10px] font-extrabold text-muted md:text-xs">
          {label}
        </span>
      </div>
      <div className="font-heading mt-1 text-xl font-extrabold text-text">
        {value}
      </div>
    </div>
  );
}

/** A frosted tile for the glyph on the night-gradient simulation card. */
function GlassIcon({ children }: { children: ReactNode }) {
  return (
    <div className="flex size-12 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
      {children}
    </div>
  );
}

/** A white, ink-outlined tile for the glyph on the subject card. */
function IconTile({ children }: { children: ReactNode }) {
  return (
    <div className="flex size-12 items-center justify-center rounded-2xl border border-ink bg-white text-ink shadow-hard-sm">
      {children}
    </div>
  );
}
