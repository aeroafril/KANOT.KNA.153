import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Mengambil variabel lingkungan Supabase dari file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Peringatan jika variabel lingkungan belum diisi dengan benar
const isPlaceholderUrl = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id") || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project");
const isPlaceholderKey = !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("your-anon") || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder-anon");

if (typeof window !== "undefined" && (isPlaceholderUrl || isPlaceholderKey)) {
  console.error(
    "❌ Kredensial Supabase Error: NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local masih bernilai placeholder. Silakan ganti dengan URL dan Anon Key asli dari proyek Supabase Anda."
  );
}

/**
 * Supabase Client strongly-typed (bertipe kuat) untuk aplikasi Web Kanot.
 * Menggunakan definisi antarmuka Database dari src/types/supabase.ts.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
