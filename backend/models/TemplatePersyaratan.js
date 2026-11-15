const db = require('../config/db');

class TemplatePersyaratan{
    static async daftarTemplate({jenisLayanan, aktif} = {}, client = db){
        const kondisi = [];
        const nilai = [];
        if(jenisLayanan){
            nilai.push(jenisLayanan);
            kondisi.push(`LOWER(jenis_layanan) = LOWER($${nilai.length})`);
        }

        if(aktif !== undefined){
            nilai.push(aktif);
            kondisi.push(`aktif = $${nilai.length}`);
        }

        const where = kondisi.length > 0 ? `WHERE ${kondisi.join(' AND ')}` : '';
        const hasil = await client.query(
            `SELECT id_template, jenis_layanan, nama_syarat, urutan, aktif
            FROM template_persyaratan ${where}
            ORDER BY jenis_layanan, urutan, id_template`,
            nilai
        );
        return hasil.rows;
    }

    static async cariTemplate(id, client = db){
        const hasil = await client.query(
            `SELECT id_template, jenis_layanan, nama_syarat, urutan, aktif
            FROM template_persyaratan WHERE id_template = $1`,
            [id]
        );
        return hasil.rows[0] || null;
    }

    static async buatTemplate({ jenisLayanan, namaSyarat, urutan }, client = db){
        const hasil = await client.query(
            `INSERT INTO template_persyaratan (jenis_layanan, nama_syarat, urutan)
            VALUES ($1, $2, COALESCE($3::int, 0))
            RETURNING id_template, jenis_layanan, nama_syarat, urutan, aktif`,
            [jenisLayanan, namaSyarat, urutan ?? null]
        );
        return hasil.rows[0];
    }

    static async ubahTemplate(id, perubahan, client = db){
        const peta = {
            jenis_layanan: 'jenis_layanan',
            nama_syarat: 'nama_syarat',
            urutan: 'urutan',
            aktif: 'aktif'
        };
        const kolom = Object.keys(perubahan).filter((k) => peta[k]);
        if (kolom.length === 0) {
            return TemplatePersyaratan.cariTemplate(id, client);
        }
        const set = kolom.map((k, i) => `${peta[k]} = $${i + 1}`).join(', ');
        const hasil = await client.query(
            `UPDATE template_persyaratan SET ${set} WHERE id_template = $${kolom.length + 1}
            RETURNING id_template, jenis_layanan, nama_syarat, urutan, aktif`,
            [...kolom.map((k) => perubahan[k]), id]
        );
        return hasil.rows[0] || null;
    }

    static async hapusTemplate(id, client = db){
        const hasil = await client.query('DELETE FROM template_persyaratan WHERE id_template = $1', [id]);
        return hasil.rowCount > 0;
    }

    static async daftarJenisLayanan(client = db){
        const hasil = await client.query(
            `SELECT jenis_layanan FROM (
                SELECT DISTINCT ON (LOWER(jenis_layanan)) jenis_layanan
                FROM (
                SELECT jenis_layanan FROM template_persyaratan WHERE aktif
                UNION ALL
                SELECT jenis_layanan FROM progres_pekerjaan
                ) semua
                ORDER BY LOWER(jenis_layanan), jenis_layanan
            ) unik
            ORDER BY LOWER(jenis_layanan)`
        );
        return hasil.rows.map((baris) => baris.jenis_layanan);
    }

    static async buatChecklistDariTemplate(progresId, jenisLayanan, client = db){
        const hasil = await client.query(
            `INSERT INTO checklist_progres (progres_id, nama_syarat)
            SELECT $1, nama_syarat FROM template_persyaratan
            WHERE aktif AND LOWER(jenis_layanan) = LOWER($2)
            ORDER BY urutan, id_template`,
            [progresId, jenisLayanan]
        );
        return hasil.rowCount;
    }

    static async daftarChecklist(progresId, client = db){
        const hasil = await client.query(
            `SELECT c.id_checklist, c.nama_syarat, c.terpenuhi, c.diperbarui_pada,
                    pr.nama AS diperbarui_oleh
            FROM checklist_progres c
            LEFT JOIN profil pr ON pr.id_profil = c.diperbarui_oleh
            WHERE c.progres_id = $1
            ORDER BY c.id_checklist`,
            [progresId]
        );
        return hasil.rows;
    }

    static async cariItem(progresId, itemId, client = db){
        const hasil = await client.query(
            `SELECT id_checklist, progres_id, nama_syarat, terpenuhi
            FROM checklist_progres WHERE id_checklist = $1 AND progres_id = $2`,
            [itemId, progresId]
        );
        return hasil.rows[0] || null;
    }

    static async tambahItem(progresId, namaSyarat, client = db){
        const hasil = await client.query(
            `INSERT INTO checklist_progres (progres_id, nama_syarat) VALUES ($1, $2)
            RETURNING id_checklist, progres_id, nama_syarat, terpenuhi`,
            [progresId, namaSyarat]
        );
        return hasil.rows[0];
    }

    static async setTerpenuhi(itemId, terpenuhi, idProfil, client = db){
        const hasil = await client.query(
            `UPDATE checklist_progres
            SET terpenuhi = $1, diperbarui_oleh = $2, diperbarui_pada = NOW()
            WHERE id_checklist = $3
            RETURNING id_checklist, progres_id, nama_syarat, terpenuhi`,
            [terpenuhi, idProfil, itemId]
        );
        return hasil.rows[0] || null;
    }

    static async hapusItem(itemId, client = db){
        const hasil = await client.query('DELETE FROM checklist_progres WHERE id_checklist = $1', [itemId]);
        return hasil.rowCount > 0;
    }

    static async ringkasan(progresId, client = db){
        const hasil = await client.query(
            `SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE terpenuhi)::int AS terpenuhi
            FROM checklist_progres WHERE progres_id = $1`,
            [progresId]
        );
        return hasil.rows[0];
    }
}

module.exports = TemplatePersyaratan;