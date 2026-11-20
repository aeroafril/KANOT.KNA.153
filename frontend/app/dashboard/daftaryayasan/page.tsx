const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/20";
const labelCls = "mb-1 block text-sm font-semibold text-slate-700";
const btnCls =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-5 py-3 text-[0.95rem] font-semibold text-white shadow-sm transition hover:bg-green-700";
const thCls = "border border-slate-300 px-2.5 py-3 text-xs font-bold uppercase text-slate-700";
const tdCls = "border border-slate-200 px-2.5 py-3 text-sm text-slate-600";

const rows = [
  {
    no: 1,
    idx: 1,
    tgl: "12 Januari 2026",
    akta: "05",
    nama: "Yayasan Cahaya Insan",
    pendiri: "Ahmad Fauzi",
    status: "Aktif",
    alamat: "Jl. Raya Pare No. 20, Kediri",
    daftar: "AHU-AH.01.06-0001",
    sk: "AHU-0002345.AH.01.04",
    ubah: "-",
    ket: "Pendirian",
  },
  {
    no: 2,
    idx: 2,
    tgl: "25 Januari 2026",
    akta: "09",
    nama: "Yayasan Bina Mandiri",
    pendiri: "Siti Rahma",
    status: "Dalam Perubahan",
    alamat: "Jl. Brawijaya No. 8, Kediri",
    daftar: "AHU-AH.01.06-0002",
    sk: "AHU-0002390.AH.01.04",
    ubah: "10 Maret 2026",
    ket: "Perubahan pengurus",
  },
  {
    no: 3,
    idx: 3,
    tgl: "02 Maret 2026",
    akta: "14",
    nama: "Yayasan Harapan Bangsa",
    pendiri: "Hendra Wijaya",
    status: "Tidak Aktif",
    alamat: "Jl. Veteran No. 3, Kediri",
    daftar: "AHU-AH.01.06-0003",
    sk: "AHU-0002455.AH.01.04",
    ubah: "-",
    ket: "-",
  },
];

const badgeCls: Record<string, string> = {
  Aktif: "bg-green-100 text-green-700",
  "Tidak Aktif": "bg-yellow-100 text-yellow-700",
  "Dalam Perubahan": "bg-sky-100 text-sky-700",
};

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const Field = ({ label, placeholder, type = "text" }: { label: string; placeholder?: string; type?: string }) => (
  <div>
    <label className={labelCls}>{label}</label>
    <input type={type} placeholder={placeholder} className={inputCls} />
  </div>
);

const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const showNihilModal = false;

