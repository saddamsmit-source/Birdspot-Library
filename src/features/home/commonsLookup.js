/**
 * Lazy Wikimedia Commons lookup for additional Netherlands bird species.
 * A direct scientific-name search is preferred over guessing filenames or
 * attaching wrong bird images. Every result carries the actual media license,
 * artist and source page. One network request only when a bird is visible.
 * Fail closed: CSS nature fallback, never a mismatched "species" photograph.
 */
const cache=new Map();
const SAFE_MIME=/^image\/(?:jpeg|png|webp)$/i;
const ACCEPTED_LICENSE=/^(?:CC0|Public domain|CC BY(?:-SA)?(?: \d(?:\.\d)?)?)$/i;
function textValue(raw){
  if(!raw)return '';
  const documentFragment=new DOMParser().parseFromString(String(raw),'text/html');
  return String(documentFragment.body.textContent||'').replace(/\s+/g,' ').trim().slice(0,96);
}
function candidateFromPage(page,latin){
  const info=page?.imageinfo?.[0];
  if(!info || !SAFE_MIME.test(info.mime||''))return null;
  const title=String(page.title||'');
  const desc=textValue(info.extmetadata?.ImageDescription?.value||'');
  const name=latin.toLocaleLowerCase('en');
  if(!title.toLocaleLowerCase('en').includes(name) &&
     !desc.toLocaleLowerCase('en').includes(name))return null;
  const meta=info.extmetadata||{};
  const license=textValue(meta.LicenseShortName?.value||'');
  if(!ACCEPTED_LICENSE.test(license))return null;
  const url=info.thumburl||info.url;
  if(!/^https:\/\/upload\.wikimedia\.org\//.test(url||''))return null;
  const source=info.descriptionurl;
  if(!/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(source||''))return null;
  return {image:url,source,author:textValue(meta.Artist?.value)||'Wikimedia Commons',
    license,matched:1};
}
async function performLookup(bird){
  if(!bird?.latin)return null;
  const search=bird.id==='kerkuil'?bird.latin+' flight':bird.latin;
  async function query(q){
    const url='https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({
      action:'query',format:'json',origin:'*',generator:'search',
      gsrsearch:'"'+q+'"',gsrnamespace:'6',gsrlimit:'12',
      prop:'imageinfo',iiprop:'url|mime|extmetadata',iiurlwidth:'1120',
    });
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),6500);
    try{
      const response=await fetch(url,{signal:controller.signal,mode:'cors',credentials:'omit'});
      if(!response.ok)throw new Error('Commons source not available');
      const data=await response.json();
      return Object.values(data?.query?.pages||{}).map(p=>candidateFromPage(p,bird.latin)).filter(Boolean);
    } finally{clearTimeout(timer)}
  }
  try {
    const first=await query(search);
    if(first.length)return first[0];
    if(search!==bird.latin){
      const second=await query(bird.latin);
      return second[0]||null;
    }
  }catch(_){return null}
  return null;
}
export function commonsBirdPhoto(bird){
  const key=bird?.latin;
  if(!key)return Promise.resolve(null);
  if(cache.has(key))return cache.get(key);
  const pending=performLookup(bird);
  cache.set(key,pending);
  return pending;
}
