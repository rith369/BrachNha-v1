# Content: how to write it

Flashcard decks, practice quizzes, lesson sections and past papers live in the
**database**, not in the code (decks and quizzes since 3 Oct 2026,
`docs/plans/content-in-database.md`; sections and papers since 7 Oct 2026,
`docs/plans/sections-and-papers-in-database.md`). The team edits everything on
**Admin → Content** and only the owner publishes. This folder holds content as
JSON files on their way in, plus `fixture.json`.

## The files here

| file | what it is |
| --- | --- |
| `fixture.json` | A copy of everything published (17 decks, 9 quizzes, 7 lesson sections, 2 past papers on 7 Oct 2026). It is the content a development server shows when Supabase is not configured, and what a NEW project is filled from. `npm run content:export` refreshes it from what is published now. |
| `new/*.json` | New content waiting to be imported (a new past paper arrives this way). Delete each file once its content is published: the database is the only copy. |

A file is `{ "format": 1, "items": [ { "kind": "deck" | "quiz" | "section" | "paper", "key": "...", "body": ... } ] }`.
A deck's or a quiz's body is a list; a section's or a paper's is an object.

## Adding content

1. Write it as a JSON file under `content/new/`.
2. `npm run check:content` checks it with the same rules the editor uses.
3. The owner opens Admin → Content → **Import a file**, leaves "publish items
   never published" unticked, and imports. Everything arrives as a draft.
4. Check each item in the editor's preview, then **Publish**.
5. Delete the file from `content/new/`.

## Keys and ids

- **A key** names where the content sits in the app:
  `"{subject}-{chapter}-{lesson}"` for a deck (`biology-1-1`),
  `"{subject}-{chapter}-{lesson}-{section}"` for a quiz on a quiz path
  (`math-1-1-1`) and for a lesson section (`biology-3-1-1`, the node on the
  Study path), and `"{year}-{subject}"` for a past paper (`2025-math`). New
  on Admin → Content only offers keys a student can reach.
- **A card id is kept for ever** (`biology-1-1-3`). Each student's review
  history is filed under it, so an id is never changed and never given to
  another card, even after the card is deleted.
- **A question id is `q1`, `q2`…**, never reused within one quiz. Mistake
  reports name a question by it, so a report still points at the right
  question after the questions are reordered. In a section, the ids run across
  BOTH quizzes (`quiz` then `quizHarder`) and never repeat between them.
- **A past paper's question and gap ids** are a letter and a number (`l1`,
  `g4`, `r7`), unique across the whole paper: a student's saved answers are
  kept under them. A new question takes its part's letter and the next number
  never used.

## Writing a card

- `front` is what the student sees first; `back` is the answer.
- A long answer in parts reads better as lines starting `"• "`, separated by
  `\n`. The card keeps line breaks.

## Writing a quiz question

`{ "id", "scenario"?, "q", "options", "correct", "explanation", "help"? }`

- **Options start `ក. ` `ខ. ` `គ. ` `ឃ. `** in that order, and `correct` is
  COPIED from its option, prefix included: the app compares them letter for
  letter, so a stray space marks every student wrong on that question.
- **Spread the right answers across ក, ខ, គ and ឃ** (about a quarter each in
  a quiz). Never leave them bunched on one letter, or students learn to guess.
- **The explanation shows how to reach the answer**, not "the answer is ក".
- `help` is optional: `label` (a short title for the rule), `note` (the rule in
  2 to 4 lines), `mistake` (the usual mistake, one sentence), `questions`
  (similar exercises) and `foundation` (easier exercises). Exercise options
  have no ក. prefix.

## Writing a lesson section

`{ "title", "video"?, "intro", "examples", "lesson", "notes", "mistakes", "model3d"?, "quiz"?, "quizHarder"? }`

- **A student sees it in two steps, and the order is the teaching.** Step 1:
  the video, `intro`, `examples`, the 3D model and `quiz`. Step 2: `lesson`,
  `notes`, `mistakes` and `quizHarder`. A question on step 1 may only ask what
  the video and the examples have already shown; anything that needs the rules
  belongs in `quizHarder`. Re-check the ក ខ គ ឃ spread in EACH quiz.
- **Each block** is `{ "intro"?, "items": [ { "label"?, "body", "items"? } ], "outro"? }`:
  a lead paragraph, a bulleted list of points, a closing paragraph. A point's
  `label` is bold words before its text (the app adds the ៖ after them), and
  its own `items` are sub-points.
