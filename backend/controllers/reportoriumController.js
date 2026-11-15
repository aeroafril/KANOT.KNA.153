const db = require('../config/db');
const BukuReportorium = require('../models/BukuReportorium');
const BukuTamu = require('../models/BukuTamu');
const StatusRekap = require('../models/StatusRekap');
const KlapperService = require('../services/klapperService');
const RekapService = require('../services/rekapService');
const AuditService = require('../services/auditService');
const AppError = require('../utils/AppError');
const {ok, created, paginated, metaHalaman} = require('../utils/response');

const ambilBaris = async (cfg, id) => {
    const baris = await BukuReportorium.cariById(cfg, id);
    if (!baris) {
        throw new AppError('Data buku tidak ditemukan', 404);
    }
    return baris;
};

const pastikanKunjungan = async (idBukuTamu) => {
    if (idBukuTamu && !(await BukuTamu.cariById(idBukuTamu))) {
        throw new AppError('Data kunjungan tidak ditemukan', 404);
    }
};

const terjemahkanDuplikat = (err, nomor, tahun) => {
    if (err.code === '23505') {
        return new AppError(`Nomor ${nomor} sudah dipakai pada tahun ${tahun}`, 409);
    }
    return err;
};

const urutkanPeriode = (daftar) => {
    const unik = new Map(daftar.map((p) => [`${p.tahun}-${p.bulan}`, p]));
    return [...unik.values()].sort((a, b) => a.tahun - b.tahun || a.bulan - b.bulan);
};

class ReportoriumController {
    static async daftar(req, res) {
        const cfg = req.reportorium;
        const { page, limit, q, bulan, tahun, tahun_dari, tahun_sampai, dari, sampai, nihil } = req.query;
        const { baris, total } = await BukuReportorium.daftar(cfg, {
            q,
            bulan,
            tahun,
            tahunDari: tahun_dari,
            tahunSampai: tahun_sampai,
            dari,
            sampai,
            nihil,
            limit,
            offset: (page - 1) * limit
        });
        paginated(res, baris, metaHalaman(page, limit, total));
    }

    static async detail(req, res) {
        ok(res, await ambilBaris(req.reportorium, req.params.id));
    }

    static async periode(req, res) {
        const cfg = req.reportorium;
        const { bulan, tahun } = req.query;
        const [jumlah, nihil, rekap] = await Promise.all([
            BukuReportorium.hitungData(cfg, bulan, tahun),
            BukuReportorium.cariNihil(cfg, bulan, tahun),
            StatusRekap.cari(cfg.tabel, bulan, tahun)
        ]);
        const terkunci = Boolean(rekap) && rekap.status === 'Terverifikasi';

        ok(res, {
            jenis: req.params.jenis,
            bulan,
            tahun,
            periode: RekapService.namaPeriode(bulan, tahun),
            jumlah_data: jumlah,
            nihil: Boolean(nihil),
            id_nihil: nihil ? nihil[cfg.pk] : null,
            terkunci,
            status_verifikasi: rekap ? rekap.status : 'Belum Terverifikasi',
            bisa_nihil: jumlah === 0 && !nihil && !terkunci && !RekapService.belumBerjalan(bulan, tahun)
        });
    }

