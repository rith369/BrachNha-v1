import { useState } from "react";
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

interface SubjectScheduleItem {
  id: string;
  name: string;
  nameKm?: string;
  timeSlot: string;
  duration: string;
  weight: string;
  icon: typeof Sigma;
  colorScheme: {
    badge: string;
    iconBg: string;
    border: string;
    accent: string;
  };
}

const DAY_1_SUBJECTS: SubjectScheduleItem[] = [
  {
    id: "math",
    name: "Mathematics",
    nameKm: "គណិតវិទ្យា",
    timeSlot: "07:30 - 10:00",
    duration: "150 min",
    weight: "125 pts",
    icon: Sigma,
    colorScheme: {
      badge: "bg-blue-500/15 text-blue-400 border-blue-500/25",
      iconBg: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
      border: "border-blue-500/20 hover:border-blue-500/40",
      accent: "text-blue-400",
    },
  },
  {
    id: "physics",
    name: "Physics",
    nameKm: "រូបវិទ្យា",
    timeSlot: "14:00 - 15:30",
    duration: "90 min",
    weight: "75 pts",
    icon: Atom,
    colorScheme: {
      badge: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
      iconBg: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
      border: "border-indigo-500/20 hover:border-indigo-500/40",
      accent: "text-indigo-400",
    },
  },
  {
    id: "chemistry",
    name: "Chemistry",
    nameKm: "គីមីវិទ្យា",
    timeSlot: "15:45 - 17:15",
    duration: "90 min",
    weight: "75 pts",
    icon: FlaskConical,
    colorScheme: {
      badge: "bg-teal-500/15 text-teal-400 border-teal-500/25",
      iconBg: "bg-teal-500/15 text-teal-400 border border-teal-500/30",
      border: "border-teal-500/20 hover:border-teal-500/40",
      accent: "text-teal-400",
    },
  },
];

const DAY_2_SUBJECTS: SubjectScheduleItem[] = [
  {
    id: "biology",
    name: "Biology",
    nameKm: "ជីវវិទ្យា",
    timeSlot: "07:30 - 09:00",
    duration: "90 min",
    weight: "75 pts",
    icon: Dna,
    colorScheme: {
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
      iconBg: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      border: "border-emerald-500/20 hover:border-emerald-500/40",
      accent: "text-emerald-400",
    },
  },
  {
    id: "khmer",
    name: "Khmer Literature",
    nameKm: "ភាសាខ្មែរ",
    timeSlot: "09:15 - 10:45",
    duration: "90 min",
    weight: "75 pts",
    icon: BookOpenText,
    colorScheme: {
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
      iconBg: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
      border: "border-amber-500/20 hover:border-amber-500/40",
      accent: "text-amber-400",
    },
  },
  {
    id: "language",
    name: "Foreign Language",
    nameKm: "ភាសាបរទេស (English / French)",
    timeSlot: "14:00 - 15:00",
    duration: "60 min",
    weight: "50 pts",
    icon: Languages,
    colorScheme: {
      badge: "bg-rose-500/15 text-rose-400 border-rose-500/25",
      iconBg: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
      border: "border-rose-500/20 hover:border-rose-500/40",
      accent: "text-rose-400",
    },
  },
];

const RULES = [
  {
    icon: Timer,
    title: "Timed Sessions",
    description: "Each subject has its own countdown timer.",
    accent: "from-blue-500/20 to-purple-500/10 text-blue-400 border-blue-500/30",
  },
  {
    icon: Hourglass,
    title: "Continuous Timer",
    description: "Leaving the exam does not pause the session.",
    accent: "from-amber-500/20 to-rose-500/10 text-amber-400 border-amber-500/30",
  },
  {
    icon: Send,
    title: "Auto Submit",
    description: "When time runs out, answers are automatically submitted.",
    accent: "from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/30",
  },
  {
    icon: ShieldAlert,
    title: "Exam Conditions",
    description:
      "Follow the simulated examination schedule and complete each session within the given time.",
    accent: "from-teal-500/20 to-emerald-500/10 text-teal-400 border-teal-500/30",
  },
];

