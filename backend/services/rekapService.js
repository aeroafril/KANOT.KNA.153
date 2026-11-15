const db = require('../config/db');
const BukuReportorium = require('../models/BukuReportorium');
const StatusRekap = require('../models/StatusRekap');
const AuditService = require('./auditService');
const AppError = require('../utils/AppError');
const { REPORTORIUM } = require('../config/bukuConfig');

const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

const periodeSekarang = () => {
  const [tahun, bulan] = new Date()
    .toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
    .split('-')
    .map(Number);
  return { tahun, bulan };
};

const periodeDariTanggal = (tanggal) => ({
  tahun: Number(tanggal.slice(0, 4)),
  bulan: Number(tanggal.slice(5, 7))
});

const belumBerjalan = (bulan, tahun) => {
  const sekarang = periodeSekarang();
  return tahun > sekarang.tahun || (tahun === sekarang.tahun && bulan > sekarang.bulan);
};

const namaPeriode = (bulan, tahun) => `${NAMA_BULAN[bulan - 1]} ${tahun}`;

class RekapService {
  static periodeSekarang() {
    return periodeSekarang();
  }

  static periodeDariTanggal(tanggal) {
    return periodeDariTanggal(tanggal);
  }

  static belumBerjalan(bulan, tahun) {
    return belumBerjalan(bulan, tahun);
  }

  static namaPeriode(bulan, tahun) {
    return namaPeriode(bulan, tahun);
  }

  static async terkunci(cfg, bulan, tahun, client = db) {
    const rekap = await StatusRekap.cari(cfg.tabel, bulan, tahun, client);
    return Boolean(rekap) && rekap.status === 'Terverifikasi';
  }

  static async pastikanBelumTerkunci(cfg, bulan, tahun, client = db) {
    await StatusRekap.kunci(cfg.tabel, bulan, tahun, client);
    if (await RekapService.terkunci(cfg, bulan, tahun, client)) {
      throw new AppError(
        `${cfg.nama} periode ${namaPeriode(bulan, tahun)} sudah diverifikasi. ` +
          'Minta Notaris membatalkan verifikasi terlebih dahulu untuk mengubah data.',
        409
      );
    }
  }

  static async susun(bulan, tahun, client = db) {
    const daftar = [];

    for (const [slug, cfg] of Object.entries(REPORTORIUM)) {
      const jumlah = await BukuReportorium.hitungData(cfg, bulan, tahun, client);
      const nihil = await BukuReportorium.cariNihil(cfg, bulan, tahun, client);
      const status = await StatusRekap.cari(cfg.tabel, bulan, tahun, client);

      let kondisi = 'kosong';
      if (jumlah > 0) kondisi = 'ada_data';
      else if (nihil) kondisi = 'nihil';

      daftar.push({
        jenis: slug,
        nama: cfg.nama,
        jumlah_data: jumlah,
        nihil: Boolean(nihil) && jumlah === 0,
        kondisi,
        siap_verifikasi: kondisi !== 'kosong',
        status: status ? status.status : 'Belum Terverifikasi',
        diverifikasi_oleh: status ? status.diverifikasi_oleh : null,
        diverifikasi_pada: status ? status.diverifikasi_pada : null
      });
    }

    return {
      bulan,
      tahun,
      periode: namaPeriode(bulan, tahun),
      buku: daftar,
      ringkasan: {
        total_buku: daftar.length,
        siap_verifikasi: daftar.filter((b) => b.siap_verifikasi).length,
        terverifikasi: daftar.filter((b) => b.status === 'Terverifikasi').length
      }
    };
  }

  static async verifikasi({ targets, bulan, tahun, req }) {
    if (belumBerjalan(bulan, tahun)) {
      throw new AppError('Periode yang belum berjalan tidak dapat diverifikasi', 400);
    }

    await db.transaction(async (client) => {
      for (const slug of targets) {
        await StatusRekap.kunci(REPORTORIUM[slug].tabel, bulan, tahun, client);
      }

      const rekap = await RekapService.susun(bulan, tahun, client);
      const dipilih = rekap.buku.filter((b) => targets.includes(b.jenis));
      const belumSiap = dipilih.filter((b) => !b.siap_verifikasi);

      if (belumSiap.length > 0) {
        throw new AppError(
          'Ada buku yang belum memiliki data dan belum ditandai NIHIL',
          400,
          belumSiap.map((b) => ({
            field: b.jenis,
            pesan: `${b.nama}: belum ada data dan belum ditandai NIHIL`
          }))
        );
      }

      for (const buku of dipilih) {
        if (buku.status === 'Terverifikasi') {
          continue;
        }
        const cfg = REPORTORIUM[buku.jenis];
        const baris = await StatusRekap.tetapkan(
          cfg.tabel,
          bulan,
          tahun,
          'Terverifikasi',
          req.user.id_profil,
          client
        );
        await AuditService.catat(
          {
            ...AuditService.dariRequest(req),
            aksi: 'VERIFIKASI',
            tabel: 'status_rekap',
            idRecord: baris.id_rekap,
            dataBaru: { jenis_buku: buku.jenis, bulan, tahun, status: 'Terverifikasi' }
          },
          client
        );
      }
    });

    return RekapService.susun(bulan, tahun);
  }

  static async batalkanVerifikasi({ cfg, slug, bulan, tahun, req }) {
    await db.transaction(async (client) => {
      await StatusRekap.kunci(cfg.tabel, bulan, tahun, client);
      const sekarang = await StatusRekap.cari(cfg.tabel, bulan, tahun, client);
      if (!sekarang || sekarang.status !== 'Terverifikasi') {
        throw new AppError('Periode ini belum diverifikasi', 409);
      }
      const baris = await StatusRekap.tetapkan(
        cfg.tabel,
        bulan,
        tahun,
        'Belum Terverifikasi',
        null,
        client
      );
      await AuditService.catat(
        {
          ...AuditService.dariRequest(req),
          aksi: 'BATAL_VERIFIKASI',
          tabel: 'status_rekap',
          idRecord: baris.id_rekap,
          dataLama: { jenis_buku: slug, bulan, tahun, status: 'Terverifikasi' },
          dataBaru: { jenis_buku: slug, bulan, tahun, status: 'Belum Terverifikasi' }
        },
        client
      );
    });

    return RekapService.susun(bulan, tahun);
  }
}

module.exports = RekapService;