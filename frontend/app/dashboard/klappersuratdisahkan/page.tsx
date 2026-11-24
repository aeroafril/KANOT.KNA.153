"use client";

import React, { useState, useMemo } from "react";

interface Client {
  id: string;
  name: string;
  address: string;
}

interface KlapperItem {
  id: string;
  appearerName: string;
  letterNature: string;
  legalizedDate: string;
  legalizedNumber: string;
}

const initialClients: Client[] = [
  { id: "1", name: "Ahmad Subarjo", address: "Jl. Merdeka No. 10, Kediri" },
  { id: "2", name: "Budi Santoso", address: "Jl. Brawijaya No. 45, Kediri" },
  { id: "3", name: "Citra Kirana", address: "Jl. Dhoho No. 12, Kediri" },
];

const initialKlapperData: KlapperItem[] = [
  {
    id: "101",
    appearerName: "Ahmad Subarjo",
    letterNature: "Surat Perjanjian",
    legalizedDate: "2026-11-15",
    legalizedNumber: "1",
  },
  {
    id: "102",
    appearerName: "Budi Santoso",
    letterNature: "Surat Kuasa",
    legalizedDate: "2026-11-18",
    legalizedNumber: "2",
  },
  {
    id: "103",
    appearerName: "Citra Kirana",
    letterNature: "Surat Pernyataan",
    legalizedDate: "2026-10-05",
    legalizedNumber: "3",
  },
];

const alphabets = [
  "Semua",
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
];

