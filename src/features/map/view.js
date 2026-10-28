/**
 * Kaart — Stap 6
 *
 * - Leaflet.js + MarkerCluster (CDN, online-only tot Stap 7)
 * - Elke waarneming = eigen pin (lat/lon aanwezig)
 * - Clustering bij uitzoomen
 * - Tik op pin → detail bottom sheet
 * - Waarnemingen zonder GPS worden genegeerd op de kaart
 * - Geen onnodige re-init bij terugkeren naar het scherm
 */

import { getSightings }    from '../../data/sightings.js';
import { SPECIES }         from '../../data/species.js';
import { openDetailSheet } from '../sightings/detailSheet.js';

// Leaflet + MarkerCluster worden lazy geladen via <script> tags die we
// eenmalig in de <head> injecteren zodra de kaart-view voor het eerst
// gerenderd wordt. Na laden pas initialiseren.

const LEAFLET_VERSION   = '1.9.4';
const CLUSTER_VERSION   = '1.5.3';

let _leafletReady = false;  // true zodra L + MarkerCluster beschikbaar zijn
let _mapInstance  = null;   // L.map referentie (hergebruikt bij terugkeren)
let _clusterLayer = null;   // MarkerCluster laag

// ── Entry point ────────────────────────────────────────────────
export async function renderMap(el) {
  el.innerHTML = `
    <div class="map-screen" id="mapScreen">
      <div id="leafletMap"></div>

      <div class="map-toolbar">
        <span class="map-toolbar__title">Kaart</span>
        <span class="map-toolbar__count" id="mapCount">laden…</span>
      </div>

      <button class="map-locate-btn" id="mapLocateBtn" aria-label="Centreer op mijn locatie">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
        </svg>
      </button>

      <div class="sheet-overlay" id="mapOverlay"></div>

      <div class="bottom-sheet" id="mapDetailSheet">
        <div class="sheet-handle"></div>
        <div class="sheet-header" id="mapSheetHeader">
          <div class="sheet-header__icon" id="mapSheetIcon">🐦</div>
          <div>
            <div class="sheet-header__name" id="mapSheetName">—</div>
            <div class="sheet-header__meta" id="mapSheetMeta">—</div>
          </div>
        </div>
        <div class="sheet-body" id="mapSheetBody"></div>
        <div class="sheet-footer">
          <button class="sheet-close-btn" id="mapSheetClose">Sluiten</button>
        </div>
      </div>
    </div>`;

  // Leaflet is CDN-only; als het CDN niet bereikbaar is, tonen we toch
  // de teller, lege state en de locate-knop (zonder kaart).
  let leafletOk = false;
  try {
    await ensureLeaflet();
    leafletOk = true;
  } catch (_) {
    // CDN niet bereikbaar — graceful degradation
  }

  const sightings = await getSightings();
  initMap(el, sightings, leafletOk);
}

// ── Leaflet lazy loader ────────────────────────────────────────
function ensureLeaflet() {
  if (_leafletReady) return Promise.resolve();

  return new Promise((resolve, reject) => {
    // Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id   = 'leaflet-css';
      link.rel  = 'stylesheet';
      link.href = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}/leaflet.min.css`;
      document.head.appendChild(link);
    }
    // MarkerCluster CSS
    if (!document.getElementById('cluster-css')) {
      const link = document.createElement('link');
      link.id   = 'cluster-css';
      link.rel  = 'stylesheet';
      link.href = `https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/${CLUSTER_VERSION}/MarkerCluster.Default.css`;
      document.head.appendChild(link);
    }

    // Leaflet JS
    if (window.L) {
      _leafletReady = true;
      resolve();
      return;
    }

    const leafletScript = document.createElement('script');
    leafletScript.src = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}/leaflet.min.js`;
    leafletScript.onload = () => {
      // MarkerCluster JS na Leaflet
      const clusterScript = document.createElement('script');
      clusterScript.src = `https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/${CLUSTER_VERSION}/leaflet.markercluster.min.js`;
      clusterScript.onload = () => {
        _leafletReady = true;
        resolve();
      };
      clusterScript.onerror = reject;
      document.head.appendChild(clusterScript);
    };
    leafletScript.onerror = reject;
    document.head.appendChild(leafletScript);
  });
}