    static async tambah(req, res) {
        const cfg = req.reportorium;
        const b = req.body;
        const { bulan, tahun } = RekapService.periodeDariTanggal(b[cfg.tanggal]);
        await pastikanKunjungan(b.id_buku_tamu);

        let hasil;
        try {
        hasil = await db.transaction(async (client) => {
            await RekapService.pastikanBelumTerkunci(cfg, bulan, tahun, client);

            const nihilLama = await BukuReportorium.cariNihil(cfg, bulan, tahun, client);
            if (nihilLama) {
                await BukuReportorium.hapus(cfg, nihilLama[cfg.pk], client);
                await AuditService.catat({
                    ...AuditService.dariRequest(req),
                    aksi: 'HAPUS',
                    tabel: cfg.tabel,
                    idRecord: nihilLama[cfg.pk],
                    dataLama: nihilLama,
                    dataBaru: { alasan: 'Status NIHIL dibatalkan karena ada data baru pada periode ini' }
                }, client);
            }

            const baris = await BukuReportorium.buat(cfg, { ...b, bulan, tahun, nihil: false }, client);
            await KlapperService.simpan(cfg, baris, client);
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'TAMBAH',
                tabel: cfg.tabel,
                idRecord: baris[cfg.pk],
                dataBaru: baris
            }, client);
            return { baris, nihilDibatalkan: Boolean(nihilLama) };
        });
        } catch (err) {
        throw terjemahkanDuplikat(err, b[cfg.nomor], tahun);
        }

        created(res, { ...hasil.baris, nihil_dibatalkan: hasil.nihilDibatalkan }, 'Data berhasil dicatat');
    }

    static async nihil(req, res){
        const cfg = req.reportorium;
        const { bulan, tahun } = req.body;

        if (RekapService.belumBerjalan(bulan, tahun)){
            throw new AppError('Periode yang belum berjalan tidak dapat ditandai NIHIL', 400);
        }

        const baris = await db.transaction(async (client) => {
            await RekapService.pastikanBelumTerkunci(cfg, bulan, tahun, client);

            const jumlah = await BukuReportorium.hitungData(cfg, bulan, tahun, client);
            if (jumlah > 0) {
                throw new AppError(`Periode ini sudah memiliki ${jumlah} data, tidak dapat ditandai NIHIL`, 409);
            }
            if (await BukuReportorium.cariNihil(cfg, bulan, tahun, client)) {
                throw new AppError('Periode ini sudah ditandai NIHIL', 409);
            }

            const nihil = await BukuReportorium.buat(cfg, { bulan, tahun, nihil: true }, client);
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'NIHIL',
                tabel: cfg.tabel,
                idRecord: nihil[cfg.pk],
                dataBaru: { bulan, tahun, nihil: true }
            }, client);
            return nihil;
        });
        created(res, baris, 'Periode ditandai NIHIL');
    }

    static async ubah(req, res){
        const cfg = req.reportorium;
        const lama = await ambilBaris(cfg, req.params.id);

        if(lama.nihil){
            throw new AppError('Baris NIHIL tidak dapat diubah. Hapus lalu catat data yang sebenarnya', 400);
        }

        const b = req.body;
        const perubahan = {...b};
        const periodeLama = {bulan: lama.bulan, tahun: lama.tahun};
        let periodeBaru = periodeLama;

        if(b[cfg.tanggal]){
            periodeBaru = RekapService.periodeDariTanggal(b[cfg.tanggal]);
            perubahan.bulan = periodeBaru.bulan;
            perubahan.tahun = periodeBaru.tahun;
        }
        await pastikanKunjungan(b.id_buku_tamu);

        const nomorBaru = b[cfg.nomor] ?? lama[cfg.nomor];
        const pindahPeriode = periodeBaru.bulan !== periodeLama.bulan || periodeBaru.tahun !== periodeLama.tahun;

        let hasil;
        try {
            hasil = await db.transaction(async (client) => {
                for (const periode of urutkanPeriode([periodeLama, periodeBaru])) {
                await RekapService.pastikanBelumTerkunci(cfg, periode.bulan, periode.tahun, client);
                }

                if (pindahPeriode) {
                    const nihilBaru = await BukuReportorium.cariNihil(cfg, periodeBaru.bulan, periodeBaru.tahun, client);
                    if (nihilBaru) {
                        await BukuReportorium.hapus(cfg, nihilBaru[cfg.pk], client);
                        await AuditService.catat({
                            ...AuditService.dariRequest(req),
                            aksi: 'HAPUS',
                            tabel: cfg.tabel,
                            idRecord: nihilBaru[cfg.pk],
                            dataLama: nihilBaru,
                            dataBaru: { alasan: 'Status NIHIL dibatalkan karena ada data yang dipindahkan ke periode ini' }
                        },client);
                    }
                }

                const baru = await BukuReportorium.ubah(cfg, lama[cfg.pk], perubahan, client);
                if (!baru) {
                    throw new AppError('Data buku tidak ditemukan', 404);
                }
                await KlapperService.simpan(cfg, baru, client);
                await AuditService.catat({
                    ...AuditService.dariRequest(req),
                    aksi: 'UBAH',
                    tabel: cfg.tabel,
                    idRecord: lama[cfg.pk],
                    ...AuditService.selisih(lama, baru, Object.keys(perubahan))
                }, client);
                return baru;
            });
        }catch(err){
            throw terjemahkanDuplikat(err, nomorBaru, periodeBaru.tahun);
        }
        ok(res, hasil, 'Data buku diperbarui');
    }

    static async hapus(req, res){
        const cfg = req.reportorium;
        const lama = await ambilBaris(cfg, req.params.id);

        await db.transaction(async (client) => {
            await RekapService.pastikanBelumTerkunci(cfg, lama.bulan, lama.tahun, client);
            await BukuReportorium.hapus(cfg, lama[cfg.pk], client);
            await KlapperService.hapus(cfg, lama, client);
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'HAPUS',
                tabel: cfg.tabel,
                idRecord: lama[cfg.pk],
                dataLama: lama
            }, client);
        });
        ok(res, null, 'Data buku dihapus');
    }
}

module.exports = ReportoriumController;