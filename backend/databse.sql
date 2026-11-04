CREATE TABLE profil (
    id_profil SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    nama VARCHAR(150) NOT NULL,
    peran VARCHAR(50) NOT NULL,
    inisial VARCHAR(10),
    status VARCHAR(50) DEFAULT 'aktif',
    izin JSONB,
    dibuat_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buku_tamu (
    id_buku_tamu SERIAL PRIMARY KEY,
    id_profil INT REFERENCES profil(id_profil) ON DELETE SET NULL,
    nik TEXT,
    nama VARCHAR(150) NOT NULL,
    telepon VARCHAR(20),
    alamat VARCHAR(150),
    tujuan VARCHAR(150),
    kategori VARCHAR(150),
    status VARCHAR(150),
    tanggal DATE NOT NULL,
    jam_masuk TIME,
    jam_keluar TIME,
    catatan VARCHAR(150),
    dibuat_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE log_surat (
    id_log_surat SERIAL PRIMARY KEY,
    id_profil INT REFERENCES profil(id_profil) ON DELETE SET NULL,
    jenis_surat VARCHAR(50),
    nomor_surat VARCHAR(50) NOT NULL,
    tanggal_surat DATE NOT NULL,
    pengirim_penerima VARCHAR(150),
    subjek VARCHAR(150),
    keterangan VARCHAR(150),
    dibuat_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Progres Pekerjaan
CREATE TABLE progres_pekerjaan (
    progres_id SERIAL PRIMARY KEY,
    buku_tamu_id INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE CASCADE,
    profil_id INT REFERENCES profil(id_profil) ON DELETE SET NULL,
    nama_client VARCHAR(150),
    jenis_layanan VARCHAR(100),
    tahap_saat_ini VARCHAR(100),
    status VARCHAR(50),
    persentase_progres INT DEFAULT 0,
    tanggal_mulai DATE,
    tanggal_target DATE,
    tanggal_selesai DATE,
    catatan VARCHAR(255),
    dibuat_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE akta (
    akta_id SERIAL PRIMARY KEY,
    id_buku_tamu INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_akta VARCHAR(50) NOT NULL,
    tanggal_akta DATE NOT NULL,
    sifat_akta VARCHAR(150),
    nama_klien VARCHAR(150),
    ringkasan VARCHAR(255),
    status VARCHAR(50),
    bulan VARCHAR(20),
    tahun VARCHAR(20),
    nihil BOOLEAN DEFAULT FALSE,
    dibuat_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wasiat (
    wasiat_id SERIAL PRIMARY KEY,
    id_buku_tamu INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_akta VARCHAR(50),
    tanggal_akta DATE,
    nama_pewaris_penghadap VARCHAR(150),
    nama_notaris VARCHAR(150),
    tanggal_laporan DATE,
    status VARCHAR(50),
    bulan VARCHAR(20),
    tahun VARCHAR(20),
    nihil BOOLEAN DEFAULT FALSE,
    dibuat_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE surat_dibukukan (
    id_surat_dibukukan SERIAL PRIMARY KEY,
    id_buku_tamu INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_regist VARCHAR(50),
    tanggal DATE,
    para_pihak VARCHAR(150),
    sifat VARCHAR(150),
    nihil BOOLEAN DEFAULT FALSE,
    bulan VARCHAR(50),
    tahun VARCHAR(50),
    dibuat_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE surat_disahkan (
    id_surat_disahkan SERIAL PRIMARY KEY,
    id_buku_tamu INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_regist VARCHAR(50),
    tanggal DATE,
    para_pihak VARCHAR(150),
    sifat VARCHAR(150),
    nihil BOOLEAN DEFAULT FALSE,
    bulan VARCHAR(50),
    tahun VARCHAR(50),
    dibuat_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE protes (
    id_protes SERIAL PRIMARY KEY,
    id_buku_tamu INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_protes VARCHAR(50),
    tanggal_protes DATE,
    nama_debitur VARCHAR(150),
    nama_kreditur VARCHAR(150),
    nominal NUMERIC(15,2),
    nihil BOOLEAN DEFAULT FALSE,
    status VARCHAR(50),
    dibuat_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE copie_collationne (
    id_cc SERIAL PRIMARY KEY,
    id_buku_tamu INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_regist VARCHAR(50),
    tanggal DATE,
    judul_dokumen VARCHAR(150),
    nama_pemohon VARCHAR(150),
    nihil BOOLEAN DEFAULT FALSE,
    dibuat_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE klapper_akta (
    id_klapper_akta SERIAL PRIMARY KEY,
    id_buku_tamu INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nama_penghadap VARCHAR(150),
    sifat_akta VARCHAR(50),
    tanggal_akta DATE,
    nomor_akta VARCHAR(50),
    nomor_reportorium VARCHAR(150),
    dibuat_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE klapper_legalisasi (
    id_klapper_legalisasi SERIAL PRIMARY KEY,
    nama_penghadap VARCHAR(150),
    sifat_legalisasi VARCHAR(50),
    tanggal_legalisasi DATE,
    nomor_legalisasi VARCHAR(50),
    dibuat_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE regist_pt (
    id_regist_pt SERIAL PRIMARY KEY,
    id_buku_tamu INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_akta VARCHAR(50),
    tanggal_akta DATE,
    nama_pt VARCHAR(150),
    pendiri VARCHAR(150),
    modal NUMERIC(15,2),
    modal_disetor NUMERIC(15,2),
    sk_kemenkumham VARCHAR(100),
    status VARCHAR(50),
    nihil BOOLEAN DEFAULT FALSE,
    dibuat_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE regist_cv (
    id_regist_cv SERIAL PRIMARY KEY,
    id_buku_tamu INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_akta VARCHAR(50),
    tanggal_akta DATE,
    nama_cv VARCHAR(150),
    pendiri VARCHAR(150),
    modal NUMERIC(15,2),
    status VARCHAR(50),
    nihil BOOLEAN DEFAULT FALSE,
    dibuat_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE yayasan (
    id_yayasan SERIAL PRIMARY KEY,
    id_buku_tamu INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_akta VARCHAR(50),
    tanggal_akta DATE,
    nama_yayasan VARCHAR(150),
    pendiri VARCHAR(150),
    alamat VARCHAR(255),
    terdaftar_kemenkumham VARCHAR(50),
    legalisasi VARCHAR(20),
    tanggal_perubahan VARCHAR(20),
    keterangan VARCHAR(255),
    status VARCHAR(20),
    nihil BOOLEAN DEFAULT FALSE,
    dibuat_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE adopsi_anak (
    id_adopsi_anak SERIAL PRIMARY KEY,
    id_buku_tamu INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_akta VARCHAR(50),
    tanggal_akta DATE,
    nama_anak VARCHAR(150),
    orang_tua_angkat VARCHAR(150),
    orang_tua_kandung VARCHAR(150),
    penetapan_pengadilan VARCHAR(150),
    nihil BOOLEAN DEFAULT FALSE,
    dibuat_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    diubah_pada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);