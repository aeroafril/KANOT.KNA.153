const db = require('../config/db');

const HARI_INI = "(NOW() AT TIME ZONE 'Asia/Jakarta')::date";
const AWAL_BULAN = `date_trunc('month', ${HARI_INI}::timestamp)::date`;
const KLIEN_UNIK = "COALESCE(nik_hash, 'id:' || id_buku_tamu::text)";

const KOLOM_LIST = 'id_buku_tamu, id_profil, nik, nama, tanggal, jam_masuk, jam_keluar, tujuan, kategori, status, catatan, dibuat_pada, diubah_pada';

const KOLOM_DETAIL = 'id_buku_tamu, id_profil, nik, nama, telepon, alamat, tujuan, kategori, status, tanggal, jam_masuk, jam_keluar, catatan, dibuat_pada, diubah_pada';

const KOLOM_UBAH = new Set([
    'nik',
    'nik_hash',
    'nama',
    'telepon',
    'alamat',
    'tujuan',
    'kategori',
    'status',
    'tanggal',
    'jam_masuk',
    'jam_keluar',
    'catatan'
]);

class BukuTamu{
    static async buat(data, client = db){
        const hasil = await client.query(
        `INSERT INTO buku_tamu
            (id_profil, nik, nik_hash, nama, telepon, alamat, tujuan, kategori, tanggal, jam_masuk, catatan)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8,
            COALESCE($9::date, ${HARI_INI}),
            COALESCE($10::time, (NOW() AT TIME ZONE 'Asia/Jakarta')::time(0)),
            $11)
        RETURNING ${KOLOM_DETAIL}`, [
            data.idProfil,
            data.nik,
            data.nikHash,
            data.nama,
            data.telepon,
            data.alamat,
            data.tujuan,
            data.kategori,
            data.tanggal,
            data.jamMasuk,
            data.catatan
        ]
        );
        return hasil.rows[0];
    }

    static async cariById(id, client = db){
        const hasil = await client.query(`SELECT ${KOLOM_DETAIL} FROM buku_tamu WHERE id_buku_tamu = $1 AND dihapus_pada IS NULL`, [id]);
        return hasil.rows[0] || null;
    }

    static async daftar({ q, status, kategori, dari, sampai, limit, offset }, client = db){
        const kondisi = ['dihapus_pada IS NULL'];
        const nilai = [];
        const tambah = (sql, isi) => {
        nilai.push(isi);
        kondisi.push(sql.replace('?', `$${nilai.length}`));
        };

        if(q) tambah('nama ILIKE ?', `%${db.escapeLike(q)}%`);
        if(status) tambah('status = ?', status);
        if(kategori) tambah('kategori = ?', kategori);
        if(dari) tambah('tanggal >= ?::date', dari);
        if(sampai) tambah('tanggal <= ?::date', sampai);

        const where = `WHERE ${kondisi.join(' AND ')}`;
        const total = await client.query(`SELECT COUNT(*)::int AS total FROM buku_tamu ${where}`, nilai);
        const data = await client.query(
        `SELECT ${KOLOM_LIST} FROM buku_tamu ${where}
        ORDER BY tanggal DESC, id_buku_tamu DESC
        LIMIT $${nilai.length + 1} OFFSET $${nilai.length + 2}`,
        [...nilai, limit, offset]
        );
        return {baris: data.rows, total: total.rows[0].total};
    }

    static async cariKlien({nikHash, nama}, client = db){
        const kondisi = nikHash ? 'nik_hash = $1' : "nama ILIKE $1 ESCAPE '\\'";
        const nilai = nikHash || `%${db.escapeLike(nama)}%`;
        const hasil = await client.query(
        `SELECT nik, nama, telepon, alamat FROM (
            SELECT DISTINCT ON (${KLIEN_UNIK}) id_buku_tamu, nik, nama, telepon, alamat
            FROM buku_tamu
            WHERE dihapus_pada IS NULL AND ${kondisi}
            ORDER BY ${KLIEN_UNIK}, id_buku_tamu DESC
        ) t
        ORDER BY id_buku_tamu DESC
        LIMIT 5`,
        [nilai]
        );
        return hasil.rows;
    }

