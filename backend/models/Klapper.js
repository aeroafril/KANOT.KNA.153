const db = require('../config/db');

const HURUF = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#'];

class Klapper {
    static async daftar(cfg, { huruf, q, limit, offset }, client = db) {
        const kondisi = [];
        const nilai = [];

        if(huruf === '#'){
            kondisi.push("(huruf IS NULL OR huruf !~ '^[A-Z]$')");
        }else if (huruf){
            nilai.push(huruf);
            kondisi.push(`huruf = $${nilai.length}`);
        }

        if(q){
            nilai.push(`%${db.escapeLike(q)}%`);
            kondisi.push(`${cfg.namaKolom} ILIKE $${nilai.length}`);
        }

        const where = kondisi.length > 0 ? `WHERE ${kondisi.join(' AND ')}` : '';
        const total = await client.query(`SELECT COUNT(*)::int AS total FROM ${cfg.tabel} ${where}`, nilai);
        const data = await client.query(
            `SELECT * FROM ${cfg.tabel} ${where}
            ORDER BY LOWER(${cfg.namaKolom}) ASC, ${cfg.namaKolom} ASC, ${cfg.tanggal} ASC, ${cfg.pk} ASC
            LIMIT $${nilai.length + 1} OFFSET $${nilai.length + 2}`,
            [...nilai, limit, offset]
        );
        return { baris: data.rows, total: total.rows[0].total };
    }

    static async hitungPerHuruf(cfg, client = db) {
        const hasil = await client.query(
            `SELECT CASE WHEN huruf ~ '^[A-Z]$' THEN huruf ELSE '#' END AS huruf, COUNT(*)::int AS jumlah
            FROM ${cfg.tabel} GROUP BY 1`
        );

        const peta = Object.fromEntries(hasil.rows.map((baris) => [baris.huruf, baris.jumlah]));
        return HURUF.map((huruf) => ({ huruf, jumlah: peta[huruf] || 0 }));
    }

    static async simpanDariSumber(cfg, kolomFk, nilaiFk, nilai, client = db) {
        const kolom = Object.keys(nilai);
        const set = kolom.map((k, i) => `${k} = $${i + 1}`).join(', ');
        const diubah = await client.query(
            `UPDATE ${cfg.tabel} SET ${set} WHERE ${kolomFk} = $${kolom.length + 1}`,
            [...kolom.map((k) => nilai[k]), nilaiFk]
        );

        if(diubah.rowCount > 0){
            return;
        }

        const semuaKolom = [...kolom, kolomFk];
        await client.query(
            `INSERT INTO ${cfg.tabel} (${semuaKolom.join(', ')})
            VALUES (${semuaKolom.map((_, i) => `$${i + 1}`).join(', ')})`,
            [...kolom.map((k) => nilai[k]), nilaiFk]
        );
    }

    static async hapusDariSumber(cfg, kolomFk, nilaiFk, client = db) {
        await client.query(`DELETE FROM ${cfg.tabel} WHERE ${kolomFk} = $1`, [nilaiFk]);
    }
}

module.exports = Klapper;