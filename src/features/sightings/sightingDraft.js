/**
 * UX-01A (25-11-2026) — concepten van het waarnemingsformulier.
 *
 * - Eigen localStorage-sleutel, buiten de waarnemingen, de lijst, de CSV-export en de ZIP-back-up
 *   (backup.js leest alleen DATA_KEYS). Een concept is nooit een waarneming.
 * - Eén concept per doel: 'new' voor een nieuwe waarneming, 'edit:<id>' voor het bewerken van één
 *   bestaande waarneming. Zo overschrijven concepten elkaar niet.
 * - Bewerkconcepten onthouden updatedAt van de waarneming bij openen. Is de waarneming sindsdien
 *   gewijzigd, dan is het concept verouderd en wordt het nooit toegepast.
 * - Alleen gegevensvelden; nieuw gekozen foto's en opnamen (File/Blob) gaan niet mee. Het aantal staat
 *   in het concept, zodat de app eerlijk kan melden dat ze opnieuw gekozen moeten worden.
 */
export const DRAFT_STORAGE_KEY = 'birdspot-sighting-drafts';

export const DRAFT_FIELDS = Object.freeze([
  'speciesId', 'speciesName', 'date', 'time', 'count', 'certainty',
  'observationMethod', 'identificationSource', 'merlinVerification', 'birdnetVerification',
  'locationName', 'lat', 'lon', 'placeId', 'pinAccuracyM', 'pinAccuracyExactM', 'autoLocationName',
  'habitat', 'behavior', 'weather', 'notes',
  'existingPhotoIds', 'deletedPhotoIds', 'existingAudioIds', 'deletedAudioIds',
]);

export const draftKey = (mode, editId) => (mode === 'edit' ? `edit:${editId}` : 'new');

function readAll() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

/** Alleen de gegevensvelden, als platte kopie (geen File/Blob/objectURL). */
export function draftFields(state) {
  const out = {};
  for (const key of DRAFT_FIELDS) {
    const value = state?.[key];
    out[key] = Array.isArray(value) ? [...value] : (value === undefined ? null : value);
  }
  return out;
}

export function sameFields(a, b) {
  return JSON.stringify(draftFields(a)) === JSON.stringify(draftFields(b));
}

export function loadDraft(key) {
  const draft = readAll()[key];
  if (!draft || typeof draft !== 'object' || !draft.fields || typeof draft.fields !== 'object') return null;
  return draft;
}

/** @returns {boolean} false als de opslag het concept weigert (vol of geblokkeerd). */
export function saveDraft(key, { fields, baseUpdatedAt = null, pendingPhotos = 0, pendingAudio = 0 }) {
  const all = readAll();
  all[key] = { key, savedAt: new Date().toISOString(), baseUpdatedAt, fields: draftFields(fields), pendingPhotos, pendingAudio };
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(all));
    return true;
  } catch (_) {
    return false;
  }
}

export function deleteDraft(key) {
  const all = readAll();
  if (!(key in all)) return;
  delete all[key];
  try {
    if (Object.keys(all).length) localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(all));
    else localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (_) { /* opruimen mislukt: het concept blijft hervatbaar, er gaat niets verloren */ }
}

/** Een bewerkconcept geldt alleen voor exact de versie van de waarneming waarop het is gemaakt. */
export function draftIsStale(draft, sighting) {
  return Boolean(draft && sighting && draft.baseUpdatedAt !== (sighting.updatedAt || null));
}
