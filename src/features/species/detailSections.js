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
import { GUIDE_COMPARISONS } from './guideComparisons.js';
import { GUIDE_PHOTOS } from './guidePhotos.js';
import { GUIDE_AUDIO, GUIDE_HEROES, GUIDE_PLUMAGE, GUIDE_POSES } from './guideMedia.js';
import { GUIDE_HERO_SETS, MAX_HERO_PHOTOS } from './guideHeroSets.js';
import { photoInfoMarkup } from '../../utils/photoInfo.js';
import { assetUrl } from '../../utils/assetUrl.js';
import { appIcon } from '../../utils/icons.js';
import { personalGuideSlot } from './personalGuide.js';
import { knowledgeFor, quickPanel, recognitionDetails, criticalDetails, lifeDetails, whereDetails, similarExtra, voiceDetails } from './knowledgeSections.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function icon(name, cls = '') {
  return appIcon(name, cls ? `sd-icon ${cls}` : 'sd-icon');
}

const HABITAT = {
  bos: ['tree', 'Bos'], stedelijk: ['city', 'Stad en dorp'], agrarisch: ['field', 'Boerenland'], polder: ['polder', 'Polder'],
  heide: ['heath', 'Heide'], duinen: ['dune', 'Duinen'], kust: ['coast', 'Kust'], zee: ['wave', 'Zee'], wad: ['mudflat', 'Wad'],
  water: ['water', 'Open water en oevers'], moeras: ['marsh', 'Moeras'], rietland: ['reed', 'Rietland'],
  rivierengebied: ['river', 'Rivieren'], struweel: ['bush', 'Struweel'],
};
const FREQ = { 'algemeen': [5, 'Algemeen'], 'vrij-algemeen': [4, 'Vrij algemeen'], 'schaars': [3, 'Schaars'], 'zeldzaam': [2, 'Zeldzaam'], 'zeer-zeldzaam': [1, 'Zeer zeldzaam'] };
const BREEDING = { ja: 'Broedt hier', incidenteel: 'Broedt soms', verdwenen: 'Verdwenen als broedvogel', nee: 'Broedt niet in NL' };
const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export const TABS = [
  ['herkenning', 'Herkenning', 'eye'],
  ['status', 'Leefwijze', 'lifestyle'],
  ['waar', 'Waar', 'pin'],
  ['mijn', 'Waarnemingen', 'observations'],
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
  ['eclipse', 'feather', 'Eclipskleed', 'zomerrui'],
  ['jaarling', 'year', 'Jaarling'],
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

/** FOT-02: hoofdfoto plus optionele extra hoofdfoto's (max. MAX_HERO_PHOTOS), alleen uit de eigen,
 * gecrediteerde gidsfoto's van deze soort; geen dubbele opnames. Label alleen uit vastgelegde rol. */
export function guideHeroPhotos(id, sets = GUIDE_HERO_SETS) {
  const hero = guideHeroPhoto(id);
  if (!hero) return [];
  const own = [...(GUIDE_POSES[id] || []), ...Object.values(GUIDE_PLUMAGE[id] || {}), GUIDE_PHOTOS[id]]
    .filter(photo => photo?.image && photo.author && photo.license);
  const out = [hero];
  for (const image of Array.isArray(sets[id]) ? sets[id] : []) {
    const photo = own.find(candidate => candidate.image === image);
    if (!photo || out.some(kept => kept.image === photo.image)) continue;
    out.push(photo);
    if (out.length === MAX_HERO_PHOTOS) break;
  }
  return out;
}

const ROLE_LABELS = {adult_m: 'Mannetje', adult_f: 'Vrouwtje', juv: 'Juveniel'};
/** Rol voor de fotokijker, alleen uit vastgelegde velden (geslacht, leeftijd, vlucht, label). */
export function guidePhotoRole(photo) {
  const role = ROLE_LABELS[photoRole(photo)] || photo?.label || '';
  if (photo?.flight) return role && role !== 'In vlucht' ? `${role} · in vlucht` : 'In vlucht';
  return role;
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
    const adultPoses = [variant, ...poses.filter(photo => photo.age === 'adult')];
    const photos = adultPoses.filter((photo, index) => photo?.image && photo.image !== heroImage && !photoRole(photo) &&
      adultPoses.findIndex(candidate => candidate?.image === photo.image) === index);
    const similarSexes = s.similarSexes ?? s.guideReview?.similarSexes;
    const badge = similarSexes ? 'Man en vrouw lijken op elkaar' : '';
    const index = groups.findIndex(group => !['adult_m', 'adult_f'].includes(group.key));
    groups.splice(index < 0 ? groups.length : index, 0, {
      key: 'adult', icon: 'equal', title: 'Volwassen', text: plumage.adult_m, badge, photos,
      heroRef: !photos.length && Boolean(heroPhoto) && !photoRole(heroPhoto),
    });
  }
  return groups;
}

