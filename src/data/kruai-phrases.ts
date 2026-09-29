/**
 * Words shared by KruAI's prompt (data/bac2-format.ts, server side) and the chat
 * screen (components/shell/chat-overlay.tsx, browser side).
 *
 * Its own tiny module ON PURPOSE: the chat screen needs this one phrase, and
 * importing it from bac2-format.ts would pull the whole system prompt into the
 * browser bundle, where every student could read the instructions KruAI is told
 * never to reveal.
 */

/**
 * What the "show full solution" button sends, and what the Socratic rules tell
 * the model to answer with a full solution. One string, so the two cannot drift.
 */
export const SHOW_SOLUTION_KM = "សូមបង្ហាញដំណោះស្រាយពេញ";
