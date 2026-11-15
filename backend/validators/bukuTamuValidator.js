const {z} = require('zod');
const U = require('./umum');

const STATUS_TAMU = ['Proses', 'Selesai', 'Dibatalkan'];

const skemaNik = z.string('NIK harus berupa teks').transform((nilai) => nilai.replace(/\D/g, '')).refine((nilai) => nilai.length === 16, 'NIK harus 16 digit angka');

const skemaTelepon = z.string('Nomor telepon harus berupa teks').trim().regex(/^[0-9+\-() ]{6,20}$/, 'Nomor telepon tidak valid (6-20 karakter)');

const buat = z.object({
    nik: U.opsional(skemaNik),
    nama: U.teksWajib('Nama', 150),
    telepon: U.opsional(skemaTelepon),
    alamat: U.opsional(U.teks('Alamat', 255)),
    tujuan: U.teksWajib('Tujuan', 150),
    kategori: U.opsional(U.teks('Kategori', 150)),
    tanggal: U.opsional(U.tanggal('Tanggal')),
    jam_masuk: U.opsional(U.jam('Jam masuk')),
    catatan: U.opsional(U.teks('Catatan', 150))
});

const ubah = U.minimalSatu(
    z.object({
        nik: U.bisaKosong(skemaNik),
        nama: U.teksWajib('Nama', 150).optional(),
        telepon: U.bisaKosong(skemaTelepon),
        alamat: U.bisaKosong(U.teks('Alamat', 255)),
        tujuan: U.teksWajib('Tujuan', 150).optional(),
        kategori: U.bisaKosong(U.teks('Kategori', 150)),
        status: z.enum(STATUS_TAMU, `Status harus salah satu dari: ${STATUS_TAMU.join(', ')}`).optional(),
        tanggal: U.tanggal('Tanggal').optional(),
        jam_masuk: U.bisaKosong(U.jam('Jam masuk')),
        jam_keluar: U.bisaKosong(U.jam('Jam keluar')),
        catatan: U.bisaKosong(U.teks('Catatan', 150))
    })
);

const jamKeluar = z.object({
    jam_keluar: U.opsional(U.jam('Jam keluar'))
});

const cari = z.object({
    nik: z.string().trim().max(30).optional(),
    nama: z.string().trim().min(2, 'Nama minimal 2 karakter').max(150).optional()
}).refine((objek) => objek.nik || objek.nama, 'Isi nik atau nama untuk pencarian');

const daftar = z.object({
    ...U.halaman,
    q: z.string().trim().max(150).optional(),
    status: z.enum(STATUS_TAMU, `Status harus salah satu dari: ${STATUS_TAMU.join(', ')}`).optional(),
    kategori: z.string().trim().max(150).optional(),
    dari: U.tanggal('dari').optional(),
    sampai: U.tanggal('sampai').optional()
});

module.exports = { STATUS_TAMU, buat, ubah, jamKeluar, cari, daftar, paramId: U.paramId };