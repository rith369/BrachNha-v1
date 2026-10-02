import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Atom,
  Award,
  BookOpenText,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Dna,
  FileCheck2,
  FlaskConical,
  GraduationCap,
  Hourglass,
  Info,
  Landmark,
  Languages,
  Layers,
  Play,
  Send,
  ShieldAlert,
  Sigma,
  Sparkles,
  Timer,
  X,
} from "lucide-react";

/*
 * NEOBRUTALISM, like the rest of the app: 2px outlines in `border-border`, hard
 * offset shadows (`shadow-panel`), flat fills, and the theme tokens throughout,
 * so the page follows light and dark with no `dark:` variant.
 *
 * This page used to be a dark "glass" screen of its own (a fixed #090b14
 * background, blurred orbs, frosted cards). Two things were wrong with that
 * beyond the look: it ignored the light theme entirely, and one of the orbs
 * was positioned `-right-24` inside the page's `overflow-y-auto` scroller,
 * which forces overflow-x to auto, so the whole page scrolled sideways. Nothing
 * decorative here may sit outside its own box unless that box clips it.
 *
 * The ONE exception to the flat fills is the closing "Ready to test yourself?"
 * block: the `bg-night` gradient with its dot texture and yellow glow, the
 * user's call (a flat neo-blue read as cheap) and the same look as the
 * simulation card on /exam. Its glow is clipped by the section's
 * `overflow-hidden`.
 *
 * Neo fills (`bg-neo-*`) are identical in both themes and always carry
 * `text-ink`. A subject's icon tile is its own `--subject-*` fill under a white
 * glyph, the one role that raw value is correct for (see subject-styles.ts).
 */

/** A pressable that sinks into its own hard shadow. */
const PRESS =
  "transition-[transform,box-shadow] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none";

interface SubjectScheduleItem {
  id: string;
  name: string;
  nameKm: string;
  sessionSlot: string;
  timeSlot: string;
  duration: string;
  weight: string;
  sessionLabel: string;
  icon: typeof Sigma;
  /** The subject's own colour, as a fill under a white glyph. */
  fill: string;
}

const DAY_1_SUBJECTS: SubjectScheduleItem[] = [
  {
    id: "history",
    name: "History",
    nameKm: "ប្រវត្តិវិទ្យា",
    sessionSlot: "ពេលព្រឹក (Morning)",
    timeSlot: "07:30 - 08:30",
    duration: "60 min",
    weight: "50 pts",
    sessionLabel: "Morning Session 1",
    icon: Landmark,
    fill: "var(--subject-history)",
  },
  {
    id: "biology",
    name: "Biology",
    nameKm: "ជីវវិទ្យា",
    sessionSlot: "ពេលព្រឹក (Morning)",
    timeSlot: "09:00 - 10:30",
    duration: "90 min",
    weight: "75 pts",
    sessionLabel: "Morning Session 2",
    icon: Dna,
    fill: "var(--subject-biology)",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    nameKm: "គីមីវិទ្យា",
    sessionSlot: "ពេលរសៀល (Afternoon)",
    timeSlot: "14:00 - 15:30",
    duration: "90 min",
    weight: "75 pts",
    sessionLabel: "Afternoon Session 1",
    icon: FlaskConical,
    fill: "var(--subject-chemistry)",
  },
  {
    id: "language",
    name: "Foreign Language",
    nameKm: "ភាសាបរទេស (English / French)",
    sessionSlot: "ពេលរសៀល (Afternoon)",
    timeSlot: "16:00 - 17:00",
    duration: "60 min",
    weight: "50 pts",
    sessionLabel: "Afternoon Session 2",
    icon: Languages,
    fill: "var(--subject-english)",
  },
];

const DAY_2_SUBJECTS: SubjectScheduleItem[] = [
  {
    id: "khmer",
    name: "Khmer Literature",
    nameKm: "អក្សរសាស្ត្រខ្មែរ",
    sessionSlot: "ពេលព្រឹក (Morning)",
    timeSlot: "07:30 - 09:00",
    duration: "90 min",
    weight: "75 pts",
    sessionLabel: "Morning Session 1",
    icon: BookOpenText,
    fill: "var(--subject-khmer)",
  },
  {
    id: "physics",
    name: "Physics",
    nameKm: "រូបវិទ្យា",
    sessionSlot: "ពេលព្រឹក (Morning)",
    timeSlot: "09:30 - 11:00",
    duration: "90 min",
    weight: "75 pts",
    sessionLabel: "Morning Session 2",
    icon: Atom,
    fill: "var(--subject-physics)",
  },
  {
    id: "math",
    name: "Mathematics",
    nameKm: "គណិតវិទ្យា",
    sessionSlot: "ពេលរសៀល (Afternoon)",
    timeSlot: "14:00 - 16:30",
    duration: "150 min",
    weight: "125 pts",
    sessionLabel: "Afternoon Major Session",
    icon: Sigma,
    fill: "var(--subject-math)",
  },
];

