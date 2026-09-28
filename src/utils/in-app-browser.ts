/**
 * Is this page running inside another app's embedded browser?
 *
 * ── Why the app cares at all ──────────────────────────────────────────────
 *
 * A student tapping a BrachNha link in Telegram or Messenger gets that app's
 * own webview, not Chrome or Safari. The webview has its OWN cookie jar, so the
 * Google session the student is already signed into on their phone is not there
 * — Google answers the OAuth redirect with an email-and-password form instead of
 * the account chooser. Worse, Google has been progressively REFUSING sign-in
 * from embedded webviews outright (`disallowed_useragent`), so the flow can dead
 * end with an error the student cannot act on.
 *
 * None of that is fixable from inside the webview. The only real answer is to
 * get the page open in the real browser, which is what features/auth's
 * in-app-browser screen exists to ask for.
 *
 * ── Two kinds of signal, and why both are needed ──────────────────────────
 *
 * 1. NAMED TOKENS. Most social apps stamp themselves into the user agent
 *    (`FBAN`, `Instagram`, `MicroMessenger`…). Where one exists it is the
 *    strongest evidence available and it works on every platform.
 *
 * 2. PLATFORM SHAPE, for the apps that stamp nothing — Telegram being the one
 *    that matters most here. Telegram's in-app browser is an ordinary Android
 *    WebView or an ordinary iOS WKWebView and adds no token of its own, so it
 *    can only be recognised by what a webview looks like versus what a real
 *    browser looks like. Those two heuristics are per-platform and are the only
 *    part of this file that can produce a false positive, so each one carries
 *    its own exclusions below.
 *
 * ── The cost of being wrong, in each direction ────────────────────────────
 *
 * A FALSE NEGATIVE (a webview we fail to spot) leaves the student exactly where
 * they are today: sign-in is awkward or refused. Bad, but not new.
 *
 * A FALSE POSITIVE (calling Chrome or Safari a webview) puts a dead-end screen
 * in front of someone whose browser was fine — the "Open in Browser" button has
 * nothing to do, and they cannot get past it. That is strictly worse, so every
 * heuristic here is written to abstain when unsure rather than to guess.
 *
 * Pure and dependency-free (`src/utils/` holds pure functions only), reading
 * `navigator`/`window` defensively so it can never throw before first paint.
 */

/**
 * Apps that name themselves in the user agent.
 *
 * Matched case-insensitively as plain substrings, so they are compared against
 * a lower-cased UA below. Each entry is a token the vendor puts there
 * deliberately, not a fragment of a normal browser's UA — a substring that
 * could also appear in Chrome's or Safari's own string would turn every visit
 * into a false positive, which is the one failure this file must not have.
 */
const NAMED_IN_APP_TOKENS = [
  // Meta. FBAN/FBAV are iOS, FB_IAB/FB4A Android; Messenger identifies itself
  // through the same pair (FBAN/MessengerForiOS, FB_IAB/MESSENGER) rather than
  // with a token of its own, so Facebook and Messenger are caught together.
  "fban",
  "fbav",
  "fb_iab",
  "fbios",
  "messenger",
  // Instagram
  "instagram",
  // Telegram, on the versions that do stamp themselves. Most do not — the
  // platform heuristics below are what actually catch Telegram. Harmless to
  // list, and it makes the intent of this file greppable.
  "telegramwebview",
  // Other messengers a Cambodian student is likely to arrive from.
  "line/",
  "micromessenger", // WeChat
  "zalo",
  "kakaotalk",
  "whatsapp",
  "viber",
  // Short-video and social apps with in-app browsers.
  "bytedancewebview",
  "musical_ly",
  "tiktok",
  "snapchat",
  "pinterest",
  "twitter",
  "linkedinapp",
  "gsa/", // the Google app's own webview, which is not Chrome
] as const;

/**
 * Real browsers that must NEVER be classified as in-app.
 *
 * Only consulted by the platform heuristics — a named token above always wins,
 * because those apps embed a browser engine and still are not that browser.
 *
 * `crios`/`fxios`/`edgios`/`opt` are how Chrome, Firefox, Edge and Opera
 * identify themselves on iOS, where every browser is WebKit underneath and so
 * would otherwise look exactly like a webview.
 */
