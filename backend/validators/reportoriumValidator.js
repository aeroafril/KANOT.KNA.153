const {z} = require('zod');
const U = require('./umum');
const AppError = require('../utils/AppError');
const {REPORTORIUM, KLAPPER} = require('../config/bukuConfig');

const SKEMA = Object.fromEntries(
  Object.entries(REPORTORIUM).map(([jenis, cfg]) => [jenis, U.bangunSkemaBuku(cfg)])
);

const cekJenis = (req, res, next) => {
  const cfg = REPORTORIUM[req.params.jenis];
  if (!cfg) {
    throw new AppError('Jenis buku tidak dikenal', 404);
  }
  req.reportorium = cfg;
  next();
};

const cekJenisKlapper = (req, res, next) => {
  const cfg = KLAPPER[req.params.jenis];
  if (!cfg) {
    throw new AppError('Jenis klapper tidak dikenal', 404);
  }
  req.klapper = cfg;
  next();
};

const validateReportorium = (mode) => (req, res, next) => {
  const hasil = SKEMA[req.params.jenis][mode].parse(req.body ?? {});
  req.body = Object.fromEntries(Object.entries(hasil).filter(([, nilai]) => nilai !== undefined));
  next();
};

const bulan = z.coerce
  .number('Bulan harus berupa angka')
  .int('Bulan harus bilangan bulat')
  .min(1, 'Bulan harus antara 1 dan 12')
  .max(12, 'Bulan harus antara 1 dan 12');

const tahun = z.coerce
  .number('Tahun harus berupa angka')
  .int('Tahun harus bilangan bulat')
  .min(1990, 'Tahun tidak valid')
  .max(2100, 'Tahun tidak valid');

const periode = z.object({ bulan, tahun });

const daftar = z.object({
  ...U.halaman,
  q: z.string().trim().max(150).optional(),
  bulan: U.opsional(bulan),
  tahun: U.opsional(tahun),
  tahun_dari: U.opsional(tahun),
  tahun_sampai: U.opsional(tahun),
  dari: U.tanggal('dari').optional(),
  sampai: U.tanggal('sampai').optional(),
  nihil: U.boolQuery.optional()
});

const daftarKlapper = z.object({
  ...U.halaman,
  q: z.string().trim().max(150).optional(),
  huruf: z
    .string()
    .trim()
    .regex(/^[A-Za-z#]$/, 'huruf harus satu huruf A-Z atau #')
    .transform((nilai) => nilai.toUpperCase())
    .optional()
});

const cariLintasBuku = z.object({
  ...U.halaman,
  q: z.string().trim().max(150).optional(),
  jenis: z.string().trim().max(40).optional(),
  bulan: U.opsional(bulan),
  tahun: U.opsional(tahun),
  tahun_dari: U.opsional(tahun),
  tahun_sampai: U.opsional(tahun),
  dari: U.tanggal('dari').optional(),
  sampai: U.tanggal('sampai').optional()
});

const rekap = z.object({ bulan: U.opsional(bulan), tahun: U.opsional(tahun) });

const verifikasi = z.object({
  jenis_buku: z.string('jenis_buku wajib diisi').trim().min(1, 'jenis_buku wajib diisi').max(40),
  bulan,
  tahun
});

const ekspor = z.object({
  jenis_buku: z.string('jenis_buku wajib diisi').trim().min(1, 'jenis_buku wajib diisi').max(40),
  bulan: U.opsional(bulan),
  tahun,
  format: z.enum(['pdf', 'xlsx', 'json'], 'format harus pdf, xlsx, atau json').default('pdf')
});

const paramJenisId = z.object({ jenis: z.string(), id: U.idAngka('ID') });

module.exports = {
  cekJenis,
  cekJenisKlapper,
  validateReportorium,
  periode,
  daftar,
  daftarKlapper,
  cariLintasBuku,
  rekap,
  verifikasi,
  ekspor,
  paramJenisId
};