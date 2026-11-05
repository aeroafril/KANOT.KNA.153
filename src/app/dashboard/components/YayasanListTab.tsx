"use client";

import React, { useState, useEffect } from "react";
import { GuestBookEntry } from "../page";
import { yayasanService } from "@/lib/services/supabaseService";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import styles from "../dashboard.module.css";

interface YayasanEntry {
  isNihil?: boolean;
  id: string;
  deedDate: string; // Tanggal Akta (YYYY-MM-DD)
  deedNumber: string; // Nomor Akta
  name: string; // Yayasan
  founders: string; // Nama Pendiri
  status: string; // Status
  address: string; // Alamat Yayasan
  registeredKemenkumham: string; // Didaftarkan di Kementerian Hukum dan HAM RI
  legalization: string; // Pengesahan Akta
  amendmentDate: string; // Tanggal Perubahan Akta
  description: string; // Keterangan
}

interface YayasanRow {
  isNihil: boolean;
  dateLabel: string;
  yayasan?: YayasanEntry;
  deedNoIndex: string; // Custom sequential No. starts from 1 for actual deeds, or "-" for NIHIL
}

interface YayasanListTabProps {
  guestBook: GuestBookEntry[];
}

export default function YayasanListTab({ guestBook }: YayasanListTabProps) {
  const [showNihilModal, setShowNihilModal] = useState(false);
  const [editingNihilId, setEditingNihilId] = useState<string | null>(null);
  const [nihilMonth, setNihilMonth] = useState("01");
  const [nihilYear, setNihilYear] = useState("2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Yayasan Mock Database starting from Jan 2026
  
  const [yayasans, setYayasans] = useState<YayasanEntry[]>([]);

  // Form states for manual registration
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<GuestBookEntry | null>(null);
  const [yayasanName, setYayasanName] = useState("");
  const [deedNumber, setDeedNumber] = useState("");
  const [deedDate, setDeedDate] = useState("");
  const [founders, setFounders] = useState("");
  const [status, setStatus] = useState("Aktif");
  const [address, setAddress] = useState("");
  const [registeredKemenkumham, setRegisteredKemenkumham] = useState("");
  const [legalization, setLegalization] = useState("");
  const [amendmentDate, setAmendmentDate] = useState("");
  const [description, setDescription] = useState("");

  // Restore draft form values from localStorage on mount (hydration-safe)
  useEffect(() => {
    const savedDraft = localStorage.getItem("draft_yayasan_form");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.showForm !== undefined) setShowForm(draft.showForm);
        if (draft.selectedClient !== undefined) setSelectedClient(draft.selectedClient);
        if (draft.yayasanName !== undefined) setYayasanName(draft.yayasanName);
        if (draft.deedNumber !== undefined) setDeedNumber(draft.deedNumber);
        if (draft.deedDate !== undefined) setDeedDate(draft.deedDate);
        if (draft.founders !== undefined) setFounders(draft.founders);
        if (draft.status !== undefined) setStatus(draft.status);
        if (draft.address !== undefined) setAddress(draft.address);
        if (draft.registeredKemenkumham !== undefined) setRegisteredKemenkumham(draft.registeredKemenkumham);
        if (draft.legalization !== undefined) setLegalization(draft.legalization);
        if (draft.amendmentDate !== undefined) setAmendmentDate(draft.amendmentDate);
        if (draft.description !== undefined) setDescription(draft.description);
      } catch (e) {
        console.error("Gagal memuat draf pendaftaran Yayasan:", e);
      }
    }
  }, []);

  // Save current form values to localStorage whenever they change
  useEffect(() => {
    if (showForm) {
      const draft = {
        showForm,
        selectedClient,
        yayasanName,
        deedNumber,
        deedDate,
        founders,
        status,
        address,
        registeredKemenkumham,
        legalization,
        amendmentDate,
        description
      };
      localStorage.setItem("draft_yayasan_form", JSON.stringify(draft));
    } else {
      localStorage.removeItem("draft_yayasan_form");
    }
  }, [
    showForm, selectedClient, yayasanName, deedNumber, deedDate, founders,
    status, address, registeredKemenkumham, legalization, amendmentDate, description
  ]);

  const indonesianMonths = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Helpers for formatting date string to human read
    const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("yayasans_data");
    let fallbackYayasans: YayasanEntry[] = [];
    if (saved) {
      try {
        fallbackYayasans = JSON.parse(saved);
      } catch (e) {}
    }
    yayasanService.getAll(fallbackYayasans).then((data) => {
      if (data && data.length > 0) {
        setYayasans(data);
      } else {
        setYayasans(fallbackYayasans);
      }
    });
    setIsHydrated(true);
  }, []);

  useRealtimeSync("yayasan_registrations", () => {
    yayasanService.getAll().then((data) => {
      if (data && data.length > 0) setYayasans(data);
    });
  });

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("yayasans_data", JSON.stringify(yayasans));
    }
  }, [yayasans, isHydrated]);

  const handleSaveNihil = (e: React.FormEvent) => {
    e.preventDefault();
    const month = nihilMonth;
    const year = nihilYear;

    if (editingNihilId) {
      const hasExistingYayasans = yayasans.some(y => {
        if (y.id === editingNihilId) return false;
        if (!y.deedDate) return false;
        const [yYear, yMonth] = y.deedDate.split("-");
        return yYear === year && yMonth === month && !y.isNihil;
      });
      if (hasExistingYayasans) {
        alert(`Tidak dapat mengubah NIHIL! Sudah ada akta Yayasan terdaftar pada bulan ${month} tahun ${year}.`);
        return;
      }

      const hasAlreadyNihil = yayasans.some(y => {
        if (y.id === editingNihilId) return false;
        if (!y.deedDate) return false;
        const [yYear, yMonth] = y.deedDate.split("-");
        return yYear === year && yMonth === month && y.isNihil;
      });
      if (hasAlreadyNihil) {
        alert(`Data NIHIL untuk bulan ${month} tahun ${year} sudah terdaftar!`);
        return;
      }

      const updated = yayasans.map(y => {
        if (y.id === editingNihilId) {
          return {
            ...y,
            deedDate: `${year}-${month}-01`
          };
        }
        return y;
      });
      setYayasans(updated);
      setShowNihilModal(false);
      setEditingNihilId(null);
      alert(`Data NIHIL berhasil diperbarui!`);
      return;
    }

    const hasExistingYayasans = yayasans.some(y => {
      if (!y.deedDate) return false;
      const [yYear, yMonth] = y.deedDate.split("-");
      return yYear === year && yMonth === month && !y.isNihil;
    });
    if (hasExistingYayasans) {
      alert(`Tidak dapat menyimpan NIHIL! Sudah ada akta Yayasan terdaftar pada bulan ${month} tahun ${year}.`);
      return;
    }

    const hasAlreadyNihil = yayasans.some(y => {
      if (!y.deedDate) return false;
      const [yYear, yMonth] = y.deedDate.split("-");
      return yYear === year && yMonth === month && y.isNihil;
    });
    if (hasAlreadyNihil) {
      alert(`Data NIHIL untuk bulan ${month} tahun ${year} sudah terdaftar!`);
      return;
    }

    const newNihil: YayasanEntry = {
      id: `YYS-NIHIL-${Date.now()}`,
      deedDate: `${year}-${month}-01`,
      deedNumber: "---",
      name: "N I H I L",
      founders: "--------------------",
      status: "Aktif",
      address: "---",
      registeredKemenkumham: "---",
      legalization: "---",
      amendmentDate: "---",
      description: "Bulan Kosong",
      isNihil: true
    };
    yayasanService.create({
      deed_number: "-",
      deed_date: `${year}-${month}-01`,
      yayasan_name: "N I H I L",
      founders: "-",
      is_nihil: true,
    });
    setYayasans([...yayasans, newNihil]);
    setShowNihilModal(false);
    alert(`Registrasi NIHIL untuk bulan ${month} tahun ${year} berhasil disimpan!`);
  };

  const handleDeleteYayasan = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      yayasanService.delete(id);
      setYayasans(yayasans.filter(y => y.id !== id));
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
  const handleSaveYayasan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yayasanName.trim()) {
      alert("Nama Yayasan wajib diisi!");
      return;
    }
    if (!founders.trim()) {
      alert("Nama pendiri wajib diisi!");
      return;
    }
    if (!address.trim()) {
      alert("Alamat Yayasan wajib diisi!");
      return;
    }
    if (!deedNumber.trim()) {
      alert("Nomor Akta wajib diisi!");
      return;
    }
    if (!deedDate.trim()) {
      alert("Tanggal Akta wajib diisi!");
      return;
    }

    const newYayasan: YayasanEntry = {
      id: `YYS-${String(yayasans.length + 1).padStart(3, "0")}`,
      deedDate: deedDate,
      deedNumber: deedNumber.trim(),
      name: yayasanName.trim(),
      founders: founders.trim(),
      status: status.trim() || "Aktif",
      address: address.trim(),
      registeredKemenkumham: registeredKemenkumham.trim() || "-",
      legalization: legalization.trim() || "-",
      amendmentDate: amendmentDate ? formatIndonesianDate(amendmentDate) : "-",
      description: description.trim() || "-",
    };

    yayasanService.create({
      deed_number: newYayasan.deedNumber,
      deed_date: newYayasan.deedDate || new Date().toISOString().split("T")[0],
      yayasan_name: newYayasan.name,
      founders: newYayasan.founders,
      address: newYayasan.address,
      registered_kemenkumham: newYayasan.registeredKemenkumham,
      legalization: newYayasan.legalization,
      amendment_date: newYayasan.amendmentDate,
      description: newYayasan.description,
      is_nihil: false,
    });
    setYayasans([newYayasan, ...yayasans]);
    alert("Data register Yayasan baru berhasil disimpan!");

    // Reset States
    setShowForm(false);
    setSelectedClient(null);
    setYayasanName("");
    setDeedNumber("");
    setDeedDate("");
    setFounders("");
    setStatus("Aktif");
    setAddress("");
    setRegisteredKemenkumham("");
    setLegalization("");
    setAmendmentDate("");
    setDescription("");
  };

  // Monthly range generation (2024 - 2030)
  const getMonthsRange = () => {
    const range: { year: number; month: number; label: string; monthStr: string }[] = [];
    const startYear = 2024;
    const startMonth = 1; // Januari
    
    const endYear = 2030;
    const endMonth = 12;
    
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

  // Construct Rows with auto NIHIL generation and sequence numbering
  const getYayasanRows = () => {
    let serialCounter = 1;
    const rows: YayasanRow[] = [];
    const months = getMonthsRange().filter(m => {
      const matchesMonth = filterMonth === "" || m.monthStr === filterMonth;
      const matchesYear = filterYear === "" || String(m.year) === filterYear;
      return matchesMonth && matchesYear;
    });

    months.forEach((m) => {
      // Find all Yayasan deeds in this month
      const listInMonth = yayasans.filter(y => {
        let dateYear = "";
        let dateMonthVal = -1;
        
        const dateStr = y.deedDate; // YYYY-MM-DD
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
      const filteredListInMonth = listInMonth.filter(y => {
        const matchesSearch = !searchQuery.trim() ||
          y.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          y.founders.toLowerCase().includes(searchQuery.toLowerCase()) ||
          y.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          y.deedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          y.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      });

      const sorted = [...filteredListInMonth].sort((a, b) => a.id.localeCompare(b.id));
      sorted.forEach((yayasan) => {
        rows.push({
          isNihil: yayasan.isNihil || false,
          dateLabel: m.label,
          yayasan,
          deedNoIndex: yayasan.isNihil ? "-" : String(serialCounter++)
        });
      });});

    return rows;
  };

  const yayasanRows = getYayasanRows();

  // PDF Export
  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const title = `Buku Daftar Yayasan - ${filterMonth ? indonesianMonths[parseInt(filterMonth) - 1] : "Semua Bulan"} ${filterYear || "Semua Tahun"}`;
    
    let rowsHtml = "";
    yayasanRows.forEach((row, index) => {
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
          const y = row.yayasan!;
          rowsHtml += `
            <tr>
              <td style="text-align: center; font-weight: bold; border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${y.deedNumber}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formatIndonesianDate(y.deedDate)}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${y.deedNumber}</td>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>${y.name}</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${y.founders}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${y.address}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${y.legalization}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${y.description}</td>
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
                ${["No","No. Register","Tanggal Akta","No. Akta","Nama Yayasan","Pendiri","Alamat Yayasan","Pengesahan","Keterangan"].map(h => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-weight: bold;">${h}</th>`).join("")}
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
          ${["No. Register","Tanggal Akta","No. Akta","Nama Yayasan","Pendiri","Alamat Yayasan","Pengesahan","Keterangan"].map(h => `<th style="background-color: #f2f2f2; font-weight: bold; border: 0.5pt solid #000000;">${h}</th>`).join("")}
        </tr>
      </thead>
      <tbody>`;

    yayasanRows.forEach((row, index) => {
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
          const y = row.yayasan!;
          tableHtml += `
            <tr>
              <td>${y.deedNumber}</td>
              <td>${formatIndonesianDate(y.deedDate)}</td>
              <td>${y.deedNumber}</td>
              <td><strong>${y.name}</strong></td>
              <td>${y.founders}</td>
              <td>${y.address}</td>
              <td>${y.legalization}</td>
              <td>${y.description}</td>
            </tr>
          `;
        }
      });

    if (!yayasanRows.length) {
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
    a.download = "Yayasan.xls";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Header section */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Buku Daftar Yayasan</h1>
        <p className={styles.welcomeSubtitle}>
          Daftar registrasi buku yayasan resmi beserta pengesahan akta Kemenkumham RI.
        </p>
      </div>

      {/* Button to toggle add new Yayasan form */}
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
            + Daftar Yayasan Baru
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
          <h2 className={styles.cardTitle} style={{ marginBottom: "1.25rem" }}>Pendaftaran Yayasan Baru</h2>
          
          <form onSubmit={handleSaveYayasan}>
            {selectedClient && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.75rem 1rem", borderRadius: "0.5rem", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#166534", fontWeight: "600" }}>
                  ✓ Klien Terdaftar Terpilih: <strong>{selectedClient.name}</strong> (Data otomatis terisi)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClient(null);
                    setYayasanName("");
                    setFounders("");
                    setAddress("");
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
              
              {/* Nama Yayasan */}
              <div>
                <label className={styles.formLabel}>Nama Yayasan</label>
                <input
                  type="text"
                  placeholder="Nama Yayasan..."
                  className={styles.inputField}
                  value={yayasanName}
                  onChange={(e) => setYayasanName(e.target.value)}
                />
              </div>

              {/* Nomor Akta */}
              <div>
                <label className={styles.formLabel}>Nomor Akta</label>
                <input
                  type="text"
                  placeholder="Nomor Akta..."
                  className={styles.inputField}
                  value={deedNumber}
                  onChange={(e) => setDeedNumber(e.target.value)}
                />
              </div>

              {/* Tanggal Akta */}
              <div>
                <label className={styles.formLabel}>Tanggal Akta</label>
                <input
                  type="date"
                  className={styles.inputField}
                  value={deedDate}
                  onChange={(e) => setDeedDate(e.target.value)}
                />
              </div>

              {/* Nama Pendiri */}
              <div style={{ position: "relative" }}>
                <label className={styles.formLabel}>Nama Pendiri</label>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <input
                    type="text"
                    placeholder="Ketik nama pendiri..."
                    className={styles.inputField}
                    value={founders}
                    onChange={(e) => {
                      setFounders(e.target.value);
                      if (selectedClient && e.target.value !== selectedClient.name) {
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
                                setYayasanName(c.purpose.includes("Yayasan") ? c.purpose : `Yayasan ${c.name}`);
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

              {/* Status */}
              <div>
                <label className={styles.formLabel}>Status Yayasan</label>
                <select
                  className={styles.inputField}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                  <option value="Perubahan">Dalam Perubahan</option>
                </select>
              </div>

              {/* Alamat Yayasan */}
              <div>
                <label className={styles.formLabel}>Alamat Kedudukan Yayasan</label>
                <input
                  type="text"
                  placeholder="Alamat kantor Yayasan..."
                  className={styles.inputField}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* Kemenkumham RI */}
              <div>
                <label className={styles.formLabel}>Didaftarkan di Kemenkumham</label>
                <input
                  type="text"
                  placeholder="Nomor agenda pendaftaran..."
                  className={styles.inputField}
                  value={registeredKemenkumham}
                  onChange={(e) => setRegisteredKemenkumham(e.target.value)}
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

              {/* Tanggal Perubahan Akta */}
              <div>
                <label className={styles.formLabel}>Tanggal Perubahan Akta (Jika ada)</label>
                <input
                  type="date"
                  className={styles.inputField}
                  value={amendmentDate}
                  onChange={(e) => setAmendmentDate(e.target.value)}
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
                  Simpan Register Yayasan
                </button>
                <button
                  type="button"
                  className={styles.quickActionBtn}
                  onClick={() => {
                    setShowForm(false);
                    setSelectedClient(null);
                    setYayasanName("");
                    setDeedNumber("");
                    setDeedDate("");
                    setFounders("");
                    setStatus("Aktif");
                    setAddress("");
                    setRegisteredKemenkumham("");
                    setLegalization("");
                    setAmendmentDate("");
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
            <h2 className={styles.cardTitle}>Daftar Yayasan Terdaftar</h2>
            <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginTop: "0.25rem" }}>
              Total baris terdaftar (termasuk baris NIHIL bulanan): {yayasanRows.length} baris.
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Cari Yayasan..."
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
              title="Unduh Daftar Yayasan format PDF"
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
              title="Unduh Daftar Yayasan format Excel"
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

        {/* Yayasan Register Table */}
        <div className={styles.tableContainer} style={{ marginTop: "1rem" }}>
          <table className={styles.projectTable} style={{ borderCollapse: "collapse", minWidth: "1600px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", width: "70px", textAlign: "center" }}>NO. URUT</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", width: "70px", textAlign: "center" }}>NO.</th>
                <th colSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", textAlign: "center" }}>AKTA</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "180px", textAlign: "left" }}>YAYASAN</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "160px", textAlign: "left" }}>NAMA PENDIRI</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "100px", textAlign: "center" }}>STATUS</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "200px", textAlign: "left" }}>ALAMAT YAYASAN</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "200px", textAlign: "left" }}>DIDAFTARKAN DI KEMENKUMHAM RI</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "180px", textAlign: "left" }}>PENGESAHAN AKTA</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "120px", textAlign: "center" }}>TANGGAL PERUBAHAN AKTA</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "150px", textAlign: "left" }}>KETERANGAN</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", width: "120px", textAlign: "center" }}>AKSI</th>
              </tr>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th style={{ border: "1px solid #cbd5e1", padding: "8px 10px", fontSize: "0.75rem", minWidth: "120px", textAlign: "left" }}>Tanggal</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "8px 10px", fontSize: "0.75rem", minWidth: "100px", textAlign: "left" }}>Nomor</th>
              </tr>
            </thead>
            <tbody>
              {yayasans.length === 0 ? (
                  <tr className={styles.guestRow}>
                    <td colSpan={13} style={{ textAlign: "center", color: "#64748b", padding: "2rem", fontWeight: "600" }}>
                      belum ada data
                    </td>
                  </tr>
                ) : yayasanRows.map((row, index) => {
                if (row.isNihil) {
                  return (
                    <tr key={`nihil-${index}`} className={styles.guestRow} style={{ backgroundColor: "#fcfcfc" }}>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#ef4444", padding: "12px 10px", fontWeight: "700", whiteSpace: "nowrap" }}>{row.dateLabel}</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#ef4444", padding: "12px 10px", fontWeight: "700", letterSpacing: "2px" }}>N I H I L</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>--------------------</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", padding: "12px 10px", whiteSpace: "nowrap" }}>
                        <button 
                          className={styles.editBtn}
                          onClick={() => {
                            const y = row.yayasan!;
                            setEditingNihilId(y.id);
                            if (y.deedDate) {
                              const parts = y.deedDate.split("-");
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
                          onClick={() => handleDeleteYayasan(row.yayasan!.id)}
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

                const y = row.yayasan!;
                return (
                  <tr key={y.id} className={styles.guestRow}>
                    <td style={{ textAlign: "center", border: "1px solid #e2e8f0", fontWeight: "700", color: "#0f172a", padding: "12px 10px" }}>
                      {index + 1}
                    </td>
                    <td style={{ textAlign: "center", border: "1px solid #e2e8f0", fontWeight: "700", color: "#2563eb", padding: "12px 10px" }}>
                      {row.deedNoIndex}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      {formatIndonesianDate(y.deedDate)}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "600", padding: "12px 10px" }}>
                      {y.deedNumber}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "700", padding: "12px 10px" }}>
                      {y.name}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "600", padding: "12px 10px" }}>
                      {y.founders}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", textAlign: "center" }}>
                      <span className={`${styles.badge} ${
                        y.status === "Aktif" 
                          ? styles.badgeSuccess 
                          : y.status === "Tidak Aktif" 
                            ? styles.badgeWarning 
                            : styles.badgeInfo
                      }`}>
                        {y.status}
                      </span>
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px" }}>
                      {y.address}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px" }}>
                      {y.registeredKemenkumham}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", fontWeight: "600" }}>
                      {y.legalization}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", textAlign: "center" }}>
                      {y.amendmentDate}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px" }}>
                      {y.description}
                    </td>
                    <td style={{ textAlign: "center", border: "1px solid #e2e8f0", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteYayasan(y.id)}
                        title="Hapus Yayasan"
                        aria-label="Hapus Yayasan"
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
              {yayasanRows.length === 0 && (
                <tr>
                  <td colSpan={13} style={{ border: "1px solid #e2e8f0", textAlign: "center", padding: "3rem", color: "#ef4444", fontStyle: "italic", fontWeight: "700", fontSize: "1.15rem" }}>
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
              {editingNihilId ? "Ubah bulan kosong (tidak ada akta Yayasan) secara resmi." : "Catat bulan kosong (tidak ada akta Yayasan) secara resmi untuk laporan bulanan."}
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

