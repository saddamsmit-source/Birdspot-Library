# Koppeling met waarneming.nl — onderzoek (5-11-2026)

## Bevindingen
- Waarneming.nl / Observation.org heeft een API (OAuth2; bekende flows: Authorization Code en Password Grant, scopes o.a. `write_observations`).
- De documentatie zelf zegt: *"Access to our internal API is limited to approved applications and use cases."*
  Vragen lopen via het contactformulier op de FAQ-pagina. De documentatie is alleen zichtbaar na inloggen.
- Zonder goedgekeurde `client_id` kan Birdspot geen waarnemingen plaatsen. Er is geen openbare manier om dit te omzeilen,
  en dat doen we ook niet (Handbook §1.2).

## Wat Birdspot al klaarzet
- Per waarneming: Latijnse naam, datum, tijd, aantal, exacte WGS84-coördinaten (6 decimalen) en nauwkeurigheid in meters (`pinAccuracyM`),
  waarnemingswijze (gezien/gehoord), zekerheid en notities.
- Plekken met naam, zodat terugkerende locaties consistent zijn.

## Vervolg
1. Eigenaar vraagt API-toegang aan via het contactformulier (doel: persoonlijke app die eigen waarnemingen doorzet).
2. Na goedkeuring: OAuth-login in de app (Authorization Code met PKCE, geen geheimen in de client) en een knop
   "Plaats op waarneming.nl" per waarneming, met status per waarneming (niet / wel geplaatst + link).
3. Tot die tijd: export (CSV) als tussenstap; formaat te controleren met de importfunctie van waarneming.nl.

## Bronnen
- observation-js (TypeScript-client, community): https://github.com/robbeverhelst/observation-js
- API-docs (alleen na inloggen): https://waarneming.nl/api/docs/
