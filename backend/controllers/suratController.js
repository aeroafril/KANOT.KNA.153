const db = require('../config/db');
const Surat = require('../models/Surat');
const AuditService = require('../services/auditService');
const AppError = require('../utils/AppError');
const {ok, created, paginated, metaHalaman} = require('../utils/response');

const ambilSurat = async (id) => {
    const surat = await Surat.cariById(id);
    if(!surat){
        throw new AppError('Surat tidak ditemukan', 404);
    }
    return surat;
};

class SuratController {
    static async daftar(req, res){
        const {page, limit, jenis_surat, q, dari, sampai} = req.query;
        const {baris, total} = await Surat.daftar({
            jenisSurat: jenis_surat,
            q,
            dari,
            sampai,
            limit,
            offset: (page - 1) * limit
        });
        paginated(res, baris, metaHalaman(page, limit, total));
    }

    static async detail(req, res){
        ok(res, await ambilSurat(req.params.id));
    }

    static async tambah(req, res){
        const b = req.body;

        const baru = await db.transaction(async (client) => {
            const surat = await Surat.buat({
                idProfil: req.user.id_profil,
                jenisSurat: b.jenis_surat,
                nomorSurat: b.nomor_surat,
                tanggalSurat: b.tanggal_surat,
                pengirimPenerima: b.pengirim_penerima ?? null,
                subjek: b.subjek ?? null,
                keterangan: b.keterangan ?? null
            }, client);

            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'TAMBAH',
                tabel: 'log_surat',
                idRecord: surat.id_log_surat,
                dataBaru: surat
            }, client);
            return surat;
        });
        created(res, baru, 'Surat berhasil dicatat');
    }

    static async ubah(req, res){
        const lama = await ambilSurat(req.params.id);

        const hasil = await db.transaction(async (client) => {
            const baru = await Surat.ubah(lama.id_log_surat, req.body, client);
            if(!baru){
                throw new AppError('Surat tidak ditemukan', 404);
            }

            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'UBAH',
                tabel: 'log_surat',
                idRecord: lama.id_log_surat,
                ...AuditService.selisih(lama, baru, Object.keys(req.body))
            }, client);
            return baru;
        });
        ok(res, hasil, 'Surat diperbarui');
    }

    static async hapus(req, res){
        const lama = await ambilSurat(req.params.id);

        await db.transaction(async (client) => {
            await Surat.hapus(lama.id_log_surat, client);
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'HAPUS',
                tabel: 'log_surat',
                idRecord: lama.id_log_surat,
                dataLama: lama
            }, client);
        });
        ok(res, null, 'Surat dihapus');
    }
}

module.exports = SuratController;