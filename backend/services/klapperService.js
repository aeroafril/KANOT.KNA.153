const Klapper = require('../models/Klapper');
const { KLAPPER } = require('../config/bukuConfig');

const susunNilai = (cfgBuku, baris) => {
  const sumber = cfgBuku.klapper;
  const nilai = {};

  for (const [kolomKlapper, kolomBuku] of Object.entries(sumber.peta)) {
    nilai[kolomKlapper] = baris[kolomBuku] ?? null;
  }

  if (sumber.jenis === 'akta') {
    nilai.id_buku_tamu = baris.id_buku_tamu ?? null;
    nilai.nomor_reportorium = `${baris.nomor_akta}/${baris.tahun}`;
  }

  return nilai;
};

class KlapperService {
  static async simpan(cfgBuku, baris, client) {
    if (!cfgBuku.klapper || baris.nihil) {
      return;
    }
    const sumber = cfgBuku.klapper;
    await Klapper.simpanDariSumber(
      KLAPPER[sumber.jenis],
      sumber.fk,
      baris[cfgBuku.pk],
      susunNilai(cfgBuku, baris),
      client
    );
  }

  static async hapus(cfgBuku, baris, client) {
    if (!cfgBuku.klapper) {
      return;
    }
    const sumber = cfgBuku.klapper;
    await Klapper.hapusDariSumber(KLAPPER[sumber.jenis], sumber.fk, baris[cfgBuku.pk], client);
  }
}

module.exports = KlapperService;