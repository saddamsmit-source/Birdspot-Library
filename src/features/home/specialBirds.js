/**
 * Birdspot editorial spotlight — eight birding themes with two species each.
 * Photos: Wikimedia Commons third-party CC licensed, with author/license links.
 * These are reference images, NEVER personal sightings or verified Dutch locations.
 * External files can be unavailable offline; preserve an elegant local fallback.
 */
import { SPECIES } from '../../data/species.js';
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
const CURATED_BIRDS=Object.freeze([
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
// Additional entries come directly from Birdspot's existing species library:
// known Dutch names, scientific names, actual fieldmarks and habitat tags.
// Photos/credits are resolved lazily from their Wikimedia Commons file metadata.
const EXTRA_IDS = (
  'sp005 sp006 sp007 sp008 sp009 sp011 sp013 sp014 sp015 '+
  'sp016 sp017 sp018 sp019 sp020 sp028 sp029 sp030 sp031 sp032 sp033 sp034 '+
  'sp035 sp036 sp037 sp038 sp039 sp040 sp041 sp042 sp045 sp046 sp047 sp048 '+
  'sp050 sp051 sp052 sp053 sp055 sp056 sp057 sp058 sp059 sp060 sp063 sp064 '+
  'sp065 sp066 sp068 sp069 sp070 sp071 sp073 sp075 sp076 sp077 sp080 '+
  'sp081 sp082 sp083 sp085 sp089 sp091 sp092 sp093 sp094 sp095 sp096 sp097 '+
  'sp098 sp099 sp100 sp101 sp102 sp103 sp104 sp108 sp109 sp111 sp114 sp115 sp117 sp118'
).split(' ');

const REGIONS={
  bos:'bossen en bosranden',stedelijk:'parken en steden',agrarisch:'open akker- en weidegebied',
  heide:'heidevelden',duinen:'duingebieden',kust:'de kust',wad:'het wad',
  polder:'polders',rivierengebied:'rivieren en oevers',moeras:'moerassen',
  rietland:'rietvelden',zee:'open zee',struweel:'struwelen',
};
const curatedNames=new Set(CURATED_BIRDS.map(b=>b.latin.toLowerCase()));
const ids=new Set(EXTRA_IDS);
const extras=SPECIES.filter(species=>ids.has(species.id) &&
  !curatedNames.has(species.nameSci.toLowerCase())).map(species=>{
  const habitats=(species.regions||[]).slice(0,2).map(x=>REGIONS[x]||x);
  const place=habitats.length?' Kijk bijvoorbeeld in '+habitats.join(' of ')+'.':'';
  return Object.freeze({
    id:'species-'+species.id,theme:'catalog',nl:species.nameNL,
    latin:species.nameSci,
    where:'Herkenning: '+(species.fieldmarks||'Let op kleur, formaat en vluchtbeeld.')+
      place,
    image:null,source:null,author:null,license:null,dynamicPhoto:true,
  });
});
export const FEATURED_BIRDS=Object.freeze([...CURATED_BIRDS,...extras]);

/** Deterministic Fisher-Yates. Used once for a persistent, mixed-category
 * personal slideshow order; does not reorder observations or stored species. */
export function shuffledBirds(seed=1){
  const result=[...FEATURED_BIRDS];
  let n=Number(seed)>>>0;
  for(let i=result.length-1;i>0;i--){
    n^=n<<13;n^=n>>>17;n^=n<<5;
    const j=(n>>>0)%(i+1);
    [result[i],result[j]]=[result[j],result[i]];
  }
  return result;
}

export function birdsForTheme(theme='all'){
  // The golden oriole is both a songbird and a colourful, unusual visitor.
  return FEATURED_BIRDS.filter(b=>theme==='all'||b.theme===theme||
    (theme==='kleur'&&b.id==='wielewaal'));
}
export function birdAtTime(theme='all',time=Date.now(),origin=0){
  const list=birdsForTheme(theme);
  if(!list.length)return null;
  const elapsed=Number.isFinite(Number(time))?
    Math.max(0,Number(time)-Number(origin||0)):0;
  return list[Math.floor(elapsed/SHOWCASE_INTERVAL_MS)%list.length];
}
export function nextSlideDelay(time=Date.now(),origin=0){
  const elapsed=Math.max(0,Number(time)-Number(origin||0));
  return SHOWCASE_INTERVAL_MS-((elapsed%SHOWCASE_INTERVAL_MS+SHOWCASE_INTERVAL_MS)%SHOWCASE_INTERVAL_MS);
}
