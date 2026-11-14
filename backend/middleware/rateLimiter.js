const rateLimit = require('express-rate-limit');
const AppError = require('../utils/AppError');

const limiterLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new AppError(`Terlalu banyak percobaan login gagal, coba lagi dalam 15 menit ${429}`));
    }
});

module.exports = {limiterLogin};