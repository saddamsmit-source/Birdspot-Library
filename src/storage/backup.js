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
 *   - Ronde 2B (backupVersion 2): plekken + privé-omgevingsfoto's (kind 'place-env', placeId,
 *     toelichting) gaan mee. Oude ZIP's (zonder backupVersion/kind) blijven werken.
 *     Alles wordt gevalideerd vóór er iets wordt geschreven; een ongeldige ZIP wijzigt niets.
 */

import { STORAGE_KEY, SCHEMA_VERSION, migrateSighting } from '../data/sightings.js';
import { SEEN_KEY, SPECIES } from '../data/species.js';
import { getDB, PLACE_ENV_KIND, SIGHTING_AUDIO_KIND, SIGHTING_AUDIO_TYPES, isSightingAudio } from '../data/db.js';
import { audioBytesProblem, audioRefsFromSightingsRaw, audioRefsFromSafetyRaw } from '../data/sightingAudio.js';
import { withDataLock, assertRestoreSupported, listTombstones, assertImportSafe } from '../data/dataLock.js';
import { COLLECTION_KEYS, normalizeIds } from './collections.js';
import { PLACES_KEY, withPlacesTx, refreshPlaces } from '../data/places.js';
import { prepareOperation, markCommitted, dropInTx, finishOperation, recoverOperations } from '../data/opJournal.js';

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

// Plekken staan sinds de 2B-afronding leidend in IndexedDB; 'birdspot-places' is alleen een spiegel en
// hoort daarom niet bij de localStorage-sleutels die import/Terugzetten controleren en vastleggen.
const DATA_KEYS = [STORAGE_KEY, SEEN_KEY, ...Object.values(COLLECTION_KEYS)];

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

