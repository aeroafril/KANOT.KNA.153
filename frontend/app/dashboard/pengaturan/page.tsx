const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2f6b4f] focus:ring-4 focus:ring-[#2f6b4f]/15";

const labelClass = "mb-1.5 block text-sm font-bold text-slate-700";

export default function Pengaturan() {
  return (
    <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Pengaturan Akun</h2>
      <p className="mb-8 mt-2 text-sm text-slate-500">
        Perbarui detail personal, profil, dan informasi akun Anda.
      </p>

      <div className="space-y-5">
        <div>
          <label htmlFor="fullName" className={labelClass}>
            Nama Lengkap
          </label>
          <input id="fullName" type="text" defaultValue="Patricia" className={inputClass} />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input id="email" type="email" defaultValue="patricia@gmail.com" className={inputClass} />
        </div>

        <div>
          <label htmlFor="role" className={labelClass}>
            Peran Jabatan
          </label>
          <input id="role" type="text" defaultValue="Staff Notaris" className={inputClass} />
        </div>

        <div>
          <label htmlFor="timezone" className={labelClass}>
            Zona Waktu
          </label>
          <select id="timezone" defaultValue="WIB" className={`${inputClass} h-[52px]`}>
            <option value="WIB">Waktu Indonesia Barat (WIB) - GMT+7</option>
            <option value="WITA">Waktu Indonesia Tengah (WITA) - GMT+8</option>
            <option value="WIT">Waktu Indonesia Timur (WIT) - GMT+9</option>
          </select>
        </div>

        <button
          type="button"
          className="mt-3 inline-flex items-center justify-center rounded-lg bg-[#2f6b4f] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-black/15 transition hover:bg-[#265a42] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2f6b4f]/30"
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}