"use client";

import { useState } from "react";

type DeedRow = {
  kind: "deed";
  id: string;
  serialNum: number;
  monthlyNum: number;
  dateLabel: string;
  category: string;
  purpose: string;
  name: string;
};

type NihilRow = {
  kind: "nihil";
  id: string;
  dateLabel: string;
};

type Row = DeedRow | NihilRow;

const rows: Row[] = [
  { kind: "nihil", id: "NH-001", dateLabel: "Oktober 2026" },
  {
    kind: "deed",
    id: "AK-001",
    serialNum: 1,
    monthlyNum: 1,
    dateLabel: "3 November 2026",
    category: "PT",
    purpose: "Pendirian PT dan pengurusan NIB",
    name: "PT Maju Bersama",
  },
  {
    kind: "deed",
    id: "AK-002",
    serialNum: 2,
    monthlyNum: 2,
    dateLabel: "5 November 2026",
    category: "Jual Beli",
    purpose: "Akta jual beli tanah",
    name: "Dewi Lestari",
  },
  {
    kind: "deed",
    id: "AK-003",
    serialNum: 3,
    monthlyNum: 3,
    dateLabel: "9 November 2026",
    category: "Yayasan",
    purpose: "Perubahan susunan pengurus yayasan",
    name: "Yayasan Harapan Bangsa",
  },
];

