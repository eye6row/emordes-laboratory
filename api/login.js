const L = require('./_lib');
const fails = new Map(); // per-instance; plus fixed delay on every failure
module.exports = async (req, res) => {
  if (req.method !== 'POST' || !L.sameOrigin(req)) return L.json(res, 405, { error: 'nope' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  const f = fails.get(ip) || { n: 0, t: 0 };
  if (f.n >= 5 && Date.now() - f.t < 15 * 60e3) return L.json(res, 429, { error: 'Too many tries. Wait 15 minutes.' });
  let b; try { b = await L.readBody(req, 4096); } catch { return L.json(res, 400, { error: 'bad request' }); }
  const pw = process.env.ADMIN_PASSWORD;
  if (pw && typeof b.password === 'string' && L.eq(b.password, pw)) {
    fails.delete(ip); L.setCookie(res, L.makeSession(), L.TTL); return L.json(res, 200, { ok: true });
  }
  fails.set(ip, { n: (Date.now() - f.t < 15 * 60e3 ? f.n : 0) + 1, t: Date.now() });
  await new Promise(r => setTimeout(r, 1200));
  L.json(res, 401, { error: 'Wrong password' });
};
