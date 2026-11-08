const db = require('../config/db');

class RiwayatAktivitas{
    static async tambah({idProfil, namaPengguna, aksi, tabel, idRecord, dataLama, dataBaru, ip}, client = db){
        const hasil = await client.query(`INSERT INTO riwayat_aktivitas (id_profil, nama_pengguna, aksi, tabel, id_record, data_lama, data_baru, ip_address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id_riwayat`, [
                idProfil ?? null,
                namaPengguna ?? null,
                aksi,
                tabel ?? null,
                idRecord ?? null,
                dataLama ? JSON.stringify(dataLama) : null,
                dataBaru ? JSON.stringify(dataBaru) : null,
                ip ?? null
            ]
        );
        return hasil.rows[0];
    }

    static async cari({idProfil, aksi, tabel, dari, sampai, limit = 20, offset = 0}, client = db){
        const kondisi = [];
        const nilai = [];

        if(idProfil){
            nilai.push(idProfil);
            kondisi.push(`id_profil = $${nilai.length}`);
        }

        if(aksi){
            nilai.push(aksi);
            kondisi.push(`aksi = $${nilai.length}`);
        }

        if(tabel){
            nilai.push(tabel);
            kondisi.push(`tabel = $${nilai.length}`);
        }

        if(dari){
            nilai.push(dari);
            kondisi.push(`waktu >= ($${nilai.length}::date::timestamp AT TIME ZONE 'Asia/Jakarta')`);
        }

        if(sampai){
            nilai.push(sampai);
            kondisi.push(`waktu < (($${nilai.length}::date + 1)::timestamp AT TIME ZONE 'Asia/Jakarta')`);
        }

        const where = kondisi.length > 0 ? `WHERE ${kondisi.join(' AND ')}` : '';

        const total = await client.query(`SELECT COUNT(*)::int AS total FROM riwayat_aktivitas ${where}`, nilai);

        const data = await client.query(`SELECT * FROM riwayat_aktivitas ${where} ORDER BY waktu DESC, id_riwayat DESC LIMIT $${nilai.length + 1} OFFSET $${nilai.length + 2}`, [...nilai, limit, offset]);

        return {
            baris: data.rows,
            total: total.rows[0].total
        };
    }
}

module.exports = RiwayatAktivitas;