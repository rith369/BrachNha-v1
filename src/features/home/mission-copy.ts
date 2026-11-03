import type { GiftResult, Lang, Tasks } from "@/types";
import { MISSIONS } from "@/utils/streak";

/** The words around the day's missions and the gift, in both languages. */
const COPY = {
  en: {
    streakKept: "Streak kept for today",
    streakHint: "Finish any 1 mission to keep your streak",
    openGift: "Open your gift",
    done: "Done",
  },
  km: {
    streakKept: "បានរក្សា Streak ថ្ងៃនេះហើយ",
    streakHint: "បញ្ចប់ភារកិច្ចណាមួយ ដើម្បីរក្សា Streak",
    openGift: "បើកអំណោយ",
    done: "រួច",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export function missionCopy(lang: Lang) {
  return COPY[lang];
}

/** "2 of 4 today. 2 more for your gift." */
export function giftLeftLabel(done: number, lang: Lang): string {
  const total = MISSIONS.length;
  const left = total - done;
  if (lang === "km") return `ថ្ងៃនេះ ${done} / ${total}។ នៅសល់ ${left} ទៀត ដើម្បីទទួលអំណោយ។`;
  return `${done} of ${total} today. ${left} more for your gift.`;
}

/** No `gift` on a device that did not open it: only the fact that it was opened syncs. */
export function giftOpenedLabel(gift: GiftResult | null, lang: Lang): string {
  if (lang === "km") {
    if (!gift) return "បានបើកអំណោយហើយ";
    return `បានបើកអំណោយ៖ +${gift.xp} XP និង +${gift.coins} កាក់${gift.protection ? " និង +1 ការការពារ Streak" : ""}`;
  }
  if (!gift) return "Gift opened";
  return `Gift opened: +${gift.xp} XP and +${gift.coins} coins${gift.protection ? " and +1 streak protection" : ""}`;
}

export function protectionSavedLabel(days: number, lang: Lang): string {
  if (lang === "km") {
    return days === 1
      ? "ការការពារ Streak បានរក្សា Streak របស់អ្នកកាលពីម្សិលមិញ"
      : `ការការពារ Streak បានរក្សា Streak របស់អ្នករយៈពេល ${days} ថ្ងៃ`;
  }
  return days === 1
    ? "Your streak was protected yesterday"
    : `Your streak was protected for ${days} days`;
}

/** A mission with a target above one says how many. One stays the usual wording. */
export function missionTargetLabel(
  task: keyof Tasks,
  target: number,
  lang: Lang
): string | null {
  if (target <= 1) return null;
  if (task === "lesson") {
    return lang === "km" ? `បញ្ចប់ ${target} ផ្នែកមេរៀន` : `Complete ${target} sections`;
  }
  if (task === "practice") {
    return lang === "km" ? `បញ្ចប់ ${target} Quiz` : `Complete ${target} quizzes`;
  }
  return null;
}
