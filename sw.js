const CACHE_NAME = "devweb-store-v6";
const ASSETS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./assets/imagen1.png",
    "./assets/imagen2.png",
    "./assets/imagen3.png",
    "./assets/imagen4.png",
    "./assets/imagen5.png"
];

// Instalar: guardar todo en caché
self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activar: limpiar cachés viejos y notificar a clientes
self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => {
            // Fuerza recarga en todas las pestañas abiertas
            return self.clients.matchAll({ type: "window" }).then(clients => {
                clients.forEach(client => client.navigate(client.url));
            });
        })
    );
    self.clients.claim();
});

// Fetch: network-first para HTML, cache-first para assets
self.addEventListener("fetch", e => {
    const url = new URL(e.request.url);

    if (url.origin !== location.origin) return;

    // Network-first para documentos HTML (siempre muestra lo más nuevo)
    if (e.request.destination === "document") {
        e.respondWith(
            fetch(e.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                    return response;
                })
                .catch(() => caches.match("./index.html"))
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
            }).catch(() => {
                if (e.request.destination === "document") {
                    return caches.match("./index.html");
                }
            });
        })
    );
});