/**
 * Birdspot Explorer · pure map classifications and filtering.
 *
 * Evidence fields are independent: sound ID is a suggested source, while
 * sighting.observationMethod records whether the bird was seen/heard.
 * Old sightings without observationMethod stay unknown (not silently "seen").
 * These helpers do not read/write storage or geocode location strings.
 */
export const MAP_STATUS=Object.freeze({
  seen:   Object.freeze({label:'Gezien',color:'#2EBE96',symbol:'◉'}),
  merlin: Object.freeze({label:'Merlin Sound ID',color:'#A784E9',symbol:'♫'}),
  both:   Object.freeze({label:'Gezien én gehoord',color:'#DCAF63',symbol:'◉♫'}),
  heard:  Object.freeze({label:'Alleen gehoord',color:'#57A9D5',symbol:'♪'}),
  unknown:Object.freeze({label:'Niet vastgelegd',color:'#88939B',symbol:'?'}),
});
export const MAP_ORDER=Object.freeze(['seen','merlin','both','heard','unknown']);

export function statusForSighting(s) {
  if(s?.observationMethod==='both') return 'both';
  if(s?.observationMethod==='seen') return 'seen';
  if(s?.observationMethod==='heard'){
    return s?.identificationSource==='merlin'?'merlin':'heard';
  }
  return 'unknown';
}
export function normalizedSearch(value) {
  return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLocaleLowerCase('nl').trim();
}
export function filteredSightings(sightings,{speciesSearch='',status='all'}={},speciesCatalog=[]) {
  const search=normalizedSearch(speciesSearch);
  const catalog=new Map(speciesCatalog.map(x=>[x.id,x]));
  return (Array.isArray(sightings)?sightings:[]).filter(s=>{
    if(status!=='all'&&statusForSighting(s)!==status)return false;
    if(!search)return true;
    const item=catalog.get(s?.speciesId);
    return [s?.speciesName,item?.nameNL,item?.nameEN,item?.nameSci]
      .filter(x=>typeof x==='string').some(n=>normalizedSearch(n).includes(search));
  });
}
export function statusCounts(sightings) {
  const counts=Object.fromEntries(MAP_ORDER.map(k=>[k,0]));
  for(const item of sightings??[]) counts[statusForSighting(item)]++;
  return counts;
}
export function statusCountLabel(counts){
  return MAP_ORDER.filter(k=>counts[k]>0)
    .map(k=>counts[k]+' '+MAP_STATUS[k].label.toLocaleLowerCase('nl')).join(', ');
}
/** Each share of the cluster ring is proportional to the number of observations. */
export function clusterGradient(counts) {
  const total=MAP_ORDER.reduce((sum,k)=>sum+(counts[k]||0),0);
  if(total===0)return '#88939B';
  let offset=0;
  const stops=[];
  for(const k of MAP_ORDER){
    if(!counts[k])continue;
    const from=offset/total*100;
    offset+=counts[k];
    const to=offset/total*100;
    stops.push(MAP_STATUS[k].color+' '+from.toFixed(4)+'% '+to.toFixed(4)+'%');
  }
  return 'conic-gradient('+stops.join(', ')+')';
}
