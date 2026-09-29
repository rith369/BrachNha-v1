// ============================================================
// SAMPLE COHORT — Leaderboard
// ------------------------------------------------------------
// Made-up students, KEPT ON PURPOSE beside the real ones. The
// board ranks three sources together (see utils/leaderboard.ts):
// these rows, real students from the leaderboard() SQL function,
// and the viewer's own live row. The user's call: a board with
// a handful of real students looks empty, so the sample cohort
// stays and fills it.
//
// THESE ROWS ARE NOT MARKED ON SCREEN (29 Sep 2026). They used to
// carry a "Sample" pill on the podium and in the list; the user
// had it removed. fromDemo() still sets `isSample`, which nothing
// reads now; it is what a mark would key on if it comes back.
//
// SCALED TO A YOUNG APP (29 Sep 2026, the user's call). These rows
// were authored at 1,300–3,400 XP and up to 28-day streaks a WEEK,
// which looked implausible beside real accounts. Every tab now stays
// under 5 days of streak, 2,000 XP and 2h of study: weekly 385–975
// XP, factors 1.2–1.8 (month) and 1.4–2.0 (all time). Titles come
// from all-time XP, so every row here reads "Beginner". Keep any new
// or edited row inside those limits on ALL THREE tabs.
//
// There is NO "You" row here any more. The viewer's row is built
// from the store — their real XP, streak and study minutes.
//
// Rows are written in WEEKLY XP order for readability only.
// Nothing depends on the array order; every board is ranked by
// utils/leaderboard.ts at render time, which is what lets the
// three metrics disagree about who is #1.
// ============================================================

import type { DemoLeaderboardStudent } from "@/utils/leaderboard";

/** Shown under the page title — this is a class-sized board, not the country. */
export const COHORT_LABEL = { en: "Grade 12 · Science", km: "ថ្នាក់ទី 12 · វិទ្យាសាស្ត្រ" };

