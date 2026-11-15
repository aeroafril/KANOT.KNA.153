const env = require('../config/env');
const BukuReportorium = require('../models/BukuReportorium');
const Registrasi = require('../models/Registrasi');
const StatusRekap = require('../models/StatusRekap');
const RekapService = require('../services/rekapService');
const ExportService = require('../services/exportService');
const AuditService = require('../services/auditService');
const AppError = require('../utils/AppError');
const {ok} = require('../utils/response');
const {REPORTORIUM, REGISTRASI} = require('../config/bukuConfig');

const MIME = {
    pdf: 'application/pdf',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

class LaporanController{
    static async rekap(req, res){
        const sekarang = RekapService.periodeSekarang();
        const bulan = req.query.bulan ?? sekarang.bulan;
        const tahun = req.query.tahun ?? sekarang.tahun;
        ok(res, await RekapService.susun(bulan, tahun));
    }

    static async verifikasi(req, res){
        const {jenis_buku, bulan, tahun} = req.body;
        let targets;

        if(jenis_buku === 'semua'){
            targets = Object.keys(REPORTORIUM);
        }else if(REPORTORIUM[jenis_buku]) {
            targets = [jenis_buku];
        }else{
            throw new AppError('Jenis buku tidak dikenal', 400);
        }

        const hasil = await RekapService.verifikasi({ targets, bulan, tahun, req });
        ok(res, hasil, 'Verifikasi laporan berhasil');
    }

    static async batalkanVerifikasi(req, res){
        const { jenis_buku, bulan, tahun } = req.body;
        const cfg = REPORTORIUM[jenis_buku];

        if(!cfg){
            throw new AppError('Jenis buku tidak dikenal', 400);
        }

        const hasil = await RekapService.batalkanVerifikasi({ cfg, slug: jenis_buku, bulan, tahun, req });
        ok(res, hasil, 'Verifikasi dibatalkan, data periode ini dapat diubah kembali');
    }

    static async ekspor(req, res){
        const {jenis_buku: slug, bulan, tahun, format} = req.query;
        const cfgReportorium = REPORTORIUM[slug];
        const cfg = cfgReportorium || REGISTRASI[slug];

        if(!cfg){
            throw new AppError('Jenis buku tidak dikenal', 400);
        }

        if (cfgReportorium && !bulan){
            throw new AppError('Bulan wajib diisi untuk laporan bulanan buku ini', 400);
        }

        let baris;
        let nihil = false;
        let status = null;

        if(cfgReportorium){
            const semua = await BukuReportorium.untukLaporan(cfg, bulan, tahun);
            baris = semua.filter((b) => !b.nihil);
            nihil = baris.length === 0 && semua.some((b) => b.nihil);
            const rekap = await StatusRekap.cari(cfg.tabel, bulan, tahun);
            status = rekap ? rekap.status : 'Belum Terverifikasi';
        }else{
            baris = await Registrasi.untukLaporan(cfg, tahun, bulan);
        }

        if(baris.length === 0 && !nihil){
            throw new AppError('Tidak ada data untuk periode tersebut', 404);
        }

        const periode = bulan ? RekapService.namaPeriode(bulan, tahun) : `Tahun ${tahun}`;

        await AuditService.catat({
            ...AuditService.dariRequest(req),
            aksi: 'EKSPOR',
            tabel: cfg.tabel,
            dataBaru: { jenis_buku: slug, bulan: bulan ?? null, tahun, format, jumlah_baris: baris.length }
        });

        if (format === 'json'){
            return ok(res, {
                meta: { jenis_buku: slug, nama: cfg.nama, periode, nihil, status_verifikasi: status, total: baris.length },
                data: baris
            });
        }

        const laporan = {
            kantor: env.ambil('NAMA_KANTOR') || 'Kantor Notaris',
            judul: `Laporan ${cfg.nama}`,
            periode,
            kolom: cfg.laporan,
            baris,
            nihil,
            status,
            dibuatOleh: req.user.nama,
            dibuatPada: new Date()
        };

        const buffer = format === 'xlsx' ? await ExportService.buatExcel(laporan) : await ExportService.buatPdf(laporan);

        const sufiks = bulan ? `${tahun}-${String(bulan).padStart(2, '0')}` : `${tahun}`;
        res.set({
            'Content-Type': MIME[format],
            'Content-Disposition': `attachment; filename="laporan-${slug}-${sufiks}.${format}"`,
            'Cache-Control': 'no-store'
        });
        res.send(buffer);
    }
}

module.exports = LaporanController;