    static async ubah(id, perubahan, client = db){
        const kolom = Object.keys(perubahan).filter((k) => KOLOM_UBAH.has(k));
        if(kolom.length === 0){
            return BukuTamu.cariById(id, client);
        }

        const set = kolom.map((k, i) => `${k} = $${i + 1}`).join(', ');
        const hasil = await client.query(
            `UPDATE buku_tamu SET ${set}
            WHERE id_buku_tamu = $${kolom.length + 1} AND dihapus_pada IS NULL
            RETURNING ${KOLOM_DETAIL}`,
            [...kolom.map((k) => perubahan[k]), id]
        );
        return hasil.rows[0] || null;
    }

    static async setJamKeluar(id, jam, client = db){
        const hasil = await client.query(
            `UPDATE buku_tamu
            SET jam_keluar = COALESCE($1::time, (NOW() AT TIME ZONE 'Asia/Jakarta')::time(0))
            WHERE id_buku_tamu = $2 AND dihapus_pada IS NULL
            RETURNING ${KOLOM_DETAIL}`,
            [jam, id]
        );
        return hasil.rows[0] || null;
    }

    static async hapus(id, client = db){
        const hasil = await client.query(
            `UPDATE buku_tamu SET dihapus_pada = NOW()
            WHERE id_buku_tamu = $1 AND dihapus_pada IS NULL
            RETURNING id_buku_tamu`,
            [id]
        );
        return hasil.rowCount > 0;
    }

    static async progresTerkait(id, client = db){
        const hasil = await client.query(
            `SELECT progres_id, jenis_layanan, tahap_saat_ini, status, persentase_progres, tanggal_target
            FROM progres_pekerjaan WHERE buku_tamu_id = $1 ORDER BY progres_id DESC`,
            [id]
        );
        return hasil.rows;
    }

    static async aktaTerkait(id, client = db){
        const hasil = await client.query(
            `SELECT akta_id, nomor_akta, tanggal_akta, sifat_akta
            FROM akta
            WHERE id_buku_tamu = $1 AND dihapus_pada IS NULL AND NOT nihil
            ORDER BY akta_id DESC`,
            [id]
        );
        return hasil.rows;
    }

    static async ringkasan(client = db){
        const bulanIni = `tanggal >= ${AWAL_BULAN} AND tanggal < (${AWAL_BULAN} + INTERVAL '1 month')`;
        const hasil = await client.query(
            `SELECT
                COUNT(DISTINCT ${KLIEN_UNIK})::int AS total_klien,
                COUNT(*)::int AS total_kunjungan,
                COUNT(DISTINCT ${KLIEN_UNIK}) FILTER (WHERE ${bulanIni})::int AS klien_bulan_ini,
                COUNT(*) FILTER (WHERE ${bulanIni})::int AS kunjungan_bulan_ini,
                COUNT(*) FILTER (WHERE tanggal = ${HARI_INI})::int AS kunjungan_hari_ini
            FROM buku_tamu WHERE dihapus_pada IS NULL`
        );
        return hasil.rows[0];
    }

    static async perBulan(client = db){
        const hasil = await client.query(
            `WITH bulan AS (
                SELECT generate_series(
                date_trunc('month', ${HARI_INI}::timestamp) - INTERVAL '11 months',
                date_trunc('month', ${HARI_INI}::timestamp),
                INTERVAL '1 month'
                )::date AS awal
            )
            SELECT to_char(b.awal, 'YYYY-MM') AS bulan,
                    COUNT(t.id_buku_tamu)::int AS kunjungan,
                    COUNT(DISTINCT COALESCE(t.nik_hash, 'id:' || t.id_buku_tamu::text))::int AS klien
            FROM bulan b
            LEFT JOIN buku_tamu t
                ON t.tanggal >= b.awal
                AND t.tanggal < (b.awal + INTERVAL '1 month')
                AND t.dihapus_pada IS NULL
            GROUP BY b.awal
            ORDER BY b.awal`
        );
        return hasil.rows;
    }

    static async terbaru(limit, idProfil = null, client = db){
        const hasil = await client.query(
            `SELECT ${KOLOM_LIST} FROM buku_tamu
            WHERE dihapus_pada IS NULL AND ($2::int IS NULL OR id_profil = $2)
            ORDER BY id_buku_tamu DESC LIMIT $1`,
            [limit, idProfil]
        );
        return hasil.rows;
    }

    static async hitungHariIni(idProfil, client = db){
        const hasil = await client.query(
            `SELECT COUNT(*)::int AS jumlah FROM buku_tamu
            WHERE dihapus_pada IS NULL AND tanggal = ${HARI_INI} AND id_profil = $1`,
            [idProfil]
        );
        return hasil.rows[0].jumlah;
    }
}

module.exports = BukuTamu;