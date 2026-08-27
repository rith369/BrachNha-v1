import {
  Atom,
  BookOpenText,
  Dna,
  FlaskConical,
  Landmark,
  Languages,
  Sigma,
  type LucideIcon,
} from "lucide-react";
import { LESSONS } from "@/data/lessons";
import { FOUNDATION_SUBJECTS } from "@/utils/placement";
import type { UnderlineTab } from "@/components/ui/underline-tabs";

/**
 * THIS PAGE IS KHMER-ONLY, ON PURPOSE.
 *
 * Every string below is a Khmer literal rather than a `{ en, km }` pair behind
 * `T[lang]`, so the Study page renders Khmer even when the app is switched to
 * English. That is a product decision, not missing translation work — the same
 * one already recorded for KruAI, which always answers in Khmer whatever the
 * student typed (see ANSWER_LANG in utils/chat-prompt.ts).
 *
 * The consequence, stated plainly so nobody "fixes" it: toggling the app to
 * English leaves this one screen in Khmer.
 *
 * Flipping it back means giving these fields `{ en, km }` shapes and reading
 * them through `T[lang]`; this constant exists so the decision is greppable.
 */
export const LESSONS_PAGE_LANG = "km" as const;

/**
 * The two tabs, defined beside LESSONS_PAGE_LANG because the labels ARE the
 * Khmer page copy that constant governs. The control itself is the shared
 * components/ui/underline-tabs.tsx, which the exam page uses too.
 */
export type SubjectTab = "foundation" | "all";

export const SUBJECT_TABS: UnderlineTab<SubjectTab>[] = [
  { id: "foundation", label: "មូលដ្ឋានគ្រឹះ" },
  { id: "all", label: "មុខវិជ្ជា" },
];

/**
 * Every subject has its OWN colour — they are not drawn from the app's five
 * shared brand accents any more. Eight subjects cycling through five accents
 * meant three collisions, and a student cannot use colour to tell chemistry
 * from Khmer if both are mint.
 *
 * The values live in globals.css as two scales per subject (`--subject-*` and
 * `--color-subj-*`); see the long comment there for why one scale cannot work.
 * This id is what keys into both.
 */
export type SubjectId =
  | "math"
  | "physics"
  | "chemistry"
  | "biology"
  | "history"
  | "khmer"
  | "english"
  | "french";

export interface SubjectMeta {
  /** Matches the LESSONS key, FOUNDATION_SUBJECTS, and the translation keys. */
  id: SubjectId;
  /** Khmer display name. */
  name: string;
  /** Khmer teaser, line-clamped to two lines in the card. */
  blurb: string;
  /** Placeholder artwork and the empty-state mark. */
  icon: LucideIcon;
}

/**
 * Every Grade 12 subject. `english` and `french` are both listed because the
 * student picks one at Login (`userLanguage`); the view renders whichever was
 * chosen and drops the other, rather than showing both.
 */
export const SUBJECTS: SubjectMeta[] = [
  {
    id: "math",
    name: "គណិតវិទ្យា",
    blurb: "ស្វែងយល់ពីមូលដ្ឋានគ្រឹះ រូបមន្ត លំហាត់ និងវិធីដោះស្រាយបញ្ហាសម្រាប់ប្រឡង។",
    icon: Sigma,
  },
  {
    id: "physics",
    name: "រូបវិទ្យា",
    blurb: "ច្បាប់រូបវិទ្យា ចលនា កម្លាំង ថាមពល និងលំហាត់គណនាជាក់ស្តែង។",
    icon: Atom,
  },
  {
    id: "chemistry",
    name: "គីមីវិទ្យា",
    blurb: "រចនាសម្ព័ន្ធអាតូម ប្រតិកម្មគីមី សមីការ និងការគណនាម៉ូល។",
    icon: FlaskConical,
  },
  {
    id: "biology",
    name: "ជីវវិទ្យា",
    blurb: "កោសិកា រាងកាយមនុស្ស ប្រព័ន្ធសរីរាង្គ និងហ្សែន។",
    icon: Dna,
  },
  {
    id: "history",
    name: "ប្រវត្តិវិទ្យា",
    blurb: "ប្រវត្តិសាស្ត្រខ្មែរ និងពិភពលោក ព្រឹត្តិការណ៍សំខាន់ៗ និងកាលបរិច្ឆេទ។",
    icon: Landmark,
  },
  {
    id: "khmer",
    name: "ភាសាខ្មែរ",
    blurb: "អក្សរសាស្ត្រ វេយ្យាករណ៍ ការសរសេរអត្ថបទ និងការវិភាគកំណាព្យ។",
    icon: BookOpenText,
  },
  {
    id: "english",
    name: "អង់គ្លេស",
    blurb: "វេយ្យាករណ៍ ពាក្យសព្ទ ការអាន និងការសរសេរសម្រាប់ប្រឡងបាក់ឌុប។",
    icon: Languages,
  },
  {
    id: "french",
    name: "បារាំង",
    blurb: "វេយ្យាករណ៍ ពាក្យសព្ទ ការអាន និងការសរសេរសម្រាប់ប្រឡងបាក់ឌុប។",
    icon: Languages,
  },
];

/**
 * Rough minutes per lesson, used only to show a duration on the card. One named
 * constant rather than a per-subject guess: there is no real per-lesson timing
 * yet, and inventing eight different fake numbers would read as data when it
 * isn't. Replace this with real timings once lesson content lands.
 */
export const MINUTES_PER_LESSON = 3;

/**
 * How many lessons a subject actually has, counted from LESSONS rather than
 * authored alongside it. The card's number therefore cannot drift from the
 * content it describes — the same reason levelForCount() replaced a
 * hand-authored level in utils/activity-heatmap.ts.
 *
 * Most subjects return 0 today. That is the empty state, not a bug.
 */
export function lessonCountFor(subjectId: string): number {
  return Object.keys(LESSONS[subjectId] ?? {}).length;
}

/** The id of a subject's first lesson, or null when it has no content yet. */
export function firstLessonId(subjectId: string): string | null {
  const topic = Object.keys(LESSONS[subjectId] ?? {})[0];
  return topic ? `${subjectId}-${topic}` : null;
}

/**
 * The two tabs. Foundation is derived from FOUNDATION_SUBJECTS (already exactly
 * math/physics/chemistry, and shared with the survey and placement flow) rather
 * than hardcoded again here, so the two lists cannot drift apart.
 */
export function foundationSubjects(): SubjectMeta[] {
  return FOUNDATION_SUBJECTS.map(
    (id) => SUBJECTS.find((s) => s.id === id)!
  ).filter(Boolean);
}

/** All Grade 12 subjects, with only the student's chosen language included. */
export function allSubjects(userLanguage: string | undefined): SubjectMeta[] {
  const lang = userLanguage === "french" ? "french" : "english";
  return SUBJECTS.filter((s) => {
    if (s.id === "english" || s.id === "french") return s.id === lang;
    return true;
  });
}
