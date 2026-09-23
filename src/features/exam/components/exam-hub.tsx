import type { CSSProperties, ReactNode } from "react";
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
 *  3. ប្រឡងបាក់ឌុបសាកល្បង (Bac II Simulation) — a placeholder; the full 2-day
 *     exam has not been designed yet.
 *
 * THE TWO-TAB SCREEN IS ITS OWN ROUTE, not a state inside this component, so the
 * phone's back button steps from the tabs back to this chooser instead of
 * leaving the exam feature altogether — the reason /practice's levels are
 * routes too.
 *
 * ONLY THE CARD THAT GOES SOMEWHERE LOOKS PRESSABLE. The subject card carries
 * the path nodes' "lip" (a hard `0 6px 0` shadow mixed toward black, pressed
 * flush on `:active` — see session-node.tsx for why black and not the
 * `--color-*` scale). The simulation card is a plain `<div>` with no lip, no
 * press and a padlock chip: there is nothing behind it yet, and a control that
 * answers a tap with silence reads as broken. When the simulation exists it
 * becomes a `<Link>` and gains the lip.
 *
 * Both cards are FILLS UNDER WHITE TEXT, so they use the theme-independent
 * brand scale (`bg-brand`, `bg-night`), never `--color-*`. The decorative
 * blobs are static — nothing on this page loops, since a route replays its
 * mount work on every visit.
 *
 * KHMER-ONLY, like the rest of the exam feature — see EXAM_PAGE_LANG in
 * ../papers — with Khmer numerals, and month names from KM_MONTHS rather than
 * `Intl`, which prints `km-KH` in English on desktop Chrome.
 *
 * Stacked on a phone, side by side from `md`: at 320px two columns left each
 * card ~136px and broke the Khmer titles mid-word.
 */
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

  const lip = "color-mix(in oklab, var(--brand-purple) 55%, black)";
  const lipNight = "color-mix(in oklab, var(--brand-night-to) 55%, black)";

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-20 lg:pb-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-4 pr-14">
          <div className="font-heading bg-brand-tri bg-clip-text text-xl font-extrabold text-transparent md:text-2xl">
            វិញ្ញាសារត្រៀមប្រឡងបាក់ឌុប
          </div>
          <div className="mt-1 text-xs font-bold text-muted md:text-sm">
            ត្រៀមប្រឡងឱ្យបានឆ្លាតវៃ។ ដឹងពីកម្រិតរបស់ខ្លួន។
          </div>
        </div>

        {/* ── Countdown ── */}
        <div className="relative mb-5 overflow-hidden rounded-3xl border border-purple/10 bg-surface p-4 shadow-panel md:p-6">
          <div className="pointer-events-none absolute -top-12 -right-10 size-40 rounded-full bg-pink/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 -left-10 size-40 rounded-full bg-blue/15 blur-2xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple/8 px-2.5 py-1 text-[10px] font-extrabold text-purple md:text-xs">
                <CalendarClock className="size-3.5 shrink-0" strokeWidth={2.5} />
                ប្រឡងបាក់ឌុប · {examDate}
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading bg-brand-tri bg-clip-text text-5xl leading-tight font-extrabold text-transparent md:text-6xl">
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
            className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-brand p-4 text-white transition-[transform,box-shadow,filter] duration-75 hover:brightness-105 active:translate-y-[6px] active:shadow-[0_0_0_var(--lip)] md:p-5"
            style={
              {
                boxShadow: `0 6px 0 ${lip}`,
                "--lip": lip,
              } as CSSProperties
            }
          >
            <Library
              className="pointer-events-none absolute -right-6 -bottom-8 size-40 rotate-12 text-white/10"
              strokeWidth={1.5}
            />
            <div className="pointer-events-none absolute -top-10 -right-8 size-32 rounded-full bg-white/15 blur-2xl" />

            <div className="relative flex items-start justify-between gap-3">
              <GlassIcon>
                <Library className="size-6" strokeWidth={2.25} />
              </GlassIcon>
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-extrabold md:text-xs">
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
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-[var(--brand-purple)] md:text-sm">
                ចាប់ផ្តើម
                <ArrowRight className="size-3.5 shrink-0" strokeWidth={3} />
              </span>
            </div>
          </Link>

          {/* ── Bac II Simulation ── */}
          <Link
            to="/exam/simulation"
            className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-night p-4 text-white shadow-panel transition-[transform,box-shadow,filter] duration-75 hover:brightness-105 active:translate-y-[6px] active:shadow-[0_0_0_var(--lip)] md:p-5"
            style={
              {
                boxShadow: `0 6px 0 ${lipNight}`,
                "--lip": lipNight,
              } as CSSProperties
            }
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
              សាកល្បងប្រឡងបាក់ឌុបពេញលេញ រយៈពេល 2 ថ្ងៃ 6 មុខវិជ្ជា។
            </div>

            <div className="relative mt-auto flex items-center justify-between gap-2 pt-5">
              <div className="grid grid-cols-2 gap-1.5">
                {["ថ្ងៃទី 1", "ថ្ងៃទី 2"].map((day) => (
                  <div
                    key={day}
                    className="flex items-center gap-1 rounded-lg border border-dashed border-white/25 bg-white/5 px-2 py-1 text-[11px] font-extrabold"
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
    <div className="rounded-2xl border border-purple/10 bg-purple/5 px-3 py-2.5">
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

/** A frosted tile for a glyph sitting on one of the two gradient cards. */
function GlassIcon({ children }: { children: ReactNode }) {
  return (
    <div className="flex size-12 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
      {children}
    </div>
  );
}
