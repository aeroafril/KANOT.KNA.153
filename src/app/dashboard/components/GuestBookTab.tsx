"use client";

import React, { useState, useEffect } from "react";
import { GuestBookEntry, Activity } from "../page";
import { guestBookService } from "@/lib/services/supabaseService";
import styles from "../dashboard.module.css";

interface GuestBookTabProps {
  guestBook: GuestBookEntry[];
  setGuestBook: React.Dispatch<React.SetStateAction<GuestBookEntry[]>>;
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  editInitialGuest: GuestBookEntry | null;
  onEditFinished: () => void;
  autoOpenForm?: boolean;
  onFormOpenedHandled?: () => void;
}

export default function GuestBookTab({
  guestBook,
  setGuestBook,
  activities,
  setActivities,
  editInitialGuest,
  onEditFinished,
  autoOpenForm,
  onFormOpenedHandled,
}: GuestBookTabProps) {
  // Guestbook Form States
  const [guestName, setGuestName] = useState("");
  const [guestAddress, setGuestAddress] = useState("");
  const [guestPurpose, setGuestPurpose] = useState("");
  const [guestCategory, setGuestCategory] = useState("Lainnya");
  const [guestDate, setGuestDate] = useState("");
  const [guestTimeIn, setGuestTimeIn] = useState("");
  const [guestTimeOut, setGuestTimeOut] = useState("");
  const [guestError, setGuestError] = useState("");
  const [guestSuccess, setGuestSuccess] = useState("");
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);

  // New lookup and show form states
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [isNewClientMode, setIsNewClientMode] = useState(false);
  const [selectedClient, setSelectedClient] = useState<GuestBookEntry | null>(null);

  // Restore draft form values from localStorage on mount (hydration-safe)
  useEffect(() => {
    const savedDraft = localStorage.getItem("draft_guestbook_form");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.showRegistrationForm !== undefined) setShowRegistrationForm(draft.showRegistrationForm);
        if (draft.clientSearchQuery !== undefined) setClientSearchQuery(draft.clientSearchQuery);
        if (draft.isNewClientMode !== undefined) setIsNewClientMode(draft.isNewClientMode);
        if (draft.selectedClient !== undefined) setSelectedClient(draft.selectedClient);
        if (draft.guestName !== undefined) setGuestName(draft.guestName);
        if (draft.guestAddress !== undefined) setGuestAddress(draft.guestAddress);
        if (draft.guestPurpose !== undefined) setGuestPurpose(draft.guestPurpose);
        if (draft.guestCategory !== undefined) setGuestCategory(draft.guestCategory);
        if (draft.guestDate !== undefined) setGuestDate(draft.guestDate);
        if (draft.guestTimeIn !== undefined) setGuestTimeIn(draft.guestTimeIn);
        if (draft.guestTimeOut !== undefined) setGuestTimeOut(draft.guestTimeOut);
        if (draft.editingGuestId !== undefined) setEditingGuestId(draft.editingGuestId);
      } catch (e) {
        console.error("Gagal memuat draf pendaftaran Buku Tamu:", e);
      }
    }
  }, []);

  // Save current form values to localStorage whenever they change
  useEffect(() => {
    if (showRegistrationForm) {
      const draft = {
        showRegistrationForm,
        clientSearchQuery,
        isNewClientMode,
        selectedClient,
        guestName,
        guestAddress,
        guestPurpose,
        guestCategory,
        guestDate,
        guestTimeIn,
        guestTimeOut,
        editingGuestId
      };
      localStorage.setItem("draft_guestbook_form", JSON.stringify(draft));
    } else {
      localStorage.removeItem("draft_guestbook_form");
    }
  }, [
    showRegistrationForm, clientSearchQuery, isNewClientMode, selectedClient,
    guestName, guestAddress, guestPurpose, guestCategory, guestDate, guestTimeIn, guestTimeOut, editingGuestId
  ]);

  // Month and Year Filters for Buku Tamu Tab
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [showNihilModal, setShowNihilModal] = useState(false);
  const [nihilMonth, setNihilMonth] = useState("01");
  const [nihilYear, setNihilYear] = useState("2026");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSaveNihil = (e: React.FormEvent) => {
    e.preventDefault();
    const month = nihilMonth;
    const year = nihilYear;
    const nextIdNumber = guestBook.length > 0
      ? Math.max(...guestBook.map(g => parseInt(g.id.replace("GB-", "")))) + 1
      : 1;
    const newNihil: GuestBookEntry = {
      id: `GB-${String(nextIdNumber).padStart(3, "0")}`,
      name: "N I H I L",
      address: "---",
      purpose: "Bulan Kosong (NIHIL)",
      category: "Lainnya",
      status: "Selesai",
      timeIn: "---",
      timeOut: "---",
      date: `${year}-${month}-01`,
    };
    setGuestBook([newNihil, ...guestBook]);
    setShowNihilModal(false);
    alert(`Registrasi NIHIL untuk bulan ${month} tahun ${year} berhasil disimpan!`);
  };

  const formatIndonesianDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const day = parseInt(parts[2], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        const year = parts[0];
        return `${day} ${months[monthIndex] || ""} ${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Trigger auto open form when dashboard prompts it
  useEffect(() => {
    if (autoOpenForm) {
      setShowRegistrationForm(true);
      if (onFormOpenedHandled) {
        onFormOpenedHandled();
      }
    }
  }, [autoOpenForm, onFormOpenedHandled]);

  // Load guest data into form if selected for editing from parent/deed tab
  useEffect(() => {
    if (editInitialGuest) {
      setGuestError("");
      setGuestSuccess("");
      setGuestName(editInitialGuest.name);
      setGuestAddress(editInitialGuest.address);
      setGuestPurpose(editInitialGuest.purpose);
      setGuestCategory(editInitialGuest.category || "Yayasan");
      setGuestDate(editInitialGuest.date || "");
      setGuestTimeIn(editInitialGuest.timeIn || "");
      setGuestTimeOut(editInitialGuest.timeOut || "");
      setEditingGuestId(editInitialGuest.id);

      setShowRegistrationForm(true);
      setIsNewClientMode(true);
      setClientSearchQuery(editInitialGuest.name);
    }
  }, [editInitialGuest]);

  // Handler to add or edit a guest
  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    setGuestError("");
    setGuestSuccess("");

    if (!guestName.trim()) {
      setGuestError("Nama klien wajib diisi");
      return;
    }
    if (!guestAddress.trim()) {
      setGuestError("Alamat klien wajib diisi");
      return;
    }
    if (!guestPurpose.trim()) {
      setGuestError("Keperluan klien wajib diisi");
      return;
    }

    if (editingGuestId) {
      // Edit Mode
      setGuestBook(
        guestBook.map((guest) => {
          if (guest.id === editingGuestId) {
            return {
              ...guest,
              name: guestName,
              address: guestAddress,
              purpose: guestPurpose,
              category: guestCategory,
              date: guestDate || guest.date || new Date().toISOString().split("T")[0],
              timeIn: guestTimeIn || guest.timeIn || "12:00 WIB",
              timeOut: guestTimeOut,
            };
          }
          return guest;
        })
      );

      guestBookService.update(editingGuestId, {
        name: guestName,
        address: guestAddress,
        purpose: guestPurpose,
        category: guestCategory,
        date: guestDate,
        timeIn: guestTimeIn,
        timeOut: guestTimeOut,
      });

      const targetGuestName = guestName;
      resetForm();
      onEditFinished();
      setGuestSuccess("Perubahan data klien berhasil disimpan ke Supabase!");

      // Add dynamic activity log
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        user: "Anda",
        action: "memperbarui data klien",
        target: targetGuestName,
        time: "Baru saja",
        type: "blue",
      };
      setActivities([newActivity, ...activities]);
    } else {
      // Normal Add Mode
      const currentTime = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const nextIdNumber = guestBook.length > 0
        ? Math.max(...guestBook.map(g => parseInt(g.id.replace("GB-", "")))) + 1
        : 1;

      const newGuest: GuestBookEntry = {
        id: `GB-${String(nextIdNumber).padStart(3, "0")}`,
        name: guestName,
        address: guestAddress,
        purpose: guestPurpose,
        category: guestCategory,
        status: "Menunggu",
        timeIn: guestTimeIn || currentTime,
        timeOut: guestTimeOut,
        date: guestDate || new Date().toISOString().split("T")[0],
      };

      setGuestBook([newGuest, ...guestBook]);
      guestBookService.create(newGuest);
      resetForm();
      setGuestSuccess("Data klien berhasil disimpan ke buku tamu Supabase Database!");

      // Add dynamic activity log
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        user: "Anda",
        action: "mendaftarkan tamu baru",
        target: newGuest.name,
        time: "Baru saja",
        type: "blue",
      };
      setActivities([newActivity, ...activities]);
    }

    setTimeout(() => {
      setGuestSuccess("");
    }, 4000);
  };

  const resetForm = () => {
    setGuestName("");
    setGuestAddress("");
    setGuestPurpose("");
    setGuestCategory("Lainnya");
    setGuestDate("");
    setGuestTimeIn("");
    setGuestTimeOut("");
    setEditingGuestId(null);
    setClientSearchQuery("");
    setIsNewClientMode(false);
    setSelectedClient(null);
    setShowRegistrationForm(false);
  };

  const handleEditStart = (guest: GuestBookEntry) => {
    setGuestError("");
    setGuestSuccess("");
    setGuestName(guest.name);
    setGuestAddress(guest.address);
    setGuestPurpose(guest.purpose);
    setGuestCategory(guest.category || "Yayasan");
    setGuestDate(guest.date || "");
    setGuestTimeIn(guest.timeIn || "");
    setGuestTimeOut(guest.timeOut || "");
    setEditingGuestId(guest.id);

    setShowRegistrationForm(true);
    setIsNewClientMode(true);
    setClientSearchQuery(guest.name);
  };

  const handleCancelEdit = () => {
    resetForm();
    onEditFinished();
    setGuestError("");
  };

  const handleDeleteGuest = (id: string) => {
    const targetGuest = guestBook.find(g => g.id === id);
    if (confirm(`Apakah Anda yakin ingin menghapus data klien "${targetGuest?.name || id}"?`)) {
      setGuestBook(guestBook.filter((guest) => guest.id !== id));
      guestBookService.delete(id);

      if (targetGuest) {
        const newActivity: Activity = {
          id: `act-${Date.now()}`,
          user: "Anda",
          action: "menghapus data klien",
          target: targetGuest.name,
          time: "Baru saja",
          type: "red",
        };
        setActivities([newActivity, ...activities]);
      }
    }
  };

  const handleCheckOutGuest = (id: string) => {
    const checkoutTime = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setGuestBook(
      guestBook.map((guest) => {
        if (guest.id === id) {
          return {
            ...guest,
            status: "Selesai",
            timeOut: checkoutTime,
          };
        }
        return guest;
      })
    );
    guestBookService.update(id, { timeOut: checkoutTime, status: "Selesai" });

    const targetGuest = guestBook.find(g => g.id === id);
    if (targetGuest) {
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        user: "Anda",
        action: "mencatat kepulangan klien",
        target: `${targetGuest.name} pada ${checkoutTime}`,
        time: "Baru saja",
        type: "green",
      };
      setActivities([newActivity, ...activities]);
    }
  };

  const handleToggleStatus = (id: string) => {
    setGuestBook(
      guestBook.map((guest) => {
        if (guest.id === id) {
          const nextStatusMap: Record<GuestBookEntry["status"], GuestBookEntry["status"]> = {
            Menunggu: "Diproses",
            Diproses: "Selesai",
            Selesai: "Menunggu",
          };
          const nextStatus = nextStatusMap[guest.status];
          guestBookService.update(id, { status: nextStatus });

          const newActivity: Activity = {
            id: `act-${Date.now()}`,
            user: "Anda",
            action: "mengubah status klien",
            target: `${guest.name} -> ${nextStatus}`,
            time: "Baru saja",
            type: "orange",
          };
          setActivities([newActivity, ...activities]);

          return { ...guest, status: nextStatus };
        }
        return guest;
      })
    );
  };

  // Filter guestbook by search query and date (month/year)
  const filteredGuests = guestBook.filter((guest) => {
    if (guest.name === "N I H I L") return false;

    const matchesSearch =
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (guest.date) {
      const dateParts = guest.date.split("-");
      const guestYear = dateParts[0];
      const guestMonth = dateParts[1];

      const matchesMonth = filterMonth === "" || guestMonth === filterMonth;
      const matchesYear = filterYear === "" || guestYear === filterYear;

      return matchesMonth && matchesYear;
    }
    return filterMonth === "" && filterYear === "";
  });

  const uniquePastClients = React.useMemo(() => {
    const clientsMap = new Map<string, GuestBookEntry>();
    [...guestBook].reverse().forEach(g => {
      if (g.name && g.name.trim() !== "" && g.name !== "N I H I L") {
        clientsMap.set(g.name.toLowerCase().trim(), g);
      }
    });
    return Array.from(clientsMap.values());
  }, [guestBook]);

  return (
    <>
      {/* Header section */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Buku Tamu Klien</h1>
        <p className={styles.welcomeSubtitle}>Kelola registrasi kunjungan klien dan gunakan filter tahun/bulan untuk memantau data historis.</p>
      </div>

      {/* Button to toggle add new guest form if collapsed */}
      {!showRegistrationForm && (
        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}>
          <button
            onClick={() => {
              setShowRegistrationForm(true);
              const currentTime = new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              });
              setGuestDate(new Date().toISOString().split("T")[0]);
              setGuestTimeIn(currentTime);
            }}
            className={styles.quickActionBtn}
            style={{ padding: "0.75rem 1.25rem", fontSize: "0.95rem" }}
          >
            + Registrasi Tamu Baru
          </button>

        </div>
      )}

      {/* Guestbook Form and List Grid */}
      <div className={styles.guestbookGrid}>

        {/* Horizontal Guestbook Form */}
        {showRegistrationForm && (
          <div className={styles.cardSection}>
            <h2 className={styles.cardTitle} style={{ marginBottom: "1.25rem" }}>
              {editingGuestId ? `Edit Data Klien (${editingGuestId})` : "Registrasi Klien Baru"}
            </h2>

            <form onSubmit={handleAddGuest}>
              {selectedClient && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.75rem 1rem", borderRadius: "0.5rem", marginBottom: "1.25rem" }}>
                  <span style={{ fontSize: "0.85rem", color: "#166534", fontWeight: "600" }}>
                    ✓ Klien Terdaftar Terpilih: <strong>{selectedClient.name}</strong> (Data profil diisi otomatis)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClient(null);
                      setGuestName("");
                      setGuestAddress("");
                      setGuestCategory("Yayasan");
                      setClientSearchQuery("");
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#b91c1c",
                      fontWeight: "700",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                  >
                    Batal Pilih
                  </button>
                </div>
              )}

              {isNewClientMode && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "0.75rem 1rem", borderRadius: "0.5rem", marginBottom: "1.25rem" }}>
                  <span style={{ fontSize: "0.85rem", color: "#1e40af", fontWeight: "600" }}>
                    📝 Mode Pendaftaran Klien Baru: Silakan lengkapi biodata di bawah.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewClientMode(false);
                      setGuestName("");
                      setGuestAddress("");
                      setGuestCategory("Yayasan");
                      setClientSearchQuery("");
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#64748b",
                      fontWeight: "700",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                  >
                    Reset
                  </button>
                </div>
              )}

              {guestError && (
                <div className={`${styles.alertBox} ${styles.alertBoxError}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{guestError}</span>
                </div>
              )}

              {guestSuccess && (
                <div className={`${styles.alertBox} ${styles.alertBoxSuccess}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>{guestSuccess}</span>
                </div>
              )}

              <div className={styles.guestbookFormHorizontal}>
                {/* Kolom Pertama: Pencarian / Nama Klien */}
                <div>
                  <label className={styles.formLabel}>Cari / Nama Klien</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Ketik nama untuk mencari..."
                      className={styles.inputField}
                      value={clientSearchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setClientSearchQuery(val);
                        setGuestName(val);

                        if (selectedClient && val !== selectedClient.name) {
                          setSelectedClient(null);
                          setGuestAddress("");
                          setGuestCategory("Yayasan");
                        }
                      }}
                      disabled={editingGuestId !== null}
                    />

                    {clientSearchQuery && !selectedClient && !isNewClientMode && editingGuestId === null && (
                      <div style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "0.5rem",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        zIndex: 50,
                        maxHeight: "200px",
                        overflowY: "auto",
                        marginTop: "4px"
                      }}>
                        {uniquePastClients.filter(c => c.name.toLowerCase().includes(clientSearchQuery.toLowerCase())).length > 0 ? (
                          uniquePastClients
                            .filter(c => c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()))
                            .map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setSelectedClient(c);
                                  setGuestName(c.name);
                                  setGuestAddress(c.address);
                                  setGuestCategory(c.category || "Yayasan");
                                  setClientSearchQuery(c.name);
                                  setIsNewClientMode(false);
                                }}
                                style={{
                                  width: "100%",
                                  padding: "0.75rem 1rem",
                                  textAlign: "left",
                                  border: "none",
                                  background: "none",
                                  cursor: "pointer",
                                  fontSize: "0.85rem",
                                  color: "#0f172a",
                                  borderBottom: "1px solid #f1f5f9",
                                  display: "flex",
                                  justifyContent: "space-between"
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                              >
                                <span><strong>{c.name}</strong></span>
                                <span style={{ color: "#64748b", fontSize: "0.75rem" }}>{c.category} | {c.address}</span>
                              </button>
                            ))
                        ) : (
                          <div style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#64748b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>Klien tidak ditemukan</span>
                            <button
                              type="button"
                              onClick={() => {
                                setIsNewClientMode(true);
                                setGuestName(clientSearchQuery);
                              }}
                              style={{
                                backgroundColor: "#2563eb",
                                color: "#ffffff",
                                border: "none",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "0.25rem",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                fontWeight: "600"
                              }}
                            >
                              Tambah Klien Baru
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Kolom Biodata Lainnya (Hanya tampil jika New Client Mode, Terpilih, atau Sedang Edit) */}
                {(selectedClient || isNewClientMode || editingGuestId) && (
                  <>
                    <div>
                      <label htmlFor="guestAddress" className={styles.formLabel}>Alamat Klien</label>
                      <input
                        id="guestAddress"
                        type="text"
                        placeholder="Alamat klien..."
                        className={styles.inputField}
                        value={guestAddress}
                        onChange={(e) => setGuestAddress(e.target.value)}
                        disabled={selectedClient !== null}
                      />
                    </div>


                    <div>
                      <label htmlFor="guestDate" className={styles.formLabel}>Tanggal Kunjungan</label>
                      <input
                        id="guestDate"
                        type="date"
                        className={styles.inputField}
                        value={guestDate}
                        onChange={(e) => setGuestDate(e.target.value)}
                        style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                      />
                    </div>

                    <div>
                      <label htmlFor="guestTimeIn" className={styles.formLabel}>Waktu Masuk</label>
                      <input
                        id="guestTimeIn"
                        type="text"
                        placeholder="Misal: 10:15 WIB"
                        className={styles.inputField}
                        value={guestTimeIn}
                        onChange={(e) => setGuestTimeIn(e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="guestTimeOut" className={styles.formLabel}>Waktu Keluar</label>
                      <input
                        id="guestTimeOut"
                        type="text"
                        placeholder="Misal: 11:30 WIB"
                        className={styles.inputField}
                        value={guestTimeOut}
                        onChange={(e) => setGuestTimeOut(e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="guestPurpose" className={styles.formLabel}>Keperluan Kunjungan</label>
                      <input
                        id="guestPurpose"
                        type="text"
                        placeholder="Tujuan kunjungan..."
                        className={styles.inputField}
                        value={guestPurpose}
                        onChange={(e) => setGuestPurpose(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {(selectedClient || isNewClientMode || editingGuestId) && (
                  <div style={{ display: "flex", gap: "0.5rem", width: "100%", marginTop: "0.5rem" }}>
                    <button
                      type="submit"
                      className={styles.quickActionBtn}
                      style={{
                        justifyContent: "center",
                        padding: "0.75rem 1rem",
                        fontSize: "0.95rem",
                        backgroundColor: editingGuestId ? "#16a34a" : "#2563eb",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {editingGuestId ? "Perbarui" : "Simpan"}
                    </button>
                    <button
                      type="button"
                      className={styles.quickActionBtn}
                      onClick={handleCancelEdit}
                      style={{
                        justifyContent: "center",
                        padding: "0.75rem 1rem",
                        fontSize: "0.95rem",
                        backgroundColor: "#64748b",
                        whiteSpace: "nowrap"
                      }}
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Guestbook List Table Card */}
        <div className={styles.cardSection}>
          <div className={styles.cardHeader} style={{ flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 className={styles.cardTitle}>Daftar Buku Tamu Klien</h2>
              <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginTop: "0.25rem" }}>
                Menampilkan {filteredGuests.length} kunjungan. Klik badge status untuk mengubahnya.
              </span>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Cari klien..."
                className={styles.inputField}
                style={{ padding: "0.375rem 0.75rem", fontSize: "0.85rem", width: "180px" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                style={{ padding: "0.375rem 0.75rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.85rem", backgroundColor: "#ffffff", color: "#0f172a" }}
              >
                <option value="">Semua Bulan</option>
                <option value="01">Januari</option>
                <option value="02">Februari</option>
                <option value="03">Maret</option>
                <option value="04">April</option>
                <option value="05">Mei</option>
                <option value="06">Juni</option>
                <option value="07">Juli</option>
                <option value="08">Agustus</option>
                <option value="09">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>

              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                style={{ padding: "0.375rem 0.75rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.85rem", backgroundColor: "#ffffff", color: "#0f172a" }}
              >
                <option value="">Semua Tahun</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.projectTable}>
              <thead>
                <tr>
                  <th>Klien</th>
                  <th>Kategori</th>
                  <th>Alamat</th>
                  <th>Keperluan</th>
                  <th>Tanggal / Waktu</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "#64748b", padding: "2rem", fontWeight: "600" }}>
                      belum ada data
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((guest) => (
                    <tr key={guest.id} className={styles.guestRow}>
                      <td>
                        <div className={styles.projectNameCell}>
                          <span className={styles.projectName}>{guest.name}</span>
                          <span className={styles.projectCategory}>{guest.id}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: "600", color: "#475569" }}>
                        {guest.category}
                      </td>
                      <td style={{ color: "#475569", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {guest.address}
                      </td>
                      <td style={{ color: "#0f172a", maxWidth: "200px" }}>
                        {guest.purpose}
                      </td>
                      <td style={{ color: "#64748b", whiteSpace: "nowrap" }}>
                        <div>{formatIndonesianDate(guest.date)}</div>
                        <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: "0.125rem" }}>
                          Masuk: {guest.timeIn}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: "0.125rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          Keluar: {guest.timeOut ? (
                            guest.timeOut
                          ) : (
                            <button
                              onClick={() => handleCheckOutGuest(guest.id)}
                              style={{
                                padding: "0.125rem 0.375rem",
                                fontSize: "0.7rem",
                                backgroundColor: "#ef4444",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "0.25rem",
                                cursor: "pointer",
                                fontWeight: "600",
                                display: "inline-flex",
                                alignItems: "center"
                              }}
                              title="Set Waktu Keluar Klien"
                            >
                              Set Keluar
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${guest.status === "Selesai"
                            ? styles.badgeSelesai
                            : guest.status === "Diproses"
                              ? styles.badgeDiproses
                              : styles.badgeMenunggu
                            }`}
                          onClick={() => handleToggleStatus(guest.id)}
                          title="Klik untuk mengubah status"
                        >
                          {guest.status}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button
                          className={styles.editBtn}
                          onClick={() => handleEditStart(guest)}
                          title="Edit data klien"
                          aria-label="Edit klien"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteGuest(guest.id)}
                          title="Hapus dari buku tamu"
                          aria-label="Hapus klien"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )))}
                {filteredGuests.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                      belum ada data klien yang sesuai dengan filter atau pencarian Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* NIHIL Registration Modal */}

      {showNihilModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "0.75rem",
            padding: "1.5rem",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem 0" }}>
              Registrasi NIHIL Bulanan
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 1.25rem 0" }}>
              Catat bulan kosong (tidak ada klient) secara resmi untuk laporan bulanan.
            </p>

            <form onSubmit={handleSaveNihil}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155" }}>Pilih Bulan</label>
                  <select
                    value={nihilMonth}
                    onChange={(e) => setNihilMonth(e.target.value)}
                    style={{ padding: "0.625rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", width: "100%", backgroundColor: "#ffffff" }}
                  >
                    <option value="01">Januari</option>
                    <option value="02">Februari</option>
                    <option value="03">Maret</option>
                    <option value="04">April</option>
                    <option value="05">Mei</option>
                    <option value="06">Juni</option>
                    <option value="07">Juli</option>
                    <option value="08">Agustus</option>
                    <option value="09">September</option>
                    <option value="10">Oktober</option>
                    <option value="11">November</option>
                    <option value="12">Desember</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155" }}>Pilih Tahun</label>
                  <select
                    value={nihilYear}
                    onChange={(e) => setNihilYear(e.target.value)}
                    style={{ padding: "0.625rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", width: "100%", backgroundColor: "#ffffff" }}
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowNihilModal(false)}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", backgroundColor: "#ffffff", color: "#64748b", cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", border: "none", borderRadius: "0.375rem", backgroundColor: "#eab308", color: "#ffffff", fontWeight: "600", cursor: "pointer" }}
                >
                  Simpan NIHIL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


