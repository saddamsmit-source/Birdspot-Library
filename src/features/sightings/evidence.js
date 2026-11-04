/**
 * Birdspot observation evidence.
 * Method and identification source are independent; no auto-confirmation.
 * Missing fields in legacy records remain "not recorded".
 */
export const OBSERVATION_METHODS=Object.freeze({
  seen:'Gezien',heard:'Gehoord',both:'Gezien en gehoord',
});
export const IDENTIFICATION_SOURCES=Object.freeze({
  self:'Eigen herkenning',merlin:'Merlin Sound ID',
});
export function methodLabel(sighting) {
  return OBSERVATION_METHODS[sighting?.observationMethod]||'Waarnemingswijze niet vastgelegd';
}
export function sourceLabel(sighting) {
  if(sighting?.identificationSource==='merlin'){
    return sighting?.merlinVerification==='checked'
      ? 'Merlin Sound ID · zelf gecontroleerd'
      : 'Merlin Sound ID · suggestie';
  }
  if(sighting?.identificationSource==='self')return 'Eigen herkenning';
  return 'Herkenningsbron niet vastgelegd';
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
  const verification=source==='merlin'
    ? (input?.merlinVerification==='checked'?'checked':'suggested')
    : null;
  return {observationMethod:method,identificationSource:source,merlinVerification:verification};
}
export function validPin(lat,lon) {
  const a=Number(lat),b=Number(lon);
  return lat!==null&&lon!==null&&lat!==''&&lon!==''&&
    Number.isFinite(a)&&a>=-90&&a<=90&&Number.isFinite(b)&&b>=-180&&b<=180;
}
