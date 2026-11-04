"""Birdspot Phase 3: factual Insights and Journal browser regression.
Local synthetic fixtures only. No real records touched.
"""
from __future__ import annotations
import http.server
import socketserver
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
SHOTS=ROOT/"tests"/"screenshots"
SHOTS.mkdir(parents=True,exist_ok=True)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args):pass
class Server(socketserver.TCPServer):allow_reuse_address=True

def shot(page,name):
    page.locator("#main-view").evaluate("(el) => el.scrollTop=0")
    page.screenshot(path=str(SHOTS/name),full_page=True,animations="disabled")

def main():
    with Server(("127.0.0.1",0),Handler) as server:
        threading.Thread(target=server.serve_forever,daemon=True).start()
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            ctx=browser.new_context(viewport={"width":390,"height":844},
                                    reduced_motion="reduce",service_workers="block")
            page=ctx.new_page(); errors=[]
            page.on("pageerror",lambda err:errors.append(str(err)))
            page.goto("http://127.0.0.1:"+str(server.server_address[1])+"/",wait_until="domcontentloaded")
            page.locator(".signature-home-intro").wait_for(timeout=13000)
            page.locator('[data-signature-route="insights"]').click()
            page.locator(".phase3-insights-empty").wait_for(timeout=9000)
            assert "Jouw ontdekkingen beginnen" in page.locator(".phase3-insights-empty").inner_text()
            shot(page,"phase3_insights_empty_390.png")

            # Real IDB photo plus dated, historical and invalid-date records.
            page.evaluate("""async () => {
              const {getDB}=await import('/src/data/db.js');
              const db=await getDB();
              const xml='<svg xmlns="http://www.w3.org/2000/svg" width="100" height="80"><rect width="100" height="80" fill="#398267"/></svg>';
              const blob=new Blob([xml],{type:'image/svg+xml'});
              await new Promise((resolve,reject)=>{
                const tx=db.transaction('photos','readwrite');
                tx.objectStore('photos').put({id:'p3-photo-1',blob,type:'image/svg+xml',
                  sightingId:'p3-a',speciesId:'sp001',filename:'journaal.svg'});
                tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
              });
              localStorage.setItem('birdspot-sightings',JSON.stringify({schemaVersion:2,
                sightings:[
                  {id:'p3-a',speciesId:'sp001',speciesName:'Stadsduif',date:'2026-01-15',time:'08:30',
                    locationName:'Duinpad',habitat:'bos',count:2,photoIds:['p3-photo-1'],notes:'Mijn eerste excursie'},
                  {id:'p3-b',speciesId:'sp002',speciesName:'Houtduif',date:'2026-01-16',time:'09:30',
                    locationName:'Zuidplas',habitat:'water',count:1,photoIds:[],notes:''},
                  {id:'p3-c',speciesId:'sp001',speciesName:'Stadsduif',date:'2026-03-01',time:'10:30',
                    locationName:'Duinpad',habitat:'bos',count:3,photoIds:[],notes:'Tweede ontmoeting'},
                  {id:'p3-d',speciesId:'sp003',speciesName:'Holenduif',date:'2026-03-01',time:'11:30',
                    locationName:'',habitat:'wei',count:1,photoIds:[],notes:''},
                  {id:'p3-old',speciesId:'sp004',speciesName:'Buizerd',date:'2025-12-31',time:'12:30',
                    locationName:'Vorig jaar',habitat:'stad',count:1,photoIds:[],notes:''},
                  {id:'p3-invalid',speciesId:'sp005',speciesName:'Uil',date:'2026-02-30',
                    locationName:'Ongeldige datum',habitat:'stad',count:1,photoIds:[],notes:''}
                ]}));
            }""")

            # Shared analytics functions must not invent or silently count invalid dates.
            data=page.evaluate("""async () => {
              const a=await import('/src/features/insights/analytics.js');
              const source=JSON.parse(localStorage.getItem('birdspot-sightings')).sightings;
              return {current:a.calculateInsights(source,2026),
                      historical:a.calculateInsights(source,2025),
                      validLeap:a.validDay('2024-02-29'),
                      invalidLeap:a.validDay('2026-02-30')};
            }""")
            s=data["current"]
            assert s["total"]==4,s
            assert s["speciesCount"]==3,s
            assert s["locationsCount"]==2,s
            assert s["photographed"]==1,s
            assert s["months"][0]["count"]==2,s
            assert s["months"][2]["count"]==2,s
            assert s["months"][2]["uniqueSpecies"]==3,s
            assert s["habitatTotal"]==4,s
            assert s["topSpecies"][0]["name"]=="Stadsduif",s
            assert s["topSpecies"][0]["count"]==2,s
            assert s["unknownDateCount"]==1,s
            assert s["previousYearTotal"]==1,s
            assert data["historical"]["total"]==1,data["historical"]
            assert data["validLeap"]=="2024-02-29"
            assert data["invalidLeap"] is None

            # View data is freshly fetched on navigation; previously opened screen is stale.
            page.locator('.nav-item[data-route="home"]').click()
            page.locator('[data-signature-route="insights"]').click()
            page.locator(".phase3-kpi").first.wait_for(timeout=10000)
            assert page.locator("#insightsYear").input_value()=="2026"
            assert page.locator(".phase3-kpi").count()==4
            assert page.locator(".phase3-kpi").nth(0).locator("strong").inner_text()=="3"
            assert page.locator(".phase3-chart-bar").count()==12
            assert "Stadsduif" in page.locator(".phase3-top-species").inner_text()
            assert "Bos" in page.locator(".phase3-habitat-legend").inner_text()
            shot(page,"phase3_insights_2026_390.png")
            page.locator('[data-chart-mode="species"]').click()
            assert page.locator('[data-chart-mode="species"]').get_attribute("aria-pressed")=="true"
            assert "Cumulatief" in page.locator(".phase3-panel-sub").first.inner_text()
            page.locator("#insightsYear").select_option("2025")
            assert page.locator(".phase3-kpi").nth(1).locator("strong").inner_text()=="1"
            shot(page,"phase3_insights_2025_390.png")

            page.locator("#insightsToJournal").click()
            page.locator(".phase3-journal-hero").wait_for(timeout=9000)
            assert page.locator("#journalResultsCount").inner_text()=="6 resultaten"
            assert page.locator(".phase3-journal-milestone").count()==4
            assert page.locator("[data-journal-id='p3-invalid']").count()==1
            assert page.locator(".phase3-journal-feature").is_visible()
            page.locator(".phase3-journal-photo img").first.wait_for(timeout=10000)
            shot(page,"phase3_journal_390.png")
            page.locator("#journalYear").select_option("2025")
            assert page.locator("#journalResultsCount").inner_text()=="1 resultaat"
            assert page.locator("#journalTimeline [data-journal-id='p3-old']").count()==1
            page.locator("#journalYear").select_option("all")
            page.locator("#journalSearch").fill("Stadsduif")
            assert page.locator("#journalResultsCount").inner_text()=="2 resultaten"
            assert page.locator(".phase3-journal-entry").count()==2
            page.locator("#journalSearch").fill("")
            page.locator("#journalSort").select_option("oldest")
            assert page.locator(".phase3-journal-entry").first.get_attribute("data-journal-id")=="p3-invalid"
            page.locator("#journalSort").select_option("newest")
            page.locator("[data-journal-id='p3-c']").first.click()
            page.locator("#detailSightingSheet").wait_for(timeout=9000)
            # Do not leave an overlay open when switching screens.
            page.locator("#detailClose").click()

            # Viewports: no hidden controls and no new JS exceptions.
            page.locator("#journalSearch").fill("")
            for width in (360,390,430):
                page.set_viewport_size({"width":width,"height":844})
                assert page.locator("#journalSearch").is_visible()
                assert page.locator(".phase3-journal-hero").is_visible()
                shot(page,"phase3_journal_"+str(width)+".png")
            page.locator("#journalToInsights").click()
            for width in (360,390,430):
                page.set_viewport_size({"width":width,"height":844})
                assert page.locator("#insightsYear").is_visible()
                assert page.locator(".phase3-chart-svg").count()==1
                shot(page,"phase3_insights_"+str(width)+".png")

            # Neither Insights nor Journal writes to the canonical sightings data.
            assert page.evaluate("""() =>
              JSON.parse(localStorage.getItem('birdspot-sightings')).sightings.length""")==6
            assert not errors,errors
            print("PASS: Phase3 Insights/Journal real data, invalid dates, photos, filters, mobile")
            ctx.close();browser.close()
        server.shutdown()

if __name__=="__main__":main()
