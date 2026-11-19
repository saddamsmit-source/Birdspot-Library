/**
 * Birdspot — vaste plekken (K4).
 *
 * Een plek bundelt waarnemingen op dezelfde locatie, zodat je bij een volgend bezoek
 * dezelfde pin gebruikt in plaats van steeds een nieuwe.
 *
 * Opslag (localStorage 'birdspot-places'):
 *   { schemaVersion: 1, places: [{ id, name, lat, lon, createdAt, updatedAt }] }
 * Waarneming: optioneel veld placeId. De eigen coördinaten van elke waarneming blijven
 * altijd bewaard (nauwkeurige data, later bruikbaar voor bv. waarneming.nl).
 *
 * Regels (ronde 2B, eigenaarbesluiten #292/#293):
 *  - Bekende vogelspot: een nieuwe waarneming binnen de straal (standaard 250 m, instelbaar)
 *    krijgt dezelfde placeId/kaartpin. Eén kandidaat + nauwkeurige positie (≤ 50 m) → inline
 *    voorgesteld en vooraf gekozen (afmeldbaar). Meerdere kandidaten → compacte keuze of bewust
 *    een aparte spot. Onnauwkeurige of onbekende nauwkeurigheid → nooit automatisch, alleen aanbod.
 *  - Elke waarneming houdt altijd zijn eigen lat/lon, datum en tijd.
 *  - Bestaande plekken worden nooit samengevoegd.
 *  - Migratie maakt alleen plekken voor waarnemingen met exact dezelfde coördinaten (6 decimalen)
 *    en is additief en idempotent: bestaande placeId's en velden worden nooit gewijzigd.
 */

export const PLACES_KEY = 'birdspot-places';
export const PLACES_SCHEMA = 1;
/** Standaardstraal voor een bekende vogelspot (eigenaarbesluit: 250 m, configureerbaar). */
export const PLACE_REUSE_RADIUS_M = 250;
export const PLACE_RADIUS_OPTIONS = Object.freeze([100, 250, 500]);
/** Boven deze GPS-/pinonzekerheid (of onbekend) nooit automatisch koppelen. */
export const MAX_AUTO_ACCURACY_M = 50;
/** @deprecated K4-naam; gelijk aan de standaardstraal. */
export const REUSE_RADIUS_M = PLACE_REUSE_RADIUS_M;
const SETTINGS_KEY = 'birdspot-settings';

/** Ingestelde straal uit de gebruikersinstellingen; ongeldig → standaard. */
export function reuseRadiusM(storage = globalThis.localStorage) {
  try {
    const value = Number(JSON.parse(storage?.getItem(SETTINGS_KEY) || '{}')?.placeRadiusM);
    return PLACE_RADIUS_OPTIONS.includes(value) ? value : PLACE_REUSE_RADIUS_M;
  } catch (_) { return PLACE_REUSE_RADIUS_M; }
}

const R = 6371008.8;
const rad = d => (Number(d) * Math.PI) / 180;

