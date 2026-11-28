"""Birdspot Phase 3: factual Insights and Journal browser regression.
Local synthetic fixtures only. No real records touched.
"""
from __future__ import annotations
import http.server
import socketserver
import threading
from pathlib import Path
from playwright.sync_api import expect, sync_playwright

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

def contrast(page, text, surface, pseudo=None):
    return page.evaluate(r"""([text, surface, pseudo]) => {
        const tone = (node, property, state=null) => getComputedStyle(document.querySelector(node), state)[property];
        const luminance = value => {
            const rgb = value.match(/[\d.]+/g).slice(0, 3).map(x => Number(x) / 255);
            return rgb.map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4)
                      .reduce((sum, x, i) => sum + x * [.2126, .7152, .0722][i], 0);
        };
        const a = luminance(tone(text, 'color', pseudo));
        const b = luminance(tone(surface, 'backgroundColor'));
        return (Math.max(a,b) + .05) / (Math.min(a,b) + .05);
    }""", [text, surface, pseudo])

def check_insights_links(page):
    def tap(key):
        page.locator(f'[data-insights-action="{key}"]').click()

    def back():
        page.evaluate("history.back()")
        expect(page.locator("#insightsYear")).to_have_value("2026")
        expect(page.locator(".phase3-kpi-grid")).to_be_visible()

    def journal(expected, extra=None):
        expect(page.locator("#journalResultsCount")).to_have_text(expected)
        expect(page.locator("#journalYear")).to_have_value("2026")
        if extra:
            expect(page.locator("#journalSelectionLabel")).to_contain_text(extra)

    tap("overview-bird")
    expect(page.locator("#speciesYearScope")).to_contain_text("Jaarlijst 2026")
    expect(page.locator("#speciesList .species-row")).to_have_count(3)
    back()
    tap("overview-observations")
    journal("4 resultaten")
    back()
    tap("overview-pin")
    journal("3 resultaten", "Met locatie")
    back()
    tap("overview-media")
    journal("2 resultaten", "Met beeld of geluid")
    page.locator("#journalClearSelection").click()
    journal("4 resultaten")
    back()

    tap("field-calendar")
    journal("4 resultaten")
    expect(page.locator("#journalGrouping")).to_have_value("day")
    expect(page.locator("#journalTimeline h3")).to_have_count(3)
    back()
    position = page.locator("#main-view").evaluate("el => el.scrollTop")
    assert position > 0, position
    expect(page.locator('[data-insights-action="field-calendar"]')).to_be_focused()
    tap("field-year")
    journal("4 resultaten")
    expect(page.locator("#journalGrouping")).to_have_value("month")
    expect(page.locator("#journalTimeline h3").first).to_contain_text("maart 2026")
    expect(page.locator("#journalTimeline h3")).to_have_count(2)
    back()
    for key, count, label in (
        ("field-book", "2 resultaten", "Met notities"),
        ("field-soundwave", "1 resultaat", "Met eigen geluidsopname"),
        ("field-shield", "1 resultaat", "Zelf gecontroleerd geluid"),
        ("method-seen", "1 resultaat", "Alleen gezien"),
        ("moment-year", "2 resultaten", "januari"),
        ("moment-calendar", "2 resultaten", "1 maart 2026"),
    ):
        tap(key)
        journal(count,label)
        back()

    page.route("https://**/*", lambda route: route.abort())
    tap("field-pin")
    expect(page.locator("#mapPeriodSelect")).to_have_value("2026", timeout=12000)
    expect(page.locator("#mapCount")).to_have_text("1 pin · 2026")
    page.locator("#explorerSightingsBtn").click()
    journal("1 resultaat","Met GPS")
    page.evaluate("history.back()")
    expect(page.locator("#mapPeriodSelect")).to_have_value("2026", timeout=12000)
    back()
    page.unroute("https://**/*")

    tap("top-0")
    expect(page.locator(".signature-species-detail-sheet")).to_be_visible()
    back()
    tap("moment-first")
    expect(page.locator("#detailSightingSheet .sheet__title")).to_have_text("Stadsduif")
    back()
    page.locator(".phase3-month-detail summary").click()
    tap("month-3")
    journal("2 resultaten","maart")
    back()
    expect(page.locator(".phase3-month-detail")).to_have_attribute("open","")
    page.locator(".phase3-month-detail summary").click()
    print("PASS: doorklikken naar jaarlijst, dagboekfilters, GPS, soortdetail en mijlpalen met terugkeer")

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
            page.locator("#homeMoreFeatures summary").click()
            page.locator('#homeMoreFeatures [data-signature-route="insights"]').click()
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
                    locationName:'Duinpad',habitat:'bos',count:2,photoIds:['p3-photo-1'],notes:'Mijn eerste excursie',
                    observationMethod:'seen',lat:52.1,lon:4.5},
                  {id:'p3-b',speciesId:'sp002',speciesName:'Houtduif',date:'2026-01-16',time:'09:30',
                    locationName:'Zuidplas',habitat:'water',count:1,photoIds:[],notes:'',
                    observationMethod:'heard',audioIds:['p3-audio-1'],identificationSource:'merlin',merlinVerification:'checked'},
                  {id:'p3-c',speciesId:'sp001',speciesName:'Stadsduif',date:'2026-03-01',time:'10:30',
                    locationName:'Duinpad',habitat:'bos',count:3,photoIds:[],notes:'Tweede ontmoeting',observationMethod:'both'},
                  {id:'p3-d',speciesId:'sp003',speciesName:'Holenduif',date:'2026-03-01',time:'11:30',
                    locationName:'',habitat:'wei',count:1,photoIds:[],notes:''},
                  {id:'p3-old',speciesId:'sp004',speciesName:'Buizerd',date:'2025-12-31',time:'12:30',
                    locationName:'Vorig jaar',habitat:'stad',count:1,photoIds:[],notes:'',lat:52.2,lon:4.7},
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
                      combinedMedia:a.summarizeFieldwork([{photoIds:['foto'],audioIds:['geluid']}]),
                      validLeap:a.validDay('2024-02-29'),
                      invalidLeap:a.validDay('2026-02-30')};
            }""")
            s=data["current"]
            assert s["total"]==4,s
            assert s["speciesCount"]==3,s
            assert s["locationsCount"]==2,s
            assert s["photographed"]==1,s
            assert s["months"][0]["count"]==2,s
            assert s["months"][0]["methods"]=={"seen":1,"heard":1,"both":0,"unrecorded":0},s
            assert s["months"][2]["methods"]=={"seen":0,"heard":0,"both":1,"unrecorded":1},s
            assert s["activeDays"]==3 and s["activeMonths"]==2,s
            assert s["fieldwork"]=={
                "methods":{"seen":1,"heard":1,"both":1,"unrecorded":1},
                "mediaCount":2,"audioCount":1,"notesCount":2,"gpsCount":1,"sourceReviewCount":1,
            },s
            assert data["combinedMedia"]["mediaCount"]==1,data
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
            page.locator("#homeMoreFeatures summary").click()
            page.locator('#homeMoreFeatures [data-signature-route="insights"]').click()
            page.locator(".phase3-kpi").first.wait_for(timeout=10000)
            assert page.locator("#insightsYear").input_value()=="2026"
            assert page.locator(".phase3-kpi").count()==4
            assert page.locator(".phase3-kpi").nth(0).locator("strong").inner_text()=="3"
            assert page.locator(".phase3-bar-group").count()==12
            assert page.locator(".phase3-chart-bar[data-method]").count()==4
            assert page.locator(".phase3-kpi").nth(3).locator("strong").inner_text()=="2"
            assert page.locator(".phase3-field-link strong").all_text_contents()==["3","2","1","2","1","1"]
            page.get_by_text("Bekijk aantallen per maand", exact=True).click()
            assert page.locator(".phase3-month-detail tbody tr").first.locator("td").all_text_contents()==["2","1","1","0","0"]
            assert page.locator(".phase3-month-detail tbody tr").nth(2).locator("td").all_text_contents()==["2","0","0","1","1"]
            page.get_by_text("Bekijk aantallen per maand", exact=True).click()
            assert "Stadsduif" in page.locator(".phase3-top-species").inner_text()
            assert "Bos" in page.locator(".phase3-habitat-legend").inner_text()
            shot(page,"phase3_insights_2026_390.png")
            page.locator("#main-view").evaluate("(el) => el.scrollTop=540")
            page.screenshot(path=str(SHOTS/"phase3_insights_chart_390.png"),animations="disabled")
            page.locator("#main-view").evaluate("(el) => el.scrollTop=1160")
            page.screenshot(path=str(SHOTS/"phase3_insights_habitat_390.png"),animations="disabled")
            check_insights_links(page)
            page.locator('[data-chart-mode="species"]').click()
            assert page.locator('[data-chart-mode="species"]').get_attribute("aria-pressed")=="true"
            assert "Cumulatief" in page.locator(".phase3-panel-sub").first.inner_text()
            assert page.locator(".phase3-chart-bar--teal").count()==12
            assert page.locator('[data-chart-mode="species"]').evaluate("(el) => el === document.activeElement")
            page.locator("#insightsYear").select_option("2025")
            assert page.locator(".phase3-kpi").nth(1).locator("strong").inner_text()=="1"
            shot(page,"phase3_insights_2025_390.png")

            page.locator("#insightsToJournal").click()
            page.locator(".phase3-journal-hero").wait_for(timeout=9000)
            expect(page.locator("#journalYear")).to_have_value("2025")
            expect(page.locator("#journalResultsCount")).to_have_text("1 resultaat")
            page.locator("#journalYear").select_option("all")
            assert page.locator("#journalResultsCount").inner_text()=="6 resultaten"
            assert page.locator(".phase3-journal-milestone").count()==4
            assert page.locator("#journalMethods .phase3-method--unrecorded strong").inner_text()=="3"
            assert page.locator("[data-journal-id='p3-invalid']").count()==1
            assert page.locator(".phase3-journal-feature").is_visible()
            page.locator(".phase3-journal-photo img").first.wait_for(timeout=10000)
            page.wait_for_function("""() => {
              const img=document.querySelector(".phase3-journal-photo img");
              return !!img && img.complete && img.naturalWidth>0;
            }""",timeout=10000)
            shot(page,"phase3_journal_390.png")
            page.locator("#main-view").evaluate("(el) => el.scrollTop=640")
            page.screenshot(path=str(SHOTS/"phase3_journal_timeline_390.png"),animations="disabled")
            page.locator("#journalYear").select_option("2025")
            assert page.locator("#journalResultsCount").inner_text()=="1 resultaat"
            assert page.locator("#journalTimeline [data-journal-id='p3-old']").count()==1
            page.locator("#journalYear").select_option("all")
            page.locator("#journalSearch").fill("Stadsduif")
            assert page.locator("#journalResultsCount").inner_text()=="2 resultaten"
            assert page.locator(".phase3-journal-entry").count()==2
            assert page.locator("#journalMethods .phase3-method--seen strong").inner_text()=="1"
            assert page.locator("#journalMethods .phase3-method--both strong").inner_text()=="1"
            assert page.locator("#journalMethods .phase3-method--unrecorded").count()==0
            page.locator("#journalSearch").fill("")
            page.locator("#journalSort").select_option("oldest")
            assert page.locator(".phase3-journal-entry").first.get_attribute("data-journal-id")=="p3-invalid"
            page.locator("#journalSort").select_option("newest")
            page.locator("[data-journal-id='p3-a']").first.click()
            detail = page.locator("#detailSightingSheet")
            detail.wait_for(timeout=9000)
            detail.get_by_role("button", name="Vergroot foto").click()
            zoom = page.get_by_role("dialog", name="Vogelfoto bekijken")
            zoom.get_by_role("button", name="Inzoomen").click()
            assert zoom.get_by_role("button", name="Zoom herstellen").inner_text() == "2×"
            page.keyboard.press("Escape")
            zoom.wait_for(state="detached")
            assert detail.is_visible()
            page.locator("#detailClose").click()

            # Viewports: no hidden controls and no new JS exceptions.
            page.locator("#journalSearch").fill("")
            for width in (320,360,390,430):
                page.set_viewport_size({"width":width,"height":844})
                assert page.locator("#journalSearch").is_visible()
                assert page.locator(".phase3-journal-hero").is_visible()
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
                shot(page,"phase3_journal_"+str(width)+".png")
            for theme in ('light', 'dark'):
                page.emulate_media(color_scheme=theme)
                for surface in ['.phase3-metric--bird', '.phase3-metric--observations', '.phase3-metric--pin', '.phase3-metric--media']:
                    assert contrast(page, f"{surface} strong", surface) >= 4.5, (theme, surface, "number")
                    assert contrast(page, f"{surface} small", surface) >= 4.5, (theme, surface, "label")
                    assert contrast(page, f"{surface} .ui-icon", surface) >= 3, (theme, surface, "icon")
                assert contrast(page, "#journalSearch", "#journalSearch", "::placeholder") >= 4.5, theme
            page.locator("#journalToInsights").click()
            page.locator("#insightsYear").wait_for(timeout=10000)
            page.locator(".phase3-chart-svg").wait_for(timeout=10000)
            page.locator(".phase3-month-detail summary").click()
            for width in (320,360,390,430):
                page.set_viewport_size({"width":width,"height":844})
                assert page.locator("#insightsYear").is_visible()
                assert page.locator(".phase3-chart-svg").count()==1
                assert page.locator(".phase3-month-panel").evaluate("(el) => el.scrollWidth <= el.clientWidth")
                shot(page,"phase3_insights_"+str(width)+".png")
            for theme in ('light', 'dark'):
                page.emulate_media(color_scheme=theme)
                assert contrast(page, ".phase3-month-panel .phase3-method--heard svg", ".phase3-month-panel") >= 3, theme
                assert contrast(page, ".phase3-month-detail summary", ".phase3-month-panel") >= 4.5, theme

            # Neither Insights nor Journal writes to the canonical sightings data.
            assert page.evaluate("""() =>
              JSON.parse(localStorage.getItem('birdspot-sightings')).sightings.length""")==6
            assert not errors,errors
            print("PASS: Phase3 Insights/Journal real data, invalid dates, photos, filters, mobile")
            ctx.close();browser.close()
        server.shutdown()

if __name__=="__main__":main()
