const db = require('../config/db');
const Progres = require('../models/Progres');
const BukuTamu = require('../models/BukuTamu');
const Profil = require('../models/Profil');
const TemplatePersyaratan = require('../models/TemplatePersyaratan');
const AuditService = require('../services/auditService');
const AppError = require('../utils/AppError');
const {ok, created, paginated, metaHalaman} = require('../utils/response');

const KOLOM_BIASA = ['nama_client', 'tahap_saat_ini', 'catatan', 'tanggal_target', 'profil_id'];

const ambilProgres = async (id, client) => {
    const progres = await Progres.cariById(id, client);
    if(!progres){
        throw new AppError('Berkas tidak ditemukan', 404);
    }
    return progres;
};

const detailLengkap = async (id, client) => {
    const progres = await Progres.cariById(id, client);
    if(!progres){
        return null;
    }

    progres.checklist = await TemplatePersyaratan.daftarChecklist(id, client);
    progres.ringkasan_checklist = await TemplatePersyaratan.ringkasan(id, client);
    return progres;
};

const pastikanPic = async (profilId) => {
    const pic = await Profil.cariById(profilId);
    if(!pic){
        throw new AppError('PIC tidak ditemukan', 400);
    }

    if(pic.status !== 'aktif'){
        throw new AppError('PIC sudah dinonaktifkan', 400);
    }
};

const hitungUlangPersen = async (id, client) => {
    const progres = await Progres.cariById(id, client);
    if(progres.status === 'Selesai'){
        return;
    }

    const {total, terpenuhi} = await TemplatePersyaratan.ringkasan(id, client);

    if(total === 0){
        return;
    }

    await Progres.setPersen(id, Math.round((100 * terpenuhi) / total), client);
};

const ambilTemplate = async (id) => {
    const template = await TemplatePersyaratan.cariTemplate(id);
    if(!template){
        throw new AppError('Templat persyaratan tidak ditemukan', 404);
    }
    return template;
};

class ProgresController {
    static async daftar(req, res){
        const {page, limit, status, profil_id, q, terlambat} = req.query;
        const {baris, total} = await Progres.daftar({
            status,
            profilId: profil_id,
            q,
            terlambat,
            limit,
            offset: (page - 1) * limit
            });
        paginated(res, baris, metaHalaman(page, limit, total));
    }

    static async detail(req, res){
        const data = await detailLengkap(req.params.id);
        if(!data){
            throw new AppError('Berkas tidak ditemukan', 404);
        }
        ok(res, data);
    }

