import { supabase } from "@/lib/supabase";
import { GuestBookEntry } from "@/app/dashboard/page";

// ============================================================================
// 1. GUEST BOOK SERVICE (Buku Tamu / Master Klien)
// ============================================================================
export const guestBookService = {
  async getAll(fallbackData: GuestBookEntry[] = []): Promise<GuestBookEntry[]> {
    try {
      const { data, error } = await supabase
        .from("guest_books")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.warn("⚠️ Supabase error [guest_books]:", error.message, "-> Menggunakan fallback localStorage.");
        return fallbackData;
      }

      if (!data || data.length === 0) {
        // Jika di Supabase masih kosong dan ada fallback data, kita simpan juga ke Supabase sebagai auto-seed
        if (fallbackData && fallbackData.length > 0) {
          await this.seedInitial(fallbackData);
        }
        return fallbackData;
      }

      return data.map((row) => ({
        id: row.id,
        name: row.name,
        address: row.address || "",
        purpose: row.purpose,
        category: (row.category || "Lainnya") as any,
        status: (row.status || "Menunggu") as any,
        date: row.date,
        timeIn: row.time_in || "08:00",
        timeOut: row.time_out || "-",
        notes: row.notes || "",
      }));
    } catch (e) {
      console.error("Gagal mengambil data dari Supabase:", e);
      return fallbackData;
    }
  },

  async create(guest: GuestBookEntry): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("guest_books").insert({
        id: guest.id.length === 36 ? guest.id : undefined, // Biarkan UUID generate otomatis jika bukan format UUID standar
        name: guest.name,
        address: guest.address,
        purpose: guest.purpose,
        category: guest.category,
        status: guest.status,
        date: guest.date,
        time_in: guest.timeIn || "08:00",
        time_out: guest.timeOut === "-" ? null : guest.timeOut,
        notes: (guest as any).notes || null,
      });

      if (error) {
        console.error("⚠️ Error saat menyimpan Klien ke Supabase:", error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async update(id: string, updates: Partial<GuestBookEntry>): Promise<{ success: boolean; error?: string }> {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.address !== undefined) payload.address = updates.address;
      if (updates.purpose !== undefined) payload.purpose = updates.purpose;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.date !== undefined) payload.date = updates.date;
      if (updates.timeIn !== undefined) payload.time_in = updates.timeIn;
      if (updates.timeOut !== undefined) payload.time_out = updates.timeOut === "-" ? null : updates.timeOut;

      const { error } = await supabase.from("guest_books").update(payload).eq("id", id);
      if (error) {
        console.error("⚠️ Error saat update Klien di Supabase:", error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("guest_books").delete().eq("id", id);
      if (error) {
        console.error("⚠️ Error saat menghapus Klien di Supabase:", error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async seedInitial(sampleGuests: GuestBookEntry[]) {
    try {
      const formatted = sampleGuests.map((g) => ({
        name: g.name,
        address: g.address,
        purpose: g.purpose,
        category: g.category,
        status: g.status,
        date: g.date,
        time_in: g.timeIn || "08:00",
        time_out: g.timeOut === "-" ? null : g.timeOut,
      }));
      await supabase.from("guest_books").insert(formatted);
      console.log("✅ Berhasil seed data awal Buku Tamu ke Supabase!");
    } catch (e) {
      console.warn("Seed Buku Tamu gagal:", e);
    }
  },
};

// ============================================================================
// 2. DEEDS SERVICE (Daftar Akta Notaris)
// ============================================================================
export const deedService = {
  async getAll(fallbackData: any[] = []): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("deeds")
        .select("*")
        .order("deed_date", { ascending: false });

      if (error || !data || data.length === 0) return fallbackData;

      return data.map((row) => ({
        id: row.id,
        isNihil: row.is_nihil,
        dateLabel: row.is_nihil ? `${row.month} / ${row.year}` : row.deed_date,
        deedNoIndex: row.is_nihil ? "-" : row.deed_number,
        deed: row.is_nihil
          ? undefined
          : {
              id: row.id,
              date: row.deed_date,
              number: row.deed_number,
              natureOfDeed: row.nature_of_deed,
              clientName: row.client_name,
              summary: row.summary || "",
              status: row.status,
            },
      }));
    } catch {
      return fallbackData;
    }
  },

  async create(item: {
    deed_number: string;
    deed_date: string;
    nature_of_deed: string;
    client_name: string;
    summary?: string;
    is_nihil?: boolean;
    month?: number;
    year?: number;
    status?: string;
  }): Promise<boolean> {
    const { error } = await supabase.from("deeds").insert({
      deed_number: item.deed_number,
      deed_date: item.deed_date,
      nature_of_deed: item.nature_of_deed || "Akta Notaris",
      client_name: item.client_name || "-",
      summary: item.summary || null,
      is_nihil: !!item.is_nihil,
      month: item.month || null,
      year: item.year || null,
      status: (item.status as any) || "Selesai",
    });
    if (error) {
      console.error("Supabase insert error in deeds:", error);
    }
    return !error;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("deeds").delete().eq("id", id);
    return !error;
  },
};

// ============================================================================
// 3. PT REGISTRATIONS SERVICE (Daftar PT)
// ============================================================================
export const ptService = {
  async getAll(fallbackData: any[] = []): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("pt_registrations")
        .select("*")
        .order("deed_date", { ascending: false });

      if (error || !data || data.length === 0) return fallbackData;

      const mapped = data.map((row, index) => ({
        id: row.id || `PT-${String(index + 1).padStart(3, "0")}`,
        isNihil: !!row.is_nihil,
        regNumber: row.reg_number || "-",
        deedNumber: row.deed_number || "-",
        ptName: row.pt_name || (row.is_nihil ? "N I H I L" : "-"),
        founders: row.founders || "-",
        ptAddress: row.pt_address || "-",
        legalization: row.sk_kemenkumham || "-",
        description: row.description || (row.is_nihil ? "Bulan Kosong" : "-"),
        date: row.deed_date || new Date().toISOString().split("T")[0],
        modalDasar: Number(row.authorized_capital || 0),
        modalDisetor: Number(row.paid_capital || 0),
        status: row.status || "Selesai",
        dateLabel: row.deed_date,
        deedNoIndex: row.deed_number,
        pt: row.is_nihil
          ? undefined
          : {
              id: row.id,
              deedDate: row.deed_date,
              deedNumber: row.deed_number,
              name: row.pt_name,
              founders: row.founders,
              status: row.status,
              authorizedCapital: Number(row.authorized_capital || 0),
              paidCapital: Number(row.paid_capital || 0),
              skKemenkumham: row.sk_kemenkumham || "-",
              directorsTenure: row.directors_tenure || "-",
              shareComposition: row.share_composition || "-",
              financialYear: row.financial_year || "-",
            },
      }));

      const remoteIds = new Set(mapped.map((m: any) => String(m.id)));
      const extraLocal = (fallbackData || []).filter(
        (localItem: any) => localItem && localItem.id && !remoteIds.has(String(localItem.id))
      );
      return [...mapped, ...extraLocal];
    } catch {
      return fallbackData;
    }
  },

  async create(item: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("pt_registrations").insert({
        deed_number: item.deed_number || item.deedNumber || "-",
        deed_date: item.deed_date || item.date || new Date().toISOString().split("T")[0],
        pt_name: item.pt_name || item.ptName || "-",
        founders: item.founders || "-",
        authorized_capital: item.authorized_capital || item.modalDasar || 0,
        paid_capital: item.paid_capital || item.modalDisetor || 0,
        sk_kemenkumham: item.sk_kemenkumham || item.legalization || "-",
        directors_tenure: item.directors_tenure || item.directorsTenure || "-",
        share_composition: item.share_composition || item.shareComposition || "-",
        financial_year: item.financial_year || item.financialYear || "-",
        is_nihil: !!(item.is_nihil || item.isNihil),
        status: item.status || "Selesai",
      });
      return !error;
    } catch {
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("pt_registrations").delete().eq("id", id);
    return !error;
  },
};

