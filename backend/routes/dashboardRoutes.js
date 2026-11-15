const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const {verifyToken} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, DashboardController.ringkasan);

module.exports = router;
