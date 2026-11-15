"use client";

import { useState } from "react";

type CvRow = {
  kind: "cv";
  id: string;
  no: number;
  regNumber: string;
  date: string;
  deedNumber: string;
  cvName: string;
  founders: string;
  cvAddress: string;
  legalization: string;
  description: string;
};

type NihilRow = {
  kind: "nihil";
  id: string;
  dateLabel: string;
};

type Row = CvRow | NihilRow;

const rows: Row[] = [
  {
    kind: "cv",
    id: "CV-001",
    no: 1,
    regNumber: "01/CV/I/2026",
    date: "12 Januari 2026",
    deedNumber: "05",
    cvName: "CV. Sinar Jaya",
    founders: "Budi Santoso",
    cvAddress: "Jl. Veteran No. 12, Kediri",
    legalization: "AHU-0001234.AH.02.01 TAHUN 2026",
    description: "Pendirian CV",
  },
  {
    kind: "cv",
    id: "CV-002",
    no: 2,
    regNumber: "02/CV/I/2026",
    date: "26 Januari 2026",
    deedNumber: "11",
    cvName: "CV. Berkah Mandiri",
    founders: "Dewi Lestari",
    cvAddress: "Jl. Pahlawan No. 8, Kediri",
    legalization: "AHU-0002345.AH.02.01 TAHUN 2026",
    description: "",
  },
  {
    kind: "nihil",
    id: "NH-001",
    dateLabel: "Februari 2026",
  },
  {
    kind: "cv",
    id: "CV-003",
    no: 3,
    regNumber: "03/CV/III/2026",
    date: "9 Maret 2026",
    deedNumber: "18",
    cvName: "CV. Karya Abadi",
    founders: "Ahmad Fauzi",
    cvAddress: "Jl. Dhoho No. 45, Kediri",
    legalization: "AHU-0003456.AH.02.01 TAHUN 2026",
    description: "Perubahan pengurus",
  },
];

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

const th = "border border-slate-300 bg-slate-50 px-2.5 py-3 text-xs font-bold uppercase";
const td = "border border-slate-200 px-2.5 py-3 align-middle";

function Field({
  id,
  label,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input id={id} type={type} placeholder={placeholder} className={inputClass} />
    </div>
  );
}