// ============================================================================
// 4. CV REGISTRATIONS SERVICE (Daftar CV)
// ============================================================================
export const cvService = {
  async getAll(fallbackData: any[] = []): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("cv_registrations")
        .select("*")
        .order("deed_date", { ascending: false });

      if (error || !data || data.length === 0) return fallbackData;

      const mapped = data.map((row, index) => ({
        id: row.id || `CV-${String(index + 1).padStart(3, "0")}`,
        isNihil: !!row.is_nihil,
        regNumber: row.reg_number || "-",
        deedNumber: row.deed_number || "-",
        cvName: row.cv_name || (row.is_nihil ? "N I H I L" : "-"),
        founders: row.founders || "-",
        cvAddress: row.cv_address || "-",
        legalization: row.sk_kemenkumham || "-",
        description: row.description || (row.is_nihil ? "Bulan Kosong" : "-"),
        date: row.deed_date || new Date().toISOString().split("T")[0],
        modalDasar: Number(row.authorized_capital || 0),
        modalDisetor: Number(row.paid_capital || 0),
        status: row.status || "Selesai",
        dateLabel: row.deed_date,
        deedNoIndex: row.deed_number,
        cv: row.is_nihil
          ? undefined
          : {
              id: row.id,
              deedDate: row.deed_date,
              deedNumber: row.deed_number,
              name: row.cv_name,
              founders: row.founders,
              status: row.status,
              authorizedCapital: Number(row.authorized_capital || 0),
              paidCapital: Number(row.paid_capital || 0),
              skKemenkumham: row.sk_kemenkumham || "-",
            },
      }));

      const remoteIds = new Set(mapped.map((m: any) => String(m.id)));
      const extraLocal = (fallbackData || []).filter(
        (localItem: any) => localItem && localItem.id && !remoteIds.has(String(localItem.id))
      );
      return [...mapped, ...extraLocal];
    } catch {
      return fallbackData;
    }
  },

  async create(item: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("cv_registrations").insert({
        deed_number: item.deed_number || item.deedNumber || "-",
        deed_date: item.deed_date || item.date || new Date().toISOString().split("T")[0],
        cv_name: item.cv_name || item.cvName || "-",
        founders: item.founders || "-",
        authorized_capital: item.authorized_capital || item.modalDasar || 0,
        paid_capital: item.paid_capital || item.modalDisetor || 0,
        sk_kemenkumham: item.sk_kemenkumham || item.legalization || "-",
        is_nihil: !!(item.is_nihil || item.isNihil),
        status: item.status || "Selesai",
      });
      return !error;
    } catch {
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("cv_registrations").delete().eq("id", id);
    return !error;
  },
};

