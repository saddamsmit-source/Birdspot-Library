/**
 * Waarneming detail — bottom sheet (Fase D)
 * Toont alle velden van een opgeslagen waarneming (v2 schema).
 * Media: objectURLs worden gemaakt vanuit IndexedDB blobs.
 * Acties: Bewerken (opent editSheet) · Verwijder (met confirmatie).
 *
 * @param {object}   sighting
 * @param {{ onDeleted?: function, onUpdated?: function, isActive?: function }} options
 */

import { deleteSighting, updateSighting }   from '../../data/sightings.js';
import { getPhotosBySighting, getPhoto, deletePhoto, isSightingAudio } from '../../data/db.js';
import { methodLabel, verificationStatus, normalizeEvidence, observedBySound, countsForList } from './evidence.js';
import { escHtml }                          from '../../utils/html.js';
import { openPhotoViewer } from '../../utils/photoViewer.js';
import { showToast }                        from '../../app.js';
import { openEditSheet }                    from './addSheet.js';
import { releaseSightingAudio }             from '../../data/sightingAudio.js';
import { loadPlaces, renamePlace }         from '../../data/places.js';
import { placeOf }                          from './sightingQuery.js';
import { appIcon }                          from '../../utils/icons.js';

const CERTAINTY_NL = {
  certain:  'Zeker',
  probable: 'Waarschijnlijk',
  possible: 'Mogelijk',
};

