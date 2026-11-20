"use client";

import { useState } from "react";

type Status = "Dalam Proses" | "Selesai" | "Tertunda";

type Doc = { id: string; name: string; checked: boolean; hasScan: boolean };

type Log = { id: string; date: string; action: string };

type Entry = {
  id: string;
  no: number;
  entryDate: string;
  deedNumber: string;
  childName: string;
  bioParents: string;
  bioParentsNik: string;
  bioParentsJob: string;
  bioParentsAddress: string;
  adoptiveParents: string;
  adoptiveParentsNik: string;
  adoptiveParentsJob: string;
  adoptiveParentsAddress: string;
  contact: string;
  description: string;
  status: Status;
  documents: Doc[];
  timeline: Log[];
};

type EntryRow = { kind: "entry"; entry: Entry };
type NihilRow = { kind: "nihil"; id: string; dateLabel: string };
type Row = EntryRow | NihilRow;

const docNames = [
  "Fotokopi KTP calon orang tua angkat",
  "Fotokopi Kartu Keluarga",
  "Akta nikah orang tua angkat",
  "Akta kelahiran anak",
  "Surat izin orang tua kandung",
  "Surat keterangan sehat jasmani dan rohani",
  "Surat keterangan catatan kepolisian",
  "Salinan penetapan pengadilan",
];

const makeDocs = (checkedCount: number, scanCount: number): Doc[] =>
  docNames.map((name, i) => ({
    id: `d${i + 1}`,
    name,
    checked: i < checkedCount,
    hasScan: i < scanCount,
  }));

const entries: Entry[] = [
  {
    id: "AA-001",
    no: 1,
    entryDate: "10 November 2026",
    deedNumber: "12/Pdt.P/2026/PN.KDR",
    childName: "Ahmad Rizki Pratama",
    bioParents: "Rahmat dan Sri Wahyuni",
    bioParentsNik: "3571010101900001",
    bioParentsJob: "Buruh",
    bioParentsAddress: "Jl. Mojoroto No. 21, Kediri",
    adoptiveParents: "Herman Wijaya dan Shinta Dewi",
    adoptiveParentsNik: "3571022202850002",
    adoptiveParentsJob: "Guru",
    adoptiveParentsAddress: "Jl. Veteran No. 12, Kediri",
    contact: "0812-3456-7890",
    description: "Menunggu jadwal sidang",
    status: "Dalam Proses",
    documents: makeDocs(5, 3),
    timeline: [
      { id: "t1", date: "12 November 2026", action: "Klien menyerahkan akta kelahiran anak dan surat izin orang tua kandung." },
      { id: "t2", date: "10 November 2026", action: "Konsultasi awal dan penjelasan daftar persyaratan pengangkatan anak." },
    ],
  },
  {
    id: "AA-002",
    no: 2,
    entryDate: "21 Oktober 2026",
    deedNumber: "09/Pdt.P/2026/PN.KDR",
    childName: "Nadia Putri Lestari",
    bioParents: "Slamet dan Wulandari",
    bioParentsNik: "3571033303880003",
    bioParentsJob: "Pedagang",
    bioParentsAddress: "Jl. Pahlawan No. 8, Kediri",
    adoptiveParents: "Bambang Hartono dan Lestari",
    adoptiveParentsNik: "3571044404800004",
    adoptiveParentsJob: "Pegawai Swasta",
    adoptiveParentsAddress: "Jl. Dhoho No. 45, Kediri",
    contact: "0813-9876-5432",
    description: "Penetapan sudah diterima",
    status: "Selesai",
    documents: makeDocs(8, 8),
    timeline: [
      { id: "t3", date: "30 Oktober 2026", action: "Salinan penetapan pengadilan diterima dan diserahkan kepada klien." },
      { id: "t4", date: "24 Oktober 2026", action: "Sidang penetapan di Pengadilan Negeri Kediri." },
      { id: "t5", date: "21 Oktober 2026", action: "Pendaftaran berkas dan pengecekan kelengkapan dokumen." },
    ],
  },
  {
    id: "AA-003",
    no: 3,
    entryDate: "5 September 2026",
    deedNumber: "",
    childName: "Muhammad Fadli",
    bioParents: "Joko dan Rini",
    bioParentsNik: "",
    bioParentsJob: "",
    bioParentsAddress: "",
    adoptiveParents: "Andi Saputra dan Maya Sari",
    adoptiveParentsNik: "3571055505870005",
    adoptiveParentsJob: "Wiraswasta",
    adoptiveParentsAddress: "Jl. Brawijaya No. 3, Kediri",
    contact: "",
    description: "Menunggu kelengkapan dokumen dari klien",
    status: "Tertunda",
    documents: makeDocs(2, 1),
    timeline: [],
  },
];

