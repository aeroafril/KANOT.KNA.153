"use client";

import { useState } from "react";

type Tab = "masuk" | "keluar";

type IncomingMail = {
  id: string;
  receivedDate: string;
  letterNumber: string;
  letterDate: string;
  origin: string;
  subject: string;
  destination: string;
  notes: string;
};

type OutgoingMail = {
  id: string;
  letterDate: string;
  letterNumber: string;
  destination: string;
  subject: string;
  sender: string;
  recipient: string;
  notes: string;
};

const incomingMails: IncomingMail[] = [
  {
    id: "SM-001",
    receivedDate: "12 Nov 2026",
    letterNumber: "012/DIR-AD/XI/2026",
    letterDate: "10 Nov 2026",
    origin: "PT Maju Bersama",
    subject: "Permohonan perubahan anggaran dasar",
    destination: "Notaris Khairun Nisa",
    notes: "Lampiran 3 berkas",
  },
  {
    id: "SM-002",
    receivedDate: "9 Nov 2026",
    letterNumber: "B-218/KEMENKUMHAM/2026",
    letterDate: "6 Nov 2026",
    origin: "Kementerian Hukum dan HAM",
    subject: "Pemberitahuan pengesahan badan hukum",
    destination: "Notaris Khairun Nisa",
    notes: "",
  },
  {
    id: "SM-003",
    receivedDate: "3 Nov 2026",
    letterNumber: "045/YHB/X/2026",
    letterDate: "31 Okt 2026",
    origin: "Yayasan Harapan Bangsa",
    subject: "Undangan rapat pembina yayasan",
    destination: "Notaris Khairun Nisa",
    notes: "Perlu konfirmasi kehadiran",
  },
];

