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

/**
 * WAV: loop de RIFF-blokken langs (oneven blokken hebben één opvulbyte). Er moet een geldig
 * fmt-blok zijn en een data-blok dat VOLLEDIG binnen het bestand valt en minstens één hele
 * audioframe bevat. Extra blokken (LIST, fact, cue, …) vóór of na data zijn toegestaan.
 * totalLength: werkelijke bestandsgrootte als `b` alleen het begin is (formulier leest 1 MB).
 */
function wavProblem(b, totalLength = b.length) {
  if (b.length < 12 || !ascii(b, 0, 'RIFF') || !ascii(b, 8, 'WAVE')) return 'geen WAV (RIFF/WAVE ontbreekt)';
  let at = 12, fmt = null, data = null;
  while (at + 8 <= b.length) {
    const size = u32(b, at + 4);
    const end = at + 8 + size;
    if (ascii(b, at, 'fmt ')) {
      if (size < 16 || end > b.length) return 'WAV met afgebroken fmt-blok';
      fmt = { format: u16(b, at + 8), channels: u16(b, at + 10), rate: u32(b, at + 12), align: u16(b, at + 20), bits: u16(b, at + 22) };
    } else if (ascii(b, at, 'data')) {
      data = { size, end };
      break;
    }
    if (end > totalLength) return 'WAV met afgebroken blok';
    at = end + (size & 1);
  }
  if (!fmt) return 'WAV zonder fmt-blok';
  if (![1, 3, 0xfffe].includes(fmt.format) || !fmt.channels || !fmt.rate || !fmt.bits || !fmt.align) return 'WAV met onbekend of leeg formaat';
  // Restcorrectie R08 (P2): de framegrootte (blockAlign) moet passen bij kanalen × bytes per sample.
  const allowedBits = fmt.format === 3 ? [32, 64] : [8, 16, 24, 32];
  if (!allowedBits.includes(fmt.bits)) return 'WAV met niet-ondersteunde bitdiepte';
  if (fmt.align !== fmt.channels * (fmt.bits / 8)) return 'WAV met onjuiste framegrootte';
  if (!data) return 'WAV zonder geluidsgegevens';
  if (data.end > totalLength) return 'WAV is afgebroken: de geluidsgegevens ontbreken (deels)';
  // Gedeclareerde blokgrootte (zonder RIFF-opvulbyte) moet minstens één volledig frame zijn.
  if (data.size < fmt.align) return 'WAV zonder volledig audioframe';
  return null;
}

/**
 * Inhoudscontrole van een geluidsbestand; null = in orde, anders een korte reden.
 * Zelfde functie voor bestandsselectie (alleen het begin + totalLength), ZIP-voorcontrole en import.
 */
export function audioBytesProblem(bytes, type, { totalLength } = {}) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  if (!b.length) return 'leeg bestand';
  const total = Number.isFinite(totalLength) && totalLength >= b.length ? totalLength : b.length;
  switch (type) {
    case 'audio/wav': return wavProblem(b, total);
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
    const removable = records.filter(rec => rec && isSightingAudio(rec) && !needed.has(rec.id));
    const remove = removable.filter(rec => !rec.personalSpecies).map(rec => rec.id);
    // Heeft de eigenaar dit ook bij Mijn soortgeluiden gezet? Dan blijft dezelfde
    // blob bestaan, alleen de verwijzing naar de verwijderde waarneming vervalt.
    const keepSpecies = removable.filter(rec => rec.personalSpecies && rec.sightingId)
      .map(rec => ({ ...rec, sightingId: null }));
    await changePhotos({ put: keepSpecies, remove });
    return remove;
  });
}

/** Een leesactie op de opnamen mislukte of werd afgebroken: niets weten = niets loskoppelen. */
export class AudioReadError extends Error {
  constructor(cause) {
    super('De opnamen konden niet worden gelezen. Er is niets opgeslagen; je invoer staat nog klaar. Kies opnieuw Opslaan.');
    this.name = 'AudioReadError';
    this.cause = cause;
  }
}

