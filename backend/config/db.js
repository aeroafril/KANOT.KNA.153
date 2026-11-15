const {Pool, types} = require('pg');
const env = require('./env');

types.setTypeParser(1082, (nilai) => nilai);

const pool = new Pool({
    ...env.db.koneksi,
    ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
    console.error('Koneksi database bermasalah:', err.message);
});

const terinisialisasi = new WeakSet();

const ambilKlien = async () => {
    const client = await pool.connect();
    if(!terinisialisasi.has(client)){
        await client.query('SET jit = off').catch(() => {});
        terinisialisasi.add(client);
    }
    return client;
};

const query = async (text, params) => {
    const client = await ambilKlien();
    try{
        return await client.query(text, params);
    }finally{
        client.release();
    }
};

const cekKoneksi = async () => {
    const hasil = await pool.query('SELECT NOW() AS waktu');
    return hasil.rows[0].waktu;
};

const escapeLike = (teks) => String(teks).replace(/[\\%_]/g, '\\$&');
module.exports = {pool, query, transaction, cekKoneksi, escapeLike};