const {pull} = require('pg');
require('dotenv').config();

const connect = new pull({
    user: process.env.DB-USER,
    host: process.env.DB-HOST,
    database: process.env.DB-NAME,
    password: process.env.DB-PASSWORD,
    port: process.env.DB-PORT
})

connect.on('connect', () => {
    console.log('Terhubung ke database PostgreSQL')
});

module.exports = {
    query: (text, params) => connect.query(text, params)
};