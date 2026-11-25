/**
 * Birdspot observation evidence.
 * Method and identification source are independent; no auto-confirmation.
 * Missing fields in legacy records remain "not recorded".
 */
export const OBSERVATION_METHODS=Object.freeze({
  seen:'Gezien',heard:'Gehoord',both:'Gezien en gehoord',
});
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
export function sourceLabel(sighting) {
  if(sighting?.identificationSource==='merlin'){
    return sighting?.merlinVerification==='checked'
      ? 'Merlin Sound ID · zelf gecontroleerd'
      : 'Merlin Sound ID · suggestie';
  }
  if(sighting?.identificationSource==='birdnet'){
    return sighting?.birdnetVerification==='checked'
      ? 'BirdNET-suggestie · zelf gecontroleerd'
      : 'BirdNET · suggestie';
  }
  if(sighting?.identificationSource==='self')return 'Eigen herkenning';
  return 'Herkenningsbron niet vastgelegd';
}
/**
 * UX-01B: korte bronlabels voor lijst, kaart en detail. Bron en controle blijven gescheiden velden;
 * geen label zegt dat BirdNET of Merlin een soort heeft bevestigd.
 * @returns {string|null} null = geen label (eigen herkenning zonder suggestie, of niet vastgelegd)
 */
export function sourceBadge(sighting) {
  const src=sighting?.identificationSource;
  if(src==='merlin')return sighting?.merlinVerification==='checked'?'Merlin · zelf gecontroleerd':'Merlin · suggestie';
  if(src==='birdnet')return sighting?.birdnetVerification==='checked'?'Zelf gecontroleerd':'BirdNET · suggestie';
  if(src==='self')return 'Eigen herkenning';
  return null;
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
