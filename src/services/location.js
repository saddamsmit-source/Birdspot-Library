/**
 * GPS-01 (26-11-2026): actuele locatie voor Home (weer en zon).
 *
 * Eigenaareis: zolang GPS beschikbaar is en toestemming is verleend, gebruikt Birdspot de actuele positie.
 * - Geen standaardstad: zonder bruikbare positie is de toestand 'none' met de echte reden.
 * - Tijdelijke fout (time-out / geen signaal): laatst bekende positie alleen als 'last' met tijdstip.
 * - Toestemming geweigerd of ingetrokken: laatst bekende positie wordt vergeten; alleen een zelf gekozen plek.
 * - Geen watchPosition, geen hoge nauwkeurigheid, korte hergebruiktermijn: weinig batterij, geen tracking.
 * - Opgeslagen posities (alleen op dit toestel) zijn afgerond op 2 decimalen (± 1 km): genoeg voor weer en zon.
 * Waarnemingen, handmatige pins en opgeslagen plekken gebruiken deze module niet.
 */
const LAST_KEY = 'birdspot-last-location';
const MANUAL_KEY = 'birdspot-weather-location';
export const FIX_REUSE_MS = 2 * 60 * 1000;
export const FIX_TIMEOUT_MS = 15000;
export const LAST_VALID_MS = 24 * 60 * 60 * 1000;

let inflight = null;

const round2 = value => Math.round(Number(value) * 100) / 100;
const validPoint = point => point && Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lon))
  && Math.abs(point.lat) <= 90 && Math.abs(point.lon) <= 180;

function read(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return validPoint(value) && Number.isFinite(Number(value.at)) ? value : null;
  } catch (_) { return null; }
}

function write(key, lat, lon) {
  const value = { lat: round2(lat), lon: round2(lon), at: Date.now() };
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* opslag vol of geblokkeerd: alleen dit moment */ }
  return value;
}

export function manualLocation() { return read(MANUAL_KEY); }

export function setManualLocation(lat, lon) {
  if (!validPoint({ lat: Number(lat), lon: Number(lon) })) return null;
  return write(MANUAL_KEY, Number(lat), Number(lon));
}

function lastKnown(now = Date.now()) {
  const last = read(LAST_KEY);
  return last && now - last.at <= LAST_VALID_MS ? last : null;
}

const REASONS = { 1: 'denied', 2: 'unavailable', 3: 'timeout' };

/** Zonder positie: laatst bekende (alleen bij tijdelijke fout) of zelf gekozen plek, de meest recente eerst. */
function withoutFix(reason) {
  if (reason === 'denied') {
    try { localStorage.removeItem(LAST_KEY); } catch (_) { /* niets te vergeten */ }
  }
  const candidates = [];
  const last = reason === 'denied' || reason === 'unsupported' ? null : lastKnown();
  if (last) candidates.push({ state: 'last', ...last });
  const manual = manualLocation();
  if (manual) candidates.push({ state: 'manual', ...manual });
  candidates.sort((a, b) => b.at - a.at);
  return candidates[0] ? { ...candidates[0], reason } : { state: 'none', reason, lat: null, lon: null };
}

/**
 * Eén gedeelde opvraging tegelijk (weer en zon vragen dezelfde positie).
 * fresh: geen hergebruik van een eerdere fix (knop "GPS opnieuw proberen").
 * Resultaat: { state: 'gps'|'last'|'manual'|'none', lat, lon, at?, reason? }
 */
export function resolveLocation({ fresh = false } = {}) {
  if (inflight) return inflight;
  inflight = new Promise(resolve => {
    if (!navigator.geolocation?.getCurrentPosition) { resolve(withoutFix('unsupported')); return; }
    try {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          write(LAST_KEY, coords.latitude, coords.longitude);
          resolve({ state: 'gps', lat: coords.latitude, lon: coords.longitude, at: Date.now(), reason: null });
        },
        error => resolve(withoutFix(REASONS[error?.code] || 'unavailable')),
        { enableHighAccuracy: false, timeout: FIX_TIMEOUT_MS, maximumAge: fresh ? 0 : FIX_REUSE_MS },
      );
    } catch (_) { resolve(withoutFix('unavailable')); }
  }).finally(() => { inflight = null; });
  return inflight;
}
