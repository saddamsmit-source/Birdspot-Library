# Bestaande fotovogels — vijftien watervogels

Datum: 2026-11-07. Status: DRAFT; lokale datacontroles uitgevoerd, browser-/offline-CI bij commit nog te volgen. Exacte definitieve SHA, preview en CI-status staan bij de bijbehorende pull request.

## Scope en samenwerking

Vervolg op PR #40, `feat/existing-forestbirds-recognition`, commit `3c9bd424ec4c0d561a18801ef27a7c4653116711`.
Writer: `feat/waterbirds-recognition-15`. Geïsoleerde worktree; de parallelle tuin-/zangvogel- en steltloperrondes zijn niet bewerkt. De vijftien hieronder hadden al een hoofdfoto. Herkenning, kleed, leefwijze, broeden, vindplaatsen en korte fotografietips zijn nagekeken. Geverifieerde bronnen zijn per kaart gekoppeld. De bronstatuslijst, soorten-ID’s en gebruikersopslag zijn behouden.

Kleedkaarten staan nu vóór geluidsfragmenten en vergelijkingen. Een contracttest controleert de volgorde voor de volledige catalogus. Zeven nieuwe vergelijkingen: Meerkoet/Waterhoen volwassen, Blauwe/Purperreiger volwassen én jong, jonge Kwak/Blauwe Reiger, Wilde Eend/Slobeend vrouwtjes en Kuifeend/Tafeleend mannetjes én vrouwtjes. Bestaande Wilde Eend/Krakeend-vrouwtjesvergelijking behouden.

## Media per soort

| ID | Soort | Nieuwe kleedfoto | Opnamen in deze ronde |
|---|---|---|---:|
| sp077 | Fuut | juv | 1 |
| sp078 | Meerkoet | juv | 2 |
| sp079 | Waterhoen | juv | 2 |
| sp081 | Blauwe reiger | juv | 2 |
| sp084 | Purperreiger | juv | 2 |
| sp085 | Kwak | juv | 2 |
| sp086 | Grauwe gans | juv | 2 |
| sp089 | Wilde eend | Bestaande vrouw/eclips behouden | 2 |
| sp090 | Slobeend | adult_f | 1 |
| sp092 | Kuifeend | adult_f | 1 |
| sp104 | Aalscholver | jaarling | 1 |
| sp126 | Knobbelzwaan | juv | 1 |
| sp128 | Bergeend | juv | 2 |
| sp129 | Krakeend | juv | 1 |
| sp132 | Tafeleend | adult_f | 2 |

De hoofdfoto’s zijn behouden. Waar volwassen geslachten visueel overeenkomen, blijft de kaart gedeeld; er wordt geen geslacht uit de foto gegokt. Voor Wilde Eend worden de bestaande vrouw- en eclipsfoto gebruikt; de hoofdfoto toont een paar en is niet als uitsluitend man gekoppeld.

## Verificatie en grenzen

- Primaire inhoud: Vogelbescherming, aangevuld met BTO voor Slobeend, Knobbelzwaan, Bergeend, Krakeend en het aantal broedsels van Blauwe Reiger; Sovon voor Kwak/Purperreiger-broedsels; RSPB voor de spanwijdte van Blauwe Reiger. Alle links staan in `guideReview.sources`. Eigen Nederlandse parafrases; fotografietips zijn praktische redactionele adviezen.
- Bronconflict Blauwe Reiger: Vogelbescherming vermeldt 110–145 cm spanwijdte, RSPB 175–195 cm; onafhankelijke Wildlife Trusts-waarde 1,8 m ondersteunt de laatste orde. App gebruikt de expliciet gekoppelde RSPB-range.
- Lengte/spanwijdte zijn opnieuw gecontroleerd. Bestaande gewichtvelden zonder bronreview worden door het bestaande dimensions-contract niet getoond als geverifieerd.
- Fuut: verzorging van jongen is niet hetzelfde als de nestduur. Nestvlieders krijgen het label “Vliegvlug na”. Kuifeend en Tafeleend hebben een open startperiode in plaats van een onbewezen eindmaand. Bronverschillen in uitbroedduur bij Knobbelzwaan/Bergeend staan expliciet vermeld.
- Meerkoet: nieuwe foto toont een donsjong met rood-oranje kop; de tekst onderscheidt dit van oudere jonge vogels met lichte wangen. Grauwe Gans toont eveneens een donsjong met beginnende veren.
- Aalscholver: originele bron noemt een vogel uit het vorige jaar; daarom jaarling, niet een pas uitgevlogen juveniel.
- Purperreiger: foto en één alarmopname komen uit India. Het fotobijschrift benoemt geografische variatie; het originele watermerk en kader blijven staan. De beoogde Bergeendfoto uit Slimbridge is afgewezen: zichtbaar kleed past niet bij het beschreven vroege jeugdkleed. Een passende donsjongenfoto van Daniel Holl op Borkum is na de wachttijd opgehaald en visueel gecontroleerd. Slobeendgeluid: broncategorie gehouden vogel, zichtbaar in toelichting.
- Krakeend: de USFWS-foto is tijdens ringonderzoek in Californië genomen. Geen beeld van vrij foerageergedrag; herkomst expliciet vermeld.
- De Knobbelzwaanopname bevat vleugelslagen/vluchtgeluid. De tweede Wilde-Eendopname krijgt geen sekse toegewezen. Bergeend “zang” volgt het opnamebronlabel. Alleen expliciet benoemde vrouwtjesopnamen krijgen dit label.
- Audio: taxon, type, maker, licentie en broncontext gecontroleerd; volledige bestanden gedecodeerd en naar mono-MP3 omgezet, zonder knippen. Geen onafhankelijke auditieve determinatie of claim dat achtergrondvogels afwezig zijn. CC BY/CC BY-SA/CC0-bestanden; geen NC/ND-kandidaten gebruikt. De Britse archiefopnamen vermelden recordist én British Library Board.
- Foto’s: bronmetadata plus zichtbare kenmerken nagekeken, volledige afbeelding behouden, verkleind naar maximaal 1600 px en WebP. Auteur, licentielink, bron, wijzigingen en review staan in het register en worden in de app ontsloten.

