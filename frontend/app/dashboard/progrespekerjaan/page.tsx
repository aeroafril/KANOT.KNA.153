"use client";

import { useState } from "react";

type JobRow = {
  kind: "job";
  id: string;
  date: string;
  owner: string;
  phone: string;
  category: string;
  jobType: string;
  progress: number;
  worker: string;
  description: string;
};

type NihilRow = {
  kind: "nihil";
  id: string;
  dateLabel: string;
};

type Row = JobRow | NihilRow;

const rows: Row[] = [
  {
    kind: "job",
    id: "J-01",
    date: "12 November 2026",
    owner: "Budi Santoso",
    phone: "0812-3456-7890",
    category: "CV",
    jobType: "Pendirian CV Sinar Jaya",
    progress: 60,
    worker: "Dimas Anggara",
    description: "Menunggu NPWP pengurus dari klien",
  },
  {
    kind: "job",
    id: "J-02",
    date: "9 November 2026",
    owner: "PT Maju Bersama",
    phone: "0813-9876-5432",
    category: "PT",
    jobType: "Perubahan anggaran dasar dan pengurus",
    progress: 85,
    worker: "Rina Pratama",
    description: "Tinggal pengesahan di Kemenkumham",
  },
  {
    kind: "job",
    id: "J-03",
    date: "5 November 2026",
    owner: "Yayasan Harapan Bangsa",
    phone: "0821-1122-3344",
    category: "Yayasan",
    jobType: "Perubahan susunan pengurus yayasan",
    progress: 100,
    worker: "Siti Aminah",
    description: "Selesai, akta sudah diserahkan",
  },
  {
    kind: "job",
    id: "J-04",
    date: "2 November 2026",
    owner: "Dewi Lestari",
    phone: "0856-7788-9900",
    category: "Wasiat",
    jobType: "Pembuatan akta wasiat",
    progress: 25,
    worker: "Bagas Wicaksono",
    description: "Pengumpulan data ahli waris",
  },
  {
    kind: "nihil",
    id: "N-01",
    dateLabel: "Agustus 2026",
  },
];

const templateCategories = ["PT", "CV", "Yayasan", "Wasiat", "Lainnya", "Pengangkatan Anak"];
const defaultCategories = ["PT", "CV", "Yayasan", "Wasiat", "Lainnya"];

const templateItemsByCategory: Record<string, string[]> = {
  PT: [
    "Fotokopi KTP seluruh pengurus",
    "Fotokopi NPWP pengurus",
    "Fotokopi Kartu Keluarga",
    "Nama dan alternatif nama PT",
    "Alamat lengkap kedudukan PT",
    "Susunan modal dan pemegang saham",
  ],
  CV: [
    "Fotokopi KTP seluruh persero",
    "Fotokopi NPWP persero",
    "Fotokopi Kartu Keluarga",
    "Nama dan alamat kedudukan CV",
    "Surat keterangan domisili usaha",
  ],
  Yayasan: [
    "Fotokopi KTP pendiri dan pengurus",
    "Fotokopi NPWP pengurus",
    "Nama dan alamat yayasan",
    "Maksud, tujuan, dan kegiatan yayasan",
    "Rincian kekayaan awal yayasan",
  ],
  Wasiat: ["Fotokopi KTP pewasiat", "Fotokopi Kartu Keluarga", "Data ahli waris", "Daftar harta yang diwasiatkan"],
  Lainnya: [],
  "Pengangkatan Anak": [
    "Fotokopi KTP calon orang tua angkat",
    "Fotokopi akta kelahiran anak",
    "Surat izin dari orang tua kandung",
    "Surat keterangan sehat jasmani dan rohani",
  ],
};

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

const categoryBadge: Record<string, string> = {
  PT: "bg-blue-50 text-blue-800",
  CV: "bg-pink-50 text-pink-800",
  Yayasan: "bg-green-50 text-green-800",
  Wasiat: "bg-orange-50 text-orange-800",
  Lainnya: "bg-slate-100 text-slate-600",
};

const progressColor = (p: number) => (p >= 100 ? "bg-green-500" : p >= 50 ? "bg-blue-500" : "bg-orange-500");

