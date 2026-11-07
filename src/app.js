/**
 * BIRDSPOT LIBRARY — App bootstrap & router
 * src/app.js
 *
 * Verantwoordelijk voor:
 * - Routes registreren
 * - Navigatie aansturen
 * - FAB zichtbaarheid
 * - Schermen lazy-laden
 */

import { renderHome }       from './features/home/view.js';
import {
  renderSpecies, getSpeciesNavigationState, restoreSpeciesNavigationState,
} from './features/species/view.js';
import { renderSightings }  from './features/sightings/view.js';
import { renderMap }        from './features/map/view.js';
import { renderProfile }    from './features/profile/view.js';
import { renderMedia }      from './features/media/view.js';
import { renderJournal }    from './features/journal/view.js';
import { renderInsights }   from './features/insights/view.js';
import { renderFilmStudio } from './features/film/view.js';
import { openAddSheet }     from './features/sightings/addSheet.js';
import { closeTopLayer }    from './services/navigation.js';

// ── Routes ────────────────────────────────────────────────
const ROUTES = {
  home:      { render: renderHome,      fab: true  },
  species:   { render: renderSpecies,   fab: true  },
  sightings: { render: renderSightings, fab: true  },
  map:       { render: renderMap,       fab: true  },
  profile:   { render: renderProfile,   fab: true  },
  media:     { render: renderMedia,     fab: true  },
  journal:   { render: renderJournal,   fab: true  },
  insights:  { render: renderInsights,  fab: true  },
  film:      { render: renderFilmStudio, fab: true  },
};

let currentRoute = null;
let currentCleanup = null;
let currentEntry = null;
let entrySequence = 0;
let returningToEntry = false;
let leavingRoot = false;
const entries = new Map();
const main = document.getElementById('main-view');

function rememberEntry() {
  entries.set(currentEntry.id, {
    scrollTop: main.scrollTop,
    species: currentRoute === 'species' ? getSpeciesNavigationState() : null,
    map: currentRoute === 'map' ? {
      search: document.getElementById('mapSpeciesSearch')?.value,
      status: document.getElementById('mapStatusSelect')?.value,
    } : null,
  });
}

function makeEntry(route, depth) {
  return { birdspot: true, route, depth, id: `${performance.timeOrigin}:${++entrySequence}` };
}

export function navigate(route, { force = false, searchQuery } = {}) {
  if (!Object.hasOwn(ROUTES, route)) return;
  if (route === currentRoute) {
    if (force || searchQuery !== undefined) renderRoute(route, null, searchQuery);
    return;
  }

  rememberEntry();
  currentEntry = makeEntry(route, currentEntry.depth + 1);
  history.pushState(currentEntry, '');
  renderRoute(route, null, searchQuery);
}

function renderRoute(route, saved, searchQuery) {
  currentRoute = route;
  if (saved?.species && route === 'species') restoreSpeciesNavigationState(saved.species);

  // Roep cleanup van het vorige scherm aan vóór we de DOM wissen.
  // Dit stopt timers, geeft blob-URL's vrij en zet destroyed=true zodat
  // lopende async-callbacks stil stoppen zonder het nieuwe scherm te raken.
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  // Scherm wisselen
  main.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen active';
  screen.id = `screen-${route}`;
  main.appendChild(screen);
  const result = route === 'map' ? renderMap(screen, { selection: saved?.map, searchQuery })
    : ROUTES[route].render(screen, searchQuery);
  // Sla cleanup-functie op als de render er één retourneert (bijv. renderHome)
  if (typeof result === 'function') currentCleanup = result;

  // Navigatie-state
  document.querySelectorAll('.nav-item').forEach(btn => {
    const active = btn.dataset.route === route;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-current', active ? 'page' : 'false');
  });

  // FAB
  const fab = document.getElementById('fab');
  if (fab) fab.hidden = !ROUTES[route].fab;

  main.scrollTop = 0;
  if (saved?.scrollTop) {
    // Sommige schermen vullen hun inhoud na een IndexedDB-read.
    Promise.resolve(result).then(() => {
      if (screen.isConnected) main.scrollTop = saved.scrollTop;
    });
  }
}

// ── Navigatie-klikken ─────────────────────────────────────
document.getElementById('app-nav').addEventListener('click', e => {
  const btn = e.target.closest('.nav-item');
  if (!btn) return;
  navigate(btn.dataset.route);
});

// ── FAB-klik → waarneming toevoegen ───────────────────────
document.getElementById('fab').addEventListener('click', () => {
  openAddSheet({
    onSaved: () => {
      // Als we op home staan: herlaad home zodat recentSightings bijgewerkt is.
      // Als we op sightings staan (of ergens anders): navigeer naar sightings.
      if (currentRoute === 'home') {
        navigate('home', { force: true });
      } else {
        navigate('sightings', { force: true });
      }
    },
  });
});

// ── Toast utility ─────────────────────────────────────────
let toastTimer = null;
export function showToast(msg, duration = 2800) {
  let toast = document.querySelector('.toast:not(.app-update)');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Start ─────────────────────────────────────────────────
history.scrollRestoration = 'manual';
const previous = history.state;
if (previous?.birdspot && Object.hasOwn(ROUTES, previous.route)) {
  currentEntry = previous;
} else {
  history.replaceState({ birdspotRoot: true }, '');
  currentEntry = makeEntry('home', 0);
  history.pushState(currentEntry, '');
}
window.addEventListener('popstate', event => {
  if (returningToEntry) {
    returningToEntry = false;
    return;
  }
  const target = event.state;
  const goingBack = target?.birdspotRoot ||
    (target?.birdspot && target.depth < currentEntry.depth);
  if (goingBack && closeTopLayer()) {
    // Herstel dezelfde history-entry zonder de forward-geschiedenis te wissen.
    returningToEntry = true;
    history.forward();
    return;
  }
  if (target?.birdspotRoot) {
    if (leavingRoot) {
      leavingRoot = false;
      history.back();
      return;
    }
    leavingRoot = true;
    returningToEntry = true;
    history.forward();
    showToast('Tik nogmaals op Terug om Birdspot te verlaten');
    setTimeout(() => { leavingRoot = false; }, 2800);
    return;
  }
  if (!target?.birdspot || !Object.hasOwn(ROUTES, target.route)) return;
  leavingRoot = false;
  rememberEntry();
  currentEntry = target;
  renderRoute(target.route, entries.get(target.id));
});
renderRoute(currentEntry.route);
// Splash waits until the application home route is actually initialized.
window.dispatchEvent(new Event('birdspot:ready'));

