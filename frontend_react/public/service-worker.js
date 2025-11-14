const CACHE_STATIC = 'static-v1';
const CACHE_API = 'api-v1';
const APP_SHELL = [
  '/', // root for SPA
  '/index.html',
  '/manifest.json',
  // CSS/JS are hashed by CRA; we rely on runtime cache during install+fetch
];

/**
 * Utility: open cache safely
 */
async function cacheOpenSafe(name) {
  try {
    return await caches.open(name);
  } catch {
    return null;
  }
}

/**
 * Determine if a request targets Open-Meteo forecast or geocoding
 */
function isOpenMeteoRequest(url) {
  try {
    const u = new URL(url);
    const host = u.hostname;
    return (
      host.endsWith('open-meteo.com') ||
      host === 'api.open-meteo.com' ||
      host === 'geocoding-api.open-meteo.com'
    );
  } catch {
    return false;
  }
}

/**
 * Build an API cache key for Open-Meteo by normalizing lat, lon, and unit params.
 * We keep full URL as key but also add a normalized header hint for clients.
 */
function normalizeForecastKey(requestUrl) {
  try {
    const u = new URL(requestUrl);
    const search = u.searchParams;

    // Normalize potential parameter names used by our app
    const lat = search.get('latitude');
    const lon = search.get('longitude');
    const tUnit = search.get('temperature_unit');
    const wUnit = search.get('wind_speed_unit');
    const pUnit = search.get('precipitation_unit');

    // If it's not a forecast call, just return full URL
    if (!lat || !lon) return u.toString();

    const key = `forecast:${u.origin}${u.pathname}?lat=${lat}&lon=${lon}&t=${tUnit || ''}&w=${wUnit || ''}&p=${pUnit || ''}`;
    return key;
  } catch {
    return requestUrl;
  }
}

/**
 * Install: pre-cache minimal app shell to enable offline
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await cacheOpenSafe(CACHE_STATIC);
      if (cache) {
        await cache.addAll(APP_SHELL.filter(Boolean));
      }
      // Activate immediately on install
      self.skipWaiting();
    })()
  );
});

/**
 * Activate: cleanup old caches
 */
self.addEventListener('activate', (event) => {
  const keep = [CACHE_STATIC, CACHE_API];
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((k) => {
          if (!keep.includes(k)) {
            return caches.delete(k);
          }
          return Promise.resolve();
        })
      );
      self.clients.claim();
    })()
  );
});

/**
 * Stale-While-Revalidate helper
 * - Tries cache first
 * - Returns cached immediately if found, while fetching a fresh copy in background to update cache
 * - If no cache, fetch network and cache response if successful
 */
async function staleWhileRevalidate(event, cacheName, request, cacheKey = null) {
  const cache = await cacheOpenSafe(cacheName);
  if (!cache) {
    return fetch(request);
  }

  const key = cacheKey || request;
  const cached = await cache.match(key);
  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        try {
          await cache.put(key, networkResponse.clone());
        } catch {
          // ignore cache put errors
        }
      }
      return networkResponse;
    })
    .catch(() => {
      // network failed; if we have cached, we already returned it; otherwise this will be handled below
      return null;
    });

  if (cached) {
    // Notify clients that response came from cache
    notifyClientsCachedHit(request.url);
    // Kick off revalidate but don't block
    event.waitUntil(fetchPromise);
    return cached;
  }

  // No cache — await network
  const network = await fetchPromise;
  if (network) return network;

  // Last resort: maybe a generic fallback page
  const fallback = await caches.match('/index.html');
  return fallback || new Response('Offline', { status: 503, statusText: 'Offline' });
}

/**
 * Notify all controlled clients that a cached response was served for a specific URL.
 * This allows UI to surface an "offline/cached" banner.
 */
async function notifyClientsCachedHit(url) {
  try {
    const clientsList = await self.clients.matchAll();
    clientsList.forEach((client) => {
      client.postMessage({ type: 'CACHE_HIT', url });
    });
  } catch {
    // ignore
  }
}

/**
 * Fetch handler:
 * - For Open‑Meteo: SWR keyed by lat/lon/units
 * - For same-origin static assets: SWR
 * - Fallback to network
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Only GET requests are cacheable here
  if (request.method !== 'GET') {
    return;
  }

  const reqUrl = new URL(url);

  // Open‑Meteo API requests
  if (isOpenMeteoRequest(url)) {
    const key = normalizeForecastKey(url);
    event.respondWith(staleWhileRevalidate(event, CACHE_API, request, key));
    return;
  }

  // Same-origin navigation and static assets: use SWR; allow SPA to load offline
  if (reqUrl.origin === self.location.origin) {
    // Handle navigation requests explicitly (SPA fallback)
    if (request.mode === 'navigate') {
      event.respondWith(
        (async () => {
          const cache = await cacheOpenSafe(CACHE_STATIC);
          const cached = cache ? await cache.match('/index.html') : null;
          try {
            const network = await fetch(request);
            // If index.html, keep it fresh
            if (cache && network && network.ok && reqUrl.pathname === '/') {
              try {
                await cache.put('/index.html', network.clone());
              } catch {}
            }
            return network;
          } catch {
            return cached || new Response('Offline', { status: 503 });
          }
        })()
      );
      return;
    }

    // Static assets (CSS, JS, images)
    if (/\.(?:js|css|svg|png|jpg|jpeg|gif|webp|ico|txt|json)$/.test(reqUrl.pathname)) {
      event.respondWith(staleWhileRevalidate(event, CACHE_STATIC, request));
      return;
    }
  }

  // Default: try network, fallback to cache
  event.respondWith(
    (async () => {
      try {
        return await fetch(request);
      } catch {
        const cache = await cacheOpenSafe(CACHE_STATIC);
        const cached = cache ? await cache.match(request) : null;
        return (
          cached ||
          (await caches.match('/index.html')) ||
          new Response('Offline', { status: 503 })
        );
      }
    })()
  );
});
