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
      {id: 'sp043', source: 'huismus', marks: 'Mannetje heeft een grijze kruin en donkere bef. Vrouwtje heeft een lichte wenkbrauw.'},
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
];

export function comparisonSource(bird) {
  return vogelgids + bird.source;
}
