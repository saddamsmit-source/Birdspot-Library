import { SPECIES } from '../../data/species.js';
import { addSightings, getSightingsSnapshot } from '../../data/sightings.js';
import { changePhotos, SIGHTING_AUDIO_KIND } from '../../data/db.js';
import { audioBytesProblem } from '../../data/sightingAudio.js';
import { ensurePlaces, loadPlaces, matchSoundPlace, reuseRadiusM, resolvePlaceForSave, removeCreatedPlace } from '../../data/places.js';
import { escHtml } from '../../utils/html.js';
import { normalizeEvidence, validPin } from './evidence.js';
import { openPinPicker } from './pinPicker.js';
import { loadSoundDraft, saveSoundDraft, deleteSoundDraft } from './soundDraft.js';
import { createSoundMonitor, drawSoundTimeline, elapsedLabel } from './soundTimeline.js';
import { startSoundRecognition } from './soundRecognition.js';
import { canShareFile, clipToWav, MERLIN_WAV_NAME } from './soundShare.js';

const speciesById = new Map(SPECIES.map(species => [species.id, species]));
const normalize = text => text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('nl');
const catalogue = SPECIES.map(species => ({
  species,
  names: [species.nameNL, species.nameSci, species.nameEN || ''].map(normalize),
}));
const pad = value => String(value).padStart(2, '0');
let pendingFinalization = Promise.resolve();

