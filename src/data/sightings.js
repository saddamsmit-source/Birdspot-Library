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
 *   placeId:      string | null  (K4, optioneel: vaste plek uit places.js; eigen lat/lon blijven bewaard)
 *   pinAccuracyM: number | null  (K2, optioneel: nauwkeurigheid van de pin in meters; ontbreekt = onbekend)
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

export const STORAGE_KEY    = 'birdspot-sightings';
export const SCHEMA_VERSION = 2;

// ── Migratie ────────────────────────────────────────────────
/**
 * Migreert één waarneming naar het huidige schema.
 * Additief: spreidt ALLE bestaande velden (inclusief toekomstige onbekende),
 * en vult ontbrekende velden aan met defaults.
 * Bestaande velden worden NOOIT overschreven.
 */
export function migrateSighting(s) {
  return {
    // Behoud ALLE bestaande velden — inclusief toekomstige/onbekende properties.
    // Defaults hieronder overschrijven NIET: ze worden uitsluitend gezet
    // als het veld ontbreekt (undefined) of null is voor verplichte types.
    ...s,
    // v1-velden: zorg voor null als afwezig (niet undefined)
    lat:          s.lat          ?? null,
    lon:          s.lon          ?? null,
    locationName: s.locationName ?? null,
    notes:        s.notes        ?? null,
    photoIds:     Array.isArray(s.photoIds) ? s.photoIds : [],
    // v2-velden: voeg defaults toe als het veld ontbreekt
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
 * @returns {Object[]}
 */
export function getSightingsSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const store = JSON.parse(raw);
    if (!store || !Array.isArray(store.sightings)) return [];

    // Migreer naar huidig schema als nodig
    const version = store.schemaVersion ?? 1;
    if (version < SCHEMA_VERSION) {
      const migrated = store.sightings.map(migrateSighting);
      // Niet terugschrijven zolang een onderbroken import/Terugzetten nog hersteld moet worden.
      if (pendingRecovery()) return migrated;
      // Direct opslaan met nieuwe versie (transparant voor callers)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          schemaVersion: SCHEMA_VERSION,
          exportedAt:    new Date().toISOString(),
          sightings:     migrated,
        }));
      } catch (_) { /* quota-fout: sla migratie over, retourneer toch */ }
      return migrated;
    }

    return store.sightings;
  } catch (_) {
    return [];
  }
}

export function getSightings() { return Promise.resolve(getSightingsSnapshot()); }

// ── Herstelslot (correctieronde 2B, P1) ───────────────────
// Schrijvers lezen pas na afgerond herstel van een onderbroken import/Terugzetten, onder de
// datalock (dus nooit tijdens zo'n bewerking in een ander tabblad). Dynamisch geladen: deze module
// blijft zonder browseropslag importeerbaar.
async function dataWrite(change) {
  const { withDataWrite } = await import('./opJournal.js');
  return withDataWrite(change);
}
function pendingRecovery() {
  try { return localStorage.getItem('birdspot-op-pending') !== null; } catch (_) { return false; }
}

// ── Sla alle waarnemingen op ───────────────────────────────
/**
 * Schrijft alle waarnemingen naar localStorage.
 * Gooit bij een fout (bijv. QuotaExceededError) — callers beslissen
 * over foutafhandeling en UI-feedback. NEVER stil slikken.
 * @throws {DOMException|Error} bij opslagfout
 */
function saveSightings(sightings) {
  // Geen try/catch: fout propageren naar caller
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    exportedAt:    new Date().toISOString(),
    sightings,
  }));
}

// ── Plekken koppelen (K4) ──────────────────────────────────
/**
 * Zet placeId op waarnemingen die er nog geen hebben (additief; overschrijft nooit).
 * @param {Map<string,string>} assign  sightingId → placeId
 * @returns {Promise<number>} aantal gewijzigde waarnemingen
 * @throws bij opslagfout
 */
export async function assignPlaceIds(assign) {
  if (!assign?.size) return 0;
  return dataWrite(() => {
    const all = getSightingsSnapshot();
    let n = 0;
    for (const s of all) {
      if (!s.placeId && assign.has(s.id)) { s.placeId = assign.get(s.id); n++; }
    }
    if (n) saveSightings(all);
    return n;
  });
}

// ── Voeg toe ───────────────────────────────────────────────
/**
 * @throws {DOMException|Error} bij opslagfout (caller toont foutmelding)
 */
export async function addSighting(sighting) {
  await addSightings([sighting]);
  return sighting;
}

/** Append a complete group with one storage write. The caller retains its draft on failure. */
export async function addSightings(sightings) {
  return dataWrite(() => {
    const stored = getSightingsSnapshot();
    const existingIds = new Set(stored.map(sighting => sighting.id));
    const additions = sightings.filter(sighting => !existingIds.has(sighting.id));
    if (additions.length) saveSightings([...stored, ...additions]);
  });
}

// ── Update ─────────────────────────────────────────────────
/**
 * @throws {Error} als sighting niet gevonden
 * @throws {DOMException|Error} bij opslagfout (caller toont foutmelding)
 */
export async function updateSighting(id, patch, { resolve = null } = {}) {
  return dataWrite(async () => {
    // Vervolgcorrectie R08 (P1): velden die van de ACTUELE waarneming afhangen (audiokoppelingen)
    // worden onder hetzelfde herstelslot bepaald, direct vóór het schrijven.
    let resolved = {};
    if (resolve) {
      const current = getSightingsSnapshot().find(s => s.id === id);
      if (!current) throw new Error(`Sighting ${id} not found`);
      resolved = (await resolve(current)) || {};
    }
    const all = getSightingsSnapshot();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) throw new Error(`Sighting ${id} not found`);
    all[idx] = { ...all[idx], ...patch, ...resolved, updatedAt: new Date().toISOString() };
    saveSightings(all);   // gooit bij fout — addSheet.js vangt dit op
    return all[idx];
  });
}

// ── Verwijder ──────────────────────────────────────────────
/**
 * @throws {DOMException|Error} bij opslagfout (caller toont foutmelding)
 */
export async function deleteSighting(id) {
  return dataWrite(() => {
    const all = getSightingsSnapshot();
    saveSightings(all.filter(s => s.id !== id));   // gooit bij fout
  });
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
  await dataWrite(() => saveSightings(parsed.sightings.map(migrateSighting)));
  return parsed.sightings.length;
}
