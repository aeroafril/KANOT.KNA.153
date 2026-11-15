const REPORTORIUM = {
    akta: {
        tabel: 'akta',
        pk: 'akta_id',
        nama: 'Buku Daftar Akta (Reportorium)',
        nomor: 'nomor_akta',
        tanggal: 'tanggal_akta',
        judul: 'nama_klien',
        ringkas: 'sifat_akta',
        kolom: {
            id_buku_tamu: {tipe: 'id'},
            nomor_akta: {tipe: 'teks', maks: 50},
            tanggal_akta: {tipe: 'tanggal'},
            sifat_akta: {tipe: 'teks', maks: 150},
            nama_klien: {tipe: 'teks', maks: 150},
            ringkasan: {tipe: 'teks', maks: 255},
            status: {tipe: 'teks', maks: 50}
        },
        wajib: ['nomor_akta', 'tanggal_akta', 'sifat_akta', 'nama_klien'],
        cari: ['nomor_akta', 'nama_klien', 'sifat_akta', 'ringkasan'],
        klapper: {
        jenis: 'akta',
        fk: 'akta_id',
        peta: {
            nama_penghadap: 'nama_klien',
            sifat_akta: 'sifat_akta',
            tanggal_akta: 'tanggal_akta',
            nomor_akta: 'nomor_akta'
        }
        },
        laporan: [
            {kunci: 'nomor_akta', judul: 'Nomor Akta', lebar: 9, tipe: 'teks'},
            {kunci: 'tanggal_akta', judul: 'Tanggal', lebar: 11, tipe: 'tanggal'},
            {kunci: 'sifat_akta', judul: 'Sifat Akta', lebar: 20, tipe: 'teks'},
            {kunci: 'nama_klien', judul: 'Nama Penghadap', lebar: 24, tipe: 'teks'},
            {kunci: 'ringkasan', judul: 'Ringkasan', lebar: 32, tipe: 'teks'}
        ]
    },
    wasiat: {
        tabel: 'wasiat',
        pk: 'wasiat_id',
        nama: 'Buku Daftar Wasiat',
        nomor: 'nomor_akta',
        tanggal: 'tanggal_akta',
        judul: 'nama_pewaris_penghadap',
        ringkas: 'nama_notaris',
        kolom: {
            id_buku_tamu: {tipe: 'id'},
            nomor_akta: {tipe: 'teks', maks: 50},
            tanggal_akta: {tipe: 'tanggal'},
            nama_pewaris_penghadap: {tipe: 'teks', maks: 150},
            nama_notaris: {tipe: 'teks', maks: 150},
            tanggal_laporan: {tipe: 'tanggal'},
            status: {tipe: 'teks', maks: 50}
        },
        wajib: ['nomor_akta', 'tanggal_akta', 'nama_pewaris_penghadap'],
        cari: ['nomor_akta', 'nama_pewaris_penghadap', 'nama_notaris'],
        laporan: [
            {kunci: 'nomor_akta', judul: 'Nomor Akta', lebar: 10, tipe: 'teks'},
            {kunci: 'tanggal_akta', judul: 'Tanggal Akta', lebar: 12, tipe: 'tanggal'},
            {kunci: 'nama_pewaris_penghadap', judul: 'Nama Pewaris / Penghadap', lebar: 30, tipe: 'teks'},
            {kunci: 'nama_notaris', judul: 'Nama Notaris', lebar: 26, tipe: 'teks'},
            {kunci: 'tanggal_laporan', judul: 'Tanggal Laporan', lebar: 13, tipe: 'tanggal'}
        ]
    },
    'surat-dibukukan': {
        tabel: 'surat_dibukukan',
        pk: 'id_surat_dibukukan',
        nama: 'Buku Waarmerking (Surat Dibukukan)',
        nomor: 'nomor_regist',
        tanggal: 'tanggal',
        judul: 'para_pihak',
        ringkas: 'sifat',
        kolom: {
            id_buku_tamu: {tipe: 'id' },
            nomor_regist: {tipe: 'teks', maks: 50 },
            tanggal: {tipe: 'tanggal' },
            para_pihak: {tipe: 'teks', maks: 150 },
            sifat: {tipe: 'teks', maks: 150 }
        },
        wajib: ['nomor_regist', 'tanggal', 'para_pihak'],
        cari: ['nomor_regist', 'para_pihak', 'sifat'],
        laporan: [
            {kunci: 'nomor_regist', judul: 'Nomor Regist', lebar: 12, tipe: 'teks' },
            {kunci: 'tanggal', judul: 'Tanggal', lebar: 12, tipe: 'tanggal' },
            {kunci: 'para_pihak', judul: 'Para Pihak', lebar: 36, tipe: 'teks' },
            {kunci: 'sifat', judul: 'Sifat', lebar: 32, tipe: 'teks' }
        ]
    },
    'surat-disahkan': {
        tabel: 'surat_disahkan',
        pk: 'id_surat_disahkan',
        nama: 'Buku Legalisasi (Surat Disahkan)',
        nomor: 'nomor_regist',
        tanggal: 'tanggal',
        judul: 'para_pihak',
        ringkas: 'sifat',
        kolom: {
            id_buku_tamu: {tipe: 'id' },
            nomor_regist: {tipe: 'teks', maks: 50 },
            tanggal: {tipe: 'tanggal' },
            para_pihak: {tipe: 'teks', maks: 150 },
            sifat: {tipe: 'teks', maks: 150 }
        },
        wajib: ['nomor_regist', 'tanggal', 'para_pihak'],
        cari: ['nomor_regist', 'para_pihak', 'sifat'],
        klapper: {
        jenis: 'legalisasi',
        fk: 'id_surat_disahkan',
        peta: {
            nama_penghadap: 'para_pihak',
            sifat_legalisasi: 'sifat',
            tanggal_legalisasi: 'tanggal',
            nomor_legalisasi: 'nomor_regist'
        }
        },
        laporan: [
            {kunci: 'nomor_regist', judul: 'Nomor Regist', lebar: 12, tipe: 'teks' },
            {kunci: 'tanggal', judul: 'Tanggal', lebar: 12, tipe: 'tanggal' },
            {kunci: 'para_pihak', judul: 'Para Pihak', lebar: 36, tipe: 'teks' },
            {kunci: 'sifat', judul: 'Sifat', lebar: 32, tipe: 'teks' }
        ]
    },
    protes: {
        tabel: 'protes',
        pk: 'id_protes',
        nama: 'Buku Daftar Protes',
        nomor: 'nomor_protes',
        tanggal: 'tanggal_protes',
        judul: 'nama_debitur',
        ringkas: 'nama_kreditur',
        kolom: {
            id_buku_tamu: {tipe: 'id' },
            nomor_protes: {tipe: 'teks', maks: 50 },
            tanggal_protes: {tipe: 'tanggal' },
            nama_debitur: {tipe: 'teks', maks: 150 },
            nama_kreditur: {tipe: 'teks', maks: 150 },
            nominal: {tipe: 'uang' },
            status: {tipe: 'teks', maks: 50 }
        },
        wajib: ['nomor_protes', 'tanggal_protes', 'nama_debitur', 'nama_kreditur'],
        cari: ['nomor_protes', 'nama_debitur', 'nama_kreditur'],
        laporan: [
            {kunci: 'nomor_protes', judul: 'Nomor Protes', lebar: 11, tipe: 'teks' },
            {kunci: 'tanggal_protes', judul: 'Tanggal', lebar: 11, tipe: 'tanggal' },
            {kunci: 'nama_debitur', judul: 'Nama Debitur', lebar: 26, tipe: 'teks' },
            {kunci: 'nama_kreditur', judul: 'Nama Kreditur', lebar: 26, tipe: 'teks' },
            {kunci: 'nominal', judul: 'Nominal', lebar: 16, tipe: 'uang' }
        ]
    },
    'copie-collationne': {
        tabel: 'copie_collationne',
        pk: 'id_cc',
        nama: 'Buku Salinan (Copie Collationne)',
        nomor: 'nomor_regist',
        tanggal: 'tanggal',
        judul: 'nama_pemohon',
        ringkas: 'judul_dokumen',
        kolom: {
            id_buku_tamu: {tipe: 'id' },
            nomor_regist: {tipe: 'teks', maks: 50 },
            tanggal: {tipe: 'tanggal' },
            judul_dokumen: {tipe: 'teks', maks: 150 },
            nama_pemohon: {tipe: 'teks', maks: 150 }
        },
        wajib: ['nomor_regist', 'tanggal', 'nama_pemohon'],
        cari: ['nomor_regist', 'nama_pemohon', 'judul_dokumen'],
        laporan: [
            {kunci: 'nomor_regist', judul: 'Nomor Regist', lebar: 12, tipe: 'teks' },
            {kunci: 'tanggal', judul: 'Tanggal', lebar: 12, tipe: 'tanggal' },
            {kunci: 'judul_dokumen', judul: 'Judul Dokumen', lebar: 36, tipe: 'teks' },
            {kunci: 'nama_pemohon', judul: 'Nama Pemohon', lebar: 32, tipe: 'teks' }
        ]
    }
};