function plumageCard({key, icon: iconName, title, text, badge, photos, heroRef, flightRef}, compact = false, personalSlot = '') {
  const gallery = photos.map(photo => {
    const label = photo.label || (photo.flight ? 'In vlucht' : '');
    // Source-backed notes remain available in the single explicit details
    // control when cards are placed side-by-side, not lost or duplicated.
    return `<figure class="sd-plumage-photo">${fieldPhoto(photo)}${label ? `<figcaption>${esc(label)}</figcaption>` : ''}${!compact && photo.note ? `<p>${esc(photo.note)}</p>` : ''}</figure>`;
  });
  const notes = [];
  if (text) notes.push(`<p class="sd-plumage-description">${esc(text)}</p>`);
  for (const photo of photos) {
    if (!photo.note) continue;
    const label = photo.label || (photo.flight ? 'In vlucht' : 'Foto');
    notes.push(`<p><b>${esc(label)}:</b> ${esc(photo.note)}</p>`);
  }
  const description = compact
    ? (notes.length ? `<details class="sd-plumage-more"><summary>Kenmerken</summary><div>${notes.join('')}</div></details>` : '')
    : (text ? `<p class="sd-plumage-description">${esc(text)}</p>` : '');
  // Only the visual two-role mode collapses long prose. All other cards and
  // flight cards retain their original readable notes and source information.
  const stock = (gallery.length ? `<div class="sd-plumage-gallery">${gallery.join('')}</div>` : '') +
    (heroRef ? '<p class="sd-hero-ref">Foto: de hoofdfoto bovenaan deze kaart.</p>' : '') +
    (flightRef ? '<p class="sd-hero-ref" data-flight-ref>Foto: zie In vlucht hieronder.</p>' : '');
  const label = personalSlot.startsWith('flight-') && title !== 'In vlucht' ? `${title} · in vlucht` : title;
  return `<div class="sd-plumage" data-plumage="${key}">${icon(iconName)}<div><strong>${esc(title)}${badge ? `<span class="sd-badge">${esc(badge)}</span>` : ''}</strong>${personalSlot ? personalGuideSlot(personalSlot, label, stock) : stock}${description}</div></div>`;
}

/** Foto's zonder vastgesteld geslacht/leeftijd (niet in een kleedgroep van guidePlumageGroups).
 * Gesplitst in neutrale stilstaande foto's (posesPanel) en neutrale vluchtfoto's (flightSection) —
 * Opdracht 3, 10-11-2026: vlucht staat altijd in de eigen sectie, nooit meer gemengd met "overige". */
