"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { supabase } from "@/lib/supabase";
import { profileService } from "@/lib/services/supabaseService";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load registered users from localStorage or fall back to defaults
  const [allowedGmails, setAllowedGmails] = useState<any[]>([]);

  useEffect(() => {
    const superAdmin = {
      name: "Patricia",
      email: "dedesk159@gmail.com",
      password: "patricia123",
      role: "Staff Notaris",
      initial: "PA",
      permissions: [
        "Melihat Anggota",
        "Menambahkan Anggota",
        "Mengedit Anggota",
        "Menghapus Anggota",
        "Melihat Isi Data Web",
        "Mengedit Isi Data Web",
      ],
    };

    const saved = localStorage.getItem("registered_users");
    let currentUsers: any[] = [];
    if (saved) {
      try {
        currentUsers = JSON.parse(saved);
      } catch (e) {
        currentUsers = [];
      }
    }

    // Pastikan dedesk159@gmail.com & knisa7816@gmail.com selalu mendapat role & semua izin akses
    const knisaUser = {
      name: "Khairun Nisa",
      email: "knisa7816@gmail.com",
      password: "nisa1234",
      role: "Notaris Utama",
      initial: "KN",
      permissions: [
        "Melihat Anggota",
        "Menambahkan Anggota",
        "Mengedit Anggota",
        "Menghapus Anggota",
        "Melihat Isi Data Web",
        "Mengedit Isi Data Web",
      ],
    };

    const others = currentUsers.filter(
      (u: any) =>
        u.email.toLowerCase() !== superAdmin.email.toLowerCase() &&
        u.email.toLowerCase() !== knisaUser.email.toLowerCase()
    );

    const updatedUsers = [
      superAdmin,
      knisaUser,
      ...others,
      { name: "Khairun Nisa, S.H., M.Kn.", email: "khairun.nisa@gmail.com", password: "password123", role: "Notaris Utama", permissions: ["Melihat Anggota", "Menambahkan Anggota", "Mengedit Anggota", "Menghapus Anggota"] },
      { name: "Budi Santoso", email: "budi.notaris@gmail.com", password: "password123", role: "Asisten Notariat", permissions: ["Melihat Anggota", "Menambahkan Anggota", "Mengedit Anggota", "Menghapus Anggota"] },
      { name: "Siti Rahma", email: "siti.rahma.notaris@gmail.com", password: "password123", role: "Staf Administrasi", permissions: ["Melihat Anggota"] },
      { name: "Fajar Nugraha", email: "fajar.nugraha.notaris@gmail.com", password: "password123", role: "Arsiparis & Verifikator", permissions: ["Melihat Anggota"] }
    ];
    const uniqueUsers = updatedUsers.filter((v, i, a) => a.findIndex((t) => t.email.toLowerCase() === v.email.toLowerCase()) === i);
    localStorage.setItem("registered_users", JSON.stringify(uniqueUsers));
    setAllowedGmails(uniqueUsers);

    // Ambil semua akun dari Supabase Database asli (profiles) agar akun yang diundang dari perangkat lain (HP Notaris atau Laptop lain) bisa langsung login!
    profileService.getAll().then((dbProfiles) => {
      if (dbProfiles && dbProfiles.length > 0) {
        setAllowedGmails((prev) => {
          const combined = [
            ...prev,
            ...dbProfiles.map((p: any) => ({
              name: p.name,
              email: p.email,
              password: prev.find((u: any) => u.email.toLowerCase() === p.email.toLowerCase())?.password || "password123",
              role: p.role,
              initial: p.initial,
              permissions: p.permissions,
            })),
          ];
          const unique = combined.filter((v, i, a) => a.findIndex((t) => t.email.toLowerCase() === v.email.toLowerCase()) === i);
          localStorage.setItem("registered_users", JSON.stringify(unique));
          return unique;
        });
      }
    }).catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email Gmail wajib diisi");
      return;
    }
    if (!email.toLowerCase().endsWith("@gmail.com")) {
      setError("Akses Ditolak: Hanya akun dengan domain @gmail.com yang diizinkan untuk login.");
      return;
    }

    if (!password) {
      setError("Kata sandi wajib diisi");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi harus minimal 6 karakter");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const isSuperAdmin =
      cleanEmail === "dedesk159@gmail.com" &&
      (password === "patricia123" || cleanPassword.toLowerCase() === "patricia123");
    const matchedUser = allowedGmails.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail &&
        (u.password === password || u.password === cleanPassword || u.password.toLowerCase() === cleanPassword.toLowerCase())
    );

    // Periksa apakah konfigurasi di .env.local masih menggunakan nilai placeholder
    const currentUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const currentKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const isPlaceholder =
      !currentUrl ||
      currentUrl.includes("your-project-id") ||
      currentUrl.includes("placeholder-project") ||
      !currentKey ||
      currentKey.includes("your-anon") ||
      currentKey.includes("placeholder-anon");

    if (isSuperAdmin || matchedUser) {
      document.cookie = "kanot_super_admin=true; path=/; max-age=604800";
      localStorage.setItem("super_admin_session", "true");
      const profileToSave = isSuperAdmin
        ? {
            name: "Patricia",
            email: "dedesk159@gmail.com",
            role: "Staff Notaris",
            initial: "PA",
            permissions: [
              "Melihat Anggota",
              "Menambahkan Anggota",
              "Mengedit Anggota",
              "Menghapus Anggota",
              "Melihat Isi Data Web",
              "Mengedit Isi Data Web",
            ],
          }
        : matchedUser;
      localStorage.setItem("super_admin_profile", JSON.stringify(profileToSave));

      // Upaya login ke Supabase Auth & update profil secara asinkron di latar belakang jika koneksi aktif
      if (!isPlaceholder) {
        supabase.auth.signInWithPassword({ email: cleanEmail, password }).catch(() => {});
        profileService.upsertProfile({
          id: isSuperAdmin ? "super-admin-id" : `user-id-${cleanEmail}`,
          email: cleanEmail,
          name: profileToSave.name,
          role: profileToSave.role,
          initial: profileToSave.initial || "U",
          permissions: profileToSave.permissions,
        }).catch(() => {});
      }

      setSuccess("Login berhasil! Mengalihkan ke dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);
      return;
    }

    if (isPlaceholder) {
      setError(
        "Gagal Koneksi: Kredensial NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local masih berisi nilai placeholder default. Silakan ganti dengan URL dan Anon Key asli dari proyek Supabase Anda terlebih dahulu."
      );
      return;
    }

    setIsLoading(true);

    try {
      if (isSuperAdmin) {
        // Coba login terlebih dahulu ke Supabase Auth
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        let userId = signInData?.user?.id;

        // Jika belum terdaftar, otomatis daftarkan (signUp)
        if (signInError) {
          const { data: signUpData } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: "Patricia",
                role: "Staff dan Admin",
              },
            },
          });
          if (signUpData?.user) {
            userId = signUpData.user.id;
          }
        }

        // Pastikan profil tercatat di tabel public.profiles
        const targetUserId = userId || "super-admin-id";
        await profileService.upsertProfile({
          id: targetUserId,
          email: "dedesk159@gmail.com",
          name: "Patricia",
          role: "Staff dan Admin",
          initial: "PA",
          permissions: [
            "Melihat Anggota",
            "Menambahkan Anggota",
            "Mengedit Anggota",
            "Menghapus Anggota",
            "Melihat Isi Data Web",
            "Mengedit Isi Data Web",
          ],
        });

        setSuccess("Login Super Admin berhasil! Mengalihkan ke dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
        return;
      }

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: fullName.trim(),
              role: "Notaris / Staf",
            },
          },
        });

        if (signUpError) {
          setError(`[Supabase Error: ${signUpError.status || "SignUp"}] ${signUpError.message}`);
          setIsLoading(false);
          return;
        }

        if (data.user) {
          await profileService.upsertProfile({
            id: data.user.id,
            email: data.user.email || email,
            name: fullName.trim() || email.split("@")[0],
            role: "Notaris / Staf",
          });
        }

        setSuccess("Akun berhasil didaftarkan dan masuk! Mengalihkan ke dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(`[Supabase Error: ${signInError.status || "SignIn"}] ${signInError.message}`);
          setIsLoading(false);
          return;
        }

        setSuccess("Login berhasil! Mengalihkan ke dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }
    } catch (err: any) {
      if (isSuperAdmin) {
        setSuccess("Login Super Admin berhasil! Mengalihkan ke dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
        return;
      }
      setError(`[Supabase Exception] ${err?.message || String(err)}`);
      setIsLoading(false);
    }
  };



  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>

        {/* Left Panel: Sidebar / Brand Intro */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarContent}>
            <div className={styles.logoArea}>
              <div className={styles.logoIcon}>K</div>
              <span className={styles.brandName}>Kanot.KNA.153</span>
            </div>

            <div className={styles.heroTextSection}>
              <h1 className={styles.heroTitle}>
                Kelola Pekerjaan Anda dengan Lebih <span>Profesional</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Akses dashboard kolaboratif Anda untuk memantau proyek,
                berkomunikasi dengan tim, dan mempercepat pencapaian target.
              </p>
            </div>

            <div className={styles.sidebarFooter}>
              <p>© 2026 Kanot.KNA.153. All rights reserved.</p>
              <div className={styles.sidebarFooterLinks}>
                <a href="#bantuan">Bantuan</a>
                <a href="#privasi">Privasi</a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Form Card */}
        <div className={styles.formPanel}>
          <div className={styles.formCard}>

            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Selamat Datang</h2>
              <p className={styles.formSubtitle}>
                Belum memiliki akun? <Link href="#daftar">Daftar sekarang</Link>
              </p>
            </div>

            {/* Security Alert Notice */}
            <div className={styles.gmailWarning}>
              <svg className={styles.gmailWarningIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>
                <strong>Akses Terbatas:</strong> Hanya pengguna dengan akun Gmail (@gmail.com) yang telah terdaftar resmi oleh Administrator yang diperkenankan mengakses sistem ini.
              </span>
            </div>



            {/* Login Form */}
            <form className={styles.form} onSubmit={handleLogin}>

              {/* Error Alert */}
              {error && (
                <div className={styles.errorAlert}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className={styles.successAlert}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              {/* Full Name Input for Sign Up */}
              {isSignUp && (
                <div className={styles.inputGroup}>
                  <div className={styles.inputWrapper}>
                    <input
                      id="fullName"
                      type="text"
                      className={`${styles.input} ${fullName ? styles.inputNotHtmlEmpty : ""}`}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                    />
                    <label htmlFor="fullName" className={styles.label}>
                      Nama Lengkap & Gelar
                    </label>
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <input
                    id="email"
                    type="text"
                    autoComplete="email"
                    className={`${styles.input} ${email ? styles.inputNotHtmlEmpty : ""}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                  <label htmlFor="email" className={styles.label}>
                    Alamat Email
                  </label>
                </div>
              </div>

              {/* Password Input */}
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className={`${styles.input} ${password ? styles.inputNotHtmlEmpty : ""}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <label htmlFor="password" className={styles.label}>
                    Kata Sandi
                  </label>

                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Options: Remember Me & Forgot Password */}
              <div className={styles.formOptions}>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span>Ingat Saya</span>
                </label>
                <Link href="#lupa-password" className={styles.forgotPassword}>
                  Lupa kata sandi?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className={styles.spinner}></div>
                    Memproses...
                  </>
                ) : isSignUp ? (
                  "Daftar Akun Baru"
                ) : (
                  "Masuk ke Akun"
                )}
              </button>

              <div style={{ marginTop: "1rem", textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setSuccess("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary-color, #2563eb)",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    textDecoration: "underline",
                  }}
                >
                  {isSignUp
                    ? "Sudah punya akun Supabase Auth? Masuk di sini"
                    : "Belum punya akun Supabase Auth? Daftar Akun Baru"}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>


    </div>
  );
}
