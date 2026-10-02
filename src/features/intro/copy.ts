import {
  Atom,
  Award,
  BookOpen,
  Bot,
  Brain,
  Cog,
  Dna,
  FlaskConical,
  Globe,
  GraduationCap,
  Landmark,
  Laptop,
  Lightbulb,
  Rocket,
  School,
  Search,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * The three "why science" screens shown once, before Home.
 *
 * KHMER-ONLY, like the Study, Exam and Practice pages: the copy was supplied in
 * Khmer and an English column would be invented. The one change from the
 * supplied text is that "grade 12" is written with Latin digits, as every number
 * in the app is (npm run check:digits enforces it).
 *
 * NO EMOJI: the brief's 🎓 🏫 🧠 💻 ⚙️ 🤖 🧬 🔍 💡 🛠️ are Lucide icons here, the
 * swap the rest of the app made because emoji render differently per handset.
 */

export type IntroTone = "purple" | "pink" | "blue" | "mint" | "yellow";

export interface IntroPoint {
  icon: LucideIcon;
  label: string;
  tone: IntroTone;
}

export interface IntroSlide {
  id: "opportunities" | "paths" | "thinking";
  /** The big glyph in the centre of the artwork. */
  hero: LucideIcon;
  /** Small floating tiles around it. Decoration only, so no labels. */
  orbit: [IntroPoint["icon"], IntroTone][];
  /** Which fill the artwork's disc and the page glow take. */
  accent: "brand" | "ocean" | "flame";
  kicker?: string;
  title: string;
  lead: string[];
  /** "grid" = 2×2 cards (career fields), "steps" = a numbered column. */
  pointsLayout?: "grid" | "steps";
  points?: IntroPoint[];
  outro?: string[];
  cta: string;
}

export const INTRO_SLIDES: IntroSlide[] = [
  {
    id: "opportunities",
    hero: GraduationCap,
    orbit: [
      [Award, "yellow"],
      [Landmark, "blue"],
      [Globe, "mint"],
      [BookOpen, "pink"],
    ],
    accent: "brand",
    kicker: "ហេតុអ្វីត្រូវរៀនវិទ្យាសាស្ត្រ?",
    title: "ឱកាសកាន់តែទូលាយ",
    lead: [
      "គ្រឹះវិទ្យាសាស្ត្រដ៏រឹងមាំ ជួយអ្នកត្រៀមខ្លួនសម្រាប់កម្មវិធីសិក្សាល្អៗនៅសាកលវិទ្យាល័យ និងឱកាសអាហារូបករណ៍ជាច្រើន។",
    ],
    outro: [
      "សាងសង់ចំណេះដឹងរបស់អ្នកពីឥឡូវនេះ។ បើកផ្លូវកាន់តែច្រើនសម្រាប់អនាគតរបស់អ្នក។",
    ],
    cta: "បន្តទៀត",
  },
  {
    id: "paths",
    hero: School,
    orbit: [
      [Rocket, "pink"],
      [Atom, "blue"],
      [Sparkles, "yellow"],
      [FlaskConical, "mint"],
    ],
    accent: "ocean",
    title: "វិថីកាន់តែច្រើនក្រោយចប់ថ្នាក់ទី 12",
    lead: [
      "វិទ្យាសាស្ត្រ និងគណិតវិទ្យា បង្កើតជាគ្រឹះដ៏សំខាន់សម្រាប់ជំនាញដូចជា៖",
    ],
    pointsLayout: "grid",
    points: [
      { icon: Laptop, label: "ព័ត៌មានវិទ្យា (CS/IT)", tone: "blue" },
      { icon: Cog, label: "វិស្វកម្ម", tone: "yellow" },
      { icon: Bot, label: "AI & ទិន្នន័យ (Data)", tone: "purple" },
      { icon: Dna, label: "សុខាភិបាល & វេជ្ជសាស្ត្រ", tone: "mint" },
    ],
    outro: [
      "គ្រឹះថ្នាក់ទី 12 របស់អ្នក នឹងជួយអ្នកត្រៀមខ្លួនសម្រាប់អ្វីដែលនឹងមកដល់បន្ទាប់។",
    ],
    cta: "បន្តទៀត",
  },
  {
    id: "thinking",
    hero: Brain,
    orbit: [
      [Lightbulb, "yellow"],
      [Search, "blue"],
      [Atom, "purple"],
      [Wrench, "mint"],
    ],
    accent: "flame",
    title: "វិទ្យាសាស្ត្រគឺលើសពីរូបមន្ត",
    lead: ["វិទ្យាសាស្ត្របង្រៀនអ្នកឱ្យចេះ៖"],
    pointsLayout: "steps",
    points: [
      { icon: Search, label: "យល់ពីឫសគល់បញ្ហា", tone: "blue" },
      { icon: Lightbulb, label: "គិតបែបសមហេតុផល", tone: "yellow" },
      { icon: Wrench, label: "យកចំណេះដឹងទៅអនុវត្តជាក់ស្តែង", tone: "mint" },
    ],
    outro: [
      "អ្វីដែលអ្នករៀន មិនមែនសម្រាប់តែការប្រឡងនោះទេ។ អ្នកអាចប្រើការគិតបែបវិទ្យាសាស្ត្រក្នុងជីវិតប្រចាំថ្ងៃ និងដោះស្រាយបញ្ហាជាក់ស្តែងក្នុងពិភពលោក។",
    ],
    cta: "ចាប់ផ្តើមស្ទង់គ្រឹះរបស់ខ្ញុំ",
  },
];

/** Leaves the intro for Home. Not in the brief; see intro-view. */
export const INTRO_SKIP = "រំលង";