/** Afstand in meters (haversine). */
export function distanceM(lat1, lon1, lat2, lon2) {
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Dichtstbijzijnde plek binnen `maxM` meter, of null. Pure functie. */
export function nearestPlace(places, lat, lon, maxM = PLACE_REUSE_RADIUS_M) {
  let best = null;
  for (const p of places || []) {
    const d = distanceM(lat, lon, p.lat, p.lon);
    if (d <= maxM && (!best || d < best.distanceM)) best = { place: p, distanceM: Math.round(d) };
  }
  return best;
}

const validCoord = (a, b) => Number.isFinite(Number(a)) && Number.isFinite(Number(b)) &&
  a !== null && b !== null && Math.abs(a) <= 90 && Math.abs(b) <= 180;
const coordKey = (lat, lon) => `${Number(lat).toFixed(6)},${Number(lon).toFixed(6)}`;
const newId = () => 'pl_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/** Alle geldige plekken binnen `radiusM` (grens inclusief), dichtstbij eerst. Pure functie. */
export function candidatePlaces(places, lat, lon, radiusM = PLACE_REUSE_RADIUS_M) {
  if (!validCoord(lat, lon)) return [];
  return (places || []).filter(place => place && place.id && validCoord(place.lat, place.lon))
    .map(place => ({ place, distanceM: distanceM(lat, lon, place.lat, place.lon) }))
    .filter(({ distanceM: d }) => d <= radiusM)
    .sort((a, b) => a.distanceM - b.distanceM || String(a.place.id).localeCompare(String(b.place.id)));
}

/** Is de positie nauwkeurig genoeg om automatisch te koppelen? Onbekend = nee. */
export function accurateEnough(accuracyM) {
  return accuracyM !== null && accuracyM !== undefined && accuracyM !== '' &&
    Number.isFinite(Number(accuracyM)) && Number(accuracyM) >= 0 && Number(accuracyM) <= MAX_AUTO_ACCURACY_M;
}

/**
 * Besluit voor een nieuwe positie (pure functie):
 *  - mode 'new'    : geen bekende plek binnen de straal
 *  - mode 'single' : precies één kandidaat; `auto` alleen bij nauwkeurige positie (≤ 50 m)
 *  - mode 'choose' : meerdere kandidaten; nooit automatisch
 */
export function placeDecision({ places, lat, lon, accuracyM, radiusM = PLACE_REUSE_RADIUS_M }) {
  const candidates = candidatePlaces(places, lat, lon, radiusM);
  const accurate = accurateEnough(accuracyM);
  if (!candidates.length) return { mode: 'new', candidates, auto: false, accurate, radiusM };
  if (candidates.length === 1) return { mode: 'single', candidates, auto: accurate, accurate, radiusM };
  return { mode: 'choose', candidates, auto: false, accurate, radiusM };
}

/** Geluidsessie: dezelfde regels als handmatig toevoegen. Exact dezelfde coördinaten van een
 *  bewaarde (niet-GPS) plek blijven een zekere match. */
export function matchSoundPlace(places, { lat, lon, pinAccuracyM }, fromGps, radiusM = PLACE_REUSE_RADIUS_M) {
  const valid = (places || []).filter(place => validCoord(place.lat, place.lon) && place.id);
  const exact = valid.filter(place => coordKey(lat, lon) === coordKey(place.lat, place.lon));
  if (!fromGps && exact.length === 1) return { place: exact[0], alternatives: [], needsChoice: false };
  const decision = placeDecision({ places: valid, lat, lon, accuracyM: pinAccuracyM, radiusM });
  const alternatives = decision.candidates.slice(0, 5).map(({ place, distanceM: distance }) => ({ place, distance }));
  if (decision.auto) return { place: decision.candidates[0].place, alternatives: [], needsChoice: false };
  return {
    place: null,
    alternatives,
    needsChoice: alternatives.length > 0 ||
      (fromGps && Number.isFinite(Number(pinAccuracyM)) && pinAccuracyM !== null && Number(pinAccuracyM) > MAX_AUTO_ACCURACY_M),
  };
}

// ── Opslag: IndexedDB is leidend (ronde 2B-afronding) ─────────────────────
// Lezen: synchrone cache, bij de start geladen uit IndexedDB en na elke wijziging (ook vanuit andere
// tabbladen) ververst. Schrijven: altijd binnen een IndexedDB-transactie die de actuele plekken leest.
// localStorage is alleen nog een spiegel (terugval oudere versie, bestaande lezers) en een
// additieve bron: plek-ID's die daar wel en in IndexedDB niet staan, worden toegevoegd — nooit een
// plek met grafsteen, nooit overschrijven of verwijderen. Daardoor kan geen oude stand iets wissen.
let cache = null;              // Array van plekken uit IndexedDB, of null vóór initPlaces()
let tombCache = new Set();     // plek-ID's met grafsteen
let lastMirrorRaw = null;      // laatst door deze module geschreven/gelezen spiegel
let unionBusy = null;
let channel = null;           // pas in initPlaces() (browser) aangemaakt

function legacyPlaces(storage = globalThis.localStorage) {
  try {
    const raw = JSON.parse(storage?.getItem(PLACES_KEY) || 'null');
    return Array.isArray(raw?.places) ? raw.places : [];
  } catch (_) { return []; }
}
const validStored = place => !!place && typeof place.id === 'string' && !!place.id && validCoord(place.lat, place.lon);

/** Plekken (synchroon, voor weergave en beslissingen vóór opslaan). */
export function loadPlaces(storage = globalThis.localStorage) {
  if (cache === null || storage !== globalThis.localStorage) return legacyPlaces(storage);
  let raw = null;
  try { raw = storage.getItem(PLACES_KEY); } catch (_) {}
  if (raw !== lastMirrorRaw) {
    lastMirrorRaw = raw;
    const known = new Set(cache.map(place => place.id));
    const extra = legacyPlaces(storage).filter(place => validStored(place) && !known.has(place.id) && !tombCache.has(place.id));
    if (extra.length) {
      cache = [...cache, ...extra];
      unionBusy = unionLegacy().catch(() => {});
    }
  }
  return cache;
}

/** @deprecated Schrijft alleen de spiegel; gebruik de transactiefuncties hieronder. */
export function savePlaces(places, storage = globalThis.localStorage) {
  storage.setItem(PLACES_KEY, JSON.stringify({ schemaVersion: PLACES_SCHEMA, places }));
}

function writeMirror(places) {
  const raw = JSON.stringify({ schemaVersion: PLACES_SCHEMA, places });
  try {
    // Een waarde in een onbekend formaat (bijv. uit een heel oude versie) nooit overschrijven:
    // die blijft byte-gelijk staan; de plekken zelf staan in IndexedDB.
    const current = localStorage.getItem(PLACES_KEY);
    if (current !== null && current !== raw) {
      let shape = null;
      try { shape = JSON.parse(current); } catch (_) { shape = undefined; }
      if (!shape || typeof shape !== 'object' || Array.isArray(shape) || !Array.isArray(shape.places)) return raw;
    }
    localStorage.setItem(PLACES_KEY, raw);
    lastMirrorRaw = raw;
  } catch (_) { /* spiegel is niet leidend */ }
  return raw;
}
export function placesMirrorValue(places) {
  return JSON.stringify({ schemaVersion: PLACES_SCHEMA, places });
}

function req(request) {
  return new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
}

/**
 * Lees-wijzig-schrijf op de actuele plekken in één readwrite-transactie.
 * `change({ places, tombstones, tx })` geeft { put?, remove?, result? } terug, of gooit (dan wijzigt niets).
 * Extra stores (bijv. 'photos') kunnen in dezelfde transactie worden meegenomen.
 */
export async function withPlacesTx(change, extraStores = [], { readPhotos = false, readMeta = null, onAbort = null } = {}) {
  const { getDB } = await import('./db.js');
  const db = await getDB();
  const stores = ['places', 'placeTombstones', ...extraStores];
  let after = null;
  const result = await new Promise((resolve, reject) => {
    const tx = db.transaction(stores, 'readwrite');
    const placesStore = tx.objectStore('places');
    let out;
    let failure = null;
    tx.oncomplete = () => resolve(out);
    tx.onabort = () => {
      try { onAbort?.(); } catch (error) { failure = failure || error; }
      reject(failure || tx.error || new Error('Plek opslaan afgebroken'));
    };
    Promise.all([req(placesStore.getAll()), req(tx.objectStore('placeTombstones').getAllKeys()),
      readPhotos ? req(tx.objectStore('photos').getAll()) : Promise.resolve(null),
      readMeta ? Promise.all([].concat(readMeta).map(key => req(tx.objectStore('meta').get(key))))
        .then(rows => Object.fromEntries([].concat(readMeta).map((key, i) => [key, rows[i] || null])))
        : Promise.resolve(undefined)]).then(([stored, tombs, photos, meta]) => {
      try {
        // Additieve migratie binnen dezelfde transactie: plek-ID's die alleen in localStorage staan
        // (oude versie, oude spiegel) toevoegen — nooit met grafsteen, nooit overschrijven of wissen.
        const known = new Set(stored.map(place => place.id));
        const tombSet = new Set(tombs);
        const legacy = [];
        for (const place of legacyPlaces()) {
          if (validStored(place) && !known.has(place.id) && !tombSet.has(place.id)) { known.add(place.id); legacy.push(place); }
        }
        for (const place of legacy) placesStore.put(place);
        const places = [...stored, ...legacy];
        const res = change({ places, tombstones: new Set(tombs), photos, meta, tx }) || {};
        for (const place of res.put || []) placesStore.put(place);
        for (const id of res.remove || []) placesStore.delete(id);
        const byId = new Map(places.map(place => [place.id, place]));
        for (const id of res.remove || []) byId.delete(id);
        for (const place of res.put || []) byId.set(place.id, place);
        after = { places: [...byId.values()], tombstones: res.tombstones ?? new Set(tombs) };
        out = res.result;
      } catch (error) {
        failure = error;
        try { tx.abort(); } catch (_) {}
      }
    }, error => { failure = error; try { tx.abort(); } catch (_) {} });
  });
  if (after) publish(after.places, after.tombstones);
  return result;
}

function publish(places, tombstones) {
  cache = places;
  if (tombstones) tombCache = new Set(tombstones);
  writeMirror(places);
  try { channel?.postMessage('changed'); } catch (_) {}
}

/** Cache verversen uit IndexedDB (start, ander tabblad gewijzigd). */
export async function refreshPlaces() {
  const { getDB } = await import('./db.js');
  const db = await getDB();
  const tx = db.transaction(['places', 'placeTombstones'], 'readonly');
  const [places, tombs] = await Promise.all([req(tx.objectStore('places').getAll()), req(tx.objectStore('placeTombstones').getAllKeys())]);
  cache = places;
  tombCache = new Set(tombs);
  try { lastMirrorRaw = localStorage.getItem(PLACES_KEY); } catch (_) {}
  return places;
}

/** Additieve migratie uit localStorage: alleen ontbrekende ID's, nooit met grafsteen. Idempotent. */
export function unionLegacy() {
  return withPlacesTx(() => ({}));   // de transactie zelf voegt ontbrekende localStorage-plekken toe
}

/**
 * Grafstenen uit de losse 'birdspot-guard'-database (tussenversies van ronde 2B) DUURZAAM EENMALIG
 * overnemen (P2): de markering 'guardTombstones' in de store 'meta' wordt in dezelfde transactie
 * gezet als de grafstenen. Onderbroken → niets vastgelegd, volgende start probeert opnieuw; twee
 * tabbladen tegelijk → de tweede transactie ziet de markering en doet niets. Een oude grafsteen gaat
 * vóór een verouderde localStorage-plek met hetzelfde ID (die plek wordt niet overgenomen). Na de
 * markering wordt 'birdspot-guard' nooit meer gelezen, dus een later geldig herstelde plek blijft
 * bruikbaar. Maakt 'birdspot-guard' nooit aan als die niet bestaat; laat hem verder ongemoeid.
 */
const GUARD_META = 'guardTombstones';
async function readGuardTombstones() {
  if (typeof indexedDB === 'undefined') return [];
  const guard = await new Promise((resolve, reject) => {
    let fresh = false;
    const request = indexedDB.open('birdspot-guard');
    request.onupgradeneeded = () => { fresh = true; request.transaction.abort(); };
    request.onsuccess = () => resolve(fresh ? null : request.result);
    request.onerror = () => (fresh ? resolve(null) : reject(request.error));
    request.onblocked = () => reject(new Error('birdspot-guard geblokkeerd'));
  });
  if (!guard) return [];
  try {
    if (!guard.objectStoreNames.contains('removedPlaces')) return [];
    return await req(guard.transaction('removedPlaces').objectStore('removedPlaces').getAll());
  } finally {
    guard.close();
  }
}

/**
 * Correctieronde 2B (P2): conflictronde, eenmalig in dezelfde transactie. Een plek die zowel bestaat
 * als een grafsteen heeft (verouderde localStorage-plek bij de upgrade; ook in v2-databases van #301):
 *  - zonder koppelingen (geen omgevingsfoto, geen waarneming met deze plek) → plek weg, grafsteen blijft;
 *  - met koppelingen → plek blijft bereikbaar en alleen DIE grafsteen vervalt (foto's nooit wees).
 * Andere grafstenen blijven ongemoeid.
 */
const CONFLICT_META = 'tombstoneConflicts';
export const PLACE_MIGRATIONS = Object.freeze([GUARD_META, CONFLICT_META]);

export class PlaceMigrationPendingError extends Error {
  constructor() {
    super('Plekken worden nog bijgewerkt. De foto is niet opgeslagen; probeer het zo opnieuw.');
    this.name = 'PlaceMigrationPendingError';
  }
}

function sightingPlaceIds() {
  try {
    const raw = JSON.parse(globalThis.localStorage?.getItem('birdspot-sightings') || 'null');
    return new Set((raw?.sightings || []).map(s => s?.placeId).filter(Boolean));
  } catch (_) {
    return null;   // onleesbaar: koppelingen onzeker → niets verwijderen
  }
}

async function migrateGuardTombstones() {
  const { getDB } = await import('./db.js');
  const db = await getDB();
  const store = db.transaction('meta').objectStore('meta');
  const [guardDone, conflictsDone] = await Promise.all(PLACE_MIGRATIONS.map(key => req(store.get(key))));
  if (guardDone && conflictsDone) return;   // eenmalig gedaan: 'birdspot-guard' niet meer lezen
  const old = guardDone ? [] : (await readGuardTombstones()).filter(row => row && typeof row.id === 'string' && row.id);
  const linkedBySighting = sightingPlaceIds();
  await withPlacesTx(({ places, tombstones, photos, meta, tx }) => {
    const now = new Date().toISOString();
    const metaStore = tx.objectStore('meta');
    const tombStore = tx.objectStore('placeTombstones');
    const next = new Set(tombstones);
    if (!meta[GUARD_META]) {
      for (const row of old) {
        if (!next.has(row.id)) { tombStore.put({ id: row.id, removedAt: row.removedAt || now }); next.add(row.id); }
      }
      metaStore.put({ key: GUARD_META, at: now, count: old.length });
    }
    const remove = [];
    if (!meta[CONFLICT_META]) {
      if (!linkedBySighting) throw new Error('Waarnemingen onleesbaar: plekconflicten niet veilig op te lossen');
      const kept = [];
      for (const place of places) {
        if (!next.has(place.id)) continue;
        const linked = linkedBySighting.has(place.id) || photos.some(photo => photo.placeId === place.id);
        if (linked) { tombStore.delete(place.id); next.delete(place.id); kept.push(place.id); }
        else remove.push(place.id);
      }
      metaStore.put({ key: CONFLICT_META, at: now, removed: remove, kept });
    }
    return { remove, tombstones: next };
  }, ['meta', 'photos'], { readPhotos: true, readMeta: PLACE_MIGRATIONS });
}

/** Zekerheid vóór een koppeling aan een bestaande plek: migratie (opnieuw) proberen. */
export async function ensurePlaceMigrations() {
  try { await migrateGuardTombstones(); } catch (error) { console.error('[places] migratie', error); }
}
function migrationsDone(meta) {
  return PLACE_MIGRATIONS.every(key => meta?.[key]);
}

/** Bij het starten van de app: migratie (v2-upgrade + grafstenen + additief) en cache laden. */
export async function initPlaces() {
  const { withDataWrite } = await import('./opJournal.js');
  await withDataWrite(migrateGuardTombstones).catch(error => console.error('[places] grafstenen overnemen', error));
  await unionLegacy();
  await refreshPlaces();
  writeMirror(cache);
  if (!channel && typeof BroadcastChannel === 'function') {
    channel = new BroadcastChannel('birdspot-places');
    channel.onmessage = () => { refreshPlaces().catch(() => {}); };
  }
  try { addEventListener('storage', event => { if (event.key === PLACES_KEY) loadPlaces(); }); } catch (_) {}
  return cache;
}

/** Wacht op een eventueel lopende additieve migratie (tests, opslaan). */
export function placesSettled() { return unionBusy || Promise.resolve(); }

export function makePlace({ name, lat, lon }, now = new Date().toISOString()) {
  return { id: newId(), name: String(name || '').trim() || 'Naamloze plek', lat: Number(lat), lon: Number(lon), createdAt: now, updatedAt: now };
}

/** Standaardnaam: ingevulde locatienaam, anders 'Plek n'. */
export function defaultPlaceName(places, locationName) {
  const n = String(locationName || '').trim();
  return n || `Plek ${(places?.length || 0) + 1}`;
}

/**
 * Migratie (pure functie): plekken voor waarnemingen met een pin maar zonder placeId.
 * Exact dezelfde coördinaten → één plek. Geeft { places, assign: Map(sightingId → placeId) }.
 */
export function planMigration(sightings, places) {
  const out = [...places];
  const byKey = new Map(out.map(p => [coordKey(p.lat, p.lon), p]));
  const known = new Set(out.map(p => p.id));
  const assign = new Map();
  for (const s of sightings || []) {
    if (s.placeId && known.has(s.placeId)) continue;
    if (!validCoord(s.lat, s.lon)) continue;
    const key = coordKey(s.lat, s.lon);
    let place = byKey.get(key);
    if (!place) {
      place = makePlace({ name: defaultPlaceName(out, s.locationName), lat: s.lat, lon: s.lon }, s.createdAt || new Date().toISOString());
      out.push(place); byKey.set(key, place); known.add(place.id);
    }
    assign.set(s.id, place.id);
  }
  return { places: out, assign };
}

/** Statistiek per plek over de gegeven waarnemingen. Pure functie. */
export function placeStats(place, sightings) {
  const rows = (sightings || []).filter(s => s.placeId === place.id);
  const dates = [...new Set(rows.map(s => s.date).filter(Boolean))].sort();
  const species = new Map();
  for (const s of rows) {
    const key = s.speciesId || s.speciesName;
    const cur = species.get(key) || { speciesId: s.speciesId, name: s.speciesName || 'Onbekend', count: 0, last: '' };
    cur.count++;
    if ((s.date || '') > cur.last) cur.last = s.date || '';
    species.set(key, cur);
  }
  return {
    sightings: rows.length,
    visits: dates.length,
    first: dates[0] || null,
    last: dates[dates.length - 1] || null,
    species: [...species.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'nl')),
  };
}

