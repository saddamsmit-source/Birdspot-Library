/** Gepaarde veldkenmerken, nagekeken op de genoemde Vogelbescherming-soortkaarten. */
const vogelgids = 'https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/';

export const GUIDE_COMPARISONS = [
  {
    birds: [
      {id: 'sp057', source: 'fitis', marks: 'Aflopend zangriedeltje. Vaak lichtbruine poten en relatief lange vleugels.'},
      {id: 'sp056', source: 'tjiftjaf', marks: 'Herhaalt “tjif-tjaf”. Vaak donkere poten en kortere vleugels.'},
    ],
    tip: 'Luister eerst naar de zang. Gebruik pootkleur alleen als extra aanwijzing.',
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
    "tip": "Luister naar roep of zang en controleer meerdere details. Kapglans en grootte van de keelvlek zijn op zichzelf onbetrouwbaar; bij pas uitgevlogen vogels zijn sommige snavel- en kopkenmerken nog minder bruikbaar."
  },
  {
    birds: [
      {id: 'sp043', source: 'huismus', plumage: 'adult_m', marks: 'Mannetje heeft een grijze kruin en donkere bef. Een afzonderlijke zwarte wangvlek ontbreekt.'},
      {id: 'sp044', source: 'ringmus', marks: 'Bruine kruin, zwarte wangvlek en lichte nekrand bij mannetje én vrouwtje.'},
    ],
    tip: 'Kijk eerst naar de donkere vlek op de lichte wang van de Ringmus.',
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
      {id: 'sp082', source: 'kleine-zilverreiger', plumage: 'winter', marks: 'Slank en klein met een donkere snavel. Bij volwassen vogels vallen de gele tenen op.'},
      {id: 'sp083', source: 'grote-zilverreiger', plumage: 'winter', marks: 'Veel groter, met een langere hals, een lange gele snavel en donkere tenen.'},
    ],
    tip: 'Kijk naar de tenen als die zichtbaar zijn. Beoordeel ook de verhouding tussen hals en lichaam.',
  },
  {
    label: 'Kleine en Grote Zilverreiger · broedkleed',
    birds: [
      {id: 'sp082', source: 'kleine-zilverreiger', plumage: 'breeding', marks: 'Twee lange sierveren in de nek, kleinere bouw en meestal gele tenen.'},
      {id: 'sp083', source: 'grote-zilverreiger', plumage: 'breeding', marks: 'Zeer lange hals en sierveren op de rug. De snavel kan tijdelijk grotendeels zwart worden.'},
    ],
    tip: 'Een donkere snavel komt in dit kleed bij beide voor. Let ook op formaat, halslengte en nekveren.',
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
    tip: 'Begin bij de kleur van het lijf. Kijk bij een draai in de vlucht ook naar de stuit, de plek net boven de staart.',
  },
  {
    label: 'Bruine en Blauwe · volwassen vrouwtjes',
    birds: [
      {id: 'sp173', source: 'bruine-kiekendief', plumage: 'adult_f', marks: 'Donkerbruin met een lichte kruin en keel, vaak ook een lichte vleugelvoorrand. Geen brede witte stuit.'},
      {id: 'sp249', source: 'blauwe-kiekendief', plumage: 'adult_f', marks: 'Bruin met brede witte stuit. Van onderen vallen donkere banden op de vleugels en staart op.'},
    ],
    tip: 'Van onderen zijn de vleugelbanden goed te vergelijken. De witte stuit zie je van boven of wanneer de vogel wegdraait.',
  },
  {
    label: 'Bruine en Blauwe · jonge vogels',
    birds: [
      {id: 'sp173', source: 'bruine-kiekendief', plumage: 'juv', marks: 'Meestal vrijwel egaal donkerbruin, met een lichte kruin. Mist een brede witte stuit.'},
      {id: 'sp249', source: 'blauwe-kiekendief', plumage: 'juv', marks: 'Bruin met witte stuit. De staart en ondervleugels zijn gebandeerd.'},
    ],
    tip: 'Beide zijn bruin. Gebruik de stuit samen met de bandering. Bij een kort silhouet kan de soort onzeker blijven.',
  },
  {
    label: 'Blauwe en Grauwe · volwassen vrouwtjes',
    birds: [
      {id: 'sp249', source: 'blauwe-kiekendief', plumage: 'adult_f', marks: 'Forsere vleugels. Bij goed gespreide vleugelpunten zijn doorgaans vijf vingertoppen zichtbaar.'},
      {id: 'sp251', source: 'grauwe-kiekendief', plumage: 'adult_f', marks: 'Slanker, met smallere vleugels. Doorgaans vier zichtbare vingertoppen bij goed gespreide vleugels.'},
    ],
    tip: 'Gebruik vleugelvorm én vlucht. Het aantal zichtbare vingers kan wisselen door houding, rui en kijkhoek.',
  },
  {
    label: 'Blauwe en Steppe · volwassen mannetjes',
    birds: [
      {id: 'sp249', source: 'blauwe-kiekendief', plumage: 'adult_m', marks: 'Bredere vleugel, met een relatief groot zwart uiteinde en een donkere achterrand van de bovenvleugel.'},
      {id: 'sp250', source: 'steppekiekendief', plumage: 'adult_m', marks: 'Bleker met smallere vleugels en een kleinere, wigvormige zwarte tekening op de handpennen.'},
    ],
    tip: 'Vergelijk de vorm van het zwart aan de vleugelpunt en de breedte van de vleugel samen.',
  },
  {
    label: 'Grauwe en Steppe · volwassen mannetjes',
    birds: [
      {id: 'sp251', source: 'grauwe-kiekendief', plumage: 'adult_m', marks: 'Donkerder grijs, met zwarte vleugelpunten en donkere banden over de armvleugel.'},
      {id: 'sp250', source: 'steppekiekendief', plumage: 'adult_m', marks: 'Bleker lijf en een smalle zwarte wig aan het uiteinde van de vleugel.'},
    ],
    tip: 'Kijk naar de armvleugel, het deel tussen het lijf en de handpennen. Bij de Grauwe vallen daar donkere banden op.',
  },
  {
    label: 'Grauwe en Steppe · volwassen vrouwtjes',
    birds: [
      {id: 'sp251', source: 'grauwe-kiekendief', plumage: 'adult_f', marks: 'Meestal een grotere lichte zone rond het oog en duidelijkere lichte banden op de onderzijde van de armvleugel.'},
      {id: 'sp250', source: 'steppekiekendief', plumage: 'adult_f', marks: 'Let op de lichte halsring, donkere oorstreek en smalle, vaak minder scherp begrensde banden op de ondervleugel.'},
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
    birds: [
      {id: 'sp005', source: 'buizerd', plumage: 'adult_m', marks: 'De relatief korte, bruingrijze staart heeft doorgaans meerdere smalle dwarsbanden. Ook lichte Buizerds kunnen donkere polsvlekken hebben.'},
      {id: 'sp253', source: 'Ruigpootbuizerd', plumage: 'adult_f', marks: 'Een brede witte staartbasis met donkere bandering, samen met grote donkere polsvlekken. Dit vrouwtje heeft ook een donker buikschild.'},
    ],
    tip: 'Bekijk eerst de gespreide staart en controleer vervolgens de ondervleugels en buik. Beide soorten kunnen bidden.',
  },
  {
    label: 'Buizerd en Ruigpootbuizerd · jonge vogels',
    birds: [
      {id: 'sp005', source: 'buizerd', plumage: 'juv', marks: 'Een lichte Buizerd kan een vrijwel witte buik en donkere polsvlekken tonen. Bekijk ook de fijne bandering over de staart.'},
      {id: 'sp253', source: 'Ruigpootbuizerd', plumage: 'juv', marks: 'Vaak een lichte borst met een donker buikschild en opvallende polsvlekken. De witte staartbasis kan bij tegenlicht lastig te zien zijn.'},
    ],
    tip: 'Beoordeel staartbasis, buik en ondervleugels samen. Bij twijfel helpt een foto met gespreide staart in beter licht.',
  },
  {
    label: 'Buizerd en Wespendief · volwassen in vlucht',
    birds: [
      {id: 'sp005', source: 'buizerd', plumage: 'adult_m', marks: 'Brede vleugels, kleine afstand van kop tot vleugelvoorrand en een relatief korte staart met meerdere fijne banden.'},
      {id: 'sp248', source: 'wespendief', plumage: 'adult_m', marks: 'Verder uitstekende kop en langere staart. Bij dit mannetje zijn de brede donkere eindband en banden dichter bij het lijf te zien.'},
    ],
    tip: 'Begin met de verhouding tussen staart, vleugelbreedte en kop. Gebruik daarna de staartbanden om je indruk te toetsen.',
  },
  {
    label: 'Buizerd en Wespendief · jonge vogels',
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
    tip: 'Begin met de kop. De droge ratel van het mannetje Zomertaling klinkt anders dan het hoge fluitje van Wintertaling.',
  },
  {
    label: 'Wintertaling en Zomertaling · volwassen vrouwtjes',
    birds: [
      {id: 'sp091', source: 'wintertaling', plumage: 'adult_f', marks: 'Vaak minder contrast rond het oog, met een lichte vlek aan de staartzijde. Bij een geopende vleugel kan de groene spiegel oplichten.'},
      {id: 'sp188', source: 'zomertaling', plumage: 'adult_f', marks: 'Donkere oogstreep, lichte wenkbrauw en lichte keel. Vaak ook een licht vlekje aan de snavelbasis.'},
    ],
    tip: 'Vergelijk oogstreep, keel en staartzijde samen. Een glanzende spiegel kan door de kijkhoek donker lijken.',
  },
  {
    label: 'Wintertaling en Zomertaling · jonge vogels',
    birds: [
      {id: 'sp091', source: 'wintertaling', plumage: 'juv', marks: 'Bruine vogel die sterk op een vrouwtje lijkt. Bij deze vogel is de groene vleugelspiegel zichtbaar.'},
      {id: 'sp188', source: 'zomertaling', plumage: 'juv', marks: 'Lijkt ook sterk op het eigen vrouwtje. Let op het contrast tussen de donkere oogstreep en de lichte keel en wenkbrauw.'},
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
    label: 'Torenvalk en Slechtvalk · volwassen',
    birds: [
      {id: 'sp008', source: 'torenvalk', plumage: 'adult_m', marks: 'Lange staart en roestbruine rug. Dit mannetje heeft een grijze kop en bovenstaart.'},
      {id: 'sp009', source: 'slechtvalk', plumage: 'adult_m', marks: 'Zware borst, brede donkere baardstreep en relatief korte staart. Blauwgrijze bovenzijde.'},
    ],
    tip: 'Vergelijk de verhoudingen van kop, vleugels en staart. Gebruik kleur bij goed licht; de foto’s zijn niet op dezelfde schaal.',
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
    "tip": "Kijk naar de hele koptekening. Een blauwe kruin met smalle oogstreep wijst op Pimpelmees; Koolmees heeft een veel groter zwart kopvlak."
  },
  {
    "birds": [
      {
        "id": "sp033",
        "source": "kuifmees",
        "marks": "Zwart-witte spitse kuif en een gebogen zwarte lijn achter de wang."
      },
      {
        "id": "sp031",
        "source": "matkop",
        "marks": "Zwarte gesloten kap zonder gespikkelde kuif; lichtere, minder getekende zijkop."
      }
    ],
    "tip": "Bekijk de kop ook als de kuif platligt: de Kuifmees behoudt zijn zwart-witte kuifveren en sterke wangtekening."
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
    "tip": "Begin bij het gezicht, niet bij de kleur van de kruin. Beide soorten kunnen geel én oranje op de kruin tonen."
  },
  {
    "label": "Boomklever en Boomkruiper · bouw en beweging",
    "birds": [
      {
        "id": "sp065",
        "source": "boomklever",
        "marks": "Blauwgrijze rug, zwarte oogstreep, rechte snavel en korte staart. Beweegt ook kop omlaag langs de stam."
      },
      {
        "id": "sp066",
        "source": "boomkruiper",
        "marks": "Bruin-licht gevlekte rug, dunne kromme snavel en lange stijve staart. Zoekt meestal omhoog klimmend naar voedsel."
      }
    ],
    "tip": "Combineer kleur en bouw met de richting van klimmen. Een stilzittende vogel is ook zonder gedrag aan deze kenmerken te vergelijken."
  },
  {
    "label": "Boomkruiper en Taigaboomkruiper · combineer beeld en geluid",
    "birds": [
      {
        "id": "sp066",
        "source": "boomkruiper",
        "marks": "Vaak warmere flanken, minder opvallende wenkbrauw en een gelijkmatiger verloop van de lichte vleugelband."
      },
      {
        "id": "sp067",
        "source": "taigaboomkruiper",
        "marks": "Vaak witter onderaan en achter het oog. Het precieze patroon van de lichte vleugelband helpt, maar vraagt een scherp zijaanzicht."
      }
    ],
    "tip": "Luister naar volledige zangstrofen en vergelijk meerdere beelden. Kleur, snavellengte of één witte streep alleen is onvoldoende; ondersoorten en kijkhoek beïnvloeden het beeld."
  },
];

export function comparisonSource(bird) {
  return vogelgids + bird.source;
}
