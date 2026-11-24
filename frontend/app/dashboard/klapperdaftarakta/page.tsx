"use client";

import { useState } from "react";

type KlapperRow = {
  id: string;
  no: number;
  appearerName: string;
  deedNature: string;
  deedDate: string;
  deedNumber: string;
  repertoriumNumber: string;
};

const rows: KlapperRow[] = [
  {
    id: "KL-001",
    no: 1,
    appearerName: "CV. Sinar Jaya",
    deedNature: "CV",
    deedDate: "12 November 2026",
    deedNumber: "14",
    repertoriumNumber: "147",
  },
  {
    id: "KL-002",
    no: 2,
    appearerName: "Dewi Lestari",
    deedNature: "Jual Beli",
    deedDate: "16 November 2026",
    deedNumber: "15",
    repertoriumNumber: "148",
  },
  {
    id: "KL-003",
    no: 3,
    appearerName: "PT Maju Bersama",
    deedNature: "PT",
    deedDate: "3 November 2026",
    deedNumber: "12",
    repertoriumNumber: "145",
  },
  {
    id: "KL-004",
    no: 4,
    appearerName: "Yayasan Harapan Bangsa",
    deedNature: "Yayasan",
    deedDate: "9 November 2026",
    deedNumber: "13",
    repertoriumNumber: "146",
  },
];

const alphabets = ["Semua", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

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

const downloadPath = ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"];

function DownloadIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {downloadPath.map((d) => (
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

const th = "border border-slate-300 bg-slate-50 px-2.5 py-3 text-left text-xs font-bold";
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

export default function KlapperAkta() {
  const [showForm, setShowForm] = useState(false);
  const [deedNature, setDeedNature] = useState("PT");
  const [selectedLetter, setSelectedLetter] = useState("Semua");

  const closeForm = () => {
    setShowForm(false);
    setDeedNature("PT");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Klapper Buku Daftar Akta</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Pencatatan indeks Klapper sesuai abjad nama penghadap. Setiap abjad memiliki penomoran urutnya masing-masing.
        </p>
      </div>

      {!showForm && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={`${buttonBase} bg-blue-600 shadow-blue-600/20 hover:bg-blue-700`}
          >
            + Input Klapper Baru
          </button>
        </div>
      )}

      {showForm && (
        <div className={cardClass}>
          <h2 className="mb-5 text-lg font-bold">Input Klapper Baru</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
            <Field id="appearerName" label="Nama Penghadap / Yang Diwakili" placeholder="Nama penghadap..." />

            <div>
              <label htmlFor="deedNature" className={labelClass}>
                Sifat Akta
              </label>
              <select
                id="deedNature"
                value={deedNature}
                onChange={(e) => setDeedNature(e.target.value)}
                className={inputClass}
              >
                <option value="PT">PT</option>
                <option value="Yayasan">Yayasan</option>
                <option value="CV">CV</option>
                <option value="Lainnya">Lainnya (Ketik Manual)</option>
              </select>
            </div>

            {deedNature === "Lainnya" && (
              <Field id="customNature" label="Sifat Akta Lainnya" placeholder="Sifat akta kustom..." />
            )}

            <Field id="deedDate" label="Tanggal Akta" type="date" />
            <Field id="deedNumber" label="Nomor Akta" placeholder="Misal: 12" />
            <Field id="repertoriumNumber" label="Nomor pada Repertorium" placeholder="Misal: 145" />

            <div className="flex gap-2 pt-2 sm:col-span-2 lg:col-span-full">
              <button type="button" className={`${buttonBase} bg-blue-600 shadow-blue-600/20 hover:bg-blue-700`}>
                Simpan Klapper
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-slate-600">PILIH INDEKS HURUF AWAL (KLAPPER):</h3>
        <div className="flex flex-wrap gap-1.5">
          {alphabets.map((letter) => {
            const active = selectedLetter === letter;
            return (
              <button
                key={letter}
                type="button"
                onClick={() => setSelectedLetter(letter)}
                className={`min-w-[36px] rounded-md border px-3 py-2 text-center text-[13px] font-bold transition ${
                  active
                    ? "border-blue-900 bg-blue-900 text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      <div className={cardClass}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">
              Daftar Klapper {selectedLetter !== "Semua" ? `- Abjad ${selectedLetter}` : ""}
            </h2>
            <p className="mt-1 text-xs text-slate-500">Menampilkan {rows.length} catatan klapper terdaftar.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Cari indeks..."
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
              title="Unduh Klapper format PDF"
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              <DownloadIcon />
              PDF
            </button>
            <button
              type="button"
              title="Unduh Klapper format Excel"
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <DownloadIcon />
              Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className={`${th} w-16 text-center`}>NO.</th>
                <th className={`${th} min-w-[300px]`}>NAMA PENGHADAP / YANG DIWAKILI</th>
                <th className={`${th} min-w-[200px]`}>SIFAT AKTA</th>
                <th className={`${th} min-w-[180px]`}>TANGGAL AKTA</th>
                <th className={`${th} min-w-[180px]`}>NO. AKTA</th>
                <th className={`${th} min-w-[200px]`}>NOMOR PADA REPERTORIUM</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50">
                  <td className={`${td} text-center font-bold text-slate-900`}>{row.no}</td>
                  <td className={`${td} font-bold text-slate-900`}>{row.appearerName}</td>
                  <td className={`${td} font-semibold text-slate-900`}>{row.deedNature}</td>
                  <td className={`${td} whitespace-nowrap text-slate-600`}>{row.deedDate}</td>
                  <td className={`${td} whitespace-nowrap font-semibold text-slate-600`}>{row.deedNumber}</td>
                  <td className={`${td} font-bold text-slate-600`}>{row.repertoriumNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}