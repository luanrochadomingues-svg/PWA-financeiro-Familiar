
const CACHE_NAME = 'nexo-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usamos Promise.allSettled para que a falha em um arquivo (ex: ícones ainda não criados)
      // não impeça o registro bem-sucedido do Service Worker.
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url).catch(err => console.warn(`Failed to cache ${url}:`, err)))
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Não fazer cache de requisições que não sejam GET ou que sejam para o Firebase/Google APIs
  if (
    request.method !== 'GET' || 
    url.hostname.includes('firebase') || 
    url.hostname.includes('googleapis') ||
    url.hostname.includes('google')
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).catch(() => {
        // Fallback básico se estiver offline e o recurso não estiver no cache
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
