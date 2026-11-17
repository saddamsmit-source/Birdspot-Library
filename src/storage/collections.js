/**
 * Birdspot personal collections — app-specific IDs only, independent of UI.
 * Values are string IDs, stored additively without modifying sightings or photos.
 * Every write can fail (QuotaExceededError); callers show feedback.
 */
export const COLLECTION_KEYS = Object.freeze({
  species: 'birdspot-favorite-species',
  media: 'birdspot-favorite-media',
  film: 'birdspot-film-selection',
});
const VALID_TYPES = Object.keys(COLLECTION_KEYS);
function keyFor(kind) {
  if (!Object.prototype.hasOwnProperty.call(COLLECTION_KEYS, kind)) {
    throw new TypeError('Onbekende collectie: ' + kind);
  }
  return COLLECTION_KEYS[kind];
}
export function normalizeIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(x => typeof x === 'string' && x.length > 0))];
}
export function getCollectionIds(kind) {
  const key = keyFor(kind);
  try { return new Set(normalizeIds(JSON.parse(localStorage.getItem(key) || '[]'))); }
  catch (_) { return new Set(); }
}
export function hasCollectionItem(kind, id) {
  return getCollectionIds(kind).has(id);
}
export function setCollectionItem(kind, id, selected) {
  if (typeof id !== 'string' || !id.trim()) throw new TypeError('Ongeldige item-ID');
  const ids = getCollectionIds(kind);
  if (selected) ids.add(id); else ids.delete(id);
  localStorage.setItem(keyFor(kind), JSON.stringify([...ids]));
  window.dispatchEvent(new CustomEvent('birdspot:collection-change', {detail:{kind,id,selected}}));
  return selected;
}
/**
 * Reorder the existing film shortlist without adding or silently deleting IDs.
 * This sidecar key is already included in the unified ZIP backup.
 */
export function saveFilmOrder(ids) {
  if (!Array.isArray(ids) || ids.some(x => typeof x !== 'string'))
    throw new TypeError('Filmvolgorde ongeldig');
  const existing = getCollectionIds('film');
  const incoming = new Set(ids);
  if (incoming.size !== ids.length || incoming.size !== existing.size ||
      ids.some(id => !existing.has(id)))
    throw new Error('Filmselectie is gewijzigd; vernieuw de Studio voordat je sorteert');
  localStorage.setItem(COLLECTION_KEYS.film, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent('birdspot:collection-change', {detail:{kind:'film',reordered:true}}));
}
export function toggleCollectionItem(kind, id) {
  return setCollectionItem(kind, id, !hasCollectionItem(kind, id));
}