// ============================================================================
// 5. YAYASAN SERVICE (Daftar Yayasan)
// ============================================================================
export const yayasanService = {
  async getAll(fallbackData: any[] = []): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("yayasan_registrations")
        .select("*")
        .order("deed_date", { ascending: false });

      if (error || !data || data.length === 0) return fallbackData;

      const mapped = data.map((row, index) => ({
        id: row.id || `YY-${String(index + 1).padStart(3, "0")}`,
        isNihil: !!row.is_nihil,
        deedDate: row.deed_date || new Date().toISOString().split("T")[0],
        deedNumber: row.deed_number || "-",
        name: row.yayasan_name || (row.is_nihil ? "N I H I L" : "-"),
        founders: row.founders || "-",
        status: row.status || "Selesai",
        address: row.address || "-",
        registeredKemenkumham: row.registered_kemenkumham || "-",
        legalization: row.legalization || "-",
        amendmentDate: row.amendment_date || "-",
        description: row.description || (row.is_nihil ? "Bulan Kosong" : "-"),
        dateLabel: row.deed_date,
        deedNoIndex: row.deed_number,
        yayasan: row.is_nihil
          ? undefined
          : {
              id: row.id,
              deedDate: row.deed_date,
              deedNumber: row.deed_number,
              name: row.yayasan_name,
              founders: row.founders,
              address: row.address || "",
              registeredKemenkumham: row.registered_kemenkumham || "-",
              legalization: row.legalization || "-",
              amendmentDate: row.amendment_date || "-",
              description: row.description || "",
              status: row.status,
            },
      }));

      const remoteIds = new Set(mapped.map((m: any) => String(m.id)));
      const extraLocal = (fallbackData || []).filter(
        (localItem: any) => localItem && localItem.id && !remoteIds.has(String(localItem.id))
      );
      return [...mapped, ...extraLocal];
    } catch {
      return fallbackData;
    }
  },

  async create(item: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("yayasan_registrations").insert({
        deed_number: item.deed_number || item.deedNumber || "-",
        deed_date: item.deed_date || item.deedDate || new Date().toISOString().split("T")[0],
        yayasan_name: item.yayasan_name || item.name || "-",
        founders: item.founders || "-",
        address: item.address || null,
        registered_kemenkumham: item.registered_kemenkumham || item.registeredKemenkumham || null,
        legalization: item.legalization || null,
        amendment_date: item.amendment_date || item.amendmentDate || null,
        description: item.description || null,
        is_nihil: !!(item.is_nihil || item.isNihil),
        status: item.status || "Selesai",
      });
      return !error;
    } catch {
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("yayasan_registrations").delete().eq("id", id);
    return !error;
  },
};

