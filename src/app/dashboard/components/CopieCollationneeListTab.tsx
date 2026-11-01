"use client";

import React, { useState, useEffect } from "react";
import { copieCollationneeService } from "@/lib/services/supabaseService";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import styles from "../dashboard.module.css";

interface CopieCollationneeEntry {
  isNihil?: boolean;
  id: string;
  date: string;         // Tanggal Collation / Pencatatan (YYYY-MM-DD)
  deedNumber: string;   // Nomor Akta
  deedDate: string;     // Tanggal Akta (YYYY-MM-DD)
  letterNumber: string; // Nomor Surat
  letterDate: string;   // Tanggal Surat (YYYY-MM-DD)
  summary: string;      // Isi Ringkas
  attendees: string;    // Penghadap
  notes: string;        // Keterangan
}

interface CopieCollationneeRow {
  isNihil: boolean;
  dateLabel: string;
  entry?: CopieCollationneeEntry;
  serialNum: string | number;
}

export default function CopieCollationneeListTab() {
  const [showNihilModal, setShowNihilModal] = useState(false);
  const [nihilMonth, setNihilMonth] = useState("01");
  const [nihilYear, setNihilYear] = useState("2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const indonesianMonths = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Simulated Database for Copie Collationnee
  
  const [entries, setEntries] = useState<CopieCollationneeEntry[]>([]);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState("");

  // Input states
  const [date, setDate] = useState("");
  const [deedNumber, setDeedNumber] = useState("");
  const [deedDate, setDeedDate] = useState("");
  const [letterNumber, setLetterNumber] = useState("");
  const [letterDate, setLetterDate] = useState("");
  const [summary, setSummary] = useState("");
  const [attendees, setAttendees] = useState("");
  const [notes, setNotes] = useState("");

  // Restore draft form values from localStorage on mount (hydration-safe)
  useEffect(() => {
    const savedDraft = localStorage.getItem("draft_copie_collationnee_form");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.showForm !== undefined) setShowForm(draft.showForm);
        if (draft.editMode !== undefined) setEditMode(draft.editMode);
        if (draft.currentEntryId !== undefined) setCurrentEntryId(draft.currentEntryId);
        if (draft.date !== undefined) setDate(draft.date);
        if (draft.deedNumber !== undefined) setDeedNumber(draft.deedNumber);
        if (draft.deedDate !== undefined) setDeedDate(draft.deedDate);
        if (draft.letterNumber !== undefined) setLetterNumber(draft.letterNumber);
        if (draft.letterDate !== undefined) setLetterDate(draft.letterDate);
        if (draft.summary !== undefined) setSummary(draft.summary);
        if (draft.attendees !== undefined) setAttendees(draft.attendees);
        if (draft.notes !== undefined) setNotes(draft.notes);
      } catch (e) {
        console.error("Gagal memuat draf pendaftaran Copie Collationnee:", e);
      }
    }
  }, []);

  // Save current form values to localStorage whenever they change
  useEffect(() => {
    if (showForm) {
      const draft = {
        showForm,
        editMode,
        currentEntryId,
        date,
        deedNumber,
        deedDate,
        letterNumber,
        letterDate,
        summary,
        attendees,
        notes
      };
      localStorage.setItem("draft_copie_collationnee_form", JSON.stringify(draft));
    } else {
      localStorage.removeItem("draft_copie_collationnee_form");
    }
  }, [
    showForm, editMode, currentEntryId, date, deedNumber, deedDate,
    letterNumber, letterDate, summary, attendees, notes
  ]);

  const resetForm = () => {
    setDate("");
    setDeedNumber("");
    setDeedDate("");
    setLetterNumber("");
    setLetterDate("");
    setSummary("");
    setAttendees("");
    setNotes("");
    setEditMode(false);
    setCurrentEntryId("");
    setShowForm(false);
  };

  const handleOpenAddForm = () => {
    resetForm();
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    setDeedDate(today);
    setLetterDate(today);
    setShowForm(true);
  };

  const handleEdit = (entry: CopieCollationneeEntry) => {
    setCurrentEntryId(entry.id);
    setDate(entry.date);
    setDeedNumber(entry.deedNumber);
    setDeedDate(entry.deedDate);
    setLetterNumber(entry.letterNumber);
    setLetterDate(entry.letterDate);
    setSummary(entry.summary);
    setAttendees(entry.attendees);
    setNotes(entry.notes);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data Copie Collationnee ini?")) {
      const success = await copieCollationneeService.delete(id);
      if (success) {
        setEntries(entries.filter(e => e.id !== id));
      } else {
        alert("Gagal menghapus data dari database.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!summary || !attendees) {
      alert("Isi ringkas dan penghadap wajib diisi!");
      return;
    }

    if (editMode) {
      const updatedEntry = {
        date,
        deedNumber,
        deedDate,
        letterNumber,
        letterDate,
        summary,
        attendees,
        notes
      };
      const success = await copieCollationneeService.update(currentEntryId, updatedEntry);
      if (success) {
        setEntries(
          entries.map(item =>
            item.id === currentEntryId
              ? { ...item, ...updatedEntry }
              : item
          )
        );
        alert("Data Copie Collationnee berhasil diperbarui!");
      } else {
        alert("Gagal memperbarui data di database.");
      }
    } else {
      const newEntry: CopieCollationneeEntry = {
        id: `CC-${Date.now()}`,
        date,
        deedNumber,
        deedDate,
        letterNumber,
        letterDate,
        summary,
        attendees,
        notes
      };
      const success = await copieCollationneeService.create(newEntry);
      if (success) {
        setEntries([newEntry, ...entries]);
        alert("Data Copie Collationnee baru berhasil disimpan!");
      } else {
        alert("Gagal menyimpan data ke database.");
      }
    }

    resetForm();
  };

  // Generate monthly range for filtering and NIHIL rows
  const getMonthsRange = () => {
    const startY = 2026;
    const startM = 1;
    const endY = 2026;
    const endM = 12;

    const range = [];
    let currentY = startY;
    let currentM = startM;

    while (currentY < endY || (currentY === endY && currentM <= endM)) {
      const monthStr = String(currentM).padStart(2, "0");
      range.push({
        year: currentY,
        month: currentM,
        monthStr,
        label: `${indonesianMonths[currentM - 1]} ${currentY}`
      });
      
      currentM++;
      if (currentM > 12) {
        currentM = 1;
        currentY++;
      }
    }
    return range;
  };

  // Construct table rows with search filters and NIHIL rows
  const getRows = (): CopieCollationneeRow[] => {
    const rows: CopieCollationneeRow[] = [];
    const months = getMonthsRange().filter(m => {
      const matchesMonth = filterMonth === "" || m.monthStr === filterMonth;
      const matchesYear = filterYear === "" || String(m.year) === filterYear;
      return matchesMonth && matchesYear;
    });

    let serialCounter = 1;

    months.forEach((m) => {
      // Find entries in this month
      const inMonth = entries.filter(e => {
        if (!e.date) return false;
        const [eYear, eMonth] = e.date.split("-");
        return String(m.year) === eYear && m.monthStr === eMonth;
      });

      // Filter by search query
      const filteredInMonth = inMonth.filter(e => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          e.deedNumber.toLowerCase().includes(q) ||
          e.letterNumber.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q) ||
          e.attendees.toLowerCase().includes(q) ||
          e.notes.toLowerCase().includes(q)
        );
      });

      // If no entries in this month, mark as NIHIL
      const sorted = [...filteredInMonth].sort((a, b) => a.id.localeCompare(b.id));
        sorted.forEach((entry) => {
          rows.push({
            isNihil: entry.isNihil || false,
            dateLabel: m.label,
            entry,
            serialNum: entry.isNihil ? "NIHIL" : serialCounter++
        });
      });
    });
    return rows;
  };

  const rows = getRows();

  // Format YYYY-MM-DD to Indonesian Date
    const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("copie_collationnee_data");
    let fallbackData: CopieCollationneeEntry[] = [];
    if (saved) {
      try {
        fallbackData = JSON.parse(saved);
      } catch (e) {}
    }
    copieCollationneeService.getAll(fallbackData).then((data) => {
      if (data && data.length > 0) {
        setEntries(data);
      } else {
        setEntries(fallbackData);
      }
    });
    setIsHydrated(true);
  }, []);

  useRealtimeSync("copie_collationnee", () => {
    copieCollationneeService.getAll().then((data) => {
      if (data && data.length > 0) setEntries(data);
    });
  });

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("copie_collationnee_data", JSON.stringify(entries));
    }
  }, [entries, isHydrated]);

  const handleSaveNihil = async (e: React.FormEvent) => {
    e.preventDefault();
    const month = nihilMonth;
    const year = nihilYear;
    const newNihil: CopieCollationneeEntry = {
        id: `CC-NIHIL-${Date.now()}`,
        date: `${year}-${month}-01`,
        deedNumber: "---",
        deedDate: "---",
        letterNumber: "---",
        letterDate: "---",
        summary: "N I H I L",
        attendees: "--------------------",
        notes: "---",
        isNihil: true
      };
      
    const success = await copieCollationneeService.create(newNihil);
    if (success) {
      setEntries([...entries, newNihil]);
      setShowNihilModal(false);
      alert(`Registrasi NIHIL untuk bulan ${month} tahun ${year} berhasil disimpan!`);
    } else {
      alert("Gagal menyimpan data ke database.");
    }
  };

  const formatIndonesianDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    if (!dateStr.includes("-")) return dateStr;
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const day = parseInt(parts[2], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        const year = parts[0];
        return `${day} ${indonesianMonths[monthIndex] || ""} ${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // PDF Export
  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const title = `Buku Daftar Copie Collationnee - ${filterMonth ? indonesianMonths[parseInt(filterMonth) - 1] : "Semua Bulan"} ${filterYear || "Semua Tahun"}`;
    
    let rowsHtml = "";
    rows.forEach((row, index) => {
        if (row.isNihil) {
          rowsHtml += `
            <tr style="background-color: #fafafa; text-align: center;">
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #ef4444; font-weight: bold; text-align: left; white-space: nowrap;">${row.dateLabel}</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #ef4444; font-weight: bold; letter-spacing: 2px;">N I H I L</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">--------------------</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
            </tr>
          `;
        } else {
          const e = row.entry!;
          rowsHtml += `
            <tr>
              <td style="text-align: center; font-weight: bold; border: 1px solid #ddd; padding: 8px;">${row.serialNum}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${e.deedNumber}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formatIndonesianDate(e.deedDate)}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${e.letterNumber}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formatIndonesianDate(e.letterDate)}</td>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>${e.summary}</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${e.attendees}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${e.notes || "-"}</td>
            </tr>
          `;
        }
      });

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 16px; text-align: center; margin-bottom: 5px; }
            h2 { font-size: 11px; text-align: center; font-weight: normal; margin-top: 0; margin-bottom: 20px; color: #555; }
            table { width: 100%; border-collapse: collapse; font-size: 9px; }
            th { background-color: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; text-align: center; }
            td { border: 1px solid #cbd5e1; padding: 8px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center;">KANTOR NOTARIS & PPAT</h1>
          <h2 style="text-align: center; font-weight: bold;">KHAIRUN NISA, S.H., M.Kn.</h2>
          <h3 style="text-align: center; font-size: 14px; margin-top: 20px; margin-bottom: 15px;">${title}</h3>
          <table>
            <thead>
              <tr>
                ${["No. Urut","No. Akta","Tanggal Akta","No. Surat","Tanggal Surat","Isi Ringkas","Penghadap","Keterangan"].map(h => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-weight: bold;">${h}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="8" style="text-align: center; padding: 8px; font-style: italic; color: #94a3b8;">belum ada data</td></tr>`}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadExcel = () => {
    let tableHtml = `<table>
      <thead>
        <tr>
          ${["No. Urut","No. Akta","Tanggal Akta","No. Surat","Tanggal Surat","Isi Ringkas","Penghadap","Keterangan"].map(h => `<th style="background-color: #f2f2f2; font-weight: bold; border: 0.5pt solid #000000;">${h}</th>`).join("")}
        </tr>
      </thead>
      <tbody>`;

    rows.forEach((row, index) => {
        if (row.isNihil) {
          tableHtml += `
            <tr style="background-color: #fafafa; text-align: center;">
              <td style="color: #94a3b8;">---</td>
              <td style="color: #94a3b8;">---</td>
              <td style="color: #ef4444; font-weight: bold; text-align: left; white-space: nowrap;">${row.dateLabel}</td>
              <td style="color: #94a3b8;">---</td>
              <td style="color: #94a3b8;">---</td>
              <td style="color: #ef4444; font-weight: bold; letter-spacing: 2px;">N I H I L</td>
              <td style="color: #94a3b8;">--------------------</td>
              <td style="color: #94a3b8;">---</td>
            </tr>
          `;
        } else {
          const e = row.entry!;
          tableHtml += `
            <tr>
              <td>${row.serialNum}</td>
              <td>${e.deedNumber}</td>
              <td>${formatIndonesianDate(e.deedDate)}</td>
              <td>${e.letterNumber}</td>
              <td>${formatIndonesianDate(e.letterDate)}</td>
              <td><strong>${e.summary}</strong></td>
              <td>${e.attendees}</td>
              <td>${e.notes || "-"}</td>
            </tr>
          `;
        }
      });

    if (!rows.length) {
      tableHtml += `<tr><td colspan="7" style="text-align: center; font-style: italic; color: #94a3b8;">belum ada data</td></tr>`;
    }

    tableHtml += `</tbody></table>`;

    const dataType = "application/vnd.ms-excel";
    const excelFile = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <style>
          table { border-collapse: collapse; }
          th, td { border: 0.5pt solid #000000; padding: 5px; }
        </style>
      </head>
      <body>
        ${tableHtml}
      </body>
      </html>
    `;

    const blob = new Blob([excelFile], { type: dataType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CopieCollationnee.xls";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1e3a8a" }}>Buku Copie Collationnee</h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Daftar pencocokan salinan dokumen dengan surat pengantar dan naskah akta dinas.
          </p>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className={styles.cardSection} style={{ border: "1px solid #cbd5e1", background: "#f8fafc", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e3a8a", marginBottom: "1.25rem" }}>
            {editMode ? "Edit Data Copie Collationnee" : "Pencatatan Copie Collationnee Baru"}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
            
            <div>
              <label className={styles.formLabel}>Tanggal Pencatatan / Collation</label>
              <input
                type="date"
                required
                className={styles.inputField}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className={styles.formLabel}>Penghadap</label>
              <input
                type="text"
                required
                placeholder="Nama penghadap..."
                className={styles.inputField}
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
              />
            </div>

            {/* Akta Details Group */}
            <div style={{ border: "1px solid #e2e8f0", padding: "1rem", borderRadius: "0.5rem", backgroundColor: "#ffffff" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#1e3a8a", display: "block", marginBottom: "0.5rem" }}>Dokumen Akta</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div>
                  <label className={styles.formLabel} style={{ fontSize: "0.75rem" }}>Nomor Akta</label>
                  <input
                    type="text"
                    placeholder="Contoh: 12/2026"
                    className={styles.inputField}
                    value={deedNumber}
                    onChange={(e) => setDeedNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className={styles.formLabel} style={{ fontSize: "0.75rem" }}>Tanggal Akta</label>
                  <input
                    type="date"
                    className={styles.inputField}
                    value={deedDate}
                    onChange={(e) => setDeedDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Surat Details Group */}
            <div style={{ border: "1px solid #e2e8f0", padding: "1rem", borderRadius: "0.5rem", backgroundColor: "#ffffff" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#16a34a", display: "block", marginBottom: "0.5rem" }}>Dokumen Surat</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div>
                  <label className={styles.formLabel} style={{ fontSize: "0.75rem" }}>Nomor Surat</label>
                  <input
                    type="text"
                    placeholder="Contoh: 012/DIR-AD/VII/2026"
                    className={styles.inputField}
                    value={letterNumber}
                    onChange={(e) => setLetterNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className={styles.formLabel} style={{ fontSize: "0.75rem" }}>Tanggal Surat</label>
                  <input
                    type="date"
                    className={styles.inputField}
                    value={letterDate}
                    onChange={(e) => setLetterDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className={styles.formLabel}>Isi Ringkas</label>
              <input
                type="text"
                required
                placeholder="Rangkuman isi dokumen..."
                className={styles.inputField}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className={styles.formLabel}>Keterangan Tambahan</label>
              <input
                type="text"
                placeholder="Catatan kecil..."
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
                  backgroundColor: "#2563eb",
                  border: "none",
                  color: "#ffffff"
                }}
              >
                {editMode ? "Simpan Perubahan" : "Simpan Copie Collationnee"}
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
          
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleOpenAddForm}
              className={styles.quickActionBtn}
              style={{ 
                padding: "0.75rem 1.25rem", 
                fontSize: "0.95rem",
                backgroundColor: "#2563eb",
                border: "none",
                color: "#ffffff"
              }}
            >
              + Tambah Copie Collationnee
            </button>
            <button
              onClick={() => {
                setShowNihilModal(true);
              }}
              className={styles.quickActionBtn}
              style={{ padding: "0.75rem 1.25rem", fontSize: "0.95rem", backgroundColor: "#eab308" }}
            >
              Nihil
            </button>
          </div>

          {/* Filters Area */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            
            {/* Search Input */}
            <input
              type="text"
              placeholder="Cari collation..."
              className={styles.inputField}
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", width: "220px", margin: 0 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

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

            <div style={{ width: "1px", height: "24px", backgroundColor: "#cbd5e1", margin: "0 0.25rem" }}></div>

            {/* Export buttons */}
            <button 
              onClick={handleDownloadPDF}
              className={styles.quickActionBtn}
              style={{ backgroundColor: "#ef4444", padding: "0.5rem 0.85rem", fontSize: "0.85rem", border: "none", color: "#ffffff" }}
              title="Unduh format PDF"
            >
              PDF
            </button>

            <button 
              onClick={handleDownloadExcel}
              className={styles.quickActionBtn}
              style={{ backgroundColor: "#16a34a", padding: "0.5rem 0.85rem", fontSize: "0.85rem", border: "none", color: "#ffffff" }}
              title="Unduh format Excel"
            >
              Excel
            </button>

          </div>

        </div>
      )}

      {/* Table Container */}
      {!showForm && (
        <div className={styles.tableContainer}>
          <table className={styles.projectTable} style={{ minWidth: "1200px" }}>
            <thead>
              <tr>
                <th rowSpan={2} style={{ width: "60px", textAlign: "center" }}>No</th>
                <th colSpan={2}>Akta</th>
                <th colSpan={2}>Surat</th>
                <th rowSpan={2}>Isi Ringkas</th>
                <th rowSpan={2}>Penghadap</th>
                <th rowSpan={2}>Keterangan</th>
                <th rowSpan={2} style={{ width: "120px", textAlign: "center" }}>Aksi</th>
              </tr>
              <tr>
                <th>Nomor</th>
                <th>Tanggal</th>
                <th>Nomor</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                if (row.isNihil) {
                  return (
                    <tr key={`nihil-${idx}`} className={styles.guestRow} style={{ backgroundColor: "#fafafa" }}>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#ef4444", fontWeight: "700", whiteSpace: "nowrap" }}>{row.dateLabel}</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#ef4444", fontWeight: "700", letterSpacing: "2px", textAlign: "center" }}>N I H I L</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", textAlign: "center" }}>------------------------------------------------------</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", textAlign: "center" }}>-</td>
                    </tr>
                  );
                }

                const e = row.entry!;
                return (
                  <tr key={e.id} className={styles.guestRow}>
                    <td style={{ fontWeight: "700", color: "#64748b", textAlign: "center" }}>{row.serialNum}</td>
                    <td style={{ fontWeight: "600", color: "#334155" }}>{e.deedNumber || "-"}</td>
                    <td>{formatIndonesianDate(e.deedDate)}</td>
                    <td style={{ fontWeight: "600", color: "#334155" }}>{e.letterNumber || "-"}</td>
                    <td>{formatIndonesianDate(e.letterDate)}</td>
                    <td>{e.summary}</td>
                    <td style={{ fontWeight: "600", color: "#1e3a8a" }}>{e.attendees}</td>
                    <td style={{ fontStyle: "italic", color: "#64748b" }}>{e.notes || "-"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                        <button
                          onClick={() => handleEdit(e)}
                          className={styles.quickActionBtn}
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", backgroundColor: "#0284c7" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className={styles.quickActionBtn}
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", backgroundColor: "#dc2626" }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