function neutralPhotos(id, takePhoto) {
  const main = GUIDE_PHOTOS[id];
  const original = main && main !== guideHeroPhoto(id) ? [main] : [];
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
function flightSection(entries, personal) {
  const cards = entries.filter(entry => entry.photos.length)
    .map(entry => plumageCard(entry, false, personal ? `flight-${entry.key}` : ''));
  if (!cards.length) {
    return personal ? `<div class="sd-guide-empty"><strong>In vlucht</strong>${personalGuideSlot('flight-neutral', 'In vlucht')}</div>` : '';
  }
  return `<section class="sd-flight" aria-label="In vlucht"><h3 class="sd-h">In vlucht</h3><div class="sd-plumage-list"${cards.length > 1 ? ' data-flight-layout="compare"' : ''}>${cards.join('')}</div></section>`;
}

export function comparisonPhoto(bird, inFlight) {
  if (bird.textOnly || bird.photoMissing) return null;
  const {id, plumage} = bird;
  const poses = GUIDE_POSES[id] || [];
  const portraits = [guideHeroPhoto(id), GUIDE_PHOTOS[id]];
  const variants = Object.values(GUIDE_PLUMAGE[id] || {});
  const airborneSources = new Set([...poses, ...portraits, ...variants].filter(photo => photo?.flight).map(photo => photo.source));
  const candidates = plumage
    ? [plumagePhoto(id, plumage), ...poses.filter(photo => photoRole(photo) === plumage),
      ...portraits.filter(photo => photo && photoRole(photo) === plumage),
      // F3-REV2-R02b: een expliciet gekozen gidsfoto zonder eigen geslachtsrol (bv. Buizerd: man en vrouw gelijk)
      // blijft bruikbaar naast een kleedsleutel. Achteraan, zodat bestaande keuzes ongewijzigd blijven; de
      // rolfilter hieronder sluit een foto met een afwijkende rol nog steeds uit.
      ...(bird.photo ? [...poses, ...portraits, ...variants].filter(photo => photo?.image === bird.photo && !photoRole(photo)) : [])]
    : inFlight ? [...poses, ...portraits, ...variants]
      : [...portraits, ...poses].filter(photo => photo && photoRole(photo) !== 'juv');
  return candidates.find(photo =>
    photo?.image && photo.author && photo.license && photo.source && Boolean(photo.flight) === inFlight &&
    (!bird.photo || photo.image === bird.photo) &&
    (inFlight || !airborneSources.has(photo.source)) &&
    !/^(uit-rol|archief)/.test(photo.flightReview || '') &&
    (!plumage || !photoRole(photo) || photoRole(photo) === plumage)) || null;
}

function comparisonImages(entry, focal, partner) {
  const flight = [comparisonPhoto(focal, true), comparisonPhoto(partner, true)];
  const resting = [comparisonPhoto(focal, false), comparisonPhoto(partner, false)];
  // One posture per panel. An explicitly flight-based comparison never falls back to a perched bird.
  const inFlight = Boolean(entry.flight || (!resting.every(Boolean) &&
    (flight.every(Boolean) || (!resting.some(Boolean) && flight.some(Boolean)))));
  const [ownPhoto, partnerPhoto] = inFlight ? flight : resting;
  const sameImage = ownPhoto && partnerPhoto &&
    (ownPhoto.image === partnerPhoto.image || ownPhoto.source === partnerPhoto.source);
  return { inFlight, ownPhoto, partnerPhoto: sameImage ? null : partnerPhoto };
}

function cmpPlumageTitle(entry, bird, photo, inFlight) {
  const species = speciesById.get(bird.id);
  const role = bird.plumage || (photo && photoRole(photo));
  const adult = role === 'adult_m' && !species.plumage?.adult_f && photoRole(photo || {}) !== 'adult_m';
  const fromPlumage = adult ? 'Volwassen' : PLUMAGE.find(([key]) => key === role)?.[2];
  if (inFlight) return fromPlumage ? `${fromPlumage} in vlucht` : 'In vlucht';
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
      const images = comparisonImages(entry, focal, partner);
      // Eigenaarbesluit: toon uitsluitend complete, vergelijkbare fotoparen.
      // Ontbrekende of afgewezen foto (ook bij vlucht/juveniel) blijft intern open,
      // maar veroorzaakt geen verwarrend leeg vak of tekst-only vergelijkingskaart.
      if (!images.ownPhoto || !images.partnerPhoto) continue;
      if (!groups.has(partner.id)) groups.set(partner.id, {partnerId: partner.id, pairings: []});
      groups.get(partner.id).pairings.push({entry, focal, partner, ...images});
    }
  }
  return [...groups.values()].sort((a, b) => b.pairings.length - a.pairings.length);
}

