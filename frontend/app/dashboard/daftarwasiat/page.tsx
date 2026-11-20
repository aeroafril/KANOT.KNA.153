"use client";

import { useState } from "react";

type WillRow = {
  kind: "will";
  id: string;
  no: number;
  fullName: string;
  formerName: string;
  birthPlace: string;
  birthDate: string;
  occupation: string;
  lastAddress: string;
  deedNumber: string;
  deedDate: string;
  repNumber: string;
  deedType: string;
  notaryName: string;
};

type NihilRow = {
  kind: "nihil";
  id: string;
  dateLabel: string;
};

type Row = WillRow | NihilRow;

const rows: Row[] = [
  { kind: "nihil", id: "NH-001", dateLabel: "Oktober 2026" },
  {
    kind: "will",
    id: "WS-001",
    no: 1,
    fullName: "Ahmad Fauzi",
    formerName: "-",
    birthPlace: "Kediri",
    birthDate: "12 April 1968",
    occupation: "Wiraswasta",
    lastAddress: "Jl. Dhoho No. 45, Kediri",
    deedNumber: "12",
    deedDate: "3 November 2026",
    repNumber: "REP-2026-045",
    deedType: "Wasiat Umum (Terbuka)",
    notaryName: "Khairun Nisa, S.H., M.Kn., Notaris di Kota Kediri",
  },
  {
    kind: "will",
    id: "WS-002",
    no: 2,
    fullName: "Budi Santoso",
    formerName: "Tan Kok Liong",
    birthPlace: "Surabaya",
    birthDate: "3 Agustus 1955",
    occupation: "Pensiunan",
    lastAddress: "Jl. Veteran No. 12, Kediri",
    deedNumber: "13",
    deedDate: "9 November 2026",
    repNumber: "REP-2026-046",
    deedType: "Wasiat Olografis",
    notaryName: "Khairun Nisa, S.H., M.Kn., Notaris di Kota Kediri",
  },
  {
    kind: "will",
    id: "WS-003",
    no: 3,
    fullName: "Dewi Lestari",
    formerName: "-",
    birthPlace: "Malang",
    birthDate: "21 Juni 1972",
    occupation: "Guru",
    lastAddress: "Jl. Pahlawan No. 8, Kediri",
    deedNumber: "14",
    deedDate: "16 November 2026",
    repNumber: "REP-2026-047",
    deedType: "Wasiat Rahasia / Tertutup",
    notaryName: "Khairun Nisa, S.H., M.Kn., Notaris di Kota Kediri",
  },
];

const willCount = rows.filter((r) => r.kind === "will").length;

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

const typeBadge = (type: string) =>
  type.includes("Umum")
    ? "bg-blue-50 text-blue-800"
    : type.includes("Olografis")
      ? "bg-red-50 text-red-800"
      : "bg-green-50 text-green-800";

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

const thTop = "border border-slate-300 bg-slate-50 px-2.5 py-3 text-center text-xs font-bold";
const thSub = "border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-semibold";
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

