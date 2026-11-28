/**
 * Dagfoto op Home. De foto wisselt bij lokale middernacht of bij hervatten.
 * Herkenning en aanwezigheid komen uit Birdspot's eigen soortendatabase.
 * Foto's zijn aparte Wikimedia Commons-referenties met maker en licentie.
 */
import { featuredBirdForDate } from './specialBirds.js';
import { SPECIES, CATEGORY_BADGES } from '../../data/species.js';
import { closePhotoInfo, photoInfoMarkup } from '../../utils/photoInfo.js';
import { openPhotoViewer } from '../../utils/photoViewer.js';
import { assetUrl } from '../../utils/assetUrl.js';

const byId = new Map(SPECIES.map(s => [s.id, s]));
const HABITAT_LABELS = Object.freeze({
  bos: 'Bos', stedelijk: 'Stad en dorp', agrarisch: 'Boerenland', polder: 'Polder',
  heide: 'Heide', duinen: 'Duinen', kust: 'Kust', zee: 'Zee', wad: 'Wad',
  water: 'Water en oevers', moeras: 'Moeras', rietland: 'Rietland',
  rivierengebied: 'Rivieren', struweel: 'Struweel',
});

/** Tekst onder de naam: herkenning + wanneer in Nederland. Pure functie (testbaar). */
export function birdInfo(bird) {
  const s = byId.get(bird.id);
  // eigen tekst voor dwaalgasten waarvan de soortendatabase nog geen beschrijving heeft
  const marks = bird.info || (!s?.compact && s?.fieldmarks) || '';
  const when = !s?.months || s.months === '-' ? 'onregelmatig'
    : s.months === 'jan-dec' ? 'het hele jaar' : s.months.replaceAll('-', '–').replaceAll(',', ', ');
  const badge = c => (c === 'schaarsegast' ? 'Schaarse gast' : CATEGORY_BADGES[c] || c);
  const status = s ? badge(s.category) + (s.statusExtra ? ', ook ' + badge(s.statusExtra).toLowerCase() : '') : '';
  // Home is een snelle veldcheck: alleen brontekst, afkorten op woordgrens.
  const compact = (text, limit = 145) => {
    const value = String(text || '').trim();
    if (value.length <= limit) return value;
    return value.slice(0, limit).replace(/\s+\S*$/, '').replace(/[\s,;.:]+$/, '') + '…';
  };
  const plumage = s?.plumage || {};
  const sexes = plumage.adult_f && plumage.adult_m
    ? 'Mannetje: ' + compact(plumage.adult_m, 85) + ' · Vrouwtje: ' + compact(plumage.adult_f, 85)
    : s?.similarSexes === true ? 'Man en vrouw lijken op elkaar.' : '';
  const habitat = (s?.regions || []).map(region => HABITAT_LABELS[region]).filter(Boolean).join(' · ');
  return {
    recognition: marks ? 'Herkenning: ' + marks : '',
    sexes,
    habitat,
    distribution: compact(s?.distribution, 170),
    presence: 'In Nederland: ' + [status, when].filter(Boolean).join(' · '),
  };
}

export function initFeaturedBird(el, ctx) {
  const stage = el.querySelector('#slideshow');
  if (!stage || !featuredBirdForDate()) return () => {};
  const photo = stage.querySelector('#featuredBirdImage');
  const zoom = stage.querySelector('#featuredBirdZoom');
  let closeViewer;
  const group = stage.querySelector('#featuredBirdGroup');
  const name = stage.querySelector('#featuredBirdName');
  const latin = stage.querySelector('#featuredBirdLatin');
  const quickRows = [
    ['featuredBirdWhere', 'recognition'],
    ['featuredBirdSexes', 'sexes'],
    ['featuredBirdHabitat', 'habitat'],
    ['featuredBirdDistribution', 'distribution'],
    ['featuredBirdPresence', 'presence'],
  ].map(([id, key]) => [stage.querySelector('#' + id), key]);
  const credit = stage.querySelector('#featuredBirdCredit');
  const speciesButton = stage.querySelector('[data-featured-species]');
  let shownBird, timer, destroyed = false;

  const onLoad = () => { if (!destroyed) { stage.classList.remove('has-no-photo'); stage.classList.add('has-photo'); } };
  const onError = () => { if (!destroyed) { stage.classList.add('has-no-photo'); stage.classList.remove('has-photo'); } };
  photo.addEventListener('load', onLoad);
  photo.addEventListener('error', onError);

  function show(bird) {
    if (bird.id === shownBird) return;
    shownBird = bird.id;
    const info = birdInfo(bird);
    stage.dataset.birdId = bird.id;
    const hasSpeciesCard = byId.has(bird.id);
    speciesButton.dataset.featuredSpecies = hasSpeciesCard ? bird.id : '';
    speciesButton.querySelector('[data-featured-label]').textContent = hasSpeciesCard ? 'Bekijk soortkaart' : 'Open soortengids';
    stage.classList.remove('has-photo');
    photo.alt = bird.nl + (bird.pose === 'vlucht' ? ' in vlucht' : '');
    photo.style.objectPosition = `${bird.focusX ?? 50}% center`;
    photo.src = assetUrl(bird.image);
    if (group) group.textContent = bird.groupLabel;
    name.textContent = bird.nl;
    latin.textContent = bird.latin;
    for (const [element, key] of quickRows) {
      if (!element) continue;
      const value = info[key];
      element.textContent = value;
      element.closest('.field-featured-fact').hidden = !value;
    }
    credit.innerHTML = photoInfoMarkup(bird);
  }

  function updatePhoto() {
    clearTimeout(timer);
    if (destroyed || ctx.destroyed || document.hidden) return;
    const now = new Date();
    if (!closeViewer && !stage.querySelector('details[open]')) show(featuredBirdForDate(now));
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    timer = setTimeout(updatePhoto, midnight - now);
  }
  const onKey = event => {
    if (event.key === 'Escape' && closePhotoInfo(stage)) event.stopPropagation();
  };
  zoom.addEventListener('click', () => {
    if (closeViewer) return;
    closeViewer = openPhotoViewer({
      url: photo.src, alt: photo.alt, trigger: zoom,
      photoInfo: credit.querySelector('.photo-info'),
      onClose: () => { closeViewer = undefined; updatePhoto(); },
    });
  });
  const suspend = () => clearTimeout(timer);
  stage.addEventListener('toggle', updatePhoto, true);
  stage.addEventListener('keydown', onKey);
  document.addEventListener('visibilitychange', updatePhoto);
  window.addEventListener('pageshow', updatePhoto);
  window.addEventListener('pagehide', suspend);
  updatePhoto();

  return () => {
    destroyed = true;
    suspend();
    closeViewer?.(false);
    document.removeEventListener('visibilitychange', updatePhoto);
    stage.removeEventListener('toggle', updatePhoto, true);
    stage.removeEventListener('keydown', onKey);
    window.removeEventListener('pageshow', updatePhoto);
    window.removeEventListener('pagehide', suspend);
    photo.removeEventListener('load', onLoad);
    photo.removeEventListener('error', onError);
  };
}
