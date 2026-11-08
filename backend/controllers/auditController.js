const RiwayatAktivitas = require('../models/RiwayatAktivitas');
const {paginated} = require('../utils/response');

class AuditController{
    static async daftar(req, res){
        const {page, limit, id_profil, aksi, tabel, dari, sampai} = req.query;

        const {baris, total} = await RiwayatAktivitas.cari({idProfil: id_profil, aksi, tabel, dari, sampai, limit, offset: (page - 1) * limit});

        paginated(res, baris, {page, limit, total, total_halaman: Math.ceil(total /limit)});
    }
}

module.exports = AuditController;