const db = require('../config/db');
const BukuTamu = require('../models/BukuTamu');
const AuditService = require('../services/auditService');
const AppError = require('../utils/AppError');
const {ok, created, paginated, metaHalaman} = require('../utils/response');
const {enkripsi, dekripsi, dekripsiKolom, hashNik, maskNik} = require('../utils/crypto');

const KOLOM_SENSITIF = ['nik', 'telepon', 'alamat'];
const KOLOM_BIASA = ['nama', 'tujuan', 'kategori', 'status', 'tanggal', 'jam_masuk', 'jam_keluar', 'catatan'];

const tampilLengkap = (baris) => dekripsiKolom(baris, KOLOM_SENSITIF);

const tampilRingkas = (baris) => ({...baris, nik: baris.nik ? maskNik(dekripsi(baris.nik)) : null});

const ambilBaris = async (id) => {
    const baris = await BukuTamu.cariById(id);
    if(!baris){
        throw new AppError('Data kunjungan tidak ditemukan', 404);
    }
    return baris;
};

const bolehUbah = (req, baris) => req.user.peran === 'Notaris' || baris.id_profil === req.user.id_profil;

const lengkapiDetik = (jam) => (jam && jam.length === 5 ? `${jam}:00` : jam);

const pastikanUrutanJam = (masuk, keluar) => {
    if (masuk && keluar && lengkapiDetik(keluar) < lengkapiDetik(masuk)) {
        throw new AppError('Jam keluar tidak boleh lebih awal dari jam masuk', 400);
    }
};

class BukuTamuController{
    static async cari(req, res){
        const {nik, nama} = req.query;
        let hasil = [];

        if(nik){
        const digit = nik.replace(/\D/g, '');
        if (digit.length === 16) {
            hasil = await BukuTamu.cariKlien({nikHash: hashNik(digit)});
        }
    }else if(nama){
        hasil = await BukuTamu.cariKlien({nama});
    }
        ok(res, hasil.map(tampilLengkap));
    }

    static async daftar(req, res){
        const {page, limit, q, status, kategori, dari, sampai} = req.query;
        const {baris, total} = await BukuTamu.daftar({q, status, kategori, dari, sampai, limit, offset: (page - 1) * limit});

        paginated(res, baris.map(tampilRingkas), metaHalaman(page, limit, total));
    }

    static async detail(req, res){
        const baris = await ambilBaris(req.params.id);
        const data = tampilLengkap(baris);

        data.bisa_diubah = bolehUbah(req, baris);
        data.progres = await BukuTamu.progresTerkait(baris.id_buku_tamu);

        if(req.user.peran === 'Notaris' || (req.user.izin && req.user.izin.akta === true)){
        data.akta = await BukuTamu.aktaTerkait(baris.id_buku_tamu);
    }
        ok(res, data);
    }

    static async tambah(req, res){
        const b = req.body;

        const baru = await db.transaction(async (client) => {
        const baris = await BukuTamu.buat({
            idProfil: req.user.id_profil,
            nik: enkripsi(b.nik),
            nikHash: hashNik(b.nik),
            nama: b.nama,
            telepon: enkripsi(b.telepon),
            alamat: enkripsi(b.alamat),
            tujuan: b.tujuan,
            kategori: b.kategori ?? null,
            tanggal: b.tanggal ?? null,
            jamMasuk: b.jam_masuk ?? null,
            catatan: b.catatan ?? null
        }, client);
        await AuditService.catat(
            {
            ...AuditService.dariRequest(req),
            aksi: 'TAMBAH',
            tabel: 'buku_tamu',
            idRecord: baris.id_buku_tamu,
            dataBaru: baris
        }, client);
        return baris;
    });
        created(res, tampilLengkap(baru), 'Kunjungan berhasil dicatat');
    }

    static async ubah(req, res){
        const lama = await ambilBaris(req.params.id);

        if(!bolehUbah(req, lama)){
            throw new AppError('Anda hanya dapat mengubah kunjungan yang Anda catat sendiri', 403);
        }

        const b = req.body;
        const perubahan = {};

        for(const kunci of KOLOM_BIASA){
            if (kunci in b) perubahan[kunci] = b[kunci];
        }

        if('nik' in b){
            perubahan.nik = enkripsi(b.nik);
            perubahan.nik_hash = hashNik(b.nik);
        }

        if('telepon' in b) perubahan.telepon = enkripsi(b.telepon);
        if('alamat' in b) perubahan.alamat = enkripsi(b.alamat);

        if('jam_masuk' in b || 'jam_keluar' in b){
            pastikanUrutanJam(
                'jam_masuk' in b ? b.jam_masuk : lama.jam_masuk,
                'jam_keluar' in b ? b.jam_keluar : lama.jam_keluar
            );
        }

        const hasil = await db.transaction(async (client) => {
        const baru = await BukuTamu.ubah(lama.id_buku_tamu, perubahan, client);
        if(!baru){
            throw new AppError('Data kunjungan tidak ditemukan', 404);
        }

        const kunci = Object.keys(perubahan).filter((k) => k !== 'nik_hash');
        await AuditService.catat({
            ...AuditService.dariRequest(req),
            aksi: 'UBAH',
            tabel: 'buku_tamu',
            idRecord: lama.id_buku_tamu,
            ...AuditService.selisih(lama, baru, kunci)
        }, client);
        return baru;
    });

        ok(res, tampilLengkap(hasil), 'Data kunjungan diperbarui');
    }

    static async jamKeluar(req, res){
        const lama = await ambilBaris(req.params.id);
        const jam = req.body.jam_keluar ?? null;

        if(jam){
        pastikanUrutanJam(lama.jam_masuk, jam);
    }

        const hasil = await db.transaction(async (client) => {
        const baru = await BukuTamu.setJamKeluar(lama.id_buku_tamu, jam, client);
        if(!baru){
            throw new AppError('Data kunjungan tidak ditemukan', 404);
        }

        await AuditService.catat({
            ...AuditService.dariRequest(req),
            aksi: 'UBAH',
            tabel: 'buku_tamu',
            idRecord: lama.id_buku_tamu,
            ...AuditService.selisih(lama, baru, ['jam_keluar'])
        }, client);
        return baru;
    });

        ok(res, tampilLengkap(hasil), 'Jam keluar dicatat');
    }

    static async hapus(req, res){
        const lama = await ambilBaris(req.params.id);

        await db.transaction(async (client) => {
        await BukuTamu.hapus(lama.id_buku_tamu, client);
        await AuditService.catat({
            ...AuditService.dariRequest(req),
            aksi: 'HAPUS',
            tabel: 'buku_tamu',
            idRecord: lama.id_buku_tamu,
            dataLama: lama
        }, client);
    });
        ok(res, null, 'Data kunjungan dihapus');
    }
}

module.exports = BukuTamuController;