/**
 * Eigen geluidsopnamen bij waarnemingen — Birdspot (ronde 3, correctie na QA R08).
 *
 * Eén plek voor:
 *  - audioBytesProblem(): dezelfde inhoudscontrole voor formulier, ZIP-voorcontrole en import
 *    (handtekening en minimale structuur per ondersteund formaat; tekst als .wav wordt geweigerd);
 *  - verwijzingen: welke opnamen de actuele waarnemingen en de veiligheidskopie nog nodig hebben;
 *  - releaseSightingAudio(): een opname pas echt verwijderen als niets haar meer nodig heeft.
 *    Zo blijft een vooraf bestaande opname terugzetbaar zolang de veiligheidskopie geldig is.
 */
import { getDB, changePhotos, isSightingAudio } from './db.js';
import { withDataLock } from './dataLock.js';

export const SIGHTINGS_KEY = 'birdspot-sightings';
export const SAFETY_KEY = 'birdspot-safety-copy';

const ascii = (bytes, at, text) => [...text].every((ch, i) => bytes[at + i] === ch.charCodeAt(0));
const u32 = (bytes, at) => (bytes[at] | (bytes[at + 1] << 8) | (bytes[at + 2] << 16)) + bytes[at + 3] * 2 ** 24;
const u16 = (bytes, at) => bytes[at] | (bytes[at + 1] << 8);

function wavProblem(b) {
  if (b.length < 44 || !ascii(b, 0, 'RIFF') || !ascii(b, 8, 'WAVE')) return 'geen WAV (RIFF/WAVE ontbreekt)';
  let at = 12, fmt = null, data = false;
  while (at + 8 <= b.length && at < 1 << 20) {
    const size = u32(b, at + 4);
    if (ascii(b, at, 'fmt ')) fmt = { format: u16(b, at + 8), channels: u16(b, at + 10), rate: u32(b, at + 12), bits: u16(b, at + 22) };
    if (ascii(b, at, 'data')) { data = size > 0; break; }
    at += 8 + size + (size & 1);
  }
  if (!fmt) return 'WAV zonder fmt-blok';
  if (![1, 3, 0xfffe].includes(fmt.format) || !fmt.channels || !fmt.rate || !fmt.bits) return 'WAV met onbekend of leeg formaat';
  if (!data) return 'WAV zonder geluidsgegevens';
  return null;
}

/** Inhoudscontrole van een geluidsbestand; null = in orde, anders een korte reden. */
export function audioBytesProblem(bytes, type) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  if (!b.length) return 'leeg bestand';
  switch (type) {
    case 'audio/wav': return wavProblem(b);
    case 'audio/mpeg': return (ascii(b, 0, 'ID3') || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)) && b.length > 128 ? null : 'geen MP3';
    case 'audio/mp4': return b.length > 32 && ascii(b, 4, 'ftyp') ? null : 'geen M4A/MP4';
    case 'audio/aac': return b.length > 16 && ((b[0] === 0xff && (b[1] & 0xf6) === 0xf0) || ascii(b, 0, 'ADIF')) ? null : 'geen AAC';
    case 'audio/ogg': return b.length > 32 && ascii(b, 0, 'OggS') ? null : 'geen OGG';
    default: return 'niet-ondersteund geluidsformaat';
  }
}

/** audioIds van alle waarnemingen in een opgeslagen waarnemingenlijst (ruwe localStorage-waarde). */
export function audioRefsFromSightingsRaw(raw) {
  try {
    const parsed = JSON.parse(raw || 'null');
    const list = Array.isArray(parsed) ? parsed : parsed?.sightings;
    return new Set((Array.isArray(list) ? list : []).flatMap(s => (Array.isArray(s?.audioIds) ? s.audioIds : [])));
  } catch (_) {
    return null;   // onleesbaar: verwijzingen onzeker
  }
}

/** audioIds die de veiligheidskopie bij Terugzetten zou herstellen (nieuwe en oude kopievormen). */
export function audioRefsFromSafetyRaw(raw) {
  if (raw == null) return new Set();
  try {
    const copy = JSON.parse(raw);
    if (copy?.storage) return audioRefsFromSightingsRaw(copy.storage[SIGHTINGS_KEY] ?? null);
    if (Array.isArray(copy?.sightings)) return new Set(copy.sightings.flatMap(s => (Array.isArray(s?.audioIds) ? s.audioIds : [])));
    return new Set();
  } catch (_) {
    return null;
  }
}

/** Alles wat nu nog naar een opname verwijst: actuele waarnemingen + veiligheidskopie. null = onzeker. */
export function neededAudio(storage = globalThis.localStorage) {
  const current = audioRefsFromSightingsRaw(storage.getItem(SIGHTINGS_KEY));
  const safety = audioRefsFromSafetyRaw(storage.getItem(SAFETY_KEY));
  if (!current || !safety) return null;
  return new Set([...current, ...safety]);
}

/**
 * Losgekoppelde opnamen pas verwijderen als niets ze meer nodig heeft (onder de datalock, zodat
 * import/Terugzetten in een ander tabblad niet tegelijk de veiligheidskopie wijzigt). Bij twijfel
 * (onleesbare gegevens) wordt niets verwijderd. Geeft de werkelijk verwijderde ID's.
 */
export function releaseSightingAudio(ids) {
  const candidates = [...new Set(ids || [])];
  if (!candidates.length) return Promise.resolve([]);
  return withDataLock(async () => {
    const needed = neededAudio();
    if (!needed) return [];
    const db = await getDB();
    const records = await Promise.all(candidates.map(id => new Promise(resolve => {
      const request = db.transaction('photos').objectStore('photos').get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    })));
    const remove = records.filter(rec => rec && isSightingAudio(rec) && !needed.has(rec.id)).map(rec => rec.id);
    await changePhotos({ remove });
    return remove;
  });
}
