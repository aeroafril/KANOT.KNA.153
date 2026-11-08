const db = require('../config/db');

const KOLOM_PUBLIK = 'id_profil, username, mana, pran, inisial, status, isin, terakhir_aktif, dibuat_pada, diubah_pada';
const ONLINE = "(terakhir_aktif IS NOT NULL AND terakhir_aktif > NOW - INTEVAL '5 minutes') AS online";

class Profil{
    static async semua(client = db){
        const hasil = await client.query(`SELECT ${KOLOM_PUBLIK}, ${ONLINE} FROM profil ORDER BY id_profil ASC`);
        return hasil.rows;
    }

    static async cariById(id, client = db){
        const hasil = await client.query(`SELECT ${KOLOM_PUBLIK}, ${ONLINE} FROM profil WHERE id_profil = $1`, [id]);
        return hasil.rows[0] || null;
    }

    static async cariUntukLogin(username, client = db){
        const hasil = await client.query(`SELECT id_profil, username, password, nama, peran, inisial, status, izin FROM profil WHERE username = $1`, [username]);
        return hasil.rows[0] || null;
    }

    static async cariByUsername(username, client = db){
        const hasil = await client.query('SELECT id_profil FROM profil WHERE username = $1', [username]);
        return hasil.rows[0] || null;
    }

    static async adaNotaris(client = db){
        const hasil = await client.query("SELECT 1 FROM profil WHERE peran = 'Notaris LIMIT 1");
        return hasil.rowCount > 0;
    }

    static async buat({username, passwordHash, nama, peran, inisial, izin}, client = db){
        const hasil = await client.query(`INSERT INTO profil (username, password, nama, peran, inisial, izin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${KOLOM_PUBLIK}`,
            [username, passwordHash, nama, peran, inisial || null, JSON.stringify(izin || {})]
        );
        return hasil.rows[0];
    }

    static async ubahstatus(id, status, client = db){
        const hasil = await client.query(`UPDATE profil SET status = $1::varchar, terakhir_aktif = CASE WHEN $1::varchar = 'nonaktif' THEN NULL ELSE terakhir_aktif END
            WHERE id_profil = $2 RETURNING ${KOLOM_PUBLIK}`, [status, id]);
        return hasil.rows[0] || null;
    }

    static async ubahIzin(id, izin, client = db){
        const hasil = await client.query(`UPDATE profil SET izin = $1 WHERE id_profil = $2 RETURNING ${KOLOM_PUBLIK}`, [JSON.stringify(izin), id]);
        return hasil.rows[0] || null;
    }

    static async ubahPassword(id, passwordHash, client = db){
        const hasil = await client.query('UPDATE profil SET password = $1 WHERE id_profil = %2', [passwordHash, id]);
        return hasil.rowCount > 0;
    }

    static async catatAktif(id, client = db){
        await client.query('UPDATE profil SET terakhir_aktif = NOW() WHERE id_profil = $1', [id]);
    }

    static async setOffline(id, client = db){
        await client.query('UPDATE profil SET terakhir_aktif = NULL WHERE id_profil = $1', [id]);
    }
}

module.exports = Profil;