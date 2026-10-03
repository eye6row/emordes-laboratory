const L = require('./_lib');
const PATH = 'data/requests.json';
const str = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\r\n?/g, '\n').trim().slice(0, max);
async function read() {
  try { const f = await L.gh(`contents/${PATH}?ref=${L.BRANCH}`); const a = JSON.parse(Buffer.from(f.content, 'base64').toString('utf8')); return { sha: f.sha, list: Array.isArray(a) ? a : [] }; }
  catch (e) { if (e.status === 404) return { sha: undefined, list: [] }; throw e; }
}
// Admin-only (POST + same-origin + session). Actions: list | add {text, sample} | delete {id}
module.exports = async (req, res) => {
  if (!L.guard(req, res)) return;
  try {
    const b = await L.readBody(req, 1e5) || {};
    for (let attempt = 0; attempt < 3; attempt++) {
      const { sha, list } = await read();
      if (b.action === 'list' || !b.action) return L.json(res, 200, { list });
      let next, msg;
      if (b.action === 'add') {
        const text = str(b.text, 2000); if (!text) return L.json(res, 400, { error: 'empty request' });
        if (list.length >= 500) return L.json(res, 400, { error: 'too many requests (max 500)' });
        const o = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), text, createdAt: new Date().toISOString(), status: 'open' };
        const s = str(b.sample, 20); if (/^EML-[\w-]+$/i.test(s)) o.sample = s.toUpperCase();
        next = [...list, o]; msg = 'Admin: add edit request';
      } else if (b.action === 'delete') {
        next = list.filter(r => r && r.id !== String(b.id)); if (next.length === list.length) return L.json(res, 200, { list }); msg = 'Admin: delete edit request';
      } else return L.json(res, 400, { error: 'bad action' });
      try { await L.putFile(PATH, Buffer.from(JSON.stringify(next, null, 2) + '\n').toString('base64'), msg, sha); return L.json(res, 200, { list: next }); }
      catch (e) { if (e.status !== 409 && e.status !== 422) throw e; }
    }
    L.json(res, 409, { error: 'busy, try again' });
  } catch (e) { L.json(res, 400, { error: e.message }); }
};