export async function openDetailSheet(sighting, { onDeleted, onUpdated, onPlaceRenamed, isActive = () => true } = {}) {
  // Laad media uit IndexedDB
  // Ronde 3: eigen geluidsopnamen apart houden (nooit in de foto-/videogalerij).
  const photos = (await getPhotosBySighting(sighting.id).catch(() => [])).filter(p => !isSightingAudio(p));
  const audioIds = Array.isArray(sighting.audioIds) ? sighting.audioIds : [];
  const audio = [];
  for (const id of audioIds) audio.push({ id, record: await getPhoto(id).catch(() => null) });
  // Fallback for legacy photos linked through sighting.photoIds only.
  const ids = new Set(photos.map(p=>p.id));
  for (const id of (sighting.photoIds || [])) {
    if(ids.has(id))continue;
    const photo = await getPhoto(id).catch(()=>null);
    if(photo){photos.push(photo);ids.add(id);}
  }

  if (!isActive()) return;
  const ov = document.createElement('div');
  ov.className = 'sheet-overlay';
  ov.id = 'detailSightingSheet';

  ov.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true"
      aria-label="${escHtml(sighting.speciesName)}">
      <div class="sheet__handle"></div>
      <div class="sheet__header detail-header">
        <span class="sheet__title">${escHtml(sighting.speciesName)}</span>
        <div class="detail-header-actions">
          <button class="btn-secondary detail-edit-btn" id="detailEdit" type="button">
            Bewerken
          </button>
          <button class="btn-close detail-close-btn" id="detailClose" type="button" aria-label="Sluiten en terug naar de lijst">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
            <span>Sluiten</span>
          </button>
        </div>
      </div>
      <div class="sheet__content" id="detailSheetContent">
        ${_renderDetailBody(sighting, photos, audio)}
      </div>
      <div class="sheet__footer detail-footer">
        <button class="btn-danger" id="detailDelete" type="button">
          Waarneming verwijderen
        </button>
      </div>
    </div>`;

  const previousFocus = document.activeElement;
  let closed = false;
  let closePhoto;
  document.body.appendChild(ov);
  requestAnimationFrame(() => { if (!closed) ov.classList.add('open'); });

  const onKey = e => {
    if (e.key === 'Escape' && !document.querySelector('.confirm-overlay, .lightbox')) close();
  };
  const close = () => {
    if (closed) return;
    closed = true;
    closePhoto?.(false);
    ov.classList.remove('open');
    document.removeEventListener('keydown',onKey);
    setTimeout(() => { ov.remove(); _releaseUrls(); previousFocus?.focus?.(); }, 300);
  };
  document.addEventListener('keydown',onKey);
  ov.querySelector('#detailClose')?.focus();

  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('.sheet__handle').addEventListener('click', close);
  ov.querySelector('#detailClose').addEventListener('click', close);

  // ── Bewerken ─────────────────────────────────────────────
  ov.querySelector('#detailEdit').addEventListener('click', () => {
    // Sluit dit detail-sheet, open editSheet
    close();
    openEditSheet(sighting, {
      onSaved: updated => {
        onUpdated?.(updated);
      },
    });
  });

  // ── UX-03R (M1): oude BirdNET-waarneming bewust zelf controleren ──────────
  // Alleen deze expliciete handeling (knop + aangevinkte bevestiging) legt eigen controle vast.
  // Opslaan via Bewerken zonder die keuze verandert niets. soundSuggestion blijft als bewijs bewaard.
  ov.querySelector('#detailSelfCheck')?.addEventListener('click', async e => {
    const trigger = e.currentTarget;
    const ok = await _confirmSelfCheck(sighting);
    if (!ok) { trigger.focus(); return; }
    let updated;
    try {
      updated = await updateSighting(sighting.id, {}, { resolve: current => {
        if (verificationStatus(current).key !== 'check-unknown') throw new Error('Waarneming is intussen gewijzigd');
        return normalizeEvidence({ observationMethod: current.observationMethod, identificationSource: 'birdnet', birdnetVerification: 'checked' });
      } });
    } catch (_) {
      showToast('Eigen controle kon niet worden opgeslagen; er is niets gewijzigd.', 'error');
      return;
    }
    close();
    onUpdated?.(updated);
    showToast(countsForList(updated)
      ? 'Eigen controle vastgelegd. Deze waarneming telt nu mee in je lijsten.'
      : 'Eigen controle vastgelegd. Door zekerheid ‘mogelijk’ telt ze nog niet mee.', 'success');
  });

  // ── Verwijder (met bevestiging) ───────────────────────────
  ov.querySelector('#detailDelete').addEventListener('click', async () => {
    const confirmed = await _confirm(
      'Waarneming verwijderen?',
      'Deze actie kan niet ongedaan gemaakt worden.',
    );
    if (!confirmed) return;

    // Eerst het persistente record bijwerken. Bij opslagfout blijven foto's intact.
    try {
      await deleteSighting(sighting.id);
    } catch (_) {
      showToast('Verwijderen mislukt. De waarneming en foto’s zijn behouden.', 'error');
      return;
    }
    // Pas na succesvolle recordopslag verwijderbare media opruimen (foto's, video's en eigen opnamen).
    for (const id of (sighting.photoIds || [])) {
      await deletePhoto(id).catch(() => {});
    }
    // Opnamen alleen echt weg als de veiligheidskopie ze niet meer nodig heeft (Terugzetten).
    await releaseSightingAudio(audioIds).catch(() => {});
    close();
    showToast('Waarneming verwijderd', 'success');
    onDeleted?.(sighting);
  });

  // ── UX-02C: automatisch benoemde plek een eigen naam geven ─
  _bindPlaceRename(ov, sighting, onPlaceRenamed);

  // ── Lightbox op mediabestanden ────────────────────────────
  ov.querySelectorAll('.detail-media__item[data-url]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      if (trigger.dataset.type.startsWith('video/')) {
        _openVideoLightbox(trigger.dataset.url);
        return;
      }
      closePhoto?.(false);
      closePhoto = openPhotoViewer({
        url: trigger.dataset.url, alt: trigger.querySelector('img').alt, trigger,
        onClose: () => { closePhoto = undefined; },
      });
    });
  });
}

// ── Detail body HTML ───────────────────────────────────────
function _renderDetailBody(s, photos, audio = []) {
  const dateStr = fmtDate(s.date) + (s.time ? ` · ${s.time}` : '');

  return `
    ${_renderSummary(s, dateStr, photos, audio)}
    <div class="detail-field-group">

      <!-- Aantal (zekerheid staat in de samenvatting bovenaan) -->
      <div class="detail-field">
        <div class="detail-field__label">Aantal</div>
        <div class="detail-field__value">${s.count ?? 1}</div>
      </div>

      <!-- Waarnemingswijze en identificatiebron -->
      <div class="detail-field">
        <div class="detail-field__label">Waargenomen via</div>
        <div class="detail-field__value"><span class="sighting-evidence-detail">${escHtml(methodLabel(s))}</span></div>
      </div>
      ${(() => {
        // UX-03B: één statusbron; dezelfde tekst als lijst, kaart, soortkaart en filter.
        const st = verificationStatus(s);
        return `
        <div class="detail-field detail-field--status" data-status="${st.key}"><div class="detail-field__label">Herkenning</div>
          <div class="detail-field__value"><span class="detail-status detail-status--${st.tone}">${appIcon('shield')} ${escHtml(st.label)}</span></div>
          ${st.hint ? `<p class="detail-field__hint">${escHtml(st.hint)}</p>` : ''}
          ${st.key === 'check-unknown' ? `<button type="button" class="btn-secondary detail-selfcheck-btn" id="detailSelfCheck">${appIcon('shield')} Identificatie zelf controleren</button>` : ''}
        </div>
        ${st.tone === 'warn' && s.certainty === 'certain' ? `
        <p class="detail-field__hint sighting-evidence-conflict" role="note">Zekerheid staat op ‘zeker’, maar eigen controle is niet vastgelegd. Deze waarneming telt daarom niet mee in je lijsten.</p>` : ''}`;
      })()}

      <!-- GPS-pin (de plek zelf staat in de samenvatting bovenaan) -->
      ${s.lat != null && s.lon != null ? `
      <div class="detail-field">
        <div class="detail-field__label">GPS-pin</div>
        <div class="detail-field__value detail-field__value--coords">${Number(s.lat).toFixed(5)}, ${Number(s.lon).toFixed(5)}</div>
      </div>` : ''}

      <!-- Habitat, gedrag, weer als chips (alleen tonen als ingevuld) -->
      ${(s.habitat || s.behavior || s.weather) ? `
      <div class="detail-field">
        <div class="detail-field__label">Context</div>
        <div class="detail-field__value">
          <div class="detail-chip-row">
            ${s.habitat  ? `<span class="detail-chip detail-chip--habitat">${escHtml(_capFirst(s.habitat))}</span>`  : ''}
            ${s.behavior ? `<span class="detail-chip detail-chip--behavior">${escHtml(_capFirst(s.behavior))}</span>` : ''}
            ${s.weather  ? `<span class="detail-chip detail-chip--weather">${escHtml(_capFirst(s.weather))}</span>`   : ''}
          </div>
        </div>
      </div>` : ''}

      <!-- Notitie -->
      ${s.notes ? `
      <div class="detail-field">
        <div class="detail-field__label">Notitie</div>
        <div class="detail-field__value detail-field__value--notes">${escHtml(s.notes)}</div>
      </div>` : ''}

    </div>

    ${photos.length ? `
    <div class="detail-field__label" style="margin-top:var(--space-16)">
      Foto's &amp; video's (${photos.length})
    </div>
    <div class="detail-media-grid">
      ${photos.map(p => {
        const url = _blobToUrl(p);
        if (!url) return '';
        const isVideo = p.type?.startsWith('video/');
        return `<button type="button" class="detail-media__item" aria-label="${isVideo ? 'Bekijk video' : 'Vergroot foto'}" data-url="${escHtml(url)}"
          data-type="${escHtml(p.type || '')}">
          ${isVideo
            ? `<video src="${escHtml(url)}" class="detail-media__img" muted playsinline></video>
               <span class="detail-media__badge">▶</span>`
            : `<img src="${escHtml(url)}" class="detail-media__img"
                 alt="${escHtml(p.filename || '')}">`}
        </button>`;
      }).join('')}
    </div>` : ''}
    ${audio.length ? `
    <div class="detail-field__label" style="margin-top:var(--space-16)">Geluidsopnamen (${audio.length})</div>
    <div class="detail-audio-list">
      ${audio.map(({ id, record }) => {
        const url = record && isSightingAudio(record) ? _blobToUrl(record) : null;
        return `<div class="detail-audio" data-audioid="${escHtml(id)}">
          <div class="detail-audio__name">${escHtml(record?.filename || 'Opname')}</div>
          ${url ? `<audio class="detail-audio__player" controls preload="metadata" src="${escHtml(url)}"></audio>`
                : '<p class="detail-field__hint">Opname ontbreekt op dit toestel.</p>'}
        </div>`;
      }).join('')}
    </div>` : ''}`;
}

/**
 * UX-02B: in één oogopslag wat, wanneer, waar, hoe zeker en welk bewijs. Kleur is nooit de enige aanwijzing.
 */
function _renderSummary(s, dateStr, photos, audio) {
  const places = new Map(loadPlaces().filter(place => place?.id).map(place => [place.id, place]));
  const where = placeOf(s, places);
  const whereText = {
    named: escHtml(where.name),
    auto: `<span class="detail-place-name">${escHtml(where.name)}</span> <span class="detail-summary__hint">automatische naam</span>
      <button type="button" class="detail-place-rename" id="detailPlaceRename" data-place-id="${escHtml(where.place?.id || '')}">Geef een naam</button>
      <form class="detail-place-form" id="detailPlaceForm" hidden>
        <label for="detailPlaceInput">Naam voor deze plek</label>
        <input id="detailPlaceInput" maxlength="80" autocomplete="off" placeholder="Bijv. Kijkhut Zuid" enterkeyhint="done">
        <span class="detail-place-form__actions">
          <button type="submit" class="btn-primary">Bewaar</button>
          <button type="button" class="btn-secondary" id="detailPlaceCancel">Annuleer</button>
        </span>
        <span class="detail-place-form__hint">Geldt voor alle waarnemingen op deze plek.</span>
      </form>`,
    'text-pin': `${escHtml(where.name)} <span class="detail-summary__hint">met GPS-pin</span>`,
    text: `${escHtml(where.name)} <span class="detail-summary__hint">zonder pin</span>`,
    gps: `Alleen GPS-coördinaten <span class="detail-summary__hint">${escHtml(where.name)}</span>`,
    none: 'Geen plek vastgelegd',
  }[where.kind];
  // UX-03B: een suggestie zonder eigen controle (of met onbekende controle) is nooit 'Zeker'.
  const st = verificationStatus(s);
  const sure = st.tone === 'warn'
    ? `<span class="detail-sure detail-sure--unchecked">${escHtml(st.label)}</span>`   // UX-03C: uitleg alleen bij Herkenning, niet dubbel
    : `<span class="detail-sure detail-sure--${escHtml(s.certainty || 'certain')}">${escHtml(CERTAINTY_NL[s.certainty] || 'Zeker')}</span>
       ${st.key !== 'self' ? `<span class="detail-summary__hint">${escHtml(st.label)}</span>` : ''}`;
  const evidence = [
    photos.length ? `${photos.length} ${photos.length === 1 ? 'foto of video' : 'foto’s of video’s'}` : '',
    audio.length ? `${audio.length} ${audio.length === 1 ? 'geluidsopname' : 'geluidsopnamen'}` : '',
    s.soundSuggestion ? 'BirdNET-suggestie bewaard' : '',
  ].filter(Boolean);
  return `
    <dl class="detail-summary" aria-label="Samenvatting">
      <div class="detail-summary__row"><dt>${appIcon('calendar')}<span class="visually-hidden">Wanneer</span></dt>
        <dd>${escHtml(dateStr || 'Geen datum')}</dd></div>
      <div class="detail-summary__row detail-summary__row--where" data-place-kind="${where.kind}"><dt>${appIcon('pin')}<span class="visually-hidden">Waar</span></dt>
        <dd>${whereText}</dd></div>
      <div class="detail-summary__row"><dt>${appIcon('shield')}<span class="visually-hidden">Hoe zeker</span></dt>
        <dd>${sure}</dd></div>
      <div class="detail-summary__row"><dt>${appIcon('camera')}<span class="visually-hidden">Bewijs</span></dt>
        <dd>${evidence.length ? escHtml(evidence.join(' · ')) : 'Geen foto’s of geluid'}</dd></div>
    </dl>`;
}

function _bindPlaceRename(ov, sighting, onPlaceRenamed) {
  const btn = ov.querySelector('#detailPlaceRename');
  const form = ov.querySelector('#detailPlaceForm');
  if (!btn || !form) return;
  const input = form.querySelector('#detailPlaceInput');
  const toggle = open => {
    form.hidden = !open;
    btn.hidden = open;
    if (open) input.focus(); else btn.focus();
  };
  btn.addEventListener('click', () => toggle(true));
  form.querySelector('#detailPlaceCancel').addEventListener('click', () => toggle(false));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) { showToast('Vul een naam in voor deze plek', 'warn'); input.focus(); return; }
    const save = form.querySelector('[type="submit"]');
    save.disabled = true;
    try {
      // Alleen de naam van precies deze gekoppelde plek; geen andere koppeling of coördinaat verandert.
      const place = await renamePlace(btn.dataset.placeId, name);
      if (!place) throw new Error('plek niet gevonden');
      const row = ov.querySelector('.detail-summary__row--where dd');
      row.innerHTML = `${escHtml(place.name)}`;
      row.closest('.detail-summary__row').dataset.placeKind = 'named';
      showToast(`Plek heet nu ${place.name}`, 'success');
      onPlaceRenamed?.(place, sighting);
    } catch (_) {
      save.disabled = false;
      showToast('Naam opslaan mislukt; er is niets gewijzigd', 'error');
    }
  });
}

// ── Lightbox ───────────────────────────────────────────────
function _openVideoLightbox(url) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <video src="${escHtml(url)}" controls autoplay playsinline
           style="max-width:100%;max-height:90vh;border-radius:8px"></video>
    <button class="lightbox__close" aria-label="Sluiten">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
        style="width:20px;height:20px">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>`;
  document.body.appendChild(lb);
  lb.addEventListener('click', e => {
    if (e.target === lb || e.target.closest('.lightbox__close')) lb.remove();
  });
}

