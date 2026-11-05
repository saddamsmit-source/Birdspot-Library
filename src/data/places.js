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
 * Regels:
 *  - De app voegt nooit zelf plekken samen binnen 50 m; dat beslist de gebruiker (§1.1).
 *  - Migratie maakt alleen plekken voor waarnemingen met exact dezelfde coördinaten (6 decimalen)
 *    en is additief en idempotent: bestaande placeId's en velden worden nooit gewijzigd.
 */

export const PLACES_KEY = 'birdspot-places';
export const PLACES_SCHEMA = 1;
export const REUSE_RADIUS_M = 50;

const R = 6371008.8;
const rad = d => (Number(d) * Math.PI) / 180;

/** Afstand in meters (haversine). */
export function distanceM(lat1, lon1, lat2, lon2) {
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Dichtstbijzijnde plek binnen `maxM` meter, of null. Pure functie. */
export function nearestPlace(places, lat, lon, maxM = REUSE_RADIUS_M) {
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

export function loadPlaces(storage = globalThis.localStorage) {
  try {
    const raw = JSON.parse(storage.getItem(PLACES_KEY) || 'null');
    return Array.isArray(raw?.places) ? raw.places : [];
  } catch (_) { return []; }
}

/** @throws bij opslagfout — caller toont de melding. */
export function savePlaces(places, storage = globalThis.localStorage) {
  storage.setItem(PLACES_KEY, JSON.stringify({ schemaVersion: PLACES_SCHEMA, places }));
}

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
 * Idempotent. Geeft de actuele plekkenlijst terug.
 */
export async function ensurePlaces() {
  const { getSightings, assignPlaceIds } = await import('./sightings.js');
  const sightings = await getSightings();
  const current = loadPlaces();
  const { places, assign } = planMigration(sightings, current);
  if (places.length !== current.length) savePlaces(places);
  if (assign.size) await assignPlaceIds(assign);
  return places;
}

export function renamePlace(id, name) {
  const places = loadPlaces();
  const p = places.find(x => x.id === id);
  const clean = String(name || '').trim();
  if (!p || !clean) return null;
  p.name = clean.slice(0, 80);
  p.updatedAt = new Date().toISOString();
  savePlaces(places);
  return p;
}

export function addPlace({ name, lat, lon }) {
  const places = loadPlaces();
  const place = makePlace({ name: defaultPlaceName(places, name), lat, lon });
  places.push(place);
  savePlaces(places);
  return place;
}
