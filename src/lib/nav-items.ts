import type { LucideIcon } from "lucide-react";
import {
  Home,
  BookOpen,
  ClipboardList,
  Layers,
  Gamepad2,
  Trophy,
  Library,
  User,
  Users,
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
    label: { en: "Lessons", km: "មេរៀនគ្រឹះ & ទី 12" },
    shortLabel: { en: "Study", km: "រៀន" },
    icon: BookOpen,
  },
  {
    id: "flashcards",
    // Was `null` — a disabled "Soon" placeholder — until the practice feature
    // landed. No shortLabel: that field only serves the 5-tab BottomNav, and
    // this item is a drawer/sidebar destination, not one of those five.
    href: "/practice",
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
    id: "grade-prediction",
    href: "/grade-prediction",
    label: { en: "Grade Prediction", km: "ព្យាករណ៍និទ្ទេស" },
    icon: Gauge,
  },
  {
    id: "game",
    href: "/game",
    label: { en: "Game", km: "ហ្គេម" },
    icon: Gamepad2,
  },
  {
    id: "leaderboard",
    href: "/leaderboard",
    label: { en: "Leaderboard", km: "ចំណាត់ថ្នាក់" },
    icon: Trophy,
  },
  // ── TWO ROUTES ARE DELIBERATELY ABSENT FROM THIS LIST. DON'T ADD THEM BACK.
  //
  // The list was getting long, and both already have a doorway on Home that
  // shows the very thing the page is about — a nav row would be a second
  // entrance to a screen the student is looking at the summary of:
  //
  //   /roadmap  ← the "Quest Map" chip in features/home/components/
  //               motivation-hero.tsx. It is also where a student lands
  //               straight out of the survey, and ShellLayout's onboarding lock
  //               (app.tsx) hides all chrome there until the pledge is seen —
  //               so for the one student who most needs it, a nav row was never
  //               visible in the first place.
  //   /streak   ← the Flame stat pill in features/home/components/
  //               stat-pills.tsx, which renders that exact count.
  //
  // "Streak with Friends" below keeps its row because nothing on Home hints
  // that it exists. Neither removal touches `bottomNavItems`: it takes Progress
  // by `featureNavItems[0]`, still index 0, and Game by id — which is precisely
  // the reason that lookup is by id rather than position.
  {
    id: "library",
    href: null,
    label: { en: "Document Library", km: "បណ្ដាល័យឯកសារ" },
    icon: Library,
  },
  {
    id: "friends",
    // Was `null` — a disabled "Soon" placeholder — until the friends board
    // landed. Nested under /streak because it is the same number seen a
    // different way; see pages/streak-friends.tsx.
    href: "/streak/friends",
    // Users, not Flame: this sits two rows under the Streak page above, and two
    // identical flames in one list stop the icon carrying any signal. The
    // social half is what distinguishes this item, so that is what the icon
    // says.
    // "with", never "w/" — the abbreviation saves four characters and reads as
    // a typo in a menu a student sees every day.
    label: { en: "Streak with Friends", km: "Streak ជាមួយមិត្តភក្តិ" },
    icon: Users,
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
  // By id, not position: featureNavItems was reordered for the drawer/sidebar
  // (Progress, Grade Prediction, Game, Leaderboard, Roadmap, ...), and a fixed
  // index here would have silently swapped in Grade Prediction instead of Game.
  featureNavItems.find((item) => item.id === "game")!,
];
