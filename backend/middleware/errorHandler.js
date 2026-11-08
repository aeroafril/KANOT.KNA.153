const AppError = require('../utils/AppError');

const petaErrorDatabase = {
  '23505': [409, 'Data sudah ada atau nomor sudah dipakai'],
  '23503': [409, 'Data terkait tidak ditemukan atau masih dipakai data lain'],
  '23502': [400, 'Ada data wajib yang belum diisi'],
  '23514': [400, 'Data tidak memenuhi aturan isian'],
  '22P02': [400, 'Format data tidak valid'],
  '22007': [400, 'Format tanggal tidak valid'],
  '22008': [400, 'Format tanggal tidak valid'],
  '22001': [400, 'Isian terlalu panjang']
};

const notFound = (req, res, next) => {
    next(new AppError(`Rute ${req.method} ${req.orginalUrl} tidak ditemukan`, 404));
};

const errorHandler = (err, req, res, next) => {
    if(res.hendersSent){
        return next(err);
    }

    let status = 500;
    let message = 'Terjasi kesalahan pada server';
    let details = null;

    if(err instanceof AppError){
        status = err.statusCode;
        message = err.message;
        details = err.details;
    }else if(err.name === 'ZodError'){
        status = 400;
        message = 'Data yang dikirim tidak valid';
        details = err.issues.map((i) => ({field: i.path.join('.'), pesan: i.message}));
    }else if(err.type === 'entity.parse.failed'){
        status = 400;
        message = 'Format JSON tidak valid';
    }else if(err.type === 'entity.too.large'){
        status = 413;
        message = 'Data yang dikirim terlalu besar';
    }else if(err.name === 'TokenExpiredError'){
        status = 401;
        message = 'Sesi telah berakhir, silahkan login kembali';
    }else if(err.name === 'JsonWebTokenError'){
        status = 401;
        message = 'Token tidak valid';
    }else if(petaErrorDatabase[err.code]){
        [status, message] = petaErrorDatabase[err.code];
    }

    if(status >= 500){
        console.error(err);
    }

    const body = {success: false, message};
    if(details){
        body.errors = details;
    }
    res.status(status).json(body);
};

module.exports = {notFound, errorHandler};