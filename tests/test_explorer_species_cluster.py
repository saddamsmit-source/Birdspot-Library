"""Birdspot Map: species search, color-coded statuses and mixed zoom-dependent clusters.
This test uses a controlled Leaflet API stub to verify actual map UI event paths
without depending on external tile/CDN availability. It cannot replace real
Leaflet MarkerCluster or physical-phone testing.
"""
from __future__ import annotations
import http.server, socketserver, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
SHOTS=ROOT/"tests"/"screenshots"
SHOTS.mkdir(parents=True,exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
    def log_message(self,*a):pass
class Server(socketserver.TCPServer):allow_reuse_address=True

LEAFLET_STUB=r"""(() => {
  const runtime={map:null,markers:[],rendered:[],renderCount:0};
  window.__birdspotMapTest=runtime;
  function redraw(layer){
    const map=layer._map;
    if(!map)return;
    for(const node of [...map.el.querySelectorAll('.mock-bird-marker')])node.remove();
    runtime.markers=[...layer.markers];
    runtime.renderCount++;
    if(layer.markers.length>=2 && map.zoom<13){
      const cluster={getAllChildMarkers:()=>layer.markers,getChildCount:()=>layer.markers.length};
      const icon=layer.options.iconCreateFunction(cluster);
      const wrap=document.createElement('div');
      wrap.className='mock-bird-marker mock-bird-cluster';
      // Synthetic test placement: never claims to be a real geographic projection.
      wrap.style.position='absolute';
      wrap.style.left='50%';wrap.style.top='54%';
      wrap.style.transform='translate(-50%,-50%)';wrap.style.zIndex='350';
      wrap.style.width=icon.iconSize[0]+'px';wrap.style.height=icon.iconSize[1]+'px';
      wrap.innerHTML=icon.html;
      map.el.appendChild(wrap);
      runtime.rendered=[icon.html];
    } else {
      runtime.rendered=[];
      const positions=[[21,45],[51,47],[78,42],[33,63],[70,65],[52,57]];
      for(const [i,marker] of layer.markers.entries()){
        const wrap=document.createElement('div');
        wrap.className='mock-bird-marker';
        // Only for QA screenshots. Actual pin position is owned by Leaflet.
        const [left,top]=positions[i%positions.length];
        wrap.style.position='absolute';wrap.style.zIndex='350';
        wrap.style.left=left+'%';wrap.style.top=top+'%';
        wrap.style.transform='translate(-50%,-50%)';
        wrap.style.width=marker.options.icon.iconSize[0]+'px';
        wrap.style.height=marker.options.icon.iconSize[1]+'px';
        wrap.innerHTML=marker.options.icon.html;
        map.el.appendChild(wrap);
        runtime.rendered.push(marker.options.icon.html);
      }
    }
  }
  window.L={
    map:(el,opts)=>{
      const c=opts.center||[52,5];
      const map={el,zoom:opts.zoom,options:opts,events:{},layer:null,center:{lat:c[0],lng:c[1]},
        remove(){for(const node of el.querySelectorAll('.mock-bird-marker'))node.remove();runtime.map=null},
        addLayer(layer){this.layer=layer;layer._map=this;redraw(layer);return this},
        on(type,cb){(this.events[type]=this.events[type]||[]).push(cb);return this},
        off(type,cb){this.events[type]=(this.events[type]||[]).filter(f=>f!==cb);return this},
        fire(type){for(const f of (this.events[type]||[]))f({});return this},
        getCenter(){return {...this.center}},getZoom(){return this.zoom},
        setView(ll,z){this.center={lat:ll[0],lng:ll[1]};if(z!==undefined)this.zoom=z;if(this.layer)redraw(this.layer);this.fire('move');this.fire('zoomend');return this},
        fitBounds(pts){if(pts&&pts.length){const la=pts.reduce((s,p)=>s+p[0],0)/pts.length,lo=pts.reduce((s,p)=>s+p[1],0)/pts.length;this.center={lat:la,lng:lo};runtime.fitted=pts;}this.fire('move');return this},
        panTo(ll){if(Array.isArray(ll))this.center={lat:ll[0],lng:ll[1]};this.fire('move');return this},
        flyTo(ll,z){return this.setView(ll,z)},
        invalidateSize(){return this},setZoom(z){this.zoom=z;if(this.layer)redraw(this.layer);this.fire('move');this.fire('zoomend');return this}
      };
      runtime.map=map;
      return map;
    },
    tileLayer:(url)=>({url,addTo(){(runtime.tiles=runtime.tiles||[]).push(url);return this},remove(){runtime.tiles=(runtime.tiles||[]).filter(u=>u!==url);return this}}),
    control:{
      attribution:()=>({addTo(){return this}}),
      zoom:()=>({addTo(){return this}})
    },
    marker:(coords,options)=>({coords,options,events:{},on(type,cb){this.events[type]=cb;return this},addTo(){return this},remove(){return this}}),
    divIcon:options=>options,
    markerClusterGroup:options=>({
      options,markers:[],_map:null,
      clearLayers(){this.markers=[];redraw(this);return this},
      addLayers(xs){this.markers.push(...xs);redraw(this);return this},
      addLayer(x){this.markers.push(x);redraw(this);return this}
    })
  };
})();"""

def main():
  with Server(("127.0.0.1",0),Quiet) as server:
    threading.Thread(target=server.serve_forever,daemon=True).start()
    with sync_playwright() as pw:
      browser=pw.chromium.launch(headless=True)
      context=browser.new_context(viewport={"width":390,"height":844},
                                  reduced_motion="reduce",service_workers="block")
      context.add_init_script(LEAFLET_STUB)
      p=context.new_page()
      errors=[]
      p.on("pageerror",lambda e:errors.append(str(e)))
      p.goto(f"http://127.0.0.1:{server.server_address[1]}/",wait_until="domcontentloaded")
      p.locator(".signature-home-intro").wait_for(timeout=12000)
      # Six pinned sightings in two Dutch provinces, and a seventh without GPS.
      p.evaluate("""() => {
        const rows=[
          {id:'k1',speciesId:'sp100',speciesName:'Koolmees',observationMethod:'seen',
           lat:51.57,lon:5.09,locationName:'Brabant'},
          {id:'k2',speciesId:'sp100',speciesName:'Koolmees',observationMethod:'heard',
           identificationSource:'merlin',merlinVerification:'suggested',
           lat:50.95,lon:5.82,locationName:'Limburg'},
          {id:'k3',speciesId:'sp100',speciesName:'Koolmees',observationMethod:'both',
           lat:51.58,lon:5.10,locationName:'Brabant'},
          {id:'k4',speciesId:'sp100',speciesName:'Koolmees',observationMethod:'heard',
           identificationSource:'self',lat:50.93,lon:5.83,locationName:'Limburg'},
          {id:'k5',speciesId:'sp100',speciesName:'Koolmees',
           lat:51.55,lon:5.11,locationName:'Brabant'},
          {id:'r1',speciesId:'sp101',speciesName:'Roodborst',observationMethod:'seen',
           lat:52.08,lon:5.16,locationName:'Utrecht'},
          {id:'k-unpinned',speciesId:'sp100',speciesName:'Koolmees',
           locationName:'Alleen tekst, geen GPS'}
        ];
        localStorage.setItem('birdspot-sightings',JSON.stringify({
          schemaVersion:2,sightings:rows.map((r,i)=>({
            ...r,date:'2026-10-0'+((i%7)+1),count:1,photoIds:[]
          }))
        }));
      }""")
      # Model/format assertions, including unknown legacy records and exact cluster shares.
      values=p.evaluate("""async () => {
        const m=await import('/src/features/map/visualization.js');
        const items=JSON.parse(localStorage.getItem('birdspot-sightings')).sightings;
        const onlyKoolmees=m.filteredSightings(items,{speciesSearch:'KooLMees',status:'all'});
        const counts=m.statusCounts(onlyKoolmees.filter(x=>x.lat!=null));
        return {
          keys:items.map(x=>m.statusForSighting(x)),
          counts,
          selected:onlyKoolmees.length,
          combined:m.clusterGradient(counts),
          merlin:m.filteredSightings(items,{speciesSearch:'koolmees',status:'merlin'}).map(x=>x.id),
          accent:m.normalizedSearch('Kóólmees')
        };
      }""")
      assert values["keys"]==["seen","merlin","both","heard","unknown","seen","unknown"],values
      assert values["counts"]=={"seen":1,"merlin":1,"both":1,"heard":1,"unknown":1},values
      assert values["selected"]==6,values
      assert "conic-gradient" in values["combined"] and "20.0000%" in values["combined"]
      assert values["merlin"]==["k2"]
      assert values["accent"]=="koolmees"

      p.locator('.nav-item[data-route="map"]').click()
      p.locator("#mapSpeciesSearch").wait_for(timeout=10000)
      # K1: filters zitten in een uitklappaneel achter de filterknop
      assert p.locator("#mapFilterPanel").is_hidden()
      p.locator("#mapFilterBtn").click()
      assert p.locator("#mapFilterPanel").is_visible()
      assert p.locator("#mapStatusSelect").count()==1
      assert p.locator(".bird-map-filter-scroll").count()==0
      assert p.locator("#mapStatusSelect").input_value()=="all"
      assert p.locator("#mapStatusSelect option").count()==6
      assert p.locator("#mapStatusIndicator").evaluate("(e)=>e.classList.contains('bird-map-dot--all')")
      p.wait_for_function("() => window.__birdspotMapTest.renderCount>0",timeout=8000)
      assert p.locator("#mapCount").inner_text()=="6 van 7 pins"
      assert p.locator(".mock-bird-cluster .bird-cluster-core strong").inner_text()=="6"
      assert all(color in p.locator(".bird-cluster-ring").get_attribute("style")
                 for color in ["#2F7DE1","#F2C230","#F07A26","#88939B"])
      assert "waarnemingen" in p.locator(".bird-cluster-ring").get_attribute("aria-label")
      p.screenshot(path=str(SHOTS/"bird_map_mixed_cluster_390.png"),animations="disabled")

      p.locator("#mapSpeciesSearch").fill("Koolmees")
      assert p.locator("#mapCount").inner_text()=="5 van 6 pins"
      assert p.locator(".mock-bird-cluster strong").inner_text()=="5"
      assert "(1)" in p.locator('#mapStatusSelect option[value="merlin"]').inner_text()
      assert "(5)" in p.locator('#mapStatusSelect option[value="all"]').inner_text()
      p.screenshot(path=str(SHOTS/"bird_map_koolmees_cluster_390.png"),animations="disabled")

      # Merlin only => purple, one pin, no cluster.
      p.locator('#mapStatusSelect').select_option("merlin")
      assert p.locator("#mapCount").inner_text()=="1 van 6 pins"
      assert p.locator(".bird-pin--status-merlin").count()==1
      assert p.locator(".bird-cluster-ring").count()==0
      assert p.locator('#mapStatusSelect').input_value()=="merlin"
      assert p.locator("#mapStatusIndicator").evaluate("(e)=>e.classList.contains('bird-map-dot--merlin')")
      # Both is gold; heard on own observation is blue.
      p.locator('#mapStatusSelect').select_option("both")
      assert p.locator(".bird-pin--status-both").count()==1
      p.locator('#mapStatusSelect').select_option("heard")
      assert p.locator(".bird-pin--status-heard").count()==1
      p.locator('#mapStatusSelect').select_option("unknown")
      assert p.locator(".bird-pin--status-unknown").count()==1
      p.locator('#mapStatusSelect').select_option("all")
      # Simulate the expected Leaflet.zoom behavior in isolation:
      # low zoom cluster, high zoom individual dots, low zoom cluster again.
      p.evaluate("() => window.__birdspotMapTest.map.setZoom(15)")
      assert p.locator(".bird-cluster-ring").count()==0
      assert p.locator(".mock-bird-marker .bird-pin").count()==5
      assert p.locator(".bird-pin--status-seen").count()==1
      assert p.locator(".bird-pin--status-merlin").count()==1
      assert p.locator(".bird-pin--status-both").count()==1
      assert p.locator(".bird-pin--status-heard").count()==1
      assert p.locator(".bird-pin--status-unknown").count()==1
      p.screenshot(path=str(SHOTS/"bird_map_koolmees_individual_390.png"),animations="disabled")
      p.evaluate("() => window.__birdspotMapTest.map.setZoom(7)")
      assert p.locator(".bird-cluster-core strong").inner_text()=="5"
      # Reset works, no record mutation or newly invented pins.
      p.locator("#mapClearFilters").click()
      assert p.locator("#mapSpeciesSearch").input_value()==""
      assert p.locator("#mapStatusSelect").input_value()=="all"
      assert p.locator("#mapStatusIndicator").evaluate("(e)=>e.classList.contains('bird-map-dot--all')")
      assert p.locator("#mapCount").inner_text()=="6 van 7 pins"
      assert p.locator(".bird-cluster-core strong").inner_text()=="6"
      assert p.evaluate("() => JSON.parse(localStorage.getItem('birdspot-sightings')).sightings.length")==7
      for width in (360,390,430):
        p.set_viewport_size({"width":width,"height":844})
        if p.locator("#mapFilterPanel").is_hidden(): p.locator("#mapFilterBtn").click()
        assert p.locator("#mapSpeciesSearch").is_visible()
        assert p.locator("#mapStatusSelect").is_visible()
        assert p.evaluate("""() => {
          const panel=document.querySelector('.bird-map-filters').getBoundingClientRect();
          const select=document.querySelector('#mapStatusSelect').getBoundingClientRect();
          return select.left>=panel.left && select.right<=panel.right+1;
        }""")
        assert p.locator("#mapAddPinBtn").is_visible()
        p.screenshot(path=str(SHOTS/f"bird_map_{width}.png"),animations="disabled")
      assert not errors,errors
      print("PASS: species+status filters, mixed cluster colors, zoom details, legacy, responsive")
      context.close();browser.close()
    server.shutdown()
if __name__=="__main__":main()
