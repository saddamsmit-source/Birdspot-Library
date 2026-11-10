/**
 * Birdspot Library — soortdetail: tabbladen met iconen (H2–H4).
 * Pure render-functies (HTML-strings); geen DOM-toegang, geen opslag.
 *
 * Tabs: Herkenning · Leefwijze (seizoen, status, broeden, voedsel, gedrag, trek) · Waar · Mijn waarnemingen
 * Lege onderdelen worden niet getoond (Handbook D11); ontbrekende inhoud is zichtbaar ontbrekend.
 */
import { observedVisually, observedBySound, validPin } from '../sightings/evidence.js';
import { CATEGORY_BADGES, SPECIES } from '../../data/species.js';
import { monthSet, MONTH_NAMES } from '../../data/seasons.js';
import { DISTRIBUTION, GBIF_YEARS, MAP_CELL, MAP_COLUMNS, MAP_MIN_RECORDS, MAP_PATHS, MAP_VIEW_BOX } from '../../data/speciesDistribution.js';
import { GUIDE_COMPARISONS, comparisonSource } from './guideComparisons.js';
import { GUIDE_PHOTOS } from './guidePhotos.js';
import { GUIDE_AUDIO, GUIDE_HEROES, GUIDE_PLUMAGE, GUIDE_POSES } from './guideMedia.js';
import { photoInfoMarkup } from '../../utils/photoInfo.js';
import { assetUrl } from '../../utils/assetUrl.js';
import { knowledgeFor, quickPanel, recognitionDetails, criticalDetails, lifeDetails, whereDetails, similarExtra, voiceDetails } from './knowledgeSections.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ── Lijniconen (24×24, stroke = currentColor) ─────────────────
const P = {
  ruler:   '<path d="M3 15 15 3l6 6L9 21z"/><path d="m7 11 2 2M10 8l2 2M13 5l2 2"/>',
  wingspan:'<path d="M2 4h20M5 2 2 4l3 2m14-4 3 2-3 2"/><path d="M12 12c-3-3-7-4-10-4 1 5 3.5 8 8 9l2 4 2-4c4.5-1 7-4 8-9-3 0-7 1-10 4Z"/><path d="m4 12 4 1m12-1-4 1"/>',
  weight:  '<circle cx="12" cy="5" r="2.5"/><path d="M7 8h10l4 12H3z"/><path d="M8 17h8"/>',
  eye:     '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  male:    '<circle cx="10" cy="14" r="5"/><path d="M14 10l6-6M15 4h5v5"/>',
  female:  '<circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 18h6"/>',
  equal:   '<circle cx="12" cy="12" r="9"/><path d="M8 10h8M8 14h8"/>',
  sun:     '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  snow:    '<path d="M12 2v20M4 6l16 12M20 6 4 18"/><path d="m9 3 3 2 3-2M9 21l3-2 3 2"/>',
  moon:    '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>',
  chick:   '<circle cx="12" cy="13" r="6"/><circle cx="10" cy="11.5" r=".8"/><path d="M14 13h3"/><path d="M9 4c1 1 2 1.5 3 1.5S14 5 15 4"/>',
  year:    '<path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 7v5l3 2"/><path d="m17 3 4 0 0 4"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  freq:    '<path d="M4 20V14M9 20V10M14 20V6M19 20V3"/>',
  nest:    '<path d="M3 12c2 5 16 5 18 0"/><path d="M5 14c2 3 12 3 14 0"/><ellipse cx="9.5" cy="10" rx="2" ry="2.6"/><ellipse cx="14" cy="10" rx="2" ry="2.6"/>',
  shield:  '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="M12 8v5M12 16h.01"/>',
  status:  '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  pin:     '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  map:     '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
  count:   '<path d="M4 7h16M4 12h16M4 17h10"/>',
  first:   '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  last:    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5h4"/>',
  info:    '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  tree:    '<path d="M12 3 6 12h3l-3 5h12l-3-5h3z"/><path d="M12 17v4"/>',
  water:   '<path d="M2 9c2 0 2-1.5 4-1.5S8 9 10 9s2-1.5 4-1.5S16 9 18 9s2-1.5 4-1.5M2 14c2 0 2-1.5 4-1.5S8 14 10 14s2-1.5 4-1.5S16 14 18 14s2-1.5 4-1.5M2 19c2 0 2-1.5 4-1.5S8 19 10 19s2-1.5 4-1.5S16 19 18 19s2-1.5 4-1.5"/>',
  reed:    '<path d="M6 21V8M12 21V4M18 21V9"/><ellipse cx="6" cy="6" rx="1.4" ry="2.6"/><ellipse cx="12" cy="3" rx="1.4" ry="2.4"/><ellipse cx="18" cy="7" rx="1.4" ry="2.6"/>',
  city:    '<path d="M3 21h18M5 21V9l5-3v15M10 21V4l9 4v13"/><path d="M13 10h3M13 14h3M13 18h3"/>',
  field:   '<path d="M3 20c4-8 14-8 18 0"/><path d="M3 15c5-5 13-5 18 0"/><path d="M12 4v6M9 6l3-2 3 2"/>',
  heath:   '<path d="M4 20h16"/><path d="M7 20c0-4 1-6 3-8M12 20c0-5 1-8 3-10M17 20c0-3 .5-5 2-6"/><circle cx="10" cy="11" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="19" cy="13" r="1"/>',
  dune:    '<path d="M2 18c3-6 7-8 10-8s6 3 10 8z"/><path d="M14 8c1-2 2-3 3-3"/>',
  wave:    '<path d="M2 14c3 0 3-4 6-4s3 4 6 4 3-4 6-4 2 2 2 2"/><path d="M2 19h20"/>',
  bush:    '<circle cx="8" cy="13" r="4"/><circle cx="15" cy="12" r="5"/><path d="M4 21h16"/>',
  river:   '<path d="M6 3c4 4-4 8 0 12s-2 6 0 6M14 3c4 4-4 8 0 12s-2 6 0 6"/>',
  camera:  '<path d="M4 8h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="3.5"/>',
  lifestyle:'<path d="M3 17h7a6 6 0 0 0 6-6V9l4-2-4-1a3 3 0 0 0-5-1L6 11l-4 4h4m1 6h15m-11-4v4m8 0 3-4"/><path d="M13.5 7h.01m-5 7 3-2"/>',
  egg:     '<path d="M12 3c3.5 0 6 5.5 6 10a6 6 0 0 1-12 0c0-4.5 2.5-10 6-10z"/>',
  timer:   '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>',
  repeat:  '<path d="M4 9a7 7 0 0 1 12-3l3 3"/><path d="M19 4v5h-5"/><path d="M20 15a7 7 0 0 1-12 3l-3-3"/><path d="M5 20v-5h5"/>',
  food:    '<path d="M6 3v8M4 3v5a2 2 0 0 0 4 0V3M6 11v10"/><path d="M17 3c-2 0-3 3-3 7h3v11"/>',
  behaviour:'<path d="M4 18c3-1 4-4 4-7a4 4 0 0 1 8 0c0 3 1 6 4 7"/><circle cx="12" cy="6" r="1"/><path d="M8 21h8"/>',
  migrate: '<path d="M3 17c4-6 10-9 18-10"/><path d="m16 4 5 3-3 5"/><path d="M3 21h6"/>',
  note:    '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
};
export function icon(name, cls = '') {
  return `<svg class="sd-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.info}</svg>`;
}

