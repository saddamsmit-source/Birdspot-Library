/**
 * assetUrl.js — lost een root-relatief asset-pad (zoals opgeslagen in de
 * gidsdata, bv. "/assets/species/sp029.webp") op ten opzichte van de
 * daadwerkelijke locatie van de app, niet van de domeinroot.
 *
 * Nodig omdat de app ook op een subpad kan draaien (bv. een GitHub
 * Pages-projectpagina "/Birdspot-Library/"): een vast "/assets/..." pad
 * wijst dan naar de domeinroot en geeft een 404. Zelfde aanpak als
 * SCOPE_PATH in sw.js (L-027: één bron, hier de locatie van index.html).
 *
 * Alleen toepassen op het punt waar een pad écht als URL gebruikt wordt
 * (img.src, audio src, achtergrond-url). De ruwe "/assets/..."-string blijft
 * elders ongewijzigd, want die dient ook als vergelijkings-/dedupsleutel
 * (bv. GUIDE_HEROES, credits-koppeling) — assetUrl() daar toepassen zou die
 * vergelijkingen stilletjes breken.
 */

// Lazy: deze module wordt ook geïmporteerd door Node-testscripts die
// detailSections.js los van de browser aanroepen (bv. tests/test_guide_poses.mjs)
// — daar bestaat `document` niet. In dat geval geen URL oplossen, gewoon het
// ruwe pad teruggeven; die scripts vergelijken toch alleen tegen de ruwe data.
let appBase = null;
function resolvedBase() {
  if (appBase) return appBase;
  if (typeof document === 'undefined') return null;
  appBase = new URL('.', document.baseURI);
  return appBase;
}

/**
 * @param {string|null|undefined} path  bv. "/assets/species/sp029.webp"
 * @returns {string|null|undefined} ongewijzigd als path geen root-relatief
 *   pad is (al een blob:/data:/http(s):-URL, leeg, of geen browser-document)
 */
export function assetUrl(path) {
  if (typeof path !== 'string' || !path.startsWith('/')) return path;
  const base = resolvedBase();
  if (!base) return path;
  return new URL(path.slice(1), base).href;
}
