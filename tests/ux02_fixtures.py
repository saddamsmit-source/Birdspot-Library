"""UX-02 testfixtures: vaste waarnemingen en plekken met alle bewijsvarianten (ook oude en tegenstrijdige records).

Datums 'rel:<n>' worden in de browser omgezet naar vandaag − n dagen (lokale tijd), zodat periodezoeken
('vandaag', 'gisteren', 'deze maand') niet afhangt van de tijdzone van de testmachine.
"""
import threading
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_pilot_offline_new_sighting import Quiet, Server  # noqa: E402
from test_feature_reconciliation import boot, rows  # noqa: E402

PLACES = [
    {'id': 'pl_named', 'name': 'Amstelpark', 'lat': 52.3301, 'lon': 4.8901},
    {'id': 'pl_auto', 'name': 'Plek 2', 'lat': 52.2001, 'lon': 5.0001},                       # oude automatische naam
    {'id': 'pl_auto_new', 'name': 'Plek 3', 'nameOrigin': 'auto', 'lat': 52.1001, 'lon': 5.1001},
]

BASE = {'count': 1, 'photoIds': [], 'audioIds': [], 'notes': '', 'time': '',
        'createdAt': '2026-11-01T08:00:00.000Z', 'updatedAt': '2026-11-01T08:00:00.000Z'}


def rec(id_, species_id, name, date, **kw):
    out = {**BASE, 'id': id_, 'speciesId': species_id, 'speciesName': name, 'date': date,
           'lat': None, 'lon': None, 'placeId': None, 'locationName': ''}
    out.update(kw)
    return out


SIGHTINGS = [
    rec('s01', 'sp045', 'Merel', 'rel:0', observationMethod='seen', identificationSource='self', merlinVerification=None,
        certainty='certain', placeId='pl_named', lat=52.3301, lon=4.8901, locationName='Amstelpark', photoIds=['ph1', 'ph2'],
        notes='Zong op de lantaarnpaal'),
    rec('s02', 'sp029', 'Koolmees', 'rel:1', observationMethod='heard', identificationSource='self', merlinVerification=None,
        certainty='probable', placeId='pl_auto', lat=52.2001, lon=5.0001, audioIds=['au1']),
    rec('s03', 'sp050', 'Roodborst', '2026-06-12', observationMethod='both', identificationSource='merlin',
        merlinVerification='suggested', certainty='possible', locationName='Achtertuin'),
    rec('s04', 'sp045', 'Merel', '2026-06-13', observationMethod='heard', identificationSource='birdnet',
        birdnetVerification='suggested', certainty='possible', lat=52.0501, lon=5.2502,
        soundSuggestion={'model': 'BirdNET+ V3.0', 'score': 0.7, 'second': 3}),
    rec('s05', 'sp046', 'Zanglijster', '2025-04-20', observationMethod='heard', identificationSource='birdnet',
        birdnetVerification='checked', certainty='certain', placeId='pl_named', lat=52.3301, lon=4.8901,
        soundSuggestion={'model': 'BirdNET+ V3.0', 'score': 0.9, 'second': 5}),
    rec('s06', 'sp045', 'Merel', '2025-05-01', observationMethod='heard', identificationSource='self', merlinVerification=None,
        certainty='certain', soundSuggestion={'model': 'BirdNET+ V3.0', 'score': 0.6, 'second': 2}),   # oud: controle onbekend
    {'id': 's07', 'speciesId': 'sp043', 'speciesName': 'Huismus', 'date': '2024-03-03', 'count': 4, 'photoIds': [],
     'certainty': 'certain', 'locationName': 'Stationsplein', 'lat': None, 'lon': None,
     'createdAt': '2024-03-03T09:00:00.000Z'},                                                    # heel oud record
    rec('s08', 'sp066', 'Boomkruiper', '2026-06-14', observationMethod='heard', identificationSource='birdnet',
        birdnetVerification='suggested', certainty='certain', placeId='pl_auto_new', lat=52.1001, lon=5.1001),  # tegenstrijdig
    rec('s09', 'sp507', 'Siberische Sprinkhaanzanger', '2026-09-30', observationMethod='heard', identificationSource='self',
        merlinVerification=None, certainty='certain',
        locationName='Natuurgebied De Oostvaardersplassen bij de uitkijkhut aan de Knardijk'),
]

SEED = """async ({ sightings, places }) => {
  const pad = n => String(n).padStart(2, '0');
  const rel = v => { if (!String(v).startsWith('rel:')) return v; const d = new Date(); d.setDate(d.getDate() - Number(v.slice(4)));
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  localStorage.clear();
  sessionStorage.clear();
  await new Promise(r => { const q = indexedDB.deleteDatabase('birdspot-library'); q.onsuccess = q.onerror = q.onblocked = () => r(); });
  localStorage.setItem('birdspot-sightings', JSON.stringify({ version: 2, sightings: sightings.map(s => ({ ...s, date: rel(s.date) })) }));
  localStorage.setItem('birdspot-places', JSON.stringify({ schemaVersion: 1, places: places.map(p => ({
    createdAt: '2026-05-01T08:00:00.000Z', updatedAt: '2026-05-01T08:00:00.000Z', ...p })) }));
}"""


def start_server():
    server = Server(('127.0.0.1', 0), Quiet)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, f'http://127.0.0.1:{server.server_address[1]}/'


def seed(page, base, sightings=SIGHTINGS, places=PLACES):
    page.evaluate(SEED, {'sightings': sightings, 'places': places})
    page.reload(wait_until='domcontentloaded')
    boot(page, base)


def go_sightings(page, **target):
    page.evaluate("""async target => { const app = await import('/src/app.js'); app.navigate('sightings', { force: true, target }); }""", target)
    page.locator('#screen-sightings #sightingsList').wait_for(timeout=10000)
    page.wait_for_timeout(250)


def shown_ids(page):
    return page.locator('#sightingCards .sight-card').evaluate_all('els => els.map(e => e.dataset.id)')


def stored_places(page):
    return page.evaluate("() => JSON.parse(localStorage.getItem('birdspot-places') || '{\"places\":[]}').places")


__all__ = ['PLACES', 'SIGHTINGS', 'rec', 'start_server', 'seed', 'go_sightings', 'shown_ids', 'rows', 'boot', 'stored_places']
