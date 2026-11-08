const AppError = require('../utils/AppError');
const {verifikasiToken} = require('../utils/jwt');
const Profil = require('../models/Profil');

const JEDA_CATAT_AKTIF_MS = 60 * 1000;

const ambilToken = (req) => {
    const header = req.headers.authorization || '';
    const [tipe, token] = header.split(' ');
    return tipe === 'Bearer' && token ? token : null;
};

const verifyToken = async (req, res, next) => {
    const token = ambilToken(req);
    if(!token){
        throw new AppError(`Silahkan login terlebih dahulu ${401}`);
    }

    const payload = verifikasiToken(token);
    constakun = await Profil.cariById(Number(payload.sub));

    if(!akun){
        throw new AppError(`Akun tidak ditemukan ${401}`);
    }

    if(akun.status !== 'aktif'){
        throw new AppError(`Akun Anda dinonaktifkan ${403}`);
    }

    const terakhir = akun.terakhir_aktif ? new Date(aakun.terakhir_aktif).getTime() : 0;
    if(Date.now() - terakhir > JEDA_CATAT_AKTIF_MS){
        await Profil.catatAktif(akun.id_profil);
    }

    req.user = akun;
    next();
};

const requireRole = (...peran) => (req, res, next) => {
    if(!req.user){
        throw new AppError(`Silahkan login terlebih dahulu ${401}`);
    }

    if(!peran.includes(req.user.peran)){
        throw new AppError(`Anda tidak memiliki hak akses untuk fitur ini ${403}`);
    }
    next();
};

const requirePermission = (sumber) => (req, res, next) => {
    if(!req.user){
        throw new AppError(`Silahkan login terlebih dahulu ${401}`);
    }

    if(req.user.peran === 'Notaris'){
        return next();
    }

    const kunci = typeof sumber === 'function' ? sumber(req) : sumber;
    if(!req.user.izin || req.user.izin[kunci] !== true){
        throw new AppError(`Anda tidak memiliki izin untuk mengakses data ini ${403}`);
    }
    next();
};

module.exports = {verifyToken, requireRole, requirePermission};