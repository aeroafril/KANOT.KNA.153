const db = require('../config/db');

class Registrasi{
    static async daftar(cfg, {q, tahun, status, limit, offset}, client = db){
        const kondisi = ['dihapus_pada IS NULL'];
        const nilai = [];

        if(q){
            nilai.push(`%${db.escapeLike(q)}%`);
            const parameter = `$${nilai.length}`;
            kondisi.push(`(${cfg.cari.map((kolom) => `${kolom} ILIKE ${parameter}`).join(' OR ')})`);
        }

        if(tahun){
            nilai.push(tahun);
            kondisi.push(`EXTRACT(YEAR FROM tanggal_akta) = $${nilai.length}`);
        }

        if(status && cfg.kolom.status){
            nilai.push(status);
            kondisi.push(`status = $${nilai.length}`);
        }

        const where = `WHERE ${kondisi.join(' AND ')}`;
        const total = await client.query(`SELECT COUNT(*)::int AS total FROM ${cfg.tabel} ${where}`, nilai);

        const data = await client.query(
            `SELECT * FROM ${cfg.tabel} ${where}
            ORDER BY ${cfg.pk} DESC
            LIMIT $${nilai.length + 1} OFFSET $${nilai.length + 2}`,
            [...nilai, limit, offset]
        );
        return { baris: data.rows, total: total.rows[0].total };
    }

    static async cariById(cfg, id, client = db){
        const hasil = await client.query(
        `SELECT * FROM ${cfg.tabel} WHERE ${cfg.pk} = $1 AND dihapus_pada IS NULL`,
        [id]
        );
        return hasil.rows[0] || null;
    }

    static async buat(cfg, data, client = db){
        const kolom = Object.keys(data).filter((k) => k in cfg.kolom);
        const hasil = await client.query(
            `INSERT INTO ${cfg.tabel} (${kolom.join(', ')})
            VALUES (${kolom.map((_, i) => `$${i + 1}`).join(', ')})
            RETURNING *`,
            kolom.map((k) => data[k])
        );
        return hasil.rows[0];
    }

    static async ubah(cfg, id, data, client = db){
        const kolom = Object.keys(data).filter((k) => k in cfg.kolom);

        if (kolom.length === 0) {
        return Registrasi.cariById(cfg, id, client);
        }

        const set = kolom.map((k, i) => `${k} = $${i + 1}`).join(', ');
        const hasil = await client.query(
            `UPDATE ${cfg.tabel} SET ${set}
            WHERE ${cfg.pk} = $${kolom.length + 1} AND dihapus_pada IS NULL
            RETURNING *`,
            [...kolom.map((k) => data[k]), id]
        );
        return hasil.rows[0] || null;
    }

    static async hapus(cfg, id, client = db){
        const hasil = await client.query(
            `UPDATE ${cfg.tabel} SET dihapus_pada = NOW()
            WHERE ${cfg.pk} = $1 AND dihapus_pada IS NULL RETURNING ${cfg.pk}`,
            [id]
        );
        return hasil.rowCount > 0;
    }
}

module.exports = Registrasi;