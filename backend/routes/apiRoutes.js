const express = require('express');
const db = require('../config/db');
const {ok} = require('../utils/response');

const router = express.Router();

router.get('/health', async (req, res) => {
    const waktu = await db.cekKoneksi();
    ok(res, {
        status: 'ok',
        database: 'terhubung',
        waktu_server: waktu,
    }, 'Server berjalan');
});

router.use('/auth', require('./authRoutes'));
router.use('/tim', require('./timRoutes'));
router.use('/audit', require('./auditRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/buku-tamu', require('./bukuTamuRoutes'));
router.use('/progres', require('./progresRoutes'));
router.use('/surat', require('./suratRoutes'));
router.use('/registrasi', require('./registrasiRoutes'));

module.exports = router;