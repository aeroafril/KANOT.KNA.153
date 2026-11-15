"use client";

import { FormEvent, useState } from "react";

const inputClass =
  "peer block w-full rounded-xl border border-slate-300 bg-white px-4 pb-2 pt-6 text-[15px] text-slate-900 " +
  "outline-none transition placeholder-transparent " +
  "focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 " +
  "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const labelClass =
  "pointer-events-none absolute left-4 top-4 origin-left text-[15px] text-slate-500 transition-all duration-200 " +
  "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 " +
  "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim()) {
      setError("Username wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccess("Berhasil masuk.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-0 lg:p-6">
      <div
        className="relative flex min-h-screen w-full max-w-6xl overflow-hidden bg-cover bg-center lg:min-h-[680px] lg:rounded-3xl justify-end"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}

      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent" />

          <aside className="relative hidden h-full w-full flex-1 flex-col justify-between p-12 text-white lg:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-bold text-blue-700">
                K
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Kanot.KNA.153
              </span>
            </div>

            <div className="my-auto max-w-md">
              <h1 className="text-4xl font-bold leading-tight tracking-tight">
                Kelola Data Anda dengan Lebih{" "}
                <span className="text-sky-300">Profesional</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed text-white/90">
                Rekapitulasi data kanot-153
              </p>
            </div>

            <div className="flex items-center justify-between text-sm text-white/80">
              <p>© 2026 Kanot.KNA.153. All rights reserved.</p>
              <div className="flex gap-4">
                <a href="#bantuan" className="hover:text-white">
                  Bantuan
                </a>
                <a href="#privasi" className="hover:text-white">
                  Privasi
                </a>
              </div>
            </div>
          </aside>

          <main className="relative m-5 w-full max-w-md self-center rounded-3xl bg-white p-7 shadow-2xl sm:p-10 lg:m-8 lg:w-[420px]">          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-lg font-bold text-white">
              K
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              Kanot.KNA.153
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-center">
              Selamat Datang
            </h2>
          </div>

          <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>
              <strong>Akses Terbatas:</strong> Hanya pengguna dengan akun yang telah terdaftar resmi oleh Administrator yang
              diperkenankan mengakses sistem ini.
            </span>
          </div>

          <form className="space-y-4" onSubmit={handleLogin} noValidate>
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800"
              >
                <svg
                  className="mt-0.5 h-[18px] w-[18px] shrink-0 text-red-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-3.5 text-sm text-green-800"
              >
                <svg
                  className="mt-0.5 h-[18px] w-[18px] shrink-0 text-green-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            <div className="relative">
              <input
                id="username"
                type="text"
                placeholder=" "
                autoComplete="username"
                className={inputClass}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
              <label htmlFor="username" className={labelClass}>
                Username
              </label>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder=" "
                autoComplete="current-password"
                className={`${inputClass} pr-12`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <label htmlFor="password" className={labelClass}>
                Kata Sandi
              </label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50"
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600/30"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span>Ingat Saya</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden="true"
                  />
                  Memproses...
                </>
              ) : (
                "Masuk ke Akun"
              )}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}