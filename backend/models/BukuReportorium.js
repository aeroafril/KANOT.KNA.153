const db = require('../config/db');

const urutNomor = (kolom) => `NULLIF(regexp_replace(${kolom}, '\\D', '', 'g'), '')::numeric`;

const KOLOM_TULIS_TAMBAHAN = ['bulan', 'tahun', 'nihil'];

class BukuReportorium {
    static async daftar(cfg, {q, bulan, tahun, tahunDari, tahunSampai, dari, sampai, nihil, limit, offset}, client = db){
        const kondisi = ['dihapus_pada IS NULL'];
        const nilai = [];
        const param = (isi, tipe) => {
            nilai.push(isi);
            return `$${nilai.length}::${tipe}`;
        };

        if (q) {
            const p = param(`%${db.escapeLike(q)}%`, 'text');
            kondisi.push(`(${cfg.cari.map((kolom) => `${kolom} ILIKE ${p}`).join(' OR ')})`);
        }
        if(bulan) kondisi.push(`bulan = ${param(bulan, 'int')}`);
        if(tahun) kondisi.push(`tahun = ${param(tahun, 'int')}`);
        if(tahunDari) kondisi.push(`tahun >= ${param(tahunDari, 'int')}`);
        if(tahunSampai) kondisi.push(`tahun <= ${param(tahunSampai, 'int')}`);
        if(dari) kondisi.push(`${cfg.tanggal} >= ${param(dari, 'date')}`);
        if(sampai) kondisi.push(`${cfg.tanggal} <= ${param(sampai, 'date')}`);
        if(nihil !== undefined) kondisi.push(`nihil = ${param(nihil, 'boolean')}`);

        const where = `WHERE ${kondisi.join(' AND ')}`;
        const total = await client.query(
            `SELECT COUNT(*)::int AS total FROM ${cfg.tabel} ${where}`,
            nilai
        );
        const data = await client.query(
            `SELECT * FROM ${cfg.tabel} ${where}
            ORDER BY tahun DESC, bulan DESC, ${cfg.tanggal} DESC NULLS LAST,
                        ${urutNomor(cfg.nomor)} DESC NULLS LAST, ${cfg.pk} DESC
            LIMIT $${nilai.length + 1} OFFSET $${nilai.length + 2}`,
            [...nilai, limit, offset]
        );
        return { baris: data.rows, total: total.rows[0].total };
    }

    static async cariById(cfg, id, client = db) {
        const hasil = await client.query(`SELECT * FROM ${cfg.tabel} WHERE ${cfg.pk} = $1 AND dihapus_pada IS NULL`, [id]);
        return hasil.rows[0] || null;
    }

    static async buat(cfg, data, client = db) {
        const kolom = Object.keys(data).filter(
        (k) => k in cfg.kolom || KOLOM_TULIS_TAMBAHAN.includes(k)
        );
        const hasil = await client.query(
            `INSERT INTO ${cfg.tabel} (${kolom.join(', ')})
            VALUES (${kolom.map((_, i) => `$${i + 1}`).join(', ')})
            RETURNING *`,
            kolom.map((k) => data[k])
        );
        return hasil.rows[0];
    }