    static async tambah(req, res){
        const b = req.body;
        let namaClient = b.nama_client;
        const bukuTamuId = b.buku_tamu_id ?? null;

        if(bukuTamuId){
            const tamu = await BukuTamu.cariById(bukuTamuId);
            if(!tamu){
                throw new AppError('Data kunjungan tidak ditemukan', 404);
            }
            
            namaClient = namaClient || tamu.nama;
        }

        if(b.profil_id){
            await pastikanPic(b.profil_id);
        }

        const hasil = await db.transaction(async (client) => {
        const progres = await Progres.buat({
            bukuTamuId,
            profilId: b.profil_id ?? req.user.id_profil,
            namaClient,
            jenisLayanan: b.jenis_layanan,
            tahap: b.tahap_saat_ini ?? null,
            tanggalTarget: b.tanggal_target ?? null,
            catatan: b.catatan ?? null
        }, client);

        const jumlah = await TemplatePersyaratan.buatChecklistDariTemplate(
            progres.progres_id,
            b.jenis_layanan,
            client
        );

        await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'TAMBAH',
                tabel: 'progres_pekerjaan',
                idRecord: progres.progres_id,
                dataBaru: { ...progres, checklist_dibuat: jumlah }
            }, client );
            return detailLengkap(progres.progres_id, client);
        });
        created(res, hasil, 'Berkas berhasil didaftarkan');
    }

    static async ubah(req, res){
        const lama = await ambilProgres(req.params.id);
        const b = req.body;
        const perubahan = {};

        for(const kunci of KOLOM_BIASA){
            if(kunci in b) perubahan[kunci] = b[kunci];
        }

        if(b.profil_id){
            await pastikanPic(b.profil_id);
        }

        const statusBaru = b.status ?? lama.status;
        const keluarDariSelesai = lama.status === 'Selesai' && statusBaru !== 'Selesai';

        if(statusBaru !== lama.status){
            perubahan.status = statusBaru;
        }

        if(statusBaru === 'Selesai'){
            if(lama.status !== 'Selesai'){
                perubahan.tanggal_selesai = b.tanggal_selesai || (await Progres.tanggalHariIni());
                perubahan.persentase_progres = 100;
            }else if(b.tanggal_selesai){
                perubahan.tanggal_selesai = b.tanggal_selesai;
            }
        }else if(keluarDariSelesai){
            perubahan.tanggal_selesai = null;
        }

        if(b.persentase_progres !== undefined && statusBaru !== 'Selesai'){
            const {total} = await TemplatePersyaratan.ringkasan(lama.progres_id);
            if(total === 0){
                perubahan.persentase_progres = b.persentase_progres;
            }
        }

        if(Object.keys(perubahan).length === 0){
            return ok(res, await detailLengkap(lama.progres_id), 'Tidak ada perubahan');
        }

        const hasil = await db.transaction(async (client) => {
            await Progres.ubah(lama.progres_id, perubahan, client);
            if (keluarDariSelesai && !('persentase_progres' in perubahan)) {
            await hitungUlangPersen(lama.progres_id, client);
            }
            const terbaru = await Progres.cariById(lama.progres_id, client);
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'UBAH',
                tabel: 'progres_pekerjaan',
                idRecord: lama.progres_id,
                ...AuditService.selisih(lama, terbaru, Object.keys(perubahan))
            }, client);
            return detailLengkap(lama.progres_id, client);
        });

        ok(res, hasil, 'Progres berkas diperbarui');
    }

    static async tambahItem(req, res){
        const progres = await ambilProgres(req.params.id);

        const hasil = await db.transaction(async (client) => {
            const item = await TemplatePersyaratan.tambahItem(progres.progres_id, req.body.nama_syarat, client);
            await hitungUlangPersen(progres.progres_id, client);
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'TAMBAH',
                tabel: 'checklist_progres',
                idRecord: item.id_checklist,
                dataBaru: item
            }, client);
            return detailLengkap(progres.progres_id, client);
        });
        created(res, hasil, 'Syarat ditambahkan ke checklist');
    }

    static async ubahItem(req, res){
        const progres = await ambilProgres(req.params.id);
        const item = await TemplatePersyaratan.cariItem(progres.progres_id, req.params.itemId);
        if(!item){
            throw new AppError('Item checklist tidak ditemukan', 404);
        }

        const hasil = await db.transaction(async (client) => {
            const baru = await TemplatePersyaratan.setTerpenuhi(
                item.id_checklist,
                req.body.terpenuhi,
                req.user.id_profil,
                client
            );
            
            await hitungUlangPersen(progres.progres_id, client);
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'UBAH_CHECKLIST',
                tabel: 'checklist_progres',
                idRecord: item.id_checklist,
                dataLama: {nama_syarat: item.nama_syarat, terpenuhi: item.terpenuhi},
                dataBaru: {nama_syarat: baru.nama_syarat, terpenuhi: baru.terpenuhi}
            }, client);
            return detailLengkap(progres.progres_id, client);
        });
        ok(res, hasil, 'Checklist diperbarui');
    }

    static async hapusItem(req, res){
        const progres = await ambilProgres(req.params.id);
        const item = await TemplatePersyaratan.cariItem(progres.progres_id, req.params.itemId);
        if (!item) {
            throw new AppError('Item checklist tidak ditemukan', 404);
        }

        const hasil = await db.transaction(async (client) => {
            await TemplatePersyaratan.hapusItem(item.id_checklist, client);
            await hitungUlangPersen(progres.progres_id, client);
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'HAPUS',
                tabel: 'checklist_progres',
                idRecord: item.id_checklist,
                dataLama: item
            }, client);
            return detailLengkap(progres.progres_id, client);
        });
        ok(res, hasil, 'Syarat dihapus dari checklist');
    }

    static async jenisLayanan(req, res){
        ok(res, await TemplatePersyaratan.daftarJenisLayanan());
    }

    static async daftarTemplate(req, res){
        const { jenis_layanan, aktif } = req.query;
        ok(res, await TemplatePersyaratan.daftarTemplate({ jenisLayanan: jenis_layanan, aktif }));
    }

    static async buatTemplate(req, res){
        const b = req.body;

        const baru = await db.transaction(async (client) => {
            const template = await TemplatePersyaratan.buatTemplate(
                { jenisLayanan: b.jenis_layanan, namaSyarat: b.nama_syarat, urutan: b.urutan },
                client
            );
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'TAMBAH',
                tabel: 'template_persyaratan',
                idRecord: template.id_template,
                dataBaru: template
            }, client);
        return template;
        });

        created(res, baru, 'Templat persyaratan ditambahkan');
    }

    static async ubahTemplate(req, res) {
        const lama = await ambilTemplate(req.params.id);

        const hasil = await db.transaction(async (client) => {
            const baru = await TemplatePersyaratan.ubahTemplate(lama.id_template, req.body, client);
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'UBAH',
                tabel: 'template_persyaratan',
                idRecord: lama.id_template,
                ...AuditService.selisih(lama, baru, Object.keys(req.body))
            }, client);
            return baru;
        });
        ok(res, hasil, 'Templat persyaratan diperbarui');
    }

    static async hapusTemplate(req, res){
        const lama = await ambilTemplate(req.params.id);

        await db.transaction(async (client) => {
            await TemplatePersyaratan.hapusTemplate(lama.id_template, client);
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'HAPUS',
                tabel: 'template_persyaratan',
                idRecord: lama.id_template,
                dataLama: lama
            }, client);
        });
        ok(res, null, 'Templat persyaratan dihapus');
    }
}

module.exports = ProgresController;