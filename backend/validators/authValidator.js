const {z} = require('zod');

const DAFTAR_IZIN = [
  {kunci: 'akta', label: 'Buku Akta (Reportorium)'},
  {kunci: 'wasiat', label: 'Buku Daftar Wasiat'},
  {kunci: 'surat_dibukukan', label: 'Buku Waarmerking (Surat Dibukukan)'},
  {kunci: 'surat_disahkan', label: 'Buku Legalisasi (Surat Disahkan)'},
  {kunci: 'protes', label: 'Buku Protes'},
  {kunci: 'copie_collationne', label: 'Buku Salinan (Copie Collationne)'},
  {kunci: 'klapper_akta', label: 'Klapper Akta'},
  {kunci: 'klapper_legalisasi', label: 'Klapper Legalisasi'},
  {kunci: 'regist_pt', label: 'Registrasi PT'},
  {kunci: 'regist_cv', label: 'Registrasi CV'},
  {kunci: 'yayasan', label: 'Registrasi Yayasan'},
  {kunci: 'adopsi_anak', label: 'Registrasi Adopsi Anak'},
  {kunci: 'hibah', label: 'Registrasi Hibah'},
  {kunci: 'log_surat', label: 'Surat Masuk dan Keluar'}
];

const skemaUsername = z.string('Username wajib diisi').trim().toLowerCase().regex(/^[a-z0-9._-]{3,50}$/, 'Username 3-50 karakter: huruf, angka, titik, garis bawah, atau strip');

const skemaPassword = z.string('password wajib diisi').min(8, 'password minimal 8 karakter').max(72, 'Password maksimal 72 karakter');

const skemaIzin = z.strictObject(Object.fromEntries(DAFTAR_IZIN.map(({kunci}) => [kunci, z.boolean().optional()])));

const skemaTanggal = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-mm-DD');

const login = z.object({
    username: skemaUsername,
    password: z.string('Password wajib diisi').min(1, 'Password wajib diisi').max(128)
});

const tambahStaf = z.object({
    username: skemaUsername,
    password: skemaPassword,
    nama: z.string('Nama wajib diisi').trim().min(1, 'Nama wajib diisi').max(150, 'Nama maksimal 150 karakter'),
    inisial: z.string().trim().max(10, 'Inisial maksimal 10 karakter').optional(),
    izin: skemaIzin.optional()
});

const ubahIzin = z.object({izin: skemaIzin});

const ubahstatus = z.object({status: z.enum(['aktif', 'nonaktif'], 'Status harus aktif atau nonaktif')});

const resetPassword = z.object({password_baru: skemaPassword});

const paramId = z.object({id: z.coerce.number('ID tidak valid').int('ID tidak valid').positive('ID tidak valid')});

const queryAudit = z.object({
    page: z.coerce.number('page tidak valid').int().min(1).default(1),
    limit: z.coerce.number('limit tidak valid').int().min(1).max(100).default(20),
    id_profil: z.coerce.number('id_profil tidak valid').int().positive().optional(),
    aksi: z.string().trim().max(30).optional(),
    tabel: z.string().trim().max(50).optional(),
    dari: skemaTanggal.optional(),
    sampai: skemaTanggal.optional()
});

module.exports = {
    DAFTAR_IZIN,
    skemaUsername,
    skemaPassword,
    login,
    tambahStaf,
    ubahIzin,
    ubahstatus,
    resetPassword,
    paramId,
    queryAudit
};