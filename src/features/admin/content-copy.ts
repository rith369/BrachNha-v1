import type { Lang } from "@/types";
import type { IssueCode } from "@/utils/content-check";
import type { ContentFail } from "@/lib/admin-content";

/**
 * The content editor's wording (/admin/content), in both languages, like
 * ./copy.ts. Its own file because only the editor's lazy chunks need it.
 *
 * Product terms stay Latin in Khmer (Flashcard, Quiz), every number is Latin
 * digits, and no string has an em dash. `km` is typed as `typeof en`, so a
 * line added in one language and forgotten in the other fails to compile.
 */

const en = {
  // ── The list (/admin/content) ────────────────────────────────────────────
  title: "Content",
  blurb:
    "Flashcards and practice quizzes. Anyone on the team can save a draft; students see a change only after the owner presses Publish.",
  tabs: { deck: "Flashcards", quiz: "Quizzes" },
  allSubjects: "All",
  empty: "Nothing here yet.",
  newItem: "New",
  newTitle: "Write something new",
  newBlurb: "Pick where it goes. Only places students can reach are listed.",
  noFreeSlots: "Every place in this subject already has something.",
  live: (v: number, n: number, deck: boolean) =>
    `Live: version ${v} · ${n} ${deck ? (n === 1 ? "card" : "cards") : n === 1 ? "question" : "questions"}`,
  notPublished: "Not published",
  draftBy: (name: string, when: string) => (name ? `Draft by ${name}, ${when}` : `Draft, ${when}`),

  importTitle: "Import a file",
  importBlurb:
    "A .json file of decks and quizzes, as content:export writes it. Each item arrives as a draft for you to check and publish.",
  importPublish:
    "Publish items that have never been published (only for the first move out of the code)",
  importChoose: "Choose a file",
  importBadFile: "That is not a content file.",
  importChecked: (items: number, errors: number, warnings: number) =>
    `${items} ${items === 1 ? "item" : "items"} checked: ${errors} ${errors === 1 ? "error" : "errors"}, ${warnings} ${warnings === 1 ? "warning" : "warnings"}.`,
  importFixFirst: "Fix the errors in the file first.",
  importGo: "Import",
  importDone: (published: number, drafts: number, skipped: number) =>
    `Done: ${published} published, ${drafts} saved as drafts, ${skipped} skipped because they already had a draft.`,
  ownerOnlyImport: "Only the owner can import a file.",

  // ── The editor (/admin/content/:kind/:key) ───────────────────────────────
  back: "All content",
  openInApp: "Open in the app",
  liveVersion: (v: number, by: string, when: string) =>
    by ? `Students see version ${v}, published by ${by}, ${when}.` : `Students see version ${v}, published ${when}.`,
  liveNone: "Not published: students see this as coming soon.",
  draftSaved: (by: string, when: string) =>
    by ? `Draft saved by ${by}, ${when}.` : `Draft saved ${when}.`,
  draftBase: (base: number, live: number) =>
    `This draft started from version ${base}; version ${live} has been published since.`,
  unsaved: "Unsaved changes",
  saveDraft: "Save draft",
  saved: "Draft saved.",
  publish: "Publish",
  publishedNow: (v: number) => `Published as version ${v}.`,
  ownerOnlyPublish: "Only the owner can publish. Save a draft and the owner will publish it.",
  fixBeforePublish: (n: number) =>
    `Fix ${n} ${n === 1 ? "error" : "errors"} before publishing.`,
  nothingToPublish: "Nothing new to publish.",
  discard: "Discard draft",
  confirmDiscard: "Confirm: discard draft",
  discarded: "Draft discarded.",
  undo: "Undo my changes",
  unpublish: "Hide from students",
  confirmUnpublish: "Confirm: hide from students",
  unpublished: "Hidden. Students see this as coming soon until it is published again.",
  historyTitle: "Versions",
  historyEmpty: "Never published.",
  versionRow: (v: number, by: string, when: string, n: number) =>
    `Version ${v} · ${n} items · ${by ? `${by}, ` : ""}${when}`,
  current: "Live",
  restore: "Restore as draft",
  confirmRestore: "Confirm: restore",
  restoreLoses: "Your unsaved changes will be replaced.",
  restored: (v: number) => `Version ${v} is now the draft. Publish it to make it live.`,
  leaveWarning: "You have unsaved changes.",

  checksTitle: "Checks",
  checksNone: "No problems found.",
  checksCount: (errors: number, warnings: number) =>
    `${errors} ${errors === 1 ? "error" : "errors"} · ${warnings} ${warnings === 1 ? "warning" : "warnings"}`,
  wholeList: "The list",
  issues: {
    empty: "is empty",
    tooLong: "is too long",
    math: "has maths that cannot be shown",
    khmerInMath: "has Khmer inside $…$, which shows as empty boxes",
    strayDollar: "has a $ that is not closed",
    khmerDigits: "has Khmer numerals; use 0-9",
    emDash: "has a long dash; use a comma or a full stop",
    tooFewOptions: "needs at least 2 options",
    tooManyOptions: "has more than 6 options",
    sameOptions: "has two options that are the same",
    correctMissing: "has no correct answer marked",
    badId: "has a broken id",
    duplicateId: "uses an id twice",
    emptyList: "is empty",
    letterOrder: "has ក. ខ. គ. ឃ. out of order",
    answersBunched: "has most correct answers on the same letter",
  } satisfies Record<IssueCode, string>,
  fields: {
    id: "Id",
    front: "Front",
    back: "Back",
    scenario: "Situation",
    q: "Question",
    prompt: "Question",
    options: "Options",
    option: (n: number) => `Option ${n}`,
    correct: "Correct answer",
    explanation: "Explanation",
    label: "Help title",
    note: (n: number) => `Rule line ${n}`,
    notes: "Rule",
    mistake: "Common mistake",
    similar: (n: number) => `Similar exercise ${n}`,
    similarList: "Similar exercises",
    foundation: (n: number) => `Foundation exercise ${n}`,
    foundationList: "Foundation exercises",
  },

  card: (n: number) => `Card ${n}`,
  frontLabel: "Front (the question)",
  backLabel: "Back (the answer)",
  addCard: "Add a card",
  question: (n: number) => `Question ${n}`,
  scenarioLabel: "Situation (optional, shown above the question)",
  promptLabel: "Question",
  optionsLabel: "Options: tap the circle beside the correct one",
  optionN: (n: number) => `Option ${n}`,
  addOption: "Add an option",
  removeOption: "Remove this option",
  correctMark: "Correct answer",
  explanationLabel: "Explanation (shown after answering)",
  helpTitle: "Help after answering",
  addHelp: "Add help",
  removeHelp: "Remove help",
  confirmRemoveHelp: "Confirm: remove help",
  helpLabel: "What it tests (title)",
  helpNote: "The rule (one line each)",
  helpMistake: "Common mistake (optional)",
  similarTitle: "Similar exercises",
  foundationTitle: "Foundation exercises",
  exercise: (n: number) => `Exercise ${n}`,
  addExercise: "Add an exercise",
  addQuestion: "Add a question",
  moveUp: "Move up",
  moveDown: "Move down",
  remove: "Remove",
  confirmRemove: "Confirm: remove",
  open: "Open",
  close: "Close",
  preview: "Preview",
  previewTitle: "As students see it",
  working: "Working…",
  cancel: "Cancel",

  // ── Explanations: hover with a mouse, tap with a finger ───────────────
  // Each is a claim about what the editor and the database do. Change the
  // rule, change the sentence, in both languages.
  whatIsThis: "What this means",
  labelsTitle: "What the labels mean:",
  draftChip: "Draft",
  tips: {
    newItem:
      "Start a deck or a quiz in a place in the app that has nothing yet. To change one that exists, open it from the list instead.",
    importFile:
      "Owner only. Load a file of decks and quizzes, for example one the developer made. The file is checked here first, and every item arrives as a draft for you to look at.",
    importPublish:
      "Only for the first move out of the code: items that were never published go live straight away as version 1. Leave it off for new content, so you can check it first.",
    live: "Students see this version. The number goes up by 1 every time the owner publishes.",
    notPublished: "Students see this as coming soon and cannot open it.",
    draft:
      "Changes that are saved but not live. Students do not see them until the owner presses Publish.",
    key: "This item's address in the app: the subject, then the lesson and section numbers. It never changes.",
    cardId:
      "The card's id. Each student's review history is kept under it, so it never changes and is never given to another card.",
    status:
      "Students only ever see the published version. Your changes stay a draft until the owner presses Publish.",
    checks:
      "The app checks your writing as you type. ✕ is an error and must be fixed before publishing. ! is advice and never blocks. Tap a problem to go to it, then point at it or tap it there to see how to fix it.",
    history:
      "Every time the owner publishes, the old version is kept here. Restore as draft copies an old version back, so the owner can publish it again. Hide from students turns the item back into coming soon until it is published again.",
    buttons:
      "Save draft keeps your changes; students do not see them. Publish (owner only) sends the draft to students; they get it the next time they open the app. Undo my changes goes back to what was last saved. Discard draft throws the saved draft away.",
    front: "The side students see first: a question, a word or a formula.",
    back: "The side shown when the student flips the card: the answer.",
    scenario: "Optional. A short situation, shown above the question in smaller text.",
    options:
      "Tap the circle beside the right answer. Start the options with ក. ខ. គ. ឃ. in that order, and put the right answers on different letters across the quiz, so students cannot guess.",
    explanation:
      "Shown after the student answers, right or wrong. Explain how to reach the answer, not only which letter it is.",
    help: "Optional extra help under the answer: the rule, the usual mistake, and exercises to practise.",
    helpLabel: "A short title for the rule, shown as the heading of the help.",
    helpNote: "The rule in 2 to 4 short lines, one point per line.",
    helpMistake: "The mistake students usually make here, in one sentence.",
    similar: "More questions of the same kind, for practice. They give no XP.",
    foundation: "Easier questions on the step a student who got it wrong probably missed.",
  },
  issueHelp: {
    empty: "Write something here.",
    tooLong: "Make it shorter.",
    math: "The maths between the $ signs has a typing mistake. Check the command names, and that every { has a }.",
    khmerInMath: "Move the Khmer words outside the $ signs. Only maths goes between them.",
    strayDollar: "Every $ needs a closing $ on the same line, with no space just inside either one.",
    khmerDigits: "Write numbers with 0-9, the way the exam paper does.",
    emDash: "Use a comma or a full stop instead of the long dash.",
    tooFewOptions: "Add another option.",
    tooManyOptions: "Remove options until there are 6 or fewer.",
    sameOptions: "Change one of the two options so they are different.",
    correctMissing: "Tap the circle beside the right answer.",
    badId: "Ask the developer: this item's id is broken.",
    duplicateId: "Ask the developer: two items share one id.",
    emptyList: "Add at least one card or question before publishing.",
    letterOrder: "Start the options with ក. ខ. គ. ឃ. in that order, from top to bottom.",
    answersBunched: "Move some right answers to other letters, so they are spread across ក, ខ, គ and ឃ.",
  } satisfies Record<IssueCode, string>,

  errors: {
    unconfigured: "That did not work. Check your connection and try again.",
    denied: "Your account is no longer an admin.",
    failed: "That did not work. Check your connection and try again.",
    owner_only: "Only the owner can do this.",
    key: "That is not a place a student can reach.",
    shape: "The database refused it",
    stale:
      "Someone changed this since you opened it. Copy anything you need, then reload the page.",
    missing: "There is nothing to publish or restore.",
  } satisfies Record<ContentFail, string>,
};

