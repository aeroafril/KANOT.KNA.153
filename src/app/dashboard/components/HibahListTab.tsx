"use client";

import React, { useState, useEffect } from "react";
import { GuestBookEntry } from "../page";
import { hibahService } from "@/lib/services/supabaseService";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import styles from "../dashboard.module.css";

interface HibahEntry {
  isNihil?: boolean;
  id: string;
  deedDate: string; // Tanggal Akta (YYYY-MM-DD)
  deedNumber: string; // Nomor Akta
  grantor: string; // Pemberi Hibah
  grantee: string; // Penerima Hibah
  familyRelation: string; // Hubungan Keluarga
  objectType: string; // Jenis Objek
  objectLocation: string; // Lokasi / Alamat Objek
  certificateNumber: string; // Nomor Sertifikat
  grantValue: string; // Nilai NJOP / Nilai Hibah
}

interface HibahRow {
  isNihil: boolean;
  dateLabel: string;
  hibah?: HibahEntry;
  deedNoIndex: string; // Custom sequential No. starts from 1 for actual deeds, or "-" for NIHIL
}

interface HibahListTabProps {
  guestBook: GuestBookEntry[];
}

export default function HibahListTab({ guestBook }: HibahListTabProps) {
  const [showNihilModal, setShowNihilModal] = useState(false);
  const [editingNihilId, setEditingNihilId] = useState<string | null>(null);
  const [nihilMonth, setNihilMonth] = useState("01");
  const [nihilYear, setNihilYear] = useState("2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [hibahs, setHibahs] = useState<HibahEntry[]>([]);

  // Form states for manual registration
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<GuestBookEntry | null>(null);
  const [deedNumber, setDeedNumber] = useState("");
  const [deedDate, setDeedDate] = useState("");
  const [grantor, setGrantor] = useState("");
  const [grantee, setGrantee] = useState("");
  const [familyRelation, setFamilyRelation] = useState("");
  const [objectType, setObjectType] = useState("");
  const [objectLocation, setObjectLocation] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [grantValue, setGrantValue] = useState("");

  // Restore draft form values from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("draft_hibah_form");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.showForm !== undefined) setShowForm(draft.showForm);
        if (draft.selectedClient !== undefined) setSelectedClient(draft.selectedClient);
        if (draft.deedNumber !== undefined) setDeedNumber(draft.deedNumber);
        if (draft.deedDate !== undefined) setDeedDate(draft.deedDate);
        if (draft.grantor !== undefined) setGrantor(draft.grantor);
        if (draft.grantee !== undefined) setGrantee(draft.grantee);
        if (draft.familyRelation !== undefined) setFamilyRelation(draft.familyRelation);
        if (draft.objectType !== undefined) setObjectType(draft.objectType);
        if (draft.objectLocation !== undefined) setObjectLocation(draft.objectLocation);
        if (draft.certificateNumber !== undefined) setCertificateNumber(draft.certificateNumber);
        if (draft.grantValue !== undefined) setGrantValue(draft.grantValue);
      } catch (e) {
        console.error("Gagal memuat draf pendaftaran Hibah:", e);
      }
    }
  }, []);

  // Save current form values to localStorage
  useEffect(() => {
    if (showForm) {
      const draft = {
        showForm, selectedClient, deedNumber, deedDate, grantor, grantee,
        familyRelation, objectType, objectLocation, certificateNumber, grantValue
      };
      localStorage.setItem("draft_hibah_form", JSON.stringify(draft));
    } else {
      localStorage.removeItem("draft_hibah_form");
    }
  }, [
    showForm, selectedClient, deedNumber, deedDate, grantor, grantee,
    familyRelation, objectType, objectLocation, certificateNumber, grantValue
  ]);

  const indonesianMonths = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("hibahs_data");
    let fallbackHibahs: HibahEntry[] = [];
    if (saved) {
      try { fallbackHibahs = JSON.parse(saved); } catch (e) {}
    }
    hibahService.getAll(fallbackHibahs).then((data) => {
      if (data && data.length > 0) {
        setHibahs(data);
      } else {
        setHibahs(fallbackHibahs);
      }
    });
    setIsHydrated(true);
  }, []);

  useRealtimeSync("hibah_registrations", () => {
    hibahService.getAll().then((data) => {
      if (data && data.length > 0) setHibahs(data);
    });
  });

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("hibahs_data", JSON.stringify(hibahs));
    }
  }, [hibahs, isHydrated]);

  const handleSaveNihil = (e: React.FormEvent) => {
    e.preventDefault();
    const month = nihilMonth;
    const year = nihilYear;

    if (editingNihilId) {
      const updated = hibahs.map(h => {
        if (h.id === editingNihilId) {
          return { ...h, deedDate: `${year}-${month}-01` };
        }
        return h;
      });
      setHibahs(updated);
      setShowNihilModal(false);
      setEditingNihilId(null);
      alert(`Data NIHIL berhasil diperbarui!`);
      return;
    }

    const hasExisting = hibahs.some(h => {
      if (!h.deedDate) return false;
      const [hYear, hMonth] = h.deedDate.split("-");
      return hYear === year && hMonth === month && !h.isNihil;
    });
    if (hasExisting) {
      alert(`Tidak dapat menyimpan NIHIL! Sudah ada akta Hibah terdaftar pada bulan ${month} tahun ${year}.`);
      return;
    }

    const hasAlreadyNihil = hibahs.some(h => {
      if (!h.deedDate) return false;
      const [hYear, hMonth] = h.deedDate.split("-");
      return hYear === year && hMonth === month && h.isNihil;
    });
    if (hasAlreadyNihil) {
      alert(`Data NIHIL untuk bulan ${month} tahun ${year} sudah terdaftar!`);
      return;
    }

    const newNihil: HibahEntry = {
      id: `HB-NIHIL-${Date.now()}`,
      deedDate: `${year}-${month}-01`,
      deedNumber: "---",
      grantor: "--------------------",
      grantee: "--------------------",
      familyRelation: "---",
      objectType: "---",
      objectLocation: "---",
      certificateNumber: "---",
      grantValue: "N I H I L",
      isNihil: true
    };
    hibahService.create({
      deed_number: "-",
      deed_date: `${year}-${month}-01`,
      is_nihil: true,
    });
    setHibahs([...hibahs, newNihil]);
    setShowNihilModal(false);
    alert(`Registrasi NIHIL untuk bulan ${month} tahun ${year} berhasil disimpan!`);
  };

  const handleDeleteHibah = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      hibahService.delete(id);
      setHibahs(hibahs.filter(h => h.id !== id));
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

  const handleSaveHibah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deedNumber.trim() || !deedDate.trim() || !grantor.trim() || !grantee.trim()) {
      alert("Pastikan Nomor Akta, Tanggal Akta, Pemberi dan Penerima Hibah sudah terisi!");
      return;
    }

    const newHibah: HibahEntry = {
      id: `HB-${String(hibahs.length + 1).padStart(3, "0")}`,
      deedDate,
      deedNumber: deedNumber.trim(),
      grantor: grantor.trim(),
      grantee: grantee.trim(),
      familyRelation: familyRelation.trim() || "-",
      objectType: objectType.trim() || "-",
      objectLocation: objectLocation.trim() || "-",
      certificateNumber: certificateNumber.trim() || "-",
      grantValue: grantValue.trim() || "-",
    };

    hibahService.create({
      deed_number: newHibah.deedNumber,
      deed_date: newHibah.deedDate,
      grantor: newHibah.grantor,
      grantee: newHibah.grantee,
      family_relation: newHibah.familyRelation,
      object_type: newHibah.objectType,
      object_location: newHibah.objectLocation,
      certificate_number: newHibah.certificateNumber,
      grant_value: newHibah.grantValue,
      is_nihil: false,
    });
    setHibahs([newHibah, ...hibahs]);
    alert("Data register Hibah berhasil disimpan!");

    setShowForm(false);
    setSelectedClient(null);
    setDeedNumber("");
    setDeedDate("");
    setGrantor("");
    setGrantee("");
    setFamilyRelation("");
    setObjectType("");
    setObjectLocation("");
    setCertificateNumber("");
    setGrantValue("");
  };

  const getMonthsRange = () => {
    const range: { year: number; month: number; label: string; monthStr: string }[] = [];
    const startYear = 2024;
    const startMonth = 1; 
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

  const getHibahRows = () => {
    let serialCounter = 1;
    const rows: HibahRow[] = [];
    const months = getMonthsRange().filter(m => {
      const matchesMonth = filterMonth === "" || m.monthStr === filterMonth;
      const matchesYear = filterYear === "" || String(m.year) === filterYear;
      return matchesMonth && matchesYear;
    });

    months.forEach((m) => {
      const listInMonth = hibahs.filter(h => {
        let dateYear = "";
        let dateMonthVal = -1;
        const dateStr = h.deedDate;
        if (dateStr.includes("-")) {
          const parts = dateStr.split("-");
          if (parts.length === 3) {
            dateYear = parts[0];
            dateMonthVal = parseInt(parts[1], 10);
          }
        }
        return String(m.year) === dateYear && dateMonthVal === m.month;
      });

      const filteredListInMonth = listInMonth.filter(h => {
        const query = searchQuery.toLowerCase();
        return !searchQuery.trim() ||
          h.grantor.toLowerCase().includes(query) ||
          h.grantee.toLowerCase().includes(query) ||
          h.deedNumber.toLowerCase().includes(query) ||
          h.objectLocation.toLowerCase().includes(query);
      });

      const sorted = [...filteredListInMonth].sort((a, b) => a.id.localeCompare(b.id));
      sorted.forEach((hibah) => {
        rows.push({
          isNihil: hibah.isNihil || false,
          dateLabel: m.label,
          hibah,
          deedNoIndex: hibah.isNihil ? "-" : String(serialCounter++)
        });
      });
    });

    return rows;
  };

  const hibahRows = getHibahRows();

  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const title = `Buku Daftar Hibah - ${filterMonth ? indonesianMonths[parseInt(filterMonth) - 1] : "Semua Bulan"} ${filterYear || "Semua Tahun"}`;
    
    let rowsHtml = "";
    hibahRows.forEach((row, index) => {
      if (row.isNihil) {
        rowsHtml += `
          <tr style="background-color: #fafafa; text-align: center;">
            <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #ef4444; font-weight: bold; text-align: left; white-space: nowrap;">${row.dateLabel}</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">--------------------</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">--------------------</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #ef4444; font-weight: bold; letter-spacing: 2px;">N I H I L</td>
          </tr>
        `;
      } else {
        const h = row.hibah!;
        rowsHtml += `
          <tr>
            <td style="text-align: center; font-weight: bold; border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${h.deedNumber}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${formatIndonesianDate(h.deedDate)}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${h.grantor}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${h.grantee}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${h.familyRelation}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${h.objectType}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${h.objectLocation}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${h.certificateNumber}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${h.grantValue}</td>
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
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1 style="text-align: center;">KANTOR NOTARIS & PPAT</h1>
          <h2 style="text-align: center; font-weight: bold;">KHAIRUN NISA, S.H., M.Kn.</h2>
          <h3 style="text-align: center; font-size: 14px; margin-top: 20px; margin-bottom: 15px;">${title}</h3>
          <table>
            <thead>
              <tr>
                ${["No","No. Akta","Tanggal Akta","Pemberi Hibah","Penerima Hibah","Hubungan Keluarga","Jenis Objek","Lokasi / Alamat","No. Sertifikat","Nilai NJOP / Hibah"].map(h => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-weight: bold;">${h}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="10" style="text-align: center; padding: 8px; font-style: italic; color: #94a3b8;">belum ada data</td></tr>`}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };
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
          ${["No. Akta","Tanggal Akta","Pemberi Hibah","Penerima Hibah","Hubungan Keluarga","Jenis Objek","Lokasi / Alamat","No. Sertifikat","Nilai NJOP / Hibah"].map(h => `<th style="background-color: #f2f2f2; font-weight: bold; border: 0.5pt solid #000000;">${h}</th>`).join("")}
        </tr>
      </thead>
      <tbody>`;

    hibahRows.forEach((row) => {
      if (row.isNihil) {
        tableHtml += `
          <tr style="background-color: #fafafa; text-align: center;">
            <td style="color: #94a3b8;">---</td>
            <td style="color: #ef4444; font-weight: bold; text-align: left; white-space: nowrap;">${row.dateLabel}</td>
            <td style="color: #94a3b8;">--------------------</td>
            <td style="color: #94a3b8;">--------------------</td>
            <td style="color: #94a3b8;">---</td>
            <td style="color: #94a3b8;">---</td>
            <td style="color: #94a3b8;">---</td>
            <td style="color: #94a3b8;">---</td>
            <td style="color: #ef4444; font-weight: bold; letter-spacing: 2px;">N I H I L</td>
          </tr>
        `;
      } else {
        const h = row.hibah!;
        tableHtml += `
          <tr>
            <td>${h.deedNumber}</td>
            <td>${formatIndonesianDate(h.deedDate)}</td>
            <td>${h.grantor}</td>
            <td>${h.grantee}</td>
            <td>${h.familyRelation}</td>
            <td>${h.objectType}</td>
            <td>${h.objectLocation}</td>
            <td>${h.certificateNumber}</td>
            <td>${h.grantValue}</td>
          </tr>
        `;
      }
    });

    if (!hibahRows.length) {
      tableHtml += `<tr><td colspan="9" style="text-align: center; font-style: italic; color: #94a3b8;">belum ada data</td></tr>`;
    }
    tableHtml += `</tbody></table>`;

    const dataType = "application/vnd.ms-excel";
    const excelFile = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <style> table { border-collapse: collapse; } th, td { border: 0.5pt solid #000000; padding: 5px; } </style>
      </head>
      <body>${tableHtml}</body>
      </html>
    `;

    const blob = new Blob([excelFile], { type: dataType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Daftar_Hibah.xls";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Buku Daftar Hibah</h1>
        <p className={styles.welcomeSubtitle}>
          Daftar registrasi pembuatan akta Hibah.
        </p>
      </div>

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
            + Input Data Hibah
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

      {showForm && (
        <div className={styles.cardSection} style={{ marginBottom: "1.5rem" }}>
          <h2 className={styles.cardTitle} style={{ marginBottom: "1.25rem" }}>Input Data Hibah</h2>
          
          <form onSubmit={handleSaveHibah}>
            <div className={styles.guestbookFormHorizontal} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
              
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

              <div>
                <label className={styles.formLabel}>Tanggal Akta</label>
                <input
                  type="date"
                  className={styles.inputField}
                  value={deedDate}
                  onChange={(e) => setDeedDate(e.target.value)}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Pemberi Hibah</label>
                <input
                  type="text"
                  placeholder="Nama pemberi..."
                  className={styles.inputField}
                  value={grantor}
                  onChange={(e) => setGrantor(e.target.value)}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Penerima Hibah</label>
                <input
                  type="text"
                  placeholder="Nama penerima..."
                  className={styles.inputField}
                  value={grantee}
                  onChange={(e) => setGrantee(e.target.value)}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Hubungan Keluarga</label>
                <input
                  type="text"
                  placeholder="Cth: Anak Kandung"
                  className={styles.inputField}
                  value={familyRelation}
                  onChange={(e) => setFamilyRelation(e.target.value)}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Jenis Objek</label>
                <input
                  type="text"
                  placeholder="Cth: Tanah / Rumah"
                  className={styles.inputField}
                  value={objectType}
                  onChange={(e) => setObjectType(e.target.value)}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Lokasi / Alamat Objek</label>
                <input
                  type="text"
                  placeholder="Alamat objek..."
                  className={styles.inputField}
                  value={objectLocation}
                  onChange={(e) => setObjectLocation(e.target.value)}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Nomor Sertifikat</label>
                <input
                  type="text"
                  placeholder="Nomor Sertifikat..."
                  className={styles.inputField}
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Nilai NJOP / Nilai Hibah</label>
                <input
                  type="text"
                  placeholder="Rp..."
                  className={styles.inputField}
                  value={grantValue}
                  onChange={(e) => setGrantValue(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", width: "100%", gridColumn: "1 / -1", marginTop: "1rem" }}>
                <button
                  type="submit"
                  className={styles.quickActionBtn}
                  style={{ justifyContent: "center", padding: "0.75rem 1rem", fontSize: "0.95rem" }}
                >
                  Simpan Data
                </button>
                <button
                  type="button"
                  className={styles.quickActionBtn}
                  onClick={() => {
                    setShowForm(false);
                    setSelectedClient(null);
                    setDeedNumber("");
                    setDeedDate("");
                    setGrantor("");
                    setGrantee("");
                    setFamilyRelation("");
                    setObjectType("");
                    setObjectLocation("");
                    setCertificateNumber("");
                    setGrantValue("");
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

      <div className={styles.cardSection}>
        <div className={styles.cardHeader} style={{ flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className={styles.cardTitle}>Daftar Hibah Terdaftar</h2>
            <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginTop: "0.25rem" }}>
              Total baris terdaftar: {hibahRows.length} baris.
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Cari data..."
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
              style={{ backgroundColor: "#ef4444", display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 0.85rem", fontSize: "0.85rem" }}
              title="Unduh PDF"
            >
              PDF
            </button>

            <button 
              onClick={handleDownloadExcel}
              className={styles.quickActionBtn}
              style={{ backgroundColor: "#16a34a", display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 0.85rem", fontSize: "0.85rem" }}
              title="Unduh Excel"
            >
              Excel
            </button>
          </div>
        </div>

        <div className={styles.tableContainer} style={{ marginTop: "1rem" }}>
          <table className={styles.projectTable} style={{ borderCollapse: "collapse", minWidth: "1600px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", width: "70px", textAlign: "center" }}>NO. URUT</th>
                <th colSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", textAlign: "center" }}>AKTA</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "180px", textAlign: "left" }}>PEMBERI HIBAH</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "180px", textAlign: "left" }}>PENERIMA HIBAH</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "140px", textAlign: "left" }}>HUBUNGAN KELUARGA</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "120px", textAlign: "left" }}>JENIS OBJEK</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "200px", textAlign: "left" }}>LOKASI / ALAMAT OBJEK</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "140px", textAlign: "left" }}>NO. SERTIFIKAT</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "140px", textAlign: "left" }}>NILAI NJOP / HIBAH</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", width: "120px", textAlign: "center" }}>AKSI</th>
              </tr>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th style={{ border: "1px solid #cbd5e1", padding: "8px 10px", fontSize: "0.75rem", minWidth: "120px", textAlign: "left" }}>Tanggal</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "8px 10px", fontSize: "0.75rem", minWidth: "100px", textAlign: "left" }}>Nomor</th>
              </tr>
            </thead>
            <tbody>
              {hibahs.length === 0 ? (
                  <tr className={styles.guestRow}>
                    <td colSpan={11} style={{ textAlign: "center", color: "#64748b", padding: "2rem", fontWeight: "600" }}>
                      belum ada data
                    </td>
                  </tr>
                ) : hibahRows.map((row, index) => {
                if (row.isNihil) {
                  return (
                    <tr key={`nihil-${index}`} className={styles.guestRow} style={{ backgroundColor: "#fcfcfc" }}>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#ef4444", padding: "12px 10px", fontWeight: "700", whiteSpace: "nowrap" }}>{row.dateLabel}</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>--------------------</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>--------------------</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#ef4444", padding: "12px 10px", fontWeight: "700", letterSpacing: "2px" }}>N I H I L</td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", padding: "12px 10px", whiteSpace: "nowrap" }}>
                        <button 
                          className={styles.editBtn}
                          onClick={() => {
                            const h = row.hibah!;
                            setEditingNihilId(h.id);
                            if (h.deedDate) {
                              const parts = h.deedDate.split("-");
                              if (parts.length === 3) {
                                setNihilYear(parts[0]);
                                setNihilMonth(parts[1]);
                              }
                            }
                            setShowNihilModal(true);
                          }}
                          style={{ marginRight: "0.25rem" }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteHibah(row.hibah!.id)}
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

                const h = row.hibah!;
                return (
                  <tr key={h.id} className={styles.guestRow}>
                    <td style={{ textAlign: "center", border: "1px solid #e2e8f0", fontWeight: "700", color: "#0f172a", padding: "12px 10px" }}>
                      {index + 1}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      {formatIndonesianDate(h.deedDate)}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "600", padding: "12px 10px" }}>
                      {h.deedNumber}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "700", padding: "12px 10px" }}>
                      {h.grantor}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "700", padding: "12px 10px" }}>
                      {h.grantee}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px" }}>
                      {h.familyRelation}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px" }}>
                      {h.objectType}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px" }}>
                      {h.objectLocation}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px" }}>
                      {h.certificateNumber}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px" }}>
                      {h.grantValue}
                    </td>
                    <td style={{ textAlign: "center", border: "1px solid #e2e8f0", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteHibah(h.id)}
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
              {hibahRows.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ border: "1px solid #e2e8f0", textAlign: "center", padding: "3rem", color: "#ef4444", fontStyle: "italic", fontWeight: "700", fontSize: "1.15rem" }}>
                    NIHIL
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    
      {showNihilModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "0.75rem", padding: "1.5rem", width: "100%", maxWidth: "400px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem 0" }}>
              {editingNihilId ? "Edit Registrasi NIHIL" : "Registrasi NIHIL Bulanan"}
            </h3>
            <form onSubmit={handleSaveNihil}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155" }}>Pilih Bulan</label>
                  <select value={nihilMonth} onChange={(e) => setNihilMonth(e.target.value)} style={{ padding: "0.625rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", width: "100%" }}>
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
                  <select value={nihilYear} onChange={(e) => setNihilYear(e.target.value)} style={{ padding: "0.625rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", width: "100%" }}>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button type="button" onClick={() => { setShowNihilModal(false); setEditingNihilId(null); }} style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", backgroundColor: "#ffffff", color: "#64748b", cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", border: "none", borderRadius: "0.375rem", backgroundColor: "#eab308", color: "#ffffff", fontWeight: "600", cursor: "pointer" }}>{editingNihilId ? "Simpan Perubahan" : "Simpan NIHIL"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
