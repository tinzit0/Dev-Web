const CACHE_NAME = "devweb-store-v4";
const ASSETS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./assets/imagen1.png",
    "./assets/imagen2.png"
];

// Instalar: guardar todo en caché
self.addEventListener("fetch", e => {
    const url = new URL(e.request.url);

    if (url.origin !== location.origin) return;

    // Network-first solo para documentos HTML
    if (e.request.destination === "document") {
        e.respondWith(
            fetch(e.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                    return response;
                })
                .catch(() => caches.match("./index.html")) // fallback offline
        );
        return;
    }

    // Cache-first para assets (imágenes, CSS, JS)
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(response => {
                if (response && response.status === 200 && response.type === "basic") {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                }
                return response;
            });
        })
    );
});

// Activar: limpiar cachés viejos
self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

// Fetch: cache-first para assets propios, network-first para externos
self.addEventListener("fetch", e => {
    const url = new URL(e.request.url);

    // Solo interceptar requests del mismo origen
    if (url.origin !== location.origin) return;

    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(response => {
                // Guardar en caché solo respuestas válidas del mismo origen
                if (response && response.status === 200 && response.type === "basic") {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                }
                return response;
            }).catch(() => {
                // Offline fallback
                if (e.request.destination === "document") {
                    return caches.match("./index.html");
                }
            });
        })
    );
});