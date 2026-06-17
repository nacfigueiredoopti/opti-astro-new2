// Updates the SiteSettings bound to the Netlify host (footer text + socials) to
// Humanitas. Creates a new published version (properties are merged over current).
//   node --env-file=.env utils/update-sitesettings.mjs
import { cma } from './cma.mjs';

const KEY = process.env.SITESETTINGS_KEY || '2c3389e0c6c14985a775ad7d36c8c2cd'; // SiteDomain: hilarious-faun-1ceb1d.netlify.app

const v = await cma('GET', `/content/${KEY}/versions?pageSize=3`);
const cur = (v.data.items || []).find((i) => i.status === 'published') || v.data.items?.[0];
if (!cur) { console.error('SiteSettings version not found'); process.exit(1); }
console.log('current:', cur.displayName, '| domain:', cur.properties?.SiteDomain?.value);

const props = { ...(cur.properties || {}) };
const set = (k, val) => { props[k] = { value: val }; };

// Clear the old (Cadac) logo so the header/footer fall back to /humanitas-logo.svg
delete props.Logo;
delete props.LogoResolution;

set('FooterText', "Humanitas — from person to person. The Netherlands’ largest volunteer organisation, helping people change their own situation in their own strength since 1945.");
set('SocialFacebook', 'humanitasnederland');
set('SocialInstagram', 'humanitas_nederland');
set('SocialTwitter', '');   // Humanitas uses Bluesky now — hide X/Twitter
set('SocialTikTok', '');
set('SocialGitHub', '');

const body = {
    contentType: cur.contentType,
    displayName: cur.displayName,
    locale: cur.locale,
    routeSegment: cur.routeSegment,
    properties: props,
};
const cr = await cma('POST', `/content/${KEY}/versions`, body);
console.log('create version ->', cr.status);
if (cr.status !== 201 && !cr.ok) { console.error(JSON.stringify(cr.data).slice(0, 500)); process.exit(1); }

const after = await cma('GET', `/content/${KEY}/versions?pageSize=3`);
const draft = (after.data.items || []).find((i) => i.status !== 'published');
const p = await cma('POST', `/content/${KEY}/versions/${draft.version}:publish`, {});
console.log('publish ->', p.status, p.ok ? 'PUBLISHED' : JSON.stringify(p.data).slice(0, 300));
