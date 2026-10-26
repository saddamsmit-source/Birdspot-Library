/**
 * Sightings — CRUD via localStorage
 *
 * Schema v1: { schemaVersion, sightings[] }
 *   { id, speciesId, speciesName, date, lat, lon, locationName,
 *     notes, photoIds, createdAt, updatedAt }
 *
 * Schema v2 (additief — geen breaking change):
 *   Voegt toe: time, count, certainty, habitat, behavior, weather
 *   Migratie: ontbrekende velden krijgen null/default — bestaande data
 *             blijft ongewijzigd, geen destructieve acties.
 *
 * Elke waarneming (v2):
 * {
 *   id:           string  (stable, nanoid-stijl)
 *   speciesId:    string
 *   speciesName:  string
 *   date:         string  (ISO 8601 datum, bijv. "2026-10-26")
 *   time:         string | null  ("HH:MM" of null)
 *   count:        number         (min 1, default 1)
 *   certainty:    'certain' | 'probable' | 'possible'  (default 'certain')
 *   lat:          number | null
 *   lon:          number | null
 *   locationName: string | null
 *   habitat:      string | null  (bijv. 'forest', 'wetland', …)
 *   behavior:     string | null  (bijv. 'feeding', 'singing', …)
 *   weather:      string | null  (bijv. 'sunny', 'cloudy', …)
 *   notes:        string | null
 *   photoIds:     string[]       (refs naar IndexedDB photos store)
 *   createdAt:    string  (ISO 8601)
 *   updatedAt:    string  (ISO 8601)
 * }
 */

const STORAGE_KEY    = 'birdspot-sightings';
const SCHEMA_VERSION = 2;

// ── Migratie ────────────────────────────────────────────────
/**
 * Migreert één waarneming naar het huidige schema.
 * Additief: voegt ontbrekende velden toe met defaults.
 * Bestaande velden worden NOOIT overschreven.
 */
function migrateSighting(s) {
  return {
    // v1-velden (ongewijzigd doorgegeven)
    id:           s.id,
    speciesId:    s.speciesId,
    speciesName:  s.speciesName,
    date:         s.date,
    lat:          s.lat          ?? null,
    lon:          s.lon          ?? null,
    locationName: s.locationName ?? null,
    notes:        s.notes        ?? null,
    photoIds:     Array.isArray(s.photoIds) ? s.photoIds : [],
    createdAt:    s.createdAt,
    updatedAt:    s.updatedAt,
    // v2-velden (default als ontbrekend)
    time:         s.time         !== undefined ? s.time         : null,
    count:        s.count        !== undefined ? s.count        : 1,
    certainty:    s.certainty    !== undefined ? s.certainty    : 'certain',
    habitat:      s.habitat      !== undefined ? s.habitat      : null,
    behavior:     s.behavior     !== undefined ? s.behavior     : null,
    weather:      s.weather      !== undefined ? s.weather      : null,
  };
}

// ── Lees alle waarnemingen ──────────────────────────────────
/**
 * Laadt sightings uit localStorage.
 * Voert automatisch schema-migratie uit (additief, safe).
 * @returns {Promise<Object[]>}
 */
export function getSightings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return Promise.resolve([]);
    const store = JSON.parse(raw);
    if (!store || !Array.isArray(store.sightings)) return Promise.resolve([]);

    // Migreer naar huidig schema als nodig
    const version = store.schemaVersion ?? 1;
    if (version < SCHEMA_VERSION) {
      const migrated = store.sightings.map(migrateSighting);
      // Direct opslaan met nieuwe versie (transparant voor callers)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          schemaVersion: SCHEMA_VERSION,
          exportedAt:    new Date().toISOString(),
          sightings:     migrated,
        }));
      } catch (_) { /* quota-fout: sla migratie over, retourneer toch */ }
      return Promise.resolve(migrated);
    }

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
  const all = await getSightings();
  const idx = all.findIndex(s => s.id === id);
  if (idx === -1) throw new Error(`Sighting ${id} not found`);
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
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
  // Migreer geïmporteerde data ook naar huidig schema
  saveSightings(parsed.sightings.map(migrateSighting));
  return parsed.sightings.length;
}