/**
 * Zorgt dat alle waarnemingen met een pin aan een plek hangen (eenmalig per nieuwe waarneming).
 * Idempotent; plannen en schrijven binnen één IndexedDB-transactie. Geeft de actuele plekkenlijst.
 */
export async function ensurePlaces() {
  const { withDataWrite } = await import('./opJournal.js');
  const { getSightingsSnapshot, assignPlaceIdsUnderLock } = await import('./sightings.js');
  return withDataWrite(async () => {
    const sightings = getSightingsSnapshot().filter(sighting => !sighting.placeId && validCoord(sighting.lat, sighting.lon));
    if (!sightings.length) return loadPlaces();
    await ensurePlaceMigrations();
    const assign = await withPlacesTx(({ places, tombstones, meta }) => {
      if (!migrationsDone(meta)) throw new PlaceMigrationPendingError();
      const available = places.filter(place => !tombstones.has(place.id));
      const plan = planMigration(sightings, available);
      return { put: plan.places.slice(available.length), result: plan.assign };
    }, ['meta'], { readMeta: PLACE_MIGRATIONS });
    assignPlaceIdsUnderLock(assign);
    return loadPlaces();
  });
}

export async function renamePlace(id, name) {
  const clean = String(name || '').trim();
  if (!clean) return null;
  return withPlacesTx(({ places }) => {
    const place = places.find(x => x.id === id);
    if (!place) return { result: null };
    const next = { ...place, name: clean.slice(0, 80), updatedAt: new Date().toISOString() };
    return { put: [next], result: next };
  });
}

