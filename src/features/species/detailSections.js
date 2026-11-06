/**
 * Birdspot Library — soortdetail: tabbladen met iconen (H2–H4).
 * Pure render-functies (HTML-strings); geen DOM-toegang, geen opslag.
 *
 * Tabs: Herkenning · Leefwijze (seizoen, status, broeden, voedsel, gedrag, trek) · Waar · Mijn waarnemingen
 * Lege onderdelen worden niet getoond (Handbook D11); ontbrekende inhoud is zichtbaar ontbrekend.
 */
import { observedVisually, observedBySound, validPin } from '../sightings/evidence.js';
import { CATEGORY_BADGES } from '../../data/species.js';
import { monthSet, MONTH_NAMES } from '../../data/seasons.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ── Lijniconen (24×24, stroke = currentColor) ─────────────────
const P = {
  ruler:   '<path d="M3 15 15 3l6 6L9 21z"/><path d="m7 11 2 2M10 8l2 2M13 5l2 2"/>',
  wings:   '<path d="M12 12c-2-4-6-6-10-6 1 5 4 8 10 8 6 0 9-3 10-8-4 0-8 2-10 6z"/><path d="M12 12v6"/>',
  scale:   '<path d="M5 7h14l-1.5 13h-11z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
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
  leaf:    '<path d="M5 19C5 10 10 5 20 4c-1 10-6 15-15 15z"/><path d="M5 19 13 11"/>',
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
  ['status', 'Leefwijze', 'leaf'],
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

function plumageCard(ic, title, text, badge = '') {
  return `<div class="sd-plumage">${icon(ic)}<div><strong>${esc(title)}${badge}</strong><p>${esc(text)}</p></div></div>`;
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
  if (s.size) {
    const dimensions = [['length', 'ruler', 'Lengte'], ['wingspan', 'wings', 'Spanwijdte'], ['weight', 'scale', 'Gewicht']]
      .filter(([key]) => s.size[key] && (!s.guideReview || s.guideReview.dimensions.includes(key)));
    if (dimensions.length) {
      out.push('<div class="sd-tiles">' + dimensions.map(([key, ic, label]) => tile(ic, label, esc(s.size[key]))).join('') + '</div>');
    }
  }
  if (s.fieldmarks) {
    out.push(`<div class="sd-callout">${icon('eye')}<p>${esc(s.fieldmarks)}</p></div>`);
  }
  const p = s.plumage;
  if (p) {
    const cards = [];
    if (p.adult_m && p.adult_f) {
      cards.push(plumageCard('male', 'Man', p.adult_m));
      cards.push(plumageCard('female', 'Vrouw', p.adult_f));
    } else if (p.adult_m) {
      const badge = s.guideReview?.similarSexes ? '<span class="sd-badge">Man en vrouw lijken op elkaar</span>' : '';
      cards.push(plumageCard('equal', 'Volwassen', p.adult_m, badge));
    }
    if (p.breeding) cards.push(plumageCard('sun', 'Broedkleed', p.breeding, '<span class="sd-badge">voorjaar en zomer</span>'));
    if (p.winter) cards.push(plumageCard('snow', 'Winterkleed', p.winter, '<span class="sd-badge">najaar en winter</span>'));
    if (p.eclipse) cards.push(plumageCard('moon', 'Eclipskleed', p.eclipse, '<span class="sd-badge">zomerrui</span>'));
    if (p.juv) cards.push(plumageCard('chick', 'Juveniel', p.juv));
    if (p.jaarling) cards.push(plumageCard('chick', 'Jaarling', p.jaarling));
    if (cards.length) out.push('<h3 class="sd-h">Verenkleed</h3><div class="sd-plumage-list">' + cards.join('') + '</div>');
  }
  if (life?.voice) {
    out.push(`<h3 class="sd-h">Zang en roep</h3><div class="sd-callout sd-voice">${icon('note')}<p>${esc(life.voice)}</p></div>`);
  }
  if (s.compact) {
    out.push(`<p class="sd-note">${icon('info')}Zeldzame dwaalgast: een uitgebreide beschrijving volgt nog.</p>`);
  }
  out.push(guideSources(s.guideReview));
  return out.join('');
}

const MONTH_LEGEND = [
  ['zomergast', 'Zomergast'], ['wintergast', 'Wintergast'], ['standvogel', 'Standvogel'],
  ['trekvogel', 'Doortrekker'], ['zeldzaam', 'Schaarse gast / dwaalgast'], ['broed', 'Broedperiode'],
];

/** De hoofdcategorie kleurt aanwezigheid; gedocumenteerde broedmaanden hebben een eigen markering. */
export function monthBar({months, category}, breedingMonths) {
  const set = monthSet(months);
  const breeding = monthSet(breedingMonths);
  const kind = ['schaarsegast', 'dwaalgast'].includes(category) ? 'zeldzaam'
    : MONTH_LEGEND.some(([key]) => key === category) ? category : 'overig';
  const label = CATEGORY_BADGES[category] || 'Overig';
  const cells = MONTH_LETTERS.map((letter, i) => {
    const on = set.has(i);
    const breeds = breeding.has(i);
    const title = [MONTH_NAMES[i], on && 'gebruikelijke aanwezigheid', breeds && 'broedperiode'].filter(Boolean).join(' · ');
    return `<span class="sd-month${on ? ' is-on' : ''}${breeds ? ' is-breeding' : ''}" title="${title}">${letter}</span>`;
  }).join('');
  const caption = months === 'jan-dec' ? 'Jaarrond in Nederland'
    : !set.size ? 'Geen vaste periode vastgesteld'
    : 'Gebruikelijke periode · ' + [...set].sort((a, b) => a - b).map(i => MONTH_NAMES[i]).join(', ');
  const breedingLabel = breeding.size
    ? 'Broedperiode · ' + [...breeding].sort((a, b) => a - b).map(i => MONTH_NAMES[i]).join(', ') : '';
  const legend = kind === 'overig' ? [...MONTH_LEGEND, [kind, label]] : MONTH_LEGEND;
  return `<div class="sd-months" data-month-kind="${kind}" role="img" aria-label="${esc([label, caption, breedingLabel].filter(Boolean).join('. '))}">${cells}</div>
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
  return out.join('');
}

/** Tab 3 — Waar te vinden: leefgebieden, verspreiding en jouw eigen plekken. */
export function wherePanel(s, places = []) {
  const out = [];
  const habitats = (s.regions || []).filter(r => HABITAT[r]);
  if (habitats.length) {
    out.push('<h3 class="sd-h">Leefgebied</h3><div class="sd-habitats">' + habitats.map(r =>
      `<span class="sd-habitat">${icon(HABITAT[r][0])}${esc(HABITAT[r][1])}</span>`).join('') + '</div>');
  }
  if (s.distribution) out.push(`<div class="sd-callout">${icon('map')}<p>${esc(s.distribution)}</p></div>`);
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
