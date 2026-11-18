import { SPECIES } from '../../data/species.js';
import { addSightings } from '../../data/sightings.js';
import { addPlace, ensurePlaces, loadPlaces, matchSoundPlace, reuseRadiusM, savePlaces } from '../../data/places.js';
import { escHtml } from '../../utils/html.js';
import { validPin } from './evidence.js';
import { openPinPicker } from './pinPicker.js';
import { loadSoundDraft, saveSoundDraft, deleteSoundDraft } from './soundDraft.js';
import { createSoundMonitor, drawSoundTimeline, elapsedLabel } from './soundTimeline.js';
import { startSoundRecognition } from './soundRecognition.js';

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
    <form id="soundReview">
      <fieldset>
        <legend>Datum, tijd en plek</legend>
        <p id="soundMoment"></p>
        <p id="soundPosition" role="status" tabindex="-1">Plek bepalen…</p>
        <ul id="soundPlaceOptions" aria-label="Beschikbare kaartpinnen" hidden></ul>
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

  function addCandidate(id, match = null, checked = !match) {
    if (candidates.has(id) || !speciesById.has(id)) return false;
    candidates.set(id, { checked, match });
    const suggestion = match ? `<small>Suggestie · ${elapsedLabel(match.second)}</small>` : '';
    selection.insertAdjacentHTML('beforeend', `<li><label><input type="checkbox" value="${id}" ${checked ? 'checked' : ''}>
      <span>${escHtml(speciesById.get(id).nameNL)}${suggestion}</span></label></li>`);
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
  }

  function persistDraft() {
    if (recorder?.state === 'recording' || finishing || (!clip && !candidates.size)) return Promise.resolve();
    const revision = ++draftRevision;
    draftStatus.textContent = 'Sessie wordt bewaard…';
    persistWork = saveSoundDraft({
      id: sessionId, clip, seconds, levels: [...levels], candidates: [...candidates], coordinates, positionOrigin, placeChoice,
      date: date.value, time: time.value, name: locationName.value, notes: find('soundNotes').value,
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
    candidates.get(event.target.value).checked = event.target.checked;
    updateSelection();
    persistDraft();
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
    let sightings, newPlace;
    try {
      if (!matchedPlace && placeChoice?.newPin) {
        newPlace = addPlace({ lat: shared.lat, lon: shared.lon, name: shared.locationName });
        shared.placeId = newPlace.id;
        shared.locationName = newPlace.name;
      }
      sightings = ids.map(id => ({
        ...shared, id: `${sessionId}-${id}`, speciesId: id, speciesName: speciesById.get(id).nameNL,
        ...(candidates.get(id).match ? { soundSuggestion: { model: 'BirdNET+ V3.0', ...candidates.get(id).match } } : {}),
      }));
      await addSightings(sightings);
    } catch (_) {
      if (newPlace) {
        try { savePlaces(loadPlaces().filter(place => place.id !== newPlace.id)); }
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
    for (const [id, entry] of draft.candidates) addCandidate(id, entry.match, entry.checked);
    placeChoice = draft.placeChoice;
    if (draft.coordinates) setPosition(draft.coordinates.lat, draft.coordinates.lon, draft.coordinates.accuracyExactM ?? draft.coordinates.pinAccuracyM, draft.positionOrigin ?? 'Bewaarde plek', false);
    else pinStatus.textContent = 'Deze sessie heeft nog geen plek. Kies er een via Details aanpassen.';
    if (clip) {
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
