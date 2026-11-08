/**
 * Back-up & herstel — Birdspot Library
 *
 * Exporteert: ZIP met gegevens.json (localStorage) + alle IDB-foto's.
 * Importeert: validatie → bevestiging (caller) → veiligheidskopie → samenvoegen → herladen.
 *
 * Regels per Handbook §3.5:
 *   - Eén "Alles bewaren": alle opslagsoorten in één actie
 *   - Eén "Herstellen": samenvoegen op ID, recentere wijzigingen winnen
 *   - Positieve status (certainty) gaat NOOIT terug
 *   - Geen dubbelen op basis van id
 *   - Veiligheidskopie vóór herstellen
 *   - "Terugzetten" naar de stand vóór de laatste import
 *   - Ongeldig bestand verandert niets
 *   - Format: ZIP met datum in de naam (birdspot-YYYY-MM-DD.zip)
 */

import { STORAGE_KEY, SCHEMA_VERSION, migrateSighting } from '../data/sightings.js';
import { SEEN_KEY } from '../data/species.js';
import { getDB }                            from '../data/db.js';
import { COLLECTION_KEYS, normalizeIds } from './collections.js';
import { PLACES_KEY, PLACES_SCHEMA } from '../data/places.js';

// ── ZIP-helpers (geen CDN-dependency; pure JS) ─────────────────────────────

/**
 * Minimale ZIP-builder in pure JS.
 * Birdspot gebruikt stored (method 0).
 */
async function buildZip(files) {
  // files: Array<{ name: string, data: Uint8Array }>
  const encoder = new TextEncoder();
  const parts   = [];
  const central = [];
  let offset    = 0;

  for (const { name, data } of files) {
    const nameBytes = encoder.encode(name);
    const crc       = crc32(data);
    const local     = localFileHeader(nameBytes, data.length, data.length, crc, 0);
    parts.push(local, data);
    central.push(centralDirEntry(nameBytes, data.length, data.length, crc, offset, 0));
    offset += local.length + data.length;
  }

  const centralBuf = concat(central);
  const eocd       = endOfCentralDir(files.length, centralBuf.length, offset);
  return concat([...parts, centralBuf, eocd]);
}

function localFileHeader(nameBytes, compSize, uncompSize, crc, method) {
  const h = new ArrayBuffer(30 + nameBytes.length);
  const v = new DataView(h);
  v.setUint32(0,  0x04034b50, true); // signature
  v.setUint16(4,  20,         true); // version needed
  v.setUint16(6,  0,          true); // general purpose
  v.setUint16(8,  method,     true); // compression method (0 = store)
  v.setUint16(10, 0,          true); // mod time
  v.setUint16(12, 0,          true); // mod date
  v.setUint32(14, crc,        true); // crc-32
  v.setUint32(18, compSize,   true); // compressed size
  v.setUint32(22, uncompSize, true); // uncompressed size
  v.setUint16(26, nameBytes.length, true);
  v.setUint16(28, 0, true);          // extra field length
  new Uint8Array(h).set(nameBytes, 30);
  return new Uint8Array(h);
}

function centralDirEntry(nameBytes, compSize, uncompSize, crc, offset, method) {
  const h = new ArrayBuffer(46 + nameBytes.length);
  const v = new DataView(h);
  v.setUint32(0,  0x02014b50, true);
  v.setUint16(4,  20, true);
  v.setUint16(6,  20, true);
  v.setUint16(8,  0,  true);
  v.setUint16(10, method, true);
  v.setUint16(12, 0, true);
  v.setUint16(14, 0, true);
  v.setUint32(16, crc,        true);
  v.setUint32(20, compSize,   true);
  v.setUint32(24, uncompSize, true);
  v.setUint16(28, nameBytes.length, true);
  v.setUint16(30, 0, true);
  v.setUint16(32, 0, true);
  v.setUint16(34, 0, true);
  v.setUint16(36, 0, true);
  v.setUint32(38, 0, true);
  v.setUint32(42, offset, true);
  new Uint8Array(h).set(nameBytes, 46);
  return new Uint8Array(h);
}

