/** Vercel-deployset (.vercelignore-toelatingslijst) — eigenaarakkoord 24-11-2026, PR #358.
 *
 * Borgt dat de app alleen bestanden gebruikt die in de deployset zitten:
 * - .vercelignore sluit de hoofdmap uit en laat alleen de genoemde runtimepaden toe;
 * - elk bestand of map in de hoofdmap is bewust toegelaten of bewust uitgesloten (nieuw = test faalt);
 * - HTML-verwijzingen, serviceworker-precache, manifesticonen, JS-imports en alle lokale
 *   asset-, credit- en audiopaden bestaan én vallen binnen de toelatingslijst;
 * - uitgesloten mappen worden door geen runtimebestand geladen.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const lines = readFileSync(join(ROOT, '.vercelignore'), 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
assert.equal(lines[0], '/*', 'eerste regel moet alles in de hoofdmap uitsluiten');
const ALLOW = new Set(lines.slice(1).map(l => { assert.match(l, /^![^/*]+$/, `alleen hoofdmapregels in Vercel-voorbeeldvorm (!naam): ${l}`); return l.slice(1); }));
const EXCLUDED = new Set(['docs', 'tests', 'tools', '.github', 'README.md']);
// Automatisch door Vercel genegeerd of alleen lokaal aanwezig.
const IGNORED = new Set(['.git', '.gitignore', '.vercelignore', 'node_modules', '.vercel']);

for (const name of readdirSync(ROOT)) {
  if (IGNORED.has(name)) continue;
  assert.ok(ALLOW.has(name) || EXCLUDED.has(name), `nieuw item in de hoofdmap: ${name} — kies toelaten (.vercelignore) of uitsluiten (deze test)`);
}
for (const name of ALLOW) assert.ok(existsSync(join(ROOT, name)), `toegelaten pad bestaat niet: ${name}`);

const inDeploy = rel => ALLOW.has(normalize(rel).split(/[\\/]/)[0]);
const checked = new Set();
function need(rel, from) {
  rel = decodeURIComponent(normalize(rel.replace(/^\/+/, '')));
  assert.ok(!rel.startsWith('..'), `${from}: pad buiten de app ${rel}`);
  assert.ok(existsSync(join(ROOT, rel)), `${from}: ontbrekend bestand ${rel}`);
  assert.ok(inDeploy(rel), `${from}: ${rel} valt buiten de Vercel-deployset`);
  checked.add(rel);
}
const walk = dir => readdirSync(join(ROOT, dir)).flatMap(n => statSync(join(ROOT, dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]);

// 1. HTML-ingangen
for (const html of ['index.html', 'feedback-inbox.html']) {
  const s = readFileSync(join(ROOT, html), 'utf8');
  for (const [, url] of s.matchAll(/(?:src|href)="([^"#?]+)"/g)) if (!/^(?:https?:|data:|mailto:)/.test(url)) need(url, html);
}
// 2. Serviceworker-precache
const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
const pre = sw.match(/const PRECACHE_PATHS = \[([\s\S]*?)\];/)[1];
for (const [, p] of pre.matchAll(/'([^']*)'/g)) need(p || 'index.html', 'sw.js');
for (const [, p] of sw.matchAll(/atScope\('([^']+\.[a-z0-9]+)'\)/g)) need(p, 'sw.js'); // prefixen als 'photos/' en 'api/' zijn routes, geen bestanden
// 3. Manifesticonen
for (const icon of JSON.parse(readFileSync(join(ROOT, 'manifest.webmanifest'), 'utf8')).icons || []) need(icon.src.split(/[?#]/, 1)[0], 'manifest');
// 4. JS-imports (statisch en dynamisch) in src en api
for (const file of [...walk('src'), ...walk('api')].filter(f => /\.m?js$/.test(f))) {
  const s = readFileSync(join(ROOT, file), 'utf8');
  for (const [, spec] of s.matchAll(/(?:\bimport\s*(?:[\w*{}\s,]+from\s*)?|\bimport\s*\(\s*|\bexport\s+[\w*{}\s,]+from\s*|new\s+(?:Shared)?Worker\s*\(\s*new\s+URL\s*\(\s*)['"](\.{1,2}\/[^'"]+)['"]/g)) need(relative(ROOT, join(ROOT, dirname(file), spec)), file);
}
// 5. Lokale asset-, credit- en audiopaden in runtimedata
const runtimeText = [...walk('src'), ...walk('assets'), 'sw.js', 'index.html', 'feedback-inbox.html'].filter(f => /\.(m?js|json|html|css)$/.test(f));
for (const file of runtimeText) {
  const s = readFileSync(join(ROOT, file), 'utf8');
  for (const [, p] of s.matchAll(/["'`(]\/?((?:assets|icons|styles)\/[^"'`)\s?#]+\.(?:webp|avif|png|jpe?g|svg|mp3|wav|ogg|json|css))/g)) if (!p.includes('${')) need(p, file); // sjabloonpaden worden via de data gecontroleerd
  // Uitgesloten mappen mogen alleen als tekst (bronvermelding, commentaar) voorkomen, nooit als laadpad.
  for (const [, p] of s.matchAll(/(?:fetch|import|importScripts|new\s+URL|atScope|assetUrl)\s*\(\s*['"`]\/?((?:docs|tests|tools)\/[^'"`]+)/g)) assert.fail(`${file} laadt ${p} uit een uitgesloten map`);
}
const media = checked.size;
assert.ok(media > 700, `te weinig runtimepaden gecontroleerd (${media}); patroon gebroken?`);
console.log(`VERCELIGNORE-RUNTIME PASS: ${ALLOW.size} toegelaten hoofdmapitems; ${media} gebruikte bestanden binnen de deployset; uitgesloten: ${[...EXCLUDED].join(', ')}`);
