const db = require('../config/db');

const HARI_INI = "(NOW() AT TIME ZONE 'Asia/Jakarta')::date";
const TERLAMBAT = `(p.tanggal_target IS NOT NULL AND p.tanggal_target < ${HARI_INI} AND p.status NOT IN ('Selesai', 'Dibatalkan'))`;

const SELECT_LENGKAP = `
    SELECT p.progres_id, p.buku_tamu_id, p.profil_id, p.nama_client, p.jenis_layanan,
            p.tahap_saat_ini, p.status, p.persentase_progres, p.tanggal_mulai, p.tanggal_target,
            p.tanggal_selesai, p.catatan, p.dibuat_pada, p.diubah_pada,
            pr.nama AS pic_nama, pr.inisial AS pic_inisial,
            ${TERLAMBAT} AS terlambat
    FROM progres_pekerjaan p
    LEFT JOIN profil pr ON pr.id_profil = p.profil_id`;

const KOLOM_UBAH = new Set([
    'nama_client',
    'tahap_saat_ini',
    'status',
    'persentase_progres',
    'catatan',
    'tanggal_target',
    'tanggal_selesai',
    'profil_id'
]);

class Progres {
    static async daftar({ status, profilId, q, terlambat, limit, offset }, client = db){
        const kondisi = [];
        const nilai = [];
        const tambah = (sql, isi) => {
            nilai.push(isi);
            kondisi.push(sql.replace('?', `$${nilai.length}`));
        };

        if(status === 'aktif') kondisi.push("p.status IN ('Diproses', 'Ditunda')");
        else if(status === 'selesai') kondisi.push("p.status = 'Selesai'");
        else if(status && status !== 'semua') tambah('p.status = ?', status);

        if(profilId) tambah('p.profil_id = ?', profilId);
        if(q){
            nilai.push(`%${db.escapeLike(q)}%`);
            kondisi.push(`(p.nama_client ILIKE $${nilai.length} OR p.jenis_layanan ILIKE $${nilai.length})`);
        }
        if(terlambat === true) kondisi.push(TERLAMBAT);
        if(terlambat === false) kondisi.push(`NOT ${TERLAMBAT}`);

        const where = kondisi.length > 0 ? `WHERE ${kondisi.join(' AND ')}` : '';
        const total = await client.query(`SELECT COUNT(*)::int AS total FROM progres_pekerjaan p ${where}`, nilai);
        const data = await client.query(`${SELECT_LENGKAP} ${where} ORDER BY p.progres_id DESC LIMIT $${nilai.length + 1} OFFSET $${nilai.length + 2}`, [...nilai, limit, offset]);
        return { baris: data.rows, total: total.rows[0].total };
    }

    static async cariById(id, client = db){
        const hasil = await client.query(`${SELECT_LENGKAP} WHERE p.progres_id = $1`, [id]);
        return hasil.rows[0] || null;
    }

    static async buat(data, client = db){
        const hasil = await client.query(
        `INSERT INTO progres_pekerjaan
            (buku_tamu_id, profil_id, nama_client, jenis_layanan, tahap_saat_ini,
            status, persentase_progres, tanggal_mulai, tanggal_target, catatan)
        VALUES ($1, $2, $3, $4, $5, 'Diproses', 0, ${HARI_INI}, $6, $7)
        RETURNING progres_id`,
        [
            data.bukuTamuId,
            data.profilId,
            data.namaClient,
            data.jenisLayanan,
            data.tahap,
            data.tanggalTarget,
            data.catatan
        ]
        );
        return Progres.cariById(hasil.rows[0].progres_id, client);
    }

    static async ubah(id, perubahan, client = db){
        const kolom = Object.keys(perubahan).filter((k) => KOLOM_UBAH.has(k));
        if (kolom.length > 0) {
        const set = kolom.map((k, i) => `${k} = $${i + 1}`).join(', ');
        await client.query(
            `UPDATE progres_pekerjaan SET ${set} WHERE progres_id = $${kolom.length + 1}`,
            [...kolom.map((k) => perubahan[k]), id]
        );
        }
        return Progres.cariById(id, client);
    }

    static async setPersen(id, persen, client = db){
        await client.query('UPDATE progres_pekerjaan SET persentase_progres = $1 WHERE progres_id = $2', [persen, id]);
    }

    static async tanggalHariIni(client = db){
        const hasil = await client.query(`SELECT ${HARI_INI}::text AS hari_ini`);
        return hasil.rows[0].hari_ini;
    }

    static async statistik(profilId = null, client = db){
        const hasil = await client.query(
            `SELECT
                COUNT(*) FILTER (WHERE p.status IN ('Diproses', 'Ditunda'))::int AS aktif,
                COUNT(*) FILTER (
                WHERE p.status = 'Selesai'
                    AND p.tanggal_selesai >= date_trunc('month', ${HARI_INI}::timestamp)::date
                )::int AS selesai_bulan_ini,
                COUNT(*) FILTER (WHERE ${TERLAMBAT})::int AS terlambat
            FROM progres_pekerjaan p
            WHERE ($1::int IS NULL OR p.profil_id = $1)`,
            [profilId]
        );
        return hasil.rows[0];
    }

    static async terdekatTarget(limit, client = db){
        const hasil = await client.query(
            `${SELECT_LENGKAP}
            WHERE p.status IN ('Diproses', 'Ditunda') AND p.tanggal_target IS NOT NULL
            ORDER BY p.tanggal_target ASC, p.progres_id ASC
            LIMIT $1`,
            [limit]
        );
        return hasil.rows;
    }
}

module.exports = Progres;