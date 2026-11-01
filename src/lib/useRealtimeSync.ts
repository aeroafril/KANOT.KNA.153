"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Custom React Hook untuk Realtime Live Auto-Sync dengan Supabase PostgreSQL.
 * Ketika ada pengguna lain yang melakukan penambahan (INSERT), perubahan (UPDATE),
 * atau penghapusan (DELETE) data pada tabel yang dipantau, callback onUpdate akan dipanggil seketika
 * sehingga tampilan UI memperbarui data secara langsung tanpa refresh halaman.
 *
 * @param table Nama tabel di database Supabase (misal: "guest_books", "pt_registrations")
 * @param onUpdate Fungsi callback untuk memuat ulang (re-fetch) data
 */
export function useRealtimeSync(
  table: string,
  onUpdate: (payload: any) => void
) {
  useEffect(() => {
    if (!table) return;

    const channelName = `realtime-${table}-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase.channel(channelName);

    (channel as any)
      .on(
        "postgres_changes",
        {
          event: "*", // Mendengarkan semua event: INSERT, UPDATE, DELETE
          schema: "public",
          table: table,
        },
        (payload: any) => {
          console.log(
            `[⚡ Realtime Live Sync: ${table}] Terdeteksi perubahan data dari database cloud:`,
            payload
          );
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, onUpdate]);
}