type ContentCopy = typeof en;

const km: ContentCopy = {
  title: "មាតិកា",
  blurb:
    "Flashcard និង Quiz លំហាត់។ អ្នកណាក្នុងក្រុមក៏អាចរក្សាទុកសេចក្តីព្រាងបាន។ សិស្សឃើញការកែប្រែ លុះត្រាតែម្ចាស់ចុចផ្សាយ។",
  tabs: { deck: "Flashcard", quiz: "Quiz" },
  allSubjects: "ទាំងអស់",
  empty: "មិនទាន់មានអ្វីនៅទីនេះទេ។",
  newItem: "ថ្មី",
  newTitle: "សរសេរថ្មី",
  newBlurb: "ជ្រើសកន្លែងដែលវាត្រូវនៅ។ មានតែកន្លែងដែលសិស្សអាចចូលបានប៉ុណ្ណោះ។",
  noFreeSlots: "គ្រប់កន្លែងក្នុងមុខវិជ្ជានេះមានមាតិការួចហើយ។",
  live: (v: number, n: number, deck: boolean) =>
    `កំពុងបង្ហាញ៖ កំណែ ${v} · ${n} ${deck ? "កាត" : "សំណួរ"}`,
  notPublished: "មិនទាន់ផ្សាយ",
  draftBy: (name: string, when: string) =>
    name ? `សេចក្តីព្រាងដោយ ${name} ${when}` : `សេចក្តីព្រាង ${when}`,

  importTitle: "នាំចូលឯកសារ",
  importBlurb:
    "ឯកសារ .json នៃ Flashcard និង Quiz ដូចដែល content:export សរសេរ។ របស់នីមួយៗចូលមកជាសេចក្តីព្រាង ដើម្បីឱ្យអ្នកពិនិត្យ និងផ្សាយ។",
  importPublish:
    "ផ្សាយរបស់ដែលមិនធ្លាប់ផ្សាយ (សម្រាប់តែការផ្លាស់ចេញពីកូដលើកដំបូងប៉ុណ្ណោះ)",
  importChoose: "ជ្រើសឯកសារ",
  importBadFile: "នោះមិនមែនជាឯកសារមាតិកាទេ។",
  importChecked: (items: number, errors: number, warnings: number) =>
    `បានពិនិត្យ ${items} របស់៖ កំហុស ${errors} ការព្រមាន ${warnings}។`,
  importFixFirst: "សូមកែកំហុសក្នុងឯកសារជាមុនសិន។",
  importGo: "នាំចូល",
  importDone: (published: number, drafts: number, skipped: number) =>
    `រួចរាល់៖ ផ្សាយ ${published} រក្សាទុកជាសេចក្តីព្រាង ${drafts} រំលង ${skipped} ព្រោះមានសេចក្តីព្រាងរួចហើយ។`,
  ownerOnlyImport: "មានតែម្ចាស់ទេដែលអាចនាំចូលឯកសារបាន។",

  back: "មាតិកាទាំងអស់",
  openInApp: "បើកក្នុងកម្មវិធី",
  liveVersion: (v: number, by: string, when: string) =>
    by ? `សិស្សឃើញកំណែ ${v} ផ្សាយដោយ ${by} ${when}។` : `សិស្សឃើញកំណែ ${v} ផ្សាយ ${when}។`,
  liveNone: "មិនទាន់ផ្សាយ៖ សិស្សឃើញវាជា «ឆាប់ៗនេះ»។",
  draftSaved: (by: string, when: string) =>
    by ? `សេចក្តីព្រាងរក្សាទុកដោយ ${by} ${when}។` : `សេចក្តីព្រាងរក្សាទុក ${when}។`,
  draftBase: (base: number, live: number) =>
    `សេចក្តីព្រាងនេះចាប់ផ្តើមពីកំណែ ${base}។ កំណែ ${live} ត្រូវបានផ្សាយតាំងពីពេលនោះ។`,
  unsaved: "មានការកែប្រែមិនទាន់រក្សាទុក",
  saveDraft: "រក្សាទុកសេចក្តីព្រាង",
  saved: "បានរក្សាទុកសេចក្តីព្រាង។",
  publish: "ផ្សាយ",
  publishedNow: (v: number) => `បានផ្សាយជាកំណែ ${v}។`,
  ownerOnlyPublish: "មានតែម្ចាស់ទេដែលអាចផ្សាយបាន។ សូមរក្សាទុកសេចក្តីព្រាង ហើយម្ចាស់នឹងផ្សាយវា។",
  fixBeforePublish: (n: number) => `សូមកែកំហុស ${n} មុនពេលផ្សាយ។`,
  nothingToPublish: "គ្មានអ្វីថ្មីសម្រាប់ផ្សាយទេ។",
  discard: "បោះបង់សេចក្តីព្រាង",
  confirmDiscard: "បញ្ជាក់៖ បោះបង់សេចក្តីព្រាង",
  discarded: "បានបោះបង់សេចក្តីព្រាង។",
  undo: "លុបការកែប្រែរបស់ខ្ញុំ",
  unpublish: "លាក់ពីសិស្ស",
  confirmUnpublish: "បញ្ជាក់៖ លាក់ពីសិស្ស",
  unpublished: "បានលាក់។ សិស្សឃើញវាជា «ឆាប់ៗនេះ» រហូតដល់ផ្សាយម្តងទៀត។",
  historyTitle: "កំណែ",
  historyEmpty: "មិនធ្លាប់ផ្សាយ។",
  versionRow: (v: number, by: string, when: string, n: number) =>
    `កំណែ ${v} · ${n} របស់ · ${by ? `${by} ` : ""}${when}`,
  current: "កំពុងបង្ហាញ",
  restore: "ស្ដារជាសេចក្តីព្រាង",
  confirmRestore: "បញ្ជាក់៖ ស្ដារ",
  restoreLoses: "ការកែប្រែដែលមិនទាន់រក្សាទុករបស់អ្នកនឹងត្រូវជំនួស។",
  restored: (v: number) => `កំណែ ${v} ឥឡូវជាសេចក្តីព្រាង។ ផ្សាយវា ដើម្បីឱ្យសិស្សឃើញ។`,
  leaveWarning: "អ្នកមានការកែប្រែមិនទាន់រក្សាទុក។",

  checksTitle: "ការពិនិត្យ",
  checksNone: "រកមិនឃើញបញ្ហាទេ។",
  checksCount: (errors: number, warnings: number) => `កំហុស ${errors} · ការព្រមាន ${warnings}`,
  wholeList: "បញ្ជី",
  issues: {
    empty: "ទទេ",
    tooLong: "វែងពេក",
    math: "មានរូបមន្តដែលបង្ហាញមិនបាន",
    khmerInMath: "មានអក្សរខ្មែរនៅក្នុង $…$ ដែលបង្ហាញជាប្រអប់ទទេ",
    strayDollar: "មានសញ្ញា $ មិនបានបិទ",
    khmerDigits: "មានលេខខ្មែរ សូមប្រើ 0-9",
    emDash: "មានសញ្ញាដាច់វែង សូមប្រើក្បៀស ឬខណ្ឌ",
    tooFewOptions: "ត្រូវការជម្រើសយ៉ាងតិច 2",
    tooManyOptions: "មានជម្រើសលើសពី 6",
    sameOptions: "មានជម្រើសពីរដូចគ្នា",
    correctMissing: "មិនទាន់សម្គាល់ចម្លើយត្រូវ",
    badId: "មានលេខសម្គាល់ខូច",
    duplicateId: "ប្រើលេខសម្គាល់ពីរដង",
    emptyList: "ទទេ",
    letterOrder: "មាន ក. ខ. គ. ឃ. មិនតាមលំដាប់",
    answersBunched: "ចម្លើយត្រូវភាគច្រើននៅលើអក្សរតែមួយ",
  },
  fields: {
    id: "លេខសម្គាល់",
    front: "មុខកាត",
    back: "ខ្នងកាត",
    scenario: "ស្ថានភាព",
    q: "សំណួរ",
    prompt: "សំណួរ",
    options: "ជម្រើស",
    option: (n: number) => `ជម្រើសទី ${n}`,
    correct: "ចម្លើយត្រូវ",
    explanation: "ការពន្យល់",
    label: "ចំណងជើងជំនួយ",
    note: (n: number) => `ចំណាំបន្ទាត់ទី ${n}`,
    notes: "ចំណាំ",
    mistake: "កំហុសញឹកញាប់",
    similar: (n: number) => `លំហាត់ស្រដៀងទី ${n}`,
    similarList: "លំហាត់ស្រដៀង",
    foundation: (n: number) => `លំហាត់មូលដ្ឋានទី ${n}`,
    foundationList: "លំហាត់មូលដ្ឋាន",
  },

  card: (n: number) => `កាតទី ${n}`,
  frontLabel: "មុខកាត (សំណួរ)",
  backLabel: "ខ្នងកាត (ចម្លើយ)",
  addCard: "បន្ថែមកាត",
  question: (n: number) => `សំណួរទី ${n}`,
  scenarioLabel: "ស្ថានភាព (មិនចាំបាច់ បង្ហាញខាងលើសំណួរ)",
  promptLabel: "សំណួរ",
  optionsLabel: "ជម្រើស៖ ចុចរង្វង់ក្បែរចម្លើយត្រូវ",
  optionN: (n: number) => `ជម្រើសទី ${n}`,
  addOption: "បន្ថែមជម្រើស",
  removeOption: "លុបជម្រើសនេះ",
  correctMark: "ចម្លើយត្រូវ",
  explanationLabel: "ការពន្យល់ (បង្ហាញក្រោយពេលឆ្លើយ)",
  helpTitle: "ជំនួយក្រោយពេលឆ្លើយ",
  addHelp: "បន្ថែមជំនួយ",
  removeHelp: "លុបជំនួយ",
  confirmRemoveHelp: "បញ្ជាក់៖ លុបជំនួយ",
  helpLabel: "អ្វីដែលវាសាកល្បង (ចំណងជើង)",
  helpNote: "ចំណាំ (មួយបន្ទាត់ម្តង)",
  helpMistake: "កំហុសញឹកញាប់ (មិនចាំបាច់)",
  similarTitle: "លំហាត់ស្រដៀង",
  foundationTitle: "លំហាត់មូលដ្ឋាន",
  exercise: (n: number) => `លំហាត់ទី ${n}`,
  addExercise: "បន្ថែមលំហាត់",
  addQuestion: "បន្ថែមសំណួរ",
  moveUp: "ឡើងលើ",
  moveDown: "ចុះក្រោម",
  remove: "លុប",
  confirmRemove: "បញ្ជាក់៖ លុប",
  open: "បើក",
  close: "បិទ",
  preview: "មើលជាមុន",
  previewTitle: "ដូចដែលសិស្សឃើញ",
  working: "កំពុងដំណើរការ…",
  cancel: "បោះបង់",

  whatIsThis: "តើនេះមានន័យថាអ្វី",
  labelsTitle: "ន័យនៃស្លាក៖",
  draftChip: "សេចក្តីព្រាង",
  tips: {
    newItem:
      "ចាប់ផ្តើម Flashcard ឬ Quiz នៅកន្លែងក្នុងកម្មវិធីដែលមិនទាន់មានអ្វីសោះ។ ដើម្បីកែមួយដែលមានរួចហើយ សូមបើកវាពីបញ្ជីខាងក្រោម។",
    importFile:
      "សម្រាប់តែម្ចាស់។ ផ្ទុកឯកសារ Flashcard និង Quiz ឧទាហរណ៍ឯកសារដែលអ្នកអភិវឌ្ឍន៍បានធ្វើ។ ឯកសារត្រូវបានពិនិត្យនៅទីនេះជាមុន ហើយរបស់នីមួយៗចូលមកជាសេចក្តីព្រាង ដើម្បីឱ្យអ្នកមើល។",
    importPublish:
      "សម្រាប់តែការផ្លាស់ចេញពីកូដលើកដំបូងប៉ុណ្ណោះ៖ របស់ដែលមិនធ្លាប់ផ្សាយ នឹងបង្ហាញភ្លាមៗជាកំណែ 1។ សម្រាប់មាតិកាថ្មី កុំធីក ដើម្បីឱ្យអ្នកពិនិត្យវាជាមុន។",
    live: "សិស្សឃើញកំណែនេះ។ លេខកើនឡើង 1 រាល់ពេលម្ចាស់ចុចផ្សាយ។",
    notPublished: "សិស្សឃើញវាជា «ឆាប់ៗនេះ» ហើយមិនអាចបើកបានទេ។",
    draft: "ការកែប្រែដែលបានរក្សាទុក តែមិនទាន់បង្ហាញ។ សិស្សមិនឃើញវាទេ រហូតដល់ម្ចាស់ចុចផ្សាយ។",
    key: "អាសយដ្ឋានរបស់វាក្នុងកម្មវិធី៖ មុខវិជ្ជា បន្ទាប់មកលេខមេរៀន និងលេខផ្នែក។ វាមិនប្តូរទេ។",
    cardId:
      "លេខសម្គាល់កាត។ ប្រវត្តិពិនិត្យរបស់សិស្សម្នាក់ៗត្រូវបានរក្សាទុកក្រោមលេខនេះ ដូច្នេះវាមិនប្តូរ ហើយមិនដែលឱ្យទៅកាតផ្សេងទេ។",
    status:
      "សិស្សឃើញតែកំណែដែលបានផ្សាយប៉ុណ្ណោះ។ ការកែប្រែរបស់អ្នកនៅជាសេចក្តីព្រាង រហូតដល់ម្ចាស់ចុចផ្សាយ។",
    checks:
      "កម្មវិធីពិនិត្យអ្វីដែលអ្នកសរសេរ ពេលអ្នកកំពុងវាយ។ ✕ ជាកំហុស ត្រូវកែមុនពេលផ្សាយ។ ! ជាដំបូន្មាន ហើយមិនរារាំងទេ។ ចុចលើបញ្ហា ដើម្បីទៅដល់វា រួចដាក់ម៉ៅស៍ ឬចុចលើវានៅទីនោះ ដើម្បីមើលវិធីកែ។",
    history:
      "រាល់ពេលម្ចាស់ផ្សាយ កំណែចាស់ត្រូវបានរក្សាទុកនៅទីនេះ។ «ស្ដារជាសេចក្តីព្រាង» ចម្លងកំណែចាស់មកវិញ ដើម្បីឱ្យម្ចាស់ផ្សាយវាម្តងទៀត។ «លាក់ពីសិស្ស» ធ្វើឱ្យវាត្រឡប់ជា «ឆាប់ៗនេះ» រហូតដល់ផ្សាយម្តងទៀត។",
    buttons:
      "«រក្សាទុកសេចក្តីព្រាង» រក្សាការកែប្រែរបស់អ្នក ហើយសិស្សមិនឃើញទេ។ «ផ្សាយ» (តែម្ចាស់) ផ្ញើសេចក្តីព្រាងទៅសិស្ស ហើយពួកគេទទួលបាននៅពេលបើកកម្មវិធីលើកក្រោយ។ «លុបការកែប្រែរបស់ខ្ញុំ» ត្រឡប់ទៅអ្វីដែលបានរក្សាទុកចុងក្រោយ។ «បោះបង់សេចក្តីព្រាង» លុបសេចក្តីព្រាងដែលបានរក្សាទុកចោល។",
    front: "ផ្នែកដែលសិស្សឃើញមុន៖ សំណួរ ពាក្យ ឬរូបមន្ត។",
    back: "ផ្នែកដែលបង្ហាញពេលសិស្សត្រឡប់កាត៖ ចម្លើយ។",
    scenario: "មិនចាំបាច់។ ស្ថានភាពខ្លីមួយ បង្ហាញខាងលើសំណួរជាអក្សរតូចជាង។",
    options:
      "ចុចរង្វង់ក្បែរចម្លើយត្រូវ។ ចាប់ផ្តើមជម្រើសដោយ ក. ខ. គ. ឃ. តាមលំដាប់ ហើយដាក់ចម្លើយត្រូវលើអក្សរផ្សេងៗគ្នាពេញ Quiz ដើម្បីកុំឱ្យសិស្សទាយបាន។",
    explanation:
      "បង្ហាញបន្ទាប់ពីសិស្សឆ្លើយ ទោះត្រូវឬខុស។ ពន្យល់ពីរបៀបរកចម្លើយ មិនមែនត្រឹមតែប្រាប់ថាអក្សរណាទេ។",
    help: "ជំនួយបន្ថែមក្រោមចម្លើយ (មិនចាំបាច់)៖ ចំណាំ កំហុសញឹកញាប់ និងលំហាត់សម្រាប់ហ្វឹកហាត់។",
    helpLabel: "ចំណងជើងខ្លីរបស់ចំណាំ បង្ហាញជាចំណងជើងនៃជំនួយ។",
    helpNote: "ចំណាំជា 2 ដល់ 4 បន្ទាត់ខ្លីៗ មួយចំណុចក្នុងមួយបន្ទាត់។",
    helpMistake: "កំហុសដែលសិស្សតែងធ្វើនៅទីនេះ ក្នុងមួយប្រយោគ។",
    similar: "សំណួរប្រភេទដូចគ្នាបន្ថែម សម្រាប់ហ្វឹកហាត់។ មិនផ្តល់ XP ទេ។",
    foundation: "សំណួរងាយជាង លើជំហានដែលសិស្សឆ្លើយខុសប្រហែលជាខកខាន។",
  },
  issueHelp: {
    empty: "សរសេរអ្វីមួយនៅទីនេះ។",
    tooLong: "ធ្វើឱ្យខ្លីជាងនេះ។",
    math: "រូបមន្តរវាងសញ្ញា $ មានកំហុសវាយ។ ពិនិត្យឈ្មោះពាក្យបញ្ជា និងថា { នីមួយៗមាន } ។",
    khmerInMath: "យកពាក្យខ្មែរចេញពីក្នុងសញ្ញា $។ មានតែរូបមន្តប៉ុណ្ណោះដែលនៅចន្លោះវា។",
    strayDollar: "សញ្ញា $ នីមួយៗត្រូវការ $ បិទនៅបន្ទាត់ដដែល ដោយគ្មានដកឃ្លានៅខាងក្នុង។",
    khmerDigits: "សរសេរលេខដោយ 0-9 ដូចក្នុងវិញ្ញាសាប្រឡង។",
    emDash: "ប្រើក្បៀស ឬខណ្ឌ ជំនួសសញ្ញាដាច់វែង។",
    tooFewOptions: "បន្ថែមជម្រើសមួយទៀត។",
    tooManyOptions: "លុបជម្រើសរហូតដល់នៅសល់ 6 ឬតិចជាង។",
    sameOptions: "ប្តូរជម្រើសមួយក្នុងចំណោមពីរ ដើម្បីកុំឱ្យដូចគ្នា។",
    correctMissing: "ចុចរង្វង់ក្បែរចម្លើយត្រូវ។",
    badId: "សូមសួរអ្នកអភិវឌ្ឍន៍៖ លេខសម្គាល់របស់របស់នេះខូច។",
    duplicateId: "សូមសួរអ្នកអភិវឌ្ឍន៍៖ របស់ពីរប្រើលេខសម្គាល់តែមួយ។",
    emptyList: "បន្ថែមកាត ឬសំណួរយ៉ាងហោចណាស់មួយ មុនពេលផ្សាយ។",
    letterOrder: "ចាប់ផ្តើមជម្រើសដោយ ក. ខ. គ. ឃ. តាមលំដាប់ ពីលើចុះក្រោម។",
    answersBunched: "ផ្លាស់ចម្លើយត្រូវខ្លះទៅអក្សរផ្សេង ដើម្បីឱ្យវានៅលើ ក ខ គ និង ឃ ប្រហែលៗគ្នា។",
  },

  errors: {
    unconfigured: "មិនបានសម្រេចទេ។ សូមពិនិត្យអ៊ីនធឺណិត រួចព្យាយាមម្តងទៀត។",
    denied: "គណនីរបស់អ្នកលែងជាអ្នកគ្រប់គ្រងហើយ។",
    failed: "មិនបានសម្រេចទេ។ សូមពិនិត្យអ៊ីនធឺណិត រួចព្យាយាមម្តងទៀត។",
    owner_only: "មានតែម្ចាស់ទេដែលអាចធ្វើការនេះបាន។",
    key: "នោះមិនមែនជាកន្លែងដែលសិស្សអាចចូលបានទេ។",
    shape: "មូលដ្ឋានទិន្នន័យបដិសេធ",
    stale:
      "មានអ្នកផ្សេងកែប្រែវាតាំងពីអ្នកបើក។ សូមចម្លងអ្វីដែលអ្នកត្រូវការ រួចផ្ទុកទំព័រឡើងវិញ។",
    missing: "គ្មានអ្វីសម្រាប់ផ្សាយ ឬស្ដារទេ។",
  },
};

