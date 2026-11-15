const express = require('express');
const RegistrasiController = require('../controllers/registrasiController');
const {verifyToken, requireRole, requirePermission} = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
    cekJenis,
    validateRegistrasi,
    daftar,
    paramJenisId
} = require('../validators/registrasiValidator');

const router = express.Router();

router.use(verifyToken);
router.use('/:jenis', cekJenis, requirePermission((req) => req.registrasi.tabel));

router.get('/:jenis', validate({ query: daftar }), RegistrasiController.daftar);
router.post('/:jenis', validateRegistrasi('buat'), RegistrasiController.tambah);
router.get('/:jenis/:id', validate({ params: paramJenisId }), RegistrasiController.detail);
router.patch(
    '/:jenis/:id',
    validate({ params: paramJenisId }),
    validateRegistrasi('ubah'),
    RegistrasiController.ubah
);

router.delete(
    '/:jenis/:id',
    requireRole('Notaris'),
    validate({ params: paramJenisId }),
    RegistrasiController.hapus
);

module.exports = router;