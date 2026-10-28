/**
 * BIRDSPOT LIBRARY — Service Worker (Fase G)
 *
 * Strategie:
 * - app-shell (code/HTML/CSS/JS): network-first met ~3 s time-out (L-009)
 * - media (foto's in IDB): aparte cache, overleeft releases (L-052)
 * - update-notificatie via BroadcastChannel (L-011)
 * - één versiebron: APP_VERSION → APP_CACHE (L-027)
 *
 * Caches:
 *   birdspot-app-v{VERSION}  — code shell (per release vervangen)
 *   birdspot-media           — foto's/IDB-exports (permanent)
 */

const APP_VERSION = '1.0.0';
const APP_CACHE   = `birdspot-app-v${APP_VERSION}`;
const MEDIA_CACHE = 'birdspot-media';

// ── Bestanden die offline beschikbaar moeten zijn ──────────────────────────
// Suncalc wordt via CDN geladen; als het offline niet beschikbaar is,
// degradeert de app graceful (geen sunrise/sunset, rest werkt wel).
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',

  // Stylesheets
  '/styles/tokens.css',
  '/styles/shell.css',
  '/styles/dashboard.css',
  '/styles/species.css',
  '/styles/sightings.css',
  '/styles/map.css',
  '/styles/profile.css',

  // JS — app root
  '/src/app.js',

  // JS — features
  '/src/features/home/view.js',
  '/src/features/species/view.js',
  '/src/features/sightings/view.js',
  '/src/features/sightings/addSheet.js',
  '/src/features/sightings/editSheet.js',
  '/src/features/sightings/detailSheet.js',
  '/src/features/map/view.js',
  '/src/features/profile/view.js',

  // JS — data
  '/src/data/sightings.js',
  '/src/data/species.js',

  // JS — storage
  '/src/storage/backup.js',

  // JS — services
  '/src/services/sw-register.js',

  // JS — utils (voeg toe als ze bestaan)
  '/src/utils/date.js',
  '/src/utils/search.js',
];

// ── Install: precache atomair ──────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE).then(async cache => {
      // Probeer elk bestand apart; sla ontbrekende utils over (allSettled)
      const results = await Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => {
            // Utils-bestanden zijn optioneel; log maar blokkeer niet
            console.warn(`[SW] precache skip: ${url}`, err.message);
          })
        )
      );
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length) {
        console.warn(`[SW] ${failed.length} precache-verzoeken overgeslagen`);
      }
    })
  );
  // Activeer direct (geen wachten op bestaande clients)
  self.skipWaiting();
});

// ── Activate: verwijder verouderde code-caches ─────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(async keys => {
      for (const key of keys) {
        // Verwijder alleen verouderde APP-caches; MEDIA_CACHE blijft altijd
        if (key !== APP_CACHE && key !== MEDIA_CACHE && key.startsWith('birdspot-app-')) {
          await caches.delete(key);
          console.info(`[SW] verouderde cache verwijderd: ${key}`);
        }
      }
      // Neem meteen beheer over alle open tabs
      return self.clients.claim();
    })
  );

  // Stuur update-notificatie naar alle open clients
  self.clients.matchAll({ type: 'window' }).then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'new-version', version: APP_VERSION });
    });
  });
});

// ── Fetch: network-first voor app-shell, media-first voor media ────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Sla niet-GET en externe verzoeken over (bijv. Leaflet CDN, OpenStreetMap tiles)
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Media: afbeeldingen uit de app-eigen upload-flow → media-cache
  // (In deze app slaan we binaire foto's in IndexedDB op; blob-URLs
  //  worden niet via fetch geladen. Deze tak is een vangnet voor toekomstig
  //  gebruik of directe img src-verwijzingen.)
  if (url.pathname.startsWith('/photos/') ||
      request.destination === 'image') {
    event.respondWith(cacheFirstMedia(request));
    return;
  }

  // App-shell: network-first met 3 s time-out
  event.respondWith(networkFirstWithTimeout(request, 3000));
});

// ── Network-first met time-out ─────────────────────────────────────────────
async function networkFirstWithTimeout(request, timeoutMs) {
  const cache = await caches.open(APP_CACHE);

  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeoutMs)
      ),
    ]);

    if (networkResponse.ok) {
      // Update cache op de achtergrond
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;

  } catch (_) {
    // Netwerk te traag of offline → cache
    const cached = await cache.match(request);
    if (cached) return cached;

    // Geen cache: probeer index.html als fallback (SPA-navigatie)
    if (request.mode === 'navigate') {
      const indexCached = await cache.match('/index.html');
      if (indexCached) return indexCached;
    }

    // Geen fallback beschikbaar
    return new Response('Offline — geen cache beschikbaar', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

// ── Cache-first voor media ─────────────────────────────────────────────────
async function cacheFirstMedia(request) {
  const cache  = await caches.open(MEDIA_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (_) {
    return new Response('Media niet beschikbaar offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
