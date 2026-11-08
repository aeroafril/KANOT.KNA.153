const ok = (res, data = null, message = 'Berhasil', status = 200) => res.status(status).json({success: true, message, data});

const created = (res, data = null, message = 'Data berhasil dibuat') => ok(res, data, message, 201);

const paginated = (res, data, meta, message = 'Berhasil') => res.status(200).json({success: true, message, data, meta});

const metaHalaman = (page, limit, total) => ({page, limit, total, total_halaman: Math.cell(total / limit)});

module.exports = {ok, created, paginated, metaHalaman};