const rows: Row[] = [
  { kind: "entry", entry: entries[0] },
  { kind: "entry", entry: entries[1] },
  { kind: "nihil", id: "NH-001", dateLabel: "Agustus 2026" },
  { kind: "entry", entry: entries[2] },
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

const progressOf = (e: Entry) =>
  e.documents.length === 0 ? 0 : Math.round((e.documents.filter((d) => d.checked).length / e.documents.length) * 100);

const badgeClass: Record<Status, string> = {
  "Dalam Proses": "bg-blue-100 text-blue-700",
  Selesai: "bg-green-100 text-green-700",
  Tertunda: "bg-amber-100 text-amber-700",
};

const fillClass: Record<Status, string> = {
  "Dalam Proses": "bg-blue-500",
  Selesai: "bg-green-500",
  Tertunda: "bg-orange-500",
};

const ICONS = {
  download: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"],
  back: ["M19 12H5", "M12 19l-7-7 7-7"],
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
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15";

const labelClass = "mb-1.5 block text-[13px] font-semibold text-slate-600";

const selectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15";

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
  maxLength,
  wide = false,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input id={id} type={type} placeholder={placeholder} maxLength={maxLength} className={inputClass} />
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="border-b border-dashed border-slate-300 pb-2 pt-2 md:col-span-2">
      <h4 className="text-sm font-bold text-blue-600">{children}</h4>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <strong className="text-slate-600">{label}:</strong>{" "}
      <span className="font-semibold text-slate-900">{value || "-"}</span>
    </div>
  );
}

