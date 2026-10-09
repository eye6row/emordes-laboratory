const L = require('./_lib');
// Public read of latest data straight from GitHub (so saves are live without a redeploy)
module.exports = async (req, res) => {
  try {
    const { sha, data } = await L.readData();
    const admin = req.query && req.query.admin && L.authed(req);
    res.setHeader('Cache-Control', admin ? 'no-store' : 'public, s-maxage=5, stale-while-revalidate=30');
    res.setHeader('Content-Type', 'application/json');
    const publicData = { ...data, samples: (data.samples || []).filter(s => (Array.isArray(s.images) ? s.images.length > 0 : !!s.image) && !!s.image) };
    res.end(JSON.stringify(admin ? { ...data, sha } : publicData));
  } catch (e) { L.json(res, 502, { error: 'source unavailable' }); }
};
