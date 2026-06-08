const CACHE_NAME = 'nexo-pwa-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // Fallback se algum ícone ainda não existir
        return cache.add('/');
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignorar chamadas para Firebase Auth/Firestore e Google Fonts
  if (
    request.url.includes('googleapis.com') ||
    request.url.includes('firebase') ||
    request.url.includes('identitytoolkit')
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).catch(() => {
        // Se falhar e for uma navegação, retorna a página inicial (cache shell)
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});