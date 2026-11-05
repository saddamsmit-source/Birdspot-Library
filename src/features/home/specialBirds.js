/**
 * Birdspot diashow — 11 groepen × 2 bijzondere Nederlandse soorten (F).
 * Foto's staan lokaal in /assets/showcase (Wikimedia Commons, CC-licentie, maker en bron in credits).
 * Het zijn referentiefoto's, NOOIT eigen waarnemingen.
 *
 * Timer: elke 30 s een andere vogel. Er loopt niets op de achtergrond: de positie (vogel + verstreken tijd)
 * wordt bewaard en bij het openen van de app gaat de diashow verder waar hij was.
 */
import { SHOWCASE_BIRDS } from './showcaseData.js';

export const SHOWCASE_INTERVAL_MS = 30_000;
export const POSITION_KEY = 'birdspot-showcase-position';
export const FEATURED_BIRDS = SHOWCASE_BIRDS;

/** Nieuwe positie na `ms` zichtbare tijd. Pure functie. */
export function advance(pos, ms, length = FEATURED_BIRDS.length, interval = SHOWCASE_INTERVAL_MS) {
  if (!length) return { index: 0, elapsed: 0 };
  const total = Math.max(0, (pos?.elapsed || 0) + Math.max(0, ms || 0));
  const steps = Math.floor(total / interval);
  const start = Number.isInteger(pos?.index) ? pos.index : 0;
  return { index: (((start + steps) % length) + length) % length, elapsed: total - steps * interval };
}

export function loadPosition(storage = globalThis.localStorage) {
  try {
    const raw = JSON.parse(storage.getItem(POSITION_KEY) || 'null');
    if (raw && Number.isInteger(raw.index) && raw.index >= 0 && raw.index < FEATURED_BIRDS.length &&
        Number.isFinite(raw.elapsed) && raw.elapsed >= 0 && raw.elapsed < SHOWCASE_INTERVAL_MS) {
      return { index: raw.index, elapsed: raw.elapsed };
    }
  } catch (_) { /* geen of ongeldige opslag: begin vooraan */ }
  return { index: 0, elapsed: 0 };
}

export function savePosition(pos, storage = globalThis.localStorage) {
  try { storage.setItem(POSITION_KEY, JSON.stringify({ index: pos.index, elapsed: Math.round(pos.elapsed) })); }
  catch (_) { /* privé-modus: diashow werkt, alleen zonder hervatten */ }
}