export default function daftarank() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showNihilModal, setShowNihilModal] = useState(false);

  const selected = entries.find((e) => e.id === selectedId) ?? null;

  const openDetail = (id: string) => {
    setSelectedId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Buku Daftar Pengangkatan Anak</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Dokumentasi data berkas, akta, penetapan pengadilan, dan rincian identitas anak serta orang tua.
        </p>
      </div>

      {selected && (
        <div className="rounded-2xl border-2 border-blue-600 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="mb-2 flex items-center gap-1 text-sm font-bold text-blue-600 transition hover:text-blue-800"
              >
                <Icon name="back" />
                Kembali ke Daftar Pengangkatan
              </button>
              <h2 className="text-2xl font-bold text-blue-900">Rincian Detail: {selected.childName}</h2>
            </div>

            <div className="flex gap-2">
              <button type="button" className={`${buttonBase} bg-sky-600 shadow-sky-600/20 hover:bg-sky-700`}>
                Edit Berkas Utama
              </button>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-xl border border-slate-300 bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                Tutup Detail
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="mb-3 border-b-2 border-slate-300 pb-1 text-base font-extrabold text-blue-900">
                  IDENTITAS ORANG TUA KANDUNG
                </h4>
                <div className="space-y-2">
                  <InfoRow label="Nama Lengkap" value={selected.bioParents} />
                  <InfoRow label="NIK" value={selected.bioParentsNik} />
                  <InfoRow label="Pekerjaan" value={selected.bioParentsJob} />
                  <InfoRow label="Alamat Lengkap" value={selected.bioParentsAddress} />
                </div>
              </div>

              <div className="rounded-xl border border-sky-200 bg-sky-50 p-5">
                <h4 className="mb-3 border-b-2 border-blue-300 pb-1 text-base font-extrabold text-sky-800">
                  IDENTITAS ORANG TUA ANGKAT
                </h4>
                <div className="space-y-2">
                  <InfoRow label="Nama Lengkap" value={selected.adoptiveParents} />
                  <InfoRow label="NIK" value={selected.adoptiveParentsNik} />
                  <InfoRow label="Pekerjaan" value={selected.adoptiveParentsJob} />
                  <InfoRow label="Alamat Lengkap" value={selected.adoptiveParentsAddress} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-[13px] sm:grid-cols-2">
                <div>
                  <strong>No. Akta / Penetapan:</strong>
                  <br />
                  {selected.deedNumber || "-"}
                </div>
                <div>
                  <strong>No. HP / Kontak:</strong>
                  <br />
                  {selected.contact || "-"}
                </div>
                <div>
                  <strong>Tanggal Masuk:</strong>
                  <br />
                  {selected.entryDate}
                </div>
                <div>
                  <strong>Keterangan:</strong>
                  <br />
                  {selected.description || "-"}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
              <div>
                <h4 className="text-base font-extrabold text-slate-800">CHECKLIST DOKUMEN PERSYARATAN &amp; SCAN BERKAS</h4>
                <div className="my-3 flex items-center gap-3">
                  <div className="h-3 flex-1 overflow-hidden rounded-md bg-slate-200">
                    <div
                      className={`h-full rounded-md ${fillClass[selected.status]}`}
                      style={{ width: `${progressOf(selected)}%` }}
                    />
                  </div>
                  <span className="whitespace-nowrap text-sm font-extrabold text-slate-700">
                    {progressOf(selected)}% Lengkap
                  </span>
                </div>
              </div>

              <div className="max-h-[380px] space-y-2 overflow-y-auto pr-2">
                {selected.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 ${
                      doc.checked ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={doc.checked}
                        className="h-[18px] w-[18px] cursor-pointer rounded border-slate-300 accent-green-600"
                      />
                      <span className={`text-[13px] font-semibold ${doc.checked ? "text-green-700" : "text-slate-700"}`}>
                        {doc.name}
                      </span>
                    </label>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="rounded-md bg-slate-600 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-slate-700"
                      >
                        Unggah Scan
                      </button>
                      <button
                        type="button"
                        className={`rounded-md px-2 py-1 text-[11px] font-semibold text-white transition ${
                          doc.hasScan ? "bg-green-600 hover:bg-green-700" : "bg-sky-600 hover:bg-sky-700"
                        }`}
                      >
                        Unduh Scan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <h4 className="mb-4 text-[17px] font-extrabold text-blue-900">TIMELINE &amp; RIWAYAT AKTIVITAS</h4>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
              <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h5 className="font-bold text-slate-700">Tambah Log Riwayat</h5>

                <div>
                  <label htmlFor="logDate" className="mb-1 block text-xs font-semibold text-slate-600">
                    Tanggal Aktivitas
                  </label>
                  <input id="logDate" type="date" className={inputClass} />
                </div>

                <div>
                  <label htmlFor="logAction" className="mb-1 block text-xs font-semibold text-slate-600">
                    Detail Kegiatan
                  </label>
                  <input
                    id="logAction"
                    type="text"
                    placeholder="Contoh: Sidang penetapan di PN Jakpus"
                    className={inputClass}
                  />
                </div>

                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-blue-700"
                >
                  + Simpan Log
                </button>
              </div>

              <div className="max-h-64 space-y-3 overflow-y-auto pr-2">
                {selected.timeline.length > 0 ? (
                  selected.timeline.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between gap-3 rounded-r-md border-l-4 border-blue-600 bg-white px-3 py-2 shadow-sm"
                    >
                      <div>
                        <span className="block text-xs font-bold text-blue-600">{log.date}</span>
                        <span className="text-[13px] text-slate-700">{log.action}</span>
                      </div>
                      <button type="button" className="text-xs font-bold text-red-600 transition hover:text-red-800">
                        Hapus
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-[13px] italic text-slate-500">
                    Belum ada riwayat aktivitas untuk pengangkatan ini.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={`${buttonBase} bg-blue-600 shadow-blue-600/20 hover:bg-blue-700`}
          >
            + Registrasi Pengangkatan Anak Baru
          </button>
          <button
            type="button"
            onClick={() => setShowNihilModal(true)}
            className={`${buttonBase} bg-yellow-500 shadow-yellow-500/20 hover:bg-yellow-600`}
          >
            Nihil
          </button>
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <h3 className="mb-4 text-lg font-bold text-blue-900">Pencatatan Baru Pengangkatan Anak</h3>

          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <SectionTitle>DATA ANAK &amp; UMUM</SectionTitle>
            <Field id="entryDate" label="Tanggal Masuk" type="date" />
            <Field id="deedNumber" label="No. Akta / Penetapan" placeholder="Contoh: 12/Pdt.P/2026/PN.JKT" />
            <Field id="childName" label="Nama Anak" placeholder="Masukkan nama lengkap anak" />
            <Field id="childBirthInfo" label="TTL / Usia Anak" placeholder="Contoh: Jakarta, 12 Mei 2024 / 2 Tahun" />

            <SectionTitle>DATA ORANG TUA KANDUNG</SectionTitle>
            <Field id="bioParents" label="Nama Orang Tua Kandung" placeholder="Contoh: Rahmat & Sri Wahyuni" />
            <Field id="bioParentsNik" label="NIK Orang Tua Kandung" placeholder="Masukkan NIK 16 digit" maxLength={16} />
            <Field id="bioParentsJob" label="Pekerjaan Orang Tua Kandung" placeholder="Contoh: Buruh, Pedagang" />
            <Field
              id="bioParentsAddress"
              label="Alamat Lengkap Orang Tua Kandung"
              placeholder="Masukkan alamat kediaman ortu kandung"
            />

            <SectionTitle>DATA ORANG TUA ANGKAT</SectionTitle>
            <Field id="adoptiveParents" label="Nama Orang Tua Angkat" placeholder="Contoh: Herman Wijaya & Shinta" />
            <Field
              id="adoptiveParentsNik"
              label="NIK Orang Tua Angkat"
              placeholder="Masukkan NIK 16 digit"
              maxLength={16}
            />
            <Field id="adoptiveParentsJob" label="Pekerjaan Orang Tua Angkat" placeholder="Contoh: Pegawai, Guru" />
            <Field
              id="adoptiveParentsAddress"
              label="Alamat Lengkap Orang Tua Angkat"
              placeholder="Masukkan alamat kediaman ortu angkat"
            />

            <SectionTitle>KONTAK, STATUS &amp; KETERANGAN</SectionTitle>
            <Field id="contact" label="No. HP / Kontak" placeholder="Contoh: 0812xxxxxxxx" />
            <div>
              <label htmlFor="statusProses" className={labelClass}>
                Status Proses
              </label>
              <select id="statusProses" className={inputClass} defaultValue="Dalam Proses">
                <option>Dalam Proses</option>
                <option>Selesai</option>
                <option>Tertunda</option>
              </select>
            </div>
            <Field id="description" label="Keterangan" placeholder="Catatan tambahan" wide />
          </div>

          <div className="mt-4 flex gap-2">
            <button type="button" className={`${buttonBase} bg-blue-600 shadow-blue-600/20 hover:bg-blue-700`}>
              Simpan Berkas
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-300 bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className={cardClass}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Daftar Pengangkatan Anak Terdaftar</h2>
            <p className="mt-1 text-xs text-slate-500">
              Total baris terdaftar (termasuk baris NIHIL bulanan): {rows.length} baris.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Cari..."
              className="w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
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
              <option>2027</option>
            </select>

            <div className="mx-1 hidden h-6 w-px bg-slate-300 sm:block" />

            <button
              type="button"
              title="Cetak PDF"
              className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-red-700"
            >
              <Icon name="download" />
              PDF
            </button>
            <button
              type="button"
              title="Ekspor Excel"
              className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-green-700"
            >
              <Icon name="download" />
              Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1300px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className={`${th} w-16 text-center`}>No.</th>
                <th className={`${th} min-w-[130px]`}>Tanggal</th>
                <th className={`${th} min-w-[160px]`}>No. Akta / Penetapan</th>
                <th className={`${th} min-w-[160px]`}>Nama Anak</th>
                <th className={`${th} min-w-[180px]`}>Orang Tua Kandung</th>
                <th className={`${th} min-w-[180px]`}>Orang Tua Angkat</th>
                <th className={`${th} min-w-[140px] text-center`}>Progres Berkas</th>
                <th className={`${th} min-w-[130px] text-center`}>Status Proses</th>
                <th className={`${th} w-48 text-center`}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) =>
                row.kind === "nihil" ? (
                  <tr key={row.id} className="bg-slate-50/60">
                    <td className={`${td} text-center text-slate-400`}>---</td>
                    <td className={`${td} whitespace-nowrap font-bold text-red-500`}>{row.dateLabel}</td>
                    <td className={`${td} text-slate-400`}>---</td>
                    <td className={`${td} font-bold tracking-[0.2em] text-red-500`}>N I H I L</td>
                    <td className={`${td} text-slate-400`}>--------------------</td>
                    <td className={`${td} text-slate-400`}>---</td>
                    <td className={`${td} text-center text-slate-400`}>-</td>
                    <td className={`${td} text-center text-slate-400`}>-</td>
                    <td className={`${td} text-center text-slate-400`}>-</td>
                  </tr>
                ) : (
                  <tr key={row.entry.id} className="transition hover:bg-slate-50">
                    <td className={`${td} text-center font-bold text-slate-900`}>{row.entry.no}</td>
                    <td className={`${td} whitespace-nowrap text-slate-600`}>{row.entry.entryDate}</td>
                    <td className={`${td} font-semibold text-slate-900`}>{row.entry.deedNumber || "-"}</td>
                    <td className={`${td} font-bold text-blue-600`}>{row.entry.childName}</td>
                    <td className={`${td} text-slate-700`}>{row.entry.bioParents}</td>
                    <td className={`${td} font-semibold text-blue-900`}>{row.entry.adoptiveParents}</td>
                    <td className={td}>
                      <div className="mx-auto flex w-28 items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded bg-slate-200">
                          <div
                            className={`h-full ${fillClass[row.entry.status]}`}
                            style={{ width: `${progressOf(row.entry)}%` }}
                          />
                        </div>
                        <span className="min-w-[32px] text-right text-xs font-bold text-slate-700">
                          {progressOf(row.entry)}%
                        </span>
                      </div>
                    </td>
                    <td className={`${td} text-center`}>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass[row.entry.status]}`}>
                        {row.entry.status}
                      </span>
                    </td>
                    <td className={td}>
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openDetail(row.entry.id)}
                          className="rounded-md bg-blue-900 px-2 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-950"
                        >
                          Detail
                        </button>
                        <button
                          type="button"
                          className="rounded-md bg-sky-600 px-2 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-md bg-red-600 px-2 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
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

      {showNihilModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">Registrasi NIHIL Bulanan</h3>
            <p className="mb-5 mt-1 text-xs text-slate-500">
              Catat bulan kosong (tidak ada klien) secara resmi untuk laporan bulanan.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="nihilMonth" className="mb-1.5 block text-sm font-bold text-slate-700">
                  Pilih Bulan
                </label>
                <select id="nihilMonth" className={inputClass} defaultValue="Januari">
                  {months.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="nihilYear" className="mb-1.5 block text-sm font-bold text-slate-700">
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
                onClick={() => setShowNihilModal(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-600"
              >
                Simpan NIHIL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}