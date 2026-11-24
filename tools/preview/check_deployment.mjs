#!/usr/bin/env node
/** Birdspot preview-QA laag 1–3: GitHub-SHA ↔ gedeployde Vercel-SHA en READY (PR #358).
 *
 * Alleen lezen: GET /v13/deployments/{idOrUrl}. Geen deployment, geen wijziging.
 * Nodig: VERCEL_TOKEN (alleen-lezen bruikbaar) en VERCEL_TEAM_ID. Ontbreekt toegang → BLOCKED (exit 2).
 * Gebruik: node tools/preview/check_deployment.mjs <deployment-id of host> <verwachte 40-tekens SHA>
 */
const [target, expected] = process.argv.slice(2);
const out = (outcome, detail) => { console.log(JSON.stringify({ check: 'deployment-sha-ready', outcome, ...detail }, null, 1)); process.exit(outcome === 'PASS' ? 0 : outcome === 'BLOCKED' ? 2 : 1); };
if (!target || !/^[0-9a-f]{40}$/.test(expected || '')) out('FAIL', { reason: 'gebruik: <deployment-id of host> <40-tekens SHA>' });
const token = process.env.VERCEL_TOKEN, team = process.env.VERCEL_TEAM_ID;
if (!token || !team) out('BLOCKED', { reason: 'VERCEL_TOKEN of VERCEL_TEAM_ID ontbreekt; eigenaar moet leestoegang regelen' });
const host = target.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
const res = await fetch(`https://api.vercel.com/v13/deployments/${encodeURIComponent(host)}?teamId=${encodeURIComponent(team)}`, { headers: { Authorization: `Bearer ${token}` } });
if (res.status === 401 || res.status === 403) out('BLOCKED', { reason: `Vercel-API ${res.status}: geen leestoegang tot dit team` });
if (!res.ok) out('FAIL', { reason: `Vercel-API ${res.status}` });
const d = await res.json();
// CLI-, API- en Git-deploys leggen de commit op verschillende plekken vast.
const candidates = [d.gitSource?.sha, d.meta?.githubCommitSha, d.meta?.gitlabCommitSha, d.meta?.gitCommitSha, d.meta?.gitSha, d.meta?.sha].filter(Boolean);
const detail = { id: d.id, url: d.url, project: d.name, target: d.target ?? 'preview', readyState: d.readyState, deployedSha: candidates[0] ?? null, expectedSha: expected };
if (d.readyState !== 'READY') out('FAIL', { ...detail, reason: 'deployment niet READY' });
if (!candidates.length) out('BLOCKED', { ...detail, reason: 'deployment bevat geen commit-SHA; deploy met --meta gitSha=<SHA>' });
if (!candidates.includes(expected)) out('FAIL', { ...detail, reason: 'gedeployde SHA wijkt af van de geteste SHA' });
out('PASS', detail);
