"use client";

import React, { useState, useEffect } from "react";
import { GuestBookEntry } from "../page";
import { willsService } from "@/lib/services/supabaseService";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import styles from "../dashboard.module.css";

interface WillDeedEntry {
  isNihil?: boolean;
  id: string;
  testator: {
    fullName: string;
    formerName: string;
    birthPlace: string;
    birthDate: string;
    occupation: string;
    lastAddress: string;
  };
  willDeed: {
    deedNumber: string;
    deedDate: string;
    repNumber: string;
    deedType: string;
  };
  notaryName: string;
}

interface WillsListTabProps {
  guestBook: GuestBookEntry[];
}

interface WillRow {
  isNihil: boolean;
  dateLabel: string;
  will?: WillDeedEntry;
}

export default function WillsListTab({ guestBook }: WillsListTabProps) {
  const [showNihilModal, setShowNihilModal] = useState(false);
  const [editingNihilId, setEditingNihilId] = useState<string | null>(null);
  const [nihilMonth, setNihilMonth] = useState("01");
  const [nihilYear, setNihilYear] = useState("2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Wills Mock Database
  
  const [wills, setWills] = useState<WillDeedEntry[]>([]);

  // Form states for manual Will input
  const [showWillForm, setShowWillForm] = useState(false);
  const [testatorName, setTestatorName] = useState("");
  const [selectedClient, setSelectedClient] = useState<GuestBookEntry | null>(null);
  const [formerName, setFormerName] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [occupation, setOccupation] = useState("");
  const [lastAddress, setLastAddress] = useState("");
  const [deedNumber, setDeedNumber] = useState("");
  const [deedDate, setDeedDate] = useState("");
  const [repNumber, setRepNumber] = useState("");
  const [deedType, setDeedType] = useState("Wasiat Umum (Terbuka)");
  const [customDeedType, setCustomDeedType] = useState("");
  const [notaryName, setNotaryName] = useState("Khairun Nisa, S.H., M.Kn. - Kota Semarang");

  // Restore draft form values from localStorage on mount (hydration-safe)
  useEffect(() => {
    const savedDraft = localStorage.getItem("draft_wills_form");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.showWillForm !== undefined) setShowWillForm(draft.showWillForm);
        if (draft.testatorName !== undefined) setTestatorName(draft.testatorName);
        if (draft.selectedClient !== undefined) setSelectedClient(draft.selectedClient);
        if (draft.formerName !== undefined) setFormerName(draft.formerName);
        if (draft.birthPlace !== undefined) setBirthPlace(draft.birthPlace);
        if (draft.birthDate !== undefined) setBirthDate(draft.birthDate);
        if (draft.occupation !== undefined) setOccupation(draft.occupation);
        if (draft.lastAddress !== undefined) setLastAddress(draft.lastAddress);
        if (draft.deedNumber !== undefined) setDeedNumber(draft.deedNumber);
        if (draft.deedDate !== undefined) setDeedDate(draft.deedDate);
        if (draft.repNumber !== undefined) setRepNumber(draft.repNumber);
        if (draft.deedType !== undefined) setDeedType(draft.deedType);
        if (draft.customDeedType !== undefined) setCustomDeedType(draft.customDeedType);
        if (draft.notaryName !== undefined) setNotaryName(draft.notaryName);
      } catch (e) {
        console.error("Gagal memuat draf pendaftaran Wasiat:", e);
      }
    }
  }, []);

  // Save current form values to localStorage whenever they change
  useEffect(() => {
    if (showWillForm) {
      const draft = {
        showWillForm,
        testatorName,
        selectedClient,
        formerName,
        birthPlace,
        birthDate,
        occupation,
        lastAddress,
        deedNumber,
        deedDate,
        repNumber,
        deedType,
        customDeedType,
        notaryName
      };
      localStorage.setItem("draft_wills_form", JSON.stringify(draft));
    } else {
      localStorage.removeItem("draft_wills_form");
    }
  }, [
    showWillForm, testatorName, selectedClient, formerName, birthPlace, birthDate,
    occupation, lastAddress, deedNumber, deedDate, repNumber, deedType, customDeedType, notaryName
  ]);

  const indonesianMonths = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Helpers for formatting date string to human read
    const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("wills_data");
    let fallbackWills: WillDeedEntry[] = [];
    if (saved) {
      try {
        fallbackWills = JSON.parse(saved);
      } catch (e) {}
    }
    willsService.getAll(fallbackWills).then((data) => {
      if (data && data.length > 0) {
        setWills(data);
      } else {
        setWills(fallbackWills);
      }
    });
    setIsHydrated(true);
  }, []);

  useRealtimeSync("wills", () => {
    willsService.getAll().then((data) => {
      if (data && data.length > 0) setWills(data);
    });
  });

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("wills_data", JSON.stringify(wills));
    }
  }, [wills, isHydrated]);

  const handleSaveNihil = async (e: React.FormEvent) => {
    e.preventDefault();
    const month = nihilMonth;
    const year = nihilYear;

    if (editingNihilId) {
      // NOTE: editing a NIHIL means deleting the old one and creating a new one or updating.
      // But willsService currently lacks `update`. We won't fix edit nihil here beyond local since it wasn't requested.
      // Actually wait, let's just create if not editing. We should probably update.
      const hasExistingWills = wills.some(w => {
        if (w.id === editingNihilId) return false;
        if (w.isNihil) return false;
        const dateStr = w.willDeed.deedDate;
        if (!dateStr) return false;
        const parts = dateStr.includes("-") ? dateStr.split("-") : [];
        return parts[0] === year && parts[1] === month;
      });
      if (hasExistingWills) {
        alert(`Tidak dapat mengubah NIHIL! Sudah ada wasiat terdaftar pada bulan ${month} tahun ${year}.`);
        return;
      }

      const hasAlreadyNihil = wills.some(w => {
        if (w.id === editingNihilId) return false;
        if (!w.isNihil) return false;
        const dateStr = w.willDeed.deedDate;
        if (!dateStr) return false;
        const parts = dateStr.includes("-") ? dateStr.split("-") : [];
        return parts[0] === year && parts[1] === month;
      });
      if (hasAlreadyNihil) {
        alert(`Data NIHIL untuk bulan ${month} tahun ${year} sudah terdaftar!`);
        return;
      }

      const updated = wills.map(w => {
        if (w.id === editingNihilId) {
          return {
            ...w,
            willDeed: {
              ...w.willDeed,
              deedDate: `${year}-${month}-01`
            }
          };
        }
        return w;
      });
      setWills(updated);
      setShowNihilModal(false);
      setEditingNihilId(null);
      alert(`Data NIHIL berhasil diperbarui! (Lokal)`);
      return;
    }

    const hasExistingWills = wills.some(w => {
      if (w.isNihil) return false;
      const dateStr = w.willDeed.deedDate;
      if (!dateStr) return false;
      const parts = dateStr.includes("-") ? dateStr.split("-") : [];
      return parts[0] === year && parts[1] === month;
    });
    if (hasExistingWills) {
      alert(`Tidak dapat menyimpan NIHIL! Sudah ada wasiat terdaftar pada bulan ${month} tahun ${year}.`);
      return;
    }

    const hasAlreadyNihil = wills.some(w => {
      if (!w.isNihil) return false;
      const dateStr = w.willDeed.deedDate;
      if (!dateStr) return false;
      const parts = dateStr.includes("-") ? dateStr.split("-") : [];
      return parts[0] === year && parts[1] === month;
    });
    if (hasAlreadyNihil) {
      alert(`Data NIHIL untuk bulan ${month} tahun ${year} sudah terdaftar!`);
      return;
    }

    const newNihil: WillDeedEntry = {
      id: `W-NIHIL-${Date.now()}`,
      testator: {
        fullName: "N I H I L",
        formerName: "---",
        birthPlace: "---",
        birthDate: "---",
        occupation: "---",
        lastAddress: "---",
      },
      willDeed: {
        deedNumber: "---",
        deedDate: `${year}-${month}-01`,
        repNumber: "---",
        deedType: "Bulan Kosong",
      },
      notaryName: "Khairun Nisa, S.H., M.Kn. - Kota Semarang",
      isNihil: true
    };
    
    const success = await willsService.create(newNihil);
    if (success) {
      setWills([...wills, newNihil]);
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
  const handleSaveWill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testatorName.trim()) {
      alert("Nama pembuat wasiat wajib diisi!");
      return;
    }
    if (!deedNumber.trim()) {
      alert("Nomor akta wasiat wajib diisi!");
      return;
    }

    const finalDeedType = deedType === "Lainnya" ? (customDeedType.trim() || "Wasiat Lainnya") : deedType;
    const finalDate = formatIndonesianDate(deedDate || new Date().toISOString().split("T")[0]);

    const newWill: WillDeedEntry = {
      id: `W-${Date.now()}`,
      testator: {
        fullName: testatorName,
        formerName: formerName || "- (Nihil)",
        birthPlace: birthPlace || "-",
        birthDate: birthDate || "-",
        occupation: occupation || "-",
        lastAddress: lastAddress || "-",
      },
      willDeed: {
        deedNumber: deedNumber.startsWith("Akta No.") ? deedNumber : `Akta No. ${deedNumber}`,
        deedDate: finalDate,
        repNumber: repNumber || "-",
        deedType: finalDeedType,
      },
      notaryName: notaryName || "Khairun Nisa, S.H., M.Kn. - Kota Semarang",
    };

    const success = await willsService.create(newWill);
    if (success) {
      setWills([newWill, ...wills]);
      alert("Data wasiat baru berhasil disimpan!");
    } else {
      alert("Gagal menyimpan data ke database.");
    }

    // Reset States
    setShowWillForm(false);
    setTestatorName("");
    setSelectedClient(null);
    setFormerName("");
    setBirthPlace("");
    setBirthDate("");
    setOccupation("");
    setLastAddress("");
    setDeedNumber("");
    setDeedDate("");
    setRepNumber("");
    setDeedType("Wasiat Umum (Terbuka)");
    setCustomDeedType("");
  };

  const handleDelete = async (willId: string, testatorName: string) => {
    if (confirm(`Hapus wasiat atas nama ${testatorName}?`)) {
      const success = await willsService.delete(willId);
      if (success) {
        setWills(wills.filter(item => item.id !== willId));
      } else {
        alert("Gagal menghapus data dari database.");
      }
    }
  };

  // Get months range starting from January 2025
  const getMonthsRange = () => {
    const range: { year: number; month: number; label: string; monthStr: string }[] = [];
    const startYear = 2025;
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

  // Get Wills Rows with auto NIHIL generation
  const getWillsRows = () => {
    const rows: WillRow[] = [];
    const months = getMonthsRange().filter(m => {
      const matchesMonth = filterMonth === "" || m.monthStr === filterMonth;
      const matchesYear = filterYear === "" || String(m.year) === filterYear;
      return matchesMonth && matchesYear;
    });

    months.forEach((m) => {
      // Find all wills in this month
      const willsInMonth = wills.filter(w => {
        let dateYear = "";
        let dateMonthIdx = -1;
        
        const dateStr = w.willDeed.deedDate;
        if (dateStr.includes("-")) {
          const parts = dateStr.split("-");
          if (parts.length === 3) {
            dateYear = parts[0];
            dateMonthIdx = parseInt(parts[1], 10) - 1;
          }
        } else {
          const parts = dateStr.split(" ");
          if (parts.length === 3) {
            dateYear = parts[2];
            const monthName = parts[1];
            dateMonthIdx = indonesianMonths.findIndex(month => month.toLowerCase() === monthName.toLowerCase());
          }
        }

        return String(m.year) === dateYear && (dateMonthIdx + 1) === m.month;
      });

      // Filter by search query and type filter
      const filteredWillsInMonth = willsInMonth.filter(w => {
        if (w.isNihil) return true;
        const matchesSearch = !searchQuery.trim() ||
          w.testator.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.testator.formerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.testator.birthPlace.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.testator.lastAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.willDeed.deedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.willDeed.repNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.willDeed.deedType.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = filterType === "" || w.willDeed.deedType === filterType;
        return matchesSearch && matchesType;
      });

      // Sort by id or date and push
        const sorted = [...filteredWillsInMonth].sort((a, b) => a.id.localeCompare(b.id));
        sorted.forEach((will) => {
          rows.push({
            isNihil: will.isNihil || false,
            dateLabel: m.label,
            will,
        });
      });
    });
    return rows;
  };

  const willsRows = getWillsRows();

  // PDF Export
  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const title = `Buku Daftar Wasiat - ${filterMonth ? indonesianMonths[parseInt(filterMonth) - 1] : "Semua Bulan"} ${filterYear || "Semua Tahun"}`;
    
    let rowsHtml = "";
    willsRows.forEach((row, index) => {
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
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
            </tr>
          `;
        } else {
          const w = row.will!;
          rowsHtml += `
            <tr>
              <td style="text-align: center; font-weight: bold; border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${w.willDeed.deedNumber}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formatIndonesianDate(w.willDeed.deedDate)}</td>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>${w.testator.fullName}</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${w.testator.birthPlace}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formatIndonesianDate(w.testator.birthDate)}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${w.testator.lastAddress}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${w.willDeed.deedType}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${w.willDeed.repNumber}</td>
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
                ${["No","No. Akta","Tanggal Akta","Nama Pembuat Wasiat","Tempat Lahir","Tanggal Lahir","Alamat Terakhir","Jenis Wasiat","No. Lapor"].map(h => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-weight: bold;">${h}</th>`).join("")}
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
          ${["No. Akta","Tanggal Akta","Nama Pembuat Wasiat","Tempat Lahir","Tanggal Lahir","Alamat Terakhir","Jenis Wasiat","No. Lapor"].map(h => `<th style="background-color: #f2f2f2; font-weight: bold; border: 0.5pt solid #000000;">${h}</th>`).join("")}
        </tr>
      </thead>
      <tbody>`;

    willsRows.forEach((row, index) => {
        if (row.isNihil) {
          tableHtml += `
            <tr style="background-color: #fafafa; text-align: center;">
              <td style="color: #94a3b8;">---</td>
              <td style="color: #ef4444; font-weight: bold; text-align: left; white-space: nowrap;">${row.dateLabel}</td>
              <td style="color: #ef4444; font-weight: bold; letter-spacing: 2px;">N I H I L</td>
              <td style="color: #94a3b8;">--------------------</td>
              <td style="color: #94a3b8;">---</td>
              <td style="color: #94a3b8;">---</td>
              <td style="color: #94a3b8;">---</td>
              <td style="color: #94a3b8;">---</td>
            </tr>
          `;
        } else {
          const w = row.will!;
          tableHtml += `
            <tr>
              <td>${w.willDeed.deedNumber}</td>
              <td>${formatIndonesianDate(w.willDeed.deedDate)}</td>
              <td><strong>${w.testator.fullName}</strong></td>
              <td>${w.testator.birthPlace}</td>
              <td>${formatIndonesianDate(w.testator.birthDate)}</td>
              <td>${w.testator.lastAddress}</td>
              <td>${w.willDeed.deedType}</td>
              <td>${w.willDeed.repNumber}</td>
            </tr>
          `;
        }
      });

    if (!willsRows.length) {
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
    a.download = "Wills.xls";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Header section */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Buku Daftar Wasiat</h1>
        <p className={styles.welcomeSubtitle}>
          Daftar pelaporan akta wasiat resmi yang dibuat di hadapan Notaris / PPAT sesuai ketentuan Kementerian Hukum dan HAM.
        </p>
      </div>

      {/* Button to toggle add new Will form */}
      {!showWillForm && (
        <div style={{ display: "flex", justifyContent: "flex-start", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <button
            onClick={() => {
              setShowWillForm(true);
              setDeedDate(new Date().toISOString().split("T")[0]);
            }}
            className={styles.quickActionBtn}
            style={{ padding: "0.75rem 1.25rem", fontSize: "0.95rem" }}
          >
            + Input Wasiat Baru
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

      {/* Manual Will Registration Form */}
      {showWillForm && (
        <div className={styles.cardSection} style={{ marginBottom: "1.5rem" }}>
          <h2 className={styles.cardTitle} style={{ marginBottom: "1.25rem" }}>Input Wasiat Baru</h2>
          
          <form onSubmit={handleSaveWill}>
            {selectedClient && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.75rem 1rem", borderRadius: "0.5rem", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#166534", fontWeight: "600" }}>
                  ✓ Klien Terdaftar Terpilih: <strong>{selectedClient.name}</strong> (Alamat otomatis terisi)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClient(null);
                    setTestatorName("");
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
              
              {/* Cari Nama / Pembuat Wasiat */}
              <div>
                <label className={styles.formLabel}>Cari Nama Pembuat Wasiat</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Nama lengkap pembuat wasiat..."
                    className={styles.inputField}
                    value={testatorName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTestatorName(val);
                      if (selectedClient && val !== selectedClient.name) {
                        setSelectedClient(null);
                      }
                    }}
                  />

                  {testatorName && !selectedClient && (
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
                      {uniquePastClients.filter(c => c.name.toLowerCase().includes(testatorName.toLowerCase())).length > 0 ? (
                        uniquePastClients
                          .filter(c => c.name.toLowerCase().includes(testatorName.toLowerCase()))
                          .map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setSelectedClient(c);
                                setTestatorName(c.name);
                                setLastAddress(c.address);
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

              {/* Dahulu Bernama */}
              <div>
                <label className={styles.formLabel}>Dahulu Bernama</label>
                <input
                  type="text"
                  placeholder="Misal: Tan Kok Liong..."
                  className={styles.inputField}
                  value={formerName}
                  onChange={(e) => setFormerName(e.target.value)}
                />
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className={styles.formLabel}>Tempat Lahir</label>
                <input
                  type="text"
                  placeholder="Tempat lahir..."
                  className={styles.inputField}
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className={styles.formLabel}>Tanggal Lahir</label>
                <input
                  type="text"
                  placeholder="Misal: 12 April 1968..."
                  className={styles.inputField}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              {/* Pekerjaan */}
              <div>
                <label className={styles.formLabel}>Pekerjaan</label>
                <input
                  type="text"
                  placeholder="Pekerjaan..."
                  className={styles.inputField}
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                />
              </div>

              {/* Alamat Terakhir */}
              <div>
                <label className={styles.formLabel}>Alamat Terakhir</label>
                <input
                  type="text"
                  placeholder="Alamat terakhir..."
                  className={styles.inputField}
                  value={lastAddress}
                  onChange={(e) => setLastAddress(e.target.value)}
                  disabled={selectedClient !== null}
                />
              </div>

              {/* No. Akta */}
              <div>
                <label className={styles.formLabel}>Nomor Akta Wasiat</label>
                <input
                  type="text"
                  placeholder="Misal: 12"
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
                  style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                />
              </div>

              {/* No. Rep */}
              <div>
                <label className={styles.formLabel}>Nomor REP</label>
                <input
                  type="text"
                  placeholder="Misal: REP-2025-045"
                  className={styles.inputField}
                  value={repNumber}
                  onChange={(e) => setRepNumber(e.target.value)}
                />
              </div>

              {/* Jenis Akta Wasiat */}
              <div>
                <label className={styles.formLabel}>Jenis Akta Wasiat</label>
                <select
                  className={styles.inputField}
                  value={deedType}
                  onChange={(e) => setDeedType(e.target.value)}
                  style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                >
                  <option value="Wasiat Umum (Terbuka)">Wasiat Umum (Terbuka)</option>
                  <option value="Wasiat Olografis">Wasiat Olografis</option>
                  <option value="Wasiat Rahasia / Tertutup">Wasiat Rahasia / Tertutup</option>
                  <option value="Lainnya">Lainnya (Ketik Manual)</option>
                </select>
              </div>

              {/* Jenis Akta Lainnya */}
              {deedType === "Lainnya" && (
                <div>
                  <label className={styles.formLabel}>Jenis Akta Wasiat Lainnya</label>
                  <input
                    type="text"
                    placeholder="Jenis kustom..."
                    className={styles.inputField}
                    value={customDeedType}
                    onChange={(e) => setCustomDeedType(e.target.value)}
                  />
                </div>
              )}

              {/* Notaris */}
              <div>
                <label className={styles.formLabel}>Notaris yang Membuat</label>
                <input
                  type="text"
                  placeholder="Nama & kedudukan Notaris..."
                  className={styles.inputField}
                  value={notaryName}
                  onChange={(e) => setNotaryName(e.target.value)}
                />
              </div>

              {/* Form Actions */}
              <div style={{ display: "flex", gap: "0.5rem", width: "100%", gridColumn: "1 / -1", marginTop: "1rem" }}>
                <button
                  type="submit"
                  className={styles.quickActionBtn}
                  style={{ justifyContent: "center", padding: "0.75rem 1rem", fontSize: "0.95rem" }}
                >
                  Simpan Wasiat
                </button>
                <button
                  type="button"
                  className={styles.quickActionBtn}
                  onClick={() => {
                    setShowWillForm(false);
                    setTestatorName("");
                    setSelectedClient(null);
                    setFormerName("");
                    setBirthPlace("");
                    setBirthDate("");
                    setOccupation("");
                    setLastAddress("");
                    setDeedNumber("");
                    setDeedDate("");
                    setRepNumber("");
                    setDeedType("Wasiat Umum (Terbuka)");
                    setCustomDeedType("");
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
            <h2 className={styles.cardTitle}>Daftar Wasiat Terdaftar</h2>
            <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginTop: "0.25rem" }}>
              Menampilkan {willsRows.filter(r => !r.isNihil).length} catatan wasiat yang terdaftar.
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Cari nama/alamat/akta..."
              className={styles.inputField}
              style={{ padding: "0.375rem 0.75rem", fontSize: "0.85rem", width: "200px" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ 
                padding: "0.375rem 0.75rem", 
                borderRadius: "0.375rem", 
                border: "1px solid #cbd5e1", 
                outline: "none", 
                fontSize: "0.85rem", 
                backgroundColor: "#ffffff", 
                color: "#0f172a" 
              }}
            >
              <option value="">Semua Jenis Wasiat</option>
              <option value="Wasiat Umum (Terbuka)">Wasiat Terbuka</option>
              <option value="Wasiat Olografis">Wasiat Olografis</option>
              <option value="Wasiat Rahasia / Tertutup">Wasiat Rahasia</option>
            </select>

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
              title="Unduh Daftar Wasiat format PDF"
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
              title="Unduh Daftar Wasiat format Excel"
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

        {/* Multi-Level Header Table */}
        <div className={styles.tableContainer} style={{ marginTop: "1rem" }}>
          <table className={styles.projectTable} style={{ borderCollapse: "collapse", minWidth: "1750px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th rowSpan={2} style={{ textAlign: "center", border: "1px solid #cbd5e1", verticalAlign: "middle", padding: "12px 10px", fontSize: "0.8rem", width: "60px" }}>
                  NO
                </th>
                <th colSpan={6} style={{ textAlign: "center", border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", fontWeight: "700" }}>
                  YANG MEMBUAT SURAT WASIAT / YANG MEWARISKAN
                </th>
                <th colSpan={4} style={{ textAlign: "center", border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", fontWeight: "700" }}>
                  AKTA WASIAT
                </th>
                <th rowSpan={2} style={{ textAlign: "center", border: "1px solid #cbd5e1", verticalAlign: "middle", padding: "12px 10px", fontSize: "0.8rem", minWidth: "260px" }}>
                  NAMA & KEDUDUKAN NOTARIS YANG MEMBUAT AKTA WASIAT
                </th>
                <th rowSpan={2} style={{ textAlign: "center", border: "1px solid #cbd5e1", verticalAlign: "middle", padding: "12px 10px", fontSize: "0.8rem", width: "110px" }}>
                  AKSI
                </th>
              </tr>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {/* Sub-headers for Testator */}
                <th style={{ border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "0.78rem", fontWeight: "600", minWidth: "200px" }}>Nama Lengkap</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "0.78rem", fontWeight: "600", minWidth: "150px" }}>Dahulu Bernama</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "0.78rem", fontWeight: "600", minWidth: "130px" }}>Tempat Lahir</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "0.78rem", fontWeight: "600", minWidth: "140px" }}>Tanggal Lahir</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "0.78rem", fontWeight: "600", minWidth: "150px" }}>Pekerjaan</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "0.78rem", fontWeight: "600", minWidth: "300px" }}>Alamat Terakhir</th>
                
                {/* Sub-headers for Will Deed */}
                <th style={{ border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "0.78rem", fontWeight: "600", minWidth: "120px" }}>No. Akta</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "0.78rem", fontWeight: "600", minWidth: "130px" }}>Tanggal Akta</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "0.78rem", fontWeight: "600", minWidth: "130px" }}>No. Rep</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "0.78rem", fontWeight: "600", minWidth: "180px" }}>Jenis Akta</th>
              </tr>
            </thead>
            <tbody>
              {willsRows.map((row, index) => {
                if (row.isNihil) {
                  return (
                    <tr key={`nihil-${index}`} className={styles.guestRow} style={{ backgroundColor: "#fcfcfc" }}>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: "12px 10px", color: "#ef4444", fontWeight: "700", letterSpacing: "2px" }}>N I H I L</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>------------------------------------------------------</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#000000", padding: "12px 10px", fontWeight: "700", whiteSpace: "nowrap" }}>{row.dateLabel}</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>-------------------------</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", padding: "12px 10px", whiteSpace: "nowrap" }}>
                        <button 
                          className={styles.editBtn}
                          onClick={() => {
                            setEditingNihilId(row.will!.id);
                            const dateStr = row.will!.willDeed.deedDate;
                            if (dateStr && dateStr.includes("-")) {
                              const parts = dateStr.split("-");
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
                          onClick={() => {
                            if (confirm(`Hapus data NIHIL untuk ${row.dateLabel}?`)) {
                              setWills(wills.filter(w => w.id !== row.will!.id));
                            }
                          }}
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

                const w = row.will!;
                return (
                  <tr key={w.id} className={styles.guestRow}>
                    {/* Serial Number */}
                    <td style={{ textAlign: "center", border: "1px solid #e2e8f0", fontWeight: "700", color: "#0f172a", padding: "12px 10px" }}>
                      {index + 1}
                    </td>
                    
                    {/* Testator Details */}
                    <td style={{ border: "1px solid #e2e8f0", fontWeight: "600", color: "#1e293b", padding: "12px 10px" }}>
                      {w.testator.fullName}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px" }}>
                      {w.testator.formerName}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px" }}>
                      {w.testator.birthPlace}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      {w.testator.birthDate}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px" }}>
                      {w.testator.occupation}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px" }}>
                      {w.testator.lastAddress}
                    </td>
                    
                    {/* Will Deed Details */}
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "600", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      {w.willDeed.deedNumber}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      {w.willDeed.deedDate}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      {w.willDeed.repNumber}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", padding: "12px 10px", fontSize: "0.8rem" }}>
                      <span 
                        style={{ 
                          padding: "0.25rem 0.5rem", 
                          borderRadius: "9999px", 
                          backgroundColor: w.willDeed.deedType.includes("Umum") 
                            ? "#eff6ff" 
                            : w.willDeed.deedType.includes("Olografis") 
                              ? "#fef2f2" 
                              : "#f0fdf4",
                          color: w.willDeed.deedType.includes("Umum") 
                            ? "#1e40af" 
                            : w.willDeed.deedType.includes("Olografis") 
                              ? "#991b1b" 
                              : "#166534",
                          fontWeight: "600"
                        }}
                      >
                        {w.willDeed.deedType}
                      </span>
                    </td>
                    
                    {/* Notary Info */}
                    <td style={{ border: "1px solid #e2e8f0", color: "#334155", padding: "12px 10px", fontSize: "0.8rem" }}>
                      {w.notaryName}
                    </td>
                    {/* Action Buttons */}
                    <td style={{ textAlign: "center", border: "1px solid #e2e8f0", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(w.id, w.testator.fullName)}
                        title="Hapus Wasiat"
                        aria-label="Hapus Wasiat"
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
              {willsRows.length === 0 && (
                <tr>
                  <td colSpan={13} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    Tidak ada catatan daftar wasiat yang sesuai dengan filter atau pencarian Anda.
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
              {editingNihilId ? "Ubah bulan kosong secara resmi." : "Catat bulan kosong (tidak ada klient) secara resmi untuk laporan bulanan."}
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

