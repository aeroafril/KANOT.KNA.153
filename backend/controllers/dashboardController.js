const BukuTamu = require('../models/BukuTamu');
const Progres = require('../models/Progres');
const Profil = require('../models/Profil');
const {ok} = require('../utils/response');
const {dekripsi, maskNik} = require('../utils/crypto');

const samarkanKunjungan = (baris) => ({
    ...baris,
    nik: baris.nik ? maskNik(dekripsi(baris.nik)) : null
});

class DashboardController {
    static async ringkasan(req, res){
        if(req.user.peran === 'Notaris'){
            return ok(res, await DashboardController.untukNotaris());
        }
        ok(res, await DashboardController.untukStaf(req.user));
    }

    static async untukNotaris(){
        const [klien, perBulan, terbaru, berkas, terdekat, tim] = await Promise.all([
            BukuTamu.ringkasan(),
            BukuTamu.perBulan(),
            BukuTamu.terbaru(10),
            Progres.statistik(),
            Progres.terdekatTarget(5),
            Profil.semua()
        ]);

        const aktif = tim.filter((anggota) => anggota.status === 'aktif');

        return{
            peran: 'Notaris',
            klien,
            per_bulan: perBulan,
            berkas: { ...berkas, terdekat_target: terdekat },
            tim: {
                total_aktif: aktif.length,
                online: aktif.filter((anggota) => anggota.online).length,
                anggota: aktif.map(({ id_profil, nama, peran, inisial, online }) => ({
                id_profil,
                nama,
                peran,
                inisial,
                online
                }))
            },
            riwayat_kunjungan: terbaru.map(samarkanKunjungan)
        };
    }

    static async untukStaf(user){
        const [kunjunganHariIni, berkas, terbaru] = await Promise.all([
            BukuTamu.hitungHariIni(user.id_profil),
            Progres.statistik(user.id_profil),
            BukuTamu.terbaru(10, user.id_profil)
        ]);

        return {
            peran: 'Staf',
            kunjungan_hari_ini: kunjunganHariIni,
            berkas_saya: berkas,
            riwayat_kunjungan: terbaru.map(samarkanKunjungan)
        };
    }
}

module.exports = DashboardController;