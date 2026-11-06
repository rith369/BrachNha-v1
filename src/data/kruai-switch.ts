/**
 * THE ON/OFF SWITCH FOR KRUAI. Read by the app (components/shell/app-shell.tsx,
 * features/login) and by the server (server/chat-handler.ts), so turning it off
 * here both hides it and stops every question before it reaches Google.
 *
 * OFF since 6 Nov 2026: the user does not want to pay for the model yet. While
 * off, the corner button is Feedback (components/shell/feedback-fab.tsx), which
 * opens a Telegram chat with the team. Nothing was deleted: the chat, the
 * conversations students already have, the daily limits and Admin → KruAI all
 * come back by setting this to `true`.
 *
 * Imported by the server, so relative imports only and no `@/` alias, the same
 * rule as utils/chat-prompt.ts.
 */
export const KRUAI_ENABLED = false;