export function ExamSimulationView() {
  const [selectedDayTab, setSelectedDayTab] = useState<1 | 2>(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto bg-[#090b14] text-white">
      {/* ── Background Subtle Academic Micro-Grid & Ambient Light ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 10%, black 40%, transparent 100%)",
        }}
      />

      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute -top-24 left-1/4 size-80 rounded-full bg-purple-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute top-48 -right-24 size-80 rounded-full bg-indigo-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-40 -left-20 size-72 rounded-full bg-blue-600/10 blur-[90px]" />

      {/* Main Content Wrapper — pb-36 ensures clear clearance above KruAI FAB and BottomNav */}
      <div className="relative mx-auto w-full max-w-5xl px-3.5 pt-3 pb-36 sm:px-5 sm:pt-5 sm:pb-32 md:px-6 lg:pb-16">
        {/* ── Page Header: Breadcrumb & Title ── */}
        <header className="mb-4 sm:mb-6">
          {/* Top navigation row: back breadcrumb on left, pr-14 preserves space for TopBar hamburger on right */}
          <div className="flex items-center justify-between pr-14">
            <Link
              to="/exam"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-white/70 transition hover:text-white sm:text-sm"
            >
              <ChevronLeft className="size-4 shrink-0" strokeWidth={2.5} />
              <span>Mock Exams</span>
            </Link>

            <span className="text-[10px] font-extrabold tracking-wider uppercase text-purple-300/60 hidden sm:inline">
              Bac II Simulator
            </span>
          </div>

          <div className="mt-2.5 pr-12 sm:pr-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-purple-300 backdrop-blur-sm sm:text-xs uppercase">
              <Sparkles className="size-3 shrink-0" strokeWidth={2.5} />
              <span>REALISTIC EXAM EXPERIENCE</span>
            </div>

            <h1 className="font-heading mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
              2-Day Bac II Simulation
            </h1>
            <p className="mt-1 text-xs font-semibold text-white/70 sm:text-sm md:text-base">
              Experience the Bac II exam like the real thing.
            </p>
          </div>
        </header>

        {/* ── Hero Section ── */}
        <section className="relative mb-8 sm:mb-10 overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent p-4 sm:p-6 backdrop-blur-xl shadow-2xl md:p-8">
          {/* Glowing accent border line at the top */}
          <div className="pointer-events-none absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />

          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Hero Left Content */}
            <div className="flex flex-col lg:col-span-7">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[var(--brand-yellow)]">
                <GraduationCap className="size-4 shrink-0" strokeWidth={2.5} />
                <span>MoEYS Standard · Science Track Simulation</span>
              </div>

              <h2 className="font-heading mt-1.5 text-lg font-extrabold text-white sm:text-xl md:text-2xl">
                National Examination Protocol
              </h2>

              <p className="mt-2 text-xs leading-relaxed text-white/80 sm:text-sm md:text-base">
                Test your knowledge, time management, and exam readiness in a
                realistic two-day examination experience.
              </p>

              {/* Three Compact Statistics — Designed for phone screens */}
              <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="flex flex-col items-center rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.04] p-2 sm:p-3 text-center transition hover:border-white/20">
                  <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg sm:rounded-xl bg-purple-500/20 text-purple-300">
                    <CalendarDays className="size-3.5 sm:size-4" strokeWidth={2.25} />
                  </div>
                  <span className="font-heading mt-1.5 text-xs sm:text-base md:text-lg font-extrabold text-white whitespace-nowrap">
                    2 Days
                  </span>
                  <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-white/60 truncate max-w-full">
                    Schedule
                  </span>
                </div>

                <div className="flex flex-col items-center rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.04] p-2 sm:p-3 text-center transition hover:border-white/20">
                  <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg sm:rounded-xl bg-blue-500/20 text-blue-300">
                    <Layers className="size-3.5 sm:size-4" strokeWidth={2.25} />
                  </div>
                  <span className="font-heading mt-1.5 text-xs sm:text-base md:text-lg font-extrabold text-white whitespace-nowrap">
                    6 Subjects
                  </span>
                  <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-white/60 truncate max-w-full">
                    Science
                  </span>
                </div>

                <div className="flex flex-col items-center rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.04] p-2 sm:p-3 text-center transition hover:border-white/20">
                  <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/20 text-emerald-300">
                    <Clock className="size-3.5 sm:size-4" strokeWidth={2.25} />
                  </div>
                  <span className="font-heading mt-1.5 text-xs sm:text-base md:text-lg font-extrabold text-white whitespace-nowrap">
                    Timed
                  </span>
                  <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-white/60 truncate max-w-full">
                    Strict Clock
                  </span>
                </div>
              </div>

              {/* Primary CTA Button — Full width on mobile for thumb accessibility */}
              <div className="mt-5 sm:mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-brand px-6 py-3.5 text-sm font-extrabold text-white shadow-cta transition-all duration-150 hover:brightness-110 active:scale-[0.98] md:text-base"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Simulation
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      strokeWidth={3}
                    />
                  </span>
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                </button>

                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-center text-[11px] font-semibold text-white/60">
                  <FileCheck2 className="size-3.5 text-emerald-400 shrink-0" />
                  <span>MoEYS Examination Protocol</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual: Timetable illustration preview */}
            <div className="relative flex justify-center lg:col-span-5">
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#161a33]/90 to-[#0e1124]/90 p-3.5 sm:p-4.5 backdrop-blur-2xl shadow-xl ring-1 ring-white/10">
                {/* Header bar of the visual document */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 sm:size-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                      <Calendar className="size-3.5 sm:size-4" strokeWidth={2.25} />
                    </div>
                    <div>
                      <div className="text-[11px] sm:text-xs font-extrabold text-white">
                        BAC II TIMETABLE
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-semibold text-white/50">
                        Official Exam Session
                      </div>
                    </div>
                  </div>

                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white/80">
                    475 TOTAL PTS
                  </span>
                </div>

                {/* Day selector tabs inside illustration */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDayTab(1)}
                    className={`flex flex-col items-center rounded-xl border p-1.5 sm:p-2 text-center transition ${
                      selectedDayTab === 1
                        ? "border-purple-500/50 bg-purple-500/20 text-white shadow-sm"
                        : "border-white/5 bg-white/[0.02] text-white/50 hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider text-purple-300">
                      Phase 1
                    </span>
                    <span className="font-heading text-xs sm:text-sm font-extrabold">
                      DAY 1
                    </span>
                    <span className="text-[9px] font-semibold opacity-75">
                      3 Subjects
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDayTab(2)}
                    className={`flex flex-col items-center rounded-xl border p-1.5 sm:p-2 text-center transition ${
                      selectedDayTab === 2
                        ? "border-emerald-500/50 bg-emerald-500/20 text-white shadow-sm"
                        : "border-white/5 bg-white/[0.02] text-white/50 hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                      Phase 2
                    </span>
                    <span className="font-heading text-xs sm:text-sm font-extrabold">
                      DAY 2
                    </span>
                    <span className="text-[9px] font-semibold opacity-75">
                      3 Subjects
                    </span>
                  </button>
                </div>

                {/* Micro timetable view */}
                <div className="mt-3 space-y-1.5 sm:space-y-2">
                  {(selectedDayTab === 1 ? DAY_1_SUBJECTS : DAY_2_SUBJECTS).map(
                    (sub) => {
                      const Icon = sub.icon;
                      return (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-2 px-2.5 transition hover:bg-white/[0.06]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`flex size-6 shrink-0 items-center justify-center rounded-lg ${sub.colorScheme.iconBg}`}
                            >
                              <Icon className="size-3.5" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-xs font-bold text-white">
                                {sub.name}
                              </div>
                              <div className="text-[9px] sm:text-[10px] font-medium text-white/50">
                                {sub.timeSlot}
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1 text-right">
                            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-extrabold text-white/80">
                              {sub.duration}
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* Subtle seal watermark */}
                <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-[9px] sm:text-[10px] text-white/40">
                  <span>CAMBODIAN BAC II</span>
                  <span className="font-mono text-[9px]">EN / KM</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Exam Schedule Section ── */}
        <section className="mb-8 sm:mb-12">
          <div className="mb-3.5 sm:mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider text-purple-400 uppercase">
                <CalendarDays className="size-3.5" />
                <span>EXAM PROTOCOL</span>
              </div>
              <h3 className="font-heading text-lg sm:text-xl md:text-2xl font-extrabold text-white">
                Simulation Schedule
              </h3>
            </div>
            <p className="text-xs font-semibold text-white/60">
              Standard 2-day science timetable with official subject durations
            </p>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-6 md:grid-cols-2">
            {/* ── DAY 01 CARD ── */}
            <div className="relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-indigo-500/25 bg-gradient-to-b from-[#13172e] via-[#101326] to-[#0d0f1f] p-4 sm:p-5 md:p-6 shadow-xl transition-all hover:border-indigo-500/40">
              {/* Day header banner */}
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-indigo-300 uppercase">
                    DAY 01
                  </span>
                  <h4 className="font-heading mt-1 text-lg sm:text-xl font-extrabold text-white">
                    Day 1
                  </h4>
                  <p className="text-[11px] font-semibold text-white/60">
                    Morning & Afternoon Examination
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-bold text-white/90">
                    3 Subjects
                  </span>
                  <span className="mt-0.5 text-[10px] font-semibold text-indigo-300/80">
                    275 Total Pts
                  </span>
                </div>
              </div>

              {/* Subject List for Day 1 */}
              <div className="mt-3.5 flex flex-1 flex-col gap-2.5">
                {DAY_1_SUBJECTS.map((subject) => {
                  const Icon = subject.icon;
                  return (
                    <div
                      key={subject.id}
                      className={`flex flex-col gap-1.5 rounded-xl sm:rounded-2xl border bg-white/[0.03] p-3 transition-all ${subject.colorScheme.border} hover:bg-white/[0.06]`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl ${subject.colorScheme.iconBg}`}
                          >
                            <Icon className="size-4 sm:size-4.5" strokeWidth={2.25} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-heading truncate text-xs sm:text-sm font-extrabold text-white">
                              {subject.name}
                            </div>
                            {subject.nameKm && (
                              <div className="truncate text-[10px] sm:text-xs font-bold text-white/60">
                                {subject.nameKm}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-0.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold ${subject.colorScheme.badge}`}
                          >
                            <Clock className="size-2.5 sm:size-3" strokeWidth={2.5} />
                            {subject.duration}
                          </span>
                          <span className="text-[9px] font-extrabold text-white/50">
                            {subject.weight}
                          </span>
                        </div>
                      </div>

                      {/* Visual indicator bar with session time */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-[10px] sm:text-[11px] font-semibold text-white/60">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-indigo-400" />
                          Session: {subject.timeSlot}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-extrabold tracking-wide uppercase text-indigo-300/80">
                          {subject.id === "math"
                            ? "Major Session"
                            : "Standard Session"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── DAY 02 CARD ── */}
            <div className="relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-500/25 bg-gradient-to-b from-[#0f1f1e] via-[#0d171a] to-[#0c1214] p-4 sm:p-5 md:p-6 shadow-xl transition-all hover:border-emerald-500/40">
              {/* Day header banner */}
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-emerald-300 uppercase">
                    DAY 02
                  </span>
                  <h4 className="font-heading mt-1 text-lg sm:text-xl font-extrabold text-white">
                    Day 2
                  </h4>
                  <p className="text-[11px] font-semibold text-white/60">
                    Morning & Afternoon Examination
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-bold text-white/90">
                    3 Subjects
                  </span>
                  <span className="mt-0.5 text-[10px] font-semibold text-emerald-300/80">
                    200 Total Pts
                  </span>
                </div>
              </div>

              {/* Subject List for Day 2 */}
              <div className="mt-3.5 flex flex-1 flex-col gap-2.5">
                {DAY_2_SUBJECTS.map((subject) => {
                  const Icon = subject.icon;
                  return (
                    <div
                      key={subject.id}
                      className={`flex flex-col gap-1.5 rounded-xl sm:rounded-2xl border bg-white/[0.03] p-3 transition-all ${subject.colorScheme.border} hover:bg-white/[0.06]`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl ${subject.colorScheme.iconBg}`}
                          >
                            <Icon className="size-4 sm:size-4.5" strokeWidth={2.25} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-heading truncate text-xs sm:text-sm font-extrabold text-white">
                              {subject.name}
                            </div>
                            {subject.nameKm && (
                              <div className="truncate text-[10px] sm:text-xs font-bold text-white/60">
                                {subject.nameKm}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-0.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold ${subject.colorScheme.badge}`}
                          >
                            <Clock className="size-2.5 sm:size-3" strokeWidth={2.5} />
                            {subject.duration}
                          </span>
                          <span className="text-[9px] font-extrabold text-white/50">
                            {subject.weight}
                          </span>
                        </div>
                      </div>

                      {/* Visual indicator bar with session time */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-[10px] sm:text-[11px] font-semibold text-white/60">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-emerald-400" />
                          Session: {subject.timeSlot}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-extrabold tracking-wide uppercase text-emerald-300/80">
                          {subject.id === "language"
                            ? "Final Exam"
                            : "Standard Session"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Simulation Rules Section — 2x2 grid on mobile for compact scanability ── */}
        <section className="mb-8 sm:mb-12">
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider text-purple-400 uppercase">
              <ShieldAlert className="size-3.5" />
              <span>TESTING STANDARDS</span>
            </div>
            <h3 className="font-heading text-lg sm:text-xl md:text-2xl font-extrabold text-white">
              Simulation Rules
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
            {RULES.map((rule) => {
              const Icon = rule.icon;
              return (
                <div
                  key={rule.title}
                  className="flex flex-col rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-3 sm:p-4 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.07]"
                >
                  <div
                    className={`flex size-8 sm:size-9 items-center justify-center rounded-lg sm:rounded-xl border bg-gradient-to-br ${rule.accent}`}
                  >
                    <Icon className="size-4 sm:size-4.5" strokeWidth={2.25} />
                  </div>

                  <h4 className="font-heading mt-2 sm:mt-3 text-xs sm:text-sm font-extrabold text-white">
                    {rule.title}
                  </h4>

                  <p className="mt-1 text-[10px] sm:text-xs font-semibold leading-relaxed text-white/70">
                    {rule.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Bottom Final CTA Card ── */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-purple-500/30 bg-gradient-to-r from-indigo-950/80 via-purple-950/70 to-slate-950/80 p-5 sm:p-6 backdrop-blur-2xl shadow-2xl md:p-8">
          {/* Subtle glowing ambient lights */}
          <div className="pointer-events-none absolute -top-14 left-1/3 size-64 rounded-full bg-purple-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-14 right-1/4 size-64 rounded-full bg-pink-500/20 blur-3xl" />

          {/* Accent line */}
          <div className="pointer-events-none absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />

          <div className="relative flex flex-col items-center justify-between gap-4 sm:gap-6 text-center md:flex-row md:text-left">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] sm:text-xs font-extrabold text-purple-300">
                <Award className="size-3 text-[var(--brand-yellow)]" />
                <span>Bac II Benchmark Assessment</span>
              </div>

              <h3 className="font-heading mt-1.5 text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
                Ready to test yourself?
              </h3>

              <p className="mt-1 text-xs sm:text-sm font-semibold text-white/80 md:text-base">
                Start the full 2-day Bac II simulation and discover how prepared
                you really are.
              </p>
            </div>

            <div className="w-full shrink-0 sm:w-auto">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-brand px-6 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-cta-lg transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
              >
                <Play className="size-4 fill-white" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4">
          {/* Backdrop Scrim */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setShowConfirmModal(false)}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-gradient-to-b from-[#161a33] to-[#0c0e1d] p-5 sm:p-6 text-white shadow-2xl ring-1 ring-white/10">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3 sm:pb-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex size-10 sm:size-11 items-center justify-center rounded-xl sm:rounded-2xl bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30">
                  <GraduationCap className="size-5 sm:size-6" strokeWidth={2.25} />
                </div>
                <div>
                  <h4 className="font-heading text-base sm:text-lg font-extrabold text-white">
                    Start Bac II Simulation
                  </h4>
                  <p className="text-[11px] sm:text-xs font-semibold text-white/60">
                    Day 1 Session 1 · Mathematics
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex size-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Checklist items */}
            <div className="mt-3.5 sm:mt-4 space-y-2.5 sm:space-y-3">
              <div className="rounded-xl sm:rounded-2xl border border-purple-500/20 bg-purple-500/10 p-3 sm:p-3.5">
                <div className="flex items-start gap-2">
                  <Info className="size-4 shrink-0 text-purple-400 mt-0.5" />
                  <div className="text-xs font-semibold leading-relaxed text-purple-100">
                    You are about to start the official 2-day simulation. Once
                    you initiate Day 1, the timer begins for Mathematics (150
                    minutes).
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>Prepare scrap paper, pen, and a quiet desk</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>Timer does not pause if you close the browser</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>Full worked solutions provided after submission</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 sm:mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end border-t border-white/10 pt-3.5 sm:pt-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white transition order-2 sm:order-1"
              >
                Review Schedule
              </button>

              <Link
                to="/exam/subjects/math-2024"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-extrabold text-white shadow-cta hover:brightness-110 transition active:scale-[0.98] order-1 sm:order-2"
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
