/**
 * Soorten-picker sheet — Stap 5
 * Geeft een bottom sheet met zoekbalk en scrollbare lijst.
 * Roept onSelect(species) aan bij keuze.
 */

import { SPECIES } from '../../data/species.js';
import { escHtml } from '../../utils/html.js';
import { appIcon } from '../../utils/icons.js';

/**
 * @param {function(species): void} onSelect
 * @param {{ recentIds?: string[] }} [options] UX-01C: recent gekozen soorten bovenaan (verborgen tijdens zoeken)
 */
export function openSpeciesPicker(onSelect, { recentIds = [] } = {}) {
  const recent = [...new Set(recentIds)].map(id => SPECIES.find(x => x.id === id)).filter(Boolean).slice(0, 6);
  const ov = document.createElement('div');
  ov.className = 'sheet-overlay';
  // Always above the sighting form and its sticky header in mobile stacking contexts.
  ov.style.zIndex = '2500';
  ov.id = 'speciesPickerOverlay';
  ov.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="spPickerTitle">
      <div class="sheet__handle"></div>
      <div class="sheet__header">
        <h2 class="sheet__title" id="spPickerTitle">Kies soort</h2>
        <button class="btn-close detail-close-btn" id="spPickerClose" type="button" aria-label="Soortkeuze sluiten">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
          <span>Sluiten</span>
        </button>
      </div>
      <div class="sheet__content">
        <div style="padding-top:var(--space-12)">
          <div class="species-search-wrap">
            <svg class="species-search-icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="search" id="spPickerSearch" class="species-search" aria-label="Zoek soort"
              placeholder="Zoek soort of wetenschappelijke naam…"
              autocomplete="off" inputmode="search">
          </div>
          ${recent.length ? `<div id="spPickerRecent" class="sp-recent" role="group" aria-label="Recent gekozen soorten">
            <span class="sp-recent__label">Recent</span>
            ${recent.map(sp => `<button type="button" class="sp-recent__chip" data-recent-id="${sp.id}">${escHtml(sp.nameNL)}</button>`).join('')}
          </div>` : ''}
          <div id="spPickerList" class="species-list"></div>
        </div>
      </div>
    </div>`;

  document.body.appendChild(ov);
  ov.classList.add('open');

  renderOpts(ov, '');

  let focusTimer = 0;
  const close = () => {
    // R2B H8: de uitgestelde focus mag nooit meer naar een kiezer gaan die al sluit;
    // anders verliest het volgende veld (bijv. Locatie) zijn focus en getypte tekst.
    clearTimeout(focusTimer);
    ov.classList.remove('open');
    setTimeout(() => ov.remove(), 300);
  };

  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('#spPickerClose').addEventListener('click', close);
  ov.querySelector('.sheet__handle').addEventListener('click', close);

  ov.querySelector('#spPickerSearch').addEventListener('input', e => {
    renderOpts(ov, e.target.value);
    const recentBox = ov.querySelector('#spPickerRecent');
    if (recentBox) recentBox.hidden = Boolean(e.target.value.trim());
  });
  ov.querySelector('#spPickerRecent')?.addEventListener('click', e => {
    const sp = SPECIES.find(x => x.id === e.target.closest('[data-recent-id]')?.dataset.recentId);
    if (!sp) return;
    close();
    onSelect(sp);
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
  focusTimer = setTimeout(() => ov.querySelector('#spPickerSearch')?.focus(), 120);
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
  // Soortgroepen A-Z op Nederlandse groepsnaam (Opdracht 2, 2026-11-10).
  // Niveau 2 (Opdracht 3, 2026-11-10): binnen iedere soortgroep ook de individuele vogels A-Z op
  // Nederlandse naam, niet op database-volgorde of ID.
  list.innerHTML = Object.entries(byFamily)
    .sort((a, b) => a[0].localeCompare(b[0], 'nl'))
    .map(([fam, birds]) => `
    <div class="species-group">
      <div class="species-group__label">${escHtml(fam)}</div>
      ${[...birds].sort((a, b) => a.nameNL.localeCompare(b.nameNL, 'nl')).map(s => `
        <div class="species-row" data-id="${s.id}" role="option" tabindex="0">
          <div class="species-row__icon bird-placeholder" aria-hidden="true">${appIcon('bird')}</div>
          <div class="species-row__body">
            <div class="species-row__name">${escHtml(s.nameNL)}</div>
            <div class="species-row__sci">${escHtml(s.nameSci)}</div>
          </div>
        </div>`).join('')}
    </div>`).join('');
}
