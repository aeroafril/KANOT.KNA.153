const express = require('express');
const BukuTamuController = require('../controllers/bukuTamuController');
const {verifyToken, requireRole} = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {buat, ubah, jamKeluar, cari, daftar, paramId} = require('../validators/bukuTamuValidator');

const router = express.Router();

router.use(verifyToken);

router.get('/', validate({ query: daftar }), BukuTamuController.daftar);
router.get('/cari', validate({ query: cari }), BukuTamuController.cari);
router.post('/', validate({ body: buat }), BukuTamuController.tambah);
router.get('/:id', validate({ params: paramId }), BukuTamuController.detail);
router.patch('/:id', validate({ params: paramId, body: ubah }), BukuTamuController.ubah);
router.patch(
    '/:id/jam-keluar',
    validate({ params: paramId, body: jamKeluar }),
    BukuTamuController.jamKeluar
);
router.delete('/:id', requireRole('Notaris'), validate({ params: paramId }), BukuTamuController.hapus);

module.exports = router;