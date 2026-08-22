export type Lang = "en" | "km";

export interface UserData {
  strengths: string[];
  weaknesses: string[];
  grade: string;
  months: string;
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
  months: string;
  hoursPerDay: number;
  mission: { lessons: number; practice: number; flashcards: number };
}

// One bubble in the AI Mentor chat. Shared by the store (which owns the
// history), the ChatOverlay (which renders it) and the /api/chat route (which
// replays it to Gemini as conversation context), so all three agree on shape.
export interface ChatMsg {
  role: "user" | "bot";
  text: string;
}

// One saved conversation with the AI Mentor. Conversations are created lazily —
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

export interface Lesson {
  title: { en: string; km: string };
  importance: string;
  icon: string;
  content: { en: string; km: string };
  summary: { en: string; km: string };
  funFact: { en: string; km: string };
  tip: { en: string; km: string };
  didYouKnow?: { en: string; km: string };
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

export interface MockExamQuestion {
  subj: "math" | "biology" | "chemistry" | "physics";
  q: { en: string; km: string };
  correct: string;
  options: string[];
}

// A worked past-paper answer, used as a few-shot example in the AI Mentor's
// system prompt (see data/bac2-format.ts). `verified` means a teacher has
// checked the answer against a real MoEYS paper / answer key.
export interface Bac2Example {
  subject: string;
  question: { en: string; km: string };
  answer: { en: string; km: string };
  verified: boolean;
}
