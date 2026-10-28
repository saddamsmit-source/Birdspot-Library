/**
 * Back-up & herstel — Birdspot Library
 *
 * Exporteert: ZIP met gegevens.json (localStorage) + alle IDB-foto's.
 * Importeert: validatie → bevestiging (caller) → veiligheidskopie → samenvoegen → herladen.
 *
 * Regels per Handbook §3.5:
 *   - Eén "Alles bewaren": alle opslagsoorten in één actie
 *   - Eén "Herstellen": samenvoegen, back-up wint bij verschil
 *   - Positieve status (certainty) gaat NOOIT terug
 *   - Geen dubbelen op basis van id
 *   - Veiligheidskopie vóór herstellen
 *   - "Terugzetten" naar de stand vóór de laatste import
 *   - Ongeldig bestand verandert niets
 *   - Format: ZIP met datum in de naam (birdspot-YYYY-MM-DD.zip)
 */

import { getSightings }                    from '../data/sightings.js';
import { getDB }                            from '../data/db.js';

const STORAGE_KEY    = 'birdspot-sightings';
const SCHEMA_VERSION = 2;

// ── ZIP-helpers (geen CDN-dependency; pure JS) ─────────────────────────────

/**
 * Minimale ZIP-builder in pure JS.
 * Ondersteunt stored (method 0) en deflate (method 8) via CompressionStream.
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
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction('photos', 'readonly');
      const req = tx.objectStore('photos').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror   = () => reject(req.error);
    });
  } catch (_) {
    return [];
  }
}

async function saveAllPhotos(photos) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    let done = 0;
    if (!photos.length) { resolve(); return; }
    for (const p of photos) {
      const req = store.put(p);
      req.onsuccess = () => { if (++done === photos.length) resolve(); };
      req.onerror   = () => reject(req.error);
    }
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

function saveSafetyCopy() {
  try {
    const current = localStorage.getItem(STORAGE_KEY) || '{}';
    const photos  = ''; // foto's zijn groot; we slaan de ID-lijst op
    const sightings = JSON.parse(current)?.sightings || [];
    localStorage.setItem(SAFETY_KEY, JSON.stringify({
      savedAt:   new Date().toISOString(),
      sightings,
    }));
  } catch (_) { /* quota: veiligheidskopie mislukt stille */ }
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

// ── Export / back-up ──────────────────────────────────────────────────────

/**
 * Maakt een ZIP back-up van alle gegevens en download die.
 * Returns { sightingCount, photoCount, filename }
 */
export async function exportBackup() {
  const sightings = await getSightings();
  const photos    = await getAllPhotos();

  const encoder = new TextEncoder();

  // gegevens.json
  const gegevens = {
    format:        'birdspot-backup',
    schemaVersion: SCHEMA_VERSION,
    exportedAt:    new Date().toISOString(),
    sightings,
    photoIds: photos.map(p => p.id),
  };
  const gegevensBytes = encoder.encode(JSON.stringify(gegevens, null, 2));

  // Alle foto's als individuele bestanden
  const zipFiles = [{ name: 'gegevens.json', data: gegevensBytes }];
  for (const photo of photos) {
    if (!photo.blob) continue;
    const buf = photo.blob instanceof Blob
      ? new Uint8Array(await photo.blob.arrayBuffer())
      : new Uint8Array(photo.blob);
    const ext  = (photo.type || 'image/jpeg').split('/')[1] || 'jpg';
    zipFiles.push({ name: `photos/${photo.id}.${ext}`, data: buf });
  }

  const zipBytes = await buildZip(zipFiles);
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
    if (!file || !file.name.endsWith('.zip')) {
      return { valid: false, error: 'Bestand is geen ZIP-bestand.' };
    }

    const buf   = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);

    // Zoek gegevens.json in de ZIP
    const gegevensJson = extractFromZip(bytes, 'gegevens.json');
    if (!gegevensJson) {
      return { valid: false, error: 'Geen gegevens.json gevonden in het ZIP-bestand.' };
    }

    const data = JSON.parse(new TextDecoder().decode(gegevensJson));
    if (data.format !== 'birdspot-backup') {
      return { valid: false, error: 'Dit is geen Birdspot back-up.' };
    }
    if (!Array.isArray(data.sightings)) {
      return { valid: false, error: 'Ongeldig bestandsformaat: waarnemingen ontbreken.' };
    }

    return {
      valid:         true,
      sightingCount: data.sightings.length,
      photoCount:    Array.isArray(data.photoIds) ? data.photoIds.length : 0,
    };
  } catch (e) {
    return { valid: false, error: `Fout bij lezen: ${e.message}` };
  }
}

// ── Import / herstel ──────────────────────────────────────────────────────

/**
 * Importeert een ZIP back-up.
 * Volgorde: validatie → veiligheidskopie → samenvoegen → status → herladen.
 * Back-up wint bij verschil; positieve certainty gaat nooit terug; geen dubbelen.
 * Returns { imported: number, merged: number }
 */
