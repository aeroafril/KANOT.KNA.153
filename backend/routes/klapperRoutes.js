const express = require('express');
const KlapperController = require('../controllers/klapperController');
const {verifyToken, requirePermission} = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {cekJenisKlapper, daftarKlapper} = require('../validators/reportoriumValidator');

const router = express.Router();

router.use(verifyToken);
router.use('/:jenis', cekJenisKlapper, requirePermission((req) => req.klapper.izin));

router.get('/:jenis', validate({ query: daftarKlapper }), KlapperController.daftar);
router.get('/:jenis/huruf', KlapperController.huruf);

module.exports = router;