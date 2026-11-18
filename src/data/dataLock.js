/**
 * Birdspot — coördinatie van plek-/mediarelaties (herstel 2B, QA P1 + P1-rest).
 *
 * 1. Met Web Locks (Chrome/Android, Safari, Firefox): één exclusieve lock, ook over tabbladen.
 *    ZIP-import, 'Terugzetten' en de definitieve opslag van omgevingsfoto's draaien hierbinnen.
 * 2. Altijd: de controle en de schrijfstap zitten samen in één readwrite-transactie op 'photos'
 *    (zie backup.commitRestore en placeEnv.putIfPlaceExists). Binnen één tabblad is dat sluitend.
 * 3. Zonder Web Locks over tabbladen heen is dat niet sluitend, omdat localStorage tussen
 *    tabbladprocessen asynchroon wordt bijgewerkt. Dan stopt het conflicterende pad vóór een
 *    wijziging, met een zichtbare melding (BroadcastChannel-signalen hieronder).
 */
export const DATA_LOCK = 'birdspot-data-write';
const CHANNEL = 'birdspot-data-coordination';
const RESTORE_HOLD_MS = 30000;   // aangekondigd Terugzetten blokkeert omgevingsfoto-opslag maximaal zo lang
const RESTORE_GRACE_MS = 2000;   // na afloop: tijd voor localStorage om andere tabbladen te bereiken
const REPLY_WAIT_MS = 300;

export function hasWebLocks() {
  return !!globalThis.navigator?.locks?.request;
}

export function withDataLock(operation) {
  if (hasWebLocks()) return navigator.locks.request(DATA_LOCK, { mode: 'exclusive' }, operation);
  return operation();
}

/** Zichtbare stop zonder Web Locks: een ander tabblad is met een conflicterende opslag bezig. */
export class OtherTabBusyError extends Error {
  constructor(message) { super(message); this.name = 'OtherTabBusyError'; }
}

let channel = null;
let envSavesBusy = 0;
let remoteRestoreUntil = 0;
const waiting = new Map();

function bus() {
  if (channel || typeof BroadcastChannel !== 'function') return channel;
  channel = new BroadcastChannel(CHANNEL);
  channel.onmessage = ({ data }) => {
    if (!data || typeof data !== 'object') return;
    if (data.type === 'restore-intent') {
      remoteRestoreUntil = Date.now() + RESTORE_HOLD_MS;
      if (envSavesBusy) channel.postMessage({ type: 'env-busy', id: data.id });
    } else if (data.type === 'restore-done') {
      remoteRestoreUntil = Math.min(remoteRestoreUntil, Date.now() + RESTORE_GRACE_MS);
    } else if (data.type === 'env-busy') {
      waiting.get(data.id)?.();
    }
  };
  return channel;
}
bus();

/** Markeert een lopende omgevingsfoto-opslag in dit tabblad (vanaf kiezen tot en met opslaan). */
export async function trackEnvSave(operation) {
  envSavesBusy++;
  try {
    return await operation();
  } finally {
    envSavesBusy--;
  }
}

/** Zonder Web Locks: geen omgevingsfoto opslaan terwijl een ander tabblad terugzet (of net klaar is). */
export function assertNoRemoteRestore() {
  if (hasWebLocks() || Date.now() >= remoteRestoreUntil) return;
  throw new OtherTabBusyError('Terugzetten loopt in een ander Birdspot-tabblad. De foto is niet opgeslagen; probeer het zo opnieuw.');
}

/**
 * Zonder Web Locks: kondig Terugzetten aan en stop vóór elke wijziging als een ander tabblad
 * een omgevingsfoto aan het opslaan is. Met Web Locks: niets te doen.
 */
export async function announceRestore() {
  const ch = hasWebLocks() ? null : bus();
  if (!ch) return () => {};
  const id = Math.random().toString(36).slice(2);
  let busy = false;
  waiting.set(id, () => { busy = true; });
  ch.postMessage({ type: 'restore-intent', id });
  await new Promise(resolve => setTimeout(resolve, REPLY_WAIT_MS));
  waiting.delete(id);
  const done = () => ch.postMessage({ type: 'restore-done', id });
  if (busy) {
    done();
    throw new OtherTabBusyError('Terugzetten kan nu niet: een ander Birdspot-tabblad slaat net een omgevingsfoto op. Er is niets gewijzigd; probeer het zo opnieuw.');
  }
  return done;
}
