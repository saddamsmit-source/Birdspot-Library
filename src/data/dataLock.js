/**
 * Birdspot — één exclusieve schrijflock voor plek-/mediarelaties (herstel 2B, QA P1).
 * Web Locks werken over tabbladen van dezelfde origin. ZIP-import, 'Terugzetten' en de
 * definitieve opslag van omgevingsfoto's draaien hierbinnen, zodat een foto nooit wordt
 * opgeslagen bij een plek die tegelijk verdwijnt. Zonder Web Locks: alleen binnen dit tabblad.
 */
export const DATA_LOCK = 'birdspot-data-write';

export function withDataLock(operation) {
  if (globalThis.navigator?.locks?.request) return navigator.locks.request(DATA_LOCK, { mode: 'exclusive' }, operation);
  return operation();
}
