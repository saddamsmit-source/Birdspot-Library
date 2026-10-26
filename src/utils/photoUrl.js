/**
 * photoUrl.js — centrale helper voor foto-URL-beheer
 *
 * Alle modules die foto-blobs uit IndexedDB weergeven, gebruiken
 * deze functies zodat er één consistente aanpak is:
 *   - Altijd URL.createObjectURL(photo.blob) voor weergave
 *   - Altijd URL.revokeObjectURL(url) na gebruik / bij opruimen
 *
 * Nooit photo.dataUrl gebruiken — dat veld is altijd null.
 */

/**
 * Geeft een objectURL voor een foto-object.
 * Geeft null terug als het foto-object geen bruikbare blob heeft.
 *
 * @param {object|null} photo  — foto-object uit IndexedDB
 * @returns {string|null}
 */
export function getPhotoUrl(photo) {
  if (!photo) return null;
  if (photo.blob instanceof Blob) {
    return URL.createObjectURL(photo.blob);
  }
  return null;
}

/**
 * Trekt een objectURL in. Veilig om aan te roepen met null.
 *
 * @param {string|null} url
 */
export function revokePhotoUrl(url) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Bouwt een Map van sightingId → eerste objectURL voor een lijst foto's.
 * Geeft ook een cleanup-functie terug die alle URL's intrekt.
 *
 * @param {object[]} photos
 * @returns {{ urlMap: Map<string, string>, cleanup: () => void }}
 */
export function buildSightingThumbMap(photos) {
  const urlMap = new Map();
  const created = [];

  for (const photo of photos) {
    if (!photo.sightingId) continue;
    if (urlMap.has(photo.sightingId)) continue; // alleen de eerste
    const url = getPhotoUrl(photo);
    if (url) {
      urlMap.set(photo.sightingId, url);
      created.push(url);
    }
  }

  return {
    urlMap,
    cleanup: () => created.forEach(revokePhotoUrl),
  };
}

/**
 * Bouwt een Map van speciesId → eerste objectURL voor een lijst foto's.
 *
 * @param {object[]} photos
 * @returns {{ urlMap: Map<string, string>, cleanup: () => void }}
 */
export function buildSpeciesThumbMap(photos) {
  const urlMap = new Map();
  const created = [];

  for (const photo of photos) {
    if (!photo.speciesId) continue;
    if (urlMap.has(photo.speciesId)) continue;
    const url = getPhotoUrl(photo);
    if (url) {
      urlMap.set(photo.speciesId, url);
      created.push(url);
    }
  }

  return {
    urlMap,
    cleanup: () => created.forEach(revokePhotoUrl),
  };
}