// ── Async bevestiging (geen browser confirm/alert) ─────────
function _confirm(title, message) {
  return new Promise(resolve => {
    const dlg = document.createElement('div');
    dlg.className = 'confirm-overlay';
    dlg.innerHTML = `
      <div class="confirm-dialog" role="alertdialog" aria-modal="true"
        aria-labelledby="confirmTitle" aria-describedby="confirmMsg">
        <div class="confirm-dialog__title" id="confirmTitle">${escHtml(title)}</div>
        <div class="confirm-dialog__body"  id="confirmMsg">${escHtml(message)}</div>
        <div class="confirm-dialog__actions">
          <button class="btn-secondary confirm-cancel" type="button">Annuleer</button>
          <button class="btn-danger   confirm-ok"     type="button">Verwijderen</button>
        </div>
      </div>`;
    document.body.appendChild(dlg);
    const finish = (result) => { dlg.remove(); resolve(result); };
    dlg.querySelector('.confirm-cancel').addEventListener('click', () => finish(false));
    dlg.querySelector('.confirm-ok').addEventListener('click',     () => finish(true));
    dlg.addEventListener('click', e => { if (e.target === dlg) finish(false); });
  });
}

/**
 * UX-03R (M1): bevestiging voor eigen controle van een oude BirdNET-suggestie.
 * 'Eigen controle vastleggen' is pas te kiezen na het aanvinken van de bevestiging. Escape of Annuleer = niets wijzigen.
 */
