/** Birdspot 1.27.21: exact place identity and live-audio window progression. */
import assert from 'node:assert/strict';
import { groupHotspots } from '../src/features/home/hotspots.js';
import { startSoundRecognition } from '../src/features/sightings/soundRecognition.js';

// Nearby observations from distinct pins MUST NOT be rounded into the same hotspot.
const data = [
  {id:'obs1',placeId:'pin-a',lat:51.92441,lon:4.47770,locationName:'Vijverpad',
    speciesName:'Merel',speciesId:'sp045'},
  {id:'obs2',placeId:'pin-a',lat:51.92445,lon:4.47774,locationName:'Vijverpad',
    speciesName:'Koolmees',speciesId:'sp029'},
  {id:'obs3',placeId:'pin-b',lat:51.92442,lon:4.47771,locationName:'Overkant',
    speciesName:'Kuifeend',speciesId:'sp092'},
  {id:'obs4',lat:53.2,lon:6.1,speciesName:'Zwarte Kraai',speciesId:'sp022'},
  {id:'obs5',lat:53.2,lon:6.1,speciesName:'Gaai',speciesId:'sp026'},
  {id:'bad1',lat:120,lon:2,locationName:'Onmogelijk'},
  {id:'bad2',lat:null,lon:2,locationName:'Geen GPS'},
];
const a = groupHotspots(data);
assert.equal(a.length,3,'2 real place IDs + exact-coordinate GPS-only point');
assert.deepEqual(a.map(g=>g.count),[2,2,1]);
assert.equal(a.find(g=>g.placeId==='pin-a').count,2);
assert.equal(a.find(g=>g.placeId==='pin-b').count,1);
assert.equal(a.find(g=>g.placeId==='pin-a').name,'Vijverpad');
assert.deepEqual(a.find(g=>g.placeId==='pin-a').speciesNames,['Koolmees','Merel']);
assert.ok(a.some(g=>g.name==='Locatie zonder naam'));
assert.equal(groupHotspots([{lat:NaN,lon:4}]).length,0);
console.log('HOTSPOT-01..05 PASS: GPS only, stable IDs, separate neighboring pins, species count, unnamed fallback');

// Simulated Worker tests the REAL session control code without an unverified model result.
class FakeWorker {
  constructor() { this.handlers = new Map();this.posts=[];this.stopped=false;FakeWorker.current=this; }
  addEventListener(type,handler) {
    this.handlers.set(type,[...(this.handlers.get(type)||[]),handler]);
  }
  emit(type,data={}) {for(const fn of this.handlers.get(type)||[])fn(type==='message'?{data}:{type})}
  postMessage(message,transfer) {
    assert.equal(message.samples.length,96000);
    assert.equal(transfer[0],message.samples.buffer);
    this.posts.push({second:message.second,first:message.samples[0]});
  }
  terminate() {this.stopped=true}
}
globalThis.Worker=FakeWorker;
const messages=[],hits=[];
const scanner=startSoundRecognition(s=>messages.push(s),(results,second)=>hits.push({results,second}));
const worker=FakeWorker.current;
const frame=(n)=>new Float32Array(4000).fill(n);
for(let i=0;i<24;i++)scanner.push(frame(1)); // first 3 s before 82MB model loaded
assert.equal(worker.posts.length,0,'no false inference before the model is ready');
worker.emit('message',{type:'ready'});
for(let i=0;i<24;i++)scanner.push(frame(2)); // actual new 3 s
assert.deepEqual(worker.posts,[{second:3,first:2}]);
for(let i=0;i<24;i++)scanner.push(frame(3)); // inference busy: skip, never replay
assert.equal(worker.posts.length,1);
worker.emit('message',{type:'results',results:[{id:'sp045',score:0.83}],second:3});
assert.equal(hits.length,1);
for(let i=0;i<24;i++)scanner.push(frame(4));
assert.deepEqual(worker.posts[1],{second:9,first:4},'fresh 9-12 s segment, no stale 6-9 s repeat');
assert.ok(messages.some(msg=>msg.includes('Live herkenning actief')));
scanner.stop();assert.equal(worker.stopped,true);
scanner.push(frame(5));assert.equal(worker.posts.length,2);
console.log('SOUND-01..06 PASS: start/loading, automatic proposals, fresh 3-s windows, busy drop, stop; no automatic pin');