const GRADE_SCALE = [
  { grade: "A", label: "និទ្ទេស A", minPct: "90%", minScore: "427 pts", fill: "bg-neo-mint" },
  { grade: "B", label: "និទ្ទេស B", minPct: "80%", minScore: "380 pts", fill: "bg-neo-blue" },
  { grade: "C", label: "និទ្ទេស C", minPct: "70%", minScore: "332 pts", fill: "bg-neo-yellow" },
  { grade: "D", label: "និទ្ទេស D", minPct: "60%", minScore: "285 pts", fill: "bg-neo-orange" },
  { grade: "E", label: "និទ្ទេស E", minPct: "50%", minScore: "237 pts", fill: "bg-neo-red" },
];

const RULES = [
  {
    icon: Timer,
    title: "Timed Sessions",
    description: "Each subject has its own countdown timer matching official MoEYS regulations.",
    fill: "bg-neo-blue",
  },
  {
    icon: Hourglass,
    title: "Continuous Timer",
    description: "Leaving the exam does not pause the session clock.",
    fill: "bg-neo-orange",
  },
  {
    icon: Send,
    title: "Auto Submit",
    description: "When time runs out, answers are automatically submitted.",
    fill: "bg-neo-pink",
  },
  {
    icon: ShieldAlert,
    title: "Exam Conditions",
    description:
      "Follow the simulated examination schedule and complete each session within the given time.",
    fill: "bg-neo-mint",
  },
];

/** The two days carry one neo fill each, on the tabs and on their cards. */
const DAY_FILL = { 1: "bg-neo-yellow", 2: "bg-neo-mint" } as const;