function applyStorageChanges(before, changes, force = new Set()) {
  verifyStorage(before);
  const written = [];
  const rollback = () => {
    for (const [key, value] of written.reverse()) {
      if (localStorage.getItem(key) === value) writeStorage(key, before[key]);
    }
  };
  try {
    for (const [key, value] of changes) {
      // force: deze import moet de waarde zelf vastleggen (grafsteenherstel), ook als die gelijk lijkt.
      if (value === before[key] && !force.has(key)) continue;
      writeStorage(key, value);
      written.push([key, value]);
    }
  } catch (error) {
    rollback();
    throw error;
  }
  return rollback;
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
  // Correctie R08 (P1): alleen opnamen die een actuele waarneming noemt. Een verdrongen of via
  // Bewerken losgekoppelde opname blijft lokaal bewaard voor Terugzetten, maar hoort niet in de ZIP.
  const linkedAudio = new Set(sightings.flatMap(s => (Array.isArray(s.audioIds) ? s.audioIds : [])));
  const photos = (await getAllPhotos()).filter(photo => !isSightingAudio(photo) || linkedAudio.has(photo.id) || photo.personalSpecies === true);
  const photoIds = new Set(photos.filter(photo => photo.blob).map(photo => photo.id));
  if (photos.length !== photoIds.size || sightings.some(s => s.photoIds.some(id => !photoIds.has(id)))) {
    throw new Error('Een of meer mediabestanden ontbreken. Er is geen onvolledige back-up gemaakt.');
  }
  const audioIds = new Set(photos.filter(isSightingAudio).map(photo => photo.id));
  const missingAudio = [...linkedAudio].find(id => !audioIds.has(id) || !photoIds.has(id));
  if (missingAudio) {
    throw new Error('Een geluidsopname ontbreekt op dit toestel. Verwijder die koppeling via Bewerken; er is geen onvolledige back-up gemaakt.');
  }

  const encoder = new TextEncoder();

  // gegevens.json
  const gegevens = {
    format:        'birdspot-backup',
    backupVersion: BACKUP_VERSION,
    schemaVersion: SCHEMA_VERSION,
    exportedAt:    new Date().toISOString(),
    sightings,
    places: await refreshPlaces(),
    photoIds: photos.map(p => p.id),
    // Metadata per bestand: plek-media (K4) houdt zo zijn plek en exacte type
    mediaMeta: photos.map(p => ({ id: p.id, type: p.type || p.blob?.type || null, filename: p.filename || null,
      speciesId: p.speciesId || null,
      sightingId: p.personalSpecies && !linkedAudio.has(p.id) ? null : p.sightingId || null,
      placeId: p.placeId || null,
      // Ronde 2B: omgevingsfoto's houden soort, plek, toelichting en datum (thumb wordt opnieuw gemaakt)
      ...(p.kind === PLACE_ENV_KIND ? { kind: PLACE_ENV_KIND, caption: String(p.caption || ''),
        addedAt: p.addedAt || null, updatedAt: p.updatedAt || null } : {}),
      // Ronde 3: eigen geluidsopname bij een waarneming (originele bytes in photos/<id>.<ext>)
      ...(p.kind === SIGHTING_AUDIO_KIND ? { kind: SIGHTING_AUDIO_KIND, addedAt: p.addedAt || null,
        ...(p.personalSpecies === true ? { personalSpecies: true } : {}) } : {}) })),
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
    const checked = await readBackup(file);
    const { data, files } = checked;
    await assertImportSafe(); // vóór de bevestiging: geen ander tabblad open
    assertNoMediaForRemovedPlace(data, await listTombstones());   // specifiekste melding eerst
    assertEnvRelations(data, await refreshPlaces());              // IndexedDB is leidend
    const envPhotoCount = (data.mediaMeta || []).filter(meta => meta.kind === PLACE_ENV_KIND).length;
    const { mediaIds } = checked;
    return { valid: true, sightingCount: data.sightings.length, photoCount: mediaIds.size,
      placeCount: Array.isArray(data.places) ? data.places.length : 0, envPhotoCount };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

const BACKUP_VERSION = 2;
const ENV_CAPTION_LIMIT = 500;
const validCoordPair = (lat, lon) => lat != null && lon != null && lat !== '' && lon !== '' &&
  Number.isFinite(Number(lat)) && Math.abs(Number(lat)) <= 90 && Number.isFinite(Number(lon)) && Math.abs(Number(lon)) <= 180;

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
  if (data.backupVersion != null && (!Number.isInteger(data.backupVersion) || data.backupVersion < 1)) {
    throw new Error('Onbekende back-upversie.');
  }
  if (Number.isInteger(data.backupVersion) && data.backupVersion > BACKUP_VERSION) {
    throw new Error('Deze back-up komt uit een nieuwere Birdspot-versie. Werk de app eerst bij.');
  }
  if (data.places != null && (!Array.isArray(data.places) ||
    data.places.some(place => !validId(place?.id) || !validCoordPair(place.lat, place.lon) ||
      (place.name != null && typeof place.name !== 'string')))) {
    throw new Error('De back-up bevat een ongeldige plek.');
  }
  if (data.mediaMeta != null && (!Array.isArray(data.mediaMeta) || data.mediaMeta.some(meta => !validId(meta?.id)))) {
    throw new Error('De back-up bevat ongeldige mediagegevens.');
  }
  for (const meta of data.mediaMeta || []) {
    if (meta.kind == null) continue;
    if (meta.kind === SIGHTING_AUDIO_KIND) continue;   // volledig gecontroleerd in assertSightingAudio
    if (meta.kind !== PLACE_ENV_KIND || !validId(meta.placeId) || meta.sightingId || meta.speciesId ||
      !/^image\//.test(String(meta.type || '')) ||
      (meta.caption != null && (typeof meta.caption !== 'string' || meta.caption.length > ENV_CAPTION_LIMIT))) {
      throw new Error('De back-up bevat een ongeldige omgevingsfoto: ' + meta.id);
    }
  }
  const files = new Map();
  for (const [path, bytes] of entries) {
    const match = /^photos\/([^/]+)\.([^.]+)$/.exec(path);
    if (!match || !Object.hasOwn(MEDIA_EXT_MIME, match[2])) continue;
    const [, id, ext] = match;
    if (files.has(id)) throw new Error('De back-up bevat meerdere bestanden met dezelfde media-ID.');
    files.set(id, { bytes, ext });
  }
  // Herstel 2B (P2): voorcontrole en import gebruiken exact dezelfde medialijst.
  const mediaIds = backupMediaIds(data, files);
  const missing = [...mediaIds].find(id => !files.has(id));
  if (missing) throw new Error('Mediabestand ontbreekt in de back-up: ' + missing);
  // Correctie R08 (P2): één audiocontrole voor voorcontrole én import (readBackup is beide).
  assertSightingAudio(data, files, validId);
  return { data, files, mediaIds };
}

/**
 * Eigen geluidsopnamen in een back-up: elke opname hoort bij precies de waarneming die haar in
 * audioIds noemt, heeft metadata met kind 'sighting-audio' en hetzelfde sightingId, een ondersteund
 * geluidstype dat bij de bestandsextensie past, en echte geluidsbytes. Nooit tegelijk foto/video of
 * plekmedia. Oudere ZIP's (zonder audioIds en zonder dit kind) vallen hier buiten.
 */
function assertSightingAudio(data, files, validId) {
  const fail = reason => { throw new Error('De back-up bevat een ongeldige geluidsopname (' + reason + '). Er is niets hersteld.'); };
  const photoUse = new Set(data.sightings.flatMap(s => s.photoIds || []));
  const owner = new Map();
  const sightingById = new Map(data.sightings.map(s => [s.id, s]));
  for (const sighting of data.sightings) {
    if (sighting.audioIds == null) continue;
    if (!Array.isArray(sighting.audioIds)) fail('koppeling is geen lijst');
    for (const id of sighting.audioIds) {
      if (!validId(id)) fail('ongeldige ID');
      if (owner.has(id)) fail(id + ' hoort bij meer dan één waarneming');
      if (photoUse.has(id)) fail(id + ' is ook als foto of video gekoppeld');
      owner.set(id, sighting.id);
    }
  }
  const metaById = new Map((data.mediaMeta || []).filter(Boolean).map(meta => [meta.id, meta]));
  const allowed = new Set(Object.values(SIGHTING_AUDIO_TYPES));
  for (const meta of metaById.values()) {
    if (meta.kind !== SIGHTING_AUDIO_KIND) continue;
    const sightingId = owner.get(meta.id);
    const personal = meta.personalSpecies === true;
    if (meta.personalSpecies != null && typeof meta.personalSpecies !== 'boolean') fail(meta.id + ' heeft ongeldige soortmarkering');
    if (meta.placeId || (meta.speciesId && !personal)) fail(meta.id + ' heeft tegenstrijdige plek/soortkoppeling');
    if (personal && (!validId(meta.speciesId) || !SPECIES.some(s => s.id === meta.speciesId))) {
      fail(meta.id + ' heeft geen bestaande vogelsoort');
    }
    if (sightingId) {
      if (meta.sightingId !== sightingId) fail(meta.id + ' verwijst naar een andere waarneming');
      if (personal && sightingById.get(sightingId)?.speciesId !== meta.speciesId) fail(meta.id + ' verkeerde soort bij waarneming');
    } else if (!personal || meta.sightingId) {
      fail(meta.id + ' heeft geen geldige waarneming of persoonlijke soortkoppeling');
    }
    if (!allowed.has(meta.type)) fail(meta.id + ' heeft een niet-ondersteund formaat');
    const file = files.get(meta.id);
    if (!file) fail(meta.id + ' ontbreekt');
    const extType = MEDIA_EXT_MIME[file.ext];
    if (extType !== meta.type) fail(meta.id + ' heeft een extensie die niet bij het formaat past');
    const problem = audioBytesProblem(file.bytes, meta.type);
    if (problem) fail(meta.id + ': ' + problem);
  }
  for (const [id] of owner) if (metaById.get(id)?.kind !== SIGHTING_AUDIO_KIND) {
    fail(id + ' mist geluidsgegevens');
  }
}

/**
 * De ene medialijst van een back-up. Met photoIds (alle exports sinds K-fasen) is die lijst
 * leidend en moet hij sluitend zijn: elke mediaMeta-ID, elke foto van een waarneming en elk
 * mediabestand in de ZIP staat erin. Zonder photoIds (zeer oude ZIP): alle bestanden + waarnemingsfoto's.
 */
function backupMediaIds(data, files) {
  const sightingIds = data.sightings.flatMap(s => [...(s.photoIds || []), ...(Array.isArray(s.audioIds) ? s.audioIds : [])]);
  const metaIds = (data.mediaMeta || []).map(meta => meta.id);
  if (data.photoIds == null) {
    // Herstel P1-rest: v2 vereist photoIds; oudere ZIP's controleren ook elke mediaMeta-verwijzing.
    if (Number.isInteger(data.backupVersion) && data.backupVersion >= 2) {
      throw new Error('De medialijst (photoIds) ontbreekt in deze back-up. Er is niets hersteld.');
    }
    return new Set([...files.keys(), ...sightingIds, ...metaIds]);
  }
  const listed = new Set(data.photoIds);
  const stray = [...metaIds, ...sightingIds, ...files.keys()].find(id => !listed.has(id));
  if (stray) throw new Error('De medialijst van de back-up is niet sluitend (' + stray + '). Er is niets hersteld.');
  return listed;
}

/** Een oude localStorage-stand is geen bewijs dat een plek met grafsteen bestaat: alleen de ZIP zelf kan hem herstellen. */
function assertNoMediaForRemovedPlace(data, tombstones) {
  const incoming = new Set((Array.isArray(data.places) ? data.places : []).filter(validPlace).map(place => place.id));
  const blocked = (data.mediaMeta || []).find(meta => meta.placeId && tombstones.has(meta.placeId) && !incoming.has(meta.placeId));
  if (blocked) throw new Error('De back-up bevat media bij een plek die is teruggezet (' + blocked.placeId + '). Er is niets hersteld.');
}

function validPlace(place) {
  return !!place && typeof place.id === 'string' && !!place.id.trim() && place.lat != null && place.lon != null &&
    Number.isFinite(Number(place.lat)) && Math.abs(place.lat) <= 90 &&
    Number.isFinite(Number(place.lon)) && Math.abs(place.lon) <= 180;
}

function assertEnvRelations(data, localPlaces) {
  const known = new Set([...(data.places || []), ...localPlaces].map(place => place?.id));
  for (const meta of data.mediaMeta || []) {
    if (meta.kind === PLACE_ENV_KIND && !known.has(meta.placeId)) {
      throw new Error('Omgevingsfoto verwijst naar een onbekende plek. Er is niets hersteld.');
    }
  }
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
    // Herstel 2B (P1): zelfde lock als de opslag van omgevingsfoto's, ook over tabbladen.
    // Correctieronde 2B: eerst een openstaand journaal afhandelen, dán pas de uitgangsstand lezen.
    return await withDataLock(async () => { await recoverOperations(); return operation(); });
  } finally {
    restoring = false;
  }
}

