import type { StreakMilestone } from "@/utils/streak";

/**
 * The SHARED ladder — milestones the two friends reach together.
 *
 * Same thresholds as ./milestones.ts and deliberately DIFFERENT names: the solo
 * page's rungs describe one student becoming something ("Beginner", "Monthly
 * Master"), these describe a pair ("Study Partners", "Dedicated Duo"). Sharing
 * one array and swapping only the labels was considered and rejected — the two
 * ladders are free to diverge the moment either page's rewards are tuned, and a
 * shared array would make that a refactor rather than an edit.
 *
 * The thresholds themselves are reused rather than re-argued: front-loading at
 * 3 and 7 matters more here, not less, because a pair breaks a run twice as
 * easily as one person does.
 *
 * Nothing else needs writing — `rankMilestones()` and `milestoneProgress()` in
 * utils/streak.ts take the array as an argument precisely so a second ladder
 * costs one file, and MilestoneCard/MilestoneProgress render whatever they are
 * handed.
 */
export const SHARED_MILESTONES: readonly StreakMilestone[] = [
  { days: 3, label: { en: "First Spark", km: "ផ្កាភ្លើងដំបូង" } },
  { days: 7, label: { en: "One Week", km: "មួយសប្តាហ៍" } },
  { days: 14, label: { en: "Two Weeks", km: "ពីរសប្តាហ៍" } },
  { days: 30, label: { en: "Study Partners", km: "ដៃគូសិក្សា" } },
  { days: 60, label: { en: "Dedicated Duo", km: "គូឧស្សាហ៍" } },
  { days: 100, label: { en: "Learning Legends", km: "កំពូលអ្នករៀនទាំងពីរ" } },
];
