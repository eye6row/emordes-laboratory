const L = require('./_lib');
module.exports = async (req, res) => {
  if (!L.guard(req, res)) return;
  try {
    const b = await L.readBody(req, 1e6);
    const cur = await L.readData();
    if (b.about === undefined && cur.data.about) b.about = cur.data.about;
    const data = L.clean(b);
    if (b.sha && b.sha !== cur.sha) return L.json(res, 409, { error: 'Someone else saved in the meantime. Reload to get their changes.' });
    const out = await L.putFile(L.DATA, Buffer.from(JSON.stringify(data, null, 2) + '\n').toString('base64'), 'Admin: update samples', cur.sha);
    L.json(res, 200, { ok: true, sha: out.content.sha, data });
  } catch (e) { L.json(res, e.status === 409 ? 409 : 400, { error: e.message }); }
};
