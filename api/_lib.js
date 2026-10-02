const crypto = require('crypto');
const REPO = 'eye6row/emordes-laboratory', BRANCH = 'main', DATA = 'data/samples.json';
const COOKIE = 'izlab_s', TTL = 60 * 60 * 12; // 12h

const sign = v => crypto.createHmac('sha256', process.env.SESSION_SECRET).update(v).digest('base64url');
function makeSession() {
  const p = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + TTL, r: crypto.randomBytes(8).toString('hex') })).toString('base64url');
  return `${p}.${sign(p)}`;
}
function eq(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest(), y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}
function cookies(req) {
  const o = {}; (req.headers.cookie || '').split(';').forEach(c => { const i = c.indexOf('='); if (i > 0) o[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim()); });
  return o;
}
function authed(req) {
  if (!process.env.SESSION_SECRET) return false;
  const t = cookies(req)[COOKIE]; if (!t) return false;
  const [p, s] = t.split('.'); if (!p || !s || !eq(sign(p), s)) return false;
  try { return JSON.parse(Buffer.from(p, 'base64url').toString()).exp > Date.now() / 1000; } catch { return false; }
}
const setCookie = (res, v, age) => res.setHeader('Set-Cookie', `${COOKIE}=${v}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`);
function sameOrigin(req) { // CSRF belt + braces on top of SameSite=Strict
  const o = req.headers.origin; if (!o) return true;
  try { return new URL(o).host === req.headers.host; } catch { return false; }
}
function json(res, code, obj) { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(obj)); }
function guard(req, res) {
  if (req.method !== 'POST') { json(res, 405, { error: 'POST only' }); return false; }
  if (!sameOrigin(req)) { json(res, 403, { error: 'bad origin' }); return false; }
  if (!authed(req)) { json(res, 401, { error: 'not logged in' }); return false; }
  return true;
}

async function gh(path, opts = {}) {
  const r = await fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    ...opts, headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'izlab-admin', ...(opts.headers || {}) }
  });
  const body = r.status === 204 ? null : await r.json().catch(() => null);
  if (!r.ok) { const e = new Error((body && body.message) || 'GitHub ' + r.status); e.status = r.status; throw e; }
  return body;
}
async function readData() {
  const f = await gh(`contents/${DATA}?ref=${BRANCH}`);
  return { sha: f.sha, data: JSON.parse(Buffer.from(f.content, 'base64').toString('utf8')) };
}
const putFile = (path, b64, message, sha) => gh(`contents/${path}`, {
  method: 'PUT', body: JSON.stringify({ message, content: b64, branch: BRANCH, sha, committer: { name: 'eye6row', email: 'jh@emordes.studio' } })
});

const str = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
function clean(input) {
  if (!input || !Array.isArray(input.samples)) throw new Error('samples missing');
  if (input.samples.length > 200) throw new Error('too many samples');
  return {
    samples: input.samples.map(s => {
      const gsm = Number(s.gsm);
      const ok = p => /^(images\/[\w.-]+\.(jpe?g|png|webp)|images\/uploads\/[a-f0-9]{16}\.jpg)$/i.test(p);
      let images = (Array.isArray(s.images) ? s.images : []).map(p => str(p, 200)).filter(Boolean);
      if (!images.length && s.image) images = [str(s.image, 200)];
      images = [...new Set(images)].slice(0, 24);
      if (images.some(p => !ok(p))) throw new Error('bad image path');
      const image = images[0] || '';
      return {
        n: str(s.n, 12) || '000', title: str(s.title, 120) || 'Untitled', fiber: str(s.fiber, 160), gsm: Number.isFinite(gsm) ? Math.max(0, Math.min(99999, Math.round(gsm))) : 0,
        finish: str(s.finish, 160), origin: str(s.origin, 120),
        tags: (Array.isArray(s.tags) ? s.tags : String(s.tags || '').split(',')).map(t => str(t, 40).toLowerCase()).filter(Boolean).slice(0, 12),
        description: str(String(s.description == null ? '' : s.description).replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n'), 4000), year: str(s.year, 12),
        recipes: (() => { const row = r => ({ ingredient: str(r && (r.ingredient ?? r.item), 120), amount: str(r && r.amount, 120) }); const rows = a => (Array.isArray(a) ? a : []).slice(0, 40).map(row).filter(r => r.ingredient || r.amount);
          let rs = Array.isArray(s.recipes) ? s.recipes : (Array.isArray(s.recipe) && s.recipe.length ? [{ title: 'Recipe', rows: s.recipe }] : []);
          return rs.slice(0, 12).map(x => ({ title: str(x && x.title, 120), rows: rows(x && x.rows) })).filter(x => x.title || x.rows.length); })(),
        image, images,
        ...(() => { const c = s.crop; if (!c || typeof c !== 'object' || !image) return {}; const n = (v, lo, hi, d) => { v = Number(v); return Number.isFinite(v) ? Math.round(Math.max(lo, Math.min(hi, v)) * 100) / 100 : d; };
          const o = { x: n(c.x, 0, 100, 50), y: n(c.y, 0, 100, 50), zoom: n(c.zoom, 1, 3, 1) }; return (o.x === 50 && o.y === 50 && o.zoom === 1) ? {} : { crop: o }; })()
      };
    })
  };
}
function readBody(req, max = 4e6) {
  return new Promise((ok, no) => {
    if (req.body && typeof req.body === 'object') return ok(req.body);
    let d = ''; req.on('data', c => { d += c; if (d.length > max) { no(new Error('too large')); req.destroy(); } });
    req.on('end', () => { try { ok(JSON.parse(d || '{}')); } catch { no(new Error('bad json')); } });
  });
}
module.exports = { makeSession, eq, authed, setCookie, json, guard, sameOrigin, gh, readData, putFile, clean, readBody, REPO, BRANCH, DATA, TTL };
