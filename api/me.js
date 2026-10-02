const L = require('./_lib');
module.exports = (req, res) => L.json(res, 200, { authed: L.authed(req) });
