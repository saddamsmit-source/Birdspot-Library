/**
 * Birdspot — coördinatie van plek-/mediarelaties (herstel 2B; slot P1, 18-11-2026).
 *
 * Regels:
 *  1. Met Web Locks: één exclusieve lock (ook over tabbladen) voor ZIP-import, 'Terugzetten' en de
 *     definitieve opslag van omgevingsfoto's.
 *  2. Plekken staan in localStorage, en localStorage wordt tussen tabbladprocessen asynchroon
 *     bijgewerkt. Een (mogelijk verouderde) localStorage-stand mag daarom nooit alleen toestemming
 *     geven om een omgevingsfoto op te slaan. 'Terugzetten' schrijft binnen de lock, vóór de wijziging,
 *     een grafsteen per verdwijnende plek in een aparte IndexedDB-database; IndexedDB is wél strikt
 *     consistent tussen tabbladen. Opslaan weigert bij een grafsteen of als de controle mislukt.
 *  3. Zonder Web Locks is tussen tabbladen geen veilige volgorde te garanderen. Dan stopt alleen
 *     'Terugzetten' vóór de eerste wijziging (RestoreUnsupportedError). Import en opslaan blijven werken.
 *     Er bestaat geen timeout- of berichtenpad dat toestemming geeft.
 */
export const DATA_LOCK = 'birdspot-data-write';

export function hasWebLocks() {
  return !!globalThis.navigator?.locks?.request;
}

export function withDataLock(operation) {
  if (hasWebLocks()) return navigator.locks.request(DATA_LOCK, { mode: 'exclusive' }, operation);
  return operation();
}

/**
 * Aanwezigheid (herstel 2B, import met oude tabbladstand): elk open tabblad houdt een gedeelde lock
 * zolang het bestaat. navigator.locks.query() ziet die over alle tabbladen van deze origin. Alleen als
 * dit tabblad de enige houder is, kan geen ander tabblad plekken schrijven en is de eigen
 * localStorage-stand de actuele. Een lock of opnieuw lezen alleen is geen bewijs.
 */
const PRESENCE_LOCK = 'birdspot-tab-presence';
let presenceHeld = false;
let presenceReady = null;
export function holdTabPresence() {
  if (!hasWebLocks()) return Promise.resolve(false);
  presenceReady ??= new Promise(resolve => {
    navigator.locks.request(PRESENCE_LOCK, { mode: 'shared' }, () => {
      presenceHeld = true;
      resolve(true);
      return new Promise(() => {}); // vasthouden tot het tabblad sluit
    }).catch(() => { presenceHeld = false; presenceReady = null; resolve(false); });
  });
  return presenceReady;
}

export class ImportUnsafeError extends Error {
  constructor(message) { super(message); this.name = 'ImportUnsafeError'; }
}

/**
 * Importeren schrijft de volledige plekkenlijst. Dat mag alleen met een aantoonbaar actuele stand:
 * Web Locks aanwezig, dit tabblad aangemeld en geen enkel ander Birdspot-tabblad of -venster open.
 * Anders stopt de import vóór de eerste wijziging.
 */
export async function assertImportSafe() {
  if (!hasWebLocks()) {
    throw new ImportUnsafeError('Importeren kan in deze browser niet veilig (Web Locks ontbreken): ' +
      'de plekken uit een ander tabblad kunnen worden overschreven. Er is niets gewijzigd.');
  }
  await Promise.race([holdTabPresence(), new Promise(resolve => setTimeout(resolve, 1000))]);
  let holders = 0;
  try {
    const { held = [] } = await navigator.locks.query();
    holders = held.filter(lock => lock.name === PRESENCE_LOCK).length;
  } catch (_) {
    holders = Infinity;
  }
  if (!presenceHeld || holders !== 1) {
    throw new ImportUnsafeError('Sluit eerst andere Birdspot-tabbladen of -vensters en probeer het opnieuw. ' +
      'Importeren terwijl Birdspot elders open is, kan plekken van dat tabblad overschrijven. Er is niets gewijzigd.');
  }
}

export class RestoreUnsupportedError extends Error {
  constructor() {
    super('Terugzetten wordt in deze browser niet veilig ondersteund (Web Locks ontbreken). ' +
      'Er is niets gewijzigd: je plekken, foto\'s en veiligheidskopie blijven bewaard.');
    this.name = 'RestoreUnsupportedError';
  }
}

/** Zonder Web Locks stopt Terugzetten vóór de eerste wijziging. */
export function assertRestoreSupported() {
  if (!hasWebLocks()) throw new RestoreUnsupportedError();
}

// Grafstenen staan sinds de 2B-afronding in de hoofd-DB (store 'placeTombstones'), zodat ze in
// dezelfde transactie als plekken en foto's worden gelezen en geschreven.
async function tombTx(mode, work) {
  const { getDB } = await import('./db.js');
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('placeTombstones', mode);
    const box = {};
    tx.oncomplete = () => resolve(box.value);
    tx.onabort = tx.onerror = () => reject(tx.error ?? new Error('Plekbewaking mislukt'));
    work(tx.objectStore('placeTombstones'), box);
  });
}

/** Grafstenen zetten; geeft alleen de nieuw aangemaakte ID's terug. */
export async function markPlacesRemoved(ids, at = new Date().toISOString()) {
  if (!ids.length) return [];
  return tombTx('readwrite', (store, box) => {
    box.value = [];
    for (const id of ids) {
      const r = store.get(id);
      r.onsuccess = () => { if (!r.result) { store.put({ id, removedAt: at }); box.value.push(id); } };
    }
  });
}

export function clearPlaceTombstones(ids) {
  if (!ids.length) return Promise.resolve();
  return tombTx('readwrite', store => { for (const id of ids) store.delete(id); });
}

export async function listTombstones() {
  const ids = await tombTx('readonly', (store, box) => {
    const r = store.getAllKeys();
    r.onsuccess = () => { box.value = r.result || []; };
  });
  return new Set(ids || []);
}

export async function isPlaceRemoved(id) {
  return (await listTombstones()).has(id);
}
