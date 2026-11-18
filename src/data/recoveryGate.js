/**
 * Herstelslot — Birdspot (correctieronde 2B, P1). Zonder imports, zodat ook modules die in Node
 * getest worden (species.js) het kunnen gebruiken.
 *
 * Zolang de markering van een onderbroken import of Terugzetten staat, is de localStorage-stand
 * mogelijk half. Een synchrone schrijver (favorieten, filmselectie, gezien) leest en schrijft dan
 * NIET: hij stopt met een duidelijke melding (de app rondt het herstel af) en verandert niets.
 * Asynchrone schrijvers (waarnemingen) wachten via withDataWrite() in opJournal.js.
 */
export const OP_PENDING_KEY = 'birdspot-op-pending';

export class RecoveryPendingError extends Error {
  constructor() {
    super('Een onderbroken herstelactie wordt eerst afgerond. Er is niets gewijzigd; probeer het zo opnieuw.');
    this.name = 'RecoveryPendingError';
  }
}

export function recoveryPending() {
  try { return globalThis.localStorage?.getItem(OP_PENDING_KEY) != null; } catch (_) { return false; }
}

export function assertNoPendingRecovery() {
  if (!recoveryPending()) return;
  try { globalThis.dispatchEvent?.(new CustomEvent('birdspot-recovery-pending')); } catch (_) { /* geen venster */ }
  throw new RecoveryPendingError();
}
