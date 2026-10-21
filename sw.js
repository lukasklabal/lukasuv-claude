// Lukášův Claude · service worker: offline režim aplikace. Data z webu (radar, synchronizace) jdou vždy živě.
const CACHE = "velin-99015020";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  // vždy nejdřív síť (ať máš hned novou verzi), bez signálu z mezipaměti
  e.respondWith(
    fetch(req.mode === "navigate" ? new Request(req, {cache: "no-store"}) : req).then(res => { if (res.ok && (req.mode === "navigate" || !url.search)) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req.mode === "navigate" ? "./index.html" : req, copy)); } return res; })
      .catch(() => caches.match(req.mode === "navigate" ? "./index.html" : req).then(r => r || caches.match("./")))
  );
});
