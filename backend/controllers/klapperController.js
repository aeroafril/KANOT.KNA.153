const Klapper = require('../models/Klapper');
const {ok, paginated, metaHalaman} = require('../utils/response');

class KlapperController {
    static async daftar(req, res) {
        const {page, limit, huruf, q} = req.query;
        const {baris, total} = await Klapper.daftar(req.klapper, {
        huruf,
        q,
        limit,
        offset: (page - 1) * limit
        });
        paginated(res, baris, metaHalaman(page, limit, total));
    }

    static async huruf(req, res) {
        ok(res, await Klapper.hitungPerHuruf(req.klapper));
    }
}

module.exports = KlapperController;