const outgoingMails: OutgoingMail[] = [
  {
    id: "SK-001",
    letterDate: "11 Nov 2026",
    letterNumber: "045/NOT/KNA/XI/2026",
    destination: "Kantor Pertanahan Kota Kediri",
    subject: "Permohonan pengecekan sertifikat",
    sender: "Dimas Anggara",
    recipient: "Bagian Pelayanan",
    notes: "",
  },
  {
    id: "SK-002",
    letterDate: "8 Nov 2026",
    letterNumber: "044/NOT/KNA/XI/2026",
    destination: "Budi Santoso",
    subject: "Pemberitahuan kelengkapan berkas pendirian CV",
    sender: "Rina Pratama",
    recipient: "Budi Santoso",
    notes: "Dikirim via surel",
  },
  {
    id: "SK-003",
    letterDate: "2 Nov 2026",
    letterNumber: "043/NOT/KNA/XI/2026",
    destination: "Dinas Penanaman Modal dan PTSP",
    subject: "Permohonan pendaftaran NIB",
    sender: "Siti Aminah",
    recipient: "Petugas Loket",
    notes: "-",
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

const accent: Record<Tab, { button: string; title: string; number: string }> = {
  masuk: {
    button: "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700",
    title: "text-blue-900",
    number: "text-blue-900",
  },
  keluar: {
    button: "bg-green-600 shadow-green-600/20 hover:bg-green-700",
    title: "text-green-800",
    number: "text-green-800",
  },
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15";

const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

const selectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15";

const buttonBase =
  "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition";

const th = "px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500";
const td = "px-3 py-3.5 align-top";

function Field({
  id,
  label,
  type = "text",
  placeholder,
  wide = false,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input id={id} type={type} placeholder={placeholder} className={inputClass} />
    </div>
  );
}

function ActionButtons() {
  return (
    <div className="flex justify-center gap-1">
      <button
        type="button"
        className="rounded-md bg-sky-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700"
      >
        Edit
      </button>
      <button
        type="button"
        className="rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
      >
        Hapus
      </button>
    </div>
  );
}

export default function BukuDaftarSurat() {
  const [activeTab, setActiveTab] = useState<Tab>("masuk");
  const [showForm, setShowForm] = useState(false);

  const a = accent[activeTab];
  const tabLabel = activeTab === "masuk" ? "Surat Masuk" : "Surat Keluar";

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setShowForm(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-blue-900">Buku Daftar Surat</h2>
        <p className="mt-1 text-sm text-slate-500">
          Administrasi pencatatan surat masuk dan surat keluar kantor Notaris &amp; PPAT.
        </p>
      </div>

      <div className="mb-6 flex gap-4 border-b-2 border-slate-200">
        <button
          type="button"
          onClick={() => switchTab("masuk")}
          className={`-mb-0.5 border-b-[3px] px-4 py-3 text-[15px] font-bold transition ${
            activeTab === "masuk" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Surat Masuk ({incomingMails.length})
        </button>
        <button
          type="button"
          onClick={() => switchTab("keluar")}
          className={`-mb-0.5 border-b-[3px] px-4 py-3 text-[15px] font-bold transition ${
            activeTab === "keluar"
              ? "border-green-600 text-green-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Surat Keluar ({outgoingMails.length})
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-slate-300 bg-slate-50 p-5 sm:p-6">
          <h3 className={`mb-5 text-lg font-bold ${a.title}`}>Registrasi {tabLabel} Baru</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {activeTab === "masuk" ? (
              <>
                <Field id="receivedDate" label="Tanggal Masuk" type="date" />
                <Field id="letterNumberIn" label="No. Surat" placeholder="Contoh: 012/DIR-AD/VII/2026" />
                <Field id="letterDateIn" label="Tanggal Surat" type="date" />
                <Field id="origin" label="Asal Surat" placeholder="Nama Pengirim / Instansi Asal" />
                <Field id="subjectIn" label="Perihal" placeholder="Isi pokok surat..." wide />
                <Field id="destinationIn" label="Tujuan Penerima" placeholder="Ditujukan kepada siapa..." />
              </>
            ) : (
              <>
                <Field id="letterDateOut" label="Tanggal Surat Keluar" type="date" />
                <Field id="letterNumberOut" label="No. Surat Keluar" placeholder="Contoh: 045/NOT/KNA/VII/2026" />
                <Field
                  id="destinationOut"
                  label="Tujuan Penerima / Instansi"
                  placeholder="Nama Penerima / Instansi Tujuan"
                />
                <Field id="sender" label="Pengirim (Staf Internal)" placeholder="Staf pembuat surat..." />
                <Field id="subjectOut" label="Perihal Surat Keluar" placeholder="Isi pokok surat..." wide />
                <Field id="recipient" label="Penerima (Nama Kontak)" placeholder="Siapa penerima surat di luar..." />
              </>
            )}

            <Field id="notes" label="Keterangan Tambahan" placeholder="Catatan kecil lainnya..." />

            <div className="flex gap-2 pt-2 md:col-span-2">
              <button type="button" className={`${buttonBase} ${a.button}`}>
                Registrasi Surat
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

      {!showForm && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className={`${buttonBase} ${a.button}`}
            >
              {activeTab === "masuk" ? "+ Tambah Surat Masuk" : "+ Tambah Surat Keluar"}
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Cari no. surat, perihal..."
                className="w-56 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
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
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === "masuk" ? (
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className={`${th} w-12`}>No</th>
                    <th className={th}>Tanggal Masuk</th>
                    <th className={th}>No. Surat</th>
                    <th className={th}>Tanggal Surat</th>
                    <th className={th}>Asal Surat</th>
                    <th className={th}>Perihal</th>
                    <th className={th}>Tujuan</th>
                    <th className={th}>Keterangan</th>
                    <th className={`${th} w-32 text-center`}>Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incomingMails.map((mail, index) => (
                    <tr key={mail.id} className="transition hover:bg-slate-50">
                      <td className={`${td} font-semibold text-slate-500`}>{index + 1}</td>
                      <td className={`${td} whitespace-nowrap`}>{mail.receivedDate}</td>
                      <td className={`${td} font-bold ${accent.masuk.number}`}>{mail.letterNumber}</td>
                      <td className={`${td} whitespace-nowrap`}>{mail.letterDate}</td>
                      <td className={`${td} font-semibold text-slate-700`}>{mail.origin}</td>
                      <td className={td}>{mail.subject}</td>
                      <td className={`${td} text-slate-600`}>{mail.destination}</td>
                      <td className={`${td} italic text-slate-500`}>{mail.notes || "-"}</td>
                      <td className={td}>
                        <ActionButtons />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className={`${th} w-12`}>No</th>
                    <th className={th}>Tanggal Surat</th>
                    <th className={th}>No. Surat</th>
                    <th className={th}>Tujuan</th>
                    <th className={th}>Perihal</th>
                    <th className={th}>Pengirim</th>
                    <th className={th}>Penerima</th>
                    <th className={th}>Keterangan</th>
                    <th className={`${th} w-32 text-center`}>Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outgoingMails.map((mail, index) => (
                    <tr key={mail.id} className="transition hover:bg-slate-50">
                      <td className={`${td} font-semibold text-slate-500`}>{index + 1}</td>
                      <td className={`${td} whitespace-nowrap`}>{mail.letterDate}</td>
                      <td className={`${td} font-bold ${accent.keluar.number}`}>{mail.letterNumber}</td>
                      <td className={`${td} font-semibold text-slate-700`}>{mail.destination}</td>
                      <td className={td}>{mail.subject}</td>
                      <td className={td}>{mail.sender}</td>
                      <td className={td}>{mail.recipient}</td>
                      <td className={`${td} italic text-slate-500`}>{mail.notes || "-"}</td>
                      <td className={td}>
                        <ActionButtons />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}