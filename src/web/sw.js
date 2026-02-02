const CACHE = 'despensa-v1';
const LIST_PAGE_KEY = '/v/_template';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const path = url.pathname;
  const isListPage = path.startsWith('/v/') && path.length > 3;
  const isDashboard = path === '/portal/dashboard';
  const isPage = (isListPage || isDashboard) && e.request.mode === 'navigator';

  if (!isPage) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(cache => {
          cache.put(isListPage ? LIST_PAGE_KEY : path, clone);
        });
        return res;
      })
      .catch(() => caches.match(isListPage ? LIST_PAGE_KEY : path).then(cached => cached || new Response('Sin conexión. Abre la app con internet primero.', { status: 503 })))
  );
});
