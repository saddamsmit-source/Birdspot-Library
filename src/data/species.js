/**
 * Birdspot Library — Nederlandse standvogels
 * Bron: SOVON / Vogelbescherming Nederland
 * Categorieën: standvogel | trekvogel | zomergast | wintergast | dwaalgast
 * Regio-tags: stedelijk | agrarisch | bos | heide | duinen | kust | wad |
 *             polder | rivierengebied | moeras | rietland | zee | struweel
 */

export const SPECIES = [
  // ── DUIVEN ─────────────────────────────────────────────────
  { id:'sp001', nameNL:'Stadsduif',           nameEN:'Rock Dove / Feral Pigeon',  nameSci:'Columba livia',              family:'Duiven',          category:'standvogel', icon:'🕊', regions:['stedelijk'],                              fieldmarks:'Grijs met groene/paarse glans op nek, rode poten, witte stuit.' },
  { id:'sp002', nameNL:'Houtduif',            nameEN:'Common Wood Pigeon',        nameSci:'Columba palumbus',           family:'Duiven',          category:'standvogel', icon:'🕊', regions:['bos','stedelijk','agrarisch'],             fieldmarks:'Groot, grijs-roze borst, witte halsvlek en witte vleugelbanden in vlucht.' },
  { id:'sp003', nameNL:'Holenduif',           nameEN:'Stock Dove',                nameSci:'Columba oenas',              family:'Duiven',          category:'standvogel', icon:'🕊', regions:['bos','agrarisch'],                         fieldmarks:'Kleiner dan Houtduif, geen witte halsvlek, zwarte vleugelpunten.' },
  { id:'sp004', nameNL:'Turkse Tortel',        nameEN:'Eurasian Collared Dove',    nameSci:'Streptopelia decaocto',      family:'Duiven',          category:'standvogel', icon:'🕊', regions:['stedelijk','agrarisch'],                   fieldmarks:'Zanderig beige, zwart halsbandtje, lange staart met witte rand.' },

  // ── ROOFVOGELS ──────────────────────────────────────────────
  { id:'sp005', nameNL:'Buizerd',             nameEN:'Common Buzzard',            nameSci:'Buteo buteo',                family:'Haviken',         category:'standvogel', icon:'🦅', regions:['bos','agrarisch','heide','polder'],        fieldmarks:'Breed gespreide vleugels, variabele bruintinten, dwarsbanden op staart.' },
  { id:'sp006', nameNL:'Sperwer',             nameEN:'Eurasian Sparrowhawk',      nameSci:'Accipiter nisus',            family:'Haviken',         category:'standvogel', icon:'🦅', regions:['bos','stedelijk','agrarisch'],             fieldmarks:'Korte vleugels, lange staart, mannetje blauwgrijs met roodbruin gestreepte borst.' },
  { id:'sp007', nameNL:'Havik',               nameEN:'Northern Goshawk',          nameSci:'Accipiter gentilis',         family:'Haviken',         category:'standvogel', icon:'🦅', regions:['bos'],                                     fieldmarks:'Groter dan Sperwer, krachtige bouw, witte wenkbrauwstreep.' },
  { id:'sp008', nameNL:'Torenvalk',           nameEN:'Common Kestrel',            nameSci:'Falco tinnunculus',          family:'Valken',          category:'standvogel', icon:'🦅', regions:['agrarisch','stedelijk','duinen','heide'],  fieldmarks:'Vliegend biddend, roestbruin, mannetje grijs hoofd en staart.' },
  { id:'sp009', nameNL:'Slechtvalk',          nameEN:'Peregrine Falcon',          nameSci:'Falco peregrinus',           family:'Valken',          category:'standvogel', icon:'🦅', regions:['stedelijk','kust','wad'],                  fieldmarks:'Donker bovenside, lichte borst met barring, brede zwarte snorstreep.' },
  { id:'sp010', nameNL:'Rode Wouw',           nameEN:'Red Kite',                  nameSci:'Milvus milvus',              family:'Haviken',         category:'standvogel', icon:'🦅', regions:['bos','agrarisch','rivierengebied'],        fieldmarks:'Roestoranje, gevorkte staart, witte vleugelvensters.' },
  { id:'sp011', nameNL:'Zwarte Wouw',         nameEN:'Black Kite',                nameSci:'Milvus migrans',             family:'Haviken',         category:'standvogel', icon:'🦅', regions:['rivierengebied','moeras'],                 fieldmarks:'Donkerbruin, minder gevorkte staart dan Rode Wouw.' },

  // ── UILEN ───────────────────────────────────────────────────
  { id:'sp012', nameNL:'Kerkuil',             nameEN:'Barn Owl',                  nameSci:'Tyto alba',                  family:'Kerkuilen',       category:'standvogel', icon:'🦉', regions:['agrarisch','stedelijk','polder'],          fieldmarks:'Hartvormig wit gezicht, goudbruin bovenside, nachtactief.' },
  { id:'sp013', nameNL:'Bosuil',              nameEN:'Tawny Owl',                 nameSci:'Strix aluco',                family:'Echte uilen',     category:'standvogel', icon:'🦉', regions:['bos','stedelijk'],                         fieldmarks:'Grote ronde kop, bruine streeppatronen, bekende hoeroep.' },
  { id:'sp014', nameNL:'Steenuil',            nameEN:'Little Owl',                nameSci:'Athene noctua',              family:'Echte uilen',     category:'standvogel', icon:'🦉', regions:['agrarisch','stedelijk','rivierengebied'],  fieldmarks:'Klein, gespierd, gele ogen, wit-gevlekt, dag- en nachtactief.' },
  { id:'sp015', nameNL:'Ransuil',             nameEN:'Long-eared Owl',            nameSci:'Asio otus',                  family:'Echte uilen',     category:'standvogel', icon:'🦉', regions:['bos','agrarisch','heide'],                 fieldmarks:'Lange oorpluimen, oranje ogen, slanker dan Bosuil.' },

  // ── SPECHTEN ────────────────────────────────────────────────
  { id:'sp016', nameNL:'Grote Bonte Specht',  nameEN:'Great Spotted Woodpecker',  nameSci:'Dendrocopos major',          family:'Spechten',        category:'standvogel', icon:'🐦', regions:['bos','stedelijk'],                         fieldmarks:'Zwart-wit patroon, rode onderstuit; mannetje rode nek.' },
  { id:'sp017', nameNL:'Kleine Bonte Specht', nameEN:'Lesser Spotted Woodpecker', nameSci:'Dryobates minor',            family:'Spechten',        category:'standvogel', icon:'🐦', regions:['bos','rivierengebied'],                    fieldmarks:'Mus-klein, zwart-wit gestreept, mannetje rood dophoedje.' },
  { id:'sp018', nameNL:'Zwarte Specht',       nameEN:'Black Woodpecker',          nameSci:'Dryocopus martius',          family:'Spechten',        category:'standvogel', icon:'🐦', regions:['bos'],                                     fieldmarks:'Kraaigrootte, gitzwart, felrode kruin.' },
  { id:'sp019', nameNL:'Groene Specht',       nameEN:'European Green Woodpecker', nameSci:'Picus viridis',              family:'Spechten',        category:'standvogel', icon:'🐦', regions:['bos','agrarisch','stedelijk'],             fieldmarks:'Helgroen, gele stuit, rood-zwart gezicht, lachende roep.' },
  { id:'sp020', nameNL:'Middelste Bonte Specht',nameEN:'Middle Spotted Woodpecker',nameSci:'Dendrocoptes medius',       family:'Spechten',        category:'standvogel', icon:'🐦', regions:['bos'],                                     fieldmarks:'Volledig rode kruin, witte wang zonder zwarte lijn.' },

  // ── KRAAIACHTIGEN ───────────────────────────────────────────
  { id:'sp021', nameNL:'Ekster',              nameEN:'Eurasian Magpie',           nameSci:'Pica pica',                  family:'Kraaien',         category:'standvogel', icon:'🐦', regions:['stedelijk','agrarisch','bos'],             fieldmarks:'Zwart-wit, lange groene/paarse staart, luid.' },
  { id:'sp022', nameNL:'Zwarte Kraai',        nameEN:'Carrion Crow',              nameSci:'Corvus corone',              family:'Kraaien',         category:'standvogel', icon:'🐦', regions:['stedelijk','agrarisch','kust','polder'],   fieldmarks:'Geheel zwart, zware snavel, geeft harde "kauw".' },
  { id:'sp023', nameNL:'Bonte Kraai',         nameEN:'Hooded Crow',               nameSci:'Corvus cornix',              family:'Kraaien',         category:'standvogel', icon:'🐦', regions:['agrarisch','kust','polder'],               fieldmarks:'Grijs lichaam, zwarte kop/vleugels/staart.' },
  { id:'sp024', nameNL:'Roek',                nameEN:'Rook',                      nameSci:'Corvus frugilegus',          family:'Kraaien',         category:'standvogel', icon:'🐦', regions:['agrarisch','stedelijk','polder'],          fieldmarks:'Zwart met paarse glans, naakte grauwe snavelbasis.' },
  { id:'sp025', nameNL:'Kauw',                nameEN:'Western Jackdaw',           nameSci:'Coloeus monedula',           family:'Kraaien',         category:'standvogel', icon:'🐦', regions:['stedelijk','agrarisch','kust'],            fieldmarks:'Klein, grijs achterste, blauwe ogen, snel roepend "djak".' },
  { id:'sp026', nameNL:'Gaai',                nameEN:'Eurasian Jay',              nameSci:'Garrulus glandarius',        family:'Kraaien',         category:'standvogel', icon:'🐦', regions:['bos','stedelijk'],                         fieldmarks:'Roze-bruin, blauw vleugelspiegeltje, witte stuit.' },
  { id:'sp027', nameNL:'Raaf',                nameEN:'Common Raven',              nameSci:'Corvus corax',               family:'Kraaien',         category:'standvogel', icon:'🐦', regions:['heide','bos','kust'],                      fieldmarks:'Veel groter dan kraai, wigvormige staart, diepe krok-roep.' },
  { id:'sp028', nameNL:'Notenkraker',         nameEN:'Spotted Nutcracker',        nameSci:'Nucifraga caryocatactes',    family:'Kraaien',         category:'standvogel', icon:'🐦', regions:['bos'],                                     fieldmarks:'Donkerbruin met witte stippen, witte onderstuit.' },

  // ── MEZEN ────────────────────────────────────────────────────
  { id:'sp029', nameNL:'Koolmees',            nameEN:'Great Tit',                 nameSci:'Parus major',                family:'Mezen',           category:'standvogel', icon:'🐦', regions:['bos','stedelijk','agrarisch'],             fieldmarks:'Geel met brede zwarte borststreep, zwart-wit hoofd.' },
  { id:'sp030', nameNL:'Pimpelmees',          nameEN:'Eurasian Blue Tit',         nameSci:'Cyanistes caeruleus',        family:'Mezen',           category:'standvogel', icon:'🐦', regions:['bos','stedelijk'],                         fieldmarks:'Blauw-geel, witte wangen met blauw streepje door oog.' },
  { id:'sp031', nameNL:'Matkop',              nameEN:'Marsh Tit',                 nameSci:'Poecile palustris',          family:'Mezen',           category:'standvogel', icon:'🐦', regions:['bos','moeras'],                            fieldmarks:'Glanzend zwart kapje, geen witte vlekken op vleugels.' },
  { id:'sp032', nameNL:'Glanskop',            nameEN:'Coal Tit',                  nameSci:'Periparus ater',             family:'Mezen',           category:'standvogel', icon:'🐦', regions:['bos'],                                     fieldmarks:'Zwart hoofd, witte nekstreep, twee witte vleugelbanden.' },
  { id:'sp033', nameNL:'Kuifmees',            nameEN:'European Crested Tit',      nameSci:'Lophophanes cristatus',      family:'Mezen',           category:'standvogel', icon:'🐦', regions:['bos'],                                     fieldmarks:'Zwart-witte kuif, zwart-witte gezichtstekening, naaldbos.' },
  { id:'sp034', nameNL:'Staartmees',          nameEN:'Long-tailed Tit',           nameSci:'Aegithalos caudatus',        family:'Staartmezen',     category:'standvogel', icon:'🐦', regions:['bos','struweel','stedelijk'],              fieldmarks:'Piepklein roze-wit-zwart, enorm lange staart, rondtrekkende groepjes.' },

  // ── VINKEN ───────────────────────────────────────────────────
  { id:'sp035', nameNL:'Vink',                nameEN:'Common Chaffinch',          nameSci:'Fringilla coelebs',          family:'Vinken',          category:'standvogel', icon:'🐦', regions:['bos','stedelijk','agrarisch'],             fieldmarks:'Mannetje roze borst, blauwgrijs hoofd, witte vleugelbanden.' },
  { id:'sp036', nameNL:'Groenling',           nameEN:'European Greenfinch',       nameSci:'Chloris chloris',            family:'Vinken',          category:'standvogel', icon:'🐦', regions:['stedelijk','agrarisch','struweel'],        fieldmarks:'Geelgroen, gele vleugelranden, stevige snavel.' },
  { id:'sp037', nameNL:'Putter',              nameEN:'European Goldfinch',        nameSci:'Carduelis carduelis',        family:'Vinken',          category:'standvogel', icon:'🐦', regions:['stedelijk','agrarisch','struweel'],        fieldmarks:'Rood gezicht, gele vleugelband, zwart-witte kop.' },
  { id:'sp038', nameNL:'Sijs',                nameEN:'Eurasian Siskin',           nameSci:'Spinus spinus',              family:'Vinken',          category:'standvogel', icon:'🐦', regions:['bos'],                                     fieldmarks:'Mannetje geel-groen met zwart kapje, snel in boomtoppen.' },
  { id:'sp039', nameNL:'Kneu',                nameEN:'Common Linnet',             nameSci:'Linaria cannabina',          family:'Vinken',          category:'standvogel', icon:'🐦', regions:['agrarisch','heide','duinen','struweel'],   fieldmarks:'Mannetje rood voorhoofd en borst, bruin-grijs.' },
  { id:'sp040', nameNL:'Goudvink',            nameEN:'Eurasian Bullfinch',        nameSci:'Pyrrhula pyrrhula',          family:'Vinken',          category:'standvogel', icon:'🐦', regions:['bos','struweel'],                          fieldmarks:'Mannetje felrode borst, zwarte kap, witte stuit.' },
  { id:'sp041', nameNL:'Appelvink',           nameEN:'Hawfinch',                  nameSci:'Coccothraustes coccothraustes',family:'Vinken',        category:'standvogel', icon:'🐦', regions:['bos'],                                     fieldmarks:'Grote kop, massieve snavel, kastanjebruin, witte vleugelbanden.' },
  { id:'sp042', nameNL:'Roodmus',             nameEN:'Common Rosefinch',          nameSci:'Carpodacus erythrinus',      family:'Vinken',          category:'standvogel', icon:'🐦', regions:['struweel','rietland'],                     fieldmarks:'Mannetje felrood hoofd-borst, vrouwtje gestreept bruin.' },

  // ── MUSSEN ───────────────────────────────────────────────────
  { id:'sp043', nameNL:'Huismus',             nameEN:'House Sparrow',             nameSci:'Passer domesticus',          family:'Mussen',          category:'standvogel', icon:'🐦', regions:['stedelijk','agrarisch'],                   fieldmarks:'Mannetje grijs dak, kastanjebruin, zwarte keel-vlek.' },
  { id:'sp044', nameNL:'Ringmus',             nameEN:'Eurasian Tree Sparrow',     nameSci:'Passer montanus',            family:'Mussen',          category:'standvogel', icon:'🐦', regions:['agrarisch','stedelijk','bos'],             fieldmarks:'Kastanjebruine kruin, zwarte oogvlek op witte wang.' },

  // ── LIJSTERS ─────────────────────────────────────────────────
  { id:'sp045', nameNL:'Merel',               nameEN:'Common Blackbird',          nameSci:'Turdus merula',              family:'Lijsters',        category:'standvogel', icon:'🐦', regions:['bos','stedelijk','agrarisch'],             fieldmarks:'Mannetje zwart met gele snavel; vrouwtje bruin.' },
  { id:'sp046', nameNL:'Zanglijster',         nameEN:'Song Thrush',               nameSci:'Turdus philomelos',          family:'Lijsters',        category:'standvogel', icon:'🐦', regions:['bos','stedelijk'],                         fieldmarks:'Bruin met gevlekte borst, repeteert zangfrasen tweemaal.' },
  { id:'sp047', nameNL:'Kramsvogel',          nameEN:'Fieldfare',                 nameSci:'Turdus pilaris',             family:'Lijsters',        category:'standvogel', icon:'🐦', regions:['agrarisch','polder','bos'],                fieldmarks:'Grijs hoofd, roodbruin rug, gele borst met vlekken.' },
  { id:'sp048', nameNL:'Koperwiek',           nameEN:'Redwing',                   nameSci:'Turdus iliacus',             family:'Lijsters',        category:'standvogel', icon:'🐦', regions:['bos','agrarisch','stedelijk'],             fieldmarks:'Witte wenkbrauwstreep, roestoranje zijkant.' },
  { id:'sp049', nameNL:'Grote Lijster',       nameEN:'Mistle Thrush',             nameSci:'Turdus viscivorus',          family:'Lijsters',        category:'standvogel', icon:'🐦', regions:['bos','agrarisch'],                         fieldmarks:'Groot, dik gevlekte borst, witte vleugelaanslag in vlucht.' },

  // ── VLIEGENVANGERS & ROODSTAARTEN ────────────────────────────
  { id:'sp050', nameNL:'Roodborst',           nameEN:'European Robin',            nameSci:'Erithacus rubecula',         family:'Vliegenvangers',  category:'standvogel', icon:'🐦', regions:['bos','stedelijk','struweel'],              fieldmarks:'Felrode borst en gezicht, bruine bovenside, groot zwart oog.' },
  { id:'sp051', nameNL:'Zwarte Roodstaart',   nameEN:'Black Redstart',            nameSci:'Phoenicurus ochruros',       family:'Vliegenvangers',  category:'standvogel', icon:'🐦', regions:['stedelijk','kust','rotsen'],               fieldmarks:'Mannetje donkergrijs met oranje flanken en staart.' },
  { id:'sp052', nameNL:'Blauwborst',          nameEN:'Bluethroat',                nameSci:'Luscinia svecica',           family:'Vliegenvangers',  category:'standvogel', icon:'🐦', regions:['rietland','moeras','struweel'],            fieldmarks:'Mannetje blauw keel met rood-witte vlek, roestoranje staartband.' },
  { id:'sp053', nameNL:'Roodborsttapuit',     nameEN:'European Stonechat',        nameSci:'Saxicola rubicola',          family:'Vliegenvangers',  category:'standvogel', icon:'🐦', regions:['heide','duinen','struweel','agrarisch'],   fieldmarks:'Mannetje zwart hoofd, oranje borst, witte halsband.' },

  // ── HEGGENMUS ────────────────────────────────────────────────
  { id:'sp054', nameNL:'Heggenmus',           nameEN:'Dunnock',                   nameSci:'Prunella modularis',         family:'Heggenmus',       category:'standvogel', icon:'🐦', regions:['bos','stedelijk','struweel'],              fieldmarks:'Muizig grijs-bruin, gestreept, sluipend in lage begroeiing.' },

  // ── WINTERKONING ─────────────────────────────────────────────
  { id:'sp055', nameNL:'Winterkoning',        nameEN:'Eurasian Wren',             nameSci:'Troglodytes troglodytes',    family:'Winterkoningen',  category:'standvogel', icon:'🐦', regions:['bos','struweel','moeras','stedelijk'],     fieldmarks:'Piepklein, roodbruin, opstaart, enorm luid voor zijn formaat.' },

  // ── ZANGERS ──────────────────────────────────────────────────
  { id:'sp056', nameNL:'Tjiftjaf',            nameEN:'Common Chiffchaff',         nameSci:'Phylloscopus collybita',     family:'Boszangers',      category:'standvogel', icon:'🐦', regions:['bos','stedelijk','struweel'],              fieldmarks:'Olijfgroen, herkenbaar "tjif-tjaf" zang, steeds de staart dippend.' },
  { id:'sp057', nameNL:'Fitis',               nameEN:'Willow Warbler',            nameSci:'Phylloscopus trochilus',     family:'Boszangers',      category:'standvogel', icon:'🐦', regions:['bos','struweel','heide'],                  fieldmarks:'Olijfgroen-geel, iets geler dan Tjiftjaf, aflopende zang.' },
  { id:'sp058', nameNL:'Fluiter',             nameEN:'Wood Warbler',              nameSci:'Phylloscopus sibilatrix',    family:'Boszangers',      category:'standvogel', icon:'🐦', regions:['bos'],                                     fieldmarks:'Groen-geel, wit buik, trillende zang in hoog beukenbos.' },
  { id:'sp059', nameNL:'Zwartkop',            nameEN:'Eurasian Blackcap',         nameSci:'Sylvia atricapilla',         family:'Zangers',         category:'standvogel', icon:'🐦', regions:['bos','stedelijk','struweel'],              fieldmarks:'Mannetje zwarte kap, vrouwtje roestbruin kap, rijke melodieuze zang.' },
  { id:'sp060', nameNL:'Tuinfluiter',         nameEN:'Garden Warbler',            nameSci:'Sylvia borin',               family:'Zangers',         category:'standvogel', icon:'🐦', regions:['bos','struweel'],                          fieldmarks:'Geen opvallende kenmerken, rijke vloeiende zang, struiken.' },
  { id:'sp061', nameNL:'Grasmus',             nameEN:'Common Whitethroat',        nameSci:'Sylvia communis',            family:'Zangers',         category:'standvogel', icon:'🐦', regions:['struweel','agrarisch','heide','duinen'],   fieldmarks:'Mannetje grijze kop, witte keel, krast zingend omhoog.' },
  { id:'sp062', nameNL:'Braamsluiper',        nameEN:'Lesser Whitethroat',        nameSci:'Sylvia curruca',             family:'Zangers',         category:'standvogel', icon:'🐦', regions:['struweel','agrarisch','duinen'],           fieldmarks:'Grijsbruin, donkerder oor, droge ratelende zang.' },

  // ── GOUDHAANTJES ─────────────────────────────────────────────
  { id:'sp063', nameNL:'Goudhaantje',         nameEN:'Goldcrest',                 nameSci:'Regulus regulus',            family:'Goudhaantjes',    category:'standvogel', icon:'🐦', regions:['bos'],                                     fieldmarks:'Kleinste Europese vogel, gele kroonstreep, hoog tsjierend.' },
  { id:'sp064', nameNL:'Vuurgoudhaan',        nameEN:'Common Firecrest',          nameSci:'Regulus ignicapilla',        family:'Goudhaantjes',    category:'standvogel', icon:'🐦', regions:['bos'],                                     fieldmarks:'Oranje-geel kroonstreep, wit wenkbrauwstreep, levendiger dan Goudhaantje.' },

  // ── BOOMKLEVER & BOOMKRUIPER ────────────────────────────────
  { id:'sp065', nameNL:'Boomklever',          nameEN:'Eurasian Nuthatch',         nameSci:'Sitta europaea',             family:'Boomklevers',     category:'standvogel', icon:'🐦', regions:['bos'],                                     fieldmarks:'Blauwgrijs boven, roestoranje onder, zwarte oogstreep, loopt kopomlaag.' },
  { id:'sp066', nameNL:'Boomkruiper',         nameEN:'Short-toed Treecreeper',    nameSci:'Certhia brachydactyla',      family:'Boomkruipers',    category:'standvogel', icon:'🐦', regions:['bos','stedelijk'],                         fieldmarks:'Bruin-streepig, witte buik, spiraalvormig omhoog klimmen langs stam.' },
  { id:'sp067', nameNL:'Taigaboomkruiper',    nameEN:'Eurasian Treecreeper',      nameSci:'Certhia familiaris',         family:'Boomkruipers',    category:'standvogel', icon:'🐦', regions:['bos'],                                     fieldmarks:'Lijkt op Boomkruiper, iets meer wit achter oog, naaldbossen.' },

  // ── KWIKSTAARTEN & PIEPERS ───────────────────────────────────
  { id:'sp068', nameNL:'Witte Kwikstaart',    nameEN:'White Wagtail',             nameSci:'Motacilla alba',             family:'Kwikstaarten',    category:'standvogel', icon:'🐦', regions:['stedelijk','agrarisch','rivierengebied','kust'],fieldmarks:'Zwart-wit, lange wippende staart, loopt langs water en wegen.' },
  { id:'sp069', nameNL:'Gele Kwikstaart',     nameEN:'Western Yellow Wagtail',    nameSci:'Motacilla flava',            family:'Kwikstaarten',    category:'standvogel', icon:'🐦', regions:['agrarisch','polder','moeras'],             fieldmarks:'Geel-groen, geel onderzijde, wiebelende staart op graslanden.' },
  { id:'sp070', nameNL:'Veldleeuwerik',       nameEN:'Eurasian Skylark',          nameSci:'Alauda arvensis',            family:'Leeuweriken',     category:'standvogel', icon:'🐦', regions:['agrarisch','polder','heide','duinen'],     fieldmarks:'Bruin gestreept, kleine kuif, zingt onafgebroken hoog boven akker.' },
  { id:'sp071', nameNL:'Boomleeuwerik',       nameEN:'Wood Lark',                 nameSci:'Lullula arborea',            family:'Leeuweriken',     category:'standvogel', icon:'🐦', regions:['heide','bos'],                             fieldmarks:'Kortere staart dan Veldleeuwerik, witte wenkbrauw, melodieuze zang.' },
  { id:'sp072', nameNL:'Graspieper',          nameEN:'Meadow Pipit',              nameSci:'Anthus pratensis',           family:'Piepers',         category:'standvogel', icon:'🐦', regions:['agrarisch','heide','duinen','kust','polder'],fieldmarks:'Gestreept, roze poten, schrikkerige vlucht met "tsiep".' },
  { id:'sp073', nameNL:'Boompieper',          nameEN:'Tree Pipit',                nameSci:'Anthus trivialis',           family:'Piepers',         category:'standvogel', icon:'🐦', regions:['bos','heide'],                             fieldmarks:'Gestreept bruin, paraglides zingend van boomtop omlaag.' },
  { id:'sp074', nameNL:'Waterpieper',         nameEN:'Water Pipit',               nameSci:'Anthus spinoletta',          family:'Piepers',         category:'standvogel', icon:'🐦', regions:['kust','wad','rivierengebied'],             fieldmarks:'Grijzer hoofd, lichte onderzijde, langs bergbeken en kust.' },

  // ── IJSVOGEL ─────────────────────────────────────────────────
  { id:'sp075', nameNL:'IJsvogel',            nameEN:'Common Kingfisher',         nameSci:'Alcedo atthis',              family:'IJsvogels',       category:'standvogel', icon:'🐦', regions:['rivierengebied','moeras','polder'],        fieldmarks:'Felturkoois-oranje, zwaar hoofd, schiet laag over water.' },

  // ── FUTEN ────────────────────────────────────────────────────
  { id:'sp076', nameNL:'Dodaars',             nameEN:'Little Grebe',              nameSci:'Tachybaptus ruficollis',     family:'Futen',           category:'standvogel', icon:'🐦', regions:['moeras','polder','rivierengebied'],        fieldmarks:'Klein, donker kastanjebruin zijkant keel, groen mondhoek.' },
  { id:'sp077', nameNL:'Fuut',                nameEN:'Great Crested Grebe',       nameSci:'Podiceps cristatus',         family:'Futen',           category:'standvogel', icon:'🐦', regions:['moeras','polder','kust'],                  fieldmarks:'Groot, witte wang, roestoranje-zwarte kuif in broedkleed.' },

  // ── RALLEN ───────────────────────────────────────────────────
  { id:'sp078', nameNL:'Meerkoet',            nameEN:'Common Coot',               nameSci:'Fulica atra',                family:'Rallen',          category:'standvogel', icon:'🐦', regions:['moeras','polder','stedelijk'],             fieldmarks:'Zwart met wit snavel-schildje, luidruchtig op open water.' },
  { id:'sp079', nameNL:'Waterhoen',           nameEN:'Common Moorhen',            nameSci:'Gallinula chloropus',        family:'Rallen',          category:'standvogel', icon:'🐦', regions:['moeras','polder','stedelijk','rivierengebied'],fieldmarks:'Zwart, rode snavel met geel puntje, witte staartstreep.' },
  { id:'sp080', nameNL:'Waterral',            nameEN:'Water Rail',                nameSci:'Rallus aquaticus',           family:'Rallen',          category:'standvogel', icon:'🐦', regions:['rietland','moeras'],                       fieldmarks:'Bruinstreepig boven, blauwgrijs borst, rode snavel, in rietkragen.' },

  // ── REIGERS ──────────────────────────────────────────────────
  { id:'sp081', nameNL:'Blauwe Reiger',       nameEN:'Grey Heron',                nameSci:'Ardea cinerea',              family:'Reigers',         category:'standvogel', icon:'🐦', regions:['moeras','polder','rivierengebied','kust'], fieldmarks:'Groot grijs-wit, zwarte oogreep, gele snavel, trage vleugelslag.' },
  { id:'sp082', nameNL:'Kleine Zilverreiger', nameEN:'Little Egret',              nameSci:'Egretta garzetta',           family:'Reigers',         category:'standvogel', icon:'🐦', regions:['kust','moeras','rivierengebied'],          fieldmarks:'Spierwit, zwarte snavel en poten, gele voeten.' },
  { id:'sp083', nameNL:'Grote Zilverreiger',  nameEN:'Great Egret',               nameSci:'Ardea alba',                 family:'Reigers',         category:'standvogel', icon:'🐦', regions:['moeras','polder','rivierengebied','kust'], fieldmarks:'Spierwit, reusgroot, geel-oranje snavel buiten broedtijd.' },
  { id:'sp084', nameNL:'Purperreiger',        nameEN:'Purple Heron',              nameSci:'Ardea purpurea',             family:'Reigers',         category:'standvogel', icon:'🐦', regions:['rietland','moeras'],                       fieldmarks:'Slanker dan Blauwe Reiger, paars-roestbruin, slangachtige nek.' },
  { id:'sp085', nameNL:'Kwak',                nameEN:'Black-crowned Night Heron', nameSci:'Nycticorax nycticorax',      family:'Reigers',         category:'standvogel', icon:'🐦', regions:['moeras','rietland','rivierengebied'],      fieldmarks:'Compact, zwarte rug, grijze vleugels, rode ogen, nachtactief.' },

  // ── GANZEN & EENDEN ─────────────────────────────────────────
  { id:'sp086', nameNL:'Grauwe Gans',         nameEN:'Greylag Goose',             nameSci:'Anser anser',                family:'Ganzen',          category:'standvogel', icon:'🐦', regions:['polder','moeras','agrarisch'],             fieldmarks:'Groot grijs, oranje snavel, roze poten, luid knorrend.' },
  { id:'sp087', nameNL:'Canadese Gans',       nameEN:'Canada Goose',              nameSci:'Branta canadensis',          family:'Ganzen',          category:'standvogel', icon:'🐦', regions:['polder','moeras','agrarisch','stedelijk'], fieldmarks:'Zwarte nek/kop, witte kaakstreep, bruin lijf.' },
  { id:'sp088', nameNL:'Nijlgans',            nameEN:'Egyptian Goose',            nameSci:'Alopochen aegyptiaca',       family:'Ganzen',          category:'standvogel', icon:'🐦', regions:['polder','moeras','agrarisch','stedelijk'], fieldmarks:'Bruinig, donker oogmasker, roze poten, luidruchtig.' },
  { id:'sp089', nameNL:'Wilde Eend',          nameEN:'Mallard',                   nameSci:'Anas platyrhynchos',         family:'Eenden',          category:'standvogel', icon:'🐦', regions:['moeras','polder','stedelijk','rivierengebied'],fieldmarks:'Mannetje groen glanzende kop, gele snavel, paarse vleugelspiegel.' },
  { id:'sp090', nameNL:'Slobeend',            nameEN:'Northern Shoveler',         nameSci:'Spatula clypeata',           family:'Eenden',          category:'standvogel', icon:'🐦', regions:['moeras','polder','rietland'],              fieldmarks:'Breed spatelvormige snavel, mannetje groen hoofd, roestoranje flanken.' },
  { id:'sp091', nameNL:'Wintertaling',        nameEN:'Eurasian Teal',             nameSci:'Anas crecca',                family:'Eenden',          category:'standvogel', icon:'🐦', regions:['moeras','polder','kust'],                  fieldmarks:'Klein, mannetje kastanjebruin hoofd met groene oogstreep.' },
  { id:'sp092', nameNL:'Kuifeend',            nameEN:'Tufted Duck',               nameSci:'Aythya fuligula',            family:'Eenden',          category:'standvogel', icon:'🐦', regions:['moeras','polder','kust'],                  fieldmarks:'Mannetje zwart-wit met hangende kuif.' },
  { id:'sp093', nameNL:'Krooneend',           nameEN:'Common Pochard',            nameSci:'Aythya ferina',              family:'Eenden',          category:'standvogel', icon:'🐦', regions:['moeras','polder'],                         fieldmarks:'Mannetje roestoranje kop, grijs lijf, rode ogen.' },

  // ── MEEUWEN ──────────────────────────────────────────────────
  { id:'sp094', nameNL:'Zilvermeeuw',         nameEN:'European Herring Gull',     nameSci:'Larus argentatus',           family:'Meeuwen',         category:'standvogel', icon:'🐦', regions:['kust','zee','stedelijk','wad'],            fieldmarks:'Groot, grijs-wit, vlees-roze poten, rode punt aan gele snavel.' },
  { id:'sp095', nameNL:'Kleine Mantelmeeuw',  nameEN:'Lesser Black-backed Gull',  nameSci:'Larus fuscus',               family:'Meeuwen',         category:'standvogel', icon:'🐦', regions:['kust','zee','polder','wad'],               fieldmarks:'Donkergrijze rug, gele poten.' },
  { id:'sp096', nameNL:'Stormmeeuw',          nameEN:'Common Gull',               nameSci:'Larus canus',                family:'Meeuwen',         category:'standvogel', icon:'🐦', regions:['kust','zee','agrarisch','polder'],         fieldmarks:'Middelgroot, groen-gele snavel zonder rode punt.' },
  { id:'sp097', nameNL:'Kokmeeuw',            nameEN:'Black-headed Gull',         nameSci:'Chroicocephalus ridibundus', family:'Meeuwen',         category:'standvogel', icon:'🐦', regions:['kust','stedelijk','agrarisch','polder','wad'],fieldmarks:'Wit met chocoladebruin hoofd (broedkleed), rode snavel en poten.' },

  // ── STELTLOPERS ──────────────────────────────────────────────
  { id:'sp098', nameNL:'Scholekster',         nameEN:'Eurasian Oystercatcher',    nameSci:'Haematopus ostralegus',      family:'Scholeksters',    category:'standvogel', icon:'🐦', regions:['kust','wad','polder'],                     fieldmarks:'Zwart-wit, oranjerode snavel en ogen.' },
  { id:'sp099', nameNL:'Kievit',              nameEN:'Northern Lapwing',          nameSci:'Vanellus vanellus',          family:'Plevieren',       category:'standvogel', icon:'🐦', regions:['agrarisch','polder','moeras'],             fieldmarks:'Groene glans, lange kuif, ronde vleugels met breed zwart-wit patroon.' },
  { id:'sp100', nameNL:'Wulp',                nameEN:'Eurasian Curlew',           nameSci:'Numenius arquata',           family:'Snippen',         category:'standvogel', icon:'🐦', regions:['wad','kust','agrarisch','polder'],         fieldmarks:'Groot, lange neergebogen snavel, gestreept bruin.' },
  { id:'sp101', nameNL:'Grutto',              nameEN:'Black-tailed Godwit',       nameSci:'Limosa limosa',              family:'Snippen',         category:'standvogel', icon:'🐦', regions:['agrarisch','polder','wad'],                fieldmarks:'Lang, rechte snavel, oranje kop-hals (broedkleed), witte vleugelband.' },
  { id:'sp102', nameNL:'Tureluur',            nameEN:'Common Redshank',           nameSci:'Tringa totanus',             family:'Snippen',         category:'standvogel', icon:'🐦', regions:['wad','kust','moeras','polder'],            fieldmarks:'Roodbruin gestreept, rode snavel en poten, witte achtervleugel.' },
  { id:'sp103', nameNL:'Houtsnip',            nameEN:'Eurasian Woodcock',         nameSci:'Scolopax rusticola',         family:'Snippen',         category:'standvogel', icon:'🐦', regions:['bos','moeras'],                            fieldmarks:'Rond, camouflagepatroon, lange rechte snavel, schemer.' },

  // ── AALSCHOLVERS ─────────────────────────────────────────────
  { id:'sp104', nameNL:'Aalscholver',         nameEN:'Great Cormorant',           nameSci:'Phalacrocorax carbo',        family:'Aalscholvers',    category:'standvogel', icon:'🐦', regions:['kust','zee','rivierengebied','polder'],    fieldmarks:'Zwart, gele keelzak, staat met gespreide vleugels te drogen.' },

  // ── FAZANTEN ─────────────────────────────────────────────────
  { id:'sp105', nameNL:'Fazant',              nameEN:'Common Pheasant',           nameSci:'Phasianus colchicus',        family:'Fazanten',        category:'standvogel', icon:'🐦', regions:['agrarisch','bos','struweel'],              fieldmarks:'Mannetje met rode wangvlek, groene kop, lange staart.' },
  { id:'sp106', nameNL:'Patrijs',             nameEN:'Grey Partridge',            nameSci:'Perdix perdix',              family:'Fazanten',        category:'standvogel', icon:'🐦', regions:['agrarisch','polder','heide'],              fieldmarks:'Rondachtig, oranje gezicht, bruine vleugels, paardrijdroep.' },
  { id:'sp107', nameNL:'Kwartel',             nameEN:'Common Quail',              nameSci:'Coturnix coturnix',          family:'Fazanten',        category:'standvogel', icon:'🐦', regions:['agrarisch','polder'],                      fieldmarks:'Muisklein, gestreept, "kwik-kweek" roep, zelden gezien.' },

  // ── RIETVOGELS ───────────────────────────────────────────────
  { id:'sp108', nameNL:'Grote Karekiet',      nameEN:'Great Reed Warbler',        nameSci:'Acrocephalus arundinaceus', family:'Rietvogels',      category:'standvogel', icon:'🐦', regions:['rietland','moeras'],                       fieldmarks:'Groot, rossig bruin, luide krassende zang in rietkragen.' },
  { id:'sp109', nameNL:'Kleine Karekiet',     nameEN:'Reed Warbler',              nameSci:'Acrocephalus scirpaceus',   family:'Rietvogels',      category:'standvogel', icon:'🐦', regions:['rietland','moeras'],                       fieldmarks:'Rossig bruin, ongestreept, eentonige herhalende zang in riet.' },
  { id:'sp110', nameNL:'Rietzanger',          nameEN:'Sedge Warbler',             nameSci:'Acrocephalus schoenobaenus',family:'Rietvogels',      category:'standvogel', icon:'🐦', regions:['rietland','moeras','struweel'],            fieldmarks:'Wit wenkbrauwstreep, gestreepte kruin, ongeordende zang.' },
  { id:'sp111', nameNL:'Sprinkhaanzanger',    nameEN:'Common Grasshopper Warbler',nameSci:'Locustella naevia',         family:'Rietvogels',      category:'standvogel', icon:'🐦', regions:['rietland','struweel','heide'],             fieldmarks:'Gestreept, surrend insectachtig geluid, ontzettend verborgen.' },

  // ── SPREEUWEN ────────────────────────────────────────────────
  { id:'sp112', nameNL:'Spreeuw',             nameEN:'Common Starling',           nameSci:'Sturnus vulgaris',           family:'Spreeuwen',       category:'standvogel', icon:'🐦', regions:['stedelijk','agrarisch','polder'],          fieldmarks:'Donker iriserend met witte stippen in winterkleed, gele snavel zomer.' },

  // ── WIELEWAAL ────────────────────────────────────────────────
  { id:'sp113', nameNL:'Wielewaal',           nameEN:'Eurasian Golden Oriole',    nameSci:'Oriolus oriolus',            family:'Wielewalen',      category:'standvogel', icon:'🐦', regions:['bos','rivierengebied'],                    fieldmarks:'Mannetje felgeel met zwarte vleugels, fluittende roep in hoog loofbos.' },

  // ── ZWALUWEN ─────────────────────────────────────────────────
  { id:'sp114', nameNL:'Boerenzwaluw',        nameEN:'Barn Swallow',              nameSci:'Hirundo rustica',            family:'Zwaluwen',        category:'standvogel', icon:'🐦', regions:['agrarisch','stedelijk','polder','moeras'], fieldmarks:'Staalblauwe rug, rood-roze keel, lange staartpennen.' },
  { id:'sp115', nameNL:'Huiszwaluw',          nameEN:'Common House Martin',       nameSci:'Delichon urbicum',           family:'Zwaluwen',        category:'standvogel', icon:'🐦', regions:['stedelijk','agrarisch'],                   fieldmarks:'Blauw-zwart, witte stuit, korte gevorkte staart.' },
  { id:'sp116', nameNL:'Oeverzwaluw',         nameEN:'Sand Martin',               nameSci:'Riparia riparia',            family:'Zwaluwen',        category:'standvogel', icon:'🐦', regions:['rivierengebied','kust','moeras'],          fieldmarks:'Bruin met bruine borstband, broedt in kolonies in zandwanden.' },

  // ── GORZEN ───────────────────────────────────────────────────
  { id:'sp117', nameNL:'Geelgors',            nameEN:'Yellowhammer',              nameSci:'Emberiza citrinella',        family:'Gorzen',          category:'standvogel', icon:'🐦', regions:['agrarisch','struweel','heide'],            fieldmarks:'Mannetje felgeel hoofd en borst, kastanjebruine rug.' },
  { id:'sp118', nameNL:'Rietgors',            nameEN:'Reed Bunting',              nameSci:'Emberiza schoeniclus',       family:'Gorzen',          category:'standvogel', icon:'🐦', regions:['rietland','moeras','struweel'],            fieldmarks:'Mannetje zwarte kop-keel, witte snorstreep, in rietlanden.' },
  { id:'sp119', nameNL:'Grauwe Gors',         nameEN:'Corn Bunting',              nameSci:'Emberiza calandra',          family:'Gorzen',          category:'standvogel', icon:'🐦', regions:['agrarisch','polder'],                      fieldmarks:'Groot, gestreept grijsbruin, geelbruin snavel, sleutelring-zang.' },

  // ── OVERIGE ──────────────────────────────────────────────────
  { id:'sp120', nameNL:'Nachtegaal',          nameEN:'Common Nightingale',        nameSci:'Luscinia megarhynchos',      family:'Vliegenvangers',  category:'standvogel', icon:'🐦', regions:['bos','struweel','moeras'],                 fieldmarks:'Rossig bruin, roodbruine staart, befaamde nachtgezang.' },
];

