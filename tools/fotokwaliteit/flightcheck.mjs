// Vluchtcontrole-contract (10-11-2026). Pure functie zodat tests ook gemuteerde registers kunnen toetsen.
// Regel: een foto mag alleen als vlucht getoond worden als er een vastgelegde visuele beoordeling is met
// klasse vlucht/bidden/zweven en uitslag goedgekeurd/voorwaardelijk. Een metadata- of bestandsnaamcheck
// alleen is geen bewijs: zonder beoordelingsregel faalt de controle.
export const AIRBORNE_OK = new Set(['vlucht', 'bidden', 'zweven']);
export const KEEP = new Set(['goedgekeurd', 'voorwaardelijk']);

/** Alle foto's die de app als vlucht behandelt, uit de vier registers. */
export function flightAssets({ photos = {}, plumage = {}, poses = {} }) {
  const out = [];
  for (const [id, p] of Object.entries(photos)) if (p?.flight) out.push({ id, from: 'GUIDE_PHOTOS', image: p.image });
  for (const [id, cards] of Object.entries(plumage))
    for (const [key, p] of Object.entries(cards)) if (p?.flight) out.push({ id, from: `GUIDE_PLUMAGE.${key}`, image: p.image });
  for (const [id, list] of Object.entries(poses))
    list.forEach((p, i) => { if (p?.flight) out.push({ id, from: `GUIDE_POSES[${i}]`, image: p.image }); });
  return out;
}

/** Geeft een lijst fouten; leeg = conform. */
export function checkFlight(registers, review, retired = {}) {
  const errors = [];
  const assets = review.assets || {};
  for (const a of flightAssets(registers)) {
    const r = assets[a.image];
    if (!r) { errors.push(`${a.id} ${a.image}: vluchtfoto zonder visuele beoordeling`); continue; }
    if (r.id !== a.id) errors.push(`${a.id} ${a.image}: beoordeling hoort bij ${r.id}`);
    if (!AIRBORNE_OK.has(r.class)) errors.push(`${a.id} ${a.image}: klasse "${r.class}" is geen vlucht maar staat als vlucht`);
    if (!KEEP.has(r.decision)) errors.push(`${a.id} ${a.image}: uitslag "${r.decision}" maar nog als vlucht gemarkeerd`);
  }
  // Afgekeurde of gearchiveerde foto's mogen nergens meer als vlucht staan.
  const live = new Set(flightAssets(registers).map(a => a.image));
  for (const [image, r] of Object.entries(assets)) {
    if ((r.decision === 'uit-rol' || r.decision === 'archief') && live.has(image)) errors.push(`${r.id} ${image}: ${r.decision} maar nog vlucht`);
    if (r.decision === 'archief') {
      const kept = (retired[r.id] || []).find(p => p.image === image);
      if (!kept) errors.push(`${r.id} ${image}: gearchiveerd zonder bewaarde herkomst`);
      else if (!kept.source || !kept.author || !kept.license || !kept.retiredReason) errors.push(`${r.id} ${image}: archief mist herkomst of reden`);
    }
  }
  return errors;
}

/** Alle geregistreerde gidsfoto's (ongeacht vluchtlabel) met hun registerplaats. */
export function allAssets({ photos = {}, heroes = {}, plumage = {}, poses = {} }) {
  const out = [];
  for (const [id, p] of Object.entries(photos)) if (p?.image) out.push({ id, from: 'GUIDE_PHOTOS', image: p.image, flight: !!p.flight });
  for (const [id, p] of Object.entries(heroes)) if (p?.image) out.push({ id, from: 'GUIDE_HEROES', image: p.image, flight: !!p.flight });
  for (const [id, cards] of Object.entries(plumage))
    for (const [key, p] of Object.entries(cards)) if (p?.image) out.push({ id, from: `GUIDE_PLUMAGE.${key}`, image: p.image, flight: !!p.flight });
  for (const [id, list] of Object.entries(poses))
    list.forEach((p, i) => { if (p?.image) out.push({ id, from: `GUIDE_POSES[${i}]`, image: p.image, flight: !!p.flight }); });
  return out;
}

/**
 * FQA-01 (10-11-2026): beeldinhoud ⇔ vluchtlabel, over álle gidsfoto's. `hashOf(image)` levert de actuele SHA-1 van het
 * bestand, zodat een beoordeling alleen geldt voor precies dat beeld. Fouten:
 *  - foto zonder visuele beoordeling, of beoordeling voor een ander (gewijzigd) bestand;
 *  - beoordeeld als vrij vliegend/biddend/zwevend maar zonder flight:true (echte vluchtfoto in een kleedgalerij);
 *  - flight:true terwijl de beoordeling geen luchtgedragen vlucht is.
 */
export function checkInventory(registers, inventory, hashOf) {
  const errors = [];
  const images = inventory.images || {};
  const byImage = new Map();
  for (const a of allAssets(registers)) byImage.set(a.image, [...(byImage.get(a.image) || []), a]);
  for (const [image, refs] of byImage) {
    const e = images[image];
    const where = `${refs[0].id} ${image}`;
    if (!e) { errors.push(`${where}: geen visuele beeldbeoordeling`); continue; }
    if (e.sha1 !== hashOf(image)) { errors.push(`${where}: bestand gewijzigd sinds de beeldbeoordeling (SHA-1 wijkt af)`); continue; }
    if (e.class === 'te beoordelen' || e.airborne == null) { errors.push(`${where}: beoordeling ontbreekt (te beoordelen)`); continue; }
    const tagged = refs.some(r => r.flight);
    if (e.airborne && !tagged) errors.push(`${where}: vrij vliegend (${e.class}) maar zonder flight:true — echte vluchtfoto staat in een kleedgalerij`);
    if (!e.airborne && tagged) errors.push(`${where}: flight:true maar het beeld toont ${e.class}`);
  }
  return errors;
}
