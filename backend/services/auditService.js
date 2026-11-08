const RiwaratAktivitas = require('../models/RiwayatAktivitas');

const KUNCI_RAHASIA = new Set([
    'password',
    'password_hash',
    'passwordhash',
    'password_baru',
    'nik',
    'nik_hash',
    'telepon',
    'alamat',
    'token'
]);

const samarkan = (nilai) => {
    if(nilai === null || nilai === undefined){
        return null;
    }

    if(Array.isArray(nilai)){
        return nilai.map(samarkan);
    }

    if(nilai instanceof Date){
        return nilai.toISOString();
    }

    if(typeof nilai === 'object'){
        return Object.fromEntries(Object.entries(nilai).map(([kunci, isi]) => [
            kunci, KUNCI_RAHASIA.has(kunci.toLowerCase()) ? '[DISEMBUNYIKAN]' : samarkan(isi)
        ]));
    }
    return nilai;
};

class AuditService{
    static async catat({idProfil, namaPengguna, aksi, tabel, idRecord, dataLama, dataBaru, ip}, client){
        return RiwaratAktivitas.tambah({
            idProfil,
            namaPengguna,
            aksi,
            tabel,
            idRecord,
            dataLama: samarkan(dataLama),
            dataBaru: samarkan(dataBaru),
            ip
        }, client);
    }

    static selisih(lama, baru, kunci){
        const ambil = (objek) => Object.fromEntries(kunci.filter((k) => k in objek).map((k) => [k, objek[k]]));
        return {
            dataLama: ambil(lama),
            dataBaru: ambil(baru)
        }
    }

    static dariRequest(reg){
        return{
            idProfil: req.user ? req.user.id_profil : null,
            namaPengguna: req.user ? req.user.nama : null,
            ip: req.ip
        };
    }
}

module.exports = AuditService;
module.exports.samarkan = samarkan;