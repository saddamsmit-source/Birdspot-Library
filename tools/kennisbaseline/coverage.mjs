// Dekkingsmatrix kennisbaseline — meet per Birdspot-ID welke inhoud bestaat, hoe uitgebreid en met welke
// bronstatus. Meet aanwezigheid en omvang; zegt NIETS over inhoudelijke juistheid (een gevuld veld is geen
// geverifieerd veld). Gebruik: node tools/kennisbaseline/coverage.mjs [uit.json] [uit.md]
import { writeFileSync } from 'node:fs';
import { SPECIES } from '../../src/data/species.js';
import { LIFE } from '../../src/data/speciesLife.js';
import { GUIDE_COMPARISONS } from '../../src/features/species/guideComparisons.js';
import { GUIDE_PHOTOS } from '../../src/features/species/guidePhotos.js';
import { GUIDE_AUDIO, GUIDE_HEROES, GUIDE_PLUMAGE, GUIDE_POSES } from '../../src/features/species/guideMedia.js';
import { KNOWLEDGE } from '../../src/data/speciesKnowledge.js';

const [outJson, outMd] = process.argv.slice(2);
const len = v => (typeof v === 'string' ? v.trim().length : 0);
const hasPhoto = id => Boolean(GUIDE_PHOTOS[id] || GUIDE_HEROES[id] ||
  (GUIDE_PLUMAGE[id] && Object.keys(GUIDE_PLUMAGE[id]).length) || GUIDE_POSES[id]?.length);

const rows = SPECIES.map(s => {
  const life = LIFE[s.id] || null;
  const plumage = Object.entries(s.plumage || {}).filter(([, v]) => len(v));
  const cmp = GUIDE_COMPARISONS.filter(e => e.birds.some(b => b.id === s.id));
  const partners = [...new Set(cmp.flatMap(e => e.birds.map(b => b.id)).filter(id => id !== s.id))];
  const k = KNOWLEDGE[s.id];
  const sizeKeys = ['length', 'wingspan', 'weight'].filter(key => len(s.size?.[key]));
  return {
    id: s.id, nameNL: s.nameNL, nameSci: s.nameSci, family: s.family, category: s.category, compact: Boolean(s.compact),
    // A basis
    A: { nameEN: len(s.nameEN) > 0, size: sizeKeys.length, sizeSourced: s.guideReview?.dimensions?.length || 0, status: len(s.status) > 0, redList: s.redList ?? null },
    // B herkenning
    B: { fieldmarksChars: len(s.fieldmarks), plumageFields: plumage.map(([key]) => key), photos: hasPhoto(s.id) },
    // C kritische kenmerken (alleen in kennisprofiel)
    C: { criticalMarks: k?.critical?.length || 0 },
    // D vergelijkingen
    D: { comparisons: cmp.length, partners },
    // E geluid
    E: { voiceText: len(life?.voice) > 0, audioClips: (GUIDE_AUDIO[s.id] || []).length },
    // F leefgebied
    F: { distributionChars: len(s.distribution), regions: (s.regions || []).length, months: s.months || null },
    // G leefwijze
    G: { diet: len(life?.diet) > 0, behaviour: len(life?.behaviour) > 0, migration: len(life?.migration) > 0, breeding: Boolean(life?.breeding) },
    // H status
    H: { frequency: s.frequency || null, breeding: s.breeding || null, redList: s.redList ?? null },
    sources: { guideReview: Boolean(s.guideReview), guideReviewSources: s.guideReview?.sources?.length || 0, lifeSourcePerSpecies: false, knowledgeProfile: Boolean(k) },
  };
});

// Niveau: 0 = alleen basisrecord, 1 = gidstekst zonder broncontrole, 2 = deels broncontrole (guideReview), 3 = kennisprofiel
const level = r => (r.sources.knowledgeProfile ? 3 : r.sources.guideReview ? 2 : (r.G.diet || r.B.plumageFields.length > 1) ? 1 : 0);
rows.forEach(r => { r.level = level(r); });

const count = f => rows.filter(f).length;
const summary = {
  species: rows.length, compact: count(r => r.compact),
  withPhoto: count(r => r.B.photos), withComparisons: count(r => r.D.comparisons > 0),
  withLife: count(r => r.G.diet), withVoiceText: count(r => r.E.voiceText), withAudio: count(r => r.E.audioClips > 0),
  withGuideReview: count(r => r.sources.guideReview), withKnowledgeProfile: count(r => r.sources.knowledgeProfile),
  fieldmarksShort: count(r => r.B.fieldmarksChars < 80), femaleText: count(r => r.B.plumageFields.includes('adult_f')),
  juvText: count(r => r.B.plumageFields.includes('juv')), redList: count(r => r.H.redList),
  levels: [0, 1, 2, 3].map(l => count(r => r.level === l)),
};
if (outJson) writeFileSync(outJson, JSON.stringify({ summary, rows }, null, 1));
if (outMd) {
  const yn = b => (b ? 'ja' : '—');
  const L = ['# Birdspot — dekkingsmatrix kennisbaseline', '',
    'Gegenereerd door `tools/kennisbaseline/coverage.mjs`. Meet aanwezigheid en omvang, **niet** juistheid. Niveau: 0 basisrecord · 1 gidstekst zonder broncontrole · 2 deels broncontrole (`guideReview`) · 3 kennisprofiel volgens het nieuwe contract.', '',
    '| Meting | Aantal |', '|---|---|',
    ...Object.entries(summary).map(([k, v]) => `| ${k} | ${Array.isArray(v) ? v.join(' / ') : v} |`), '',
    '| ID | Soort | Groep | Niv. | Veldkenmerken (tekens) | Kleden met tekst | Foto | Vergelijkingen | Leefwijze | Zangtekst | Audio | Bronnen soortkaart | Kritische kenmerken |',
    '|---|---|---|---|---|---|---|---|---|---|---|---|---|',
    ...[...rows].sort((a, b) => a.family.localeCompare(b.family, 'nl') || a.nameNL.localeCompare(b.nameNL, 'nl')).map(r =>
      `| ${r.id} | ${r.nameNL}${r.compact ? ' (compact)' : ''} | ${r.family} | ${r.level} | ${r.B.fieldmarksChars} | ${r.B.plumageFields.join(', ') || '—'} | ${yn(r.B.photos)} | ${r.D.comparisons || '—'} | ${yn(r.G.diet)} | ${yn(r.E.voiceText)} | ${r.E.audioClips || '—'} | ${r.sources.guideReviewSources || '—'} | ${r.C.criticalMarks || '—'} |`)];
  writeFileSync(outMd, L.join('\n') + '\n');
}
console.log(JSON.stringify(summary));
