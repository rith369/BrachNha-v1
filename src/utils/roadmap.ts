import type { Tasks } from "@/types";

export const GRADE_HOURS: Record<string, number> = {
  A: 3.5,
  B: 2.5,
  C: 1.75,
  D: 1.25,
  E: 1,
};

/** The day's work: lessons, practice QUESTIONS and flashcards. The pledge quotes it
 *  and dailyTargets() turns it into the missions. */
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
// Grade A near the exam would otherwise reach 5.6 hours a day, on top of school.
const MAX_MINUTES_PER_DAY = 240;
// What the practice budget's questions come to as quizzes.
const QUESTIONS_PER_QUIZ = 10;

/** Minutes a day for this grade and time left. */
function dailyMinutes(grade: string, monthsLeft: number): number {
  const urgency = Math.min(
    URGENCY_MAX,
    Math.max(URGENCY_MIN, BASELINE_MONTHS / monthsLeft)
  );
  return Math.min(MAX_MINUTES_PER_DAY, (GRADE_HOURS[grade] ?? 2) * 60 * urgency);
}

/** The hours the Roadmap and the pledge show: the same budget the targets come
 *  from, so the screen and the plan cannot disagree. To the nearest quarter hour. */
export function dailyHours(grade: string, monthsLeft: number): number {
  return Math.round((dailyMinutes(grade, monthsLeft) / 60) * 4) / 4;
}

/**
 * How many of each activity make today's missions. Flashcards and the challenge
 * are always one: a review already scales with the deck.
 *
 * A student with no target grade (a guest, or before the survey) has nothing to
 * scale from, so one of each.
 */
export function dailyTargets(grade: string, monthsLeft: number): Record<keyof Tasks, number> {
  if (!Object.hasOwn(GRADE_HOURS, grade)) {
    return { lesson: 1, practice: 1, flashcards: 1, challenge: 1 };
  }
  const mission = computeDailyMission(grade, monthsLeft);
  return {
    lesson: mission.lessons,
    practice: Math.max(1, Math.round(mission.practice / QUESTIONS_PER_QUIZ)),
    flashcards: 1,
    challenge: 1,
  };
}

/** `monthsLeft` comes from monthsUntilExam() (utils/exam-date.ts), which
 *  guarantees >= 1 — this divides by it. */
export function computeDailyMission(
  grade: string,
  monthsLeft: number
): DailyMission {
  const budget = dailyMinutes(grade, monthsLeft);

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