export function importBackup(file) {
  return runRestore(async () => {
    await assertImportSafe();
    const { data, files, mediaIds } = await readBackup(file);
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
        for (const id of Array.isArray(incoming.audioIds) ? incoming.audioIds : []) skippedAttachments.add(id);
      }
      const certainty = (certaintyRank[local?.certainty] ?? -1) > (certaintyRank[incoming.certainty] ?? -1)
        ? local.certainty : incoming.certainty;
      byId.set(incoming.id, merged === local
        ? (certainty === local.certainty ? local : { ...local, certainty })
        : migrateSighting({ ...merged, certainty }));
    }

    const sightings = [...byId.values()];
    const photoOwners = new Map(sightings.flatMap(s => s.photoIds?.map(id => [id, s]) || []));
    // Ronde 3: eigenaar van een geluidsopname (sighting.audioIds), los van de foto's.
    const audioOwners = new Map(sightings.flatMap(s => (Array.isArray(s.audioIds) ? s.audioIds : []).map(id => [id, s])));
    const existingPhotos = new Set((await getAllPhotos()).map(p => p.id));
    const metadata = new Map((Array.isArray(data.mediaMeta) ? data.mediaMeta : []).filter(Boolean).map(m => [m.id, m]));
    // mediaIds komt uit readBackup: dezelfde lijst als de voorcontrole (P2).
    const incomingPlaces = (Array.isArray(data.places) ? data.places : []).filter(validPlace);
    const incomingPlaceIds = new Set(incomingPlaces.map(place => place.id));
    const newPhotos = [];
    for (const id of mediaIds) {
      if (existingPhotos.has(id) || (skippedAttachments.has(id) && !photoOwners.has(id) && !audioOwners.has(id))) continue;
      const file = files.get(id);
      if (!file) throw new Error('Mediabestand ontbreekt in de back-up: ' + id);
      const meta = metadata.get(id);
      const owner = photoOwners.get(id);
      const type = meta?.type || MEDIA_EXT_MIME[file.ext];
      if (meta?.kind === SIGHTING_AUDIO_KIND || audioOwners.has(id)) {
        const audioOwner = audioOwners.get(id);
        if (owner) throw new Error('Geluidsopname is ook als foto gekoppeld: ' + id);
        if (!String(type || '').startsWith('audio/')) throw new Error('Geluidsopname heeft geen geluidsformaat: ' + id);
        newPhotos.push({
          id, kind: SIGHTING_AUDIO_KIND, blob: new Blob([file.bytes], { type }), type,
          filename: meta?.filename || id + '.' + file.ext, size: file.bytes.byteLength,
          sightingId: audioOwner?.id ?? meta?.sightingId ?? null,
          speciesId: meta?.personalSpecies ? meta.speciesId : null, placeId: null,
          personalSpecies: meta?.personalSpecies === true,
          addedAt: meta?.addedAt || new Date().toISOString(),
        });
        continue;
      }
      if (meta?.kind === PLACE_ENV_KIND) {
        if (owner) throw new Error('Omgevingsfoto is ook aan een waarneming gekoppeld: ' + id);
        const stamp = new Date().toISOString();
        newPhotos.push({
          id, kind: PLACE_ENV_KIND, blob: new Blob([file.bytes], { type }), type,
          filename: meta.filename || id + '.' + file.ext, placeId: meta.placeId,
          caption: String(meta.caption || '').slice(0, ENV_CAPTION_LIMIT), speciesId: null, sightingId: null,
          addedAt: meta.addedAt || stamp, updatedAt: meta.updatedAt || meta.addedAt || stamp,
        });
        continue;
      }
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

    // Laatste controle vlak vóór de eerste wijziging: intussen geen ander tabblad geopend.
    await assertImportSafe();
    // Herstelronde 2B (P1): journaal vóór de eerste wijziging, zodat ook een weggevallen tabblad bij
    // de volgende start op 'helemaal vóór' of 'helemaal na' uitkomt (zie opJournal.js).
    const journalKeys = Object.fromEntries([...dataChanges].map(([key, value]) => [key, { before: before[key], after: value }]));
    const opId = await prepareOperation('import', id => ({ ...journalKeys, [SAFETY_KEY]: { before: before[SAFETY_KEY], tag: id } }));
    // Eén transactie over plekken, grafstenen en foto's: samenvoegen met de ACTUELE plekken uit
    // IndexedDB (nooit een oude localStorage-lijst), relaties controleren, alles schrijven of niets.
    let rollback = null;
    let outcome;
    try {
    // Correctie R08 (P1): opnamen die alleen de OUDE veiligheidskopie nog nodig had, vervallen zodra
    // deze import die kopie vervangt (niet meer terugzetbaar). Alles wat de actuele of nieuwe
    // waarnemingen of de nieuwe kopie (= stand vóór import) noemt, blijft.
    const oldSafetyAudio = audioRefsFromSafetyRaw(before[SAFETY_KEY]);
    const beforeAudio = audioRefsFromSightingsRaw(before[STORAGE_KEY]);
    const afterAudio = audioRefsFromSightingsRaw(dataChanges.get(STORAGE_KEY) ?? before[STORAGE_KEY]);
    const supersededAudio = oldSafetyAudio && beforeAudio && afterAudio
      ? [...oldSafetyAudio].filter(id => !beforeAudio.has(id) && !afterAudio.has(id)) : [];
    outcome = await withPlacesTx(({ places, tombstones, photos, tx }) => {
      assertNoMediaForRemovedPlace(data, tombstones);
      assertEnvRelations(data, places);
      const byId = new Map(places.map(place => [place.id, place]));
      const put = [];
      for (const place of incomingPlaces) {
        const local = byId.get(place.id);
        const merged = mergeRecord(local, place);
        if (merged !== local) { put.push(merged); byId.set(place.id, merged); }
      }
      // Grafsteen alleen opheffen voor een plek die deze ZIP bevat en die na deze transactie bestaat.
      const revive = [...tombstones].filter(id => incomingPlaceIds.has(id) && byId.has(id));
      const nextTombs = new Set([...tombstones].filter(id => !revive.includes(id)));
      const tombStore = tx.objectStore('placeTombstones');
      if (!dataChanges.size && !newPhotos.length && !put.length) {
        // Ongewijzigde (her)import: veiligheidskopie, waarnemingen, plekken en foto's ongemoeid.
        for (const id of revive) tombStore.delete(id);
        dropInTx(tx, opId);
        return { result: revive.length ? 'revived' : 'unchanged', tombstones: nextTombs };
      }
      const safety = {
        opId,                                     // herkenning bij herstel na wegvallen (P1)
        storage: Object.fromEntries(DATA_KEYS.map(key => [key, before[key]])),
        places,                                   // werkelijke plekken van vóór de import (IndexedDB)
        importedMediaIds: newPhotos.map(photo => photo.id),
      };
      const safetyRaw = JSON.stringify(safety);
      rollback = applyStorageChanges(before, [[SAFETY_KEY, safetyRaw], ...dataChanges]);
      const photoStore = tx.objectStore('photos');
      for (const photo of newPhotos) photoStore.add(photo);
      for (const id of revive) tombStore.delete(id);
      const stored = new Map(photos.map(photo => [photo.id, photo]));
      for (const id of supersededAudio) if (isSightingAudio(stored.get(id))) photoStore.delete(id);
      markCommitted(tx, opId, 'import', { ...journalKeys, [SAFETY_KEY]: { before: before[SAFETY_KEY], after: safetyRaw } });
      return { put, result: 'imported', tombstones: nextTombs };
    }, ['photos', 'opJournal'], { readPhotos: true, onAbort: () => rollback?.() });
    } catch (error) {
      await finishOperation(opId).catch(() => {});   // localStorage is al teruggezet (onAbort)
      throw error;
    }
    await finishOperation(opId).catch(error => console.error('[backup] journaal opruimen', error));
    if (outcome === 'imported') {
      setBackupStatus({ ...getBackupStatus(), lastRestore: new Date().toISOString(), restoreCount: data.sightings.length });
    }
    return { imported: data.sightings.length, merged: sightings.length };
  });
}

