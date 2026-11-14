const express = require('express');
const AuthController = require('../controllers/authController');
const {verifyToken} = require('../middleware/authMiddleware');
const {limiterLogin} = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const {login} = require('../validators/authValidator');

const router = express.Router();

router.post('/login', limiterLogin, validate({body: login}), AuthController.login);
router.get('/me', verifyToken, AuthController.me);
router.post('/logout', verifyToken, AuthController.logout);

module.exports = router;