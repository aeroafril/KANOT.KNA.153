const env = require('../config/env');
const Profil = require('../models/Profil');
const AuditService = require('../services/auditService');
const AppError = require('../utils/AppError');
const {ok} = require('../utils/response');
const {buatToken} = require('../utils/jwt');
const {cocokPassword} = require('../utils/crypto');

class AuditController{
    static async login(req, res){
        const {username, password} = req.body;

        const akun = await Profil.cariUntukLogin(username);
        const cocok = await cocokPassword(password, akun ? akun.password : null);

        if(!akun || !cocok){
            await AuditService.catat({
                idProfil: akun ? akun.id_profil : null,
                namaPengguna: username,
                aksi: 'LOGIN_GAGAL',
                tabel: 'profil',
                ip: req.ip
            });
            throw new AppError(`Username atau password salah ${401}`)
        }

        if(akun.status !== 'aktif'){
            await AuditService.catat({
                idProfil: akun.id_profil,
                namaPengguna: akun.nama,
                aksi: 'LOGIN_GAGAL',
                tabel: 'profil',
                dataBaru: {alasan: 'akun nonaktif'},
                ip: req.ip
            });
            throw new AppError(`Akun Anda dinonaktifkan, hubungi Notaris ${403}`);
        }

        await Profil.catatAktif(akun.id_profil);

        const token = buatToken({sub: String(akun.id_profil), peran: akun.peran});

        await AuditService.catat({
            idProfil: akun.id_profil,
            namaPengguna: akun.nama,
            aksi: 'LOGIN',
            tabel: 'profil',
            idRecord: akun.id_profil,
            ip: req.ip
        });

        ok(res,{
            token,
            tipe: 'Bearer',
            kedaluwarsa: env.jwt.expiresIn,
            user: {
                id_profil: akun.id_profil,
                username: akun.id_profil,
                nama: akun.nama,
                peran: akun.peran,
                inisial: akun.inisial,
                izin:akun.izin
            }
        }, 'login berhasil');
    }

    static async logout(req, res){
        await Profil.setOffline(req.user.id_profil);
        await AuditService.catat({
            ...AuditService.dariRequest(req),
            aksi: 'LOGOUT',
            tabel: 'profil',
            idRecord: req.user.id_profil
        });
        ok(res, null, 'Logout berhasil');
    }
}

module.exports = AuditController;