function comparisonCard(id, group) {
  const {pairings} = group;
  const own = speciesById.get(id).nameNL;
  const partnerSpecies = speciesById.get(group.partnerId);
  const tabs = pairings.length > 1;
  const panels = pairings.map((pairing, i) => {
    const {entry, focal, partner, ownPhoto, partnerPhoto, inFlight} = pairing;
    const title = cmpPlumageTitle(entry, focal, ownPhoto, inFlight);
    const partnerTitle = cmpPlumageTitle(entry, partner, partnerPhoto, inFlight);
    const rows = cmpRows(pairing).map(row =>
      `<div class="sd-cmp-row">${row.label ? `<b>${esc(row.label)}</b>` : ''}<span>${esc(row.own)}</span><span>${esc(row.other)}</span></div>`
    ).join('');
    return `<div class="sd-cmp-panel" data-cmp-panel${inFlight ? ' data-cmp-flight' : ''}${i === 0 ? '' : ' hidden'}>
      <div class="sd-cmp-head">
        <div class="sd-cmp-who"><strong>${esc(own)}</strong><small>${esc(title)}</small>${fieldPhoto(ownPhoto)}</div>
        <div class="sd-cmp-who"><strong>${esc(partnerSpecies.nameNL)}</strong><small>${esc(partnerTitle)}</small>${fieldPhoto(partnerPhoto)}</div>
      </div>
      ${rows ? `<div class="sd-cmp-rows">${rows}</div>` : ''}
      ${entry.tip ? `<p class="sd-cmp-tip">Tip: ${esc(entry.tip)}</p>` : ''}
      <div class="sd-cmp-foot">
        <button type="button" class="sd-compare-open" data-compare-species="${esc(partner.id)}">Open ${esc(partnerSpecies.nameNL)}<span aria-hidden="true"> →</span></button>
      </div>
    </div>`;
  }).join('');
  const tabBar = tabs ? `<div class="sd-cmp-tabs" role="tablist">${pairings.map(({entry, focal, ownPhoto, inFlight}, i) => {
    const title = cmpPlumageTitle(entry, focal, ownPhoto, inFlight);
    const label = entry.tabLabel || (inFlight && title !== 'In vlucht' ? `In vlucht · ${title.replace(/ in vlucht$/, '')}` : title);
    return `<button type="button" class="sd-cmp-tab${i === 0 ? ' is-active' : ''}" data-cmp-tab aria-selected="${i === 0}">${esc(label)}</button>`;
  }).join('')}</div>` : '';
  return `<div class="sd-cmp-card">${tabBar}${panels}</div>`;
}

function comparisonsSection(id, groups) {
  if (!groups.length) return '';
  const [primary, ...rest] = groups;
  const primaryCard = comparisonCard(id, primary);
  if (!rest.length) return primaryCard;
  const names = rest.map(group => speciesById.get(group.partnerId).nameNL);
  const moreCards = rest.map(group => comparisonCard(id, group)).join('');
  return primaryCard + `<details class="sd-cmp-more"><summary>Nog ${rest.length} ${rest.length === 1 ? 'soort' : 'soorten'}: ${names.map(esc).join(' · ')}</summary>${moreCards}</details>`;
}

export function voiceText(voice) {
  return `<div class="sd-callout sd-voice">${icon('note')}<p>${esc(voice)}</p></div>`;
}

