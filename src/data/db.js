/**
 * IndexedDB wrapper — Birdspot Library
 * Beheert de database-verbinding en schema-migraties.
 *
 * Stores:
 *   photos     { id, blob (Blob), type, filename, speciesId, sightingId, placeId?, addedAt }
 *              (K4: placeId = media bij een plek: foto, video of geluidsopname)
 *              Ronde 2B: kind 'place-env' = privé-omgevingsfoto bij een plek, met caption en
 *              EXIF-loze thumb (Blob). Gescheiden van vogelfoto's en van de K4-plekmedia.
 *   (sightings zitten in localStorage via sightings.js)
 */

const DB_NAME    = 'birdspot-library';
// v2 (ronde 2B-afronding): stores 'places' en 'placeTombstones'; IndexedDB is leidend voor plekken.
const DB_VERSION = 2;
const LEGACY_PLACES_KEY = 'birdspot-places';

let _db = null;

/** Persoonlijke gidsbeelden delen de back-upopslag met waarnemingsmedia. */
export function isPersonalGuidePhoto(photo) {
  return !photo.sightingId && !photo.placeId &&
    typeof photo.speciesId === 'string' && String(photo.id).startsWith(`guide-${photo.speciesId}-`);
}

/** Ronde 2B: privé-omgevingsfoto van een plek (nooit een vogelfoto). */
export const PLACE_ENV_KIND = 'place-env';
export function isPlaceEnvPhoto(photo) {
  return photo?.kind === PLACE_ENV_KIND;
}

export function getDB() {
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = event => {
      const db = event.target.result;

      // photos store
      if (!db.objectStoreNames.contains('photos')) {
        const photos = db.createObjectStore('photos', { keyPath: 'id' });
        photos.createIndex('by_species',  'speciesId',  { unique: false });
        photos.createIndex('by_sighting', 'sightingId', { unique: false });
      }
      // v2: plekken en grafstenen. Migratie uit localStorage binnen de (atomaire) upgrade-transactie:
      // mislukt of onderbreekt die, dan blijft de database v1 en herhaalt de volgende start alles.
      if (!db.objectStoreNames.contains('placeTombstones')) db.createObjectStore('placeTombstones', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('places')) {
        const store = db.createObjectStore('places', { keyPath: 'id' });
        let legacy = [];
        try { legacy = JSON.parse(localStorage.getItem(LEGACY_PLACES_KEY) || 'null')?.places || []; } catch (_) { legacy = []; }
        const seen = new Set();
        for (const place of Array.isArray(legacy) ? legacy : []) {
          if (!place || typeof place.id !== 'string' || !place.id || seen.has(place.id)) continue;
          seen.add(place.id);
          store.put(place);
        }
      }
    };

    // Een oudere versie in een ander tabblad houdt v1 open: melden, en wachten tot die sluit.
    req.onblocked = () => {
      try { window.dispatchEvent(new CustomEvent('birdspot-db-blocked')); } catch (_) {}
    };

    req.onsuccess = event => {
      const db = event.target.result;
      // Een nieuwere versie wil upgraden: deze verbinding vrijgeven.
      db.onversionchange = () => { try { db.close(); } catch (_) {} if (_db === db) _db = null; };
      _db = db;
      resolve(db);
    };

    req.onerror = event => {
      console.error('[db] open error', event.target.error);
      reject(event.target.error);
    };
  });
}

/** Pas één partij mediabestanden in één IndexedDB-transactie toe. */
export async function changePhotos({ put = [], remove = [] }) {
  if (!put.length && !remove.length) return;
  const db = await getDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    tx.oncomplete = resolve;
    tx.onabort = () => reject(tx.error ?? new Error('Mediaopslag afgebroken'));
    const store = tx.objectStore('photos');
    try {
      for (const photo of put) store.put(photo);
      for (const id of remove) store.delete(id);
    } catch (error) {
      tx.abort();
      reject(error);
    }
  });
}

/** Sla een foto op. id moet een stabiele string zijn (nanoid of UUID). */
export async function savePhoto(photo) {
  await changePhotos({ put: [photo] });
  return photo.id;
}

/** Haal één foto op by id. */
export async function getPhoto(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction('photos', 'readonly');
    const req = tx.objectStore('photos').get(id);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror   = () => reject(req.error);
  });
}

/** Haal alle foto's op voor één soort. */
export async function getPhotosBySpecies(speciesId) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('photos', 'readonly');
    const idx   = tx.objectStore('photos').index('by_species');
    const req   = idx.getAll(speciesId);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

/** Haal alle foto's op voor één waarneming. */
export async function getPhotosBySighting(sightingId) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('photos', 'readonly');
    const idx   = tx.objectStore('photos').index('by_sighting');
    const req   = idx.getAll(sightingId);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

/** K4: alle media (foto, video, geluid) die aan een plek hangen. */
export async function getMediaByPlace(placeId) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('photos', 'readonly').objectStore('photos').getAll();
    req.onsuccess = () => resolve((req.result || []).filter(p => p.placeId === placeId && !isPlaceEnvPhoto(p)));
    req.onerror   = () => reject(req.error);
  });
}

/** Verwijder één foto. */
export async function deletePhoto(id) {
  await changePhotos({ remove: [id] });
}

/** Zoekindex met bestandsgegevens, zonder mediabestanden te bewaren of te openen. */
export async function getMediaMetadata() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const results = [];
    const request = db.transaction('photos', 'readonly').objectStore('photos').openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve(results);
        return;
      }
      if (isPersonalGuidePhoto(cursor.value) || isPlaceEnvPhoto(cursor.value)) {
        cursor.continue();
        return;
      }
      const { id, filename, speciesId, sightingId, placeId, addedAt, blob, type } = cursor.value;
      const mime = blob?.type || type || '';
      if (blob instanceof Blob && /^(image|video|audio)\//.test(mime)) {
        results.push({ id, filename, speciesId, sightingId, placeId, addedAt, type: mime });
      }
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
  });
}