export function ExamSimulationView() {
  const [selectedDayTab, setSelectedDayTab] = useState<1 | 2>(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto bg-bg text-text">
      {/* Main Content Wrapper: pb-36 ensures clear clearance above KruAI FAB and BottomNav */}
      <div className="relative mx-auto w-full max-w-5xl px-4 pt-4 pb-36 sm:px-5 sm:pb-32 md:px-6 lg:pb-16">
        {/* ── Page Header: Breadcrumb & Title ── */}
        <header className="mb-5 sm:mb-6">
          {/* Top navigation row: back breadcrumb on left */}
          <div className="flex items-center justify-between">
            <Link
              to="/exam"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-muted transition hover:text-text sm:text-sm"
            >
              <ChevronLeft className="size-4 shrink-0" strokeWidth={2.5} />
              <span>Mock Exams</span>
            </Link>

            <span className="hidden text-[10px] font-extrabold tracking-wider text-muted uppercase sm:inline">
              Bac II Simulator · Science Track
            </span>
          </div>

          <div className="mt-3 pr-12 sm:pr-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-neo-yellow px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-ink uppercase shadow-panel-sm sm:text-xs">
              <Sparkles className="size-3 shrink-0" strokeWidth={2.5} />
              <span>REALISTIC EXAM EXPERIENCE</span>
            </div>

            <h1 className="font-heading mt-2.5 text-2xl font-extrabold tracking-tight text-text sm:text-3xl lg:text-4xl">
              2-Day Bac II Simulation
            </h1>
            <p className="mt-1 text-xs font-semibold text-muted sm:text-sm md:text-base">
              Experience the Bac II exam like the real thing.
            </p>
          </div>
        </header>

        {/* ── Hero Section ── */}
        <section className="mb-8 rounded-2xl border border-border bg-surface p-4 shadow-panel sm:mb-10 sm:rounded-3xl sm:p-6 md:p-8">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Hero Left Content */}
            <div className="flex min-w-0 flex-col lg:col-span-7">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple">
                <GraduationCap className="size-4 shrink-0" strokeWidth={2.5} />
                <span>MoEYS Standard · Science Track (ថ្នាក់វិទ្យាសាស្ត្រ)</span>
              </div>

              <h2 className="font-heading mt-1.5 text-lg font-extrabold text-text sm:text-xl md:text-2xl">
                National Examination Protocol
              </h2>

              <p className="mt-2 text-xs leading-relaxed font-semibold text-muted sm:text-sm md:text-base">
                Test your knowledge, time management, and exam readiness in a
                realistic two-day examination experience across all 7 subjects.
              </p>

              {/* Three Compact Statistics: 2 Days, 7 Subjects, Timed Sessions */}
              <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
                <StatTile icon={CalendarDays} fill="bg-neo-yellow" value="2 Days" label="Schedule" />
                <StatTile icon={Layers} fill="bg-neo-blue" value="7 Subjects" label="Science Track" />
                <StatTile icon={Clock} fill="bg-neo-mint" value="Timed" label="Strict Clock" />
              </div>

              {/* Primary CTA Button: Full width on mobile for thumb accessibility */}
              <div className="mt-5 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className={`group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-brand px-6 py-3.5 text-sm font-extrabold text-white shadow-cta hover:brightness-110 sm:w-auto md:text-base ${PRESS}`}
                >
                  Start Simulation
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    strokeWidth={3}
                  />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-center text-[11px] font-bold text-muted sm:justify-start">
                  <FileCheck2 className="size-3.5 shrink-0 text-mint" />
                  <span>MoEYS Examination Protocol</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual: Timetable illustration preview */}
            <div className="flex min-w-0 justify-center lg:col-span-5">
              <div className="w-full max-w-md rounded-2xl border border-border bg-control p-3.5 shadow-panel-sm sm:p-4.5">
                {/* Header bar of the visual document */}
                <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-border bg-[var(--brand-purple)] text-white sm:size-7">
                      <Calendar className="size-3.5 sm:size-4" strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold text-text sm:text-xs">
                        BAC II TIMETABLE
                      </div>
                      <div className="text-[9px] font-semibold text-muted sm:text-[10px]">
                        7 Subjects · Science Track
                      </div>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-md border border-border bg-surface px-2 py-0.5 text-[9px] font-extrabold text-text sm:text-[10px]">
                    525 PTS (475 BASE)
                  </span>
                </div>

                {/* Day selector tabs inside illustration */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <DayTab
                    day={1}
                    subjects={4}
                    active={selectedDayTab === 1}
                    onSelect={() => setSelectedDayTab(1)}
                  />
                  <DayTab
                    day={2}
                    subjects={3}
                    active={selectedDayTab === 2}
                    onSelect={() => setSelectedDayTab(2)}
                  />
                </div>

                {/* Micro timetable view */}
                <div className="mt-3 space-y-1.5 sm:space-y-2">
                  {(selectedDayTab === 1 ? DAY_1_SUBJECTS : DAY_2_SUBJECTS).map(
                    (sub) => {
                      const Icon = sub.icon;
                      return (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-2 px-2.5"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <SubjectIcon fill={sub.fill} small>
                              <Icon className="size-3.5" strokeWidth={2.5} />
                            </SubjectIcon>
                            <div className="min-w-0">
                              <div className="truncate text-xs font-bold text-text">
                                {sub.name}
                              </div>
                              <div className="text-[9px] font-semibold text-muted sm:text-[10px]">
                                {sub.timeSlot}
                              </div>
                            </div>
                          </div>

                          <span className="shrink-0 rounded-md border border-border bg-secondary px-1.5 py-0.5 text-[9px] font-extrabold text-text">
                            {sub.duration}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* Subtle seal watermark */}
                <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2 text-[9px] font-bold text-muted sm:text-[10px]">
                  <span>CAMBODIAN BAC II · SCIENCE</span>
                  <span className="font-mono text-[9px]">EN / KM</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Official Examination Schedule (Day 1 & Day 2) ── */}
        <section className="mb-8 sm:mb-12">
          <div className="mb-3.5 flex flex-col gap-1 sm:mb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionKicker icon={CalendarDays}>EXAM PROTOCOL</SectionKicker>
              <h3 className="font-heading text-lg font-extrabold text-text sm:text-xl md:text-2xl">
                Simulation Schedule (កាលវិភាគប្រឡង)
              </h3>
            </div>
            <p className="text-xs font-semibold text-muted">
              Official 2-day science track timetable with Ministry durations and points
            </p>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-6 md:grid-cols-2">
            {/* ── DAY 01 CARD: History, Biology, Chemistry, Foreign Language (4 Subjects, 250 pts) ── */}
            <DayCard
              day={1}
              titleKm="Day 1 (ថ្ងៃទី 1)"
              blurb="ពេលព្រឹក & ពេលរសៀល · 4 មុខវិជ្ជា"
              countLabel="4 Subjects"
              pointsLabel="250 Total Pts"
              subjects={DAY_1_SUBJECTS}
            />

            {/* ── DAY 02 CARD: Khmer Literature, Physics, Mathematics (3 Subjects, 275 pts) ── */}
            <DayCard
              day={2}
              titleKm="Day 2 (ថ្ងៃទី 2)"
              blurb="ពេលព្រឹក & ពេលរសៀល · 3 មុខវិជ្ជា"
              countLabel="3 Subjects"
              pointsLabel="275 Total Pts"
              subjects={DAY_2_SUBJECTS}
            />
          </div>
        </section>

        {/* ── Official MoEYS Grade Scale Section (From Ministry Standards) ── */}
        <section className="mb-8 sm:mb-12">
          <div className="mb-3.5 sm:mb-4">
            <SectionKicker icon={Award}>OFFICIAL SCORING MATRIX</SectionKicker>
            <h3 className="font-heading text-lg font-extrabold text-text sm:text-xl md:text-2xl">
              តារាងអត្រាពិន្ទុសម្រាប់កំណត់និទ្ទេស ថ្នាក់វិទ្យាសាស្ត្រ
            </h3>
            <p className="text-xs font-semibold text-muted">
              Grade Determination Benchmark (Total 475 Base Points, Excluding Foreign Language)
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4 shadow-panel sm:p-5">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
              {GRADE_SCALE.map((item) => (
                <div
                  key={item.grade}
                  className={`flex flex-col items-center rounded-xl border border-border p-2.5 text-center text-ink shadow-panel-sm sm:p-3 ${item.fill}`}
                >
                  <span className="font-heading text-xl font-extrabold sm:text-2xl">
                    {item.grade}
                  </span>
                  <span className="mt-0.5 text-[11px] font-extrabold">
                    {item.label}
                  </span>
                  <span className="mt-1 text-[10px] font-bold">
                    {item.minPct} · {item.minScore}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-start gap-2 border-t border-border pt-3 text-[11px] font-semibold text-muted">
              <Info className="mt-0.5 size-4 shrink-0 text-purple" />
              <span>
                យោងតាមក្រសួងអប់រំ យុវជន និងកីឡា៖ ពិន្ទុសរុបគ្រប់មុខ (ដកភាសាបរទេស) គឺ 475 ពិន្ទុ សម្រាប់កំណត់និទ្ទេស A ដល់ E (និទ្ទេស E ចាប់ពី 237 ពិន្ទុឡើងទៅគឺបំពេញលក្ខខណ្ឌជាប់)។ ភាសាបរទេស (50 ពិន្ទុ) ជាមុខវិជ្ជាបន្ថែម។
              </span>
            </div>
          </div>
        </section>

        {/* ── Simulation Rules Section: 2x2 grid on mobile for compact scanability ── */}
        <section className="mb-8 sm:mb-12">
          <div className="mb-3 sm:mb-4">
            <SectionKicker icon={ShieldAlert}>TESTING STANDARDS</SectionKicker>
            <h3 className="font-heading text-lg font-extrabold text-text sm:text-xl md:text-2xl">
              Simulation Rules
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
            {RULES.map((rule) => {
              const Icon = rule.icon;
              return (
                <div
                  key={rule.title}
                  className="flex min-w-0 flex-col rounded-xl border border-border bg-surface p-3 shadow-panel-sm sm:rounded-2xl sm:p-4"
                >
                  <div
                    className={`flex size-8 items-center justify-center rounded-lg border border-border text-ink sm:size-9 sm:rounded-xl ${rule.fill}`}
                  >
                    <Icon className="size-4 sm:size-4.5" strokeWidth={2.25} />
                  </div>

                  <h4 className="font-heading mt-2 text-xs font-extrabold text-text sm:mt-3 sm:text-sm">
                    {rule.title}
                  </h4>

                  <p className="mt-1 text-[10px] leading-relaxed font-semibold text-muted sm:text-xs">
                    {rule.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Bottom Final CTA Card ── */}
        {/* The "exam hall at night" block, the same look as the simulation
            card on /exam (exam-hub.tsx). The glow sits past the section's edge
            and is clipped by its overflow-hidden; never remove that clip. */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-night p-5 text-white shadow-panel sm:rounded-3xl sm:p-6 md:p-8">
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
          <div className="pointer-events-none absolute -top-12 -right-10 size-44 rounded-full bg-[var(--brand-yellow)]/20 blur-2xl" />

          <div className="relative flex flex-col items-center justify-between gap-4 text-center sm:gap-6 md:flex-row md:text-left">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-extrabold text-[var(--brand-yellow)] sm:text-xs">
                <Award className="size-3" />
                <span>Bac II Benchmark Assessment · 7 Subjects</span>
              </div>

              <h3 className="font-heading mt-2 text-xl font-extrabold sm:text-2xl md:text-3xl">
                Ready to test yourself?
              </h3>

              <p className="mt-1 text-xs font-semibold text-white/85 sm:text-sm md:text-base">
                Start the full 2-day Bac II simulation and discover how prepared
                you really are across all 7 subjects.
              </p>
            </div>

            <div className="w-full shrink-0 sm:w-auto">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className={`group inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border border-ink bg-[var(--brand-yellow)] px-6 py-3.5 text-sm font-extrabold text-[#1e1b4b] shadow-hard hover:brightness-105 sm:w-auto sm:text-base ${PRESS}`}
              >
                <Play className="size-4 fill-[#1e1b4b]" />
                <span>Start Simulation</span>
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  strokeWidth={3}
                />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── Realistic Readiness & Confirmation Modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Scrim */}
          <div
            className="absolute inset-0 bg-[var(--scrim)]"
            onClick={() => setShowConfirmModal(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-5 text-text shadow-panel sm:rounded-3xl sm:p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3 sm:pb-4">
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-[var(--brand-purple)] text-white sm:size-11 sm:rounded-2xl">
                  <GraduationCap className="size-5 sm:size-6" strokeWidth={2.25} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-heading text-base font-extrabold text-text sm:text-lg">
                    Start Bac II Simulation
                  </h4>
                  <p className="text-[11px] font-semibold text-muted sm:text-xs">
                    Day 1 Session 1: ប្រវត្តិវិទ្យា (History · 07:30 - 08:30)
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowConfirmModal(false)}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-text shadow-panel-sm transition-[transform,box-shadow] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <X className="size-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Checklist items */}
            <div className="mt-3.5 space-y-2.5 sm:mt-4 sm:space-y-3">
              <div className="rounded-xl border border-border bg-secondary p-3 sm:rounded-2xl sm:p-3.5">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-4 shrink-0 text-purple" />
                  <div className="text-xs leading-relaxed font-semibold text-text">
                    You are starting the official 2-day simulation. Day 1 Session 1 begins with History (ប្រវត្តិវិទ្យា, 60 minutes, 50 points).
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <ChecklistItem>Prepare scrap paper, blue/black pen, and a quiet room</ChecklistItem>
                <ChecklistItem>Timer continues running if you leave the browser</ChecklistItem>
                <ChecklistItem>Full worked solutions provided after submission</ChecklistItem>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-2.5 border-t border-border pt-3.5 sm:mt-6 sm:flex-row sm:items-center sm:justify-end sm:pt-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className={`order-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-extrabold text-text shadow-panel-sm sm:order-1 ${PRESS}`}
              >
                Review Schedule
              </button>

              <Link
                to="/exam/subjects"
                className={`order-1 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-brand px-5 py-2.5 text-xs font-extrabold text-white shadow-cta hover:brightness-110 sm:order-2 ${PRESS}`}
              >
                <span>Enter Day 1 Exam</span>
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionKicker({
  icon: Icon,
  children,
}: {
  icon: typeof Sigma;
  children: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider text-purple uppercase">
      <Icon className="size-3.5" />
      <span>{children}</span>
    </div>
  );
}

function StatTile({
  icon: Icon,
  fill,
  value,
  label,
}: {
  icon: typeof Sigma;
  fill: string;
  value: string;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center rounded-xl border border-border bg-bg p-2 text-center shadow-panel-sm sm:rounded-2xl sm:p-3">
      <div
        className={`flex size-7 items-center justify-center rounded-lg border border-border text-ink sm:size-8 sm:rounded-xl ${fill}`}
      >
        <Icon className="size-3.5 sm:size-4" strokeWidth={2.25} />
      </div>
      <span className="font-heading mt-1.5 text-xs font-extrabold whitespace-nowrap text-text sm:text-base md:text-lg">
        {value}
      </span>
      <span className="max-w-full truncate text-[9px] font-bold text-muted sm:text-[10px] md:text-xs">
        {label}
      </span>
    </div>
  );
}

function DayTab({
  day,
  subjects,
  active,
  onSelect,
}: {
  day: 1 | 2;
  subjects: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={`flex flex-col items-center rounded-xl border border-border p-1.5 text-center transition-[transform,box-shadow] sm:p-2 ${
        active
          ? `${DAY_FILL[day]} text-ink shadow-panel-sm`
          : "bg-surface text-muted hover:text-text"
      }`}
    >
      <span className="text-[9px] font-extrabold tracking-wider uppercase">
        Phase {day}
      </span>
      <span className="font-heading text-xs font-extrabold sm:text-sm">
        DAY {day}
      </span>
      <span className="text-[9px] font-bold">{subjects} Subjects</span>
    </button>
  );
}

function DayCard({
  day,
  titleKm,
  blurb,
  countLabel,
  pointsLabel,
  subjects,
}: {
  day: 1 | 2;
  titleKm: string;
  blurb: string;
  countLabel: string;
  pointsLabel: string;
  subjects: SubjectScheduleItem[];
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-border bg-surface p-4 shadow-panel sm:rounded-3xl sm:p-5 md:p-6">
      {/* Day header banner */}
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div className="min-w-0">
          <span
            className={`inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-ink uppercase ${DAY_FILL[day]}`}
          >
            DAY 0{day}
          </span>
          <h4 className="font-heading mt-1.5 text-lg font-extrabold text-text sm:text-xl">
            {titleKm}
          </h4>
          <p className="text-[11px] font-semibold text-muted">{blurb}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end">
          <span className="rounded-lg border border-border bg-secondary px-2 py-0.5 text-[11px] font-extrabold text-text">
            {countLabel}
          </span>
          <span className="mt-1 text-[10px] font-bold text-muted">{pointsLabel}</span>
        </div>
      </div>

      {/* Subject list */}
      <div className="mt-3.5 flex flex-1 flex-col gap-2.5">
        {subjects.map((subject) => {
          const Icon = subject.icon;
          return (
            <div
              key={subject.id}
              className="flex flex-col gap-1.5 rounded-xl border border-border bg-bg p-3 sm:rounded-2xl"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <SubjectIcon fill={subject.fill}>
                    <Icon className="size-4 sm:size-4.5" strokeWidth={2.25} />
                  </SubjectIcon>
                  <div className="min-w-0">
                    <div className="font-heading truncate text-xs font-extrabold text-text sm:text-sm">
                      {subject.name}
                    </div>
                    <div className="truncate text-[10px] font-bold text-muted sm:text-xs">
                      {subject.nameKm}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[9px] font-extrabold text-text sm:text-[10px]">
                    <Clock className="size-2.5 sm:size-3" strokeWidth={2.5} />
                    {subject.duration}
                  </span>
                  <span className="text-[9px] font-extrabold text-muted">
                    {subject.weight}
                  </span>
                </div>
              </div>

              {/* Session time */}
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 border-t border-border pt-1.5 text-[10px] font-semibold text-muted sm:text-[11px]">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <span
                    className={`size-2 shrink-0 rounded-full border border-border ${DAY_FILL[day]}`}
                  />
                  {subject.sessionSlot}: {subject.timeSlot}
                </span>
                <span className="text-[9px] font-extrabold tracking-wide text-text uppercase sm:text-[10px]">
                  {subject.sessionLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** A subject's own colour as a solid tile under a white glyph. */
function SubjectIcon({
  fill,
  small = false,
  children,
}: {
  fill: string;
  small?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center border border-border text-white ${
        small ? "size-6 rounded-lg" : "size-8 rounded-xl sm:size-9"
      }`}
      style={{ background: fill }}
    >
      {children}
    </div>
  );
}

function ChecklistItem({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-text">
      <CheckCircle2 className="size-4 shrink-0 text-mint" />
      <span>{children}</span>
    </div>
  );
}