export function mountSoundSession(root, onSaved) {
  root.innerHTML = `
    <div class="sound-capture">
      <div class="sound-row">
        <button type="button" id="soundRecord" class="btn-primary">Start opname</button>
        <span id="soundElapsed" aria-label="Opnameduur">00:00</span>
      </div>
      <p id="soundCaptureState" role="status">Je opname blijft op dit toestel.</p>
      <div id="soundTimeline" hidden>
        <canvas id="soundWaveform" width="640" height="84" role="img" aria-label="Geluidsniveau vanaf het begin van de opname"></canvas>
        <div class="sound-ruler" aria-hidden="true"><span>00:00</span><span id="soundRulerEnd">00:00</span></div>
      </div>
      <p id="soundRecognitionState" role="status"></p>
      <p id="soundLatestMatch" role="status"></p>
      <audio id="soundPlayback" aria-label="Opname terugluisteren" controls hidden></audio>
      <button type="button" id="soundDiscard" hidden>Verwijder sessie</button>
      <p id="soundDraftState" role="status"></p>
    </div>
    <section class="sound-species" aria-labelledby="soundSpeciesTitle">
      <h3 id="soundSpeciesTitle">Welke vogels hoor je?</h3>
      <p>Vink aan welke vogels je zelf herkent. Je kunt ook een soort toevoegen.</p>
      <label>Zoek een vogelsoort <input type="search" id="soundSpeciesSearch" autocomplete="off"></label>
      <ul id="soundMatches" aria-label="Gevonden soorten" hidden></ul>
      <ul id="soundSelection" aria-label="Soorten in de sessie" hidden></ul>
      <p id="soundSelectionCount" role="status">Geen soorten geselecteerd</p>
    </section>
    <section class="sound-merlin" aria-labelledby="soundMerlinTitle">
      <details id="soundMerlin">
        <summary><span id="soundMerlinTitle">Controleer met Merlin</span> <small>optioneel</small></summary>
        <p>BirdNET hierboven doet alleen suggesties. Merlin Bird ID is een aparte, gratis app van Cornell Lab.
          Birdspot krijgt geen uitslag van Merlin terug: jij kiest en bevestigt de soort zelf.</p>
        <button type="button" id="soundMerlinShare" hidden>Deel opname met Merlin</button>
        <p id="soundMerlinShareNote" role="status"></p>
        <details class="sound-merlin__manual">
          <summary>Merlin zelf openen</summary>
          <ol>
            <li>Deze sessie blijft op dit toestel bewaard, met datum, tijd en plek.</li>
            <li>Open Merlin Bird ID → Sound ID. Neem daar op, of importeer de gedeelde opname.</li>
            <li>Kom terug naar Birdspot. Is dit scherm dicht? Kies + → Geluid herkennen: de sessie opent weer.</li>
            <li>Vink hieronder aan wat Merlin gaf en kies zelf de soort.</li>
          </ol>
          <p>Geen Merlin, geen netwerk of afgebroken? Ga gewoon verder in Birdspot. Merlin is gratis te installeren via de app-winkel.</p>
        </details>
        <label class="sound-merlin__used"><input type="checkbox" id="soundMerlinUsed"> Ik heb Merlin gebruikt voor deze vogels</label>
        <div id="soundMerlinResult" hidden>
          <p>Vink bij elke gekozen soort aan of Merlin die ook gaf. Een andere soort van Merlin? Zoek en voeg die hierboven toe.</p>
          <p id="soundMerlinCompare" role="status"></p>
          <label class="sound-merlin__used"><input type="checkbox" id="soundMerlinVerified"> Ik heb de Merlin-suggestie zelf gecontroleerd (geluid of voorbeelden vergeleken)</label>
          <p class="sound-merlin__hint">Niet gecontroleerd = opgeslagen als Merlin-suggestie met zekerheid Mogelijk.</p>
        </div>
        <p id="soundMerlinState" role="status"></p>
      </details>
    </section>
    <form id="soundReview">
      <fieldset>
        <legend>Datum, tijd en plek</legend>
        <p id="soundMoment"></p>
        <p id="soundPosition" role="status" tabindex="-1">Plek bepalen…</p>
        <ul id="soundPlaceOptions" aria-label="Beschikbare kaartpinnen" hidden></ul>
        <label id="soundAttachField" class="sound-merlin__used" hidden><input type="checkbox" id="soundAttach"> Bewaar de opname bij de waarneming</label>
        <p id="soundAttachNote" class="sound-merlin__hint" hidden></p>
        <details class="sound-details">
          <summary>Details aanpassen</summary>
          <div class="sound-date">
            <label>Datum <input type="date" id="soundDate" required></label>
            <label>Tijd <input type="time" id="soundTime" required></label>
          </div>
          <div class="sound-row">
            <button type="button" id="soundGps">Gebruik mijn locatie</button>
            <button type="button" id="soundPin">Kies plek op kaart</button>
          </div>
          <label id="soundPlaceNameField">Pleknaam <input id="soundPlace" maxlength="120"></label>
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
  const placeOptions = find('soundPlaceOptions'), locationName = find('soundPlace');
  const gps = find('soundGps'), pin = find('soundPin'), save = find('soundSave');
  const candidates = new Map();
  const levels = [];
  const timeline = find('soundTimeline'), waveform = find('soundWaveform'), discarder = find('soundDiscard');
  const recognitionStatus = find('soundRecognitionState'), latestMatch = find('soundLatestMatch');
  const draftStatus = find('soundDraftState');
  let sessionId = crypto.randomUUID(), draftStored = false, seconds = 0, clip = null;
  let coordinates, gpsRequest = 0, closePicker, closed = false;
  let positionOrigin, placeChoice, matchedPlace, locationPending = false, needsPlaceChoice = false;
  let stream, recorder, starting = false, finishing = false, timer, started = 0, playbackUrl;
  let stopMonitor, recognition, wakeLock, completion, completeCapture;
  let persistWork = Promise.resolve();
  let draftRevision = 0;
  let dateEdited = false, timeEdited = false;
  // Ronde 4: Merlin-dubbelcheck (alles lokaal; Birdspot ontvangt niets van Merlin).
  const merlinShare = find('soundMerlinShare'), merlinNote = find('soundMerlinShareNote');
  const merlinUsedBox = find('soundMerlinUsed'), merlinVerifiedBox = find('soundMerlinVerified');
  const merlinStatus = find('soundMerlinState'), attachBox = find('soundAttach');
  let merlinUsed = false, merlinVerified = false, merlinShared = false, attachClip = false;
  let wavFile = null, wavState = 'none', wavRequest = 0;

  function setMoment(now = new Date()) {
    if (!dateEdited) date.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    if (!timeEdited) time.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    showMoment();
  }
  function showMoment() {
    find('soundMoment').textContent = date.value && time.value
      ? `${date.value.split('-').reverse().join('-')} · ${time.value}`
      : 'Vul datum en tijd aan bij Details aanpassen.';
  }
  setMoment();
  date.addEventListener('change', () => { dateEdited = true; showMoment(); updateSelection(); persistDraft(); });
  time.addEventListener('change', () => { timeEdited = true; showMoment(); updateSelection(); persistDraft(); });
  locationName.addEventListener('input', persistDraft);
  find('soundNotes').addEventListener('input', persistDraft);

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

  function setPlayback(audio) {
    clearPlayback();
    playbackUrl = URL.createObjectURL(audio);
    playback.src = playbackUrl;
    playback.hidden = false;
  }

  function paintTimeline() {
    elapsed.textContent = find('soundRulerEnd').textContent = elapsedLabel(seconds);
    drawSoundTimeline(waveform, levels, seconds, [...candidates.values()].flatMap(entry =>
      entry.match ? [entry.match.second] : []));
  }

  function updateElapsed() {
    seconds = Math.floor((performance.now() - started) / 1000);
    paintTimeline();
  }

  function stopMonitoring() {
    stopMonitor?.();
    stopMonitor = undefined;
    recognition?.stop();
    recognition = undefined;
    wakeLock?.release().catch(() => {});
    wakeLock = undefined;
  }

  function stopRecording() {
    if (recorder?.state !== 'recording') return;
    finishing = true;
    record.disabled = true;
    save.disabled = true;
    pendingFinalization = completion;
    recorder.stop();
    stopTracks();
    stopMonitoring();
  }

  function addCandidate(id, match = null, checked = !match, { merlin = false, seen = false } = {}) {
    if (candidates.has(id) || !speciesById.has(id)) return false;
    candidates.set(id, { checked, match, merlin: Boolean(merlin), seen: Boolean(seen) });
    const name = escHtml(speciesById.get(id).nameNL);
    const suggestion = match ? `<small>BirdNET-suggestie · ${elapsedLabel(match.second)}</small>` : '';
    selection.insertAdjacentHTML('beforeend', `<li><label class="sound-pick"><input type="checkbox" value="${id}" ${checked ? 'checked' : ''}>
      <span>${name}${suggestion}</span></label>
      <div class="sound-extra">
        <label><input type="checkbox" data-sound-seen="${id}" aria-label="${name}: ook gezien" ${seen ? 'checked' : ''}> Ook gezien</label>
        <label class="sound-extra__merlin"><input type="checkbox" data-sound-merlin="${id}" aria-label="${name}: Merlin gaf deze soort" ${merlin ? 'checked' : ''}> Merlin gaf deze soort</label>
      </div></li>`);
    selection.hidden = false;
    return true;
  }

  function receiveSuggestions(results, second) {
    if (closed || finishing || recorder?.state !== 'recording') return;
    const found = results.filter(({ id, score }) => addCandidate(id, { score, second }));
    if (!found.length) return;
    latestMatch.textContent = 'Mogelijk gehoord: ' + found.map(({ id }) => speciesById.get(id).nameNL).join(', ');
    updateSelection();
  }

  function updateSelection() {
    const selected = [...candidates.values()].filter(entry => entry.checked).length;
    find('soundSelectionCount').textContent = selected
      ? `${selected} ${selected === 1 ? 'soort geselecteerd' : 'soorten geselecteerd'}`
      : 'Geen soorten geselecteerd';
    save.disabled = !selected || !date.value || !time.value || !coordinates || locationPending ||
      needsPlaceChoice || starting || finishing || recorder?.state === 'recording';
    save.textContent = selected > 1 ? `Pin ${selected} waarnemingen` : 'Pin je waarneming';
    updateMerlin();
  }

  const names = ids => ids.map(id => speciesById.get(id).nameNL).join(', ');
  function updateMerlin() {
    const shareable = Boolean(wavFile) && canShareFile(wavFile);
    merlinShare.hidden = !shareable;
    merlinNote.textContent = !clip ? 'Neem eerst op om de opname te kunnen delen, of open Merlin zelf.'
      : wavState === 'pending' ? 'Opname wordt klaargezet voor delen…'
      : wavState === 'failed' ? 'Deze opname kan niet als WAV worden klaargezet. Open Merlin zelf.'
      : shareable ? 'Je deelt alleen het geluid (WAV), zonder plek of andere gegevens.'
      : 'Delen vanuit deze browser is niet beschikbaar. Open Merlin zelf.';
    find('soundMerlinResult').hidden = !merlinUsed;
    selection.classList.toggle('sound-merlin-off', !merlinUsed);
    const chosen = [...candidates].filter(([, entry]) => entry.checked).map(([id]) => id);
    const fromMerlin = chosen.filter(id => candidates.get(id).merlin);
    const fromBirdnet = [...candidates].filter(([, entry]) => entry.match).map(([id]) => id);
    let compare = '';
    if (merlinUsed && !fromMerlin.length) {
      compare = 'Nog geen soort van Merlin aangevinkt. Gaf Merlin geen resultaat? Kies dan zelf: de soort wordt opgeslagen als eigen herkenning.';
    } else if (merlinUsed) {
      const same = fromMerlin.filter(id => candidates.get(id).match);
      const onlyMerlin = fromMerlin.filter(id => !candidates.get(id).match);
      const onlyBirdnet = fromBirdnet.filter(id => !fromMerlin.includes(id));
      const parts = [];
      if (same.length) parts.push(`Overeenstemming: BirdNET en Merlin noemen ${names(same)}.`);
      if (!fromBirdnet.length) parts.push(`BirdNET had geen suggestie. Merlin: ${names(fromMerlin)}.`);
      else if (onlyMerlin.length || onlyBirdnet.length) {
        parts.push(`Verschil — ${[onlyMerlin.length && `alleen Merlin: ${names(onlyMerlin)}`,
          onlyBirdnet.length && `alleen BirdNET: ${names(onlyBirdnet)}`].filter(Boolean).join('; ')}. Jij kiest welke soorten je pint.`);
      }
      compare = parts.join(' ');
    }
    find('soundMerlinCompare').textContent = compare;
    const attachField = find('soundAttachField'), attachNote = find('soundAttachNote');
    attachField.hidden = !wavFile;
    attachBox.disabled = chosen.length > 1;
    attachNote.hidden = !wavFile || chosen.length <= 1;
    attachNote.textContent = 'Bij meerdere soorten bewaar je de opname per waarneming via Bewerken, zodat er geen kopieën ontstaan.';
  }

  function prepareWav() {
    const request = ++wavRequest, source = clip;
    wavFile = null;
    wavState = source ? 'pending' : 'none';
    updateMerlin();
    if (!source) return;
    clipToWav(source).then(bytes => {
      if (closed || request !== wavRequest) return;
      if (audioBytesProblem(bytes, 'audio/wav', { totalLength: bytes.length })) throw new Error('ongeldige WAV');
      wavFile = new File([bytes], MERLIN_WAV_NAME, { type: 'audio/wav' });
      wavState = 'ready';
    }).catch(() => {
      if (!closed && request === wavRequest) wavState = 'failed';
    }).finally(() => { if (!closed && request === wavRequest) updateMerlin(); });
  }

  function persistDraft() {
    if (recorder?.state === 'recording' || finishing || (!clip && !candidates.size)) return Promise.resolve();
    const revision = ++draftRevision;
    draftStatus.textContent = 'Sessie wordt bewaard…';
    persistWork = saveSoundDraft({
      id: sessionId, clip, seconds, levels: [...levels], candidates: [...candidates], coordinates, positionOrigin, placeChoice,
      date: date.value, time: time.value, name: locationName.value, notes: find('soundNotes').value,
      merlin: { used: merlinUsed, verified: merlinVerified, shared: merlinShared, attach: attachClip },
    }).then(() => {
      draftStored = true;
      if (revision === draftRevision) draftStatus.textContent = 'Sessie bewaard op dit toestel.';
    }, () => {
      if (revision === draftRevision) {
        draftStatus.textContent = 'Sessie opslaan lukt niet. Houd dit scherm open om je bevindingen te bewaren.';
      }
    });
    return persistWork;
  }

  function showPlace() {
    if (!coordinates) return;
    const places = loadPlaces();
    const chosen = placeChoice?.id && places.find(place => place.id === placeChoice.id);
    if (placeChoice?.id && !chosen) placeChoice = null;
    const match = chosen || placeChoice?.newPin
      ? { place: chosen, alternatives: [], needsChoice: false }
      : matchSoundPlace(places, { lat: coordinates.lat, lon: coordinates.lon,
          pinAccuracyM: coordinates.accuracyExactM ?? coordinates.pinAccuracyM }, positionOrigin === 'GPS', reuseRadiusM());
    matchedPlace = match.place;
    needsPlaceChoice = match.needsChoice;
    find('soundPlaceNameField').hidden = Boolean(matchedPlace);
    placeOptions.hidden = !needsPlaceChoice;
    placeOptions.innerHTML = needsPlaceChoice ? match.alternatives.map(({ place, distance }) =>
      `<li><button type="button" data-sound-place="${escHtml(place.id)}">${escHtml(place.name)} · ${Math.round(distance)} m</button></li>`
    ).join('') + '<li><button type="button" data-sound-new-pin>Gebruik een nieuwe pin</button></li>' : '';
    const { lat, lon, pinAccuracyM } = coordinates;
    const accuracy = positionOrigin === 'GPS' && pinAccuracyM !== null ? ` · ±${pinAccuracyM} m` : '';
    if (matchedPlace) pinStatus.textContent = `Bestaande pin · ${matchedPlace.name}`;
    else if (needsPlaceChoice) pinStatus.textContent = match.alternatives.length
      ? 'Kies een kaartpin of pas de plek aan bij Details aanpassen.'
      : 'GPS is onnauwkeurig. Controleer de plek bij Details aanpassen.';
    else pinStatus.textContent = `Nieuwe pin · ${lat.toFixed(5)}, ${lon.toFixed(5)}${accuracy}`;
    updateSelection();
  }

  function setPosition(lat, lon, accuracyM, origin, remember = true) {
    if (!validPin(lat, lon)) return false;
    // Herstel 2B (P3): afgerond voor weergave/opslag, ongerond voor de plekbeslissing.
    coordinates = { lat, lon, pinAccuracyM: Number.isFinite(accuracyM) ? Math.round(accuracyM) : null,
      accuracyExactM: Number.isFinite(accuracyM) ? accuracyM : null };
    positionOrigin = origin;
    if (remember) placeChoice = null;
    showPlace();
    if (remember) persistDraft();
    return true;
  }

  function locate() {
    if (!navigator.geolocation) {
      pinStatus.textContent = 'GPS is niet beschikbaar. Kies een plek via Details aanpassen.';
      return;
    }
    const request = ++gpsRequest;
    gps.disabled = true;
    locationPending = true;
    pinStatus.textContent = 'GPS-locatie wordt opgehaald…';
    updateSelection();
    const unavailable = () => {
      if (closed || request !== gpsRequest) return;
      gps.disabled = false;
      locationPending = false;
      pinStatus.textContent = coordinates
        ? 'GPS bijwerken lukt niet. De eerder gevonden plek blijft staan.'
        : 'GPS is niet beschikbaar. Kies een plek via Details aanpassen.';
      updateSelection();
    };
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (closed || request !== gpsRequest) return;
      gps.disabled = false;
      locationPending = false;
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
      completion = new Promise(resolve => { completeCapture = resolve; });
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
        stopMonitoring();
        updateElapsed();
        const audio = new Blob(chunks, { type: active.mimeType || chunks[0]?.type });
        if (audio.size) {
          clip = audio;
          if (!closed) setPlayback(audio);
          captureStatus.textContent = 'Opname klaar om terug te luisteren.';
        } else captureStatus.textContent = 'Er is geen geluid opgenomen. Je kunt opnieuw proberen.';
        finishing = false;
        record.disabled = Boolean(clip);
        record.textContent = clip ? 'Opname gestopt' : 'Start opname';
        discarder.hidden = !clip && !candidates.size;
        recognitionStatus.textContent = '';
        updateSelection();
        prepareWav();
        persistDraft().finally(completeCapture);
      });
      active.start();
      clearPlayback();
      setMoment();
      levels.length = 0;
      timeline.hidden = false;
      discarder.hidden = true;
      started = performance.now();
      updateElapsed();
      timer = setInterval(updateElapsed, 1000);
      captureStatus.textContent = 'Opname loopt. Houd dit scherm open.';
      record.textContent = 'Stop opname';
      if ((!coordinates || (positionOrigin === 'GPS' && !placeChoice)) && !locationPending) locate();
      try {
        stopMonitor = createSoundMonitor(input, {
          onLevel: level => { levels.push(level); paintTimeline(); },
          onFrame: frame => recognition?.push(frame),
          onPcmReady: available => {
            if (available) recognition = startSoundRecognition(text => { recognitionStatus.textContent = text; }, receiveSuggestions);
            else recognitionStatus.textContent = 'Automatische herkenning is nu niet beschikbaar. De opname loopt door.';
          },
        });
      } catch (_) {
        recognition?.stop();
        recognitionStatus.textContent = 'De geluidsmeter of live herkenning is niet beschikbaar.';
      }
      navigator.wakeLock?.request('screen').then(lock => {
        if (closed || active.state !== 'recording') lock.release().catch(() => {});
        else wakeLock = lock;
      }).catch(() => {});
    } catch (_) {
      stopTracks();
      if (!closed) captureStatus.textContent = 'Microfoon niet beschikbaar of geen toestemming. Je kunt de soorten wel selecteren.';
    } finally {
      starting = false;
      if (!closed) {
        record.disabled = Boolean(clip);
        updateSelection();
      }
    }
  });

  function handleVisibility() {
    if (document.hidden) { stopRecording(); return; }
    if (merlinShared && !merlinUsed) {
      merlinStatus.textContent = 'Terug uit Merlin? Vink aan dat je Merlin hebt gebruikt en markeer de soort(en) die Merlin gaf.';
    }
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
    if (!id || !addCandidate(id)) return;
    search.value = '';
    matches.hidden = true;
    matches.replaceChildren();
    search.focus();
    updateSelection();
    if (recorder?.state !== 'recording') discarder.hidden = false;
    persistDraft();
  });

  selection.addEventListener('change', event => {
    const target = event.target;
    if (target.dataset.soundSeen) candidates.get(target.dataset.soundSeen).seen = target.checked;
    else if (target.dataset.soundMerlin) candidates.get(target.dataset.soundMerlin).merlin = target.checked;
    else candidates.get(target.value).checked = target.checked;
    updateSelection();
    persistDraft();
  });
  merlinUsedBox.addEventListener('change', () => {
    merlinUsed = merlinUsedBox.checked;
    if (merlinUsed) merlinStatus.textContent = '';
    updateSelection();
    persistDraft();
  });
  merlinVerifiedBox.addEventListener('change', () => { merlinVerified = merlinVerifiedBox.checked; persistDraft(); });
  attachBox.addEventListener('change', () => { attachClip = attachBox.checked; persistDraft(); });
  merlinShare.addEventListener('click', async () => {
    if (!wavFile || merlinShare.disabled) return;
    merlinShare.disabled = true;
    try {
      // Eerst het concept (opname, datum, tijd, plek) lokaal vastleggen; pas daarna de appwisseling.
      merlinStatus.textContent = 'Sessie wordt bewaard…';
      await persistDraft();
      if (!draftStored) {
        merlinStatus.textContent = 'De sessie kon niet worden bewaard. Delen is gestopt; houd dit scherm open of open Merlin zelf.';
        return;
      }
      merlinStatus.textContent = 'Kies Merlin in het deelmenu.';
      await navigator.share({ files: [wavFile] });
      merlinShared = true;
      merlinStatus.textContent = 'Opname gedeeld. Kom na Merlin terug naar Birdspot en vink hieronder aan wat Merlin gaf.';
      persistDraft();
    } catch (error) {
      merlinStatus.textContent = error?.name === 'AbortError'
        ? 'Delen geannuleerd. Je sessie staat nog klaar.'
        : 'Delen lukte niet. Open Merlin zelf of ga verder in Birdspot; je sessie staat nog klaar.';
    } finally {
      merlinShare.disabled = false;
    }
  });
  search.addEventListener('keydown', event => {
    const first = matches.querySelector('button');
    if (event.key === 'Enter' && !matches.hidden && first) { event.preventDefault(); first.click(); }
  });

  gps.addEventListener('click', locate);
  placeOptions.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    placeChoice = button.dataset.soundPlace ? { id: button.dataset.soundPlace } : { newPin: true };
    showPlace();
    pinStatus.focus();
    persistDraft();
  });
  pin.addEventListener('click', () => {
    gpsRequest++;
    gps.disabled = false;
    locationPending = false;
    updateSelection();
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
    showPlace();
    if (save.disabled) return;
    save.disabled = true;
    root.inert = true;
    const ids = [...candidates].filter(([, entry]) => entry.checked).map(([id]) => id);
    const now = new Date().toISOString();
    const shared = {
      lat: coordinates.lat, lon: coordinates.lon, pinAccuracyM: coordinates.pinAccuracyM,
      placeId: matchedPlace?.id ?? null,
      date: date.value, time: time.value,
      locationName: matchedPlace?.name || locationName.value.trim() || null,
      notes: find('soundNotes').value.trim() || null,
      observationMethod: 'heard', identificationSource: 'self', merlinVerification: null,
      certainty: 'certain', count: 1, photoIds: [], soundSessionId: sessionId,
      createdAt: now, updatedAt: now,
    };
    let sightings, newPlace, audioRecord;
    try {
      if (matchedPlace || placeChoice?.newPin) {
        // IndexedDB leidend: gekozen plek alleen als die nog bestaat, anders een nieuwe (één transactie).
        const resolved = await resolvePlaceForSave({ placeId: matchedPlace?.id ?? null, name: shared.locationName, lat: shared.lat, lon: shared.lon });
        shared.placeId = resolved.place.id;
        if (resolved.created) { newPlace = resolved.place; shared.locationName = newPlace.name; }
      }
      sightings = ids.map(id => {
        const entry = candidates.get(id);
        // Ronde 4: Merlin alleen als bron wanneer de gebruiker Merlin gebruikte én deze soort aanvinkte.
        const viaMerlin = merlinUsed && entry.merlin;
        const evidence = normalizeEvidence({
          observationMethod: entry.seen ? 'both' : 'heard',
          identificationSource: viaMerlin ? 'merlin' : 'self',
          merlinVerification: viaMerlin && merlinVerified ? 'checked' : 'suggested',
        });
        return {
          ...shared, ...evidence, certainty: viaMerlin && !merlinVerified ? 'possible' : 'certain',
          id: `${sessionId}-${id}`, speciesId: id, speciesName: speciesById.get(id).nameNL,
          ...(entry.match ? { soundSuggestion: { model: 'BirdNET+ V3.0', ...entry.match } } : {}),
        };
      });
      // Optionele bijlage via het R08-model: één opname bij één waarneming, vaste id (opnieuw proberen = geen kopie).
      if (attachClip && wavFile && sightings.length === 1 && !getSightingsSnapshot().some(s => s.id === sightings[0].id)) {
        audioRecord = {
          id: `au_${sessionId}`, kind: SIGHTING_AUDIO_KIND, blob: wavFile, type: 'audio/wav',
          filename: MERLIN_WAV_NAME, size: wavFile.size, sightingId: sightings[0].id, addedAt: now,
        };
        await changePhotos({ put: [audioRecord] });
        sightings[0].audioIds = [audioRecord.id];
      }
      await addSightings(sightings);
    } catch (_) {
      if (audioRecord) {
        try { await changePhotos({ remove: [audioRecord.id] }); }
        catch (_) { /* Waarneming is niet opgeslagen; de losse opname wordt nergens getoond. */ }
      }
      if (newPlace) {
        try { await removeCreatedPlace(newPlace.id); }
        catch (_) { /* Waarnemingen zijn nog niet gepind. */ }
      }
      find('soundSaveState').textContent = 'Opslaan mislukt. Je selectie staat nog klaar.';
      root.inert = false;
      updateSelection();
      return;
    }
    if (newPlace) { placeChoice = { id: newPlace.id }; persistDraft(); }
    await persistWork;
    if (draftStored) {
      try { await deleteSoundDraft(sessionId); }
      catch (_) {
        find('soundSaveState').textContent = 'De waarnemingen zijn gepind. Het concept kon niet worden opgeruimd.';
        root.inert = false;
        updateSelection();
        return;
      }
    }
    onSaved(sightings);
  });

  discarder.addEventListener('click', async () => {
    root.inert = true;
    try {
      await persistWork;
      if (draftStored) await deleteSoundDraft(sessionId);
      gpsRequest++;
      gps.disabled = false;
      locationPending = needsPlaceChoice = false;
      matchedPlace = placeChoice = positionOrigin = null;
      placeOptions.replaceChildren();
      placeOptions.hidden = true;
      find('soundPlaceNameField').hidden = false;
      root.querySelector('#soundReview').reset();
      sessionId = crypto.randomUUID();
      draftStored = false;
      clip = coordinates = null;
      seconds = levels.length = 0;
      candidates.clear();
      merlinUsed = merlinVerified = merlinShared = attachClip = false;
      merlinUsedBox.checked = merlinVerifiedBox.checked = attachBox.checked = false;
      merlinStatus.textContent = '';
      prepareWav();
      dateEdited = timeEdited = false;
      setMoment();
      clearPlayback();
      selection.replaceChildren();
      matches.replaceChildren();
      search.value = '';
      selection.hidden = matches.hidden = timeline.hidden = discarder.hidden = true;
      record.disabled = false;
      record.textContent = 'Start opname';
      captureStatus.textContent = 'Je opname blijft op dit toestel.';
      pinStatus.textContent = 'Plek bepalen…';
      find('soundSaveState').textContent = latestMatch.textContent = '';
      draftStatus.textContent = 'Sessie verwijderd.';
      paintTimeline();
      updateSelection();
      locate();
    } catch (_) {
      draftStatus.textContent = 'Sessie verwijderen lukt niet. Probeer het opnieuw.';
    } finally {
      root.inert = false;
      if (discarder.hidden) record.focus();
    }
  });

  root.inert = true;
  pendingFinalization.then(async () => {
    await ensurePlaces().catch(() => {});
    return loadSoundDraft();
  }).then(draft => {
    if (closed) return;
    if (!draft) { locate(); return; }
    sessionId = draft.id;
    draftStored = true;
    [date.value, time.value, locationName.value, find('soundNotes').value] = [draft.date, draft.time, draft.name, draft.notes];
    dateEdited = timeEdited = true;
    showMoment();
    clip = draft.clip;
    seconds = draft.seconds;
    levels.push(...draft.levels);
    for (const [id, entry] of draft.candidates) addCandidate(id, entry.match, entry.checked, entry);
    ({ used: merlinUsed = false, verified: merlinVerified = false, shared: merlinShared = false, attach: attachClip = false } = draft.merlin || {});
    merlinUsedBox.checked = merlinUsed;
    merlinVerifiedBox.checked = merlinVerified;
    attachBox.checked = attachClip;
    if (merlinUsed || merlinShared) find('soundMerlin').open = true;
    placeChoice = draft.placeChoice;
    if (draft.coordinates) setPosition(draft.coordinates.lat, draft.coordinates.lon, draft.coordinates.accuracyExactM ?? draft.coordinates.pinAccuracyM, draft.positionOrigin ?? 'Bewaarde plek', false);
    else pinStatus.textContent = 'Deze sessie heeft nog geen plek. Kies er een via Details aanpassen.';
    if (clip) {
      prepareWav();
      setPlayback(clip);
      timeline.hidden = false;
      paintTimeline();
      record.disabled = true;
      record.textContent = 'Opname gestopt';
      captureStatus.textContent = 'Opname klaar om terug te luisteren.';
    }
    discarder.hidden = false;
    draftStatus.textContent = 'Bewaarde sessie geopend.';
  }).catch(() => {
    draftStatus.textContent = 'Bewaarde sessie is nu niet beschikbaar.';
    if (!closed) locate();
  }).finally(() => { if (!closed) { root.inert = false; updateSelection(); } });

  updateSelection();
  return () => {
    closed = true;
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('pagehide', stopRecording);
    closePicker?.();
    stopRecording();
    stopMonitoring();
    clearInterval(timer);
    stopTracks();
    clearPlayback();
  };
}
