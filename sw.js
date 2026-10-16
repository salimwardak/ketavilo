const CACHE = "ketavilo-v8-20261016";
const BASE = "/ketavilo/";
self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then(async (cache) => {
  await Promise.all([BASE, BASE + "app-v8.js", BASE + "style.css?v=8", BASE + "bootstrap-v6.json", BASE + "icon.svg"].map(async (path) => {
    try {
      await cache.add(path);
    } catch (e) {
    }
  }));
  await self.skipWaiting();
})));
self.addEventListener("activate", (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("ketavilo-") && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (event) => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const versioned = /\/(?:app-v8\.js|bootstrap-v6\.json|catalog-v6-\d+\.json|summary-v6-\d+\.json)$/.test(url.pathname);
    if (versioned) {
      const stored = await cache.match(request);
      if (stored) return stored;
    }
    const controller = typeof AbortController === "function" ? new AbortController() : null, timer = setTimeout(() => {
      if (controller) controller.abort();
    }, request.mode === "navigate" ? 8e3 : 15e3);
    try {
      const response = await fetch(request, { signal: controller ? controller.signal : void 0, cache: request.mode === "navigate" ? "no-cache" : "default" });
      if (response.ok) event.waitUntil(cache.put(request, response.clone()).catch(() => {
      }));
      return response;
    } catch (error) {
      const stored = await cache.match(request, request.mode === "navigate" ? { ignoreSearch: true } : {});
      if (stored) return stored;
      if (request.mode === "navigate") return await cache.match(BASE) || new Response("Open the website once while connected.", { status: 503 });
      throw error;
    } finally {
      clearTimeout(timer);
    }
  })());
});