const ICONS = {
  settings: [
    "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  ],
  phone: [
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  ],
  close: ["M18 6L6 18", "M6 6l12 12"],
  search: ["M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z", "M21 21l-4.35-4.35"],
};

function Icon({ name, className = "h-4 w-4" }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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

const smallInputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15";

const selectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15";

const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition";

const th = "border border-slate-300 bg-slate-50 px-2.5 py-3 text-xs font-bold uppercase";
const td = "border border-slate-200 px-2.5 py-3 align-middle";

export default function ProgresPekerjaan() {
  const [showForm, setShowForm] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("PT");

  const currentItems = templateItemsByCategory[selectedCategory] ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Buku Progres Pekerjaan</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Pantau dan kelola berkas persyaratan, riwayat aktivitas, serta progres penyelesaian berkas klien.
        </p>
      </div>

      {!showForm && !showTemplateManager && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={`${buttonBase} bg-blue-600 shadow-blue-600/20 hover:bg-blue-700`}
          >
            + Registrasi Progres Baru
          </button>
          <button
            type="button"
            onClick={() => setShowTemplateManager(true)}
            className={`${buttonBase} bg-sky-600 shadow-sky-600/20 hover:bg-sky-700`}
          >
            <Icon name="settings" />
            Kelola Templat Syarat
          </button>
        </div>
      )}

      {showTemplateManager && (
        <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5 shadow-sm sm:p-6">
          <h3 className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-2 text-lg font-bold text-slate-900">
            <Icon name="settings" className="h-5 w-5" />
            Pengaturan Templat Persyaratan Dokumen
          </h3>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
            <div className="lg:border-r lg:border-slate-200 lg:pr-4">
              <h4 className="mb-2 text-[15px] font-semibold text-slate-600">Kategori Pekerjaan</h4>
              <div className="mb-4 space-y-1">
                {templateCategories.map((cat) => (
                  <div key={cat} className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex-1 rounded-md px-3 py-2 text-left text-[13px] transition ${
                        cat === selectedCategory
                          ? "bg-blue-500 font-bold text-white"
                          : "font-medium text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                    {!defaultCategories.includes(cat) && (
                      <button
                        type="button"
                        aria-label={`Hapus kategori ${cat}`}
                        className="px-2 text-red-500 transition hover:text-red-700"
                      >
                        <Icon name="close" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-1">
                <input type="text" placeholder="Kategori baru..." className={smallInputClass} />
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-blue-700"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-[15px] font-semibold text-slate-600">
                Dokumen Persyaratan untuk Kategori: <strong className="text-blue-900">{selectedCategory}</strong>
              </h4>

              <div className="mb-4 max-h-48 space-y-1 overflow-y-auto rounded-md border border-slate-300 bg-white p-2">
                {currentItems.length === 0 && (
                  <span className="text-[13px] italic text-slate-500">Belum ada dokumen persyaratan bawaan.</span>
                )}
                {currentItems.map((item, idx) => (
                  <div
                    key={item}
                    className="flex items-center justify-between border-b border-slate-100 px-2 py-1.5 text-[13px] last:border-0"
                  >
                    <span>
                      {idx + 1}. {item}
                    </span>
                    <button
                      type="button"
                      aria-label={`Hapus ${item}`}
                      className="text-red-500 transition hover:text-red-700"
                    >
                      <Icon name="close" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input type="text" placeholder="Tambah dokumen persyaratan baru..." className={smallInputClass} />
                <button
                  type="button"
                  className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-blue-700"
                >
                  + Tambah
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setShowTemplateManager(false)}
              className={`${buttonBase} bg-slate-500 shadow-slate-500/20 hover:bg-slate-600`}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-5 border-b border-slate-200 pb-2 text-lg font-bold text-blue-900">
            Pendaftaran Progres Pekerjaan Baru
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="jobDate" className={labelClass}>
                Tanggal Masuk Berkas
              </label>
              <input id="jobDate" type="date" className={inputClass} />
            </div>

            <div>
              <label htmlFor="jobOwner" className={labelClass}>
                Nama Pemilik/Pemohon
              </label>
              <input id="jobOwner" type="text" placeholder="Ketik nama klien..." className={inputClass} />
            </div>

            <div>
              <label htmlFor="jobType" className={labelClass}>
                Jenis Pekerjaan
              </label>
              <input id="jobType" type="text" placeholder="Misal: Pendirian PT Maju Bersama..." className={inputClass} />
            </div>

            <div>
              <label htmlFor="jobCategory" className={labelClass}>
                Kategori Templat
              </label>
              <select id="jobCategory" className={inputClass} defaultValue="PT">
                <option>PT</option>
                <option>CV</option>
                <option>Yayasan</option>
                <option>Wasiat</option>
                <option>Lainnya</option>
              </select>
            </div>

            <div>
              <label htmlFor="jobWorker" className={labelClass}>
                Pekerja (Staf)
              </label>
              <input id="jobWorker" type="text" placeholder="Nama staf yang mengerjakan..." className={inputClass} />
            </div>

            <div>
              <label htmlFor="jobProgress" className={labelClass}>
                Progres Awal (%)
              </label>
              <input id="jobProgress" type="number" min="0" max="100" placeholder="0 - 100" className={inputClass} />
            </div>

            <div>
              <label htmlFor="jobPhone" className={labelClass}>
                No Telepon Klien
              </label>
              <input id="jobPhone" type="text" placeholder="Misal: 0812-3456-7890..." className={inputClass} />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label htmlFor="jobAddress" className={labelClass}>
                Alamat Lengkap Klien
              </label>
              <textarea
                id="jobAddress"
                placeholder="Alamat klien..."
                className={`${inputClass} min-h-[60px] resize-y`}
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label htmlFor="jobDescription" className={labelClass}>
                Keterangan Tambahan
              </label>
              <input
                id="jobDescription"
                type="text"
                placeholder="Keterangan awal mengenai berkas..."
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button type="button" className={`${buttonBase} bg-blue-600 shadow-blue-600/20 hover:bg-blue-700`}>
              Simpan Progres
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
      )}

      <div className={cardClass}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Daftar Progres Pekerjaan</h2>
            <p className="mt-1 text-xs text-slate-500">Total berkas dipantau: {rows.length} baris.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari Pemilik/Pekerjaan/Pekerja..."
                className="w-56 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
              />
            </div>

            <select aria-label="Filter bulan" className={selectClass}>
              <option>Semua Bulan</option>
              {months.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>

            <select aria-label="Filter tahun" className={selectClass}>
              <option>Semua Tahun</option>
              <option>2026</option>
              <option>2027</option>
              <option>2028</option>
            </select>

            <select aria-label="Filter kategori" className={selectClass}>
              <option>Semua Kategori</option>
              <option>PT</option>
              <option>CV</option>
              <option>Yayasan</option>
              <option>Wasiat</option>
              <option>Lainnya</option>
            </select>

            <button
              type="button"
              className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              PDF
            </button>
            <button
              type="button"
              className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className={`${th} w-16 text-center`}>No</th>
                <th className={`${th} w-36`}>Tanggal Masuk</th>
                <th className={`${th} min-w-[220px]`}>Nama Klien (Pemilik/Pemohon)</th>
                <th className={`${th} min-w-[240px]`}>Jenis Pekerjaan</th>
                <th className={`${th} w-44`}>Progres Pekerjaan</th>
                <th className={`${th} min-w-[160px]`}>Pekerja (Staf)</th>
                <th className={`${th} min-w-[200px]`}>Keterangan</th>
                <th className={`${th} w-60 text-center`}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) =>
                row.kind === "nihil" ? (
                  <tr key={row.id} className="bg-slate-50/60">
                    <td className={`${td} text-center text-slate-400`}>---</td>
                    <td className={`${td} whitespace-nowrap font-bold text-red-500`}>{row.dateLabel}</td>
                    <td className={`${td} font-bold tracking-[0.2em] text-red-500`}>N I H I L</td>
                    <td className={`${td} text-slate-400`}>Bulan Kosong</td>
                    <td className={td}>
                      <div className="h-2 w-full overflow-hidden rounded bg-slate-200">
                        <div className="h-full w-full bg-red-500" />
                      </div>
                    </td>
                    <td className={`${td} text-slate-400`}>---</td>
                    <td className={`${td} text-slate-400`}>---</td>
                    <td className={`${td} text-center`}>
                      <button
                        type="button"
                        className="rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
                      >
                        Hapus NIHIL
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={row.id} className="transition hover:bg-slate-50">
                    <td className={`${td} text-center font-semibold`}>{idx + 1}</td>
                    <td className={`${td} whitespace-nowrap`}>{row.date}</td>
                    <td className={td}>
                      <strong>{row.owner}</strong>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <Icon name="phone" className="h-3 w-3" />
                        {row.phone}
                      </span>
                    </td>
                    <td className={td}>
                      <span
                        className={`mr-2 rounded px-1.5 py-0.5 text-[11px] font-bold ${
                          categoryBadge[row.category] ?? categoryBadge.Lainnya
                        }`}
                      >
                        {row.category}
                      </span>
                      {row.jobType}
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded bg-slate-200">
                          <div
                            className={`h-full ${progressColor(row.progress)}`}
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                        <span className="min-w-[32px] text-right text-[13px] font-bold text-slate-700">
                          {row.progress}%
                        </span>
                      </div>
                    </td>
                    <td className={td}>{row.worker}</td>
                    <td className={`${td} max-w-[200px] truncate text-[13px] text-slate-600`} title={row.description}>
                      {row.description}
                    </td>
                    <td className={`${td} text-center`}>
                      <div className="flex justify-center gap-1.5">
                        <button
                          type="button"
                          className="rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          Kelola Berkas
                        </button>
                        <button
                          type="button"
                          className="rounded-md bg-amber-500 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-md bg-red-500 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600"
                        >
                          Hapus
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
    </div>
  );
}