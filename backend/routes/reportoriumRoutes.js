const express = require('express');
const ReportoriumController = require('../controllers/reportoriumController');
const { verifyToken, requireRole, requirePermission } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  cekJenis,
  validateReportorium,
  periode,
  daftar,
  paramJenisId
} = require('../validators/reportoriumValidator');

const router = express.Router();

router.use(verifyToken);
router.use('/:jenis', cekJenis, requirePermission((req) => req.reportorium.tabel));

router.get('/:jenis', validate({ query: daftar }), ReportoriumController.daftar);
router.get('/:jenis/periode', validate({ query: periode }), ReportoriumController.periode);
router.post('/:jenis/nihil', validate({ body: periode }), ReportoriumController.nihil);
router.post('/:jenis', validateReportorium('buat'), ReportoriumController.tambah);
router.get('/:jenis/:id', validate({ params: paramJenisId }), ReportoriumController.detail);
router.patch(
  '/:jenis/:id',
  validate({ params: paramJenisId }),
  validateReportorium('ubah'),
  ReportoriumController.ubah
);
router.delete(
  '/:jenis/:id',
  requireRole('Notaris'),
  validate({ params: paramJenisId }),
  ReportoriumController.hapus
);

module.exports = router;