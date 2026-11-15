type Status = "Menunggu" | "Diproses" | "Selesai";

type Guest = {
  id: string;
  name: string;
  category: string;
  address: string;
  purpose: string;
  date: string;
  timeIn: string;
  timeOut: string;
  status: Status;
};

const guests: Guest[] = [
  {
    id: "G-003",
    name: "Yayasan Harapan Bangsa",
    category: "Yayasan",
    address: "Jl. Brawijaya No. 3, Kediri",
    purpose: "Perubahan susunan pengurus yayasan",
    date: "9 November 2026",
    timeIn: "13:20 WIB",
    timeOut: "14:45 WIB",
    status: "Selesai",
  },
  {
    id: "G-002",
    name: "Dewi Lestari",
    category: "Perorangan",
    address: "Jl. Pahlawan No. 8, Kediri",
    purpose: "Konsultasi akta jual beli tanah",
    date: "5 November 2026",
    timeIn: "10:00 WIB",
    timeOut: "",
    status: "Menunggu",
  },
  {
    id: "G-001",
    name: "Budi Santoso",
    category: "CV",
    address: "Jl. Veter an No. 12, Kediri",
    purpose: "Pendirian CV Sinar Jaya",
    date: "3 November 2026",
    timeIn: "09:15 WIB",
    timeOut: "10:30 WIB",
    status: "Diproses",
  },
  {
    id: "G-004",
    name: "PT Maju Bersama",
    category: "PT",
    address: "Jl. Dhoho No. 45, Kediri",
    purpose: "Pendirian PT dan pengurusan NIB",
    date: "21 Oktober 2026",
    timeIn: "11:05 WIB",
    timeOut: "12:10 WIB",
    status: "Selesai",
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

const statusClass: Record<Status, string> = {
  Menunggu: "bg-amber-100 text-amber-700",
  Diproses: "bg-blue-100 text-blue-700",
  Selesai: "bg-green-100 text-green-700",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15";

const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

const buttonBase =
  "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition";

export default function BukuTamu() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Buku Tamu Klien</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Kelola registrasi kunjungan klien dan gunakan filter tahun/bulan untuk memantau data historis.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={`${buttonBase} bg-blue-600 shadow-blue-600/20 hover:bg-blue-700`}>
            + Registrasi Tamu Baru
          </button>
          <button type="button" className={`${buttonBase} bg-yellow-500 shadow-yellow-500/20 hover:bg-yellow-600`}>
            Registrasi NIHIL
          </button>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="mb-5 text-lg font-bold">Registrasi Klien Baru</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="clientName" className={labelClass}>
              Cari / Nama Klien
            </label>
            <input id="clientName" type="text" placeholder="Ketik nama untuk mencari..." className={inputClass} />
          </div>

          <div>
            <label htmlFor="guestAddress" className={labelClass}>
              Alamat Klien
            </label>
            <input id="guestAddress" type="text" placeholder="Alamat klien..." className={inputClass} />
          </div>

          <div>
            <label htmlFor="guestCategory" className={labelClass}>
              Kategori Klien
            </label>
            <select id="guestCategory" className={inputClass} defaultValue="Yayasan">
              <option>Perorangan</option>
              <option>CV</option>
              <option>PT</option>
              <option>Yayasan</option>
            </select>
          </div>

          <div>
            <label htmlFor="guestDate" className={labelClass}>
              Tanggal Kunjungan
            </label>
            <input id="guestDate" type="date" className={inputClass} />
          </div>

          <div>
            <label htmlFor="guestTimeIn" className={labelClass}>
              Waktu Masuk
            </label>
            <input id="guestTimeIn" type="text" placeholder="Misal: 10:15 WIB" className={inputClass} />
          </div>

          <div>
            <label htmlFor="guestTimeOut" className={labelClass}>
              Waktu Keluar
            </label>
            <input id="guestTimeOut" type="text" placeholder="Misal: 11:30 WIB" className={inputClass} />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label htmlFor="guestPurpose" className={labelClass}>
              Keperluan Kunjungan
            </label>
            <input id="guestPurpose" type="text" placeholder="Tujuan kunjungan..." className={inputClass} />
          </div>

          <div className="col-span-full flex gap-2 pt-1">
            <button type="button" className={`${buttonBase} bg-blue-600 shadow-blue-600/20 hover:bg-blue-700`}>
              Simpan
            </button>
            <button type="button" className={`${buttonBase} bg-slate-500 shadow-slate-500/20 hover:bg-slate-600`}>
              Batal
            </button>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Daftar Buku Tamu Klien</h2>
            <p className="mt-1 text-xs text-slate-500">
              Menampilkan {guests.length} kunjungan. Klik badge status untuk mengubahnya.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Cari klien..."
                className="w-44 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
              />
            </div>

            <select
              aria-label="Filter bulan"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
            >
              <option>Semua Bulan</option>
              {months.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>

            <select
              aria-label="Filter tahun"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
            >
              <option>Semua Tahun</option>
              <option>2026</option>
              <option>2025</option>
              <option>2024</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3 font-semibold">Klien</th>
                <th className="px-3 py-3 font-semibold">Kategori</th>
                <th className="px-3 py-3 font-semibold">Alamat</th>
                <th className="px-3 py-3 font-semibold">Keperluan</th>
                <th className="px-3 py-3 font-semibold">Tanggal / Waktu</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {guests.map((g) => (
                <tr key={g.id} className="transition hover:bg-slate-50">
                  <td className="px-3 py-3.5">
                    <p className="font-semibold text-slate-900">{g.name}</p>
                    <p className="text-xs text-slate-400">{g.id}</p>
                  </td>
                  <td className="px-3 py-3.5 font-semibold text-slate-600">{g.category}</td>
                  <td className="max-w-[150px] truncate px-3 py-3.5 text-slate-600">{g.address}</td>
                  <td className="max-w-[200px] px-3 py-3.5 text-slate-900">{g.purpose}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-500">
                    <div>{g.date}</div>
                    <div className="mt-0.5 text-xs text-slate-600">Masuk: {g.timeIn}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
                      Keluar:{" "}
                      {g.timeOut ? (
                        g.timeOut
                      ) : (
                        <span className="rounded bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                          Set Keluar
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[g.status]}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        aria-label="Edit klien"
                        className="rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"      
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="Hapus klien"
                        className="rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}