export const profileService = {
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });
    if (error || !data) {
      console.error("Error fetching profiles:", error);
      return [];
    }
    return data.map((item, index) => {
      const initials = (item.name || "User")
        .split(" ")
        .map((w: string) => w.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();
      return {
        id: item.id || `T-${index + 1}`,
        name: item.name || "Pengguna",
        email: item.email || "-",
        role: item.role || "Staf",
        status: item.status || "Aktif",
        initial: item.initial || initials || "U",
        permissions: item.permissions || ["Melihat Anggota", "Melihat Isi Data Web", "Mengedit Isi Data Web"],
      };
    });
  },

  async upsertProfile(profile: {
    id: string;
    email: string;
    name: string;
    role?: string;
    initial?: string;
    status?: string;
    permissions?: string[];
  }): Promise<boolean> {
    const { error } = await supabase.from("profiles").upsert({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role || "Staf",
      initial: profile.initial || "U",
      status: profile.status || "Aktif",
      permissions: profile.permissions || [
        "Melihat Anggota",
        "Melihat Isi Data Web",
        "Mengedit Isi Data Web",
      ],
      updated_at: new Date().toISOString(),
    });
    return !error;
  },
};

export const jobProgressService = {
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from("job_progress")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) {
      console.error("Error fetching job progress:", error);
      return [];
    }
    return data.map((item, index) => {
      let requirements = [];
      let logs = [];
      try { if (item.requirements) requirements = typeof item.requirements === 'string' ? JSON.parse(item.requirements) : item.requirements; } catch(e){}
      try { if (item.logs) logs = typeof item.logs === 'string' ? JSON.parse(item.logs) : item.logs; } catch(e){}

      return {
        id: item.id || `JOB-${index + 1}`,
        date: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        owner: item.client_name || "-",
        jobType: item.job_type || "-",
        progress: item.progress || 0,
        worker: item.worker || "-",
        description: item.notes || "-",
        phone: item.phone || "-",
        address: item.address || "-",
        category: item.category || "PT",
        requirements: requirements,
        logs: logs,
        isNihil: item.is_nihil || false
      };
    });
  },

  async create(item: any): Promise<boolean> {
    const { error } = await supabase.from("job_progress").insert({
      id: item.id.startsWith('JOB-') && item.id.length > 10 ? item.id : undefined, // let db generate uuid if not passed
      client_name: item.owner || item.client_name,
      job_type: item.jobType || item.job_type,
      notes: item.description || item.notes || null,
      status: item.status || "Diproses",
      progress: item.progress || 0,
      worker: item.worker || null,
      phone: item.phone || null,
      address: item.address || null,
      category: item.category || null,
      requirements: item.requirements || null,
      logs: item.logs || null,
      is_nihil: item.isNihil || false,
      created_at: item.date ? `${item.date}T12:00:00Z` : new Date().toISOString()
    });
    if (error) console.error("Error creating job progress:", error);
    return !error;
  },

  async update(id: string, item: any): Promise<boolean> {
    const updates: any = {};
    if (item.owner !== undefined) updates.client_name = item.owner;
    if (item.jobType !== undefined) updates.job_type = item.jobType;
    if (item.description !== undefined) updates.notes = item.description;
    if (item.progress !== undefined) updates.progress = item.progress;
    if (item.worker !== undefined) updates.worker = item.worker;
    if (item.phone !== undefined) updates.phone = item.phone;
    if (item.address !== undefined) updates.address = item.address;
    if (item.category !== undefined) updates.category = item.category;
    if (item.requirements !== undefined) updates.requirements = item.requirements;
    if (item.logs !== undefined) updates.logs = item.logs;
    if (item.date !== undefined) updates.created_at = `${item.date}T12:00:00Z`;

    const { error } = await supabase.from("job_progress").update(updates).eq("id", id);
    if (error) console.error("Error updating job progress:", error);
    return !error;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("job_progress").delete().eq("id", id);
    return !error;
  },
};

