const db = require('../config/db');

class StatusRekap {
  static async kunci(jenisBuku, bulan, tahun, client = db) {
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      `rekap:${jenisBuku}:${tahun}-${bulan}`
    ]);
  }

  static async cari(jenisBuku, bulan, tahun, client = db) {
    const hasil = await client.query(
      `SELECT sr.id_rekap, sr.jenis_buku, sr.bulan, sr.tahun, sr.status,
              sr.diverifikasi_pada, pr.nama AS diverifikasi_oleh
       FROM status_rekap sr
       LEFT JOIN profil pr ON pr.id_profil = sr.diverifikasi_oleh
       WHERE sr.jenis_buku = $1 AND sr.bulan = $2 AND sr.tahun = $3`,
      [jenisBuku, bulan, tahun]
    );
    return hasil.rows[0] || null;
  }

  static async tetapkan(jenisBuku, bulan, tahun, status, idProfil, client = db) {
    const terverifikasi = status === 'Terverifikasi';
    const hasil = await client.query(
      `INSERT INTO status_rekap (jenis_buku, bulan, tahun, status, diverifikasi_oleh, diverifikasi_pada)
       VALUES ($1, $2, $3, $4, $5, CASE WHEN $6::boolean THEN NOW() ELSE NULL END)
       ON CONFLICT (jenis_buku, bulan, tahun) DO UPDATE
         SET status = EXCLUDED.status,
             diverifikasi_oleh = EXCLUDED.diverifikasi_oleh,
             diverifikasi_pada = EXCLUDED.diverifikasi_pada
       RETURNING id_rekap, jenis_buku, bulan, tahun, status`,
      [jenisBuku, bulan, tahun, status, terverifikasi ? idProfil : null, terverifikasi]
    );
    return hasil.rows[0];
  }
}

module.exports = StatusRekap;