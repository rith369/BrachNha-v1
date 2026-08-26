/**
 * Fetches Caveat on demand, once per page load.
 *
 * Caveat is the typed-signature face and NOTHING else uses it — one component,
 * `features/commitment/components/signature-display.tsx`, in its "typed" branch.
 * It used to sit in index.html's Google Fonts link alongside the three faces the
 * app actually renders on every screen, so every student downloaded a display
 * script they would only ever see if they typed their name on the pledge.
 *
 * It lives in lib/ rather than utils/ because it is neither pure nor
 * stateless — it mutates <head> and remembers that it has.
 *
 * The two preconnect hints in index.html stay, so by the time this runs the
 * connection to Google Fonts is already warm and this costs one request rather
 * than a full handshake. `display=swap` means the signature paints immediately
 * in the cursive fallback and upgrades when the face lands, which is why this
 * being called from an effect (after first paint) is fine.
 *
 * The weight RANGE is kept rather than narrowed to the single 400 that renders
 * today: the typed signature sets no weight class of its own, so it inherits
 * whatever the surrounding card uses, and pinning one weight here would make
 * that silently depend on the ancestor.
 */
const HREF =
  "https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap";

let requested = false;

export function loadSignatureFont() {
  if (requested || typeof document === "undefined") return;
  requested = true;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = HREF;
  document.head.appendChild(link);
}
