"use client";

import { useState } from "react";

type AgreementRow = {
  kind: "agreement";
  id: string;
  no: number;
  serialNumber: string;
  letterDate: string;
  registeredDate: string;
  nature: string;
  appearerName: string;
  representedName: string;
};

type NihilRow = {
  kind: "nihil";
  id: string;
  dateLabel: string;
};

type Row = AgreementRow | NihilRow;

const rows: Row[] = [
  { kind: "nihil", id: "NH-001", dateLabel: "Oktober 2026" },
  {
    kind: "agreement",
    id: "SB-001",
    no: 1,
    serialNumber: "1",
    letterDate: "1 November 2026",
    registeredDate: "3 November 2026",
    nature: "Surat Perjanjian",
    appearerName: "Budi Santoso",
    representedName: "CV. Sinar Jaya",
  },
  {
    kind: "agreement",
    id: "SB-002",
    no: 2,
    serialNumber: "2",
    letterDate: "4 November 2026",
    registeredDate: "5 November 2026",
    nature: "Surat Pernyataan",
    appearerName: "Dewi Lestari",
    representedName: "",
  },
  {
    kind: "agreement",
    id: "SB-003",
    no: 3,
    serialNumber: "3",
    letterDate: "8 November 2026",
    registeredDate: "9 November 2026",
    nature: "Surat Kuasa",
    appearerName: "Ahmad Fauzi",
    representedName: "PT Maju Bersama",
  },
];

const agreementCount = rows.filter((r) => r.kind === "agreement").length;

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

export default function SuratDibukukan() {
  const [showForm, setShowForm] = useState(false);
  const [showNihilModal, setShowNihilModal] = useState(false);
  const [editingNihil, setEditingNihil] = useState(false);
  const [nature, setNature] = useState("Surat Perjanjian");

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
    setNature("Surat Perjanjian");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Buku Daftar Surat di Bawah Tangan yang Dibukukan
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Daftar pelaporan surat di bawah tangan yang didaftarkan dan dibukukan resmi oleh Notaris / PPAT.
        </p>
      </div>

      {!showForm && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={`${buttonBase} bg-blue-600 shadow-blue-600/20 hover:bg-blue-700`}
          >
            + Input Surat Baru
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
          <h2 className="mb-5 text-lg font-bold">Input Surat Baru</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
            <Field id="appearerName" label="Cari Nama Penghadap" placeholder="Nama penghadap..." />
            <Field id="serialNumber" label="Nomor Urut Surat" placeholder="Misal: 4" />
            <Field id="letterDate" label="Tanggal Surat" type="date" />
            <Field id="registeredDate" label="Tanggal Didaftarkan" type="date" />

            <div>
              <label htmlFor="natureOfLetter" className={labelClass}>
                Sifat Surat
              </label>
              <select
                id="natureOfLetter"
                value={nature}
                onChange={(e) => setNature(e.target.value)}
                className={inputClass}
              >
                <option value="Surat Perjanjian">Surat Perjanjian</option>
                <option value="Surat Pernyataan">Surat Pernyataan</option>
                <option value="Surat Kuasa">Surat Kuasa</option>
                <option value="Lainnya">Lainnya (Ketik Manual)</option>
              </select>
            </div>

            {nature === "Lainnya" && (
              <Field id="customNature" label="Sifat Surat Lainnya" placeholder="Sifat surat kustom..." />
            )}

            <Field
              id="representedName"
              label="Yang Diwakili / Kuasa"
              placeholder="Misal: Tan Kok Liong atau - (Nihil)..."
            />

            <div className="flex gap-2 pt-2 sm:col-span-2 lg:col-span-full">
              <button type="button" className={`${buttonBase} bg-blue-600 shadow-blue-600/20 hover:bg-blue-700`}>
                Simpan Surat
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
          <div>
            <h2 className="text-lg font-bold">Daftar Surat Dibukukan</h2>
            <p className="mt-1 text-xs text-slate-500">Menampilkan {agreementCount} catatan surat yang dibukukan.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Cari surat..."
              className="w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
            />

            <select aria-label="Filter sifat surat" className={selectClass}>
              <option>Semua Sifat Surat</option>
              <option>Perjanjian</option>
              <option>Pernyataan</option>
              <option>Kuasa</option>
            </select>

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
              title="Unduh Daftar Surat format PDF"
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              <Icon name="download" />
              PDF
            </button>
            <button
              type="button"
              title="Unduh Daftar Surat format Excel"
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
                <th className={`${th} w-16 text-center`}>NO.</th>
                <th className={`${th} min-w-[150px]`}>NO. URUT</th>
                <th className={`${th} min-w-[150px]`}>TANGGAL SURAT</th>
                <th className={`${th} min-w-[180px]`}>TANGGAL DI DAFTARKAN</th>
                <th className={`${th} min-w-[250px]`}>SIFAT SURAT</th>
                <th className={`${th} min-w-[300px]`}>NAMA YANG MENANGANI &amp; DIWAKILI/KUASA</th>
                <th className={`${th} w-28 text-center`}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) =>
                row.kind === "nihil" ? (
                  <tr key={row.id} className="bg-slate-50/60">
                    <td className={`${td} text-center text-slate-400`}>---</td>
                    <td className={`${td} text-center text-slate-400`}>---</td>
                    <td className={`${td} text-center text-slate-400`}>---</td>
                    <td className={`${td} whitespace-nowrap font-bold text-red-500`}>{row.dateLabel}</td>
                    <td className={`${td} text-center font-bold tracking-[0.2em] text-red-500`}>N I H I L</td>
                    <td className={`${td} overflow-hidden text-center text-slate-400`}>
                      ------------------------------------------------------
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
                    <td className={`${td} text-center font-bold text-slate-900`}>{row.no}</td>
                    <td className={`${td} font-bold text-slate-900`}>{row.serialNumber}</td>
                    <td className={`${td} whitespace-nowrap text-slate-600`}>{row.letterDate}</td>
                    <td className={`${td} whitespace-nowrap text-slate-600`}>{row.registeredDate}</td>
                    <td className={`${td} font-semibold text-slate-900`}>{row.nature}</td>
                    <td className={`${td} text-slate-700`}>
                      <div className="font-bold">{row.appearerName}</div>
                      {row.representedName && (
                        <div className="mt-1 text-xs text-slate-500">
                          Mewakili/Kuasa dari: <strong>{row.representedName}</strong>
                        </div>
                      )}
                    </td>
                    <td className={`${td} whitespace-nowrap text-center`}>
                      <button
                        type="button"
                        title="Hapus Surat"
                        aria-label="Hapus Surat"
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
                ? "Ubah bulan kosong (tidak ada surat yang didaftarkan) secara resmi."
                : "Catat bulan kosong (tidak ada surat yang didaftarkan) secara resmi untuk laporan bulanan."}
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