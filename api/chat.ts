import { handleChat } from "../server/chat-handler";

/**
 * The KruAI endpoint on Vercel.
 *
 * `vite build` produces a static `dist/` with no server, so in production this
 * file is what makes the mentor answer. Vercel treats every file under `api/`
 * as a Serverless Function, and its Node runtime accepts a web-standard
 * `Request -> Response` handler — which is exactly the shape
 * server/chat-handler.ts already has, so there is nothing to adapt.
 *
 * The same handler is served in local dev by server/vite-chat-plugin.ts, so
 * `POST /api/chat` behaves identically in both places and there is only one
 * copy of the logic.
 *
 * Set GEMINI_API_KEY in the Vercel project's Environment Variables (unprefixed
 * — it must NOT be VITE_*, or Vite would inline it into the browser bundle).
 * Without it the mentor returns its friendly "unavailable" notice instead of
 * failing, so a deploy with no key still works everywhere else.
 *
 * maxDuration is set in vercel.json: the reply streams, and the default 10s
 * would cut off long answers mid-sentence.
 */
export default function handler(request: Request): Promise<Response> {
  return handleChat(request);
}