export default function DaftarWasiat() {
  const [showForm, setShowForm] = useState(false);
  const [showNihilModal, setShowNihilModal] = useState(false);
  const [editingNihil, setEditingNihil] = useState(false);
  const [deedType, setDeedType] = useState("Wasiat Umum (Terbuka)");

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
    setDeedType("Wasiat Umum (Terbuka)");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Buku Daftar Wasiat</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Daftar pelaporan akta wasiat resmi yang dibuat di hadapan Notaris / PPAT sesuai ketentuan Kementerian Hukum
          dan HAM.
        </p>
      </div>

      {!showForm && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={`${buttonBase} bg-blue-600 shadow-blue-600/20 hover:bg-blue-700`}
          >
            + Input Wasiat Baru
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
          <h2 className="mb-5 text-lg font-bold">Input Wasiat Baru</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
            <Field id="testatorName" label="Cari Nama Pembuat Wasiat" placeholder="Nama lengkap pembuat wasiat..." />
            <Field id="formerName" label="Dahulu Bernama" placeholder="Misal: Tan Kok Liong..." />
            <Field id="birthPlace" label="Tempat Lahir" placeholder="Tempat lahir..." />
            <Field id="birthDate" label="Tanggal Lahir" placeholder="Misal: 12 April 1968..." />
            <Field id="occupation" label="Pekerjaan" placeholder="Pekerjaan..." />
            <Field id="lastAddress" label="Alamat Terakhir" placeholder="Alamat terakhir..." />
            <Field id="deedNumber" label="Nomor Akta Wasiat" placeholder="Misal: 12" />
            <Field id="deedDate" label="Tanggal Akta" type="date" />
            <Field id="repNumber" label="Nomor REP" placeholder="Misal: REP-2025-045" />

            <div>
              <label htmlFor="deedType" className={labelClass}>
                Jenis Akta Wasiat
              </label>
              <select
                id="deedType"
                value={deedType}
                onChange={(e) => setDeedType(e.target.value)}
                className={inputClass}
              >
                <option value="Wasiat Umum (Terbuka)">Wasiat Umum (Terbuka)</option>
                <option value="Wasiat Olografis">Wasiat Olografis</option>
                <option value="Wasiat Rahasia / Tertutup">Wasiat Rahasia / Tertutup</option>
                <option value="Lainnya">Lainnya (Ketik Manual)</option>
              </select>
            </div>

            {deedType === "Lainnya" && (
              <Field id="customDeedType" label="Jenis Akta Wasiat Lainnya" placeholder="Jenis kustom..." />
            )}

            <Field id="notaryName" label="Notaris yang Membuat" placeholder="Nama & kedudukan Notaris..." />

            <div className="flex gap-2 pt-2 sm:col-span-2 lg:col-span-full">
              <button type="button" className={`${buttonBase} bg-blue-600 shadow-blue-600/20 hover:bg-blue-700`}>
                Simpan Wasiat
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
            <h2 className="text-lg font-bold">Daftar Wasiat Terdaftar</h2>
            <p className="mt-1 text-xs text-slate-500">Menampilkan {willCount} catatan wasiat yang terdaftar.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Cari nama/alamat/akta..."
              className="w-52 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
            />

            <select aria-label="Filter jenis wasiat" className={selectClass}>
              <option>Semua Jenis Wasiat</option>
              <option>Wasiat Terbuka</option>
              <option>Wasiat Olografis</option>
              <option>Wasiat Rahasia</option>
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
              title="Unduh Daftar Wasiat format PDF"
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              <Icon name="download" />
              PDF
            </button>
            <button
              type="button"
              title="Unduh Daftar Wasiat format Excel"
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <Icon name="download" />
              Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1750px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th rowSpan={2} className={`${thTop} w-16 align-middle`}>
                  NO
                </th>
                <th colSpan={6} className={thTop}>
                  YANG MEMBUAT SURAT WASIAT / YANG MEWARISKAN
                </th>
                <th colSpan={4} className={thTop}>
                  AKTA WASIAT
                </th>
                <th rowSpan={2} className={`${thTop} min-w-[260px] align-middle`}>
                  NAMA &amp; KEDUDUKAN NOTARIS YANG MEMBUAT AKTA WASIAT
                </th>
                <th rowSpan={2} className={`${thTop} w-28 align-middle`}>
                  AKSI
                </th>
              </tr>
              <tr>
                <th className={`${thSub} min-w-[200px]`}>Nama Lengkap</th>
                <th className={`${thSub} min-w-[150px]`}>Dahulu Bernama</th>
                <th className={`${thSub} min-w-[130px]`}>Tempat Lahir</th>
                <th className={`${thSub} min-w-[140px]`}>Tanggal Lahir</th>
                <th className={`${thSub} min-w-[150px]`}>Pekerjaan</th>
                <th className={`${thSub} min-w-[300px]`}>Alamat Terakhir</th>
                <th className={`${thSub} min-w-[120px]`}>No. Akta</th>
                <th className={`${thSub} min-w-[130px]`}>Tanggal Akta</th>
                <th className={`${thSub} min-w-[130px]`}>No. Rep</th>
                <th className={`${thSub} min-w-[180px]`}>Jenis Akta</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) =>
                row.kind === "nihil" ? (
                  <tr key={row.id} className="bg-slate-50/60">
                    <td className={`${td} text-center text-slate-400`}>---</td>
                    <td className={`${td} font-bold tracking-[0.2em] text-red-500`}>N I H I L</td>
                    <td className={`${td} text-slate-400`}>---</td>
                    <td className={`${td} text-slate-400`}>---</td>
                    <td className={`${td} text-slate-400`}>---</td>
                    <td className={`${td} text-slate-400`}>---</td>
                    <td className={`${td} overflow-hidden text-slate-400`}>
                      ------------------------------------------------------
                    </td>
                    <td className={`${td} text-slate-400`}>---</td>
                    <td className={`${td} whitespace-nowrap font-bold text-black`}>{row.dateLabel}</td>
                    <td className={`${td} text-slate-400`}>---</td>
                    <td className={`${td} text-slate-400`}>---</td>
                    <td className={`${td} overflow-hidden text-slate-400`}>-------------------------</td>
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
                    <td className={`${td} font-semibold text-slate-800`}>{row.fullName}</td>
                    <td className={`${td} text-slate-600`}>{row.formerName}</td>
                    <td className={`${td} text-slate-600`}>{row.birthPlace}</td>
                    <td className={`${td} whitespace-nowrap text-slate-600`}>{row.birthDate}</td>
                    <td className={`${td} text-slate-600`}>{row.occupation}</td>
                    <td className={`${td} text-slate-600`}>{row.lastAddress}</td>
                    <td className={`${td} whitespace-nowrap font-semibold text-slate-900`}>{row.deedNumber}</td>
                    <td className={`${td} whitespace-nowrap text-slate-600`}>{row.deedDate}</td>
                    <td className={`${td} whitespace-nowrap text-slate-600`}>{row.repNumber}</td>
                    <td className={td}>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${typeBadge(row.deedType)}`}>
                        {row.deedType}
                      </span>
                    </td>
                    <td className={`${td} text-[13px] text-slate-700`}>{row.notaryName}</td>
                    <td className={`${td} whitespace-nowrap text-center`}>
                      <button
                        type="button"
                        title="Hapus Wasiat"
                        aria-label="Hapus Wasiat"
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
                ? "Ubah bulan kosong secara resmi."
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