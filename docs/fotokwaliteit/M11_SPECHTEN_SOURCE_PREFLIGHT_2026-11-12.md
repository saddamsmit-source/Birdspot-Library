# Birdspot M11 — bronvoorbereiding twee spechten

12 november 2026 | REVIEW / PARTIALLY TESTED | basis PR 165.

## Bereik en resultaat
Deze ronde blijft beperkt tot Kleine Bonte Specht (sp017) en Zwarte Specht (sp018). Er is geen nieuwe gidsfoto geïmporteerd of goedgekeurd. Bestaande foto's, persoonlijke waarnemingen, bronregistraties en M10-audit blijven ongewijzigd.

## sp018: betere originele vrouwtjesfoto
De exacte originele Wikimedia Commons-foto van Andreas Eichler is beschreven op:
https://commons.wikimedia.org/wiki/File:2016.08.27.-15-Viernheimer_Heide-Viernheim--Schwarzspecht-Weibchen.jpg

Commons rapporteert 2196x2901 pixels, 5869311 bytes, SHA-1 26a9ab628423781a7b6d9ee99f1c134d748665fc, licentie CC BY-SA 4.0, en GPS/camera-EXIF in de originele JPEG. De huidige lokale variant is 500x661 pixels. Rechten vereisen maker, licentielink, bron en wijzigingsvermelding, met ShareAlike bij bewerking.

Nieuwe bestanden:
- docs/fotokwaliteit/sp018_female_candidate.json: versie- en fotobewijs, status PENDING_ORIGINAL_BYTES_AND_VISUAL_REVIEW.
- tools/species/prepare_verified_sp018_female.py: --check voor een netwerkloze bron-/registrycheck; --prepare STAGING_DIR voor een toekomstige gecontroleerde Commons-download en bewerking BUITEN de repository. De scriptgate vereist originele API-SHA1, byte-aantal en afmetingen, en verwijdert bij de staging de metadata.
- tests/test_sp018_female_preflight.py: tien negatieve gevallen voor andere bron, licentie, rol, checksum, maat of ongeautoriseerde schrijflocatie.
- CI: op de nieuwe PR-head moet expliciet de lokale --check en negatieve test slagen, maar dit bewijst GEEN download of fotoimport.

Signaal: het originele upload.wikimedia.org bestand kon in deze ChatGPT-runtime niet worden opgehaald; een tweede containerroute meldde een netwerk/DNS-beperking. Risico: opschalen van de kleine versie of niet-geverifieerde media publiceren. Maatregel: alleen bronvergrendelde voorbereiding en veilige staging, geen binaire vervanging. Laatst bewezen checkpoint: PR #165, SHA 2d4280125ea205243816022308292fff2ba4c971 (individuele soortaudit 100/140).

## sp017: juveniel en vrije vlucht
De Wikimedia Commons-categorie https://commons.wikimedia.org/wiki/Category:Dryobates_minor geeft veel beeldkandidaten, maar bewijst noch de leeftijd noch de echte vrije vlucht van een specifieke opname. De bekende nestholtefoto blijft klasse opvliegen / uit-rol. Een foto van een juveniel op Woodland Trust is herkenningsreferentie; geen bewezen hergebruikstoestemming. Daarom nog geen nieuwe foto.

## Vervolg en bewijsgrenzen
De nieuwe voorbereiding bewijst pas bronmetadata en veilige codepaden; de echte originele JPEG, een scherpe WebP, ornithologische determinatie en visuele kwaliteitsvergelijking zijn NOT TESTED. Met toestemmings- en netwerktoegang: voer --prepare uit naar een nieuwe stagingmap BUITEN de repo, controleer de foto visueel, check auteursrechten en duplicaten, en maak dan een afzonderlijke kleine media-PR. Test echte 390px weergave, zoom, offline, terugnavigatie en gegevensbehoud. Geen merge of live zonder eigenaarbesluit.
