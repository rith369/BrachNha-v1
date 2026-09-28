// BrachNha's service worker — deliberately almost nothing.
//
// It exists because browsers only offer to install a site that has one (see
// src/lib/install-prompt.ts). It does NOT cache the app: every JS/CSS request,
// every /api/chat call and every Supabase request goes straight to the network,
// untouched, exactly as with no service worker at all. Caching the app shell
// would mean a student can be served yesterday's build after a deploy, which is
// a whole class of bug this app has no reason to take on.
//
// The ONE thing it does is page navigations: network first, and only when the
// network fails does it answer with /offline.html, a tiny bilingual page saying
// the phone is offline. Without it an installed app opened with no signal shows
// the browser's own dinosaur, which reads as the app being broken.
//
// Bump CACHE when offline.html changes, so the old copy is deleted on activate.

const CACHE = "brachnha-offline-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      // Navigation preload starts the page request in parallel with the worker
      // booting, so going through this worker costs no extra time on load.
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  // Everything that is not a page load passes through with no respondWith —
  // the browser handles it as if this worker did not exist.
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    (async () => {
      try {
        const preloaded = await event.preloadResponse;
        if (preloaded) return preloaded;
        return await fetch(event.request);
      } catch {
        const offline = await caches.match(OFFLINE_URL);
        return offline || Response.error();
      }
    })()
  );
});