/**
 * Restcorrectie R08 (P1): lees opnamen in één transactie. Alleen een GESLAAGDE lezing mag
 * "ontbreekt" (null) opleveren; een fout of afgebroken transactie wordt AudioReadError.
 */
export async function readAudioRecords(ids) {
  if (!ids.length) return [];
  let db;
  try { db = await getDB(); } catch (error) { throw new AudioReadError(error); }
  return new Promise((resolve, reject) => {
    let tx;
    try { tx = db.transaction('photos', 'readonly'); } catch (error) { reject(new AudioReadError(error)); return; }
    const out = new Array(ids.length);
    let failed = null;
    // QA #307: geen preventDefault() — een mislukt leesverzoek moet de transactie afbreken.
    // Mocht iets anders de afbreking toch verhinderen, dan blijft 'failed' de lezing ongeldig maken.
    tx.oncomplete = () => (failed ? reject(new AudioReadError(failed)) : resolve(out));
    tx.onabort = () => reject(new AudioReadError(tx.error || failed));
    try {
      const store = tx.objectStore('photos');
      ids.forEach((id, i) => {
        const request = store.get(id);
        request.onsuccess = () => { out[i] = request.result || null; };
        request.onerror = () => { failed = failed || request.error || new Error('leesverzoek mislukt'); };
      });
    } catch (error) {
      try { tx.abort(); } catch (_) { /* al afgebroken */ }
      reject(new AudioReadError(error));
    }
  });
}

/** De opnamen van een waarneming zijn gewijzigd sinds het formulier opende (bijv. Terugzetten). */
export class AudioChangedError extends Error {
  constructor(currentIds) {
    super('De opnamen van deze waarneming zijn intussen gewijzigd (bijvoorbeeld door Terugzetten). Controleer de lijst en kies opnieuw Opslaan; je invoer staat nog klaar.');
    this.name = 'AudioChangedError';
    this.currentIds = currentIds;
  }
}

const sameSet = (a, b) => a.length === b.length && a.every(id => b.includes(id));

/**
 * Vervolgcorrectie R08 (P1): de audiokoppelingen die een bewerking opslaat, volgen uit de ACTUELE
 * waarneming plus de expliciete wijzigingen in het formulier (verwijderd/toegevoegd) — nooit uit
 * een verouderde momentopname. Aanroepen binnen updateSighting(…, { resolve }) = onder het herstelslot.
 *  - alleen andere velden gewijzigd → actuele koppelingen blijven staan;
 *  - expliciete audiowijziging terwijl de waarneming intussen andere opnamen kreeg → AudioChangedError;
 *  - elke koppeling moet naar een bestaand audiobestand van DEZE waarneming wijzen; een koppeling
 *    naar een ontbrekend bestand wordt niet opnieuw opgeslagen (dropped).
 */
export async function resolveSightingAudio(current, { loaded = [], removed = [], added = [] } = {}) {
  const currentIds = Array.isArray(current.audioIds) ? [...current.audioIds] : [];
  const explicit = removed.length > 0 || added.length > 0;
  if (explicit && !sameSet(currentIds, loaded)) throw new AudioChangedError(currentIds);
  const wanted = [...new Set([...currentIds.filter(id => !removed.includes(id)), ...added])];
  const records = await readAudioRecords(wanted);   // leesfout → AudioReadError (nooit 'ontbreekt')
  const valid = rec => rec && isSightingAudio(rec) && rec.blob instanceof Blob && rec.sightingId === current.id;
  const audioIds = [], dropped = [];
  wanted.forEach((id, i) => (valid(records[i]) ? audioIds : dropped).push(id));
  if (dropped.some(id => added.includes(id))) throw new AudioChangedError(currentIds);   // nieuw bestand weg: niet opslaan
  return { audioIds, dropped };
}
