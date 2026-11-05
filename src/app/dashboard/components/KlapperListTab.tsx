"use client";

import React, { useState, useEffect } from "react";
import { GuestBookEntry } from "../page";
import { klapperService } from "@/lib/services/supabaseService";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import styles from "../dashboard.module.css";

interface KlapperEntry {
  id: string;
  appearerName: string; // Nama penghadap / yang diwakili
  deedNature: string; // Sifat akta
  deedDate: string; // Tanggal akta
  deedNumber: string; // No. akta
  repertoriumNumber: string; // Nomor pada repertorium
}

interface KlapperListTabProps {
  guestBook: GuestBookEntry[];
}

export default function KlapperListTab({ guestBook }: KlapperListTabProps) {
  const [showNihilModal, setShowNihilModal] = useState(false);
  const [nihilMonth, setNihilMonth] = useState("01");
  const [nihilYear, setNihilYear] = useState("2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("Semua");

  // Mock Database representing Klapper entries

  const [klappers, setKlappers] = useState<KlapperEntry[]>([]);

  // Form states for manual Klapper input
  const [showForm, setShowForm] = useState(false);
  const [appearerName, setAppearerName] = useState("");
  const [selectedClient, setSelectedClient] = useState<GuestBookEntry | null>(null);
  const [deedNature, setDeedNature] = useState("PT");
  const [customNature, setCustomNature] = useState("");
  const [deedDate, setDeedDate] = useState("");
  const [deedNumber, setDeedNumber] = useState("");
  const [repertoriumNumber, setRepertoriumNumber] = useState("");

  // Restore draft form values from localStorage on mount (hydration-safe)
  useEffect(() => {
    const savedDraft = localStorage.getItem("draft_klapper_form");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.showForm !== undefined) setShowForm(draft.showForm);
        if (draft.appearerName !== undefined) setAppearerName(draft.appearerName);
        if (draft.selectedClient !== undefined) setSelectedClient(draft.selectedClient);
        if (draft.deedNature !== undefined) setDeedNature(draft.deedNature);
        if (draft.customNature !== undefined) setCustomNature(draft.customNature);
        if (draft.deedDate !== undefined) setDeedDate(draft.deedDate);
        if (draft.deedNumber !== undefined) setDeedNumber(draft.deedNumber);
        if (draft.repertoriumNumber !== undefined) setRepertoriumNumber(draft.repertoriumNumber);
      } catch (e) {
        console.error("Gagal memuat draf pendaftaran Klapper:", e);
      }
    }
  }, []);

  // Save current form values to localStorage whenever they change
  useEffect(() => {
    if (showForm) {
      const draft = {
        showForm,
        appearerName,
        selectedClient,
        deedNature,
        customNature,
        deedDate,
        deedNumber,
        repertoriumNumber
      };
      localStorage.setItem("draft_klapper_form", JSON.stringify(draft));
    } else {
      localStorage.removeItem("draft_klapper_form");
    }
  }, [
    showForm, appearerName, selectedClient, deedNature, customNature, deedDate, deedNumber, repertoriumNumber
  ]);

  const indonesianMonths = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const alphabets = ["Semua", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

  // Helpers for formatting date string to human read
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("klappers_data");
    let fallbackData: KlapperEntry[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          fallbackData = parsed;
        }
      } catch (e) { }
    }
    klapperService.getAll(fallbackData).then((data) => {
      setKlappers(data);
    });
    setIsHydrated(true);
  }, []);

  useRealtimeSync("klappers", () => {
    klapperService.getAll([]).then((data) => {
      setKlappers(data);
    });
  });

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("klappers_data", JSON.stringify(klappers));
    }
  }, [klappers, isHydrated]);

  const handleSaveNihil = async (e: React.FormEvent) => {
    e.preventDefault();
    const month = nihilMonth;
    const year = nihilYear;
    const newNihil = {
      appearerName: "N I H I L",
      deedNature: "---",
      deedDate: `${year}-${month}-01`,
      deedNumber: "---",
      repertoriumNumber: "---"
    };
    
    const success = await klapperService.create(newNihil);
    if (success) {
      setKlappers([...klappers, { id: `KL-NIHIL-${Date.now()}`, ...newNihil }]);
      setShowNihilModal(false);
      alert(`Registrasi NIHIL untuk bulan ${month} tahun ${year} berhasil disimpan!`);
    } else {
      alert("Gagal menyimpan data NIHIL ke server.");
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
  const handleSaveKlapper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appearerName.trim()) {
      alert("Nama penghadap/yang diwakili wajib diisi!");
      return;
    }
    if (!deedNumber.trim()) {
      alert("Nomor akta wajib diisi!");
      return;
    }
    if (!repertoriumNumber.trim()) {
      alert("Nomor repertorium wajib diisi!");
      return;
    }

    const finalNature = deedNature === "Lainnya" ? (customNature.trim() || "Akta Lainnya") : deedNature;
    const finalDeedDate = formatIndonesianDate(deedDate || new Date().toISOString().split("T")[0]);

    const newKlapper = {
      appearerName: appearerName,
      deedNature: finalNature,
      deedDate: finalDeedDate,
      deedNumber: deedNumber.startsWith("Akta No.") ? deedNumber : `Akta No. ${deedNumber}`,
      repertoriumNumber: repertoriumNumber,
    };

    const success = await klapperService.create(newKlapper);
    if (success) {
      setKlappers([{ id: `KL-${String(klappers.length + 1).padStart(3, "0")}`, ...newKlapper }, ...klappers]);
      alert("Data klapper baru berhasil disimpan!");
    } else {
      alert("Gagal menyimpan data klapper ke server.");
      return;
    }

    // Reset States
    setShowForm(false);
    setAppearerName("");
    setSelectedClient(null);
    setDeedNature("PT");
    setCustomNature("");
    setDeedDate("");
    setDeedNumber("");
    setRepertoriumNumber("");
  };

  // Filtered Klapper Rows
  const getKlapperRows = () => {
    if (!Array.isArray(klappers)) return [];
    return klappers.filter(k => {
      if (!k) return false;
      const appName = k.appearerName || "";
      const nature = k.deedNature || "";
      const deedNo = k.deedNumber || "";
      const repNo = k.repertoriumNumber || "";
      const dateStr = k.deedDate || "";

      // 1. Search Query
      const matchesSearch = !searchQuery.trim() ||
        appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nature.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deedNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repNo.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Month Filter
      let dateMonthIdx = -1;
      if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts.length === 3) {
          dateMonthIdx = parseInt(parts[1], 10) - 1;
        }
      } else if (dateStr.trim() !== "") {
        const parts = dateStr.split(" ");
        if (parts.length === 3) {
          const monthName = parts[1];
          dateMonthIdx = indonesianMonths.findIndex(month => month.toLowerCase() === monthName.toLowerCase());
        }
      }
      const monthStr = dateMonthIdx >= 0 ? String(dateMonthIdx + 1).padStart(2, "0") : "";
      const matchesMonth = filterMonth === "" || monthStr === filterMonth;

      // 3. Year Filter
      let dateYear = "";
      if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts.length === 3) {
          dateYear = parts[0];
        }
      } else if (dateStr.trim() !== "") {
        const parts = dateStr.split(" ");
        if (parts.length === 3) {
          dateYear = parts[2];
        }
      }
      const matchesYear = filterYear === "" || dateYear === filterYear;

      // 4. Alphabet Filter
      const firstChar = appName.trim().charAt(0).toUpperCase();
      const matchesAlphabet = selectedLetter === "Semua" || firstChar === selectedLetter;

      return matchesSearch && matchesMonth && matchesYear && matchesAlphabet;
    }).sort((a, b) => (a.appearerName || "").localeCompare(b.appearerName || ""));
  };

  const klapperRows = getKlapperRows();

  // PDF Export
  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const title = `Klapper Buku Daftar Akta (Abjad: ${selectedLetter}) - ${filterMonth ? indonesianMonths[parseInt(filterMonth) - 1] : "Semua Bulan"} ${filterYear || "Semua Tahun"}`;

    let rowsHtml = "";
    if (klapperRows.length === 0) {
      rowsHtml = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 25px; font-style: italic; color: #64748b; border: 1px solid #ddd;">belum ada data</td>
        </tr>
      `;
    } else {
      klapperRows.forEach((k, index) => {
        rowsHtml += `
          <tr>
            <td style="text-align: center; font-weight: bold; border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>${k.appearerName}</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${k.deedNature}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${k.deedDate}</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: 600;">${k.deedNumber}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${k.repertoriumNumber}</td>
          </tr>
        `;
      });
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 16px; text-align: center; margin-bottom: 5px; }
            h2 { font-size: 11px; text-align: center; font-weight: normal; margin-top: 0; margin-bottom: 20px; color: #555; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th { background-color: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; text-align: left; }
            td { border: 1px solid #cbd5e1; padding: 8px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center;">KANTOR NOTARIS & PPAT</h1>
          <h2 style="text-align: center;">${title.toUpperCase()}</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 8%;">NO.</th>
                <th style="width: 25%;">NAMA PENGHADAP / YANG DIWAKILI</th>
                <th style="width: 17%;">SIFAT AKTA</th>
                <th style="width: 17%;">TANGGAL AKTA</th>
                <th style="width: 18%;">NO. AKTA</th>
                <th style="width: 15%;">NO. REPERTORIUM</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
      printWindow.document.close();
    };

    // Excel Export
    const handleDownloadExcel = () => {
      const title = `Klapper Buku Daftar Akta (Abjad ${selectedLetter}) ${filterMonth ? indonesianMonths[parseInt(filterMonth) - 1] : ""} ${filterYear}`;
      let tableHtml = `
      <table border="1">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th>NO.</th>
            <th>NAMA PENGHADAP / YANG DIWAKILI</th>
            <th>SIFAT AKTA</th>
            <th>TANGGAL AKTA</th>
            <th>NO. AKTA</th>
            <th>NOMOR PADA REPERTORIUM</th>
          </tr>
        </thead>
        <tbody>
    `;

      if (klapperRows.length === 0) {
        tableHtml += `
        <tr>
          <td colspan="6" style="text-align: center; font-style: italic; color: #64748b;">belum ada data</td>
        </tr>
      `;
      } else {
        klapperRows.forEach((k, index) => {
          tableHtml += `
          <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>${k.appearerName}</td>
            <td>${k.deedNature}</td>
            <td>${k.deedDate}</td>
            <td>${k.deedNumber}</td>
            <td>${k.repertoriumNumber}</td>
          </tr>
        `;
        });

        tableHtml += `</tbody></table>`;
      }

      const dataType = "application/vnd.ms-excel";
        const excelFile = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <style>
          table { border-collapse: collapse; }
          th { font-weight: bold; background-color: #f2f2f2; text-align: center; }
          td { text-align: left; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        ${tableHtml}
      </body>
      </html>
    `;

        const blob = new Blob([excelFile], { type: dataType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `klapper_buku_daftar_akta_${selectedLetter}_${filterMonth || "semua"}_${filterYear || "semua"}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      return (
        <>
          {/* Header section */}
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>Klapper Buku Daftar Akta</h1>
            <p className={styles.welcomeSubtitle}>
              Pencatatan indeks Klapper sesuai abjad nama penghadap. Setiap abjad memiliki penomoran urutnya masing-masing.
            </p>
          </div>

          {/* Button to toggle add new klapper form */}
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
                + Input Klapper Baru
              </button>
            </div>
          )}

          {/* Manual Registration Form */}
          {showForm && (
            <div className={styles.cardSection} style={{ marginBottom: "1.5rem" }}>
              <h2 className={styles.cardTitle} style={{ marginBottom: "1.25rem" }}>Input Klapper Baru</h2>

              <form onSubmit={handleSaveKlapper}>
                {selectedClient && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.75rem 1rem", borderRadius: "0.5rem", marginBottom: "1.25rem" }}>
                    <span style={{ fontSize: "0.85rem", color: "#166534", fontWeight: "600" }}>
                      ✓ Klien Terdaftar Terpilih: <strong>{selectedClient.name}</strong> (Data otomatis terisi)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClient(null);
                        setAppearerName("");
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

                  {/* Cari Nama Penghadap / Yang Diwakili */}
                  <div>
                    <label className={styles.formLabel}>Nama Penghadap / Yang Diwakili</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        placeholder="Nama penghadap..."
                        className={styles.inputField}
                        value={appearerName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAppearerName(val);
                          if (selectedClient && val !== selectedClient.name) {
                            setSelectedClient(null);
                          }
                        }}
                      />

                      {appearerName && !selectedClient && (
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
                          {uniquePastClients.filter(c => c.name.toLowerCase().includes(appearerName.toLowerCase())).length > 0 ? (
                            uniquePastClients
                              .filter(c => c.name.toLowerCase().includes(appearerName.toLowerCase()))
                              .map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedClient(c);
                                    setAppearerName(c.name);
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

                  {/* Sifat Akta */}
                  <div>
                    <label className={styles.formLabel}>Sifat Akta</label>
                    <select
                      className={styles.inputField}
                      value={deedNature}
                      onChange={(e) => setDeedNature(e.target.value)}
                      style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                    >
                      <option value="PT">PT</option>
                      <option value="Yayasan">Yayasan</option>
                      <option value="CV">CV</option>
                      <option value="Lainnya">Lainnya (Ketik Manual)</option>
                    </select>
                  </div>

                  {/* Sifat Akta Lainnya */}
                  {deedNature === "Lainnya" && (
                    <div>
                      <label className={styles.formLabel}>Sifat Akta Lainnya</label>
                      <input
                        type="text"
                        placeholder="Sifat akta kustom..."
                        className={styles.inputField}
                        value={customNature}
                        onChange={(e) => setCustomNature(e.target.value)}
                      />
                    </div>
                  )}

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

                  {/* No. Akta */}
                  <div>
                    <label className={styles.formLabel}>Nomor Akta</label>
                    <input
                      type="text"
                      placeholder="Misal: 12"
                      className={styles.inputField}
                      value={deedNumber}
                      onChange={(e) => setDeedNumber(e.target.value)}
                    />
                  </div>

                  {/* Nomor pada Repertorium */}
                  <div>
                    <label className={styles.formLabel}>Nomor pada Repertorium</label>
                    <input
                      type="text"
                      placeholder="Misal: 145"
                      className={styles.inputField}
                      value={repertoriumNumber}
                      onChange={(e) => setRepertoriumNumber(e.target.value)}
                    />
                  </div>

                  {/* Form Actions */}
                  <div style={{ display: "flex", gap: "0.5rem", width: "100%", gridColumn: "1 / -1", marginTop: "1rem" }}>
                    <button
                      type="submit"
                      className={styles.quickActionBtn}
                      style={{ justifyContent: "center", padding: "0.75rem 1rem", fontSize: "0.95rem" }}
                    >
                      Simpan Klapper
                    </button>
                    <button
                      type="button"
                      className={styles.quickActionBtn}
                      onClick={() => {
                        setShowForm(false);
                        setAppearerName("");
                        setSelectedClient(null);
                        setDeedNature("PT");
                        setCustomNature("");
                        setDeedDate("");
                        setDeedNumber("");
                        setRepertoriumNumber("");
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

          {/* Alphabet Index Buttons Panel */}
          <div className={styles.cardSection} style={{ marginBottom: "1.5rem", padding: "1.25rem" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: "700", color: "#475569", marginBottom: "0.75rem" }}>
              PILIH INDEKS HURUF AWAL (KLAPPER):
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {alphabets.map((letChar) => {
                const isActive = selectedLetter === letChar;
                return (
                  <button
                    key={letChar}
                    onClick={() => setSelectedLetter(letChar)}
                    style={{
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      border: isActive ? "1px solid #1e3a8a" : "1px solid #cbd5e1",
                      backgroundColor: isActive ? "#1e3a8a" : "#ffffff",
                      color: isActive ? "#ffffff" : "#475569",
                      transition: "all 0.15s ease",
                      minWidth: "36px",
                      textAlign: "center"
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "#f1f5f9";
                        e.currentTarget.style.color = "#0f172a";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "#ffffff";
                        e.currentTarget.style.color = "#475569";
                      }
                    }}
                  >
                    {letChar}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Table Card */}
          <div className={styles.cardSection}>
            <div className={styles.cardHeader} style={{ flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 className={styles.cardTitle}>
                  Daftar Klapper {selectedLetter !== "Semua" ? `- Abjad ${selectedLetter}` : ""}
                </h2>
                <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginTop: "0.25rem" }}>
                  Menampilkan {klapperRows.length} catatan klapper terdaftar.
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Cari indeks..."
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
                  title="Unduh Klapper format PDF"
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
                  title="Unduh Klapper format Excel"
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

            {/* Klapper Register Table */}
            <div className={styles.tableContainer} style={{ marginTop: "1rem" }}>
              <table className={styles.projectTable} style={{ borderCollapse: "collapse", minWidth: "1200px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", width: "60px", textAlign: "center" }}>NO.</th>
                    <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "300px" }}>NAMA PENGHADAP / YANG DIWAKILI</th>
                    <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "200px" }}>SIFAT AKTA</th>
                    <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "180px" }}>TANGGAL AKTA</th>
                    <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "180px" }}>NO. AKTA</th>
                    <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "200px" }}>NOMOR PADA REPERTORIUM</th>
                  </tr>
                </thead>
                <tbody>
                  {klapperRows.map((k, index) => {
                    return (
                      <tr key={k.id} className={styles.guestRow}>
                        <td style={{ textAlign: "center", border: "1px solid #e2e8f0", fontWeight: "700", color: "#0f172a", padding: "12px 10px" }}>
                          {index + 1}
                        </td>
                        <td style={{ border: "1px solid #e2e8f0", fontWeight: "700", color: "#0f172a", padding: "12px 10px" }}>
                          {k.appearerName}
                        </td>
                        <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "600", padding: "12px 10px" }}>
                          {k.deedNature}
                        </td>
                        <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", whiteSpace: "nowrap" }}>
                          {k.deedDate}
                        </td>
                        <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", whiteSpace: "nowrap", fontWeight: "600" }}>
                          {k.deedNumber}
                        </td>
                        <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", fontWeight: "700" }}>
                          {k.repertoriumNumber}
                        </td>
                      </tr>
                    );
                  })}
                  {klapperRows.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                        Tidak ada catatan indeks klapper yang sesuai dengan abjad atau pencarian Anda.
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