const deedCount = rows.filter((r) => r.kind === "deed").length;

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const ICONS = {
  download: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"],
  edit: [
    "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
    "M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  ],
  trash: [
    "M3 6h18",
    "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
    "M10 11v6",
    "M14 11v6",
  ],
};

function Icon({ name, className = "h-4 w-4" }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15";

const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

const selectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

const buttonBase =
  "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition";

const th = "border border-slate-300 bg-slate-50 px-2.5 py-3 text-xs font-bold";
const td = "border border-slate-200 px-2.5 py-3 align-middle";

export default function DaftarAkta() {
  const [showForm, setShowForm] = useState(false);
  const [showNihilModal, setShowNihilModal] = useState(false);
  const [editingNihil, setEditingNihil] = useState(false);
  const [category, setCategory] = useState("PT");

  const openNihil = (editing: boolean) => {
    setEditingNihil(editing);
    setShowNihilModal(true);
  };

  const closeNihil = () => {
    setShowNihilModal(false);
    setEditingNihil(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setCategory("PT");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Buku Daftar Akta</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Data akta resmi notaris/PPAT yang diambil secara otomatis dari daftar Buku Tamu Klien berdasarkan kategori
          dokumen.
        </p>
      </div>

      {!showForm && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={`${buttonBase} bg-blue-600 shadow-blue-600/20 hover:bg-blue-700`}
          >
            + Input Akta Baru
          </button>
          <button
            type="button"
            onClick={() => openNihil(false)}
            className={`${buttonBase} bg-yellow-500 shadow-yellow-500/20 hover:bg-yellow-600`}
          >
            Nihil
          </button>
        </div>
      )}

      {showForm && (
        <div className={cardClass}>
          <h2 className="mb-5 text-lg font-bold">Input Akta Baru</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="deedDate" className={labelClass}>
                Tanggal Akta
              </label>
              <input id="deedDate" type="date" className={inputClass} />
            </div>

            <div>
              <label htmlFor="clientSearch" className={labelClass}>
                Cari Nama Penghadap
              </label>
              <input
                id="clientSearch"
                type="text"
                autoComplete="off"
                placeholder="Cari nama penghadap..."
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="deedCategory" className={labelClass}>
                Sifat Akta
              </label>
              <select
                id="deedCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                <option value="PT">PT (Perseroan Terbatas)</option>
                <option value="Yayasan">Yayasan</option>
                <option value="CV">CV (Commanditaire Vennootschap)</option>
                <option value="Lainnya">Lainnya (Ketik Manual)</option>
              </select>
            </div>

            {category === "Lainnya" && (
              <div>
                <label htmlFor="customCategory" className={labelClass}>
                  Sifat Akta Lainnya
                </label>
                <input id="customCategory" type="text" placeholder="Sifat akta kustom..." className={inputClass} />
              </div>
            )}

            <div>
              <label htmlFor="deedRemarks" className={labelClass}>
                Catatan / Keterangan
              </label>
              <input id="deedRemarks" type="text" placeholder="Catatan akta..." className={inputClass} />
            </div>

            <div className="flex gap-2 pt-2 sm:col-span-2 lg:col-span-3">
              <button type="button" className={`${buttonBase} bg-blue-600 shadow-blue-600/20 hover:bg-blue-700`}>
                Simpan Akta
              </button>
              <button
                type="button"
                onClick={closeForm}
                className={`${buttonBase} bg-slate-500 shadow-slate-500/20 hover:bg-slate-600`}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={cardClass}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold">Daftar Akta Terdaftar (Buku Tamu Klien)</h2>
            <p className="mt-1 text-xs text-slate-500">
              Menampilkan {deedCount} akta. Gunakan kolom pencarian di atas atau filter bulan/tahun untuk memfilter
              data. Untuk menambah atau mengedit data akta, silakan kelola langsung melalui tab Buku Tamu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Cari akta..."
              className="w-44 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
            />

            <select aria-label="Filter bulan" className={selectClass}>
              <option>Semua Bulan</option>
              {months.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>

            <select aria-label="Filter tahun" className={selectClass}>
              <option>Semua Tahun</option>
              <option>2026</option>
              <option>2025</option>
              <option>2024</option>
            </select>

            <div className="mx-1 hidden h-6 w-px bg-slate-300 sm:block" />

            <button
              type="button"
              title="Unduh Buku Akta format PDF"
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              <Icon name="download" />
              PDF
            </button>
            <button
              type="button"
              title="Unduh Buku Akta format Excel"
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <Icon name="download" />
              Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className={`${th} w-20 text-center`}>No. Urut</th>
                <th className={`${th} w-28 text-center`}>No. Bulanan</th>
                <th className={`${th} min-w-[150px]`}>Tanggal Akta</th>
                <th className={`${th} min-w-[200px]`}>Sifat Akta</th>
                <th className={`${th} min-w-[300px]`}>Nama Penghadap &amp; Yang Diwakili</th>
                <th className={`${th} w-28 text-center`}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) =>
                row.kind === "nihil" ? (
                  <tr key={row.id} className="bg-slate-50/60">
                    <td className={`${td} text-center text-slate-400`}>---</td>
                    <td className={`${td} text-center text-slate-400`}>---</td>
                    <td className={`${td} whitespace-nowrap font-bold text-black`}>{row.dateLabel}</td>
                    <td className={`${td} text-center font-bold tracking-[0.2em] text-red-500`}>N I H I L</td>
                    <td className={`${td} overflow-hidden text-center text-slate-400`}>
                      ------------------------------------------------------------
                    </td>
                    <td className={`${td} whitespace-nowrap text-center`}>
                      <div className="flex justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openNihil(true)}
                          title="Edit NIHIL"
                          aria-label="Edit NIHIL"
                          className="rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          type="button"
                          title="Hapus NIHIL"
                          aria-label="Hapus NIHIL"
                          className="rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                        >
                          <Icon name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={row.id} className="transition hover:bg-slate-50">
                    <td className={`${td} text-center font-bold text-slate-900`}>{row.serialNum}</td>
                    <td className={`${td} text-center font-semibold text-slate-600`}>{row.monthlyNum}</td>
                    <td className={`${td} whitespace-nowrap text-slate-600`}>{row.dateLabel}</td>
                    <td className={`${td} text-slate-900`}>
                      <div className="font-bold">{row.category}</div>
                      <div className="mt-0.5 text-xs text-slate-500">Keperluan: {row.purpose}</div>
                    </td>
                    <td className={`${td} text-slate-700`}>{row.name}</td>
                    <td className={`${td} whitespace-nowrap text-center`}>
                      <div className="flex justify-center gap-1.5">
                        <button
                          type="button"
                          title="Edit di Buku Tamu"
                          aria-label="Edit Klien"
                          className="rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          type="button"
                          title="Hapus Akta"
                          aria-label="Hapus Akta"
                          className="rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                        >
                          <Icon name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNihilModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">
              {editingNihil ? "Edit Registrasi NIHIL" : "Registrasi NIHIL Bulanan"}
            </h3>
            <p className="mb-5 mt-1 text-xs text-slate-500">
              {editingNihil
                ? "Ubah bulan kosong (tidak ada klien) secara resmi."
                : "Catat bulan kosong (tidak ada klien) secara resmi untuk laporan bulanan."}
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="nihilMonth" className={labelClass}>
                  Pilih Bulan
                </label>
                <select id="nihilMonth" className={inputClass} defaultValue="Januari">
                  {months.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="nihilYear" className={labelClass}>
                  Pilih Tahun
                </label>
                <select id="nihilYear" className={inputClass} defaultValue="2026">
                  <option>2026</option>
                  <option>2025</option>
                  <option>2024</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeNihil}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-600"
              >
                {editingNihil ? "Simpan Perubahan" : "Simpan NIHIL"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}