/**
 * Sightings — CRUD via localStorage
 * Schema v1: { schemaVersion, sightings[] }
 *
 * Elke waarneming:
 * {
 *   id:           string  (stable, nanoid-stijl)
 *   speciesId:    string
 *   speciesName:  string
 *   date:         string  (ISO 8601)
 *   lat:          number | null
 *   lon:          number | null
 *   locationName: string | null
 *   notes:        string | null
 *   photoIds:     string[]      (refs naar IndexedDB photos store)
 *   createdAt:    string  (ISO 8601)
 *   updatedAt:    string  (ISO 8601)
 * }
 */

const STORAGE_KEY    = 'birdspot-sightings';
const SCHEMA_VERSION = 1;

// ── Lees alle waarnemingen ──────────────────────────────────
export function getSightings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return Promise.resolve([]);
    const store = JSON.parse(raw);
    if (!store || !Array.isArray(store.sightings)) return Promise.resolve([]);
    return Promise.resolve(store.sightings);
  } catch (_) {
    return Promise.resolve([]);
  }
}

// ── Sla alle waarnemingen op ───────────────────────────────
function saveSightings(sightings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      exportedAt:    new Date().toISOString(),
      sightings,
    }));
  } catch (e) {
    console.error('[sightings] save error', e);
  }
}

// ── Voeg toe ───────────────────────────────────────────────
export async function addSighting(sighting) {
  const all = await getSightings();
  all.push(sighting);
  saveSightings(all);
  return sighting;
}

// ── Update ─────────────────────────────────────────────────
export async function updateSighting(id, patch) {
  const all     = await getSightings();
  const idx     = all.findIndex(s => s.id === id);
  if (idx === -1) throw new Error(`Sighting ${id} not found`);
  all[idx]      = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  saveSightings(all);
  return all[idx];
}

// ── Verwijder ──────────────────────────────────────────────
export async function deleteSighting(id) {
  const all = await getSightings();
  saveSightings(all.filter(s => s.id !== id));
}

// ── Export (JSON) ──────────────────────────────────────────
export async function exportData() {
  const sightings = await getSightings();
  return JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    exportedAt:    new Date().toISOString(),
    sightings,
  }, null, 2);
}

// ── Import (JSON) ──────────────────────────────────────────
export async function importData(jsonString) {
  const parsed = JSON.parse(jsonString);
  if (!parsed.sightings || !Array.isArray(parsed.sightings)) {
    throw new Error('Ongeldig exportbestand');
  }
  saveSightings(parsed.sightings);
  return parsed.sightings.length;
}
