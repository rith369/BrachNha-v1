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
// SO THIS IS DECORATION, NOT A CLAIM, and the page carries `PreviewTag` for
// exactly this reason: the app's rule was never "no sample data", it is "sample
// data must be labelled". That pill is the label, and it stays until this file
// no longer feeds anything.
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
