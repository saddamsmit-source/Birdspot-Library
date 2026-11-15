"""Mobile personal guide flow, ZIP restore and owner inbox.
The browser substitutes a test receiver. test_photo_feedback.mjs exercises the handler.
"""
import json
import threading
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

from test_species_detail import Quiet, Server, ROOT, SHOTS, LEAFLET_STUB

PHOTO = {
    "name": "voorbeeld.webp",
    "mimeType": "image/webp",
    "buffer": (ROOT / "assets/species/plumage/sp092-hero-male.webp").read_bytes(),
}
OTHER = {
    "name": "andere.webp",
    "mimeType": "image/webp",
    "buffer": (ROOT / "assets/species/plumage/sp092-flight.webp").read_bytes(),
}


def open_card(page, name, sid):
    page.locator('.nav-item[data-route="species"]').click()
    page.locator('#speciesSearch').fill(name)
    page.locator(f'.species-row[data-id="{sid}"] .species-row__body').click()
    return page.get_by_role("dialog", name=name, exact=True)


def choose(panel, slot):
    panel.locator(f'[data-guide-slot="{slot}"] .sd-guide-action').click()
    editor = panel.page.locator(".sd-guide-editor")
    expect(editor).to_be_visible()
    return editor


def own_photo(panel, slot):
    return panel.locator(f'[data-guide-slot="{slot}"] .sd-guide-own img')


def put(editor, photo):
    editor.locator('input[type="file"]').set_input_files(photo)
    editor.get_by_role('button', name='Gebruik in mijn gids').click()
    expect(editor).to_be_hidden()


