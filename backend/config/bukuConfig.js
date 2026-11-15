const REGISTRASI = {
    pt: {
        tabel: 'regist_pt',
        pk: 'id_regist_pt',
        kolom: {
        id_buku_tamu: {tipe: 'id'},
        nomor_akta: {tipe: 'teks', maks: 50},
        tanggal_akta: {tipe: 'tanggal'},
        nama_pt: {tipe: 'teks', maks: 150},
        pendiri: {tipe: 'teks', maks: 150},
        modal: {tipe: 'uang'},
        modal_disetor: {tipe: 'uang'},
        sk_kemenkumham: {tipe: 'teks', maks: 100},
        status: {tipe: 'teks', maks: 50},
        nihil: {tipe: 'bool'}
    },
        wajib: ['nomor_akta', 'tanggal_akta', 'nama_pt'],
        cari: ['nomor_akta', 'nama_pt', 'pendiri']
    },
    cv: {
        tabel: 'regist_cv',
        pk: 'id_regist_cv',
        kolom: {
        id_buku_tamu: {tipe: 'id'},
        nomor_akta: {tipe: 'teks', maks: 50},
        tanggal_akta: {tipe: 'tanggal'},
        nama_cv: {tipe: 'teks', maks: 150},
        pendiri: {tipe: 'teks', maks: 150},
        modal: {tipe: 'uang'},
        status: {tipe: 'teks', maks: 50},
        nihil: {tipe: 'bool'}
    },
        wajib: ['nomor_akta', 'tanggal_akta', 'nama_cv'],
        cari: ['nomor_akta', 'nama_cv', 'pendiri']
    },
    yayasan: {
        tabel: 'yayasan',
        pk: 'id_yayasan',
        kolom: {
        id_buku_tamu: {tipe: 'id'},
        nomor_akta: {tipe: 'teks', maks: 50},
        tanggal_akta: {tipe: 'tanggal'},
        nama_yayasan: {tipe: 'teks', maks: 150},
        pendiri: {tipe: 'teks', maks: 150},
        alamat: {tipe: 'teks', maks: 255},
        terdaftar_kemenkumham: {tipe: 'teks', maks: 50},
        legalisasi: {tipe: 'teks', maks: 20},
        tanggal_perubahan: {tipe: 'teks', maks: 20},
        keterangan: {tipe: 'teks', maks: 255},
        status: {tipe: 'teks', maks: 20},
        nihil: {tipe: 'bool'}
    },
        wajib: ['nomor_akta', 'tanggal_akta', 'nama_yayasan'],
        cari: ['nomor_akta', 'nama_yayasan', 'pendiri']
    },
    adopsi: {
        tabel: 'adopsi_anak',
        pk: 'id_adopsi_anak',
        kolom: {
        id_buku_tamu: {tipe: 'id'},
        nomor_akta: {tipe: 'teks', maks: 50},
        tanggal_akta: {tipe: 'tanggal'},
        nama_anak: {tipe: 'teks', maks: 150},
        orang_tua_angkat: {tipe: 'teks', maks: 150},
        orang_tua_kandung: {tipe: 'teks', maks: 150},
        penetapan_pengadilan: {tipe: 'teks', maks: 150},
        nihil: {tipe: 'bool'}
        },
        wajib: ['nomor_akta', 'tanggal_akta', 'nama_anak'],
        cari: ['nomor_akta', 'nama_anak', 'orang_tua_angkat', 'orang_tua_kandung']
    },
    hibah: {
        tabel: 'hibah',
        pk: 'id_hibah',
        kolom: {
        id_buku_tamu: {tipe: 'id'},
        nomor_akta: {tipe: 'teks', maks: 50},
        tanggal_akta: {tipe: 'tanggal'},
        pemberi_hibah: {tipe: 'teks', maks: 150},
        penerima_hibah: {tipe: 'teks', maks: 150},
        objek_hibah: {tipe: 'teks', maks: 255},
        keterangan: {tipe: 'teks', maks: 255},
        status: {tipe: 'teks', maks: 50},
        nihil: {tipe: 'bool'}
        },
        wajib: ['nomor_akta', 'tanggal_akta', 'pemberi_hibah', 'penerima_hibah'],
        cari: ['nomor_akta', 'pemberi_hibah', 'penerima_hibah', 'objek_hibah']
    }
};

module.exports = {REGISTRASI};