## Checks en vervolg

Lokale controle: syntax, diff-check, bronregister/generator-gelijkheid, normalisaties, behouden records buiten de batch, media-integriteit en kleedvolgorde. De bestaande CI test de volledige galerij op mobiel/desktop, offline afbeelding- en audiodecodering, audio-Range, offline herstart en appregressies. Definitieve CI-uitkomst wordt bij de PR vastgelegd. Fysieke Androidacceptatie door de eigenaar en onafhankelijke review zijn niet uitgevoerd.

Media-downloads werden tijdelijk beperkt door de bron; Retry-After gerespecteerd. Alleen werkelijk opgehaalde en gecontroleerde bestanden zijn opgenomen. De registerwaarden hierboven zijn leidend voor de geleverde aantallen, niet voorlopige kandidaten. De wachtrij vermeldt de afgewezen foto; alleen na succesvolle download, beeld-/broncontrole en technische decodering zijn de resterende kandidaten toegevoegd.

Niet ieder kleed heeft nu een eigen foto. Vervolg: aanvullende man-/vrouw- en winterbeelden waar relevant, extra geluidstypen met heldere bronlabels. Bij integratie met andere gesprekken de JSON-registers per soort combineren, generators opnieuw draaien en een unieke SW-versie behouden; geen volledig register van één writer over een ander kopiëren. Geen merge naar main of productiepromotie in deze ronde.

## QA-aanvulling tijdens previewcontrole

Alle 15 kaarten zijn mobiel geopend, inclusief bronnen, kleedfoto’s, foto-volgorde en fotografietip. Vergelijkingsnavigatie Slobeend → Wilde Eend werkt; Meerkoet-, Wilde-Eend- en Tafeleendopnamen daadwerkelijk afgespeeld. De gedeelde Vercel-preview is in de browser geopend, inclusief de vergrote Meerkoet-donsfoto.

Desktop- en mobiele galerijcontrole en offline decodering van 233 fotoverwijzingen geslaagd. Een eerste audiocachecontrole liep tegelijk met de lokale mediaopbouw en zag onvolledige uitvoer. Media vervolgens atomair opgebouwd en alle bestanden volledig gedecodeerd; een nieuwe browsercontext decodeerde alle 118 clips offline met correcte Range-antwoorden.

De gewijzigde kleedvolgorde legde een bestaande testaanname bloot: drie vergelijkingslussen probeerden lazy afbeeldingen te decoderen voordat ze in beeld stonden. De browsertest scrollt nu eerst naar iedere foto, gelijk aan de overige lussen en normaal gebruik; geen controle geschrapt. Definitieve CI-status staat op de PR.

Na de voorgeschreven bronwachttijd zijn ook de aanvullende Bergeend-donsfoto, Kuifeendroep en tweede Bergeendopname beschikbaar gekomen. Netto 14 nieuwe foto’s en 24 opnamen, geluid bij alle 15 soorten; totaal 234 geregistreerde fotoverwijzingen en 120 opnamen. Definitieve CI-uitkomst staat in de PR. De aangepaste volledige lokale detailtest H2–H4 is geslaagd.

Bewijsbeeld: [Kuifeend man en vrouw op mobiel](evidence/waterbirds-kuifeend-mobile-20261107.png).
