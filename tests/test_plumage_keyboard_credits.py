#!/usr/bin/env python3
"""Independent R11: keyboard/credits and 320px narrow-screen regression.

Source-backed Birdspot gallery only; NO external photos, user storage, or
production deployment. A keyboard automation run is not a physical device QA.
"""
import threading
from playwright.sync_api import expect, sync_playwright
from test_pilot_offline_new_sighting import Quiet, ROOT, Server, boot

def open_bird(page, name, id_):
    page.locator('.nav-item[data-route="species"]').click()
    page.locator('#speciesFiltersToggle').click()
    page.locator('#speciesFilters .filter-chip[data-cat="alle"]').click()
    page.locator('#speciesSearch').fill(name)
    page.locator(f'.species-row[data-id="{id_}"] .species-row__body').click()
    page.locator('.sd-tabs').wait_for(timeout=12000)

def main():
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url=f"http://127.0.0.1:{server.server_address[1]}/"
        errors=[]
        with sync_playwright() as playwright:
            browser=playwright.chromium.launch()
            for width in (320,390):
                context=browser.new_context(viewport={"width":width,"height":760},reduced_motion="reduce",service_workers="block")
                try:
                    page=context.new_page()
                    page.on("pageerror", lambda err: errors.append(str(err)))
                    boot(page,url)
                    open_bird(page,"Zwarte Specht","sp018")
                    root=page.locator('#sdPanel-herkenning .sd-plumage-list[data-layout="compare"]')
                    expect(root).to_have_count(1)
                    expected=["adult_m","adult_f","juv"]
                    actual=root.locator(':scope > .sd-plumage').evaluate_all("els => els.map(e => e.dataset.plumage)")
                    assert actual==expected,(width, actual)
                    # All role photos must actually decode and have accessible names.
                    buttons=root.locator('button.sd-field-photo')
                    assert buttons.count()>=3
                    images=buttons.locator('img')
                    imgs=images.evaluate_all("""async els => {
                      for (const i of els) {i.loading='eager';await i.decode();}
                      return els.map(i=>({ok:i.complete&&i.naturalWidth>0,alt:i.alt,
                                          src:i.getAttribute('src')}));
                    }""")
                    assert all(i["ok"] and i["alt"].strip() and i["src"] for i in imgs),imgs
                    assert len({x["src"] for x in imgs})==len(imgs),"Repeated image in plumage roles"
                    labels=buttons.evaluate_all("els => els.map(b=>b.getAttribute('aria-label'))")
                    assert all(label and "Vergroot foto" in label for label in labels),labels
                    # No portion of compare section may be clipped horizontally.
                    sizes=root.evaluate("""el => {
                      const rect=el.getBoundingClientRect();
                      return {overflow:el.scrollWidth-el.clientWidth,left:rect.left,right:rect.right,
                              windowWidth:innerWidth,docWidth:document.documentElement.scrollWidth};
                    }""")
                    assert sizes["overflow"]<=2 and sizes["docWidth"]<=width+2,sizes
                    assert sizes["left"]>=-2 and sizes["right"]<=width+2,sizes
                    print(f"R11-{width}A PASS — 3 genuine photo roles, unique decoded images, alt and no overflow")
                    # True keyboard invocation for the existing photo button.
                    first=buttons.first
                    first.focus()
                    assert first.evaluate("e=>document.activeElement===e")
                    page.keyboard.press("Enter")
                    viewer=page.get_by_role("dialog",name="Vogelfoto bekijken")
                    expect(viewer).to_have_count(1)
                    page.keyboard.press("Escape")
                    expect(viewer).to_have_count(0)
                    print(f"R11-{width}B PASS — keyboard Enter opens photo zoom, Escape returns to guide")
                    # Real license/photographer display must still be available.
                    info=root.locator('details.photo-info').first
                    summary=info.locator('summary')
                    summary.focus()
                    page.keyboard.press("Enter")
                    expect(info).to_have_attribute("open","")
                    panel=info.locator('.photo-info__panel')
                    assert "Maker:" in panel.inner_text() and "Licentie:" in panel.inner_text()
                    assert panel.locator('a[href^="https://"]').count()>=1
                    summary.focus()
                    page.keyboard.press("Enter")
                    assert info.get_attribute("open") is None
                    print(f"R11-{width}C PASS — keyboard-accessible source attribution and license remain available")
                    # Role descriptions are intentionally collapsed, but reachable.
                    summary2=root.locator('[data-plumage="adult_f"] details.sd-plumage-more summary')
                    summary2.focus()
                    page.keyboard.press("Enter")
                    assert "Vrouwtje" in root.locator('[data-plumage="adult_f"]').inner_text()
                    assert root.locator('[data-plumage="adult_f"] details.sd-plumage-more').get_attribute("open") is not None
                    summary2.focus()
                    page.keyboard.press("Enter")
                    print(f"R11-{width}D PASS — identification details available by keyboard")
                    assert not errors,errors
                finally:
                    context.close()
            browser.close()
        server.shutdown()
    print("R11 VERIFIED 320/390px Chromium-only semantics, source credits and keyboard")
if __name__=="__main__":
    main()