    static async ubah(cfg, id, data, client = db) {
        const kolom = Object.keys(data).filter((k) => k in cfg.kolom || k === 'bulan' || k === 'tahun');
        if (kolom.length === 0) {
            return BukuReportorium.cariById(cfg, id, client);
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

    static async hapus(cfg, id, client = db) {
        const hasil = await client.query(
            `UPDATE ${cfg.tabel} SET dihapus_pada = NOW()
            WHERE ${cfg.pk} = $1 AND dihapus_pada IS NULL RETURNING ${cfg.pk}`,
            [id]
        );
        return hasil.rowCount > 0;
    }

    static async cariNihil(cfg, bulan, tahun, client = db) {
        const hasil = await client.query(
            `SELECT * FROM ${cfg.tabel}
            WHERE nihil AND dihapus_pada IS NULL AND bulan = $1 AND tahun = $2`,
            [bulan, tahun]
        );
        return hasil.rows[0] || null;
    }

    static async hitungData(cfg, bulan, tahun, client = db) {
        const hasil = await client.query(
            `SELECT COUNT(*)::int AS jumlah FROM ${cfg.tabel}
            WHERE NOT nihil AND dihapus_pada IS NULL AND bulan = $1 AND tahun = $2`,
            [bulan, tahun]
        );
        return hasil.rows[0].jumlah;
    }

    static async untukLaporan(cfg, bulan, tahun, client = db) {
        const hasil = await client.query(
            `SELECT * FROM ${cfg.tabel}
            WHERE dihapus_pada IS NULL AND bulan = $1 AND tahun = $2
            ORDER BY nihil DESC, ${cfg.tanggal} ASC NULLS LAST,
                        ${urutNomor(cfg.nomor)} ASC NULLS LAST, ${cfg.pk} ASC`,
            [bulan, tahun]
        );
        return hasil.rows;
    }

    static async cariLintasBuku(buku, {q, bulan, tahun, tahunDari, tahunSampai, dari, sampai, limit, offset }, client = db){
        if(buku.length === 0){
            return { baris: [], total: 0 };
        }

        const nilai = [];
        const param = (isi, tipe) => {
            nilai.push(isi);
            return `$${nilai.length}::${tipe}`;
        };

        const pQ = q ? param(`%${db.escapeLike(q)}%`, 'text') : null;
        const pBulan = bulan ? param(bulan, 'int') : null;
        const pTahun = tahun ? param(tahun, 'int') : null;
        const pDari = tahunDari ? param(tahunDari, 'int') : null;
        const pSampai = tahunSampai ? param(tahunSampai, 'int') : null;
        const pTglDari = dari ? param(dari, 'date') : null;
        const pTglSampai = sampai ? param(sampai, 'date') : null;

        const subquery = buku.map(({ slug, cfg, tipe }) => {
            const kolBulan = tipe === 'reportorium' ? 'bulan' : `EXTRACT(MONTH FROM ${cfg.tanggal})`;
            const kolTahun = tipe === 'reportorium' ? 'tahun' : `EXTRACT(YEAR FROM ${cfg.tanggal})`;
            const kondisi = ['dihapus_pada IS NULL', 'NOT nihil'];

            if(pQ) kondisi.push(`(${cfg.cari.map((kolom) => `${kolom} ILIKE ${pQ}`).join(' OR ')})`);
            if(pBulan) kondisi.push(`${kolBulan} = ${pBulan}`);
            if(pTahun) kondisi.push(`${kolTahun} = ${pTahun}`);
            if(pDari) kondisi.push(`${kolTahun} >= ${pDari}`);
            if(pSampai) kondisi.push(`${kolTahun} <= ${pSampai}`);
            if(pTglDari) kondisi.push(`${cfg.tanggal} >= ${pTglDari}`);
            if(pTglSampai) kondisi.push(`${cfg.tanggal} <= ${pTglSampai}`);

            return `SELECT '${slug}'::text AS jenis, ${cfg.pk} AS id, ${cfg.nomor}::text AS nomor,
                        ${cfg.tanggal} AS tanggal, ${cfg.judul}::text AS nama,
                        ${cfg.ringkas}::text AS ringkas
                    FROM ${cfg.tabel} WHERE ${kondisi.join(' AND ')}`;
        }).join(' UNION ALL ');

        const total = await client.query(`SELECT COUNT(*)::int AS total FROM (${subquery}) h`, nilai);
        const data = await client.query(
            `SELECT * FROM (${subquery}) h
            ORDER BY tanggal DESC NULLS LAST, jenis ASC, id DESC
            LIMIT $${nilai.length + 1} OFFSET $${nilai.length + 2}`,
            [...nilai, limit, offset]
        );
        return { baris: data.rows, total: total.rows[0].total };
    }

    static async hitungSemuaBuku(buku, client = db){
        const subquery = buku.map(({ slug, tabel, tipe }) => {
            let where = 'dihapus_pada IS NULL AND NOT nihil';
            if (tipe === 'klapper') where = 'TRUE';
            if (tipe === 'surat') where = 'dihapus_pada IS NULL';
            return `SELECT '${slug}'::text AS jenis, COUNT(*)::int AS total FROM ${tabel} WHERE ${where}`;
        }).join(' UNION ALL ');
        
        const hasil = await client.query(subquery);
        return Object.fromEntries(hasil.rows.map((baris) => [baris.jenis, baris.total]));
    }
}

module.exports = BukuReportorium;