const HABITAT = {
  bos: ['tree', 'Bos'], stedelijk: ['city', 'Stad en dorp'], agrarisch: ['field', 'Boerenland'], polder: ['field', 'Polder'],
  heide: ['heath', 'Heide'], duinen: ['dune', 'Duinen'], kust: ['wave', 'Kust'], zee: ['wave', 'Zee'], wad: ['wave', 'Wad'],
  water: ['water', 'Open water en oevers'], moeras: ['water', 'Moeras'], rietland: ['reed', 'Rietland'],
  rivierengebied: ['river', 'Rivieren'], struweel: ['bush', 'Struweel'],
};
const FREQ = { 'algemeen': [5, 'Algemeen'], 'vrij-algemeen': [4, 'Vrij algemeen'], 'schaars': [3, 'Schaars'], 'zeldzaam': [2, 'Zeldzaam'], 'zeer-zeldzaam': [1, 'Zeer zeldzaam'] };
const BREEDING = { ja: 'Broedt hier', incidenteel: 'Broedt soms', verdwenen: 'Verdwenen als broedvogel', nee: 'Broedt niet in NL' };
const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export const TABS = [
  ['herkenning', 'Herkenning', 'eye'],
  ['status', 'Leefwijze', 'lifestyle'],
  ['waar', 'Waar', 'pin'],
  ['mijn', 'Waarnemingen', 'camera'],
];

export function tabBar(active = 'herkenning') {
  return '<div class="sd-tabs" role="tablist" aria-label="Soortinformatie">' + TABS.map(([key, label, ic]) =>
    `<button type="button" role="tab" class="sd-tab${key === active ? ' is-active' : ''}" id="sdTab-${key}" data-sd-tab="${key}"
      aria-selected="${key === active}" aria-controls="sdPanel-${key}">${icon(ic)}<span>${label}</span></button>`).join('') + '</div>';
}

function tile(ic, label, value, extra = '') {
  return `<div class="sd-tile">${icon(ic)}<span class="sd-tile__label">${esc(label)}</span><strong class="sd-tile__value">${value}</strong>${extra}</div>`;
}

const PLUMAGE = [
  ['adult_m', 'male', 'Mannetje'], ['adult_f', 'female', 'Vrouwtje'], ['juv', 'chick', 'Juveniel'],
  ['breeding', 'sun', 'Broedkleed', 'voorjaar en zomer'],
  ['winter', 'snow', 'Winterkleed', 'najaar en winter'],
  ['eclipse', 'moon', 'Eclipskleed', 'zomerrui'],
  ['jaarling', 'chick', 'Jaarling'],
];
const speciesById = new Map(SPECIES.map(bird => [bird.id, bird]));

function plumagePhoto(id, kind) {
  if (!kind) return GUIDE_PHOTOS[id];
  const photo = GUIDE_PLUMAGE[id]?.[kind];
  return photo?.reuseGuidePhoto ? GUIDE_PHOTOS[id] : photo;
}

function mediaCredit(media) {
  const modifications = media.modifications?.startsWith('Resized') ? 'Verkleind zonder uitsnede' : media.modifications;
  const sourceLink = media.showSourceLink === false ? '' : ` · <a href="${esc(media.source)}" target="_blank" rel="noopener noreferrer">Bron</a>`;
  return `<small class="sd-media-credit">${esc(media.author)} · <a href="${esc(media.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(media.license)}</a>${sourceLink}${modifications ? ' · ' + esc(modifications) : ''}</small>`;
}

function fieldPhoto(photo) {
  return `<div class="photo-info-frame"><button type="button" class="sd-field-photo" data-guide-image="${esc(assetUrl(photo.image))}" aria-label="Vergroot foto: ${esc(photo.alt)}">
    <img src="${esc(assetUrl(photo.image))}" alt="${esc(photo.alt)}" loading="lazy">
  </button>${photoInfoMarkup(photo)}</div>`;
}

export function guideHeroPhoto(id) {
  const image = GUIDE_HEROES[id];
  if (!image) return GUIDE_PHOTOS[id];
  return [...(GUIDE_POSES[id] || []), ...Object.values(GUIDE_PLUMAGE[id] || {})]
    .find(photo => photo.image === image) || GUIDE_PHOTOS[id];
}

function photoRole(photo) {
  if (photo.age === 'juvenile') return 'juv';
  if (photo.sex === 'male') return 'adult_m';
  if (photo.sex === 'female') return 'adult_f';
}

