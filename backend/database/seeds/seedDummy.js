const env = require('../../config/env');
const db = require('../../config/db');
const {enkripsi, hashNik} = require('../../utils/crypto');

const PENANDA = 'DMY-';

const NAMA_DEPAN = [
    'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gunawan', 'Hendra', 'Indah', 'Joko',
    'Kartika', 'Lestari', 'Made', 'Nur', 'Oka', 'Putri', 'Rina', 'Siti', 'Teguh', 'Umar',
    'Vina', 'Wahyu', 'Yani', 'Zainal', 'Agus', 'Bambang', 'Dian', 'Endang', 'Farhan', 'Hasan',
    'Imam', 'Jaya', 'Kurnia', 'Lukman', 'Mawar', 'Nia', 'Prasetyo', 'Rudi', 'Sari', 'Tono',
    'Utami', 'Widya', 'Yusuf', 'Ratna', 'Surya', 'Taufik', 'Wulan', 'Bayu', 'Ayu', 'Rizky'
];

const NAMA_BELAKANG = [
    'Santoso', 'Wijaya', 'Pratama', 'Saputra', 'Hidayat', 'Kusuma', 'Nugroho', 'Setiawan',
    'Rahayu', 'Wibowo', 'Susanto', 'Hartono', 'Lestari', 'Purnomo', 'Firmansyah', 'Maulana',
    'Permana', 'Utomo', 'Sari', 'Handayani', 'Gunawan', 'Suryanto', 'Kurniawan', 'Aditya',
    'Ramadhan', 'Siregar', 'Nasution', 'Lubis', 'Hutapea', 'Simanjuntak', 'Wardhana', 'Anggraini',
    'Cahyono', 'Dharma', 'Effendi', 'Fauzi', 'Gumilang', 'Harahap', 'Irawan', 'Jatmiko'
];

const SIFAT = [
    'Pendirian PT', 'Pendirian CV', 'Jual Beli', 'Hibah', 'Sewa Menyewa', 'Kuasa',
    'Perubahan Anggaran Dasar', 'Pengakuan Hutang', 'Perjanjian Kredit', 'Pernyataan Keputusan Rapat'
];

const DOKUMEN = ['Sertifikat', 'Ijazah', 'KTP', 'Akta Kelahiran', 'Surat Kuasa', 'Perjanjian', 'Laporan Keuangan'];

