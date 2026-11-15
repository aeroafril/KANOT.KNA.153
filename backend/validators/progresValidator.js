const {z} = require('zod');
const U = require('./umum');

const STATUS_PROGRES = ['Diproses', 'Ditunda', 'Selesai', 'Dibatalkan'];
const pesanStatus = `Status harus salah satu dari: ${STATUS_PROGRES.join(', ')}`;

const buat = z.object({
    buku_tamu_id: U.opsional(U.idAngka('buku_tamu_id')),
    nama_client: U.opsional(U.teks('Nama klien', 150)),
    jenis_layanan: U.teksWajib('Jenis layanan', 100),
    tahap_saat_ini: U.opsional(U.teks('Tahap saat ini', 100)),
    profil_id: U.opsional(U.idAngka('profil_id')),
    tanggal_target: U.opsional(U.tanggal('Tanggal target')),
    catatan: U.opsional(U.teks('Catatan', 255))
}).refine((o) => o.buku_tamu_id !== undefined || o.nama_client !== undefined, {
    message: 'Isi buku_tamu_id atau nama_client',
    path: ['nama_client']
});

const ubah = U.minimalSatu(z.object({
    nama_client: U.teksWajib('Nama klien', 150).optional(),
    tahap_saat_ini: U.bisaKosong(U.teks('Tahap saat ini', 100)),
    status: z.enum(STATUS_PROGRES, pesanStatus).optional(),
    persentase_progres: U.opsional(z.coerce.number('Persentase harus berupa angka').int('Persentase harus bilangan bulat').min(0, 'Persentase minimal 0').max(100, 'Persentase maksimal 100')),
    catatan: U.bisaKosong(U.teks('Catatan', 255)),
    tanggal_target: U.bisaKosong(U.tanggal('Tanggal target')),
    tanggal_selesai: U.opsional(U.tanggal('Tanggal selesai')),
    profil_id: U.bisaKosong(U.idAngka('profil_id'))
}));

const daftar = z.object({
    ...U.halaman,
    status: z.enum(['semua', 'aktif', 'selesai', ...STATUS_PROGRES], pesanStatus).default('semua'),
    profil_id: U.opsional(U.idAngka('profil_id')),
    q: z.string().trim().max(150).optional(),
    terlambat: U.boolQuery.optional()
});

const tambahItem = z.object({ nama_syarat: U.teksWajib('Nama syarat', 150) });
const ubahItem = z.object({ terpenuhi: z.boolean('terpenuhi harus true atau false') });
const paramItem = z.object({ id: U.idAngka('ID'), itemId: U.idAngka('ID item') });

const buatTemplate = z.object({
    jenis_layanan: U.teksWajib('Jenis layanan', 100),
    nama_syarat: U.teksWajib('Nama syarat', 150),
    urutan: U.opsional(z.coerce.number('Urutan harus berupa angka').int('Urutan harus bilangan bulat').min(0).max(1000))
});

const ubahTemplate = U.minimalSatu(z.object({
    jenis_layanan: U.teksWajib('Jenis layanan', 100).optional(),
    nama_syarat: U.teksWajib('Nama syarat', 150).optional(),
    urutan: U.opsional(z.coerce.number('Urutan harus berupa angka').int().min(0).max(1000)),
    aktif: z.boolean('aktif harus true atau false').optional()
}));

const queryTemplate = z.object({
    jenis_layanan: z.string().trim().max(100).optional(),
    aktif: U.boolQuery.optional()
});

module.exports = {
    STATUS_PROGRES,
    buat,
    ubah,
    daftar,
    tambahItem,
    ubahItem,
    paramItem,
    buatTemplate,
    ubahTemplate,
    queryTemplate,
    paramId: U.paramId
};