def main():
    with Server(("127.0.0.1", 0), Quiet) as server, sync_playwright() as pw:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        base = f"http://127.0.0.1:{server.server_address[1]}/"
        chromium = pw.chromium.launch()
        settings = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True,
                        reduced_motion="reduce", service_workers="block")
        context = chromium.new_context(**settings)
        context.add_init_script(LEAFLET_STUB)
        page = context.new_page()
        sent = []
        online = False

        def receive(route):
            if route.request.method == 'POST':
                entry = route.request.post_data_json
                sent.append(entry)
                route.fulfill(json={"id": entry["id"]} if online else {"error": "offline"},
                              status=201 if online else 503)
            elif route.request.headers.get('authorization') != 'Bearer test-owner':
                route.fulfill(json={"error": "Alleen de beheerder heeft toegang."}, status=401)
            elif '?id=' in route.request.url:
                route.fulfill(json=sent[-1])
            else:
                route.fulfill(json={"items": [{"id": sent[-1]["id"], "receivedAt": "2026-11-15T12:00:00Z"}]})

        page.route("**/api/photo-feedback*", receive)
        page.goto(base, wait_until="domcontentloaded")
        page.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
        kuifeend = open_card(page, "Kuifeend", "sp092")
        stock = kuifeend.locator('[data-guide-slot="hero"] .sd-guide-stock')
        expect(stock).to_be_visible()
        editor = choose(kuifeend, 'hero')
        editor.locator('input[type="file"]').set_input_files({
            "name": "fout.jpg", "mimeType": "image/jpeg", "buffer": b"not an image",
        })
        editor.get_by_role('button', name='Gebruik in mijn gids').click()
        expect(editor.get_by_role('status')).to_contain_text('niet worden geopend')
        page.keyboard.press('Escape')
        expect(editor).to_be_hidden()
        expect(kuifeend).to_be_visible()
        context.set_offline(True)
        put(choose(kuifeend, 'hero'), PHOTO)
        expect(stock).to_be_hidden()
        own_photo(kuifeend, 'hero').evaluate("img => img.decode()")
        context.set_offline(False)
        assert not sent, "local save unexpectedly shared"
        kuifeend.get_by_role('button', name='Sluit soortdetail').click()
        page.reload(wait_until='domcontentloaded')
        page.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
        kuifeend = open_card(page, "Kuifeend", "sp092")
        expect(own_photo(kuifeend, 'hero')).to_be_visible()
        put(choose(kuifeend, 'hero'), OTHER)
        assert kuifeend.locator('[data-guide-slot="hero"] .sd-guide-own img').count() == 1
        choose(kuifeend, 'hero').get_by_role('button', name='Herstel standaardfoto').click()
        expect(stock).to_be_visible()
        expect(own_photo(kuifeend, 'hero')).to_have_count(0)
        kuifeend.get_by_role('button', name='Sluit soortdetail').click()

        heron = open_card(page, "Groene Reiger", "sp459")
        put(choose(heron, 'flight-neutral'), PHOTO)
        expect(own_photo(heron, 'flight-neutral')).to_be_visible()
        editor = choose(heron, 'flight-neutral')
        editor.locator('summary').click()
        editor.get_by_role('button', name='Stuur foto ter beoordeling').click()
        expect(editor.get_by_role('status')).to_contain_text('Bevestig')
        assert not sent
        editor.get_by_role('checkbox').check()
        editor.locator('textarea').fill('Mijn voorstel voor de vluchtfoto.')
        editor.get_by_role('button', name='Stuur foto ter beoordeling').click()
        expect(editor.get_by_role('status')).to_contain_text('Ontvangst is niet bevestigd')
        expect(editor.get_by_role('button', name='Download fotovoorstel')).to_be_visible()
        with page.expect_download() as suggestion:
            editor.get_by_role('button', name='Download fotovoorstel').click()
        draft = json.loads(Path(suggestion.value.path()).read_text())
        assert draft['speciesId'] == 'sp459' and draft['slot'] == 'flight-neutral'
        assert draft['consent'] and draft['photo'].startswith('data:image/jpeg;base64,')
        online = True
        editor.get_by_role('button', name='Stuur foto ter beoordeling').click()
        expect(editor.get_by_role('status')).to_have_text('Foto ontvangen voor beoordeling.')
        assert len(sent) == 2 and sent[0]['id'] == sent[1]['id']
        editor.screenshot(path=str(SHOTS / 'personal_photo_feedback_390.png'))
        editor.get_by_role('button', name='Sluit fotovenster').click()
        heron.get_by_role('button', name='Sluit soortdetail').click()

        with page.expect_download() as backup:
            page.evaluate("async () => (await import('/src/storage/backup.js')).exportBackup()")
        filepath = Path(backup.value.path())
        restore_context = chromium.new_context(**settings)
        restore_context.add_init_script(LEAFLET_STUB)
        second = restore_context.new_page()
        second.goto(base, wait_until='domcontentloaded')
        second.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
        second.evaluate("""async bytes => {
          const {importBackup} = await import('/src/storage/backup.js');
          await importBackup(new File([new Uint8Array(bytes)], 'birdspot.zip'));
        }""", list(filepath.read_bytes()))
        restored = open_card(second, "Groene Reiger", "sp459")
        expect(own_photo(restored, 'flight-neutral')).to_be_visible()
        own_photo(restored, 'flight-neutral').evaluate("img => img.decode()")
        restore_context.close()

        page.goto(base + 'feedback-inbox.html')
        page.get_by_label('Beheerderssleutel').fill('onjuist')
        page.get_by_role('button', name='Open inbox').click()
        expect(page.locator('#inboxStatus')).to_have_text('Alleen de beheerder heeft toegang.')
        expect(page.locator('#inboxItems article')).to_have_count(0)
        page.get_by_label('Beheerderssleutel').fill('test-owner')
        page.get_by_role('button', name='Open inbox').click()
        page.get_by_role('button', name='Bekijk voorstel', exact=False).click()
        expect(page.get_by_role('heading', name='Groene Reiger')).to_be_visible()
        expect(page.get_by_text('Mijn voorstel voor de vluchtfoto.', exact=True)).to_be_visible()
        page.locator('#inboxItems img').evaluate("img => img.decode()")
        page.screenshot(path=str(SHOTS / 'photo_inbox_390.png'))
        chromium.close()
        print('Persoonlijke gids (offline opslaan, vervangen, reset, ZIP), feedback en mobiele inbox geslaagd.')


if __name__ == '__main__':
    main()
