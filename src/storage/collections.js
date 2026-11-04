/**
 * Birdspot personal collections — app-specific IDs only, independent of UI.
 * Values are string IDs, stored additively without modifying sightings or photos.
 * Every write can fail (QuotaExceededError); callers show feedback.
 */
const KEYS = Object.freeze({
  species: 'birdspot-favorite-species',
  media: 'birdspot-favorite-media',
  film: 'birdspot-film-selection',
});
const VALID_TYPES = Object.keys(KEYS);
function keyFor(kind) {
  if (!Object.prototype.hasOwnProperty.call(KEYS, kind)) {
    throw new TypeError('Onbekende collectie: ' + kind);
  }
  return KEYS[kind];
}
function normalizeIds(value) {
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
  localStorage.setItem(KEYS.film, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent('birdspot:collection-change', {detail:{kind:'film',reordered:true}}));
}
export function toggleCollectionItem(kind, id) {
  return setCollectionItem(kind, id, !hasCollectionItem(kind, id));
}
/** Bestaande IDs worden bij herstel nooit weggegooid. */
export function mergeCollections(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return;
  for (const kind of VALID_TYPES) {
    if (!Array.isArray(snapshot[kind])) continue;
    const merged = new Set([...getCollectionIds(kind), ...normalizeIds(snapshot[kind])]);
    localStorage.setItem(keyFor(kind), JSON.stringify([...merged]));
  }
  window.dispatchEvent(new CustomEvent('birdspot:collection-change', {detail:{kind:'all'}}));
}
export function exportCollections() {
  return Object.fromEntries(VALID_TYPES.map(kind => [kind, [...getCollectionIds(kind)]]));
}
export function restoreCollections(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return;
  for (const kind of VALID_TYPES) {
    if (!Array.isArray(snapshot[kind])) continue;
    localStorage.setItem(keyFor(kind), JSON.stringify(normalizeIds(snapshot[kind])));
  }
  window.dispatchEvent(new CustomEvent('birdspot:collection-change', {detail:{kind:'all'}}));
}
