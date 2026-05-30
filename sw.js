self.addEventListener("install", e => {
    e.waitUntil(
        caches.open("devweb-store").then(cache => {
            return cache.addAll([
                "./",
                "./index.html",
                "./assets/Gemini_Generated_Image_jfdpvujfdpvujfdp.png",
                "./assets/Gemini_Generated_Image_pwhte4pwhte4pwht.png"
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