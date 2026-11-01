"use client";

import React, { useState, useEffect } from "react";
import { GuestBookEntry } from "../page";
import { protestService } from "@/lib/services/supabaseService";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import styles from "../dashboard.module.css";

interface ProtestEntry {
  isNihil?: boolean;
  id: string;
  deedNumber: string; // No Akta
  protestDate: string; // Tanggal Akta Protes
  billedParty: string; // Yang ditagih
  billingParty: string; // Yang menagih
  billDate: string; // Tanggal Wesel/Cheque
  dueDate: string; // Tanggal Jatuh Waktu Wesel/Cheque
}

interface ProtestListTabProps {
  guestBook: GuestBookEntry[];
}

interface ProtestRow {
  isNihil: boolean;
  dateLabel: string;
  protest?: ProtestEntry;
}

export default function ProtestListTab({ guestBook }: ProtestListTabProps) {
  const [showNihilModal, setShowNihilModal] = useState(false);
  const [editingNihilId, setEditingNihilId] = useState<string | null>(null);
  const [nihilMonth, setNihilMonth] = useState("01");
  const [nihilYear, setNihilYear] = useState("2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Protest Deeds Mock Database
  
  const [protests, setProtests] = useState<ProtestEntry[]>([]);

  // Form states for manual Protest input
  const [showForm, setShowForm] = useState(false);
  const [deedNumber, setDeedNumber] = useState("");
  const [protestDate, setProtestDate] = useState("");
  const [billedParty, setBilledParty] = useState("");
  const [selectedClient, setSelectedClient] = useState<GuestBookEntry | null>(null);
  const [billingParty, setBillingParty] = useState("");
  const [billDate, setBillDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Restore draft form values from localStorage on mount (hydration-safe)
  useEffect(() => {
    const savedDraft = localStorage.getItem("draft_protest_form");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.showForm !== undefined) setShowForm(draft.showForm);
        if (draft.deedNumber !== undefined) setDeedNumber(draft.deedNumber);
        if (draft.protestDate !== undefined) setProtestDate(draft.protestDate);
        if (draft.billedParty !== undefined) setBilledParty(draft.billedParty);
        if (draft.selectedClient !== undefined) setSelectedClient(draft.selectedClient);
        if (draft.billingParty !== undefined) setBillingParty(draft.billingParty);
        if (draft.billDate !== undefined) setBillDate(draft.billDate);
        if (draft.dueDate !== undefined) setDueDate(draft.dueDate);
      } catch (e) {
        console.error("Gagal memuat draf pendaftaran Protes:", e);
      }
    }
  }, []);

  // Save current form values to localStorage whenever they change
  useEffect(() => {
    if (showForm) {
      const draft = {
        showForm,
        deedNumber,
        protestDate,
        billedParty,
        selectedClient,
        billingParty,
        billDate,
        dueDate
      };
      localStorage.setItem("draft_protest_form", JSON.stringify(draft));
    } else {
      localStorage.removeItem("draft_protest_form");
    }
  }, [
    showForm, deedNumber, protestDate, billedParty, selectedClient, billingParty, billDate, dueDate
  ]);

  const indonesianMonths = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Helpers for formatting date string to human read
    const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("protests_data");
    let fallbackData: ProtestEntry[] = [];
    if (saved) {
      try {
        fallbackData = JSON.parse(saved);
      } catch (e) {}
    }
    protestService.getAll(fallbackData).then((data) => {
      if (data && data.length > 0) {
        setProtests(data);
      } else {
        setProtests(fallbackData);
      }
    });
    setIsHydrated(true);
  }, []);

  useRealtimeSync("protests", () => {
    protestService.getAll().then((data) => {
      if (data && data.length > 0) setProtests(data);
    });
  });

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("protests_data", JSON.stringify(protests));
    }
  }, [protests, isHydrated]);

  const handleSaveNihil = async (e: React.FormEvent) => {
    e.preventDefault();
    const month = nihilMonth;
    const year = nihilYear;

    if (editingNihilId) {
      const hasExistingProtests = protests.some(p => {
        if (p.id === editingNihilId) return false;
        if (!p.protestDate) return false;
        const [pYear, pMonth] = p.protestDate.split("-");
        return pYear === year && pMonth === month && !p.isNihil;
      });
      if (hasExistingProtests) {
        alert(`Tidak dapat mengubah NIHIL! Sudah ada protes akta terdaftar pada bulan ${month} tahun ${year}.`);
        return;
      }

      const hasAlreadyNihil = protests.some(p => {
        if (p.id === editingNihilId) return false;
        if (!p.protestDate) return false;
        const [pYear, pMonth] = p.protestDate.split("-");
        return pYear === year && pMonth === month && p.isNihil;
      });
      if (hasAlreadyNihil) {
        alert(`Data NIHIL untuk bulan ${month} tahun ${year} sudah terdaftar!`);
        return;
      }

      const updated = protests.map(p => {
        if (p.id === editingNihilId) {
          return {
            ...p,
            protestDate: `${year}-${month}-01`
          };
        }
        return p;
      });
      setProtests(updated);
      setShowNihilModal(false);
      setEditingNihilId(null);
      alert(`Data NIHIL berhasil diperbarui! (Lokal)`);
      return;
    }

    const hasExistingProtests = protests.some(p => {
      if (!p.protestDate) return false;
      const [pYear, pMonth] = p.protestDate.split("-");
      return pYear === year && pMonth === month && !p.isNihil;
    });
    if (hasExistingProtests) {
      alert(`Tidak dapat menyimpan NIHIL! Sudah ada protes akta terdaftar pada bulan ${month} tahun ${year}.`);
      return;
    }

    const hasAlreadyNihil = protests.some(p => {
      if (!p.protestDate) return false;
      const [pYear, pMonth] = p.protestDate.split("-");
      return pYear === year && pMonth === month && p.isNihil;
    });
    if (hasAlreadyNihil) {
      alert(`Data NIHIL untuk bulan ${month} tahun ${year} sudah terdaftar!`);
      return;
    }

    const newNihil: ProtestEntry = {
      id: `PR-NIHIL-${Date.now()}`,
      deedNumber: "---",
      protestDate: `${year}-${month}-01`,
      billedParty: "N I H I L",
      billingParty: "--------------------",
      billDate: "---",
      dueDate: "---",
      isNihil: true
    };
    
    const success = await protestService.create(newNihil);
    if (success) {
      setProtests([...protests, newNihil]);
      setShowNihilModal(false);
      alert(`Registrasi NIHIL untuk bulan ${month} tahun ${year} berhasil disimpan!`);
    } else {
      alert("Gagal menyimpan data ke database.");
    }
  };

  const handleDeleteProtest = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      const success = await protestService.delete(id);
      if (success) {
        setProtests(protests.filter(p => p.id !== id));
      } else {
        alert("Gagal menghapus data dari database.");
      }
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

  // Get unique past clients from guestBook for auto-fill dropdown
  const uniquePastClients = React.useMemo(() => {
    const clientsMap = new Map<string, GuestBookEntry>();
    [...guestBook].reverse().forEach(g => {
      if (g.name && g.name.trim() !== "") {
        clientsMap.set(g.name.toLowerCase().trim(), g);
      }
    });
    return Array.from(clientsMap.values());
  }, [guestBook]);

  // Form Submit Handler
  const handleSaveProtest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deedNumber.trim()) {
      alert("Nomor akta protes wajib diisi!");
      return;
    }
    if (!billedParty.trim()) {
      alert("Nama pihak yang ditagih wajib diisi!");
      return;
    }
    if (!billingParty.trim()) {
      alert("Nama pihak yang menagih wajib diisi!");
      return;
    }

    const finalProtestDate = formatIndonesianDate(protestDate || new Date().toISOString().split("T")[0]);
    const finalBillDate = formatIndonesianDate(billDate || new Date().toISOString().split("T")[0]);
    const finalDueDate = formatIndonesianDate(dueDate || new Date().toISOString().split("T")[0]);

    const newProtest: ProtestEntry = {
      id: `PR-${Date.now()}`,
      deedNumber: deedNumber.startsWith("Akta No.") ? deedNumber : `Akta No. ${deedNumber}`,
      protestDate: finalProtestDate,
      billedParty: billedParty,
      billingParty: billingParty,
      billDate: finalBillDate,
      dueDate: finalDueDate,
    };

    const success = await protestService.create(newProtest);
    if (success) {
      setProtests([newProtest, ...protests]);
      alert("Data protes baru berhasil disimpan!");
    } else {
      alert("Gagal menyimpan data ke database.");
    }

    // Reset States
    setShowForm(false);
    setDeedNumber("");
    setProtestDate("");
    setBilledParty("");
    setSelectedClient(null);
    setBillingParty("");
    setBillDate("");
    setDueDate("");
  };

  // Get months range starting from January 2026
  const getMonthsRange = () => {
    const range: { year: number; month: number; label: string; monthStr: string }[] = [];
    const startYear = 2026;
    const startMonth = 1; // Januari
    
    const today = new Date();
    const endYear = today.getFullYear();
    const endMonth = today.getMonth() + 1; // 1-12
    
    let currentY = startYear;
    let currentM = startMonth;

    while (currentY < endYear || (currentY === endYear && currentM <= endMonth)) {
      const monthStr = String(currentM).padStart(2, "0");
      range.push({
        year: currentY,
        month: currentM,
        label: `${indonesianMonths[currentM - 1]} ${currentY}`,
        monthStr: monthStr
      });
      
      currentM++;
      if (currentM > 12) {
        currentM = 1;
        currentY++;
      }
    }
    return range;
  };

  // Get Rows with auto NIHIL generation
  const getProtestRows = () => {
    const rows: ProtestRow[] = [];
    const months = getMonthsRange().filter(m => {
      const matchesMonth = filterMonth === "" || m.monthStr === filterMonth;
      const matchesYear = filterYear === "" || String(m.year) === filterYear;
      return matchesMonth && matchesYear;
    });

    months.forEach((m) => {
      // Find all protest entries in this month
      const listInMonth = protests.filter(p => {
        let dateYear = "";
        let dateMonthVal = -1;
        
        const dateStr = p.protestDate; // YYYY-MM-DD
        if (dateStr.includes("-")) {
          const parts = dateStr.split("-");
          if (parts.length === 3) {
            dateYear = parts[0];
            dateMonthVal = parseInt(parts[1], 10);
          }
        }
        return String(m.year) === dateYear && dateMonthVal === m.month;
      });

      // Filter by search query
      const filteredListInMonth = listInMonth.filter(p => {
        const matchesSearch = !searchQuery.trim() ||
          p.billedParty.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.billingParty.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.deedNumber.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      });

      const sorted = [...filteredListInMonth].sort((a, b) => a.id.localeCompare(b.id));
      sorted.forEach((protest) => {
        rows.push({
          isNihil: protest.isNihil || false,
          dateLabel: m.label,
          protest,
        });
    });});

    return rows;
  };

  const protestRows = getProtestRows();

  // PDF Export
  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const title = `Buku Daftar Protes - ${filterMonth ? indonesianMonths[parseInt(filterMonth) - 1] : "Semua Bulan"} ${filterYear || "Semua Tahun"}`;
    
    let rowsHtml = "";
    protestRows.forEach((row, index) => {
        if (row.isNihil) {
          rowsHtml += `
            <tr style="background-color: #fafafa; text-align: center;">
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #ef4444; font-weight: bold; text-align: left; white-space: nowrap;">${row.dateLabel}</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #ef4444; font-weight: bold; letter-spacing: 2px;">N I H I L</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">--------------------</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
            </tr>
          `;
        } else {
          const p = row.protest!;
          rowsHtml += `
            <tr>
              <td style="text-align: center; font-weight: bold; border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${p.deedNumber}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formatIndonesianDate(p.protestDate)}</td>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>${p.billingParty}</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${p.billedParty}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formatIndonesianDate(p.billDate)}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formatIndonesianDate(p.dueDate)}</td>
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
                ${["No","No. Akta Protest","Tanggal Protest","Nama Kreditur","Nama Debitur","Tanggal Wesel","Jatuh Tempo"].map(h => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-weight: bold;">${h}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="7" style="text-align: center; padding: 8px; font-style: italic; color: #94a3b8;">belum ada data</td></tr>`}
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
          ${["No. Akta Protest","Tanggal Protest","Nama Kreditur","Nama Debitur","Tanggal Wesel","Jatuh Tempo"].map(h => `<th style="background-color: #f2f2f2; font-weight: bold; border: 0.5pt solid #000000;">${h}</th>`).join("")}
        </tr>
      </thead>
      <tbody>`;

    protestRows.forEach((row, index) => {
        if (row.isNihil) {
          tableHtml += `
            <tr style="background-color: #fafafa; text-align: center;">
              <td style="color: #94a3b8;">---</td>
              <td style="color: #ef4444; font-weight: bold; text-align: left; white-space: nowrap;">${row.dateLabel}</td>
              <td style="color: #ef4444; font-weight: bold; letter-spacing: 2px;">N I H I L</td>
              <td style="color: #94a3b8;">--------------------</td>
              <td style="color: #94a3b8;">---</td>
              <td style="color: #94a3b8;">---</td>
            </tr>
          `;
        } else {
          const p = row.protest!;
          tableHtml += `
            <tr>
              <td>${p.deedNumber}</td>
              <td>${formatIndonesianDate(p.protestDate)}</td>
              <td><strong>${p.billingParty}</strong></td>
              <td>${p.billedParty}</td>
              <td>${formatIndonesianDate(p.billDate)}</td>
              <td>${formatIndonesianDate(p.dueDate)}</td>
            </tr>
          `;
        }
      });

    if (!protestRows.length) {
      tableHtml += `<tr><td colspan="6" style="text-align: center; font-style: italic; color: #94a3b8;">belum ada data</td></tr>`;
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
    a.download = "Protest.xls";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Header section */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Buku Daftar Protes Akta</h1>
        <p className={styles.welcomeSubtitle}>
          Daftar pelaporan protes wesel, cheque, dan surat sanggahan pembayaran resmi yang dibuat oleh Notaris.
        </p>
      </div>

      {/* Button to toggle add new protest form */}
      {!showForm && (
        <div style={{ display: "flex", justifyContent: "flex-start", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <button
            onClick={() => {
              setShowForm(true);
              setProtestDate(new Date().toISOString().split("T")[0]);
              setBillDate(new Date().toISOString().split("T")[0]);
              setDueDate(new Date().toISOString().split("T")[0]);
            }}
            className={styles.quickActionBtn}
            style={{ padding: "0.75rem 1.25rem", fontSize: "0.95rem" }}
          >
            + Input Protes Baru
          </button>
          <button
            onClick={() => {
              setEditingNihilId(null);
              setShowNihilModal(true);
            }}
            className={styles.quickActionBtn}
            style={{ padding: "0.75rem 1.25rem", fontSize: "0.95rem", backgroundColor: "#eab308" }}
          >
            Nihil
          </button>
        </div>
      )}

      {/* Manual Registration Form */}
      {showForm && (
        <div className={styles.cardSection} style={{ marginBottom: "1.5rem" }}>
          <h2 className={styles.cardTitle} style={{ marginBottom: "1.25rem" }}>Input Protes Baru</h2>
          
          <form onSubmit={handleSaveProtest}>
            {selectedClient && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.75rem 1rem", borderRadius: "0.5rem", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#166534", fontWeight: "600" }}>
                  ✓ Klien Terdaftar Terpilih: <strong>{selectedClient.name}</strong> (Data otomatis terisi)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClient(null);
                    setBilledParty("");
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

            <div className={styles.guestbookFormHorizontal} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
              
              {/* No. Akta Protes */}
              <div>
                <label className={styles.formLabel}>Nomor Akta Protes</label>
                <input
                  type="text"
                  placeholder="Misal: 03"
                  className={styles.inputField}
                  value={deedNumber}
                  onChange={(e) => setDeedNumber(e.target.value)}
                />
              </div>

              {/* Tanggal Akta Protes */}
              <div>
                <label className={styles.formLabel}>Tanggal Akta Protes</label>
                <input
                  type="date"
                  className={styles.inputField}
                  value={protestDate}
                  onChange={(e) => setProtestDate(e.target.value)}
                  style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                />
              </div>

              {/* Yang Ditagih */}
              <div>
                <label className={styles.formLabel}>Yang Ditagih (Debitur/Drawee)</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Nama pihak yang ditagih..."
                    className={styles.inputField}
                    value={billedParty}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBilledParty(val);
                      if (selectedClient && val !== selectedClient.name) {
                        setSelectedClient(null);
                      }
                    }}
                  />

                  {billedParty && !selectedClient && (
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
                      maxHeight: "180px",
                      overflowY: "auto",
                      marginTop: "4px"
                    }}>
                      {uniquePastClients.filter(c => c.name.toLowerCase().includes(billedParty.toLowerCase())).length > 0 ? (
                        uniquePastClients
                          .filter(c => c.name.toLowerCase().includes(billedParty.toLowerCase()))
                          .map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setSelectedClient(c);
                                setBilledParty(c.name);
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
                              <span style={{ color: "#64748b", fontSize: "0.75rem" }}>{c.address}</span>
                            </button>
                          ))
                      ) : (
                        <div style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#64748b" }}>
                          Klien tidak ditemukan (Nama baru akan dibuat)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Yang Menagih */}
              <div>
                <label className={styles.formLabel}>Yang Menagih (Kreditur/Holder)</label>
                <input
                  type="text"
                  placeholder="Nama instansi / perorangan..."
                  className={styles.inputField}
                  value={billingParty}
                  onChange={(e) => setBillingParty(e.target.value)}
                />
              </div>

              {/* Tanggal Wesel/Cheque */}
              <div>
                <label className={styles.formLabel}>Tanggal Wesel/Cheque</label>
                <input
                  type="date"
                  className={styles.inputField}
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                />
              </div>

              {/* Tanggal Jatuh Waktu Wesel/Cheque */}
              <div>
                <label className={styles.formLabel}>Jatuh Tempo Wesel/Cheque</label>
                <input
                  type="date"
                  className={styles.inputField}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                />
              </div>

              {/* Form Actions */}
              <div style={{ display: "flex", gap: "0.5rem", width: "100%", gridColumn: "1 / -1", marginTop: "1rem" }}>
                <button
                  type="submit"
                  className={styles.quickActionBtn}
                  style={{ justifyContent: "center", padding: "0.75rem 1rem", fontSize: "0.95rem" }}
                >
                  Simpan Protes
                </button>
                <button
                  type="button"
                  className={styles.quickActionBtn}
                  onClick={() => {
                    setShowForm(false);
                    setDeedNumber("");
                    setProtestDate("");
                    setBilledParty("");
                    setSelectedClient(null);
                    setBillingParty("");
                    setBillDate("");
                    setDueDate("");
                  }}
                  style={{ justifyContent: "center", padding: "0.75rem 1rem", fontSize: "0.95rem", backgroundColor: "#64748b" }}
                >
                  Batal
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Main Table Card */}
      <div className={styles.cardSection}>
        <div className={styles.cardHeader} style={{ flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className={styles.cardTitle}>Daftar Protes Akta</h2>
            <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginTop: "0.25rem" }}>
              Menampilkan {protestRows.filter(r => !r.isNihil).length} catatan protes akta yang terdaftar.
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Cari protes..."
              className={styles.inputField}
              style={{ padding: "0.375rem 0.75rem", fontSize: "0.85rem", width: "200px" }}
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

            <div style={{ width: "1px", height: "24px", backgroundColor: "#cbd5e1", margin: "0 0.25rem" }}></div>

            <button 
              onClick={handleDownloadPDF}
              className={styles.quickActionBtn}
              style={{ 
                backgroundColor: "#ef4444", 
                display: "flex", 
                alignItems: "center", 
                gap: "0.375rem",
                padding: "0.5rem 0.85rem",
                fontSize: "0.85rem"
              }}
              title="Unduh Daftar Protes format PDF"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              PDF
            </button>

            <button 
              onClick={handleDownloadExcel}
              className={styles.quickActionBtn}
              style={{ 
                backgroundColor: "#16a34a", 
                display: "flex", 
                alignItems: "center", 
                gap: "0.375rem",
                padding: "0.5rem 0.85rem",
                fontSize: "0.85rem"
              }}
              title="Unduh Daftar Protes format Excel"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Excel
            </button>
          </div>
        </div>

        {/* Protests Register Table */}
        <div className={styles.tableContainer} style={{ marginTop: "1rem" }}>
          <table className={styles.projectTable} style={{ borderCollapse: "collapse", minWidth: "1200px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", width: "60px", textAlign: "center" }}>NO.</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "150px" }}>NO. AKTA PROTES</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "150px" }}>TANGGAL PROTES</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "200px" }}>YANG DITAGIH</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "200px" }}>YANG MENAGIH</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "180px" }}>TANGGAL WESEL/CHEQUE</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "220px" }}>JATUH TEMPO WESEL/CHEQUE</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", width: "120px", textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {protests.length === 0 ? (
                  <tr className={styles.guestRow}>
                    <td colSpan={8} style={{ textAlign: "center", color: "#64748b", padding: "2rem", fontWeight: "600" }}>
                      belum ada data
                    </td>
                  </tr>
                ) : protestRows.map((row, index) => {
                if (row.isNihil) {
                  return (
                    <tr key={`nihil-${index}`} className={styles.guestRow} style={{ backgroundColor: "#fcfcfc" }}>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#ef4444", padding: "12px 10px", fontWeight: "700", letterSpacing: "2px", textAlign: "center" }}>N I H I L</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px", textAlign: "center" }}>------------------------------------------------------</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#ef4444", padding: "12px 10px", fontWeight: "700", whiteSpace: "nowrap" }}>{row.dateLabel}</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", padding: "12px 10px", whiteSpace: "nowrap" }}>
                        <button 
                          className={styles.editBtn}
                          onClick={() => {
                            const p = row.protest!;
                            setEditingNihilId(p.id);
                            if (p.protestDate) {
                              const parts = p.protestDate.split("-");
                              if (parts.length === 3) {
                                setNihilYear(parts[0]);
                                setNihilMonth(parts[1]);
                              }
                            }
                            setShowNihilModal(true);
                          }}
                          title="Edit NIHIL"
                          aria-label="Edit NIHIL"
                          style={{ marginRight: "0.25rem" }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteProtest(row.protest!.id)}
                          title="Hapus NIHIL"
                          aria-label="Hapus NIHIL"
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
                  );
                }

                const p = row.protest!;
                return (
                  <tr key={p.id} className={styles.guestRow}>
                    <td style={{ textAlign: "center", border: "1px solid #e2e8f0", fontWeight: "700", color: "#0f172a", padding: "12px 10px" }}>
                      {index + 1}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", fontWeight: "700", color: "#0f172a", padding: "12px 10px" }}>
                      {p.deedNumber}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      {p.protestDate}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "600", padding: "12px 10px" }}>
                      {p.billedParty}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#334155", padding: "12px 10px" }}>
                      {p.billingParty}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      {p.billDate}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      {p.dueDate}
                    </td>
                    <td style={{ textAlign: "center", border: "1px solid #e2e8f0", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteProtest(p.id)}
                        title="Hapus Protes"
                        aria-label="Hapus Protes"
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
                );
              })}
              {protestRows.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ border: "1px solid #e2e8f0", textAlign: "center", padding: "3rem", color: "#ef4444", fontStyle: "italic", fontWeight: "700", fontSize: "1.15rem" }}>
                    NIHIL
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
              {editingNihilId ? "Edit Registrasi NIHIL" : "Registrasi NIHIL Bulanan"}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 1.25rem 0" }}>
              {editingNihilId ? "Ubah bulan kosong (tidak ada protes akta) secara resmi." : "Catat bulan kosong (tidak ada protes akta) secara resmi untuk laporan bulanan."}
            </p>
            
            <form onSubmit={handleSaveNihil}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155" }}>Pilih Bulan</label>
                  <select 
                    value={nihilMonth} 
                    onChange={(e) => setNihilMonth(e.target.value)}
                    style={{ padding: "0.625rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", width: "100%", backgroundColor: "#ffffff", color: "#000000" }}
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
                    style={{ padding: "0.625rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", width: "100%", backgroundColor: "#ffffff", color: "#000000" }}
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
                  onClick={() => {
                    setShowNihilModal(false);
                    setEditingNihilId(null);
                  }}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", backgroundColor: "#ffffff", color: "#64748b", cursor: "pointer" }}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", border: "none", borderRadius: "0.375rem", backgroundColor: "#eab308", color: "#ffffff", fontWeight: "600", cursor: "pointer" }}
                >
                  {editingNihilId ? "Simpan Perubahan" : "Simpan NIHIL"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