export function voicePanel(s, voice, sourced = '') {
  const clips = GUIDE_AUDIO[s.id] || [];
  if (!voice && !clips.length && !sourced) return '';
  const title = '<h3 class="sd-h">Zang en roep</h3>';
  const description = `<div class="sd-voice-text">${sourced || (voice ? voiceText(voice) : '')}</div>`;
  if (!clips.length) return title + description;
  const players = clips.map(clip => `<div class="sd-audio">
    <strong>${esc(clip.label)}</strong>
    <audio controls preload="none" src="${esc(assetUrl(clip.audio))}" aria-label="${esc(clip.label)} van ${esc(s.nameNL)}"></audio>
    <p class="sd-audio-error" hidden role="status">Deze opname is nu niet beschikbaar.</p>
  </div>`);
  // The visible player contains only the useful voice type. Original filenames,
  // author, license, source and editing notes remain in the canonical media registry.
  // F3-R12b (16-11-2026): eerlijke opnamestatus op het scherm zelf. Alleen een expliciet VERIFIED-oordeel geldt als
  // bevestigd; alle andere opnamen volgen de bronvermelding. Eén korte regel voor het hele blok, details per opname in
  // de bestaande informatie-uitklap (geen extra knoppen).
  const checked = clip => String(clip.verification || '').startsWith('VERIFIED');
  const state = clip => checked(clip) ? 'Bevestigd'
    : String(clip.verification || '').startsWith('PARTIALLY TESTED')
      ? 'Gedeeltelijk gecontroleerd: bron en geluidsanalyse passen; niet beluisterd of onafhankelijk bevestigd'
      : 'Niet gecontroleerd: soort en geluidstype volgen de bronvermelding';
  const status = clips.every(checked) ? ''
    : '<p class="sd-audio-status">Soort en geluidstype van deze opnamen zijn nog niet onafhankelijk bevestigd.</p>';
  const credits = clips.map(clip => `<li><strong>${esc(clip.label)}</strong><span class="sd-audio-state">Status: ${esc(state(clip))}</span>${mediaCredit(clip)}</li>`);
  return `${title}${status}${players.join('')}<details class="sd-audio-credits">
    <summary aria-label="Informatie en bronvermelding bij deze geluidsopnamen"
      title="Informatie over de opnamen"><span class="sd-audio-info-symbol" aria-hidden="true">i</span></summary>
    <div class="sd-audio-credits-content">
      <strong class="sd-audio-credits-title">Opname-informatie en credits</strong>
      ${description}<ul>${credits.join('')}</ul>
    </div>
  </details>`;
}


