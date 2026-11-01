import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load .env.local manually
const envPath = path.resolve(__dirname, "../.env.local");
let supabaseUrl = "";
let supabaseKey = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...vals] = trimmed.split("=");
      const val = vals.join("=").replace(/^["']|["']$/g, "").trim();
      if (key.trim() === "NEXT_PUBLIC_SUPABASE_URL") supabaseUrl = val;
      if (key.trim() === "NEXT_PUBLIC_SUPABASE_ANON_KEY") supabaseKey = val;
    }
  });
}

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Gagal menemukan NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAIL = "dedesk159@gmail.com";
const ADMIN_PASSWORD = "patricia123";
const ADMIN_NAME = "Patricia";
const ADMIN_ROLE = "Staff dan Admin";

async function runSetup() {
  console.log("=====================================================================");
  console.log("🚀 KANOT - AUTOMATIC ADMIN ACCOUNT SETUP");
  console.log("=====================================================================");
  console.log(`📧 Email   : ${ADMIN_EMAIL}`);
  console.log(`🔑 Role    : ${ADMIN_ROLE}`);
  console.log("---------------------------------------------------------------------");

  try {
    // 1. Coba login terlebih dahulu untuk memeriksa apakah akun sudah ada
    let userId = null;
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (signInData && signInData.user) {
      console.log("✅ Akun admin sudah terdaftar dan password sesuai.");
      userId = signInData.user.id;
    } else {
      console.log("ℹ️ Akun belum ditemukan / belum bisa login, mencoba mendaftarkan akun baru (signUp)...");
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
          data: {
            name: ADMIN_NAME,
            role: ADMIN_ROLE,
          },
        },
      });

      if (signUpError) {
        console.error("❌ Gagal mendaftarkan akun di Supabase Auth:", signUpError.message);
        console.log("\n💡 TIPS: Jika email confirmation diwajibkan oleh proyek Supabase Anda,");
        console.log("   salin dan jalankan skrip SQL 'supabase/seed_admin.sql' di SQL Editor");
        console.log("   Supabase Dashboard agar akun langsung berstatus confirmed (email_confirmed_at = now()).");
        process.exit(1);
      }

      if (signUpData && signUpData.user) {
        console.log("✅ Berhasil mendaftarkan akun di Supabase Auth!");
        userId = signUpData.user.id;
      }
    }

    if (userId) {
      // 2. Sisipkan / perbarui profil di tabel public.profiles
      console.log(`👤 Menyimpan data profil ke tabel 'profiles' (User ID: ${userId})...`);
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        role: ADMIN_ROLE,
        initial: "PA",
        status: "Aktif",
        permissions: [
          "Melihat Anggota",
          "Menambahkan Anggota",
          "Mengedit Anggota",
          "Menghapus Anggota",
          "Melihat Isi Data Web",
          "Mengedit Isi Data Web",
        ],
      });

      if (profileError) {
        console.error("⚠️ Peringatan saat memperbarui tabel profiles:", profileError.message);
      } else {
        console.log("✅ Profil admin berhasil dibuat/diperbarui di tabel 'profiles'.");
      }
    }

    console.log("=====================================================================");
    console.log("🎉 SELESAI! Anda sekarang bisa login di web menggunakan:");
    console.log(`   Email   : ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log("=====================================================================");
  } catch (err) {
    console.error("❌ Terjadi kesalahan tak terduga:", err);
  }
}

runSetup();
