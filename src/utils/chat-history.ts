import type { Lang } from "@/types";

/**
 * Pure helpers for the AI Mentor's conversation list. No store access — the
 * caller passes plain values in (this is `utils/`, not `lib/`).
 */

const TITLE_MAX = 44;

/**
 * Turns a student's first message into a list title.
 *
 * Truncation breaks on a space where there is one, but Khmer is written without
 * spaces between words, so a space-only rule would leave Khmer titles either
 * full-length or empty. The hard character cut is the fallback that keeps Khmer
 * working; it can split a cluster mid-word, which is acceptable for a list label.
 */
export function makeConversationTitle(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= TITLE_MAX) return clean;

  const cut = clean.slice(0, TITLE_MAX);
  const lastSpace = cut.lastIndexOf(" ");
  // Only break on a space if it isn't so early that the title becomes useless.
  const body = lastSpace > TITLE_MAX * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${body.trimEnd()}…`;
}

/** Midnight-to-midnight difference in days, ignoring clock time. */
function daysAgo(iso: string, now: Date): number {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return NaN;
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const b = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}

/**
 * "Today" / "Yesterday" / a short date — used both as a row subtitle and as the
 * heading each group of conversations sits under.
 */
export function relativeDay(iso: string, lang: Lang, now: Date = new Date()): string {
  const diff = daysAgo(iso, now);
  if (Number.isNaN(diff)) return "";
  if (diff <= 0) return lang === "en" ? "Today" : "ថ្ងៃនេះ";
  if (diff === 1) return lang === "en" ? "Yesterday" : "ម្សិលមិញ";

  return new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "km-KH", {
    day: "numeric",
    month: "short",
    // Only show the year once the conversation is from a previous one.
    ...(new Date(iso).getFullYear() !== now.getFullYear()
      ? { year: "numeric" }
      : {}),
  });
}
