const {z} = require('zod');
const U = require('./umum');

const JENIS_SURAT = ['masuk', 'keluar'];
const pesanJenis = 'Jenis surat harus masuk atau keluar';

const buat = z.object({
    jenis_surat: z.enum(JENIS_SURAT, pesanJenis),
    nomor_surat: U.teksWajib('Nomor surat', 50),
    tanggal_surat: U.tanggal('Tanggal surat'),
    pengirim_penerima: U.opsional(U.teks('Pengirim/penerima', 150)),
    subjek: U.opsional(U.teks('Subjek', 150)),
    keterangan: U.opsional(U.teks('Keterangan', 150))
});

const ubah = U.minimalSatu(z.object({
    jenis_surat: z.enum(JENIS_SURAT, pesanJenis).optional(),
    nomor_surat: U.teksWajib('Nomor surat', 50).optional(),
    tanggal_surat: U.tanggal('Tanggal surat').optional(),
    pengirim_penerima: U.bisaKosong(U.teks('Pengirim/penerima', 150)),
    subjek: U.bisaKosong(U.teks('Subjek', 150)),
    keterangan: U.bisaKosong(U.teks('Keterangan', 150))
}));

const daftar = z.object({
    ...U.halaman,
    jenis_surat: z.enum(JENIS_SURAT, pesanJenis).optional(),
    q: z.string().trim().max(150).optional(),
    dari: U.tanggal('dari').optional(),
    sampai: U.tanggal('sampai').optional()
});

module.exports = { JENIS_SURAT, buat, ubah, daftar, paramId: U.paramId };