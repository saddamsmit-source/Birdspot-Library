/**
 * Birdspot — privé-omgevingsfoto's per plek (ronde 2B).
 *
 * Opslag: dezelfde IDB-store 'photos', maar met kind 'place-env' en verplicht placeId.
 *   { id: 'pe_…', kind: 'place-env', placeId, blob (origineel, alleen lokaal), thumb (EXIF-loze JPEG),
 *     type, filename, caption, speciesId: null, sightingId: null, addedAt, updatedAt }
 * Gescheiden van vogelfoto's: niet in de mediabibliotheek, zoekindex, soortkaarten of K4-plekmedia.
 * Geen upload: alles blijft op het toestel; alleen een eigen ZIP-back-up neemt ze mee.
 */
import { getDB, changePhotos, PLACE_ENV_KIND, isPlaceEnvPhoto } from './db.js';
import { withDataLock, isPlaceRemoved } from './dataLock.js';
import { loadPlaces } from './places.js';

/** De plek bestaat niet (meer), bijvoorbeeld na 'Terugzetten' in dit of een ander tabblad. */
export class PlaceGoneError extends Error {
  constructor() { super('Deze plek bestaat niet meer (bijvoorbeeld teruggezet). De foto is niet opgeslagen.'); this.name = 'PlaceGoneError'; }
}

export const ENV_MAX_BYTES = 30 * 1024 * 1024;
export const ENV_CAPTION_MAX = 500;
export const ENV_THUMB_PX = 480;
/** Alleen formaten die de ZIP-back-up verliesvrij kan bewaren (geen HEIC e.d.). */
export const ENV_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

/** Verkleinde kopie via canvas. Canvas-uitvoer bevat geen EXIF (ook geen GPS of toestel). */
export async function makeEnvThumbnail(blob, maxPx = ENV_THUMB_PX) {
  const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  try {
    const scale = Math.min(1, maxPx / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = typeof OffscreenCanvas === 'function' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h });
    canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
    return canvas.convertToBlob
      ? await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.82 })
      : await new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Thumbnail mislukt'))), 'image/jpeg', 0.82));
  } finally {
    bitmap.close?.();
  }
}

const cleanCaption = value => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, ENV_CAPTION_MAX);

/**
 * Voeg omgevingsfoto's toe in één transactie: alles of niets.
 * Ongeldige bestanden worden overgeslagen en gemeld; een opslagfout gooit (er is dan niets gewijzigd).
 */
export async function addEnvPhotos(placeId, files, now = new Date().toISOString()) {
  if (typeof placeId !== 'string' || !placeId) throw new Error('Geen plek gekozen.');
  const records = [];
  const rejected = [];
  for (const file of files || []) {
    try {
      if (!ENV_TYPES.includes(String(file?.type || '').toLowerCase())) throw new Error('Geen ondersteunde foto');
      if (file.size > ENV_MAX_BYTES) throw new Error('Te groot');
      const thumb = await makeEnvThumbnail(file);
      records.push({
        id: 'pe_' + crypto.randomUUID(), kind: PLACE_ENV_KIND, placeId,
        blob: file, thumb, type: file.type, filename: file.name || 'omgevingsfoto',
        caption: '', speciesId: null, sightingId: null, addedAt: now, updatedAt: now,
      });
    } catch (_) {
      rejected.push(file?.name || 'bestand');
    }
  }
  if (records.length) {
    // Definitieve opslag: binnen dezelfde lock als import/Terugzetten de plek opnieuw controleren.
    await withDataLock(async () => {
      // Slot P1: een grafsteen (IDB, strikt consistent) wint altijd van een mogelijk verouderde localStorage.
      if (await isPlaceRemoved(placeId)) throw new PlaceGoneError();
      await putIfPlaceExists(placeId, records);
    });
  }
  return { added: records, rejected };
}

/**
 * Herstel 2B (P1-rest): plekcontrole en opslag in één readwrite-transactie op 'photos'.
 * Pas in de callback van het eerste verzoek is deze transactie aan de beurt; een eerdere
 * Terugzetten-transactie (zelfde store, ook in een ander tabblad) is dan al afgerond.
 * Werkt dus ook zonder Web Locks.
 */
async function putIfPlaceExists(placeId, records) {
  const db = await getDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    let failure = null;
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(failure || tx.error || new Error('Opslaan afgebroken'));
    const turn = store.count();
    turn.onsuccess = () => {
      try {
        if (!loadPlaces().some(place => place.id === placeId)) throw new PlaceGoneError();
        for (const record of records) store.put(record);
      } catch (error) {
        failure = error;
        tx.abort();
      }
    };
  });
}

export async function getEnvPhotos(placeId) {
  const db = await getDB();
  const all = await new Promise((resolve, reject) => {
    const req = db.transaction('photos', 'readonly').objectStore('photos').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
  return all.filter(p => isPlaceEnvPhoto(p) && p.placeId === placeId)
    .sort((a, b) => String(b.addedAt || '').localeCompare(String(a.addedAt || '')) || String(a.id).localeCompare(String(b.id)));
}

/**
 * Pas één record aan binnen één readwrite-transactie (lezen + schrijven samen).
 * Zo kan een gelijktijdige verwijdering een foto nooit laten "terugkomen".
 * Geeft het nieuwe record, of null als de foto (inmiddels) niet bestaat.
 */
async function updateEnvRecord(id, change) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    let result = null;
    tx.oncomplete = () => resolve(result);
    tx.onabort = () => reject(tx.error ?? new Error('Opslaan afgebroken'));
    const req = store.get(id);
    req.onsuccess = () => {
      const rec = req.result;
      if (!isPlaceEnvPhoto(rec)) return;
      try {
        result = { ...rec, updatedAt: new Date().toISOString(), ...change(rec) };
        store.put(result);
      } catch (error) {
        result = null;
        tx.abort();
      }
    };
  });
}

export function updateEnvCaption(id, caption) {
  return updateEnvRecord(id, () => ({ caption: cleanCaption(caption) }));
}

/** Herstelde/oude records zonder thumb: maak hem alsnog, zonder ander veld te raken. */
export async function ensureEnvThumb(rec) {
  if (!isPlaceEnvPhoto(rec) || rec.thumb instanceof Blob) return rec;
  const thumb = await makeEnvThumbnail(rec.blob);
  return (await updateEnvRecord(rec.id, current => ({ thumb, updatedAt: current.updatedAt }))) || rec;
}

export async function deleteEnvPhoto(id) {
  await changePhotos({ remove: [id] });
}