export function guidePlumageGroups(s) {
  const {id} = s;
  const plumage = s.plumage || {};
  const poses = GUIDE_POSES[id] || [];
  const main = GUIDE_PHOTOS[id];
  const sharedAdult = Boolean(plumage.adult_m && !plumage.adult_f);
  const heroPhoto = guideHeroPhoto(id);
  const heroImage = heroPhoto?.image;
  const groups = PLUMAGE.flatMap(([key, icon, title, badge]) => {
    const shared = key === 'adult_m' && sharedAdult;
    const variant = plumagePhoto(id, key);
    const photos = poses.filter(photo => photoRole(photo) === key);
    if (main && photoRole(main) === key) photos.unshift(main);
    if (variant && (!shared || photoRole(variant) === key)) photos.unshift(variant);
    // The same local image can be both the hero, a pose and a reused plumage photo.
    // Keep only one copy within each gallery, without dropping distinct photos.
    // De hoofdfoto staat al bovenaan de kaart en komt niet nog eens in een kleedgalerij.
    const uniquePhotos = photos.filter((photo, index) =>
      photo.image !== heroImage && photos.findIndex(other => other.image === photo.image) === index);
    const text = shared ? null : plumage[key];
    const heroRef = !uniquePhotos.length && Boolean(heroPhoto) && photoRole(heroPhoto) === key;
    return uniquePhotos.length || text ? [{key, icon, title, text, badge, photos: uniquePhotos, heroRef}] : [];
  });
  if (sharedAdult) {
    const variant = plumagePhoto(id, 'adult_m');
    const photos = variant && !photoRole(variant) && variant.image !== heroImage ? [variant] : [];
    const badge = s.guideReview?.similarSexes ? 'Man en vrouw lijken op elkaar' : '';
    const index = groups.findIndex(group => !['adult_m', 'adult_f', 'juv'].includes(group.key));
    groups.splice(index < 0 ? groups.length : index, 0, {
      key: 'adult', icon: 'equal', title: 'Volwassen', text: plumage.adult_m, badge, photos,
      heroRef: !photos.length && Boolean(heroPhoto) && !photoRole(heroPhoto),
    });
  }
  return groups;
}

function plumageCard({key, icon: iconName, title, text, badge, photos, heroRef, flightRef}) {
  const gallery = photos.map(photo => {
    const label = photo.label || (photo.flight ? 'In vlucht' : '');
    return `<figure class="sd-plumage-photo">${fieldPhoto(photo)}${label ? `<figcaption>${esc(label)}</figcaption>` : ''}${photo.note ? `<p>${esc(photo.note)}</p>` : ''}</figure>`;
  });
  return `<div class="sd-plumage" data-plumage="${key}">${icon(iconName)}<div><strong>${esc(title)}${badge ? `<span class="sd-badge">${esc(badge)}</span>` : ''}</strong>${text ? `<p>${esc(text)}</p>` : ''}${gallery.length ? `<div class="sd-plumage-gallery">${gallery.join('')}</div>` : ''}${heroRef ? '<p class="sd-hero-ref">Foto: de hoofdfoto bovenaan deze kaart.</p>' : ''}${flightRef ? '<p class="sd-hero-ref" data-flight-ref>Foto: zie In vlucht hieronder.</p>' : ''}</div></div>`;
}

function flightPhoto(id) {
  const pose = GUIDE_POSES[id]?.find(photo => photo.flight);
  if (pose) return pose;
  if (GUIDE_PHOTOS[id]?.flight) return null;
  const variants = GUIDE_PLUMAGE[id];
  return ['adult_m', 'adult_f', 'breeding', 'winter', 'eclipse', 'juv', 'jaarling']
    .map(kind => variants?.[kind]).find(photo => photo?.flight);
}

/** Foto's zonder vastgesteld geslacht/leeftijd (niet in een kleedgroep van guidePlumageGroups).
 * Gesplitst in neutrale stilstaande foto's (posesPanel) en neutrale vluchtfoto's (flightSection) —
 * Opdracht 3, 10-11-2026: vlucht staat altijd in de eigen sectie, nooit meer gemengd met "overige". */
function neutralPhotos(id, takePhoto) {
  const main = GUIDE_PHOTOS[id];
  const original = main && main !== guideHeroPhoto(id) ? [main] : [];
  // Een vluchtfoto die ook in een vergelijkingskaart meedoet wordt daar nooit herhaald (dashed verwijzing
  // in plaats van de foto zelf), dus hoort hij hier altijd te staan — niet uitgesloten zoals vóór de redesign.
  return [...(GUIDE_POSES[id] || []), ...original].filter(photo => !photoRole(photo) && takePhoto(photo));
}

function posesPanel(photos) {
  if (!photos.length) return '';
  return `<section class="sd-poses" aria-label="Overige herkenningsfoto’s"><h3 class="sd-h">Overige herkenningsfoto’s</h3>` +
    '<div class="sd-compare-grid">' + photos.map(photo =>
      `<div class="sd-compare-card"><strong>${esc(photo.label || 'Soortportret')}</strong>${fieldPhoto(photo)}${photo.note ? `<p>${esc(photo.note)}</p>` : ''}</div>`
    ).join('') + '</div></section>';
}

/** Eén geconsolideerde "In vlucht"-sectie, altijd ná Juveniel en vóór de vergelijkingen (Opdracht 3,
 * 10-11-2026). Combineert vluchtfoto's die uit de kleed-/geslachtsgroepen zijn gehaald (met geslacht/
 * leeftijd-label uit die groep) met neutrale vluchtfoto's zonder vastgesteld geslacht (eigen, neutrale
 * kaart — geen geslacht verzinnen). Hergebruikt plumageCard voor dezelfde visuele taal als Verenkleed. */
function flightSection(entries) {
  const cards = entries.filter(entry => entry.photos.length).map(plumageCard);
  if (!cards.length) return '';
  return `<section class="sd-flight" aria-label="In vlucht"><h3 class="sd-h">In vlucht</h3><div class="sd-plumage-list">${cards.join('')}</div></section>`;
}

