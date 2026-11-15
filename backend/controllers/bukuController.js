const BukuReportorium = require('../models/BukuReportorium');
const AppError = require('../utils/AppError');
const {ok, paginated, metaHalaman} = require('../utils/response');
const {REPORTORIUM, REGISTRASI, KLAPPER} = require('../config/bukuConfig');

const SEMUA_BUKU = [
    ...Object.entries(REPORTORIUM).map(([slug, cfg]) => ({
        slug,
        cfg,
        tabel: cfg.tabel,
        tipe: 'reportorium',
        nama: cfg.nama,
        izin: cfg.tabel,
        endpoint: `/api/reportorium/${slug}`
    })),
    ...Object.entries(REGISTRASI).map(([slug, cfg]) => ({
        slug,
        cfg,
        tabel: cfg.tabel,
        tipe: 'registrasi',
        nama: cfg.nama,
        izin: cfg.tabel,
        endpoint: `/api/registrasi/${slug}`
    })),
    ...Object.entries(KLAPPER).map(([slug, cfg]) => ({
        slug: `klapper-${slug}`,
        cfg,
        tabel: cfg.tabel,
        tipe: 'klapper',
        nama: cfg.nama,
        izin: cfg.izin,
        endpoint: `/api/klapper/${slug}`
    })),
    {
        slug: 'surat',
        cfg: null,
        tabel: 'log_surat',
        tipe: 'surat',
        nama: 'Surat Masuk dan Keluar',
        izin: 'log_surat',
        endpoint: '/api/surat'
    }
];

const bisaAkses = (user, kunciIzin) =>
  user.peran === 'Notaris' || Boolean(user.izin && user.izin[kunciIzin] === true);

class BukuController{
    static async daftarBuku(req, res){
        const dapat = SEMUA_BUKU.filter((buku) => bisaAkses(req.user, buku.izin));
        const jumlah = dapat.length > 0 ? await BukuReportorium.hitungSemuaBuku(dapat) : {};

        ok(
        res,
        dapat.map((buku) => ({
            jenis: buku.slug,
            nama: buku.nama,
            kelompok: buku.tipe,
            endpoint: buku.endpoint,
            total: jumlah[buku.slug] ?? 0
        }))
        );
    }

    static async cari(req, res){
        const { page, limit, q, jenis, bulan, tahun, tahun_dari, tahun_sampai, dari, sampai } = req.query;
        const bisaDicari = SEMUA_BUKU.filter((b) => b.tipe === 'reportorium' || b.tipe === 'registrasi');

        let target;
        if(jenis){
            const dipilih = bisaDicari.find((b) => b.slug === jenis);
            if(!dipilih){
                throw new AppError('Jenis buku tidak dikenal', 400);
            }

            if(!bisaAkses(req.user, dipilih.izin)) {
                throw new AppError('Anda tidak memiliki izin untuk mengakses data ini', 403);
            }

            target = [dipilih];
        }else{
        target = bisaDicari.filter((b) => bisaAkses(req.user, b.izin));
        }

        const {baris, total} = await BukuReportorium.cariLintasBuku(target, {
            q,
            bulan,
            tahun,
            tahunDari: tahun_dari,
            tahunSampai: tahun_sampai,
            dari,
            sampai,
            limit,
            offset: (page - 1) * limit
        });

        const namaBuku = Object.fromEntries(target.map((b) => [b.slug, b.nama]));
        paginated(res, baris.map((baris) => ({ ...baris, nama_buku: namaBuku[baris.jenis] })), metaHalaman(page, limit, total));
    }
}

module.exports = BukuController;