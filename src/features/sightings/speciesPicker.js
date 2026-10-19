/**
 * Soorten-picker sheet — Stap 5
 * Geeft een bottom sheet met zoekbalk en scrollbare lijst.
 * Roept onSelect(species) aan bij keuze.
 */

import { SPECIES } from '../../data/species.js';
import { escHtml } from '../../utils/html.js';

/**
 * @param {function(species): void} onSelect
 */
export function openSpeciesPicker(onSelect) {
  const ov = document.createElement('div');
  ov.className = 'sheet-overlay';
  ov.style.zIndex = '300';
  ov.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Kies soort">
      <div class="sheet__handle"></div>
      <div class="sheet__header">
        <span class="sheet__title">Kies soort</span>
        <button class="btn-close" id="spPickerClose">Sluiten</button>
      </div>
      <div class="sheet__content">
        <div style="padding-top:var(--space-12)">
          <div class="species-search-wrap">
            <svg class="species-search-icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="search" id="spPickerSearch" class="species-search"
              placeholder="Zoek soort of wetenschappelijke naam…"
              autocomplete="off" inputmode="search">
          </div>
          <div id="spPickerList" class="species-list"></div>
        </div>
      </div>
    </div>`;

  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.querySelector('.sheet').classList.add('open'));

  renderOpts(ov, '');

  const close = () => {
    ov.querySelector('.sheet').classList.remove('open');
    setTimeout(() => ov.remove(), 300);
  };

  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('#spPickerClose').addEventListener('click', close);
  ov.querySelector('.sheet__handle').addEventListener('click', close);

  ov.querySelector('#spPickerSearch').addEventListener('input', e => {
    renderOpts(ov, e.target.value);
  });

  ov.querySelector('#spPickerList').addEventListener('click', e => {
    const row = e.target.closest('.species-row');
    if (!row) return;
    const sp = SPECIES.find(x => x.id === row.dataset.id);
    if (!sp) return;
    close();
    onSelect(sp);
  });

  // Focus zoekbalk na animatie
  setTimeout(() => ov.querySelector('#spPickerSearch')?.focus(), 120);
}

function renderOpts(ov, query) {
  const q = query.toLowerCase().trim();
  const hits = SPECIES.filter(s =>
    !q ||
    s.nameNL.toLowerCase().includes(q) ||
    s.nameSci.toLowerCase().includes(q) ||
    (s.nameEN || '').toLowerCase().includes(q)
  );
  const list = ov.querySelector('#spPickerList');
  if (!hits.length) {
    list.innerHTML = `<div class="empty-state" style="padding-top:32px">
      <p>Geen soort gevonden voor "${escHtml(query)}"</p></div>`;
    return;
  }
  // Groepeer op familie
  const byFamily = {};
  hits.forEach(s => {
    if (!byFamily[s.family]) byFamily[s.family] = [];
    byFamily[s.family].push(s);
  });
  list.innerHTML = Object.entries(byFamily).map(([fam, birds]) => `
    <div class="species-group">
      <div class="species-group__label">${escHtml(fam)}</div>
      ${birds.map(s => `
        <div class="species-row" data-id="${s.id}" role="option" tabindex="0">
          <div class="species-row__icon" aria-hidden="true">${s.icon}</div>
          <div class="species-row__body">
            <div class="species-row__name">${escHtml(s.nameNL)}</div>
            <div class="species-row__sci">${escHtml(s.nameSci)}</div>
          </div>
        </div>`).join('')}
    </div>`).join('');
}
