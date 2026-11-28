/**
 * Birdspot observation evidence.
 * Method and identification source are independent; no auto-confirmation.
 * Missing fields in legacy records remain "not recorded".
 */
export const OBSERVATION_METHODS=Object.freeze({
  seen:'Gezien',heard:'Gehoord',both:'Gezien en gehoord',
});
export const OBSERVATION_BREAKDOWN = Object.freeze({
  seen: 'Alleen gezien',
  heard: 'Alleen gehoord',
  both: OBSERVATION_METHODS.both,
  unrecorded: 'Niet vastgelegd',
});
export function observationMethodKey(sighting) {
  const method = sighting?.observationMethod;
  return Object.hasOwn(OBSERVATION_METHODS, method) ? method : 'unrecorded';
}
export const IDENTIFICATION_SOURCES=Object.freeze({
  self:'Eigen herkenning',merlin:'Merlin Sound ID',birdnet:'BirdNET',
});
/** UX-01B: eigen controle is geen onafhankelijke (wetenschappelijke) verificatie; overal dezelfde zin. */
export const SELF_CHECK_NOTE='Eigen controle; geen onafhankelijke wetenschappelijke verificatie.';
export const BREEDING_BEHAVIORS = Object.freeze([
  'nestmateriaal dragen', 'voedsel naar het nest brengen', 'uitgevlogen jongen gezien',
]);
export function methodLabel(sighting) {
  return OBSERVATION_METHODS[sighting?.observationMethod]||'Waarnemingswijze niet vastgelegd';
}
/**
 * UX-03B (25-11-2026): één bron voor de herkenningsstatus van een eigen waarneming, overal gelijk
 * (lijst, detail, kaart, soortkaart, profiel, filter). BirdNET en Merlin doen suggesties; zij bevestigen
 * nooit zelf een soort. 'Zelf gecontroleerd' is een eigen controle, geen wetenschappelijke verificatie.
 * Staat los van brongeverifieerde gidsinformatie over de soort.
 *
 * key   : self | birdnet-suggested | birdnet-checked | merlin-suggested | merlin-checked | check-unknown | unrecorded
 * tone  : neutral (gewoon) | info (zelf gecontroleerd) | warn (suggestie of controle onbekend)
 * counts: telt mee voor soortenlijsten (los van zekerheid 'mogelijk', zie stats.js)
 */
export function verificationStatus(sighting) {
  const src = sighting?.identificationSource;
  if (src === 'merlin') {
    return sighting?.merlinVerification === 'checked'
      ? { key: 'merlin-checked', label: 'Merlin · zelf gecontroleerd', tone: 'info', counts: true,
          hint: 'Merlin stelde de soort voor; je hebt die zelf gecontroleerd. ' + SELF_CHECK_NOTE }
      : { key: 'merlin-suggested', label: 'Merlin · suggestie', tone: 'warn', counts: false,
          hint: 'Merlin stelde deze soort voor; eigen controle is nog niet vastgelegd.' };
  }
  if (src === 'birdnet') {
    return sighting?.birdnetVerification === 'checked'
      ? { key: 'birdnet-checked', label: 'BirdNET · zelf gecontroleerd', tone: 'info', counts: true,
          hint: 'BirdNET stelde de soort voor; je hebt die zelf gecontroleerd. ' + SELF_CHECK_NOTE }
      : { key: 'birdnet-suggested', label: 'BirdNET · suggestie', tone: 'warn', counts: false,
          hint: 'BirdNET stelde deze soort voor; eigen controle is nog niet vastgelegd.' };
  }
  if (sighting?.soundSuggestion) {
    // Oud record (vóór UX-01B): BirdNET-suggestie bewaard, bron 'self' of leeg. Nooit stil omzetten.
    return { key: 'check-unknown', label: 'Controle onbekend', tone: 'warn', counts: false,
      hint: 'Bij deze oudere waarneming is een BirdNET-suggestie bewaard. Of je die zelf controleerde, is niet vastgelegd; daarom telt ze niet mee in je lijsten.' };
  }
  if (src === 'self') return { key: 'self', label: 'Eigen herkenning', tone: 'neutral', counts: true, hint: '' };
  return { key: 'unrecorded', label: 'Bron niet vastgelegd', tone: 'neutral', counts: true,
    hint: 'Bij deze oudere waarneming is niet vastgelegd hoe de soort is herkend.' };
}
/** Statuslabel (compatibele naam; zelfde tekst als verificationStatus). */
export function sourceLabel(sighting) {
  return verificationStatus(sighting).label;
}
/** Kort label; null bij gewone eigen herkenning of niet vastgelegd (geen extra label op een kaartje). */
export function sourceBadge(sighting) {
  const st = verificationStatus(sighting);
  return st.key === 'unrecorded' ? null : st.label;
}

