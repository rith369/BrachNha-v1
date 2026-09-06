import type { StreakMilestone } from "@/utils/streak";

/**
 * The milestone ladder.
 *
 * THIS IS NOT DEMO DATA, which is why it does not live in demo-data.ts beside
 * it. The rungs are a real product decision about how the streak is rewarded;
 * only the streak VALUE next door is fake. When per-day tracking lands,
 * demo-data.ts is deleted and this file survives untouched.
 *
 * Six rungs, front-loaded on purpose: 3 and 7 are close enough that a student
 * in their first week is never more than a few days from something, while 60
 * and 100 exist to be visible long before they are reachable. A ladder that
 * started at 30 would leave a new student staring at a bar that barely moves.
 *
 * Ascending order is authored here for readability only — utils/streak.ts
 * sorts before it ranks, so nothing breaks if a rung is inserted in the wrong
 * place.
 */
export const STREAK_MILESTONES: readonly StreakMilestone[] = [
  { days: 3, label: { en: "Beginner", km: "អ្នកចាប់ផ្តើម" } },
  { days: 7, label: { en: "One Week", km: "មួយសប្តាហ៍" } },
  { days: 14, label: { en: "Two Weeks", km: "ពីរសប្តាហ៍" } },
  { days: 30, label: { en: "Monthly Master", km: "មេជំនាញប្រចាំខែ" } },
  { days: 60, label: { en: "Dedicated Learner", km: "អ្នករៀនឧស្សាហ៍" } },
  { days: 100, label: { en: "Learning Legend", km: "កំពូលអ្នករៀន" } },
];
