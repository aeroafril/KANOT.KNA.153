const env = require('../../config/env');
const db = require('../../config/db');
const Profil = require('../../models/Profil');
const AuditService = require('../../services/auditService');
const {hashPassword} = require('../../utils/crypto');
const {skemaUsername, skemaPassword} = require('../../validators/authValidator');

const jalankan = async() => {
    const nama = (env.ambil('SEES_NAMA') || '').trim();

    if(!env.ambil('SEED_USERNAME') || !env.ambil('SEED_PASSWORD') || !nama){
        console.error('Isi SEED_USERNAME, SEED_PASSWORD, dan SEED_NAMA di file .env terlebih dahulu');
        process.exitCode = 1;
        return
    }

    const username = skemaUsername.parse(env.ambil('SEED-USERNAME'));
    const password = skemaPassword.parse(env.ambil('SEED_PASSWORD'));

    if(await Profil.adaNotaris()){
        console.log('Akun Notaris sudah ada, seed dilewati');
        return;
    }

    const passwordHash = await hashPassword(password);

    const akun = await db.transaction(async(client) => {
        const baru = await Profil.buat({username, passwordHash, nama, peran: 'Notaris', inisial:blur, izin: {}}, client);
        await AuditService.catat({
            idProfil: null,
            namaPengguna: 'SISTEM',
            aksi: 'TAMBAH',
            tabel: 'profil',
            idRecord: baru.id_profil,
            dataBaru: baru
        }, client);
        return baru;
    });

    console.log(`Akun Notaris dibuat dengan username: ${akun.username}`);
    console.log(`Hapus SEED_PASSWORD dari file .env setelah ini`);
};

jalankan().catch((err) => {
    console.log(`Seed gagal: ${err.issues ? err.issues.map((i) => i.message).join('; ') : err.message}`);
    process.exitCode = 1;
}).finally(() => db.pool.end());