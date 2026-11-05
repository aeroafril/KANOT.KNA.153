"use client";

import React, { useState, useEffect } from "react";
import { GuestBookEntry } from "../page";
import { cvService } from "@/lib/services/supabaseService";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import styles from "../dashboard.module.css";

interface CvEntry {
  isNihil?: boolean;
  id: string;
  regNumber: string; // no. (yang terisi jika ada klien/daftar cv)
  deedNumber: string; // nomor akta
  cvName: string; // nama cv
  founders: string; // pendiri
  cvAddress: string; // alamat cv
  legalization: string; // pengesahan akta
  description: string; // keterangan
  date: string; // format YYYY-MM-DD (tanggal akta)
}

interface CvRow {
  isNihil: boolean;
  dateLabel: string;
  cv?: CvEntry;
}

interface CvListTabProps {
  guestBook: GuestBookEntry[];
}

export default function CvListTab({ guestBook }: CvListTabProps) {
  const [showNihilModal, setShowNihilModal] = useState(false);
  const [editingNihilId, setEditingNihilId] = useState<string | null>(null);
  const [nihilMonth, setNihilMonth] = useState("01");
  const [nihilYear, setNihilYear] = useState("2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Cv Mock Database
  
  const [cvs, setCvs] = useState<CvEntry[]>([]);

  // Form states for manual registration
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<GuestBookEntry | null>(null);
  const [cvName, setCvName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [deedNumber, setDeedNumber] = useState("");
  const [deedDate, setDeedDate] = useState("");
  const [founders, setFounders] = useState("");
  const [cvAddress, setCvAddress] = useState("");
  const [legalization, setLegalization] = useState("");
  const [description, setDescription] = useState("");

  // Restore draft form values from localStorage on mount (hydration-safe)
  useEffect(() => {
    const savedDraft = localStorage.getItem("draft_cv_form");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.showForm !== undefined) setShowForm(draft.showForm);
        if (draft.selectedClient !== undefined) setSelectedClient(draft.selectedClient);
        if (draft.cvName !== undefined) setCvName(draft.cvName);
        if (draft.regNumber !== undefined) setRegNumber(draft.regNumber);
        if (draft.deedNumber !== undefined) setDeedNumber(draft.deedNumber);
        if (draft.deedDate !== undefined) setDeedDate(draft.deedDate);
        if (draft.founders !== undefined) setFounders(draft.founders);
        if (draft.cvAddress !== undefined) setCvAddress(draft.cvAddress);
        if (draft.legalization !== undefined) setLegalization(draft.legalization);
        if (draft.description !== undefined) setDescription(draft.description);
      } catch (e) {
        console.error("Gagal memuat draf pendaftaran CV:", e);
      }
    }
  }, []);

  // Save current form values to localStorage whenever they change
  useEffect(() => {
    if (showForm) {
      const draft = {
        showForm,
        selectedClient,
        cvName,
        regNumber,
        deedNumber,
        deedDate,
        founders,
        cvAddress,
        legalization,
        description
      };
      localStorage.setItem("draft_cv_form", JSON.stringify(draft));
    } else {
      localStorage.removeItem("draft_cv_form");
    }
  }, [
    showForm, selectedClient, cvName, regNumber, deedNumber, deedDate, founders,
    cvAddress, legalization, description
  ]);

  const indonesianMonths = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Helpers for formatting date string to human read
    const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("cvs_data");
    let fallbackCvs: CvEntry[] = [];
    if (saved) {
      try {
        fallbackCvs = JSON.parse(saved);
      } catch (e) {}
    }
    cvService.getAll(fallbackCvs).then((data) => {
      if (data && data.length > 0) {
        setCvs(data);
      } else {
        setCvs(fallbackCvs);
      }
    });
    setIsHydrated(true);
  }, []);

  useRealtimeSync("cv_registrations", () => {
    cvService.getAll().then((data) => {
      if (data && data.length > 0) setCvs(data);
    });
  });

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("cvs_data", JSON.stringify(cvs));
    }
  }, [cvs, isHydrated]);

  const handleSaveNihil = (e: React.FormEvent) => {
    e.preventDefault();
    const month = nihilMonth;
    const year = nihilYear;

    if (editingNihilId) {
      const hasExistingCvs = cvs.some(c => {
        if (c.id === editingNihilId) return false;
        if (!c.date) return false;
        const [cYear, cMonth] = c.date.split("-");
        return cYear === year && cMonth === month && !c.isNihil;
      });
      if (hasExistingCvs) {
        alert(`Tidak dapat mengubah NIHIL! Sudah ada akta CV terdaftar pada bulan ${month} tahun ${year}.`);
        return;
      }

      const hasAlreadyNihil = cvs.some(c => {
        if (c.id === editingNihilId) return false;
        if (!c.date) return false;
        const [cYear, cMonth] = c.date.split("-");
        return cYear === year && cMonth === month && c.isNihil;
      });
      if (hasAlreadyNihil) {
        alert(`Data NIHIL untuk bulan ${month} tahun ${year} sudah terdaftar!`);
        return;
      }

      const updated = cvs.map(c => {
        if (c.id === editingNihilId) {
          return {
            ...c,
            date: `${year}-${month}-01`
          };
        }
        return c;
      });
      setCvs(updated);
      setShowNihilModal(false);
      setEditingNihilId(null);
      alert(`Data NIHIL berhasil diperbarui!`);
      return;
    }

    const hasExistingCvs = cvs.some(c => {
      if (!c.date) return false;
      const [cYear, cMonth] = c.date.split("-");
      return cYear === year && cMonth === month && !c.isNihil;
    });
    if (hasExistingCvs) {
      alert(`Tidak dapat menyimpan NIHIL! Sudah ada akta CV terdaftar pada bulan ${month} tahun ${year}.`);
      return;
    }

    const hasAlreadyNihil = cvs.some(c => {
      if (!c.date) return false;
      const [cYear, cMonth] = c.date.split("-");
      return cYear === year && cMonth === month && c.isNihil;
    });
    if (hasAlreadyNihil) {
      alert(`Data NIHIL untuk bulan ${month} tahun ${year} sudah terdaftar!`);
      return;
    }

    const newNihil: CvEntry = {
      id: `CV-NIHIL-${Date.now()}`,
      regNumber: "---",
      deedNumber: "---",
      cvName: "N I H I L",
      founders: "--------------------",
      cvAddress: "---",
      legalization: "---",
      description: "Bulan Kosong",
      date: `${year}-${month}-01`,
      isNihil: true
    };
    cvService.create({
      deed_number: "-",
      deed_date: newNihil.date || `${year}-${month}-01`,
      cv_name: "N I H I L",
      founders: "-",
      capital: 0,
      is_nihil: true,
    });
    setCvs([...cvs, newNihil]);
    setShowNihilModal(false);
    alert(`Registrasi NIHIL untuk bulan ${month} tahun ${year} berhasil disimpan!`);
  };

  const handleDeleteCv = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      cvService.delete(id);
      setCvs(cvs.filter(c => c.id !== id));
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
  const handleSaveCv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvName.trim()) {
      alert("Nama CV wajib diisi!");
      return;
    }
    if (!founders.trim()) {
      alert("Nama pendiri wajib diisi!");
      return;
    }
    if (!cvAddress.trim()) {
      alert("Alamat CV wajib diisi!");
      return;
    }

    const newCv: CvEntry = {
      id: `CV-${String(cvs.length + 1).padStart(3, "0")}`,
      regNumber: regNumber.trim() || "-",
      deedNumber: deedNumber.trim() || "-",
      cvName: cvName,
      founders: founders,
      cvAddress: cvAddress,
      legalization: legalization.trim() || "-",
      description: description.trim() || "-",
      date: deedDate || new Date().toISOString().split("T")[0],
    };

    cvService.create({
      deed_number: newCv.deedNumber,
      deed_date: newCv.date || new Date().toISOString().split("T")[0],
      cv_name: newCv.cvName,
      founders: newCv.founders,
      capital: 0,
      is_nihil: false,
    });
    setCvs([newCv, ...cvs]);
    alert("Data register CV baru berhasil disimpan!");

    // Reset States
    setShowForm(false);
    setSelectedClient(null);
    setCvName("");
    setRegNumber("");
    setDeedNumber("");
    setDeedDate("");
    setFounders("");
    setCvAddress("");
    setLegalization("");
    setDescription("");
  };

  // Monthly range generation since Jan 2024
  const getMonthsRange = () => {
    const range: { year: number; month: number; label: string; monthStr: string }[] = [];
    const startYear = 2024;
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

  // Construct Rows with auto NIHIL generation
  const getCvRows = () => {
    const rows: CvRow[] = [];
    const months = getMonthsRange().filter(m => {
      const matchesMonth = filterMonth === "" || m.monthStr === filterMonth;
      const matchesYear = filterYear === "" || String(m.year) === filterYear;
      return matchesMonth && matchesYear;
    });

    months.forEach((m) => {
      // Find all CV deeds in this month
      const listInMonth = cvs.filter(c => {
        let dateYear = "";
        let dateMonthVal = -1;
        
        const dateStr = c.date; // YYYY-MM-DD
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
      const filteredListInMonth = listInMonth.filter(c => {
        const matchesSearch = !searchQuery.trim() ||
          c.cvName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.founders.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.cvAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.deedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          formatIndonesianDate(c.date).toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      });

      const sorted = [...filteredListInMonth].sort((a, b) => a.id.localeCompare(b.id));
      sorted.forEach((cv) => {
        rows.push({
          isNihil: cv.isNihil || false,
          dateLabel: m.label,
          cv,
        });
    });});

    return rows;
  };

  const cvRows = getCvRows();

  // PDF Export
  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const title = `Buku Daftar CV - ${filterMonth ? indonesianMonths[parseInt(filterMonth) - 1] : "Semua Bulan"} ${filterYear || "Semua Tahun"}`;
    
    let rowsHtml = "";
    cvRows.forEach((row, index) => {
        if (row.isNihil) {
          rowsHtml += `
            <tr style="background-color: #fafafa; text-align: center;">
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #ef4444; font-weight: bold; text-align: left; white-space: nowrap;">${row.dateLabel}</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #ef4444; font-weight: bold; letter-spacing: 2px;">N I H I L</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">--------------------</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
            </tr>
          `;
        } else {
          const c = row.cv!;
          rowsHtml += `
            <tr>
              <td style="text-align: center; font-weight: bold; border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${c.regNumber}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formatIndonesianDate(c.date)}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${c.deedNumber}</td>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>${c.cvName}</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${c.founders}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${c.cvAddress}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${c.legalization}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${c.description}</td>
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
                ${["No","No. Register","Tanggal Akta","No. Akta","Nama CV","Pendiri","Alamat CV","Pengesahan","Keterangan"].map(h => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-weight: bold;">${h}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="9" style="text-align: center; padding: 8px; font-style: italic; color: #94a3b8;">belum ada data</td></tr>`}
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
          ${["No. Register","Tanggal Akta","No. Akta","Nama CV","Pendiri","Alamat CV","Pengesahan","Keterangan"].map(h => `<th style="background-color: #f2f2f2; font-weight: bold; border: 0.5pt solid #000000;">${h}</th>`).join("")}
        </tr>
      </thead>
      <tbody>`;

    cvRows.forEach((row, index) => {
        if (row.isNihil) {
          tableHtml += `
            <tr style="background-color: #fafafa; text-align: center;">
              <td style="color: #94a3b8;">---</td>
              <td style="color: #ef4444; font-weight: bold; text-align: left; white-space: nowrap;">${row.dateLabel}</td>
              <td style="color: #94a3b8;">---</td>
              <td style="color: #ef4444; font-weight: bold; letter-spacing: 2px;">N I H I L</td>
              <td style="color: #94a3b8;">--------------------</td>
              <td style="color: #94a3b8;">---</td>
              <td style="color: #94a3b8;">---</td>
              <td style="color: #94a3b8;">---</td>
            </tr>
          `;
        } else {
          const c = row.cv!;
          tableHtml += `
            <tr>
              <td>${c.regNumber}</td>
              <td>${formatIndonesianDate(c.date)}</td>
              <td>${c.deedNumber}</td>
              <td><strong>${c.cvName}</strong></td>
              <td>${c.founders}</td>
              <td>${c.cvAddress}</td>
              <td>${c.legalization}</td>
              <td>${c.description}</td>
            </tr>
          `;
        }
      });

    if (!cvRows.length) {
      tableHtml += `<tr><td colspan="8" style="text-align: center; font-style: italic; color: #94a3b8;">belum ada data</td></tr>`;
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
    a.download = "Cv.xls";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Header section */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Buku Daftar CV</h1>
        <p className={styles.welcomeSubtitle}>
          Daftar registrasi buku perseroan komanditer (CV) resmi beserta pengesahan akta.
        </p>
      </div>

      {/* Button to toggle add new CV form */}
      {!showForm && (
        <div style={{ display: "flex", justifyContent: "flex-start", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <button
            onClick={() => {
              setShowForm(true);
              setDeedDate(new Date().toISOString().split("T")[0]);
            }}
            className={styles.quickActionBtn}
            style={{ padding: "0.75rem 1.25rem", fontSize: "0.95rem" }}
          >
            + Daftar CV Baru
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
          <h2 className={styles.cardTitle} style={{ marginBottom: "1.25rem" }}>Pendaftaran CV Baru</h2>
          
          <form onSubmit={handleSaveCv}>
            {selectedClient && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.75rem 1rem", borderRadius: "0.5rem", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#166534", fontWeight: "600" }}>
                  ✓ Klien Terdaftar Terpilih: <strong>{selectedClient.name}</strong> (Data otomatis terisi)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClient(null);
                    setCvName("");
                    setFounders("");
                    setCvAddress("");
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
              
              {/* Nama CV */}
              <div>
                <label className={styles.formLabel}>Nama CV</label>
                <input
                  type="text"
                  placeholder="Nama CV..."
                  className={styles.inputField}
                  value={cvName}
                  onChange={(e) => setCvName(e.target.value)}
                />
              </div>

              {/* No. Registrasi */}
              <div>
                <label className={styles.formLabel}>Nomor Registrasi / Pendaftaran</label>
                <input
                  type="text"
                  placeholder="Misal: 03/CV/I/2026"
                  className={styles.inputField}
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                />
              </div>

              {/* Nomor Akta */}
              <div>
                <label className={styles.formLabel}>Nomor Akta</label>
                <input
                  type="text"
                  placeholder="Misal: 05"
                  className={styles.inputField}
                  value={deedNumber}
                  onChange={(e) => setDeedNumber(e.target.value)}
                />
              </div>

              {/* Tanggal Akta */}
              <div>
                <label className={styles.formLabel}>Tanggal Pembuatan Akta</label>
                <input
                  type="date"
                  className={styles.inputField}
                  value={deedDate}
                  onChange={(e) => setDeedDate(e.target.value)}
                  style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                />
              </div>

              {/* Pendiri */}
              <div>
                <label className={styles.formLabel}>Pendiri / Sekutu Komanditer</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Nama pendiri..."
                    className={styles.inputField}
                    value={founders}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFounders(val);
                      if (selectedClient && val !== selectedClient.name) {
                        setSelectedClient(null);
                      }
                    }}
                  />

                  {founders && !selectedClient && (
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
                      {uniquePastClients.filter(c => c.name.toLowerCase().includes(founders.toLowerCase())).length > 0 ? (
                        uniquePastClients
                          .filter(c => c.name.toLowerCase().includes(founders.toLowerCase()))
                          .map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setSelectedClient(c);
                                setFounders(c.name);
                                setCvName(c.purpose.includes("CV") ? c.purpose : `CV. ${c.name}`);
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
                              <span style={{ color: "#64748b", fontSize: "0.75rem" }}>{c.purpose}</span>
                            </button>
                          ))
                      ) : (
                        <div style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#64748b" }}>
                          Klien tidak ditemukan (Data manual dapat diketik)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Alamat CV */}
              <div>
                <label className={styles.formLabel}>Alamat Kedudukan CV</label>
                <input
                  type="text"
                  placeholder="Alamat kantor CV..."
                  className={styles.inputField}
                  value={cvAddress}
                  onChange={(e) => setCvAddress(e.target.value)}
                />
              </div>

              {/* Pengesahan Akta */}
              <div>
                <label className={styles.formLabel}>Pengesahan Akta (Kemenkumham)</label>
                <input
                  type="text"
                  placeholder="Nomor pengesahan SK..."
                  className={styles.inputField}
                  value={legalization}
                  onChange={(e) => setLegalization(e.target.value)}
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className={styles.formLabel}>Keterangan</label>
                <input
                  type="text"
                  placeholder="Keterangan tambahan..."
                  className={styles.inputField}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Form Actions */}
              <div style={{ display: "flex", gap: "0.5rem", width: "100%", gridColumn: "1 / -1", marginTop: "1rem" }}>
                <button
                  type="submit"
                  className={styles.quickActionBtn}
                  style={{ justifyContent: "center", padding: "0.75rem 1rem", fontSize: "0.95rem" }}
                >
                  Simpan Register CV
                </button>
                <button
                  type="button"
                  className={styles.quickActionBtn}
                  onClick={() => {
                    setShowForm(false);
                    setSelectedClient(null);
                    setCvName("");
                    setRegNumber("");
                    setDeedNumber("");
                    setDeedDate("");
                    setFounders("");
                    setCvAddress("");
                    setLegalization("");
                    setDescription("");
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
            <h2 className={styles.cardTitle}>Daftar CV Terdaftar</h2>
            <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginTop: "0.25rem" }}>
              Total baris terdaftar (termasuk baris NIHIL bulanan): {cvRows.length} baris.
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Cari CV..."
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
              title="Unduh Daftar CV format PDF"
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
              title="Unduh Daftar CV format Excel"
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

        {/* CV Register Table */}
        <div className={styles.tableContainer} style={{ marginTop: "1rem" }}>
          <table className={styles.projectTable} style={{ borderCollapse: "collapse", minWidth: "1400px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", width: "60px", textAlign: "center" }}>NO. URUT</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "140px", textAlign: "left" }}>NO. REG</th>
                <th colSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", textAlign: "center" }}>AKTA</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "200px", textAlign: "left" }}>NAMA CV</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "180px", textAlign: "left" }}>PENDIRI</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "200px", textAlign: "left" }}>ALAMAT CV</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "180px", textAlign: "left" }}>PENGESAHAN AKTA</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "150px", textAlign: "left" }}>KETERANGAN</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", width: "120px", textAlign: "center" }}>AKSI</th>
              </tr>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th style={{ border: "1px solid #cbd5e1", padding: "8px 10px", fontSize: "0.75rem", minWidth: "120px", textAlign: "left" }}>Tanggal</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "8px 10px", fontSize: "0.75rem", minWidth: "100px", textAlign: "left" }}>Nomor</th>
              </tr>
            </thead>
            <tbody>
              {cvs.length === 0 ? (
                  <tr className={styles.guestRow}>
                    <td colSpan={10} style={{ textAlign: "center", color: "#64748b", padding: "2rem", fontWeight: "600" }}>
                      belum ada data
                    </td>
                  </tr>
                ) : cvRows.map((row, index) => {
                if (row.isNihil) {
                  return (
                    <tr key={`nihil-${index}`} className={styles.guestRow} style={{ backgroundColor: "#fcfcfc" }}>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", padding: "12px 10px", color: "#ef4444", fontWeight: "700", letterSpacing: "2px" }}>N I H I L</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#ef4444", padding: "12px 10px", fontWeight: "700", whiteSpace: "nowrap" }}>{row.dateLabel}</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>--------------------</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", padding: "12px 10px", whiteSpace: "nowrap" }}>
                        <button 
                          className={styles.editBtn}
                          onClick={() => {
                            const c = row.cv!;
                            setEditingNihilId(c.id);
                            if (c.date) {
                              const parts = c.date.split("-");
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
                          onClick={() => handleDeleteCv(row.cv!.id)}
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

                const c = row.cv!;
                return (
                  <tr key={c.id} className={styles.guestRow}>
                    <td style={{ textAlign: "center", border: "1px solid #e2e8f0", fontWeight: "700", color: "#0f172a", padding: "12px 10px" }}>
                      {index + 1}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "700", padding: "12px 10px" }}>
                      {c.regNumber}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      {formatIndonesianDate(c.date)}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "600", padding: "12px 10px" }}>
                      {c.deedNumber}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "700", padding: "12px 10px" }}>
                      {c.cvName}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "600", padding: "12px 10px" }}>
                      {c.founders}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px" }}>
                      {c.cvAddress}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", fontWeight: "600" }}>
                      {c.legalization}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px" }}>
                      {c.description}
                    </td>
                    <td style={{ textAlign: "center", border: "1px solid #e2e8f0", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteCv(c.id)}
                        title="Hapus CV"
                        aria-label="Hapus CV"
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
              {cvRows.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ border: "1px solid #e2e8f0", textAlign: "center", padding: "3rem", color: "#ef4444", fontStyle: "italic", fontWeight: "700", fontSize: "1.15rem" }}>
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
              {editingNihilId ? "Ubah bulan kosong (tidak ada akta CV) secara resmi." : "Catat bulan kosong (tidak ada akta CV) secara resmi untuk laporan bulanan."}
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