/** Titel van het kleed dat een vergelijking toont, voor de tab, de "eigen kleed"-verwijzing en de badge. */
/** Tablabel: een vluchtvergelijking heet altijd "In vlucht" (eventueel met geslacht), zodat hij in één kaart naast
 * de kleedtabs (Mannetje/Vrouwtje/…) niet verward kan worden (FQA-03). */
function cmpTabLabel(entry, bird) {
  const title = cmpPlumageTitle(entry, bird);
  return entry.flight && title !== 'In vlucht' ? `In vlucht · ${title}` : title;
}

function cmpPlumageTitle(entry, bird) {
  if (entry.flight) {
    const photo = flightPhoto(bird.id);
    return photo?.sex ? photo.label : 'In vlucht';
  }
  const species = speciesById.get(bird.id);
  const adult = bird.plumage === 'adult_m' && !species.plumage?.adult_f;
  if (adult) return 'Volwassen';
  const fromPlumage = PLUMAGE.find(([key]) => key === bird.plumage)?.[2];
  if (fromPlumage) return fromPlumage;
  const suffix = entry.label?.split('·').pop()?.trim();
  return suffix ? suffix[0].toUpperCase() + suffix.slice(1) : 'Volwassen';
}

function splitMarks(text, max = 3) {
  return String(text || '').split(/(?<=[.!?])\s+/).map(part => part.trim()).filter(Boolean).slice(0, max);
}

/** Rijen met max. 3 kenmerken voor één focal/partner-paar. Handgeschreven `rows` gaan voor (geïndexeerd op de
 * positie van beide vogels in entry.birds); anders volgt de rijindeling de bestaande, al geverifieerde
 * marks-tekst van beide vogels (geen nieuwe feiten, alleen herordend). Bij 3+ vogels in één entry (bv. een
 * gezamenlijke vluchtvergelijking) tellen alleen de marks van het focal/partner-paar zelf mee. */
function cmpRows({entry, focal, partner}) {
  if (entry.rows) {
    const focalIndex = entry.birds.indexOf(focal), partnerIndex = entry.birds.indexOf(partner);
    return entry.rows.slice(0, 3).map(row => ({label: row.label, own: row.values[focalIndex], other: row.values[partnerIndex]}));
  }
  const own = splitMarks(focal.marks), other = splitMarks(partner.marks);
  const rows = [];
  for (let i = 0; i < Math.max(own.length, other.length) && rows.length < 3; i++) {
    if (!own[i] && !other[i]) continue;
    rows.push({label: '', own: own[i] || '', other: other[i] || ''});
  }
  return rows;
}

/** Vergelijkingen van één soort gegroepeerd per andere soort, rijkste groep eerst. Eén entry kan meerdere
 * paringen opleveren wanneer hij meer dan twee vogels bevat (bv. Sperwer/Havik/Torenvalk in vlucht). */
function groupComparisonsByPartner(id, comparisons) {
  const groups = new Map();
  for (const entry of comparisons) {
    const focal = entry.birds.find(bird => bird.id === id);
    if (!focal) continue;
    for (const partner of entry.birds) {
      if (partner.id === id) continue;
      // Opdracht 3 (10-11-2026): geen juveniel-tegen-juvenielvergelijkingen meer — maakt de kaart te
      // druk. De onderliggende GUIDE_COMPARISONS-data blijft ongewijzigd; alleen het tonen is verborgen.
      if (focal.plumage === 'juv' && partner.plumage === 'juv') continue;
      if (!groups.has(partner.id)) groups.set(partner.id, {partnerId: partner.id, pairings: []});
      groups.get(partner.id).pairings.push({entry, focal, partner});
    }
  }
  return [...groups.values()].sort((a, b) => b.pairings.length - a.pairings.length);
}

function comparisonCard(id, group, takePhoto) {
  const {pairings} = group;
  const own = speciesById.get(id).nameNL;
  const partnerSpecies = speciesById.get(group.partnerId);
  const tabs = pairings.length > 1;
  const panels = pairings.map((pairing, i) => {
    const {entry, focal, partner} = pairing;
    const title = cmpPlumageTitle(entry, focal);
    const partnerTitle = cmpPlumageTitle(entry, partner);
    const photo = partner.textOnly ? null : entry.flight ? flightPhoto(partner.id) : plumagePhoto(partner.id, partner.plumage);
    const showPhoto = takePhoto(photo);
    const rows = cmpRows(pairing).map(row =>
      `<div class="sd-cmp-row">${row.label ? `<b>${esc(row.label)}</b>` : ''}<span>${esc(row.own)}</span><span>${esc(row.other)}</span></div>`
    ).join('');
    const refLabel = focal.plumage || entry.flight ? title.toLowerCase() : 'hoofdfoto';
    // Mijlpaal 1 (10-11-2026): geen verwijzing naar een "In vlucht"-sectie die er niet (meer) is.
    const ownMissing = entry.flight && (focal.photoMissing || !flightPhoto(focal.id));
    return `<div class="sd-cmp-panel" data-cmp-panel${entry.flight ? ' data-cmp-flight' : ''}${i === 0 ? '' : ' hidden'}>
      <div class="sd-cmp-head">
        <div class="sd-cmp-who"><strong>${esc(own)}</strong><small>${esc(title)}</small><div class="sd-cmp-ref">${ownMissing ? 'Nog geen geschikte vluchtfoto' : `↑ zie ${esc(refLabel)}`}</div></div>
        <div class="sd-cmp-who"><strong>${esc(partnerSpecies.nameNL)}</strong><small>${esc(partnerTitle)}</small>${showPhoto ? fieldPhoto(photo) : '<div class="sd-cmp-ref">Nog geen foto</div>'}</div>
      </div>
      ${rows ? `<div class="sd-cmp-rows">${rows}</div>` : ''}
      ${entry.tip ? `<p class="sd-cmp-tip">Tip: ${esc(entry.tip)}</p>` : ''}
      <div class="sd-cmp-foot">
        <span>${showPhoto ? `Bron: <a href="${esc(comparisonSource(partner))}" target="_blank" rel="noopener noreferrer">Vogelbescherming</a>` : `Nog geen foto van ${esc(partnerSpecies.nameNL)} in dit kleed.`}</span>
        <button type="button" class="sd-compare-open" data-compare-species="${esc(partner.id)}">Open ${esc(partnerSpecies.nameNL)}<span aria-hidden="true"> →</span></button>
      </div>
    </div>`;
  }).join('');
  const tabBar = tabs ? `<div class="sd-cmp-tabs" role="tablist">${pairings.map(({entry, focal}, i) =>
    `<button type="button" class="sd-cmp-tab${i === 0 ? ' is-active' : ''}" data-cmp-tab aria-selected="${i === 0}">${esc(cmpTabLabel(entry, focal))}</button>`
  ).join('')}</div>` : '';
  return `<div class="sd-cmp-card">${tabBar}${panels}</div>`;
}

