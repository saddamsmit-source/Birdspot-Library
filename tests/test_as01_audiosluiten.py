#!/usr/bin/env python3
"""AS-01: het geluidsopnamemenu is altijd veilig te verlaten, ook tijdens opnemen of afronden.

Echte lokale Chromium met nep-microfoon en echte MediaRecorder (T1, T2, T6, T7).
T3–T5 gebruiken een gecontroleerde stub (getUserMedia blijft open / stop-event blijft uit): SIMULATIE.
Een Playwright-run is geen fysieke Android-test; Samsung blijft NOT TESTED tot de eigenaar test.
Tegenproef: python tests/test_as01_audiosluiten.py faalt op 3a03c84 (T1: geen zichtbare sluitkeuze tijdens opname).
"""
import threading

from playwright.sync_api import expect, sync_playwright

from test_cinematic_wetland import Server, Quiet
from test_quick_add_merlin import DATE, rows

STUB = """(() => {
  const AS = window.__as = { gum: 'real', stopMode: 'real', dropData: false, streams: [], recorders: [], pending: null };
  const md = navigator.mediaDevices, real = md.getUserMedia.bind(md);
  md.getUserMedia = c => {
    if (AS.gum === 'pending') return new Promise(resolve => { AS.pending = () => real(c).then(s => { AS.streams.push(s); resolve(s); }); });
    return real(c).then(s => { AS.streams.push(s); return s; });
  };
  const Orig = window.MediaRecorder;
  window.MediaRecorder = class extends Orig {
    constructor(...a) { super(...a); AS.recorders.push(this); }
    addEventListener(type, fn, o) {
      if (type === 'stop') return super.addEventListener(type, e => { if (AS.stopMode !== 'never') fn.call(this, e); }, o);
      if (type === 'dataavailable') return super.addEventListener(type, e => { if (!AS.dropData) fn.call(this, e); }, o);
      return super.addEventListener(type, fn, o);
    }
  };
  AS.locks = [];
  Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: async () => {
    const lock = { released: false, release: async () => { lock.released = true; } }; AS.locks.push(lock); return lock; } } });
  AS.live = () => AS.streams.flatMap(s => s.getTracks()).filter(t => t.readyState === 'live').length;
  AS.recording = () => AS.recorders.filter(r => r.state !== 'inactive').length;
})();"""
DRAFT = """async () => {
  const db = await new Promise((ok, no) => { const r = indexedDB.open('birdspot-sound-drafts', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('sessions'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
  return await new Promise(ok => { const g = db.transaction('sessions').objectStore('sessions').get('current');
    g.onsuccess = () => ok(g.result ? g.result.clip?.size ?? 0 : null); });
}"""
# Zichtbaar binnen het blad: niet onder de vaste kop of de vaste opnamebalk, niet buiten het scherm.
IN_VIEW = """sel => { const sheet = document.querySelector('.quick-add-sheet'), el = sheet.querySelector(sel);
  if (!el || el.closest('[hidden]') || !el.getClientRects().length) return false;
  const s = sheet.getBoundingClientRect(), h = sheet.querySelector('.sheet__header').getBoundingClientRect();
  const d = sheet.querySelector('.sound-record-dock').getBoundingClientRect(), r = el.getBoundingClientRect();
  return r.top >= Math.max(s.top, h.bottom) - 1 && r.bottom <= Math.min(s.bottom, innerHeight, d.top) + 1; }"""


def new_page(browser, url, width=390, height=844):
    ctx = browser.new_context(viewport={'width': width, 'height': height}, timezone_id='Europe/Amsterdam',
        reduced_motion='reduce', geolocation={'latitude': 51.9244, 'longitude': 4.4777, 'accuracy': 8},
        permissions=['microphone', 'geolocation'], service_workers='block')
    ctx.add_init_script(STUB)
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.clock.set_fixed_time(DATE)
    page.goto(url, wait_until='domcontentloaded')
    page.locator('#birdspotSplashSkip').click()
    return ctx, page, errors


def open_sound(page):
    page.locator('#fab').click()
    page.locator('[data-quick-action="sound"]').click()
    page.wait_for_function("document.querySelector('#soundRecord') && !document.querySelector('#quickAddOptions').inert")
    return page.locator('#quickAddSheet')


def record(page):
    page.locator('#soundRecord').click()
    expect(page.locator('#soundRecord')).to_have_text('Stop opname')
    expect(page.locator('#soundElapsed')).to_have_text('00:01', timeout=15000)


