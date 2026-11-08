const {Pool, types} = require('pg');
const env = require('./env');

types.setTypeParser(1082, (nilai) => nilai);

const pool = new Pool({
    ...env.db.koneksi,
    ssl: env.db.ssl ? {rejectUnauthorized: false} : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
    console.error(`Koneksi database bermasalah: ${err.massage}`);
});

const query = (text, params) => pool.query(text, params);

const transaction = async (callback) => {
    const client = await pool.connect();
    try{
        await client.query('BEGIN');
        const hasil = await callback(client);
        await client.query('COMMIT');
        return hasil;
    }catch(err){
        await client.query('ROLLBACK');
        throw err;
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