function comparisonsSection(id, comparisons, takePhoto) {
  if (!comparisons.length) return '';
  const groups = groupComparisonsByPartner(id, comparisons);
  if (!groups.length) return '';
  const [primary, ...rest] = groups;
  const primaryCard = comparisonCard(id, primary, takePhoto);
  if (!rest.length) return primaryCard;
  const names = rest.map(group => speciesById.get(group.partnerId).nameNL);
  const moreCards = rest.map(group => comparisonCard(id, group, takePhoto)).join('');
  return primaryCard + `<details class="sd-cmp-more"><summary>Nog ${rest.length} ${rest.length === 1 ? 'soort' : 'soorten'}: ${names.map(esc).join(' · ')}</summary>${moreCards}</details>`;
}

export function voiceText(voice) {
  return `<div class="sd-callout sd-voice">${icon('note')}<p>${esc(voice)}</p></div>`;
}

export function voicePanel(s, voice, sourced = '') {
  const clips = GUIDE_AUDIO[s.id] || [];
  if (!voice && !clips.length && !sourced) return '';
  const players = clips.map(clip => `<div class="sd-audio">
    <strong>${esc(clip.label)}</strong><p>${esc(clip.note)}</p>
    <audio controls preload="none" src="${esc(assetUrl(clip.audio))}" aria-label="${esc(clip.label)} van ${esc(s.nameNL)}"></audio>
    <p class="sd-audio-error" hidden role="status">Deze opname is nu niet beschikbaar.</p>
    ${mediaCredit(clip)}
  </div>`);
  return `<h3 class="sd-h">Zang en roep</h3><div class="sd-voice-text">${sourced || (voice ? voiceText(voice) : '')}</div>${players.join('')}`;
}

function guideSources(review) {
  if (!review) return '<p class="sd-source">Broncontrole van deze gidskaart volgt.</p>';
  const links = review.sources.map(source =>
    `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a>`);
  return `<p class="sd-source">Gidsbronnen · ${links.join(' · ')}</p>`;
}

