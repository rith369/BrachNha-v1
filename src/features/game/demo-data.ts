// ============================================================
// DEMO DATA — the Game hero card, and ONLY the hero card
// ------------------------------------------------------------
// KEPT ON THE USER'S EXPLICIT INSTRUCTION. The original page showed a
// fabricated match in progress, and when the feature was rebuilt that card was
// replaced with an honest "waiting for a joiner" state. The user asked for the
// old card back as it was — "keep it fake" — with only the button's wording
// changed and the left-hand fighter swapped to the real student. This file is
// what feeds that.
//
// SO THIS IS DECORATION, NOT A CLAIM. The page used to carry `PreviewTag` to
// say so; the user asked for that pill to be removed (17 Sep 2026), so this card
// is the app's one knowingly unlabelled piece of sample data. The kicker reads
// "Battle" rather than "Live Game" — which also stops it claiming a live match.
//
// WHAT IS REAL ON THAT CARD: the left fighter's name and avatar, and the button.
// WHAT COMES FROM HERE: the opponent, both scores, the HP split, the subject,
// the question progress and the clock.
//
// Everything else on /game — the stats strip, the competition list, the history
// — is REAL now, derived from the store. Do not add to this file to make a new
// section "look fuller"; that is the habit the rest of the rebuild removed.
// ============================================================

export const liveOpponent = {
  name: "Srey Roth",
  grade: "Grade 12 · Science",
  // Must exist in public/avatars/ — the DiceBear API is not called at runtime.
  avatarSeed: "sreyroth",
  score: "4/10",
  hpPct: 38,
};

export const liveGame = {
  /** The student's own half of the fabricated scoreline. Their NAME and avatar
   *  are real; this number is not. */
  yourScore: "6/10",
  yourHpPct: 62,
  subject: "⚗️ Chemistry",
  questionProgress: "Q7/10",
  totalQuestions: 10,
  timer: "01:24",
};
