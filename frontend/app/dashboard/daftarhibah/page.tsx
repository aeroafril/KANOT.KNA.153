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
    tgl: "12 Januari 2026",
    akta: "03",
    pemberi: "Ahmad Fauzi",
    penerima: "Rizky Fauzi",
    hubungan: "Anak Kandung",
    objek: "Tanah",
    lokasi: "Jl. Raya Pare No. 20, Kediri",
    sertifikat: "SHM No. 01234",
    nilai: "Rp 250.000.000",
  },
  {
    no: 2,
    tgl: "25 Januari 2026",
    akta: "07",
    pemberi: "Siti Rahma",
    penerima: "Dewi Lestari",
    hubungan: "Keponakan",
    objek: "Rumah",
    lokasi: "Jl. Brawijaya No. 8, Kediri",
    sertifikat: "SHM No. 05678",
    nilai: "Rp 480.000.000",
  },
  {
    no: 3,
    tgl: "02 Maret 2026",
    akta: "11",
    pemberi: "Hendra Wijaya",
    penerima: "Maya Wijaya",
    hubungan: "Anak Kandung",
    objek: "Tanah & Bangunan",
    lokasi: "Jl. Veteran No. 3, Kediri",
    sertifikat: "SHGB No. 00912",
    nilai: "Rp 725.000.000",
  },
];

const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

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

const showNihilModal = false;

function NihilModal() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60">
      <div className="w-full max-w-[400px] rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-5 text-[1.1rem] font-extrabold text-slate-900">Registrasi NIHIL Bulanan</h3>
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

export default function BukuDaftarHibahPage() {
  return (
    <main className="mx-auto w-full max-w-[1600px] p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900">Buku Daftar Hibah</h1>
        <p className="mt-1 text-slate-500">Daftar registrasi pembuatan akta Hibah.</p>
      </div>

      <div className="mb-5 flex gap-2">
        <button className={btnCls}>+ Input Data Hibah</button>
        <button className={`${btnCls} !bg-yellow-500 hover:!bg-yellow-600`}>Nihil</button>
      </div>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-slate-900">Input Data Hibah</h2>

        <form>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            <Field label="Nomor Akta" placeholder="Nomor Akta..." />
            <Field label="Tanggal Akta" type="date" />
            <Field label="Pemberi Hibah" placeholder="Nama pemberi..." />
            <Field label="Penerima Hibah" placeholder="Nama penerima..." />
            <Field label="Hubungan Keluarga" placeholder="Cth: Anak Kandung" />
            <Field label="Jenis Objek" placeholder="Cth: Tanah / Rumah" />
            <Field label="Lokasi / Alamat Objek" placeholder="Alamat objek..." />
            <Field label="Nomor Sertifikat" placeholder="Nomor Sertifikat..." />
            <Field label="Nilai NJOP / Nilai Hibah" placeholder="Rp..." />

            <div className="col-span-full mt-4 flex w-full gap-2">
              <button type="submit" className={btnCls}>Simpan Data</button>
              <button type="button" className={`${btnCls} !bg-slate-500 hover:!bg-slate-600`}>Batal</button>
            </div>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Daftar Hibah Terdaftar</h2>
            <span className="mt-1 block text-xs text-slate-500">Total baris terdaftar: 4 baris.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input type="text" placeholder="Cari data..." className={`${inputCls} !w-[200px] !py-1.5`} />
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
                <th colSpan={2} className={`${thCls} text-center`}>Akta</th>
                <th rowSpan={2} className={`${thCls} min-w-[180px] text-left`}>Pemberi Hibah</th>
                <th rowSpan={2} className={`${thCls} min-w-[180px] text-left`}>Penerima Hibah</th>
                <th rowSpan={2} className={`${thCls} min-w-[140px] text-left`}>Hubungan Keluarga</th>
                <th rowSpan={2} className={`${thCls} min-w-[120px] text-left`}>Jenis Objek</th>
                <th rowSpan={2} className={`${thCls} min-w-[200px] text-left`}>Lokasi / Alamat Objek</th>
                <th rowSpan={2} className={`${thCls} min-w-[140px] text-left`}>No. Sertifikat</th>
                <th rowSpan={2} className={`${thCls} min-w-[140px] text-left`}>Nilai NJOP / Hibah</th>
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
                  <td className={`${tdCls} whitespace-nowrap`}>{r.tgl}</td>
                  <td className={`${tdCls} font-semibold text-slate-900`}>{r.akta}</td>
                  <td className={`${tdCls} font-bold text-slate-900`}>{r.pemberi}</td>
                  <td className={`${tdCls} font-bold text-slate-900`}>{r.penerima}</td>
                  <td className={tdCls}>{r.hubungan}</td>
                  <td className={tdCls}>{r.objek}</td>
                  <td className={tdCls}>{r.lokasi}</td>
                  <td className={tdCls}>{r.sertifikat}</td>
                  <td className={tdCls}>{r.nilai}</td>
                  <td className={`${tdCls} whitespace-nowrap text-center`}>
                    <button className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50" aria-label="Hapus Hibah">
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}

              <tr className="bg-[#fcfcfc]">
                <td className={`${tdCls} text-center text-slate-400`}>---</td>
                <td className={`${tdCls} whitespace-nowrap text-center font-bold text-red-500`}>Februari 2026</td>
                <td className={`${tdCls} text-center text-slate-400`}>---</td>
                <td className={`${tdCls} text-center text-slate-400`}>--------------------</td>
                <td className={`${tdCls} text-center text-slate-400`}>--------------------</td>
                {Array.from({ length: 4 }).map((_, i) => (
                  <td key={i} className={`${tdCls} text-center text-slate-400`}>---</td>
                ))}
                <td className={`${tdCls} text-center font-bold tracking-[2px] text-red-500`}>N I H I L</td>
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