export const willsService = {
  async getAll(fallback: any[] = []): Promise<any[]> {
    try {
      const { data, error } = await supabase.from("wills").select("*").order("created_at", { ascending: false });
      if (error || !data || data.length === 0) return fallback;
      const mapped = data.map((row, i) => ({
        id: row.id || `W-${i + 1}`,
        isNihil: !!row.is_nihil,
        testator: {
          fullName: row.testator_name || "-",
          formerName: "-",
          birthPlace: "-",
          birthDate: "-",
          occupation: "-",
          lastAddress: "-",
        },
        willDeed: {
          deedNumber: row.deed_number || "-",
          deedDate: row.deed_date || "-",
          repNumber: "-",
          deedType: "Akta Wasiat",
        },
        notaryName: row.notary_name || "-",
      }));
      const remoteIds = new Set(mapped.map((m: any) => String(m.id)));
      const extraLocal = (fallback || []).filter((l: any) => l && l.id && !remoteIds.has(String(l.id)));
      return [...mapped, ...extraLocal];
    } catch {
      return fallback;
    }
  },
  async create(item: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("wills").insert({
        deed_number: item.willDeed?.deedNumber || item.deed_number || "-",
        deed_date: item.willDeed?.deedDate || item.deed_date || new Date().toISOString().split("T")[0],
        testator_name: item.testator?.fullName || item.testator_name || "-",
        notary_name: item.notaryName || item.notary_name || "-",
        is_nihil: !!item.isNihil,
      });
      return !error;
    } catch {
      return false;
    }
  },
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("wills").delete().eq("id", id);
    return !error;
  }
};

export const privateAgreementService = {
  async getAll(fallback: any[] = []): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("private_agreements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error || !data || data.length === 0) return fallback;
      const mapped = data.map((row, index) => ({
        id: row.id || `PA-${String(index + 1).padStart(3, "0")}`,
        isNihil: !!row.is_nihil,
        serialNumber: row.register_number || "-",
        letterDate: row.date || "-",
        registeredDate: row.date || "-",
        natureOfLetter: row.nature_of_agreement || "-",
        appearerName: row.parties || "-",
        representedName: "-",
      }));
      const remoteIds = new Set(mapped.map((m: any) => String(m.id)));
      const extraLocal = (fallback || []).filter((l: any) => l && l.id && !remoteIds.has(String(l.id)));
      return [...mapped, ...extraLocal];
    } catch {
      return fallback;
    }
  },
  async create(item: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("private_agreements").insert({
        register_number: item.serialNumber || item.register_number || "-",
        date: item.registeredDate || item.letterDate || item.date || new Date().toISOString().split("T")[0],
        parties: item.appearerName || item.parties || "-",
        nature_of_agreement: item.natureOfLetter || item.nature_of_agreement || "-",
        is_nihil: !!item.isNihil,
      });
      return !error;
    } catch {
      return false;
    }
  },
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("private_agreements").delete().eq("id", id);
    return !error;
  }
};

export const legalizedAgreementService = {
  async getAll(fallback: any[] = []): Promise<any[]> {
    try {
      const { data, error } = await supabase.from("legalized_agreements").select("*").order("created_at", { ascending: false });
      if (error || !data || data.length === 0) return fallback;
      const mapped = data.map((row, index) => ({
        id: row.id || `LA-${String(index + 1).padStart(3, "0")}`,
        isNihil: !!row.is_nihil,
        serialNumber: row.deed_number || row.serial_number || "-",
        letterDate: row.deed_date || row.letter_date || "-",
        legalizedDate: row.deed_date || row.legalized_date || "-",
        natureOfLetter: row.nature_of_agreement || row.nature_of_letter || "-",
        appearerName: row.parties || row.appearer_name || "-",
        representedName: "-",
      }));
      const remoteIds = new Set(mapped.map((m: any) => String(m.id)));
      const extraLocal = (fallback || []).filter((l: any) => l && l.id && !remoteIds.has(String(l.id)));
      return [...mapped, ...extraLocal];
    } catch {
      return fallback;
    }
  },
  async create(item: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("legalized_agreements").insert({
        deed_number: item.serialNumber || item.deed_number || "-",
        deed_date: item.legalizedDate || item.letterDate || item.deed_date || new Date().toISOString().split("T")[0],
        parties: item.appearerName || item.parties || "-",
        nature_of_agreement: item.natureOfLetter || item.nature_of_agreement || "-",
        is_nihil: !!item.isNihil,
      });
      return !error;
    } catch {
      return false;
    }
  },
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("legalized_agreements").delete().eq("id", id);
    return !error;
  }
};

