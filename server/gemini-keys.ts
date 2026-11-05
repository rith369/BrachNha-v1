type Env = Record<string, string | undefined>;

const clean = (raw: string | undefined): string[] =>
  (raw ?? "")
    .split(",")
    .map((k) => k.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);

/**
 * The Gemini keys this server may use.
 *
 * IN PRODUCTION, ONLY THE FIRST KEY IN GEMINI_API_KEY, whatever else is set. Google's free tier
 * may use what is sent to it to improve its products, and most of these students are under
 * 18, so one forgotten free key left on Vercel would send some students' questions and photos
 * there, with KruAI answering normally and nothing to show for it. Deleting the extras was
 * the old rule; this makes forgetting one harmless. It cannot tell that the key which is
 * left is the paid one: GEMINI_API_KEY must hold the paid key.
 *
 * `VERCEL` is set on every deployment, previews included, unless the project turned off exposing
 * Vercel's system variables, which is why NODE_ENV counts as well. Failing the other way would be
 * silent, and would quietly bring the whole pool back.
 *
 * EVERYWHERE ELSE, the whole pool: GEMINI_API_KEYS (comma-separated), GEMINI_API_KEY and
 * GEMINI_API_KEY_1..5, without repeats. Local development and the KruAI test set use
 * free keys from .env.local, so testing never spends the credit.
 */
export function resolveApiKeys(env: Env): string[] {
  if (env.VERCEL || env.NODE_ENV === "production") return clean(env.GEMINI_API_KEY).slice(0, 1);

  const pool = [
    env.GEMINI_API_KEYS,
    env.GEMINI_API_KEY,
    env.GEMINI_API_KEY_1,
    env.GEMINI_API_KEY_2,
    env.GEMINI_API_KEY_3,
    env.GEMINI_API_KEY_4,
    env.GEMINI_API_KEY_5,
  ].flatMap(clean);
  return [...new Set(pool)];
}
