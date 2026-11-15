const express = require('express');
const BukuController = require('../controllers/bukuController');
const {verifyToken} = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {cariLintasBuku} = require('../validators/reportoriumValidator');

const router = express.Router();

router.use(verifyToken);

router.get('/', BukuController.daftarBuku);
router.get('/cari', validate({ query: cariLintasBuku }), BukuController.cari);

module.exports = router;