/** Tab 1 — Herkenning: maten, kenmerken, verenkleed (incl. broed-, winter- en eclipskleed), zang en roep. */
export function recognitionPanel(s, life = null) {
  const out = [];
  const displayed = new Set();
  const takePhoto = photo => {
    if (!photo) return false;
    const keys = [photo.image, photo.source].filter(Boolean);
    if (keys.some(key => displayed.has(key))) return false;
    keys.forEach(key => displayed.add(key));
    return true;
  };
  const comparisons = GUIDE_COMPARISONS.filter(pair => pair.birds.some(bird => bird.id === s.id));
  const regular = comparisons.filter(pair => !pair.flight);
  const flight = comparisons.filter(pair => pair.flight);
  if (s.size) {
    const dimensions = [['length', 'ruler', 'Lengte'], ['wingspan', 'wingspan', 'Spanwijdte'], ['weight', 'weight', 'Gewicht']]
      .filter(([key]) => s.size[key] && (!s.guideReview || s.guideReview.dimensions.includes(key)));
    if (dimensions.length) {
      out.push('<div class="sd-tiles">' + dimensions.map(([key, ic, label]) => tile(ic, label, esc(s.size[key]))).join('') + '</div>');
    }
  }
  // Kennisbaseline (proef 10-11-2026): met profiel vervangt "Snel herkennen" de korte veldkenmerkregel.
  // Zonder profiel blijft de kaart exact zoals voorheen.
  if (knowledgeFor(s.id)) out.push(quickPanel(s));
  else if (s.fieldmarks) {
    out.push(`<div class="sd-callout">${icon('eye')}<p>${esc(s.fieldmarks)}</p></div>`);
  }
  // Opdracht 3 (10-11-2026): vaste fotovolgorde. Verenkleed toont voortaan uitsluitend stilstaande
  // foto's per geslacht/leeftijd; elke vluchtfoto die daar vandaan komt gaat naar de nieuwe, altijd
  // aparte sectie "In vlucht" (ná Juveniel, vóór de vergelijkingen) — met behoud van het geslachts-/
  // leeftijdslabel uit de oorspronkelijke groep (geen geslacht verzinnen, geen foto dubbel tonen).
  const flightEntries = [];
  // Fotobaseline batch 1 (10-11-2026): als een kleedkaart na het verplaatsen van zijn vluchtfoto's
  // leeg is en de hoofdfoto dat kleed toont, verwijst de kaart naar de hoofdfoto (§6.B: referentie
  // in plaats van dezelfde opname opnieuw). Zelfde rolregel als guidePlumageGroups().
  const hero = guideHeroPhoto(s.id);
  const heroShows = key => Boolean(hero) && (key === 'adult' ? !photoRole(hero) : photoRole(hero) === key);
  const groups = guidePlumageGroups(s).map(group => {
    const kept = group.photos.filter(takePhoto);
    const flightPhotos = kept.filter(photo => photo.flight);
    const restPhotos = kept.filter(photo => !photo.flight);
    if (flightPhotos.length) flightEntries.push({...group, photos: flightPhotos, heroRef: false});
    const heroRef = group.heroRef || (!restPhotos.length && heroShows(group.key));
    // FQA-01 (10-11-2026): een juveniel/vrouwtje dat alleen in vlucht is gefotografeerd staat één keer onder
    // In vlucht (met behoud van het label); de kleedkaart verwijst ernaar in plaats van de foto te herhalen.
    return {...group, photos: restPhotos, heroRef, flightRef: !heroRef && !restPhotos.length && flightPhotos.length > 0};
  });
  if (groups.length) out.push('<h3 class="sd-h">Verenkleed</h3><div class="sd-plumage-list">' + groups.map(plumageCard).join('') + '</div>');

  takePhoto(guideHeroPhoto(s.id));
  const neutral = neutralPhotos(s.id, takePhoto);
  const neutralFlight = neutral.filter(photo => photo.flight);
  const neutralRest = neutral.filter(photo => !photo.flight);
  if (neutralFlight.length) {
    flightEntries.push({key: 'neutral', icon: 'wingspan', title: 'In vlucht', text: null, badge: '', photos: neutralFlight, heroRef: false});
  }
  // Vaste slotvolgorde binnen In vlucht, gelijk aan Verenkleed: mannetje → volwassen → vrouwtje → juveniel → … → neutraal.
  const FLIGHT_SLOTS = ['adult_m', 'adult', 'adult_f', 'juv', 'breeding', 'winter', 'eclipse', 'jaarling', 'neutral'];
  const slotRank = key => (FLIGHT_SLOTS.includes(key) ? FLIGHT_SLOTS.indexOf(key) : FLIGHT_SLOTS.length - 1);
  flightEntries.sort((a, b) => slotRank(a.key) - slotRank(b.key));
  out.push(flightSection(flightEntries));
  out.push(posesPanel(neutralRest));
  // FQA-03 (10-11-2026): één sectie "Lijkt op" met één kaart per gelijkende soort. Kleed- en vluchtvergelijking
  // van dezelfde soort staan als tabbladen in die ene kaart (kleed eerst, dan "In vlucht"), zodat geen soortnaam,
  // foto of uitleg dubbel verschijnt. Daarna gelijkende soorten uit het kennisprofiel zonder eigen kaart en de
  // kritische determinatieverschillen (uitklapbaar). Alle bestaande vergelijkingsdata blijven.
  const cardsHtml = comparisonsSection(s.id, [...regular, ...flight], takePhoto);
  const covered = new Set(comparisons.flatMap(pair => pair.birds.map(bird => bird.id)));
  const extra = similarExtra(s, covered);
  const critical = criticalDetails(s);
  if (cardsHtml || extra || critical) {
    out.push(`<section class="sd-similar" aria-label="Lijkt op"><h3 class="sd-h">Lijkt op</h3>${cardsHtml}${extra}${critical}</section>`);
  }

  out.push(recognitionDetails(s));
  const sourcedVoice = voiceDetails(s);
  out.push(`<div id="sdVoice" class="sd-voice-section">${voicePanel(s, sourcedVoice ? null : life?.voice, sourcedVoice)}</div>`);
  if (s.compact) {
    out.push(`<p class="sd-note">${icon('info')}Zeldzame dwaalgast: een uitgebreide beschrijving volgt nog.</p>`);
  }
  // Soorten met kennisprofiel: bronnen staan per bewering; geen "Broncontrole volgt" meer.
  out.push(!s.guideReview && knowledgeFor(s.id)
    ? '<p class="sd-source">Bronnen staan per bewering hierboven en volledig onder Leefwijze › Kennisprofiel.</p>'
    : guideSources(s.guideReview));
  return out.join('');
}

const MONTH_LEGEND = [
  ['zomergast', 'Zomergast'], ['wintergast', 'Wintergast'], ['standvogel', 'Standvogel'],
  ['trekvogel', 'Doortrekker'], ['zeldzaam', 'Schaarse gast / dwaalgast'], ['broed', 'Broedperiode'],
];

function presenceColorKind(category) {
  if (category === 'schaarsegast' || category === 'dwaalgast') return 'zeldzaam';
  return MONTH_LEGEND.some(([key]) => key !== 'broed' && key === category) ? category : 'overig';
}

/** De hoofdcategorie kleurt aanwezigheid; gedocumenteerde broedmaanden hebben een eigen markering. */
export function monthBar({months, category, breeding: breedingStatus}, breedingMonths) {
  const set = monthSet(months);
  const breeding = monthSet(breedingMonths);
  const kind = presenceColorKind(category);
  const label = CATEGORY_BADGES[category] || 'Overig';
  const cells = MONTH_LETTERS.map((letter, i) => {
    const on = set.has(i);
    const breeds = breeding.has(i);
    const title = [MONTH_NAMES[i], on && 'gebruikelijke aanwezigheid', breeds && 'broedperiode'].filter(Boolean).join(' · ');
    return `<span class="sd-month${on ? ' is-on' : ''}" title="${title}">${letter}</span>`;
  }).join('');
  const breedingStrip = breeding.size ? MONTH_LETTERS.map((_, i) =>
    `<span${breeding.has(i) ? ' class="is-breeding"' : ''}></span>`).join('') : '';
  const caption = months === 'jan-dec' ? 'Jaarrond in Nederland'
    : !set.size ? 'Geen vaste periode vastgesteld'
    : 'Gebruikelijke periode · ' + [...set].sort((a, b) => a - b).map(i => MONTH_NAMES[i]).join(', ');
  let breedingLabel = '';
  if (breeding.size) {
    breedingLabel = 'Gebruikelijke broedperiode · ' + [...breeding].sort((a, b) => a - b).map(i => MONTH_NAMES[i]).join(', ');
  } else if (breedingStatus === 'incidenteel') {
    breedingLabel = 'Incidentele broedgevallen in Nederland.';
  } else if (breedingStatus === 'ja') {
    breedingLabel = 'Broedmaanden volgen nog.';
  }
  const legend = kind === 'overig' ? [...MONTH_LEGEND, [kind, label]] : MONTH_LEGEND;
  return `<div class="sd-month-calendar">
      <div class="sd-months" data-month-kind="${kind}" role="img" aria-label="${esc([label, caption, breedingLabel].filter(Boolean).join('. '))}">${cells}</div>
      ${breedingStrip ? `<div class="sd-month-breeding" aria-hidden="true">${breedingStrip}</div>` : ''}
    </div>
    <div class="sd-month-captions">
      <p class="sd-caption">${esc(caption)}</p>
      ${breedingLabel ? `<p class="sd-caption">${esc(breedingLabel)}</p>` : ''}
    </div>
    <ul class="sd-month-legend" aria-label="Kleuren maandbalk">
      ${legend.map(([key, name]) => `<li data-month-kind="${key}"><span aria-hidden="true"></span>${esc(name)}</li>`).join('')}
    </ul>`;
}

