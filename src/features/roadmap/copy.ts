import type { Lang } from "@/types";
import { KM_MONTHS } from "@/utils/khmer-dates";
import type { MonthActivity } from "./study-plan";

/** The Roadmap's own wording, in both languages, like the other gamified pages.
 *  A number stays in Latin digits in both. */
const ROADMAP_COPY = {
  en: {
    targetGrade: "Target Grade",
    startNow: "Start now",
    thisMonth: "This month",
    focusOn: "Focus on",
    mixedPractice: "Review and practice",
    examTitle: "Exam simulation & weak areas",
    nothingRecorded: "No study recorded",
    kindSection: "Lesson",
    kindFlashcards: "Flashcard",
    kindQuiz: "Quiz",
    kindPaper: "Past paper",
    planCurrent: "This month's plan",
    planPast: "What you finished",
    planFuture: "The plan for this month",
    rollForward: "Anything you don't finish moves on to next month, so you never fall behind.",
    monthComplete: "You finished this month's plan!",
    pastEmpty: "Nothing was finished this month.",
    futureEmpty: "Nothing new is planned yet. Use this month to review what you have learned.",
    simulationTitle: "Bac II Simulation",
    simulationBlurb: "Sit the full exam the way it runs on the day.",
  },
  km: {
    targetGrade: "និទ្ទេសគោលដៅ",
    startNow: "ចាប់ផ្តើមឥឡូវនេះ",
    thisMonth: "ខែនេះ",
    focusOn: "ផ្តោតលើ",
    mixedPractice: "រំលឹក និងអនុវត្ត",
    examTitle: "ប្រឡងពិសោធ & តំបន់ខ្សោយ",
    nothingRecorded: "មិនមានការសិក្សាត្រូវបានកត់ត្រាទេ",
    kindSection: "មេរៀន",
    kindFlashcards: "Flashcard",
    kindQuiz: "Quiz",
    kindPaper: "វិញ្ញាសារឆ្នាំចាស់",
    planCurrent: "ផែនការខែនេះ",
    planPast: "អ្វីដែលអ្នកបានបញ្ចប់",
    planFuture: "ផែនការសម្រាប់ខែនេះ",
    rollForward: "អ្វីដែលមិនទាន់បញ្ចប់ នឹងរំកិលទៅខែបន្ទាប់ ដូច្នេះអ្នកមិនធ្លាក់ពីក្រោយទេ។",
    monthComplete: "អ្នកបានបញ្ចប់ផែនការខែនេះហើយ!",
    pastEmpty: "មិនមានអ្វីបានបញ្ចប់ក្នុងខែនេះទេ។",
    futureEmpty: "មិនទាន់មានអ្វីថ្មីក្នុងផែនការទេ។ ប្រើខែនេះដើម្បីរំលឹកអ្វីដែលអ្នកបានរៀន។",
    simulationTitle: "ប្រឡងបាក់ឌុបសាកល្បង",
    simulationBlurb: "ធ្វើការប្រឡងពេញលេញ ដូចថ្ងៃប្រឡងពិត។",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export function roadmapCopy(lang: Lang) {
  return ROADMAP_COPY[lang];
}

/** "November 2026" / "វិច្ឆិកា 2026". Khmer by hand: see utils/khmer-dates.ts. */
export function monthLabel(key: string, lang: Lang): string {
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(5, 7));
  if (lang === "km") return `${KM_MONTHS[month - 1]} ${year}`;
  return new Date(year, month - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

/** A month's progress line under its title. */
export function monthProgressLabel(done: number, total: number, lang: Lang): string {
  if (lang === "km") return `បានបញ្ចប់ ${done} / ${total}`;
  return `${done} of ${total} finished`;
}

export function pastCountLabel(done: number, lang: Lang): string {
  if (lang === "km") return `បានបញ្ចប់ ${done}`;
  return `${done} finished`;
}

export function toStudyLabel(total: number, lang: Lang): string {
  if (lang === "km") return `ត្រូវរៀន ${total}`;
  return `${total} to study`;
}

export function studiedTodayLabel(minutes: number, lang: Lang): string {
  if (lang === "km") return `រៀនថ្ងៃនេះ៖ ${minutes} នាទី`;
  return `Studied today: ${minutes} min`;
}

/** A weak subject the plan cannot include yet, said once rather than per month. */
export function waitingLabel(names: string, lang: Lang): string {
  if (lang === "km") {
    return `${names}៖ មេរៀននឹងមកដល់ឆាប់ៗ។ វានឹងចូលក្នុងផែនការរបស់អ្នក ពេលមេរៀនត្រូវបានចេញផ្សាយ។`;
  }
  return `${names}: lessons are coming soon. They join your plan once they are published.`;
}

/** What a month really held, or null when it holds nothing yet. */
export function activityLabel(a: MonthActivity, lang: Lang): string | null {
  if (a.answered === 0 && a.reviewed === 0 && a.minutes === 0) return null;
  const parts =
    lang === "km"
      ? [
          a.answered > 0 && `${a.answered} សំណួរ`,
          a.reviewed > 0 && `${a.reviewed} Flashcard`,
          a.minutes > 0 && `${a.minutes} នាទី`,
        ]
      : [
          a.answered > 0 && `${a.answered} ${a.answered === 1 ? "question" : "questions"}`,
          a.reviewed > 0 && `${a.reviewed} ${a.reviewed === 1 ? "flashcard" : "flashcards"}`,
          a.minutes > 0 && `${a.minutes} min`,
        ];
  return parts.filter(Boolean).join(" · ");
}