export const protestService = {
  async getAll(fallback: any[] = []): Promise<any[]> {
    try {
      const { data, error } = await supabase.from("protests").select("*").order("created_at", { ascending: false });
      if (error || !data || data.length === 0) return fallback;
      const mapped = data.map((row, index) => ({
        id: row.id || `PR-${String(index + 1).padStart(3, "0")}`,
        isNihil: !!row.is_nihil,
        deedNumber: row.deed_number || "-",
        protestDate: row.deed_date || "-",
        billedParty: row.protested_party || "-",
        billingParty: row.requestor || "-",
        billDate: row.deed_date || "-",
        dueDate: row.deed_date || "-",
      }));
      const remoteIds = new Set(mapped.map((m: any) => String(m.id)));
      const extraLocal = (fallback || []).filter((l: any) => l && l.id && !remoteIds.has(String(l.id)));
      return [...mapped, ...extraLocal];
    } catch {
      return fallback;
    }
  },
  async create(item: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("protests").insert({
        deed_number: item.deedNumber || item.deed_number || "-",
        deed_date: item.protestDate || item.deed_date || new Date().toISOString().split("T")[0],
        protested_party: item.billedParty || item.protested_party || "-",
        requestor: item.billingParty || item.requestor || "-",
        is_nihil: !!item.isNihil,
      });
      return !error;
    } catch {
      return false;
    }
  },
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("protests").delete().eq("id", id);
    return !error;
  }
};

export const copieCollationneeService = {
  async getAll(fallback: any[] = []): Promise<any[]> {
    try {
      const { data, error } = await supabase.from("copie_collationnee").select("*").order("created_at", { ascending: false });
      if (error || !data || data.length === 0) return fallback;
      const mapped = data.map((row, index) => ({
        id: row.id || `CC-${String(index + 1).padStart(3, "0")}`,
        isNihil: !!row.is_nihil,
        date: row.date || "-",
        deedNumber: row.deed_number || "-",
        deedDate: row.deed_date || "-",
        letterNumber: row.letter_number || "-",
        letterDate: row.letter_date || "-",
        summary: row.summary || "-",
        attendees: row.parties || row.attendees || "-",
        notes: row.notes || "-",
      }));
      const remoteIds = new Set(mapped.map((m: any) => String(m.id)));
      const extraLocal = (fallback || []).filter((l: any) => l && l.id && !remoteIds.has(String(l.id)));
      return [...mapped, ...extraLocal];
    } catch {
      return fallback;
    }
  },
  async create(item: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("copie_collationnee").insert({
        date: item.date || new Date().toISOString().split("T")[0],
        deed_number: item.deedNumber || item.deed_number || "-",
        deed_date: item.deedDate || item.deed_date || new Date().toISOString().split("T")[0],
        letter_number: item.letterNumber || item.letter_number || "-",
        letter_date: item.letterDate || item.letter_date || new Date().toISOString().split("T")[0],
        summary: item.summary || "-",
        parties: item.attendees || item.parties || "-",
        notes: item.notes || "-",
        is_nihil: !!item.isNihil,
      });
      return !error;
    } catch {
      return false;
    }
  },
  async update(id: string, item: any): Promise<boolean> {
    try {
      const updates: any = {};
      if (item.date !== undefined) updates.date = item.date;
      if (item.deedNumber !== undefined) updates.deed_number = item.deedNumber;
      if (item.deedDate !== undefined) updates.deed_date = item.deedDate;
      if (item.letterNumber !== undefined) updates.letter_number = item.letterNumber;
      if (item.letterDate !== undefined) updates.letter_date = item.letterDate;
      if (item.summary !== undefined) updates.summary = item.summary;
      if (item.attendees !== undefined) updates.parties = item.attendees;
      if (item.notes !== undefined) updates.notes = item.notes;

      const { error } = await supabase.from("copie_collationnee").update(updates).eq("id", id);
      return !error;
    } catch {
      return false;
    }
  },
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("copie_collationnee").delete().eq("id", id);
    return !error;
  }
};

