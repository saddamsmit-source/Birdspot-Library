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

const APP_VERSION = '1.19.12-reset-species-guide-preview';
const APP_CACHE   = `birdspot-app-v${APP_VERSION}`;
const MEDIA_CACHE = 'birdspot-media';

// ── Bestanden die offline beschikbaar moeten zijn ──────────────────────────
// Suncalc wordt via CDN geladen; als het offline niet beschikbaar is,
// degradeert de app graceful (geen sunrise/sunset, rest werkt wel).
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/species/field-guide-media.json',
  '/assets/species/credits.json',
  '/assets/showcase/credits.json',

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
  '/styles/field-experience.css',
  '/assets/birdspot-ijsvogel-splash.avif',

  // JS — app root
  '/src/app.js',
  '/src/services/navigation.js',
  '/src/services/gestures.js',
  '/src/services/startup-splash.js',

  // JS — features
  '/src/features/home/view.js',
  '/src/features/search/index.js',
  '/src/features/home/featuredCarousel.js',
  '/src/features/home/ambientBackdrop.js',
  '/src/features/home/specialBirds.js',
  '/src/features/home/showcaseData.js',
  '/src/features/species/view.js',
  '/src/features/species/guidePhotos.js',
  '/src/features/species/guideComparisons.js',
  '/src/features/species/guideMedia.js',
  '/src/features/species/detailSections.js',
  '/src/features/sightings/view.js',
  '/src/features/sightings/addSheet.js',
  '/src/features/sightings/speciesPicker.js',
  '/src/features/sightings/evidence.js',
  '/src/features/sightings/pinPicker.js',
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
  '/src/data/db.js',
  '/src/data/species.js',
  '/src/data/speciesLife.js',
  '/src/data/speciesDistribution.js',
  '/src/data/seasons.js',

  // JS — storage
  '/src/storage/backup.js',
  '/src/storage/collections.js',

  // JS — services
  '/src/services/sw-register.js',

  // JS — utils (voeg toe als ze bestaan)
  '/src/utils/html.js',
  '/src/utils/photoInfo.js',
  '/src/utils/photoViewer.js',
  '/src/utils/photoUrl.js',
  '/src/utils/validateMedia.js',
];

// ── Install: precache atomair ──────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_CACHE);
    await cache.addAll(PRECACHE_URLS.map(url => new Request(url, { cache: 'reload' })));
    await Promise.all([precacheShowcase(), precacheGuidePhotos(), precacheFieldGuideMedia()]);
  })());
});

async function precacheGuidePhotos() {
  try {
    const media = await caches.open(MEDIA_CACHE);
    const credits = await (await fetch('/assets/species/credits.json', {cache:'no-cache'})).json();
    await Promise.allSettled(Object.values(credits).map(async photo => {
      if (!(await media.match(photo.image))) await media.add(photo.image);
    }));
  } catch (err) { console.warn('[SW] gidsfoto’s niet vooraf geladen', err?.message); }
}

async function precacheFieldGuideMedia() {
  try {
    const media = await caches.open(MEDIA_CACHE);
    const data = await (await fetch('/assets/species/field-guide-media.json', {cache:'no-cache'})).json();
    const variants = [...Object.values(data.plumage).flatMap(cards => Object.values(cards)), ...Object.values(data.poses || {}).flat()];
    const urls = [...variants.map(photo => photo.image), ...Object.values(data.audio).flat().map(clip => clip.audio)];
    await Promise.allSettled(urls.filter(Boolean).map(async url => {
      if (!(await media.match(url))) await media.add(url);
    }));
  } catch (err) { console.warn('[SW] gidsmedia niet vooraf geladen', err?.message); }
}

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

});

async function reportVersion(port) {
  let offlineReady = false;
  try {
    const cache = await caches.open(APP_CACHE);
    const required = await Promise.all(PRECACHE_URLS.map(url => cache.match(url)));
    offlineReady = required.every(response => response?.ok);
  } catch (_) { /* opslag niet beschikbaar */ }
  port.postMessage({ type: 'version', version: APP_VERSION, offlineReady });
}

self.addEventListener('message', event => {
  if (event.data?.type === 'apply-update') {
    event.waitUntil(self.skipWaiting());
  }
  if (event.data?.type === 'get-version' && event.ports[0]) {
    event.waitUntil(reportVersion(event.ports[0]));
  }
});

// ── Fetch: network-first voor app-shell, media-first voor media ────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Sla niet-GET en externe verzoeken over (bijv. Leaflet CDN, OpenStreetMap tiles)
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/assets/species/audio/')) {
    event.respondWith(guideAudioResponse(request));
    return;
  }

  // Houd de actieve shell consistent tijdens een wachtende update.
  if (PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith(serveAppShell(request, url.pathname));
    return;
  }

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

async function serveAppShell(request, path) {
  const cache = await caches.open(APP_CACHE);
  const cached = await cache.match(path);
  return cached || networkFirstWithTimeout(request, 3000);
}

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
  const cached = await cache.match(request) || await caches.match(request, {cacheName: APP_CACHE});
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

async function guideAudioResponse(request) {
  // Cache de hele korte opname, zodat zoeken in de clip ook offline werkt.
  const response = await cacheFirstMedia(request.url);
  const range = request.headers.get('Range');
  if (!range || !response.ok) return response;
  const blob = await response.blob();
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  const start = match?.[1] ? Number(match[1]) : Math.max(0, blob.size - Number(match?.[2]));
  const end = match?.[1] && match[2] ? Math.min(blob.size - 1, Number(match[2])) : blob.size - 1;
  if (!match || start > end || start >= blob.size) {
    return new Response(null, {status:416, headers:{'Content-Range':`bytes */${blob.size}`}});
  }
  return new Response(blob.slice(start, end + 1, blob.type), {
    status:206,
    headers:{
      'Content-Type':blob.type,
      'Accept-Ranges':'bytes',
      'Content-Length':String(end - start + 1),
      'Content-Range':`bytes ${start}-${end}/${blob.size}`,
    },
  });
}