const buatRng = (awal) => {
    let seed = awal;
    return () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const rng = buatRng(20260101);
const pilih = (daftar) => daftar[Math.floor(rng() * daftar.length)];
const namaAcak = () => `${pilih(NAMA_DEPAN)} ${pilih(NAMA_BELAKANG)}`;

const HARI_AWAL = Date.UTC(2020, 0, 1);
const JUMLAH_HARI = 2192;
const tanggalAcak = () => new Date(HARI_AWAL + Math.floor(rng() * JUMLAH_HARI) * 86400000).toISOString().slice(0, 10);

const BUKU = [
    {
        tabel: 'akta',
        nomor: 'nomor_akta',
        porsi: 0.4,
        kolom: [
            ['nomor_akta', 'text'],
            ['tanggal_akta', 'date'],
            ['sifat_akta', 'text'],
            ['nama_klien', 'text'],
            ['ringkasan', 'text'],
            ['status', 'text']
        ],
        baris: (nomor) => {
            const sifat = pilih(SIFAT);
            const nama = namaAcak();
            return [nomor, tanggalAcak(), sifat, nama, `${sifat} atas nama ${nama}`, 'Final'];
        }
    },
    {
        tabel: 'wasiat',
        nomor: 'nomor_akta',
        porsi: 0.15,
        kolom: [
            ['nomor_akta', 'text'],
            ['tanggal_akta', 'date'],
            ['nama_pewaris_penghadap', 'text'],
            ['nama_notaris', 'text'],
            ['status', 'text']
        ],
        baris: (nomor) => [nomor, tanggalAcak(), namaAcak(), 'Budi Santoso, S.H.', 'Final']
    },
    {
        tabel: 'surat_dibukukan',
        nomor: 'nomor_regist',
        porsi: 0.12,
        kolom: [
            ['nomor_regist', 'text'],
            ['tanggal', 'date'],
            ['para_pihak', 'text'],
            ['sifat', 'text']
        ],
        baris: (nomor) => [nomor, tanggalAcak(), `${namaAcak()} dan ${namaAcak()}`, pilih(SIFAT)]
    },
    {
        tabel: 'surat_disahkan',
        nomor: 'nomor_regist',
        porsi: 0.12,
        kolom: [
            ['nomor_regist', 'text'],
            ['tanggal', 'date'],
            ['para_pihak', 'text'],
            ['sifat', 'text']
        ],
        baris: (nomor) => [nomor, tanggalAcak(), namaAcak(), pilih(SIFAT)]
    },
    {
        tabel: 'protes',
        nomor: 'nomor_protes',
        porsi: 0.08,
        kolom: [
            ['nomor_protes', 'text'],
            ['tanggal_protes', 'date'],
            ['nama_debitur', 'text'],
            ['nama_kreditur', 'text'],
            ['nominal', 'numeric'],
            ['status', 'text']
        ],
        baris: (nomor) => [
        nomor,
        tanggalAcak(),
        namaAcak(),
        namaAcak(),
        (Math.floor(rng() * 5000) * 100000 + 1000000).toFixed(2),
        'Final'
        ]
    },
    {
        tabel: 'copie_collationne',
        nomor: 'nomor_regist',
        porsi: 0.13,
        kolom: [
            ['nomor_regist', 'text'],
            ['tanggal', 'date'],
            ['judul_dokumen', 'text'],
            ['nama_pemohon', 'text']
        ],
        baris: (nomor) => [nomor, tanggalAcak(), pilih(DOKUMEN), namaAcak()]
    }
];

const UKURAN_BATCH = 2000;

const sisipBuku = async (client, buku, jumlah, awalNomor) => {
    const tanggalKolom = buku.kolom.find(([, tipe]) => tipe === 'date')[0];
    const nama = buku.kolom.map(([k]) => k);
    const ekspresi = buku.kolom.map(([, tipe], i) => `$${i + 1}::${tipe}[]`).join(', ');
    const sql = `INSERT INTO ${buku.tabel} (${nama.join(', ')}, bulan, tahun)
                SELECT ${nama.map((k) => `u.${k}`).join(', ')},
                        EXTRACT(MONTH FROM u.${tanggalKolom})::int,
                        EXTRACT(YEAR FROM u.${tanggalKolom})::int
                FROM unnest(${ekspresi}) AS u(${nama.join(', ')})`;

    for (let mulai = 0; mulai < jumlah; mulai += UKURAN_BATCH) {
        const banyak = Math.min(UKURAN_BATCH, jumlah - mulai);
        const kolom = buku.kolom.map(() => []);
        for (let i = 0; i < banyak; i++) {
        const isi = buku.baris(`${PENANDA}${buku.tabel}-${awalNomor + mulai + i}`);
        isi.forEach((nilai, k) => kolom[k].push(nilai));
        }
        await client.query(sql, kolom);
    }
};

const sisipTamu = async (client, jumlah) => {
    for (let mulai = 0; mulai < jumlah; mulai += UKURAN_BATCH) {
        const banyak = Math.min(UKURAN_BATCH, jumlah - mulai);
        const kolom = { nik: [], hash: [], nama: [], telepon: [], alamat: [], tujuan: [], tanggal: [] };
        for (let i = 0; i < banyak; i++) {
            const nik = `35${String(Math.floor(rng() * 1e14)).padStart(14, '0')}`;
            kolom.nik.push(enkripsi(nik));
            kolom.hash.push(hashNik(nik));
            kolom.nama.push(`DMY ${namaAcak()}`);
            kolom.telepon.push(enkripsi(`08${String(Math.floor(rng() * 1e10)).padStart(10, '0')}`));
            kolom.alamat.push(enkripsi(`Jl. ${pilih(NAMA_BELAKANG)} No. ${Math.floor(rng() * 200) + 1}, Malang`));
            kolom.tujuan.push(pilih(SIFAT));
            kolom.tanggal.push(tanggalAcak());
        }
        await client.query(
            `INSERT INTO buku_tamu (nik, nik_hash, nama, telepon, alamat, tujuan, tanggal)
            SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::date[])`,
            [kolom.nik, kolom.hash, kolom.nama, kolom.telepon, kolom.alamat, kolom.tujuan, kolom.tanggal]
        );
    }
};

const hapusDummy = async (client) => {
    await client.query(
        `DELETE FROM klapper_akta WHERE akta_id IN (SELECT akta_id FROM akta WHERE nomor_akta LIKE $1)`,
        [`${PENANDA}%`]
    );
    await client.query(
        `DELETE FROM klapper_legalisasi WHERE id_surat_disahkan IN
        (SELECT id_surat_disahkan FROM surat_disahkan WHERE nomor_regist LIKE $1)`,
        [`${PENANDA}%`]
    );
    for (const buku of BUKU) {
        await client.query(`DELETE FROM ${buku.tabel} WHERE ${buku.nomor} LIKE $1`, [`${PENANDA}%`]);
    }
    await client.query("DELETE FROM buku_tamu WHERE nama LIKE 'DMY %'");
};

const isiKlapper = async (client) => {
    await client.query(
        `INSERT INTO klapper_akta (akta_id, nama_penghadap, sifat_akta, tanggal_akta, nomor_akta, nomor_reportorium)
        SELECT a.akta_id, a.nama_klien, a.sifat_akta, a.tanggal_akta, a.nomor_akta, a.nomor_akta || '/' || a.tahun
        FROM akta a
        WHERE a.nomor_akta LIKE $1
        AND NOT EXISTS (SELECT 1 FROM klapper_akta k WHERE k.akta_id = a.akta_id)`,
        [`${PENANDA}%`]
    );
    await client.query(
        `INSERT INTO klapper_legalisasi
        (id_surat_disahkan, nama_penghadap, sifat_legalisasi, tanggal_legalisasi, nomor_legalisasi)
        SELECT s.id_surat_disahkan, s.para_pihak, s.sifat, s.tanggal, s.nomor_regist
        FROM surat_disahkan s
        WHERE s.nomor_regist LIKE $1
        AND NOT EXISTS (SELECT 1 FROM klapper_legalisasi k WHERE k.id_surat_disahkan = s.id_surat_disahkan)`,
        [`${PENANDA}%`]
    );
};

const jalankan = async () => {
    const argumen = process.argv.slice(2);
    const mode = argumen.includes('--hapus') ? 'hapus' : 'isi';
    const paksa = argumen.includes('--paksa');
    const argJumlah = argumen.find((a) => a.startsWith('--jumlah='));
    const total = argJumlah ? Number(argJumlah.split('=')[1]) : 50000;
    const jumlahTamu = Math.min(5000, Math.round(total / 10));

    if (env.nodeEnv === 'production' && !paksa) {
        console.error('NODE_ENV=production: seed dummy ditolak. Tambahkan --paksa jika benar-benar yakin');
        process.exitCode = 1;
        return;
    }
    if (mode === 'isi' && (!Number.isInteger(total) || total < 1 || total > 1000000)) {
        console.error('--jumlah harus bilangan bulat antara 1 dan 1.000.000');
        process.exitCode = 1;
        return;
    }

    if (mode === 'hapus') {
        await db.transaction(hapusDummy);
        console.log('Semua data dummy dihapus');
        return;
    }

    const sudahAda = await db.query("SELECT COUNT(*)::int AS n FROM akta WHERE nomor_akta LIKE $1", [`${PENANDA}%`]);
    if (sudahAda.rows[0].n > 0) {
        console.error('Data dummy sudah ada. Jalankan dengan --hapus terlebih dahulu');
        process.exitCode = 1;
        return;
    }

    const mulai = Date.now();
    await db.transaction(async (client) => {
        for (const buku of BUKU) {
        await sisipBuku(client, buku, Math.round(total * buku.porsi), 1);
        }
        await isiKlapper(client);
        await sisipTamu(client, jumlahTamu);
    });

    for (const buku of BUKU) {
        await db.query(`ANALYZE ${buku.tabel}`);
    }
    await db.query('ANALYZE klapper_akta');
    await db.query('ANALYZE klapper_legalisasi');
    await db.query('ANALYZE buku_tamu');

    console.log(`Data dummy dibuat dalam ${((Date.now() - mulai) / 1000).toFixed(1)} detik:`);
    for (const buku of BUKU) {
        const hasil = await db.query(`SELECT COUNT(*)::int AS n FROM ${buku.tabel} WHERE ${buku.nomor} LIKE $1`, [`${PENANDA}%`]);
        console.log(`  ${buku.tabel}: ${hasil.rows[0].n}`);
    }
    console.log(`  buku_tamu: ${jumlahTamu}`);
    console.log('Hapus kembali dengan: npm run seed:dummy -- --hapus');
};

jalankan()
    .catch((err) => {
        console.error('Seed dummy gagal:', err.message);
        process.exitCode = 1;
    })
    .finally(() => db.pool.end());