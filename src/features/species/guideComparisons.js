/** Gepaarde veldkenmerken, nagekeken op de genoemde Vogelbescherming-soortkaarten. */
const vogelgids = 'https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/';

export const GUIDE_COMPARISONS = [
  {
    label: 'Fitis en Tjiftjaf · rustbeeld en zang',
    birds: [
      {id: 'sp057', source: 'fitis', marks: 'Fitis met melodieus aflopend zangriedeltje, doorgaans langere vleugelpunt en vaak lichtbruine poten.'},
      {id: 'sp056', source: 'tjiftjaf', marks: 'Tjiftjaf met herhaald tjif-tjaf, doorgaans kortere vleugelpunt en vaak donkere poten.'},
    ],
    rows: [
      {label: 'Zang', values: ['Melodieus en duidelijk aflopend riedeltje', 'Steeds herhaald tjif-tjaf']},
      {label: 'Vleugelpunt', values: ['Doorgaans langer voorbij de gevouwen vleugelveren', 'Doorgaans korter; verschil vraagt goed zijaanzicht']},
      {label: 'Poten', values: ['Vaak bruinroze of licht', 'Vaak donker; geen sluitend kenmerk']},
    ],
    tip: 'Deze rustfoto’s zijn voor herkennen, niet voor het vergelijken van lichaamsgrootte. Zang is hier veel betrouwbaarder dan pootkleur of één stilstaande foto.',
  },
  {
    label: 'Fitis en Fluiter · in rust',
    birds: [
      {id: 'sp057', source: 'fitis', marks: 'Fitis: lichtbruine tot olijfgroene vogel met geelwitte keel en borst, een zachte aflopende zang.'},
      {id: 'sp058', source: 'fluiter', marks: 'Fluiter: duidelijke citroengele keel, bovenborst en wenkbrauw boven een contrasterend helderwitte buik.'},
    ],
    rows: [
      {label: 'Onderzijde', values: ['Geelwit tot bleek zonder sterk contrast', 'Citroengele keel en bovenborst, helderwitte buik']},
      {label: 'Kop', values: ['Lichte wenkbrauw en bruinige wangen', 'Opvallend citroengeel gezicht en wenkbrauw']},
      {label: 'Zang', values: ['Melodieus dalend riedeltje', 'Versnellend geratel als een rollend muntje, ook fluittonen']},
    ],
    tip: 'Gebruik vooral kleurverdeling én zang. De achtergrond, foto-uitsnede en belichting verschillen; concludeer niet alleen op basis van hoe groen één foto oogt.',
  },
  {
    label: 'Tjiftjaf en Fluiter · in rust',
    birds: [
      {id: 'sp056', source: 'tjiftjaf', marks: 'Tjiftjaf: overwegend grijsgroen, relatief weinig kleurcontrast en herhaald tjif-tjaf.'},
      {id: 'sp058', source: 'fluiter', marks: 'Fluiter: gele keel en bovenborst, opvallend witte buik en ratelende zang.'},
    ],
    rows: [
      {label: 'Zang', values: ['Gelijkmatig herhaald tjif-tjaf', 'Versnellende ratel en afzonderlijke fluittonen']},
      {label: 'Borst en buik', values: ['Vaalgrijzig tot geelachtig, subtiele overgang', 'Citroengele bovenborst naast helderwitte buik']},
      {label: 'Kop en bouw', values: ['Minder uitgesproken wenkbrauw en relatief korte vleugelpunt', 'Gele wenkbrauw en gemiddeld langgerektere bouw']},
    ],
    tip: 'Een zingende vogel biedt het meeste houvast. Bij een stille vogel helpen kleurverdeling en vleugelprojectie alleen samen met het volledige beeld.',
  },
  {
    "birds": [
      {
        "id": "sp031",
        "source": "matkop",
        "marks": "Vaak een licht vleugelveld en een doorgaans geheel donkere bovensnavelbasis. Roep nasaal dèh-dèh; zang met langgerekte heldere tjii-tonen."
      },
      {
        "id": "sp032",
        "source": "glanskop",
        "marks": "Lichte vlek aan de bovensnavelbasis; vleugel meestal egaler. Roep explosief pstie-toe; zang korter en metaalachtig tiu-tiu."
      }
    ],
    rows: [
      {label: 'Bovensnavelbasis', values: ['Meestal geheel donker', 'Vaak een lichte vlek aan de basis']},
      {label: 'Gevouwen vleugel', values: ['Vaak een licht vleugelveld', 'Meestal vrij egaal']},
      {label: 'Contactroep', values: ['Nasaal en langgerekt', 'Kort, explosief en dalend']},
    ],
    "tip": "Luister eerst naar een duidelijke roepreeks. Bekijk daarna de bovensnavelbasis van opzij bij egaal licht. Gebruik het vleugelveld als extra aanwijzing."
  },
  {
    label: 'Matkop en Glanskop · jonge vogels',
    birds: [
      {id: 'sp031', source: 'matkop', plumage: 'juv', marks: 'Op deze foto een doffe kap en lichte snavelhoeken.'},
      {id: 'sp032', source: 'glanskop', plumage: 'juv', marks: 'Op deze foto een doffe kap, lichte wang en lichte snavelhoeken.'},
    ],
    rows: [
      {label: 'Kap', values: ['Dof bij jonge vogels.', 'Ook dof bij jonge vogels.']},
      {label: 'Snavelhoeken', values: ['De lichte hoeken vallen op in dit beeld.', 'De lichte hoek is subtieler zichtbaar door de schaduw.']},
    ],
    tip: 'De doffe kap en lichte snavelhoeken kunnen bij beide soorten voorkomen. Luister bij twijfel naar de roep of laat de soort open.',
  },
  {
    label: 'Zwarte Mees en Koolmees · nek en vleugel',
    birds: [
      {id: 'sp174', source: 'zwarte-mees', marks: 'Klein, met een lichte nekvlek en twee lichte vleugelbandjes.'},
      {id: 'sp029', source: 'koolmees', plumage: 'adult_m', marks: 'Gele onderzijde met donkere lengtestreep en één lichte vleugelband.'},
    ],
    rows: [
      {label: 'Nek', values: ['Opvallende lichte nekvlek', 'Geen vergelijkbare witte nekvlek']},
      {label: 'Vleugel', values: ['Twee lichte bandjes', 'Eén lichte band']},
      {label: 'Onderzijde', values: ['Bleek, zonder doorlopende donkere middenstreep', 'Geel met donkere middenstreep']},
    ],
    tip: 'Bekijk de nek schuin van achteren. Op een frontale foto is de nekvlek soms verborgen.',
  },
  {
    label: 'Staartmees en Zwarte Mees · staart en kop',
    birds: [
      {id: 'sp034', source: 'staartmees', marks: 'Zeer lange staart en lichte kop met meestal donkere zijkruinstrepen.'},
      {id: 'sp174', source: 'zwarte-mees', marks: 'Kortere staart, zwarte kop en een duidelijke lichte nekvlek.'},
    ],
    rows: [
      {label: 'Staart', values: ['Langer dan het lichaam', 'Duidelijk korter']},
      {label: 'Kop', values: ['Overwegend licht, vaak met donkere zijkruinstrepen', 'Zwarte kap, lichte wang en lichte nekvlek']},
    ],
    tip: 'Kijk in zijaanzicht naar de hele staart. Van voren lijkt die veel korter.',
  },
  {
    label: 'Ringmus en Huismus · kruin en wang',
    birds: [
      {id: 'sp043', source: 'huismus', plumage: 'adult_m', marks: 'Het mannetje heeft een grijze kruin en een donkere bef. Het vrouwtje is bruiner en heeft een lichte wenkbrauw.'},
      {id: 'sp044', source: 'ringmus', marks: 'Kastanjebruine kruin, een donkere wangvlek en een lichte nekrand bij beide geslachten.'},
    ],
    rows: [
      {label: 'Kruin', values: ['Grijs bij mannetje, bruin bij vrouwtje', 'Kastanjebruin bij volwassen vogels']},
      {label: 'Wang', values: ['Zonder losse donkere wangvlek', 'Donkere vlek op lichte wang']},
    ],
    tip: 'Kijk bij een jonge Ringmus ook naar kruin en nekrand. De wangvlek kan dan veel minder opvallen.',
  },
  {
    birds: [
      {id: 'sp035', source: 'vink', plumage: 'adult_f', marks: 'Twee witte vleugelstrepen vallen op, ook bij een vrouwtje.'},
      {id: 'sp043', source: 'huismus', plumage: 'adult_f', marks: 'Lichte wenkbrauw en bruin gestreepte rug.'},
    ],
    tip: 'Vergelijk de vrouwtjes. Bekijk bij twijfel de gevouwen vleugel.',
  },
  {
    "label": "Grote of middelste bonte specht?",
    "birds": [
      {
        "id": "sp016",
        "source": "grote-bonte-specht",
        "marks": "Grote: zwarte begrenzing onder rode jeugdkruin en duidelijke donkere tekening langs de kop; rode onderstaart.",
        "plumage": "juv"
      },
      {
        "id": "sp020",
        "source": "middelste-bonte-specht",
        "marks": "Middelste: lichte kop met oog vrij in wit, kruin zonder zwarte onderrand, gestreepte flanken en roze onderstaart."
      }
    ],
    "tip": "Een rode kruin alleen is onvoldoende: ook jonge Grote Bonte Spechten hebben die."
  },
  {
    label: 'Kleine en Grote Zilverreiger · buiten broedkleed',
    birds: [
      {id: 'sp082', source: 'kleine-zilverreiger', plumage: 'winter', photo: '/assets/species/plumage/sp082-winter.webp', marks: 'Kleine, slanke reiger met fijne donkere snavel en gele tenen.'},
      {id: 'sp083', source: 'grote-zilverreiger', plumage: 'winter', photo: '/assets/species/sp083.webp', marks: 'Veel groter, met een langere hals en meestal een gele snavel buiten de broedtijd.'},
    ],
    rows: [
      {label: 'Snavel', values: ['Fijn en donker.', 'Lang en op deze foto geel.']},
      {label: 'Tenen', values: ['Geel aan donkere poten.', 'Op deze foto niet zichtbaar in het water.']},
      {label: 'Bouw', values: ['Kleiner met een relatief korte hals.', 'Groter met een langere hals.']},
    ],
    tip: 'Kijk naar de tenen als ze zichtbaar zijn. Gebruik daarnaast de verhouding van hals tot lichaam. De foto’s zijn niet op dezelfde schaal.',
  },
  {
    label: 'Kleine en Grote Zilverreiger · broedkleed',
    birds: [
      {id: 'sp082', source: 'kleine-zilverreiger', plumage: 'breeding', photo: '/assets/species/plumage/sp082-breeding.webp', marks: 'Twee lange sierveren achter de kop, met een slanke donkere snavel.'},
      {id: 'sp083', source: 'grote-zilverreiger', plumage: 'breeding', photo: '/assets/species/plumage/sp083-breeding.webp', marks: 'Lange hals en rugsierveren. De snavel kan tijdelijk donker worden.'},
    ],
    rows: [
      {label: 'Kop', values: ['Lange, smalle sierveren achter de kop.', 'Zonder de twee lange nekveren van de Kleine Zilverreiger.']},
      {label: 'Snavel', values: ['Smalle, donkere snavel.', 'Langer. Kan in de broedtijd tijdelijk donker worden.']},
      {label: 'Hals', values: ['Relatief kort.', 'Lang en slank.']},
    ],
    tip: 'Een donkere snavel komt in dit kleed bij beide voor. Let ook op de nekveren en halslengte.',
  },
  {
    label: 'Kleine en Grote Zilverreiger · in vlucht',
    flight: true,
    birds: [
      {id: 'sp082', source: 'kleine-zilverreiger', photo: '/assets/species/sp082.webp', marks: 'Gele tenen steken af tegen de donkere poten. Fijne donkere snavel.'},
      {id: 'sp083', source: 'grote-zilverreiger', photo: '/assets/species/plumage/sp083-flight.webp', marks: 'Langere, op deze foto gele snavel, met lange poten achter het lichaam.'},
    ],
    rows: [
      {label: 'Voeten', values: ['Gele tenen steken duidelijk af.', 'Op deze foto geen opvallend gele tenen.']},
      {label: 'Snavel', values: ['Fijn en donker.', 'Lang en op deze foto geel.']},
      {label: 'Bouw', values: ['Kleinere witte reiger.', 'Grotere witte reiger met lang uitstekende poten.']},
    ],
    tip: 'Begin bij de tenen en controleer daarna de snavel. Gebruik formaat alleen als je een betrouwbare vergelijking hebt.',
  },
  {
    label: 'Kleine Zilverreiger en Koereiger · buiten broedkleed',
    birds: [
      {id: 'sp082', source: 'kleine-zilverreiger', plumage: 'winter', marks: 'Langere, dunnere donkere snavel en langere poten. De tenen zijn meestal geel.'},
      {id: 'sp245', source: 'koereiger', plumage: 'winter', marks: 'Compact, met kortere poten en een korte, stevige gele snavel.'},
    ],
    tip: 'Vergelijk de bouw en snavelvorm. Vee in de buurt kan een extra aanwijzing zijn voor Koereiger.',
  },
  {
    label: 'Kleine Zilverreiger en Koereiger · jonge vogels',
    birds: [
      {id: 'sp082', source: 'kleine-zilverreiger', plumage: 'juv', marks: 'Slanker en langer gepoot, met een langere, dunnere snavel. Tenen kunnen dof geelgroen zijn.'},
      {id: 'sp245', source: 'koereiger', plumage: 'juv', marks: 'Compact, met korte poten en een kortere, dikkere snavel. De snavel is bij jonge vogels vaak donker.'},
    ],
    tip: 'Vergelijk de verhoudingen van de hele vogel. De snavel van jonge vogels kan bij beide donker zijn.',
  },
  {
    label: 'Grote Zilverreiger en Koereiger · buiten broedkleed',
    birds: [
      {id: 'sp083', source: 'grote-zilverreiger', plumage: 'winter', marks: 'Groot met een lange, dunne hals, een lange dolkvormige snavel en lange poten.'},
      {id: 'sp245', source: 'koereiger', plumage: 'winter', marks: 'Veel kleiner, met een korte hals, korte poten en een korte, stevige snavel.'},
    ],
    tip: 'Bij beide kan de snavel geel zijn. Vergelijk vooral de lengte van hals, snavel en poten.',
  },
  {
    label: 'Kokmeeuw en Zwartkopmeeuw · broedkleed',
    birds: [
      {id: 'sp097', source: 'kokmeeuw', plumage: 'breeding', marks: 'Volwassen vogel heeft in broedkleed een chocoladebruine kap. In vlucht is de voorrand van de vleugel wit.'},
      {id: 'sp225', source: 'zwartkopmeeuw', plumage: 'breeding', marks: 'Volwassen vogel heeft een zwarte broedkap, een dikkere rode snavel en witte slagpennen.'},
    ],
    tip: 'Vergelijk volwassen vogels. Jonge Zwartkopmeeuwen kunnen donkere vleugelpunten hebben.',
  },
  {
    birds: [
      {id: 'sp089', source: 'wilde-eend', plumage: 'adult_f', marks: 'Bruin vrouwtje met blauw-paarse vleugelspiegel met lichte randen.'},
      {id: 'sp129', source: 'krakeend', plumage: 'adult_f', marks: 'Bruin vrouwtje met een witte vleugelspiegel en een donkere snavel met oranje zijkanten.'},
    ],
    tip: 'Vergelijk de vrouwtjes. De spiegel is het duidelijkst in vlucht of bij een gestrekte vleugel.',
  },
  {
    label: 'Bruine en Blauwe · volwassen mannetjes',
    birds: [
      {id: 'sp173', source: 'bruine-kiekendief', plumage: 'adult_m', marks: 'Bruin lijf met grijze vleugelvelden en grijze staart. De vleugelpunten zijn zwart.'},
      {id: 'sp249', source: 'blauwe-kiekendief', plumage: 'adult_m', marks: 'Licht blauwgrijs lijf, witte buik en witte stuit. De vleugelpunten zijn zwart.'},
    ],
    rows: [
      {label: 'Lijf', values: ['Bruin', 'Lichtblauwgrijs, witte buik']},
      {label: 'Stuit / staart', values: ['Grijze staart, geen witte stuit', 'Witte stuit']},
      {label: 'Vleugelpunt', values: ['Zwart', 'Zwart']},
    ],
    tip: 'Begin bij de kleur van het lijf. Kijk bij een draai in de vlucht ook naar de stuit, de plek net boven de staart.',
  },
  {
    label: 'Bruine en Blauwe · volwassen vrouwtjes',
    birds: [
      {id: 'sp173', source: 'bruine-kiekendief', plumage: 'adult_f', marks: 'Donkerbruin met een lichte kruin en keel, vaak ook een lichte vleugelvoorrand. Geen brede witte stuit.'},
      {id: 'sp249', source: 'blauwe-kiekendief', plumage: 'adult_f', marks: 'Bruin met brede witte stuit. Van onderen vallen donkere banden op de vleugels en staart op.'},
    ],
    rows: [
      {label: 'Kop', values: ['Lichte kruin en keel', 'Geen opvallend lichte kruin']},
      {label: 'Stuit', values: ['Geen brede witte stuit', 'Brede witte stuit']},
      {label: 'Ondervleugel', values: ['Geen opvallende banden benoemd', 'Donkere banden']},
    ],
    tip: 'Van onderen zijn de vleugelbanden goed te vergelijken. De witte stuit zie je van boven of wanneer de vogel wegdraait.',
  },
  {
    label: 'Bruine en Blauwe · jonge vogels',
    birds: [
      {id: 'sp173', source: 'bruine-kiekendief', plumage: 'juv', marks: 'Meestal vrijwel egaal donkerbruin, met een lichte kruin. Mist een brede witte stuit.'},
      {id: 'sp249', source: 'blauwe-kiekendief', plumage: 'juv', marks: 'Bruin met witte stuit. De staart en ondervleugels zijn gebandeerd.'},
    ],
    rows: [
      {label: 'Kleed', values: ['Egaal donkerbruin, lichte kruin', 'Bruin']},
      {label: 'Stuit', values: ['Geen brede witte stuit', 'Witte stuit']},
      {label: 'Staart / ondervleugel', values: ['Ongebandeerd', 'Gebandeerd']},
    ],
    tip: 'Beide zijn bruin. Gebruik de stuit samen met de bandering. Bij een kort silhouet kan de soort onzeker blijven.',
  },
  {
    label: 'Blauwe en Grauwe · volwassen vrouwtjes',
    birds: [
      {id: 'sp249', source: 'blauwe-kiekendief', plumage: 'adult_f', marks: 'Forsere vleugels. Bij goed gespreide vleugelpunten zijn doorgaans vijf vingertoppen zichtbaar.'},
      {id: 'sp251', source: 'grauwe-kiekendief', plumage: 'adult_f', marks: 'Slanker, met smallere vleugels. Doorgaans vier zichtbare vingertoppen bij goed gespreide vleugels.'},
    ],
    rows: [
      {label: 'Vleugelvorm', values: ['Relatief breed.', 'Slanker en puntiger.']},
      {label: 'Vingertoppen', values: ['Meestal vijf bij een goed gespreide vleugelpunt.', 'Meestal vier bij een goed gespreide vleugelpunt.']},
    ],
    tip: 'Gebruik vleugelvorm én vlucht. Het aantal zichtbare vingers kan wisselen door houding, rui en kijkhoek.',
  },
  {
    label: 'Blauwe en Steppe · volwassen mannetjes',
    flight: true,
    birds: [
      {id: 'sp249', source: 'blauwe-kiekendief', plumage: 'adult_m', marks: 'Bredere vleugel, met een relatief groot zwart uiteinde en een donkere achterrand van de bovenvleugel.'},
      {id: 'sp250', source: 'steppekiekendief', plumage: 'adult_m', marks: 'Bleker met smallere vleugels en een kleinere, wigvormige zwarte tekening op de handpennen.'},
    ],
    rows: [
      {label: 'Vleugelpunt', values: ['Breder zwart veld.', 'Smalle zwarte wig.']},
      {label: 'Bovenvleugel', values: ['Relatief breed met donkere achterrand.', 'Slank en opvallend bleek.']},
    ],
    tip: 'Vergelijk de vorm van het zwart aan de vleugelpunt en de breedte van de vleugel samen.',
  },
  {
    label: 'Blauwe en Steppe · volwassen vrouwtjes',
    flight: true,
    birds: [
      {id: 'sp249', source: 'blauwe-kiekendief', plumage: 'adult_f', marks: 'Relatief brede vleugels, met een gebandeerde ondervleugel en staart.'},
      {id: 'sp250', source: 'steppekiekendief', plumage: 'adult_f', marks: 'Slankere vleugels. Let op de lichte halsring, donkere oorstreek en tekening van de ondervleugel.'},
    ],
    tip: 'Bekijk de combinatie van vleugelvorm, koptekening en ondervleugel. Een witte stuit komt bij beide voor.',
  },
  {
    label: 'Blauwe en Steppe · jonge vogels',
    flight: true,
    birds: [
      {id: 'sp249', source: 'blauwe-kiekendief', plumage: 'juv', marks: 'Bruin met lengtestrepen op de onderzijde en banden op staart en ondervleugels.'},
      {id: 'sp250', source: 'steppekiekendief', plumage: 'juv', marks: 'Vaak egaal roestoranje onder. Let op de lichte halsring en de donkere vlek ernaast.'},
    ],
    tip: 'Combineer borsttekening met kop en ondervleugel. Laat de soort open als de foto te weinig details toont.',
  },
  {
    label: 'Grauwe en Steppe · volwassen mannetjes',
    flight: true,
    birds: [
      {id: 'sp251', source: 'grauwe-kiekendief', plumage: 'adult_m', marks: 'Donkerder grijs, met zwarte vleugelpunten en donkere banden over de armvleugel.'},
      {id: 'sp250', source: 'steppekiekendief', plumage: 'adult_m', marks: 'Bleker lijf en een smalle zwarte wig aan het uiteinde van de vleugel.'},
    ],
    rows: [
      {label: 'Armvleugel', values: ['Donkere band over de bovenvleugel.', 'Geen vergelijkbare donkere band bij het volwassen mannetje.']},
      {label: 'Vleugelpunt', values: ['Zwart aan de top.', 'Smalle zwarte wig aan de top.']},
    ],
    tip: 'Bekijk bij de Grauwe de donkere band over de armvleugel en bij de Steppe het kleinere zwarte veld aan de punt. De foto’s tonen verschillende kijkhoeken.',
  },
  {
    label: 'Grauwe en Steppe · volwassen vrouwtjes',
    birds: [
      {id: 'sp251', source: 'grauwe-kiekendief', plumage: 'adult_f', marks: 'Meestal een grotere lichte zone rond het oog en duidelijkere lichte banden op de onderzijde van de armvleugel.'},
      {id: 'sp250', source: 'steppekiekendief', plumage: 'adult_f', marks: 'Let op de lichte halsring, donkere oorstreek en smalle, vaak minder scherp begrensde banden op de ondervleugel.'},
    ],
    rows: [
      {label: 'Kop', values: ['Vaak grotere lichte zone rond het oog.', 'Vaak lichte halsring en donkere oorstreek.']},
      {label: 'Ondervleugel', values: ['De banden over de armvleugel zijn vaak duidelijker.', 'De armvleugel oogt vaak donkerder en de lichte banden smaller.']},
    ],
    tip: 'Dit is een lastige vergelijking. Combineer koptekening en ondervleugel, liefst op meerdere scherpe vluchtfoto’s.',
  },
  {
    label: 'Grauwe en Steppe · jonge vogels',
    birds: [
      {id: 'sp251', source: 'grauwe-kiekendief', plumage: 'juv', marks: 'Vaak egaal roestoranje onder. De donkere achterrand van de handpennen is van onderen meestal scherper begrensd.'},
      {id: 'sp250', source: 'steppekiekendief', plumage: 'juv', marks: 'Eveneens roestoranje onder. Lichte halsring met donkere halsvlek en meestal minder scherp begrensde donkere achterrand op de handpennen.'},
    ],
    tip: 'Roestoranje onderzijde komt bij beide voor. Beoordeel kop én uitgespreide ondervleugel. Laat de determinatie open als de details ontbreken.',
  },
  {
    label: 'Sperwer en Havik · volwassen mannetjes',
    birds: [
      {id: 'sp006', source: 'sperwer', plumage: 'adult_m', marks: 'Rank, met roestkleurige wangen en flanken en een blauwgrijze rug.'},
      {id: 'sp007', source: 'havik', plumage: 'adult_m', marks: 'Forse borst, duidelijke lichte wenkbrauw en fijne donkere banden op de lichte onderzijde.'},
    ],
    tip: 'De roestige wangen en onderzijde van een mannetje Sperwer vallen vooral op bij goed licht.',
  },
  {
    label: 'Sperwer en Havik · volwassen vrouwtjes',
    birds: [
      {id: 'sp006', source: 'sperwer', plumage: 'adult_f', marks: 'Rankere bouw, dunnere poten en een lange staart met hoekige uiteinden.'},
      {id: 'sp007', source: 'havik', plumage: 'adult_f', marks: 'Zware borst, stevige poten en een ver uitstekende kop. De staartpunt is in vlucht doorgaans ronder.'},
    ],
    tip: 'Beide zijn dwarsgebandeerd. Gebruik bouw en staartvorm samen, want grootte is op afstand lastig te schatten.',
  },
  {
    label: 'Sperwer en Havik · jonge vogels',
    birds: [
      {id: 'sp006', source: 'sperwer', plumage: 'juv', marks: 'Donkere tekening loopt in dwarsbanden over de lichte borst en buik. De banden kunnen hoekig of V-vormig zijn.'},
      {id: 'sp007', source: 'havik', plumage: 'juv', marks: 'Donkere lengtestrepen lopen van boven naar beneden over de lichte borst en buik.'},
    ],
    tip: 'Let bij een jonge vogel op de richting van de tekening op de borst. Beide soorten zijn bruin van boven.',
  },
  {
    label: 'Buizerd en Ruigpootbuizerd · volwassen in vlucht',
    flight: true,
    birds: [
      {id: 'sp005', source: 'buizerd', plumage: 'adult_m', marks: 'De relatief korte, bruingrijze staart heeft doorgaans meerdere smalle dwarsbanden. Ook lichte Buizerds kunnen donkere polsvlekken hebben.'},
      {id: 'sp253', source: 'Ruigpootbuizerd', plumage: 'adult_f', marks: 'Een brede witte staartbasis met donkere bandering, samen met grote donkere polsvlekken. Dit vrouwtje heeft ook een donker buikschild.'},
    ],
    tip: 'Bekijk eerst de gespreide staart en controleer vervolgens de ondervleugels en buik. Beide soorten kunnen bidden.',
  },
  {
    label: 'Buizerd en Ruigpootbuizerd · jonge vogels',
    flight: true,
    birds: [
      {id: 'sp005', source: 'buizerd', plumage: 'juv', marks: 'Een lichte Buizerd kan een vrijwel witte buik en donkere polsvlekken tonen. Bekijk ook de fijne bandering over de staart.'},
      {id: 'sp253', source: 'Ruigpootbuizerd', plumage: 'juv', marks: 'Vaak een lichte borst met een donker buikschild en opvallende polsvlekken. De witte staartbasis kan bij tegenlicht lastig te zien zijn.'},
    ],
    tip: 'Beoordeel staartbasis, buik en ondervleugels samen. Bij twijfel helpt een foto met gespreide staart in beter licht.',
  },
  {
    label: 'Buizerd en Wespendief · volwassen in vlucht',
    flight: true,
    birds: [
      {id: 'sp005', source: 'buizerd', plumage: 'adult_m', marks: 'Brede vleugels, kleine afstand van kop tot vleugelvoorrand en een relatief korte staart met meerdere fijne banden.'},
      {id: 'sp248', source: 'wespendief', plumage: 'adult_m', marks: 'Verder uitstekende kop en langere staart. Bij dit mannetje zijn de brede donkere eindband en banden dichter bij het lijf te zien.'},
    ],
    tip: 'Begin met de verhouding tussen staart, vleugelbreedte en kop. Gebruik daarna de staartbanden om je indruk te toetsen.',
  },
  {
    label: 'Buizerd en Wespendief · vrouwtje Wespendief in vlucht',
    flight: true,
    tabLabel: 'In vlucht · Wespendief-vrouwtje',
    birds: [
      {id: 'sp005', source: 'buizerd', plumage: 'adult_m', marks: 'Brede vleugels met een vrij korte staart. Let op de fijne dwarsbanden over de staart.'},
      {id: 'sp248', source: 'wespendief', plumage: 'adult_f', marks: 'Verder uitstekende kop, langere staart en donkere banden op de ondervleugel.'},
    ],
    tip: 'Vergelijk eerst kop en staart. Gebruik de vleugelbanden als extra aanwijzing wanneer de onderzijde goed zichtbaar is.',
  },
  {
    label: 'Buizerd en Wespendief · jonge vogels',
    flight: true,
    birds: [
      {id: 'sp005', source: 'buizerd', plumage: 'juv', marks: 'Relatief korte staart met veel fijne banden. Jonge vogels hebben vaak een lichte iris en een gestreepte borst.'},
      {id: 'sp248', source: 'wespendief', plumage: 'juv', marks: 'Langere staart en een verder uitstekende kop. Op een scherpe foto van de kop kunnen de donkere iris en gele snavelbasis opvallen.'},
    ],
    tip: 'Jonge Wespendieven kunnen in vlucht extra veel op Buizerd lijken. Combineer de staarttekening met de verhoudingen en, als je die ziet, de koptekening.',
  },
  {
    label: 'Wintertaling en Zomertaling · mannetjes in prachtkleed',
    birds: [
      {id: 'sp091', source: 'wintertaling', plumage: 'adult_m', marks: 'Kastanjebruine kop met breed groen oogveld. Horizontale witte flankstreep en gele vlek naast de staart.'},
      {id: 'sp188', source: 'zomertaling', plumage: 'adult_m', marks: 'Brede witte oogboog die doorloopt naar het achterhoofd. Bruine borst en lange, afhangende schouderveren.'},
    ],
    rows: [
      {label: 'Kop', values: ['Breed groen oogveld op kastanjebruine kop', 'Brede witte oogboog tot aan het achterhoofd']},
      {label: 'Flank en schouder', values: ['Horizontale witte flankstreep', 'Lange, afhangende zwart-witte schouderveren']},
      {label: 'Staartzijde', values: ['Gele vlek met zwarte rand', 'Bruin en fijn getekend']},
    ],
    tip: 'Begin met de kop. De droge ratel van het mannetje Zomertaling klinkt anders dan het hoge fluitje van Wintertaling.',
  },
  {
    label: 'Wintertaling en Zomertaling · volwassen vrouwtjes',
    birds: [
      {id: 'sp091', source: 'wintertaling', plumage: 'adult_f', marks: 'Vaak minder contrast rond het oog, met een lichte vlek aan de staartzijde. Bij een geopende vleugel kan de groene spiegel oplichten.'},
      {id: 'sp188', source: 'zomertaling', plumage: 'adult_f', marks: 'Donkere oogstreep, lichte wenkbrauw en lichte keel. Vaak ook een licht vlekje aan de snavelbasis.'},
    ],
    rows: [
      {label: 'Oogstreep', values: ['Op deze foto weinig contrast rond het oog', 'Donkere oogstreep tussen lichte kopstrepen']},
      {label: 'Keel', values: ['Lichtbruin en fijn getekend op deze foto', 'Lichte keel die afsteekt tegen de kopstrepen']},
      {label: 'Staartzijde', values: ['Vaak een lichte vlek bij de staart', 'Zonder kenmerkende lichte vlek bij de staart']},
    ],
    tip: 'Begin met het contrast op de kop. Kijk bij een goed zijaanzicht ook naar de staartzijde. De vleugelspiegel is op deze rustfoto’s maar beperkt te zien.',
  },
  {
    label: 'Wintertaling en Zomertaling · jonge vogels',
    birds: [
      {id: 'sp091', source: 'wintertaling', plumage: 'juv', marks: 'Bruine vogel die sterk op een vrouwtje lijkt. Bij deze vogel is de groene vleugelspiegel zichtbaar.'},
      {id: 'sp188', source: 'zomertaling', plumage: 'juv', marks: 'Lijkt ook sterk op het eigen vrouwtje. Let op het contrast tussen de donkere oogstreep en de lichte keel en wenkbrauw.'},
    ],
    rows: [
      {label: 'Oogstreep', values: ['Subtiel op deze donkere kop', 'Donker met een lichte wenkbrauw en wang']},
      {label: 'Gevouwen vleugel', values: ['Een stukje groene spiegel is zichtbaar', 'Spiegel ligt weggevouwen']},
    ],
    tip: 'Kop- en vleugeltekening helpen om de soort te bepalen. Laat de leeftijd open als de details ontbreken.',
  },
  {
    label: 'Wintertaling en Zomertaling · mannetjes in eclipskleed',
    birds: [
      {id: 'sp091', source: 'wintertaling', plumage: 'eclipse', marks: 'Het mannetje wordt overwegend bruin. Bij deze ruiende vogel zie je nog groen op de kop.'},
      {id: 'sp188', source: 'zomertaling', plumage: 'eclipse', marks: 'Bruine kop met lichte keel. In vlucht valt de licht blauwgrijze voorvleugel op.'},
    ],
    tip: 'De foto’s laten verschillende houdingen zien. Beoordeel bij een bruine taling de koptekening op het water en de voorvleugel als de vogel opvliegt.',
  },
  {
    label: 'Bontbekplevier en Kleine Plevier · broedkleed',
    birds: [
      {id: 'sp146', source: 'bontbekplevier', plumage: 'breeding', marks: 'Oranje snavelbasis en poten. De borstband is breed. In vlucht is een witte vleugelstreep zichtbaar.'},
      {id: 'sp147', source: 'kleine-plevier', plumage: 'breeding', marks: 'Gele oogring, donkere snavel en vleeskleurige poten. In vlucht ontbreekt de duidelijke witte vleugelstreep.'},
    ],
    tip: 'Op de grond helpen oogring en snavelkleur. In vlucht kun je letten op de witte vleugelstreep en de roep.',
  },
  {
    label: 'Bontbekplevier en Kleine Plevier · jonge vogels',
    birds: [
      {id: 'sp146', source: 'bontbekplevier', plumage: 'juv', marks: 'Bruine koptekening met een lichte streep achter het oog. In vlucht blijft de witte vleugelstreep zichtbaar.'},
      {id: 'sp147', source: 'kleine-plevier', plumage: 'juv', marks: 'Bruin koppatroon, vaak met een smalle, doffe oogring. In vlucht ontbreekt de duidelijke witte vleugelstreep.'},
    ],
    tip: 'Een donkere snavel komt bij beide jonge vogels voor. Bekijk de oogstreek en gebruik zo mogelijk de vleugelstreep of de roep als extra controle.',
  },
  {
    label: 'Kleine Plevier en Strandplevier · broedkleed',
    birds: [
      {id: 'sp147', source: 'kleine-plevier', plumage: 'breeding', marks: 'Gele oogring en een donkere band die over de borst doorloopt. De poten zijn meestal vleeskleurig.'},
      {id: 'sp206', source: 'strandplevier', plumage: 'adult_m', marks: 'Donkere poten en losse zwarte vlekken opzij van de witte borst. Het mannetje heeft een warmer achterhoofd.'},
    ],
    tip: 'Bekijk de borst van schuin voren. Van opzij kan één zijborstvlek op een deel van een borstband lijken.',
  },
  {
    label: 'Bontbekplevier en Strandplevier · winterkleed',
    birds: [
      {id: 'sp146', source: 'bontbekplevier', plumage: 'winter', marks: 'Een brede bruine borstband en relatief forse bouw. De snavel is grotendeels donker en de poten kunnen nog oranje zijn.'},
      {id: 'sp206', source: 'strandplevier', plumage: 'winter', marks: 'Bleke zandkleurige rug, donkere poten en kleine vlekken aan weerszijden van de witte borst.'},
    ],
    tip: 'Kijk of de borstband middenvoor doorloopt en controleer daarna de pootkleur. Beide soorten kunnen een donkere snavel hebben.',
  },
  {
    label: 'Bontbekplevier en Strandplevier · jonge vogels',
    birds: [
      {id: 'sp146', source: 'bontbekplevier', plumage: 'juv', marks: 'Steviger gebouwd, met een duidelijker bruine borstband en een lichte lijn achter het oog.'},
      {id: 'sp206', source: 'strandplevier', plumage: 'juv', marks: 'Bleker, met donkere poten en een veel kleinere zijborstvlek. Het midden van de borst is wit.'},
    ],
    tip: 'Ook jonge vogels kunnen lichtgerande rugveren hebben. De borsttekening, bouw en poten helpen beter bij het onderscheid.',
  },
  {
    label: 'Goudplevier en Zilverplevier · broedkleed',
    birds: [
      {id: 'sp145', source: 'goudplevier', plumage: 'breeding', marks: 'Goudgele spikkels op de bovenzijde. De zwarte onderzijde is afgezet met een witte baan.'},
      {id: 'sp144', source: 'zilverplevier', plumage: 'breeding', marks: 'Zilvergrijze, contrastrijke bovenzijde, stevige snavel en eveneens een zwarte onderzijde.'},
    ],
    tip: 'Beide soorten kunnen een zwarte buik hebben. Kijk naar het patroon op de rug en de stevigheid van de snavel.',
  },
  {
    label: 'Goudplevier en Zilverplevier · winterkleed',
    birds: [
      {id: 'sp145', source: 'goudplevier', plumage: 'winter', marks: 'Warme goudbruine spikkels, kortere snavel en slankere bouw. In vlucht zijn de oksels wit.'},
      {id: 'sp144', source: 'zilverplevier', plumage: 'winter', marks: 'Grijzer, forser en vaak met meer contrast tussen kruin en wenkbrauw. In vlucht vallen zwarte oksels op.'},
    ],
    tip: 'Kleuren kunnen door het licht veranderen. Kijk bij een overvliegende vogel naar de okselvlekken of luister naar de roep.',
  },
  {
    label: 'Goudplevier en Zilverplevier · jonge vogels',
    birds: [
      {id: 'sp145', source: 'goudplevier', plumage: 'juv', marks: 'Lichtere tot goudgele spikkels, fijne borstvlekjes en relatief kleine snavel. In vlucht witte oksels.'},
      {id: 'sp144', source: 'zilverplevier', plumage: 'juv', marks: 'Kan ook geelachtige spikkels hebben. Let op de forse kop, stevige snavel en zwarte oksels in vlucht.'},
    ],
    tip: 'Gele spikkels komen bij beide voor. Combineer bouw en snavel met de ondervleugel of roep. Laat de soort open als die kenmerken ontbreken.',
  },
  {
    label: 'Witgat en Bosruiter · broedkleed',
    birds: [
      {id: 'sp156', source: 'witgat', plumage: 'breeding', marks: 'Donkere borst scherp begrensd tegen de witte buik. De lichte wenkbrauw valt vooral vóór het oog op.'},
      {id: 'sp159', source: 'bosruiter', plumage: 'breeding', marks: 'Lichte wenkbrauw loopt door achter het oog. Rankere bouw, langere geelgroene poten en duidelijkere lichte rugvlekken.'},
    ],
    tip: 'Bekijk bij een staande vogel eerst de kop en borst. Van schuin opzij kun je ook de lengte van de poten en de bouw vergelijken.',
  },
  {
    label: 'Witgat en Bosruiter · winterkleed',
    birds: [
      {id: 'sp156', source: 'witgat', plumage: 'winter', marks: 'Donkere, vrij effen rug met fijne stipjes. Vaak een opvallende lichte oogring en een korte wenkbrauw.'},
      {id: 'sp159', source: 'bosruiter', plumage: 'winter', marks: 'Grijsbruine rug met kleinere vlekken dan in broedkleed. De lange wenkbrauwstreep blijft zichtbaar.'},
    ],
    tip: 'Bosruiter overwintert doorgaans buiten Nederland. In vlucht hebben beide een witte stuit. Witgat heeft donkere ondervleugels en Bosruiter lichte.',
  },
  {
    label: 'Witgat en Bosruiter · jonge vogels',
    birds: [
      {id: 'sp156', source: 'witgat', plumage: 'juv', marks: 'Kleine beige vlekjes op een donkere rug. Compacte bouw en een wenkbrauw die vooral vóór het oog opvalt.'},
      {id: 'sp159', source: 'bosruiter', plumage: 'juv', marks: 'Ook beige vlekjes op de rug, met een langere wenkbrauwstreep en slankere bouw.'},
    ],
    tip: 'De rugvlekjes alleen geven weinig houvast. Combineer de bouw en koptekening met de ondervleugel of beluister de vluchtroepen.',
  },
  {
    label: 'Tureluur en Zwarte Ruiter · broedkleed',
    birds: [
      {id: 'sp102', source: 'tureluur', plumage: 'breeding', marks: 'Bruin met donkere tekening, roodoranje poten en een vrij rechte, kortere snavel.'},
      {id: 'sp157', source: 'zwarte-ruiter', plumage: 'breeding', marks: 'Roetzwarte onderzijde, kleine lichte rugvlekjes en een langere, fijnere snavel.'},
    ],
    tip: 'In vlucht laat Tureluur een brede witte achterrand aan de vleugel zien. Bij beide soorten is een witte rugwig zichtbaar.',
  },
  {
    label: 'Tureluur en Zwarte Ruiter · winterkleed',
    birds: [
      {id: 'sp102', source: 'tureluur', plumage: 'winter', marks: 'Bruiner en compacter, met een kortere snavel. Bij de snavelbasis kan boven én onder rood zichtbaar zijn.'},
      {id: 'sp157', source: 'zwarte-ruiter', plumage: 'winter', marks: 'Lichter grijs, met een opvallende witte wenkbrauw vóór het oog. De lange fijne snavel heeft vaak rood aan de basis van de ondersnavel.'},
    ],
    tip: 'Begin met snavellengte, wenkbrauw en bouw. Beide soorten kunnen in de winter roodachtige poten hebben.',
  },
  {
    label: 'Tureluur en Zwarte Ruiter · jonge vogels',
    birds: [
      {id: 'sp102', source: 'tureluur', plumage: 'juv', marks: 'Bruine bovenzijde met lichte veerranden en vaak gelige tot oranje poten. Kortere snavel.'},
      {id: 'sp157', source: 'zwarte-ruiter', plumage: 'juv', marks: 'Dichte, fijne dwarsbandjes op borst en flanken. Slankere bouw en langere snavel.'},
    ],
    tip: 'Kijk in zijaanzicht naar de onderzijde én snavel. Bij een verre vogel kan de vleugelrand in vlucht uitsluitsel geven.',
  },
  {
    label: 'Groenpootruiter en Poelruiter · broedkleed',
    birds: [
      {id: 'sp158', source: 'groenpootruiter', plumage: 'breeding', marks: 'Forse kop en borst, met een stevige, licht opgebogen snavel.'},
      {id: 'sp217', source: 'poelruiter', plumage: 'breeding', marks: 'Kleine ronde kop, naalddunne rechte snavel en poten die in verhouding lang lijken.'},
    ],
    tip: 'Beide soorten hebben donkere tekening op de rug. Een goed zijaanzicht laat de snavelvorm en lichaamsverhoudingen zien.',
  },
  {
    label: 'Groenpootruiter en Poelruiter · winterkleed',
    birds: [
      {id: 'sp158', source: 'groenpootruiter', plumage: 'winter', marks: 'Grijze rug, robuustere bouw en een snavel met een lichte opwaartse kromming.'},
      {id: 'sp217', source: 'poelruiter', plumage: 'winter', marks: 'Opvallend licht gezicht onder de grijze kruin. Kleine ronde kop en een fijne rechte snavel.'},
    ],
    tip: 'Gebruik vooral de snavelvorm. Bij tegenlicht valt de kleur van de poten bij beide soorten lastig te beoordelen.',
  },
  {
    label: 'Groenpootruiter en Poelruiter · jonge vogels',
    birds: [
      {id: 'sp158', source: 'groenpootruiter', plumage: 'juv', marks: 'Bruinere vleugeldekveren met lichte randjes. De snavel is stevig en licht opgebogen.'},
      {id: 'sp217', source: 'poelruiter', plumage: 'juv', marks: 'Ook lichte veerranden, met een fijnere rechte snavel en opvallend slanke bouw.'},
    ],
    tip: 'Vergelijk vooral snavel en bouw. Jonge vogels kunnen al vroeg een deel van de bruine veren vervangen door grijzere winterveren.',
  },
  {
    label: 'Oeverloper en Witgat · winterkleed',
    birds: [
      {id: 'sp155', source: 'oeverloper', plumage: 'winter', marks: 'Witte inkeping tussen borst en vleugelboeg. Korte poten. In vlucht een witte streep op de bovenvleugel.'},
      {id: 'sp156', source: 'witgat', plumage: 'winter', marks: 'Donkere borst met een scherpe overgang naar de witte buik. In vlucht een witte stuit en donkere ondervleugels.'},
    ],
    tip: 'Kijk bij een staande vogel eerst naar de overgang tussen borst en vleugelboeg. In vlucht helpt de plaats van het wit.',
  },
  {
    label: 'Oeverloper en Bosruiter · jonge vogels',
    birds: [
      {id: 'sp155', source: 'oeverloper', plumage: 'juv', marks: 'Laag op de poten, met een witte inkeping vóór de vleugelboeg. Wipt geregeld met het achterlijf.'},
      {id: 'sp159', source: 'bosruiter', plumage: 'juv', marks: 'Langere geelgroene poten, een lichte wenkbrauw tot achter het oog en meer opvallende lichte rugvlekjes.'},
    ],
    tip: 'Bekijk de kop, borstzijde en pootlengte samen. Let bij een foeragerende vogel ook op de houding en beweging.',
  },
  {
    label: 'Torenvalk en Slechtvalk · volwassen in vlucht',
    flight: true,
    tabLabel: 'In vlucht · Volwassen',
    birds: [
      {id: 'sp008', source: 'torenvalk', plumage: 'adult_m', marks: 'Lange staart met donkere eindband. Slanker gebouwd, met spitse vleugels.'},
      {id: 'sp009', source: 'slechtvalk', photo: '/assets/species/plumage/sp009-male-flight.webp', marks: 'Zware borst, brede donkere baardstreep en relatief korte staart. De spitse vleugels hebben een brede basis.'},
    ],
    tip: 'Vergelijk de lengte van de staart ten opzichte van de vleugelbasis. De foto’s zijn niet op dezelfde schaal.',
  },
  {
    label: 'Torenvalk en Slechtvalk · juveniel',
    birds: [
      {id: 'sp008', source: 'torenvalk', plumage: 'juv', marks: 'Warmer bruine, gebandeerde rug en lange staart. Lijkt sterk op een volwassen vrouwtje Torenvalk.'},
      {id: 'sp009', source: 'slechtvalk', plumage: 'juv', marks: 'Donkerder bruine bovenzijde met lichte veerranden, zware bouw en een brede donkere baardstreep.'},
    ],
    tip: 'Beide jonge vogels hebben lengtestrepen: die alleen bepalen de soort niet. Combineer koptekening met lichaamsbouw en staartlengte.',
  },
  {
    label: 'Torenvalk en Sperwer · juveniel',
    birds: [
      {id: 'sp008', source: 'torenvalk', plumage: 'juv', marks: 'Gestreepte borst en relatief puntige vleugels. Vaak jagend boven open terrein.'},
      {id: 'sp006', source: 'sperwer', plumage: 'juv', marks: 'Ook als jonge vogel dwarsbanden op de onderzijde; korte brede vleugels en lange dunne poten.'},
    ],
    tip: 'Let op de richting van de borsttekening en de vleugelvorm. Alleen een lange staart is onvoldoende.',
  },
  {
    label: 'Slechtvalk en Havik · juveniel',
    birds: [
      {id: 'sp009', source: 'slechtvalk', plumage: 'juv', marks: 'Brede donkere baardstreep. In vlucht spitser gevleugeld en korter gestaart dan Havik.'},
      {id: 'sp007', source: 'havik', plumage: 'juv', marks: 'Opvallende lichte wenkbrauw, stevige poten en een langere staart. Jonge vogels hebben eveneens lengtestrepen.'},
    ],
    tip: 'Lengtestrepen komen bij beide voor. Vergelijk de koptekening, staart en vleugels; formaat zonder referentie is lastig.',
  },
  {
    "label": "Grote of kleine bonte specht?",
    "birds": [
      {
        "id": "sp016",
        "source": "grote-bonte-specht",
        "marks": "Grote: grote witte schoudervlekken en rode onderstaart."
      },
      {
        "id": "sp017",
        "source": "kleine-bonte-specht",
        "marks": "Kleine: dwarsgestreepte rug zonder grote witte schoudervlekken, bleke onderstaart en musformaat."
      }
    ],
    "tip": "Gebruik rugpatroon en onderstaart naast formaat."
  },
  {
    "label": "Kleine of middelste bonte specht?",
    "birds": [
      {
        "id": "sp017",
        "source": "kleine-bonte-specht",
        "marks": "Kleine: gebandeerde rug en geen rode onderstaart; veel kleiner."
      },
      {
        "id": "sp020",
        "source": "middelste-bonte-specht",
        "marks": "Middelste: witte schoudervlekken, roze onderstaart en licht gezicht."
      }
    ],
    "tip": "Een rood petje komt bij beide voor; controleer schouder en onderstaart."
  },
  {
    "label": "Zwarte of groene specht?",
    "birds": [
      {
        "id": "sp018",
        "source": "zwarte-specht",
        "marks": "Zwarte: groot en vrijwel geheel zwart; rechte slagvlucht, kru-kru in vlucht en langgerekte roep in zit."
      },
      {
        "id": "sp019",
        "source": "groene-specht",
        "marks": "Groene: groen met gele stuit; diep golvende vlucht en vaak foeragerend op gras."
      }
    ],
    "tip": "Beide kunnen lachen. Combineer geluid met kleur en vlucht."
  },
  {
    "birds": [
      {
        "id": "sp030",
        "source": "pimpelmees",
        "marks": "Blauw petje met smalle donkere oogstreep; witte wang. Jonge vogels hebben gelige wangen."
      },
      {
        "id": "sp029",
        "source": "koolmees",
        "marks": "Grotere mees met zwarte kop, witte wang en een zwarte lengtestreep midden over de gele buik."
      }
    ],
    "tip": "Kijk naar de hele koptekening en de buikstreep. Bij jonge vogels van beide soorten kan de wang gelig zijn."
  },
  {
    label: 'Kuifmees en Matkop · koptekening',
    birds: [
      {id: 'sp033', source: 'kuifmees', marks: 'Zwart-witte spitse kuif en een gebogen zwarte lijn achter de wang.'},
      {id: 'sp031', source: 'matkop', marks: 'Egaal zwarte kap en een lichtere, minder getekende kopzijde.'},
    ],
    rows: [
      {label: 'Kruin', values: ['Zwart-wit getekend, soms plat gehouden', 'Egaal zwart']},
      {label: 'Wang', values: ['Donkere boog achter de wang', 'Lichte wang zonder donkere boog']},
    ],
    tip: 'Bij een juveniele Kuifmees kan de kuif kort zijn. Bekijk de wangboog en kuifveren samen.',
  },
  {
    "label": "Goudhaantje en Vuurgoudhaan · koptekening",
    "birds": [
      {
        "id": "sp063",
        "source": "goudhaan",
        "marks": "Groot donker oog in een vrij egaal licht gezicht; geen brede witte wenkbrauw."
      },
      {
        "id": "sp064",
        "source": "vuurgoudhaan",
        "marks": "Brede witte wenkbrauw boven een zwarte oogstreep; duidelijk contrastrijker gezicht."
      }
    ],
    rows: [
      {label: 'Wenkbrauw', values: ['Geen brede witte wenkbrauw.', 'Brede witte wenkbrauw.']},
      {label: 'Oogstreek', values: ['Donker oog in een vrij egaal gezicht.', 'Donkere oogstreep met meer contrast rond het oog.']},
    ],
    "tip": "Begin bij de wenkbrauw en oogstreek. Bij beide soorten kan de kruin geel of oranje tonen."
  },
  {
    label: 'Goudhaantje en Vuurgoudhaan · juvenielen',
    birds: [
      {id: 'sp063', source: 'goudhaan', plumage: 'juv', marks: 'Jong Goudhaantje zonder de volwassen gekleurde kruinstreep en zonder lichte wenkbrauw.'},
      {id: 'sp064', source: 'vuurgoudhaan', plumage: 'juv', marks: 'Jonge Vuurgoudhaan zonder de volwassen gekleurde kruinstreep, maar met een lichte wenkbrauw.'},
    ],
    rows: [
      {label: 'Wenkbrauw', values: ['Lichte wenkbrauw ontbreekt.', 'Lichte wenkbrauw aanwezig.']},
      {label: 'Kruin', values: ['Nog zonder opvallende gekleurde kruinstreep.', 'Nog zonder opvallende gekleurde kruinstreep.']},
    ],
    tip: 'Bij beide jonge soorten ontbreekt de volwassen kruinstreep aanvankelijk. Vergelijk vooral een scherp zijaanzicht van de wenkbrauw; bij onvoldoende zicht blijft de determinatie onzeker.',
  },
  {
    "label": "Boomklever en Boomkruiper · bouw en beweging",
    "birds": [
      {
        "id": "sp065",
        "source": "boomklever",
        "photo": "/assets/species/plumage/sp065-head-down.webp",
        "marks": "Blauwgrijze rug, zwarte oogstreep, rechte snavel en korte staart. Beweegt ook kop omlaag langs de stam."
      },
      {
        "id": "sp066",
        "source": "boomkruiper",
        "marks": "Bruin-licht gevlekte rug, dunne kromme snavel en lange stijve staart. Zoekt meestal omhoog klimmend naar voedsel."
      }
    ],
    rows: [
      {label: 'Snavel', values: ['Vrij recht en spits.', 'Slank en naar beneden gebogen.']},
      {label: 'Staart', values: ['Kort en vrij van de stam op deze foto.', 'Lang en stijf. Dient als steun tegen de stam.']},
      {label: 'Houding', values: ['Kan ook met de kop omlaag bewegen.', 'Zoekt meestal omhoog klimmend naar voedsel.']},
    ],
    "tip": "Vergelijk eerst snavel en staart. Let bij een bewegende vogel ook op de klimrichting."
  },
  {
    "label": "Boomkruiper en Taigaboomkruiper · op een stam",
    "birds": [
      {
        "id": "sp066",
        "source": "boomkruiper",
        "photo": "/assets/species/plumage/sp066-wing.webp",
        "marks": "Vaak warmere flanken, minder opvallende wenkbrauw en een gelijkmatiger verloop van de lichte vleugelband."
      },
      {
        "id": "sp067",
        "source": "taigaboomkruiper",
        "photo": "/assets/species/plumage/sp067-wing.webp",
        "marks": "Vaak witter onderaan en achter het oog. Het precieze patroon van de lichte vleugelband helpt, maar vraagt een scherp zijaanzicht."
      }
    ],
    rows: [
      {label: 'Vleugelband', values: ['Lichte punten met een geleidelijk verloop.', 'Lichte baan met een inkeping en een steilere sprong.']},
      {label: 'Flank', values: ['Vaak warmer bruin.', 'Op deze foto lichter. De tint verschilt per ondersoort.']},
      {label: 'Geluid', values: ['Typische zang stijgt. De roep is vaak doordringend.', 'Typische zang begint hoog en daalt. De roep is vaak dunner.']},
    ],
    "tip": "Luister via Geluid op beide kaarten naar een hele zangstrofe. Vergelijk daarna de gevouwen vleugel op een scherp zijaanzicht. Mengzang komt voor."
  },
  {
    "label": "Meerkoet en Waterhoen · volwassen",
    "birds": [
      {
        "id": "sp078",
        "source": "meerkoet",
        "photo": "/assets/species/sp078.webp",
        "marks": "Witte snavel en bles, donker lichaam en zwarte kop."
      },
      {
        "id": "sp079",
        "source": "waterhoen",
        "photo": "/assets/species/sp079.webp",
        "marks": "Rode snavel met gele punt en rode bles. Duidelijke witte flankstreep."
      }
    ],
    rows: [
      {label: 'Snavel', values: ['Wit.', 'Rood met een gele punt.']},
      {label: 'Bles', values: ['Groot wit schild op het voorhoofd.', 'Rood schild boven de snavel.']},
      {label: 'Flank', values: ['Donkergrijs zonder witte lengtestreep.', 'Witte lengtestreep langs de zij.']},
    ],
    "tip": "Begin bij de snavel en bles. Gebruik de flankstreep als extra kenmerk."
  },
  {
    "label": "Meerkoet en Waterhoen · jonge vogels",
    "birds": [
      {
        "id": "sp078",
        "source": "meerkoet",
        "plumage": "juv",
        "photo": "/assets/species/plumage/sp078-juv-grown.webp",
        "marks": "Op deze foto lichtgrijze wangen en keel. Een groot wit voorhoofdsschild ontbreekt nog."
      },
      {
        "id": "sp079",
        "source": "waterhoen",
        "plumage": "juv",
        "photo": "/assets/species/plumage/sp079-juv.webp",
        "marks": "Bruine bovenzijde, lichte keel en witte flankstreep. Het voorhoofd heeft nog geen opvallende rode bles."
      }
    ],
    rows: [
      {label: 'Kop', values: ['Op deze foto zijn wang en keel lichtgrijs.', 'Op deze foto is de kop donkerder, met een lichtere keel.']},
      {label: 'Bovenzijde', values: ['Op deze foto grijsbruin.', 'Op deze foto warmer bruin.']},
      {label: 'Flank', values: ['Geen witte lengtestreep.', 'Witte lengtestreep zichtbaar.']},
    ],
    "tip": "Gebruik de flankstreep samen met de koptekening. Jonge vogels missen de opvallende bles van volwassen vogels."
  },
  {
    label: 'Blauwe Reiger en Purperreiger · volwassen',
    birds: [
      {id: 'sp081', source: 'blauwe-reiger', photo: '/assets/species/plumage/sp081-portrait.webp', marks: 'Grijze mantel, lichte hals en een stevige dolksnavel.'},
      {id: 'sp084', source: 'purperreiger', photo: '/assets/showcase/sp084.webp', marks: 'Slanker, met een bruinoranje hals en donkere halsstrepen.'},
    ],
    rows: [
      {label: 'Halskleur', values: ['Licht, met donkere streping op de voorhals.', 'Bruinoranje met donkere lengtestrepen.']},
      {label: 'Snavel', values: ['Stevige dolksnavel.', 'Slankere, puntige snavel.']},
      {label: 'Bouw', values: ['Forser.', 'Fijner gebouwd met een dunne hals.']},
    ],
    tip: 'Kijk eerst naar de kleur en tekening van de hals. De foto’s zijn niet op dezelfde schaal.',
  },
  {
    label: 'Blauwe Reiger en Purperreiger · jonge vogels',
    birds: [
      {id: 'sp081', source: 'blauwe-reiger', plumage: 'juv', photo: '/assets/species/plumage/sp081-juv.webp', marks: 'Grijze kruin, grijzere rug en bovensnavel donkerder dan bij een volwassene.'},
      {id: 'sp084', source: 'purperreiger', plumage: 'juv', photo: '/assets/species/plumage/sp084-juv-europa.webp', marks: 'Warmbruin kleed met licht gerande vleugeldekveren en een slanke hals.'},
    ],
    rows: [
      {label: 'Kruin', values: ['Grijs.', 'Warmbruin.']},
      {label: 'Vleugel', values: ['Overwegend grijs.', 'Bruin met lichte veerranden.']},
      {label: 'Snavel', values: ['Stevig, met een donkere bovensnavel.', 'Fijn en spits.']},
    ],
    tip: 'Vergelijk kruin en vleugel samen. De ingetrokken hals op de foto van de Blauwe Reiger maakt halslengte hier lastig te vergelijken.',
  },
  {
    label: 'Blauwe Reiger en Purperreiger · in vlucht',
    flight: true,
    birds: [
      {id: 'sp081', source: 'blauwe-reiger', photo: '/assets/species/sp081.webp', marks: 'Brede vleugels, lichte kop en hals en een stevige snavel.'},
      {id: 'sp084', source: 'purperreiger', photo: '/assets/species/plumage/sp084-flight.webp', marks: 'Warmere halstint, hoekige keelzak en ver uitstekende tenen.'},
    ],
    rows: [
      {label: 'Hals', values: ['Lichte, ingetrokken hals.', 'Warmere hals met een hoekiger knik.']},
      {label: 'Vleugel', values: ['Brede vleugels met lichtere dekveren.', 'Donkerder vleugelbeeld.']},
      {label: 'Poten en tenen', values: ['Poten steken achter het lichaam uit.', 'Lange tenen steken opvallend ver uit.']},
    ],
    tip: 'Vergelijk de halsknik en tenen samen. De precieze vleugelstand wisselt per vleugelslag.',
  },
  {
    label: 'Kwak en Blauwe Reiger · jonge vogels',
    birds: [
      {id: 'sp085', source: 'kwak', plumage: 'juv', photo: '/assets/species/plumage/sp085-juv.webp', marks: 'Compact met lichte druppelvlekken op de bruine vleugel en donkere lengtestrepen op de borst.'},
      {id: 'sp081', source: 'blauwe-reiger', plumage: 'juv', photo: '/assets/species/plumage/sp081-juv.webp', marks: 'Grijze kruin en overwegend grijze vleugels zonder lichte druppelvlekken.'},
    ],
    rows: [
      {label: 'Vleugel', values: ['Bruin, met losse lichte druppelvlekken.', 'Overwegend grijs, zonder die losse druppelvlekken.']},
      {label: 'Kruin', values: ['Bruin, met lichte streepjes.', 'Overwegend grijs.']},
      {label: 'Bouw', values: ['Compact.', 'Langere hals, op deze foto ingetrokken.']},
    ],
    tip: 'Een ingetrokken hals maakt ook een Blauwe Reiger compact. Kijk daarom eerst naar het vleugelpatroon.',
  },
  {
    label: 'Kwak en Blauwe Reiger · in vlucht',
    flight: true,
    birds: [
      {id: 'sp085', source: 'kwak', photo: '/assets/species/plumage/sp085-flight.webp', marks: 'Compact silhouet, donkere snavel en korte hals.'},
      {id: 'sp081', source: 'blauwe-reiger', photo: '/assets/species/sp081.webp', marks: 'Forse reiger met een lichte halsbocht, gele dolksnavel en ver uitstekende poten.'},
    ],
    rows: [
      {label: 'Hals', values: ['Korte hals dicht tegen het lichaam.', 'Langere, lichte hals die ook in vlucht ingetrokken is.']},
      {label: 'Snavel', values: ['Op deze foto donker.', 'Op deze foto lang en geeloranje.']},
      {label: 'Poten', values: ['Steken op deze foto kort uit achter de staart.', 'Steken duidelijk achter het lichaam uit.']},
    ],
    tip: 'Vergelijk het silhouet en de uitstekende poten. De foto’s zijn niet op dezelfde schaal.',
  },
  {
    label: 'Kwak en Purperreiger · jonge vogels',
    birds: [
      {id: 'sp085', source: 'kwak', plumage: 'juv', photo: '/assets/species/plumage/sp085-juv.webp', marks: 'Gedrongen met losse lichte druppelvlekken op de bruine vleugel.'},
      {id: 'sp084', source: 'purperreiger', plumage: 'juv', photo: '/assets/species/plumage/sp084-juv-europa.webp', marks: 'Slanker, met lichte randen rond bruine vleugeldekveren.'},
    ],
    rows: [
      {label: 'Vleugel', values: ['Losse lichte druppelvlekken.', 'Lichte randen rondom de afzonderlijke veren.']},
      {label: 'Hals', values: ['Kort en op deze foto ingetrokken.', 'Lang en slank.']},
      {label: 'Snavel', values: ['Relatief kort en stevig.', 'Lang en fijn gepunt.']},
    ],
    tip: 'Beide jonge vogels zijn bruin. Begin bij het verschil tussen druppelvlekken en lichte veerranden.',
  },
  {
    "label": "Wilde Eend en Slobeend · vrouwtjes",
    "birds": [
      {
        "id": "sp089",
        "source": "wilde-eend",
        "marks": "Bruine eend met een gewone, relatief smalle eendensnavel en blauw-paarse spiegel.",
        "photo": "/assets/species/plumage/sp089-adult_f.webp",
        "plumage": "adult_f"
      },
      {
        "id": "sp090",
        "source": "slobeend",
        "marks": "Eveneens bruin, maar met een opvallend lange snavel die naar het uiteinde breed uitloopt.",
        "photo": "/assets/species/plumage/sp090-adult_f.webp",
        "plumage": "adult_f"
      }
    ],
    "rows": [
      {"label": "Snavelvorm", "values": ["Relatief smal en minder breed uitlopend", "Lang, breed en lepelvormig"]},
      {"label": "Vleugelspiegel", "values": ["Blauwpaars met witte randen als de vleugel opengaat", "Groen zonder brede witte achterrand als de vleugel opengaat"]}
    ],
    "tip": "Begin met de snavelvorm. De spiegel kan onder de gevouwen vleugel verborgen zijn."
  },
  {
    label: 'Wilde Eend en Slobeend · mannetjes in vrije vlucht',
    flight: true,
    birds: [
      {id: 'sp089', source: 'wilde-eend', plumage: 'adult_m', photo: '/assets/species/plumage/sp089-free-flight.webp', marks: 'Gele snavel, smalle witte halsring, donkere borst en grijs lichaam.'},
      {id: 'sp090', source: 'slobeend', plumage: 'adult_m', photo: '/assets/species/plumage/sp090-flight.webp', marks: 'Lange donkere lepelvormige snavel, witte borst, kastanjebruine flank en lichtblauwe voorvleugel.'},
    ],
    rows: [
      {label: 'Snavel', values: ['Geel en gelijkmatiger van breedte', 'Donker, lang en aan de punt lepelvormig']},
      {label: 'Borst', values: ['Donkere borst onder een smalle witte halsring', 'Opvallend witte borst']},
      {label: 'Flank', values: ['Lichtgrijs', 'Kastanjebruin']},
    ],
    tip: 'Beide mannetjes hebben een groene kop. Begin met de snavel en borst. Bij Slobeend zie je op deze foto ook de lichtblauwe voorvleugel.',
  },
  {
    "label": "Kuifeend en Tafeleend · mannetjes in prachtkleed",
    "birds": [
      {
        "id": "sp092",
        "source": "kuifeend",
        "marks": "Zwarte kop en borst, witte flanken, geel oog en een afhangende kuif.",
        "plumage": "adult_m"
      },
      {
        "id": "sp132",
        "source": "tafeleend",
        "marks": "Roodbruine kop, zwarte borst, grijze flanken en rood oog; geen kuif.",
        "plumage": "adult_m"
      }
    ],
    "rows": [
      {"label": "Kop", "values": ["Zwart met afhangende kuif", "Roodbruin zonder kuif"]},
      {"label": "Oog", "values": ["Geel", "Rood"]},
      {"label": "Flanken", "values": ["Wit", "Lichtgrijs"]}
    ],
    "tip": "Vergelijk kopkleur, flankkleur en oog samen. Mannetjes zien er in eclipskleed minder contrastrijk uit."
  },
  {
    "label": "Kuifeend en Tafeleend · vrouwtjes",
    "birds": [
      {
        "id": "sp092",
        "source": "kuifeend",
        "marks": "Donkerder bruin, geel oog en vaak een kleine kuif. Soms wit rond de snavelbasis.",
        "plumage": "adult_f"
      },
      {
        "id": "sp132",
        "source": "tafeleend",
        "marks": "Grijsbruiner met een lichtere wang en keel, donker oog en een langere, aflopende kopvorm.",
        "plumage": "adult_f"
      }
    ],
    "rows": [
      {"label": "Kopprofiel", "values": ["Ronde kop, vaak met korte kuif", "Aflopend voorhoofd, zonder kuif"]},
      {"label": "Oog", "values": ["Meestal geel", "Doorgaans donker"]},
      {"label": "Lichte tekening", "values": ["Soms bij de snavelbasis", "Vaak op wang en keel"]}
    ],
    "tip": "Een kleine kuif kan platliggen of slecht zichtbaar zijn. Gebruik ook oogkleur, kopvorm en wangtekening."
  },
  {
    label: 'Kuifeend en Tafeleend · mannetjes in vrije vlucht',
    flight: true,
    birds: [
      {id: 'sp092', source: 'kuifeend', plumage: 'adult_m', photo: '/assets/species/plumage/sp092-flight.webp', marks: 'Donkere kop en borst, witte flank en een witte baan over de slagpennen.'},
      {id: 'sp132', source: 'tafeleend', plumage: 'adult_m', photo: '/assets/species/plumage/sp132-flight.webp', marks: 'Roodbruine kop, donker voorlichaam en een lichtgrijze baan over de vleugel.'},
    ],
    rows: [
      {label: 'Kop', values: ['Donker', 'Roodbruin']},
      {label: 'Vleugelbaan', values: ['Wit en scherp afgetekend', 'Lichtgrijs en minder contrastrijk']},
    ],
    tip: 'Gebruik kopkleur en vleugelbaan samen. De vlieghouding bepaalt hoeveel je van de kuif en de vleugel ziet.',
  },
  {
    label: 'Zilvermeeuw en Kleine Mantelmeeuw · volwassen',
    birds: [
      {id: 'sp094', source: 'zilvermeeuw', photo: '/assets/species/sp094.webp', marks: 'Lichtgrijze mantel en roze poten. De gele snavel heeft een rode vlek.'},
      {id: 'sp095', source: 'kleine-mantelmeeuw', photo: '/assets/species/sp095.webp', marks: 'Donkergrijze mantel en gele poten. Oogt doorgaans slanker.'},
    ],
    rows: [
      {label: 'Mantel', values: ['Lichtgrijs', 'Donkergrijs']},
      {label: 'Poten', values: ['Roze', 'Geel']},
      {label: 'Bouw', values: ['Oogt doorgaans forser', 'Oogt doorgaans slanker']},
    ],
    tip: 'Combineer mantelkleur en pootkleur. Licht en schaduw kunnen de mantel donkerder of lichter doen lijken.',
  },
  {
    label: 'Zilvermeeuw en Kleine Mantelmeeuw · eerste winter',
    birds: [
      {id: 'sp094', source: 'zilvermeeuw', photoMissing: true, marks: 'De lichte randen van de tertials zijn vaak duidelijk gekarteld.'},
      {id: 'sp095', source: 'kleine-mantelmeeuw', photoMissing: true, marks: 'De tertials ogen meestal egaler. In vlucht valt de donkere ondervleugel op.'},
    ],
    tip: 'Bekijk de binnenste armpennen op een scherp zijaanzicht en controleer zo mogelijk de ondervleugel in vlucht.',
  },
  {
    label: 'Zilvermeeuw en Kleine Mantelmeeuw · volwassen in vrije vlucht',
    flight: true,
    birds: [
      {id: 'sp094', source: 'zilvermeeuw', photo: '/assets/species/plumage/sp094-flight.webp', marks: 'Lichtgrijs vleugelveld met een duidelijk afstekende zwarte vleugeltop.'},
      {id: 'sp095', source: 'kleine-mantelmeeuw', photo: '/assets/species/plumage/sp095-flight.webp', marks: 'Donkergrijze bovenvleugel, met een geleidelijker overgang naar de zwarte top.'},
    ],
    rows: [
      {label: 'Vleugelveld', values: ['Lichtgrijs', 'Donkergrijs']},
      {label: 'Vleugeltop', values: ['Zwart steekt duidelijk af', 'Zwart sluit aan op de donkere vleugel']},
    ],
    tip: 'Vergelijk vooral het grijs op de bovenzijde. Tegenlicht en een andere vleugelhoek veranderen het zichtbare contrast.',
  },
  {
    label: 'Boerenzwaluw en Huiszwaluw',
    birds: [
      {id: 'sp114', source: 'boerenzwaluw', marks: 'Roestrode keel en donker borstbandje. Volwassen vogels hebben lange buitenste staartpennen.'},
      {id: 'sp115', source: 'huiszwaluw', marks: 'Witte stuit en witte keel. De gevorkte staart is korter.'},
    ],
    tip: 'Kijk eerst naar stuit en keel. Een jonge Boerenzwaluw heeft kortere staartpennen dan een volwassen vogel.',
  },
  {
    label: 'Witte en Gele Kwikstaart · jonge vogels',
    birds: [
      {id: 'sp068', source: 'witte-kwikstaart', photoMissing: true, marks: 'Jonge Witte Kwikstaart: valer grijs kleed, relatief lichte kop en doorgaans een smallere borstband.'},
      {id: 'sp069', source: 'gele-kwikstaart', photoMissing: true, marks: 'Jonge Gele Kwikstaart: vaak weinig geel, lichte vleugelstrepen en onregelmatige donkere bovenborsttekening.'},
    ],
    rows: [
      {label: 'Borst', values: ['Smalle donkere borstband boven een lichte buik', 'Bleek met vaak wat donkere bovenborststreping']},
      {label: 'Kop', values: ['Grijs, relatief veel wit', 'Overwegend bleek met lichte wenkbrauw']},
      {label: 'Zekerheid', values: ['Gebruik borstband én staartvorm', 'Gebruik vleugelstrepen én roep; ontbrekend geel sluit niet uit']},
    ],
    tip: 'Er is nog géén gecontroleerd juvenielen-fotopaar. De volwassen foto’s van deze soorten mogen daarom niet als juvenielen worden getoond.',
  },
  {
    label: 'Witte en Gele Kwikstaart · volwassen in rust',
    birds: [
      {id: 'sp068', source: 'witte-kwikstaart', marks: 'Volwassen Witte Kwikstaart in prachtkleed: zwart-witte kop en keel met grijze rug en witte buik.'},
      {id: 'sp069', source: 'gele-kwikstaart', plumage: 'adult_m', marks: 'Mannetje Gele Kwikstaart van de nominaatvorm: blauwgrijze kop, witte wenkbrauw en felgele onderzijde.'},
    ],
    rows: [
      {label: 'Borst en buik', values: ['Wit en grijs met zwarte keel/bef', 'Grotendeels felgeel in broedkleed']},
      {label: 'Kop', values: ['Zwart-witte tekening', 'Blauwgrijs met lichte wenkbrauw (nominaatvorm)']},
      {label: 'Bovenzijde', values: ['Grijze rug', 'Doorgaans olijfgroene rug']},
    ],
    tip: 'Beide foto’s tonen rustende vogels. Jonge Gele Kwikstaarten kunnen vrijwel geen geel tonen: gebruik dan de aparte jonge-vogels-kenmerken en blijf bij twijfel voorzichtig.',
  },
  {
    label: 'Stormmeeuw en Zilvermeeuw · volwassen',
    birds: [
      {id: 'sp096', source: 'stormmeeuw', marks: 'Kleiner, met een fijnere snavel, donker oog en geelgroene poten.'},
      {id: 'sp094', source: 'zilvermeeuw', marks: 'Groter, met een stevige gele snavel, licht oog en roze poten.'},
    ],
    tip: 'Kijk naar oog, poten en snavel samen. Formaat helpt vooral als beide vogels even ver weg staan.',
  },
  {
    label: 'Smient en Krakeend · vrouwtjes',
    birds: [
      {id: 'sp130', source: 'smient', plumage: 'adult_f', marks: 'Korte blauwgrijze snavel en variabel rossig of grijsbruin verenkleed.'},
      {id: 'sp129', source: 'krakeend', plumage: 'adult_f', marks: 'Oranje langs de zijkant van de snavel en een witte spiegel die in vlucht goed opvalt.'},
    ],
    rows: [
      {label: 'Snavel', values: ['Kort, blauwgrijs met donkere punt.', 'Langer, donker van boven met oranje zijkanten.']},
      {label: 'Kop en bouw', values: ['Rondere kop en compacte bouw.', 'Minder ronde kop en langgerekter profiel.']},
    ],
    tip: 'Bekijk eerst de snavelkleur en wacht zo nodig op een beter zij- of vleugelaanzicht.',
  },
  {
    label: 'Grote en Kleine Mantelmeeuw · volwassen',
    birds: [
      {id: 'sp164', source: 'grote-mantelmeeuw', photo: '/assets/species/plumage/sp164-adult.webp', marks: 'Zwaar gebouwd, met roze poten, een forse snavel en een bijna zwarte mantel.'},
      {id: 'sp095', source: 'kleine-mantelmeeuw', photo: '/assets/species/sp095.webp', marks: 'Slanker, met gele poten, een fijnere snavel en een donkergrijze mantel.'},
    ],
    rows: [
      {label: 'Poten', values: ['Roze', 'Geel']},
      {label: 'Bouw en snavel', values: ['Zwaar gebouwd met een forse snavel', 'Slanker met een fijnere snavel']},
      {label: 'Mantel', values: ['Bijna zwart', 'Donkergrijs']},
    ],
    tip: 'Combineer pootkleur met bouw en snavel. Mantelkleur alleen kan door het licht misleiden.',
  },
  {
    label: 'Kokmeeuw en Stormmeeuw · volwassen in winterkleed',
    birds: [
      {id: 'sp097', source: 'kokmeeuw', plumage: 'winter', marks: 'Vaak een donkere oorvlek op de witte kop. In vlucht een opvallend witte vleugelvoorrand.'},
      {id: 'sp096', source: 'stormmeeuw', plumage: 'winter', textOnly: true, marks: 'Groter en zwaarder gebouwd. Vaak verspreide grijze tekening op kop en nek; geelgroene poten.'},
    ],
    tip: 'Bekijk koptekening en poten samen. In vlucht helpt de witte vleugelvoorrand van de Kokmeeuw.',
  },
  {
    label: 'Grote Gele Kwikstaart en Gele Kwikstaart · volwassen',
    birds: [
      {id: 'sp288', source: 'grote-gele-kwikstaart', plumage: 'adult_m', marks: 'Grijze mantel, opvallend lange staart en bruinroze poten. Vaak aan stromend water.'},
      {id: 'sp069', source: 'gele-kwikstaart', plumage: 'adult_m', marks: 'Doorgaans olijfgroene mantel en donkere poten. Vaak op akkers of in open grasland.'},
    ],
    tip: 'Let op mantel, poten en staartverhouding. Gebruik de omgeving als extra aanwijzing.',
  },
  {
    label: 'Oeverzwaluw en Huiszwaluw',
    birds: [
      {id: 'sp116', source: 'oeverzwaluw', textOnly: true, marks: 'Bruine bovenzijde en een duidelijke bruine borstband boven de witte buik.'},
      {id: 'sp115', source: 'huiszwaluw', textOnly: true, marks: 'Witte keel en buik zonder borstband. In vlucht valt de witte stuit op.'},
    ],
    tip: 'Begin bij de borstband en de stuit. Een snelle glimp van alleen de staart is vaak onvoldoende.',
  },
  {
    label: 'Gierzwaluw en Boerenzwaluw',
    birds: [
      {id: 'sp141', source: 'gierzwaluw', plumage: 'adult_m', marks: 'Vrijwel geheel donker silhouet, lange sikkelvleugels en korte vorkstaart.'},
      {id: 'sp114', source: 'boerenzwaluw', textOnly: true, marks: 'Roestrode keel, lichte onderzijde en bij volwassen vogels lange buitenste staartpennen.'},
    ],
    tip: 'Let op vleugelvorm en staart. Bij tegenlicht is het silhouet bruikbaarder dan de kleur.',
  },
  {
    label: 'Fazant en Patrijs · volwassen',
    birds: [
      {id: 'sp105', source: 'fazant', plumage: 'adult_f', marks: 'De hen heeft een lange, gebandeerde staart en een bruin gevlekt kleed.'},
      {id: 'sp106', source: 'patrijs', marks: 'Compacte bouw met korte roestrode staart. Volwassen vogels hebben een oranjebruin gezicht.'},
    ],
    rows: [
      {label: 'Staart', values: ['Lang en gebandeerd', 'Kort en roestrood']},
      {label: 'Kleed', values: ['Bruin met donkere vlekken', 'Oranjebruin gezicht en grijze borst bij volwassen vogels']},
    ],
    tip: 'Bekijk de volledige staart. Een juveniele Fazant heeft een kortere staart dan een hen.',
  },
  {
    label: 'Gierzwaluw en Boerenzwaluw · in vlucht',
    flight: true,
    birds: [
      {id: 'sp141', source: 'gierzwaluw', marks: 'Lange sikkelvleugels, donker lichaam en een gevorkte staart.'},
      {id: 'sp114', source: 'boerenzwaluw', marks: 'Lichte onderzijde en bij volwassen vogels lange buitenste staartpennen.'},
    ],
    rows: [
      {label: 'Lichte delen', values: ['Kleine, vaak moeilijk zichtbare keelvlek', 'Lichte onderzijde met roodbruine keel']},
      {label: 'Vliegbeeld', values: ['Lange sikkelvleugels en gevorkte staart', 'Lange buitenste staartpennen bij volwassen vogels']},
    ],
    tip: 'Begin bij het silhouet. Tegenlicht kan een lichte onderzijde donker doen lijken.',
  },
  {
    label: 'Gierzwaluw en Huiszwaluw · in vlucht',
    flight: true,
    birds: [
      {id: 'sp141', source: 'gierzwaluw', marks: 'Lange sikkelvleugels, donker lichaam en een gevorkte staart.'},
      {id: 'sp115', source: 'huiszwaluw', marks: 'Witte stuit, witte onderzijde en een korte, gevorkte staart.'},
    ],
    rows: [
      {label: 'Lichte delen', values: ['Kleine, vaak moeilijk zichtbare keelvlek', 'Witte onderzijde en witte stuit']},
      {label: 'Vliegbeeld', values: ['Lange sikkelvleugels en gevorkte staart', 'Korte, gevorkte staart']},
    ],
    tip: 'Bekijk ook de stuit als de vogel wegvliegt.',
  },
  {
    label: 'Visdief en Noordse Stern · broedkleed',
    birds: [
      {id: 'sp165', source: 'visdief', plumage: 'breeding', marks: 'Langere oranjerode snavel, meestal met zwarte punt. In zit langere poten. In vlucht vaak een donkere wig op de buitenste handpennen.'},
      {id: 'sp166', source: 'noordse-stern', plumage: 'breeding', marks: 'Kortere, doorgaans geheel bloedrode snavel en zeer korte poten. In vlucht bij goed licht meer doorschijnende handpennen.'},
    ],
    tip: 'Gebruik snavel en poten in zit. Bekijk in vlucht de handpennen. De lichtval bepaalt hoeveel doorschijnendheid je ziet.',
  },
  {
    label: 'Grote Stern en Visdief · broedkleed',
    birds: [
      {id: 'sp167', source: 'grote-stern', plumage: 'breeding', marks: 'Zwarte snavel met gele punt, rafelige kuif en zwarte poten.'},
      {id: 'sp165', source: 'visdief', plumage: 'breeding', marks: 'Oranjerode snavel met meestal zwarte punt en rode poten.'},
    ],
    tip: 'Kijk bij twijfel naar de volledige snavel en pootkleur. De gele punt kan op afstand wegvallen.',
  },
  {
    label: 'Sperwer, Havik en Torenvalk · in vlucht',
    flight: true,
    birds: [
      {id: 'sp006', source: 'sperwer', marks: 'Relatief korte, brede vleugels, kleine kop en lange staart met vaak hoekige uiteinden. Wisselt snelle vleugelslagen af met glijden.'},
      {id: 'sp007', source: 'havik', marks: 'Forse borst en een kop die verder uitsteekt. De vleugels zijn langer in verhouding tot de staart. Volwassen vogels hebben fijne dwarsbanden op de onderzijde.'},
      {id: 'sp008', source: 'torenvalk', marks: 'In doorgaande vlucht puntigere vleugels. Bij het bidden spreidt de vogel zijn lange staart vaak waaiervormig.'},
    ],
    tip: 'Vergelijk eerst vleugelvorm, staart en bouw. De foto’s tonen verschillende vlieghoudingen; gebruik schijnbare grootte alleen als extra aanwijzing.',
  },
  {
    label: 'Houtduif, Holenduif en Turkse Tortel · in vlucht',
    flight: true,
    birds: [
      {id: 'sp002', source: 'houtduif', marks: 'Brede witte vleugelbanden. Volwassen vogels hebben ook een witte halsvlek.'},
      {id: 'sp003', source: 'holenduif', marks: 'Grijze vleugels met donkere randen. Een brede witte vleugelband ontbreekt.'},
      {id: 'sp004', source: 'turkse-tortel', marks: 'Lichte vleugelvelden en een lange staart met lichte buitenste staartpennen.'},
    ],
    tip: 'Vergelijk de vleugeltekening en de staart. De foto’s tonen verschillende hoeken en afstanden.',
  },
  {
    label: 'Grote, Kleine en Middelste Bonte Specht · in vlucht',
    flight: true,
    birds: [
      {id: 'sp016', source: 'grote-bonte-specht', marks: 'Grote witte schoudervlekken en een rode onderstaart.'},
      {id: 'sp017', source: 'kleine-bonte-specht', photoMissing: 'vluchtcontrole 2026-11-10: geen geschikte vluchtfoto', marks: 'Lichte dwarsbanden op de rug, zonder grote witte schoudervlek of rode onderstaart.'},
      {id: 'sp020', source: 'middelste-bonte-specht', marks: 'Gestreepte flanken en een roze onderstaart. Op deze foto vallen vooral de vleugeltekening en onderzijde op.'},
    ],
    tip: 'Combineer het rugpatroon, de flankstrepen en de kleur van de onderstaart. De foto’s tonen verschillende hoeken.',
  },
  {
    label: 'Groene en Zwarte Specht · in vlucht',
    flight: true,
    birds: [
      {id: 'sp019', source: 'groene-specht', marks: 'Groene bovendelen en een geelgroene stuit. In doorvlucht maakt de soort duidelijke golven.'},
      {id: 'sp018', source: 'zwarte-specht', marks: 'Vrijwel geheel zwart met rood op de kop en een lichte snavel. De slagvlucht is rechter.'},
    ],
    tip: 'Vergelijk op de foto’s het zijaanzicht en de stuitkleur. Beoordeel een rechte of golvende vlucht pas als je de vogel langer ziet vliegen.',
  },
  {
    label: 'Zwarte Kraai en Kauw · in vlucht',
    flight: true,
    birds: [
      {id: 'sp022', source: 'zwarte-kraai', marks: 'Geheel zwart, met een stevige snavel en brede vleugels met gespreide punten.'},
      {id: 'sp025', source: 'kauw', photoMissing: 'vluchtcontrole 2026-11-10: geen geschikte vluchtfoto', marks: 'Compactere bouw, kortere snavel en grijze nek. Van dichtbij valt het lichte oog op.'},
    ],
    tip: 'Vergelijk kop en snavel. Tegen fel tegenlicht kan de grijze nek van de Kauw donker lijken.',
  },
  {
    label: 'Gaai en Ekster · in vlucht',
    flight: true,
    birds: [
      {id: 'sp026', source: 'gaai', marks: 'Rozegrijs lichaam en blauw-zwart gebandeerd vleugelveld. Van achteren valt de witte stuit op.'},
      {id: 'sp021', source: 'ekster', marks: 'Zwart-wit met brede witte vleugelvelden en een lange, smalle staart.'},
    ],
    rows: [
      {label: 'Vleugel', values: ['Klein blauw veld met donkere dwarsbandjes.', 'Breed wit veld in de handvleugel.']},
      {label: 'Silhouet', values: ['Kortere zwarte staart en witte stuit.', 'Lange, smalle staart die ver achter het lichaam uitsteekt.']},
    ],
    tip: 'Kijk eerst naar staartlengte en vleugeltekening. De witte stuit van de Gaai is het best van achteren te zien.',
  },
  {
    label: 'Koolmees en Pimpelmees · in vlucht',
    flight: true,
    birds: [
      {id: 'sp029', source: 'koolmees', marks: 'Zwarte kop met witte wangen. Op de gele onderzijde loopt een donkere middenstreep.'},
      {id: 'sp030', source: 'pimpelmees', marks: 'Blauwe kruin en een donkere oogstreep door het witte gezicht.'},
    ],
    rows: [
      {label: 'Kop', values: ['Zwarte kop met één groot wit wangveld.', 'Blauwe kruin en donkere oogstreep door het witte gezicht.']},
      {label: 'Buik', values: ['Gele buik met een donkere middenstreep.', 'Gele buik, doorgaans zonder doorlopende donkere middenstreep.']},
    ],
    tip: 'Beide hebben een gele buik. Kijk naar de koptekening als de vogel dicht genoeg langs vliegt.',
  },
  {
    label: 'Glanskop en Matkop · in vlucht',
    flight: true,
    birds: [
      {id: 'sp032', source: 'glanskop', photoMissing: 'vluchtcontrole 2026-11-10: geen geschikte vluchtfoto', marks: 'Kleine mees met donkere kruin. In vlucht zijn de kleine verschillen met Matkop lastig te zien.'},
      {id: 'sp031', source: 'matkop', photoMissing: 'vluchtcontrole 2026-11-10: geen geschikte vluchtfoto', marks: 'Lijkt sterk op Glanskop. Een licht vleugelveld is vaak bruikbaar bij goed zicht.'},
    ],
    tip: 'Van beide soorten is nog geen geschikte vluchtfoto. Luister bij twijfel naar de roep en bekijk de kop en gevouwen vleugel bij goed licht.',
  },
  {
    label: 'Groenling en Sijs · in vlucht',
    flight: true,
    birds: [
      {id: 'sp036', source: 'groenling', marks: 'Stevige snavel en forsere bouw. Het geel valt op langs de buitenste vleugelpennen.'},
      {id: 'sp038', source: 'sijs', marks: 'Kleinere, fijnere snavel en een gele vleugelband. Het mannetje op de foto heeft een zwarte kruin.'},
    ],
    tip: 'Vergelijk snavelvorm en vleugeltekening. De opnamen zijn op verschillende afstanden gemaakt.',
  },
  {
    label: 'Putter en Sijs · mannetjes in rust',
    birds: [
      {id: 'sp037', source: 'putter', plumage: 'adult_m', marks: 'Zwart-witte kop met rood masker, en een brede gele vleugelbaan op de gevouwen vleugel.'},
      {id: 'sp038', source: 'sijs', plumage: 'adult_m', marks: 'Zwarte kruin en kin, groen-gele borst en een scherp afgetekende gele vleugelstreep.'},
    ],
    rows: [
      {label: 'Kop', values: ['Rood masker met zwart-wit', 'Zwarte kruin en kin bij dit mannetje']},
      {label: 'Vleugel', values: ['Brede gele band op zwarte vleugel', 'Gele vleugelstreep op zwarte vleugel']},
      {label: 'Bouw', values: ['Stevigere, spits-driehoekige snavel', 'Kleinere, fijnere snavel']},
    ],
    tip: 'Begin bij kop en snavel op de rustfoto’s. Het rode masker van Putter ontbreekt bij jonge vogels.',
  },
  {
    label: 'Putter en Sijs · juvenielen in rust',
    birds: [
      {id: 'sp037', source: 'putter', plumage: 'juv', marks: 'Jonge Putter met grijsbruine kop zonder volwassen rode masker, maar al een brede gele vleugelband.'},
      {id: 'sp038', source: 'sijs', plumage: 'juv', marks: 'Jonge Sijs met gestreepte kop en onderzijde, gele vleugeltekening en fijnere snavel.'},
    ],
    rows: [
      {label: 'Kop', values: ['Grijsbruin, zonder rode masker', 'Bruinig en duidelijk gestreept']},
      {label: 'Vleugel', values: ['Brede gele band op donkere vleugel', 'Gele streep met donkere tekening']},
      {label: 'Snavel', values: ['Spitse zaadsnavel', 'Fijner en smaller']},
    ],
    tip: 'Bij jonge vogels is kleur alleen niet voldoende. Gebruik een duidelijk zijaanzicht van snavel, vleugel én flank, en luister indien mogelijk.',
  },
  {
    label: 'Putter en Sijs · in vlucht',
    flight: true,
    birds: [
      {id: 'sp037', source: 'putter', marks: 'Brede gele vleugelband. Bij volwassen vogels valt ook het rode gezicht op.'},
      {id: 'sp038', source: 'sijs', marks: 'Gele vleugelband en fijnere bouw. Het mannetje op de foto heeft een zwarte kruin.'},
    ],
    tip: 'Bekijk de vleugel samen met kop en staart. Bij een juveniele Putter is het rode masker nog afwezig.',
  },
  {
    label: 'Huismusvrouwtje en Ringmus · in rust',
    birds: [
      {id: 'sp043', source: 'huismus', plumage: 'adult_f', marks: 'Vrouwtje Huismus met vrijwel effen bruine kop, lichte wenkbrauwstreep en zonder afzonderlijke zwarte wangvlek.'},
      {id: 'sp044', source: 'ringmus', marks: 'Ringmus met kastanjebruine kruin, opvallende zwarte wangvlek en lichte nekring. Mannetje en vrouwtje hebben hetzelfde kleed.'},
    ],
    rows: [
      {label: 'Wang', values: ['Geen afzonderlijke zwarte wangvlek', 'Zwarte wangvlek op lichte wang']},
      {label: 'Kruin', values: ['Licht- tot grijzerbruin', 'Duidelijk kastanjebruin']},
      {label: 'Nek', values: ['Geen gesloten witte nekring', 'Lichte nekring']},
    ],
    tip: 'De Ringmus op de foto is niet op uiterlijk als mannetje of vrouwtje te bepalen. Vergelijk de zwarte wangvlek en het kopprofiel.',
  },
  {
    label: 'Huismus en Ringmus · juvenielen in rust',
    birds: [
      {id: 'sp043', source: 'huismus', plumage: 'juv', marks: 'Jonge Huismus overwegend bruin, lichte snavelbasis en geen losse donkere wangvlek.'},
      {id: 'sp044', source: 'ringmus', plumage: 'juv', marks: 'Jonge Ringmus bruine kruin en zachtere, vaak minder contrastrijke donkere wangvlek.'},
    ],
    rows: [
      {label: 'Wang', values: ['Geen kenmerkende losse zwarte wangvlek', 'Kan minder opvallend zijn dan bij adult']},
      {label: 'Kruin', values: ['Overwegend lichtbruin', 'Bruin; koptekening ontwikkelt zich']},
      {label: 'Ondersteuning', values: ['Let ook op snavelbasis en oudervogels', 'Let ook op nekring en contactroep']},
    ],
    tip: 'Een juveniel met weinig contrast is niet uitsluitend op de wangvlek vast te stellen. Dit paar is een hulpmiddel, geen zelfstandig zekere determinatie.',
  },
  {
    label: 'Huismus en Ringmus · in vlucht',
    flight: true,
    birds: [
      {id: 'sp043', source: 'huismus', marks: 'De man op de foto heeft een grijze kruin en een zwarte bef.'},
      {id: 'sp044', source: 'ringmus', marks: 'Roodbruine kruin en een zwarte vlek op de lichte wang.'},
    ],
    tip: 'Kijk bij een goed zicht op de kop eerst naar de kruin en de wang. Bij de Huismus op de foto ontbreekt een losse wangvlek.',
  },
  {
    label: 'Merel en Zanglijster · juvenielen in rust',
    birds: [
      {id: 'sp045', source: 'merel', plumage: 'juv', marks: 'Jonge Merel met bruin verenkleed, bruinig gevlekte borst, langere staart en relatief forse bouw.'},
      {id: 'sp046', source: 'zanglijster', plumage: 'juv', marks: 'Jonge Zanglijster met lichtere onderzijde, donkerdere pijlpuntige borsttekening en kortere staart.'},
    ],
    rows: [
      {label: 'Grondkleur borst', values: ['Overwegend bruin', 'Veel lichter/crème met contrasterende vlekken']},
      {label: 'Borsttekening', values: ['Minder regelmatige vlekking op bruine grond', 'Vaak donkere, pijlpuntige vlekken']},
      {label: 'Bouw', values: ['Relatief groot, langere staart', 'Compacter, kortere staart']},
    ],
    tip: 'Bij verse juvenielen kunnen patronen overlappen. Kijk naar volledige vogel, grondkleur en staart, niet naar één enkel vlekje.',
  },
  {
    label: 'Merel en Zanglijster · volwassen',
    birds: [
      {id: 'sp045', source: 'merel', plumage: 'adult_f', marks: 'Bruine onderzijde, licht getekende borst en relatief lange staart.'},
      {id: 'sp046', source: 'zanglijster', marks: 'Lichte onderzijde met donkere vlekken en een kortere staart.'},
    ],
    rows: [
      {label: 'Borst en buik', values: ['Bruin met een lichtere, getekende borst', 'Licht met duidelijke donkere vlekken']},
      {label: 'Staart', values: ['Relatief lang', 'Relatief kort']},
    ],
    tip: 'Kijk bij een bruine vogel naar de grondkleur onder de vlekken. Ook een jonge Merel kan sterk gevlekt zijn.',
  },
  {
    label: 'Zanglijster en Grote Lijster · juvenielen in rust',
    birds: [
      {id: 'sp046', source: 'zanglijster', plumage: 'juv', marks: 'Jonge Zanglijster met warmbruine rug en opvallend lichte vlekjes op de bovendelen, donkere borstvlekken en relatief compacte bouw.'},
      {id: 'sp049', source: 'grote-lijster', plumage: 'juv', marks: 'Jonge Grote Lijster met lichte vlekken op de rug, smalle lichte lengtestreepjes op de vleugeldekveren en doorgaans forsere bouw.'},
    ],
    rows: [
      {label: 'Bovendelen', values: ['Warmbruine rug met lichte vlekjes', 'Lichter getekend op rug en vleugeldekveren']},
      {label: 'Borst', values: ['Donkere vlekken, vaak pijlpuntiger', 'Donkere vlekken op relatief bleke grond']},
      {label: 'Bouw', values: ['Doorgaans compacter', 'Doorgaans groter en forser']},
    ],
    tip: 'Een enkele vlek is bij jonge lijsters niet beslissend. Vergelijk de complete vogel en wees voorzichtig met leeftijds- en soortlabels als de kenmerken niet goed zichtbaar zijn.',
  },
  {
    label: 'Zanglijster en Grote Lijster · volwassen',
    birds: [
      {id: 'sp046', source: 'zanglijster', marks: 'Warmbruin van boven, vaak pijlpuntige borstvlekken.'},
      {id: 'sp049', source: 'grote-lijster', marks: 'Grijzer van boven, rondere borstvlekken en groter postuur.'},
    ],
    rows: [
      {label: 'Borstvlekken', values: ['Vaak pijlpuntig', 'Doorgaans ronder']},
      {label: 'Bovendelen', values: ['Warmbruin', 'Bleker en grijzer']},
      {label: 'Ondervleugeldekveren', values: ['Warmbeige', 'Wit']},
    ],
    tip: 'Bekijk meerdere borstvlekken en het postuur. De ondervleugel is vooral bruikbaar in daglicht zonder sterk tegenlicht.',
  },
  {
    label: 'Kramsvogel en Koperwiek · volwassen',
    birds: [
      {id: 'sp047', source: 'kramsvogel', marks: 'Grijze kop en stuit, warmbruine mantel.'},
      {id: 'sp048', source: 'koperwiek', marks: 'Brede lichte wenkbrauwstreep en roestrode flanken.'},
    ],
    rows: [
      {label: 'Kop', values: ['Overwegend grijs bij volwassen vogels', 'Duidelijke lichte wenkbrauwstreep']},
      {label: 'Borstgrondkleur', values: ['Oranjegele tint met donkere vlekken', 'Witachtige grondkleur met donkere streping']},
      {label: 'Flank', values: ['Geen opvallend koperrode flank', 'Duidelijke koperrode flank']},
    ],
    tip: 'Controleer kop, borstgrondkleur en flank op de rustfoto. Jonge Kramsvogels zijn minder contrastrijk; ondervleugel is hier geen verplicht zichtbaar kenmerk.',
  },
  {
    label: 'Koperwiek en Zanglijster · volwassen',
    birds: [
      {id: 'sp048', source: 'koperwiek', marks: 'Brede roomwitte wenkbrauwstreep en roestrode flanken.'},
      {id: 'sp046', source: 'zanglijster', marks: 'Minder opvallende wenkbrauw en donkere vlekken op de lichte onderzijde.'},
    ],
    rows: [
      {label: 'Kop', values: ['Brede roomwitte wenkbrauw- en lichte mondstreep', 'Geen opvallend lichte oog- en mondstrepen']},
      {label: 'Flanken', values: ['Koperrood, ook in rust vaak zichtbaar', 'Geen koperrode flankvlek']},
      {label: 'Borst', values: ['Witachtig met sterke donkere streping', 'Lichte onderzijde met pijlpuntige vlekken']},
    ],
    tip: 'Gebruik een scherpe zijfoto van kop én flank; de koperrode ondervleugel is geen vereiste voor determinatie in rust.',
  },
  {
    label: 'Kievit en Zilverplevier · volwassen',
    birds: [
      {id: 'sp099', source: 'kievit', plumage: 'adult_m', marks: 'Kuif, metaalgroene rug en witte buik onder een donkere borst.'},
      {id: 'sp144', source: 'zilverplevier', marks: 'Geen kuif. Grijs getekende bovenzijde.'},
    ],
    rows: [
      {label: 'Kop', values: ['Opstaande kuif', 'Geen kuif']},
      {label: 'Bovendelen', values: ['Groen-paarse glans bij goed licht', 'Grijze tekening']},
    ],
    tip: 'Kijk naar kop en rug samen. Een jonge Kievit heeft een korte kuif en een doffer, bruiner kleed.',
  },
  {
    label: 'Veldleeuwerik en Graspieper · in rust',
    birds: [
      {id: 'sp070', source: 'veldleeuwerik', marks: 'Robuuste bruingestreepte leeuwerik met korte soms opgerichte kuif, relatief stevige snavel en duidelijk gestreepte bovenborst.'},
      {id: 'sp072', source: 'graspieper', marks: 'Slankere bruingestreepte pieper met fijne snavel, duidelijke lichte oogring en zware streping langs de flanken.'},
    ],
    rows: [
      {label: 'Kop en snavel', values: ['Soms korte, stompe kuif en relatief forse snavel', 'Geen kuif, fijne snavel en lichte oogring']},
      {label: 'Borst en flanken', values: ['Bruine borststrepen boven een overwegend lichte buik', 'Donkere strepen lopen nadrukkelijk door over de flanken']},
      {label: 'Geluid', values: ['Zeer gevarieerde, lang aangehouden zangvlucht', 'Korter, hoog aflopend zangriedeltje en hoge psiep-roep']},
    ],
    tip: 'Twee echte rustfoto’s. Vergelijk oogring, kuif en flankstreping; foto-uitsnedes zijn geen betrouwbare maatvergelijking.',
  },
  {
    label: 'Veldleeuwerik en Graspieper · in vlucht',
    flight: true,
    birds: [
      {id: 'sp070', source: 'veldleeuwerik', marks: 'Lang volgehouden hoge zangvlucht. In goed licht lichte achterrand van de vleugel en witte staartzijden.'},
      {id: 'sp072', source: 'graspieper', marks: 'Kleinere gestreepte pieper met stijgende of dalende zangvlucht en hoge herhaalde roep.'},
    ],
    rows: [
      {label: 'Zangvlucht', values: ['Langdurig, hoog en zeer gevarieerd', 'Kortere zangvlucht met een reeks hoge, aflopende tonen']},
      {label: 'Vleugel', values: ['Relatief brede vleugel en smalle lichte vleugelachterrand', 'Slanker vliegbeeld met zichtbare vleugelstrepen']},
      {label: 'Staart', values: ['Witte buitenste staartpennen bij goed zicht', 'Ook witte buitenste staartpennen; dus niet op dit kenmerk alleen determineren']},
    ],
    tip: 'Beide beelden tonen bewezen vrije vlucht. Bepaal de soort vooral via vluchtpatroon, geluid en meerdere kenmerken; niet via de schijnbare grootte van de foto’s.',
  },
  {
    label: 'Graspieper en Boompieper · veldkenmerken',
    birds: [
      {id: 'sp072', source: 'graspieper', marks: 'Fijne snavel. De borst- en flankstrepen zijn ongeveer even breed.'},
      {id: 'sp073', source: 'boompieper', textOnly: true, marks: 'Iets forsere snavel en dunnere flankstreepjes dan borststrepen.'},
    ],
    rows: [
      {label: 'Flanken', values: ['Strepen ongeveer even breed als op de borst', 'Strepen duidelijk fijner dan op de borst']},
      {label: 'Achternagel', values: ['Doorgaans langer', 'Doorgaans korter']},
    ],
    tip: 'Begin bij de flankstreping. Een scherpe zijfoto kan de nagel tonen. Bij twijfel helpt een duidelijke roep of zang.',
  },
  {
    label: 'Zanglijster en Kramsvogel · volwassen in rust',
    birds: [
      {id: 'sp046', source: 'zanglijster', marks: 'Warmbruin van boven met een vrij egaal bruine kop, lichte borst en donkere, vaak pijlpuntige vlekken.'},
      {id: 'sp047', source: 'kramsvogel', marks: 'Overwegend grijze kop en stuit, kastanjebruine mantel en oranjegele, gevlekte borst.'},
    ],
    rows: [
      {label: 'Kop', values: ['Bruin zonder lichtgrijze kap', 'Grijs, contrasterend met de rug']},
      {label: 'Borst', values: ['Licht met donkere pijlpuntige vlekken', 'Oranjegeel getint met donkere vlekken']},
      {label: 'Rug en stuit', values: ['Egaal bruin', 'Bruine mantel en grijze stuit']},
    ],
    tip: 'Beoordeel de volledige vogel van opzij. Bij juvenielen zijn de kopkleuren minder uitgesproken; gebruik dan een apart jeugdvergelijkingspaar.',
  },
  {
    label: 'Zanglijster en Kramsvogel · juvenielen in rust',
    birds: [
      {id: 'sp046', source: 'zanglijster', plumage: 'juv', marks: 'Jonge Zanglijster met warme bruine kop, lichte vlekken op rug en vleugeldekveren en gevlekte onderzijde.'},
      {id: 'sp047', source: 'kramsvogel', plumage: 'juv', marks: 'Jonge Kramsvogel op tak met minder contrasterende grijsbruine kop, vale mantel en gevlekte borst.'},
    ],
    rows: [
      {label: 'Kop', values: ['Vrij egaal warmbruin', 'Grijsbruin, minder uitgesproken dan adult']},
      {label: 'Bovendelen', values: ['Lichte vlekjes op bruine veren', 'Valere tint en minder contrasterende kop/rug']},
      {label: 'Gehele bouw', values: ['Doorgaans kleiner en compacter', 'Doorgaans groter en forser']},
    ],
    tip: 'Een jeugdkleed kan soorten meer op elkaar laten lijken. Combineer kop, bouw, borst en context; de twee oorspronkelijke opnamen zijn door hun fotografen als juveniel beschreven.',
  },
  {
    label: 'Zanglijster en Kramsvogel · in vlucht',
    flight: true,
    birds: [
      {id: 'sp046', source: 'zanglijster', marks: 'Warm geelbruine ondervleugeldekveren en donkere vlekken op borst en flanken.'},
      {id: 'sp047', source: 'kramsvogel', marks: 'Lichte ondervleugeldekveren, gevlekte borst en een lange staart met een donker uiteinde.'},
    ],
    tip: 'Vergelijk de kleur van de ondervleugels en kijk ook naar de staart. Tegenlicht kan lichte veren donkerder laten lijken.',
  },
  {
    label: 'Roodborst en Roodborsttapuit · juvenielen in rust',
    birds: [
      {id: 'sp050', source: 'roodborst', plumage: 'juv', marks: 'Jonge Roodborst is bruin en lichtgevlekt zonder de oranjerode borst van een volwassen vogel.'},
      {id: 'sp053', source: 'roodborsttapuit', plumage: 'juv', marks: 'Jonge Roodborsttapuit is lichtbruin en gespikkeld, vaak met meer contrast aan de vleugeldekveren en een andere lichaamsbouw.'},
    ],
    rows: [
      {label: 'Rode borst', values: ['Ontbreekt bij jonge vogels', 'Ook hier geen volwassen oranje borst verwachten']},
      {label: 'Vleugels', values: ['Bruin met lichte spikkels', 'Lichte vlekjes en meer contrasterende dekveren']},
      {label: 'Context', values: ['Vaak beschut bij bos of tuin', 'Vaak op een zichtbare uitkijkpost in open terrein']},
    ],
    tip: 'Twee gespikkelde jonge vogels zijn niet altijd met één foto zeker te onderscheiden. Gebruik snavel, vleugel, hele bouw en eventueel oudervogels of geluid; leefgebied alleen is onvoldoende.',
  },
  {
    label: 'Roodborsttapuit en Roodborst · vrouwtje en volwassen vogel in rust',
    birds: [
      {id: 'sp053', source: 'roodborsttapuit', plumage: 'adult_f', marks: 'Vrouwtje Roodborsttapuit met bruine kop, oranje borst en een lichte vleugeltekening.'},
      {id: 'sp050', source: 'roodborst', marks: 'Volwassen Roodborst met oranjerood gezicht én borst; man en vrouw hebben hetzelfde kleed.'},
    ],
    rows: [
      {label: 'Oranje', values: ['Vooral op de borst, bruin gezicht', 'Ook op het hele gezicht en de keel']},
      {label: 'Vleugel', values: ['Witte vleugelvlekjes bij het vrouwtje', 'Effen bruine vleugel zonder dezelfde opvallende vlekjes']},
    ],
    tip: 'De oranje borst alleen is onvoldoende. Kijk naar het gezicht en de gevouwen vleugel; deze vergelijking gebruikt bestaande rustfoto’s.',
  },
  {
    label: 'Roodborst en Heggenmus · volwassen',
    birds: [
      {id: 'sp050', source: 'roodborst', marks: 'Oranjerood gezicht en borst, met een overwegend effen bruine rug.'},
      {id: 'sp054', source: 'heggenmus', marks: 'Blauwgrijze kop en borst, met bruin gestreepte rug.'},
    ],
    tip: 'Bekijk borst en rug samen. Een juveniele Roodborst heeft nog geen oranjerode borst.',
  },
  {
    label: 'Heggenmus en Huismus · vrouwtje Huismus in rust',
    birds: [
      {id: 'sp054', source: 'heggenmus', marks: 'Fijne, spitse snavel en blauwgrijze kop en borst. De gestreepte bruine rug is geen onderscheid op zichzelf.'},
      {id: 'sp043', source: 'huismus', plumage: 'adult_f', marks: 'Vrouwtje met forse kegelsnavel, lichtbruine kop en zichtbare lichte wenkbrauwstreep.'},
    ],
    rows: [
      {label: 'Snavel', values: ['Smalle, puntige insecteneterssnavel', 'Stevige, korte kegelvormige zaadeterssnavel']},
      {label: 'Kop', values: ['Blauwgrijs bij volwassen vogels', 'Lichtbruin met lichte wenkbrauwstreep']},
      {label: 'Rug', values: ['Bruin gestreept', 'Ook bruin gestreept: niet doorslaggevend']},
    ],
    tip: 'Vergelijk vooral de snavel van opzij. De twee rustfoto’s mogen niet op afbeeldingsschaal worden vergeleken.',
  },
  {
    label: 'Winterkoning en Heggenmus · in rust',
    birds: [
      {id: 'sp055', source: 'winterkoning', marks: 'Zeer compact, warmbruin en met een korte, vaak opgeheven staart en lichte wenkbrauw.'},
      {id: 'sp054', source: 'heggenmus', marks: 'Slanker met blauwgrijze kop en borst, bruin gestreepte rug en langer ogende staart.'},
    ],
    rows: [
      {label: 'Staart', values: ['Kort, vaak opvallend opgericht', 'Relatief langer, meestal niet recht omhoog']},
      {label: 'Kop en borst', values: ['Warmbruin, lichte wenkbrauw', 'Overwegend grijzige kop en borst']},
      {label: 'Bouw', values: ['Rond en zeer compact', 'Slanker en groter']},
    ],
    tip: 'Beoordeel een vogel aan houding, kop en staart; foto-uitsnedes zijn geen betrouwbare maatvergelijking.',
  },
  {
    label: 'Winterkoning en Boomkruiper · veldkenmerken',
    birds: [
      {id: 'sp055', source: 'winterkoning', marks: 'Zeer klein en compact met een korte, vaak opgewipte staart.'},
      {id: 'sp066', source: 'boomkruiper', marks: 'Langere staart, gebogen snavel en witte onderzijde. Klimt langs de stam omhoog.'},
    ],
    tip: 'Kijk naar snavel en houding. Beide vogels hebben bruine bovendelen.',
  },
  {
    label: 'Grauwe en Bonte Vliegenvanger · vleugel en borst',
    birds: [
      {id: 'sp176', source: 'grauwe-vliegenvanger', marks: 'Fijne donkere streping op kruin en borst, met een betrekkelijk egaal bruine vleugel.'},
      {id: 'sp177', source: 'bonte-vliegenvanger', marks: 'Duidelijk licht vleugelveld. Het mannetje op de foto heeft donkere bovendelen.'},
    ],
    rows: [
      {label: 'Gevouwen vleugel', values: ['Vrij egaal, zonder opvallend wit veld', 'Duidelijk licht vleugelveld']},
      {label: 'Kruin en borst', values: ['Fijne donkere streping', 'Doorgaans zonder vergelijkbare fijne streping']},
    ],
    tip: 'Bekijk de vleugel ook bij een bruine Bonte Vliegenvanger. Beide soorten jagen vanuit een zitpost.',
  },
  {
    label: 'Zwarte en Gekraagde Roodstaart · mannetjes in rust',
    birds: [
      {id: 'sp051', source: 'zwarte-roodstaart', plumage: 'adult_m', marks: 'Volwassen mannetje met antracietgrijze tot zwarte borst, lichte vleugelvlek en roestrode staart.'},
      {id: 'sp178', source: 'gekraagde-roodstaart', plumage: 'adult_m', marks: 'Volwassen mannetje met oranjerode borst en buik, grijze kruin, witte voorhoofdsvlek, zwarte keel en roestrode staart.'},
    ],
    rows: [
      {label: 'Borst', values: ['Donkergrijs tot zwart', 'Oranjerood']},
      {label: 'Kop', values: ['Donker, geen helder wit voorhoofd', 'Wit voorhoofd boven zwart gezicht']},
      {label: 'Vleugel', values: ['Vaak een lichte vleugelvlek', 'Geen vergelijkbare witte vleugelvlek']},
    ],
    tip: 'Beoordeel beide volwassen mannetjes op een duidelijke rustfoto. In overgangskleed of bij jonge vogels werkt dit kleurverschil niet altijd; laat dan leeftijd en geslacht open.',
  },
  {
    label: 'Gekraagde en Zwarte Roodstaart · vrouwtje',
    birds: [
      {id: 'sp178', source: 'gekraagde-roodstaart', plumage: 'adult_f', marks: 'Grijsbruine rug en doorgaans warmere beige onderzijde.'},
      {id: 'sp051', source: 'zwarte-roodstaart', plumage: 'adult_f', marks: 'Koeler grijsbruin kleed, doorgaans met minder warme onderzijde.'},
    ],
    rows: [
      {label: 'Onderzijde', values: ['Vaak warm lichtbeige', 'Doorgaans koeler en meer egaal grijsbruin']},
      {label: 'Bovendelen', values: ['Warm grijsbruin met licht gezicht', 'Vrij egaal koel grijsbruin']},
      {label: 'Staart', values: ['Roestrood; op zichzelf niet diagnostisch', 'Ook roestrood; op zichzelf niet diagnostisch']},
    ],
    tip: 'Vrouwtjes kunnen sterk op elkaar lijken. Vergelijk warme of koele onderzijde in egaal licht en controleer ook roep en omgeving; de staartkleur alleen beslist niet.',
  },
  {
    label: 'Sijs en Groenling · vrouwtje',
    birds: [
      {id: 'sp038', source: 'sijs', plumage: 'adult_f', marks: 'Fijne, puntige snavel en donkere flankstrepen.'},
      {id: 'sp036', source: 'groenling', plumage: 'adult_f', marks: 'Forse kegelsnavel en grijsgroen kleed met geel langs de buitenste vleugelpennen.'},
    ],
    rows: [
      {label: 'Snavel', values: ['Fijn en puntig', 'Breed en stevig']},
      {label: 'Vleugel en flank', values: ['Gele band en donkere flankstrepen', 'Gele vleugelrand en meestal egalere flank']},
    ],
    tip: 'Bekijk de snavel en flank samen. Een jonge Groenling kan ook gestreept zijn.',
  },
  {
    label: 'Goudvink en Vink · vrouwtjes in rust',
    birds: [
      {id: 'sp040', source: 'goudvink', plumage: 'adult_f', marks: 'Zwarte kopkap, korte dikke zwarte snavel, beigegrijze onderzijde en witte vleugelband.'},
      {id: 'sp035', source: 'vink', plumage: 'adult_f', marks: 'Grijsbruine kop zonder zwarte kap, kleinere kegelsnavel en twee lichte vleugelstrepen.'},
    ],
    rows: [
      {label: 'Kop', values: ['Zwarte kap', 'Geen zwarte kap']},
      {label: 'Snavel', values: ['Kort en fors', 'Kleiner, kegelvormig']},
      {label: 'Vleugel', values: ['Eén lichte band', 'Twee lichte strepen']},
    ],
    tip: 'Vergelijk de vleugel en snavel in hetzelfde rustaanzicht. Kleurtinten kunnen bij slecht licht misleiden.',
  },
  {
    label: 'Goudvink en Vink · mannetje',
    birds: [
      {id: 'sp040', source: 'goudvink', plumage: 'adult_m', marks: 'Zwarte kap, korte zwarte snavel en roze-rode onderzijde.'},
      {id: 'sp035', source: 'vink', plumage: 'adult_m', marks: 'Blauwgrijze kruin in broedkleed en twee lichte vleugelstrepen.'},
    ],
    rows: [
      {label: 'Kruin', values: ['Zwart', 'Blauwgrijs in broedkleed']},
      {label: 'Vleugel', values: ['Eén lichte dwarsband', 'Twee lichte strepen']},
    ],
    tip: 'Beide mannetjes hebben een warme borst. Vergelijk ook kruin, snavel en vleugeltekening.',
  },
  {
    label: 'Kneu en Roodmus · mannetjes in rust',
    birds: [
      {id: 'sp039', source: 'kneu', marks: 'Mannetje met grijze nek, bruinige rug en karmijnrood op voorhoofd en borst; kleinere grijze snavel.'},
      {id: 'sp042', source: 'roodmus', marks: 'Volwassen mannetje met rood op kop, borst en stuit en een korte, duidelijk forse grijze snavel.'},
    ],
    rows: [
      {label: 'Roodverdeling', values: ['Voorhoofd en borst, grijze nek zichtbaar', 'Kop, borst en stuit nadrukkelijk rood']},
      {label: 'Snavel', values: ['Kleine grijze kegelsnavel', 'Kort, dik en opvallend zwaar']},
      {label: 'Rug en bouw', values: ['Warmbruin en kleiner', 'Steviger postuur en bruinige vleugels']},
    ],
    tip: 'De rode tekening helpt vooral bij volwassen mannetjes in passend seizoen. Vrouwtjes en onvolwassen Roodmussen zijn niet rood; combineer snavel, houding en geluid.',
  },
  {
    label: 'Appelvink en Vink · mannetje',
    birds: [
      {id: 'sp041', source: 'appelvink', plumage: 'adult_m', marks: 'Zware driehoekige snavel, grote kop en brede lichte vleugelband.'},
      {id: 'sp035', source: 'vink', plumage: 'adult_m', marks: 'Kleinere kegelsnavel, slankere kop en twee lichte vleugelstrepen.'},
    ],
    rows: [
      {label: 'Snavel', values: ['Zeer fors en driehoekig', 'Korte, kleinere kegel']},
      {label: 'Vleugel', values: ['Brede lichte band', 'Twee lichte strepen']},
    ],
    tip: 'De kleur van de Appelvinksnavel kan per seizoen verschillen. Vergelijk de vorm in zijaanzicht.',
  },
  {
    label: 'Appelvink en Vink · vrouwtjes in rust',
    birds: [
      {id: 'sp041', source: 'appelvink', plumage: 'adult_f', marks: 'Vrouwtje met forse snavel, dikke kop en nek, grijs vleugelveld en lichte vleugelband.'},
      {id: 'sp035', source: 'vink', plumage: 'adult_f', marks: 'Vrouwtje met kleinere kegelsnavel en twee duidelijke lichte vleugelstrepen.'},
    ],
    rows: [
      {label: 'Snavel', values: ['Zeer zwaar en driehoekig', 'Duidelijk kleiner en fijner']},
      {label: 'Kop', values: ['Groot, met stevige nek', 'Slanker, minder massief']},
      {label: 'Vleugel', values: ['Breed licht veld', 'Twee lichte strepen']},
    ],
    tip: 'Bekijk het profiel en de snavelvorm in dezelfde rusthouding. Kleurverschillen door seizoen en licht mogen de snavel niet overrulen.',
  },
  {
    label: 'Appelvink en Vink · juvenielen in rust',
    birds: [
      {id: 'sp041', source: 'appelvink', plumage: 'juv', marks: 'Jonge Appelvink met zware snavel, gelige keel en donkere vlekjes op de onderzijde.'},
      {id: 'sp035', source: 'vink', plumage: 'juv', marks: 'Jonge Vink met kleinere kegelsnavel en twee lichte vleugelstrepen.'},
    ],
    rows: [
      {label: 'Snavel', values: ['Uitzonderlijk fors voor een vink', 'Veel kleiner en subtieler']},
      {label: 'Onderzijde', values: ['Gelige keel en gevlekte borst', 'Bruiniger zonder typische Appelvink-jeugdvlekken']},
      {label: 'Vleugel', values: ['Brede lichte band', 'Twee lichte vleugelstrepen']},
    ],
    tip: 'Jonge vinken lijken soms op elkaar. Combineer snavelvorm en leeftijdskenmerken; een bronbenoemd juveniel is nog geen onafhankelijke foto-PASS.',
  },
  {
    label: 'Roodborsttapuit en Roodborst · volwassen',
    birds: [
      {id: 'sp053', source: 'roodborsttapuit', plumage: 'adult_m', marks: 'Mannetje met donkere kop, witte zijhals en oranje borst.'},
      {id: 'sp050', source: 'roodborst', marks: 'Oranje loopt door over keel en gezicht. Bovendelen bruin.'},
    ],
    rows: [
      {label: 'Oranje vlak', values: ['Vooral op de borst', 'Borst, keel en gezicht']},
      {label: 'Kop en hals', values: ['Zwarte kop en witte zijhals bij het mannetje in broedkleed', 'Oranje gezicht met bruinige kruin']},
    ],
    tip: 'Kijk bij een oranje borst ook naar het gezicht en de zijhals.',
  },
  {
    label: 'Scholekster en Kluut · veldkenmerken',
    birds: [
      {id: 'sp098', source: 'scholekster', marks: 'Lange, rechte oranjerode snavel. Zwarte kop en borst, roze poten.'},
      {id: 'sp143', source: 'kluut', marks: 'Dunne, omhooggebogen donkere snavel. Overwegend wit met zwarte tekening en lange poten.'},
    ],
    tip: 'Vergelijk de snavelvorm en pootlengte. De kleuren zijn lastiger bij tegenlicht.',
  },
  {
    label: 'Wulp en Regenwulp · kop en snavel',
    birds: [
      {id: 'sp100', source: 'wulp', marks: 'Relatief egale kruin en een lange, gelijkmatig gebogen snavel.'},
      {id: 'sp148', source: 'regenwulp', marks: 'Opvallende lichte middenkruinstreep tussen donkere kruinbanden. Kortere snavel met sterkere kromming bij de punt.'},
    ],
    tip: 'Kijk naar koptekening én snavel. Bij jonge Wulpen is de snavel vaak korter.',
  },
  {
    label: 'Grutto en Rosse Grutto · veldkenmerken',
    birds: [
      {id: 'sp101', source: 'grutto', marks: 'Bijna rechte snavel en doorgaans langere poten. Brede witte vleugelstreep en zwarte staartband in vlucht.'},
      {id: 'sp149', source: 'rosse-grutto', marks: 'Licht omhooggebogen snavel. In vlucht een gebandeerde staart en geen brede witte vleugelstreep.'},
    ],
    tip: 'Bij een staande vogel helpt de snavelvorm. Bekijk in vlucht ook de staart en vleugels.',
  },
  {
    label: 'Spreeuw en Merel · volwassen',
    birds: [
      {id: 'sp112', source: 'spreeuw', plumage: 'adult_m', marks: 'Korte staart en spitse snavel. Het donkere kleed heeft vaak metaalglans of lichte spikkels.'},
      {id: 'sp045', source: 'merel', plumage: 'adult_m', marks: 'Langere staart. Het mannetje is effen zwart, met een opvallende gele tot oranje oogring.'},
    ],
    tip: 'Vergelijk staartlengte en oogring. Tegenlicht kan de glans van een Spreeuw verhullen.',
  },
  {
    label: 'Drieteenstrandloper en Bonte Strandloper · winterkleed',
    birds: [
      {id: 'sp152', source: 'drieteenstrandloper', marks: 'Compact, doorgaans bleek, met een korte, vrijwel rechte snavel en vaak een donkere schoudervlek.'},
      {id: 'sp153', source: 'bonte-strandloper', marks: 'Vaak grijzer bruin. De relatief lange snavel buigt aan het uiteinde omlaag.'},
    ],
    tip: 'Bekijk de snavel volledig van opzij. De achterteen ontbreekt bij de Drieteenstrandloper en is vooral van dichtbij bruikbaar.',
  },
  {
    label: 'Zwartkop en Tuinfluiter · kop en zang',
    birds: [
      {id: 'sp059', source: 'zwartkop', marks: 'Volwassen mannetje met zwarte kruin en grijze kopzijden. De zang eindigt vaak met heldere, hoge fluittonen.'},
      {id: 'sp060', source: 'tuinfluiter', marks: 'Effen bruingrijze kruin zonder afgetekend petje. De snelle, vloeiende zang mist meestal de heldere eindfluitjes.'},
    ],
    rows: [
      {label: 'Kruin', values: ['Mannetje: duidelijk zwart petje', 'Egaal bruingrijs zonder afgetekend petje']},
      {label: 'Zang', values: ['Vaak duidelijke heldere, luide eindfluitjes', 'Vloeiend, zonder dezelfde uitgesproken heldere afsluiting']},
      {label: 'Kop', values: ['Grijzig met een scherp afgebakend kruinveld', 'Onopvallend bruingrijs met lichte oogring en grijzige halszijde']},
    ],
    tip: 'Luister naar een volledige strofe. Bruine-kruinvogels vragen extra aandacht: vrouwtjes en jonge Zwartkoppen kunnen een bruin petje hebben.',
  },
  {
    label: 'Zwartkop en Tuinfluiter · vrouwtje in rust',
    birds: [
      {id: 'sp059', source: 'zwartkop', plumage: 'adult_f', marks: 'Vrouwtje Zwartkop: duidelijk kastanjebruine kruin boven de grijsbruine kopzijden.'},
      {id: 'sp060', source: 'tuinfluiter', marks: 'Egaal bruingrijs zonder scherp afgetekend bruin petje; ook man en vrouw lijken op elkaar.'},
    ],
    rows: [
      {label: 'Kruin', values: ['Afgetekende roodbruine kruin', 'Egaal bruingrijs zonder duidelijke begrenzing']},
      {label: 'Zijkop', values: ['Grijzig onder het bruine petje', 'Subtiele grijzige halszijde, geen petje']},
      {label: 'Zang', values: ['Heldere fluittonen in de afsluiting zijn een aanwijzing', 'Meer doorlopende, gelijkmatige zang zonder zulke eindfluitjes']},
    ],
    tip: 'De vrouwtjesfoto is een eerder geregistreerde opname. Een jong Zwartkopmannetje kan ook een bruine kruin hebben: bepaal het geslacht niet uitsluitend op petkleur.',
  },
  {
    label: 'Grasmus en Tuinfluiter · rustbeeld',
    birds: [
      {id: 'sp061', source: 'grasmus', photo: '/assets/species/sp061.webp', marks: 'Grasmus met duidelijk lichte keel, vaak warme roestbruine vleugelranden en een langere staart.'},
      {id: 'sp060', source: 'tuinfluiter', marks: 'Effen grijsbruin en grijswit met weinig contrast aan kop en vleugels.'},
    ],
    rows: [
      {label: 'Keel', values: ['Opvallend wit, contrasteert met zijkop', 'Grijswit, vaak minder contrastrijk']},
      {label: 'Vleugel', values: ['Warme roestbruine veerranden', 'Overwegend egaal bruingrijs']},
      {label: 'Zang', values: ['Krasachtig, variabel riedeltje', 'Rijk en doorlopend als een snelle Merel']},
    ],
    tip: 'Op deze twee rustfoto’s staat de vogel anders in beeld. Vergelijk dus de vleugelranden, keel en kop, niet de afmeting op de foto.',
  },
  {
    label: 'Braamsluiper en Tuinfluiter · kop en zang in rust',
    birds: [
      {id: 'sp062', source: 'braamsluiper', marks: 'Braamsluiper met grijze kap en donkergrijze oorstreek die scherp afsteekt tegen de witte keel.'},
      {id: 'sp060', source: 'tuinfluiter', marks: 'Tuinfluiter is egaler bruingrijs, zonder duidelijk donker oorveld; de zang is vloeiend en rijk.'},
    ],
    rows: [
      {label: 'Oorstreek', values: ['Donkergrijze oorzone tegen witte keel', 'Geen vergelijkbaar donker oorveld']},
      {label: 'Kop en rug', values: ['Grijze kopkap, grijsbruine rug', 'Vrij egaal bruingrijs, weinig kleurcontrast']},
      {label: 'Zang', values: ['Klepperende ratel, soms na een brabbelend begin', 'Snelle, melodieuze, doorlopende strofe']},
    ],
    tip: 'Bekijk de kop in zijaanzicht en beluister bij twijfel de volledige zang. Geslacht is op deze foto’s niet betrouwbaar aan het verenkleed af te lezen.',
  },
  {
    label: 'Grasmus en Braamsluiper · vleugel en zang',
    birds: [
      {id: 'sp061', source: 'grasmus', plumage: 'adult_m', marks: 'Volwassen mannetje Grasmus: warme roestbruine vleugelranden, lichtere grijze kruin en vaak zachtroze borst.'},
      {id: 'sp062', source: 'braamsluiper', marks: 'Braamsluiper met grijze kop en donkerdere oorstreek; vleugels minder roestkleurig.'},
    ],
    rows: [
      {label: 'Vleugel', values: ['Warme roestbruine veerranden', 'Gelijkmatiger grijsbruin, zonder vergelijkbaar roest']},
      {label: 'Kop en keel', values: ['Lichtere grijze kruin en witte keel; bij man vaak roze borst', 'Donkerdere grijze oorstreek met witte keel']},
      {label: 'Zang', values: ['Variabel en wat krassend', 'Korte snelle klepperende ratel']},
    ],
    tip: 'Beide soorten hebben een lichte keel, dus kijk vooral naar de vleugelranden. Hier staat een eerder geregistreerd Grasmus-mannetje naast een sekseneutrale Braamsluiperfoto.',
  },
  {
    label: 'IJsvogel en Bijeneter · keel en snavel',
    birds: [
      {id: 'sp075', source: 'ijsvogel', photo: '/assets/showcase/sp075.webp', marks: 'Compacte IJsvogel met witte keel en zijhals, roestoranje onderzijde, rechte puntige snavel en korte staart.'},
      {id: 'sp257', source: 'bijeneter', marks: 'Langgerekte Bijeneter met gele keel, blauwgroene onderzijde, zwarte oogstreep, licht gebogen snavel en lange staart.'},
    ],
    rows: [
      {label: 'Keel', values: ['Wit met een witte zijhalsvlek', 'Felgeel en omrand door een donkere oog-/keeltekening']},
      {label: 'Snavel', values: ['Lang, smal en recht', 'Langer ogend en licht neerwaarts gebogen']},
      {label: 'Lichaam en staart', values: ['Compact met korte staart en oranje buik', 'Langgerekter met langere staart en blauwgroene onderzijde']},
    ],
    tip: 'De twee bestaande rustfoto’s tonen de herkenbare verschillen. Kijk naar keel, snavel en staart in plaats van alleen naar de blauwe kleur.',
  },
  {
    label: 'Geelgors en Rietgors · kop en stuit',
    birds: [
      {id: 'sp117', source: 'geelgors', marks: 'Roodbruine stuit. Bij een volwassen mannetje in broedkleed is de kop doorgaans grotendeels geel.'},
      {id: 'sp118', source: 'rietgors', marks: 'Volwassen mannetje in broedkleed met zwarte kop en keel en een witte halsband.'},
    ],
    rows: [
      {label: 'Kop in broedkleed', values: ['Volwassen mannetje meestal grotendeels geel', 'Volwassen mannetje zwart met witte halsband']},
      {label: 'Vaak te vinden', values: ['Akkerrand, heg of bosrand', 'Rietkraag en begroeide slootkant']},
    ],
    tip: 'Vrouwtjes en jonge vogels zijn minder uitgesproken. Bekijk ook de stuit en let op de omgeving.',
  },
  {
    label: 'Knobbelzwaan en Wilde Zwaan · snavel en hals',
    birds: [
      {id: 'sp126', source: 'knobbelzwaan', marks: 'Oranjerode snavel met een zwarte knobbel aan de basis. Bij rustig zwemmen vaak een gebogen hals.'},
      {id: 'sp187', source: 'wilde-zwaan', marks: 'Grote driehoekige gele snavelvlek en zwarte punt. Bij zwemmen doorgaans een rechtere hals.'},
    ],
    rows: [
      {label: 'Snavel', values: ['Oranjerood met zwarte knobbel', 'Geel met zwarte punt']},
      {label: 'Houding', values: ['Hals vaak gebogen', 'Hals doorgaans rechter']},
    ],
    tip: 'Bekijk bij een volwassen vogel de hele snavel van opzij. Gebruik halshouding als extra aanwijzing.',
  },
];

export function comparisonSource(bird) {
  return vogelgids + bird.source;
}
