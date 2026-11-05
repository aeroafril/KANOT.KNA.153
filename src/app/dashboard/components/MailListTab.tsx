"use client";

import React, { useState, useEffect } from "react";
import { mailLogService } from "@/lib/services/supabaseService";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import styles from "../dashboard.module.css";

interface IncomingMail {
  id: string;
  receivedDate: string;  // Tanggal Masuk (YYYY-MM-DD)
  letterNumber: string;  // No. Surat
  letterDate: string;    // Tanggal Surat (YYYY-MM-DD)
  origin: string;        // Asal Surat
  subject: string;       // Perihal
  destination: string;   // Tujuan
  notes: string;         // Keterangan
}

interface OutgoingMail {
  id: string;
  letterDate: string;    // Tanggal Surat (YYYY-MM-DD)
  letterNumber: string;  // No. Surat
  destination: string;   // Tujuan
  subject: string;       // Perihal
  sender: string;        // Pengirim
  recipient: string;     // Penerima
  notes: string;         // Keterangan
}

export default function MailListTab() {
  const [incomingMails, setIncomingMails] = useState<IncomingMail[]>([]);
  const [outgoingMails, setOutgoingMails] = useState<OutgoingMail[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"masuk" | "keluar">("masuk");
  const [showNihilModal, setShowNihilModal] = useState(false);
  const [nihilMonth, setNihilMonth] = useState("01");
  const [nihilYear, setNihilYear] = useState("2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMailId, setCurrentMailId] = useState("");

  const [receivedDate, setReceivedDate] = useState("");
  const [letterNumber, setLetterNumber] = useState("");
  const [letterDate, setLetterDate] = useState("");
  const [origin, setOrigin] = useState("");
  const [subject, setSubject] = useState("");
  const [destination, setDestination] = useState("");
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const savedIn = localStorage.getItem("mails_incoming_data");
    const savedOut = localStorage.getItem("mails_outgoing_data");
    let fallbackIn: IncomingMail[] = [];
    let fallbackOut: OutgoingMail[] = [];
    if (savedIn) { try { fallbackIn = JSON.parse(savedIn); } catch (e) { } }
    if (savedOut) { try { fallbackOut = JSON.parse(savedOut); } catch (e) { } }
    mailLogService.getAll().then((data) => {
      if (data && data.length > 0) {
        setIncomingMails(data.filter((m: any) => m.type === "INCOMING"));
        setOutgoingMails(data.filter((m: any) => m.type === "OUTGOING"));
      } else {
        setIncomingMails(fallbackIn);
        setOutgoingMails(fallbackOut);
      }
    });
    setIsHydrated(true);
  }, []);

  useRealtimeSync("mail_logs", () => {
    mailLogService.getAll().then((data) => {
      if (data && data.length > 0) {
        setIncomingMails(data.filter((m: any) => m.type === "INCOMING"));
        setOutgoingMails(data.filter((m: any) => m.type === "OUTGOING"));
      }
    });
  });

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("mails_incoming_data", JSON.stringify(incomingMails));
    }
  }, [incomingMails, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("mails_outgoing_data", JSON.stringify(outgoingMails));
    }
  }, [outgoingMails, isHydrated]);

  const handleSaveNihil = async (e: React.FormEvent) => {
    e.preventDefault();
    const month = nihilMonth;
    const year = nihilYear;
    if (activeSubTab === "masuk") {
      const newNihil: IncomingMail = {
        id: `MAIL-IN-NIHIL-${Date.now()}`,
        receivedDate: `${year}-${month}-01`,
        letterNumber: "---",
        letterDate: `${year}-${month}-01`,
        origin: "N I H I L",
        subject: "Bulan Kosong",
        destination: "---",
        notes: "---"
      };
      
      const success = await mailLogService.create({...newNihil, type: "INCOMING"});
      if (success) {
        setIncomingMails([...incomingMails, newNihil]);
        setShowNihilModal(false);
        alert(`Registrasi NIHIL untuk bulan ${month} tahun ${year} berhasil disimpan!`);
      } else {
        alert("Gagal menyimpan pendaftaran NIHIL ke database.");
      }
    } else {
      const newNihil: OutgoingMail = {
        id: `MAIL-OUT-NIHIL-${Date.now()}`,
        letterDate: `${year}-${month}-01`,
        letterNumber: "---",
        destination: "N I H I L",
        subject: "Bulan Kosong",
        sender: "---",
        recipient: "---",
        notes: "---"
      };
      const success = await mailLogService.create({...newNihil, type: "OUTGOING"});
      if (success) {
        setOutgoingMails([...outgoingMails, newNihil]);
        setShowNihilModal(false);
        alert(`Registrasi NIHIL untuk bulan ${month} tahun ${year} berhasil disimpan!`);
      } else {
        alert("Gagal menyimpan pendaftaran NIHIL ke database.");
      }
    }
  };

  // Restore draft form values from localStorage on mount (hydration-safe)
  useEffect(() => {
    const savedDraft = localStorage.getItem("draft_mail_form");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.showForm !== undefined) setShowForm(draft.showForm);
        if (draft.editMode !== undefined) setEditMode(draft.editMode);
        if (draft.currentMailId !== undefined) setCurrentMailId(draft.currentMailId);
        if (draft.receivedDate !== undefined) setReceivedDate(draft.receivedDate);
        if (draft.letterNumber !== undefined) setLetterNumber(draft.letterNumber);
        if (draft.letterDate !== undefined) setLetterDate(draft.letterDate);
        if (draft.origin !== undefined) setOrigin(draft.origin);
        if (draft.subject !== undefined) setSubject(draft.subject);
        if (draft.destination !== undefined) setDestination(draft.destination);
        if (draft.sender !== undefined) setSender(draft.sender);
        if (draft.recipient !== undefined) setRecipient(draft.recipient);
        if (draft.notes !== undefined) setNotes(draft.notes);
      } catch (e) {
        console.error("Gagal memuat draf pendaftaran Surat:", e);
      }
    }
  }, []);

  // Save current form values to localStorage whenever they change
  useEffect(() => {
    if (showForm) {
      const draft = {
        showForm,
        editMode,
        currentMailId,
        receivedDate,
        letterNumber,
        letterDate,
        origin,
        subject,
        destination,
        sender,
        recipient,
        notes
      };
      localStorage.setItem("draft_mail_form", JSON.stringify(draft));
    } else {
      localStorage.removeItem("draft_mail_form");
    }
  }, [
    showForm, editMode, currentMailId, receivedDate, letterNumber, letterDate,
    origin, subject, destination, sender, recipient, notes
  ]);

  const resetForm = () => {
    setReceivedDate("");
    setLetterNumber("");
    setLetterDate("");
    setOrigin("");
    setSubject("");
    setDestination("");
    setSender("");
    setRecipient("");
    setNotes("");
    setEditMode(false);
    setCurrentMailId("");
    setShowForm(false);
  };

  const handleOpenAddForm = () => {
    resetForm();
    const today = new Date().toISOString().split("T")[0];
    setReceivedDate(today);
    setLetterDate(today);
    if (activeSubTab === "keluar") {
      const nextNum = String(outgoingMails.length + 1).padStart(3, "0");
      const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
      const monthNum = parseInt(today.split("-")[1]);
      const romanMonth = roman[monthNum - 1] || "I";
      const year = today.split("-")[0];
      setLetterNumber(`${nextNum}/NOT/KNA/${romanMonth}/${year}`);
    }
    setShowForm(true);
  };

  const handleEditIncoming = (mail: IncomingMail) => {
    setCurrentMailId(mail.id);
    setReceivedDate(mail.receivedDate);
    setLetterNumber(mail.letterNumber);
    setLetterDate(mail.letterDate);
    setOrigin(mail.origin);
    setSubject(mail.subject);
    setDestination(mail.destination);
    setNotes(mail.notes);
    setEditMode(true);
    setShowForm(true);
  };

  const handleEditOutgoing = (mail: OutgoingMail) => {
    setCurrentMailId(mail.id);
    setLetterDate(mail.letterDate);
    setLetterNumber(mail.letterNumber);
    setDestination(mail.destination);
    setSubject(mail.subject);
    setSender(mail.sender);
    setRecipient(mail.recipient);
    setNotes(mail.notes);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDeleteIncoming = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data surat masuk ini?")) {
      const success = await mailLogService.delete(id);
      if (success) {
        setIncomingMails(incomingMails.filter(m => m.id !== id));
      } else {
        alert("Gagal menghapus data dari database.");
      }
    }
  };

  const handleDeleteOutgoing = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data surat keluar ini?")) {
      const success = await mailLogService.delete(id);
      if (success) {
        setOutgoingMails(outgoingMails.filter(m => m.id !== id));
      } else {
        alert("Gagal menghapus data dari database.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!letterNumber || !subject) {
      alert("Nomor surat dan perihal wajib diisi!");
      return;
    }

    if (activeSubTab === "masuk") {
      const mailData = {
        receivedDate,
        letterNumber,
        letterDate,
        origin,
        subject,
        destination,
        notes,
        type: "INCOMING"
      };

      if (editMode) {
        const success = await mailLogService.update(currentMailId, mailData);
        if (success) {
          setIncomingMails(incomingMails.map(m => m.id === currentMailId ? { ...m, ...mailData } : m));
        } else {
          alert("Gagal memperbarui data surat masuk di database.");
        }
      } else {
        const newMail: IncomingMail = { id: `MAIL-IN-${Date.now()}`, ...mailData };
        const success = await mailLogService.create(newMail);
        if (success) {
          setIncomingMails([...incomingMails, newMail]);
        } else {
          alert("Gagal menyimpan surat masuk baru ke database.");
        }
      }
    } else {
      const mailData = {
        letterDate,
        letterNumber,
        destination,
        subject,
        sender,
        recipient,
        notes,
        type: "OUTGOING"
      };

      if (editMode) {
        const success = await mailLogService.update(currentMailId, mailData);
        if (success) {
          setOutgoingMails(outgoingMails.map(m => m.id === currentMailId ? { ...m, ...mailData } : m));
        } else {
          alert("Gagal memperbarui data surat keluar di database.");
        }
      } else {
        const newMail: OutgoingMail = { id: `MAIL-OUT-${Date.now()}`, ...mailData };
        const success = await mailLogService.create(newMail);
        if (success) {
          setOutgoingMails([...outgoingMails, newMail]);
        } else {
          alert("Gagal menyimpan surat keluar baru ke database.");
        }
      }
    }

    resetForm();
  };

  // Filter Logic
  const filterMails = <T extends IncomingMail | OutgoingMail>(mails: T[]): T[] => {
    return mails.filter(mail => {
      // 1. Search Query Match
      const matchesSearch =
        mail.letterNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mail.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (activeSubTab === "masuk"
          ? (mail as IncomingMail).origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (mail as IncomingMail).destination.toLowerCase().includes(searchQuery.toLowerCase())
          : (mail as OutgoingMail).sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (mail as OutgoingMail).recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (mail as OutgoingMail).destination.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Determine date key based on category
      const dateVal = activeSubTab === "masuk"
        ? (mail as IncomingMail).receivedDate
        : (mail as OutgoingMail).letterDate;

      if (!dateVal) return true;

      // 2. Month Filter
      if (filterMonth) {
        const mailMonth = dateVal.split("-")[1];
        if (mailMonth !== filterMonth) return false;
      }

      // 3. Year Filter
      if (filterYear) {
        const mailYear = dateVal.split("-")[0];
        if (mailYear !== filterYear) return false;
      }

      return true;
    });
  };

  const filteredIncoming = filterMails(incomingMails);
  const filteredOutgoing = filterMails(outgoingMails);

  const months = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" }
  ];

  return (
    <div className={styles.cardSection}>

      {/* Title Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1e3a8a" }}>Buku Daftar Surat</h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Administrasi pencatatan surat masuk dan surat keluar kantor Notaris & PPAT.
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "2px solid #e2e8f0", marginBottom: "1.5rem" }}>
        <button
          onClick={() => {
            setActiveSubTab("masuk");
            resetForm();
          }}
          style={{
            padding: "0.75rem 1rem",
            fontWeight: "bold",
            fontSize: "0.95rem",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "masuk" ? "3px solid #2563eb" : "3px solid transparent",
            color: activeSubTab === "masuk" ? "#2563eb" : "#64748b",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          Surat Masuk ({incomingMails.length})
        </button>
        <button
          onClick={() => {
            setActiveSubTab("keluar");
            resetForm();
          }}
          style={{
            padding: "0.75rem 1rem",
            fontWeight: "bold",
            fontSize: "0.95rem",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "keluar" ? "3px solid #16a34a" : "3px solid transparent",
            color: activeSubTab === "keluar" ? "#16a34a" : "#64748b",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          Surat Keluar ({outgoingMails.length})
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className={styles.cardSection} style={{ border: "1px solid #cbd5e1", background: "#f8fafc", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: activeSubTab === "masuk" ? "#1e3a8a" : "#166534", marginBottom: "1.25rem" }}>
            {editMode
              ? `Edit Data ${activeSubTab === "masuk" ? "Surat Masuk" : "Surat Keluar"}`
              : `Registrasi ${activeSubTab === "masuk" ? "Surat Masuk" : "Surat Keluar"} Baru`
            }
          </h3>

          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>

            {/* Conditional Input based on tab */}
            {activeSubTab === "masuk" ? (
              <>
                <div>
                  <label className={styles.formLabel}>Tanggal Masuk</label>
                  <input
                    type="date"
                    required
                    className={styles.inputField}
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>No. Surat</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 012/DIR-AD/VII/2026"
                    className={styles.inputField}
                    value={letterNumber}
                    onChange={(e) => setLetterNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>Tanggal Surat</label>
                  <input
                    type="date"
                    required
                    className={styles.inputField}
                    value={letterDate}
                    onChange={(e) => setLetterDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>Asal Surat</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Pengirim / Instansi Asal"
                    className={styles.inputField}
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className={styles.formLabel}>Perihal</label>
                  <input
                    type="text"
                    required
                    placeholder="Isi pokok surat..."
                    className={styles.inputField}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>Tujuan Penerima</label>
                  <input
                    type="text"
                    required
                    placeholder="Ditujukan kepada siapa..."
                    className={styles.inputField}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={styles.formLabel}>Tanggal Surat Keluar</label>
                  <input
                    type="date"
                    required
                    className={styles.inputField}
                    value={letterDate}
                    onChange={(e) => setLetterDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>No. Surat Keluar</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 045/NOT/KNA/VII/2026"
                    className={styles.inputField}
                    value={letterNumber}
                    onChange={(e) => setLetterNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>Tujuan Penerima / Instansi</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Penerima / Instansi Tujuan"
                    className={styles.inputField}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>Pengirim (Staf Internal)</label>
                  <input
                    type="text"
                    required
                    placeholder="Staf pembuat surat..."
                    className={styles.inputField}
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className={styles.formLabel}>Perihal Surat Keluar</label>
                  <input
                    type="text"
                    required
                    placeholder="Isi pokok surat..."
                    className={styles.inputField}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>Penerima (Nama Kontak)</label>
                  <input
                    type="text"
                    required
                    placeholder="Siapa penerima surat di luar..."
                    className={styles.inputField}
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Keterangan */}
            <div>
              <label className={styles.formLabel}>Keterangan Tambahan</label>
              <input
                type="text"
                placeholder="Catatan kecil lainnya..."
                className={styles.inputField}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "0.5rem", width: "100%", gridColumn: "1 / -1", marginTop: "1rem" }}>
              <button
                type="submit"
                className={styles.quickActionBtn}
                style={{
                  justifyContent: "center",
                  padding: "0.75rem 1rem",
                  fontSize: "0.95rem",
                  backgroundColor: activeSubTab === "masuk" ? "#2563eb" : "#16a34a",
                  border: "none",
                  color: "#ffffff"
                }}
              >
                {editMode ? "Simpan Perubahan" : "Registrasi Surat"}
              </button>
              <button
                type="button"
                className={styles.quickActionBtn}
                onClick={resetForm}
                style={{ justifyContent: "center", padding: "0.75rem 1rem", fontSize: "0.95rem", backgroundColor: "#64748b", border: "none", color: "#ffffff" }}
              >
                Batal
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Main List Controls */}
      {!showForm && (
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>

          <button
            onClick={handleOpenAddForm}
            className={styles.quickActionBtn}
            style={{
              padding: "0.75rem 1.25rem",
              fontSize: "0.95rem",
              backgroundColor: activeSubTab === "masuk" ? "#2563eb" : "#16a34a",
              border: "none",
              color: "#ffffff"
            }}
          >
            {activeSubTab === "masuk" ? "+ Tambah Surat Masuk" : "+ Tambah Surat Keluar"}
          </button>

          {/* Filters Area */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>

            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Cari no. surat, perihal..."
                className={styles.inputField}
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", width: "220px", margin: 0 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Bulan */}
            <select
              className={styles.inputField}
              style={{ padding: "0.5rem", fontSize: "0.85rem", width: "120px", margin: 0, height: "100%" }}
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="">Semua Bulan</option>
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            {/* Filter Tahun */}
            <select
              className={styles.inputField}
              style={{ padding: "0.5rem", fontSize: "0.85rem", width: "100px", margin: 0, height: "100%" }}
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="">Semua Tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>

            {/* Reset Filters */}
            {(searchQuery || filterMonth || filterYear) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterMonth("");
                  setFilterYear("");
                }}
                className={styles.quickActionBtn}
                style={{ padding: "0.5rem 0.8rem", fontSize: "0.85rem", backgroundColor: "#64748b" }}
              >
                Reset
              </button>
            )}

          </div>

        </div>
      )}

      {/* Tables Container */}
      {!showForm && (
        <div className={styles.tableContainer}>
          {activeSubTab === "masuk" ? (
            // TABLE SURAT MASUK
            <table className={styles.projectTable}>
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>No</th>
                  <th>Tanggal Masuk</th>
                  <th>No. Surat</th>
                  <th>Tanggal Surat</th>
                  <th>Asal Surat</th>
                  <th>Perihal</th>
                  <th>Tujuan</th>
                  <th>Keterangan</th>
                  <th style={{ width: "120px", textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncoming.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
                      belum ada data
                    </td>
                  </tr>
                ) : (
                  filteredIncoming.map((mail, index) => (
                    <tr key={mail.id}>
                      <td style={{ fontWeight: "600", color: "#64748b" }}>{index + 1}</td>
                      <td>
                        {new Date(mail.receivedDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td style={{ fontWeight: "700", color: "#1e3a8a" }}>{mail.letterNumber}</td>
                      <td>
                        {new Date(mail.letterDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td style={{ fontWeight: "600", color: "#334155" }}>{mail.origin}</td>
                      <td>{mail.subject}</td>
                      <td style={{ color: "#475569" }}>{mail.destination}</td>
                      <td style={{ fontStyle: "italic", color: "#64748b" }}>{mail.notes || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                          <button
                            onClick={() => handleEditIncoming(mail)}
                            className={styles.quickActionBtn}
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", backgroundColor: "#0284c7" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteIncoming(mail.id)}
                            className={styles.quickActionBtn}
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", backgroundColor: "#dc2626" }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            // TABLE SURAT KELUAR
            <table className={styles.projectTable}>
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>No</th>
                  <th>Tanggal Surat</th>
                  <th>No. Surat</th>
                  <th>Tujuan</th>
                  <th>Perihal</th>
                  <th>Pengirim</th>
                  <th>Penerima</th>
                  <th>Keterangan</th>
                  <th style={{ width: "120px", textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOutgoing.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
                      belum ada data
                    </td>
                  </tr>
                ) : (
                  filteredOutgoing.map((mail, index) => (
                    <tr key={mail.id}>
                      <td style={{ fontWeight: "600", color: "#64748b" }}>{index + 1}</td>
                      <td>
                        {new Date(mail.letterDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td style={{ fontWeight: "700", color: "#166534" }}>{mail.letterNumber}</td>
                      <td style={{ fontWeight: "600", color: "#334155" }}>{mail.destination}</td>
                      <td>{mail.subject}</td>
                      <td>{mail.sender}</td>
                      <td>{mail.recipient}</td>
                      <td style={{ fontStyle: "italic", color: "#64748b" }}>{mail.notes || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                          <button
                            onClick={() => handleEditOutgoing(mail)}
                            className={styles.quickActionBtn}
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", backgroundColor: "#0284c7" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteOutgoing(mail.id)}
                            className={styles.quickActionBtn}
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", backgroundColor: "#dc2626" }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}


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
    </div>
  );
}
