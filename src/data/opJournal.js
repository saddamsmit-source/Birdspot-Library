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
import { getDB, isPlaceEnvPhoto, isSightingAudio } from './db.js';
import { withDataLock } from './dataLock.js';
import { OP_PENDING_KEY } from './recoveryGate.js';

export { OP_PENDING_KEY };
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

/**
 * Driewegsamenvoeging (correctieronde 2B, P1) voor een sleutel die intussen door een ander tabblad
 * of een oudere versie is gewijzigd. 'from' is de stand waarop de ander voortbouwde, 'to' de stand
 * die deze bewerking moet opleveren. Wat de ander veranderde blijft; wat deze bewerking
 * veranderde wordt (terug)gezet. Waarnemingen per ID, lijsten als verzameling.
 * Geeft null als de waarde niet te ontleden is (dan blijft het journaal staan).
 */
function parse(raw) {
  if (raw === null || raw === undefined) return { kind: 'empty' };
  try {
    const value = JSON.parse(raw);
    if (Array.isArray(value)) return { kind: 'ids', value };
    if (value && typeof value === 'object' && Array.isArray(value.sightings)) return { kind: 'sightings', value };
  } catch (_) { /* onleesbaar */ }
  return null;
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const list = value => Array.isArray(value) ? value : [];
const MEDIA_LINKS = ['photoIds', 'audioIds'];

function rebaseSighting(from, to, current) {
  const row = { ...current };
  if (!to) return row;
  if (row.placeId === from?.placeId) {
    if (Object.hasOwn(to, 'placeId')) row.placeId = to.placeId;
    else delete row.placeId;
  }
  for (const field of MEDIA_LINKS) {
    if (same(row[field], from?.[field])) {
      if (Object.hasOwn(to, field)) row[field] = to[field];
      else delete row[field];
      continue;
    }
    // Pas de toegevoegde/verwijderde koppelingen van de andere schrijver toe op de doelstand.
    const previous = new Set(list(from?.[field]));
    const currentIds = new Set(list(row[field]));
    row[field] = [...new Set([
      ...list(to[field]).filter(id => !previous.has(id) || currentIds.has(id)),
      ...[...currentIds].filter(id => !previous.has(id)),
    ])];
  }
  return row;
}

async function verifyRebasedLinks(db, rebased) {
  if (!rebased.length) return;
  const tx = db.transaction(['photos', 'places', 'placeTombstones'], 'readonly');
  const photos = tx.objectStore('photos');
  const places = tx.objectStore('places');
  const tombstones = tx.objectStore('placeTombstones');
  await Promise.all([done(tx), ...rebased.map(async ({ row, target }) => {
    const media = MEDIA_LINKS.map(async field => {
      if (!Array.isArray(row[field])) return;
      const known = new Set(list(target?.[field]));
      const valid = await Promise.all(row[field].map(async id => {
        if (known.has(id)) return true;
        if (typeof id !== 'string' || !id) return false;
        const record = await req(photos.get(id));
        if (!(record?.blob instanceof Blob)) return false;
        if (field === 'audioIds') return isSightingAudio(record) && record.sightingId === row.id;
        return !isSightingAudio(record) && !isPlaceEnvPhoto(record) &&
          (!record.sightingId || record.sightingId === row.id);
      }));
      row[field] = row[field].filter((_, i) => valid[i]);
    });
    const place = row.placeId;
    if (typeof place === 'string' && place && place !== target?.placeId) {
      const [stored, removed] = await Promise.all([req(places.getKey(place)), req(tombstones.getKey(place))]);
      if (!stored || removed) delete row.placeId;  // eigen coördinaten blijven behouden
    }
    await Promise.all(media);
  })]);
}

async function rebase(fromRaw, toRaw, currentRaw, db) {
  const from = parse(fromRaw), to = parse(toRaw), cur = parse(currentRaw);
  if (!from || !to || !cur) return null;
  const kind = [from, to, cur].find(x => x.kind !== 'empty')?.kind;
  if (!kind) return null;
  if ([from, to, cur].some(x => x.kind !== 'empty' && x.kind !== kind)) return null;
  if (kind === 'ids') {
    const list = x => (x.kind === 'empty' ? [] : x.value);
    const f = new Set(list(from)), t = new Set(list(to));
    const added = list(to).filter(id => !f.has(id));
    const removed = new Set(list(from).filter(id => !t.has(id)));
    const out = list(cur).filter(id => !removed.has(id));
    for (const id of added) if (!out.includes(id)) out.push(id);
    return JSON.stringify(out);
  }
  const rows = x => (x.kind === 'empty' ? [] : x.value.sightings);
  const byId = x => new Map(rows(x).map(row => [row?.id, row]));
  const f = byId(from), t = byId(to);
  const out = [];
  const rebased = [];
  const seen = new Set();
  for (const current of rows(cur)) {
    const id = current?.id;
    seen.add(id);
    const target = t.get(id);
    if (same(current, f.get(id))) { if (t.has(id)) out.push(target); continue; }
    const row = rebaseSighting(f.get(id), target, current);
    out.push(row);
    rebased.push({ row, target });
  }
  for (const [id, row] of t) {
    if (seen.has(id)) continue;
    // Niet (meer) in de huidige stand: alleen toevoegen als de ander hem niet zelf verwijderde.
    if (!f.has(id) || !same(row, f.get(id))) out.push(row);
  }
  // Een oudere schrijver kan iets hebben bewerkt op de voorlopige stand. Bewaar die invoer,
  // maar koppel alleen media en plekken die de feitelijk vastgelegde transactie heeft overleefd.
  await verifyRebasedLinks(db, rebased);
  const base = cur.kind === 'sightings' ? cur.value : (to.kind === 'sightings' ? to.value : from.value);
  return JSON.stringify({ ...base, sightings: out });
}

async function writeRebased(key, from, to, current, db) {
  const merged = await rebase(from, to, current, db);
  if (merged === null || localStorage.getItem(key) !== current) throw new Error('Herstel: ' + key + ' niet samen te voegen');
  if (merged !== current) writeLS(key, merged);
}

async function settle(record, db) {
  for (const [key, entry] of Object.entries(record.keys || {})) {
    const current = localStorage.getItem(key);
    const before = entry.before ?? null;
    if (record.state === 'committed') {
      const after = entry.after ?? null;
      if (current === after) continue;
      if (current === before) { writeLS(key, after); continue; }   // vastgelegd, localStorage nog oud
      if (key.endsWith('safety-copy')) continue;                    // nieuwere veiligheidskopie blijft
      await writeRebased(key, before, after, current, db);          // ander tabblad bouwde op vóór
    } else {
      if ('after' in entry) {
        const after = entry.after ?? null;
        if (current === before) continue;
        if (current === after) { writeLS(key, before); continue; }  // niet vastgelegd → terug
        // Een ander tabblad (of oudere versie) bouwde voort op de HALVE stand: zijn wijziging
        // behouden, die van deze niet-vastgelegde bewerking terugdraaien.
        await writeRebased(key, after, before, current, db);
      } else if (entry.tag && tagOf(current) === entry.tag && current !== before) {
        writeLS(key, before);
      }
    }
  }
}

/**
 * Normale schrijfroutes voor journaalgegevens (waarnemingen): onder de datalock, en pas lezen en
 * wijzigen nadat een openstaand journaal is afgehandeld. Een lopende import of Terugzetten in een
 * ander tabblad laat deze schrijver dus wachten; na een weggevallen tabblad rondt hij eerst af.
 */
export function withDataWrite(change) {
  return withDataLock(async () => {
    await recoverOperations();
    return change();
  });
}

/** Bij het starten, onder de datalock. Geeft het aantal afgehandelde bewerkingen. */
export async function recoverOperations() {
  const db = await getDB();
  const records = await req(db.transaction(STORE).objectStore(STORE).getAll());
  records.sort((a, b) => String(a.at).localeCompare(String(b.at)));
  for (const record of records) {
    // Lukt afhandelen niet (opslag vol, onleesbare waarde), dan gooit settle: record en markering
    // blijven staan, schrijvers blijven geblokkeerd en de volgende poging kan het opnieuw doen.
    await settle(record, db);
    await finishOperation(record.id);
  }
  try { localStorage.removeItem(OP_PENDING_KEY); } catch (_) {}
  return records.length;
}
