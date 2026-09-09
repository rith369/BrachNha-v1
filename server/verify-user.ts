import {
  createHmac,
  createPublicKey,
  timingSafeEqual,
  verify,
  // node:crypto has its own JsonWebKey (it carries an index signature); the
  // global one from lib.dom does not, and they are not assignable.
  type JsonWebKey as NodeJsonWebKey,
} from "node:crypto";

/**
 * Verifies a Supabase access token, so /api/chat can tell a real student from
 * anyone else who found the URL.
 *
 * ── No `@/` alias in this file, or anything it imports ────────────────────
 *
 * The Vercel function bundler reads the ROOT tsconfig.json, a solution file
 * with no `paths`, so an aliased import here fails the deploy build rather than
 * the local typecheck. Relative imports and node builtins only. Same rule as
 * chat-handler.ts and utils/chat-prompt.ts.
 *
 * ── Why the token is verified LOCALLY ─────────────────────────────────────
 *
 * The obvious route is GET {SUPABASE_URL}/auth/v1/user with the bearer token.
 * It was rejected on three counts. It puts a full round trip to the Supabase
 * region in front of a stream whose whole selling point is ~2.7s to first
 * character. Every student's check would egress from the same handful of Vercel
 * IPs, so Supabase's own per-IP limits on auth endpoints would eventually
 * throttle the entire app's mentor with an error that looks like nothing. And
 * caching it correctly means capping the cache at the token's own `exp` anyway.
 *
 * Verifying the signature here costs no network at all after the first request
 * per instance, and no dependency: this project's tokens are ES256 (verified
 * against its live JWKS endpoint), which node:crypto reads natively from a JWK.
 *
 * THE TRADE, stated plainly: a locally verified token cannot be revoked early.
 * A student signed out on another device keeps a working token until it expires
 * — one hour by default. For a rate-limit gate on a chat endpoint that is the
 * right trade. It would NOT be for anything destructive, so do not reuse this
 * to authorise writes without revisiting it.
 */

export type VerifyFailure =
  | "unconfigured"
  | "missing"
  | "malformed"
  | "unknown-key"
  | "bad-signature"
  | "expired"
  | "wrong-audience"
  | "anonymous";

export type VerifyResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; reason: VerifyFailure };

interface JwkKey {
  kid?: string;
  kty?: string;
  crv?: string;
  x?: string;
  y?: string;
  alg?: string;
}

/** Small clock-skew allowance, so a token that expires mid-flight between the
 *  student's browser and the function is not rejected on a rounding error. */
const CLOCK_SKEW_SEC = 30;

/** The JWKS is a handful of keys that change about never, so one fetch per
 *  instance is right. An unknown `kid` forces a re-fetch (that is what key
 *  rotation looks like), but no more often than this — otherwise a stream of
 *  junk tokens with invented kids becomes a fetch amplifier. */
const JWKS_REFETCH_MIN_MS = 60_000;

let jwksKeys: JwkKey[] | null = null;
let jwksFetchedAt = 0;
let jwksInFlight: Promise<JwkKey[] | null> | null = null;

/** Vercel injects every project env var into the Node runtime regardless of
 *  prefix, so the VITE_-prefixed values the browser build uses are readable
 *  here too — no second copy of the URL to keep in step. SUPABASE_URL is
 *  accepted first for anyone who prefers the unprefixed name. */
function supabaseUrl(): string {
  return (
    process.env.SUPABASE_URL?.trim() ||
    process.env.VITE_SUPABASE_URL?.trim() ||
    ""
  );
}

/** True when this deployment can verify anything at all. */
export function isVerificationConfigured(): boolean {
  return Boolean(supabaseUrl());
}

