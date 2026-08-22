import type { MockExamQuestion, Lang } from "@/types";

export const MOCK_QS: MockExamQuestion[] = [
  // ── MATH ──
  {
    subj: "math",
    q: { en: "lim(x→0) sin(x)/x = ?", km: "lim(x→0) sin(x)/x = ?" },
    correct: "1",
    options: ["0", "1", "∞", "undefined"],
  },
  {
    subj: "math",
    q: { en: "P(rolling 6 on a dice)?", km: "P(ទទួល 6 ពីការបោះឡូតូ)?" },
    correct: "1/6",
    options: ["1/2", "1/6", "1/3", "1/12"],
  },
  {
    subj: "math",
    q: { en: "What is the derivative of x²?", km: "ដេរីវេ x² ជាអ្វី?" },
    correct: "2x",
    options: ["x", "2x", "x²", "2"],
  },
  {
    subj: "math",
    q: { en: "lim(x→∞) 1/x = ?", km: "lim(x→∞) 1/x = ?" },
    correct: "0",
    options: ["0", "1", "∞", "undefined"],
  },
  {
    subj: "math",
    q: {
      en: "P(A) = 0.3, P(B) = 0.4, P(A∩B) = 0.1. Find P(A∪B)?",
      km: "P(A∪B) = ?",
    },
    correct: "0.6",
    options: ["0.5", "0.6", "0.7", "0.8"],
  },

  // ── BIOLOGY ──
  {
    subj: "biology",
    q: { en: "Main function of neurons?", km: "មុខងារណឺរ៉ូន?" },
    correct: "Transmit signals",
    options: ["Produce energy", "Transmit signals", "Store memory", "Digest food"],
  },
  {
    subj: "biology",
    q: { en: "Which system digests food?", km: "ប្រព័ន្ធណារំលាយអាហារ?" },
    correct: "Digestive",
    options: ["Respiratory", "Digestive", "Circulatory", "Nervous"],
  },
  {
    subj: "biology",
    q: {
      en: "How many chambers does the human heart have?",
      km: "បេះដូងមានប្រហោងប៉ុន្មាន?",
    },
    correct: "4",
    options: ["2", "3", "4", "5"],
  },
  {
    subj: "biology",
    q: { en: "What is the powerhouse of the cell?", km: "អ្វីដែលផ្គត់ផ្គង់ថាមពលក្នុងកោសិកា?" },
    correct: "Mitochondria",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Vacuole"],
  },
  {
    subj: "biology",
    q: { en: "Where does photosynthesis occur?", km: "ការបំប្លែងពន្លឺកើតឡើងនៅឯណា?" },
    correct: "Chloroplast",
    options: ["Nucleus", "Mitochondria", "Chloroplast", "Ribosome"],
  },
];

// Note: the old content-questions.js also exported a DONORS list, used only
// by the Donate feature. Donate was removed from the app, so DONORS wasn't
// ported here — re-add it if Donate ever comes back.

export const QUOTES: Record<Lang, string[]> = {
  en: [
    "Success is the sum of small efforts, repeated day in and day out.",
    "The expert in anything was once a beginner.",
    "Study hard now, celebrate later!",
    "Your future self will thank you for today's effort.",
    "Don't watch the clock; do what it does — keep going!",
    "A little progress each day adds up to big results.",
  ],
  km: [
    "ភាពជោគជ័យ = ការខិតខំតូចៗ ម្តងហើយម្តងទៀត។",
    "អ្នកជំនាញធ្លាប់ជាអ្នកចាប់ផ្តើម។",
    "ប្រឹងឥឡូវ អបអរពេលក្រោយ!",
    "ខ្លួនឯងអនាគតនឹងថ្លែងអំណរគុណ។",
    "រីកចម្រើនតិចៗប្រចាំថ្ងៃ នាំឲ្យលទ្ធផលធំ!",
    "កុំមើលនាឡិកា ធ្វើអ្វីដែលវាធ្វើ — បន្ត!",
  ],
};
