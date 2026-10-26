/**
 * IndexedDB wrapper — Birdspot Library
 * Beheert de database-verbinding en schema-migraties.
 *
 * Stores:
 *   photos     { id, blob (Blob), type, filename, speciesId, sightingId, addedAt }
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

/** Sla een foto op. id moet een stabiele string zijn (nanoid of UUID). */
export async function savePhoto(photo) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction('photos', 'readwrite');
    const req = tx.objectStore('photos').put(photo);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
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

/** Verwijder één foto. */
export async function deletePhoto(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction('photos', 'readwrite');
    const req = tx.objectStore('photos').delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}