// ── Regio-definities ───────────────────────────────────────────
export const REGIONS = {
  stedelijk:      { label:'Stedelijk',        tags:['stedelijk'] },
  agrarisch:      { label:'Agrarisch',        tags:['agrarisch','polder'] },
  bos:            { label:'Bos',              tags:['bos'] },
  heide:          { label:'Heide',            tags:['heide','struweel'] },
  duinen:         { label:'Duinen',           tags:['duinen','struweel','kust'] },
  kust:           { label:'Kust & zee',       tags:['kust','zee','wad'] },
  water:          { label:'Water & moeras',   tags:['moeras','rietland','rivierengebied','polder'] },
};

export const REGION_KEYS = Object.keys(REGIONS);

// ── Gezien-status (localStorage) ─────────────────────────────
const SEEN_KEY = 'birdspot-seen-species';

export function getSeenIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'));
  } catch (_) { return new Set(); }
}

export function toggleSeen(speciesId) {
  const seen = getSeenIds();
  if (seen.has(speciesId)) seen.delete(speciesId);
  else seen.add(speciesId);
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...seen])); } catch (_) {}
  return seen.has(speciesId);
}

export function isSeen(speciesId) {
  return getSeenIds().has(speciesId);
}

// ── Helpers ───────────────────────────────────────────────────
export function getCategories() {
  return ['standvogel','trekvogel','zomergast','wintergast','dwaalgast'];
}

export const CATEGORY_LABELS = {
  standvogel: 'Standvogels',
  trekvogel:  'Trekvogels',
  zomergast:  'Zomergasten',
  wintergast: 'Wintergasten',
  dwaalgast:  'Dwaalgasten',
};

/**
 * Zoek soorten op naam/familie/Latijn én optioneel op regio-tags.
 * @param {string} query       - vrije zoekopdracht
 * @param {string|null} category - categoriefilter
 * @param {string|null} region   - regio-sleutel (key van REGIONS)
 */
export function searchSpecies(query, category = null, region = null) {
  const q = query.toLowerCase().trim();

  // Bepaal welke regio-tags actief zijn
  const activeTags = region ? REGIONS[region]?.tags ?? [] : null;

  return SPECIES.filter(s => {
    const matchCat    = !category || s.category === category;
    const matchRegion = !activeTags || s.regions?.some(r => activeTags.includes(r));
    if (!matchCat || !matchRegion) return false;
    if (!q) return true;
    return s.nameNL.toLowerCase().includes(q)
        || s.nameEN.toLowerCase().includes(q)
        || s.nameSci.toLowerCase().includes(q)
        || s.family.toLowerCase().includes(q)
        || s.regions?.some(r => r.includes(q));
  });
}
