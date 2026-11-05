/**
 * Diashow op de startpagina (F): elke 30 s een bijzondere Nederlandse vogel met lokale foto.
 * Geen achtergrondtimer: alleen zichtbare tijd telt. Bij verbergen, sluiten of elke 5 s wordt de positie
 * bewaard; bij openen gaat de diashow verder waar hij was (specialBirds.js).
 * Herkenning en aanwezigheid komen uit Birdspot's eigen soortendatabase.
 * Foto's zijn Wikimedia Commons-referenties met maker en licentie, nooit eigen waarnemingen.
 */
import { FEATURED_BIRDS, advance, loadPosition, savePosition } from './specialBirds.js';
import { SPECIES, CATEGORY_BADGES } from '../../data/species.js';

const byId = new Map(SPECIES.map(s => [s.id, s]));
const SAVE_EVERY_MS = 5_000;

/** Tekst onder de naam: herkenning + wanneer in Nederland. Pure functie (testbaar). */
export function birdInfo(bird) {
  const s = byId.get(bird.id);
  // eigen tekst voor dwaalgasten waarvan de soortendatabase nog geen beschrijving heeft
  const marks = bird.info || (!s?.compact && s?.fieldmarks) || 'Let op formaat, kleur en vluchtbeeld.';
  const when = !s?.months || s.months === '-' ? 'onregelmatig'
    : s.months === 'jan-dec' ? 'het hele jaar' : s.months.replaceAll('-', '–').replaceAll(',', ', ');
  const badge = c => (c === 'schaarsegast' ? 'Schaarse gast' : CATEGORY_BADGES[c] || c);
  const status = s ? badge(s.category) + (s.statusExtra ? ', ook ' + badge(s.statusExtra).toLowerCase() : '') : '';
  return { recognition: 'Herkenning: ' + marks, presence: 'In Nederland: ' + [status, when].filter(Boolean).join(' · ') };
}

export function initFeaturedCarousel(el, ctx) {
  const stage = el.querySelector('#slideshow');
  if (!stage || !FEATURED_BIRDS.length) return () => {};
  const photo = stage.querySelector('#featuredBirdImage');
  const group = stage.querySelector('#featuredBirdGroup');
  const name = stage.querySelector('#featuredBirdName');
  const latin = stage.querySelector('#featuredBirdLatin');
  const place = stage.querySelector('#featuredBirdWhere');
  const presence = stage.querySelector('#featuredBirdPresence');
  const credit = stage.querySelector('#featuredBirdCredit');

  let pos = loadPosition();
  let shownIndex = -1, timer = null, lastTick = 0, lastSave = 0, destroyed = false;

  const onLoad = () => { if (!destroyed) { stage.classList.remove('has-no-photo'); stage.classList.add('has-photo'); } };
  const onError = () => { if (!destroyed) { stage.classList.add('has-no-photo'); stage.classList.remove('has-photo'); } };
  photo.addEventListener('load', onLoad);
  photo.addEventListener('error', onError);

  function show() {
    if (pos.index === shownIndex) return;
    shownIndex = pos.index;
    const bird = FEATURED_BIRDS[pos.index];
    const info = birdInfo(bird);
    stage.dataset.birdId = bird.id;
    stage.classList.remove('has-photo');
    photo.alt = bird.nl + (bird.pose === 'vlucht' ? ' in vlucht' : '');
    photo.src = bird.image;
    // hele foto in beeld (contain); dezelfde foto vervaagd als achtergrond vult de rest
    stage.style.setProperty('--bird-bg', `url("${bird.image}")`);
    if (group) group.textContent = bird.groupLabel;
    name.textContent = bird.nl;
    latin.textContent = bird.latin;
    place.textContent = info.recognition;
    if (presence) presence.textContent = info.presence;
    credit.textContent = 'Foto: ' + bird.author + ' · ' + bird.license + ' · Wikimedia Commons';
    credit.href = bird.source; credit.target = '_blank'; credit.rel = 'noopener noreferrer';
    // volgende foto alvast laden, zodat de wissel direct is
    const next = FEATURED_BIRDS[(pos.index + 1) % FEATURED_BIRDS.length];
    if (next && next !== bird) { const pre = new Image(); pre.src = next.image; }
  }

  function tick() {
    const now = performance.now();
    pos = advance(pos, now - lastTick);
    lastTick = now;
    show();
    if (now - lastSave >= SAVE_EVERY_MS) { savePosition(pos); lastSave = now; }
  }

  function start() {
    if (destroyed || ctx.destroyed || document.hidden || timer) return;
    lastTick = lastSave = performance.now();
    show();
    timer = setInterval(tick, 1000);
  }
  function stop() {
    if (!timer) return;
    tick();
    clearInterval(timer); timer = null;
    savePosition(pos);
  }

  const onVis = () => (document.hidden ? stop() : start());
  const onHide = () => stop();
  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('pagehide', onHide);
  start();

  return () => {
    stop();
    destroyed = true;
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('pagehide', onHide);
    photo.removeEventListener('load', onLoad);
    photo.removeEventListener('error', onError);
  };
}
