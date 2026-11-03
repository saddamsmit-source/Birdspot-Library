/**
 * Birdspot Signature · Personal Birding Journal
 * Derived entirely from existing sightings; no duplicate journal database.
 */
import { getSightings } from '../../data/sightings.js';
import { openDetailSheet } from '../sightings/detailSheet.js';
import { escHtml } from '../../utils/html.js';

const fmtDay = iso => {
  if (!iso) return 'Datum onbekend';
  const d = new Date(iso + 'T12:00:00');
  return Number.isNaN(d.getTime()) ? 'Datum onbekend' :
    d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
};

export function renderJournal(el) {
  let destroyed = false;
  let items = [];
  let year = 'all';

  el.classList.add('signature-screen', 'signature-journal');
  el.innerHTML = '<header class="signature-page-hero signature-page-hero--journal">' +
    '<span class="signature-kicker">BIRDSPOT / FIELD NOTES</span>' +
    '<h1>Personal Birding Journal</h1>' +
    '<p>Een persoonlijk verhaal, opgebouwd uit jouw echte vogelwaarnemingen.</p>' +
    '<div class="signature-orbit" aria-hidden="true"></div></header>' +
    '<div class="signature-content">' +
      '<div class="signature-milestones" id="journalMilestones" aria-label="Mijlpalen"></div>' +
      '<div class="signature-section-head"><div><span class="signature-eyebrow">JOUW VERHAAL</span><h2>Waarnemingen in de tijd</h2></div>' +
      '<label class="signature-year-label">Jaar <select id="journalYear" aria-label="Filter op jaar"><option value="all">Alle jaren</option></select></label></div>' +
      '<div id="journalTimeline" class="signature-timeline" aria-live="polite"><p class="signature-empty">Je dagboek wordt geladen…</p></div>' +
      '</div>';

  const timeline = el.querySelector('#journalTimeline');
  const milestones = el.querySelector('#journalMilestones');
  const select = el.querySelector('#journalYear');

  function draw() {
    if (destroyed) return;
    const filtered = items.filter(s => year === 'all' || String(s.date || '').startsWith(year + '-'));
    if (!filtered.length) {
      timeline.innerHTML = '<div class="signature-empty"><span aria-hidden="true">✧</span><h3>Je verhaal begint hier</h3><p>Leg je eerste vogelwaarneming vast. Elke waarneming wordt een herinnering in je dagboek.</p></div>';
      return;
    }
    const byDay = new Map();
    filtered.forEach(s => {
      const key = s.date || 'onbekend';
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(s);
    });
    timeline.innerHTML = [...byDay].map(([date, dayItems]) =>
      '<section class="signature-journal-day"><h3 class="signature-journal-date">' + escHtml(fmtDay(date)) + '</h3>' +
      dayItems.map(s => '<button class="signature-journal-entry" data-journal-id="' + escHtml(s.id) + '">' +
        '<span class="signature-journal-mark" aria-hidden="true">✦</span>' +
        '<span class="signature-journal-copy"><strong>' + escHtml(s.speciesName || 'Onbekende soort') + '</strong>' +
        '<small>' + escHtml(s.locationName || 'Locatie niet vastgelegd') +
        (s.count > 1 ? ' · ' + s.count + ' exemplaren' : '') + '</small>' +
        (s.notes ? '<em>' + escHtml(String(s.notes).slice(0,130)) + '</em>' : '') + '</span>' +
        '<span class="signature-journal-arrow" aria-hidden="true">↗</span></button>').join('') +
      '</section>').join('');
  }

  const onChange = e => {
    if (e.target.id !== 'journalYear') return;
    year = e.target.value;
    draw();
  };
  const onClick = event => {
    const target = event.target.closest('[data-journal-id]');
    if (!target) return;
    const sighting = items.find(s => s.id === target.dataset.journalId);
    if (!sighting) return;
    openDetailSheet(sighting, {
      onDeleted: () => import('../../app.js').then(({ navigate }) => navigate('journal', { force: true })),
      onUpdated: () => import('../../app.js').then(({ navigate }) => navigate('journal', { force: true })),
    });
  };

  el.addEventListener('change', onChange);
  el.addEventListener('click', onClick);

  (async () => {
    try {
      const data = await getSightings();
      if (destroyed) return;
      items = [...data].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      const types = new Set(items.map(s => s.speciesId).filter(Boolean));
      const places = new Set(items.map(s => s.locationName).filter(Boolean));
      milestones.innerHTML =
        '<div class="signature-milestone"><strong>' + types.size + '</strong><span>Vogelsoorten ontdekt</span></div>' +
        '<div class="signature-milestone"><strong>' + items.length + '</strong><span>Waarnemingen</span></div>' +
        '<div class="signature-milestone"><strong>' + places.size + '</strong><span>Locaties bezocht</span></div>';
      const years = [...new Set(items.map(s => String(s.date || '').slice(0,4)).filter(y => /^\d{4}$/.test(y)))].sort().reverse();
      years.forEach(y => {
        const option = document.createElement('option');
        option.value = y; option.textContent = y;
        select.appendChild(option);
      });
      draw();
    } catch (_) {
      if (!destroyed) timeline.innerHTML = '<div class="signature-empty"><h3>Dagboek niet beschikbaar</h3><p>Controleer de lokale gegevens en probeer het opnieuw.</p></div>';
    }
  })();

  return () => {
    destroyed = true;
    el.removeEventListener('change', onChange);
    el.removeEventListener('click', onClick);
  };
}
