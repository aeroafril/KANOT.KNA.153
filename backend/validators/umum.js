const {z} = require('zod');

const kosong = (nilai) => nilai === null || nilai === '' || (typeof nilai === 'string' && nilai.trim() === '');

const opsional = (skema) => z.preprocess((nilai) => (kosong(nilai) ? undefined : nilai), skema.optional());

const bisaKosong = (skema) => z.preprocess((nilai) => (kosong(nilai) ? null : nilai), skema.nullable().optional());

const teks = (label, maks) => z.string(`${label} harus berupa teks`).trim().max(maks, `${label} maksimal ${maks} karakter`);

const teksWajib = (label, maks) => z.string(`${label} wajib diisi`).trim().min(1, `${label} wajib diisi`).max(maks, `${label} maksimal ${maks} karakter`);

const tanggalValid = (nilai) => {
    const d = new Date(`${nilai}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === nilai;
};

const tanggal = (label) => z.string(`${label} harus berupa tanggal`).regex(/^\d{4}-\d{2}-\d{2}$/, `${label} harus berformat YYYY-MM-DD`).refine(tanggalValid, `${label} tidak valid`);

const jam = (label) => z.string(`${label} harus berupa jam`).regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, `${label} harus berformat HH:MM`);

const idAngka = (label) =>z.coerce.number(`${label} tidak valid`).int(`${label} tidak valid`).positive(`${label} tidak valid`).max(2147483647, `${label} tidak valid`);

const boolQuery = z.enum(['true', 'false'], 'Nilai harus true atau false').transform((nilai) => nilai === 'true');

const halaman = {
    page: z.coerce.number('page tidak valid').int('page tidak valid').min(1, 'page minimal 1').default(1),
    limit: z.coerce
        .number('limit tidak valid')
        .int('limit tidak valid')
        .min(1, 'limit minimal 1')
        .max(100, 'limit maksimal 100')
        .default(20)
};

const minimalSatu = (skema) =>
    skema.refine(
        (objek) => Object.values(objek).some((nilai) => nilai !== undefined),
        'Tidak ada data yang diubah'
    );

const paramId = z.object({ id: idAngka('ID') });

module.exports = {
    opsional,
    bisaKosong,
    teks,
    teksWajib,
    tanggal,
    jam,
    idAngka,
    boolQuery,
    halaman,
    minimalSatu,
    paramId
};