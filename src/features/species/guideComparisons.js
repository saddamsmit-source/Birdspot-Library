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
    birds: [
      {id: 'sp031', source: 'matkop', marks: 'Vaak een lichte baan over de gevouwen vleugel. De kap oogt meestal dof.'},
      {id: 'sp032', source: 'glanskop', marks: 'Egalere vleugel. Van dichtbij kan een licht vlekje bij de snavelbasis opvallen.'},
    ],
    tip: 'Let op de vleugel en luister naar de roep. De glans van de kap is lastig te beoordelen.',
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
    birds: [
      {id: 'sp016', source: 'grote-bonte-specht', plumage: 'juv', marks: 'Jonge vogel met rode kruin én een zwarte begrenzing van de kruin.'},
      {id: 'sp020', source: 'middelste-bonte-specht', marks: 'Rode kruin, opener wit gezicht en meer streping op de flanken.'},
    ],
    tip: 'Een rood petje komt bij beide voor. Kijk naar het hele koppatroon.',
  },
  {
    birds: [
      {id: 'sp082', source: 'kleine-zilverreiger', marks: 'Kleiner, kortere hals en opvallend gele tenen. Snavel doorgaans donker.'},
      {id: 'sp083', source: 'grote-zilverreiger', marks: 'Groter met lange hals. Snavel meestal geel, soms donker in de broedtijd.'},
    ],
    tip: 'Als de voeten zichtbaar zijn, zijn de gele tenen een goed kenmerk voor de Kleine Zilverreiger.',
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
];

export function comparisonSource(bird) {
  return vogelgids + bird.source;
}
