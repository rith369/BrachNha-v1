import { LESSONS } from "@/data/lessons";
import type { Lang } from "@/types";

export const GRADE_HOURS: Record<string, number> = {
  A: 3.5,
  B: 2.5,
  C: 1.75,
  D: 1.25,
  E: 1,
};

export interface DailyMission {
  lessons: number;
  practice: number;
  flashcards: number;
}

// Time-budget model: recommended hours/day (from GRADE_HOURS) is converted
// to a count per activity via an assumed duration per unit, not by dividing
// the (currently tiny) real lesson/question inventory by days left — that
// would produce near-zero daily counts given how little content exists today.
const MINUTES_PER_LESSON = 20;
const MINUTES_PER_QUESTION = 3;
const MINUTES_PER_FLASHCARD = 2;
const BUDGET_SPLIT = { lessons: 0.35, practice: 0.4, flashcards: 0.25 };
const BASELINE_MONTHS = 6; // urgency multiplier is 1x at this timeline
const URGENCY_MIN = 0.7;
const URGENCY_MAX = 1.6;
// Flashcard review is a small spaced-repetition deck, not a scaling batch
// like practice questions — real study habits stay in a 2-6 card range
// regardless of how much time budget the grade/timeline math produces.
const FLASHCARDS_MIN = 2;
const FLASHCARDS_MAX = 6;

/** `monthsLeft` comes from monthsUntilExam() (utils/exam-date.ts), which
 *  guarantees >= 1 — this divides by it. */
export function computeDailyMission(
  grade: string,
  monthsLeft: number
): DailyMission {
  const minutesPerDay = (GRADE_HOURS[grade] ?? 2) * 60;
  const urgency = Math.min(
    URGENCY_MAX,
    Math.max(URGENCY_MIN, BASELINE_MONTHS / monthsLeft)
  );
  const budget = minutesPerDay * urgency;

  return {
    lessons: Math.max(
      1,
      Math.round((budget * BUDGET_SPLIT.lessons) / MINUTES_PER_LESSON)
    ),
    practice: Math.max(
      3,
      Math.round((budget * BUDGET_SPLIT.practice) / MINUTES_PER_QUESTION)
    ),
    flashcards: Math.min(
      FLASHCARDS_MAX,
      Math.max(
        FLASHCARDS_MIN,
        Math.round((budget * BUDGET_SPLIT.flashcards) / MINUTES_PER_FLASHCARD)
      )
    ),
  };
}

export interface RoadmapPhase {
  icon: string;
  month: number;
  title: string;
  subjects: string[];
  hasLessonContent: boolean;
}

const SUBJECT_ICONS: Record<string, string> = {
  math: "📐",
  physics: "⚛️",
  chemistry: "🧪",
  biology: "🧬",
  history: "📜",
  khmer: "📖",
  english: "🗣️",
  french: "🗣️",
};

function chunk<T>(items: T[], count: number): T[][] {
  const buckets: T[][] = Array.from({ length: count }, () => []);
  items.forEach((item, i) => buckets[i % count].push(item));
  return buckets;
}

export function buildRoadmapPhases(
  weaknesses: string[],
  months: number,
  subjectLabel: (subject: string) => string,
  lang: Lang
): RoadmapPhase[] {
  const contentMonths = Math.max(1, months - 1);
  const uniqueWeak = Array.from(new Set(weaknesses));

  const mixedTitle = lang === "en" ? "Mixed practice" : "អនុវត្តចម្រុះ";
  const focusOn = lang === "en" ? "Focus on" : "ផ្តោតលើ";

  const monthGroups: string[][] =
    uniqueWeak.length === 0
      ? Array.from({ length: contentMonths }, () => [])
      : uniqueWeak.length <= contentMonths
        ? [
            ...uniqueWeak.map((s) => [s]),
            ...Array.from(
              { length: contentMonths - uniqueWeak.length },
              () => []
            ),
          ]
        : chunk(uniqueWeak, contentMonths);

  const phases: RoadmapPhase[] = monthGroups.map((subjects, i) => ({
    icon: subjects.length ? SUBJECT_ICONS[subjects[0]] ?? "📚" : "📚",
    month: i + 1,
    title: subjects.length
      ? `${focusOn} ${subjects.map(subjectLabel).join(" & ")}`
      : mixedTitle,
    subjects,
    hasLessonContent: subjects.some((s) => !!LESSONS[s]),
  }));

  phases.push({
    icon: "🎯",
    month: months,
    title:
      lang === "en" ? "Exam simulation & weak areas" : "ប្រឡងពិសោធ & តំបន់ខ្សោយ",
    subjects: [],
    hasLessonContent: false,
  });

  return phases;
}