export const childAdoptionService = {
  async getAll(fallback: any[] = []): Promise<any[]> {
    try {
      const { data, error } = await supabase.from("child_adoptions").select("*").order("created_at", { ascending: false });
      if (error || !data || data.length === 0) return fallback;
      const mapped = data.map((row, index) => ({
        id: row.id || `CA-${String(index + 1).padStart(3, "0")}`,
        isNihil: !!row.is_nihil,
        entryDate: row.deed_date || row.entry_date || "-",
        deedNumber: row.deed_number || "-",
        childName: row.child_name || "-",
        childBirthInfo: "-",
        bioParents: row.bio_parents || "-",
        bioParentsNik: "-",
        bioParentsJob: "-",
        bioParentsAddress: "-",
        adoptiveParents: row.adoptive_parents || "-",
        adoptiveParentsNik: "-",
        adoptiveParentsJob: "-",
        adoptiveParentsAddress: "-",
        contact: "-",
        description: row.notes || "-",
        status: row.status || "Baru",
      }));
      const remoteIds = new Set(mapped.map((m: any) => String(m.id)));
      const extraLocal = (fallback || []).filter((l: any) => l && l.id && !remoteIds.has(String(l.id)));
      return [...mapped, ...extraLocal];
    } catch {
      return fallback;
    }
  },
  async create(item: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("child_adoptions").insert({
        deed_number: item.deedNumber || item.deed_number || "-",
        deed_date: item.entryDate || item.deed_date || new Date().toISOString().split("T")[0],
        child_name: item.childName || item.child_name || "-",
        bio_parents: item.bioParents || item.bio_parents || "-",
        adoptive_parents: item.adoptiveParents || item.adoptive_parents || "-",
        notes: item.description || item.notes || null,
        is_nihil: !!item.isNihil,
      });
      return !error;
    } catch {
      return false;
    }
  },
  async update(id: string, item: any): Promise<boolean> {
    try {
      const updates: any = {};
      if (item.deedNumber !== undefined) updates.deed_number = item.deedNumber;
      if (item.entryDate !== undefined) updates.deed_date = item.entryDate;
      if (item.childName !== undefined) updates.child_name = item.childName;
      if (item.bioParents !== undefined) updates.bio_parents = item.bioParents;
      if (item.adoptiveParents !== undefined) updates.adoptive_parents = item.adoptiveParents;
      if (item.description !== undefined) updates.notes = item.description;

      const { error } = await supabase.from("child_adoptions").update(updates).eq("id", id);
      return !error;
    } catch {
      return false;
    }
  },
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("child_adoptions").delete().eq("id", id);
    return !error;
  }
};

export const mailLogService = {
  async getAll(fallback: any[] = []): Promise<any[]> {
    try {
      const { data, error } = await supabase.from("mail_logs").select("*").order("created_at", { ascending: true });
      if (error || !data || data.length === 0) return fallback;
      const mapped = data.map((row, idx) => ({
        id: row.id || `ML-${idx + 1}`,
        receivedDate: row.letter_date || "-",
        letterNumber: row.letter_number || "-",
        letterDate: row.letter_date || "-",
        origin: row.sender || "-",
        subject: row.subject || "-",
        destination: row.recipient || "-",
        sender: row.sender || "-",
        recipient: row.recipient || "-",
        notes: row.notes || "-",
        type: row.mail_type || (row.sender === "-" ? "OUTGOING" : "INCOMING")
      }));
      const remoteIds = new Set(mapped.map((m: any) => String(m.id)));
      const extraLocal = (fallback || []).filter((l: any) => l && l.id && !remoteIds.has(String(l.id)));
      return [...mapped, ...extraLocal];
    } catch {
      return fallback;
    }
  },
  async create(item: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("mail_logs").insert({
        letter_number: item.letterNumber || item.letter_number || "-",
        letter_date: item.letterDate || item.receivedDate || item.letter_date || new Date().toISOString().split("T")[0],
        sender: item.origin || item.sender || "-",
        recipient: item.destination || item.recipient || "-",
        subject: item.subject || "-",
        notes: item.notes || null,
        mail_type: item.type || item.mail_type || "INCOMING",
      });
      return !error;
    } catch {
      return false;
    }
  },
  async update(id: string, item: any): Promise<boolean> {
    try {
      const updates: any = {};
      if (item.letterNumber !== undefined) updates.letter_number = item.letterNumber;
      if (item.letterDate !== undefined) updates.letter_date = item.letterDate;
      if (item.receivedDate !== undefined) updates.letter_date = item.receivedDate;
      if (item.origin !== undefined) updates.sender = item.origin;
      if (item.sender !== undefined) updates.sender = item.sender;
      if (item.destination !== undefined) updates.recipient = item.destination;
      if (item.recipient !== undefined) updates.recipient = item.recipient;
      if (item.subject !== undefined) updates.subject = item.subject;
      if (item.notes !== undefined) updates.notes = item.notes;

      const { error } = await supabase.from("mail_logs").update(updates).eq("id", id);
      return !error;
    } catch {
      return false;
    }
  },
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("mail_logs").delete().eq("id", id);
    return !error;
  }
};

