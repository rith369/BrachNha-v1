import type { Lang } from "@/types";

// Kept here rather than in data/translations.ts: that table is flat strings,
// and the pledge sentence has to interpolate the student's real numbers.
// `**…**` marks the words that render bold — see renderEmphasis below.

export interface PledgeValues {
  name: string;
  grade: string;
  months: string;
  hours: number;
  lessons: number;
  practice: number;
  flashcards: number;
}

interface PledgeCopy {
  title: string;
  subtitle: string;
  pledge: (v: PledgeValues) => string;
  targetGrade: string;
  hoursADay: string;
  monthsLeft: string;
  draw: string;
  type: string;
  drawHint: string;
  clear: string;
  typePlaceholder: string;
  commit: string;
  later: string;
  close: string;
  committed: string;
  committedSub: string;
  /** Roadmap CTA label while the pledge is unsigned. */
  readyToCommit: string;
  signedOn: (date: string) => string;
  resign: string;
}

export const PLEDGE_COPY: Record<Lang, PledgeCopy> = {
  en: {
    title: "My Commitment",
    subtitle: "Sign your plan to make it real",
    pledge: (v) =>
      `I, **${v.name}**, commit to my Bac II goal. For the next **${v.months} months** I will study about **${v.hours} hours a day** — ${v.lessons} lessons, ${v.practice} practice questions and ${v.flashcards} flashcards — and aim for grade **${v.grade}**. When it gets hard, I keep going.`,
    targetGrade: "Target grade",
    hoursADay: "Hours a day",
    monthsLeft: "Months left",
    draw: "Draw",
    type: "Type",
    drawHint: "Sign with your finger",
    clear: "Clear",
    typePlaceholder: "Type your name",
    commit: "I Commit",
    later: "Maybe later",
    close: "Close",
    committed: "Committed!",
    committedSub: "Your word is on your roadmap now.",
    readyToCommit: "I'm ready — let's commit",
    signedOn: (date) => `Signed ${date}`,
    resign: "Re-sign",
  },
  km: {
    title: "ការសន្យារបស់ខ្ញុំ",
    subtitle: "ចុះហត្ថលេខាលើផែនការរបស់អ្នក",
    pledge: (v) =>
      `ខ្ញុំ **${v.name}** សន្យាថានឹងខិតខំដើម្បីគោលដៅបាក់ឌុបរបស់ខ្ញុំ។ ក្នុងរយៈពេល **${v.months} ខែ** ខាងមុខ ខ្ញុំនឹងរៀនប្រហែល **${v.hours} ម៉ោងក្នុងមួយថ្ងៃ** — មេរៀន ${v.lessons} លំហាត់ ${v.practice} និងកាតទន្លាប់ ${v.flashcards} — ហើយតម្រង់ទៅរកនិទ្ទេស **${v.grade}**។ ពេលណាមានការលំបាក ខ្ញុំនឹងមិនបោះបង់ឡើយ។`,
    targetGrade: "និទ្ទេសគោលដៅ",
    hoursADay: "ម៉ោង/ថ្ងៃ",
    monthsLeft: "ខែនៅសល់",
    draw: "គូរ",
    type: "វាយបញ្ចូល",
    drawHint: "ចុះហត្ថលេខាដោយម្រាមដៃ",
    clear: "សម្អាត",
    typePlaceholder: "វាយឈ្មោះរបស់អ្នក",
    commit: "ខ្ញុំសន្យា",
    later: "ពេលក្រោយ",
    close: "បិទ",
    committed: "សន្យារួចរាល់!",
    committedSub: "ពាក្យសន្យារបស់អ្នកនៅលើផែនទីបង្ហាញផ្លូវហើយ។",
    readyToCommit: "ខ្ញុំរួចរាល់ហើយ — សន្យាឥឡូវនេះ",
    signedOn: (date) => `ចុះហត្ថលេខា ${date}`,
    resign: "ចុះហត្ថលេខាឡើងវិញ",
  },
};

/** Splits a `**bold**`-marked string into segments for the pledge paragraph.
 *  Odd indices are the emphasised ones (the student's own numbers). */
export function splitEmphasis(text: string): { text: string; strong: boolean }[] {
  return text
    .split("**")
    .map((part, i) => ({ text: part, strong: i % 2 === 1 }))
    .filter((seg) => seg.text.length > 0);
}
