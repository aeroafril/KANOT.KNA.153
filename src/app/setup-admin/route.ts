import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      {
        success: false,
        error: "Kredensial NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum dikonfigurasi di .env.local",
      },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const ADMIN_EMAIL = "dedesk159@gmail.com";
  const ADMIN_PASSWORD = "patricia123";
  const ADMIN_NAME = "Patricia";
  const ADMIN_ROLE = "Staff dan Admin";

  try {
    let userId: string | null = null;
    let message = "";

    // 1. Coba login untuk memeriksa apakah akun sudah ada
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (signInData && signInData.user) {
      userId = signInData.user.id;
      message = "Akun admin sudah terdaftar di Supabase Auth.";
    } else {
      // 2. Jika belum ada, coba daftar akun baru (signUp)
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
        return NextResponse.json(
          {
            success: false,
            error: `Gagal mendaftarkan akun di Supabase Auth: ${signUpError.message}`,
            tip: "Gunakan skrip SQL di supabase/seed_admin.sql via SQL Editor jika proyek Anda mewajibkan konfirmasi email.",
          },
          { status: 400 }
        );
      }

      if (signUpData && signUpData.user) {
        userId = signUpData.user.id;
        message = "Akun admin berhasil didaftarkan di Supabase Auth.";
      }
    }

    // 3. Pastikan profil tercatat di tabel public.profiles
    if (userId) {
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
        return NextResponse.json({
          success: true,
          message,
          profileStatus: `Peringatan: Gagal memperbarui tabel profiles (${profileError.message})`,
          email: ADMIN_EMAIL,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message,
      profileStatus: "Profil admin berhasil dikonfirmasi dan dicatat di tabel public.profiles",
      credentials: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Terjadi kesalahan internal server.",
      },
      { status: 500 }
    );
  }
}
