import type { Lang } from "../types/index.js";

// Note: the old content-questions.js also exported a DONORS list, used only
// by the Donate feature. Donate was removed from the app, so DONORS wasn't
// ported here — re-add it if Donate ever comes back.

export const QUOTES: Record<Lang, string[]> = {
  en: [
    "Success is the sum of small efforts, repeated day in and day out.",
    "The expert in anything was once a beginner.",
    "Study hard now, celebrate later!",
    "Your future self will thank you for today's effort.",
    "Don't watch the clock; do what it does. Keep going!",
    "A little progress each day adds up to big results.",
  ],
  km: [
    "ភាពជោគជ័យ = ការខិតខំតូចៗ ម្តងហើយម្តងទៀត។",
    "អ្នកជំនាញធ្លាប់ជាអ្នកចាប់ផ្តើម។",
    "ប្រឹងឥឡូវ អបអរពេលក្រោយ!",
    "ខ្លួនឯងអនាគតនឹងថ្លែងអំណរគុណ។",
    "រីកចម្រើនតិចៗប្រចាំថ្ងៃ នាំឲ្យលទ្ធផលធំ!",
    "កុំមើលនាឡិកា ធ្វើអ្វីដែលវាធ្វើ។ បន្តទៅមុខ!",
  ],
};
