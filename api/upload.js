const crypto = require('crypto');
const L = require('./_lib');
module.exports = async (req, res) => {
  if (!L.guard(req, res)) return;
  try {
    const b = await L.readBody(req, 4.2e6);
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(b.data || ''));
    if (!m) throw new Error('Expected a JPEG');
    const buf = Buffer.from(m[1], 'base64');
    if (buf.length > 3e6 || buf[0] !== 0xFF || buf[1] !== 0xD8) throw new Error('Bad or too-large JPEG');
    const path = `images/uploads/${crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16)}.jpg`;
    let sha; try { sha = (await L.gh(`contents/${path}?ref=${L.BRANCH}`)).sha; } catch {}
    if (!sha) await L.putFile(path, buf.toString('base64'), 'Admin: upload photo');
    L.json(res, 200, { ok: true, path });
  } catch (e) { L.json(res, 400, { error: e.message }); }
};
