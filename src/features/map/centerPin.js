/**
 * Birdspot kaart — vaste pin in het midden (K2) en kaartlagen.
 * De gebruiker schuift en zoomt de kaart onder een vaste pin; de pinpunt is het kaartmidden.
 * Pure rekenfuncties zijn testbaar zonder Leaflet.
 */

/** Grootste onnauwkeurigheid waarbij plaatsen nog mag (≈ zoom 13 in Nederland). */
export const MAX_PIN_ACCURACY_M = 50;
/** Afwijking van de pinpunt in schermpixels (vinger/oog), gebruikt voor de nauwkeurigheid. */
const PIN_TIP_PX = 4;

/** Meters per schermpixel in Web Mercator. */
export function metersPerPixel(lat, zoom) {
  return 156543.03392 * Math.cos((Number(lat) * Math.PI) / 180) / Math.pow(2, Number(zoom));
}

/** Nauwkeurigheid van een pin bij deze breedtegraad en zoom, in hele meters (minimaal 1). */
export function pinAccuracyM(lat, zoom) {
  return Math.max(1, Math.round(metersPerPixel(lat, zoom) * PIN_TIP_PX));
}

export function accuracyLabel(m) {
  if (!Number.isFinite(m)) return '';
  return m >= 1000 ? `±${(m / 1000).toFixed(1).replace('.', ',')} km` : `±${m} m`;
}

export function coordLabel(lat, lon) {
  return `${Number(lat).toFixed(6)}, ${Number(lon).toFixed(6)}`;
}

/** Markup van de vaste pin (lijnicoon met punt op de exacte plek). */
export function centerPinMarkup(id = 'mapCenterPin') {
  return `<div class="map-center-pin" id="${id}" hidden aria-hidden="true">
    <svg viewBox="0 0 48 64" class="map-center-pin__svg">
      <path d="M24 2C12.4 2 3 11.2 3 22.6 3 38.4 24 62 24 62s21-23.6 21-39.4C45 11.2 35.6 2 24 2z"/>
      <circle cx="24" cy="22" r="7.5"/>
    </svg>
    <span class="map-center-pin__dot"></span>
  </div>`;
}

// ── Kaartlagen ────────────────────────────────────────────────
const LAYER_KEY = 'birdspot-map-layer';
export const LAYERS = Object.freeze({
  kaart: {
    label: 'Kaart',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: { maxZoom: 21, maxNativeZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' },
  },
  luchtfoto: {
    label: 'Luchtfoto',
    // PDOK luchtfoto (Beeldmateriaal Nederland), Web Mercator tot zoom 21; alleen Nederland.
    url: 'https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0/Actueel_orthoHR/EPSG:3857/{z}/{x}/{y}.jpeg',
    options: { maxZoom: 21, maxNativeZoom: 21, attribution: 'Luchtfoto © <a href="https://www.pdok.nl">PDOK</a> / Beeldmateriaal Nederland' },
  },
});

export function savedLayer() {
  try { const v = localStorage.getItem(LAYER_KEY); return LAYERS[v] ? v : 'kaart'; } catch (_) { return 'kaart'; }
}
export function saveLayer(key) {
  try { localStorage.setItem(LAYER_KEY, key); } catch (_) { /* privé-modus: alleen deze sessie */ }
}

/**
 * Zet de gekozen laag op de kaart en geeft een wisselfunctie terug.
 * Bij Luchtfoto blijft OpenStreetMap eronder, zodat buiten Nederland geen gat ontstaat.
 */
export function attachBaseLayers(map, L, onChange = () => {}) {
  const street = L.tileLayer(LAYERS.kaart.url, LAYERS.kaart.options);
  const aerial = L.tileLayer(LAYERS.luchtfoto.url, LAYERS.luchtfoto.options);
  let current = savedLayer();
  street.addTo(map);
  if (current === 'luchtfoto') aerial.addTo(map);
  onChange(current);
  return function toggle() {
    current = current === 'kaart' ? 'luchtfoto' : 'kaart';
    if (current === 'luchtfoto') aerial.addTo(map); else aerial.remove?.();
    saveLayer(current);
    onChange(current);
    return current;
  };
}
