const L = require('./_lib');
// Serves uploaded photos from the repo immediately (content-hashed names, so cache forever)
module.exports = async (req, res) => {
  const p = String((req.query && req.query.p) || '');
  if (!/^images\/uploads\/[a-f0-9]{16}\.jpg$/.test(p)) { res.statusCode = 404; return res.end(); }
  const r = await fetch(`https://api.github.com/repos/${L.REPO}/contents/${p}?ref=${L.BRANCH}`, { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github.raw', 'User-Agent': 'izlab-admin' } });
  if (!r.ok) { res.statusCode = 404; return res.end(); }
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(Buffer.from(await r.arrayBuffer()));
};
