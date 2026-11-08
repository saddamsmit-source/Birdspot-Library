/**
 * IndexedDB wrapper — Birdspot Library
 * Beheert de database-verbinding en schema-migraties.
 *
 * Stores:
 *   photos     { id, blob (Blob), type, filename, speciesId, sightingId, placeId?, addedAt }
 *              (K4: placeId = media bij een plek: foto, video of geluidsopname)
 *   (sightings zitten in localStorage via sightings.js)
 */

const DB_NAME    = 'birdspot-library';
const DB_VERSION = 1;

let _db = null;

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
    };

    req.onsuccess = event => {
      _db = event.target.result;
      resolve(_db);
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
    req.onsuccess = () => resolve((req.result || []).filter(p => p.placeId === placeId));
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
