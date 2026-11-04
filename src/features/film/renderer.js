/**
 * Birdspot Film Studio · device-local film exporter
 *
 * Frames are composed entirely from the user's IndexedDB photographs and clips.
 * CaptureStream + MediaRecorder are feature-detected. No uploads, external APIs,
 * audio tracks, third-party assets or permanent storage writes are performed.
 */
import { getPhoto } from '../../data/db.js';

export const FILM_LIMIT = 20;
export function chooseMovieFormat() {
  if (!('MediaRecorder' in window) || typeof HTMLCanvasElement.prototype.captureStream !== 'function')
    return null;
  for (const mime of [
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4',
  ]) {
    try { if (MediaRecorder.isTypeSupported(mime)) return mime; }
    catch (_) {}
  }
  return null;
}
export function movieEstimate(clips,options={}) {
  const count=Math.min(FILM_LIMIT,Array.isArray(clips)?clips.length:0);
  const seconds=[3,5].includes(Number(options.seconds)) ? Number(options.seconds):3;
  return { count,seconds:3+count*seconds+2,limit:FILM_LIMIT };
}
const abortError=()=>new DOMException('Export geannuleerd','AbortError');
function guard(signal) { if(signal?.aborted)throw abortError(); }
function sleepFrame(draw,duration,signal) {
  return new Promise((resolve,reject)=>{
    const start=performance.now();
    let frame=0;
    function next(now) {
      if(signal?.aborted)return reject(abortError());
      const elapsed=Math.min(now-start,duration);
      try {draw(elapsed,elapsed/duration);} catch(e) {return reject(e);}
      if(elapsed>=duration)return resolve();
      frame=requestAnimationFrame(next);
    }
    frame=requestAnimationFrame(next);
    // on abort, the next frame checks the signal and terminates.
  });
}
function gradient(ctx,w,h,accent='#2a6957') {
  const g=ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0,'#071b18');g.addColorStop(.6,accent);g.addColorStop(1,'#061613');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  const halo=ctx.createRadialGradient(w*.78,h*.2,10,w*.78,h*.2,w*.65);
  halo.addColorStop(0,'rgba(164,213,170,.19)');halo.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=halo;ctx.fillRect(0,0,w,h);
}
function safeWords(str,max=75) {
  return String(str||'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max);
}
function titleScreen(ctx,w,h,title,sub,progress) {
  gradient(ctx,w,h);
  ctx.globalAlpha=.2;
  ctx.strokeStyle='#dbbb80';ctx.lineWidth=Math.max(1,w/550);
  const radius=Math.min(w,h)*.3;
  ctx.beginPath();ctx.arc(w*.81,h*.23,radius,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.arc(w*.81,h*.23,radius*1.25,0,Math.PI*2);ctx.stroke();
  ctx.globalAlpha=1;
  const f=Math.max(12,Math.round(w*.021));
  ctx.fillStyle='#d9b77e';ctx.font='700 '+f+'px system-ui,sans-serif';
  ctx.fillText('BIRDSPOT  /  WILDLIFE EXPEDITION',w*.085,h*.3,w*.84);
  ctx.fillStyle='#f6efe2';
  ctx.font='700 '+Math.round(w*.057)+'px Georgia,serif';
  const t=safeWords(title,65);
  ctx.fillText(t,w*.085,h*.46,w*.83);
  ctx.fillStyle='#d0d9cd';ctx.font=Math.round(w*.023)+'px system-ui,sans-serif';
  ctx.fillText(safeWords(sub,95),w*.085,h*.52,w*.83);
  ctx.fillStyle='#d9b77e';ctx.fillRect(w*.085,h*.58,w*.16,Math.max(2,w*.003));
  // short fade-in/out removes black flash between film segments.
  ctx.fillStyle='#071b18';
  ctx.globalAlpha=Math.max(0,1-Math.min(progress/.18,1))+Math.max(0,(progress-.84)/.16);
  ctx.fillRect(0,0,w,h);ctx.globalAlpha=1;
}
function cover(ctx,source,w,h,scale=1) {
  const sw=source.videoWidth||source.naturalWidth||source.width;
  const sh=source.videoHeight||source.naturalHeight||source.height;
  if(!sw||!sh)throw new Error('Beeld kon niet worden geladen');
  const factor=Math.max(w/sw,h/sh)*scale;
  const tw=sw*factor,th=sh*factor;
  ctx.drawImage(source,(w-tw)/2,(h-th)/2,tw,th);
}
function frame(ctx,w,h,source,clip,progress,kind) {
  gradient(ctx,w,h,'#1a3a32');
  ctx.save();
  const scale=kind==='photo'?1.025+progress*.06:1;
  ctx.translate(w/2,h/2);
  ctx.scale(scale,scale);
  ctx.translate(-w/2,-h/2);
  cover(ctx,source,w,h);
  ctx.restore();
  const g=ctx.createLinearGradient(0,h*.58,0,h);
  g.addColorStop(0,'rgba(2,14,12,0)');g.addColorStop(1,'rgba(4,16,13,.84)');
  ctx.fillStyle=g;ctx.fillRect(0,h*.58,w,h*.42);
  ctx.font='750 '+Math.round(w*.017)+'px system-ui,sans-serif';
  ctx.fillStyle='#d6b581';ctx.fillText('BIRDSPOT  /  MY WILDLIFE',w*.06,h*.91,w*.88);
  ctx.fillStyle='#fff8e8';ctx.font='700 '+Math.round(w*.045)+'px Georgia,serif';
  ctx.fillText(safeWords(clip.name||'Vogelmoment',45),w*.06,h*.84,w*.88);
  ctx.fillStyle='#dce6d9';ctx.font=Math.round(w*.021)+'px system-ui,sans-serif';
  ctx.fillText(safeWords(clip.where||'',65),w*.06,h*.872,w*.85);
  const vignette=Math.max(0,1-Math.min(progress/.12,1))+Math.max(0,(progress-.88)/.12);
  if(vignette) {
    ctx.globalAlpha=Math.min(.88,vignette);ctx.fillStyle='#061613';
    ctx.fillRect(0,0,w,h);ctx.globalAlpha=1;
  }
}
async function mediaImage(blob,signal) {
  guard(signal);
  const url=URL.createObjectURL(blob),img=new Image();
  try {
    img.src=url;
    await Promise.race([img.decode(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Foto laden duurt te lang')),15000))]);
    guard(signal);
    return img;
  } finally {
    // Keep the image decoded in memory; no URL is needed after decode.
    URL.revokeObjectURL(url);
  }
}
async function mediaVideo(blob,signal) {
  guard(signal);
  const url=URL.createObjectURL(blob);
  const video=document.createElement('video');
  video.preload='auto';video.muted=true;video.playsInline=true;
  video.volume=0;video.src=url;
  try {
    await Promise.race([
      new Promise((resolve,reject)=>{
        if(video.readyState>=2)return resolve();
        video.addEventListener('loadeddata',resolve,{once:true});
        video.addEventListener('error',()=>reject(new Error('Video kan niet worden gelezen')),{once:true});
        video.load();
      }),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('Videobestand kan niet worden geladen')),15000)),
    ]);
    guard(signal);
    await video.play();
    return {video,url};
  } catch(err) {
    video.pause();video.removeAttribute('src');video.load();
    URL.revokeObjectURL(url);throw err;
  }
}
/**
 * Creates an original silent video file from the selected local media.
 * The user must initiate it; failures propagate and are never reported as PASS.
 * All temporary resources are released even when a clip fails or export is canceled.
 */
export async function renderFilm({clips,options={},signal,onProgress=()=>{}}) {
  if(!Array.isArray(clips)||!clips.length)throw new Error('Selecteer eerst vogelbeelden');
  if(clips.length>FILM_LIMIT)throw new Error('Selecteer maximaal '+FILM_LIMIT+' beelden');
  const mime=chooseMovieFormat();
  if(!mime)throw new Error('Deze browser ondersteunt filmexport niet. Je filmselectie blijft bewaard.');
  const aspect=options.aspect==='portrait'?'portrait':'landscape';
  const w=aspect==='portrait'?720:1280;
  const h=aspect==='portrait'?1280:720;
  const seconds=[3,5].includes(Number(options.seconds))?Number(options.seconds):3;
  const title=safeWords(options.title||'My Birding Story',65);
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)throw new Error('Canvas niet beschikbaar');
  gradient(ctx,w,h);
  const stream=canvas.captureStream(20);
  const parts=[];
  let rec=null,activeVideo=null;
  const abort=()=>{ try{if(rec?.state==='recording')rec.stop();}catch(_){} };
  signal?.addEventListener('abort',abort,{once:true});
  try {
    rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2400000});
    const stopped=new Promise((resolve,reject)=>{
      rec.addEventListener('dataavailable',e=>{if(e.data?.size)parts.push(e.data)});
      rec.addEventListener('stop',resolve,{once:true});
      rec.addEventListener('error',()=>reject(new Error('Videocodering mislukt')),{once:true});
    });
    rec.start(250);
    onProgress({done:0,total:clips.length+2,label:'Filmintro'});
    await sleepFrame((_,p)=>titleScreen(ctx,w,h,title,'Een persoonlijk vogelverhaal',p),2100,signal);
    let completed=0;
    for(const clip of clips) {
      guard(signal);
      const photo=await getPhoto(clip.id);
      if(!photo?.blob || !(photo.blob instanceof Blob)) {
        throw new Error('Geselecteerd bestand ontbreekt: '+safeWords(clip.name));
      }
      const type=photo.blob.type||photo.type||'';
      onProgress({done:completed+1,total:clips.length+2,label:'Beeld '+(completed+1)+' van '+clips.length});
      if(type.startsWith('image/')) {
        const img=await mediaImage(photo.blob,signal);
        await sleepFrame((_,p)=>frame(ctx,w,h,img,clip,p,'photo'),seconds*1000,signal);
      } else if(type.startsWith('video/')) {
        const {video,url}=await mediaVideo(photo.blob,signal);
        activeVideo={video,url};
        const segment=Math.min(seconds,Number.isFinite(video.duration)?Math.max(.4,video.duration):seconds);
        await sleepFrame((_,p)=>frame(ctx,w,h,video,clip,p,'video'),segment*1000,signal);
        video.pause();video.removeAttribute('src');video.load();URL.revokeObjectURL(url);
        activeVideo=null;
      } else throw new Error('Niet-ondersteund mediaformaat in filmselectie');
      completed++;
    }
    guard(signal);
    onProgress({done:clips.length+1,total:clips.length+2,label:'Afsluiting'});
    await sleepFrame((_,p)=>titleScreen(ctx,w,h,'BIRDSPOT','Your wildlife. Your discoveries.',p),1500,signal);
    guard(signal);
    rec.stop();
    await stopped;
    guard(signal);
    const type=rec.mimeType||mime;
    const file=new Blob(parts,{type:type.split(';')[0]});
    if(file.size<1024)throw new Error('De film bevat geen bruikbare videodata');
    onProgress({done:clips.length+2,total:clips.length+2,label:'Gereed'});
    return {blob:file,extension:file.type==='video/mp4'?'mp4':'webm',mimeType:file.type,width:w,height:h};
  } finally {
    signal?.removeEventListener('abort',abort);
    if(activeVideo) {
      activeVideo.video.pause();activeVideo.video.removeAttribute('src');activeVideo.video.load();
      URL.revokeObjectURL(activeVideo.url);
    }
    if(rec?.state==='recording'){try{rec.stop()}catch(_){}}
    stream.getTracks().forEach(track=>track.stop());
  }
}
