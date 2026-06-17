// Minimal Optimizely SaaS CMS Management API (preview3) client.
// This instance's CMA lives at https://api.cms.optimizely.com/preview3 (not the
// app-domain /_cms/preview2 path the @remkoj package defaults to), so we talk to
// it directly. Reads creds from env (.env via `node --env-file=.env`).
const API = 'https://api.cms.optimizely.com';
const BASE = `${API}/v1`;

let _tok = null;
let _exp = 0;

export async function token() {
    if (_tok && Date.now() < _exp - 15000) return _tok;
    const id = process.env.OPTIMIZELY_CLIENT_ID;
    const secret = process.env.OPTIMIZELY_CLIENT_SECRET;
    const res = await fetch(`${API}/oauth/token`, {
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    const j = await res.json();
    if (!res.ok) throw new Error('auth failed: ' + JSON.stringify(j));
    _tok = j.access_token;
    _exp = Date.now() + (j.expires_in || 300) * 1000;
    return _tok;
}

export async function cma(method, path, body) {
    const t = await token();
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${t}`,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    return { status: res.status, ok: res.ok, data };
}

export { BASE, API };
