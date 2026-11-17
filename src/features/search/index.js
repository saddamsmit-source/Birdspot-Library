import { SPECIES } from '../../data/species.js';
import { getSightingsSnapshot } from '../../data/sightings.js';
import { loadPlaces } from '../../data/places.js';
import { getMediaMetadata } from '../../data/db.js';
import { getCollectionIds } from '../../storage/collections.js';
import { validPin } from '../sightings/evidence.js';

const shortcuts = [
  ['Home', 'Dashboard en recente waarnemingen', 'home', 'start overzicht dashboard'],
  ['Soorten', 'Vogelgids en soortenfilters', 'species', 'vogel herkennen vogelgids bibliotheek soort familie seizoen gebied'],
  ['Kaart', 'Explorer Map met je plekken en pins', 'map', 'explorer map locatie gps hotspots kaart'],
  ['Waarneming toevoegen', 'Open het invoerformulier', 'add', 'nieuw registreren gezien gehoord gps merlin geluid'],
  ['Waarnemingen', 'Bekijk je geregistreerde vogels', 'sightings', 'waarneming observatie meldingen lijst bewerken'],
  ['Media Studio', 'Bekijk je foto’s en video’s', 'media', 'wildlife media foto fotos fotografie video collectie'],
  ['Birding Journal', 'Je waarnemingen in een tijdlijn', 'journal', 'dagboek logboek tijdlijn notities'],
  ['Mijn Inzichten', 'Statistieken over je waarnemingen', 'insights', 'inzichten analyse statistieken grafieken soorten mijlpalen'],
  ['Wildlife Film Studio', 'Maak een film met je beelden', 'film', 'film video montage storyboard export'],
  ['Profiel', 'Jouw bibliotheek en instellingen', 'profile', 'profiel account instellingen bibliotheek'],
  ['Back-up en herstel', 'Open het onderdeel in je profiel', 'profile', 'backup back-up export import zip herstellen terugzetten bewaren', 'backupHeading'],
  ['Kaartfilters', 'Filter op gezien, gehoord en Merlin Sound ID', 'map', 'kaart filter filters merlin sound id gezien gehoord', 'mapFilterBtn'],
  ['Kaartlaag en luchtfoto', 'Wissel tussen kaart en luchtfoto', 'map', 'kaartlaag luchtfoto satelliet kaartlaag kaart lagen', 'mapLayerBtn'],
  ['Mijn locatie op de kaart', 'Centreer de kaart op je locatie', 'map', 'gps mijn locatie positie locatie bepalen centreren', 'mapLocateBtn'],
  ['Pin waarneming', 'Open de kaart bij de knop voor een pin', 'map', 'pin plaatsen vaste plek kaart coördinaten gps', 'mapAddPinBtn'],
  ['Bewaarde vogels', 'Open de favorietenfilter van de vogelgids', 'species', 'favorieten sterren opgeslagen soorten bewaart bewaarde vogels', 'speciesOnlyFavorites'],
  ['Gouden uur', 'Bekijk zonsopkomst en zonsondergang', 'home', 'zon gouden uur golden hour zonsopkomst zonsondergang', 'sunSection'],
  ['Weercondities', 'Bekijk het weer op het dashboard', 'home', 'weer wind temperatuur neerslag', 'weatherSection'],
  ['Waarnemingen per maand', 'Bekijk de maandgrafiek op Home', 'home', 'maand grafiek trend waarnemingen', 'monthlySection'],
];
const speciesById = new Map(SPECIES.map(species => [species.id, species]));
const normalize = value => String(value ?? '').toLocaleLowerCase('nl').normalize('NFD')
  .replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

function entry(title, detail, target, ...terms) {
  return { title, detail, target, name: normalize(title), haystack: normalize([title, detail, ...terms].join(' ')) };
}

const functions = shortcuts.map(([title, detail, route, terms, section]) => entry(title, detail, { route, section }, terms));
const birds = SPECIES.map(species => entry(species.nameNL, species.nameSci,
  { route: 'species', speciesId: species.id }, species.nameEN, species.family, ...(species.regions ?? [])));

