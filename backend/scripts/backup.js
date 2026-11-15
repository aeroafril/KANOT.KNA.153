const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { Pool } = require('pg');
const env = require('../config/env');

const MAGIC = Buffer.from('KANOTBK1');
const PANJANG_IV = 12;
const PANJANG_TAG = 16;
const POLA_FILE = /^kanot-\d{8}-\d{6}\.dump\.enc$/;

const parameterKoneksi = () => {
  const k = env.db.koneksi;
  if (k.connectionString) {
    const url = new URL(k.connectionString);
    return {
      host: url.hostname,
      port: Number(url.port) || 5432,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.replace(/^\//, ''))
    };
  }
  return { host: k.host, port: k.port, user: k.user, password: k.password, database: k.database };
};

const lingkunganPg = (koneksi) => ({
  ...process.env,
  PGHOST: koneksi.host,
  PGPORT: String(koneksi.port),
  PGUSER: koneksi.user,
  PGPASSWORD: koneksi.password,
  PGDATABASE: koneksi.database,
  ...(env.db.ssl ? { PGSSLMODE: 'require' } : {})
});

const ambilKunci = () => {
  const hex = env.ambil('BACKUP_KEY');
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(
      'BACKUP_KEY belum diisi atau bukan 64 karakter heksadesimal.\n' +
        `Buat dengan: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
    );
  }
  return Buffer.from(hex, 'hex');
};

const stempel = () => {
  const bagian = new Date()
    .toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' })
    .replace(/[-: ]/g, '');
  return `${bagian.slice(0, 8)}-${bagian.slice(8, 14)}`;
};

const jalankanProses = (perintah, argumen, opsi = {}) =>
  new Promise((resolve, reject) => {
    const proses = spawn(perintah, argumen, { stdio: ['ignore', 'pipe', 'pipe'], ...opsi });
    let galat = '';
    proses.stderr.on('data', (d) => {
      galat += d.toString();
    });
    proses.on('error', (err) =>
      reject(new Error(`Tidak dapat menjalankan ${perintah}: ${err.message}. Atur PG_DUMP_PATH/PG_RESTORE_PATH jika belum ada di PATH`))
    );
    proses.on('close', (kode) => {
      if (kode === 0) resolve(proses);
      else reject(new Error(`${perintah} gagal (kode ${kode}): ${galat.trim().split('\n').slice(-3).join(' | ')}`));
    });
    if (opsi.onStdout) opsi.onStdout(proses.stdout);
  });

const enkripsiDump = (koneksi, tujuan, kunci) =>
  new Promise((resolve, reject) => {
    const iv = crypto.randomBytes(PANJANG_IV);
    const cipher = crypto.createCipheriv('aes-256-gcm', kunci, iv);
    const keluar = fs.createWriteStream(tujuan, { mode: 0o600 });
    const perintah = env.ambil('PG_DUMP_PATH') || 'pg_dump';
    const proses = spawn(perintah, ['--format=custom', '--no-owner', '--no-privileges'], {
      env: lingkunganPg(koneksi),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let galat = '';
    proses.stderr.on('data', (d) => {
      galat += d.toString();
    });
    proses.on('error', (err) =>
      reject(new Error(`Tidak dapat menjalankan ${perintah}: ${err.message}. Atur PG_DUMP_PATH jika belum ada di PATH`))
    );
    keluar.on('error', reject);
    cipher.on('error', reject);

    keluar.write(Buffer.concat([MAGIC, iv]));
    cipher.on('data', (potongan) => {
      if (!keluar.write(potongan)) {
        cipher.pause();
        keluar.once('drain', () => cipher.resume());
      }
    });

    let kodeKeluar = null;
    let cipherSelesai = false;
    const tutup = () => {
      if (kodeKeluar === null || !cipherSelesai) return;
      if (kodeKeluar !== 0) {
        keluar.destroy();
        reject(new Error(`pg_dump gagal (kode ${kodeKeluar}): ${galat.trim().split('\n').slice(-3).join(' | ')}`));
        return;
      }
      keluar.end(cipher.getAuthTag(), resolve);
    };
    cipher.on('end', () => {
      cipherSelesai = true;
      tutup();
    });
    proses.on('close', (kode) => {
      kodeKeluar = kode;
      tutup();
    });

    proses.stdout.pipe(cipher);
  });

const dekripsiKeFile = async (sumber, tujuan, kunci) => {
  const info = await fsp.stat(sumber);
  const minimum = MAGIC.length + PANJANG_IV + PANJANG_TAG;
  if (info.size <= minimum) {
    throw new Error('File backup terlalu kecil atau rusak');
  }

  const fd = await fsp.open(sumber, 'r');
  let kepala;
  let tag;
  try {
    kepala = Buffer.alloc(MAGIC.length + PANJANG_IV);
    await fd.read(kepala, 0, kepala.length, 0);
    tag = Buffer.alloc(PANJANG_TAG);
    await fd.read(tag, 0, PANJANG_TAG, info.size - PANJANG_TAG);
  } finally {
    await fd.close();
  }

  if (!kepala.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw new Error('Bukan file backup KANOT (penanda tidak cocok)');
  }

  const decipher = crypto.createDecipheriv('aes-256-gcm', kunci, kepala.subarray(MAGIC.length));
  decipher.setAuthTag(tag);

  await new Promise((resolve, reject) => {
    const baca = fs.createReadStream(sumber, { start: kepala.length, end: info.size - PANJANG_TAG - 1 });
    const tulis = fs.createWriteStream(tujuan, { mode: 0o600 });
    baca.on('error', reject);
    decipher.on('error', () => reject(new Error('Dekripsi gagal: kunci salah atau file backup telah diubah/rusak')));
    tulis.on('error', reject);
    tulis.on('finish', resolve);
    baca.pipe(decipher).pipe(tulis);
  });
};

const sha256 = (file) =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    fs.createReadStream(file)
      .on('data', (d) => hash.update(d))
      .on('end', () => resolve(hash.digest('hex')))
      .on('error', reject);
  });

const terapkanRetensi = async (direktori, hari) => {
  const nama = (await fsp.readdir(direktori)).filter((f) => POLA_FILE.test(f));
  const daftar = [];
  for (const f of nama) {
    const info = await fsp.stat(path.join(direktori, f));
    daftar.push({ f, waktu: info.mtimeMs });
  }
  daftar.sort((a, b) => b.waktu - a.waktu);
  const batas = Date.now() - hari * 86400000;
  const dihapus = [];
  for (const { f, waktu } of daftar.slice(3)) {
    if (waktu < batas) {
      await fsp.unlink(path.join(direktori, f));
      dihapus.push(f);
    }
  }
  return dihapus;
};

const buatBackup = async () => {
  const kunci = ambilKunci();
  const koneksi = parameterKoneksi();
  const direktori = path.resolve(env.ambil('BACKUP_DIR') || 'backups');
  const salinanDir = env.ambil('BACKUP_COPY_DIR') ? path.resolve(env.ambil('BACKUP_COPY_DIR')) : null;
  const retensi = Number(env.ambil('BACKUP_RETENTION_DAYS')) || 14;

  await fsp.mkdir(direktori, { recursive: true, mode: 0o700 });
  const nama = `kanot-${stempel()}.dump.enc`;
  const tujuan = path.join(direktori, nama);

  const mulai = Date.now();
  try {
    await enkripsiDump(koneksi, tujuan, kunci);
  } catch (err) {
    await fsp.rm(tujuan, { force: true });
    throw err;
  }

  const info = await fsp.stat(tujuan);
  const hash = await sha256(tujuan);
  console.log(`Backup terenkripsi dibuat: ${tujuan}`);
  console.log(`  ukuran : ${(info.size / 1024).toFixed(1)} KB, waktu ${((Date.now() - mulai) / 1000).toFixed(1)} detik`);
  console.log(`  sha256 : ${hash}`);

  if (salinanDir) {
    await fsp.mkdir(salinanDir, { recursive: true });
    const salinan = path.join(salinanDir, nama);
    await fsp.copyFile(tujuan, salinan);
    if ((await sha256(salinan)) !== hash) {
      throw new Error(`Salinan ke ${salinanDir} rusak (checksum berbeda)`);
    }
    console.log(`  salinan: ${salinan} (checksum cocok)`);
  } else {
    console.log('  peringatan: BACKUP_COPY_DIR belum diatur, backup hanya ada di satu lokasi');
  }

  for (const dir of [direktori, salinanDir].filter(Boolean)) {
    const dihapus = await terapkanRetensi(dir, retensi);
    if (dihapus.length > 0) {
      console.log(`  retensi ${retensi} hari: ${dihapus.length} backup lama dihapus dari ${dir}`);
    }
  }
};

const dekripsiSementara = async (file, kunci) => {
  const sementara = path.join(os.tmpdir(), `kanot-pulih-${process.pid}-${Date.now()}.dump`);
  try {
    await dekripsiKeFile(path.resolve(file), sementara, kunci);
  } catch (err) {
    await fsp.rm(sementara, { force: true });
    throw err;
  }
  return sementara;
};

const adminPool = (koneksi) =>
  new Pool({ ...koneksi, database: 'postgres', ssl: env.db.ssl ? { rejectUnauthorized: false } : false });

const pastikanNamaAman = (nama) => {
  if (!/^[a-zA-Z0-9_]{1,60}$/.test(nama)) {
    throw new Error('Nama database hanya boleh huruf, angka, dan garis bawah (maks 60 karakter)');
  }
};

const pulihkanKe = async (fileDump, koneksi, namaDb, bersihkan) => {
  const perintah = env.ambil('PG_RESTORE_PATH') || 'pg_restore';
  const argumen = [
    '--no-owner',
    '--no-privileges',
    ...(bersihkan ? ['--clean', '--if-exists'] : []),
    `--dbname=${namaDb}`,
    fileDump
  ];
  await jalankanProses(perintah, argumen, { env: lingkunganPg({ ...koneksi, database: namaDb }) });
};

const pulihkan = async (file, tujuan, opsi) => {
  if (!file || !tujuan) {
    throw new Error('Pemakaian: npm run backup:pulihkan -- <file.dump.enc> <nama_database_tujuan>');
  }
  pastikanNamaAman(tujuan);
  const koneksi = parameterKoneksi();

  if (tujuan === koneksi.database && !opsi.includes('--timpa-database-aktif')) {
    throw new Error(
      `Database tujuan "${tujuan}" adalah database yang sedang dipakai aplikasi. ` +
        'Pulihkan ke database baru dulu, atau tambahkan --timpa-database-aktif jika yakin'
    );
  }

  const dump = await dekripsiSementara(file, ambilKunci());
  const admin = adminPool(koneksi);
  try {
    const ada = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [tujuan]);
    if (ada.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${tujuan}"`);
      console.log(`Database "${tujuan}" dibuat`);
    }
    await pulihkanKe(dump, koneksi, tujuan, ada.rowCount > 0);
    console.log(`Backup berhasil dipulihkan ke database "${tujuan}"`);
  } finally {
    await admin.end();
    await fsp.rm(dump, { force: true });
  }
};

