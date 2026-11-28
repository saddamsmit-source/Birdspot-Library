import { SHOWCASE_BIRDS } from './showcaseData.js';

const DAY_MS = 86_400_000;
export const FEATURED_BIRDS = SHOWCASE_BIRDS;

/** Selecteer op de lokale kalenderdatum, ook bij een dag met 23 of 25 uur. */
export function featuredBirdForDate(date = new Date()) {
  if (!FEATURED_BIRDS.length) return undefined;
  const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS;
  const index = ((day % FEATURED_BIRDS.length) + FEATURED_BIRDS.length) % FEATURED_BIRDS.length;
  return FEATURED_BIRDS[index];
}