export const LEADERBOARD_STUDENTS: DemoLeaderboardStudent[] = [
  {
    id: "dara",
    name: "Dara Chhun",
    avatarSeed: "dara",
    weekly: { xp: 975, streak: 4, studyMinutes: 50 },
    monthFactor: 1.61,
    allTimeFactor: 1.9,
    streakMonth: 4,
    streakAllTime: 4,
    momentum: { xp: 2, streak: -1, studyTime: 3 },
  },
  {
    id: "sopheak",
    name: "Sopheak Ly",
    avatarSeed: "sopheak",
    weekly: { xp: 935, streak: 4, studyMinutes: 58 },
    monthFactor: 1.74,
    allTimeFactor: 1.8,
    streakMonth: 4,
    streakAllTime: 4,
    momentum: { xp: -1, streak: 2, studyTime: 4 },
  },
  {
    id: "lina",
    name: "Lina Chea",
    avatarSeed: "lina",
    weekly: { xp: 900, streak: 4, studyMinutes: 46 },
    monthFactor: 1.52,
    allTimeFactor: 1.63,
    streakMonth: 4,
    streakAllTime: 4,
    momentum: { xp: 3, streak: 5, studyTime: -2 },
  },
  {
    id: "visal",
    name: "Visal Prum",
    avatarSeed: "visal",
    weekly: { xp: 810, streak: 2, studyMinutes: 41 },
    monthFactor: 1.67,
    allTimeFactor: 1.95,
    streakMonth: 3,
    streakAllTime: 3,
    momentum: { xp: -2, streak: 1, studyTime: 2 },
  },
  {
    id: "chanlina",
    name: "Chanlina Nou",
    avatarSeed: "chanlina",
    weekly: { xp: 795, streak: 2, studyMinutes: 39 },
    monthFactor: 1.42,
    allTimeFactor: 1.58,
    streakMonth: 3,
    streakAllTime: 3,
    momentum: { xp: 6, streak: 3, studyTime: 5 },
  },
  {
    id: "kimnak",
    name: "Kimnak Dara",
    avatarSeed: "kimnak",
    weekly: { xp: 780, streak: 3, studyMinutes: 44 },
    monthFactor: 1.58,
    allTimeFactor: 1.75,
    streakMonth: 3,
    streakAllTime: 3,
    momentum: { xp: 1, streak: -2, studyTime: 1 },
  },
  {
    id: "rithy",
    name: "Rithy Sok",
    avatarSeed: "rithy",
    weekly: { xp: 775, streak: 2, studyMinutes: 43 },
    monthFactor: 1.36,
    allTimeFactor: 1.7,
    streakMonth: 2,
    streakAllTime: 2,
    momentum: { xp: 4, streak: 2, studyTime: -3 },
  },
  {
    id: "sreyroth",
    name: "Srey Roth",
    avatarSeed: "sreyroth",
    weekly: { xp: 765, streak: 2, studyMinutes: 40 },
    monthFactor: 1.71,
    allTimeFactor: 1.92,
    streakMonth: 3,
    streakAllTime: 3,
    momentum: { xp: -3, streak: 4, studyTime: 2 },
  },
  {
    id: "bopha",
    name: "Bopha Sam",
    avatarSeed: "bopha",
    weekly: { xp: 760, streak: 3, studyMinutes: 35 },
    monthFactor: 1.48,
    allTimeFactor: 1.6,
    streakMonth: 3,
    streakAllTime: 3,
    momentum: { xp: 5, streak: 6, studyTime: 3 },
  },
  {
    id: "vichea",
    name: "Vichea Hong",
    avatarSeed: "vichea",
    weekly: { xp: 750, streak: 3, studyMinutes: 36 },
    monthFactor: 1.55,
    allTimeFactor: 1.84,
    streakMonth: 3,
    streakAllTime: 3,
    momentum: { xp: 2, streak: -1, studyTime: 4 },
  },
  {
    id: "sreyneang",
    name: "Sreyneang Kim",
    avatarSeed: "sreyneang",
    weekly: { xp: 745, streak: 3, studyMinutes: 34 },
    monthFactor: 1.39,
    allTimeFactor: 1.52,
    streakMonth: 3,
    streakAllTime: 3,
    momentum: { xp: 7, streak: 3, studyTime: 1 },
  },
  {
    id: "daravuth",
    name: "Daravuth Meas",
    avatarSeed: "daravuth",
    weekly: { xp: 740, streak: 2, studyMinutes: 37 },
    monthFactor: 1.64,
    allTimeFactor: 1.86,
    streakMonth: 2,
    streakAllTime: 3,
    momentum: { xp: -4, streak: 2, studyTime: -1 },
  },
  {
    id: "sovann",
    name: "Sovann Rith",
    avatarSeed: "sovann",
    weekly: { xp: 735, streak: 3, studyMinutes: 32 },
    monthFactor: 1.29,
    allTimeFactor: 1.5,
    streakMonth: 3,
    streakAllTime: 3,
    momentum: { xp: 3, streak: 1, studyTime: 6 },
  },
  {
    id: "rattana",
    name: "Rattana Khiev",
    avatarSeed: "rattana",
    weekly: { xp: 680, streak: 2, studyMinutes: 33 },
    monthFactor: 1.61,
    allTimeFactor: 1.78,
    streakMonth: 2,
    streakAllTime: 2,
    momentum: { xp: -1, streak: 3, studyTime: 5 },
  },
  {
    id: "sereypich",
    name: "Sereypich Em",
    avatarSeed: "sereypich",
    weekly: { xp: 660, streak: 1, studyMinutes: 30 },
    monthFactor: 1.26,
    allTimeFactor: 1.47,
    streakMonth: 1,
    streakAllTime: 2,
    momentum: { xp: 5, streak: -2, studyTime: 1 },
  },
  {
    id: "chenda",
    name: "Chenda Yun",
    avatarSeed: "chenda",
    weekly: { xp: 645, streak: 1, studyMinutes: 30 },
    monthFactor: 1.48,
    allTimeFactor: 1.69,
    streakMonth: 2,
    streakAllTime: 2,
    momentum: { xp: 2, streak: 6, studyTime: 3 },
  },
  {
    id: "piseth",
    name: "Piseth Nhem",
    avatarSeed: "piseth",
    weekly: { xp: 625, streak: 1, studyMinutes: 30 },
    monthFactor: 1.23,
    allTimeFactor: 1.44,
    streakMonth: 1,
    streakAllTime: 2,
    momentum: { xp: -3, streak: 1, studyTime: -2 },
  },
  {
    id: "kunthea",
    name: "Kunthea Sar",
    avatarSeed: "kunthea",
    weekly: { xp: 600, streak: 1, studyMinutes: 30 },
    monthFactor: 1.67,
    allTimeFactor: 1.81,
    streakMonth: 2,
    streakAllTime: 2,
    momentum: { xp: 6, streak: 2, studyTime: 4 },
  },
  {
    id: "makara",
    name: "Makara Long",
    avatarSeed: "makara",
    weekly: { xp: 580, streak: 1, studyMinutes: 24 },
    monthFactor: 1.36,
    allTimeFactor: 1.54,
    streakMonth: 2,
    streakAllTime: 2,
    momentum: { xp: 1, streak: -1, studyTime: 2 },
  },
  {
    id: "vannak",
    name: "Vannak Tep",
    avatarSeed: "vannak",
    weekly: { xp: 555, streak: 1, studyMinutes: 29 },
    monthFactor: 1.8,
    allTimeFactor: 2,
    streakMonth: 1,
    streakAllTime: 2,
    momentum: { xp: 8, streak: 4, studyTime: 7 },
  },
  {
    id: "leakhena",
    name: "Leakhena Chum",
    avatarSeed: "leakhena",
    weekly: { xp: 525, streak: 1, studyMinutes: 22 },
    monthFactor: 1.29,
    allTimeFactor: 1.45,
    streakMonth: 1,
    streakAllTime: 2,
    momentum: { xp: -2, streak: 3, studyTime: 1 },
  },
  {
    id: "samnang",
    name: "Samnang Meas",
    avatarSeed: "samnang",
    weekly: { xp: 495, streak: 1, studyMinutes: 20 },
    monthFactor: 1.55,
    allTimeFactor: 1.71,
    streakMonth: 1,
    streakAllTime: 1,
    momentum: { xp: 4, streak: 5, studyTime: 2 },
  },
  {
    id: "theary",
    name: "Theary Sok",
    avatarSeed: "theary",
    weekly: { xp: 465, streak: 1, studyMinutes: 19 },
    monthFactor: 1.2,
    allTimeFactor: 1.4,
    streakMonth: 1,
    streakAllTime: 1,
    momentum: { xp: 2, streak: 1, studyTime: 3 },
  },
  {
    id: "borey",
    name: "Borey Chan",
    avatarSeed: "borey",
    weekly: { xp: 425, streak: 0, studyMinutes: 16 },
    monthFactor: 1.39,
    allTimeFactor: 1.56,
    streakMonth: 1,
    streakAllTime: 1,
    momentum: { xp: 3, streak: 2, studyTime: -1 },
  },
  {
    id: "sokunthea",
    name: "Sokunthea Pich",
    avatarSeed: "sokunthea",
    weekly: { xp: 385, streak: 0, studyMinutes: 14 },
    monthFactor: 1.26,
    allTimeFactor: 1.43,
    streakMonth: 1,
    streakAllTime: 1,
    momentum: { xp: 1, streak: 3, studyTime: 4 },
  },
];
