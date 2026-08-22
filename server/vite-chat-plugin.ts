import type { Connect, Plugin, ViteDevServer } from "vite";
import { loadEnv } from "vite";
import type { ServerResponse } from "node:http";

/**
 * Mounts the AI Mentor endpoint on Vite's own dev server.
 *
 * Under Next.js, app/api/chat/route.ts was a server route: the Gemini key was
 * read from the environment on the server and never reached the browser. Vite
 * only serves static assets, so without this the choice would be to move the
 * key into the client bundle — where anyone viewing the deployed site can read
 * it. This keeps the original arrangement for `npm run dev`.
 *
 * What this does NOT do is give `vite build` a backend. A static dist/ has no
 * server, so `npm run preview` and a real deployment still need a host for
 * handleChat() — see the note at the top of server/chat-handler.ts. Until then,
 * dev is the mode where the mentor answers; everywhere else the chat shows its
 * built-in "unavailable" message rather than breaking.
 */

const ROUTE = "/api/chat";

/** The shape server/chat-handler.ts exports, as seen through ssrLoadModule. */
type ChatModule = { handleChat: (req: Request) => Promise<Response> };

/** Node's IncomingMessage -> the web Request that handleChat() expects. */
async function toWebRequest(
  req: Connect.IncomingMessage,
  origin: string
): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else if (value != null) headers.set(key, value);
  }

  return new Request(new URL(ROUTE, origin), {
    method: req.method ?? "POST",
    headers,
    body: chunks.length ? new Uint8Array(Buffer.concat(chunks)) : undefined,
  });
}

/**
 * Pipes the web Response back out through Node's ServerResponse.
 *
 * Written chunk by chunk rather than buffered: the mentor's reply streams token
 * by token, and collecting it first would turn a response that starts appearing
 * in ~3s into one that appears all at once at the end.
 */
async function sendWebResponse(res: ServerResponse, webRes: Response) {
  const headers: Record<string, string> = {};
  webRes.headers.forEach((value, key) => {
    headers[key] = value;
  });
  res.writeHead(webRes.status, headers);

  if (!webRes.body) {
    res.end();
    return;
  }

  const reader = webRes.body.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
  } finally {
    res.end();
  }
}

export function chatApi(): Plugin {
  return {
    name: "brachnha:chat-api",

    // Vite reads .env files itself and, by design, does not copy them into
    // process.env — only VITE_-prefixed values reach the client. handleChat()
    // reads process.env.GEMINI_API_KEY (as it did under Next), so bridge the
    // unprefixed value across here. The empty prefix loads every key; nothing
    // from this call is exposed to the browser bundle.
    config(_config, { mode }) {
      const env = loadEnv(mode, process.cwd(), "");
      if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
        process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
      }
    },

    configureServer(server: ViteDevServer) {
      server.middlewares.use(ROUTE, async (req, res, next) => {
        if (req.method !== "POST") return next();

        try {
          // Loaded through Vite rather than imported at the top of this file on
          // purpose: it runs chat-handler.ts (and the src/ modules it shares
          // with the client) through Vite's own pipeline, so the @/ alias and
          // TypeScript work there, and editing the prompt or the handler takes
          // effect on the next request without restarting the dev server.
          const mod = (await server.ssrLoadModule(
            "/server/chat-handler.ts"
          )) as unknown as ChatModule;

          const origin = `http://${req.headers.host ?? "localhost"}`;
          await sendWebResponse(res, await mod.handleChat(await toWebRequest(req, origin)));
        } catch (err) {
          // A throw here is a bug in this bridge, not an upstream failure —
          // handleChat catches its own. Log it loudly; the client is waiting.
          console.error(`[${ROUTE}] dev middleware failed:`, err);
          if (!res.headersSent) {
            res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
          }
          res.end("The AI Mentor is unavailable in this dev session.");
        }
      });
    },
  };
}
