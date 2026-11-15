const express = require('express');
const LaporanController = require('../controllers/laporanController');
const {verifyToken, requireRole} = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {rekap, verifikasi, ekspor} = require('../validators/reportoriumValidator');

const router = express.Router();

router.use(verifyToken, requireRole('Notaris'));

router.get('/rekap', validate({ query: rekap }), LaporanController.rekap);
router.post('/verifikasi', validate({ body: verifikasi }), LaporanController.verifikasi);
router.post('/batal-verifikasi', validate({ body: verifikasi }), LaporanController.batalkanVerifikasi);
router.get('/export', validate({ query: ekspor }), LaporanController.ekspor);

module.exports = router;