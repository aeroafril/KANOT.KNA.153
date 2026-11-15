const express = require('express');
const SuratController = require('../controllers/suratController');
const {verifyToken, requireRole, requirePermission} = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {buat, ubah, daftar, paramId} = require('../validators/suratValidator');

const router = express.Router();

router.use(verifyToken, requirePermission('log_surat'));

router.get('/', validate({ query: daftar }), SuratController.daftar);
router.post('/', validate({ body: buat }), SuratController.tambah);
router.get('/:id', validate({ params: paramId }), SuratController.detail);
router.patch('/:id', validate({ params: paramId, body: ubah }), SuratController.ubah);
router.delete('/:id', requireRole('Notaris'), validate({ params: paramId }), SuratController.hapus);

module.exports = router;