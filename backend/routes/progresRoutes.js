const express = require('express');
const ProgresController = require('../controllers/progresController');
const {verifyToken, requireRole} = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
    buat,
    ubah,
    daftar,
    tambahItem,
    ubahItem,
    paramItem,
    buatTemplate,
    ubahTemplate,
    queryTemplate,
    paramId
} = require('../validators/progresValidator');

const router = express.Router();

router.use(verifyToken);

router.get('/jenis-layanan', ProgresController.jenisLayanan);

router.get('/template', validate({ query: queryTemplate }), ProgresController.daftarTemplate);
router.post(
    '/template',
    requireRole('Notaris'),
    validate({ body: buatTemplate }),
    ProgresController.buatTemplate
);
router.patch(
    '/template/:id',
    requireRole('Notaris'),
    validate({ params: paramId, body: ubahTemplate }),
    ProgresController.ubahTemplate
);
router.delete(
    '/template/:id',
    requireRole('Notaris'),
    validate({ params: paramId }),
    ProgresController.hapusTemplate
);

router.get('/', validate({ query: daftar }), ProgresController.daftar);
router.post('/', validate({ body: buat }), ProgresController.tambah);
router.get('/:id', validate({ params: paramId }), ProgresController.detail);
router.patch('/:id', validate({ params: paramId, body: ubah }), ProgresController.ubah);

router.post(
    '/:id/checklist',
    validate({ params: paramId, body: tambahItem }),
    ProgresController.tambahItem
);

router.patch(
    '/:id/checklist/:itemId',
    validate({ params: paramItem, body: ubahItem }),
    ProgresController.ubahItem
);

router.delete(
    '/:id/checklist/:itemId',
    validate({ params: paramItem }),
    ProgresController.hapusItem
);

module.exports = router;