export default function KlapperLegalisasiPage() {
  const [showForm, setShowForm] = useState(false);
  const [showNihilModal, setShowNihilModal] = useState(false);

  const [appearerName, setAppearerName] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [letterNature, setLetterNature] = useState("Surat Perjanjian");
  const [customNature, setCustomNature] = useState("");
  const [legalizedDate, setLegalizedDate] = useState("");
  const [legalizedNumber, setLegalizedNumber] = useState("");

  const [nihilMonth, setNihilMonth] = useState("11");
  const [nihilYear, setNihilYear] = useState("2026");

  const [klapperList, setKlapperList] = useState<KlapperItem[]>(initialKlapperData);
  const [uniquePastClients] = useState<Client[]>(initialClients);
  const [selectedLetter, setSelectedLetter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const klapperRows = useMemo(() => {
    return klapperList.filter((item) => {
      if (selectedLetter !== "Semua") {
        if (!item.appearerName.toUpperCase().startsWith(selectedLetter)) {
          return false;
        }
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = item.appearerName.toLowerCase().includes(q);
        const matchNature = item.letterNature.toLowerCase().includes(q);
        const matchNumber = item.legalizedNumber.toLowerCase().includes(q);
        if (!matchName && !matchNature && !matchNumber) return false;
      }
      if (item.legalizedDate) {
        const [year, month] = item.legalizedDate.split("-");
        if (filterMonth && month !== filterMonth) return false;
        if (filterYear && year !== filterYear) return false;
      }
      return true;
    });
  }, [klapperList, selectedLetter, searchQuery, filterMonth, filterYear]);

  const handleSaveKlapper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appearerName || !legalizedDate || !legalizedNumber) {
      alert("Mohon lengkapi Nama Penghadap, Tanggal, dan Nomor Pengesahan.");
      return;
    }

    const finalNature =
      letterNature === "Lainnya" && customNature.trim() !== ""
        ? customNature
        : letterNature;

    const newItem: KlapperItem = {
      id: Date.now().toString(),
      appearerName,
      letterNature: finalNature,
      legalizedDate,
      legalizedNumber,
    };

    setKlapperList([newItem, ...klapperList]);
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setAppearerName("");
    setSelectedClient(null);
    setLetterNature("Surat Perjanjian");
    setCustomNature("");
    setLegalizedDate("");
    setLegalizedNumber("");
  };

  const handleSaveNihil = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Registrasi NIHIL untuk bulan ${nihilMonth}-${nihilYear} berhasil disimpan.`);
    setShowNihilModal(false);
  };

  const handleDownloadPDF = () => {
    alert("Mengunduh laporan Klapper dalam format PDF...");
  };

  const handleDownloadExcel = () => {
    alert("Mengunduh laporan Klapper dalam format Excel...");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Klapper Buku Daftar Surat di Bawah Tangan yang Disahkan
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Klapper alfabetis pencatatan indeks nama penghadap / yang diwakili berdasarkan daftar surat disahkan (legalisasi).
          </p>
        </div>

        {!showForm && (
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <button
              onClick={() => {
                setShowForm(true);
                setLegalizedDate(new Date().toISOString().split("T")[0]);
              }}
              className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm cursor-pointer"
            >
              <span>+ Input Klapper Baru</span>
            </button>

            <button
              onClick={() => setShowNihilModal(true)}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors shadow-sm cursor-pointer"
            >
              <span>Registrasi NIHIL</span>
            </button>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-5">Input Klapper Baru</h2>

            <form onSubmit={handleSaveKlapper}>
              {selectedClient && (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3 rounded-lg mb-5">
                  <span className="text-sm text-green-800 font-medium">
                    ✓ Klien Terdaftar Terpilih: <strong>{selectedClient.name}</strong> (Data otomatis terisi)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClient(null);
                      setAppearerName("");
                    }}
                    className="text-red-700 hover:text-red-900 font-bold text-xs underline cursor-pointer"
                  >
                    Batal Pilih
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Penghadap / Yang Diwakili
                  </label>
                  <input
                    type="text"
                    placeholder="Nama penghadap..."
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-white text-slate-900"
                    value={appearerName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAppearerName(val);
                      if (selectedClient && val !== selectedClient.name) {
                        setSelectedClient(null);
                      }
                    }}
                  />

                  {appearerName && !selectedClient && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto mt-1">
                      {uniquePastClients.filter((c) =>
                        c.name.toLowerCase().includes(appearerName.toLowerCase())
                      ).length > 0 ? (
                        uniquePastClients
                          .filter((c) =>
                            c.name.toLowerCase().includes(appearerName.toLowerCase())
                          )
                          .map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setSelectedClient(c);
                                setAppearerName(c.name);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-slate-900 border-b border-slate-100 hover:bg-slate-100 flex justify-between items-center transition-colors cursor-pointer"
                            >
                              <span className="font-semibold">{c.name}</span>
                              <span className="text-slate-500 text-xs truncate max-w-[120px]">
                                {c.address}
                              </span>
                            </button>
                          ))
                      ) : (
                        <div className="px-4 py-3 text-xs text-slate-500">
                          Klien tidak ditemukan (Nama baru akan dibuat)
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sifat Surat
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-slate-900"
                    value={letterNature}
                    onChange={(e) => setLetterNature(e.target.value)}
                  >
                    <option value="Surat Perjanjian">Surat Perjanjian</option>
                    <option value="Surat Pernyataan">Surat Pernyataan</option>
                    <option value="Surat Kuasa">Surat Kuasa</option>
                    <option value="Lainnya">Lainnya (Ketik Manual)</option>
                  </select>
                </div>

                {letterNature === "Lainnya" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Sifat Surat Lainnya
                    </label>
                    <input
                      type="text"
                      placeholder="Sifat surat kustom..."
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-slate-900"
                      value={customNature}
                      onChange={(e) => setCustomNature(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tanggal Pengesahan
                  </label>
                  <input
                    type="date"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-slate-900"
                    value={legalizedDate}
                    onChange={(e) => setLegalizedDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor Pengesahan
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: 4"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-slate-900"
                    value={legalizedNumber}
                    onChange={(e) => setLegalizedNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Simpan Klapper
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-500 hover:bg-slate-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
            PILIH INDEKS HURUF AWAL (KLAPPER):
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {alphabets.map((letChar) => {
              const isActive = selectedLetter === letChar;
              return (
                <button
                  key={letChar}
                  onClick={() => setSelectedLetter(letChar)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all min-w-[36px] text-center cursor-pointer ${
                    isActive
                      ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {letChar}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Daftar Klapper Surat Disahkan{" "}
                {selectedLetter !== "Semua" ? `- Abjad ${selectedLetter}` : ""}
              </h2>
              <span className="text-xs text-slate-500 block mt-0.5">
                Menampilkan {klapperRows.length} catatan klapper terdaftar.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Cari indeks..."
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 w-full sm:w-48 bg-white text-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-slate-900"
              >
                <option value="">Semua Bulan</option>
                <option value="01">Januari</option>
                <option value="02">Februari</option>
                <option value="03">Maret</option>
                <option value="04">April</option>
                <option value="05">Mei</option>
                <option value="06">Juni</option>
                <option value="07">Juli</option>
                <option value="08">Agustus</option>
                <option value="09">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>

              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white text-slate-900"
              >
                <option value="">Semua Tahun</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>

              <div className="hidden sm:block w-px h-6 bg-slate-300 mx-1"></div>

              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer"
                title="Unduh Klapper format PDF"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>PDF</span>
              </button>

              <button
                onClick={handleDownloadExcel}
                className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer"
                title="Unduh Klapper format Excel"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Excel</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full border-collapse min-w-[900px] text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase text-xs font-bold tracking-wider">
                  <th className="border border-slate-300 px-3 py-3 w-16 text-center">
                    NO.
                  </th>
                  <th className="border border-slate-300 px-3 py-3 min-w-[260px] text-left">
                    NAMA PENGHADAP / YANG DIWAKILI
                  </th>
                  <th className="border border-slate-300 px-3 py-3 min-w-[220px] text-left">
                    SIFAT SURAT
                  </th>
                  <th className="border border-slate-300 px-3 py-3 min-w-[160px] text-left">
                    TANGGAL PENGESAHAN
                  </th>
                  <th className="border border-slate-300 px-3 py-3 min-w-[160px] text-left">
                    NOMOR PENGESAHAN
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {klapperRows.map((k, index) => (
                  <tr
                    key={k.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="border border-slate-200 px-3 py-3 text-center font-bold text-slate-900">
                      {index + 1}
                    </td>
                    <td className="border border-slate-200 px-3 py-3 font-bold text-slate-900">
                      {k.appearerName}
                    </td>
                    <td className="border border-slate-200 px-3 py-3 font-semibold text-slate-800">
                      {k.letterNature}
                    </td>
                    <td className="border border-slate-200 px-3 py-3 text-slate-600 whitespace-nowrap">
                      {k.legalizedDate}
                    </td>
                    <td className="border border-slate-200 px-3 py-3 text-slate-700 font-bold whitespace-nowrap">
                      {k.legalizedNumber}
                    </td>
                  </tr>
                ))}

                {klapperRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="border border-slate-200 text-center py-12 text-slate-500"
                    >
                      Tidak ada catatan indeks klapper yang sesuai dengan abjad atau pencarian Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showNihilModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">
                Registrasi NIHIL Bulanan
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-5">
                Catat bulan kosong (tidak ada klien) secara resmi untuk laporan bulanan.
              </p>

              <form onSubmit={handleSaveNihil}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Pilih Bulan
                    </label>
                    <select
                      value={nihilMonth}
                      onChange={(e) => setNihilMonth(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="01">Januari</option>
                      <option value="02">Februari</option>
                      <option value="03">Maret</option>
                      <option value="04">April</option>
                      <option value="05">Mei</option>
                      <option value="06">Juni</option>
                      <option value="07">Juli</option>
                      <option value="08">Agustus</option>
                      <option value="09">September</option>
                      <option value="10">Oktober</option>
                      <option value="11">November</option>
                      <option value="12">Desember</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Pilih Tahun
                    </label>
                    <select
                      value={nihilYear}
                      onChange={(e) => setNihilYear(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNihilModal(false)}
                    className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
                  >
                    Simpan NIHIL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}