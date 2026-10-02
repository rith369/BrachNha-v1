/**
 * Words shared by KruAI's server side (the prompt in data/bac2-format.ts, the
 * handler in server/chat-handler.ts) and the chat screen
 * (components/shell/chat-overlay.tsx, browser side).
 *
 * Its own tiny module ON PURPOSE: the chat screen needs these few words, and
 * importing them from bac2-format.ts would pull the whole system prompt into the
 * browser bundle, where every student could read the instructions KruAI is told
 * never to reveal.
 */

/**
 * What the "show full solution" button sends, and what the Socratic rules tell
 * the model to answer with a full solution. One string, so the two cannot drift.
 */
export const SHOW_SOLUTION_KM = "សូមបង្ហាញដំណោះស្រាយពេញ";

/**
 * The first character of every GUIDED reply (the Socratic rules tell the model
 * to start with it). Two readers: the chat screen shows "show full solution"
 * under the last reply carrying it, and utils/chat-anchor.ts uses it to find
 * where the exercise being guided began.
 */
export const GUIDE_MARK = "🧭";

/**
 * Response headers the chat endpoint sets for the chat screen.
 *
 * LEFT: the student's daily units still unspent AFTER this question (a photo
 * costs 3). Sent on every answer that was charged, and as "0" with a refusal
 * at the student's own limit. A curated answer is free and sends none, so the
 * screen keeps the last number it had.
 *
 * LIMIT: "user" or "app" on a refusal at a daily limit, or "blocked" when the
 * team paused KruAI for this account (a 403). The screen offers no "try again"
 * under any of them, since trying again cannot help.
 */
export const KRUAI_LEFT_HEADER = "X-KruAI-Left";
export const KRUAI_LIMIT_HEADER = "X-KruAI-Limit";