/** Tab 2 — Leefwijze: seizoen, status, broeden, voedsel, gedrag en trek. `life` uit speciesLife.js (of null). */
export function statusPanel(s, life = null) {
  const out = ['<h3 class="sd-h">Wanneer in Nederland</h3>', monthBar(s, life?.breeding?.months)];
  const tiles = [];
  const extra = s.statusExtra ? `<small>ook ${esc((CATEGORY_BADGES[s.statusExtra] || s.statusExtra).toLowerCase())}</small>` : '';
  tiles.push(tile('status', 'Status', esc(CATEGORY_BADGES[s.category] || s.category), extra));
  const f = FREQ[s.frequency];
  if (f) {
    const meter = '<span class="sd-meter" aria-hidden="true">' + [1, 2, 3, 4, 5].map(n => `<i class="${n <= f[0] ? 'on' : ''}"></i>`).join('') + '</span>';
    tiles.push(tile('freq', 'Hoe vaak', esc(f[1]), meter));
  }
  if (s.breeding) tiles.push(tile('nest', 'Broeden', esc(BREEDING[s.breeding] || s.breeding)));
  if (s.redList) tiles.push(tile('shield', 'Rode Lijst', esc(s.redList), '<small>broedvogels 2016</small>'));
  out.push('<div class="sd-tiles sd-tiles--2">' + tiles.join('') + '</div>');
  if (!life) {
    out.push(`<p class="sd-note">${icon('info')}Broeden, voedsel en trek voor deze soort volgen nog.</p>`);
    out.push(lifeDetails(s));
    return out.join('');
  }
  const b = life.breeding;
  if (b) {
    out.push('<h3 class="sd-h">Broeden</h3><div class="sd-tiles sd-tiles--2 sd-breed">' +
      tile('calendar', 'Broedtijd', esc(b.period)) +
      tile('egg', 'Eieren', esc(b.eggs)) +
      tile('timer', 'Broedduur', esc(b.incubation)) +
      tile('chick', b.fledgingLabel || 'Jongen in nest', esc(b.fledging)) +
      tile('repeat', 'Broedsels per jaar', esc(b.broods)) + '</div>' +
      `<div class="sd-callout">${icon('nest')}<p>${esc(b.nest)}</p></div>`);
  }
  const rows = [['food', 'Voedsel', life.diet], ['behaviour', 'Gedrag', life.behaviour], ['migrate', 'Trek', life.migration]]
    .filter(r => r[2]);
  if (rows.length) {
    out.push('<div class="sd-facts">' + rows.map(([ic, label, text]) =>
      `<div class="sd-fact">${icon(ic)}<div><strong>${label}</strong><p>${esc(text)}</p></div></div>`).join('') + '</div>');
  }
  if (s.guideReview) out.push(guideSources(s.guideReview));
  out.push(lifeDetails(s));
  return out.join('');
}

// These sizes apply to both the map and its legend. Each mark represents a whole grid cell.
const DISTRIBUTION_BANDS = [
  { max: 24, radius: 10 },
  { max: 99, radius: 17 },
  { max: 499, radius: 23 },
  { max: Infinity, radius: 28 },
];

function distributionMark(x, y, band) {
  const { radius } = DISTRIBUTION_BANDS[band];
  const center = MAP_CELL / 2;
  return `<circle class="sd-distribution-mark" data-band="${band}"
    cx="${x + center}" cy="${y + center}" r="${radius}"/>`;
}

function distributionLegend() {
  const rows = DISTRIBUTION_BANDS.map(({ max }, band) => {
    const min = band === 0 ? MAP_MIN_RECORDS : DISTRIBUTION_BANDS[band - 1].max + 1;
    const range = Number.isFinite(max) ? `${min}–${max}` : `${min} of meer`;
    return `<tr><td><svg viewBox="0 0 ${MAP_CELL} ${MAP_CELL}" aria-hidden="true">${distributionMark(0, 0, band)}</svg></td>
      <td>${range}</td></tr>`;
  }).join('');
  return `<table class="sd-distribution-legend">
    <thead><tr><th scope="col">Teken</th><th scope="col">Openbare meldingen per vak</th></tr></thead>
    <tbody><tr><td><span class="sd-distribution-blank" aria-hidden="true"></span></td>
      <td>0–${MAP_MIN_RECORDS - 1} · leeg vak</td></tr>${rows}</tbody>
  </table>`;
}