function decodeSegment(segment: string): unknown {
  try {
    return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

async function fetchJwks(): Promise<JwkKey[] | null> {
  const base = supabaseUrl();
  if (!base) return null;

  jwksInFlight ??= (async () => {
    try {
      const res = await fetch(`${base}/auth/v1/.well-known/jwks.json`);
      if (!res.ok) {
        console.warn(`[auth] JWKS fetch failed: ${res.status}`);
        return null;
      }
      const body = (await res.json()) as { keys?: JwkKey[] };
      return Array.isArray(body.keys) ? body.keys : null;
    } catch (err) {
      console.warn("[auth] JWKS fetch failed:", err);
      return null;
    } finally {
      // Cleared on the next tick so concurrent callers share this one request
      // but a later failure can be retried.
      setTimeout(() => {
        jwksInFlight = null;
      }, 0);
    }
  })();

  return jwksInFlight;
}

async function keyForKid(kid: string): Promise<JwkKey | null> {
  const hit = jwksKeys?.find((k) => k.kid === kid);
  if (hit) return hit;

  if (Date.now() - jwksFetchedAt < JWKS_REFETCH_MIN_MS && jwksKeys) return null;

  const keys = await fetchJwks();
  if (!keys) return null;
  jwksKeys = keys;
  jwksFetchedAt = Date.now();
  return keys.find((k) => k.kid === kid) ?? null;
}

function verifyEs256(signingInput: string, signature: Buffer, jwk: JwkKey): boolean {
  try {
    const key = createPublicKey({
      // Only the four members that define the curve point. The JWKS also
      // carries `use`, `key_ops` and `ext`, which node's JWK reader rejects or
      // ignores depending on version — passing a minimal key avoids the
      // question entirely.
      key: {
        kty: jwk.kty,
        crv: jwk.crv,
        x: jwk.x,
        y: jwk.y,
      } as NodeJsonWebKey,
      format: "jwk",
    });
    return verify(
      "sha256",
      Buffer.from(signingInput),
      // A JWS signature is the raw r||s pair, not the DER wrapper node defaults
      // to. Without this it fails every time, with no error to explain it.
      { key, dsaEncoding: "ieee-p1363" },
      signature
    );
  } catch (err) {
    console.warn("[auth] ES256 verification error:", err);
    return false;
  }
}

function verifyHs256(signingInput: string, signature: Buffer): boolean {
  const secret = process.env.SUPABASE_JWT_SECRET?.trim();
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(signingInput).digest();
  return (
    expected.length === signature.length && timingSafeEqual(expected, signature)
  );
}

/**
 * Pull the bearer token out of a request and check it.
 *
 * Returns the user id on success. Every failure is a distinct reason so the
 * caller can log something useful — but the RESPONSE must not repeat it back:
 * telling a caller whether their token was expired, unsigned or simply for an
 * anonymous user is free reconnaissance.
 */
export async function verifyRequestUser(req: Request): Promise<VerifyResult> {
  if (!isVerificationConfigured()) return { ok: false, reason: "unconfigured" };

  const header = req.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : "";
  if (!token) return { ok: false, reason: "missing" };

  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };

  const [rawHeader, rawPayload, rawSignature] = parts;
  const head = decodeSegment(rawHeader) as { alg?: string; kid?: string } | null;
  const payload = decodeSegment(rawPayload) as {
    sub?: string;
    aud?: string | string[];
    iss?: string;
    exp?: number;
    email?: string;
    is_anonymous?: boolean;
  } | null;
  if (!head || !payload) return { ok: false, reason: "malformed" };

  let signature: Buffer;
  try {
    signature = Buffer.from(rawSignature, "base64url");
  } catch {
    return { ok: false, reason: "malformed" };
  }

  const signingInput = `${rawHeader}.${rawPayload}`;
  let signatureOk = false;
  if (head.alg === "ES256" && head.kid) {
    const jwk = await keyForKid(head.kid);
    if (!jwk) return { ok: false, reason: "unknown-key" };
    signatureOk = verifyEs256(signingInput, signature, jwk);
  } else if (head.alg === "HS256") {
    // Legacy projects still on the shared JWT secret. Supabase is moving to
    // asymmetric keys and this project already uses them, so this branch is a
    // compatibility path rather than the main one.
    signatureOk = verifyHs256(signingInput, signature);
  }
  if (!signatureOk) return { ok: false, reason: "bad-signature" };

  // Claims are only worth reading once the signature says they are ours.
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp + CLOCK_SKEW_SEC < now) {
    return { ok: false, reason: "expired" };
  }

  const audience = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audience.includes("authenticated")) {
    return { ok: false, reason: "wrong-audience" };
  }

  if (payload.iss !== `${supabaseUrl()}/auth/v1`) {
    // A validly signed token from a different project is still not ours.
    return { ok: false, reason: "wrong-audience" };
  }

  // The whole point of the endpoint being gated. An anonymous user is not a
  // login, and letting one through would hand every guest the AI credits this
  // gate exists to protect.
  if (payload.is_anonymous === true) return { ok: false, reason: "anonymous" };

  if (!payload.sub) return { ok: false, reason: "malformed" };

  return { ok: true, userId: payload.sub, email: payload.email ?? "" };
}