export const CONTENT_COPY: Record<Lang, ContentCopy> = { en, km };

/**
 * A field path from utils/content-check.ts ("help.questions.1.options.2") as
 * words ("Similar exercise 2 · Option 3"). Paths are 0-based; people count
 * from 1.
 */
export function fieldLabel(path: string, lang: Lang): string {
  const f = CONTENT_COPY[lang].fields;
  if (!path) return "";
  const parts = path.split(".");
  const words: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const next = parts[i + 1];
    const n = next !== undefined && /^\d+$/.test(next) ? Number(next) + 1 : null;
    if (p === "help") continue;
    if (p === "questions") {
      words.push(n === null ? f.similarList : f.similar(n));
      if (n !== null) i++;
    } else if (p === "foundation") {
      words.push(n === null ? f.foundationList : f.foundation(n));
      if (n !== null) i++;
    } else if (p === "options") {
      words.push(n === null ? f.options : f.option(n));
      if (n !== null) i++;
    } else if (p === "note") {
      words.push(n === null ? f.notes : f.note(n));
      if (n !== null) i++;
    } else if (p in f && typeof f[p as keyof typeof f] === "string") {
      words.push(f[p as keyof typeof f] as string);
    } else {
      words.push(p);
    }
  }
  return words.join(" · ");
}