const REAL_BROWSER_TOKENS = [
  "crios",
  "fxios",
  "edgios",
  "opt/",
  "opr/",
  "firefox",
  "samsungbrowser",
  "ucbrowser",
  "edg/",
] as const;

function readUserAgent(): string {
  try {
    return (navigator.userAgent || "").toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Installed as a home-screen app?
 *
 * This matters because an iOS PWA launched from the home screen runs in a
 * webview-shaped container: its UA has no `Safari/` token, which is precisely
 * the tell the iOS heuristic below keys on. Without this exclusion, installing
 * BrachNha would permanently replace the app with a screen telling the student
 * to open it in a browser, which they already did.
 *
 * `navigator.standalone` is the iOS-specific flag; the media query is the
 * standard one and covers an installed Android PWA too.
 */
export function isInstalledApp(): boolean {
  try {
    const iosStandalone = (navigator as { standalone?: boolean }).standalone;
    if (iosStandalone === true) return true;
    return window.matchMedia?.("(display-mode: standalone)").matches === true;
  } catch {
    return false;
  }
}

/**
 * Telegram's JS bridge, injected into the webviews it opens.
 *
 * Present for Mini Apps and for some versions of the plain in-app browser, so
 * it is a bonus tell rather than something to rely on — the Android/iOS shape
 * checks are what actually carry Telegram. Cheap, and it can only ever add a
 * true positive: nothing but Telegram defines these.
 */
function hasTelegramBridge(): boolean {
  try {
    const w = window as unknown as Record<string, unknown>;
    return (
      w.TelegramWebviewProxy !== undefined ||
      w.TelegramWebviewProxyProto !== undefined
    );
  } catch {
    return false;
  }
}

/** iPhone/iPad, including an iPad reporting itself as a Mac with a touchscreen. */
export function isIOS(): boolean {
  const ua = readUserAgent();
  if (/iphone|ipad|ipod/.test(ua)) return true;
  // iPadOS 13+ claims to be a Mac. A touch-capable "Mac" is an iPad.
  try {
    return ua.includes("macintosh") && navigator.maxTouchPoints > 1;
  } catch {
    return false;
  }
}

export function isAndroid(): boolean {
  return readUserAgent().includes("android");
}

/**
 * Android: the `wv` token.
 *
 * Android's WebView appends `; wv)` to the UA — it is the platform's own,
 * documented way of saying "this is an embedded WebView, not Chrome". Telegram,
 * Messenger, Facebook, Line and Zalo all land here. Chrome for Android never
 * carries it, so this heuristic is close to exact.
 *
 * It does NOT fire for a link opened in a Chrome Custom Tab, which several of
 * these apps use instead of a WebView — and that is correct, because a Custom
 * Tab IS Chrome and shares Chrome's Google session, so sign-in works there and
 * the student should not be interrupted.
 */
function isAndroidWebView(ua: string): boolean {
  return isAndroid() && /;\s*wv\b/.test(ua);
}

/**
 * iOS: a WKWebView is Safari's engine WITHOUT Safari's UA.
 *
 * Mobile Safari always carries both `Version/…` and `Safari/…`. An embedded
 * WKWebView carries neither — that missing pair is the standard way to tell
 * them apart, and it is what catches Telegram on iOS, which stamps nothing.
 *
 * Two exclusions are already applied by the caller and matter here: a named
 * in-app token has been checked first, and an installed PWA (which also lacks
 * `Safari/`) has been ruled out. `REAL_BROWSER_TOKENS` covers Chrome, Firefox,
 * Edge and Opera on iOS, which all do carry `Safari/` anyway but are listed so
 * a future UA change cannot quietly reclassify them.
 */
function isIOSWebView(ua: string): boolean {
  if (!isIOS()) return false;
  if (REAL_BROWSER_TOKENS.some((token) => ua.includes(token))) return false;
  return !ua.includes("safari/") || !ua.includes("version/");
}

/**
 * The question this file exists to answer.
 *
 * Deliberately conservative: a desktop browser can only be flagged by a named
 * token, never by a heuristic, because the shape checks above are meaningless
 * off mobile and a desktop student's browser is never the problem here.
 */
export function isInAppBrowser(): boolean {
  const ua = readUserAgent();
  if (!ua) return false;

  if (NAMED_IN_APP_TOKENS.some((token) => ua.includes(token))) return true;
  if (hasTelegramBridge()) return true;

  // Heuristics only, from here down — so an installed PWA gets out first.
  if (isInstalledApp()) return false;

  return isAndroidWebView(ua) || isIOSWebView(ua);
}

/**
 * The URL to hand to the real browser.
 *
 * Keeps the path and query, so a student who followed a link to a specific
 * lesson lands on that lesson rather than on Home.
 *
 * Two things are dropped on purpose:
 *
 *  - THE OAUTH PARAMETERS. An authorization `code` is single-use and bound to a
 *    PKCE verifier sitting in THIS webview's localStorage, so carrying it into
 *    Chrome can only produce a failed exchange and a confusing error on the
 *    screen after the one that was meant to fix things. The student signs in
 *    fresh in the real browser, which is the entire point of moving them.
 *  - THE HASH. Nothing in this app routes on it (react-router is path-based
 *    here), and Android's `intent:` URLs use the fragment for their own payload,
 *    so a hash would have to be discarded on that platform regardless. Dropping
 *    it on both keeps the two platforms handing over the same address.
 */
export function externalUrl(): string {
  try {
    const url = new URL(window.location.href);
    for (const key of [
      "code",
      "state",
      "error",
      "error_code",
      "error_description",
    ]) {
      url.searchParams.delete(key);
    }
    url.hash = "";
    return url.toString();
  } catch {
    return window.location.href;
  }
}

/**
 * Ask the platform to reopen `url` outside this webview.
 *
 * ── WHAT THIS CAN AND CANNOT DO ───────────────────────────────────────────
 *
 * A web page CANNOT force an external browser to open. There is no API for it,
 * on either platform, and the mechanisms below are requests that the host app
 * is free to ignore. Both of them fail SILENTLY when ignored — nothing throws,
 * no event fires — which is why the caller shows its manual instructions after
 * a short delay rather than waiting for a result that never comes.
 *
 * ANDROID — an `intent:` URL, the platform's documented way for a page to ask
 * for a link to be handled by another app. The WebView hands it to Android,
 * which opens the student's DEFAULT browser (no `package=` is set, so Chrome is
 * not forced on someone who chose something else). This works in most Android
 * in-app browsers, Telegram's included. `S.browser_fallback_url` tells any
 * handler that cannot resolve the intent to just load the plain URL.
 *
 * iOS — `x-safari-https://`, the scheme Safari registers for exactly this. It
 * is a request to the host app, not a private API and not a sandbox escape: an
 * app that does not forward unknown schemes simply does nothing, which is the
 * common case in stricter webviews. There is no equivalent that reaches a
 * non-Safari default browser, so on iOS this is Safari or nothing.
 *
 * Returns nothing, because there is nothing truthful to return: neither path
 * can report success or failure.
 */
export function openInExternalBrowser(url: string): void {
  try {
    if (isAndroid()) {
      // Scheme preserved, for the same reason as the iOS branch below.
      const scheme = url.startsWith("http://") ? "http" : "https";
      const withoutScheme = url.replace(/^https?:\/\//, "");
      const intent =
        `intent://${withoutScheme}#Intent;scheme=${scheme};` +
        `action=android.intent.action.VIEW;` +
        `category=android.intent.category.BROWSABLE;` +
        `S.browser_fallback_url=${encodeURIComponent(url)};end;`;
      window.location.href = intent;
      return;
    }

    if (isIOS()) {
      // The scheme is PRESERVED rather than assumed https. Production is https,
      // but a `localhost` dev build is not, and silently upgrading it would hand
      // Safari an address that does not answer — a confusing failure to debug on
      // a phone, for no gain.
      window.location.href = url.replace(/^(https?):\/\//, "x-safari-$1://");
      return;
    }

    // Desktop, or a platform with no such mechanism. A new tab is the most an
    // embedded browser here will honour, and it may well open another embedded
    // tab — the instructions on screen are the real answer.
    window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    // Every branch above is a navigation the host app may refuse outright.
    // Refusal is an expected outcome, not an error to report — the screen's
    // manual instructions are what the student falls back to either way.
  }
}
