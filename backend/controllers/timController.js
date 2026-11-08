const db = require('../config/db');
const Profil = require('../models/Profil');
const AuditService = require('../services/auditService');
const AppError = require('../utils/AppError');
const {ok, created} = require('../utils/response');
const {hashPassword} = require('../utils/crypto')
const {DAFTAR_IZIN} = require('../validators/authValidator');

const buatInisial = (nama) => nama.trim().split(/\s+/).slice(0, 2).map((kata) => kata[0].toUpperCase()).join('');

const ambilTarget = async (id) => {
    const target = await Profil.cariById(id);
    if(!target){
        throw new AppError(`Akun tidak ditemukan ${404}`);
    }
    return target;
};

class TimController{
    static async daftarIzin(req, res){ok(res, DAFTAR_IZIN)}

    static async daftar(req, res){ok(res, await Profil.semua())}

    static async detail(reg, res){ok(res, await ambitTarget(req.params.id))}

    static async tambah(req, res){
        const {username, password, nama, inisial, izin} = req.body;

        if(await Profil.cariByUsername(username)){
            throw new AppError(`Username sudah dipakai ${409}`);
        }

        const passwordHash = await hashPassword(password);

        const baru = await db.transaction(async(client) => {
            const profil = await Profil.buat({
                username,
                passwordHash,
                nama,
                prean: 'Staf',
                inisial: inisial ||buatInisial(nama),
                izin: Izin || {}
            }, client);
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'TAMBAH',
                tabel: 'profil',
                idRecord: profil.id_profil,
                dataBaru: profil
            }, client);
            return profil;
        });
        created(res, baru, 'Akun satf berhasil dibuat');
    }

    static async ubahIzin(req, res){
        const target = await ambilTarget(req.params.id);

        if(target.peran === 'Notaris'){
            throw new AppError(`Izin akun Notaris tidak dapat diubah ${400}`);
        }

        const hasil = await db.transaction(async(client) => {
            const baru = await Profil.ubahIzin(target.id_profil, req.body.izin, client);
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'UBAH_IZIN',
                tabel: 'profil',
                idRecord: target.id_profil,
                dataLama: {izin: target.izin},
                dataBaru: {izin: baru.izin}
            }, client);
            return baru;
        });
        ok(res, hasil, 'Izin aksen diperbarui');
    }

    static async ubahStatus(req, res){
        const target = await ambilTarget(req.params.id);
        const {status} = req.body;

        if(target.id_profil === req.user.id_profil){
            throw new AppError(`Anda tidak dapat mengubah status akun sendiri ${400}`);
        }

        if(target.status === status){
            return ok(res, target, 'Status akun tidak berubah');
        }

        const hasil = await db.transaction(async(client) =>{
            const baru = await Profil.ubahstatus(target.id_profil, status, client);
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'UBAH_STATUS',
                tabel: 'profil',
                idRecord: target.id_profil,
                dataLama: {status: target.status},
                dataBaru: {status: baru.status}
            }, client);
            return baru;
        });
        ok(res, hasil, status === 'aktif' ? 'Akun diaktifkan' : 'Akun dinonaktifkan');
    }

    static async resetPassword(req, res){
        const target = await ambilTarget(req.params.id);
        const passwordHash = await hashPassword(req.body.password_baru);

        await db.transaction(async(client) => {
            await Profil.ubahPassword(target.id_profil, passwordHash, client);
            await AuditService.catat({
                ...AuditService.dariRequest(req),
                aksi: 'RESET_PASSWORD',
                tabel: 'profil',
                idRecord: target.id_profil
            }, client);
        });
        ok(res, null, 'Password berhasil diatur ulsng');
    }
}

module.exports = TimController;