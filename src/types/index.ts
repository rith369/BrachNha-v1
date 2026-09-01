export type Lang = "en" | "km";

// No `months` here on purpose: the time left is derived from the fixed exam
// date (utils/exam-date.ts), not asked for and stored. A stored answer goes
// stale the day after it is given.
export interface UserData {
  strengths: string[];
  weaknesses: string[];
  grade: string;
  /** Whether the student has already studied some Bac II material. Only `false`
   *  is reachable today — the survey's "I've studied some" branch is a labelled
   *  stub pending real lesson names — but the answer is committed anyway so the
   *  branch has its value waiting when it's built. Absent from older persisted
   *  copies, which read as undefined → falsy → "not yet", the correct default. */
  studied: boolean;
}

export interface Tasks {
  lesson: boolean;
  practice: boolean;
  flashcards: boolean;
  challenge: boolean;
}

export interface PendingPlacementTest {
  subject: string;
  scheduledDate: string;
}

// The pledge a student signs after seeing their roadmap. The grade/months/
// hours/mission fields are a SNAPSHOT taken at signing time, not live reads of
// userData — the promise has to keep saying what they actually agreed to even
// if they later re-do a placement test or their plan shifts.
export interface Commitment {
  /** "drawn" → `signature` is SVG path data; "typed" → it's the name itself. */
  kind: "drawn" | "typed";
  signature: string;
  signedAt: string;
  grade: string;
  /** Months left AT SIGNING TIME. A snapshot, unlike everywhere else — see
   *  utils/exam-date.ts. Do not turn this into a live countdown. */
  months: string;
  hoursPerDay: number;
  mission: { lessons: number; practice: number; flashcards: number };
}

// One bubble in the KruAI chat. Shared by the store (which owns the
// history), the ChatOverlay (which renders it) and the /api/chat route (which
// replays it to Gemini as conversation context), so all three agree on shape.
export interface ChatMsg {
  role: "user" | "bot";
  text: string;
}

// One saved conversation with KruAI. Conversations are created lazily —
// only once the student actually sends a first message — so tapping "New chat"
// never leaves an empty row behind in the history list.
export interface Conversation {
  id: string;
  /** Derived from the first user message; see utils/chat-history.ts. */
  title: string;
  msgs: ChatMsg[];
  createdAt: string;
  /** ISO timestamp of the last message. The history list sorts on this. */
  updatedAt: string;
}

// ── Content types (used once data/lessons.ts, data/questions.ts,
//    data/translations.ts are ported from the old content-*.js files) ──

export interface Model3DRef {
  /** public/-relative path, e.g. "/models/brain.glb" — loaded by URL, not imported. */
  src: string;
  /** License credit line, rendered under the viewer. */
  credit: string;
  /** Optional caption naming what the model shows, over the top-left corner.
   *  Authored rather than hardcoded in the viewer, because the viewer is shared
   *  and a second model would need a different name. */
  title?: string;
}

export interface Lesson {
  title: { en: string; km: string };
  importance: string;
  icon: string;
  content: { en: string; km: string };
  summary: { en: string; km: string };
  funFact: { en: string; km: string };
  tip: { en: string; km: string };
  didYouKnow?: { en: string; km: string };
  /** Only set on lessons with an interactive 3D model (currently just the
   *  Human Brain lesson). Absent everywhere else — no other lesson's render
   *  path changes. */
  model3d?: Model3DRef;
}

export interface Flashcard {
  q: { en: string; km: string };
  a: { en: string; km: string };
  topic: string;
}

export interface PracticeQuestion {
  q: { en: string; km: string };
  correct: string;
  options: string[];
  explanation: { en: string; km: string };
}

// ── Section content ──
//
// A SECTION is one node on a subject path and the unit the real curriculum is
// written in: មេរៀនសង្ខេប → ឧទាហរណ៍ → ចំណាំសំខាន់ៗ → កំហុស. That is deliberately
// NOT the shape of `Lesson` above, which is the older
// content/summary/funFact/tip/didYouKnow flow and stays as it is for the two
// legacy lessons. Bending one into the other would lose what makes each work —
// most visibly `Misconception`, where the pairing IS the teaching.
//
// Every string here is KHMER ONLY, not an { en, km } pair. Same decision as
// LESSONS_PAGE_LANG, EXAM_PAGE_LANG and KruAI's ANSWER_LANG: the content exists
// in Khmer, and inventing an English column for it would be fabrication dressed
// as data.

