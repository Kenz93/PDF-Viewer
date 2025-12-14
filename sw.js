const CACHE_NAME = "pdf-reader-cache-v2"; // Ubah versi cache
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  // Cache PDF.js library
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
];

self.addEventListener("install", (event) => {
  console.log("[Service Worker] Install");
  // Menunggu semua aset penting di-cache
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell");
      // Menambahkan semua aset PWA termasuk library PDF.js
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activate");
  // Hapus cache lama
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log("[Service Worker] Menghapus cache lama:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Strategi Cache-first untuk aset PWA
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Mengembalikan response dari cache jika ada
      if (response) {
        return response;
      }
      // Jika tidak ada di cache, lakukan fetch dari jaringan
      return fetch(event.request);
    })
  );
});
