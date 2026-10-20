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
import { renderSpecies }    from './features/species/view.js';
import { renderSightings }  from './features/sightings/view.js';
import { renderMap }        from './features/map/view.js';
import { renderProfile }    from './features/profile/view.js';
import { openAddSheet }     from './features/sightings/addSheet.js';

// ── Routes ────────────────────────────────────────────────
const ROUTES = {
  home:      { render: renderHome,      fab: true  },
  species:   { render: renderSpecies,   fab: true  },
  sightings: { render: renderSightings, fab: true  },
  map:       { render: renderMap,       fab: true  },
  profile:   { render: renderProfile,   fab: false },
};

let currentRoute = null;

// ── Navigeer naar een route (force=true herlaadt ook het huidige scherm) ──────
export function navigate(route, { force = false } = {}) {
  if (!ROUTES[route]) return;
  if (route === currentRoute && !force) return;
  currentRoute = route;

  // Scherm wisselen
  const main = document.getElementById('main-view');
  main.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen active';
  screen.id = `screen-${route}`;
  main.appendChild(screen);
  ROUTES[route].render(screen);

  // Navigatie-state
  document.querySelectorAll('.nav-item').forEach(btn => {
    const active = btn.dataset.route === route;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-current', active ? 'page' : 'false');
  });

  // FAB
  const fab = document.getElementById('fab');
  if (fab) fab.hidden = !ROUTES[route].fab;

  // Scroll naar top
  main.scrollTo({ top: 0 });
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
      // Herlaad de sightings-view (force=true zodat het ook werkt als we er al zijn)
      navigate('sightings', { force: true });
    },
  });
});

// ── Toast utility ─────────────────────────────────────────
let toastTimer = null;
export function showToast(msg, duration = 2800) {
  let toast = document.querySelector('.toast');
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
navigate('home');
