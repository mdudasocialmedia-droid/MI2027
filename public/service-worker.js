/*
 * Luna Planner intentionally uses a network-only worker. It satisfies the PWA
 * install requirement without persisting authenticated pages, planner entries,
 * Supabase requests, Hotmart requests, cookies, or tokens in Cache Storage.
 */
self.addEventListener("install", () => {
  // No pre-cache: even HTML shell caching could surface a prior user's page.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Network-only is deliberate. Do not add Cache Storage without a privacy review.
  event.respondWith(fetch(event.request));
});
