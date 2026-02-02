const CACHE = 'despensa-v2';
const LIST_PAGE_KEY = '/v/_template';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const path = url.pathname;
  const isListPage = path.startsWith('/v/') && path.length > 3;
  const isDashboard = path === '/portal/dashboard';
  const isPage = (isListPage || isDashboard) && e.request.mode === 'navigate';

  if (!isPage) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(cache => {
          cache.put(isListPage ? url.origin + LIST_PAGE_KEY : e.request, clone);
        });
        return res;
      })
      .catch(() => {
        const cacheKey = isListPage ? url.origin + LIST_PAGE_KEY : e.request;
        return caches.match(cacheKey).then(cached =>
          cached || new Response('Sin conexión. Abre la app con internet primero.', { status: 503 })
        );
      })
  );
});
