CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE profil (
    id_profil       SERIAL PRIMARY KEY,
    username        VARCHAR(50)  UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    nama            VARCHAR(150) NOT NULL,
    peran           VARCHAR(50)  NOT NULL CHECK (peran IN ('Notaris','Staf')),
    inisial         VARCHAR(10),
    status          VARCHAR(50)  NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif','nonaktif')),
    izin            JSONB        NOT NULL DEFAULT '{}'::jsonb,
    terakhir_aktif  TIMESTAMPTZ,
    dibuat_pada     TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada     TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buku_tamu (
    id_buku_tamu  SERIAL PRIMARY KEY,
    id_profil     INT REFERENCES profil(id_profil) ON DELETE SET NULL,
    nik           TEXT,
    nik_hash      CHAR(64),
    nama          VARCHAR(150) NOT NULL,
    telepon       TEXT,
    alamat        TEXT,
    tujuan        VARCHAR(150),
    kategori      VARCHAR(150),
    status        VARCHAR(150) DEFAULT 'Proses',
    tanggal       DATE NOT NULL DEFAULT CURRENT_DATE,
    jam_masuk     TIME,
    jam_keluar    TIME,
    catatan       VARCHAR(150),
    dibuat_pada   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE log_surat (
    id_log_surat       SERIAL PRIMARY KEY,
    id_profil          INT REFERENCES profil(id_profil) ON DELETE SET NULL,
    jenis_surat        VARCHAR(50) NOT NULL CHECK (jenis_surat IN ('masuk','keluar')),
    nomor_surat        VARCHAR(50) NOT NULL,
    tanggal_surat      DATE NOT NULL,
    pengirim_penerima  VARCHAR(150),
    subjek             VARCHAR(150),
    keterangan         VARCHAR(150),
    dibuat_pada        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE progres_pekerjaan (
    progres_id          SERIAL PRIMARY KEY,
    buku_tamu_id        INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    profil_id           INT REFERENCES profil(id_profil) ON DELETE SET NULL,
    nama_client         VARCHAR(150) NOT NULL,
    jenis_layanan       VARCHAR(100) NOT NULL,
    tahap_saat_ini      VARCHAR(100),
    status              VARCHAR(50) NOT NULL DEFAULT 'Diproses',
    persentase_progres  INT NOT NULL DEFAULT 0 CHECK (persentase_progres BETWEEN 0 AND 100),
    tanggal_mulai       DATE,
    tanggal_target      DATE,
    tanggal_selesai     DATE,
    catatan             VARCHAR(255),
    dibuat_pada         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE template_persyaratan (
    id_template    SERIAL PRIMARY KEY,
    jenis_layanan  VARCHAR(100) NOT NULL,
    nama_syarat    VARCHAR(150) NOT NULL,
    urutan         INT NOT NULL DEFAULT 0,
    aktif          BOOLEAN NOT NULL DEFAULT TRUE,
    dibuat_pada    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checklist_progres (
    id_checklist     SERIAL PRIMARY KEY,
    progres_id       INT NOT NULL REFERENCES progres_pekerjaan(progres_id) ON DELETE CASCADE,
    nama_syarat      VARCHAR(150) NOT NULL,
    terpenuhi        BOOLEAN NOT NULL DEFAULT FALSE,
    diperbarui_oleh  INT REFERENCES profil(id_profil) ON DELETE SET NULL,
    diperbarui_pada  TIMESTAMPTZ
);

CREATE TABLE akta (
    akta_id       SERIAL PRIMARY KEY,
    id_buku_tamu  INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_akta    VARCHAR(50),
    tanggal_akta  DATE,
    sifat_akta    VARCHAR(150),
    nama_klien    VARCHAR(150),
    ringkasan     VARCHAR(255),
    status        VARCHAR(50) DEFAULT 'Draft',
    bulan         SMALLINT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    tahun         SMALLINT NOT NULL,
    nihil         BOOLEAN NOT NULL DEFAULT FALSE,
    dibuat_pada   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_akta_isi CHECK (nihil OR (nomor_akta IS NOT NULL AND tanggal_akta IS NOT NULL))
);

CREATE TABLE wasiat (
    wasiat_id               SERIAL PRIMARY KEY,
    id_buku_tamu            INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_akta              VARCHAR(50),
    tanggal_akta            DATE,
    nama_pewaris_penghadap  VARCHAR(150),
    nama_notaris            VARCHAR(150),
    tanggal_laporan         DATE,
    status                  VARCHAR(50),
    bulan                   SMALLINT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    tahun                   SMALLINT NOT NULL,
    nihil                   BOOLEAN NOT NULL DEFAULT FALSE,
    dibuat_pada             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_wasiat_isi CHECK (nihil OR nomor_akta IS NOT NULL)
);

CREATE TABLE surat_dibukukan (
    id_surat_dibukukan  SERIAL PRIMARY KEY,
    id_buku_tamu        INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_regist        VARCHAR(50),
    tanggal             DATE,
    para_pihak          VARCHAR(150),
    sifat               VARCHAR(150),
    nihil               BOOLEAN NOT NULL DEFAULT FALSE,
    bulan               SMALLINT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    tahun               SMALLINT NOT NULL,
    dibuat_pada         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_surat_dibukukan_isi CHECK (nihil OR nomor_regist IS NOT NULL)
);

CREATE TABLE surat_disahkan (
    id_surat_disahkan  SERIAL PRIMARY KEY,
    id_buku_tamu       INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_regist       VARCHAR(50),
    tanggal            DATE,
    para_pihak         VARCHAR(150),
    sifat              VARCHAR(150),
    nihil              BOOLEAN NOT NULL DEFAULT FALSE,
    bulan              SMALLINT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    tahun              SMALLINT NOT NULL,
    dibuat_pada        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_surat_disahkan_isi CHECK (nihil OR nomor_regist IS NOT NULL)
);

CREATE TABLE protes (
    id_protes       SERIAL PRIMARY KEY,
    id_buku_tamu    INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_protes    VARCHAR(50),
    tanggal_protes  DATE,
    nama_debitur    VARCHAR(150),
    nama_kreditur   VARCHAR(150),
    nominal         NUMERIC(15,2),
    nihil           BOOLEAN NOT NULL DEFAULT FALSE,
    status          VARCHAR(50),
    bulan           SMALLINT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    tahun           SMALLINT NOT NULL,
    dibuat_pada     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_protes_isi CHECK (nihil OR nomor_protes IS NOT NULL)
);

CREATE TABLE copie_collationne (
    id_cc          SERIAL PRIMARY KEY,
    id_buku_tamu   INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_regist   VARCHAR(50),
    tanggal        DATE,
    judul_dokumen  VARCHAR(150),
    nama_pemohon   VARCHAR(150),
    nihil          BOOLEAN NOT NULL DEFAULT FALSE,
    bulan          SMALLINT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    tahun          SMALLINT NOT NULL,
    dibuat_pada    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_cc_isi CHECK (nihil OR nomor_regist IS NOT NULL)
);

CREATE TABLE klapper_akta (
    id_klapper_akta    SERIAL PRIMARY KEY,
    akta_id            INT REFERENCES akta(akta_id) ON DELETE CASCADE,
    id_buku_tamu       INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nama_penghadap     VARCHAR(150),
    sifat_akta         VARCHAR(50),
    tanggal_akta       DATE,
    nomor_akta         VARCHAR(50),
    nomor_reportorium  VARCHAR(150),
    huruf              CHAR(1) GENERATED ALWAYS AS (UPPER(LEFT(nama_penghadap, 1))) STORED,
    dibuat_pada        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE klapper_legalisasi (
    id_klapper_legalisasi  SERIAL PRIMARY KEY,
    id_surat_disahkan      INT REFERENCES surat_disahkan(id_surat_disahkan) ON DELETE CASCADE,
    nama_penghadap         VARCHAR(150),
    sifat_legalisasi       VARCHAR(50),
    tanggal_legalisasi     DATE,
    nomor_legalisasi       VARCHAR(50),
    huruf                  CHAR(1) GENERATED ALWAYS AS (UPPER(LEFT(nama_penghadap, 1))) STORED,
    dibuat_pada            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE regist_pt (
    id_regist_pt    SERIAL PRIMARY KEY,
    id_buku_tamu    INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_akta      VARCHAR(50),
    tanggal_akta    DATE,
    nama_pt         VARCHAR(150),
    pendiri         VARCHAR(150),
    modal           NUMERIC(15,2),
    modal_disetor   NUMERIC(15,2),
    sk_kemenkumham  VARCHAR(100),
    status          VARCHAR(50),
    nihil           BOOLEAN NOT NULL DEFAULT FALSE,
    dibuat_pada     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE regist_cv (
    id_regist_cv  SERIAL PRIMARY KEY,
    id_buku_tamu  INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_akta    VARCHAR(50),
    tanggal_akta  DATE,
    nama_cv       VARCHAR(150),
    pendiri       VARCHAR(150),
    modal         NUMERIC(15,2),
    status        VARCHAR(50),
    nihil         BOOLEAN NOT NULL DEFAULT FALSE,
    dibuat_pada   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE yayasan (
    id_yayasan             SERIAL PRIMARY KEY,
    id_buku_tamu           INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_akta             VARCHAR(50),
    tanggal_akta           DATE,
    nama_yayasan           VARCHAR(150),
    pendiri                VARCHAR(150),
    alamat                 VARCHAR(255),
    terdaftar_kemenkumham  VARCHAR(50),
    legalisasi             VARCHAR(20),
    tanggal_perubahan      VARCHAR(20),
    keterangan             VARCHAR(255),
    status                 VARCHAR(20),
    nihil                  BOOLEAN NOT NULL DEFAULT FALSE,
    dibuat_pada            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE adopsi_anak (
    id_adopsi_anak        SERIAL PRIMARY KEY,
    id_buku_tamu          INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_akta            VARCHAR(50),
    tanggal_akta          DATE,
    nama_anak             VARCHAR(150),
    orang_tua_angkat      VARCHAR(150),
    orang_tua_kandung     VARCHAR(150),
    penetapan_pengadilan  VARCHAR(150),
    nihil                 BOOLEAN NOT NULL DEFAULT FALSE,
    dibuat_pada           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hibah (
    id_hibah        SERIAL PRIMARY KEY,
    id_buku_tamu    INT REFERENCES buku_tamu(id_buku_tamu) ON DELETE SET NULL,
    nomor_akta      VARCHAR(50),
    tanggal_akta    DATE,
    pemberi_hibah   VARCHAR(150),
    penerima_hibah  VARCHAR(150),
    objek_hibah     VARCHAR(255),
    keterangan      VARCHAR(255),
    status          VARCHAR(50),
    nihil           BOOLEAN NOT NULL DEFAULT FALSE,
    dibuat_pada     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE status_rekap (
    id_rekap           SERIAL PRIMARY KEY,
    jenis_buku         VARCHAR(50) NOT NULL
                       CHECK (jenis_buku IN ('akta','wasiat','surat_dibukukan','surat_disahkan','protes','copie_collationne')),
    bulan              SMALLINT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    tahun              SMALLINT NOT NULL,
    status             VARCHAR(30) NOT NULL DEFAULT 'Belum Terverifikasi'
                       CHECK (status IN ('Belum Terverifikasi','Terverifikasi')),
    diverifikasi_oleh  INT REFERENCES profil(id_profil) ON DELETE SET NULL,
    diverifikasi_pada  TIMESTAMPTZ,
    dibuat_pada        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diubah_pada        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (jenis_buku, bulan, tahun)
);

CREATE TABLE riwayat_aktivitas (
    id_riwayat     BIGSERIAL PRIMARY KEY,
    id_profil      INT REFERENCES profil(id_profil),
    nama_pengguna  VARCHAR(150),
    aksi           VARCHAR(30) NOT NULL,
    tabel          VARCHAR(50),
    id_record      INT,
    data_lama      JSONB,
    data_baru      JSONB,
    ip_address     VARCHAR(45),
    waktu          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE FUNCTION tolak_ubah_riwayat() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'riwayat_aktivitas bersifat append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_riwayat_append_only
    BEFORE UPDATE OR DELETE ON riwayat_aktivitas
    FOR EACH ROW EXECUTE FUNCTION tolak_ubah_riwayat();

DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'buku_tamu','log_surat',
        'akta','wasiat','surat_dibukukan','surat_disahkan','protes','copie_collationne',
        'regist_pt','regist_cv','yayasan','adopsi_anak','hibah'
    ] LOOP
        EXECUTE format('ALTER TABLE %I ADD COLUMN dihapus_pada TIMESTAMPTZ', t);
    END LOOP;
END $$;

CREATE FUNCTION set_diubah_pada() RETURNS trigger AS $$
BEGIN
    NEW.diubah_pada = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE table_schema = 'public' AND column_name = 'diubah_pada'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_diubah BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION set_diubah_pada()', t, t);
    END LOOP;
END $$;

CREATE INDEX idx_buku_tamu_nik_hash  ON buku_tamu (nik_hash);
CREATE INDEX idx_buku_tamu_tanggal   ON buku_tamu (tanggal DESC);
CREATE INDEX idx_buku_tamu_nama_trgm ON buku_tamu USING gin (nama gin_trgm_ops);

CREATE INDEX idx_log_surat_jenis_tgl ON log_surat (jenis_surat, tanggal_surat DESC);
CREATE INDEX idx_progres_status      ON progres_pekerjaan (status);
CREATE INDEX idx_progres_profil      ON progres_pekerjaan (profil_id);
CREATE INDEX idx_checklist_progres   ON checklist_progres (progres_id);

CREATE INDEX idx_akta_periode              ON akta (tahun, bulan);
CREATE INDEX idx_wasiat_periode            ON wasiat (tahun, bulan);
CREATE INDEX idx_surat_dibukukan_periode   ON surat_dibukukan (tahun, bulan);
CREATE INDEX idx_surat_disahkan_periode    ON surat_disahkan (tahun, bulan);
CREATE INDEX idx_protes_periode            ON protes (tahun, bulan);
CREATE INDEX idx_cc_periode                ON copie_collationne (tahun, bulan);

CREATE INDEX idx_akta_nama_trgm      ON akta USING gin (nama_klien gin_trgm_ops);
CREATE INDEX idx_akta_nomor_trgm     ON akta USING gin (nomor_akta gin_trgm_ops);
CREATE INDEX idx_wasiat_nama_trgm    ON wasiat USING gin (nama_pewaris_penghadap gin_trgm_ops);
CREATE INDEX idx_wasiat_nomor_trgm   ON wasiat USING gin (nomor_akta gin_trgm_ops);
CREATE INDEX idx_dibukukan_pihak_trgm ON surat_dibukukan USING gin (para_pihak gin_trgm_ops);
CREATE INDEX idx_disahkan_pihak_trgm  ON surat_disahkan USING gin (para_pihak gin_trgm_ops);
CREATE INDEX idx_protes_debitur_trgm  ON protes USING gin (nama_debitur gin_trgm_ops);
CREATE INDEX idx_protes_kreditur_trgm ON protes USING gin (nama_kreditur gin_trgm_ops);
CREATE INDEX idx_cc_pemohon_trgm      ON copie_collationne USING gin (nama_pemohon gin_trgm_ops);

CREATE INDEX idx_klapper_akta_huruf  ON klapper_akta (huruf, nama_penghadap);
CREATE INDEX idx_klapper_legal_huruf ON klapper_legalisasi (huruf, nama_penghadap);

CREATE INDEX idx_riwayat_profil ON riwayat_aktivitas (id_profil, waktu DESC);
CREATE INDEX idx_riwayat_record ON riwayat_aktivitas (tabel, id_record);
CREATE INDEX idx_riwayat_waktu  ON riwayat_aktivitas (waktu DESC);

CREATE UNIQUE INDEX uq_akta_nomor            ON akta (nomor_akta, tahun)            WHERE NOT nihil AND dihapus_pada IS NULL;
CREATE UNIQUE INDEX uq_wasiat_nomor          ON wasiat (nomor_akta, tahun)          WHERE NOT nihil AND dihapus_pada IS NULL;
CREATE UNIQUE INDEX uq_surat_dibukukan_nomor ON surat_dibukukan (nomor_regist, tahun) WHERE NOT nihil AND dihapus_pada IS NULL;
CREATE UNIQUE INDEX uq_surat_disahkan_nomor  ON surat_disahkan (nomor_regist, tahun)  WHERE NOT nihil AND dihapus_pada IS NULL;
CREATE UNIQUE INDEX uq_protes_nomor          ON protes (nomor_protes, tahun)        WHERE NOT nihil AND dihapus_pada IS NULL;
CREATE UNIQUE INDEX uq_cc_nomor              ON copie_collationne (nomor_regist, tahun) WHERE NOT nihil AND dihapus_pada IS NULL;

CREATE UNIQUE INDEX uq_akta_nihil            ON akta (bulan, tahun)             WHERE nihil AND dihapus_pada IS NULL;
CREATE UNIQUE INDEX uq_wasiat_nihil          ON wasiat (bulan, tahun)           WHERE nihil AND dihapus_pada IS NULL;
CREATE UNIQUE INDEX uq_surat_dibukukan_nihil ON surat_dibukukan (bulan, tahun)  WHERE nihil AND dihapus_pada IS NULL;
CREATE UNIQUE INDEX uq_surat_disahkan_nihil  ON surat_disahkan (bulan, tahun)   WHERE nihil AND dihapus_pada IS NULL;
CREATE UNIQUE INDEX uq_protes_nihil          ON protes (bulan, tahun)           WHERE nihil AND dihapus_pada IS NULL;
CREATE UNIQUE INDEX uq_cc_nihil              ON copie_collationne (bulan, tahun) WHERE nihil AND dihapus_pada IS NULL;