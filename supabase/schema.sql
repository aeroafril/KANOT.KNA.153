-- ==============================================================================
-- KANOT (Web Kantor Notaris & PPAT) - Complete Supabase PostgreSQL Schema
-- ==============================================================================
-- Schema ini mencakup seluruh tabel untuk manajemen kantor notaris, termasuk:
-- 1. Manajemen Pengguna & Tim (Profiles terhubung ke Supabase Auth)
-- 2. Buku Tamu / Klien (Guest Book sebagai Central Client Relationship)
-- 3. Repertorium Akta & Wasiat
-- 4. Perjanjian (Waarmerking & Legalisasi)
-- 5. Pendaftaran Badan Usaha (PT, CV, Yayasan)
-- 6. Layanan Khusus (Protes, Copie Collationnee, Adopsi Anak)
-- 7. Tracking Progres Pekerjaan (Job Progress) & Surat-menyurat (Mail Logs)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. EKSTENSI & FUNGSI UTILITAS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fungsi otomatis untuk memperbarui kolom updated_at setiap ada UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ------------------------------------------------------------------------------
-- 1. PROFILES (Tim Kantor Notaris & Hak Akses)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Staff', -- e.g., 'Notaris', 'Admin', 'Staff', 'PPAT'
    initial TEXT,
    status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Sibuk', 'Offline')),
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 2. GUEST_BOOKS (Buku Tamu / Master Klien - Pusat Relasi Layanan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.guest_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nik TEXT,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    purpose TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Yayasan', 'PT', 'CV', 'Wasiat', 'Pengesahan', 'Akta', dll.
    status TEXT NOT NULL DEFAULT 'Menunggu' CHECK (status IN ('Menunggu', 'Diproses', 'Selesai', 'Batal')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time_in TIME NOT NULL DEFAULT CURRENT_TIME,
    time_out TIME,
    pic_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guest_books_name ON public.guest_books(name);
CREATE INDEX idx_guest_books_date ON public.guest_books(date);
CREATE INDEX idx_guest_books_category ON public.guest_books(category);

CREATE TRIGGER update_guest_books_updated_at
    BEFORE UPDATE ON public.guest_books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 3. DEEDS (Repertorium Akta Notaris)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_book_id UUID REFERENCES public.guest_books(id) ON DELETE SET NULL,
    deed_number TEXT NOT NULL,
    deed_date DATE NOT NULL,
    nature_of_deed TEXT NOT NULL, -- Sifat Akta (Jual Beli, Kuasa, Hibah, dll.)
    client_name TEXT NOT NULL,
    summary TEXT,
    is_nihil BOOLEAN DEFAULT false, -- True jika laporan bulan tersebut NIHIL
    month INT CHECK (month >= 1 AND month <= 12),
    year INT CHECK (year >= 2000 AND year <= 2100),
    status TEXT NOT NULL DEFAULT 'Selesai' CHECK (status IN ('Draft', 'Diproses', 'Selesai', 'Batal')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deeds_guest_book_id ON public.deeds(guest_book_id);
CREATE INDEX idx_deeds_number_date ON public.deeds(deed_number, deed_date);

CREATE TRIGGER update_deeds_updated_at
    BEFORE UPDATE ON public.deeds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4. WILLS (Daftar Akta Wasiat)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_book_id UUID REFERENCES public.guest_books(id) ON DELETE SET NULL,
    deed_number TEXT NOT NULL,
    deed_date DATE NOT NULL,
    testator_name TEXT NOT NULL, -- Nama Pemberi Wasiat
    notary_name TEXT NOT NULL,
    report_date DATE,
    is_nihil BOOLEAN DEFAULT false,
    month INT CHECK (month >= 1 AND month <= 12),
    year INT CHECK (year >= 2000 AND year <= 2100),
    status TEXT NOT NULL DEFAULT 'Selesai',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wills_guest_book_id ON public.wills(guest_book_id);
CREATE INDEX idx_wills_testator ON public.wills(testator_name);

CREATE TRIGGER update_wills_updated_at
    BEFORE UPDATE ON public.wills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. PRIVATE_AGREEMENTS (Daftar Waarmerking / Di Bawah Tangan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.private_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_book_id UUID REFERENCES public.guest_books(id) ON DELETE SET NULL,
    register_number TEXT NOT NULL,
    date DATE NOT NULL,
    parties TEXT NOT NULL, -- Nama pihak-pihak yang terlibat
    nature_of_agreement TEXT NOT NULL,
    is_nihil BOOLEAN DEFAULT false,
    month INT,
    year INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_private_agreements_guest_book_id ON public.private_agreements(guest_book_id);

CREATE TRIGGER update_private_agreements_updated_at
    BEFORE UPDATE ON public.private_agreements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 6. LEGALIZED_AGREEMENTS (Daftar Legalisasi / Pengesahan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.legalized_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_book_id UUID REFERENCES public.guest_books(id) ON DELETE SET NULL,
    register_number TEXT NOT NULL,
    date DATE NOT NULL,
    parties TEXT NOT NULL,
    nature_of_agreement TEXT NOT NULL,
    is_nihil BOOLEAN DEFAULT false,
    month INT,
    year INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_legalized_agreements_guest_book_id ON public.legalized_agreements(guest_book_id);

CREATE TRIGGER update_legalized_agreements_updated_at
    BEFORE UPDATE ON public.legalized_agreements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 7. PROTESTS (Daftar Protes Non-Bayar / Non-Akseptasi)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.protests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_book_id UUID REFERENCES public.guest_books(id) ON DELETE SET NULL,
    protest_number TEXT NOT NULL,
    protest_date DATE NOT NULL,
    debtor_name TEXT NOT NULL,
    creditor_name TEXT NOT NULL,
    amount NUMERIC(15,2) DEFAULT 0,
    is_nihil BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'Selesai',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_protests_guest_book_id ON public.protests(guest_book_id);

CREATE TRIGGER update_protests_updated_at
    BEFORE UPDATE ON public.protests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 8. PT_REGISTRATIONS (Daftar PT / Perseroan Terbatas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pt_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_book_id UUID REFERENCES public.guest_books(id) ON DELETE SET NULL,
    deed_number TEXT NOT NULL,
    deed_date DATE NOT NULL,
    pt_name TEXT NOT NULL,
    founders TEXT NOT NULL,
    authorized_capital NUMERIC(18,2) DEFAULT 0, -- Modal Dasar
    paid_capital NUMERIC(18,2) DEFAULT 0,       -- Modal Disetor
    sk_kemenkumham TEXT,
    directors_tenure TEXT,                      -- Masa Jabatan Direksi
    share_composition TEXT,                     -- Komposisi Saham
    financial_year TEXT,                        -- Tahun Buku
    is_nihil BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'Selesai',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pt_guest_book_id ON public.pt_registrations(guest_book_id);
CREATE INDEX idx_pt_name ON public.pt_registrations(pt_name);

CREATE TRIGGER update_pt_registrations_updated_at
    BEFORE UPDATE ON public.pt_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 9. CV_REGISTRATIONS (Daftar CV / Commanditaire Vennootschap)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cv_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_book_id UUID REFERENCES public.guest_books(id) ON DELETE SET NULL,
    deed_number TEXT NOT NULL,
    deed_date DATE NOT NULL,
    cv_name TEXT NOT NULL,
    founders TEXT NOT NULL,
    capital NUMERIC(18,2) DEFAULT 0,
    is_nihil BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'Selesai',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cv_guest_book_id ON public.cv_registrations(guest_book_id);
CREATE INDEX idx_cv_name ON public.cv_registrations(cv_name);

CREATE TRIGGER update_cv_registrations_updated_at
    BEFORE UPDATE ON public.cv_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 10. YAYASAN_REGISTRATIONS (Daftar Yayasan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.yayasan_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_book_id UUID REFERENCES public.guest_books(id) ON DELETE SET NULL,
    deed_number TEXT NOT NULL,
    deed_date DATE NOT NULL,
    yayasan_name TEXT NOT NULL,
    founders TEXT NOT NULL,
    address TEXT,
    registered_kemenkumham TEXT,
    legalization TEXT,
    amendment_date DATE,
    description TEXT,
    is_nihil BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'Selesai',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_yayasan_guest_book_id ON public.yayasan_registrations(guest_book_id);
CREATE INDEX idx_yayasan_name ON public.yayasan_registrations(yayasan_name);

CREATE TRIGGER update_yayasan_registrations_updated_at
    BEFORE UPDATE ON public.yayasan_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 11. COPIE_COLLATIONNEE (Daftar Salinan / Cocokan Salinan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.copie_collationnee (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_book_id UUID REFERENCES public.guest_books(id) ON DELETE SET NULL,
    register_number TEXT NOT NULL,
    date DATE NOT NULL,
    document_title TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    is_nihil BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_copie_guest_book_id ON public.copie_collationnee(guest_book_id);

CREATE TRIGGER update_copie_collationnee_updated_at
    BEFORE UPDATE ON public.copie_collationnee
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 12. CHILD_ADOPTIONS (Daftar Pengangkatan / Adopsi Anak)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.child_adoptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_book_id UUID REFERENCES public.guest_books(id) ON DELETE SET NULL,
    deed_number TEXT NOT NULL,
    deed_date DATE NOT NULL,
    child_name TEXT NOT NULL,
    adoptive_parents TEXT NOT NULL,
    biological_parents TEXT NOT NULL,
    court_decision TEXT,
    is_nihil BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'Selesai',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_child_adoptions_guest_book_id ON public.child_adoptions(guest_book_id);

CREATE TRIGGER update_child_adoptions_updated_at
    BEFORE UPDATE ON public.child_adoptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 13. JOB_PROGRESS (Tracking Progres Berkas & Pekerjaan Klien)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_book_id UUID REFERENCES public.guest_books(id) ON DELETE CASCADE,
    pic_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    service_type TEXT NOT NULL, -- e.g., 'Pendirian PT', 'Akta Jual Beli', 'Wasiat'
    client_name TEXT NOT NULL,
    current_step TEXT NOT NULL, -- e.g., 'Pemberkasan', 'Tanda Tangan', 'Proses Kemenkumham', 'Selesai'
    status TEXT NOT NULL DEFAULT 'Dalam Proses' CHECK (status IN ('Dalam Proses', 'Selesai', 'Tertunda', 'Batal')),
    progress_percentage INT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_date DATE,
    completed_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_progress_guest_book_id ON public.job_progress(guest_book_id);
CREATE INDEX idx_job_progress_pic_id ON public.job_progress(pic_id);
CREATE INDEX idx_job_progress_status ON public.job_progress(status);

CREATE TRIGGER update_job_progress_updated_at
    BEFORE UPDATE ON public.job_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 14. MAIL_LOGS (Daftar Surat Masuk & Surat Keluar)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mail_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mail_type TEXT NOT NULL CHECK (mail_type IN ('IN', 'OUT')), -- IN = Surat Masuk, OUT = Surat Keluar
    mail_number TEXT NOT NULL,
    mail_date DATE NOT NULL,
    sender_receiver TEXT NOT NULL, -- Pengirim (IN) atau Penerima (OUT)
    subject TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mail_logs_date ON public.mail_logs(mail_date);
CREATE INDEX idx_mail_logs_type ON public.mail_logs(mail_type);

CREATE TRIGGER update_mail_logs_updated_at
    BEFORE UPDATE ON public.mail_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 15. KLAPPERS (Klapper Akta)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.klappers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appearer_name TEXT NOT NULL,
    deed_nature TEXT NOT NULL,
    deed_date DATE NOT NULL,
    deed_number TEXT NOT NULL,
    repertorium_number TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_klappers_updated_at
    BEFORE UPDATE ON public.klappers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 16. KLAPPERS_LEGALIZED (Klapper Surat Disahkan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.klappers_legalized (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appearer_name TEXT NOT NULL,
    letter_nature TEXT NOT NULL,
    legalized_date DATE NOT NULL,
    legalized_number TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_klappers_legalized_updated_at
    BEFORE UPDATE ON public.klappers_legalized
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 17. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
-- Aktifkan RLS di semua tabel agar aman dalam produksi
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legalized_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pt_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yayasan_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copie_collationnee ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.klappers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.klappers_legalized ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses (Membolehkan seluruh akses SELECT, INSERT, UPDATE, DELETE untuk pengguna anon maupun authenticated agar sinkron di semua perangkat)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable all access for authenticated users on guest_books" ON public.guest_books;
DROP POLICY IF EXISTS "Enable all access for authenticated users on deeds" ON public.deeds;
DROP POLICY IF EXISTS "Enable all access for authenticated users on wills" ON public.wills;
DROP POLICY IF EXISTS "Enable all access for authenticated users on private_agreements" ON public.private_agreements;
DROP POLICY IF EXISTS "Enable all access for authenticated users on legalized_agreements" ON public.legalized_agreements;
DROP POLICY IF EXISTS "Enable all access for authenticated users on protests" ON public.protests;
DROP POLICY IF EXISTS "Enable all access for authenticated users on pt_registrations" ON public.pt_registrations;
DROP POLICY IF EXISTS "Enable all access for authenticated users on cv_registrations" ON public.cv_registrations;
DROP POLICY IF EXISTS "Enable all access for authenticated users on yayasan_registrations" ON public.yayasan_registrations;
DROP POLICY IF EXISTS "Enable all access for authenticated users on copie_collationnee" ON public.copie_collationnee;
DROP POLICY IF EXISTS "Enable all access for authenticated users on child_adoptions" ON public.child_adoptions;
DROP POLICY IF EXISTS "Enable all access for authenticated users on job_progress" ON public.job_progress;
DROP POLICY IF EXISTS "Enable all access for authenticated users on mail_logs" ON public.mail_logs;
DROP POLICY IF EXISTS "Enable all access for authenticated users on klappers" ON public.klappers;
DROP POLICY IF EXISTS "Enable all access for authenticated users on klappers_legalized" ON public.klappers_legalized;

CREATE POLICY "Enable all access for everyone on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for everyone on guest_books" ON public.guest_books FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for everyone on deeds" ON public.deeds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for everyone on wills" ON public.wills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for everyone on private_agreements" ON public.private_agreements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for everyone on legalized_agreements" ON public.legalized_agreements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for everyone on protests" ON public.protests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for everyone on pt_registrations" ON public.pt_registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for everyone on cv_registrations" ON public.cv_registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for everyone on yayasan_registrations" ON public.yayasan_registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for everyone on copie_collationnee" ON public.copie_collationnee FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for everyone on child_adoptions" ON public.child_adoptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for everyone on job_progress" ON public.job_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for everyone on mail_logs" ON public.mail_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for everyone on klappers" ON public.klappers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for everyone on klappers_legalized" ON public.klappers_legalized FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 9. MENGAKTIFKAN SUPABASE REALTIME (Live Auto-Sync Antar Pengguna)
-- ==============================================================================
-- Menambahkan tabel ke dalam publication supabase_realtime agar WebSocket postgres_changes aktif
ALTER PUBLICATION supabase_realtime ADD TABLE 
  public.profiles,
  public.guest_books,
  public.deeds,
  public.wills,
  public.private_agreements,
  public.legalized_agreements,
  public.protests,
  public.pt_registrations,
  public.cv_registrations,
  public.yayasan_registrations,
  public.copie_collationnee,
  public.child_adoptions,
  public.job_progress,
  public.mail_logs,
  public.klappers,
  public.klappers_legalized;
 
 - -   G R A N T   P R I V I L E G E S   T O   S U P A B A S E   R O L E S  
 G R A N T   A L L   O N   A L L   T A B L E S   I N   S C H E M A   p u b l i c   T O   a n o n ,   a u t h e n t i c a t e d ;  
 G R A N T   A L L   O N   A L L   S E Q U E N C E S   I N   S C H E M A   p u b l i c   T O   a n o n ,   a u t h e n t i c a t e d ;  
 