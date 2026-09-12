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

/**
 * The flat bonus for each daily task — lesson, practice, flashcards, challenge —
 * paid once per task per day by `completeTask` in lib/store.ts.
 *
 * It was a bare `20` inside the store until it gained a second reader:
 * lib/supabase-sync.ts rebuilds a day's XP from how many tasks were ticked, for
 * daily_activity rows written before xp_earned was filled in. Two copies of the
 * number would be two numbers waiting to disagree — the reason this file exists.
 */
export const TASK_XP = 20;

/**
 * XP for one correct answer in a Game competition.
 *
 * DELIBERATELY THE SAME RATE AS A QUIZ ANSWER, and defined as that constant
 * rather than as a second `10`, so the two cannot drift apart. A competition
 * question is the same act as a practice question — commit to an answer, be
 * right or wrong — and paying more for it would make the fastest way to earn XP
 * a race rather than a lesson.
 *
 * It is named rather than used inline because it is the obvious place a future
 * tuning goes ("a competition is worth more"), and a named constant makes that
 * one edit instead of a hunt through two pages.
 *
 * NO COIN OVERRIDE. Callers pass this to the store's competition actions, which
 * route through `award()` with no coin argument, so the default COINS_PER_XP
 * ratio applies. lib/store.ts warns that a THIRD hand-set coin figure is the
 * signal the ratio itself is wrong; this deliberately does not become one.
 */
export const GAME_XP_PER_CORRECT = QUIZ_XP;
