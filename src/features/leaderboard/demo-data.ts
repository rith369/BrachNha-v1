// ============================================================
// DEMO DATA — Leaderboard
// ------------------------------------------------------------
// Fake, fixed data on purpose, the same call already made for
// Progress, Game and Grade Prediction. A real leaderboard needs
// a server: cross-student ranking, a per-day activity log and a
// notion of "productive" minutes that the app does not track
// yet. Until that exists, a hard-coded cohort keeps the screen
// polished and crash-proof instead of showing one student alone
// at #1 with 0 XP.
//
// What real data would have to exist to switch this over:
//   • a per-student XP ledger with timestamps (weekly/monthly
//     windows are sums over it, not stored totals)
//   • a daily activity log, so "current streak" and "longest
//     streak in the last 30 days" are derivable
//   • ACTIVE study minutes — time inside a lesson, practice
//     question or exam, with idle time excluded. This is the
//     one the product cares most about: minutes counted from
//     "app is open" would make leaving a phone unlocked a
//     winning strategy, which is the opposite of the point.
//
// The one live value on this screen is the student's own NAME,
// read from the store at render time — the rows below are the
// cohort they are being placed against.
//
// Rows are written in WEEKLY XP order for readability only.
// Nothing depends on the array order; every board is ranked by
// utils/leaderboard.ts at render time, which is what lets the
// three metrics disagree about who is #1.
// ============================================================

import type { LeaderboardStudent } from "@/utils/leaderboard";

/** Shown under the page title — this is a class-sized board, not the country. */
export const COHORT_LABEL = { en: "Grade 12 · Science", km: "ថ្នាក់ទី១២ · វិទ្យាសាស្ត្រ" };

