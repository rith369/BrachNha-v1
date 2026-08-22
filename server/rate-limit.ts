/**
 * In-memory sliding-window rate limiter for the public /api/chat endpoint.
 *
 * Lives in lib/ rather than utils/ because it holds state (the hit map) —
 * utils/ is pure functions only.
 *
 * Scope, stated honestly: the map lives in one serverless instance, and Vercel
 * runs several. For a 60-second window that is an acceptable trade — instances
 * are reused across requests, so a burst from one source largely lands on one
 * instance — but it is a guardrail, not an exact global quota. Exact
 * enforcement would need a shared store (Redis), which isn't worth provisioning
 * for this. Widening the window would weaken it further: a *daily* counter held
 * this way would reset on every cold start and mean almost nothing.
 */

/** Stop the map growing without bound under a distributed flood. */
const MAX_TRACKED_KEYS = 10_000;

/** key -> timestamps (ms) of requests still inside the window. */
const hits = new Map<string, number[]>();

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the oldest in-window hit expires. 0 when allowed. */
  retryAfterSec: number;
}

/**
 * Records a hit for `key` and reports whether it may proceed.
 * Call once per request — it mutates state.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  // Drop keys whose hits have all aged out. Without this the map grows forever
  // on a long-lived instance, since every distinct IP would leave an entry.
  for (const [k, times] of hits) {
    const live = times.filter((t) => t > cutoff);
    if (live.length) hits.set(k, live);
    else hits.delete(k);
  }

  // Map iterates in insertion order, so the first key is the least recently
  // created — good enough eviction for a backstop that should never trigger
  // in normal use.
  if (!hits.has(key) && hits.size >= MAX_TRACKED_KEYS) {
    const oldest = hits.keys().next();
    if (!oldest.done) hits.delete(oldest.value);
  }

  const times = hits.get(key) ?? [];

  if (times.length >= limit) {
    const oldest = times[0];
    return {
      ok: false,
      // Round up so Retry-After never tells the caller to retry too early.
      retryAfterSec: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  times.push(now);
  hits.set(key, times);
  return { ok: true, retryAfterSec: 0 };
}
