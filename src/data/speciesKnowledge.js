/**
 * Birdspot Library — kennisprofielen per soort (contract v0.1, proef).
 * GEGENEREERD door tools/kennisbaseline/build_knowledge.py uit tools/kennisbaseline/knowledge.json — niet met de hand wijzigen.
 */
const DATA = {
 "sources": {
  "VB_EKSTER": {
   "register": "NL07",
   "label": "Vogelbescherming — Ekster",
   "url": "https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/ekster",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "Nederland",
   "confirms": "kleedpatroon, glans, witte handvleugel, maten, geluid, aantallen en trend (Sovon-cijfers 2018–2020 en 2012/13–2014/15), broedgegevens",
   "checked": "2026-11-10",
   "certainty": "hoog",
   "publisher": "Vogelbescherming Nederland"
  },
  "VB_FITIS": {
   "register": "NL07",
   "label": "Vogelbescherming — Fitis",
   "url": "https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/fitis",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "Nederland",
   "confirms": "zang, roep, poten, vleugellengte, leefgebied, aantallen 2018–2020, trend sinds 1990, broedgegevens, trek",
   "checked": "2026-11-10",
   "certainty": "hoog",
   "publisher": "Vogelbescherming Nederland"
  },
  "VB_TJIF": {
   "register": "NL07",
   "label": "Vogelbescherming — Tjiftjaf",
   "url": "https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/tjiftjaf",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "Nederland",
   "confirms": "zang, roep, poten, staartbeweging, leefgebied, aantallen, overwintering, broedgegevens, trek",
   "checked": "2026-11-10",
   "certainty": "hoog",
   "publisher": "Vogelbescherming Nederland"
  },
  "BG_CHIFF": {
   "register": "nieuw (specialistisch determinatieartikel, buiten register v1.2)",
   "label": "BirdGuides — Common and Iberian Chiffchaffs and Willow Warbler photo ID guide",
   "url": "https://www.birdguides.com/articles/identification/common-and-iberian-chiffchaffs-and-willow-warbler-photo-id-guide/",
   "edition": "online artikel, geraadpleegd 10-11-2026",
   "scope": "Groot-Brittannië / West-Europa",
   "confirms": "handpenprojectie, wenkbrauw, oogring, oorstreek, pootkleur en uitzonderingen, staartbewegen, zang, roep, seizoen, najaarsjuvenielen, Iberische Tjiftjaf",
   "checked": "2026-11-10",
   "certainty": "middel-hoog",
   "publisher": "BirdGuides"
  },
  "VB_HVS": {
   "register": "NL07",
   "label": "Vogelbescherming — Havik vs. sperwer",
   "url": "https://www.vogelbescherming.nl/actueel/bericht/havik-vs-sperwer",
   "edition": "online artikel, geraadpleegd 10-11-2026",
   "scope": "Nederland",
   "confirms": "grootte, vleugel- en staartvorm, kop in vlucht, vliegstijl, onderzijde jonge vogels, roep, onbetrouwbare kenmerken",
   "checked": "2026-11-10",
   "certainty": "hoog",
   "publisher": "Vogelbescherming Nederland"
  },
  "VB_SPERWER": {
   "register": "NL07",
   "label": "Vogelbescherming — Sperwer",
   "url": "https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/sperwer",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "Nederland",
   "confirms": "bouw, poten, onderzijde, vliegbeeld, roep, aantallen 2018–2020, trend, Oranje lijst, broeden, voedsel",
   "checked": "2026-11-10",
   "certainty": "hoog",
   "publisher": "Vogelbescherming Nederland"
  },
  "VB_SPERWER_MV": {
   "register": "NL07",
   "label": "Vogelbescherming — Vogels herkennen: sperwer man of vrouw?",
   "url": "https://www.vogelbescherming.nl/actueel/bericht/vogels-herkennen-sperwer-man-of-vrouw",
   "edition": "online artikel, geraadpleegd 10-11-2026",
   "scope": "Nederland",
   "confirms": "verschillen man/vrouw (bovenzijde, wangen, onderzijde, wenkbrauw, iris, gewicht) en jonge vogels, rui",
   "checked": "2026-11-10",
   "certainty": "hoog",
   "publisher": "Vogelbescherming Nederland"
  },
  "VB_TOREN": {
   "register": "NL07",
   "label": "Vogelbescherming — Torenvalk",
   "url": "https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/torenvalk",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "Nederland",
   "confirms": "man/vrouw-kleed, bidden, silhouet, gelijkende soorten, roep, aantallen 2018–2020, Rode Lijst, trend en oorzaak, broeden",
   "checked": "2026-11-10",
   "certainty": "hoog",
   "publisher": "Vogelbescherming Nederland"
  },
  "VB_BUIZ": {
   "register": "NL07",
   "label": "Vogelbescherming — Buizerd",
   "url": "https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/buizerd",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "Nederland",
   "confirms": "kleurvariatie, kop, vleugels, staart, vliegbeeld, gelijkende soorten, roep, aantallen, broeden",
   "checked": "2026-11-10",
   "certainty": "hoog",
   "publisher": "Vogelbescherming Nederland"
  },
  "BG_BUZZ": {
   "register": "nieuw (specialistisch determinatieartikel, buiten register v1.2)",
   "label": "BirdGuides — Common and European Honey Buzzards photo ID guide",
   "url": "https://www.birdguides.com/articles/common-and-european-honey-buzzards-photo-id-guide",
   "edition": "online artikel, geraadpleegd 10-11-2026",
   "scope": "Groot-Brittannië / Europa",
   "confirms": "kop, vleugelvorm en zweefhouding, vleugelslag, staart, ondervleugel, kleedvariatie, juvenielen, iris, geluid, onbetrouwbare kenmerken",
   "checked": "2026-11-10",
   "certainty": "middel-hoog",
   "publisher": "BirdGuides"
  },
  "VB_ZILV": {
   "register": "NL07",
   "label": "Vogelbescherming — Zilvermeeuw",
   "url": "https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zilvermeeuw",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "Nederland",
   "confirms": "volwassen kleed, poten, maten, tertials eerstejaars, juveniel kleed, gelijkende soorten, roep, aantallen 2025, trend, bescherming",
   "checked": "2026-11-10",
   "certainty": "hoog",
   "publisher": "Vogelbescherming Nederland"
  },
  "MUN_GULL": {
   "register": "nieuw (universitaire introductie meeuwdeterminatie, buiten register v1.2)",
   "label": "Memorial University (SERG) — Introduction to bird identification: winter gulls",
   "url": "https://mun.ca/serg/gull_identification/index.html",
   "edition": "online, geraadpleegd 10-11-2026",
   "scope": "Noord-Atlantisch (algemeen)",
   "confirms": "grote meeuwen zoals Zilvermeeuw hebben vier jaar nodig voor het volwassen kleed",
   "checked": "2026-11-10",
   "certainty": "middel",
   "publisher": "Memorial University (SERG)"
  },
  "NAT_STT": {
   "register": "Naturalis (Linnaeus, Birds of Europe)",
   "label": "Naturalis — Certhia brachydactyla (Birds of Europe)",
   "url": "https://birds-europe.linnaeus.naturalis.nl/linnaeus_ng/app/views/species/taxon.php?id=130962",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "Europa",
   "confirms": "flanken, wenkbrauw, snavel, achternagel, roep, zang, moeilijkheid van onderscheid",
   "checked": "2026-11-10",
   "certainty": "middel-hoog",
   "publisher": "Naturalis"
  },
  "BG_STT": {
   "register": "nieuw (determinatieverslag, buiten register v1.2)",
   "label": "BirdGuides — Rarity finders: Short-toed Treecreeper in Suffolk",
   "url": "https://www.birdguides.com/articles/rarity-finders-short-toed-treecreeper-suffolk",
   "edition": "online artikel, geraadpleegd 10-11-2026",
   "scope": "Groot-Brittannië (vondst van een dwaalgast)",
   "confirms": "vleugelbandpatroon, alularand, handpentoppen, snavel als determinatiekenmerken",
   "checked": "2026-11-10",
   "certainty": "middel",
   "publisher": "BirdGuides"
  },
  "EB_STT": {
   "register": "M02-familie (Cornell/eBird, soortpagina)",
   "label": "eBird — Short-toed Treecreeper",
   "url": "https://ebird.org/species/shttre1",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "wereldwijd",
   "confirms": "lastig onderscheid, snavel, achternagel, flanken, vleugelband, roep als beste veldkenmerk, leefgebied",
   "checked": "2026-11-10",
   "certainty": "middel-hoog",
   "publisher": "eBird (Cornell Lab)"
  },
  "RSPB_STT": {
   "register": "nieuw (RSPB soortpagina)",
   "label": "RSPB — Short-toed treecreeper",
   "url": "https://www.rspb.org.uk/birds-and-wildlife/short-toed-treecreeper",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "Groot-Brittannië",
   "confirms": "sterke gelijkenis met Taigaboomkruiper, zang onderscheidt",
   "checked": "2026-11-10",
   "certainty": "middel",
   "publisher": "RSPB"
  },
  "BB_STT": {
   "register": "M06-familie (vaktijdschrift; British Birds)",
   "label": "British Birds — Mixed singers and imitation singers among Short-toed Treecreepers",
   "url": "https://britishbirds.co.uk/journal/article/mixed-singers-and-imitation-singers-among-short-toed-treecreepers",
   "edition": "tijdschriftartikel; alleen inleiding gelezen, geraadpleegd 10-11-2026",
   "scope": "Denemarken / Europa",
   "confirms": "menggezang bij boomkruipers is bekend en vraagt voorzichtigheid bij determinatie op zang",
   "checked": "2026-11-10",
   "certainty": "middel (alleen inleiding gelezen)",
   "publisher": "British Birds"
  },
  "EB_KES": {
   "register": "nieuw (buiten register v1.2)",
   "label": "eBird — Eurasian Kestrel",
   "url": "https://ebird.org/species/eurkes",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "identificatietekst",
   "confirms": "mannetje grijze kop en grijze staart met brede zwarte eindband; vrouwtje bruinig met bandering op rug, vleugels en staart",
   "checked": "2026-11-10",
   "certainty": "middel-hoog",
   "publisher": "eBird (Cornell Lab)"
  },
  "BZ_SPA": {
   "register": "nieuw (buiten register v1.2)",
   "label": "Blasco-Zumeta & Heinze — Eurasian Sparrowhawk (ageing and sexing)",
   "url": "https://www.blascozumeta.com/specie_files/02690_ENG_Accipiter_nisus_aranzadi.pdf",
   "edition": "online determinatieblad, geen datum vermeld, geraadpleegd 10-11-2026",
   "scope": "leeftijds- en geslachtsbepaling",
   "confirms": "onderzijde gebandeerd, juvenielen met hartvormige bruine vlekken; jonge Havik gevlekt op de onderzijde",
   "checked": "2026-11-10",
   "certainty": "middel-hoog",
   "publisher": "Blasco-Zumeta & Heinze"
  },
  "ROSS_YLG": {
   "register": "nieuw (buiten register v1.2)",
   "label": "Nick Rossiter — Yellow-legged Herring Gulls argentatus in Eastern Scandinavia",
   "url": "https://nickrossiter.org.uk/ylgweb/argentatus%20omissus.html",
   "edition": "webpagina 2006, geraadpleegd 10-11-2026",
   "scope": "pootkleur bij noordelijke Zilvermeeuwen; kleine steekproef op één locatie",
   "confirms": "naast roze ook bleek- en strogele poten bij argentatus; pootkleur alleen is geen veilig onderscheid",
   "checked": "2026-11-10",
   "certainty": "middel (kleine steekproef)",
   "publisher": "Nick Rossiter"
  },
  "VB_HOUT": {
   "register": "NL07",
   "label": "Vogelbescherming — Houtduif",
   "url": "https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/houtduif",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "Nederland",
   "confirms": "maten, witte halsvlek (niet bij juvenielen), witte vleugelband, geluid, leefgebied, voedsel, broedgegevens, trek, aantallen en trend (Sovon), bescherming en bejaagbaarheid",
   "checked": "2026-11-10",
   "certainty": "hoog",
   "publisher": "Vogelbescherming Nederland"
  },
  "VB_HOLEN": {
   "register": "NL07",
   "label": "Vogelbescherming — Holenduif",
   "url": "https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/holenduif",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "Nederland",
   "confirms": "maten, geen witte vleugelband, groene halsglans, twee zwarte vleugelstrepen, brede zwarte staartband, compacte vlucht, geluid, leefgebied, voedsel, broedgegevens, trek, aantallen en trend",
   "checked": "2026-11-10",
   "certainty": "hoog",
   "publisher": "Vogelbescherming Nederland"
  },
  "VB_TT": {
   "register": "NL07",
   "label": "Vogelbescherming — Turkse tortel",
   "url": "https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/turkse-tortel",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "Nederland",
   "confirms": "lengte, beigegrijs kleed, zwart-witte halsband, donkerrode iris, lichte vleugelvelden en staartranden in vlucht, geluid, leefgebied, voedsel, broedgegevens, standvogel, aantallen en trend",
   "checked": "2026-11-10",
   "certainty": "hoog",
   "publisher": "Vogelbescherming Nederland"
  },
  "VB_ZT": {
   "register": "NL07",
   "label": "Vogelbescherming — Zomertortel",
   "url": "https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zomertortel",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "Nederland",
   "confirms": "zwart-wit gestreepte halsvlek, roodbruine bovendelen met zwarte vlekken, wigvormige staart met witte eindband, rode oogring",
   "checked": "2026-11-10",
   "certainty": "hoog",
   "publisher": "Vogelbescherming Nederland"
  },
  "VB_HVH": {
   "register": "NL07",
   "label": "Vogelbescherming — Vogels herkennen: houtduif vs. holenduif",
   "url": "https://www.vogelbescherming.nl/actueel/bericht/vogels-herkennen-houtduif-vs-holenduif",
   "edition": "online artikel, 7 november 2022, geraadpleegd 10-11-2026",
   "scope": "Nederland",
   "confirms": "grootte en bouw, witte vleugelband houtduif, twee zwarte vleugelvlekken holenduif, halsvlek, irisskleur, juveniele houtduif zonder lichte iris en halsvlek maar met vleugelband, roep",
   "checked": "2026-11-10",
   "certainty": "hoog",
   "publisher": "Vogelbescherming Nederland"
  },
  "VB_5D": {
   "register": "NL07",
   "label": "Vogelbescherming — De 5 soorten duiven van Nederland",
   "url": "https://www.vogelbescherming.nl/actueel/bericht/de-vijf-duiven-van-nederland",
   "edition": "online artikel, 18 juli 2023, geraadpleegd 10-11-2026",
   "scope": "Nederland",
   "confirms": "witte vleugelvlek houtduif in alle kleden, donker oog en groene halsvlek holenduif, baltsvluchten, leefgebied Turkse tortel en zomertortel, geluid",
   "checked": "2026-11-10",
   "certainty": "hoog",
   "publisher": "Vogelbescherming Nederland"
  },
  "CL_WP": {
   "register": "nieuw (buiten register v1.2)",
   "label": "Cornell Lab, All About Birds — Common Wood-Pigeon Identification",
   "url": "https://www.allaboutbirds.org/guide/Common_Wood-Pigeon/id",
   "edition": "online identificatiepagina, geraadpleegd 10-11-2026",
   "scope": "wereldwijd",
   "confirms": "halsvlek bij volwassenen, ontbreekt bij juvenielen in nazomer en herfst; brede witte vleugelband in vlucht; staart breed zwart afgezet; lengte 41–45 cm",
   "checked": "2026-11-10",
   "certainty": "middel-hoog",
   "publisher": "Cornell Lab of Ornithology"
  },
  "GB_SD": {
   "register": "nieuw (buiten register v1.2)",
   "label": "British Garden Birds (D. Gains) — Stock Dove",
   "url": "https://www.garden-birds.co.uk/birds/stock_dove.html",
   "edition": "online soortpagina, geen datum vermeld, geraadpleegd 10-11-2026",
   "scope": "Groot-Brittannië",
   "confirms": "geen witte halsvlek, groene halsvlek, twee kleine zwarte vleugelstrepen (minder duidelijk dan bij Rotsduif), donker oog als beste onderscheidend kenmerk, donkerder dan Houtduif",
   "checked": "2026-11-10",
   "certainty": "middel",
   "publisher": "British Garden Birds"
  },
  "RSPB_SD": {
   "register": "nieuw (buiten register v1.2)",
   "label": "RSPB — Stock dove",
   "url": "https://www.rspb.org.uk/birds-and-wildlife/stock-dove",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "Groot-Brittannië",
   "confirms": "geen wit in de hals, mist de lichte stuit van Rotsduif/stadsduif, zwarte vleugelranden en twee korte zwarte banden",
   "checked": "2026-11-10",
   "certainty": "middel-hoog",
   "publisher": "RSPB"
  },
  "BZ_CD": {
   "register": "nieuw (buiten register v1.2)",
   "label": "Blasco-Zumeta & Heinze — Eurasian Collared Dove (ageing and sexing)",
   "url": "https://www.blascozumeta.com/specie_files/06840_ENG_Streptopelia_decaocto_aranzadi.pdf",
   "edition": "online determinatieblad, geen datum vermeld, geraadpleegd 10-11-2026",
   "scope": "leeftijds- en geslachtsbepaling",
   "confirms": "juvenielen zonder of met vage halsband en bruine iris; volwassenen scherpe zwarte halsband en robijnrode iris; geslacht vaak niet op kleed te bepalen",
   "checked": "2026-11-10",
   "certainty": "middel-hoog",
   "publisher": "Blasco-Zumeta & Heinze"
  },
  "EB_ETD": {
   "register": "nieuw (buiten register v1.2)",
   "label": "eBird — European Turtle-Dove",
   "url": "https://ebird.org/species/eutdov",
   "edition": "online soortpagina, geraadpleegd 10-11-2026",
   "scope": "identificatietekst",
   "confirms": "gestreepte halsvlek, gevlekte vleugels, afgeronde staart met brede witte eindband; kleiner en slanker dan de bleker gekleurde Turkse Tortel",
   "checked": "2026-11-10",
   "certainty": "middel-hoog",
   "publisher": "eBird (Cornell Lab)"
  },
  "BS_TD": {
   "register": "nieuw (buiten register v1.2)",
   "label": "birdspot.co.uk — Turtle Dove Identification Guide",
   "url": "https://www.birdspot.co.uk/bird-identification/turtle-dove",
   "edition": "online determinatiepagina, 7 april 2024 (bijgewerkt 19 april 2025), geraadpleegd 10-11-2026",
   "scope": "Groot-Brittannië",
   "confirms": "zwart-wit gestreepte halsvlek; juvenielen doffer en zonder halsvlek; kastanjebruine bovenvleugel met geschubd patroon",
   "checked": "2026-11-10",
   "certainty": "middel",
   "publisher": "birdspot.co.uk (los van Birdspot Library)"
  }
 },
 "profiles": {
  "sp021": {
   "summary": {
    "text": "Grote zwart-witte kraaiachtige met een lange staart en een opvallend witte handvleugel in vlucht. In Nederland vrijwel niet te verwarren.",
    "sources": [
     "VB_EKSTER"
    ]
   },
   "keyMarks": [
    {
     "text": "Zwarte kop, borst en rug tegen een witte buik en witte schoudervlekken.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_EKSTER"
     ]
    },
    {
     "text": "Lange staart; het zwart glanst groen, paars of blauw.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_EKSTER"
     ]
    },
    {
     "text": "In vlucht een vrijwel geheel witte handvleugel.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_EKSTER"
     ]
    },
    {
     "text": "Luidruchtig met schorre, krassende roepen.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_EKSTER"
     ]
    }
   ],
   "caution": null,
   "critical": [
    {
     "feature": "Kleedpatroon en staart",
     "where": "Hele vogel, zittend of vliegend",
     "this": "Strak zwart-wit met lange, glanzende staart",
     "other": "De bron noemt de Grote Bonte Specht als soort die erop kan lijken; die vergelijking is in de bron niet uitgewerkt.",
     "vs": [
      "sp016"
     ],
     "reliability": "ondersteunend",
     "conditions": "Bij elk redelijk zicht",
     "exceptions": "Geen genoemd in de geraadpleegde bron",
     "supporting": "Schorre roep; witte handvleugel in vlucht",
     "sources": [
      "VB_EKSTER"
     ]
    }
   ],
   "similar": [
    {
     "id": "sp016",
     "why": "Door de bron als gelijkende soort genoemd (zwart-wit); in de praktijk weinig verwarring",
     "sources": [
      "VB_EKSTER"
     ]
    },
    {
     "id": "sp026",
     "why": "Bestaande vluchtvergelijking in Birdspot (kraaiachtige)",
     "sources": []
    }
   ],
   "detail": [
    {
     "topic": "bouw",
     "text": "Stevige donkere snavel en donkere poten.",
     "sources": [
      "VB_EKSTER"
     ]
    },
    {
     "topic": "vlucht",
     "text": "De witte handvleugel springt in vlucht duidelijk in het oog.",
     "sources": [
      "VB_EKSTER"
     ]
    }
   ],
   "voice": [
    {
     "kind": "roep",
     "text": "Veel schorre, krassende geluiden.",
     "sources": [
      "VB_EKSTER"
     ]
    },
    {
     "kind": "zang",
     "text": "Kan ook zacht zingen en andere vogels nadoen.",
     "sources": [
      "VB_EKSTER"
     ]
    }
   ],
   "basis": {
    "size": {
     "text": "Lengte 46–50 cm, spanwijdte 52–60 cm.",
     "sources": [
      "VB_EKSTER"
     ]
    }
   },
   "status": [
    {
     "kind": "voorkomen",
     "text": "Talrijke broedvogel, het hele jaar aanwezig.",
     "sources": [
      "VB_EKSTER"
     ]
    },
    {
     "kind": "aantal",
     "text": "47.000–68.000 broedparen (2018–2020); maximaal 150.000–250.000 vogels in de winter (2012/13–2014/15).",
     "sources": [
      "VB_EKSTER"
     ]
    },
    {
     "kind": "trend",
     "text": "Sterke afname vanaf midden jaren tachtig, rond 2000 gestabiliseerd en sindsdien vrijwel stabiel.",
     "sources": [
      "VB_EKSTER"
     ]
    }
   ],
   "life": [
    {
     "kind": "broeden",
     "text": "Eileg van eind maart tot juni, vooral in april; één broedsel van meestal 5–7 eieren, broedduur 17–24 dagen, jongen 22–30 dagen in het nest.",
     "sources": [
      "VB_EKSTER"
     ]
    },
    {
     "kind": "nest",
     "text": "Groot nest, meestal in een vork hoog in een boom, van boven overdekt met een verscholen ingang.",
     "sources": [
      "VB_EKSTER"
     ]
    }
   ],
   "habitat": [],
   "discrepancies": [],
   "open": [
    "Juveniel kleed en leefgebied niet opnieuw gecontroleerd tegen een bron.",
    "Vergelijking met Gaai is bestaande Birdspot-inhoud, niet opnieuw gecontroleerd.",
    "Kleedpatroon is in Nederland vrijwel onmiskenbaar, maar staat op \"Helpt\" tot een tweede, onafhankelijke bron is vastgelegd (regel doorslaggevend, 10-11-2026)."
   ]
  },
  "sp057": {
   "summary": {
    "text": "Klein groengeel zangertje dat bijna identiek is aan de Tjiftjaf. De aflopende zang is het zekerste kenmerk; in zit helpen de lange vleugelpunten en lichte poten.",
    "sources": [
     "VB_FITIS",
     "BG_CHIFF"
    ]
   },
   "keyMarks": [
    {
     "text": "Zang: helder, melodieus riedeltje dat in toon afloopt.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_FITIS",
      "BG_CHIFF"
     ]
    },
    {
     "text": "Lange handpenprojectie: de vleugelpunten zijn minstens zo lang als de tertials.",
     "reliability": "ondersteunend",
     "sources": [
      "BG_CHIFF"
     ]
    },
    {
     "text": "Duidelijke, lange lichte wenkbrauw en een effen lichte oorstreek; oogring onopvallend.",
     "reliability": "ondersteunend",
     "sources": [
      "BG_CHIFF"
     ]
    },
    {
     "text": "Meestal lichte, bruinroze tot oranjeachtige poten.",
     "reliability": "onbetrouwbaar-alleen",
     "sources": [
      "VB_FITIS",
      "BG_CHIFF"
     ]
    }
   ],
   "caution": {
    "text": "Pootkleur en staartbeweging zijn niet sluitend: er bestaan donkerpotige fitissen, en volgens BirdGuides beweegt ook een fitis soms met de staart (Vogelbescherming schrijft dat de fitis dit nooit doet). Noordelijke en oostelijke vogels kunnen grijzer of bruiner zijn.",
    "sources": [
     "BG_CHIFF",
     "VB_TJIF"
    ]
   },
   "critical": [
    {
     "feature": "Zang",
     "where": "Geluid",
     "this": "Melodieus riedeltje dat in toon afloopt",
     "other": "Tjiftjaf: ritmisch herhaald 'tjif-tjaf'",
     "vs": [
      "sp056"
     ],
     "reliability": "doorslaggevend",
     "conditions": "Alleen bij een zingende vogel met een typisch, volledig lied (vooral voorjaar en zomer)",
     "exceptions": "Zwijgende vogels en najaarsvogels moet je op uiterlijk en roep beoordelen",
     "supporting": "Roep, handpenprojectie",
     "sources": [
      "VB_FITIS",
      "VB_TJIF",
      "BG_CHIFF"
     ],
     "diagnostic": "Het lied verschilt principieel van opbouw (aflopend riedeltje tegen tweetonig tjif-tjaf); beide VB-soortpagina's en BirdGuides (andere uitgever) beschrijven dit onafhankelijk."
    },
    {
     "feature": "Handpenprojectie",
     "where": "Gevouwen vleugel: de handpenpunten die voorbij de tertials uitsteken",
     "this": "Lang: minstens even lang als de tertials",
     "other": "Tjiftjaf: korter, ongeveer de helft tot twee derde van de tertials",
     "vs": [
      "sp056"
     ],
     "reliability": "ondersteunend",
     "conditions": "Vogel in zit, scherp zijaanzicht of foto",
     "exceptions": "Moeilijk bij bewegende vogels of vogels in rui",
     "supporting": "Wenkbrauw en oogring, pootkleur",
     "sources": [
      "BG_CHIFF"
     ]
    },
    {
     "feature": "Kop",
     "where": "Wenkbrauw, oorstreek en oogring",
     "this": "Lange, duidelijke wenkbrauw; effen lichte oorstreek; onopvallende oogring",
     "other": "Tjiftjaf: zwakkere wenkbrauw, olijfgrijs getinte oorstreek, opvallende oogring die een 'brilletje' geeft",
     "vs": [
      "sp056"
     ],
     "reliability": "ondersteunend",
     "conditions": "Goed licht, dichtbij",
     "exceptions": "Variatie tussen individuen en populaties",
     "supporting": "Handpenprojectie",
     "sources": [
      "BG_CHIFF"
     ]
    },
    {
     "feature": "Poten",
     "where": "Poten",
     "this": "Meestal licht bruinroze tot oranjeachtig",
     "other": "Tjiftjaf: meestal donker",
     "vs": [
      "sp056"
     ],
     "reliability": "onbetrouwbaar-alleen",
     "conditions": "Goed licht; schaduw en tegenlicht maken poten donkerder",
     "exceptions": "Er bestaan donkerpotige fitissen",
     "supporting": "Zang, handpenprojectie",
     "sources": [
      "VB_FITIS",
      "VB_TJIF",
      "BG_CHIFF"
     ]
    },
    {
     "feature": "Seizoen",
     "where": "Datum van de waarneming",
     "this": "Overwintert ten zuiden van de Sahel; winterwaarnemingen zijn uiterst zeldzaam",
     "other": "Tjiftjaf: een kleine groep overwintert in Nederland",
     "vs": [
      "sp056"
     ],
     "reliability": "ondersteunend",
     "conditions": "Winterhalfjaar",
     "exceptions": "BirdGuides beschrijft dit voor Groot-Brittannië; voor Nederland bevestigt Vogelbescherming de overwintering van tjiftjaffen",
     "supporting": "Roep",
     "sources": [
      "BG_CHIFF",
      "VB_FITIS",
      "VB_TJIF"
     ]
    }
   ],
   "similar": [
    {
     "id": "sp056",
     "why": "Vrijwel gelijk uiterlijk; zang en vleugel geven de doorslag",
     "sources": [
      "VB_FITIS",
      "BG_CHIFF"
     ]
    }
   ],
   "detail": [
    {
     "topic": "kleed",
     "text": "In het voorjaar meestal frisser groen en geel dan de Tjiftjaf, die doffer is, vooral op de flanken.",
     "sources": [
      "BG_CHIFF"
     ]
    },
    {
     "topic": "leeftijd",
     "text": "Jonge fitissen zijn in het najaar vaak opvallend geel van onderen.",
     "sources": [
      "BG_CHIFF"
     ]
    },
    {
     "topic": "gedrag",
     "text": "Foerageert in struweel; broedt op of vlak boven de grond.",
     "sources": [
      "VB_FITIS"
     ]
    }
   ],
   "voice": [
    {
     "kind": "zang",
     "text": "Helder riedeltje dat in toon afloopt.",
     "sources": [
      "VB_FITIS"
     ]
    },
    {
     "kind": "roep",
     "text": "Lager, langgerekter en meer tweelettergrepig dan de roep van de Tjiftjaf; kan lijken op de roep van de Gekraagde Roodstaart.",
     "sources": [
      "VB_FITIS",
      "BG_CHIFF"
     ]
    }
   ],
   "basis": {
    "size": {
     "text": "Lengte 11–12,5 cm.",
     "sources": [
      "VB_FITIS"
     ]
    }
   },
   "habitat": [
    {
     "kind": "voorkeur",
     "text": "Halfopen landschap met struweel: heide, bosranden, moeras en agrarisch gebied.",
     "sources": [
      "VB_FITIS"
     ]
    },
    {
     "kind": "nederland",
     "text": "Schaars in open boerenland; vooral in duinen, op heide en in hoogveen met opslag.",
     "sources": [
      "VB_FITIS"
     ]
    }
   ],
   "status": [
    {
     "kind": "voorkomen",
     "text": "Een van de algemeenste broedvogels; zomergast.",
     "sources": [
      "VB_FITIS"
     ]
    },
    {
     "kind": "aantal",
     "text": "130.000–220.000 broedparen (2018–2020).",
     "sources": [
      "VB_FITIS"
     ]
    },
    {
     "kind": "trend",
     "text": "Landelijke afname sinds 1990.",
     "sources": [
      "VB_FITIS"
     ]
    }
   ],
   "life": [
    {
     "kind": "voedsel",
     "text": "Vooral insecten, hun eitjes en larven, aangevuld met wat plantaardig voedsel.",
     "sources": [
      "VB_FITIS"
     ]
    },
    {
     "kind": "broeden",
     "text": "Vanaf eind april één broedsel van 4–8 eieren; broedduur 12–14 dagen, jongen 12–16 dagen in het nest. Het vrouwtje voert tot ongeveer twee weken na het uitvliegen.",
     "sources": [
      "VB_FITIS"
     ]
    },
    {
     "kind": "trek",
     "text": "Vertrekt juli–september naar Afrika ten zuiden van de Sahel, grotendeels 's nachts; keert maart–eind mei terug, enkele weken later dan de Tjiftjaf.",
     "sources": [
      "VB_FITIS"
     ]
    }
   ],
   "discrepancies": [],
   "open": [
    "Spanwijdte en gewicht niet opnieuw gecontroleerd.",
    "Verschil met Iberische Tjiftjaf alleen als waarschuwing opgenomen.",
    "Gemengde zang (vogels die elementen van beide soorten zingen) is in de geraadpleegde bronnen niet uitgewerkt; zang blijft doorslaggevend alleen bij een typisch, volledig lied."
   ]
  },
  "sp056": {
   "summary": {
    "text": "Klein bruingroen zangertje dat bijna identiek is aan de Fitis. Het herhaalde 'tjif-tjaf' is het zekerste kenmerk; in zit helpen de korte vleugelpunten, de oogring en het staartdippen.",
    "sources": [
     "VB_TJIF",
     "BG_CHIFF"
    ]
   },
   "keyMarks": [
    {
     "text": "Zang: steeds herhaald 'tjif-tjaf'.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_TJIF",
      "BG_CHIFF"
     ]
    },
    {
     "text": "Korte handpenprojectie: ongeveer de helft tot twee derde van de tertials.",
     "reliability": "ondersteunend",
     "sources": [
      "BG_CHIFF"
     ]
    },
    {
     "text": "Opvallende oogring, zwakkere wenkbrauw en olijfgrijs getinte oorstreek.",
     "reliability": "ondersteunend",
     "sources": [
      "BG_CHIFF"
     ]
    },
    {
     "text": "Beweegt bij het foerageren steeds met de staart.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_TJIF",
      "BG_CHIFF"
     ]
    },
    {
     "text": "Meestal donkere poten.",
     "reliability": "onbetrouwbaar-alleen",
     "sources": [
      "VB_TJIF",
      "BG_CHIFF"
     ]
    }
   ],
   "caution": {
    "text": "Pootkleur en staartbeweging zijn niet sluitend. De Iberische Tjiftjaf kan op beide soorten lijken en is alleen op zang of roep te bevestigen.",
    "sources": [
     "BG_CHIFF"
    ]
   },
   "critical": [
    {
     "feature": "Zang",
     "where": "Geluid",
     "this": "Ritmisch herhaald 'tjif-tjaf'",
     "other": "Fitis: melodieus riedeltje dat in toon afloopt",
     "vs": [
      "sp057"
     ],
     "reliability": "doorslaggevend",
     "conditions": "Alleen bij een zingende vogel met een typisch, volledig lied (vooral voorjaar en zomer)",
     "exceptions": "Iberische Tjiftjaf heeft een afwijkende zang",
     "supporting": "Roep, handpenprojectie",
     "sources": [
      "VB_TJIF",
      "VB_FITIS",
      "BG_CHIFF"
     ],
     "diagnostic": "Zelfde onderbouwing als bij Fitis: tweetonig tjif-tjaf tegen aflopend riedeltje; VB en BirdGuides."
    },
    {
     "feature": "Handpenprojectie",
     "where": "Gevouwen vleugel: de handpenpunten die voorbij de tertials uitsteken",
     "this": "Kort: ongeveer de helft tot twee derde van de tertials",
     "other": "Fitis: lang, minstens even lang als de tertials",
     "vs": [
      "sp057"
     ],
     "reliability": "ondersteunend",
     "conditions": "Vogel in zit, scherp zijaanzicht of foto",
     "exceptions": "Moeilijk bij bewegende vogels of vogels in rui",
     "supporting": "Oogring, staartdippen",
     "sources": [
      "BG_CHIFF"
     ]
    },
    {
     "feature": "Staartbeweging",
     "where": "Staart tijdens het foerageren",
     "this": "Dipt de staart steeds opnieuw",
     "other": "Fitis: zelden (BirdGuides) of nooit (Vogelbescherming)",
     "vs": [
      "sp057"
     ],
     "reliability": "ondersteunend",
     "conditions": "Actief foeragerende vogel, enige tijd volgen",
     "exceptions": "De bronnen verschillen over de fitis",
     "supporting": "Zang, handpenprojectie",
     "sources": [
      "VB_TJIF",
      "BG_CHIFF"
     ]
    },
    {
     "feature": "Poten",
     "where": "Poten",
     "this": "Meestal donker",
     "other": "Fitis: meestal licht bruinroze tot oranjeachtig",
     "vs": [
      "sp057"
     ],
     "reliability": "onbetrouwbaar-alleen",
     "conditions": "Goed licht",
     "exceptions": "Donkerpotige fitissen komen voor",
     "supporting": "Zang, handpenprojectie",
     "sources": [
      "VB_TJIF",
      "VB_FITIS",
      "BG_CHIFF"
     ]
    },
    {
     "feature": "Seizoen",
     "where": "Datum van de waarneming",
     "this": "Kleine aantallen overwinteren in Nederland",
     "other": "Fitis overwintert ten zuiden van de Sahel",
     "vs": [
      "sp057"
     ],
     "reliability": "ondersteunend",
     "conditions": "Winterhalfjaar",
     "exceptions": "Geen",
     "supporting": "Roep",
     "sources": [
      "VB_TJIF",
      "VB_FITIS",
      "BG_CHIFF"
     ]
    }
   ],
   "similar": [
    {
     "id": "sp057",
     "why": "Vrijwel gelijk uiterlijk; zang en vleugel geven de doorslag",
     "sources": [
      "VB_TJIF",
      "BG_CHIFF"
     ]
    }
   ],
   "detail": [
    {
     "topic": "kleed",
     "text": "Meestal doffer dan de Fitis: minder fel groen van boven en vuiler van onderen, vooral op de flanken.",
     "sources": [
      "BG_CHIFF"
     ]
    },
    {
     "topic": "gedrag",
     "text": "Beweegt rusteloos door de begroeiing en zit vaker in hoger bos dan de Fitis.",
     "sources": [
      "VB_TJIF"
     ]
    }
   ],
   "voice": [
    {
     "kind": "zang",
     "text": "De eigen naam, steeds herhaald: 'tjif-tjaf'.",
     "sources": [
      "VB_TJIF"
     ]
    },
    {
     "kind": "roep",
     "text": "Meestal een oplopend 'fwiet', soms een dubbel 'tsju-lie'. Vooral jonge vogels roepen in het najaar.",
     "sources": [
      "VB_TJIF",
      "BG_CHIFF"
     ]
    }
   ],
   "basis": {
    "size": {
     "text": "Lengte 11–12 cm.",
     "sources": [
      "VB_TJIF"
     ]
    }
   },
   "habitat": [
    {
     "kind": "voorkeur",
     "text": "Bos met dichte ondergroei; vaker in hoger bos dan de Fitis.",
     "sources": [
      "VB_TJIF"
     ]
    }
   ],
   "status": [
    {
     "kind": "voorkomen",
     "text": "Uiterst talrijke broedvogel en doortrekker; in zachte winters blijven er enkele achter.",
     "sources": [
      "VB_TJIF"
     ]
    },
    {
     "kind": "aantal",
     "text": "310.000–500.000 broedparen (2018–2020); 50.000–200.000 doortrekkers (2007/08–2011/12); maximaal 1.000–2.000 overwinteraars (2012/13–2014/15).",
     "sources": [
      "VB_TJIF"
     ]
    },
    {
     "kind": "trend",
     "text": "Tientallen jaren toename, met tijdelijke dips.",
     "sources": [
      "VB_TJIF"
     ]
    }
   ],
   "life": [
    {
     "kind": "broeden",
     "text": "Half april tot eind juni, twee broedsels van 5–6 eieren; broedduur 13–15 dagen.",
     "sources": [
      "VB_TJIF"
     ]
    },
    {
     "kind": "nest",
     "text": "Ovenvormig nest met zij-ingang, goed verstopt in dichte begroeiing of vlak boven de grond.",
     "sources": [
      "VB_TJIF"
     ]
    },
    {
     "kind": "trek",
     "text": "Vertrekt grotendeels tussen begin augustus en half oktober, vooral naar Spanje, Portugal en Marokko.",
     "sources": [
      "VB_TJIF"
     ]
    }
   ],
   "discrepancies": [],
   "open": [
    "Spanwijdte en gewicht niet opnieuw gecontroleerd.",
    "Iberische Tjiftjaf heeft nog geen eigen vergelijking.",
    "Gemengde zang (vogels die elementen van beide soorten zingen) is in de geraadpleegde bronnen niet uitgewerkt; zang blijft doorslaggevend alleen bij een typisch, volledig lied."
   ]
  },
  "sp066": {
   "summary": {
    "text": "Kleine bruine stamklimmer met kromme snavel, in het veld bijna niet te onderscheiden van de Taigaboomkruiper. Roep, vleugelbandpatroon en bruinere flanken helpen; zekerheid is lang niet altijd te krijgen.",
    "sources": [
     "EB_STT",
     "NAT_STT",
     "BG_STT"
    ]
   },
   "keyMarks": [
    {
     "text": "Roep: doordringend, herhaald 'tuut' of 'tie tie tie'; volgens eBird het beste veldkenmerk.",
     "reliability": "ondersteunend",
     "sources": [
      "EB_STT",
      "NAT_STT"
     ]
    },
    {
     "text": "Lichte vleugelband met tandvormige randen en gelijkmatige trapjes, niet recht afgesneden.",
     "reliability": "ondersteunend",
     "sources": [
      "BG_STT",
      "EB_STT"
     ]
    },
    {
     "text": "Bruinere flanken dan de Taigaboomkruiper.",
     "reliability": "ondersteunend",
     "sources": [
      "NAT_STT",
      "EB_STT"
     ]
    },
    {
     "text": "Kortere, smallere en minder contrastrijke wenkbrauw.",
     "reliability": "ondersteunend",
     "sources": [
      "NAT_STT"
     ]
    }
   ],
   "caution": {
    "text": "Snavel- en nagellengte verschillen gemiddeld, maar zijn in het veld nauwelijks te beoordelen. Ook zang is niet sluitend: menggezang tussen de soorten is beschreven. Combineer altijd meerdere kenmerken.",
    "sources": [
     "NAT_STT",
     "EB_STT",
     "BB_STT"
    ]
   },
   "critical": [
    {
     "feature": "Roep",
     "where": "Geluid",
     "this": "Doordringend 'tuut', vaak herhaald als 'tie tie tie'",
     "other": "Taigaboomkruiper: andere roep (in de geraadpleegde bronnen niet beschreven)",
     "vs": [
      "sp067"
     ],
     "reliability": "ondersteunend",
     "conditions": "Roepende vogel; jaarrond te horen",
     "exceptions": "Klankweergaven verschillen tussen bronnen",
     "supporting": "Vleugelband, flanken",
     "sources": [
      "EB_STT",
      "NAT_STT"
     ]
    },
    {
     "feature": "Zang",
     "where": "Geluid",
     "this": "Korte, stijgende frase",
     "other": "Taigaboomkruiper: andere zang (niet beschreven in de geraadpleegde bronnen)",
     "vs": [
      "sp067"
     ],
     "reliability": "ondersteunend",
     "conditions": "Zingende vogel, vooral voorjaar",
     "exceptions": "Menggezang en imitatie komen voor; zang alleen is daarom niet sluitend",
     "supporting": "Roep, vleugelband",
     "sources": [
      "NAT_STT",
      "RSPB_STT",
      "BB_STT"
     ]
    },
    {
     "feature": "Vleugelbandpatroon",
     "where": "Lichte band over de handpennen van de gevouwen vleugel",
     "this": "Lichte randen tandvormig of driehoekig, zwarte trapjes lopen geleidelijk op",
     "other": "Taigaboomkruiper: lichte randen recht afgesneden, blokvormig",
     "vs": [
      "sp067"
     ],
     "reliability": "ondersteunend",
     "conditions": "Scherpe foto of goed zijaanzicht van de vleugel",
     "exceptions": "Sleet of rui kan het patroon vervagen",
     "supporting": "Alularand, roep",
     "sources": [
      "BG_STT",
      "EB_STT"
     ]
    },
    {
     "feature": "Alula",
     "where": "Grootste alulaveer bij de vleugelboeg",
     "this": "Lichte rand rond de buitenrand",
     "other": "Taigaboomkruiper: zeer ongebruikelijk",
     "vs": [
      "sp067"
     ],
     "reliability": "ondersteunend",
     "conditions": "Scherpe foto nodig",
     "exceptions": "Gebaseerd op één determinatieverslag",
     "supporting": "Vleugelband",
     "sources": [
      "BG_STT"
     ]
    },
    {
     "feature": "Flanken en wenkbrauw",
     "where": "Zijkant van de onderzijde; streep boven het oog",
     "this": "Bruinere flanken; kortere, smallere, minder contrastrijke wenkbrauw",
     "other": "Taigaboomkruiper: minder bruine flanken en een langere, duidelijkere wenkbrauw",
     "vs": [
      "sp067"
     ],
     "reliability": "ondersteunend",
     "conditions": "Goed licht",
     "exceptions": "Bruine tint verschilt met licht en sleet",
     "supporting": "Vleugelband, roep",
     "sources": [
      "NAT_STT",
      "EB_STT"
     ]
    },
    {
     "feature": "Snavel en achternagel",
     "where": "Snavel; achterteen",
     "this": "Iets langere, krommere snavel; kortere achternagel",
     "other": "Taigaboomkruiper: iets kortere snavel, langere achternagel",
     "vs": [
      "sp067"
     ],
     "reliability": "onbetrouwbaar-alleen",
     "conditions": "Vrijwel alleen in de hand of op een zeer scherpe foto",
     "exceptions": "Overlap; relatieve verschillen",
     "supporting": "Alle andere kenmerken",
     "sources": [
      "NAT_STT",
      "EB_STT",
      "BG_STT"
     ]
    }
   ],
   "similar": [
    {
     "id": "sp067",
     "why": "Zustersoort; in het veld een van de lastigste paren",
     "sources": [
      "NAT_STT",
      "EB_STT",
      "BG_STT"
     ]
    },
    {
     "id": "sp065",
     "why": "Bestaande Birdspot-vergelijking (eveneens stamklimmer)",
     "sources": []
    }
   ],
   "detail": [
    {
     "topic": "bouw",
     "text": "Dunne, kromme snavel; gespikkeld bruin van boven en grotendeels wit van onderen.",
     "sources": [
      "RSPB_STT"
     ]
    },
    {
     "topic": "geslacht",
     "text": "In de geraadpleegde bronnen wordt geen veldverschil tussen mannetje en vrouwtje beschreven.",
     "sources": [
      "NAT_STT",
      "EB_STT"
     ]
    }
   ],
   "voice": [
    {
     "kind": "roep",
     "text": "Doordringend, herhaald 'tuut' of 'tie tie tie'.",
     "sources": [
      "EB_STT",
      "NAT_STT"
     ]
    },
    {
     "kind": "zang",
     "text": "Korte, stijgende frase.",
     "sources": [
      "NAT_STT"
     ]
    }
   ],
   "basis": {},
   "habitat": [
    {
     "kind": "voorkeur",
     "text": "Volgens eBird vaker in loofbos op lagere hoogte, en in boerenland en parken.",
     "sources": [
      "EB_STT"
     ]
    }
   ],
   "status": [],
   "life": [],
   "discrepancies": [],
   "open": [
    "Nederlandse status en aantallen niet opnieuw gecontroleerd (Sovon/Vogelbescherming).",
    "Roep en zang van de Taigaboomkruiper nog uit een bron beschrijven.",
    "Hoofdfoto toont de vleugelband niet scherp; soortbepaling van die foto steunt op bronmetadata (fotobaseline batch 01).",
    "Volledige tekst van het British Birds-artikel niet gelezen."
   ]
  },
  "sp008": {
   "summary": {
    "text": "Slanke valk met lange staart die vaak biddend boven open land hangt. Mannetje en vrouwtje verschillen duidelijk in kop- en staartkleur.",
    "sources": [
     "VB_TOREN"
    ]
   },
   "keyMarks": [
    {
     "text": "Bidt veel: hangt stil in de lucht boven open terrein.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_TOREN"
     ]
    },
    {
     "text": "Lange staart; in zit steekt die ver voorbij de vleugelpunten.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_TOREN"
     ]
    },
    {
     "text": "Mannetje: grijze kop, grijze staart met zwarte eindband, roodbruine rug.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_TOREN",
      "EB_KES"
     ]
    },
    {
     "text": "Vrouwtje: roodbruine bovenzijde en een sterk gebandeerde staart.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_TOREN"
     ]
    }
   ],
   "caution": {
    "text": "Een bruine kop en gebandeerde staart wijzen niet automatisch op een vrouwtje; het kleed van jonge vogels is in de geraadpleegde bron niet beschreven.",
    "sources": [
     "VB_TOREN"
    ]
   },
   "critical": [
    {
     "feature": "Geslacht",
     "where": "Kop en staart",
     "this": "Mannetje: grijze kop en grijze staart met zwarte eindband. Vrouwtje: bruine kop, roodbruine en sterk gebandeerde staart",
     "other": "—",
     "vs": [],
     "reliability": "doorslaggevend",
     "conditions": "Volwassen vogels, goed zicht op kop of staart",
     "exceptions": "Jonge vogels zijn in de bron niet beschreven; bepaal geslacht dan niet op kleur alleen",
     "supporting": "Rugkleur",
     "sources": [
      "VB_TOREN",
      "EB_KES"
     ],
     "diagnostic": "Volwassen mannetje (grijze kop en staart met zwarte eindband) tegen vrouwtje (bruine kop, gebandeerde staart): VB en eBird (Cornell) onafhankelijk; geldt niet voor jonge vogels."
    },
    {
     "feature": "Silhouet en jachtgedrag",
     "where": "Hele vogel in vlucht",
     "this": "Lange staart, minder spitse vleugelpunten; bidt veel",
     "other": "De bron noemt Boomvalk, Sperwer, Slechtvalk en Smelleken als gelijkende soorten, zonder uitgewerkte vergelijking",
     "vs": [
      "sp261",
      "sp006",
      "sp009",
      "sp260"
     ],
     "reliability": "ondersteunend",
     "conditions": "Vliegende vogel",
     "exceptions": "Niet uitgewerkt per soort",
     "supporting": "Rugkleur, roep",
     "sources": [
      "VB_TOREN"
     ]
    }
   ],
   "similar": [
    {
     "id": "sp006",
     "why": "Door de bron genoemd; bestaande vlucht- en kleedvergelijking in Birdspot",
     "sources": [
      "VB_TOREN"
     ]
    },
    {
     "id": "sp009",
     "why": "Door de bron genoemd; bestaande vergelijking in Birdspot",
     "sources": [
      "VB_TOREN"
     ]
    },
    {
     "id": "sp261",
     "why": "Door de bron genoemd",
     "sources": [
      "VB_TOREN"
     ]
    },
    {
     "id": "sp260",
     "why": "Door de bron genoemd",
     "sources": [
      "VB_TOREN"
     ]
    }
   ],
   "detail": [
    {
     "topic": "vlucht",
     "text": "Rustige, ondiepe vleugelslag; hangt biddend stil terwijl hij naar muizen zoekt.",
     "sources": [
      "VB_TOREN"
     ]
    }
   ],
   "voice": [
    {
     "kind": "roep",
     "text": "Meest gehoord: een reeks 'kie-kie-kie'. Verder vrij stil, behalve bij het nest en tijdens de balts.",
     "sources": [
      "VB_TOREN"
     ]
    }
   ],
   "basis": {
    "size": {
     "text": "Lengte 31–37 cm, spanwijdte 68–78 cm.",
     "sources": [
      "VB_TOREN"
     ]
    }
   },
   "habitat": [],
   "status": [
    {
     "kind": "voorkomen",
     "text": "Vrij schaarse broedvogel, het hele jaar aanwezig.",
     "sources": [
      "VB_TOREN"
     ]
    },
    {
     "kind": "rodelijst",
     "text": "Staat sinds 2017 op de Nederlandse Rode Lijst.",
     "sources": [
      "VB_TOREN"
     ]
    },
    {
     "kind": "aantal",
     "text": "3.800–7.700 broedparen (2018–2020); maximaal 10.000–20.000 overwinteraars (2012/13–2014/15).",
     "sources": [
      "VB_TOREN"
     ]
    },
    {
     "kind": "trend",
     "text": "Afname sinds 1990, de laatste jaren versneld; genoemde oorzaak is intensiever graslandgebruik met minder veldmuizen.",
     "sources": [
      "VB_TOREN"
     ]
    }
   ],
   "life": [
    {
     "kind": "broeden",
     "text": "April–juli, meestal 4–6 eieren, zelden twee legsels; broedduur 27–31 dagen, vooral door het vrouwtje. Jongen vliegen na 27–35 dagen uit en worden daarna nog weken gevoerd.",
     "sources": [
      "VB_TOREN"
     ]
    },
    {
     "kind": "nest",
     "text": "Bouwt geen eigen nest: oude kraaiennesten en in Nederland vooral nestkasten.",
     "sources": [
      "VB_TOREN"
     ]
    }
   ],
   "discrepancies": [],
   "open": [
    "Juveniel kleed en het onderscheid juveniel/vrouwtje uit een bron beschrijven.",
    "Uitgewerkte vergelijking met Boomvalk en Smelleken ontbreekt."
   ]
  },
  "sp094": {
   "summary": {
    "text": "Grote meeuw met lichtgrijze mantel en roze poten. Jonge vogels zijn bruin en hebben ongeveer vier jaar nodig voor het volwassen kleed.",
    "sources": [
     "VB_ZILV",
     "MUN_GULL"
    ]
   },
   "keyMarks": [
    {
     "text": "Volwassen: witte kop, staart en onderzijde; grijze mantel en vleugels; zwarte vleugelpunten met witte vlekken.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_ZILV"
     ]
    },
    {
     "text": "Meestal roze poten. Vogelbescherming noemt dit het belangrijkste verschil met de Geelpootmeeuw, maar pootkleur varieert en is alleen niet sluitend.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_ZILV",
      "ROSS_YLG"
     ]
    },
    {
     "text": "Formaat tussen Kleine en Grote Mantelmeeuw.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_ZILV"
     ]
    },
    {
     "text": "Eerstejaars: tertials met duidelijk ingekeepte lichte randen.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_ZILV"
     ]
    }
   ],
   "caution": {
    "text": "Grote meeuwen hebben veel tussenkleden; bepaal de leeftijd op meerdere kenmerken. De Pontische Meeuw wordt in de bron als gelijkende soort genoemd, maar het onderscheid is daar niet uitgewerkt.",
    "sources": [
     "VB_ZILV",
     "MUN_GULL"
    ]
   },
   "critical": [
    {
     "feature": "Pootkleur",
     "where": "Poten",
     "this": "Roze",
     "other": "Geelpootmeeuw: geel",
     "vs": [
      "sp226"
     ],
     "reliability": "ondersteunend",
     "conditions": "Volwassen vogels, poten zichtbaar",
     "exceptions": "Pootkleur varieert: noordelijke Zilvermeeuwen kunnen bleek- tot strogele poten hebben, en Geelpootmeeuwen tonen in de rui minder fel gekleurde poten. Combineer met rugtint, vleugelpunt en oog.",
     "supporting": "Rugtint, vleugelpunttekening, snavel en oogring samen beoordelen",
     "sources": [
      "VB_ZILV",
      "ROSS_YLG"
     ]
    },
    {
     "feature": "Tertials eerstejaars",
     "where": "Tertials boven de gevouwen vleugel",
     "this": "Duidelijk ingekeepte lichte randen",
     "other": "Kleine Mantelmeeuw (eerste winter): de bron gebruikt dit verschil om ze te scheiden",
     "vs": [
      "sp095"
     ],
     "reliability": "ondersteunend",
     "conditions": "Zittende eerstejaars, goed zicht",
     "exceptions": "Sleet kan randen afvlakken",
     "supporting": "Formaat",
     "sources": [
      "VB_ZILV"
     ]
    },
    {
     "feature": "Leeftijd",
     "where": "Hele vogel",
     "this": "Juveniel vrijwel geheel grijsbruin; grijze bovendelen pas vanaf de tweede winter; volwassen na ongeveer vier jaar",
     "other": "—",
     "vs": [],
     "reliability": "ondersteunend",
     "conditions": "Meerdere kenmerken samen",
     "exceptions": "Individuele variatie in tussenkleden",
     "supporting": "Snavel- en oogkleur (nog niet uit bron beschreven)",
     "sources": [
      "VB_ZILV",
      "MUN_GULL"
     ]
    }
   ],
   "similar": [
    {
     "id": "sp226",
     "why": "Lijkt sterk op. Pootkleur helpt maar varieert; combineer met rugtint, vleugelpunt en oog.",
     "sources": [
      "VB_ZILV",
      "ROSS_YLG"
     ]
    },
    {
     "id": "sp095",
     "why": "Formaat en tertials bij eerstejaars; bestaande vergelijking in Birdspot",
     "sources": [
      "VB_ZILV"
     ]
    },
    {
     "id": "sp227",
     "why": "Door de bron als gelijkende soort genoemd",
     "sources": [
      "VB_ZILV"
     ]
    },
    {
     "id": "sp096",
     "why": "Bestaande Birdspot-vergelijking",
     "sources": []
    }
   ],
   "detail": [
    {
     "topic": "leeftijd",
     "text": "Jonge vogels zijn vrijwel geheel grijsbruin; de grijze bovendelen verschijnen pas in de tweede winter.",
     "sources": [
      "VB_ZILV"
     ]
    },
    {
     "topic": "leeftijd",
     "text": "Heeft ongeveer vier jaar nodig om het volwassen kleed te bereiken.",
     "sources": [
      "MUN_GULL"
     ]
    }
   ],
   "voice": [
    {
     "kind": "roep",
     "text": "Luidruchtig, met lange uithalen die hoger klinken dan bij de Kleine Mantelmeeuw.",
     "sources": [
      "VB_ZILV"
     ]
    },
    {
     "kind": "alarm",
     "text": "Kort 'kjaa'.",
     "sources": [
      "VB_ZILV"
     ]
    }
   ],
   "basis": {
    "size": {
     "text": "Lengte 55–67 cm, spanwijdte 125–155 cm.",
     "sources": [
      "VB_ZILV"
     ]
    }
   },
   "habitat": [],
   "status": [
    {
     "kind": "voorkomen",
     "text": "Algemene broedvogel, het hele jaar aanwezig, talrijk als wintergast.",
     "sources": [
      "VB_ZILV"
     ]
    },
    {
     "kind": "aantal",
     "text": "24.500–28.500 broedparen (2025).",
     "sources": [
      "VB_ZILV"
     ]
    },
    {
     "kind": "trend",
     "text": "Sinds de jaren negentig bijna gehalveerd. In Europa niet bedreigd, maar in veel landen afnemend.",
     "sources": [
      "VB_ZILV"
     ]
    },
    {
     "kind": "bescherming",
     "text": "Beschermd onder de Europese Vogelrichtlijn en de Omgevingswet; sommige provincies noemen het een overlastsoort.",
     "sources": [
      "VB_ZILV"
     ]
    }
   ],
   "life": [],
   "discrepancies": [],
   "open": [
    "Snavel- en oogkleur per leeftijd uit een bron beschrijven.",
    "Onderscheid met Pontische Meeuw uitwerken.",
    "Kopstreping in winterkleed is in de bron alleen als foto te zien."
   ]
  },
  "sp006": {
   "summary": {
    "text": "Kleine roofvogel met korte, brede vleugels en lange staart, die in een paar snelle slagen en een glijvlucht laag langs heggen jaagt. Wordt vooral met de Havik verward.",
    "sources": [
     "VB_SPERWER",
     "VB_HVS"
    ]
   },
   "keyMarks": [
    {
     "text": "Vliegt met een paar snelle slagen afgewisseld met korte glijvluchten.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_SPERWER",
      "VB_HVS"
     ]
    },
    {
     "text": "Staart met recht afgesneden hoeken; bij de Havik is de staartpunt afgerond.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_HVS"
     ]
    },
    {
     "text": "Korte, rechthoekige vleugels en een kleine kop die weinig uitsteekt.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_HVS",
      "VB_SPERWER"
     ]
    },
    {
     "text": "Onderzijde altijd dwars gebandeerd, ook bij jonge vogels.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_SPERWER",
      "VB_HVS",
      "BZ_SPA"
     ]
    },
    {
     "text": "Lange, dunne gele poten.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_SPERWER"
     ]
    }
   ],
   "caution": {
    "text": "Grootte is onbetrouwbaar: een sperwervrouwtje en een havikmannetje lijken in vlucht sterk op elkaar. Ook het kleed van beide soorten lijkt veel op elkaar.",
    "sources": [
     "VB_HVS"
    ]
   },
   "critical": [
    {
     "feature": "Onderzijde jonge vogels",
     "where": "Borst en buik",
     "this": "Dwarsbanden, vaak als V-vormige vlekken",
     "other": "Jonge Havik: lengtestrepen",
     "vs": [
      "sp007"
     ],
     "reliability": "doorslaggevend",
     "conditions": "Onderzijde goed zichtbaar",
     "exceptions": "Geen genoemd",
     "supporting": "Staartvorm, vliegstijl",
     "sources": [
      "VB_HVS",
      "VB_SPERWER_MV",
      "BZ_SPA"
     ],
     "diagnostic": "Dwarsbanden (Sperwer) tegen lengtestrepen (jonge Havik): VB-artikel havik vs sperwer en Blasco-Zumeta (los determinatieblad)."
    },
    {
     "feature": "Staartpunt",
     "where": "Uiteinde van de staart",
     "this": "Recht afgesneden hoeken",
     "other": "Havik: duidelijk afgerond",
     "vs": [
      "sp007"
     ],
     "reliability": "ondersteunend",
     "conditions": "Vliegende vogel met (deels) gesloten staart",
     "exceptions": "Een gespreide staart oogt anders",
     "supporting": "Kop, vleugelvorm",
     "sources": [
      "VB_HVS"
     ]
    },
    {
     "feature": "Kop en vleugels in vlucht",
     "where": "Silhouet",
     "this": "Kop steekt weinig uit; korte, rechthoekige vleugels",
     "other": "Havik: kop steekt duidelijk uit; vleugels langer en puntiger ten opzichte van de staart; brede 'heupen'",
     "vs": [
      "sp007"
     ],
     "reliability": "ondersteunend",
     "conditions": "Vliegende vogel, liefst van onderen",
     "exceptions": "Houding verandert tijdens de vlucht",
     "supporting": "Staartpunt, vliegstijl",
     "sources": [
      "VB_HVS"
     ]
    },
    {
     "feature": "Vliegstijl",
     "where": "Vleugelslag",
     "this": "Snelle slagen met korte glijstukken; tenger",
     "other": "Havik: langzamer en krachtiger, behalve tijdens een achtervolging",
     "vs": [
      "sp007"
     ],
     "reliability": "ondersteunend",
     "conditions": "Vogel enige tijd volgen",
     "exceptions": "Jagende haviken vliegen ook snel",
     "supporting": "Silhouet",
     "sources": [
      "VB_HVS"
     ]
    },
    {
     "feature": "Roep",
     "where": "Geluid, vooral in het voorjaar",
     "this": "Snel en hoog 'kie-kie-kie'",
     "other": "Havik: trager en dieper",
     "vs": [
      "sp007"
     ],
     "reliability": "ondersteunend",
     "conditions": "Bij het nestterrein",
     "exceptions": "Buiten het broedseizoen weinig te horen",
     "supporting": "Silhouet",
     "sources": [
      "VB_HVS",
      "VB_SPERWER"
     ]
    },
    {
     "feature": "Grootte",
     "where": "Hele vogel",
     "this": "Kleiner dan Havik; vrouwtje veel groter dan mannetje",
     "other": "Havikmannetje komt in de buurt van een sperwervrouwtje",
     "vs": [
      "sp007"
     ],
     "reliability": "onbetrouwbaar-alleen",
     "conditions": "Alleen met directe vergelijking",
     "exceptions": "Overlap tussen de seksen van beide soorten",
     "supporting": "Alle andere kenmerken",
     "sources": [
      "VB_HVS"
     ]
    }
   ],
   "similar": [
    {
     "id": "sp007",
     "why": "Grootste verwarringsrisico; bestaande vergelijkingen in Birdspot",
     "sources": [
      "VB_HVS",
      "VB_SPERWER"
     ]
    },
    {
     "id": "sp008",
     "why": "Door de bron genoemd; bestaande vluchtvergelijking in Birdspot",
     "sources": [
      "VB_SPERWER"
     ]
    }
   ],
   "detail": [
    {
     "topic": "geslacht",
     "text": "Mannetje: blauwgrijze bovenzijde, oranje wangen en keel, bruinoranje gestreepte onderzijde, geen witte wenkbrauw, iris meestal oranje tot rood.",
     "sources": [
      "VB_SPERWER_MV"
     ]
    },
    {
     "topic": "geslacht",
     "text": "Vrouwtje: bruingrijze bovenzijde zonder blauwe tint, donkere wangen, zwart-wit gebandeerde onderzijde, witte wenkbrauw, gele iris; bijna twee keer zo zwaar als het mannetje.",
     "sources": [
      "VB_SPERWER_MV"
     ]
    },
    {
     "topic": "leeftijd",
     "text": "Jonge vogels lijken op het vrouwtje, inclusief wenkbrauw, maar zijn bruiner met roestkleurige veerranden. Rond het eerste levensjaar ruien ze; vanaf de tweede herfst lijken ze op volwassen vogels.",
     "sources": [
      "VB_SPERWER_MV"
     ]
    },
    {
     "topic": "vlucht",
     "text": "Kan ook cirkelen op thermiek.",
     "sources": [
      "VB_SPERWER"
     ]
    }
   ],
   "voice": [
    {
     "kind": "roep",
     "text": "Op de broedplaats kekkerende geluiden en een hoge, schrille roep; daarnaast een alarmroep bij het nest en een bedelroep van uitgevlogen jongen.",
     "sources": [
      "VB_SPERWER"
     ]
    }
   ],
   "basis": {
    "size": {
     "text": "Lengte 28–40 cm, spanwijdte 56–78 cm.",
     "sources": [
      "VB_SPERWER"
     ]
    }
   },
   "habitat": [
    {
     "kind": "jacht",
     "text": "Jaagt vaak vanuit een hinderlaag in dicht bos of in tuinen.",
     "sources": [
      "VB_SPERWER"
     ]
    }
   ],
   "status": [
    {
     "kind": "voorkomen",
     "text": "Vrij schaarse broedvogel, het hele jaar aanwezig.",
     "sources": [
      "VB_SPERWER"
     ]
    },
    {
     "kind": "aantal",
     "text": "2.250–2.700 broedparen (2018–2020); maximaal 10.000–15.000 overwinteraars.",
     "sources": [
      "VB_SPERWER"
     ]
    },
    {
     "kind": "trend",
     "text": "Sterke toename sinds de jaren zeventig, sinds 2000 weer afnemend.",
     "sources": [
      "VB_SPERWER"
     ]
    },
    {
     "kind": "bescherming",
     "text": "Staat op de Oranje lijst van Vogelbescherming (geen officiële Rode Lijst-status).",
     "sources": [
      "VB_SPERWER"
     ]
    }
   ],
   "life": [
    {
     "kind": "voedsel",
     "text": "Vooral kleine zangvogels; grotere vrouwtjes vangen ook lijsters, spreeuwen en soms vogels tot het formaat van een Turkse Tortel.",
     "sources": [
      "VB_SPERWER"
     ]
    },
    {
     "kind": "broeden",
     "text": "Eind april–juni, één legsel; broedduur 32–34 dagen; meestal 3–4 jongen die na 26–30 dagen uitvliegen en nog 3–4 weken worden gevoerd.",
     "sources": [
      "VB_SPERWER"
     ]
    },
    {
     "kind": "nest",
     "text": "Bouwt elk jaar een nieuw nest, vaak tegen de stam in dicht bos; territoriaal, met een baltsvlucht hoog in de lucht.",
     "sources": [
      "VB_SPERWER"
     ]
    }
   ],
   "discrepancies": [
    {
     "field": "grootte mannetje (vergelijkingssoort)",
     "app": "—",
     "source": "'Ongeveer zo groot als een Turkse Tortel' (man/vrouw-artikel) versus 'ongeveer zo groot als een Kauw' (havik-vs-sperwer-artikel)",
     "sources": [
      "VB_SPERWER_MV",
      "VB_HVS"
     ]
    }
   ],
   "open": [
    "Leeftijdsbepaling in vlucht nog uit een bron beschrijven."
   ]
  },
  "sp005": {
   "summary": {
    "text": "Onze algemeenste roofvogel: compact, brede vleugels, korte staart en een kop die weinig uitsteekt. Het kleed varieert sterk van donkerbruin tot bijna wit, dus let vooral op bouw en vliegbeeld.",
    "sources": [
     "VB_BUIZ",
     "BG_BUZZ"
    ]
   },
   "keyMarks": [
    {
     "text": "Brede kop die weinig uitsteekt; brede vleugels; vrij korte staart.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_BUIZ",
      "BG_BUZZ"
     ]
    },
    {
     "text": "Zweeft met de vleugels in een ondiepe V.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_BUIZ",
      "BG_BUZZ"
     ]
    },
    {
     "text": "Snelle, ondiepe, wat stijve vleugelslagen.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_BUIZ",
      "BG_BUZZ"
     ]
    },
    {
     "text": "Ondervleugel met komma-vormige polsvlek en lichte handpenvlakken.",
     "reliability": "ondersteunend",
     "sources": [
      "BG_BUZZ"
     ]
    },
    {
     "text": "Miauwende roep, het hele jaar te horen.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_BUIZ",
      "BG_BUZZ"
     ]
    }
   ],
   "caution": {
    "text": "Kleur zegt weinig: lichte vogels worden vaak voor Ruigpootbuizerd aangezien, de donkerste lijken op Bruine Kiekendief. De bronnen verschillen over de staarthoeken (Vogelbescherming: afgerond; BirdGuides: hoekig).",
    "sources": [
     "VB_BUIZ",
     "BG_BUZZ"
    ]
   },
   "critical": [
    {
     "feature": "Kop",
     "where": "Kop in vlucht",
     "this": "Kort, breed en stomp",
     "other": "Wespendief: smaller en uitstekend, doet aan een koekoek denken",
     "vs": [
      "sp248"
     ],
     "reliability": "ondersteunend",
     "conditions": "Vliegende vogel",
     "exceptions": "Jonge wespendieven zijn minder uitgesproken",
     "supporting": "Vleugelhouding, staart",
     "sources": [
      "BG_BUZZ"
     ]
    },
    {
     "feature": "Vleugelhouding en -slag",
     "where": "Silhouet tijdens zweven en vliegen",
     "this": "Zweeft in ondiepe V; snelle, stijve slagen",
     "other": "Wespendief: zweeft met vlakke vleugels, glijdt met licht hangende vleugels; soepelere slagen",
     "vs": [
      "sp248"
     ],
     "reliability": "ondersteunend",
     "conditions": "Vogel enige tijd volgen",
     "exceptions": "Houding wisselt met de wind",
     "supporting": "Kop, staart",
     "sources": [
      "BG_BUZZ",
      "VB_BUIZ"
     ]
    },
    {
     "feature": "Staart",
     "where": "Staart van onderen",
     "this": "Kort, korter dan de vleugelbreedte; volwassen met een brede donkere band vlak voor de punt",
     "other": "Wespendief: langer en met afgeronde hoeken; mannetje met brede eindband en twee smalle banden bij de basis",
     "vs": [
      "sp248"
     ],
     "reliability": "ondersteunend",
     "conditions": "Goed zicht van onderen",
     "exceptions": "Jonge buizerds missen de brede band",
     "supporting": "Ondervleugel",
     "sources": [
      "BG_BUZZ"
     ]
    },
    {
     "feature": "Iris",
     "where": "Oog, van dichtbij",
     "this": "Volwassen: donker; jonge vogels: licht",
     "other": "Volwassen Wespendief: geel oog",
     "vs": [
      "sp248"
     ],
     "reliability": "ondersteunend",
     "conditions": "Alleen van dichtbij of op een scherpe foto",
     "exceptions": "Jonge buizerds hebben een lichte iris",
     "supporting": "Snavel en washuid",
     "sources": [
      "BG_BUZZ"
     ]
    },
    {
     "feature": "Kleur",
     "where": "Hele vogel",
     "this": "Zeer variabel, van donkerbruin tot bijna wit",
     "other": "Wespendief varieert ook van zeer donker tot bijna wit",
     "vs": [
      "sp248",
      "sp253"
     ],
     "reliability": "onbetrouwbaar-alleen",
     "conditions": "—",
     "exceptions": "Overlap in alle kleurvormen",
     "supporting": "Bouw en vliegbeeld",
     "sources": [
      "BG_BUZZ",
      "VB_BUIZ"
     ]
    },
    {
     "feature": "Geluid",
     "where": "Roep",
     "this": "Miauwend, jaarrond",
     "other": "Wespendief: buiten de broedtijd stil",
     "vs": [
      "sp248"
     ],
     "reliability": "ondersteunend",
     "conditions": "Roepende vogel",
     "exceptions": "Een zwijgende buizerd sluit niets uit",
     "supporting": "Bouw",
     "sources": [
      "BG_BUZZ",
      "VB_BUIZ"
     ]
    }
   ],
   "similar": [
    {
     "id": "sp248",
     "why": "Bouw en vliegbeeld zijn de sleutel; kleur overlapt",
     "sources": [
      "BG_BUZZ",
      "VB_BUIZ"
     ]
    },
    {
     "id": "sp253",
     "why": "Lichte buizerds worden vaak voor Ruigpootbuizerd aangezien; onderscheid nog niet uit bron uitgewerkt",
     "sources": [
      "VB_BUIZ"
     ]
    },
    {
     "id": "sp173",
     "why": "De donkerste buizerds kunnen op Bruine Kiekendief lijken",
     "sources": [
      "BG_BUZZ",
      "VB_BUIZ"
     ]
    }
   ],
   "detail": [
    {
     "topic": "kleed",
     "text": "Vaak middenbruin met een donker 'schild' op de bovenborst boven een lichtere band.",
     "sources": [
      "BG_BUZZ"
     ]
    },
    {
     "topic": "leeftijd",
     "text": "Jonge vogels: lichte iris, vage achterrand van de vleugel en geen brede donkere band in de staart.",
     "sources": [
      "BG_BUZZ"
     ]
    }
   ],
   "voice": [
    {
     "kind": "roep",
     "text": "Hoge, miauwende roep, ook in vlucht; uitgevlogen jongen bedelen met een eigen roep.",
     "sources": [
      "VB_BUIZ"
     ]
    }
   ],
   "basis": {
    "size": {
     "text": "Lengte 40–52 cm, spanwijdte 109–136 cm.",
     "sources": [
      "VB_BUIZ"
     ]
    }
   },
   "habitat": [],
   "status": [
    {
     "kind": "voorkomen",
     "text": "Vrij algemene broedvogel, het hele jaar aanwezig.",
     "sources": [
      "VB_BUIZ"
     ]
    },
    {
     "kind": "aantal",
     "text": "11.500–20.000 broedparen (2018–2020); maximaal 30.000–50.000 in de winter (2012/13–2014/15); 10.000–50.000 doortrekkers (2007/08–2011/12).",
     "sources": [
      "VB_BUIZ"
     ]
    },
    {
     "kind": "trend",
     "text": "Sterke toename als broedvogel sinds de jaren zeventig, vooral in laag Nederland; de wintergetallen dalen de laatste jaren.",
     "sources": [
      "VB_BUIZ"
     ]
    }
   ],
   "life": [
    {
     "kind": "broeden",
     "text": "Vooral april–mei, meestal 2–4 eieren.",
     "sources": [
      "VB_BUIZ"
     ]
    },
    {
     "kind": "nest",
     "text": "Groot takkennest, meestal hoog in een boom nabij een bosrand; vaak jaren hergebruikt en opgeknapt.",
     "sources": [
      "VB_BUIZ"
     ]
    }
   ],
   "discrepancies": [
    {
     "field": "staarthoeken",
     "app": "'relatief korte, afgeronde staart'",
     "source": "Vogelbescherming: afgerond; BirdGuides: hoekig",
     "sources": [
      "VB_BUIZ",
      "BG_BUZZ"
     ]
    }
   ],
   "open": [
    "Onderscheid met Ruigpootbuizerd uit een bron uitwerken.",
    "Leefgebied niet opnieuw gecontroleerd."
   ]
  },
  "sp002": {
   "summary": {
    "text": "Grootste duif van Nederland: blauwgrijs met roze borst. Volwassen vogels hebben een witte halsvlek; elke Houtduif toont in vlucht een witte band over de vleugel.",
    "sources": [
     "VB_HOUT",
     "VB_5D"
    ]
   },
   "keyMarks": [
    {
     "text": "Witte band over de vleugel, in vlucht in elk kleed zichtbaar.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_HVH",
      "VB_5D",
      "CL_WP"
     ]
    },
    {
     "text": "Witte halsvlek, alleen bij volwassen vogels.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_HOUT",
      "CL_WP"
     ]
    },
    {
     "text": "Lichte iris bij volwassen vogels.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_HVH"
     ]
    },
    {
     "text": "Groot en zwaar gebouwd, met een wat langere staart dan Holenduif.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_HVH"
     ]
    }
   ],
   "caution": {
    "text": "Jonge Houtduiven missen de halsvlek en de lichte iris en lijken dan op Holenduif; let op de witte vleugelband.",
    "sources": [
     "VB_HVH",
     "CL_WP"
    ]
   },
   "critical": [
    {
     "feature": "Witte vleugelband",
     "where": "Bovenvleugel, het best in vlucht of bij gespreide vleugel",
     "this": "Brede witte band over de vleugel, ook bij jonge vogels",
     "other": "Holenduif: geen wit in de vleugel, alleen twee korte zwarte vleugelstrepen",
     "vs": [
      "sp003"
     ],
     "reliability": "doorslaggevend",
     "conditions": "Vleugel gespreid of vogel in vlucht; alle leeftijden",
     "exceptions": "Bij een zittende vogel met gesloten vleugel is de band vaak slechts als witte rand zichtbaar",
     "supporting": "Grootte, langere staart, halsvlek bij volwassenen",
     "sources": [
      "VB_HVH",
      "VB_5D",
      "CL_WP"
     ],
     "diagnostic": "Witte vleugelband in alle leeftijden bij Houtduif, afwezig bij Holenduif: VB en Cornell (vleugelband), RSPB/VB (geen wit bij Holenduif)."
    },
    {
     "feature": "Witte halsvlek",
     "where": "Halszijde, zittende vogel",
     "this": "Volwassen: grote witte vlek aan weerszijden van de hals",
     "other": "Holenduif: geen wit in de hals, wel een groen glanzende vlek",
     "vs": [
      "sp003"
     ],
     "reliability": "doorslaggevend",
     "conditions": "Alleen volwassen vogels, hals goed zichtbaar",
     "exceptions": "Jonge Houtduiven hebben nog geen halsvlek; dan alleen de witte vleugelband gebruiken",
     "supporting": "Lichte iris bij volwassen Houtduif (donker bij Holenduif); witte vleugelband",
     "sources": [
      "VB_HVH",
      "CL_WP",
      "GB_SD"
     ],
     "diagnostic": "Witte halsvlek bij volwassen Houtduif, nooit bij Holenduif: VB, Cornell en British Garden Birds; alleen volwassenen."
    }
   ],
   "similar": [
    {
     "id": "sp003",
     "why": "Holenduif is kleiner en donkerder, zonder wit in hals en vleugel",
     "sources": [
      "VB_HVH"
     ]
    },
    {
     "id": "sp001",
     "why": "Houtduif is groter dan Rotsduif/stadsduif",
     "sources": [
      "CL_WP"
     ]
    },
    {
     "id": "sp004",
     "why": "Bestaande vluchtvergelijking in Birdspot",
     "sources": []
    }
   ],
   "detail": [
    {
     "topic": "bouw",
     "text": "Oogt dikker dan Holenduif, met een wat langere staart.",
     "sources": [
      "VB_HVH"
     ]
    },
    {
     "topic": "leeftijd",
     "text": "Juvenielen zonder witte halsvlek en zonder lichte iris; de witte vleugelband hebben ze al wel.",
     "sources": [
      "VB_HVH",
      "CL_WP"
     ]
    },
    {
     "topic": "geslacht",
     "text": "Mannetje en vrouwtje zijn in de geraadpleegde bronnen niet op kleed te onderscheiden; Birdspot toont daarom geen geslachtsfoto's.",
     "sources": [
      "VB_HOUT"
     ]
    },
    {
     "topic": "vlucht",
     "text": "Baltsvlucht: klapperend omhoog en daarna in een boog glijdend met gespreide vleugels.",
     "sources": [
      "VB_5D"
     ]
    }
   ],
   "voice": [
    {
     "text": "Laag, zwaar koeren in langere, gevarieerde frasen van vijf lettergrepen.",
     "sources": [
      "VB_HOUT",
      "VB_HVH"
     ],
     "kind": "zang"
    }
   ],
   "basis": {
    "size": {
     "text": "Lengte 40–42 cm, spanwijdte 68–77 cm.",
     "sources": [
      "VB_HOUT"
     ]
    }
   },
   "habitat": [
    {
     "text": "Vrijwel overal waar bomen staan: tuinen, parken en bos; zoekt voedsel op akkers.",
     "sources": [
      "VB_HOUT"
     ],
     "kind": "voorkeur"
    }
   ],
   "status": [
    {
     "text": "Talrijke broedvogel en standvogel; in de winter aangevuld met vogels uit Duitsland en Scandinavië.",
     "sources": [
      "VB_HOUT"
     ],
     "kind": "voorkomen"
    },
    {
     "text": "290.000–580.000 broedparen (2018–2020); maximaal 1–2 miljoen vogels in de winter (2012/13–2014/15).",
     "sources": [
      "VB_HOUT"
     ],
     "kind": "aantal"
    },
    {
     "text": "Sinds de jaren zeventig minstens een derde afgenomen, vooral door veranderingen in de landbouw.",
     "sources": [
      "VB_HOUT"
     ],
     "kind": "trend"
    },
    {
     "text": "Beschermd, maar staat op de lijst van bejaagbare soorten (15 oktober–31 januari).",
     "sources": [
      "VB_HOUT"
     ],
     "kind": "bescherming"
    }
   ],
   "life": [
    {
     "text": "Vooral plantaardig: zaden, knoppen, bladeren en achtergebleven graan.",
     "sources": [
      "VB_HOUT"
     ],
     "kind": "voedsel"
    },
    {
     "text": "Kan bijna het hele jaar broeden, tot drie legsels van meestal twee eieren; broedduur 16–17 dagen, jongen 28–29 dagen in het nest.",
     "sources": [
      "VB_HOUT"
     ],
     "kind": "broeden"
    },
    {
     "text": "Grotendeels standvogel; een klein deel trekt naar Frankrijk en Spanje.",
     "sources": [
      "VB_HOUT"
     ],
     "kind": "trek"
    }
   ],
   "discrepancies": [
    {
     "field": "species.size.length",
     "app": "38–43 cm",
     "source": "40–42 cm (Vogelbescherming); 41–45 cm (Cornell)",
     "sources": [
      "VB_HOUT",
      "CL_WP"
     ]
    }
   ],
   "open": [
    "Juveniel- en vluchtvergelijking met Stadsduif nog niet uit een Nederlandse bron uitgewerkt.",
    "Geen gidsfoto van een juveniel (positie ontbreekt)."
   ]
  },
  "sp003": {
   "summary": {
    "text": "Middelgrote, egaal blauwgrijze duif met een groen glanzende halsvlek, donker oog en twee korte zwarte vleugelstrepen. Mist het wit van de Houtduif.",
    "sources": [
     "VB_HOLEN",
     "VB_HVH"
    ]
   },
   "keyMarks": [
    {
     "text": "Geen wit in hals of vleugel.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_HOLEN",
      "VB_HVH",
      "RSPB_SD"
     ]
    },
    {
     "text": "Twee korte zwarte vleugelstrepen en een brede zwarte staartband.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_HOLEN",
      "GB_SD"
     ]
    },
    {
     "text": "Donker oog.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_HVH",
      "GB_SD"
     ]
    },
    {
     "text": "Groen glanzende halsvlek.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_HOLEN",
      "VB_5D"
     ]
    }
   ],
   "caution": {
    "text": "Jonge Houtduiven hebben ook een donker oog en geen halsvlek, maar wel een witte vleugelband. Stadsduiven kunnen sterk op Holenduif lijken.",
    "sources": [
     "VB_HVH",
     "RSPB_SD"
    ]
   },
   "critical": [
    {
     "feature": "Wit in de vleugel",
     "where": "Bovenvleugel, in vlucht of bij gespreide vleugel",
     "this": "Geen wit; zwarte vleugelranden en twee korte zwarte strepen",
     "other": "Houtduif: brede witte vleugelband, ook bij jonge vogels",
     "vs": [
      "sp002"
     ],
     "reliability": "doorslaggevend",
     "conditions": "Vleugel gespreid of vogel in vlucht",
     "exceptions": "Geen genoemd in de geraadpleegde bronnen",
     "supporting": "Kleiner en donkerder, compactere vlucht",
     "sources": [
      "VB_HOLEN",
      "VB_HVH",
      "RSPB_SD"
     ],
     "diagnostic": "Geen wit in de vleugel bij Holenduif tegen witte band bij Houtduif: VB (twee pagina's) en RSPB onafhankelijk."
    },
    {
     "feature": "Stuit",
     "where": "Onderrug, het best in vlucht van boven",
     "this": "Niet licht; even grijs als de rug",
     "other": "Rotsduif en veel stadsduiven: lichte stuit",
     "vs": [
      "sp001"
     ],
     "reliability": "ondersteunend",
     "conditions": "Vogel van boven of in vlucht",
     "exceptions": "Stadsduiven zijn sterk variabel; niet elke stadsduif heeft een lichte stuit",
     "supporting": "Zwarte vleugelstrepen bij Holenduif kort en minder duidelijk dan bij Rotsduif",
     "sources": [
      "RSPB_SD",
      "GB_SD"
     ]
    }
   ],
   "similar": [
    {
     "id": "sp002",
     "why": "Houtduif is groter, heeft een witte vleugelband en bij volwassenen een witte halsvlek",
     "sources": [
      "VB_HVH"
     ]
    },
    {
     "id": "sp001",
     "why": "Ongeveer even groot; stadsduif vaak met lichte stuit en langere vleugelstrepen",
     "sources": [
      "VB_HOLEN",
      "RSPB_SD",
      "GB_SD"
     ]
    },
    {
     "id": "sp004",
     "why": "Bestaande vluchtvergelijking in Birdspot",
     "sources": []
    }
   ],
   "detail": [
    {
     "topic": "kleed",
     "text": "Donkerder blauwgrijs dan Houtduif, met roze getinte borst.",
     "sources": [
      "VB_HVH",
      "GB_SD"
     ]
    },
    {
     "topic": "geslacht",
     "text": "Geslachten worden in de geraadpleegde bronnen niet op kleed onderscheiden; Birdspot toont geen geslachtsfoto's.",
     "sources": [
      "VB_HOLEN"
     ]
    },
    {
     "topic": "vlucht",
     "text": "Vliegt compacter en directer dan Houtduif; baltsvlucht in cirkels met vleugels in een V.",
     "sources": [
      "VB_HOLEN",
      "VB_5D"
     ]
    }
   ],
   "voice": [
    {
     "text": "Eentonige reeks tweelettergrepige koerroepen, wat lijkend op stadsduif.",
     "sources": [
      "VB_HVH",
      "VB_5D"
     ],
     "kind": "zang"
    }
   ],
   "basis": {
    "size": {
     "text": "Lengte 28–32 cm, spanwijdte 60–66 cm; ongeveer zo groot als een stadsduif.",
     "sources": [
      "VB_HOLEN"
     ]
    }
   },
   "habitat": [
    {
     "text": "Kleinschalig boerenland met bosjes, bosranden, oud loofbos en parken; zoekt voedsel op de grond, vaker op grasland dan Houtduif.",
     "sources": [
      "VB_HOLEN"
     ],
     "kind": "voorkeur"
    },
    {
     "text": "Grootste aantallen in Noord-Brabant, Gelderland, Overijssel en Drenthe.",
     "sources": [
      "VB_HOLEN"
     ],
     "kind": "nederland"
    }
   ],
   "status": [
    {
     "text": "Algemene broedvogel, het hele jaar aanwezig; in de winter vogels uit het noorden.",
     "sources": [
      "VB_HOLEN"
     ],
     "kind": "voorkomen"
    },
    {
     "text": "54.000–67.000 broedparen (2018–2020); maximaal 100.000–200.000 vogels in de winter (2012/13–2014/15).",
     "sources": [
      "VB_HOLEN"
     ],
     "kind": "aantal"
    },
    {
     "text": "Sinds de jaren zeventig sterk toegenomen na het verdwijnen van giftige zaaizaadontsmetting; de groei vlakt af.",
     "sources": [
      "VB_HOLEN"
     ],
     "kind": "trend"
    }
   ],
   "life": [
    {
     "text": "Zaden en andere plantendelen, op de grond, vaak in groepjes.",
     "sources": [
      "VB_HOLEN"
     ],
     "kind": "voedsel"
    },
    {
     "text": "Twee tot drie legsels van meestal twee eieren; broedduur 16–17 dagen, jongen ongeveer 24 dagen in het nest.",
     "sources": [
      "VB_HOLEN"
     ],
     "kind": "broeden"
    },
    {
     "text": "Nestelt in holtes: boomholtes, nestkasten (ook uilenkasten), oude gebouwen, soms konijnenholen.",
     "sources": [
      "VB_HOLEN"
     ],
     "kind": "nest"
    },
    {
     "text": "Grotendeels standvogel; zwerft in de winter in groepen.",
     "sources": [
      "VB_HOLEN"
     ],
     "kind": "trek"
    }
   ],
   "discrepancies": [],
   "open": [
    "Geen goede vluchtfoto: de vorige 'vluchtfoto' toonde een opvliegende vogel en is uit de vluchtrol gehaald (positie ontbreekt).",
    "Geen gidsfoto van een juveniel.",
    "Kleedvariatie van stadsduiven maakt de stuit niet doorslaggevend."
   ]
  },
  "sp004": {
   "summary": {
    "text": "Slanke, licht beigegrijze duif met een smalle zwarte halsband en donkerrood oog. Leeft dicht bij mensen.",
    "sources": [
     "VB_TT"
    ]
   },
   "keyMarks": [
    {
     "text": "Zwarte halsband met witte rand bij volwassen vogels.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_TT",
      "BZ_CD"
     ]
    },
    {
     "text": "Egaal licht beigegrijs, zonder geschubde rug.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_TT",
      "VB_ZT"
     ]
    },
    {
     "text": "Donkerrode iris bij volwassenen, bruin bij juvenielen.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_TT",
      "BZ_CD"
     ]
    },
    {
     "text": "Driedelig koeren, makkelijk na te fluiten.",
     "reliability": "ondersteunend",
     "sources": [
      "VB_TT",
      "VB_5D"
     ]
    }
   ],
   "caution": {
    "text": "Jonge vogels hebben geen of een vage halsband en een bruin oog; let dan op de egale, ongeschubde bovendelen.",
    "sources": [
     "BZ_CD",
     "VB_ZT"
    ]
   },
   "critical": [
    {
     "feature": "Hals en bovendelen",
     "where": "Halszijde en vleugeldekveren, zittende vogel",
     "this": "Eén smalle zwarte halsband; bovendelen egaal beigegrijs",
     "other": "Zomertortel: zwart-wit gestreepte halsvlek en roodbruine, geschubde bovendelen; kleiner en slanker",
     "vs": [
      "sp197"
     ],
     "reliability": "doorslaggevend",
     "conditions": "Volwassen vogels, hals en rug goed zichtbaar",
     "exceptions": "Juvenielen van beide soorten missen de halstekening (Turkse Tortel geen of vage halsband, Zomertortel geen gestreepte vlek); gebruik dan de bovendelen: egaal beigegrijs tegen roodbruin geschubd",
     "supporting": "Grootte (Zomertortel is de kleinste duif), geluid, leefgebied",
     "sources": [
      "VB_TT",
      "VB_ZT",
      "BZ_CD",
      "EB_ETD",
      "BS_TD"
     ],
     "diagnostic": "Volwassen: zwarte halsband (VB, Blasco-Zumeta) tegen gestreepte halsvlek met geschubde roodbruine rug (VB, eBird, birdspot.co.uk); juvenielen alleen via de bovendelen."
    },
    {
     "feature": "Staart in vlucht",
     "where": "Staart van onderen of bij landen",
     "this": "Lichte buitenste staartpennen; staart grijs met witte randen",
     "other": "Zomertortel: wigvormige staart met witte eindband",
     "vs": [
      "sp197"
     ],
     "reliability": "ondersteunend",
     "conditions": "Vogel in vlucht of landend",
     "exceptions": "Uitgewerkte vergelijking van beide staartpatronen ontbreekt in één bron",
     "supporting": "Lichte vleugelvelden in vlucht",
     "sources": [
      "VB_TT",
      "VB_ZT",
      "BZ_CD"
     ]
    }
   ],
   "similar": [
    {
     "id": "sp197",
     "why": "Zomertortel is kleiner, met gestreepte halsvlek en geschubde roodbruine rug",
     "sources": [
      "VB_TT",
      "VB_ZT",
      "EB_ETD"
     ]
    },
    {
     "id": "sp002",
     "why": "Door de bron genoemd; Houtduif is veel groter en grijzer",
     "sources": [
      "VB_TT"
     ]
    }
   ],
   "detail": [
    {
     "topic": "leeftijd",
     "text": "Juveniel: geen of vage halsband en bruine iris; volwassen: scherpe zwarte halsband en robijnrode iris.",
     "sources": [
      "BZ_CD"
     ]
    },
    {
     "topic": "geslacht",
     "text": "Kleine verschillen in kop- en nekkleur, maar veel vogels zijn op kleed niet te sexen; Birdspot toont geen geslachtsfoto's.",
     "sources": [
      "BZ_CD"
     ]
    },
    {
     "topic": "gedrag",
     "text": "Meestal in paren; baltsvlucht steil omhoog en dan in een grote boog naar beneden.",
     "sources": [
      "VB_TT",
      "VB_5D"
     ]
    }
   ],
   "voice": [
    {
     "text": "Driedelig koeren met zuivere, fagotachtige tonen; vrouwtje hoger en zachter.",
     "sources": [
      "VB_TT"
     ],
     "kind": "zang"
    },
    {
     "text": "Bij onrust een rauwe, schorre alarmroep.",
     "sources": [
      "VB_TT"
     ],
     "kind": "alarm"
    }
   ],
   "basis": {
    "size": {
     "text": "Lengte 31–33 cm.",
     "sources": [
      "VB_TT"
     ]
    }
   },
   "habitat": [
    {
     "text": "Tuinen, parken, erven en stadscentra; ook dorpen met boerderijen.",
     "sources": [
      "VB_TT"
     ],
     "kind": "voorkeur"
    }
   ],
   "status": [
    {
     "text": "Standvogel; sinds het eerste broedgeval in 1950 over heel Nederland verspreid.",
     "sources": [
      "VB_TT"
     ],
     "kind": "voorkomen"
    },
    {
     "text": "53.000–68.000 broedparen (2018–2020); maximaal 100.000–200.000 vogels in de winter (2012/13–2014/15).",
     "sources": [
      "VB_TT"
     ],
     "kind": "aantal"
    },
    {
     "text": "Landelijk stabiel; toename in steden in Laag-Nederland, afname in Hoog-Nederland.",
     "sources": [
      "VB_TT"
     ],
     "kind": "trend"
    }
   ],
   "life": [
    {
     "text": "Graan, onkruidzaden en fruit, soms insecten; bezoekt voederplaatsen.",
     "sources": [
      "VB_TT"
     ],
     "kind": "voedsel"
    },
    {
     "text": "Broedt van half februari tot november, 2–5 legsels per jaar van meestal twee eieren.",
     "sources": [
      "VB_TT"
     ],
     "kind": "broeden"
    },
    {
     "text": "Dun takjesnest in boom, struik of tegen een gebouw; valt makkelijk uit elkaar.",
     "sources": [
      "VB_TT"
     ],
     "kind": "nest"
    }
   ],
   "discrepancies": [],
   "open": [
    "Onderscheid met Lachduif (ontsnapte vogels) nog uit een bron uitwerken.",
    "Spanwijdte en gewicht niet in de geraadpleegde Nederlandse bron.",
    "Geen gidsfoto van een juveniel; hoofdfoto toont de vogel vrij klein in beeld."
   ]
  }
 }
};
export const KNOWLEDGE_SOURCES = Object.freeze(DATA.sources);
export const KNOWLEDGE = Object.freeze(DATA.profiles);
