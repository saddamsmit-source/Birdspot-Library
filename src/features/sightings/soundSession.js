import { SPECIES } from '../../data/species.js';
import { addSightings } from '../../data/sightings.js';
import { escHtml } from '../../utils/html.js';
import { validPin } from './evidence.js';
import { openPinPicker } from './pinPicker.js';

const speciesById = new Map(SPECIES.map(species => [species.id, species]));
const normalize = text => text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('nl');
const catalogue = SPECIES.map(species => ({
  species,
  names: [species.nameNL, species.nameSci, species.nameEN || ''].map(normalize),
}));
const pad = value => String(value).padStart(2, '0');

export function mountSoundSession(root, onSaved) {
  root.innerHTML = `
    <div class="sound-capture">
      <div class="sound-row">
        <button type="button" id="soundRecord" class="btn-primary">Start opname</button>
        <span id="soundElapsed" aria-label="Opnameduur">00:00</span>
      </div>
      <p id="soundCaptureState" role="status">Je opname blijft tijdens deze sessie op dit toestel.</p>
      <audio id="soundPlayback" aria-label="Opname terugluisteren" controls hidden></audio>
    </div>
    <section class="sound-species" aria-labelledby="soundSpeciesTitle">
      <h3 id="soundSpeciesTitle">Welke vogels hoor je?</h3>
      <p>Automatische herkenning volgt later. Voeg de soorten toe die je zelf herkent.</p>
      <label>Zoek een vogelsoort <input type="search" id="soundSpeciesSearch" autocomplete="off"></label>
      <ul id="soundMatches" aria-label="Gevonden soorten" hidden></ul>
      <ul id="soundSelection" aria-label="Soorten in de sessie" hidden></ul>
      <p id="soundSelectionCount" role="status">Geen soorten geselecteerd</p>
    </section>
    <form id="soundReview">
      <fieldset>
        <legend>Datum, tijd en plek</legend>
        <div class="sound-date">
          <label>Datum <input type="date" id="soundDate" required></label>
          <label>Tijd <input type="time" id="soundTime" required></label>
        </div>
        <p id="soundPosition" role="status">Start een opname voor GPS, of kies zelf de plek.</p>
        <div class="sound-row">
          <button type="button" id="soundGps">Gebruik mijn locatie</button>
          <button type="button" id="soundPin">Kies plek op kaart</button>
        </div>
        <details class="sound-details">
          <summary>Details toevoegen</summary>
          <label>Pleknaam <input id="soundPlace" maxlength="120"></label>
          <label>Notitie voor deze vogels <textarea id="soundNotes" rows="2" maxlength="1000"></textarea></label>
        </details>
      </fieldset>
      <p id="soundSaveState" role="status"></p>
      <button class="btn-primary" id="soundSave" type="submit">Pin je waarneming</button>
    </form>`;
  const find = id => root.querySelector('#' + id);
  const record = find('soundRecord'), elapsed = find('soundElapsed');
  const captureStatus = find('soundCaptureState'), playback = find('soundPlayback');
  const search = find('soundSpeciesSearch'), matches = find('soundMatches'), selection = find('soundSelection');
  const date = find('soundDate'), time = find('soundTime'), pinStatus = find('soundPosition');
  const gps = find('soundGps'), pin = find('soundPin'), save = find('soundSave');
  const candidates = new Map();
  const sessionId = crypto.randomUUID();
  let coordinates, gpsRequest = 0, closePicker, closed = false;
  let stream, recorder, starting = false, finishing = false, timer, started = 0, playbackUrl;
  let dateEdited = false, timeEdited = false;

  function setMoment(now = new Date()) {
    if (!dateEdited) date.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    if (!timeEdited) time.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
  setMoment();
  date.addEventListener('input', () => { dateEdited = true; });
  time.addEventListener('input', () => { timeEdited = true; });

  function stopTracks() {
    stream?.getTracks().forEach(track => track.stop());
    stream = null;
  }

  function clearPlayback() {
    playback.pause();
    playback.removeAttribute('src');
    playback.hidden = true;
    if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    playbackUrl = null;
  }

  function updateElapsed() {
    const seconds = Math.floor((performance.now() - started) / 1000);
    elapsed.textContent = `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
  }

  function stopRecording() {
    if (recorder?.state !== 'recording') return;
    finishing = true;
    record.disabled = true;
    save.disabled = true;
    recorder.stop();
    stopTracks();
  }

  function updateSelection() {
    const selected = [...candidates.values()].filter(Boolean).length;
    find('soundSelectionCount').textContent = selected
      ? `${selected} ${selected === 1 ? 'soort geselecteerd' : 'soorten geselecteerd'}`
      : 'Geen soorten geselecteerd';
    save.disabled = !selected || !coordinates || starting || finishing || recorder?.state === 'recording';
    save.textContent = selected > 1 ? `Pin ${selected} waarnemingen` : 'Pin je waarneming';
  }

  function setPosition(lat, lon, accuracyM, origin) {
    if (!validPin(lat, lon)) return false;
    coordinates = { lat, lon, pinAccuracyM: Number.isFinite(accuracyM) ? Math.round(accuracyM) : null };
    const accuracy = origin === 'GPS' && coordinates.pinAccuracyM !== null ? ` · ±${coordinates.pinAccuracyM} m` : '';
    pinStatus.textContent = `${origin} · ${lat.toFixed(5)}, ${lon.toFixed(5)}${accuracy}`;
    updateSelection();
    return true;
  }

  function locate() {
    if (!navigator.geolocation) {
      pinStatus.textContent = 'GPS is niet beschikbaar. Kies een plek op de kaart.';
      return;
    }
    const request = ++gpsRequest;
    gps.disabled = true;
    pinStatus.textContent = 'GPS-locatie wordt opgehaald…';
    const unavailable = () => {
      if (closed || request !== gpsRequest) return;
      gps.disabled = false;
      pinStatus.textContent = coordinates
        ? 'GPS is niet beschikbaar. De gekozen plek blijft staan.'
        : 'GPS is niet beschikbaar. Kies een plek op de kaart.';
    };
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (closed || request !== gpsRequest) return;
      gps.disabled = false;
      if (!setPosition(coords.latitude, coords.longitude, coords.accuracy, 'GPS')) unavailable();
    }, unavailable, { enableHighAccuracy: true, maximumAge: 0, timeout: 12000 });
  }

  record.addEventListener('click', async () => {
    if (recorder?.state === 'recording') { stopRecording(); return; }
    if (starting || finishing) return;
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      captureStatus.textContent = 'Opnemen is niet beschikbaar in deze browser. Je kunt de soorten wel selecteren.';
      return;
    }
    starting = true;
    record.disabled = true;
    updateSelection();
    captureStatus.textContent = 'Wachten op de microfoon…';
    try {
      const input = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      if (closed || document.hidden) {
        input.getTracks().forEach(track => track.stop());
        if (!closed) captureStatus.textContent = 'Open dit scherm om een opname te starten.';
        return;
      }
      stream = input;
      const chunks = [];
      const active = new MediaRecorder(stream);
      recorder = active;
      active.addEventListener('dataavailable', event => {
        if (event.data.size) chunks.push(event.data);
      });
      active.addEventListener('error', () => {
        stopTracks();
        captureStatus.textContent = 'De opname is onderbroken.';
      });
      active.addEventListener('stop', () => {
        clearInterval(timer);
        stopTracks();
        if (closed) return;
        updateElapsed();
        const audio = new Blob(chunks, { type: active.mimeType || chunks[0]?.type });
        if (audio.size) {
          playbackUrl = URL.createObjectURL(audio);
          playback.src = playbackUrl;
          playback.hidden = false;
          captureStatus.textContent = 'Opname klaar om terug te luisteren.';
        } else captureStatus.textContent = 'Er is geen geluid opgenomen. Je kunt opnieuw proberen.';
        finishing = false;
        record.disabled = false;
        record.textContent = 'Nieuwe opname';
        updateSelection();
      });
      active.start();
      clearPlayback();
      setMoment();
      started = performance.now();
      updateElapsed();
      timer = setInterval(updateElapsed, 1000);
      captureStatus.textContent = 'Opname loopt.';
      record.textContent = 'Stop opname';
      if (!coordinates && !gps.disabled) locate();
    } catch (_) {
      stopTracks();
      if (!closed) captureStatus.textContent = 'Microfoon niet beschikbaar of geen toestemming. Je kunt de soorten wel selecteren.';
    } finally {
      starting = false;
      if (!closed) {
        record.disabled = false;
        updateSelection();
      }
    }
  });

  function handleVisibility() {
    if (document.hidden) stopRecording();
  }
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('pagehide', stopRecording);

  search.addEventListener('input', () => {
    const query = normalize(search.value.trim());
    if (!query) { matches.hidden = true; matches.replaceChildren(); return; }
    const hits = catalogue.filter(({ species, names }) =>
      !candidates.has(species.id) && names.some(name => name.includes(query))).slice(0, 8);
    matches.hidden = false;
    matches.innerHTML = hits.length ? hits.map(({ species }) =>
      `<li><button type="button" data-add-sound-species="${species.id}">${escHtml(species.nameNL)}</button></li>`).join('')
      : '<li>Geen nieuwe soorten gevonden.</li>';
  });

  matches.addEventListener('click', event => {
    const id = event.target.closest('[data-add-sound-species]')?.dataset.addSoundSpecies;
    if (!id || candidates.has(id)) return;
    candidates.set(id, true);
    selection.insertAdjacentHTML('beforeend',
      `<li><label><input type="checkbox" value="${id}" checked> ${escHtml(speciesById.get(id).nameNL)}</label></li>`);
    selection.hidden = false;
    search.value = '';
    matches.hidden = true;
    matches.replaceChildren();
    search.focus();
    updateSelection();
  });

  selection.addEventListener('change', event => {
    candidates.set(event.target.value, event.target.checked);
    updateSelection();
  });
  search.addEventListener('keydown', event => {
    const first = matches.querySelector('button');
    if (event.key === 'Enter' && !matches.hidden && first) { event.preventDefault(); first.click(); }
  });

  gps.addEventListener('click', locate);
  pin.addEventListener('click', () => {
    gpsRequest++;
    gps.disabled = false;
    if (!coordinates) pinStatus.textContent = 'Kies de plek voor deze waarnemingen.';
    closePicker = openPinPicker({
      lat: coordinates?.lat ?? null,
      lon: coordinates?.lon ?? null,
      onConfirm: ({ lat, lon, accuracyM }) => setPosition(lat, lon, accuracyM, 'Kaartpin'),
    });
  });

  find('soundReview').addEventListener('submit', async event => {
    event.preventDefault();
    if (save.disabled) return;
    save.disabled = true;
    const ids = [...candidates].filter(([, checked]) => checked).map(([id]) => id);
    const now = new Date().toISOString();
    const shared = {
      ...coordinates,
      date: date.value, time: time.value,
      locationName: find('soundPlace').value.trim() || null,
      notes: find('soundNotes').value.trim() || null,
      observationMethod: 'heard', identificationSource: 'self', merlinVerification: null,
      certainty: 'certain', count: 1, photoIds: [], soundSessionId: sessionId,
      createdAt: now, updatedAt: now,
    };
    const sightings = ids.map(id => ({
      ...shared, id: `${sessionId}-${id}`, speciesId: id, speciesName: speciesById.get(id).nameNL,
    }));
    try {
      await addSightings(sightings);
    } catch (_) {
      find('soundSaveState').textContent = 'Opslaan mislukt. Je selectie staat nog klaar.';
      updateSelection();
      return;
    }
    onSaved(sightings);
  });

  updateSelection();
  return () => {
    closed = true;
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('pagehide', stopRecording);
    closePicker?.();
    stopRecording();
    clearInterval(timer);
    stopTracks();
    clearPlayback();
  };
}
