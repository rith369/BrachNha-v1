/**
 * Hand-set rewards for answering one question correctly.
 *
 * 10 XP + 5 coins is TWICE the store's default XP→coins ratio (COINS_PER_XP in
 * lib/store.ts), which is why callers pass the coin figure to `addXp` explicitly
 * rather than letting it derive one. That override is deliberate and documented
 * at the store: coins are earned effort in spendable form, and a question a
 * student actually committed to an answer on is worth more per XP than passive
 * progress.
 *
 * THE POINT OF THIS FILE IS THAT THERE IS ONE DEFINITION, NOT TWO. It began as a
 * pair of constants inside section-detail.tsx and was lifted the moment the
 * practice quiz became a second caller — the same lift shell/wordmark.tsx and
 * shell/stat-bar.tsx got, and for the same reason: two copies of a number are
 * two numbers waiting to disagree.
 *
 * lib/store.ts warns that a THIRD override is the signal the ratio itself is
 * wrong and should be re-set rather than worked around again. Keeping both
 * existing callers on this one constant is what keeps that count honest — a new
 * import here is not a new override.
 *
 * A WRONG answer is worth nothing at all, not a smaller amount. Both callers
 * reveal the correct option immediately, so a consolation payout would make
 * guessing worth as much as thinking.
 *
 * Pure constants in utils/, no state and no JSX — the same shape as
 * utils/focus-styles.ts.
 */
export const QUIZ_XP = 10;
export const QUIZ_COINS = 5;

/**
 * Per-card reward for grading a flashcard in a spaced-repetition review — see
 * `gradeCard` in lib/store.ts.
 *
 * Smaller than QUIZ_XP/QUIZ_COINS on purpose: a card review is lower-effort
 * than committing to a multiple-choice answer, and a session grades several
 * cards in a row, so the total adds up without a single card outearning a
 * quiz question.
 *
 * Awarded for EVERY grade, including "Again" — unlike the quiz, a flashcard
 * isn't right/wrong, it's a self-assessed recall rating, and pressing "Again"
 * is genuine engagement (you tried to recall, then re-studied) rather than a
 * guess to be discouraged. The `completeTask("flashcards")` flat bonus on
 * finishing a whole session is unchanged and stacks on top of this.
 */
export const FLASHCARD_XP = 4;
export const FLASHCARD_COINS = 1;