function localEntries(sightings, places) {
  const placesById = new Map(places.filter(place => typeof place?.id === 'string').map(place => [place.id, place]));
  const mapEntries = new Map();
  for (const place of placesById.values()) {
    if (!validPin(place.lat, place.lon)) continue;
    mapEntries.set(place.id, { title: place.name, target: { route: 'map', placeId: place.id }, terms: [place.lat, place.lon] });
  }
  const observations = [];
  const observationsById = new Map();
  const observationsByPhoto = new Map();
  for (const sighting of sightings) {
    if (typeof sighting?.id !== 'string') continue;
    const { id, speciesId, speciesName, locationName, date, notes, lat, lon, placeId } = sighting;
    const species = speciesById.get(speciesId);
    const placeName = placesById.get(placeId)?.name || locationName;
    const name = speciesName || species?.nameNL || 'Onbekende soort';
    const terms = [name, species?.nameSci, species?.nameEN, placeName, locationName, date, notes,
      sighting.habitat, sighting.behavior, sighting.weather, sighting.observationMethod, sighting.identificationSource];
    const detail = [placeName, date].filter(Boolean).join(' · ');
    observations.push(entry(name, detail || 'Mijn waarneming', { route: 'sightings', sightingId: id }, ...terms));
    const related = { name, placeName, terms };
    observationsById.set(id, related);
    for (const photoId of Array.isArray(sighting.photoIds) ? sighting.photoIds : []) observationsByPhoto.set(photoId, related);
    if (!validPin(lat, lon)) continue;
    const key = mapEntries.has(placeId) ? placeId : `s:${id}`;
    if (!mapEntries.has(key)) mapEntries.set(key, {
      title: placeName || name, target: { route: 'map', sightingId: id }, terms: [lat, lon],
    });
    mapEntries.get(key).terms.push(name, species?.nameSci, locationName);
  }
  return {
    places: [...mapEntries.values()].map(({ title, target, terms }) => entry(title, 'Open op de kaart', target, ...terms)),
    observations,
    observationsById,
    observationsByPhoto,
    placesById,
  };
}

function mediaEntries(files, local) {
  const favorites = getCollectionIds('media');
  const film = getCollectionIds('film');
  return files.flatMap(file => {
    const place = local.placesById.get(file.placeId);
    const sighting = local.observationsById.get(file.sightingId) || local.observationsByPhoto.get(file.id);
    const species = speciesById.get(file.speciesId);
    const kind = file.type.startsWith('audio/') ? 'Geluid' : file.type.startsWith('video/') ? 'Video' : 'Foto';
    if (kind === 'Geluid' && !place) return [];
    const target = place ? { route: 'map', placeId: place.id, placeMediaId: file.id } : { route: 'media', mediaId: file.id };
    return [entry(file.filename || `${kind} van ${sighting?.name || species?.nameNL || place?.name || 'mijn collectie'}`,
      [kind, sighting?.name || species?.nameNL, place?.name || sighting?.placeName].filter(Boolean).join(' · '),
      target, file.addedAt, species?.nameSci, ...(sighting?.terms ?? []),
      favorites.has(file.id) ? 'favoriet' : '', film.has(file.id) ? 'filmselectie' : '')];
  });
}

const GROUP_LIMIT = 6;
const groupLabels = ['Functies', 'Vogelsoorten', 'Kaart en plekken', 'Waarnemingen', 'Media'];
const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>';

export function searchMarkup() {
  return `
    <button class="app-header__search app-search-trigger" id="homeSearchTrigger" type="button" aria-haspopup="dialog">
      ${icon}<span>Zoek in Birdspot</span>
    </button>
    <dialog class="app-search-dialog" id="appSearchDialog" aria-labelledby="appSearchTitle">
      <div class="app-search-head">
        <div class="app-search-heading"><h1 id="appSearchTitle">Zoek in Birdspot</h1>
          <button class="app-search-close" type="button" aria-label="Zoeken sluiten">×</button>
        </div>
        <form class="app-search-form" role="search">
          <label class="visually-hidden" for="homeSearch">Zoek in Birdspot</label>
          <input type="search" id="homeSearch" placeholder="Soort, plek, functie…" autocomplete="off"
            enterkeyhint="search" maxlength="160" autofocus>
          <button type="submit" aria-label="Zoeken">${icon}</button>
        </form>
      </div>
      <div class="app-search-content">
        <p class="app-search-status" role="status"></p>
        <div class="app-search-results"></div>
      </div>
    </dialog>`;
}