// ── Kaart initialiseren ────────────────────────────────────────
function initMap(screenEl, sightings, leafletOk = true) {
  const mapEl = screenEl.querySelector('#leafletMap');
  if (!mapEl) return;

  // Verwijder vorige instantie als het scherm herlaadt
  if (_mapInstance) {
    _mapInstance.remove();
    _mapInstance  = null;
    _clusterLayer = null;
  }

  const geoSightings = sightings.filter(s => s.lat != null && s.lon != null);

  // Teller bijwerken — altijd, ook zonder Leaflet
  const countEl = screenEl.querySelector('#mapCount');
  if (countEl) {
    const n     = geoSightings.length;
    const total = sightings.length;
    countEl.textContent = n === total
      ? `${n} ${n === 1 ? 'pin' : 'pins'}`
      : `${n} van ${total} pins`;
  }

  // Lege state — altijd tonen als er geen GPS-waarnemingen zijn
  if (!geoSightings.length) showNoGpsState(screenEl);

  // Locatie-knop — ook zonder kaart tonen
  const locBtn = screenEl.querySelector('#mapLocateBtn');
  if (locBtn && leafletOk) {
    // handler wordt gekoppeld nadat map aangemaakt is (zie hieronder)
  }

  // Zonder Leaflet: geen kaart, wel teller + lege state + knop
  if (!leafletOk) {
    mapEl.style.background = 'var(--surface-2, #f2f4f6)';
    const notice = document.createElement('div');
    notice.className = 'map-offline-notice';
    notice.textContent = 'Kaart niet beschikbaar (offline)';
    mapEl.appendChild(notice);
    return;
  }

  // Bepaal beginpositie: gemiddelde van waarnemingen met GPS, anders NL centrum
  const center = geoSightings.length
    ? averageCenter(geoSightings)
    : [52.15, 5.30];
  const zoom = geoSightings.length > 0 ? 8 : 7;

  const map = window.L.map(mapEl, {
    center,
    zoom,
    zoomControl:        false,
    attributionControl: false,
  });
  _mapInstance = map;

  // Tiles
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom:     19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // Attributie rechtsonder (compact)
  window.L.control.attribution({ position: 'bottomright', prefix: false })
    .addTo(map);

  // Zoom-knoppen rechtsboven
  window.L.control.zoom({ position: 'topright' }).addTo(map);

  // Cluster laag
  _clusterLayer = window.L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius:    60,
    iconCreateFunction:  makeClusterIcon,
  });

  // Markers toevoegen
  geoSightings.forEach(s => {
    const sp   = SPECIES.find(x => x.id === s.speciesId);
    const icon = sp?.icon || '🐦';
    const marker = window.L.marker([s.lat, s.lon], {
      icon: makeBirdIcon(icon),
      title: s.speciesName,
    });
    marker.on('click', () => openSightingSheet(screenEl, s, map));
    _clusterLayer.addLayer(marker);
  });

  map.addLayer(_clusterLayer);

  // Locatie-knop koppelen
  if (locBtn) {
    locBtn.addEventListener('click', () => centerOnUser(map, locBtn));
  }
}

