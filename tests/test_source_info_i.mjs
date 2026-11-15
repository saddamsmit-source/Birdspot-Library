/** Only an ⓘ disclosure exposes audio source/attribution; original rights stay intact. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_AUDIO } from '../src/features/species/guideMedia.js';
import { voicePanel } from '../src/features/species/detailSections.js';
import { photoInfoMarkup } from '../src/utils/photoInfo.js';

const data = JSON.parse(readFileSync(new URL('../assets/species/field-guide-media.json',import.meta.url)));
const styles = readFileSync(new URL('../styles/species.css',import.meta.url),'utf8');
assert.deepEqual(GUIDE_AUDIO, data.audio, 'Generated audio registry must equal canonical data');
assert.match(styles, /sd-audio-credits > summary:focus-visible/);
let count=0;
for(const s of SPECIES){
 const clips=data.audio[s.id]||[];
 if(!clips.length)continue;
 count++;
 const html=voicePanel(s,null);
 const at=html.indexOf('<details class="sd-audio-credits">');
 assert.ok(at>0,s.id+' disclosure missing');
 const exposed=html.slice(0,at),disclosure=html.slice(at);
 assert.ok(disclosure.includes('aria-label="Informatie en bronvermelding bij deze geluidsopnamen"'),s.id+' inaccessible info');
 assert.ok(disclosure.includes('class="sd-audio-info-symbol"'),s.id+' ⓘ icon missing');
 assert.ok(!exposed.includes('Opname-informatie en credits'),s.id+' noisy description outside disclosure');
 for(const clip of clips){
   assert.ok(exposed.includes(clip.label),s.id+' song/call player missing useful label');
   assert.ok(!exposed.includes(clip.author),s.id+' author visible outside ⓘ');
   assert.ok(!exposed.includes(clip.source),s.id+' source visible outside ⓘ');
   assert.ok(!exposed.includes(clip.file),s.id+' filename visible outside ⓘ');
   assert.ok(disclosure.includes(clip.author),s.id+' license credit lost');
   assert.ok(disclosure.includes(clip.license),s.id+' license text lost');
   assert.ok(disclosure.includes(clip.licenseUrl),s.id+' license URL lost');
   assert.ok(disclosure.includes(clip.source),s.id+' original source URL lost');
   assert.ok(!disclosure.includes('>'+clip.file+'</span>'),s.id+' technical filename must not be a separate visible label inside ⓘ; source URL is kept intact');
 }
}
const photo=photoInfoMarkup({file:'photo.webp',author:'Test Photographer',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',source:'https://example.com/photo',modifications:'Test crop'});
assert.ok(photo.includes('aria-label="Foto-informatie'), 'Existing image ⓘ accessibility must remain');
assert.ok(photo.includes('Test Photographer')&&photo.includes('https://example.com/photo'));
assert.ok(!photo.slice(0,photo.indexOf('photo-info__panel')).includes('Test Photographer'),'photo credit should be behind ⓘ where legal');
console.log('SOURCE INFO ⓘ PASS: '+count+' species hide routine audio provenance behind accessible info; image ⓘ still carries original rights.');
