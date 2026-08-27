const CACHE_NAME = 'delivery-v1';

// Instalação limpa do Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições: Prioriza a rede para garantir que o app sempre abra atualizado
self.addEventListener('fetch', (event) => {
  // Ignora requisições para a API do Render para não travar dados em cache
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
