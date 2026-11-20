const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/20";
const labelCls = "mb-1 block text-sm font-semibold text-slate-700";
const btnCls =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-5 py-3 text-[0.95rem] font-semibold text-white shadow-sm transition hover:bg-green-700";
const thCls = "border border-slate-300 px-2.5 py-3 text-xs font-bold uppercase text-slate-700";
const tdCls = "border border-slate-200 px-2.5 py-3 text-sm text-slate-600";

const steps = ["Penghadap & Pihak", "Struktur Usaha & Pasal", "Permodalan & Saham"];

const jabatan = ["Direktur Utama", "Direktur", "Komisaris Utama", "Komisaris", "Pemegang Saham", "Lainnya"];
const kehadiran = [
  "Hadir Sendiri",
  "Diwakili berdasarkan Surat Kuasa",
  "Bertindak selaku wali/orang tua",
  "Lainnya",
];

const pasal = [
  "Pasal 1: Nama & Tempat Kedudukan",
  "Pasal 2: Jangka Waktu Berdirinya Perseroan",
  "Pasal 3: Maksud & Tujuan serta Kegiatan Usaha",
  "Pasal 4: Modal",
];

const rows = [
  {
    no: 1,
    reg: "03/PT/I/2026",
    tgl: "12 Januari 2026",
    akta: "08",
    pt: "PT. Maju Bersama",
    pendiri: "Budi Santoso",
    alamat: "Jl. Raya Pare No. 12, Kediri",
    sk: "AHU-0001234.AH.01.01",
    ket: "Pendirian",
  },
  {
    no: 2,
    reg: "04/PT/I/2026",
    tgl: "20 Januari 2026",
    akta: "11",
    pt: "PT. Sinar Nusantara",
    pendiri: "Siti Aminah",
    alamat: "Jl. Brawijaya No. 5, Kediri",
    sk: "AHU-0001302.AH.01.01",
    ket: "Pendirian",
  },
];

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

const Select = ({ options, className = "" }: { options: string[]; className?: string }) => (
  <select className={`${inputCls} ${className}`}>
    {options.map((o) => (
      <option key={o}>{o}</option>
    ))}
  </select>
);

const Field = ({ label, placeholder, required, type = "text" }: { label: string; placeholder?: string; required?: boolean; type?: string }) => (
  <div>
    <label className={labelCls}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input type={type} placeholder={placeholder} className={inputCls} />
  </div>
);

const SectionHead = ({ title, desc, action }: { title: string; desc?: string; action?: string }) => (
  <div className="mb-4 flex items-center justify-between">
    <div>
      <h3 className="text-[0.95rem] font-bold text-slate-900">{title}</h3>
      {desc && <p className="text-xs text-slate-500">{desc}</p>}
    </div>
    {action && (
      <button type="button" className="rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-green-700">
        {action}
      </button>
    )}
  </div>
);

const detailTabs = ["Penghadap & Para Pihak", "Struktur Usaha & Pasal", "Permodalan & Saham"];

const DetailInfo = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span className="block text-xs text-slate-500">{label}</span>
    <strong className="text-[0.95rem] text-slate-900">{value}</strong>
  </div>
);

const DetailHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-3.5 border-b-2 border-slate-100 pb-2 text-base font-bold text-slate-900">{children}</h3>
);