export function bindAppSearch(root, onSelect) {
  const dialog = root.querySelector('#appSearchDialog');
  const trigger = root.querySelector('#homeSearchTrigger');
  const input = dialog.querySelector('#homeSearch');
  const form = dialog.querySelector('form');
  const status = dialog.querySelector('[role="status"]');
  const results = dialog.querySelector('.app-search-results');
  let groups = [];
  let session = 0;
  let mediaStatus = '';
  const expanded = new Set();
  const viewport = window.visualViewport;
  function fitViewport() {
    if (!viewport) return;
    dialog.style.setProperty('--search-height', viewport.height + 'px');
    dialog.style.setProperty('--search-top', viewport.offsetTop + 'px');
  }
  function stopFitting() {
    viewport?.removeEventListener('resize', fitViewport);
    viewport?.removeEventListener('scroll', fitViewport);
  }

  function draw(focusGroup) {
    const query = normalize(input.value);
    const tokens = query.split(' ');
    const list = query ? groups : [functions.slice(0, GROUP_LIMIT)];
    const focusKey = document.activeElement?.dataset?.searchFocus;
    const fragment = document.createDocumentFragment();
    let count = 0;
    let nextFocus;
    for (const [index, entries] of list.entries()) {
      const matches = query ? entries.filter(item => tokens.every(token => item.haystack.includes(token))) : entries;
      const rank = item => item.name === query ? 0 : item.name.startsWith(query) ? 1 : item.name.includes(query) ? 2 : 3;
      if (query) matches.sort((a, b) => rank(a) - rank(b));
      if (!matches.length) continue;
      count += matches.length;
      const section = document.createElement('section');
      const heading = document.createElement('h2');
      heading.textContent = query ? groupLabels[index] : 'Snel naar';
      section.append(heading);
      const shown = expanded.has(index) ? matches : matches.slice(0, GROUP_LIMIT);
      for (const [position, item] of shown.entries()) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'app-search-result';
        button.dataset.searchFocus = index + ':' + position;
        const title = document.createElement('strong');
        title.textContent = item.title;
        const detail = document.createElement('span');
        detail.textContent = item.detail;
        button.append(title, detail);
        button.addEventListener('click', () => {
          dismiss();
          onSelect(item.target);
        });
        if (focusGroup === undefined ? focusKey === button.dataset.searchFocus :
          index === focusGroup && position === GROUP_LIMIT) nextFocus = button;
        section.append(button);
      }
      if (shown.length < matches.length) {
        const more = document.createElement('button');
        more.type = 'button';
        more.className = 'app-search-more';
        more.dataset.searchFocus = index + ':more';
        if (focusGroup === undefined && focusKey === more.dataset.searchFocus) nextFocus = more;
        more.textContent = `Meer ${groupLabels[index].toLowerCase()} (${matches.length - shown.length})`;
        more.addEventListener('click', () => { expanded.add(index); draw(index); });
        section.append(more);
      }
      fragment.append(section);
    }
    results.replaceChildren(fragment);
    nextFocus?.focus();
    const summary = query ? (count ? `${count} ${count === 1 ? 'resultaat' : 'resultaten'}` : 'Geen resultaten. Probeer een andere zoekterm.')
      : 'Zoek op een functie, soort, eigen plek, waarneming of bestandsnaam.';
    status.textContent = [summary, query && mediaStatus].filter(Boolean).join(' ');
  }

  trigger.addEventListener('click', async () => {
    const id = ++session;
    const local = localEntries(getSightingsSnapshot(), loadPlaces());
    groups = [functions, birds, local.places, local.observations, []];
    input.value = '';
    expanded.clear();
    mediaStatus = 'Media worden geladen…';
    dialog.showModal();
    fitViewport();
    viewport?.addEventListener('resize', fitViewport);
    viewport?.addEventListener('scroll', fitViewport);
    input.focus();
    draw();
    try {
      const files = await getMediaMetadata();
      if (id !== session || !dialog.open) return;
      groups[4] = mediaEntries(files, local);
      mediaStatus = '';
    } catch {
      if (id !== session || !dialog.open) return;
      mediaStatus = 'Media zoeken is tijdelijk niet beschikbaar.';
    }
    draw();
  });
  function dismiss() {
    stopFitting();
    dialog.close();
    trigger.focus({ preventScroll: true });
  }
  dialog.querySelector('.app-search-close').addEventListener('click', dismiss);
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
  });
  input.addEventListener('input', () => { expanded.clear(); draw(); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (normalize(input.value)) results.querySelector('.app-search-result')?.click();
  });

  return () => {
    session++;
    stopFitting();
    if (dialog.open) dialog.close();
  };
}
