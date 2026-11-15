const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');

const server = app.listen(env.port, async () => {
    console.log(`Server KANOT berjalan di http://localhost:${env.port}`);
    try {
        await db.cekKoneksi();
        console.log('Database terhubung');
    } catch (err) {
        console.error('Database gagal terhubung:', err.message);
    }
});

const matikan = (sinyal) => {
    console.log(`${sinyal} diterima, menutup server`);
    server.close(async () => {
        await db.pool.end();
        process.exit(0);
    });
};

process.on('SIGINT', () => matikan('SIGINT'));
process.on('SIGTERM', () => matikan('SIGTERM'));