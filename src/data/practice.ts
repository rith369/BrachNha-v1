import type { PracticeCard, SectionQuestion } from "../types/index.js";

/**
 * Per-lesson flashcard decks and quizzes — the content slot behind the two tabs
 * on /practice.
 *
 * Exactly the discipline PAST_PAPER_QUESTIONS follows in data/past-papers.ts;
 * read its header for the longer version of the same argument. A missing key
 * means "no deck/quiz written yet," which is the normal state for every key
 * except the one below.
 *
 * NOTE this file deliberately imports nothing from features/ — data/ sits at the
 * bottom of the graph, as data/lessons.ts and data/past-papers.ts both do. The
 * typed practiceKey(subjectId, chapter, lesson) helper lives in
 * features/practice/practice.ts; here the records are keyed by plain string.
 */

/**
 * The key both records use: `"{subjectId}-{chapter}-{lesson}"` — e.g.
 * `"biology-1-1"` for ជំពូក ១ · មេរៀនទី ១, which matches the chapter/lesson
 * numbering already authored in features/lessons/sessions.ts's
 * SUBJECT_SESSIONS.biology[0].lessons[0] — the same lesson the Study path
 * renders, so this deck and that path node describe the same real lesson.
 */

/**
 * Flashcards per lesson. A missing key means "no deck written yet".
 *
 * "biology-1-1" — ជំពូក ១ · មេរៀនទី ១ (Gymnosperms) — is the first REAL content
 * in this record, transcribed from the textbook's own Q&A study page for the
 * lesson. TRANSCRIBED FROM A PHOTOGRAPHED PAGE, not typed from a digital
 * source — dense Khmer script is genuinely easy to misread character-by-
 * character, so this is a best-effort pass pending a native read-through
 * rather than a guaranteed-correct transcript. Spot-check it against the
 * original page and fix any misread words directly here; nothing else in the
 * app needs to change when you do; see report.md for the same note.
 *
 * `id` is `"biology-1-1-{n}"`, matching the `"{subjectId}-{chapter}-{lesson}-{n}"`
 * shape sectionsFor() already uses for section ids, so every id in this lesson
 * follows one numbering scheme. `createdAt`/`updatedAt` are a fixed authoring
 * date since these are static, hand-entered cards, not something a UI edits.
 */
const BIOLOGY_1_1_AUTHORED_AT = "2026-09-03T00:00:00.000Z";

function officialCard(n: number, front: string, back: string): PracticeCard {
  return {
    id: `biology-1-1-${n}`,
    front,
    back,
    source: "official",
    createdAt: BIOLOGY_1_1_AUTHORED_AT,
    updatedAt: BIOLOGY_1_1_AUTHORED_AT,
  };
}

export const PRACTICE_DECKS: Record<string, PracticeCard[]> = {
  "biology-1-1": [
    officialCard(
      1,
      "ដូចម្តេចដែលហៅថាស៊ីមណូស្ពែម?",
      "ស៊ីមណូស្ពែម ជារុក្ខជាតិមួយក្រុម គ្រាប់របស់វាគ្មានសំបកការពារពីខាងក្រៅ។"
    ),
    officialCard(
      2,
      "ចូរពណ៌នាពីស៊ីមណូស្ពែមទាំងបួនក្រុម។",
      [
        "• ប្រង់ (Cycad)៖ ប្រើមាននៅតំបន់ត្រូពិច និងក្សេត្រូពិច ដែលជាប្រភេទមួយមានច្រើនជាងគេ។ ដើមមានទម្រង់ដូចដើមឆ្កាត ហើយមានស្លឹកទុំនៅខាងចុង។",
        "• កូនីភែ (Conifer)៖ មានក្រុមច្រើនជាងគេ ដែលភាគច្រើនមានស្លឹករាងតូចមូល។ ស្លឹកមានពណ៌បៃតងពេញមួយឆ្នាំ ហើយអាចរស់បានពី ២ ទៅ ៤ ឆ្នាំ។ គ្រាប់របស់វាមានអាហារបម្រុងសម្រាប់សត្វកកេវ។",
        "• គីងកូ (Ginkgo)៖ មាននៅប្រទេសចិន ជប៉ុន និងកូរ៉េ វាជាប្រភេទដែលធន់នឹងបរិយាកាសខ្ពស់។",
        "• ស៊ីណេគូតី (Gnetophyte)៖ ជារុក្ខជាតិដែលដុះនៅតំបន់វាលខ្សាច់ និងអាកាសធាតុក្ដៅ ព្រមទាំងតំបន់ត្រូពិចដែលមានឈើឡើម។ អាចជាដើម ជាវល្លិ ឬជាឧបព្រឹក្សសម្រាប់លម្អ។",
      ].join("\n\n")
    ),
    officialCard(
      3,
      "តើដើមរបស់ស៊ីមណូស្ពែមមានលក្ខណៈដូចម្តេច?",
      "ដើមមានសណ្ឋានជាដើមទោល ត្រង់ ហើយបញ្ចប់ដោយកូនស្លឹកនៅកំពូលដើម ហើយដើមខ្លះបែកមែក។"
    ),
    officialCard(
      4,
      "តើស្លឹករបស់ស៊ីមណូស្ពែមមានរាងដូចម្តេច?",
      "ស្លឹកមានរាងដូចម្ជុល ជាស្រុក ឬជារាងឆ្នូត។"
    ),
    officialCard(
      5,
      "តើគ្រាប់លងផ្កាដុះនៅឯណា? តើវាត្រូវបានផលិតនៅឯណា?",
      "គ្រាប់លងផ្កាដុះនៅក្នុងសរីរាង្គបន្តពូជ (កោន) របស់រុក្ខជាតិ។"
    ),
    officialCard(
      6,
      "តើកោនជាអ្វី? ក្នុងការបន្តពូជរបស់ស៊ីមណូស្ពែម តើកោនមាននាទីជាអ្វី?",
      "កោនជាសរីរាង្គបន្តពូជរបស់ស៊ីមណូស្ពែម។ ក្នុងការបន្តពូជ វាផលិតកោនញី និងកោនញញោល៖ កោនញីជាកន្លែងផលិតគ្រាប់ ចំណែកកោនញញោលជាកន្លែងផលិតលង។"
    ),
  ],
};

/**
 * Quiz questions per lesson. A missing key means "no quiz written yet".
 *
 * Typed as SectionQuestion — the curriculum question type — REUSED verbatim
 * rather than copied into a practice-specific twin. It is already Khmer-only
 * with the optional ស្ថានភាព scenario, and its `correct` is compared by string
 * equality, so the ក./ខ./គ./ឃ. prefix has to be repeated there exactly as it is
 * in the option. A parallel type would be a second thing to keep in step for no
 * gain.
 *
 * Empty today — the source material provided for biology-1-1 was Q&A study
 * questions (now the flashcard deck above), not a multiple-choice quiz.
 */
export const PRACTICE_QUIZZES: Record<string, SectionQuestion[]> = {
  // "biology-1-1": [ { q: "…", options: [...], correct: "…", explanation: "…" } ],
};

/** A lesson's deck, or an empty array when none is written. */
export function deckFor(key: string): PracticeCard[] {
  return PRACTICE_DECKS[key] ?? [];
}

/** A lesson's quiz, or an empty array when none is written. */
export function quizFor(key: string): SectionQuestion[] {
  return PRACTICE_QUIZZES[key] ?? [];
}