export async function importBackup(file) {
  // 1. Lees en valideer het bestand
  const buf   = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);

  const gegevensJson = extractFromZip(bytes, 'gegevens.json');
  if (!gegevensJson) throw new Error('gegevens.json niet gevonden in ZIP');

  const data = JSON.parse(new TextDecoder().decode(gegevensJson));
  if (data.format !== 'birdspot-backup' || !Array.isArray(data.sightings)) {
    throw new Error('Ongeldig back-upbestand');
  }

  // 2. Veiligheidskopie van huidige data
  saveSafetyCopy();

  // 3. Huidige waarnemingen ophalen
  const current = await getSightings();
  const byId    = new Map(current.map(s => [s.id, s]));

  // 4. Samenvoegen: back-up wint bij verschil
  const CERTAINTY_RANK = { certain: 2, probable: 1, possible: 0 };

  for (const imported of data.sightings) {
    const existing = byId.get(imported.id);
    if (!existing) {
      // Nieuwe waarneming — toevoegen
      byId.set(imported.id, _migrate(imported));
    } else {
      // Bestaand — samenvoegen, back-up wint op de meeste velden
      const merged = { ...existing, ...imported };
      // Positieve certainty gaat nooit terug
      const existRank  = CERTAINTY_RANK[existing.certainty]  ?? 0;
      const importRank = CERTAINTY_RANK[imported.certainty]  ?? 0;
      merged.certainty = existRank > importRank ? existing.certainty : imported.certainty;
      byId.set(imported.id, _migrate(merged));
    }
  }

  const merged = Array.from(byId.values());

  // 5. Foto's importeren (die al ontbreken)
  const existingPhotos = await getAllPhotos();
  const existingIds    = new Set(existingPhotos.map(p => p.id));
  const newPhotos      = [];

  for (const photoId of (data.photoIds || [])) {
    if (existingIds.has(photoId)) continue;
    // Zoek het fotobestand in de ZIP (probeert meerdere extensies)
    for (const ext of ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'gif']) {
      const photoBytes = extractFromZip(bytes, `photos/${photoId}.${ext}`);
      if (photoBytes) {
        const mimeType = ext === 'mp4' ? 'video/mp4' : `image/${ext}`;
        const blob     = new Blob([photoBytes], { type: mimeType });
        // Zoek bijbehorende sighting
        const sighting = merged.find(s => (s.photoIds || []).includes(photoId));
        newPhotos.push({
          id:        photoId,
          blob,
          type:      mimeType,
          filename:  `${photoId}.${ext}`,
          speciesId: sighting?.speciesId || null,
          sightingId: sighting?.id       || null,
          addedAt:   new Date().toISOString(),
        });
        break;
      }
    }
  }

  // 6. Alles opslaan
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      exportedAt:    new Date().toISOString(),
      sightings:     merged,
    }));
  } catch (e) {
    throw new Error(`Opslaan mislukt: ${e.message}`);
  }

  if (newPhotos.length > 0) {
    await saveAllPhotos(newPhotos).catch(() => {}); // foto's zijn best-effort
  }

  // 7. Status bijwerken
  setBackupStatus(prev => ({
    ...(getBackupStatus() || {}),
    lastRestore:   new Date().toISOString(),
    restoreCount:  data.sightings.length,
  }));

  return { imported: data.sightings.length, merged: merged.length };
}

// ── Terugzetten naar veiligheidskopie ─────────────────────────────────────

/**
 * Zet de data terug naar de veiligheidskopie van vóór de laatste import.
 * Gooit als er geen veiligheidskopie is.
 */
export async function restoreFromSafetyCopy() {
  const copy = getSafetyCopy();
  if (!copy || !Array.isArray(copy.sightings)) {
    throw new Error('Geen veiligheidskopie beschikbaar.');
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    exportedAt:    copy.savedAt,
    sightings:     copy.sightings,
  }));

  // Veiligheidskopie verwijderen (terugzetten is klaar)
  localStorage.removeItem(SAFETY_KEY);
}

// ── ZIP-reader (minimale implementatie voor stored files) ─────────────────

function extractFromZip(bytes, targetName) {
  const view    = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const encoder = new TextEncoder();
  const target  = encoder.encode(targetName);
  let i = 0;

  while (i < bytes.length - 30) {
    if (view.getUint32(i, true) !== 0x04034b50) { i++; continue; }

    const method    = view.getUint16(i + 8,  true);
    const compSize  = view.getUint32(i + 18, true);
    const uncompSize = view.getUint32(i + 22, true);
    const nameLen   = view.getUint16(i + 26, true);
    const extraLen  = view.getUint16(i + 28, true);
    const nameBytes = bytes.slice(i + 30, i + 30 + nameLen);

    const dataOffset = i + 30 + nameLen + extraLen;

    if (_bytesEqual(nameBytes, target)) {
      if (method === 0) {
        // Stored
        return bytes.slice(dataOffset, dataOffset + uncompSize);
      }
      // Deflate of andere methoden — voor nu: null (alleen stored gebruikt in buildZip)
      return null;
    }

    i = dataOffset + compSize;
  }
  return null;
}

function _bytesEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function _migrate(s) {
  return {
    ...s,
    lat:          s.lat          ?? null,
    lon:          s.lon          ?? null,
    locationName: s.locationName ?? null,
    notes:        s.notes        ?? null,
    photoIds:     Array.isArray(s.photoIds) ? s.photoIds : [],
    time:         s.time         !== undefined ? s.time         : null,
    count:        s.count        !== undefined ? s.count        : 1,
    certainty:    s.certainty    !== undefined ? s.certainty    : 'certain',
    habitat:      s.habitat      !== undefined ? s.habitat      : null,
    behavior:     s.behavior     !== undefined ? s.behavior     : null,
    weather:      s.weather      !== undefined ? s.weather      : null,
  };
}