export const LEADERBOARD_STUDENTS: LeaderboardStudent[] = [
  {
    id: "dara",
    name: "Dara Chhun",
    avatarSeed: "dara",
    weekly: { xp: 3420, streak: 24, studyMinutes: 980 },
    monthFactor: 4.2,
    allTimeFactor: 12.5,
    streakMonth: 26,
    streakAllTime: 31,
    momentum: { xp: 2, streak: -1, studyTime: 3 },
  },
  {
    id: "sopheak",
    name: "Sopheak Ly",
    avatarSeed: "sopheak",
    weekly: { xp: 3280, streak: 21, studyMinutes: 1122 },
    monthFactor: 4.6,
    allTimeFactor: 11.0,
    streakMonth: 24,
    streakAllTime: 28,
    momentum: { xp: -1, streak: 2, studyTime: 4 },
  },
  {
    id: "lina",
    name: "Lina Chea",
    avatarSeed: "lina",
    weekly: { xp: 3150, streak: 28, studyMinutes: 895 },
    monthFactor: 3.9,
    allTimeFactor: 8.6,
    streakMonth: 28,
    streakAllTime: 34,
    momentum: { xp: 3, streak: 5, studyTime: -2 },
  },
  {
    id: "visal",
    name: "Visal Prum",
    avatarSeed: "visal",
    weekly: { xp: 2850, streak: 14, studyMinutes: 800 },
    monthFactor: 4.4,
    allTimeFactor: 13.2,
    streakMonth: 20,
    streakAllTime: 26,
    momentum: { xp: -2, streak: 1, studyTime: 2 },
  },
  {
    id: "chanlina",
    name: "Chanlina Nou",
    avatarSeed: "chanlina",
    weekly: { xp: 2790, streak: 14, studyMinutes: 750 },
    monthFactor: 3.6,
    allTimeFactor: 7.8,
    streakMonth: 18,
    streakAllTime: 22,
    momentum: { xp: 6, streak: 3, studyTime: 5 },
  },
  {
    id: "kimnak",
    name: "Kimnak Dara",
    avatarSeed: "kimnak",
    weekly: { xp: 2745, streak: 17, studyMinutes: 862 },
    monthFactor: 4.1,
    allTimeFactor: 10.4,
    streakMonth: 22,
    streakAllTime: 27,
    momentum: { xp: 1, streak: -2, studyTime: 1 },
  },
  {
    id: "rithy",
    name: "Rithy Sok",
    avatarSeed: "rithy",
    weekly: { xp: 2712, streak: 9, studyMinutes: 830 },
    monthFactor: 3.4,
    allTimeFactor: 9.6,
    streakMonth: 12,
    streakAllTime: 16,
    momentum: { xp: 4, streak: 2, studyTime: -3 },
  },
  {
    id: "sreyroth",
    name: "Srey Roth",
    avatarSeed: "sreyroth",
    weekly: { xp: 2686, streak: 9, studyMinutes: 774 },
    monthFactor: 4.5,
    allTimeFactor: 12.8,
    streakMonth: 18,
    streakAllTime: 25,
    momentum: { xp: -3, streak: 4, studyTime: 2 },
  },
  {
    id: "bopha",
    name: "Bopha Sam",
    avatarSeed: "bopha",
    weekly: { xp: 2662, streak: 16, studyMinutes: 673 },
    monthFactor: 3.8,
    allTimeFactor: 8.2,
    streakMonth: 20,
    streakAllTime: 26,
    momentum: { xp: 5, streak: 6, studyTime: 3 },
  },
  {
    id: "vichea",
    name: "Vichea Hong",
    avatarSeed: "vichea",
    weekly: { xp: 2640, streak: 17, studyMinutes: 708 },
    monthFactor: 4.0,
    allTimeFactor: 11.6,
    streakMonth: 19,
    streakAllTime: 23,
    momentum: { xp: 2, streak: -1, studyTime: 4 },
  },
  {
    id: "sreyneang",
    name: "Sreyneang Kim",
    avatarSeed: "sreyneang",
    weekly: { xp: 2620, streak: 19, studyMinutes: 657 },
    monthFactor: 3.5,
    allTimeFactor: 7.0,
    streakMonth: 21,
    streakAllTime: 24,
    momentum: { xp: 7, streak: 3, studyTime: 1 },
  },
  {
    id: "daravuth",
    name: "Daravuth Meas",
    avatarSeed: "daravuth",
    weekly: { xp: 2600, streak: 10, studyMinutes: 728 },
    monthFactor: 4.3,
    allTimeFactor: 12.0,
    streakMonth: 16,
    streakAllTime: 23,
    momentum: { xp: -4, streak: 2, studyTime: -1 },
  },
  {
    id: "sovann",
    name: "Sovann Rith",
    avatarSeed: "sovann",
    weekly: { xp: 2578, streak: 15, studyMinutes: 628 },
    monthFactor: 3.2,
    allTimeFactor: 6.6,
    streakMonth: 16,
    streakAllTime: 19,
    momentum: { xp: 3, streak: 1, studyTime: 6 },
  },
  {
    id: "malis",
    name: "Malis Chan",
    avatarSeed: "malis",
    weekly: { xp: 2556, streak: 16, studyMinutes: 616 },
    monthFactor: 3.7,
    allTimeFactor: 9.0,
    streakMonth: 17,
    streakAllTime: 20,
    momentum: { xp: 1, streak: 4, studyTime: -2 },
  },
  {
    id: "sokhatin",
    name: "Sokha Tith",
    avatarSeed: "sokhatin",
    weekly: { xp: 2534, streak: 11, studyMinutes: 690 },
    monthFactor: 4.6,
    allTimeFactor: 13.5,
    streakMonth: 15,
    streakAllTime: 21,
    momentum: { xp: -2, streak: -3, studyTime: 2 },
  },
  {
    id: "sothea",
    name: "Sothea Vann",
    avatarSeed: "sothea",
    weekly: { xp: 2512, streak: 8, studyMinutes: 605 },
    monthFactor: 3.3,
    allTimeFactor: 6.8,
    streakMonth: 11,
    streakAllTime: 15,
    momentum: { xp: 4, streak: 2, studyTime: 3 },
  },
  {
    id: "nita",
    name: "Nita Pen",
    avatarSeed: "nita",
    weekly: { xp: 2490, streak: 11, studyMinutes: 596 },
    monthFactor: 3.9,
    allTimeFactor: 8.8,
    streakMonth: 14,
    streakAllTime: 17,
    momentum: { xp: 2, streak: 5, studyTime: -1 },
  },
  {
    // The signed-in student. `name` is only a fallback — the components render
    // the real name off the store, so the board says "Keo", not "You", once
    // someone has logged in. Deliberately outside the top 10 on all three
    // boards: the sticky card and the "N to reach #X" line are the parts of
    // this screen most worth seeing, and a demo that opens at #2 never shows
    // them. The three ranks that fall out are #18 XP, #12 streak, #24 study
    // time — one student, three different standings, which is the whole point.
    id: "you",
    name: "You",
    avatarSeed: "panharith",
    isCurrentUser: true,
    weekly: { xp: 2430, streak: 12, studyMinutes: 522 },
    monthFactor: 3.6,
    allTimeFactor: 7.4,
    streakMonth: 18,
    streakAllTime: 24,
    momentum: { xp: 3, streak: 4, studyTime: 2 },
  },
  {
    id: "rattana",
    name: "Rattana Khiev",
    avatarSeed: "rattana",
    weekly: { xp: 2380, streak: 10, studyMinutes: 642 },
    monthFactor: 4.2,
    allTimeFactor: 10.8,
    streakMonth: 13,
    streakAllTime: 18,
    momentum: { xp: -1, streak: 3, studyTime: 5 },
  },
  {
    id: "sereypich",
    name: "Sereypich Em",
    avatarSeed: "sereypich",
    weekly: { xp: 2320, streak: 7, studyMinutes: 588 },
    monthFactor: 3.1,
    allTimeFactor: 6.2,
    streakMonth: 10,
    streakAllTime: 14,
    momentum: { xp: 5, streak: -2, studyTime: 1 },
  },
  {
    id: "chenda",
    name: "Chenda Yun",
    avatarSeed: "chenda",
    weekly: { xp: 2255, streak: 8, studyMinutes: 581 },
    monthFactor: 3.8,
    allTimeFactor: 9.4,
    streakMonth: 13,
    streakAllTime: 19,
    momentum: { xp: 2, streak: 6, studyTime: 3 },
  },
  {
    id: "piseth",
    name: "Piseth Nhem",
    avatarSeed: "piseth",
    weekly: { xp: 2185, streak: 6, studyMinutes: 576 },
    monthFactor: 3.0,
    allTimeFactor: 5.8,
    streakMonth: 9,
    streakAllTime: 13,
    momentum: { xp: -3, streak: 1, studyTime: -2 },
  },
  {
    id: "kunthea",
    name: "Kunthea Sar",
    avatarSeed: "kunthea",
    weekly: { xp: 2110, streak: 7, studyMinutes: 573 },
    monthFactor: 4.4,
    allTimeFactor: 11.2,
    streakMonth: 12,
    streakAllTime: 18,
    momentum: { xp: 6, streak: 2, studyTime: 4 },
  },
  {
    id: "makara",
    name: "Makara Long",
    avatarSeed: "makara",
    weekly: { xp: 2030, streak: 6, studyMinutes: 470 },
    monthFactor: 3.4,
    allTimeFactor: 7.2,
    streakMonth: 11,
    streakAllTime: 16,
    momentum: { xp: 1, streak: -1, studyTime: 2 },
  },
  {
    id: "vannak",
    name: "Vannak Tep",
    avatarSeed: "vannak",
    weekly: { xp: 1945, streak: 5, studyMinutes: 570 },
    monthFactor: 4.8,
    allTimeFactor: 14.0,
    streakMonth: 9,
    streakAllTime: 15,
    momentum: { xp: 8, streak: 4, studyTime: 7 },
  },
  {
    id: "leakhena",
    name: "Leakhena Chum",
    avatarSeed: "leakhena",
    weekly: { xp: 1850, streak: 5, studyMinutes: 432 },
    monthFactor: 3.2,
    allTimeFactor: 6.0,
    streakMonth: 8,
    streakAllTime: 12,
    momentum: { xp: -2, streak: 3, studyTime: 1 },
  },
  {
    id: "samnang",
    name: "Samnang Meas",
    avatarSeed: "samnang",
    weekly: { xp: 1745, streak: 4, studyMinutes: 398 },
    monthFactor: 4.0,
    allTimeFactor: 9.8,
    streakMonth: 7,
    streakAllTime: 11,
    momentum: { xp: 4, streak: 5, studyTime: 2 },
  },
  {
    id: "theary",
    name: "Theary Sok",
    avatarSeed: "theary",
    weekly: { xp: 1630, streak: 3, studyMinutes: 360 },
    monthFactor: 2.9,
    allTimeFactor: 5.2,
    streakMonth: 6,
    streakAllTime: 9,
    momentum: { xp: 2, streak: 1, studyTime: 3 },
  },
  {
    id: "borey",
    name: "Borey Chan",
    avatarSeed: "borey",
    weekly: { xp: 1500, streak: 2, studyMinutes: 318 },
    monthFactor: 3.5,
    allTimeFactor: 7.6,
    streakMonth: 5,
    streakAllTime: 10,
    momentum: { xp: 3, streak: 2, studyTime: -1 },
  },
  {
    id: "sokunthea",
    name: "Sokunthea Pich",
    avatarSeed: "sokunthea",
    weekly: { xp: 1355, streak: 2, studyMinutes: 265 },
    monthFactor: 3.1,
    allTimeFactor: 5.6,
    streakMonth: 4,
    streakAllTime: 7,
    momentum: { xp: 1, streak: 3, studyTime: 4 },
  },
];