export const klapperService = {
  async getAll(fallback: any[] = []): Promise<any[]> {
    try {
      const { data, error } = await supabase.from("klappers").select("*").order("created_at", { ascending: false });
      if (error || !data || data.length === 0) return fallback;
      const mapped = data.map((row, index) => ({
        id: row.id || `KL-${String(index + 1).padStart(3, "0")}`,
        appearerName: row.appearer_name || "-",
        deedNature: row.deed_nature || "-",
        deedDate: row.deed_date || "-",
        deedNumber: row.deed_number || "-",
        repertoriumNumber: row.repertorium_number || "-",
      }));
      const remoteIds = new Set(mapped.map((m: any) => String(m.id)));
      const extraLocal = (fallback || []).filter((l: any) => l && l.id && !remoteIds.has(String(l.id)));
      return [...mapped, ...extraLocal];
    } catch {
      return fallback;
    }
  },
  async create(item: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("klappers").insert({
        appearer_name: item.appearerName || item.appearer_name || "-",
        deed_nature: item.deedNature || item.deed_nature || "-",
        deed_date: item.deedDate || item.deed_date || new Date().toISOString().split("T")[0],
        deed_number: item.deedNumber || item.deed_number || "-",
        repertorium_number: item.repertoriumNumber || item.repertorium_number || "-",
      });
      return !error;
    } catch {
      return false;
    }
  },
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("klappers").delete().eq("id", id);
    return !error;
  }
};

export const klapperLegalizedService = {
  async getAll(fallback: any[] = []): Promise<any[]> {
    try {
      const { data, error } = await supabase.from("klappers_legalized").select("*").order("created_at", { ascending: false });
      if (error || !data || data.length === 0) return fallback;
      const mapped = data.map((row, index) => ({
        id: row.id || `KLL-${String(index + 1).padStart(3, "0")}`,
        appearerName: row.appearer_name || "-",
        letterNature: row.letter_nature || "-",
        legalizedDate: row.legalized_date || "-",
        legalizedNumber: row.legalized_number || "-",
      }));
      const remoteIds = new Set(mapped.map((m: any) => String(m.id)));
      const extraLocal = (fallback || []).filter((l: any) => l && l.id && !remoteIds.has(String(l.id)));
      return [...mapped, ...extraLocal];
    } catch {
      return fallback;
    }
  },
  async create(item: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("klappers_legalized").insert({
        appearer_name: item.appearerName || item.appearer_name || "-",
        letter_nature: item.letterNature || item.letter_nature || "-",
        legalized_date: item.legalizedDate || item.legalized_date || new Date().toISOString().split("T")[0],
        legalized_number: item.legalizedNumber || item.legalized_number || "-",
      });
      return !error;
    } catch {
      return false;
    }
  },
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("klappers_legalized").delete().eq("id", id);
    return !error;
  }
};

export const hibahService = {
  async getAll(fallback: any[] = []): Promise<any[]> {
    try {
      const { data, error } = await supabase.from("hibah_registrations").select("*").order("deed_date", { ascending: false });
      if (error || !data || data.length === 0) return fallback;
      const mapped = data.map((row, index) => ({
        id: row.id || `HB-${String(index + 1).padStart(3, "0")}`,
        isNihil: !!row.is_nihil,
        deedNumber: row.deed_number || "-",
        deedDate: row.deed_date || new Date().toISOString().split("T")[0],
        grantor: row.grantor || (row.is_nihil ? "--------------------" : "-"),
        grantee: row.grantee || (row.is_nihil ? "--------------------" : "-"),
        familyRelation: row.family_relation || "-",
        objectType: row.object_type || "-",
        objectLocation: row.object_location || (row.is_nihil ? "---" : "-"),
        certificateNumber: row.certificate_number || "-",
        grantValue: row.grant_value || (row.is_nihil ? "N I H I L" : "-"),
      }));
      const remoteIds = new Set(mapped.map((m: any) => String(m.id)));
      const extraLocal = (fallback || []).filter((l: any) => l && l.id && !remoteIds.has(String(l.id)));
      return [...mapped, ...extraLocal];
    } catch {
      return fallback;
    }
  },
  async create(item: any): Promise<boolean> {
    try {
      const { error } = await supabase.from("hibah_registrations").insert({
        deed_number: item.deedNumber || item.deed_number || "-",
        deed_date: item.deedDate || item.deed_date || new Date().toISOString().split("T")[0],
        grantor: item.grantor || "-",
        grantee: item.grantee || "-",
        family_relation: item.familyRelation || item.family_relation || "-",
        object_type: item.objectType || item.object_type || "-",
        object_location: item.objectLocation || item.object_location || "-",
        certificate_number: item.certificateNumber || item.certificate_number || "-",
        grant_value: item.grantValue || item.grant_value || "-",
        is_nihil: !!item.isNihil,
      });
      return !error;
    } catch {
      return false;
    }
  },
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("hibah_registrations").delete().eq("id", id);
    return !error;
  }
};
