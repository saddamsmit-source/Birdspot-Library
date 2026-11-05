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

const APP_VERSION = '1.13.0-map-k4-places';
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
  '/styles/signature.css',
  '/styles/signature-phase2.css',
  '/styles/signature-phase3.css',
  '/styles/signature-phase4.css',
  '/styles/observations-evidence.css',
  '/styles/explorer-status-map.css',
  '/styles/startup-splash.css',
  '/styles/mobile-field-editorial.css',
  '/styles/cinematic-wetland.css',
  '/styles/map-explorer.css',
  '/assets/birdspot-ijsvogel-splash.avif',

  // JS — app root
  '/src/app.js',
  '/src/services/startup-splash.js',

  // JS — features
  '/src/features/home/view.js',
  '/src/features/home/featuredCarousel.js',
  '/src/features/home/ambientBackdrop.js',
  '/src/features/home/specialBirds.js',
  '/src/features/home/showcaseData.js',
  '/src/features/species/view.js',
  '/src/features/species/detailSections.js',
  '/src/features/sightings/view.js',
  '/src/features/sightings/addSheet.js',
  '/src/features/sightings/evidence.js',
  '/src/features/sightings/pinPicker.js',
  '/src/features/sightings/editSheet.js',
  '/src/features/sightings/detailSheet.js',
  '/src/features/map/view.js',
  '/src/features/map/centerPin.js',
  '/src/features/map/placePrompt.js',
  '/src/data/places.js',
  '/src/features/map/visualization.js',
  '/src/features/profile/view.js',
  '/src/features/media/view.js',
  '/src/features/journal/view.js',
  '/src/features/insights/view.js',
  '/src/features/insights/analytics.js',
  '/src/features/film/view.js',
  '/src/features/film/renderer.js',

  // JS — data
  '/src/data/sightings.js',
  '/src/data/species.js',
  '/src/data/speciesLife.js',
  '/src/data/seasons.js',

  // JS — storage
  '/src/storage/backup.js',
  '/src/storage/collections.js',

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
      // Diashowfoto's (F): eenmalig in de media-cache, die releases overleeft (L-052)
      await precacheShowcase();
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length) {
        console.warn(`[SW] ${failed.length} precache-verzoeken overgeslagen`);
      }
    })
  );
  // Activeer direct (geen wachten op bestaande clients)
  self.skipWaiting();
});

async function precacheShowcase() {
  try {
    const media = await caches.open(MEDIA_CACHE);
    const credits = await (await fetch('/assets/showcase/credits.json', { cache: 'no-cache' })).json();
    await Promise.allSettled(Object.keys(credits).map(async id => {
      const url = `/assets/showcase/${id}.webp`;
      if (!(await media.match(url))) await media.add(url);
    }));
  } catch (err) {
    console.warn('[SW] diashowfoto\'s niet vooraf geladen', err?.message);
  }
}

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

// ── Versie opvragen (profielpagina) ────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'get-version') {
    event.ports?.[0]?.postMessage({ type: 'version', version: APP_VERSION });
  }
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
