import type { ContentKind, Lang } from "@/types";
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
    "Flashcards, practice quizzes, lesson sections, past papers and game questions. Anyone on the team can save a draft; students see a change only after the owner presses Publish.",
  tabs: {
    deck: "Flashcards",
    quiz: "Quizzes",
    section: "Lesson sections",
    paper: "Past papers",
    game: "Game questions",
  } satisfies Record<ContentKind, string>,
  allSubjects: "All",
  empty: "Nothing here yet.",
  newItem: "New",
  newTitle: "Write something new",
  newBlurb: "Pick where it goes. Only places students can reach are listed.",
  noFreeSlots: "Every place in this subject already has something.",
  paperNewNote: "A new past paper arrives as a file from the developer: use Import.",
  live: (v: number, n: number, kind: ContentKind) =>
    `Live: version ${v} · ${n} ${kind === "deck" ? (n === 1 ? "card" : "cards") : n === 1 ? "question" : "questions"}`,
  notPublished: "Not published",
  draftBy: (name: string, when: string) => (name ? `Draft by ${name}, ${when}` : `Draft, ${when}`),

  importTitle: "Import a file",
  importBlurb:
    "A .json file of content (decks, quizzes, lesson sections, past papers or game questions), as content:export writes it. Each item arrives as a draft for you to check and publish.",
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
    badNumber: "is not a whole number in range",
    badPoster: "is not a picture the app has",
    badModel: "is not a 3D model the app has",
    badVideoId: "is not a YouTube video id",
    svgChanged: "has a drawing that would not show correctly",
    partShape: "needs either questions or a gap-fill passage",
    notInBank: "has an answer that is not in the word box",
    gapMissing: "is not marked in the passage",
    duplicateGap: "uses a gap number twice",
    sameWords: "has two words in the box that are the same",
    unknownSkill: "names a skill this paper does not have",
    badDifficulty: "has a level other than Basic, Medium or Hard",
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
    difficulty: "Level",
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

  // ── The section editor ─────────────────────────────────────────────────
  section: {
    whole: "The section",
    stepOne: "Step 1: introduction, examples and first questions",
    stepTwo: "Step 2: lesson, key notes, mistakes and applied questions",
    title: "Section title",
    blocks: { intro: "Introduction", examples: "Examples", lesson: "Lesson", notes: "Key notes" },
    lead: "Opening paragraph (optional)",
    outro: "Closing paragraph (optional)",
    point: (n: number) => `Point ${n}`,
    subPoint: (n: number) => `Sub-point ${n}`,
    pointLabel: "Bold words at the start (optional)",
    pointBody: "Text",
    subPoints: "Sub-points (one per line, optional)",
    addPoint: "Add a point",
    noPoints: "No points yet.",
    mistakes: "Common mistakes",
    mistake: (n: number) => `Mistake ${n}`,
    wrong: "What students wrongly think",
    right: "What is true",
    addMistake: "Add a mistake",
    quiz: "Questions (step 1)",
    quizHarder: "Applied questions (step 2)",
    noQuestions: "No questions on this step.",
    video: "Video",
    addVideo: "Add a video",
    removeVideo: "Remove the video",
    poster: "Poster picture",
    choosePoster: "Choose a picture",
    duration: "Length in seconds (optional)",
    youtube: "YouTube video id (optional)",
    model: "3D model",
    addModel: "Add a 3D model",
    removeModel: "Remove the model",
    modelFile: "Model file",
    chooseModel: "Choose a model",
    credit: "Credit (the model's licence asks for it)",
    caption: "Caption (optional)",
  },

  // ── The paper editor ───────────────────────────────────────────────────
  paper: {
    whole: "The paper",
    head: "The paper",
    minutes: "Time in minutes (as printed)",
    points: "Points (as printed, optional)",
    note: "Note to students (optional)",
    part: (n: number) => `Part ${n}`,
    partTitle: "Title (as printed)",
    instruction: "Instruction (as printed)",
    statement: "The whole exercise, copied from the paper (optional)",
    example: "Worked example (optional)",
    questionPoints: "Marks on the paper (optional)",
    skill: "Skill",
    noSkill: "None",
    passageTitle: "Passage title",
    passage: "Passage: write each gap as {n}",
    wordBank: "Word box",
    word: (n: number) => `Word ${n}`,
    addWord: "Add a word",
    gaps: "Gaps",
    gap: (n: number) => `Gap ${n}`,
    gapNumber: "Number in the passage",
    gapAnswer: "Answer",
    chooseAnswer: "Choose the answer",
    gapExample: "Already filled in as the example",
    addGap: "Add a gap",
    writing: "Writing task",
    writingTitle: "Title",
    writingPrompt: "Task",
    minWords: "Minimum words",
    essay: "Model essay (a blank line between paragraphs)",
    paragraph: (n: number) => `Paragraph ${n}`,
    checklist: "Checklist (one per line)",
    checklistItem: (n: number) => `Checklist line ${n}`,
    skills: "Skills",
    skillN: (id: string) => `Skill ${id}`,
    newSkillId: "New skill's id (small letters, digits and -)",
    addSkill: "Add a skill",
    skillIdBad: "That id is taken or not allowed.",
    noSkills: "No skills yet.",
  },

  // ── The game question editor ───────────────────────────────────────────
  game: {
    difficulty: "Level",
    noLevel: "Not set (offered at every level)",
    levels: { easy: "Basic", medium: "Medium", hard: "Hard" },
  },

  // ── Explanations: hover with a mouse, tap with a finger ───────────────
  // Each is a claim about what the editor and the database do. Change the
  // rule, change the sentence, in both languages.
  whatIsThis: "What this means",
  labelsTitle: "What the labels mean:",
  draftChip: "Draft",
  tips: {
    newItem:
      "Start a deck, a quiz, a lesson section or a subject's game questions in a place in the app that has nothing yet. To change one that exists, open it from the list instead.",
    importFile:
      "Owner only. Load a file of content, for example one the developer made. The file is checked here first, and every item arrives as a draft for you to look at.",
    importPublish:
      "Only for the first move out of the code: items that were never published go live straight away as version 1. Leave it off for new content, so you can check it first.",
    live: "Students see this version. The number goes up by 1 every time the owner publishes.",
    notPublished: "Students see this as coming soon and cannot open it.",
    draft:
      "Changes that are saved but not live. Students do not see them until the owner presses Publish.",
    key: "This item's address in the app: the subject and its numbers (for a past paper, the year and the subject; for game questions, the subject alone). It never changes.",
    gamePool:
      "The questions a game in this subject draws from. Each new game picks up to 10 at random, at the level its creator chooses. A game keeps the questions it started with, so a fix here reaches new games only.",
    difficulty: "Used when a student picks a level for their game. A question with no level is offered at every level.",
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
    sectionSteps:
      "Students see a section in two steps. Step 1 is the introduction, the examples and easy questions; step 2 is the lesson, the key notes, the mistakes and the applied questions. On step 1, only ask what the examples have already shown.",
    blocks:
      "Each block is a list of points. A point can start with a few bold words, then its text, then sub-points. Do not type ៖ after the bold words; the app adds it.",
    video:
      "The poster is shown at the top of the section. Add the YouTube id once the video is uploaded (unlisted, embedding allowed); until then students see the poster marked coming soon.",
    model: "An interactive 3D model, shown under the examples on step 1.",
    mistakes: "Pairs of a wrong idea students often have and what is actually true. Shown on step 2.",
    paperPart:
      "Copy the paper's own words for the title, the instruction and the exercise. Only the multiple-choice options and the explanations are ours.",
    minutes:
      "From the paper's own header. Students get this long, and running out submits what they answered.",
    questionPoints: "What the printed paper gives this part. Shown to students, never used for the score.",
    skill: "A wrong answer offers this skill's rule and exercises.",
    passage:
      "Write the passage once and put {1}, {2} and so on where each gap goes. The numbers must match the gaps below.",
    wordBank: "The words students pick from, in the order the paper's box prints them. Renaming a word changes every gap that uses it.",
    gapExample: "The paper fills this gap in for students, so it is not scored.",
    skills:
      "Each skill holds a rule and exercises. A question or gap that names it offers them after a wrong answer.",
    writing: "Students write this on paper; nothing marks it. The model essay is shown afterwards, to compare against.",
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
    emptyList: "Add at least one card, question or point before publishing.",
    letterOrder: "Start the options with ក. ខ. គ. ឃ. in that order, from top to bottom.",
    answersBunched: "Move some right answers to other letters, so they are spread across ក, ខ, គ and ឃ.",
    badNumber: "Type a whole number, with no decimals, within the allowed range.",
    badPoster: "Pick a picture from the list. A new picture has to be added to the app by the developer first.",
    badModel: "Pick a model from the list. A new model has to be added to the app by the developer first.",
    badVideoId: "Paste only the 11 characters after watch?v= in the video's address, not the whole link.",
    svgChanged: "Ask the developer: part of this drawing is not allowed and would be removed.",
    partShape: "Ask the developer: a part holds either a list of questions or one gap-fill passage.",
    notInBank: "Pick the answer from the word box, or add the word to the box first.",
    gapMissing: "Write the gap's number in curly brackets where it goes in the passage, for example {3}.",
    duplicateGap: "Give each gap its own number.",
    sameWords: "Each word is in the box once. Remove or change the copy.",
    unknownSkill: "Pick a skill from the list, or add it under Skills first.",
    badDifficulty: "Pick Basic, Medium or Hard, or leave it unset.",
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
    "Flashcard, Quiz លំហាត់, ផ្នែកមេរៀន, វិញ្ញាសារឆ្នាំចាស់ និងសំណួរហ្គេម។ អ្នកណាក្នុងក្រុមក៏អាចរក្សាទុកសេចក្តីព្រាងបាន។ សិស្សឃើញការកែប្រែ លុះត្រាតែម្ចាស់ចុចផ្សាយ។",
  tabs: {
    deck: "Flashcard",
    quiz: "Quiz",
    section: "ផ្នែកមេរៀន",
    paper: "វិញ្ញាសារឆ្នាំចាស់",
    game: "សំណួរហ្គេម",
  },
  allSubjects: "ទាំងអស់",
  empty: "មិនទាន់មានអ្វីនៅទីនេះទេ។",
  newItem: "ថ្មី",
  newTitle: "សរសេរថ្មី",
  newBlurb: "ជ្រើសកន្លែងដែលវាត្រូវនៅ។ មានតែកន្លែងដែលសិស្សអាចចូលបានប៉ុណ្ណោះ។",
  noFreeSlots: "គ្រប់កន្លែងក្នុងមុខវិជ្ជានេះមានមាតិការួចហើយ។",
  paperNewNote: "វិញ្ញាសារឆ្នាំចាស់ថ្មី មកជាឯកសារពីអ្នកអភិវឌ្ឍន៍៖ សូមប្រើ «នាំចូលឯកសារ»។",
  live: (v: number, n: number, kind: ContentKind) =>
    `កំពុងបង្ហាញ៖ កំណែ ${v} · ${n} ${kind === "deck" ? "កាត" : "សំណួរ"}`,
  notPublished: "មិនទាន់ផ្សាយ",
  draftBy: (name: string, when: string) =>
    name ? `សេចក្តីព្រាងដោយ ${name} ${when}` : `សេចក្តីព្រាង ${when}`,

  importTitle: "នាំចូលឯកសារ",
  importBlurb:
    "ឯកសារ .json នៃមាតិកា (Flashcard, Quiz, ផ្នែកមេរៀន, វិញ្ញាសារឆ្នាំចាស់ ឬសំណួរហ្គេម) ដូចដែល content:export សរសេរ។ របស់នីមួយៗចូលមកជាសេចក្តីព្រាង ដើម្បីឱ្យអ្នកពិនិត្យ និងផ្សាយ។",
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
    badNumber: "មិនមែនជាលេខគត់ក្នុងចន្លោះដែលអនុញ្ញាត",
    badPoster: "មិនមែនជារូបភាពដែលកម្មវិធីមាន",
    badModel: "មិនមែនជាម៉ូឌែល 3D ដែលកម្មវិធីមាន",
    badVideoId: "មិនមែនជាលេខសម្គាល់វីដេអូ YouTube",
    svgChanged: "មានរូបគំនូរដែលនឹងបង្ហាញមិនត្រឹមត្រូវ",
    partShape: "ត្រូវការសំណួរ ឬអត្ថបទបំពេញចន្លោះ",
    notInBank: "មានចម្លើយដែលមិននៅក្នុងប្រអប់ពាក្យ",
    gapMissing: "មិនបានសម្គាល់ក្នុងអត្ថបទ",
    duplicateGap: "ប្រើលេខចន្លោះពីរដង",
    sameWords: "មានពាក្យពីរដូចគ្នាក្នុងប្រអប់",
    unknownSkill: "ដាក់ជំនាញដែលវិញ្ញាសានេះមិនមាន",
    badDifficulty: "មានកម្រិតក្រៅពី ងាយ មធ្យម ឬពិបាក",
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
    difficulty: "កម្រិត",
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

  section: {
    whole: "ផ្នែកនេះ",
    stepOne: "ជំហានទី 1៖ សេចក្ដីផ្ដើម ឧទាហរណ៍ និងសំណួរដំបូង",
    stepTwo: "ជំហានទី 2៖ មេរៀន ចំណាំសំខាន់ៗ កំហុស និងសំណួរអនុវត្ត",
    title: "ចំណងជើងផ្នែក",
    blocks: { intro: "សេចក្ដីផ្ដើម", examples: "ឧទាហរណ៍", lesson: "មេរៀន", notes: "ចំណាំសំខាន់ៗ" },
    lead: "កថាខណ្ឌបើក (មិនចាំបាច់)",
    outro: "កថាខណ្ឌបិទ (មិនចាំបាច់)",
    point: (n: number) => `ចំណុចទី ${n}`,
    subPoint: (n: number) => `ចំណុចរងទី ${n}`,
    pointLabel: "ពាក្យដិតនៅដើម (មិនចាំបាច់)",
    pointBody: "អត្ថបទ",
    subPoints: "ចំណុចរង (មួយបន្ទាត់ម្តង មិនចាំបាច់)",
    addPoint: "បន្ថែមចំណុច",
    noPoints: "មិនទាន់មានចំណុចទេ។",
    mistakes: "កំហុសឆ្គងដែលសិស្សតែងតែយល់ច្រឡំ",
    mistake: (n: number) => `កំហុសទី ${n}`,
    wrong: "យល់ច្រឡំថា",
    right: "ការពិត",
    addMistake: "បន្ថែមកំហុស",
    quiz: "សំណួរ (ជំហានទី 1)",
    quizHarder: "សំណួរអនុវត្ត (ជំហានទី 2)",
    noQuestions: "គ្មានសំណួរនៅជំហាននេះទេ។",
    video: "វីដេអូ",
    addVideo: "បន្ថែមវីដេអូ",
    removeVideo: "លុបវីដេអូ",
    poster: "រូបភាពគម្រប",
    choosePoster: "ជ្រើសរូបភាព",
    duration: "រយៈពេលគិតជាវិនាទី (មិនចាំបាច់)",
    youtube: "លេខសម្គាល់វីដេអូ YouTube (មិនចាំបាច់)",
    model: "ម៉ូឌែល 3D",
    addModel: "បន្ថែមម៉ូឌែល 3D",
    removeModel: "លុបម៉ូឌែល",
    modelFile: "ឯកសារម៉ូឌែល",
    chooseModel: "ជ្រើសម៉ូឌែល",
    credit: "ឈ្មោះម្ចាស់ (អាជ្ញាប័ណ្ណរបស់ម៉ូឌែលតម្រូវ)",
    caption: "ចំណងជើងតូច (មិនចាំបាច់)",
  },

  paper: {
    whole: "វិញ្ញាសា",
    head: "វិញ្ញាសា",
    minutes: "រយៈពេលគិតជានាទី (តាមវិញ្ញាសា)",
    points: "ពិន្ទុ (តាមវិញ្ញាសា មិនចាំបាច់)",
    note: "កំណត់សម្គាល់សម្រាប់សិស្ស (មិនចាំបាច់)",
    part: (n: number) => `ផ្នែកទី ${n}`,
    partTitle: "ចំណងជើង (តាមវិញ្ញាសា)",
    instruction: "សេចក្តីណែនាំ (តាមវិញ្ញាសា)",
    statement: "លំហាត់ទាំងមូល ចម្លងពីវិញ្ញាសា (មិនចាំបាច់)",
    example: "ឧទាហរណ៍គំរូ (មិនចាំបាច់)",
    questionPoints: "ពិន្ទុលើវិញ្ញាសា (មិនចាំបាច់)",
    skill: "ជំនាញ",
    noSkill: "គ្មាន",
    passageTitle: "ចំណងជើងអត្ថបទ",
    passage: "អត្ថបទ៖ សរសេរចន្លោះនីមួយៗជា {n}",
    wordBank: "ប្រអប់ពាក្យ",
    word: (n: number) => `ពាក្យទី ${n}`,
    addWord: "បន្ថែមពាក្យ",
    gaps: "ចន្លោះ",
    gap: (n: number) => `ចន្លោះទី ${n}`,
    gapNumber: "លេខក្នុងអត្ថបទ",
    gapAnswer: "ចម្លើយ",
    chooseAnswer: "ជ្រើសចម្លើយ",
    gapExample: "បំពេញរួចជាឧទាហរណ៍",
    addGap: "បន្ថែមចន្លោះ",
    writing: "ការសរសេរ",
    writingTitle: "ចំណងជើង",
    writingPrompt: "កិច្ចការ",
    minWords: "ចំនួនពាក្យអប្បបរមា",
    essay: "អត្ថបទគំរូ (បន្ទាត់ទទេមួយរវាងកថាខណ្ឌ)",
    paragraph: (n: number) => `កថាខណ្ឌទី ${n}`,
    checklist: "បញ្ជីត្រួតពិនិត្យ (មួយបន្ទាត់ម្តង)",
    checklistItem: (n: number) => `បញ្ជីត្រួតពិនិត្យបន្ទាត់ទី ${n}`,
    skills: "ជំនាញ",
    skillN: (id: string) => `ជំនាញ ${id}`,
    newSkillId: "លេខសម្គាល់ជំនាញថ្មី (អក្សរតូច លេខ និង -)",
    addSkill: "បន្ថែមជំនាញ",
    skillIdBad: "លេខសម្គាល់នោះមានរួចហើយ ឬមិនត្រូវបានអនុញ្ញាត។",
    noSkills: "មិនទាន់មានជំនាញទេ។",
  },

  game: {
    difficulty: "កម្រិត",
    noLevel: "មិនកំណត់ (បង្ហាញនៅគ្រប់កម្រិត)",
    levels: { easy: "ងាយ", medium: "មធ្យម", hard: "ពិបាក" },
  },

  whatIsThis: "តើនេះមានន័យថាអ្វី",
  labelsTitle: "ន័យនៃស្លាក៖",
  draftChip: "សេចក្តីព្រាង",
  tips: {
    newItem:
      "ចាប់ផ្តើម Flashcard, Quiz, ផ្នែកមេរៀន ឬសំណួរហ្គេមនៃមុខវិជ្ជាមួយ នៅកន្លែងក្នុងកម្មវិធីដែលមិនទាន់មានអ្វីសោះ។ ដើម្បីកែមួយដែលមានរួចហើយ សូមបើកវាពីបញ្ជីខាងក្រោម។",
    importFile:
      "សម្រាប់តែម្ចាស់។ ផ្ទុកឯកសារមាតិកា ឧទាហរណ៍ឯកសារដែលអ្នកអភិវឌ្ឍន៍បានធ្វើ។ ឯកសារត្រូវបានពិនិត្យនៅទីនេះជាមុន ហើយរបស់នីមួយៗចូលមកជាសេចក្តីព្រាង ដើម្បីឱ្យអ្នកមើល។",
    importPublish:
      "សម្រាប់តែការផ្លាស់ចេញពីកូដលើកដំបូងប៉ុណ្ណោះ៖ របស់ដែលមិនធ្លាប់ផ្សាយ នឹងបង្ហាញភ្លាមៗជាកំណែ 1។ សម្រាប់មាតិកាថ្មី កុំធីក ដើម្បីឱ្យអ្នកពិនិត្យវាជាមុន។",
    live: "សិស្សឃើញកំណែនេះ។ លេខកើនឡើង 1 រាល់ពេលម្ចាស់ចុចផ្សាយ។",
    notPublished: "សិស្សឃើញវាជា «ឆាប់ៗនេះ» ហើយមិនអាចបើកបានទេ។",
    draft: "ការកែប្រែដែលបានរក្សាទុក តែមិនទាន់បង្ហាញ។ សិស្សមិនឃើញវាទេ រហូតដល់ម្ចាស់ចុចផ្សាយ។",
    key: "អាសយដ្ឋានរបស់វាក្នុងកម្មវិធី៖ មុខវិជ្ជា និងលេខរបស់វា (សម្រាប់វិញ្ញាសារឆ្នាំចាស់៖ ឆ្នាំ និងមុខវិជ្ជា សម្រាប់សំណួរហ្គេម៖ មុខវិជ្ជាតែប៉ុណ្ណោះ)។ វាមិនប្តូរទេ។",
    gamePool:
      "សំណួរដែលហ្គេមក្នុងមុខវិជ្ជានេះជ្រើសយក។ ហ្គេមថ្មីនីមួយៗជ្រើសយកដោយចៃដន្យរហូតដល់ 10 សំណួរ តាមកម្រិតដែលអ្នកបង្កើតជ្រើស។ ហ្គេមរក្សាសំណួរដែលវាចាប់ផ្តើមជាមួយ ដូច្នេះការកែនៅទីនេះទៅដល់តែហ្គេមថ្មីប៉ុណ្ណោះ។",
    difficulty: "ប្រើនៅពេលសិស្សជ្រើសកម្រិតសម្រាប់ហ្គេមរបស់ខ្លួន។ សំណួរដែលគ្មានកម្រិត បង្ហាញនៅគ្រប់កម្រិត។",
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
    sectionSteps:
      "សិស្សឃើញផ្នែកមួយជាពីរជំហាន។ ជំហានទី 1 គឺសេចក្ដីផ្ដើម ឧទាហរណ៍ និងសំណួរងាយៗ។ ជំហានទី 2 គឺមេរៀន ចំណាំសំខាន់ៗ កំហុស និងសំណួរអនុវត្ត។ នៅជំហានទី 1 សួរតែអ្វីដែលឧទាហរណ៍បានបង្ហាញរួចហើយ។",
    blocks:
      "ប្លុកនីមួយៗជាបញ្ជីចំណុច។ ចំណុចមួយអាចចាប់ផ្តើមដោយពាក្យដិតពីរបី បន្ទាប់មកអត្ថបទ រួចចំណុចរង។ កុំវាយ ៖ ក្រោយពាក្យដិត ព្រោះកម្មវិធីបន្ថែមវាឱ្យ។",
    video:
      "រូបភាពគម្របបង្ហាញនៅខាងលើផ្នែក។ បន្ថែមលេខសម្គាល់ YouTube ពេលវីដេអូត្រូវបានបង្ហោះរួច (មិនបង្ហាញជាសាធារណៈ អនុញ្ញាតឱ្យបង្កប់)។ មុននោះ សិស្សឃើញរូបភាពគម្រប ជាមួយ «ឆាប់ៗនេះ»។",
    model: "ម៉ូឌែល 3D ដែលអាចបង្វិលបាន បង្ហាញនៅក្រោមឧទាហរណ៍ក្នុងជំហានទី 1។",
    mistakes: "គូនៃគំនិតខុសដែលសិស្សតែងមាន និងអ្វីដែលពិត។ បង្ហាញនៅជំហានទី 2។",
    paperPart:
      "ចម្លងពាក្យរបស់វិញ្ញាសាផ្ទាល់ សម្រាប់ចំណងជើង សេចក្តីណែនាំ និងលំហាត់។ មានតែជម្រើស និងការពន្យល់ប៉ុណ្ណោះដែលជារបស់យើង។",
    minutes:
      "យកពីក្បាលវិញ្ញាសាផ្ទាល់។ សិស្សមានពេលប៉ុណ្ណេះ ហើយពេលអស់ម៉ោង កម្មវិធីប្រគល់ចម្លើយដែលពួកគេបានឆ្លើយ។",
    questionPoints: "ពិន្ទុដែលវិញ្ញាសាផ្តល់ឱ្យផ្នែកនេះ។ បង្ហាញដល់សិស្ស តែមិនប្រើគណនាពិន្ទុទេ។",
    skill: "ចម្លើយខុសនឹងផ្តល់ចំណាំ និងលំហាត់របស់ជំនាញនេះ។",
    passage:
      "សរសេរអត្ថបទម្តង ហើយដាក់ {1} {2} ជាដើម នៅកន្លែងចន្លោះនីមួយៗ។ លេខត្រូវតែត្រូវនឹងចន្លោះខាងក្រោម។",
    wordBank: "ពាក្យដែលសិស្សជ្រើស តាមលំដាប់ដែលប្រអប់ក្នុងវិញ្ញាសាបោះពុម្ព។ ការប្តូរពាក្យមួយ នឹងប្តូរគ្រប់ចន្លោះដែលប្រើវា។",
    gapExample: "វិញ្ញាសាបំពេញចន្លោះនេះឱ្យសិស្សរួចហើយ ដូច្នេះវាមិនរាប់ពិន្ទុទេ។",
    skills:
      "ជំនាញនីមួយៗមានចំណាំ និងលំហាត់។ សំណួរ ឬចន្លោះដែលដាក់ជំនាញនោះ នឹងផ្តល់វាក្រោយចម្លើយខុស។",
    writing: "សិស្សសរសេរកិច្ចការនេះលើក្រដាស ហើយគ្មានអ្វីដាក់ពិន្ទុទេ។ អត្ថបទគំរូបង្ហាញក្រោយមក ដើម្បីប្រៀបធៀប។",
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
    emptyList: "បន្ថែមកាត សំណួរ ឬចំណុចយ៉ាងហោចណាស់មួយ មុនពេលផ្សាយ។",
    letterOrder: "ចាប់ផ្តើមជម្រើសដោយ ក. ខ. គ. ឃ. តាមលំដាប់ ពីលើចុះក្រោម។",
    answersBunched: "ផ្លាស់ចម្លើយត្រូវខ្លះទៅអក្សរផ្សេង ដើម្បីឱ្យវានៅលើ ក ខ គ និង ឃ ប្រហែលៗគ្នា។",
    badNumber: "វាយលេខគត់ ដោយគ្មានទសភាគ ក្នុងចន្លោះដែលអនុញ្ញាត។",
    badPoster: "ជ្រើសរូបភាពពីបញ្ជី។ រូបភាពថ្មីត្រូវឱ្យអ្នកអភិវឌ្ឍន៍បន្ថែមចូលកម្មវិធីជាមុនសិន។",
    badModel: "ជ្រើសម៉ូឌែលពីបញ្ជី។ ម៉ូឌែលថ្មីត្រូវឱ្យអ្នកអភិវឌ្ឍន៍បន្ថែមចូលកម្មវិធីជាមុនសិន។",
    badVideoId: "បិទភ្ជាប់តែតួអក្សរ 11 ខ្ទង់ក្រោយ watch?v= ក្នុងអាសយដ្ឋានវីដេអូ មិនមែនតំណទាំងមូលទេ។",
    svgChanged: "សូមសួរអ្នកអភិវឌ្ឍន៍៖ ផ្នែកខ្លះនៃរូបគំនូរនេះមិនត្រូវបានអនុញ្ញាត ហើយនឹងត្រូវដកចេញ។",
    partShape: "សូមសួរអ្នកអភិវឌ្ឍន៍៖ ផ្នែកនីមួយៗមានបញ្ជីសំណួរ ឬអត្ថបទបំពេញចន្លោះមួយ។",
    notInBank: "ជ្រើសចម្លើយពីប្រអប់ពាក្យ ឬបន្ថែមពាក្យនោះទៅក្នុងប្រអប់ជាមុនសិន។",
    gapMissing: "សរសេរលេខចន្លោះក្នុងសញ្ញា { } នៅកន្លែងរបស់វាក្នុងអត្ថបទ ឧទាហរណ៍ {3}។",
    duplicateGap: "ផ្តល់លេខផ្សេងគ្នាឱ្យចន្លោះនីមួយៗ។",
    sameWords: "ពាក្យនីមួយៗមានតែម្តងក្នុងប្រអប់។ លុប ឬប្តូរពាក្យដែលស្ទួន។",
    unknownSkill: "ជ្រើសជំនាញពីបញ្ជី ឬបន្ថែមវានៅក្រោម «ជំនាញ» ជាមុនសិន។",
    badDifficulty: "ជ្រើស ងាយ មធ្យម ឬពិបាក ឬទុកឱ្យនៅទទេ។",
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

/**
 * Where a problem is in a SECTION or a PAPER, as words: the checks name it by
 * its whole path ("lesson.items.2.body", "sections.1.gapFill.gaps.3.correct"),
 * and people count from 1. The tail of a question's path (options, help…) is
 * named by fieldLabel, the same words a quiz uses.
 */
export function locationLabel(kind: ContentKind, path: string, lang: Lang): string {
  const c = CONTENT_COPY[lang];
  const p = path.split(".");
  const n = (i: number) => Number(p[i]) + 1;
  const words: string[] = [];

  if (kind === "section") {
    const s = c.section;
    if (!path) return s.whole;
    const head = p[0];
    if (head === "title") return s.title;
    if (head === "video") {
      const f = { poster: s.poster, durationSec: s.duration, youtubeId: s.youtube }[p[1] ?? ""];
      return [s.video, f].filter(Boolean).join(" · ");
    }
    if (head === "model3d") {
      const f = { src: s.modelFile, credit: s.credit, title: s.caption }[p[1] ?? ""];
      return [s.model, f].filter(Boolean).join(" · ");
    }
    if (head === "mistakes") {
      words.push(s.mistakes);
      if (p[1] !== undefined) words.push(s.mistake(n(1)));
      if (p[2] === "wrong") words.push(s.wrong);
      if (p[2] === "right") words.push(s.right);
      return words.join(" · ");
    }
    if (head === "quiz" || head === "quizHarder") {
      words.push(head === "quiz" ? s.quiz : s.quizHarder);
      if (p[1] !== undefined) words.push(c.question(n(1)));
      const rest = fieldLabel(p.slice(2).join("."), lang);
      if (rest) words.push(rest);
      return words.join(" · ");
    }
    if (head in s.blocks) {
      words.push(s.blocks[head as keyof typeof s.blocks]);
      if (p[1] === "intro") words.push(s.lead);
      else if (p[1] === "outro") words.push(s.outro);
      else if (p[1] === "items" && p[2] !== undefined) {
        words.push(s.point(n(2)));
        if (p[3] === "label") words.push(s.pointLabel);
        if (p[3] === "body") words.push(s.pointBody);
        if (p[3] === "items") words.push(p[4] !== undefined ? s.subPoint(n(4)) : s.subPoints);
      }
      return words.join(" · ");
    }
    return path;
  }

  if (kind === "paper") {
    const t = c.paper;
    if (!path) return t.whole;
    const head = p[0];
    if (head === "minutes") return t.minutes;
    if (head === "points") return t.points;
    if (head === "note") return t.note;
    if (head === "skills") {
      words.push(p[1] ? t.skillN(p[1]) : t.skills);
      const rest = fieldLabel(p.slice(2).join("."), lang);
      if (rest) words.push(rest);
      return words.join(" · ");
    }
    if (head === "writing") {
      words.push(t.writing);
      const f = p[1];
      if (f === "title") words.push(t.writingTitle);
      if (f === "prompt") words.push(t.writingPrompt);
      if (f === "minWords") words.push(t.minWords);
      if (f === "modelEssay") words.push(p[2] !== undefined ? t.paragraph(n(2)) : t.essay);
      if (f === "checklist") words.push(p[2] !== undefined ? t.checklistItem(n(2)) : t.checklist);
      return words.join(" · ");
    }
    if (head === "sections") {
      if (p[1] === undefined) return t.whole;
      words.push(t.part(n(1)));
      const f = p[2];
      if (f === "title") words.push(t.partTitle);
      if (f === "instruction") words.push(t.instruction);
      if (f === "statement") words.push(t.statement);
      if (f === "example") words.push(t.example);
      if (f === "id") words.push(c.fields.id);
      if (f === "questions") {
        if (p[3] !== undefined) words.push(c.question(n(3)));
        const g = p[4];
        if (g === "points") words.push(t.questionPoints);
        else if (g === "skill") words.push(t.skill);
        else {
          const rest = fieldLabel(p.slice(4).join("."), lang);
          if (rest) words.push(rest);
        }
      }
      if (f === "gapFill") {
        const g = p[3];
        if (g === "title") words.push(t.passageTitle);
        if (g === "body") words.push(t.passage);
        if (g === "wordBank") words.push(p[4] !== undefined ? `${t.wordBank} · ${t.word(n(4))}` : t.wordBank);
        if (g === "gaps") {
          words.push(p[4] !== undefined ? t.gap(n(4)) : t.gaps);
          const h = p[5];
          if (h === "number") words.push(t.gapNumber);
          if (h === "correct") words.push(t.gapAnswer);
          if (h === "skill") words.push(t.skill);
          if (h === "explanation") words.push(c.fields.explanation);
          if (h === "id") words.push(c.fields.id);
        }
      }
      return words.join(" · ");
    }
    return path;
  }

  return fieldLabel(path, lang);
}
