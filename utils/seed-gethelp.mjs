// Seeds the "Get Help" inner page (/en/get-help/) — the destination of the
// homepage "I need help" / card links. Re-runnable via GETHELP_KEY.
//   node --env-file=.env utils/seed-gethelp.mjs
import { randomUUID } from 'crypto';
import { cma } from './cma.mjs';
import { hero, heading, paragraph, card, cta, collapse, column, row, section, CONTAINER, LOCALE } from './seed-humanitas.mjs';

const composition = {
    id: randomUUID(), displayName: 'Get Help', nodeType: 'experience', layoutType: 'outline',
    nodes: [
        section([
            row([column([
                heading('Find the support you need', 'h1', 'center'),
                paragraph('<p class="lead" style="text-align:center">Whatever you’re going through, a Humanitas volunteer is ready to help — free, confidential and close by. Choose the theme that fits your situation and we’ll connect you with people near you.</p>'),
                cta([{ text: 'Talk to someone today', url: 'https://www.humanitas.nl/' }], 'standard'),
            ])]),
        ], 'primary'),

        section([
            row([column([heading('Choose the support that fits', 'h2', 'center')])]),
            row([
                column([card({ heading: 'Debt & admin support', body: '<p>Get your paperwork and finances back in order, step by step, with a volunteer beside you. No shame, no judgement.</p>', linkText: 'Request this support', linkUrl: 'https://www.humanitas.nl/' })]),
                column([card({ heading: 'Home-Start: families', body: '<p>Practical and emotional support for families with young children, from a trained, experienced parent volunteer.</p>', linkText: 'Request this support', linkUrl: 'https://www.humanitas.nl/' })]),
                column([card({ heading: 'Loneliness & friendship', body: '<p>Regular contact with a friendly volunteer — a chat, a walk, a coffee — to bring connection back into your week.</p>', linkText: 'Request this support', linkUrl: 'https://www.humanitas.nl/' })]),
            ]),
            row([
                column([card({ heading: 'Grief & bereavement', body: '<p>Space to talk and be heard after losing someone you love, for as long as you need it.</p>', linkText: 'Request this support', linkUrl: 'https://www.humanitas.nl/' })]),
                column([card({ heading: 'Detention & reintegration', body: '<p>Support during and after detention to rebuild contact, structure and a future.</p>', linkText: 'Request this support', linkUrl: 'https://www.humanitas.nl/' })]),
                column([card({ heading: 'Palliative & terminal care', body: '<p>Presence and relief in the final phase of life, at home or in a hospice, day or night.</p>', linkText: 'Request this support', linkUrl: 'https://www.humanitas.nl/' })]),
            ]),
        ], 'base_100'),

        section([
            row([column([heading('How it works', 'h2', 'center')])]),
            row([column([
                collapse('1. Reach out', '<p>Tell us a little about your situation through the theme that fits best, or call your local Humanitas group.</p>'),
                collapse('2. A no-obligation conversation', '<p>A volunteer or coordinator contacts you to listen and talk through what would help most.</p>'),
                collapse('3. Support that suits you', '<p>You’re matched with a trained volunteer and decide together what the support looks like — always free and confidential.</p>'),
            ])]),
        ], 'base_200'),

        section([
            row([column([
                heading('Not sure where to start?', 'h2', 'center'),
                paragraph('<p class="lead" style="text-align:center">That’s completely okay. Reach out and we’ll help you find the right support together.</p>'),
                cta([{ text: 'Contact Humanitas', url: 'https://www.humanitas.nl/' }], 'standard'),
            ])]),
        ], 'primary'),
    ],
};

const initialVersion = {
    displayName: 'Get Help',
    locale: LOCALE,
    routeSegment: 'get-help',
    composition,
    properties: { BlankExperienceSeoSettings: { value: { properties: {
        MetaTitle: { value: 'Get help — Humanitas' },
        MetaDescription: { value: 'Free, confidential support from Humanitas volunteers — debt, family, loneliness, grief, reintegration and palliative care.' },
        GraphType: { value: '-' },
    } } } },
};

const key = process.env.GETHELP_KEY || randomUUID().replace(/-/g, '');
const cr = await cma('POST', '/content', { key, contentType: 'BlankExperience', container: CONTAINER, initialVersion });
console.log('create Get Help ->', cr.status);
if (cr.status !== 201 && !cr.ok) { console.error(JSON.stringify(cr.data).slice(0, 600)); process.exit(1); }
const vr = await cma('GET', `/content/${key}/versions`);
const draft = (vr.data.items || []).find((i) => i.status !== 'published') || vr.data.items?.[0];
const p = await cma('POST', `/content/${key}/versions/${draft.version}:publish`, {});
console.log('publish ->', p.status, p.ok ? 'PUBLISHED' : JSON.stringify(p.data).slice(0, 300));
console.log('DONE. key =', key, '| route = /en/get-help/');