function DetailModal() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/65 p-6 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-8 py-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-green-600">Detail Register PT</span>
            <h2 className="mt-1 text-[1.35rem] font-extrabold text-slate-900">PT. Maju Bersama</h2>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-900">
            ✕
          </button>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50 px-4">
          {detailTabs.map((t, i) => (
            <button
              key={t}
              className={`-mb-px border-b-[3px] px-6 py-4 text-sm font-bold transition ${
                i === 0 ? "border-green-600 text-green-600" : "border-transparent text-slate-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
          <div>
            <DetailHeading>Penghadap Utama</DetailHeading>
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <DetailInfo label="Nama Lengkap" value="Budi Santoso" />
              <DetailInfo label="NIK" value="3506012345670001" />
              <DetailInfo label="Jabatan" value="Direktur Utama" />
              <DetailInfo label="Status Kehadiran" value="Hadir Sendiri" />
            </div>
          </div>

          <div>
            <DetailHeading>Para Pihak Tambahan</DetailHeading>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {["Nama Pihak", "NIK", "Jabatan", "Status Kehadiran"].map((h) => (
                      <th key={h} className="p-2.5 text-left font-semibold text-slate-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="p-2.5 font-bold text-slate-900">Siti Aminah</td>
                    <td className="p-2.5 text-slate-600">3506012345670002</td>
                    <td className="p-2.5 font-semibold text-slate-900">Komisaris</td>
                    <td className="p-2.5 text-slate-600">Hadir Sendiri</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <DetailHeading>Informasi Akta & Perusahaan</DetailHeading>
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <DetailInfo label="Nama PT" value="PT. Maju Bersama" />
              <DetailInfo label="Domisili Kedudukan" value="Jl. Raya Pare No. 12, Kediri" />
              <DetailInfo label="KBLI / Kegiatan Usaha" value="62019 - Jasa Pemrograman" />
              <DetailInfo label="Tanggal Pembuatan Akta" value="12 Januari 2026" />
              <DetailInfo label="Nomor Registrasi Buku" value="03/PT/I/2026" />
              <DetailInfo label="Nomor Akta" value="08" />
              <DetailInfo label="Pengesahan Kemenkumham (SK)" value="AHU-0001234.AH.01.01" />
              <DetailInfo label="Keterangan" value="Pendirian" />
              <DetailInfo label="Masa Jabatan Direksi" value="5 Tahun" />
              <DetailInfo label="Tahun Buku" value="Januari - Desember" />
            </div>
          </div>

          <div>
            <DetailHeading>Draf Anggaran Dasar (Pasal 1 s.d 4)</DetailHeading>
            <div className="flex flex-col gap-4">
              {[
                "Pasal 1: Nama & Tempat Kedudukan",
                "Pasal 2: Jangka Waktu Berdirinya Perseroan",
                "Pasal 3: Maksud & Tujuan serta Kegiatan Usaha",
                "Pasal 4: Modal",
              ].map((p) => (
                <div key={p} className="overflow-hidden rounded-lg border border-slate-200">
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">{p}</div>
                  <div className="whitespace-pre-wrap bg-white p-4 font-mono text-sm leading-relaxed text-slate-800">
                    Belum ada draf pasal untuk PT ini.
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <DetailHeading>Struktur Permodalan</DetailHeading>
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div>
                <span className="block text-xs text-slate-500">Modal Dasar</span>
                <strong className="text-lg text-green-600">Rp 100.000.000</strong>
                <span className="block text-xs italic text-slate-500">(Seratus Juta Rupiah)</span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">Modal Disetor / Ditempatkan</span>
                <strong className="text-lg text-green-600">Rp 25.000.000</strong>
                <span className="block text-xs italic text-slate-500">(Dua Puluh Lima Juta Rupiah)</span>
              </div>
              <DetailInfo label="Total Lembar Saham" value="1.000 lembar" />
              <DetailInfo label="Nilai Nominal Per Saham" value="Rp 100.000" />
              <DetailInfo label="Komposisi Saham" value="A: 50%, B: 50%" />
            </div>
          </div>

          <div>
            <DetailHeading>Alokasi Pemegang Saham & Jabatan Akta</DetailHeading>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="p-2.5 text-left font-semibold text-slate-600">Nama Pemegang Saham</th>
                    <th className="p-2.5 text-left font-semibold text-slate-600">NIK</th>
                    <th className="p-2.5 text-right font-semibold text-slate-600">Jumlah Lembar</th>
                    <th className="p-2.5 text-left font-semibold text-slate-600">Jabatan Akta</th>
                    <th className="p-2.5 text-right font-semibold text-slate-600">Persentase (%)</th>
                    <th className="p-2.5 text-right font-semibold text-slate-600">Total Nominal (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="p-2.5 font-bold text-slate-900">Budi Santoso</td>
                    <td className="p-2.5 text-slate-600">3506012345670001</td>
                    <td className="p-2.5 text-right font-semibold">500 lbr</td>
                    <td className="p-2.5 font-semibold text-slate-900">Direktur Utama</td>
                    <td className="p-2.5 text-right font-bold text-green-600">50.0%</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">Rp 50.000.000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-8 py-4">
          <button className="rounded-lg bg-slate-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-600">
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
}

function NihilModal() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60">
      <div className="w-full max-w-[400px] rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-2 text-[1.1rem] font-extrabold text-slate-900">Registrasi NIHIL Bulanan</h3>
        <p className="mb-5 text-xs text-slate-500">
          Catat bulan kosong (tidak ada akta PT) secara resmi untuk laporan bulanan.
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

const showDetailModal = false;
const showNihilModal = false;

export default function BukuDaftarPTPage() {
  return (
    <main className="mx-auto w-full max-w-[1400px] p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900">Buku Daftar PT</h1>
        <p className="mt-1 text-slate-500">
          Daftar registrasi buku perseroan terbatas (PT) resmi beserta pengesahan akta.
        </p>
      </div>

      <div className="mb-5 flex gap-2">
        <button className={btnCls}>+ Daftar PT Baru</button>
        <button className={`${btnCls} !bg-yellow-500 hover:!bg-yellow-600`}>Nihil</button>
      </div>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-slate-900">Pendaftaran PT Baru</h2>

        <div className="relative mb-10 flex items-center justify-between px-4">
          {steps.map((s, i) => (
            <div key={s} className="contents">
              <div className="relative z-10 flex flex-1 flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white transition ${
                    i === 0 ? "bg-green-600 shadow-lg shadow-green-600/35" : "bg-slate-300"
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`mt-2 text-center text-sm ${i === 0 ? "font-bold text-green-700" : "font-semibold text-slate-500"}`}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && <div className="-mx-4 -translate-y-2.5 h-[3px] flex-1 bg-slate-300" />}
            </div>
          ))}
        </div>

        <form className="space-y-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <span className="text-sm font-semibold text-green-800">
                ✓ Klien Terdaftar Terpilih: <strong>Budi Santoso</strong> (Data otomatis terisi)
              </span>
              <button type="button" className="text-xs font-bold text-red-700 underline">
                Batal Pilih
              </button>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              <div className="relative">
                <label className={labelCls}>
                  Nama Penghadap Utama <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="Nama penghadap..." className={inputCls} />
              </div>
              <Field label="NIK Penghadap Utama" placeholder="Masukkan NIK 16 digit..." />
              <div>
                <label className={labelCls}>Jabatan Penghadap</label>
                <Select options={["Direktur Utama", "Direktur", "Komisaris Utama", "Komisaris", "Penghadap Utama / Kuasa", "Lainnya"]} />
              </div>
              <div>
                <label className={labelCls}>Status Kehadiran</label>
                <Select options={kehadiran} />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <SectionHead
                title="Para Pihak Tambahan (Anggota Lain)"
                desc="Tambahkan para pihak lain yang turut menghadap untuk akta pendirian ini."
                action="+ Tambah Pihak"
              />
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {["Nama Pihak", "NIK", "Jabatan", "Status Kehadiran"].map((h) => (
                        <th key={h} className="p-2.5 text-left font-semibold text-slate-600">{h}</th>
                      ))}
                      <th className="w-20 p-2.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="px-2.5 py-2"><input className={inputCls} placeholder="Nama pihak..." /></td>
                      <td className="px-2.5 py-2"><input className={inputCls} placeholder="NIK..." /></td>
                      <td className="px-2.5 py-2"><Select options={jabatan} /></td>
                      <td className="px-2.5 py-2"><Select options={kehadiran} /></td>
                      <td className="px-2.5 py-2 text-center">
                        <button type="button" className="text-xs font-semibold text-red-500">Hapus</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Struktur Usaha & Informasi Akta</h3>
              <button type="button" className="rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-700">
                Generate / Reset Boilerplate Pasal
              </button>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              <Field label="Nama PT" placeholder="Nama PT... (contoh: PT. Maju Bersama)" required />
              <Field label="Domisili / Alamat PT" placeholder="Alamat kantor PT..." required />
              <Field label="KBLI / Kegiatan Usaha" placeholder="Contoh: 62019 - Jasa Pemrograman..." />
              <Field label="Nomor Registrasi / Pendaftaran" placeholder="Misal: 03/PT/I/2026" />
              <Field label="Nomor Akta" placeholder="Misal: 08" />
              <Field label="Tanggal Pembuatan Akta" type="date" />
              <Field label="Pengesahan Akta (Kemenkumham)" placeholder="Nomor pengesahan SK..." />
              <Field label="Keterangan" placeholder="Keterangan tambahan..." />
              <Field label="Masa Jabatan Direksi" placeholder="Contoh: 5 Tahun" />
              <Field label="Tahun Buku" placeholder="Contoh: Januari - Desember" />
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h4 className="mb-4 text-[0.95rem] font-bold text-slate-900">Draf Anggaran Dasar (Pasal 1 s.d. Pasal 4)</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {pasal.map((p) => (
                  <div key={p} className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">{p}</label>
                    <textarea className={`${inputCls} min-h-[100px] resize-y font-mono`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900">Permodalan & Alokasi Pemegang Saham</h3>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              <Field label="Modal Dasar (Rp)" placeholder="Masukkan modal dasar..." type="number" />
              <Field label="Nilai Nominal Per Saham (Rp)" placeholder="Masukkan nilai nominal..." type="number" />
              <Field label="Jumlah Lembar Saham (Total)" placeholder="Jumlah saham total..." type="number" />
              <div>
                <Field label="Modal Disetor (Rp)" placeholder="Masukkan modal disetor..." type="number" />
                <span className="mt-1 block text-[0.7rem] font-semibold text-green-600">Min. 25% Modal Dasar: Rp 0</span>
              </div>
            </div>

            <Field label="Komposisi Saham" placeholder="Keterangan komposisi saham (misal: A: 50%, B: 50%)..." />

            <div className="border-t border-slate-200 pt-6">
              <SectionHead
                title="Pembagian Lembar Saham & Pemegang Saham"
                desc="Daftarkan pemegang saham beserta alokasi lembar sahamnya."
                action="+ Tambah Pemegang Saham"
              />
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="p-2.5 text-left font-semibold text-slate-600">Nama Pemegang Saham</th>
                      <th className="p-2.5 text-left font-semibold text-slate-600">NIK</th>
                      <th className="p-2.5 text-right font-semibold text-slate-600">Jumlah Lembar</th>
                      <th className="p-2.5 text-left font-semibold text-slate-600">Jabatan Akta</th>
                      <th className="p-2.5 text-right font-semibold text-slate-600">Persentase (%)</th>
                      <th className="p-2.5 text-right font-semibold text-slate-600">Nilai Saham (Rp)</th>
                      <th className="w-20 p-2.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="px-2.5 py-2"><input className={inputCls} placeholder="Nama pemegang saham..." /></td>
                      <td className="px-2.5 py-2"><input className={inputCls} placeholder="NIK..." /></td>
                      <td className="px-2.5 py-2"><input type="number" placeholder="0" className={`${inputCls} w-[100px] text-right`} /></td>
                      <td className="px-2.5 py-2"><Select options={jabatan.slice(0, 5)} /></td>
                      <td className="px-2.5 py-2 text-right font-semibold text-slate-600">0.0%</td>
                      <td className="px-2.5 py-2 text-right font-semibold text-slate-900">0</td>
                      <td className="px-2.5 py-2 text-center">
                        <button type="button" className="text-xs font-semibold text-red-500">Hapus</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h5 className="mb-2 text-sm font-bold uppercase text-slate-700">Ringkasan Saham</h5>
                    <div className="space-y-1 text-[0.825rem]">
                      <div className="flex justify-between"><span>Total Lembar Saham:</span><span className="font-bold">0 lembar</span></div>
                      <div className="flex justify-between"><span>Terdistribusi:</span><span className="font-bold text-slate-900">0 lembar (0%)</span></div>
                      <div className="mt-1 flex justify-between border-t border-slate-200 pt-1">
                        <span>Sisa Saham:</span><span className="font-bold text-yellow-600">0 lembar</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="mb-2 text-sm font-bold uppercase text-slate-700">Ringkasan Nilai Nominal</h5>
                    <div className="space-y-1 text-[0.825rem]">
                      <div className="flex justify-between"><span>Modal Disetor:</span><span className="font-bold">Rp 0</span></div>
                      <div className="flex justify-between"><span>Nilai Alokasi Saham:</span><span className="font-bold text-green-600">Rp 0</span></div>
                      <div className="mt-1 flex justify-between border-t border-slate-200 pt-1">
                        <span>Selisih:</span><span className="font-bold text-green-600">Rp 0</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 border-t border-slate-200 pt-3 text-xs font-semibold">
                  <div className="text-yellow-600">⚠️ Peringatan: Total lembar saham yang terbagi (0) belum sama dengan Total Saham (0).</div>
                  <div className="text-red-500">❌ Peringatan: Total nilai saham teralokasi (Rp 0) tidak sama dengan Modal Disetor (Rp 0).</div>
                  <div className="text-green-600">✓ Alokasi permodalan dan saham 100% valid dan cocok!</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex w-full gap-3 border-t border-slate-200 pt-6">
            <button type="button" className={`${btnCls} !bg-slate-500 hover:!bg-slate-600`}>Kembali</button>
            <button type="button" className={`${btnCls} !bg-slate-500 hover:!bg-slate-600`}>Batal</button>
            <button type="button" className={`${btnCls} ml-auto`}>Lanjut</button>
            <button type="submit" className={btnCls}>Simpan Register PT</button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Daftar PT Terdaftar</h2>
            <span className="mt-1 block text-xs text-slate-500">
              Total baris terdaftar (termasuk baris NIHIL bulanan): 3 baris.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input type="text" placeholder="Cari PT..." className={`${inputCls} !w-[200px] !py-1.5`} />
            <select className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none">
              <option>Semua Bulan</option>
              {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m) => (
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
          <table className="min-w-[1400px] border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th rowSpan={2} className={`${thCls} w-[60px] text-center`}>No. Urut</th>
                <th rowSpan={2} className={`${thCls} min-w-[140px] text-left`}>No. Reg</th>
                <th colSpan={2} className={`${thCls} text-center`}>Akta</th>
                <th rowSpan={2} className={`${thCls} min-w-[200px] text-left`}>Nama PT</th>
                <th rowSpan={2} className={`${thCls} min-w-[180px] text-left`}>Pendiri</th>
                <th rowSpan={2} className={`${thCls} min-w-[200px] text-left`}>Alamat PT</th>
                <th rowSpan={2} className={`${thCls} min-w-[180px] text-left`}>Pengesahan Akta</th>
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
                <tr key={r.no} className="cursor-pointer transition hover:bg-slate-50">
                  <td className={`${tdCls} text-center font-bold text-slate-900`}>{r.no}</td>
                  <td className={`${tdCls} font-bold text-slate-900`}>{r.reg}</td>
                  <td className={`${tdCls} whitespace-nowrap`}>{r.tgl}</td>
                  <td className={`${tdCls} font-semibold text-slate-900`}>{r.akta}</td>
                  <td className={`${tdCls} font-bold text-slate-900`}>{r.pt}</td>
                  <td className={`${tdCls} font-semibold text-slate-900`}>{r.pendiri}</td>
                  <td className={tdCls}>{r.alamat}</td>
                  <td className={`${tdCls} font-semibold`}>{r.sk}</td>
                  <td className={tdCls}>{r.ket}</td>
                  <td className={`${tdCls} whitespace-nowrap text-center`}>
                    <button className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50" aria-label="Hapus PT">
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}

              <tr className="bg-[#fcfcfc]">
                <td className={`${tdCls} text-center text-slate-400`}>---</td>
                <td className={`${tdCls} text-center font-bold tracking-[2px] text-red-500`}>N I H I L</td>
                <td className={`${tdCls} whitespace-nowrap text-center font-bold text-red-500`}>Februari 2026</td>
                {Array.from({ length: 6 }).map((_, i) => (
                  <td key={i} className={`${tdCls} text-center text-slate-400`}>
                    {i === 1 ? "--------------------" : "---"}
                  </td>
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

      {showDetailModal && <DetailModal />}
      {showNihilModal && <NihilModal />}
    </main>
  );
}