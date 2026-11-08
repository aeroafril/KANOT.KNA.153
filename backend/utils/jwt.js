const jwt = require('jsonwebtoken');
const env = require('../config/env');

const buatToken = (payload) => jwt.sign(payload, env.jwt.secret, {algorithm: 'HS256', expiresIn: env.jwt.expiresIn});

const verifikasiToken = (token) => jwt.verify(token, env.jwt.secret, {algorithms: ['HS256']});

module.exports = {buatToken, verifikasiToken};