function NihilModal() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60">
      <div className="w-full max-w-[400px] rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-2 text-[1.1rem] font-extrabold text-slate-900">Registrasi NIHIL Bulanan</h3>
        <p className="mb-5 text-xs text-slate-500">
          Catat bulan kosong (tidak ada akta Yayasan) secara resmi untuk laporan bulanan.
        </p>

        <form>
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700">Pilih Bulan</label>
              <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-black outline-none">
                {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700">Pilih Tahun</label>
              <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-black outline-none">
                <option>2026</option>
                <option>2025</option>
                <option>2024</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-500 hover:bg-slate-50">
              Batal
            </button>
            <button type="submit" className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600">
              Simpan NIHIL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BukuDaftarYayasanPage() {
  return (
    <main className="mx-auto w-full max-w-[1600px] p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900">Buku Daftar Yayasan</h1>
        <p className="mt-1 text-slate-500">
          Daftar registrasi buku yayasan resmi beserta pengesahan akta Kemenkumham RI.
        </p>
      </div>

      <div className="mb-5 flex gap-2">
        <button className={btnCls}>+ Daftar Yayasan Baru</button>
        <button className={`${btnCls} !bg-yellow-500 hover:!bg-yellow-600`}>Nihil</button>
      </div>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-slate-900">Pendaftaran Yayasan Baru</h2>

        <form>
          <div className="mb-5 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <span className="text-sm font-semibold text-green-800">
              ✓ Klien Terdaftar Terpilih: <strong>Ahmad Fauzi</strong> (Data otomatis terisi)
            </span>
            <button type="button" className="text-xs font-bold text-red-700 underline">
              Batal Pilih
            </button>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            <Field label="Nama Yayasan" placeholder="Nama Yayasan..." />
            <Field label="Nomor Akta" placeholder="Nomor Akta..." />
            <Field label="Tanggal Akta" type="date" />

            <div className="relative">
              <label className={labelCls}>Nama Pendiri</label>
              <input type="text" placeholder="Ketik nama pendiri..." className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Status Yayasan</label>
              <select className={inputCls}>
                <option>Aktif</option>
                <option>Tidak Aktif</option>
                <option>Dalam Perubahan</option>
              </select>
            </div>

            <Field label="Alamat Kedudukan Yayasan" placeholder="Alamat kantor Yayasan..." />
            <Field label="Didaftarkan di Kemenkumham" placeholder="Nomor agenda pendaftaran..." />
            <Field label="Pengesahan Akta (Kemenkumham)" placeholder="Nomor pengesahan SK..." />
            <Field label="Tanggal Perubahan Akta (Jika ada)" type="date" />
            <Field label="Keterangan" placeholder="Keterangan tambahan..." />

            <div className="col-span-full mt-4 flex w-full gap-2">
              <button type="submit" className={btnCls}>Simpan Register Yayasan</button>
              <button type="button" className={`${btnCls} !bg-slate-500 hover:!bg-slate-600`}>Batal</button>
            </div>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Daftar Yayasan Terdaftar</h2>
            <span className="mt-1 block text-xs text-slate-500">
              Total baris terdaftar (termasuk baris NIHIL bulanan): 4 baris.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input type="text" placeholder="Cari Yayasan..." className={`${inputCls} !w-[200px] !py-1.5`} />
            <select className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none">
              <option>Semua Bulan</option>
              {months.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <select className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none">
              <option>Semua Tahun</option>
              <option>2026</option>
              <option>2025</option>
              <option>2024</option>
            </select>
            <div className="mx-1 h-6 w-px bg-slate-300" />
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-600">
              <DownloadIcon /> PDF
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-green-700">
              <DownloadIcon /> Excel
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[1600px] border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th rowSpan={2} className={`${thCls} w-[70px] text-center`}>No. Urut</th>
                <th rowSpan={2} className={`${thCls} w-[70px] text-center`}>No.</th>
                <th colSpan={2} className={`${thCls} text-center`}>Akta</th>
                <th rowSpan={2} className={`${thCls} min-w-[180px] text-left`}>Yayasan</th>
                <th rowSpan={2} className={`${thCls} min-w-[160px] text-left`}>Nama Pendiri</th>
                <th rowSpan={2} className={`${thCls} min-w-[100px] text-center`}>Status</th>
                <th rowSpan={2} className={`${thCls} min-w-[200px] text-left`}>Alamat Yayasan</th>
                <th rowSpan={2} className={`${thCls} min-w-[200px] text-left`}>Didaftarkan di Kemenkumham RI</th>
                <th rowSpan={2} className={`${thCls} min-w-[180px] text-left`}>Pengesahan Akta</th>
                <th rowSpan={2} className={`${thCls} min-w-[120px] text-center`}>Tanggal Perubahan Akta</th>
                <th rowSpan={2} className={`${thCls} min-w-[150px] text-left`}>Keterangan</th>
                <th rowSpan={2} className={`${thCls} w-[120px] text-center`}>Aksi</th>
              </tr>
              <tr className="bg-slate-50">
                <th className="min-w-[120px] border border-slate-300 px-2.5 py-2 text-left text-xs font-bold text-slate-700">Tanggal</th>
                <th className="min-w-[100px] border border-slate-300 px-2.5 py-2 text-left text-xs font-bold text-slate-700">Nomor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.no} className="transition hover:bg-slate-50">
                  <td className={`${tdCls} text-center font-bold text-slate-900`}>{r.no}</td>
                  <td className={`${tdCls} text-center font-bold text-blue-600`}>{r.idx}</td>
                  <td className={`${tdCls} whitespace-nowrap`}>{r.tgl}</td>
                  <td className={`${tdCls} font-semibold text-slate-900`}>{r.akta}</td>
                  <td className={`${tdCls} font-bold text-slate-900`}>{r.nama}</td>
                  <td className={`${tdCls} font-semibold text-slate-900`}>{r.pendiri}</td>
                  <td className={`${tdCls} text-center`}>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeCls[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className={tdCls}>{r.alamat}</td>
                  <td className={tdCls}>{r.daftar}</td>
                  <td className={`${tdCls} font-semibold`}>{r.sk}</td>
                  <td className={`${tdCls} text-center`}>{r.ubah}</td>
                  <td className={tdCls}>{r.ket}</td>
                  <td className={`${tdCls} whitespace-nowrap text-center`}>
                    <button className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50" aria-label="Hapus Yayasan">
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}

              <tr className="bg-[#fcfcfc]">
                <td className={`${tdCls} text-center text-slate-400`}>---</td>
                <td className={`${tdCls} text-center text-slate-400`}>---</td>
                <td className={`${tdCls} whitespace-nowrap text-center font-bold text-red-500`}>Februari 2026</td>
                <td className={`${tdCls} text-center text-slate-400`}>---</td>
                <td className={`${tdCls} text-center font-bold tracking-[2px] text-red-500`}>N I H I L</td>
                <td className={`${tdCls} text-center text-slate-400`}>--------------------</td>
                {Array.from({ length: 6 }).map((_, i) => (
                  <td key={i} className={`${tdCls} text-center text-slate-400`}>---</td>
                ))}
                <td className={`${tdCls} whitespace-nowrap text-center`}>
                  <button className="mr-1 rounded-md p-1.5 text-sky-600 transition hover:bg-sky-50" aria-label="Edit NIHIL">
                    <EditIcon />
                  </button>
                  <button className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50" aria-label="Hapus NIHIL">
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {showNihilModal && <NihilModal />}
    </main>
  );
}
