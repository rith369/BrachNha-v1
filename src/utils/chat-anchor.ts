// Relative imports only: server/chat-handler.ts imports this file, and the
// Vercel function bundler cannot resolve the @/ alias there. See the note at
// the top of that file.
import { GUIDE_MARK } from "../data/kruai-phrases.js";

/**
 * Where the exercise KruAI is guiding right now began, or -1.
 *
 * WHY: only the last MAX_HISTORY (12) messages reach the model, and a guided
 * chat is many short turns. After about six tries the exercise itself had slid
 * out of that window, and KruAI went on giving hints about a problem it could
 * no longer see. Both sides call this: the server sends the message at this
 * index ahead of the window, and the chat screen keeps its photo in the
 * request, since the exercise is often a photo.
 *
 * HOW: walk back over the bot replies. While they start with GUIDE_MARK they
 * belong to one guided run, and the student message just before the EARLIEST
 * of them is what started it. The first unmarked reply ends the walk. So it
 * returns -1 when the latest reply was not guided (a direct answer, or the full
 * solution), and nothing extra is sent: a direct answer stands on its own.
 *
 * KNOWN LIMIT: a student who starts exercise B while A is still being guided
 * gets one run spanning both, so the anchor is A's message. The note the server
 * wraps it in says only that guidance began there, and the recent turns about B
 * are still in the window, so the model can tell.
 *
 * Shapes are `unknown` because the server calls this on the raw request body.
 */
export function guidedAnchorIndex(
  msgs: readonly { role?: unknown; text?: unknown }[]
): number {
  let anchor = -1;
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    if (m?.role !== "bot") continue;
    const text = typeof m.text === "string" ? m.text.trimStart() : "";
    // An empty bubble is an answer still streaming, or one that never came.
    if (!text) continue;
    if (!text.startsWith(GUIDE_MARK)) break;
    let j = i - 1;
    while (j >= 0 && msgs[j]?.role !== "user") j--;
    if (j < 0) break;
    anchor = j;
    i = j;
  }
  return anchor;
}
