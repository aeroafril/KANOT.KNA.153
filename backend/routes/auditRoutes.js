const express = require('express');
const AuditController = require('../controllers/auditController');
const {verifyToken, requireRole} = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {queryAudit} = require('../validators/authValidator');

const router = express.Router();

router.use(verifyToken, requireRole('Notaris'));

router.get('/', validate({query: queryAudit}), AuditController.daftar);

module.exports = router;