def prompt(page, title, timeout=5000):
    p = page.locator('#soundExitPrompt')
    expect(p).to_be_visible(timeout=timeout)
    expect(p.locator('#soundExitTitle')).to_have_text(title, timeout=timeout)
    return p


def scroll(page, where):
    page.evaluate(f"document.querySelector('.quick-add-sheet').scrollTop = {'0' if where == 'top' else '1e6'}")


def clean(page, errors, label):
    page.wait_for_timeout(300)
    assert page.evaluate('window.__as.live()') == 0, f'{label}: microfoon blijft actief'
    assert page.evaluate('window.__as.recording()') == 0, f'{label}: MediaRecorder blijft actief'
    assert page.evaluate('window.__as.locks.every(l => l.released)'), f'{label}: wake-lock blijft actief'
    assert not errors, (label, errors)


def run():
    with Server(('127.0.0.1', 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f'http://127.0.0.1:{server.server_address[1]}/'
        with sync_playwright() as pw:
            b = pw.chromium.launch(headless=True, args=['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'])

            # T1 — kern van de melding: sluiten tijdens opname geeft een zichtbare keuze, ook naar beneden gescrold,
            # via Sluiten, Android-/browser-terug, Escape, tik buiten het menu en Terug naar keuzes.
            ctx, p, errors = new_page(b, url)
            sheet = open_sound(p)
            record(p)
            for where in ('top', 'bottom'):
                for how in ('sluiten', 'terug-browser', 'escape', 'buiten', 'terug-keuzes'):
                    scroll(p, where)
                    if how == 'sluiten': p.locator('#addSheetCancel').click()
                    elif how == 'terug-browser': p.evaluate('history.back()')
                    elif how == 'escape': p.locator('#quickAddTitle').focus(); p.keyboard.press('Escape')
                    elif how == 'buiten': p.mouse.click(5, 5)
                    else: p.locator('[data-quick-action="back"]').click()
                    box = prompt(p, 'De opname loopt nog')
                    p.wait_for_function(f"({IN_VIEW})('#soundExitPrompt [data-sound-exit=\"stop\"]')", timeout=3000)
                    expect(box.locator('[data-sound-exit="stop"]')).to_be_focused()
                    expect(sheet).to_be_visible()
                    assert p.evaluate('window.__as.recording()') == 1, f'{where}/{how}: opname mag niet stil stoppen'
                    box.locator('[data-sound-exit="resume"]').click()
                    expect(box).to_be_hidden()
            expect(p.locator('#soundRecord')).to_have_text('Stop opname')
            p.locator('#addSheetCancel').click()
            box = prompt(p, 'De opname loopt nog')
            box.locator('[data-sound-exit="stop"]').click()
            box = prompt(p, 'Wat wil je met deze opname doen?')
            expect(p.locator('#soundPlayback')).to_be_visible()
            assert p.evaluate(DRAFT) is None, 'stoppen via sluitvraag mag geen concept maken zonder keuze'
            box.locator('[data-sound-exit="discard"]').click()
            expect(sheet).to_have_count(0)
            assert p.evaluate(DRAFT) is None and not rows(p)
            clean(p, errors, 'T1')
            print('T1 PASS — sluiten tijdens opname: zichtbare keuze (10 routes, boven/onder), stoppen → keuze → verwijderen', flush=True)

            # T2 — Terug naar keuzes tijdens opname, stoppen via de opnamebalk, concept bewaren, hervatten en verwijderen.
            sheet = open_sound(p)
            record(p)
            p.locator('[data-quick-action="back"]').click()
            prompt(p, 'De opname loopt nog')
            p.locator('#soundRecord').click()  # stop via de vaste knop terwijl de vraag openstaat
            box = prompt(p, 'Wat wil je met deze opname doen?')
            box.locator('[data-sound-exit="keep"]').click()
            expect(p.get_by_role('heading', name='Wat wil je vastleggen?')).to_be_visible()
            assert (p.evaluate(DRAFT) or 0) > 0, 'Bewaar concept moet de opname bewaren'
            p.locator('[data-quick-action="sound"]').click()
            expect(p.locator('#soundDraftState')).to_have_text('Bewaarde sessie geopend.')
            p.locator('#soundDiscard').click()
            expect(p.locator('#soundRecord')).to_have_text('Start opname')
            assert p.evaluate(DRAFT) is None
            p.locator('#addSheetCancel').click()
            expect(sheet).to_have_count(0)
            assert not rows(p)
            clean(p, errors, 'T2')
            print('T2 PASS — Terug naar keuzes + stop via opnamebalk → keuze → concept bewaard, hervat, verwijderd', flush=True)

            # T8 — dubbele tikken, offline, vijfmaal openen/opnemen/sluiten, herladen tijdens opname.
            ctx.set_offline(True)
            for round_ in range(5):
                sheet = open_sound(p)
                record(p)
                p.locator('#addSheetCancel').dblclick()
                box = prompt(p, 'De opname loopt nog')
                box.locator('[data-sound-exit="stop"]').dblclick()
                box = prompt(p, 'Wat wil je met deze opname doen?')
                box.locator('[data-sound-exit="discard"]').click()
                expect(sheet).to_have_count(0)
                clean(p, errors, f'T8 ronde {round_ + 1}')
            ctx.set_offline(False)
            assert p.evaluate(DRAFT) is None and not rows(p)
            assert len(p.evaluate('window.__as.locks')) >= 5, 'wake-lock-stub niet gebruikt'
            sheet = open_sound(p)
            record(p)
            p.reload(wait_until='domcontentloaded')
            p.wait_for_timeout(800)
            if p.locator('#birdspotSplashSkip').is_visible(): p.locator('#birdspotSplashSkip').click()
            expect(p.locator('#fab')).to_be_visible()
            expect(p.locator('#quickAddSheet')).to_have_count(0)
            assert p.evaluate(DRAFT) is None, 'herladen tijdens opname mag geen ongevraagd concept maken'
            assert not rows(p) and not errors, errors
            print('T8 PASS — dubbele tikken, offline, 5x openen/opnemen/sluiten zonder lek, herladen tijdens opname', flush=True)

            # T6 — Verder bewerken houdt focus in het menu; Escape blijft daarna de sluitvraag tonen.
            sheet = open_sound(p)
            record(p)
            p.locator('#soundRecord').click()
            expect(p.locator('#soundPlayback')).to_be_visible()
            assert p.evaluate("document.querySelector('#quickAddSheet').contains(document.activeElement)"), 'focus kwijt na stoppen'
            p.keyboard.press('Escape')
            box = prompt(p, 'Wat wil je met deze opname doen?')
            box.locator('[data-sound-exit="continue"]').click()
            expect(box).to_be_hidden()
            assert p.evaluate("document.querySelector('#quickAddSheet').contains(document.activeElement)"), 'focus kwijt na Verder bewerken'
            p.keyboard.press('Escape')
            prompt(p, 'Wat wil je met deze opname doen?').locator('[data-sound-exit="discard"]').click()
            expect(sheet).to_have_count(0)
            clean(p, errors, 'T6')
            print('T6 PASS — focus blijft in menu na stoppen en Verder bewerken; Escape blijft werken', flush=True)

            # T3 — SIMULATIE: microfoontoestemming blijft open. Sluiten is direct mogelijk; late toestemming start niets.
            for how in ('sluiten', 'terug-browser', 'terug-keuzes'):
                p.evaluate("window.__as.gum = 'pending'")
                open_sound(p)
                p.locator('#soundRecord').click()
                expect(p.locator('#soundCaptureState')).to_have_text('Wachten op de microfoon…')
                if how == 'sluiten': p.locator('#addSheetCancel').click()
                elif how == 'terug-browser': p.evaluate('history.back()')
                else: p.locator('[data-quick-action="back"]').click()
                if how == 'terug-keuzes': expect(p.get_by_role('heading', name='Wat wil je vastleggen?')).to_be_visible()
                else: expect(p.locator('#quickAddSheet')).to_have_count(0)
                p.evaluate("window.__as.gum = 'real'; window.__as.pending()")
                p.wait_for_function('window.__as.streams.length > 0 && window.__as.live() === 0', timeout=5000)
                if p.locator('#quickAddSheet').count(): p.locator('#addSheetCancel').click()
                p.evaluate('window.__as.streams = []')
                clean(p, errors, f'T3 {how}')
            print('T3 PASS — [simulatie] sluiten tijdens microfoonstart; late toestemming geeft microfoon direct vrij', flush=True)

            # T4 — SIMULATIE: stop-event én geluidsdata blijven uit. Binnen 5 s veilig herstel; geen permanente blokkade.
            p.evaluate("Object.assign(window.__as, { stopMode: 'never', dropData: true })")
            sheet = open_sound(p)
            record(p)
            p.locator('#addSheetCancel').click()
            prompt(p, 'De opname loopt nog').locator('[data-sound-exit="stop"]').click()
            prompt(p, 'Opname wordt afgerond…')
            p.evaluate('history.back()')  # Android-terug tijdens afronden: vraag blijft, geen dubbele actie
            prompt(p, 'Opname wordt afgerond…')
            expect(sheet).to_have_count(0, timeout=8000)  # geen bruikbare opname: sluiten gaat door
            assert p.evaluate(DRAFT) is None and not rows(p)
            sheet = open_sound(p)  # volgende sessie is niet geblokkeerd door de vorige
            record(p)
            p.locator('#soundRecord').click()
            expect(p.locator('#soundCaptureState')).to_have_text('De opname kon niet worden afgerond. Probeer het opnieuw.', timeout=8000)
            expect(p.locator('#soundRecord')).to_have_text('Start opname')
            expect(p.locator('#soundRecord')).to_be_enabled()
            p.locator('#addSheetCancel').click()
            expect(sheet).to_have_count(0)
            clean(p, errors, 'T4')
            print('T4 PASS — [simulatie] ontbrekend stop-event: na ≤5 s herstel, opnieuw proberen of sluiten mogelijk', flush=True)

            # T5 — SIMULATIE: stop-event blijft uit maar er is geluid. Geen stil verlies: keuze verschijnt, concept bewaard.
            p.evaluate("Object.assign(window.__as, { stopMode: 'never', dropData: false })")
            sheet = open_sound(p)
            record(p)
            p.locator('#addSheetCancel').click()
            prompt(p, 'De opname loopt nog').locator('[data-sound-exit="stop"]').click()
            prompt(p, 'Opname wordt afgerond…')
            box = prompt(p, 'Wat wil je met deze opname doen?', timeout=8000)
            expect(p.locator('#soundPlayback')).to_be_visible()
            box.locator('[data-sound-exit="keep"]').click()
            expect(sheet).to_have_count(0)
            assert (p.evaluate(DRAFT) or 0) > 0, 'opname mag niet verloren gaan'
            p.evaluate("Object.assign(window.__as, { stopMode: 'real' })")
            sheet = open_sound(p)
            expect(p.locator('#soundDraftState')).to_have_text('Bewaarde sessie geopend.')
            p.locator('#soundDiscard').click()
            p.locator('#addSheetCancel').click()
            expect(sheet).to_have_count(0)
            assert p.evaluate(DRAFT) is None and not rows(p)
            clean(p, errors, 'T5')
            print('T5 PASS — [simulatie] ontbrekend stop-event met geluid: keuze, concept bewaard en weer verwijderd', flush=True)
            ctx.close()

            # T7 — 320/390/430 px: sluitvraag tijdens opname past, knoppen ≥44 px, niets achter de opnamebalk.
            for width in (320, 390, 430):
                ctx, p, errors = new_page(b, url, width=width, height=740)
                open_sound(p)
                record(p)
                scroll(p, 'bottom')
                p.locator('#addSheetCancel').click()
                box = prompt(p, 'De opname loopt nog')
                p.wait_for_function(f"({IN_VIEW})('#soundExitPrompt [data-sound-exit=\"stop\"]')", timeout=3000)
                for name in ('stop', 'resume'):
                    bb = box.locator(f'[data-sound-exit="{name}"]').bounding_box()
                    assert bb['height'] >= 44 and bb['x'] >= 0 and bb['x'] + bb['width'] <= width, (width, name, bb)
                assert p.evaluate("(() => { const s = document.querySelector('.quick-add-sheet'); return s.scrollWidth <= s.clientWidth + 1; })()")
                p.screenshot(path=f'tests/screenshots/as01_sluitvraag_opname_{width}.png')
                box.locator('[data-sound-exit="stop"]').click()
                prompt(p, 'Wat wil je met deze opname doen?').locator('[data-sound-exit="discard"]').click()
                expect(p.locator('#quickAddSheet')).to_have_count(0)
                clean(p, errors, f'T7 {width}')
                ctx.close()
            print('T7 PASS — 320/390/430 px: sluitvraag zichtbaar, ≥44 px, geen overloop', flush=True)
            b.close()
    print('AS-01 PASS — geluidsopnamemenu altijd veilig afsluitbaar (lokale browser; Samsung NOT TESTED)')


if __name__ == '__main__':
    run()