const REGISTRASI = {
    pt: {
        tabel: 'regist_pt',
        pk: 'id_regist_pt',
        nama: 'Registrasi PT',
        nomor: 'nomor_akta',
        tanggal: 'tanggal_akta',
        judul: 'nama_pt',
        ringkas: 'pendiri',
        kolom: {
            id_buku_tamu: {tipe: 'id' },
            nomor_akta: {tipe: 'teks', maks: 50 },
            tanggal_akta: {tipe: 'tanggal' },
            nama_pt: {tipe: 'teks', maks: 150 },
            pendiri: {tipe: 'teks', maks: 150 },
            modal: {tipe: 'uang' },
            modal_disetor: {tipe: 'uang' },
            sk_kemenkumham: {tipe: 'teks', maks: 100 },
            status: {tipe: 'teks', maks: 50 },
            nihil: {tipe: 'bool' }
        },
        wajib: ['nomor_akta', 'tanggal_akta', 'nama_pt'],
        cari: ['nomor_akta', 'nama_pt', 'pendiri'],
        laporan: [
            {kunci: 'nomor_akta', judul: 'Nomor Akta', lebar: 9, tipe: 'teks' },
            {kunci: 'tanggal_akta', judul: 'Tanggal', lebar: 11, tipe: 'tanggal' },
            {kunci: 'nama_pt', judul: 'Nama PT', lebar: 22, tipe: 'teks' },
            {kunci: 'pendiri', judul: 'Pendiri', lebar: 20, tipe: 'teks' },
            {kunci: 'modal', judul: 'Modal', lebar: 14, tipe: 'uang' },
            {kunci: 'modal_disetor', judul: 'Modal Disetor', lebar: 14, tipe: 'uang' },
            {kunci: 'sk_kemenkumham', judul: 'SK Kemenkumham', lebar: 16, tipe: 'teks' },
            {kunci: 'status', judul: 'Status', lebar: 10, tipe: 'teks' }
        ]
    },
    cv: {
        tabel: 'regist_cv',
        pk: 'id_regist_cv',
        nama: 'Registrasi CV',
        nomor: 'nomor_akta',
        tanggal: 'tanggal_akta',
        judul: 'nama_cv',
        ringkas: 'pendiri',
        kolom: {
            id_buku_tamu: {tipe: 'id' },
            nomor_akta: {tipe: 'teks', maks: 50 },
            tanggal_akta: {tipe: 'tanggal' },
            nama_cv: {tipe: 'teks', maks: 150 },
            pendiri: {tipe: 'teks', maks: 150 },
            modal: {tipe: 'uang' },
            status: {tipe: 'teks', maks: 50 },
            nihil: {tipe: 'bool' }
        },
        wajib: ['nomor_akta', 'tanggal_akta', 'nama_cv'],
        cari: ['nomor_akta', 'nama_cv', 'pendiri'],
        laporan: [
            {kunci: 'nomor_akta', judul: 'Nomor Akta', lebar: 10, tipe: 'teks' },
            {kunci: 'tanggal_akta', judul: 'Tanggal', lebar: 12, tipe: 'tanggal' },
            {kunci: 'nama_cv', judul: 'Nama CV', lebar: 28, tipe: 'teks' },
            {kunci: 'pendiri', judul: 'Pendiri', lebar: 26, tipe: 'teks' },
            {kunci: 'modal', judul: 'Modal', lebar: 16, tipe: 'uang' },
            {kunci: 'status', judul: 'Status', lebar: 10, tipe: 'teks' }
        ]
    },
    yayasan: {
        tabel: 'yayasan',
        pk: 'id_yayasan',
        nama: 'Registrasi Yayasan',
        nomor: 'nomor_akta',
        tanggal: 'tanggal_akta',
        judul: 'nama_yayasan',
        ringkas: 'pendiri',
        kolom: {
            id_buku_tamu: {tipe: 'id' },
            nomor_akta: {tipe: 'teks', maks: 50 },
            tanggal_akta: {tipe: 'tanggal' },
            nama_yayasan: {tipe: 'teks', maks: 150 },
            pendiri: {tipe: 'teks', maks: 150 },
            alamat: {tipe: 'teks', maks: 255 },
            terdaftar_kemenkumham: {tipe: 'teks', maks: 50 },
            legalisasi: {tipe: 'teks', maks: 20 },
            tanggal_perubahan: {tipe: 'teks', maks: 20 },
            keterangan: {tipe: 'teks', maks: 255 },
            status: {tipe: 'teks', maks: 20 },
            nihil: {tipe: 'bool' }
        },
        wajib: ['nomor_akta', 'tanggal_akta', 'nama_yayasan'],
        cari: ['nomor_akta', 'nama_yayasan', 'pendiri'],
        laporan: [
            {kunci: 'nomor_akta', judul: 'Nomor Akta', lebar: 8, tipe: 'teks' },
            {kunci: 'tanggal_akta', judul: 'Tanggal', lebar: 10, tipe: 'tanggal' },
            {kunci: 'nama_yayasan', judul: 'Nama Yayasan', lebar: 18, tipe: 'teks' },
            {kunci: 'pendiri', judul: 'Pendiri', lebar: 15, tipe: 'teks' },
            {kunci: 'alamat', judul: 'Alamat', lebar: 18, tipe: 'teks' },
            {kunci: 'terdaftar_kemenkumham', judul: 'Terdaftar Kemenkumham', lebar: 14, tipe: 'teks' },
            {kunci: 'legalisasi', judul: 'Legalisasi', lebar: 9, tipe: 'teks' },
            {kunci: 'tanggal_perubahan', judul: 'Tgl Perubahan', lebar: 10, tipe: 'teks' },
            {kunci: 'keterangan', judul: 'Keterangan', lebar: 16, tipe: 'teks' },
            {kunci: 'status', judul: 'Status', lebar: 8, tipe: 'teks' }
        ]
    },
    adopsi: {
        tabel: 'adopsi_anak',
        pk: 'id_adopsi_anak',
        nama: 'Registrasi Adopsi Anak',
        nomor: 'nomor_akta',
        tanggal: 'tanggal_akta',
        judul: 'nama_anak',
        ringkas: 'orang_tua_angkat',
        kolom: {
            id_buku_tamu: {tipe: 'id' },
            nomor_akta: {tipe: 'teks', maks: 50 },
            tanggal_akta: {tipe: 'tanggal' },
            nama_anak: {tipe: 'teks', maks: 150 },
            orang_tua_angkat: {tipe: 'teks', maks: 150 },
            orang_tua_kandung: {tipe: 'teks', maks: 150 },
            penetapan_pengadilan: {tipe: 'teks', maks: 150 },
            nihil: {tipe: 'bool' }
        },
        wajib: ['nomor_akta', 'tanggal_akta', 'nama_anak'],
        cari: ['nomor_akta', 'nama_anak', 'orang_tua_angkat', 'orang_tua_kandung'],
        laporan: [
            {kunci: 'nomor_akta', judul: 'Nomor Akta', lebar: 10, tipe: 'teks' },
            {kunci: 'tanggal_akta', judul: 'Tanggal', lebar: 11, tipe: 'tanggal' },
            {kunci: 'nama_anak', judul: 'Nama Anak', lebar: 20, tipe: 'teks' },
            {kunci: 'orang_tua_angkat', judul: 'Orang Tua Angkat', lebar: 22, tipe: 'teks' },
            {kunci: 'orang_tua_kandung', judul: 'Orang Tua Kandung', lebar: 22, tipe: 'teks' },
            {kunci: 'penetapan_pengadilan', judul: 'Penetapan Pengadilan', lebar: 22, tipe: 'teks' }
        ]
    },
    hibah: {
        tabel: 'hibah',
        pk: 'id_hibah',
        nama: 'Registrasi Hibah',
        nomor: 'nomor_akta',
        tanggal: 'tanggal_akta',
        judul: 'pemberi_hibah',
        ringkas: 'objek_hibah',
        kolom: {
            id_buku_tamu: {tipe: 'id' },
            nomor_akta: {tipe: 'teks', maks: 50 },
            tanggal_akta: {tipe: 'tanggal' },
            pemberi_hibah: {tipe: 'teks', maks: 150 },
            penerima_hibah: {tipe: 'teks', maks: 150 },
            objek_hibah: {tipe: 'teks', maks: 255 },
            keterangan: {tipe: 'teks', maks: 255 },
            status: {tipe: 'teks', maks: 50 },
            nihil: {tipe: 'bool' }
        },
        wajib: ['nomor_akta', 'tanggal_akta', 'pemberi_hibah', 'penerima_hibah'],
        cari: ['nomor_akta', 'pemberi_hibah', 'penerima_hibah', 'objek_hibah'],
        laporan: [
            {kunci: 'nomor_akta', judul: 'Nomor Akta', lebar: 10, tipe: 'teks' },
            {kunci: 'tanggal_akta', judul: 'Tanggal', lebar: 11, tipe: 'tanggal' },
            {kunci: 'pemberi_hibah', judul: 'Pemberi Hibah', lebar: 20, tipe: 'teks' },
            {kunci: 'penerima_hibah', judul: 'Penerima Hibah', lebar: 20, tipe: 'teks' },
            {kunci: 'objek_hibah', judul: 'Objek Hibah', lebar: 22, tipe: 'teks' },
            {kunci: 'keterangan', judul: 'Keterangan', lebar: 18, tipe: 'teks' },
            {kunci: 'status', judul: 'Status', lebar: 9, tipe: 'teks' }
        ]
    }
};

const KLAPPER = {
    akta: {
        tabel: 'klapper_akta',
        pk: 'id_klapper_akta',
        izin: 'klapper_akta',
        nama: 'Klapper Akta',
        namaKolom: 'nama_penghadap',
        tanggal: 'tanggal_akta',
        nomor: 'nomor_akta',
        sifat: 'sifat_akta',
        kolom: [
            'nama_penghadap',
            'sifat_akta',
            'tanggal_akta',
            'nomor_akta',
            'nomor_reportorium',
            'id_buku_tamu',
            'akta_id'
        ]
    },
    legalisasi: {
        tabel: 'klapper_legalisasi',
        pk: 'id_klapper_legalisasi',
        izin: 'klapper_legalisasi',
        nama: 'Klapper Legalisasi',
        namaKolom: 'nama_penghadap',
        tanggal: 'tanggal_legalisasi',
        nomor: 'nomor_legalisasi',
        sifat: 'sifat_legalisasi',
        kolom: [
        'nama_penghadap',
        'sifat_legalisasi',
        'tanggal_legalisasi',
        'nomor_legalisasi',
        'id_surat_disahkan'
        ]
    }
};

module.exports = {REPORTORIUM, REGISTRASI, KLAPPER };