export function restoreFromSafetyCopy() {
  // Slot P1: zonder Web Locks geen veilige volgorde tussen tabbladen → stoppen vóór de eerste wijziging.
  try {
    assertRestoreSupported();
  } catch (error) {
    return Promise.reject(error);
  }
  return runRestore(async () => {
    const before = readStorage();
    const copy = JSON.parse(before[SAFETY_KEY]);
    const changes = new Map();
    let restoredPlaces;
    if (copy?.storage && DATA_KEYS.every(key => copy.storage[key] == null || typeof copy.storage[key] === 'string')) {
      for (const key of DATA_KEYS) changes.set(key, copy.storage[key] ?? null);
      // Nieuwe kopieën: plekken uit IndexedDB. Kopieën van vóór de 2B-afronding: localStorage-snapshot.
      restoredPlaces = Array.isArray(copy.places) ? copy.places : readList(copy.storage[PLACES_KEY] ?? null, 'places');
    } else if (Array.isArray(copy?.sightings)) {
      // Veiligheidskopieën van eerdere versies hadden geen ruwe opslagsnapshot.
      changes.set(STORAGE_KEY, JSON.stringify({
        schemaVersion: SCHEMA_VERSION, exportedAt: copy.savedAt, sightings: copy.sightings,
      }));
      restoredPlaces = Array.isArray(copy.places) ? copy.places : [];
      for (const [kind, key] of Object.entries(COLLECTION_KEYS)) {
        if (Array.isArray(copy.collections?.[kind])) changes.set(key, JSON.stringify(normalizeIds(copy.collections[kind])));
      }
    } else {
      throw new Error('Geen veiligheidskopie beschikbaar.');
    }
    changes.set(SAFETY_KEY, null);
    const imported = new Set(normalizeIds(copy.importedMediaIds));
    const restoredIds = new Set(restoredPlaces.map(place => place.id));
    // Herstelronde 2B (P1): journaal vóór de eerste wijziging (zie opJournal.js).
    const journalKeys = Object.fromEntries([...changes].map(([key, value]) => [key, { before: before[key] ?? null, after: value ?? null }]));
    const opId = await prepareOperation('restore', journalKeys);
    // Eén transactie: wees-controle op de actuele foto's, grafstenen, plekken, media en localStorage.
    // Gooit er iets of breekt de transactie af, dan is er niets gewijzigd (ook geen grafsteen).
    let rollback = null;
    try {
    await withPlacesTx(({ places, tombstones, photos, tx }) => {
      const orphaned = photos.filter(photo => photo.kind === PLACE_ENV_KIND &&
        !imported.has(photo.id) && !restoredIds.has(photo.placeId));
      if (orphaned.length) {
        throw new Error('Terugzetten kan niet: er zijn intussen omgevingsfoto\'s toegevoegd aan een herstelde plek. Er is niets gewijzigd.');
      }
      // Correctie R08 (P2): nooit een koppeling herstellen naar een opname die er niet (meer) is.
      // Incomplete veiligheidskopie → stoppen vóór de eerste wijziging; alles blijft beschikbaar.
      const restoredAudio = audioRefsFromSightingsRaw(changes.get(STORAGE_KEY) ?? null);
      const byId = new Map(photos.map(photo => [photo.id, photo]));
      const lostAudio = restoredAudio === null ? ['?'] : [...restoredAudio].filter(id =>
        imported.has(id) || !isSightingAudio(byId.get(id)) || !(byId.get(id).blob instanceof Blob));
      if (lostAudio.length) {
        throw new Error('Terugzetten kan niet: een geluidsopname uit de veiligheidskopie ontbreekt op dit toestel. Er is niets gewijzigd; je huidige waarnemingen, media en veiligheidskopie blijven bewaard.');
      }
      const removed = places.map(place => place.id).filter(id => !restoredIds.has(id));
      const tombStore = tx.objectStore('placeTombstones');
      const nextTombs = new Set(tombstones);
      for (const id of removed) if (!nextTombs.has(id)) { tombStore.put({ id, removedAt: new Date().toISOString() }); nextTombs.add(id); }
      for (const id of restoredIds) if (nextTombs.delete(id)) tombStore.delete(id);
      rollback = applyStorageChanges(before, changes);
      const photoStore = tx.objectStore('photos');
      for (const id of imported) photoStore.delete(id);
      markCommitted(tx, opId, 'restore', journalKeys);
      return { put: restoredPlaces, remove: removed, tombstones: nextTombs };
    }, ['photos', 'opJournal'], { readPhotos: true, onAbort: () => rollback?.() });
    } catch (error) {
      await finishOperation(opId).catch(() => {});
      throw error;
    }
    await finishOperation(opId).catch(error => console.error('[backup] journaal opruimen', error));
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
