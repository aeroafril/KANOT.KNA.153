const {z} = require('zod');
const U = require('./umum');
const AppError = require('../utils/AppError');
const {REGISTRASI} = require('../config/bukuConfig');

const namaLabel = (kolom) => {
    const teks = kolom.replace(/_/g, ' ');
    return teks.charAt(0).toUpperCase() + teks.slice(1);
};

const skemaTipe = (kolom, spek, wajib) => {
    const label = namaLabel(kolom);
    switch (spek.tipe){
        case 'teks':
        return wajib ? U.teksWajib(label, spek.maks) : U.teks(label, spek.maks);
        case 'tanggal':
        return U.tanggal(label);
        case 'id':
        return U.idAngka(label);
        case 'uang':
        return z.coerce
            .number(`${label} harus berupa angka`)
            .min(0, `${label} tidak boleh negatif`)
            .max(9999999999999.99, `${label} terlalu besar`);
        default:
        return z.boolean(`${label} harus true atau false`);
    }
};

const bangunSkema = (cfg) => {
    const bentukBuat = {};
    const bentukUbah = {};

    for(const [kolom, spek] of Object.entries(cfg.kolom)){
        const wajib = cfg.wajib.includes(kolom);
        const dasar = skemaTipe(kolom, spek, wajib);

        if(spek.tipe === 'bool'){
            bentukBuat[kolom] = dasar.optional();
            bentukUbah[kolom] = dasar.optional();
        }else{
            bentukBuat[kolom] = U.opsional(dasar);
            bentukUbah[kolom] = wajib ? dasar.optional() : U.bisaKosong(dasar);
        }
    }

    const buat = z.object(bentukBuat).superRefine((objek, ctx) => {
        if(objek.nihil === true){
            return;
        }

        for(const kolom of cfg.wajib){
            if(objek[kolom] === undefined){
                ctx.addIssue({
                    code: 'custom',
                    path: [kolom],
                    message: `${namaLabel(kolom)} wajib diisi`
                });
            }
        }
    });
    return { buat, ubah: U.minimalSatu(z.object(bentukUbah)) };
};

const SKEMA = Object.fromEntries(
    Object.entries(REGISTRASI).map(([jenis, cfg]) => [jenis, bangunSkema(cfg)])
);

const cekJenis = (req, res, next) => {
    const cfg = REGISTRASI[req.params.jenis];
    if(!cfg){
        throw new AppError('Jenis registrasi tidak dikenal', 404);
    }
    req.registrasi = cfg;
    next();
};

const validateRegistrasi = (mode) => (req, res, next) => {
    const hasil = SKEMA[req.params.jenis][mode].parse(req.body ?? {});
    req.body = Object.fromEntries(Object.entries(hasil).filter(([, nilai]) => nilai !== undefined));
    next();
};

const daftar = z.object({
    ...U.halaman,
    q: z.string().trim().max(150).optional(),
    tahun: U.opsional(U.idAngka('tahun').refine((n) => n >= 1900 && n <= 2200, 'tahun tidak valid')),
    status: z.string().trim().max(50).optional()
});

const paramJenisId = z.object({ jenis: z.string(), id: U.idAngka('ID') });

module.exports = { cekJenis, validateRegistrasi, daftar, paramJenisId };