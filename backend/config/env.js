require('dotenv').config({quiet: true});

const ambil = (nama) => {
    const kandidat = [nama, nama.replace(/-/g, '_'), nama.replace(/_/g, '-')];
    for(const kunci of kandidat){
        if(process.env[kunci] !== undefined){
            return process.env[kunci];
        }
    }
    return undefined;
};

const adaIsi = (nilai) => nilai !== undefined && nilai !== '';

const urlDatabase = ambil('DATABASE_URL');
const kunciDatabase = ['DB-USER', 'DB-HOST', 'DB-NAME', 'DB-PASSWORD'];
const kunciRahasia = ['JWT_SECRET', 'ENCRYPTION_KEY', 'HMAC_KEY'];

const hilangDatabase = adaIsi(urlDatabase) ? [] : kunciDatabase.filter((k) => !adaIsi(ambil(k)));
const hilangRahasia = kunciRahasia.filter((k) => !adaIsi(ambil(k)));
const hilang = [...hilangDatabase, ...hilangRahasia];

if(hilang.length > 0){
    const petunjuk = 
        hilangRahasia.length > 0
        ? `\nBuat nilai acak dengan node -e "console.log(require('crypto').randomBytes(32).toString('hex))"` : "";
    throw new Error(`Variabel .env belum diisi: ${hilang.join(', ')}${petunjuk}`);
}

const portDatabase = adaIsi(ambil('DB-PORT')) ? Number(ambil('DB-PORT')) : 5432;
if(!Number.isInteger(portDatabase) || portDatabase < 1 || portDatabase > 65535){
    throw new Error('port database harus berupa angka, port yang valid contohnya 5432');
}

if(ambil('JWT_SECRET').length < 32){
    throw new Error('jwt harus minimal 32 karekter');
}

if(ambil('HMAC_KEY').length < 32){
    throw new Error('hmac key harus minimal 32 karekter');
}

if(!/^[0-9a-fA-F]{64}$/.test(ambil('ENCRYPTION_KEY'))){
    throw new Error('encripsi key harus 64 karakter heksadesimal (32 byte)');
}

module.exports = {
    ambil,
    nodeEnv: ambil('NODE_ENV'),
    port: Number(ambil('PORT')),
    corsOrigin: ambil('CORS_ORIGIN'),
    db: {
        koneksi: adaIsi(urlDatabase) ? {connectionString: urlDatabase} : {
            user: ambil('DB-USER'),
            host: ambil(DB-HOST),
            database: ambil('DB-NAME'),
            password: ambil('DB-PASSWORD'),
            port: portDatabase
        },
        ssl: ambil('DB-SSL') === 'true'
    },
    jwt: {
        secret: ambil('JWT_SECRET'),
        expiresIn: ambil('JWT_EXPIRES_IN')
    },
    encryptionKey: ambil('ENCRYPTION_KEY'),
    hmackey: ambil('HMAC_KEY') 
};