export interface SectionItem {
  /** Bold lead-in before the colon — "សរីរាង្គវិញ្ញាណ៖ …". */
  label?: string;
  body: string;
  /** Nested bullets, e.g. រំញោច / ការឆ្លើយតប under the stimulus note. */
  items?: string[];
}

export interface SectionBlock {
  /** Optional lead paragraph above the items. */
  intro?: string;
  items: SectionItem[];
  /** Optional closing paragraph below the items. */
  outro?: string;
}

/** An ❌ / ✍️ pair. Two fields rather than free text: the contrast is the point,
 *  and a single blob could not render the two halves differently. */
export interface Misconception {
  wrong: string;
  right: string;
}

/** Khmer-only sibling of PracticeQuestion. */
export interface SectionQuestion {
  /** Optional ស្ថានភាព setting the question up. Rendered above the prompt in a
   *  quieter style, because it is the situation rather than the question. */
  scenario?: string;
  q: string;
  options: string[];
  /** Must match one of `options` EXACTLY — the comparison is string equality,
   *  so the ក./ខ./គ./ឃ. prefix has to be carried here too. */
  correct: string;
  explanation: string;
}

/** Poster + duration for a section's video. There is no video file yet; see
 *  SectionVideoPlayer for why the player is built anyway. */
export interface SectionVideo {
  /** public/-relative poster image, e.g. "/sections/biology-3-1-1.webp". */
  poster: string;
  /** Run time in seconds, formatted for display. A number rather than a string
   *  so a malformed "3:9" cannot be typed in. */
  durationSec: number;
}

export interface SectionContent {
  title: string;
  /** Shown at the top of the section, under the title. */
  video?: SectionVideo;
  /** Opens the section — why the topic matters and what it covers. Rendered
   *  first, with no heading of its own: the section title above it is the
   *  heading, and a second one would just repeat it. */
  intro: SectionBlock;
  lesson: SectionBlock;
  examples: SectionBlock;
  notes: SectionBlock;
  mistakes: Misconception[];
  /** Interactive 3D model, shown under the examples. Same shape and the same
   *  viewer the Human Brain lesson uses — absent on every section without one,
   *  so no other section pays for the three.js chunk. */
  model3d?: Model3DRef;
  /** Absent until questions are written; the block simply doesn't render. An
   *  ARRAY because a section can ask several — the first one authored has two. */
  quiz?: SectionQuestion[];
}

/**
 * One flashcard in a lesson's practice deck.
 *
 * Deliberately NOT the older `Flashcard` above, which carries `{ en, km }` pairs
 * and a `topic` string tying it to the legacy 7-step lesson flow. The practice
 * feature is Khmer-only (PRACTICE_PAGE_LANG in features/practice/practice.ts) and
 * keys its content by LESSON rather than by topic, so an English column here
 * would be fabrication dressed as data — the same call SectionContent made.
 */
export interface PracticeCard {
  /** The prompt side — a term, a question, a formula to recall. */
  front: string;
  /** The answer side, revealed on flip. */
  back: string;
}

export type MockExamSubject = "math" | "biology" | "chemistry" | "physics";

/**
 * One multiple-choice question in an exam.
 *
 * `subj` is OPTIONAL here because a past paper is ONE subject end to end and
 * carries its label on the paper rather than repeating it per question — and
 * MockExamSubject cannot express a Khmer or History paper anyway, which the
 * past-paper catalog has entries for.
 */
export interface ExamQuestion {
  subj?: MockExamSubject;
  q: { en: string; km: string };
  correct: string;
  options: string[];
}

/** A question in the generated mock exam, where the subject is always known. */
export interface MockExamQuestion extends ExamQuestion {
  subj: MockExamSubject;
}

// A worked past-paper answer, used as a few-shot example in KruAI's
// system prompt (see data/bac2-format.ts). `verified` means a teacher has
// checked the answer against a real MoEYS paper / answer key.
export interface Bac2Example {
  subject: string;
  question: { en: string; km: string };
  answer: { en: string; km: string };
  verified: boolean;
}
