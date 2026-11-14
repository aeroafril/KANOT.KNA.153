const express = require('express');
const TimController = require('../controllers/timController');
const {verifyToken, requireRole} = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const{tambahStaf, ubahIzin, ubahStatus, resetPassword, paramId} = require('../validators/authValidator');

const router = express.Router();

router.use(verifyToken, requireRole('Notaris'));

router.get('/', TimController.daftar);
router.post('/', validate({ body: tambahStaf }), TimController.tambah);
router.get('/daftar-izin', TimController.daftarIzin);
router.get('/:id', validate({ params: paramId }), TimController.detail);
router.patch('/:id/izin', validate({ params: paramId, body: ubahIzin }), TimController.ubahIzin);
router.patch('/:id/status', validate({ params: paramId, body: ubahStatus }), TimController.ubahStatus);
router.patch(
    '/:id/password',
    validate({ params: paramId, body: resetPassword }),
    TimController.resetPassword
);

module.exports = router;