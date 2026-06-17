// Replaces the site homepage ("/") content with the Humanitas composition by
// adding a new published version to the existing home experience ("C Demo").
// Reversible: previous versions are retained in CMS version history.
//
//   node --env-file=.env utils/set-humanitas-home.mjs
import { cma } from './cma.mjs';
import { humanitasComposition, humanitasSeo } from './seed-humanitas.mjs';

const HOME_KEY = process.env.HOME_KEY || '81bd709427014714bfe80e22b3499a18'; // "C Demo" → serves /

// 1) Inspect the current home experience version (keep its routeSegment/contentType/locale).
const vr = await cma('GET', `/content/${HOME_KEY}/versions`);
const cur = (vr.data?.items || []).find((i) => i.status === 'published') || vr.data?.items?.[0];
if (!cur) { console.error('home experience not found', vr.status, JSON.stringify(vr.data).slice(0, 200)); process.exit(1); }
console.log('current home:', cur.displayName, '| route:', cur.routeSegment, '| type:', cur.contentType, '| locale:', cur.locale);

// 2) Create a new draft version carrying the Humanitas composition.
const body = {
    contentType: cur.contentType,
    displayName: 'Humanitas — Home',
    locale: cur.locale,
    routeSegment: cur.routeSegment, // unchanged → URL mapping ("/") preserved
    composition: humanitasComposition(),
    properties: humanitasSeo,
};
const cr = await cma('POST', `/content/${HOME_KEY}/versions`, body);
console.log('create version ->', cr.status);
if (!cr.ok && cr.status !== 201) { console.error(JSON.stringify(cr.data).slice(0, 600)); process.exit(1); }

// 3) Find the new draft version and publish it.
const after = await cma('GET', `/content/${HOME_KEY}/versions`);
const draft = (after.data?.items || []).find((i) => i.status !== 'published');
if (!draft) { console.error('no draft version found after create'); process.exit(1); }
console.log('new draft version:', draft.version);
const p = await cma('POST', `/content/${HOME_KEY}/versions/${draft.version}:publish`, {});
console.log('publish ->', p.status, p.ok ? 'PUBLISHED' : JSON.stringify(p.data).slice(0, 300));
console.log('\nDONE. Home "/" now renders the Humanitas experience (key', HOME_KEY + ').');
