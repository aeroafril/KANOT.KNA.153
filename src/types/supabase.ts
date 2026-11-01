export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          initial: string | null;
          status: "Aktif" | "Sibuk" | "Offline";
          permissions: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: string;
          initial?: string | null;
          status?: "Aktif" | "Sibuk" | "Offline";
          permissions?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
          initial?: string | null;
          status?: "Aktif" | "Sibuk" | "Offline";
          permissions?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      guest_books: {
        Row: {
          id: string;
          nik: string | null;
          name: string;
          phone: string | null;
          address: string | null;
          purpose: string;
          category: string;
          status: "Menunggu" | "Diproses" | "Selesai" | "Batal";
          date: string;
          time_in: string;
          time_out: string | null;
          pic_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nik?: string | null;
          name: string;
          phone?: string | null;
          address?: string | null;
          purpose: string;
          category: string;
          status?: "Menunggu" | "Diproses" | "Selesai" | "Batal";
          date?: string;
          time_in?: string;
          time_out?: string | null;
          pic_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nik?: string | null;
          name?: string;
          phone?: string | null;
          address?: string | null;
          purpose?: string;
          category?: string;
          status?: "Menunggu" | "Diproses" | "Selesai" | "Batal";
          date?: string;
          time_in?: string;
          time_out?: string | null;
          pic_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      deeds: {
        Row: {
          id: string;
          guest_book_id: string | null;
          deed_number: string;
          deed_date: string;
          nature_of_deed: string;
          client_name: string;
          summary: string | null;
          is_nihil: boolean;
          month: number | null;
          year: number | null;
          status: "Draft" | "Diproses" | "Selesai" | "Batal";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guest_book_id?: string | null;
          deed_number: string;
          deed_date: string;
          nature_of_deed: string;
          client_name: string;
          summary?: string | null;
          is_nihil?: boolean;
          month?: number | null;
          year?: number | null;
          status?: "Draft" | "Diproses" | "Selesai" | "Batal";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guest_book_id?: string | null;
          deed_number?: string;
          deed_date?: string;
          nature_of_deed?: string;
          client_name?: string;
          summary?: string | null;
          is_nihil?: boolean;
          month?: number | null;
          year?: number | null;
          status?: "Draft" | "Diproses" | "Selesai" | "Batal";
          created_at?: string;
          updated_at?: string;
        };
      };
      wills: {
        Row: {
          id: string;
          guest_book_id: string | null;
          deed_number: string;
          deed_date: string;
          testator_name: string;
          notary_name: string;
          report_date: string | null;
          is_nihil: boolean;
          month: number | null;
          year: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guest_book_id?: string | null;
          deed_number: string;
          deed_date: string;
          testator_name: string;
          notary_name: string;
          report_date?: string | null;
          is_nihil?: boolean;
          month?: number | null;
          year?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guest_book_id?: string | null;
          deed_number?: string;
          deed_date?: string;
          testator_name?: string;
          notary_name?: string;
          report_date?: string | null;
          is_nihil?: boolean;
          month?: number | null;
          year?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      pt_registrations: {
        Row: {
          id: string;
          guest_book_id: string | null;
          deed_number: string;
          deed_date: string;
          pt_name: string;
          founders: string;
          authorized_capital: number;
          paid_capital: number;
          sk_kemenkumham: string | null;
          directors_tenure: string | null;
          share_composition: string | null;
          financial_year: string | null;
          is_nihil: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guest_book_id?: string | null;
          deed_number: string;
          deed_date: string;
          pt_name: string;
          founders: string;
          authorized_capital?: number;
          paid_capital?: number;
          sk_kemenkumham?: string | null;
          directors_tenure?: string | null;
          share_composition?: string | null;
          financial_year?: string | null;
          is_nihil?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guest_book_id?: string | null;
          deed_number?: string;
          deed_date?: string;
          pt_name?: string;
          founders?: string;
          authorized_capital?: number;
          paid_capital?: number;
          sk_kemenkumham?: string | null;
          directors_tenure?: string | null;
          share_composition?: string | null;
          financial_year?: string | null;
          is_nihil?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      cv_registrations: {
        Row: {
          id: string;
          guest_book_id: string | null;
          deed_number: string;
          deed_date: string;
          cv_name: string;
          founders: string;
          capital: number;
          is_nihil: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guest_book_id?: string | null;
          deed_number: string;
          deed_date: string;
          cv_name: string;
          founders: string;
          capital?: number;
          is_nihil?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guest_book_id?: string | null;
          deed_number?: string;
          deed_date?: string;
          cv_name?: string;
          founders?: string;
          capital?: number;
          is_nihil?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      yayasan_registrations: {
        Row: {
          id: string;
          guest_book_id: string | null;
          deed_number: string;
          deed_date: string;
          yayasan_name: string;
          founders: string;
          address: string | null;
          registered_kemenkumham: string | null;
          legalization: string | null;
          amendment_date: string | null;
          description: string | null;
          is_nihil: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guest_book_id?: string | null;
          deed_number: string;
          deed_date: string;
          yayasan_name: string;
          founders: string;
          address?: string | null;
          registered_kemenkumham?: string | null;
          legalization?: string | null;
          amendment_date?: string | null;
          description?: string | null;
          is_nihil?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guest_book_id?: string | null;
          deed_number?: string;
          deed_date?: string;
          yayasan_name?: string;
          founders?: string;
          address?: string | null;
          registered_kemenkumham?: string | null;
          legalization?: string | null;
          amendment_date?: string | null;
          description?: string | null;
          is_nihil?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_progress: {
        Row: {
          id: string;
          guest_book_id: string | null;
          pic_id: string | null;
          service_type: string;
          client_name: string;
          current_step: string;
          status: "Dalam Proses" | "Selesai" | "Tertunda" | "Batal";
          progress_percentage: number;
          start_date: string;
          target_date: string | null;
          completed_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guest_book_id?: string | null;
          pic_id?: string | null;
          service_type: string;
          client_name: string;
          current_step: string;
          status?: "Dalam Proses" | "Selesai" | "Tertunda" | "Batal";
          progress_percentage?: number;
          start_date?: string;
          target_date?: string | null;
          completed_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guest_book_id?: string | null;
          pic_id?: string | null;
          service_type?: string;
          client_name?: string;
          current_step?: string;
          status?: "Dalam Proses" | "Selesai" | "Tertunda" | "Batal";
          progress_percentage?: number;
          start_date?: string;
          target_date?: string | null;
          completed_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mail_logs: {
        Row: {
          id: string;
          mail_type: "IN" | "OUT";
          mail_number: string;
          mail_date: string;
          sender_receiver: string;
          subject: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mail_type: "IN" | "OUT";
          mail_number: string;
          mail_date: string;
          sender_receiver: string;
          subject: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mail_type?: "IN" | "OUT";
          mail_number?: string;
          mail_date?: string;
          sender_receiver?: string;
          subject?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
