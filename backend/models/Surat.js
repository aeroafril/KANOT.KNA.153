const db = require('../config/db');

const SELECT_SURAT = `
    SELECT s.id_log_surat, s.id_profil, s.jenis_surat, s.nomor_surat, s.tanggal_surat,
            s.pengirim_penerima, s.subjek, s.keterangan, s.dibuat_pada, s.diubah_pada,
            pr.nama AS pencatat
    FROM log_surat s
    LEFT JOIN profil pr ON pr.id_profil = s.id_profil`;

const KOLOM_UBAH = new Set([
    'jenis_surat',
    'nomor_surat',
    'tanggal_surat',
    'pengirim_penerima',
    'subjek',
    'keterangan'
]);

class Surat{
    static async daftar({jenisSurat, q, dari, sampai, limit, offset}, client = db){
        const kondisi = ['s.dihapus_pada IS NULL'];
        const nilai = [];
        const tambah = (sql, isi) => {
            nilai.push(isi);
            kondisi.push(sql.replace(/\?/g, `$${nilai.length}`));
        };

        if(jenisSurat) tambah('s.jenis_surat = ?', jenisSurat);
        if(q){
            tambah(
                '(s.nomor_surat ILIKE ? OR s.subjek ILIKE ? OR s.pengirim_penerima ILIKE ?)',
                `%${db.escapeLike(q)}%`
            );
        }
        if(dari) tambah('s.tanggal_surat >= ?::date', dari);
        if(sampai) tambah('s.tanggal_surat <= ?::date', sampai);

        const where = `WHERE ${kondisi.join(' AND ')}`;
        const total = await client.query(`SELECT COUNT(*)::int AS total FROM log_surat s ${where}`, nilai);
        const data = await client.query(
            `${SELECT_SURAT} ${where}
            ORDER BY s.tanggal_surat DESC, s.id_log_surat DESC
            LIMIT $${nilai.length + 1} OFFSET $${nilai.length + 2}`,
            [...nilai, limit, offset]
        );
        return { baris: data.rows, total: total.rows[0].total };
    }

    static async cariById(id, client = db){
        const hasil = await client.query(`${SELECT_SURAT} WHERE s.id_log_surat = $1 AND s.dihapus_pada IS NULL`, [id]);
        return hasil.rows[0] || null;
    }

    static async buat(data, client = db){
        const hasil = await client.query(
            `INSERT INTO log_surat
                (id_profil, jenis_surat, nomor_surat, tanggal_surat, pengirim_penerima, subjek, keterangan)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id_log_surat`,
            [
                data.idProfil,
                data.jenisSurat,
                data.nomorSurat,
                data.tanggalSurat,
                data.pengirimPenerima,
                data.subjek,
                data.keterangan
            ]
        );
        return Surat.cariById(hasil.rows[0].id_log_surat, client);
    }

    static async ubah(id, perubahan, client = db){
        const kolom = Object.keys(perubahan).filter((k) => KOLOM_UBAH.has(k));
        if (kolom.length > 0) {
            const set = kolom.map((k, i) => `${k} = $${i + 1}`).join(', ');
            await client.query(
                `UPDATE log_surat SET ${set} WHERE id_log_surat = $${kolom.length + 1} AND dihapus_pada IS NULL`,
                [...kolom.map((k) => perubahan[k]), id]
            );
        }
        return Surat.cariById(id, client);
    }

    static async hapus(id, client = db){
        const hasil = await client.query(
            `UPDATE log_surat SET dihapus_pada = NOW()
            WHERE id_log_surat = $1 AND dihapus_pada IS NULL RETURNING id_log_surat`,
            [id]
        );
        return hasil.rowCount > 0;
    }
}

module.exports = Surat;