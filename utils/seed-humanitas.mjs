// Seeds a Humanitas home experience into the Optimizely SaaS CMS via the
// Content Management API (/v1/content). Reuses the stock opti-astro components
// (Hero, Text, Paragraph, Card, CallToAction) and display templates.
//
//   node --env-file=.env utils/seed-humanitas.mjs
//
// Re-runnable: pass a fixed key via HUMANITAS_HOME_KEY to update instead of
// creating a duplicate.
import { randomUUID } from 'crypto';
import { cma } from './cma.mjs';

const CONTAINER = '43f936c99b234ea397b261c538ad07c9'; // Root container (Settings tab)
const LOCALE = 'en';

const id = () => randomUUID();
const html = (s) => ({ value: { html: s } });
const text = (s) => ({ value: s });

// ── leaf component builders ──────────────────────────────────────────────
const hero = (heading, body) => ({
    id: id(), displayName: 'Hero', nodeType: 'component',
    displaySettings: { displayTemplate: 'DefaultHero', settings: {} },
    component: { contentType: 'Hero', properties: { Heading: text(heading), Body: html(body) } },
});

const heading = (content, level = 'h2', align = 'center') => ({
    id: id(), displayName: 'Text', nodeType: 'component',
    displaySettings: { displayTemplate: 'TextStyles', settings: { headingType: level, textAlign: align, showAs: 'heading', transform: 'keep' } },
    component: { contentType: 'Text', properties: { Content: text(content) } },
});

const paragraph = (htmlStr) => ({
    id: id(), displayName: 'Paragraph', nodeType: 'component',
    displaySettings: { displayTemplate: 'DefaultParagraph', settings: { paragraph_alignment: null } },
    component: { contentType: 'Paragraph', properties: { Text: html(htmlStr) } },
});

const card = (h, bodyHtml, linkText, linkUrl) => ({
    id: id(), displayName: 'Card', nodeType: 'component',
    displaySettings: { displayTemplate: 'DefaultCard', settings: {
        transform: 'keep', buttonStyle: 'standard', buttonWidth: 'w_12rem', buttonSize: 'medium',
        buttonRadius: 'lg', buttonAction: 'static', assetWidth: 'flex_1', contentWidth: 'flex_1',
        textAlign: 'left', transformHeader: 'normal_case', assetVerticalAlign: 'center',
        contentVerticalAlign: 'center', backgroundColor: 'base_100' } },
    component: { contentType: 'Card', properties: {
        Heading: text(h), Body: html(bodyHtml), DisplayAs: text('textBelowCard'),
        Links: { value: [{ url: linkUrl, target: '_self', text: linkText }] } } },
});

const cta = (label, url) => ({
    id: id(), displayName: 'Call To Action', nodeType: 'component',
    displaySettings: { displayTemplate: 'DefaultCallToAction', settings: { transform: 'keep', buttonStyle: 'standard', buttonWidth: 'w_12rem', buttonSize: 'lg' } },
    component: { contentType: 'CallToAction', properties: { Links: { value: [{ url, target: '_self', text: label }] } } },
});

// ── layout wrappers ──────────────────────────────────────────────────────
const column = (nodes, settings = {}) => ({
    id: id(), displayName: 'Column', nodeType: 'column',
    displaySettings: { displayTemplate: 'DefaultColumn', settings: {
        contentSpacing: 'medium', justifyContent: 'center', alignContent: 'start',
        showFrom: 'always', minWidth: 'auto', overflow: 'full', backgroundColor: 'transparent', ...settings } },
    nodes,
});

const row = (columns, settings = {}) => ({
    id: id(), displayName: 'Row', nodeType: 'row',
    displaySettings: { displayTemplate: 'DefaultRow', settings: {
        showAsRowFrom: 'md', contentSpacing: 'medium', justifyContent: 'start',
        alignContent: 'start', verticalSpacing: 'none', backgroundColor: 'transparent', ...settings } },
    nodes: columns,
});

const section = (rows, sectionColor = 'base_100') => ({
    id: id(), displayName: 'Section', nodeType: 'section', layoutType: 'grid',
    displaySettings: { displayTemplate: 'DefaultSection', settings: { gridWidth: 'default', vSpacing: 'default', sectionColor } },
    component: { contentType: 'BlankSection' },
    nodes: rows,
});