function distributionMap(s) {
  const cells = DISTRIBUTION[s.id]?.[1];
  const title = '<h3 class="sd-h">Verspreiding in Nederland</h3>';
  if (!cells) return `${title}<p class="sd-empty">Voor deze soort is geen onderbouwde verspreidingskaart beschikbaar.</p>`;
  const status = CATEGORY_BADGES[s.category] || 'Overig';
  const backdrop = ['BEL', 'DEU', 'FRA', 'GBR'].map(key => `<path d="${MAP_PATHS[key]}"/>`).join('');
  const marks = cells.map(([cell, count]) => {
    const x = (cell % MAP_COLUMNS) * MAP_CELL;
    const y = Math.floor(cell / MAP_COLUMNS) * MAP_CELL;
    return distributionMark(x, y, DISTRIBUTION_BANDS.findIndex(({ max }) => count <= max));
  }).join('');
  return `${title}<figure class="sd-distribution">
    <svg class="sd-distribution-map" viewBox="${MAP_VIEW_BOX}" role="img"
      aria-label="Kaart van Nederland met het aantal openbare meldingen per vak voor ${esc(s.nameNL)}"
      aria-describedby="sdDistributionNote">
      <path class="sd-distribution-land" fill-rule="evenodd" d="${MAP_PATHS.NLD}"/>
      <path class="sd-distribution-water" d="${MAP_PATHS.water}"/>
      <g class="sd-distribution-marks" aria-hidden="true">${marks}</g>
      <g class="sd-distribution-neighbours">${backdrop}</g>
      <path class="sd-distribution-outline" d="${MAP_PATHS.NLD}"/>
      <g class="sd-distribution-labels" aria-hidden="true">
        <text x="620" y="835">Noordzee</text>
        <text x="1090" y="1110">Nederland</text>
        <text x="1275" y="1250">Duitsland</text>
        <text x="770" y="1460">België</text>
      </g>
    </svg>
    <figcaption>
      ${distributionLegend()}
      <p class="sd-caption">Hoofdstatus: ${esc(status)}</p>
      <p class="sd-caption" id="sdDistributionNote">Bij meer meldingen wordt de stip groter en verschuift de kleur van geel naar rood. Elke stip staat voor een vak van ongeveer 24 km breed. Alle seizoenen in ${GBIF_YEARS} zijn samengevoegd.</p>
      <p class="sd-caption">Plekken die vaker worden bezocht, kunnen meer meldingen hebben. Ook in een leeg vak kan de soort voorkomen.</p>
      <p class="sd-caption">Waarnemingen <a href="https://doi.org/10.15468/aomfnb" target="_blank" rel="noopener noreferrer">eBird via GBIF</a> (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>) · Kaart <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a></p>
    </figcaption>
  </figure>`;
}

/** Tab 3 — vaste gidsinhoud, onafhankelijk van het laden van eigen waarnemingen. */
export function wherePanel(s) {
  const out = [distributionMap(s)];
  const habitats = (s.regions || []).filter(r => HABITAT[r]);
  if (habitats.length) {
    out.push('<h3 class="sd-h">Leefgebied</h3><div class="sd-habitats">' + habitats.map(r =>
      `<span class="sd-habitat">${icon(HABITAT[r][0])}${esc(HABITAT[r][1])}</span>`).join('') + '</div>');
  }
  if (s.distribution) out.push(`<div class="sd-callout">${icon('map')}<p>${esc(s.distribution)}</p></div>`);
  if (s.photoTip) {
    out.push(`<h3 class="sd-h">Fotografietip</h3><div class="sd-callout sd-photo-tip">${icon('camera')}<p>${esc(s.photoTip)}</p></div>`);
  }
  out.push(whereDetails(s));
  out.push(`<div class="sd-places-panel" id="sdWherePlaces">${wherePlaces([])}</div>`);
  return out.join('');
}

export function wherePlaces(places) {
  const out = [];
  out.push('<h3 class="sd-h">Jouw plekken</h3>');
  if (places.length) {
    out.push('<ul class="sd-places">' + places.map(p => p.placeId
      ? `<li><button type="button" class="sd-place-link" data-place-id="${esc(p.placeId)}">${icon('pin')}<span>${esc(p.name)}</span><b>${p.count}×</b></button></li>`
      : `<li>${icon('pin')}<span>${esc(p.name)}</span><b>${p.count}×</b></li>`).join('') + '</ul>');
    out.push(`<button type="button" class="sd-action" id="sdShowOnMap">${icon('map')}Toon op de kaart</button>`);
  } else {
    out.push('<p class="sd-empty">Nog geen eigen waarnemingen met een plek.</p>');
  }
  return out.join('');
}

/** Samenvatting van eigen waarnemingen (pure functie, testbaar).
 *  K5: plekken komen uit de vaste plekken (placeId); zonder plek telt de ingevulde locatienaam. */
export function sightingStats(sightings, placeList = []) {
  const dates = sightings.map(x => x.date).filter(Boolean).sort();
  const known = new Map(placeList.map(p => [p.id, p]));
  const byPlace = new Map();
  for (const x of sightings) {
    const place = known.get(x.placeId);
    const name = place ? place.name : ((x.locationName || '').trim() || (validPin(x.lat,x.lon)? Number(x.lat).toFixed(5)+', '+Number(x.lon).toFixed(5):''));
    if (!name) continue;
    const key = place ? 'p:' + place.id : 'n:' + name;
    const cur = byPlace.get(key) || { name, count: 0, placeId: place ? place.id : null };
    cur.count++;
    byPlace.set(key, cur);
  }
  return {
    count: sightings.length,
    seen: sightings.filter(observedVisually).length,
    heard: sightings.filter(observedBySound).length,
    unknown: sightings.filter(x=>!observedVisually(x)&&!observedBySound(x)).length,
    first: dates[0] || null,
    last: dates[dates.length - 1] || null,
    places: [...byPlace.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  };
}

/** Tab 4 — Mijn waarnemingen: tegels; de lijst zelf wordt in #speciesDetailSightings gezet. */
export function minePanel(stats, fmtDate) {
  if (!stats.count) return '';
  return '<div class="sd-tiles sd-tiles--2">' +
    tile('count', 'Waarnemingen', String(stats.count)) +
    tile('pin', 'Plekken', String(stats.places.length)) +
    tile('eye', 'Gezien', String(stats.seen || 0)) +
    tile('note', 'Gehoord', String(stats.heard || 0)) +
    (stats.unknown ? tile('info', 'Wijze onbekend', String(stats.unknown)) : '') +
    (stats.first ? tile('first', 'Eerste', esc(fmtDate(stats.first))) : '') +
    (stats.last ? tile('last', 'Laatste', esc(fmtDate(stats.last))) : '') + '</div>';
}
