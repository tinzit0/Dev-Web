self.addEventListener("install", e => {
    e.waitUntil(
        caches.open("devweb-store").then(cache => {
            return cache.addAll([
                "./",
                "./index.html",
                "./assets/imagen1.png",
                "./assets/imagen2.png"
            ]);
        })
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});