/**
 * Centrale telregel (UX-03B, centraal gemaakt in UX-03R): telt deze waarneming mee als soort op je lijst?
 * Niet bij zekerheid 'mogelijk', een suggestie van BirdNET of Merlin zonder eigen controle of 'controle onbekend'
 * (eigenaarbesluit optie A). Elk getal dat in de app "soorten" heet zonder toevoeging, gebruikt deze regel;
 * een ruw soortaantal heet altijd "geregistreerd". De opgeslagen waarneming verandert nooit.
 */
export function countsForList(s) {
  if (!s || !s.speciesId) return false;
  if (s.certainty === 'possible') return false;
  return verificationStatus(s).counts;
}

/** Soort-id's in twee groepen: meetellend en alleen geregistreerd (geen enkele meetellende waarneming). */
export function speciesTally(sightings) {
  const counting = new Set(), registered = new Set();
  for (const s of sightings || []) {
    if (!s || typeof s.speciesId !== 'string' || !s.speciesId) continue;
    registered.add(s.speciesId);
    if (countsForList(s)) counting.add(s.speciesId);
  }
  const registeredOnly = new Set([...registered].filter(id => !counting.has(id)));
  return { counting, registered, registeredOnly };
}
/** Een suggestie (Merlin of BirdNET) die de gebruiker nog niet zelf heeft gecontroleerd. */
export function uncheckedSuggestion(sighting) {
  if(sighting?.identificationSource==='merlin')return sighting?.merlinVerification!=='checked';
  if(sighting?.identificationSource==='birdnet')return sighting?.birdnetVerification!=='checked';
  return false;
}
/**
 * Oude waarneming (vóór UX-01B) met een bewaarde BirdNET-suggestie maar bron 'self':
 * we weten niet of de gebruiker de soort zelf controleerde. Alleen tonen, nooit stil omzetten.
 */
export function legacyBirdnetSuggestion(sighting) {
  return sighting?.identificationSource!=='birdnet'&&Boolean(sighting?.soundSuggestion);
}
export function observedVisually(sighting) {
  return sighting?.observationMethod==='seen'||sighting?.observationMethod==='both';
}
export function observedBySound(sighting) {
  return sighting?.observationMethod==='heard'||sighting?.observationMethod==='both';
}
export function normalizeEvidence(input) {
  const method=Object.prototype.hasOwnProperty.call(OBSERVATION_METHODS,input?.observationMethod)
    ? input.observationMethod : null;
  const source=Object.prototype.hasOwnProperty.call(IDENTIFICATION_SOURCES,input?.identificationSource)
    ? input.identificationSource : null;
  if(source==='merlin'&&!observedBySound({observationMethod:method}))
    throw new Error('Merlin Sound ID vereist een gehoorde waarneming');
  if(source==='birdnet'&&!observedBySound({observationMethod:method}))
    throw new Error('Een BirdNET-suggestie vereist een gehoorde waarneming');
  const verification=source==='merlin'
    ? (input?.merlinVerification==='checked'?'checked':'suggested')
    : null;
  // Altijd teruggeven (ook null): updateSighting voegt samen, dus een oude waarde moet expliciet weg.
  const birdnet=source==='birdnet'
    ? (input?.birdnetVerification==='checked'?'checked':'suggested')
    : null;
  return {observationMethod:method,identificationSource:source,merlinVerification:verification,birdnetVerification:birdnet};
}
export function validPin(lat,lon) {
  const a=Number(lat),b=Number(lon);
  return lat!==null&&lon!==null&&lat!==''&&lon!==''&&
    Number.isFinite(a)&&a>=-90&&a<=90&&Number.isFinite(b)&&b>=-180&&b<=180;
}