/**
 * Plek voor een nieuwe waarneming: de gekozen bestaande plek als die nog bestaat (en geen grafsteen
 * heeft), anders een nieuwe plek. Alles binnen één transactie op de actuele plekken.
 * Geeft { place, created }.
 */
export async function resolvePlaceForSave({ placeId, name, lat, lon }) {
  if (placeId) await ensurePlaceMigrations();
  return withPlacesTx(({ places, tombstones, meta }) => {
    // Correctieronde 2B (P2): geen koppeling aan een bestaande plek zolang de migratie onzeker is.
    if (placeId && !migrationsDone(meta)) throw new PlaceMigrationPendingError();
    const existing = placeId && !tombstones.has(placeId) ? places.find(place => place.id === placeId) : null;
    if (existing) return { result: { place: existing, created: false } };
    const place = makePlace({ name: defaultPlaceName(places, name), lat, lon });
    return { put: [place], result: { place, created: true } };
  }, ['meta'], { readMeta: PLACE_MIGRATIONS });
}

export async function addPlace({ name, lat, lon }) {
  return (await resolvePlaceForSave({ placeId: null, name, lat, lon })).place;
}

/** Terugdraaien van een zojuist gemaakte plek (opslaan van de waarneming mislukte). */
export function removeCreatedPlace(id) {
  // Met grafsteen: een oude spiegel in een ander tabblad kan deze plek dan nooit terugzetten.
  return withPlacesTx(({ places, tombstones, tx }) => {
    if (!tombstones.has(id)) tx.objectStore('placeTombstones').put({ id, removedAt: new Date().toISOString() });
    return { remove: places.some(place => place.id === id) ? [id] : [], tombstones: new Set([...tombstones, id]) };
  });
}
