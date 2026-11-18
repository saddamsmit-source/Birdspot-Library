/**
 * Opslagjournaal — Birdspot (herstelronde 2B, P1).
 *
 * ZIP-import en Terugzetten wijzigen localStorage (waarnemingen, lijsten, veiligheidskopie) én
 * IndexedDB (plekken, grafstenen, foto's). localStorage valt buiten de IndexedDB-transactie: valt
 * het tabblad weg tussen die twee, dan kan geen afbreekhandler meer terugschrijven. Daarom:
 *
 *  1. prepareOperation(): vóór de eerste wijziging een record 'prepared' met per sleutel de oude
 *     en nieuwe waarde (eigen, vastgelegde transactie) + een kleine markering in localStorage.
 *  2. De hoofdtransactie schrijft localStorage en IndexedDB en zet het record op 'committed'
 *     (markCommitted, in DIE transactie). Het record wordt dus alleen 'committed' als alles staat.
 *  3. finishOperation(): record en markering weg.
 *
 * recoverOperations() bij het starten (onder de datalock, dus nooit tijdens een lopende bewerking
 * in een ander tabblad): 'prepared' → terugrollen, 'committed' → doorrollen. Per sleutel alleen als
 * de huidige waarde nog aantoonbaar van deze bewerking is (compare-and-set); een nieuwere waarde
 * van een ander tabblad blijft staan. Herhaalbaar: een tweede keer verandert niets.
 */
import { getDB } from './db.js';

export const OP_PENDING_KEY = 'birdspot-op-pending';
const STORE = 'opJournal';

function req(request) {
  return new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
}
function done(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error || new Error('Journaal opslaan afgebroken'));
  });
}
function writeLS(key, value) {
  if (value === null || value === undefined) localStorage.removeItem(key);
  else localStorage.setItem(key, value);
}
function tagOf(raw) {
  try { return JSON.parse(raw)?.opId ?? null; } catch (_) { return null; }
}

/**
 * keys: { sleutel: { before, after } } of { before, tag } als de nieuwe waarde pas binnen de
 * hoofdtransactie bekend wordt (veiligheidskopie): die draagt dan opId === tag.
 */
export async function prepareOperation(op, keysFor) {
  // Altijd onder de datalock aangeroepen: een record dat er nu nog staat, hoort bij een eerdere,
  // weggevallen of niet opgeruimde bewerking. Eerst afhandelen, zodat een oud record nooit later
  // over deze (nieuwere) bewerking heen rolt.
  await recoverOperations();
  const id = `op_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const keys = typeof keysFor === 'function' ? keysFor(id) : keysFor;
  const db = await getDB();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).put({ id, op, state: 'prepared', keys, at: new Date().toISOString() });
  await done(tx);
  try { localStorage.setItem(OP_PENDING_KEY, id); } catch (_) { /* markering is alleen een versneller */ }
  return id;
}

/** Binnen de hoofdtransactie: alles vastgelegd → bij wegvallen doorrollen. */
export function markCommitted(tx, id, op, keys) {
  tx.objectStore(STORE).put({ id, op, state: 'committed', keys, at: new Date().toISOString() });
}

/** Binnen de hoofdtransactie: bewerking blijkt niets in localStorage te wijzigen. */
export function dropInTx(tx, id) {
  tx.objectStore(STORE).delete(id);
}

export async function finishOperation(id) {
  const db = await getDB();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).delete(id);
  await done(tx);
  try { if (localStorage.getItem(OP_PENDING_KEY) === id) localStorage.removeItem(OP_PENDING_KEY); } catch (_) {}
}

export function hasPendingMarker() {
  try { return localStorage.getItem(OP_PENDING_KEY) !== null; } catch (_) { return false; }
}

function settle(record) {
  for (const [key, entry] of Object.entries(record.keys || {})) {
    const current = localStorage.getItem(key);
    const before = entry.before ?? null;
    if (record.state === 'committed') {
      const after = entry.after ?? null;
      if (current === after) continue;
      if (current === before) writeLS(key, after);        // vastgelegd, maar localStorage nog oud
      // anders: intussen door een ander tabblad gewijzigd → nieuwere waarde laten staan
    } else {
      const ours = 'after' in entry ? current === (entry.after ?? null) : (entry.tag && tagOf(current) === entry.tag);
      if (ours && current !== before) writeLS(key, before); // niet vastgelegd → terug naar vóór
    }
  }
}

/** Bij het starten, onder de datalock. Geeft het aantal afgehandelde bewerkingen. */
export async function recoverOperations() {
  const db = await getDB();
  const records = await req(db.transaction(STORE).objectStore(STORE).getAll());
  records.sort((a, b) => String(a.at).localeCompare(String(b.at)));
  for (const record of records) {
    settle(record);
    await finishOperation(record.id);
  }
  try { localStorage.removeItem(OP_PENDING_KEY); } catch (_) {}
  return records.length;
}
