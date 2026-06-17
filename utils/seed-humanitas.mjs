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
// Hero component — photographic background (with repo fallback) + heading/body/CTAs.
const hero = (headingText, body, links = []) => ({
    id: id(), displayName: 'Hero', nodeType: 'component',
    displaySettings: { displayTemplate: 'DefaultHero', settings: { hero_height: 'h_38rem', text_placement: 'center', text_color: 'white', hoverEffect: 'none' } },
    component: { contentType: 'Hero', properties: {
        Heading: text(headingText),
        Body: html(body),
        Links: { value: links.map((l) => ({ url: l.url, target: l.target || '_self', text: l.text })) },
    } },
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

// card({ heading, sub, body, linkText, linkUrl })
const card = ({ heading: h, sub, body, linkText, linkUrl }) => {
    const props = { Heading: text(h), Body: html(body), DisplayAs: text('textBelowCard') };
    if (sub) props.SubHeading = text(sub);
    if (linkText && linkUrl) props.Links = { value: [{ url: linkUrl, target: '_self', text: linkText }] };
    return {
        id: id(), displayName: 'Card', nodeType: 'component',
        displaySettings: { displayTemplate: 'DefaultCard', settings: {
            transform: 'keep', buttonStyle: 'standard', buttonWidth: 'w_12rem', buttonSize: 'medium',
            buttonRadius: 'lg', buttonAction: 'static', assetWidth: 'flex_1', contentWidth: 'flex_1',
            textAlign: 'left', transformHeader: 'normal_case', assetVerticalAlign: 'center',
            contentVerticalAlign: 'center', backgroundColor: 'base_100' } },
        component: { contentType: 'Card', properties: props },
    };
};

// cta([{text,url}], style) — one CallToAction renders one or more buttons.
const cta = (links, buttonStyle = 'standard') => ({
    id: id(), displayName: 'Call To Action', nodeType: 'component',
    displaySettings: { displayTemplate: 'DefaultCallToAction', settings: { transform: 'keep', buttonStyle, buttonWidth: 'auto', buttonSize: 'lg' } },
    component: { contentType: 'CallToAction', properties: {
        Links: { value: links.map((l) => ({ url: l.url, target: l.target || '_self', text: l.text })) } } },
});

// A big number + label, used in the impact-stats row.
const stat = (number, label) => column([
    { id: id(), displayName: 'Text', nodeType: 'component',
      displaySettings: { displayTemplate: 'TextStyles', settings: { headingType: 'h2', textAlign: 'center', showAs: 'heading', transform: 'keep' } },
      component: { contentType: 'Text', properties: { Content: text(number) } } },
    paragraph(`<p style="text-align:center">${label}</p>`),
]);

// FAQ accordion item.
const collapse = (h, bodyHtml) => ({
    id: id(), displayName: 'Collapse', nodeType: 'component',
    component: { contentType: 'Collapse', properties: { Heading: text(h), Body: html(bodyHtml) } },
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

const section = (rows, sectionColor = 'base_100', name = 'Section') => ({
    id: id(), displayName: name, nodeType: 'section', layoutType: 'grid',
    displaySettings: { displayTemplate: 'DefaultSection', settings: { gridWidth: 'default', vSpacing: 'default', sectionColor } },
    component: { contentType: 'BlankSection' },
    nodes: rows,
});

// Reusable across other page seeders (e.g. Get Help).
export { hero, heading, paragraph, card, cta, stat, collapse, column, row, section };

// ── the Humanitas home composition ───────────────────────────────────────
// Returns a fresh composition (new node ids) on each call, so it can be used
// both to create new content and to add a new version to existing content.
export const humanitasComposition = () => ({
    id: id(), displayName: 'Humanitas — Home', nodeType: 'experience', layoutType: 'outline',
    nodes: [
        // 1) HERO — photographic banner with the three primary actions
        hero(
            'Our volunteers are here to help you',
            '<p>Humanitas is the Netherlands’ largest volunteer organisation. For 80 years we’ve helped people change their own situation — through their own strength, with someone alongside them.</p>',
            [
                { text: 'I need help', url: '/en/get-help/' },
                { text: 'I want to volunteer', url: 'https://www.humanitas.nl/vrijwilligerswerk/' },
                { text: 'I want to donate', url: 'https://www.humanitas.nl/doneer/' },
            ],
        ),

        // 2) CAMPAIGN SPOTLIGHT — Stop the debt industry
        section([
            row([
                column([
                    heading('726,000', 'h1', 'center'),
                    paragraph('<p style="text-align:center"><strong>households in the Netherlands struggle with problematic debt.</strong></p>'),
                ]),
                column([
                    heading('Stop the debt industry', 'h2', 'left'),
                    paragraph('<p>Debt should never be a business model. We help people out of debt one-to-one — and we campaign for a fairer system so fewer people get stuck in the first place. <strong>No one should feel ashamed of debt.</strong></p>'),
                    cta([{ text: 'Support the campaign', url: 'https://www.humanitas.nl/' }], 'outline'),
                ]),
            ]),
        ], 'base_200', 'Campaign — Stop the debt industry'),

        // 3) WHAT WE DO — six themes
        section([
            row([column([
                heading('What we do', 'h2', 'center'),
                paragraph('<p class="lead" style="text-align:center">Whatever you’re facing, you don’t have to face it alone. Our trained volunteers are there for you — free, confidential and close by.</p>'),
            ])]),
            row([
                column([card({ heading: 'Debt & admin support', body: '<p>Money worries can feel overwhelming. A volunteer helps you get your paperwork and finances back in order, step by step.</p>', linkText: 'Learn more', linkUrl: '/en/get-help/' })]),
                column([card({ heading: 'Home-Start: families', body: '<p>Parenting is wonderful — and hard. An experienced volunteer visits families with young children to lend a hand and a listening ear.</p>', linkText: 'Learn more', linkUrl: '/en/get-help/' })]),
                column([card({ heading: 'Loneliness & friendship', body: '<p>Feeling lonely can happen to anyone. We bring people together for a chat, a walk or a coffee — small moments of contact that matter.</p>', linkText: 'Learn more', linkUrl: '/en/get-help/' })]),
            ]),
            row([
                column([card({ heading: 'Grief & bereavement', body: '<p>Losing someone you love turns your world upside down. A volunteer walks beside you and gives your grief the time and space it needs.</p>', linkText: 'Learn more', linkUrl: '/en/get-help/' })]),
                column([card({ heading: 'Detention & reintegration', body: '<p>A criminal record shouldn’t define a life. We support people during and after detention to rebuild contact, structure and a future.</p>', linkText: 'Learn more', linkUrl: '/en/get-help/' })]),
                column([card({ heading: 'Palliative & terminal care', body: '<p>No one should have to be alone in their final months. Trained volunteers offer presence and relief, day or night, at home or in a hospice.</p>', linkText: 'Learn more', linkUrl: '/en/get-help/' })]),
            ]),
        ], 'base_100', 'What we do'),

        // 4) IMPACT — statistics row (blue band)
        section([
            row([column([heading('Our impact', 'h2', 'center')])]),
            row([
                stat('20,000+', 'volunteers across the country'),
                stat('700+', 'local activities every year'),
                stat('80 years', 'supporting people since 1945'),
                stat('€208M', 'saved for society each year'),
            ]),
        ], 'primary', 'Impact'),

        // 5) EXPERIENCE STORIES
        section([
            row([column([
                heading('Experience stories', 'h2', 'center'),
                paragraph('<p class="lead" style="text-align:center">From person to person. These are some of the people behind Humanitas.</p>'),
            ])]),
            row([
                column([card({ heading: '“No one should feel ashamed of debt.”', sub: 'Rozemarijn — participant', body: '<p>With a volunteer beside her, Rozemarijn got her finances back on track and her confidence back too.</p>' })]),
                column([card({ heading: '“Being there at night means everything.”', sub: 'Henk — volunteer', body: '<p>Henk provides palliative night care so families can rest, knowing their loved one isn’t alone.</p>' })]),
                column([card({ heading: '“The personal approach appeals to me.”', sub: 'Peter — donor', body: '<p>Peter gives because he sees exactly how one-to-one support changes lives in his own community.</p>' })]),
            ]),
        ], 'base_100', 'Experience stories'),

        // 6) GET INVOLVED — volunteer + donate (blue band)
        section([
            row([column([
                heading('Get involved', 'h2', 'center'),
                paragraph('<p class="lead" style="text-align:center">Humanitas runs on people like you. Give your time as a volunteer, or support our work with a donation — together we help each other move forward.</p>'),
                cta([
                    { text: 'Become a volunteer', url: 'https://www.humanitas.nl/vrijwilligerswerk/' },
                    { text: 'Donate', url: 'https://www.humanitas.nl/doneer/' },
                ], 'standard'),
            ])]),
        ], 'primary', 'Get involved'),

        // 7) FAQ
        section([
            row([column([heading('Frequently asked questions', 'h2', 'center')])]),
            row([column([
                collapse('How do I get help?', '<p>Choose the theme that fits your situation and get in touch with the Humanitas group near you. A volunteer will contact you for a no-obligation conversation.</p>'),
                collapse('Is support really free?', '<p>Yes. Humanitas support is always free and confidential. We’re a volunteer organisation — there are no costs for participants.</p>'),
                collapse('How do I become a volunteer?', '<p>Tell us a bit about yourself and the kind of work you’d like to do. You’ll get training and ongoing guidance, and you choose how much time you give.</p>'),
                collapse('How is Humanitas funded?', '<p>Through donations, members, grants and partnerships such as the Postcode Loterij. Humanitas holds the CBF seal of approval and ANBI status.</p>'),
            ])]),
        ], 'base_100', 'FAQ'),

        // 8) NEWSLETTER
        section([
            row([column([
                heading('Stay connected', 'h2', 'center'),
                paragraph('<p class="lead" style="text-align:center">Get stories from volunteers and participants in your inbox — our “Van Mens tot Mens” newsletter, a few times a year.</p>'),
                cta([{ text: 'Sign up for our newsletter', url: 'https://www.humanitas.nl/' }], 'standard'),
            ])]),
        ], 'base_200', 'Newsletter'),
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