export default function DaftarCv() {
  const [showForm, setShowForm] = useState(false);
  const [showNihilModal, setShowNihilModal] = useState(false);
  const [editingNihil, setEditingNihil] = useState(false);

  const openNihil = (editing: boolean) => {
    setEditingNihil(editing);
    setShowNihilModal(true);
  };

  const closeNihil = () => {
    setShowNihilModal(false);
    setEditingNihil(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Buku Daftar CV</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Daftar registrasi buku perseroan komanditer (CV) resmi beserta pengesahan akta.
        </p>
      </div>

      {!showForm && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={`${buttonBase} bg-blue-600 shadow-blue-600/20 hover:bg-blue-700`}
          >
            + Daftar CV Baru
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
          <h2 className="mb-5 text-lg font-bold">Pendaftaran CV Baru</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
            <Field id="cvName" label="Nama CV" placeholder="Nama CV..." />
            <Field id="regNumber" label="Nomor Registrasi / Pendaftaran" placeholder="Misal: 03/CV/I/2026" />
            <Field id="deedNumber" label="Nomor Akta" placeholder="Misal: 05" />
            <Field id="deedDate" label="Tanggal Pembuatan Akta" type="date" />
            <Field id="founders" label="Pendiri / Sekutu Komanditer" placeholder="Nama pendiri..." />
            <Field id="cvAddress" label="Alamat Kedudukan CV" placeholder="Alamat kantor CV..." />
            <Field id="legalization" label="Pengesahan Akta (Kemenkumham)" placeholder="Nomor pengesahan SK..." />
            <Field id="description" label="Keterangan" placeholder="Keterangan tambahan..." />

            <div className="flex gap-2 pt-2 sm:col-span-2 lg:col-span-full">
              <button type="button" className={`${buttonBase} bg-blue-600 shadow-blue-600/20 hover:bg-blue-700`}>
                Simpan Register CV
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
          <div>
            <h2 className="text-lg font-bold">Daftar CV Terdaftar</h2>
            <p className="mt-1 text-xs text-slate-500">
              Total baris terdaftar (termasuk baris NIHIL bulanan): {rows.length} baris.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Cari CV..."
              className="w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
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
              title="Unduh Daftar CV format PDF"
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              <Icon name="download" />
              PDF
            </button>
            <button
              type="button"
              title="Unduh Daftar CV format Excel"
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <Icon name="download" />
              Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th rowSpan={2} className={`${th} w-16 text-center`}>
                  No. Urut
                </th>
                <th rowSpan={2} className={`${th} min-w-[140px]`}>
                  No. Reg
                </th>
                <th colSpan={2} className={`${th} text-center`}>
                  Akta
                </th>
                <th rowSpan={2} className={`${th} min-w-[200px]`}>
                  Nama CV
                </th>
                <th rowSpan={2} className={`${th} min-w-[180px]`}>
                  Pendiri
                </th>
                <th rowSpan={2} className={`${th} min-w-[200px]`}>
                  Alamat CV
                </th>
                <th rowSpan={2} className={`${th} min-w-[180px]`}>
                  Pengesahan Akta
                </th>
                <th rowSpan={2} className={`${th} min-w-[150px]`}>
                  Keterangan
                </th>
                <th rowSpan={2} className={`${th} w-28 text-center`}>
                  Aksi
                </th>
              </tr>
              <tr>
                <th className="min-w-[120px] border border-slate-300 bg-slate-50 px-2.5 py-2 text-xs font-bold">
                  Tanggal
                </th>
                <th className="min-w-[100px] border border-slate-300 bg-slate-50 px-2.5 py-2 text-xs font-bold">
                  Nomor
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) =>
                row.kind === "nihil" ? (
                  <tr key={row.id} className="bg-slate-50/60">
                    <td className={`${td} text-center text-slate-400`}>---</td>
                    <td className={`${td} text-center font-bold tracking-[0.2em] text-red-500`}>N I H I L</td>
                    <td className={`${td} whitespace-nowrap text-center font-bold text-red-500`}>{row.dateLabel}</td>
                    <td className={`${td} text-center text-slate-400`}>---</td>
                    <td className={`${td} text-center text-slate-400`}>--------------------</td>
                    <td className={`${td} text-center text-slate-400`}>---</td>
                    <td className={`${td} text-center text-slate-400`}>---</td>
                    <td className={`${td} text-center text-slate-400`}>---</td>
                    <td className={`${td} text-center text-slate-400`}>---</td>
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
                    <td className={`${td} text-center font-bold text-slate-900`}>{row.no}</td>
                    <td className={`${td} font-bold text-slate-900`}>{row.regNumber}</td>
                    <td className={`${td} whitespace-nowrap text-slate-600`}>{row.date}</td>
                    <td className={`${td} font-semibold text-slate-900`}>{row.deedNumber}</td>
                    <td className={`${td} font-bold text-slate-900`}>{row.cvName}</td>
                    <td className={`${td} font-semibold text-slate-900`}>{row.founders}</td>
                    <td className={`${td} text-slate-600`}>{row.cvAddress}</td>
                    <td className={`${td} font-semibold text-slate-600`}>{row.legalization}</td>
                    <td className={`${td} text-slate-600`}>{row.description}</td>
                    <td className={`${td} whitespace-nowrap text-center`}>
                      <button
                        type="button"
                        title="Hapus CV"
                        aria-label="Hapus CV"
                        className="rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                      >
                        <Icon name="trash" />
                      </button>
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
                ? "Ubah bulan kosong (tidak ada akta CV) secara resmi."
                : "Catat bulan kosong (tidak ada akta CV) secara resmi untuk laporan bulanan."}
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