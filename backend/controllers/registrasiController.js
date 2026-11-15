const db = require('../config/db');
const Registrasi = require('../models/Registrasi');
const BukuTamu = require('../models/BukuTamu');
const AuditService = require('../services/auditService');
const AppError = require('../utils/AppError');
const {ok, created, paginated, metaHalaman} = require('../utils/response');

const ambilBaris = async (cfg, id) => {
    const baris = await Registrasi.cariById(cfg, id);
    if(!baris){
        throw new AppError('Data registrasi tidak ditemukan', 404);
    }
    return baris;
};

const pastikanKunjungan = async (idBukuTamu) => {
    if(idBukuTamu && !(await BukuTamu.cariById(idBukuTamu))){
        throw new AppError('Data kunjungan tidak ditemukan', 404);
    }
};

class RegistrasiController{
    static async daftar(req, res){
        const {page, limit, q, tahun, status} = req.query;
        const {baris, total} = await Registrasi.daftar(req.registrasi, {q, tahun, status, limit, offset: (page - 1) * limit});
        paginated(res, baris, metaHalaman(page, limit, total));
    }

    static async detail(req, res){
        ok(res, await ambilBaris(req.registrasi, req.params.id));
    }

    static async tambah(req, res){
        const cfg = req.registrasi;
        await pastikanKunjungan(req.body.id_buku_tamu);

        const baru = await db.transaction(async (client) => {
            const baris = await Registrasi.buat(cfg, req.body, client);
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'TAMBAH',
                tabel: cfg.tabel,
                idRecord: baris[cfg.pk],
                dataBaru: baris
            }, client);
            return baris;
        });
        created(res, baru, 'Data registrasi berhasil ditambahkan');
    }

    static async ubah(req, res){
        const cfg = req.registrasi;
        const lama = await ambilBaris(cfg, req.params.id);
        await pastikanKunjungan(req.body.id_buku_tamu);

        const hasil = await db.transaction(async (client) => {
            const baru = await Registrasi.ubah(cfg, lama[cfg.pk], req.body, client);
            if(!baru){
                throw new AppError('Data registrasi tidak ditemukan', 404);
            }
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'UBAH',
                tabel: cfg.tabel,
                idRecord: lama[cfg.pk],
                ...AuditService.selisih(lama, baru, Object.keys(req.body))
            }, client);
            return baru;
        });

        ok(res, hasil, 'Data registrasi diperbarui');
    }

    static async hapus(req, res){
        const cfg = req.registrasi;
        const lama = await ambilBaris(cfg, req.params.id);

        await db.transaction(async (client) => {
            await Registrasi.hapus(cfg, lama[cfg.pk], client);
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'HAPUS',
                tabel: cfg.tabel,
                idRecord: lama[cfg.pk],
                dataLama: lama
            }, client);
        });
        ok(res, null, 'Data registrasi dihapus');
    }
}

module.exports = RegistrasiController;