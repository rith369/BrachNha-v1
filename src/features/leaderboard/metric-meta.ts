import { Flame, Star, Timer, type LucideIcon } from "lucide-react";
import type { TranslationKey } from "@/data/translations";
import type { LeaderboardMetric, LeaderboardPeriod, StudentTitle } from "@/utils/leaderboard";

/**
 * How each board presents itself: icon, label, one-line description, colour.
 *
 * The spec for this screen wrote the three metrics as 🔥 / ⭐ / ⏱. They're
 * Lucide icons here for the reason the rest of the app is — emoji render
 * differently on every phone, and these three sit next to each other in a
 * segmented control where a size mismatch is obvious. The medals on the podium
 * stay emoji: 🥇🥈🥉 have no Lucide equivalent that reads as "first place".
 *
 * Colours are the ones the same three numbers already carry on Home's
 * StatPills (XP pink, streak yellow), so a student doesn't have to relearn
 * them here. They're --color-* accents, not --brand-*: these are icon and text
 * colours on a surface, which is exactly the split globals.css describes.
 */
export const METRIC_META: Record<
  LeaderboardMetric,
  {
    icon: LucideIcon;
    labelKey: TranslationKey;
    descKey: TranslationKey;
    /** Text/icon colour class. */
    color: string;
    /** Matching tint for the active pill and the primary-value chip. */
    tint: string;
  }
> = {
  streak: {
    icon: Flame,
    labelKey: "metricStreak",
    descKey: "rankedByStreak",
    color: "text-yellow",
    tint: "bg-yellow/10",
  },
  xp: {
    icon: Star,
    labelKey: "metricXp",
    descKey: "rankedByXp",
    color: "text-pink",
    tint: "bg-pink/10",
  },
  studyTime: {
    icon: Timer,
    labelKey: "metricStudyTime",
    descKey: "rankedByStudyTime",
    color: "text-blue",
    tint: "bg-blue/10",
  },
};

export const PERIOD_LABEL_KEY: Record<LeaderboardPeriod, TranslationKey> = {
  weekly: "periodWeekly",
  monthly: "periodMonthly",
  allTime: "periodAllTime",
};

export const TITLE_LABEL_KEY: Record<StudentTitle, TranslationKey> = {
  beginner: "titleBeginner",
  learner: "titleLearner",
  scholar: "titleScholar",
  achiever: "titleAchiever",
  expert: "titleExpert",
  master: "titleMaster",
};

/**
 * Podium accents. Deliberately the app's own three accents rather than
 * gold/silver/bronze metallics — a metallic gradient is the "casino" look this
 * screen is supposed to avoid, and neither #c0c0c0 nor #cd7f32 survives the
 * flip to dark mode. The 🥇🥈🥉 badge is what states the rank; the ring is just
 * enough differentiation to see the three apart at a glance.
 */
export const PODIUM_STYLE = [
  { medal: "🥇", ring: "ring-yellow/70", badge: "bg-yellow/15 text-yellow" },
  { medal: "🥈", ring: "ring-blue/60", badge: "bg-blue/15 text-blue" },
  { medal: "🥉", ring: "ring-pink/60", badge: "bg-pink/15 text-pink" },
];