// ── Sighting detail sheet ──────────────────────────────────────
function openSightingSheet(screenEl, sighting, map) {
  const sp       = SPECIES.find(x => x.id === sighting.speciesId);
  const icon     = sp?.icon || '🐦';
  const sheet    = screenEl.querySelector('#mapDetailSheet');
  const overlay  = screenEl.querySelector('#mapOverlay');
  const closeBtn = screenEl.querySelector('#mapSheetClose');

  screenEl.querySelector('#mapSheetIcon').textContent = icon;
  screenEl.querySelector('#mapSheetName').textContent = sighting.speciesName;
  screenEl.querySelector('#mapSheetMeta').textContent =
    [fmtDate(sighting.date), sighting.locationName].filter(Boolean).join(' · ');

  const body = screenEl.querySelector('#mapSheetBody');
  body.innerHTML = '';

  // Notitie
  if (sighting.notes) {
    const p = document.createElement('p');
    p.className = 'map-sheet-note';
    p.textContent = sighting.notes;
    body.appendChild(p);
  }

  // GPS-coördinaten
  if (sighting.lat != null) {
    const coords = document.createElement('p');
    coords.className = 'map-sheet-coords';
    coords.textContent =
      `${sighting.lat.toFixed(4)}° N, ${sighting.lon.toFixed(4)}° O`;
    body.appendChild(coords);
  }

  // Knop → open volledige detail sheet (via sightings module)
  const detailBtn = document.createElement('button');
  detailBtn.className = 'map-sheet-detail-btn';
  detailBtn.textContent = 'Volledige waarneming bekijken →';
  detailBtn.addEventListener('click', () => {
    closeSheet();
    openDetailSheet(sighting, {
      onDeleted: () => {
        // Herlaad kaart via navigate
        import('../../app.js').then(({ navigate }) => navigate('map', { force: true }));
      },
    });
  });
  body.appendChild(detailBtn);

  // Pan kaart zodat marker boven sheet uitsteekt
  map.panTo([sighting.lat, sighting.lon], { animate: true, duration: 0.4 });

  sheet.classList.add('open');
  overlay.classList.add('visible');

  function closeSheet() {
    sheet.classList.remove('open');
    overlay.classList.remove('visible');
  }

  closeBtn.onclick  = closeSheet;
  overlay.onclick   = closeSheet;
}

// ── Locatie ────────────────────────────────────────────────────
function centerOnUser(map, btn) {
  if (!navigator.geolocation) return;
  btn.classList.add('map-locate-btn--loading');
  navigator.geolocation.getCurrentPosition(
    pos => {
      btn.classList.remove('map-locate-btn--loading');
      map.flyTo([pos.coords.latitude, pos.coords.longitude], 12, { duration: 1 });
    },
    () => btn.classList.remove('map-locate-btn--loading'),
    { timeout: 10000, maximumAge: 60000 },
  );
}

// ── Lege state (geen GPS) ──────────────────────────────────────
function showNoGpsState(screenEl) {
  const mapEl = screenEl.querySelector('#leafletMap');
  const notice = document.createElement('div');
  notice.className = 'map-no-gps';
  notice.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
      style="width:36px;height:36px;opacity:.4">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
    <p>Geen waarnemingen met GPS gevonden.<br>
    Voeg GPS toe bij het toevoegen van een waarneming.</p>`;
  mapEl.appendChild(notice);
}

// ── Helpers ────────────────────────────────────────────────────
function averageCenter(sightings) {
  const lat = sightings.reduce((s, x) => s + x.lat, 0) / sightings.length;
  const lon = sightings.reduce((s, x) => s + x.lon, 0) / sightings.length;
  return [lat, lon];
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function makeBirdIcon(emoji) {
  return window.L.divIcon({
    html:       `<div class="bird-pin">${emoji}</div>`,
    className:  '',
    iconSize:   [36, 36],
    iconAnchor: [18, 18],
  });
}

function makeClusterIcon(cluster) {
  const n   = cluster.getChildCount();
  const cls = n < 5 ? 'sm' : n < 20 ? 'md' : 'lg';
  return window.L.divIcon({
    html:      `<div class="bird-cluster bird-cluster--${cls}"><span>${n}</span></div>`,
    className: '',
    iconSize:  [42, 42],
    iconAnchor:[21, 21],
  });
}