- **A mistake** is `{ "wrong", "right" }`: what students wrongly think, and
  what is true. The pairing is the teaching, so neither half stands alone.
- **The video poster and the 3D model are files the app ships**
  (`/sections/{id}.webp`, `/models/{name}.glb`); the editor offers only those.
  A new picture has to be added to the app first. `youtubeId` is the 11
  characters after `watch?v=`, never a link, and only once the video exists.
- A model's `credit` is required: its licence asks for it.

## Writing a past paper

`{ "minutes", "points"?, "note"?, "sections": [part, …], "writing"?, "skills"? }`

- **The paper's own words are COPIED, never paraphrased**: each part's `title`,
  `instruction` and `statement` (the whole exercise, printed before its
  sub-questions). Only the multiple-choice options and the explanations are
  ours. A rewritten statement is our sentence wearing MoEYS's authority.
- **A part holds `questions` OR a `gapFill`**, never both. A question is
  `{ "id", "q", "options", "correct", "explanation", "points"?, "skill"? }`,
  where `points` is what the printed paper marks it out of (shown, never
  scored).
- **A gap-fill** is `{ "title", "body", "wordBank", "gaps" }`. Write each gap in
  the passage as `{n}`; each gap's `correct` is one of the words in the box,
  copied exactly. The gap the paper fills in for students has `"example": true`
  and is not scored.
- **`skills`** holds the drills a wrong answer offers, keyed by the id a
  question or gap names in `skill`: `{ "label", "note", "mistake"?, "questions",
  "foundation"? }`, the same shape as a quiz question's `help`.
- **`writing`** is the essay task: `{ "title", "prompt", "minWords", "modelEssay": [paragraphs], "checklist": [lines] }`.
  The model essay is written for BrachNha, not the paper's printed sample.
- **`minutes` comes off the paper's own header**; students get that long.

### Distractors (the wrong options) are rules, not taste

These came with the first maths quiz, where about 150 wrong options were
written by hand. A wrong option that is ALSO correct marks a student wrong
forever and looks like nothing.

1. **One canonical form.** Fractions are always `\frac{a}{b}`, never a decimal,
   with any sign in the numerator (`-\frac{1}{4}`). That makes `\frac{1}{4}`
   beside `0.25` impossible to write rather than merely avoided.
2. **Distinct VALUES, not just distinct strings.** `\frac{2}{4}` never sits
   beside `\frac{1}{2}`. The ក. ខ. prefixes make every option a different
   string, which is exactly how they hide a repeated value.
3. **One spelling per idea.** "No limit" is always គ្មានលីមីត, never a second
   wording, or two options mean the same thing.
4. **Every distractor comes from a real mistake.** Write the `mistake` line
   first, then derive the wrong options from it. A wrong option whose mistake
   cannot be named is noise.

## Form, for every string

- **Maths is LaTeX inside `$…$`.** In JSON a backslash is written twice
  (`"$\\frac{1}{2}$"`). Written once, `\f`, `\t`, `\b`, `\n` and `\r` turn into
  control characters and the maths renders wrong without any error.
- **Khmer never goes inside `$…$`**: the maths font has no Khmer letters and
  shows empty boxes. Write `$x = 0$ ជាប់`, never `$\text{ជាប់}$`.
- **Digits are Latin (0-9)**, never Khmer numerals.
- **No em dash (—).** Use a comma, a full stop, `។` or `៖`.
- **Khmer stays Khmer.** Exam terms keep their Latin name in brackets on first
  use (`ខួរធំ (Cerebrum)`); product words (Flashcard, Quiz, KruAI) stay Latin.

`npm run check:content` and the editor catch the LaTeX, Khmer-in-maths,
digit, em-dash and option mistakes. Nothing can catch two options with the same
value in different forms, which is what rule 1 is for.

## Where the first content came from

- **Biology decks** were transcribed from photographs of the textbook's Q&A
  pages. Dense Khmer script is easy to misread, so treat them as a best-effort
  transcript: when a misread word turns up, search every deck for it, not only
  the card it was reported on (it happened with ស៊ីមណូស្ពែម).
- **Maths quizzes**: the exercises, answers, rules and mistakes came from the
  user and the MoEYS Grade 12 Math Summary book; the three wrong options on each
  question were written for BrachNha by the rules above.
- **History quizzes** follow the MoEYS Grade 12 History textbook.
