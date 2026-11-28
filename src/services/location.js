/**
 * GPS voor Aviandra. Weer en zon delen één aanvraag. De kaart en
 * waarnemingen kunnen met toestemming een eigen, passende fix opvragen.
 *
 * Eigenaareis: zolang GPS beschikbaar is en toestemming is verleend, gebruikt Birdspot de actuele positie.
 * - Geen standaardstad: zonder bruikbare positie is de toestand 'none' met de echte reden.
 * - Tijdelijke fout (time-out / geen signaal): laatst bekende positie alleen als 'last' met tijdstip.
 * - Toestemming geweigerd of ingetrokken: laatst bekende positie wordt vergeten; alleen een zelf gekozen plek.
 * - Geen watchPosition, geen hoge nauwkeurigheid, korte hergebruiktermijn: weinig batterij, geen tracking.
 * - Opgeslagen posities (alleen op dit toestel) zijn afgerond op 2 decimalen (± 1 km): genoeg voor weer en zon.
 */
const LAST_KEY = 'birdspot-last-location';
const MANUAL_KEY = 'birdspot-weather-location';
const ASKED_KEY = 'aviandra-location-requested';
export const FIX_REUSE_MS = 2 * 60 * 1000;
export const FIX_TIMEOUT_MS = 15000;
export const LAST_VALID_MS = 24 * 60 * 60 * 1000;

let inflight = null;
let temporaryManualLocation = null;
let startupPosition = null;
let askedInSession = false;
let grantedInSession = false;

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
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {
    value.temporary = true;
  }
  return value;
}

export function manualLocation() { return temporaryManualLocation ?? read(MANUAL_KEY); }

export function setManualLocation(lat, lon) {
  if (!validPoint({ lat: Number(lat), lon: Number(lon) })) return null;
  const location = write(MANUAL_KEY, Number(lat), Number(lon));
  temporaryManualLocation = location.temporary ? location : null;
  return location;
}

function lastKnown(now = Date.now()) {
  const last = read(LAST_KEY);
  return last && now - last.at <= LAST_VALID_MS ? last : null;
}

const REASONS = { 1: 'denied', 2: 'unavailable', 3: 'timeout' };
const WEATHER_OPTIONS = { enableHighAccuracy: false, timeout: FIX_TIMEOUT_MS, maximumAge: FIX_REUSE_MS };

async function locationPermission() {
  try {
    return (await navigator.permissions?.query({ name: 'geolocation' }))?.state ?? 'unknown';
  } catch (_) { return 'unknown'; }
}

function alreadyAsked() {
  if (askedInSession) return true;
  try { return localStorage.getItem(ASKED_KEY) === '1'; }
  catch (_) { return false; }
}

function positionFailure(reason) {
  if (reason === 'denied') {
    grantedInSession = false;
    try { localStorage.removeItem(LAST_KEY); } catch (_) { /* opslag niet beschikbaar */ }
  }
  return { reason };
}

async function locate(options, prompt) {
  if (!navigator.geolocation?.getCurrentPosition) return { reason: 'unsupported' };
  const permission = await locationPermission();
  if (permission === 'denied') return positionFailure('denied');
  if (document.visibilityState !== 'visible') return { reason: 'unavailable' };
  const granted = permission === 'granted' || (permission === 'unknown' && grantedInSession);
  if (!granted && (prompt === 'never' || (prompt === 'startup' && alreadyAsked()))) {
    return { reason: 'permission' };
  }
  if (prompt !== 'never') {
    askedInSession = true;
    try { localStorage.setItem(ASKED_KEY, '1'); } catch (_) { /* onthoud voor deze sessie */ }
  }
  return new Promise(resolve => {
    try {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          grantedInSession = true;
          resolve({ coords, reason: null });
        },
        error => resolve(positionFailure(REASONS[error?.code] || 'unavailable')),
        options,
      );
    } catch (_) { resolve({ reason: 'unavailable' }); }
  });
}

export function startLocation() {
  const visible = document.visibilityState === 'visible'
    ? Promise.resolve()
    : new Promise(resolve => {
      function onVisible() {
        if (document.visibilityState !== 'visible') return;
        document.removeEventListener('visibilitychange', onVisible);
        resolve();
      }
      document.addEventListener('visibilitychange', onVisible);
    });
  startupPosition = visible.then(() => locate(WEATHER_OPTIONS, 'startup'));
  // Home kan bij de eerste weergave dezelfde fix gebruiken. De app wacht er niet op.
  resolveLocation();
  startupPosition.then(() => { startupPosition = null; });
}

/** Alleen de locatieknop op Kaart kan na de start bewust opnieuw toestemming vragen. */
export async function requestPosition(options, { ask = false } = {}) {
  if (startupPosition) {
    const startup = await startupPosition;
    if (!options.enableHighAccuracy || !startup.coords) return startup;
  }
  return locate(options, ask ? 'explicit' : 'never');
}

/** Zonder positie: laatst bekende (alleen bij tijdelijke fout) of zelf gekozen plek, de meest recente eerst. */
function withoutFix(reason) {
  const candidates = [];
  const last = ['timeout', 'unavailable'].includes(reason) ? lastKnown() : null;
  if (last) candidates.push({ state: 'last', ...last });
  const manual = manualLocation();
  if (manual) candidates.push({ state: 'manual', ...manual });
  candidates.sort((a, b) => b.at - a.at);
  return candidates[0] ? { ...candidates[0], reason } : { state: 'none', reason, lat: null, lon: null };
}

/**
 * Eén gedeelde opvraging tegelijk (weer en zon vragen dezelfde positie).
 * fresh: geen hergebruik van een eerdere fix bij hervatten.
 * Resultaat: { state: 'gps'|'last'|'manual'|'none', lat, lon, at?, reason? }
 */
export function resolveLocation({ fresh = false } = {}) {
  if (inflight) return inflight;
  inflight = requestPosition({ ...WEATHER_OPTIONS, maximumAge: fresh ? 0 : FIX_REUSE_MS }).then(({ coords, reason }) => {
    if (!coords) return withoutFix(reason);
    write(LAST_KEY, coords.latitude, coords.longitude);
    return { state: 'gps', lat: coords.latitude, lon: coords.longitude, at: Date.now(), reason: null };
  }).finally(() => { inflight = null; });
  return inflight;
}
