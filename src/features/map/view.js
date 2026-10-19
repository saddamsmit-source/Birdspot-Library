/**
 * Kaart — view
 * Wordt gevuld in Stap 6.
 */
export function renderMap(el) {
  el.innerHTML = `
    <div class="page-header">
      <div class="page-header__title">Kaart</div>
      <div class="page-header__sub">Jouw waarnemingen in Europa</div>
    </div>
    <div class="empty-state" style="margin-top: 48px;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
      <p>Leaflet-kaart komt in Stap 6</p>
    </div>
  `;
}