function endOfCentralDir(count, centralSize, centralOffset) {
  const h = new ArrayBuffer(22);
  const v = new DataView(h);
  v.setUint32(0,  0x06054b50, true);
  v.setUint16(4,  0,           true);
  v.setUint16(6,  0,           true);
  v.setUint16(8,  count,       true);
  v.setUint16(10, count,       true);
  v.setUint32(12, centralSize, true);
  v.setUint32(16, centralOffset, true);
  v.setUint16(20, 0, true);
  return new Uint8Array(h);
}

function concat(arrays) {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out   = new Uint8Array(total);
  let pos = 0;
  for (const a of arrays) { out.set(a, pos); pos += a.length; }
  return out;
}

/** CRC-32 (standaard ZIP) */
function crc32(data) {
  const table = _crcTable();
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    c = (c >>> 8) ^ table[(c ^ data[i]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}
let _crcTableCache = null;
function _crcTable() {
  if (_crcTableCache) return _crcTableCache;
  _crcTableCache = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    _crcTableCache[n] = c;
  }
  return _crcTableCache;
}

// ── Alle IDB-foto's ophalen ────────────────────────────────────────────────

async function getAllPhotos() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('photos', 'readonly').objectStore('photos').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ── Back-upstatus (in localStorage) ───────────────────────────────────────

const STATUS_KEY = 'birdspot-backup-status';

export function getBackupStatus() {
  try {
    const raw = localStorage.getItem(STATUS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function setBackupStatus(info) {
  try {
    localStorage.setItem(STATUS_KEY, JSON.stringify(info));
  } catch (_) { /* quota */ }
}

// ── Veiligheidskopie (pre-restore snapshot) ────────────────────────────────

const SAFETY_KEY = 'birdspot-safety-copy';

const DATA_KEYS = [STORAGE_KEY, PLACES_KEY, SEEN_KEY, ...Object.values(COLLECTION_KEYS)];

function readStorage() {
  return Object.fromEntries([...DATA_KEYS, SAFETY_KEY].map(key => [key, localStorage.getItem(key)]));
}

function readList(raw, property) {
  if (raw === null) return [];
  const data = JSON.parse(raw);
  const list = property ? data?.[property] : data;
  if (!Array.isArray(list)) throw new Error('Bestaande bibliotheekgegevens kunnen niet worden gelezen.');
  return list;
}

function writeStorage(key, value) {
  if (value === null) localStorage.removeItem(key);
  else localStorage.setItem(key, value);
}

function verifyStorage(snapshot) {
  if (Object.entries(snapshot).some(([key, value]) => localStorage.getItem(key) !== value)) {
    throw new Error('De bibliotheek is intussen gewijzigd. Probeer opnieuw.');
  }
}

function applyStorageChanges(before, changes) {
  verifyStorage(before);
  const written = [];
  const rollback = () => {
    for (const [key, value] of written.reverse()) {
      if (localStorage.getItem(key) === value) writeStorage(key, before[key]);
    }
  };
  try {
    for (const [key, value] of changes) {
      if (value === before[key]) continue;
      writeStorage(key, value);
      written.push([key, value]);
    }
  } catch (error) {
    rollback();
    throw error;
  }
  return rollback;
}

// Houd de mediawijzigingen onzichtbaar tot de overige opslag is bijgewerkt.
// Een fout in localStorage breekt de IndexedDB-transactie af.
async function commitRestore(before, changes, media, remove = false) {
  if (!media.length) {
    applyStorageChanges(before, changes);
    return;
  }
  const db = await getDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    let remaining = media.length;
    let storageError;
    let rollback;
    tx.oncomplete = () => resolve();
    tx.onabort = () => {
      try {
        rollback?.();
      } catch (error) {
        reject(new Error('Opslag terugzetten mislukt: ' + error.message));
        return;
      }
      reject(storageError || tx.error || new Error('Media opslaan is afgebroken.'));
    };
    try {
      for (const item of media) {
        const request = remove ? store.delete(item) : store.add(item);
        request.onsuccess = () => {
          if (--remaining) return;
          try {
            rollback = applyStorageChanges(before, changes);
          } catch (error) {
            storageError = error;
            tx.abort();
          }
        };
      }
    } catch (error) {
      storageError = error;
      tx.abort();
    }
  });
}

export function getSafetyCopy() {
  try {
    const raw = localStorage.getItem(SAFETY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function hasSafetyCopy() {
  return !!getSafetyCopy();
}

// Supported original media formats for lossless ZIP roundtrip.
const MEDIA_EXT_MIME = Object.freeze({
  jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',
  gif:'image/gif',svg:'image/svg+xml',mp4:'video/mp4',webm:'video/webm',
  mov:'video/quicktime',m4v:'video/x-m4v',
  // K4: geluidsopnamen bij een plek (o.a. Merlin-WAV)
  wav:'audio/wav',mp3:'audio/mpeg',m4a:'audio/mp4',aac:'audio/aac',oga:'audio/ogg',
});
const MIME_EXT = Object.freeze({
  'image/jpeg':'jpg','image/png':'png','image/webp':'webp',
  'image/gif':'gif','image/svg+xml':'svg','video/mp4':'mp4',
  'video/webm':'webm','video/quicktime':'mov','video/x-m4v':'m4v',
  'audio/wav':'wav','audio/x-wav':'wav','audio/wave':'wav','audio/mpeg':'mp3','audio/mp3':'mp3',
  'audio/mp4':'m4a','audio/x-m4a':'m4a','audio/aac':'aac','audio/ogg':'oga',
});
function zipMediaExtension(photo) {
  const mime=String(photo.type||photo.blob?.type||'').toLowerCase();
  if(MIME_EXT[mime])return MIME_EXT[mime];
  const ext=String(photo.filename||'').split('.').pop().toLowerCase();
  if(MEDIA_EXT_MIME[ext])return ext;
  throw new Error('Back-up kan dit mediaformaat niet bewaren: '+mime);
}

// ── Export / back-up ──────────────────────────────────────────────────────

/**
 * Maakt een ZIP back-up van alle gegevens en download die.
 * Returns { sightingCount, photoCount, filename }
 */
export async function exportBackup() {
  const storage = readStorage();
  const sightings = readList(storage[STORAGE_KEY], 'sightings').map(migrateSighting);
  const photos = await getAllPhotos();
  const photoIds = new Set(photos.filter(photo => photo.blob).map(photo => photo.id));
  if (photos.length !== photoIds.size || sightings.some(s => s.photoIds.some(id => !photoIds.has(id)))) {
    throw new Error('Een of meer mediabestanden ontbreken. Er is geen onvolledige back-up gemaakt.');
  }

  const encoder = new TextEncoder();

  // gegevens.json
  const gegevens = {
    format:        'birdspot-backup',
    schemaVersion: SCHEMA_VERSION,
    exportedAt:    new Date().toISOString(),
    sightings,
    places: readList(storage[PLACES_KEY], 'places'),
    photoIds: photos.map(p => p.id),
    // Metadata per bestand: plek-media (K4) houdt zo zijn plek en exacte type
    mediaMeta: photos.map(p => ({ id: p.id, type: p.type || p.blob?.type || null, filename: p.filename || null,
      speciesId: p.speciesId || null, sightingId: p.sightingId || null, placeId: p.placeId || null })),
    collections: Object.fromEntries(Object.entries(COLLECTION_KEYS).map(([kind, key]) =>
      [kind, normalizeIds(readList(storage[key]))])),
    seenSpecies: normalizeIds(readList(storage[SEEN_KEY])),
  };
  const gegevensBytes = encoder.encode(JSON.stringify(gegevens, null, 2));

  // Alle foto's als individuele bestanden
  const zipFiles = [{ name: 'gegevens.json', data: gegevensBytes }];
  for (const photo of photos) {
    const buf = photo.blob instanceof Blob
      ? new Uint8Array(await photo.blob.arrayBuffer())
      : new Uint8Array(photo.blob);
    const ext  = zipMediaExtension(photo);
    zipFiles.push({ name: `photos/${photo.id}.${ext}`, data: buf });
  }

  const zipBytes = await buildZip(zipFiles);
  verifyStorage(storage);
  const blob     = new Blob([zipBytes], { type: 'application/zip' });

  // Datum in bestandsnaam
  const dateStr  = new Date().toISOString().slice(0, 10);
  const filename = `birdspot-${dateStr}.zip`;

  // Download
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);

  // Status bijwerken
  setBackupStatus({
    lastBackup:    new Date().toISOString(),
    sightingCount: sightings.length,
    photoCount:    photos.length,
    filename,
  });

  return { sightingCount: sightings.length, photoCount: photos.length, filename };
}

// ── Validatie ─────────────────────────────────────────────────────────────

/**
 * Valideert een ZIP-bestand inhoudelijk (controleert gegevens.json).
 * Returns { valid: boolean, sightingCount: number, photoCount: number, error?: string }
 */
export async function validateBackupFile(file) {
  try {
    const { data, files } = await readBackup(file);
    return { valid: true, sightingCount: data.sightings.length, photoCount: files.size };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

async function readBackup(file) {
  if (!file?.name.toLowerCase().endsWith('.zip')) throw new Error('Bestand is geen ZIP-bestand.');
  const entries = readZip(new Uint8Array(await file.arrayBuffer()));
  const metadata = entries.get('gegevens.json');
  if (!metadata) throw new Error('Geen gegevens.json gevonden in het ZIP-bestand.');
  const data = JSON.parse(new TextDecoder().decode(metadata));
  if (data?.format !== 'birdspot-backup' || !Array.isArray(data.sightings)) {
    throw new Error('Ongeldig Birdspot-back-upbestand.');
  }
  const validId = id => typeof id === 'string' && id.trim().length > 0;
  if (data.sightings.some(s => !validId(s?.id) ||
    [s.speciesName, s.locationName, s.date].some(value => value != null && typeof value !== 'string') ||
    (s.photoIds != null && (!Array.isArray(s.photoIds) || !s.photoIds.every(validId))))) {
    throw new Error('De back-up bevat een ongeldige waarneming of mediaverwijzing.');
  }
  if (data.photoIds != null && (!Array.isArray(data.photoIds) || !data.photoIds.every(validId))) {
    throw new Error('De back-up bevat een ongeldige medialijst.');
  }
  const files = new Map();
  for (const [path, bytes] of entries) {
    const match = /^photos\/([^/]+)\.([^.]+)$/.exec(path);
    if (!match || !Object.hasOwn(MEDIA_EXT_MIME, match[2])) continue;
    const [, id, ext] = match;
    if (files.has(id)) throw new Error('De back-up bevat meerdere bestanden met dezelfde media-ID.');
    files.set(id, { bytes, ext });
  }
  return { data, files };
}

function mergeRecord(local, incoming) {
  if (!local) return incoming;
  const localDate = Date.parse(local.updatedAt ?? local.createdAt);
  const incomingDate = Date.parse(incoming.updatedAt ?? incoming.createdAt);
  return incomingDate > localDate ? { ...local, ...incoming } : local;
}

let restoring = false;
async function runRestore(operation) {
  if (restoring) throw new Error('Er wordt al een back-up hersteld.');
  restoring = true;
  try {
    if (navigator.locks) return await navigator.locks.request(SAFETY_KEY, operation);
    return await operation();
  } finally {
    restoring = false;
  }
}

export function importBackup(file) {
  return runRestore(async () => {
    const { data, files } = await readBackup(file);
    const before = readStorage();
    const current = readList(before[STORAGE_KEY], 'sightings');
    const byId = new Map(current.map(s => [s.id, s]));
    const certaintyRank = { certain: 2, probable: 1, possible: 0 };
    const skippedAttachments = new Set();
    for (const incoming of data.sightings) {
      const local = byId.get(incoming.id);
      const merged = mergeRecord(local, incoming);
      if (merged === local) {
        for (const id of incoming.photoIds || []) skippedAttachments.add(id);
      }
      const certainty = (certaintyRank[local?.certainty] ?? -1) > (certaintyRank[incoming.certainty] ?? -1)
        ? local.certainty : incoming.certainty;
      byId.set(incoming.id, merged === local
        ? (certainty === local.certainty ? local : { ...local, certainty })
        : migrateSighting({ ...merged, certainty }));
    }

    const sightings = [...byId.values()];
    const photoOwners = new Map(sightings.flatMap(s => s.photoIds?.map(id => [id, s]) || []));
    const existingPhotos = new Set((await getAllPhotos()).map(p => p.id));
    const metadata = new Map((Array.isArray(data.mediaMeta) ? data.mediaMeta : []).filter(Boolean).map(m => [m.id, m]));
    const mediaIds = new Set([...(data.photoIds || files.keys()), ...data.sightings.flatMap(s => s.photoIds || [])]);
    const newPhotos = [];
    for (const id of mediaIds) {
      if (existingPhotos.has(id) || (skippedAttachments.has(id) && !photoOwners.has(id))) continue;
      const file = files.get(id);
      if (!file) throw new Error('Mediabestand ontbreekt in de back-up: ' + id);
      const meta = metadata.get(id);
      const owner = photoOwners.get(id);
      const type = meta?.type || MEDIA_EXT_MIME[file.ext];
      newPhotos.push({
        id, blob: new Blob([file.bytes], { type }), type,
        filename: meta?.filename || id + '.' + file.ext,
        speciesId: owner?.speciesId ?? meta?.speciesId ?? null,
        sightingId: owner?.id ?? meta?.sightingId ?? null,
        placeId: meta?.placeId ?? null,
        addedAt: new Date().toISOString(),
      });
    }

    const dataChanges = new Map();
    if (JSON.stringify(sightings) !== JSON.stringify(current)) {
      dataChanges.set(STORAGE_KEY, JSON.stringify({
        ...JSON.parse(before[STORAGE_KEY]),
        schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), sightings,
      }));
    }
    if (Array.isArray(data.places) && data.places.length) {
      const currentPlaces = readList(before[PLACES_KEY], 'places');
      const places = new Map(currentPlaces.map(place => [place.id, place]));
      for (const place of data.places) {
        if (place && typeof place.id === 'string' && place.id.trim() && place.lat != null && place.lon != null
          && Number.isFinite(Number(place.lat)) && Math.abs(place.lat) <= 90
          && Number.isFinite(Number(place.lon)) && Math.abs(place.lon) <= 180) {
          places.set(place.id, mergeRecord(places.get(place.id), place));
        }
      }
      if (JSON.stringify([...places.values()]) !== JSON.stringify(currentPlaces)) {
        dataChanges.set(PLACES_KEY, JSON.stringify({
          ...JSON.parse(before[PLACES_KEY]), schemaVersion: PLACES_SCHEMA, places: [...places.values()],
        }));
      }
    }
    for (const [kind, key] of Object.entries(COLLECTION_KEYS)) {
      if (Array.isArray(data.collections?.[kind])) {
        const local = readList(before[key]);
        const merged = normalizeIds([...local, ...data.collections[kind]]);
        if (JSON.stringify(merged) !== JSON.stringify(local)) dataChanges.set(key, JSON.stringify(merged));
      }
    }
    if (Array.isArray(data.seenSpecies)) {
      const local = readList(before[SEEN_KEY]);
      const merged = normalizeIds([...local, ...data.seenSpecies]);
      if (JSON.stringify(merged) !== JSON.stringify(local)) dataChanges.set(SEEN_KEY, JSON.stringify(merged));
    }

    // Laat een eerdere veiligheidskopie intact bij een herhaalde, ongewijzigde import.
    if (!dataChanges.size && !newPhotos.length) {
      return { imported: data.sightings.length, merged: sightings.length };
    }

    const safety = {
      storage: Object.fromEntries(DATA_KEYS.map(key => [key, before[key]])),
      importedMediaIds: newPhotos.map(photo => photo.id),
    };
    await commitRestore(before, [[SAFETY_KEY, JSON.stringify(safety)], ...dataChanges], newPhotos);
    setBackupStatus({ ...getBackupStatus(), lastRestore: new Date().toISOString(), restoreCount: data.sightings.length });
    return { imported: data.sightings.length, merged: sightings.length };
  });
}

export function restoreFromSafetyCopy() {
  return runRestore(async () => {
    const before = readStorage();
    const copy = JSON.parse(before[SAFETY_KEY]);
    const changes = new Map();
    if (copy?.storage && DATA_KEYS.every(key => copy.storage[key] === null || typeof copy.storage[key] === 'string')) {
      for (const key of DATA_KEYS) changes.set(key, copy.storage[key]);
    } else if (Array.isArray(copy?.sightings)) {
      // Veiligheidskopieën van eerdere versies hadden geen ruwe opslagsnapshot.
      changes.set(STORAGE_KEY, JSON.stringify({
        schemaVersion: SCHEMA_VERSION, exportedAt: copy.savedAt, sightings: copy.sightings,
      }));
      changes.set(PLACES_KEY, Array.isArray(copy.places)
        ? JSON.stringify({ schemaVersion: PLACES_SCHEMA, places: copy.places }) : null);
      for (const [kind, key] of Object.entries(COLLECTION_KEYS)) {
        if (Array.isArray(copy.collections?.[kind])) changes.set(key, JSON.stringify(normalizeIds(copy.collections[kind])));
      }
    } else {
      throw new Error('Geen veiligheidskopie beschikbaar.');
    }
    changes.set(SAFETY_KEY, null);
    await commitRestore(before, changes, normalizeIds(copy.importedMediaIds), true);
  });
}

// Birdspot exporteert ZIP-items zonder compressie. Controleer grenzen en CRC
// voordat een item als bibliotheekdata of media wordt gebruikt.
function readZip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder();
  const entries = new Map();
  let offset = 0;
  while (offset + 30 <= bytes.length && view.getUint32(offset, true) === 0x04034b50) {
    const size = view.getUint32(offset + 18, true);
    const nameStart = offset + 30;
    const nameEnd = nameStart + view.getUint16(offset + 26, true);
    const start = nameEnd + view.getUint16(offset + 28, true);
    const end = start + size;
    if (view.getUint16(offset + 8, true) !== 0 || view.getUint32(offset + 22, true) !== size || end > bytes.length) {
      throw new Error('Het ZIP-bestand is beschadigd of gebruikt een niet-ondersteunde compressie.');
    }
    const name = decoder.decode(bytes.subarray(nameStart, nameEnd));
    const data = bytes.subarray(start, end);
    if (entries.has(name) || crc32(data) !== view.getUint32(offset + 14, true)) {
      throw new Error('Het ZIP-bestand bevat dubbele of beschadigde bestanden.');
    }
    entries.set(name, data);
    offset = end;
  }
  const directory = offset + 4 <= bytes.length && view.getUint32(offset, true) === 0x02014b50;
  const endOfDirectory = bytes.length >= 22 && view.getUint32(bytes.length - 22, true) === 0x06054b50;
  if (!directory || !endOfDirectory) throw new Error('Het ZIP-bestand is onvolledig.');
  return entries;
}
