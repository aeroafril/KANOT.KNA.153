const crypto = require('crypto');
const bcrypt = require('bcrypt');
const env = require('../config/env');

const PUTARAN_BCRYPT = 12;
const VERSI = 'v1';
const HASH_PALSU = bcrypt.hashSync('kanot-hast-palsu', PUTARAN_BCRYPT);
const kunciEnkripsi = Buffer.from(env.encryptionKey, 'hex');

const kosong = (nilai) => nilai === null || nilai === undefined || nilai === '';

const enkripsi = (teks) => {
    if(kosong(teks)){
        return null;
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', kunciEnkripsi, iv);
    const terenkripsi = Buffer.concat([cipher.update(String(teks), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [VERSI, iv.toString('base64'), tag.toString('base64'), terenkripsi.toString('base64')].join(':');
};

const dekripsi = (payload) => {
    if(kosong(payload)){
        return null;
    }

    const bagian = String(payload).split(':');
    if(bagian.length !== 4 || bagian[0] !== VERSI){
        throw new Error('Format data terenkripsi tidak dikenali');
    }
    const [, iv, tag, data] = bagian;
    const decipher = crypto.createDecipheriv('aes-256-gcm', kunciEnkripsi, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    const hasil = Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]);
    return hasil.toString('utf8');
};

const blindIndex = (teks) => {
    if(kosong(teks)){
        return null;
    }

    const bersih = String(teks).trim();
    if(bersih === ''){
        return null;
    }
    return crypto.createHmac('sha256', env.hmacKey).update(bersih).digest('hex');
};

const hashNik = (nik) => blindIndex(String(nik ?? '').replace(/\D/g, ''));

const maskNik = (nik) => {
    const angka = String(nik ?? '');
    if(angka.length <= 6){
        return '*'.repeat(angka.length);
    }
    return angka.slice(0, 4) + '*'.replace(angka.length - 6) + angka.slice(-2);
};

const enkripsiKolom = (baris, kolom) => {
    const salinan = {...baris};
    for(const nama of kolom){
        if(nama in salinan){
            salinan[nama] = enkripsi(salinan[nama]);
        }
    }
    return salinan;
};

const deskripsiKolom = (baris, kolom) => {
    if(!baris){
        return baris
    };
    const salinan = {...baris};
    for(const nama of kolom){
        if(nama in salinan){
            salinan[nama] = deskripsi(salinan[nama]);
        }
    }
    return salinan;
};

const hashPassword = (password) => bcrypt.hash(password, PUTARAN_BCRYPT);

const cocokPassword = async(password, hash) => {
    const cocok = await bcrypt.compare(password, hash || HASH_PALSU);
    return Boolean(hash) && cocok;
};

module.exports = {
    enkripsi,
    dekripsi,
    blindIndex,
    hashNik,
    maskNik,
    enkripsiKolom,
    deskripsiKolom,
    hashPassword,
    cocokPassword
};