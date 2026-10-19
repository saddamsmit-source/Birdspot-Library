/**
 * Profiel / Instellingen — view
 * Wordt gevuld in Stap 7.
 */
export function renderProfile(el) {
  el.innerHTML = `
    <div class="page-header">
      <div class="page-header__title">Profiel</div>
      <div class="page-header__sub">Instellingen &amp; export</div>
    </div>
    <div class="empty-state" style="margin-top: 48px;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <p>Profiel &amp; instellingen komt in Stap 7</p>
    </div>
  `;
}