const hitungBaris = async (pool) => {
  const tabel = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY 1"
  );
  const hasil = {};
  for (const { table_name: nama } of tabel.rows) {
    const jumlah = await pool.query(`SELECT COUNT(*)::int AS n FROM "${nama}"`);
    hasil[nama] = jumlah.rows[0].n;
  }
  return hasil;
};

const ujiPemulihan = async (file) => {
  if (!file) {
    throw new Error('Pemakaian: npm run backup:uji -- <file.dump.enc>');
  }
  const koneksi = parameterKoneksi();
  const dump = await dekripsiSementara(file, ambilKunci());
  const namaUji = `kanot_uji_${Date.now()}`;
  const admin = adminPool(koneksi);
  const sumber = new Pool({ ...koneksi, ssl: env.db.ssl ? { rejectUnauthorized: false } : false });
  let hasilUji = null;

  try {
    await admin.query(`CREATE DATABASE "${namaUji}"`);
    await pulihkanKe(dump, koneksi, namaUji, false);

    const hasilPool = new Pool({ ...koneksi, database: namaUji, ssl: env.db.ssl ? { rejectUnauthorized: false } : false });
    try {
      const baris = await hitungBaris(hasilPool);
      const asal = await hitungBaris(sumber);
      const tabelHilang = Object.keys(asal).filter((t) => !(t in baris));

      console.log('Tabel'.padEnd(26), 'database aktif'.padStart(15), 'hasil pulih'.padStart(12));
      for (const tabel of Object.keys(asal)) {
        const tanda = baris[tabel] === asal[tabel] ? '' : '  (berbeda)';
        console.log(tabel.padEnd(26), String(asal[tabel]).padStart(15), String(baris[tabel] ?? 'HILANG').padStart(12) + tanda);
      }
      hasilUji = { tabelHilang, jumlahTabel: Object.keys(baris).length };
    } finally {
      await hasilPool.end();
    }
  } finally {
    await sumber.end();
    await admin.query(`DROP DATABASE IF EXISTS "${namaUji}"`).catch(() => {});
    await admin.end();
    await fsp.rm(dump, { force: true });
  }

  if (hasilUji.tabelHilang.length > 0) {
    throw new Error(`Uji pemulihan GAGAL: tabel hilang: ${hasilUji.tabelHilang.join(', ')}`);
  }
  console.log(`Uji pemulihan BERHASIL: ${hasilUji.jumlahTabel} tabel terpulihkan, database uji sudah dihapus`);
  console.log('Catatan: jumlah baris bisa berbeda jika data berubah setelah backup dibuat');
};

const [perintah, ...sisa] = process.argv.slice(2);
const tugas = {
  buat: () => buatBackup(),
  uji: () => ujiPemulihan(sisa[0]),
  pulihkan: () => pulihkan(sisa[0], sisa[1], sisa.slice(2))
};

(tugas[perintah || 'buat'] || (() => Promise.reject(new Error('Perintah: buat | uji <file> | pulihkan <file> <database>'))))()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => process.exit());