// ── the Humanitas home composition ───────────────────────────────────────
// Returns a fresh composition (new node ids) on each call, so it can be used
// both to create new content and to add a new version to existing content.
export const humanitasComposition = () => ({
    id: id(), displayName: 'Humanitas — Home', nodeType: 'experience', layoutType: 'outline',
    nodes: [
        hero(
            'People supporting people',
            "<p>Humanitas is the Netherlands' largest volunteer organisation. For more than 75 years we have helped people change their own situation — through their own strength, with a little help from someone alongside them. No judgement, just support, from one person to another.</p>"
        ),
        section([
            row([column([
                heading('How we help', 'h2', 'center'),
                paragraph('<p class="lead">Whatever you are facing, you don\'t have to face it alone. Our trained volunteers are there for you — free, confidential and close by.</p>'),
            ])]),
            row([
                column([card('Debt & admin support',
                    '<p>Money worries can feel overwhelming. A volunteer helps you get your paperwork and finances back in order, step by step. No one should feel ashamed of debt.</p>',
                    'Find debt support', '/get-help/')]),
                column([card('Home-Start: family support',
                    '<p>Parenting is wonderful — and hard. An experienced volunteer visits families with young children to lend a hand and a listening ear.</p>',
                    'Support for families', '/get-help/')]),
                column([card('Friendship & contact',
                    '<p>Feeling lonely can happen to anyone. We bring people together for a chat, a walk or a coffee — small moments of contact that make a real difference.</p>',
                    'Find a buddy', '/get-help/')]),
            ]),
        ], 'base_100'),
        section([
            row([column([
                heading('Get involved', 'h2', 'center'),
                paragraph('<p class="lead">Humanitas runs on people like you. Become a volunteer and give your time, or support our work with a donation — together we help each other move forward.</p>'),
                cta('Become a volunteer', 'https://www.humanitas.nl/vrijwilligerswerk/'),
            ])]),
        ], 'primary'),
    ],
});

export const humanitasSeo = {
    BlankExperienceSeoSettings: { value: { properties: {
        MetaTitle: { value: 'Humanitas — people supporting people' },
        MetaDescription: { value: "The Netherlands' largest volunteer organisation. We help people change their own situation, through their own strength." },
        GraphType: { value: '-' },
    } } },
};

export { CONTAINER, LOCALE };

// Run the "create new standalone /humanitas/ page" flow only when invoked directly.
import { pathToFileURL } from 'url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await createStandalone();
}

async function createStandalone() {
const initialVersion = {
    displayName: 'Humanitas — Home',
    locale: LOCALE,
    routeSegment: 'humanitas',
    composition: humanitasComposition(),
    properties: humanitasSeo,
};

const key = process.env.HUMANITAS_HOME_KEY || randomUUID().replace(/-/g, '');
const body = { key, contentType: 'BlankExperience', container: CONTAINER, initialVersion };

console.log('Creating Humanitas home experience, key =', key);
let r = await cma('POST', '/content', body);
console.log('POST /content ->', r.status);
if (!r.ok) {
    console.log(typeof r.data === 'string' ? r.data.slice(0, 800) : JSON.stringify(r.data, null, 2).slice(0, 1200));
    process.exit(1);
}
console.log('content created (201). Looking up draft version…');

// POST /content returns an empty body — fetch the draft version number.
const vr = await cma('GET', `/content/${key}/versions`);
const draft = (vr.data?.items || []).find((i) => i.status !== 'published') || vr.data?.items?.[0];
if (!draft) { console.error('could not find draft version', JSON.stringify(vr.data)); process.exit(1); }
console.log('draft version:', draft.version, draft.locale);

// Publish: POST /content/{key}/versions/{version}:publish  → 204
const p = await cma('POST', `/content/${key}/versions/${draft.version}:publish`, {});
console.log('publish ->', p.status, p.ok ? 'PUBLISHED' : JSON.stringify(p.data).slice(0, 300));
console.log('\nDONE. key =', key, '| route = /humanitas/');
}