function _confirmSelfCheck(s) {
  return new Promise(resolve => {
    const name = escHtml(s.speciesName || 'deze soort');
    const sug = s.soundSuggestion || {};
    const score = Number.isFinite(Number(sug.score)) ? ` (score ${Number(sug.score).toFixed(2).replace('.', ',')})` : '';
    const soundOk = observedBySound({ observationMethod: s.observationMethod });
    const dlg = document.createElement('div');
    dlg.className = 'confirm-overlay';
    dlg.innerHTML = `
      <div class="confirm-dialog selfcheck-dialog" role="dialog" aria-modal="true"
        aria-labelledby="selfCheckTitle" aria-describedby="selfCheckBody">
        <div class="confirm-dialog__title" id="selfCheckTitle">Identificatie zelf controleren</div>
        <div class="confirm-dialog__body" id="selfCheckBody">
          <p>BirdNET stelde bij deze waarneming ${name} voor${score}. Of je dat zelf controleerde, is niet vastgelegd; daarom telt ze nu niet mee in je lijsten.</p>
          ${soundOk ? `
          <p>Bevestig alleen als je de soort zelf hebt gecontroleerd, bijvoorbeeld met de opname, een foto of je veldnotities. Eigen controle is geen onafhankelijke wetenschappelijke verificatie. De BirdNET-suggestie blijft als bewijs bewaard.</p>
          <label class="selfcheck-confirm"><input type="checkbox" id="selfCheckConfirm"> <span>Ik heb ${name} zelf gecontroleerd</span></label>` : `
          <p>Een BirdNET-suggestie hoort bij een gehoorde waarneming. Leg eerst bij Bewerken vast hoe je de vogel waarnam (Gehoord of Gezien en gehoord).</p>`}
        </div>
        <div class="confirm-dialog__actions">
          <button class="btn-secondary confirm-cancel" type="button">${soundOk ? 'Annuleer' : 'Sluiten'}</button>
          ${soundOk ? '<button class="btn btn--primary confirm-ok" id="selfCheckOk" type="button" disabled>Eigen controle vastleggen</button>' : ''}
        </div>
      </div>`;
    document.body.appendChild(dlg);
    const box = dlg.querySelector('#selfCheckConfirm');
    const okBtn = dlg.querySelector('#selfCheckOk');
    const onKey = ev => { if (ev.key === 'Escape') { ev.stopPropagation(); finish(false); } };
    const finish = result => { document.removeEventListener('keydown', onKey, true); dlg.remove(); resolve(result); };
    document.addEventListener('keydown', onKey, true);
    box?.addEventListener('change', () => { okBtn.disabled = !box.checked; });
    dlg.querySelector('.confirm-cancel').addEventListener('click', () => finish(false));
    okBtn?.addEventListener('click', () => { if (box?.checked) finish(true); });
    dlg.addEventListener('click', ev => { if (ev.target === dlg) finish(false); });
    (box || dlg.querySelector('.confirm-cancel')).focus();
  });
}

// ── Object URL helpers ─────────────────────────────────────
const _activeUrls = [];
function _blobToUrl(photo) {
  if (!photo?.blob) return null;
  const blob = photo.blob instanceof Blob ? photo.blob
             : new Blob([photo.blob], { type: photo.type });
  const url = URL.createObjectURL(blob);
  _activeUrls.push(url);
  return url;
}
function _releaseUrls() {
  _activeUrls.splice(0).forEach(u => {
    try { URL.revokeObjectURL(u); } catch (_) {}
  });
}

// ── Helpers ────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function _capFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
