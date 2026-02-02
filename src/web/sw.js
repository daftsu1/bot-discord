const CACHE = 'despensa-v3';
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

function getCacheKey(url, isListPage) {
  const path = url.pathname.replace(/\/$/, '') || '/';
  if (isListPage) return url.origin + LIST_PAGE_KEY;
  if (path === '/portal/dashboard') return url.origin + '/portal/dashboard';
  return null;
}

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const path = url.pathname.replace(/\/$/, '') || '/';
  const isListPage = path.startsWith('/v/') && path.length > 3;
  const isDashboard = path === '/portal/dashboard';
  const isPage = (isListPage || isDashboard) && (e.request.mode === 'navigate' || e.request.destination === 'document');

  if (!isPage) return;

  const cacheKey = getCacheKey(url, isListPage);
  if (!cacheKey) return;

  e.respondWith(
    fetch(e.request)
      .then(async res => {
        const clone = res.clone();
        const cache = await caches.open(CACHE);
        await cache.put(cacheKey, clone);
        return res;
      })
      .catch(() =>
        caches.match(cacheKey).then(cached =>
          cached || new Response('Sin conexión. Abre la app con internet primero.', {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          })
        )
      )
  );
});
