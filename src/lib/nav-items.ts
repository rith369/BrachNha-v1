import type { LucideIcon } from "lucide-react";
import {
  Home,
  BookOpen,
  ClipboardList,
  Layers,
  Map,
  Gamepad2,
  Trophy,
  Library,
  Flame,
  User,
  LineChart,
  Gauge,
} from "lucide-react";

export interface NavItem {
  id: string;
  href: string | null; // null => disabled placeholder, not yet built
  label: { en: string; km: string };
  /** Compact label for the 5-tab bottom bar, where `label` is too long to fit. */
  shortLabel?: { en: string; km: string };
  icon: LucideIcon;
}

// ── Main section ──
export const mainNavItems: NavItem[] = [
  { id: "home", href: "/", label: { en: "Home", km: "ទំព័រដើម" }, icon: Home },
  {
    id: "exam",
    href: "/exam",
    label: { en: "Mock Exam", km: "វិញ្ញាសារត្រៀមប្រឡង" },
    shortLabel: { en: "Mock Exam", km: "ប្រឡង" },
    icon: ClipboardList,
  },
  {
    id: "lessons",
    href: "/lessons",
    label: { en: "Lessons", km: "មេរៀនគ្រឹះ & ទី១២" },
    shortLabel: { en: "Study", km: "រៀន" },
    icon: BookOpen,
  },
  {
    id: "flashcards",
    href: null,
    label: { en: "Flashcards/Quiz", km: "ការអនុវត្ត" },
    icon: Layers,
  },
];

// ── Features section ──
export const featureNavItems: NavItem[] = [
  {
    id: "progress",
    href: "/progress",
    label: { en: "Progress", km: "ការរីកចម្រើន" },
    icon: LineChart,
  },
  {
    id: "game",
    href: "/game",
    label: { en: "Game", km: "ហ្គេម" },
    icon: Gamepad2,
  },
  {
    id: "roadmap",
    href: "/roadmap",
    label: { en: "Roadmap", km: "ផែនទី" },
    icon: Map,
  },
  {
    id: "grade-prediction",
    href: "/grade-prediction",
    label: { en: "Grade Prediction", km: "ព្យាករណ៍និទ្ទេស" },
    icon: Gauge,
  },
  {
    id: "leaderboard",
    href: "/leaderboard",
    label: { en: "Leaderboard", km: "ចំណាត់ថ្នាក់" },
    icon: Trophy,
  },
  {
    id: "library",
    href: null,
    label: { en: "Document Library", km: "បណ្ដាល័យឯកសារ" },
    icon: Library,
  },
  {
    id: "friends",
    href: null,
    label: { en: "Streak w/ Friends", km: "ជួរជាមួយមិត្ត" },
    icon: Flame,
  },
  {
    id: "profile",
    href: "/profile",
    label: { en: "Profile", km: "ប្រវត្តិរូប" },
    icon: User,
  },
];

// ── Bottom nav (subset shown as quick-access tabs on small screens) ──
export const bottomNavItems: NavItem[] = [
  mainNavItems[0], // Home
  mainNavItems[2], // Lessons
  mainNavItems[1], // Exams
  featureNavItems[0], // Progress
  featureNavItems[1], // Game
];
