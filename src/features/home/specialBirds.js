/**
 * Birdspot editorial spotlight — eight birding themes with two species each.
 * Photos: Wikimedia Commons third-party CC licensed, with author/license links.
 * These are reference images, NEVER personal sightings or verified Dutch locations.
 * External files can be unavailable offline; preserve an elegant local fallback.
 */
export const SHOWCASE_INTERVAL_MS=60_000;
export const BIRD_THEMES=Object.freeze([
  ['all','Alle categorieën'],['zang','Zangvogels'],['riet','Rietvogels'],
  ['stelt','Steltlopers'],['roof','Roofvogels'],['uil','Uilen'],
  ['meeuw','Meeuwen'],['reiger','Reigers'],['kleur','Kleurrijke gasten'],
]);
const photo=(file)=>'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(file)+'?width=1000';
const source=(file)=>'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(file.replaceAll(' ','_'));
const item=(id,theme,nl,latin,where,file,author,license)=>Object.freeze({
  id,theme,nl,latin,where,image:photo(file),source:source(file),author,license
});
export const FEATURED_BIRDS=Object.freeze([
  item('wielewaal','zang','Wielewaal','Oriolus oriolus',
    'Loofbossen en populierenbossen; in Nederland vooral in het voorjaar en de zomer.',
    'Eurasian Golden Oriole Oriolus oriolus.jpg','Иван Везенковић','CC BY-SA 4.0'),
  item('nachtegaal','zang','Nachtegaal','Luscinia megarhynchos',
    'Dicht struweel en duinen; zijn zang verraadt hem vaak eerder dan zijn uiterlijk.',
    'Common Nightingale (Luscinia megarhynchos) (26460869366).jpg','Bernard DUPONT','CC BY-SA 2.0'),
  item('baardman','riet','Baardman','Panurus biarmicus',
    'Uitgestrekte rietlanden en moerasgebieden, vaak in kleine groepen.',
    'Baardman - Panurus biarmicus (15147085070).jpg','Rob Zweers','CC BY 2.0'),
  item('rietzanger','riet','Rietzanger','Acrocephalus schoenobaenus',
    'Rietkragen en natte ruigtes; een karakteristieke zangvogel in voorjaar en zomer.',
    'Sedge Warbler Acrocephalus schoenobaenus.jpg','Outwivcamera','CC BY 4.0'),
  item('steppekievit','stelt','Steppekievit','Vanellus gregarius',
    'In Nederland een zeer zeldzame doortrekker; soms in open, agrarisch gebied.',
    'Sociable Lapwing.jpg','Alastair Rae','CC BY-SA 2.0'),
  item('kluut','stelt','Kluut','Recurvirostra avosetta',
    'Zoute kustplassen, kwelders en ondiepe watergebieden; vooral langs de kust.',
    'Pied Avocet (Recurvirostra avosetta).jpg','Lip Kee Yap','CC BY-SA 2.0'),
  item('zeearend','roof','Zeearend','Haliaeetus albicilla',
    'Grote meren, rivieren en moeraslandschappen; vaak hoog boven open water.',
    'White-tailed eagle (Haliaeetus albicilla).jpg','Bouke ten Cate','CC BY-SA 4.0'),
  item('rode-wouw','roof','Rode wouw','Milvus milvus',
    'Open landschap en bosranden, met de herkenbare diep gevorkte staart.',
    'Red kite (Milvus milvus).jpg','Charles J. Sharp','CC BY-SA 4.0'),
  item('kerkuil','uil','Kerkuil','Tyto alba',
    'Boerenerven en open graslanden; vooral rond schemering en in de nacht.',
    'Barn owl, Tyto alba.jpg','Mike Peel','CC BY-SA 4.0'),
  item('velduil','uil','Velduil','Asio flammeus',
    'Duinen, open graslanden en ruigtes; soms overdag jagend.',
    'Short-eared owl (Asio flammeus).jpg','David Grabovac','CC BY-SA 4.0'),
  item('dwergmeeuw','meeuw','Dwergmeeuw','Hydrocoloeus minutus',
    'Langs kust en open water tijdens de trek; klein en sierlijk in vlucht.',
    'Hydrocoloeus minutus Russia 12.jpg','Ekaterina Chernetsova','CC BY 2.0'),
  item('drieteenmeeuw','meeuw','Drieteenmeeuw','Rissa tridactyla',
    'Vooral op zee; soms vanaf de kust te zien, met name in het koude halfjaar.',
    'Black-legged kittiwake (Rissa tridactyla) 2026.jpg','TRinaud','CC BY 4.0'),
  item('roerdomp','reiger','Roerdomp','Botaurus stellaris',
    'Uitgestrekte rietmoerassen; vaak eerder te horen dan te zien.',
    'Botaurus stellaris.jpg','Peter Nijland','CC BY-SA 4.0'),
  item('purperreiger','reiger','Purperreiger','Ardea purpurea',
    'Moerasgebieden met hoge rietkragen, vooral tijdens het broedseizoen.',
    'Purple heron(Ardea purpurea).jpg','Vinay bhat','CC BY-SA 4.0'),
  item('scharrelaar','kleur','Scharrelaar','Coracias garrulus',
    'In Nederland uiterst zeldzaam; in de zomer vooral in Zuid- en Oost-Europa.',
    'European roller (Coracias garrulus).jpg','Charles J. Sharp','CC BY-SA 4.0'),
  item('bijeneter','kleur','Bijeneter','Merops apiaster',
    'Insectrijke, warme open gebieden met zandwanden; lokaal een zeldzame zomergast.',
    'European bee eater - Bijeneter - Merops apiaster.jpg','Bouke ten Cate','CC BY-SA 4.0'),
]);
export function birdsForTheme(theme='all'){
  return FEATURED_BIRDS.filter(b=>theme==='all'||b.theme===theme);
}
export function birdAtTime(theme='all',time=Date.now()){
  const list=birdsForTheme(theme);
  if(!list.length)return null;
  const ms=Number.isFinite(Number(time))?Math.max(0,Number(time)):0;
  return list[Math.floor(ms/SHOWCASE_INTERVAL_MS)%list.length];
}
export function nextSlideDelay(time=Date.now()){
  return SHOWCASE_INTERVAL_MS-((Number(time)%SHOWCASE_INTERVAL_MS+SHOWCASE_INTERVAL_MS)%SHOWCASE_INTERVAL_MS);
}