/** Tab 1 — Herkenning: maten, kenmerken, verenkleed (incl. broed-, winter- en eclipskleed), zang en roep. */
export function recognitionPanel(s, life = null, personal = false) {
  const out = [];
  const displayed = new Set();
  const takePhoto = photo => {
    if (!photo) return false;
    const keys = [photo.image, photo.source].filter(Boolean);
    if (keys.some(key => displayed.has(key))) return false;
    keys.forEach(key => displayed.add(key));
    return true;
  };
  // pairHidden (F3-REV2-R01b): beide foto's bestaan, maar het paar is niet gelijkwaardig (Kwaliteitsnorm v1.10 §3.4.3);
  // het paar blijft intern geregistreerd en wordt niet als fotopaneel getoond.
  const comparisons = GUIDE_COMPARISONS.filter(pair => !pair.pairHidden && pair.birds.some(bird => bird.id === s.id));
  const regular = comparisons.filter(pair => !pair.flight);
  const flight = comparisons.filter(pair => pair.flight);
  const comparisonGroups = groupComparisonsByPartner(s.id, [...regular, ...flight]);
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
  takePhoto(hero);
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
  if (groups.length) {
    const card = (group, compact = false) => plumageCard(group, compact, personal ? group.key : '');
    // A side-by-side comparison is only useful with two different, actual
    // non-flight role photos. A hero reference or text-only placeholder must
    // not be mistaken for a second comparable image (e.g. sp017).
    const withPhotos = groups.filter(group => group.photos.length > 0);
    const compare = withPhotos.length >= 2;
    if (compare) {
      const withoutPhotos = groups.filter(group => !group.photos.length);
      out.push('<h3 class="sd-h">Verenkleed</h3><div class="sd-plumage-list" data-layout="compare">' +
        withPhotos.map(group => card(group, true)).join('') + '</div>');
      // Text-only seasonal/age roles must not take up the same picture grid.
      // Keep every historical fieldmark and hero reference one tap away.
      if (withoutPhotos.length) out.push(`<details class="sd-plumage-other"><summary>Andere kleden (${withoutPhotos.length})</summary><div class="sd-plumage-list">${withoutPhotos.map(group => card(group)).join('')}</div></details>`);
    } else {
      out.push('<h3 class="sd-h">Verenkleed</h3><div class="sd-plumage-list">' +
        groups.map(group => card(group)).join('') + '</div>');
    }
  } else if (personal) {
    out.push(`<details class="sd-plumage-other"><summary>Verenkleed</summary><div class="sd-guide-empty"><strong>Volwassen</strong>${personalGuideSlot('adult', 'Volwassen')}<strong>Juveniel</strong>${personalGuideSlot('juv', 'Juveniel')}</div></details>`);
  }

  const neutral = neutralPhotos(s.id, takePhoto);
  const neutralFlight = neutral.filter(photo => photo.flight);
  const neutralRest = neutral.filter(photo => !photo.flight);
  if (neutralFlight.length) {
    flightEntries.push({key: 'neutral', icon: 'flight', title: 'In vlucht', text: null, badge: '', photos: neutralFlight, heroRef: false});
  }
  // Vaste slotvolgorde binnen In vlucht, gelijk aan Verenkleed: mannetje → volwassen → vrouwtje → juveniel → … → neutraal.
  const FLIGHT_SLOTS = ['adult_m', 'adult', 'adult_f', 'juv', 'breeding', 'winter', 'eclipse', 'jaarling', 'neutral'];
  const slotRank = key => (FLIGHT_SLOTS.includes(key) ? FLIGHT_SLOTS.indexOf(key) : FLIGHT_SLOTS.length - 1);
  flightEntries.sort((a, b) => slotRank(a.key) - slotRank(b.key));
  out.push(flightSection(flightEntries, personal));
  out.push(posesPanel(neutralRest));
  // FQA-03 (10-11-2026): één sectie "Lijkt op" met één kaart per gelijkende soort. Kleed- en vluchtvergelijking
  // van dezelfde soort staan als tabbladen in die ene kaart. De vergelijking mag gidsfoto's hergebruiken.
  const cardsHtml = comparisonsSection(s.id, comparisonGroups);
  const covered = new Set(comparisonGroups.map(group => group.partnerId));
  // R21: an explicitly source-reviewed text pair also works from a partner without
  // guide photos. It does not create a knowledge profile or an incomplete photo card.
  const fallback = GUIDE_COMPARISONS.filter(entry => entry.reciprocalText && entry.birds.some(b => b.id === s.id))
    .flatMap(entry => {
      const focal = entry.birds.find(b => b.id === s.id);
      return entry.birds.filter(b => b.id !== s.id).map(partner => ({
        id: partner.id,
        why: `${s.nameNL}: ${focal.marks} ${speciesById.get(partner.id).nameNL}: ${partner.marks}`,
      }));
    });
  const extra = similarExtra(s, covered, fallback);
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
  // Soort- en determinatiebronnen blijven in de interne datasets en audits, niet op de publiekskaart.
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
  const rows = [['food', 'Voedsel', life.diet], ['lifestyle', 'Gedrag', life.behaviour], ['migrate', 'Trek', life.migration]]
    .filter(r => r[2]);
  if (rows.length) {
    out.push('<div class="sd-facts">' + rows.map(([ic, label, text]) =>
      `<div class="sd-fact">${icon(ic)}<div><strong>${label}</strong><p>${esc(text)}</p></div></div>`).join('') + '</div>');
  }
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
