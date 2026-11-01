"use client";

import React, { useState, useEffect } from "react";
import { GuestBookEntry } from "../page";
import { ptService } from "@/lib/services/supabaseService";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import styles from "../dashboard.module.css";

interface OtherParty {
  name: string;
  nik: string;
  position: string;
  status: string;
}

interface Shareholder {
  name: string;
  nik: string;
  sharesCount: number;
  position: string;
}

interface PtEntry {
  isNihil?: boolean;
  id: string;
  regNumber: string; // no. (yang terisi jika ada klien/daftar pt)
  deedNumber: string; // nomor akta
  ptName: string; // nama pt
  founders: string; // pendiri
  ptAddress: string; // alamat pt
  legalization: string; // pengesahan akta
  description: string; // keterangan
  date: string; // format YYYY-MM-DD (tanggal akta)
  
  // New structured fields
  attendantName?: string;
  attendantNik?: string;
  attendantPosition?: string;
  attendantStatus?: string;
  otherParties?: OtherParty[];
  kbli?: string;
  article1?: string;
  article2?: string;
  article3?: string;
  article4?: string;
  modalDasar?: number;
  modalDisetor?: number;
  totalShares?: number;
  nominalValue?: number;
  shareholdersList?: Shareholder[];
  directorsTenure?: string;
  shareComposition?: string;
  financialYear?: string;
}

interface PtRow {
  isNihil: boolean;
  dateLabel: string;
  pt?: PtEntry;
}

interface PtListTabProps {
  guestBook: GuestBookEntry[];
}

export default function PtListTab({ guestBook }: PtListTabProps) {
  const [showNihilModal, setShowNihilModal] = useState(false);
  const [editingNihilId, setEditingNihilId] = useState<string | null>(null);
  const [nihilMonth, setNihilMonth] = useState("01");
  const [nihilYear, setNihilYear] = useState("2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Pt Mock Database
  
  const [pts, setPts] = useState<PtEntry[]>([]);

  // Form states for manual registration (Stepper & Tabs)
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState<GuestBookEntry | null>(null);
  
  // Step 1: Data Penghadap & Para Pihak
  const [attendantName, setAttendantName] = useState("");
  const [attendantNik, setAttendantNik] = useState("");
  const [attendantPosition, setAttendantPosition] = useState("Direktur Utama");
  const [attendantStatus, setAttendantStatus] = useState("Hadir Sendiri");
  const [otherParties, setOtherParties] = useState<OtherParty[]>([]);

  // Step 2: Struktur Usaha & Pasal
  const [ptName, setPtName] = useState("");
  const [ptAddress, setPtAddress] = useState(""); // Domisili PT
  const [kbli, setKbli] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [deedNumber, setDeedNumber] = useState("");
  const [deedDate, setDeedDate] = useState("");
  const [legalization, setLegalization] = useState("");
  const [description, setDescription] = useState("");
  
  const [article1, setArticle1] = useState("");
  const [article2, setArticle2] = useState("");
  const [article3, setArticle3] = useState("");
  const [article4, setArticle4] = useState("");

  // Step 3: Permodalan & Pemegang Saham
  const [modalDasar, setModalDasar] = useState<number>(0);
  const [modalDisetor, setModalDisetor] = useState<number>(0);
  const [totalShares, setTotalShares] = useState<number>(0);
  const [nominalValue, setNominalValue] = useState<number>(0);
  const [shareholdersList, setShareholdersList] = useState<Shareholder[]>([]);
  const [newShName, setNewShName] = useState("");
  const [newShNik, setNewShNik] = useState("");
  const [newShShares, setNewShShares] = useState(0);
  const [newShPosition, setNewShPosition] = useState("Pemegang Saham");
  const [directorsTenure, setDirectorsTenure] = useState("");
  const [shareComposition, setShareComposition] = useState("");
  const [financialYear, setFinancialYear] = useState("");

  // Detail PT Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPtDetail, setSelectedPtDetail] = useState<PtEntry | null>(null);
  const [modalTab, setModalTab] = useState(1);

  // Restore draft form values from localStorage on mount (hydration-safe)
  useEffect(() => {
    const savedDraft = localStorage.getItem("draft_pt_form");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.showForm !== undefined) setShowForm(draft.showForm);
        if (draft.formStep !== undefined) setFormStep(draft.formStep);
        if (draft.selectedClient !== undefined) setSelectedClient(draft.selectedClient);
        if (draft.attendantName !== undefined) setAttendantName(draft.attendantName);
        if (draft.attendantNik !== undefined) setAttendantNik(draft.attendantNik);
        if (draft.attendantPosition !== undefined) setAttendantPosition(draft.attendantPosition);
        if (draft.attendantStatus !== undefined) setAttendantStatus(draft.attendantStatus);
        if (draft.otherParties !== undefined) setOtherParties(draft.otherParties);
        if (draft.ptName !== undefined) setPtName(draft.ptName);
        if (draft.ptAddress !== undefined) setPtAddress(draft.ptAddress);
        if (draft.kbli !== undefined) setKbli(draft.kbli);
        if (draft.regNumber !== undefined) setRegNumber(draft.regNumber);
        if (draft.deedNumber !== undefined) setDeedNumber(draft.deedNumber);
        if (draft.deedDate !== undefined) setDeedDate(draft.deedDate);
        if (draft.legalization !== undefined) setLegalization(draft.legalization);
        if (draft.description !== undefined) setDescription(draft.description);
        if (draft.article1 !== undefined) setArticle1(draft.article1);
        if (draft.article2 !== undefined) setArticle2(draft.article2);
        if (draft.article3 !== undefined) setArticle3(draft.article3);
        if (draft.article4 !== undefined) setArticle4(draft.article4);
        if (draft.modalDasar !== undefined) setModalDasar(draft.modalDasar);
        if (draft.modalDisetor !== undefined) setModalDisetor(draft.modalDisetor);
        if (draft.totalShares !== undefined) setTotalShares(draft.totalShares);
        if (draft.nominalValue !== undefined) setNominalValue(draft.nominalValue);
        if (draft.shareholdersList !== undefined) setShareholdersList(draft.shareholdersList);
      } catch (e) {
        console.error("Gagal memuat draf pendaftaran PT:", e);
      }
    }
  }, []);

  // Save current form values to localStorage whenever they change
  useEffect(() => {
    if (showForm) {
      const draft = {
        showForm,
        formStep,
        selectedClient,
        attendantName,
        attendantNik,
        attendantPosition,
        attendantStatus,
        otherParties,
        ptName,
        ptAddress,
        kbli,
        regNumber,
        deedNumber,
        deedDate,
        legalization,
        description,
        article1,
        article2,
        article3,
        article4,
        modalDasar,
        modalDisetor,
        totalShares,
        nominalValue,
        shareholdersList
      };
      localStorage.setItem("draft_pt_form", JSON.stringify(draft));
    } else {
      localStorage.removeItem("draft_pt_form");
    }
  }, [
    showForm, formStep, selectedClient, attendantName, attendantNik, attendantPosition, attendantStatus, otherParties,
    ptName, ptAddress, kbli, regNumber, deedNumber, deedDate, legalization, description,
    article1, article2, article3, article4, modalDasar, modalDisetor, totalShares, nominalValue, shareholdersList
  ]);

  const indonesianMonths = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Helpers for formatting date string to human read
    const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("pts_data");
    let fallbackPts: PtEntry[] = [];
    if (saved) {
      try {
        fallbackPts = JSON.parse(saved);
      } catch (e) {}
    }
    ptService.getAll(fallbackPts).then((data) => {
      if (data && data.length > 0) {
        setPts(data);
      } else {
        setPts(fallbackPts);
      }
    });
    setIsHydrated(true);
  }, []);

  useRealtimeSync("pt_registrations", () => {
    ptService.getAll().then((data) => {
      if (data && data.length > 0) setPts(data);
    });
  });

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("pts_data", JSON.stringify(pts));
    }
  }, [pts, isHydrated]);

  const handleSaveNihil = (e: React.FormEvent) => {
    e.preventDefault();
    const month = nihilMonth;
    const year = nihilYear;

    if (editingNihilId) {
      const hasExistingPts = pts.some(p => {
        if (p.id === editingNihilId) return false;
        if (!p.date) return false;
        const [pYear, pMonth] = p.date.split("-");
        return pYear === year && pMonth === month && !p.isNihil;
      });
      if (hasExistingPts) {
        alert(`Tidak dapat mengubah NIHIL! Sudah ada akta PT terdaftar pada bulan ${month} tahun ${year}.`);
        return;
      }

      const hasAlreadyNihil = pts.some(p => {
        if (p.id === editingNihilId) return false;
        if (!p.date) return false;
        const [pYear, pMonth] = p.date.split("-");
        return pYear === year && pMonth === month && p.isNihil;
      });
      if (hasAlreadyNihil) {
        alert(`Data NIHIL untuk bulan ${month} tahun ${year} sudah terdaftar!`);
        return;
      }

      const updated = pts.map(p => {
        if (p.id === editingNihilId) {
          return {
            ...p,
            date: `${year}-${month}-01`
          };
        }
        return p;
      });
      setPts(updated);
      setShowNihilModal(false);
      setEditingNihilId(null);
      alert(`Data NIHIL berhasil diperbarui!`);
      return;
    }

    const hasExistingPts = pts.some(p => {
      if (!p.date) return false;
      const [pYear, pMonth] = p.date.split("-");
      return pYear === year && pMonth === month && !p.isNihil;
    });
    if (hasExistingPts) {
      alert(`Tidak dapat menyimpan NIHIL! Sudah ada akta PT terdaftar pada bulan ${month} tahun ${year}.`);
      return;
    }

    const hasAlreadyNihil = pts.some(p => {
      if (!p.date) return false;
      const [pYear, pMonth] = p.date.split("-");
      return pYear === year && pMonth === month && p.isNihil;
    });
    if (hasAlreadyNihil) {
      alert(`Data NIHIL untuk bulan ${month} tahun ${year} sudah terdaftar!`);
      return;
    }

    const newNihil: PtEntry = {
      id: `PT-NIHIL-${Date.now()}`,
      regNumber: "---",
      deedNumber: "---",
      ptName: "N I H I L",
      founders: "--------------------",
      ptAddress: "---",
      legalization: "---",
      description: "Bulan Kosong",
      date: `${year}-${month}-01`,
      isNihil: true
    };
    ptService.create({
      deed_number: "-",
      deed_date: newNihil.date || `${year}-${month}-01`,
      pt_name: "N I H I L",
      founders: "-",
      authorized_capital: 0,
      paid_capital: 0,
      is_nihil: true,
    });
    setPts([...pts, newNihil]);
    setShowNihilModal(false);
    alert(`Registrasi NIHIL untuk bulan ${month} tahun ${year} berhasil disimpan!`);
  };

  const handleDeletePt = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      ptService.delete(id);
      setPts(pts.filter(p => p.id !== id));
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

  // Indonesian Words Generator (Terbilang)
  const terbilang = (angka: number): string => {
    const bil = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
    if (angka < 12) return bil[angka];
    if (angka < 20) return bil[angka - 10] + " belas";
    if (angka < 100) return bil[Math.floor(angka / 10)] + " puluh " + bil[angka % 10];
    if (angka < 200) return "seratus " + terbilang(angka - 100);
    if (angka < 1000) return bil[Math.floor(angka / 100)] + " ratus " + terbilang(angka % 100);
    if (angka < 2000) return "seribu " + terbilang(angka - 1000);
    if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + " ribu " + terbilang(angka % 1000);
    if (angka < 1000000000) return terbilang(Math.floor(angka / 1000000)) + " juta " + terbilang(angka % 1000000);
    if (angka < 1000000000000) return terbilang(Math.floor(angka / 1000000000)) + " miliar " + terbilang(angka % 1000000000);
    return "";
  };

  const totalSharesAllocated = React.useMemo(() => {
    return shareholdersList.reduce((acc, curr) => acc + (curr.sharesCount || 0), 0);
  }, [shareholdersList]);

  const sharesPercentageAllocated = React.useMemo(() => {
    if (totalShares <= 0) return "0.0";
    return ((totalSharesAllocated / totalShares) * 100).toFixed(1);
  }, [totalSharesAllocated, totalShares]);

  const totalValueAllocated = React.useMemo(() => {
    return totalSharesAllocated * nominalValue;
  }, [totalSharesAllocated, nominalValue]);

  const modalDasarTerbilang = React.useMemo(() => {
    return terbilang(modalDasar);
  }, [modalDasar]);

  const nominalValueTerbilang = React.useMemo(() => {
    return terbilang(nominalValue);
  }, [nominalValue]);

  const handleModalDasarChange = (val: number) => {
    setModalDasar(val);
    if (nominalValue > 0) {
      setTotalShares(Math.floor(val / nominalValue));
    }
  };

  const handleNominalValueChange = (val: number) => {
    setNominalValue(val);
    if (val > 0) {
      setTotalShares(Math.floor(modalDasar / val));
    }
  };

  const handleTotalSharesChange = (val: number) => {
    setTotalShares(val);
    if (nominalValue > 0) {
      setModalDasar(val * nominalValue);
    }
  };

  const generateArticles = () => {
    setArticle1(`Perseroan Terbatas ini bernama ${ptName || "[Nama PT]"}, berkedudukan di ${ptAddress || "[Domisili PT]"}.`);
    setArticle2(`Perseroan didirikan untuk jangka waktu yang tidak terbatas, dimulai sejak tanggal pengesahan badan hukum oleh Menteri Hukum dan Hak Asasi Manusia.`);
    setArticle3(`Maksud dan tujuan Perseroan ialah berusaha dalam bidang ${kbli || "[Maksud & Tujuan / KBLI]"}. Untuk mencapai maksud dan tujuan tersebut, Perseroan dapat melaksanakan kegiatan usaha utama maupun penunjang.`);
    
    const modalDasarText = modalDasar ? `${modalDasar.toLocaleString("id-ID")} (${terbilang(modalDasar)} Rupiah)` : "0 (nol Rupiah)";
    const totalSharesText = totalShares ? `${totalShares.toLocaleString("id-ID")} lembar` : "0 lembar";
    const nominalValueText = nominalValue ? `${nominalValue.toLocaleString("id-ID")} (${terbilang(nominalValue)} Rupiah)` : "0 Rupiah";
    
    setArticle4(`Modal dasar Perseroan berjumlah Rp ${modalDasarText} terbagi atas ${totalSharesText} saham dengan nilai nominal per lembar sebesar Rp ${nominalValueText}.`);
  };

  
  const handleAddShareholder = () => {
    if (!newShName.trim()) {
      alert("Nama pemegang saham wajib diisi!");
      return;
    }
    if (newShShares <= 0) {
      alert("Jumlah lembar saham harus lebih dari 0!");
      return;
    }
    
    setShareholdersList([...shareholdersList, {
      name: newShName,
      nik: newShNik,
      sharesCount: newShShares,
      position: newShPosition
    }]);
    
    setNewShName("");
    setNewShNik("");
    setNewShShares(0);
    setNewShPosition("Pemegang Saham");
  };

  const handleRemoveShareholder = (index: number) => {
    const newList = [...shareholdersList];
    newList.splice(index, 1);
    setShareholdersList(newList);
  };

  const handleNextStep = () => {
    if (formStep === 1) {
      if (!attendantName.trim()) {
        alert("Nama Penghadap Utama wajib diisi!");
        return;
      }
      if (!article1 && !article2 && !article3 && !article4) {
        generateArticles();
      }
      setFormStep(2);
    } else if (formStep === 2) {
      if (!ptName.trim()) {
        alert("Nama PT wajib diisi!");
        return;
      }
      if (!ptAddress.trim()) {
        alert("Alamat Kedudukan PT wajib diisi!");
        return;
      }
      setFormStep(3);
    }
  };

  // Form Submit Handler
  const handleSavePt = (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep < 3) {
      handleNextStep();
      return;
    }
    if (!ptName.trim()) {
      alert("Nama PT wajib diisi!");
      return;
    }
    if (!attendantName.trim()) {
      alert("Nama Penghadap Utama wajib diisi!");
      return;
    }
    if (!ptAddress.trim()) {
      alert("Alamat Kedudukan PT wajib diisi!");
      return;
    }

    // Validation for shareholders allocation
    if (shareholdersList.length > 0) {
      if (totalSharesAllocated !== totalShares) {
        if (!confirm(`Peringatan: Jumlah saham terdistribusi (${totalSharesAllocated.toLocaleString("id-ID")} lembar) tidak sama dengan Total Saham (${totalShares.toLocaleString("id-ID")} lembar). Apakah Anda yakin ingin melanjutkan?`)) {
          return;
        }
      }
      if (totalValueAllocated !== modalDisetor) {
        if (!confirm(`Peringatan: Total nilai nominal saham pemegang saham (Rp ${totalValueAllocated.toLocaleString("id-ID")}) tidak sama dengan Modal Disetor (Rp ${modalDisetor.toLocaleString("id-ID")}). Apakah Anda yakin ingin melanjutkan?`)) {
          return;
        }
      }
    }

    // Founders display string
    let foundersString = attendantName;
    if (shareholdersList.length > 0) {
      foundersString = shareholdersList.map(sh => `${sh.name} (${sh.sharesCount} lbr)`).join(", ");
    } else if (otherParties.length > 0) {
      foundersString = [attendantName, ...otherParties.map(p => p.name)].join(" & ");
    }

    const newPt: PtEntry = {
      id: `PT-${String(pts.length + 1).padStart(3, "0")}`,
      regNumber: regNumber.trim() || "-",
      deedNumber: deedNumber.trim() || "-",
      ptName: ptName,
      founders: foundersString,
      ptAddress: ptAddress,
      legalization: legalization.trim() || "-",
      description: description.trim() || "-",
      date: deedDate || new Date().toISOString().split("T")[0],
      
      // New structured fields
      attendantName,
      attendantNik,
      attendantPosition,
      attendantStatus,
      otherParties,
      kbli,
      article1,
      article2,
      article3,
      article4,
      modalDasar,
      modalDisetor,
      totalShares,
      nominalValue,
      shareholdersList,
      directorsTenure,
      shareComposition,
      financialYear
    };

    ptService.create({
      deed_number: newPt.deedNumber,
      deed_date: newPt.date || new Date().toISOString().split("T")[0],
      pt_name: newPt.ptName,
      founders: newPt.founders,
      authorized_capital: newPt.modalDasar || 0,
      paid_capital: newPt.modalDisetor || 0,
      sk_kemenkumham: newPt.legalization || "-",
      directors_tenure: newPt.directorsTenure || "-",
      share_composition: newPt.shareComposition || "-",
      financial_year: newPt.financialYear || "-",
      is_nihil: false,
    });
    setPts([newPt, ...pts]);
    alert("Data register PT baru berhasil disimpan!");

    // Reset States
    setShowForm(false);
    setFormStep(1);
    setSelectedClient(null);
    setAttendantName("");
    setAttendantNik("");
    setAttendantPosition("Direktur Utama");
    setAttendantStatus("Hadir Sendiri");
    setOtherParties([]);
    setPtName("");
    setPtAddress("");
    setKbli("");
    setRegNumber("");
    setDeedNumber("");
    setDeedDate("");
    setLegalization("");
    setDescription("");
    setArticle1("");
    setArticle2("");
    setArticle3("");
    setArticle4("");
    setModalDasar(0);
    setModalDisetor(0);
    setTotalShares(0);
    setNominalValue(0);
    setShareholdersList([]);
    setDirectorsTenure("");
    setShareComposition("");
    setFinancialYear("");
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
  const getPtRows = () => {
    const rows: PtRow[] = [];
    const months = getMonthsRange().filter(m => {
      const matchesMonth = filterMonth === "" || m.monthStr === filterMonth;
      const matchesYear = filterYear === "" || String(m.year) === filterYear;
      return matchesMonth && matchesYear;
    });

    months.forEach((m) => {
      // Find all PT deeds in this month
      const listInMonth = pts.filter(p => {
        let dateYear = "";
        let dateMonthVal = -1;
        
        const dateStr = p.date; // YYYY-MM-DD
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
          p.ptName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.founders.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.ptAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.deedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          formatIndonesianDate(p.date).toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      });

      const sorted = [...filteredListInMonth].sort((a, b) => a.id.localeCompare(b.id));
      sorted.forEach((pt) => {
        rows.push({
          isNihil: pt.isNihil || false,
          dateLabel: m.label,
          pt,
        });
    });});

    return rows;
  };

  const ptRows = getPtRows();

  // PDF Export
  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const title = `Buku Daftar PT - ${filterMonth ? indonesianMonths[parseInt(filterMonth) - 1] : "Semua Bulan"} ${filterYear || "Semua Tahun"}`;
    
    let rowsHtml = "";
    ptRows.forEach((row, index) => {
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
          const p = row.pt!;
          rowsHtml += `
            <tr>
              <td style="text-align: center; font-weight: bold; border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${p.regNumber}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${formatIndonesianDate(p.date)}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${p.deedNumber}</td>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>${p.ptName}</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${p.founders}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${p.ptAddress}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${p.legalization}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${p.description}</td>
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
                ${["No","No. Register","Tanggal Akta","No. Akta","Nama PT","Pendiri/Pemegang Saham","Alamat PT","Pengesahan","Keterangan"].map(h => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-weight: bold;">${h}</th>`).join("")}
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
          ${["No. Register","Tanggal Akta","No. Akta","Nama PT","Pendiri/Pemegang Saham","Alamat PT","Pengesahan","Keterangan"].map(h => `<th style="background-color: #f2f2f2; font-weight: bold; border: 0.5pt solid #000000;">${h}</th>`).join("")}
        </tr>
      </thead>
      <tbody>`;

    ptRows.forEach((row, index) => {
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
          const p = row.pt!;
          tableHtml += `
            <tr>
              <td>${p.regNumber}</td>
              <td>${formatIndonesianDate(p.date)}</td>
              <td>${p.deedNumber}</td>
              <td><strong>${p.ptName}</strong></td>
              <td>${p.founders}</td>
              <td>${p.ptAddress}</td>
              <td>${p.legalization}</td>
              <td>${p.description}</td>
            </tr>
          `;
        }
      });

    if (!ptRows.length) {
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
    a.download = "Pt.xls";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Header section */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Buku Daftar PT</h1>
        <p className={styles.welcomeSubtitle}>
          Daftar registrasi buku perseroan terbatas (PT) resmi beserta pengesahan akta.
        </p>
      </div>

      {/* Button to toggle add new PT form */}
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
            + Daftar PT Baru
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
          <h2 className={styles.cardTitle} style={{ marginBottom: "1.25rem" }}>Pendaftaran PT Baru</h2>
          
          {/* Stepper Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", padding: "0 1rem", position: "relative" }}>
            {/* Step 1 Circle */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative", zIndex: 2 }}>
              <div style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "50%",
                backgroundColor: formStep >= 1 ? "var(--primary-green)" : "#cbd5e1",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "1.1rem",
                boxShadow: formStep >= 1 ? "0 4px 10px rgba(22, 163, 74, 0.35)" : "none",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }} onClick={() => setFormStep(1)}>
                1
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: formStep === 1 ? "700" : "600", color: formStep === 1 ? "var(--primary-green-dark)" : "#64748b", marginTop: "0.5rem", textAlign: "center" }}>
                Penghadap & Pihak
              </span>
            </div>
            
            {/* Line 1-2 */}
            <div style={{ flex: 1, height: "3px", backgroundColor: formStep >= 2 ? "var(--primary-green)" : "#cbd5e1", margin: "0 -1rem", transform: "translateY(-10px)", transition: "all 0.3s ease", zIndex: 1 }} />
            
            {/* Step 2 Circle */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative", zIndex: 2 }}>
              <div style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "50%",
                backgroundColor: formStep >= 2 ? "var(--primary-green)" : "#cbd5e1",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "1.1rem",
                boxShadow: formStep >= 2 ? "0 4px 10px rgba(22, 163, 74, 0.35)" : "none",
                transition: "all 0.3s ease",
                cursor: attendantName.trim() !== "" ? "pointer" : "not-allowed"
              }} onClick={() => attendantName.trim() !== "" && setFormStep(2)}>
                2
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: formStep === 2 ? "700" : "600", color: formStep === 2 ? "var(--primary-green-dark)" : "#64748b", marginTop: "0.5rem", textAlign: "center" }}>
                Struktur Usaha & Pasal
              </span>
            </div>
            
            {/* Line 2-3 */}
            <div style={{ flex: 1, height: "3px", backgroundColor: formStep >= 3 ? "var(--primary-green)" : "#cbd5e1", margin: "0 -1rem", transform: "translateY(-10px)", transition: "all 0.3s ease", zIndex: 1 }} />
            
            {/* Step 3 Circle */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative", zIndex: 2 }}>
              <div style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "50%",
                backgroundColor: formStep >= 3 ? "var(--primary-green)" : "#cbd5e1",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "1.1rem",
                boxShadow: formStep >= 3 ? "0 4px 10px rgba(22, 163, 74, 0.35)" : "none",
                transition: "all 0.3s ease",
                cursor: (attendantName.trim() !== "" && ptName.trim() !== "") ? "pointer" : "not-allowed"
              }} onClick={() => (attendantName.trim() !== "" && ptName.trim() !== "") && setFormStep(3)}>
                3
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: formStep === 3 ? "700" : "600", color: formStep === 3 ? "var(--primary-green-dark)" : "#64748b", marginTop: "0.5rem", textAlign: "center" }}>
                Permodalan & Saham
              </span>
            </div>
          </div>

          <form onSubmit={handleSavePt}>
            {/* STEP 1 */}
            {formStep === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {selectedClient && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.75rem 1rem", borderRadius: "0.5rem" }}>
                    <span style={{ fontSize: "0.85rem", color: "#166534", fontWeight: "600" }}>
                      ✓ Klien Terdaftar Terpilih: <strong>{selectedClient.name}</strong> (Data otomatis terisi)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClient(null);
                        setAttendantName("");
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
                  {/* Nama Penghadap */}
                  <div>
                    <label className={styles.formLabel}>Nama Penghadap Utama <span style={{ color: "red" }}>*</span></label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        placeholder="Nama penghadap..."
                        className={styles.inputField}
                        value={attendantName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAttendantName(val);
                          if (selectedClient && val !== selectedClient.name) {
                            setSelectedClient(null);
                          }
                        }}
                        required
                      />

                      {attendantName && !selectedClient && (
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
                          {uniquePastClients.filter(c => c.name.toLowerCase().includes(attendantName.toLowerCase())).length > 0 ? (
                            uniquePastClients
                              .filter(c => c.name.toLowerCase().includes(attendantName.toLowerCase()))
                              .map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedClient(c);
                                    setAttendantName(c.name);
                                    setPtName(c.purpose.includes("PT") ? c.purpose : `PT. ${c.name}`);
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

                  {/* NIK Penghadap */}
                  <div>
                    <label className={styles.formLabel}>NIK Penghadap Utama</label>
                    <input
                      type="text"
                      placeholder="Masukkan NIK 16 digit..."
                      className={styles.inputField}
                      value={attendantNik}
                      onChange={(e) => setAttendantNik(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    />
                  </div>

                  {/* Jabatan Penghadap */}
                  <div>
                    <label className={styles.formLabel}>Jabatan Penghadap</label>
                    <select
                      className={styles.inputField}
                      value={attendantPosition}
                      onChange={(e) => setAttendantPosition(e.target.value)}
                      style={{ backgroundColor: "#ffffff" }}
                    >
                      <option value="Direktur Utama">Direktur Utama</option>
                      <option value="Direktur">Direktur</option>
                      <option value="Komisaris Utama">Komisaris Utama</option>
                      <option value="Komisaris">Komisaris</option>
                      <option value="Penghadap Utama">Penghadap Utama / Kuasa</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  {/* Status Kehadiran */}
                  <div>
                    <label className={styles.formLabel}>Status Kehadiran</label>
                    <select
                      className={styles.inputField}
                      value={attendantStatus}
                      onChange={(e) => setAttendantStatus(e.target.value)}
                      style={{ backgroundColor: "#ffffff" }}
                    >
                      <option value="Hadir Sendiri">Hadir Sendiri</option>
                      <option value="Diwakili berdasarkan Surat Kuasa">Diwakili berdasarkan Surat Kuasa</option>
                      <option value="Bertindak selaku wali/orang tua">Bertindak selaku wali/orang tua</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                {/* Para Pihak Tambahan (Daftar Dinamis) */}
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>Para Pihak Tambahan (Anggota Lain)</h3>
                      <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>Tambahkan para pihak lain yang turut menghadap untuk akta pendirian ini.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtherParties([...otherParties, { name: "", nik: "", position: "Direktur", status: "Hadir Sendiri" }])}
                      className={styles.quickActionBtn}
                      style={{ padding: "0.5rem 0.85rem", fontSize: "0.85rem" }}
                    >
                      + Tambah Pihak
                    </button>
                  </div>

                  {otherParties.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "1.5rem", border: "1px dashed #cbd5e1", borderRadius: "0.5rem", color: "#64748b", fontSize: "0.875rem" }}>
                      Tidak ada pihak tambahan. Klik "+ Tambah Pihak" untuk menambahkan anggota lain.
                    </div>
                  ) : (
                    <div className={styles.tableContainer} style={{ border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                            <th style={{ padding: "10px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Nama Pihak</th>
                            <th style={{ padding: "10px", textAlign: "left", fontWeight: "600", color: "#475569" }}>NIK</th>
                            <th style={{ padding: "10px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Jabatan</th>
                            <th style={{ padding: "10px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Status Kehadiran</th>
                            <th style={{ padding: "10px", width: "80px", textAlign: "center" }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {otherParties.map((party, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                              <td style={{ padding: "8px 10px" }}>
                                <input
                                  type="text"
                                  placeholder="Nama pihak..."
                                  className={styles.inputField}
                                  style={{ padding: "0.35rem 0.5rem", fontSize: "0.85rem" }}
                                  value={party.name}
                                  onChange={(e) => {
                                    const updated = [...otherParties];
                                    updated[idx].name = e.target.value;
                                    setOtherParties(updated);
                                  }}
                                />
                              </td>
                              <td style={{ padding: "8px 10px" }}>
                                <input
                                  type="text"
                                  placeholder="NIK..."
                                  className={styles.inputField}
                                  style={{ padding: "0.35rem 0.5rem", fontSize: "0.85rem" }}
                                  value={party.nik}
                                  onChange={(e) => {
                                    const updated = [...otherParties];
                                    updated[idx].nik = e.target.value.replace(/\D/g, "").slice(0, 16);
                                    setOtherParties(updated);
                                  }}
                                />
                              </td>
                              <td style={{ padding: "8px 10px" }}>
                                <select
                                  className={styles.inputField}
                                  style={{ padding: "0.35rem 0.5rem", fontSize: "0.85rem", backgroundColor: "#ffffff" }}
                                  value={party.position}
                                  onChange={(e) => {
                                    const updated = [...otherParties];
                                    updated[idx].position = e.target.value;
                                    setOtherParties(updated);
                                  }}
                                >
                                  <option value="Direktur Utama">Direktur Utama</option>
                                  <option value="Direktur">Direktur</option>
                                  <option value="Komisaris Utama">Komisaris Utama</option>
                                  <option value="Komisaris">Komisaris</option>
                                  <option value="Pemegang Saham">Pemegang Saham</option>
                                  <option value="Lainnya">Lainnya</option>
                                </select>
                              </td>
                              <td style={{ padding: "8px 10px" }}>
                                <select
                                  className={styles.inputField}
                                  style={{ padding: "0.35rem 0.5rem", fontSize: "0.85rem", backgroundColor: "#ffffff" }}
                                  value={party.status}
                                  onChange={(e) => {
                                    const updated = [...otherParties];
                                    updated[idx].status = e.target.value;
                                    setOtherParties(updated);
                                  }}
                                >
                                  <option value="Hadir Sendiri">Hadir Sendiri</option>
                                  <option value="Diwakili berdasarkan Surat Kuasa">Diwakili berdasarkan Surat Kuasa</option>
                                  <option value="Bertindak selaku wali/orang tua">Bertindak selaku wali/orang tua</option>
                                  <option value="Lainnya">Lainnya</option>
                                </select>
                              </td>
                              <td style={{ padding: "8px 10px", textAlign: "center" }}>
                                <button
                                  type="button"
                                  onClick={() => setOtherParties(otherParties.filter((_, i) => i !== idx))}
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "#ef4444",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "0.8rem"
                                  }}
                                >
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {formStep === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>Struktur Usaha & Informasi Akta</h3>
                  <button
                    type="button"
                    onClick={generateArticles}
                    className={styles.quickActionBtn}
                    style={{ padding: "0.5rem 0.85rem", fontSize: "0.8rem", backgroundColor: "#0284c7" }}
                  >
                    Generate / Reset Boilerplate Pasal
                  </button>
                </div>

                <div className={styles.guestbookFormHorizontal} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                  {/* Nama PT */}
                  <div>
                    <label className={styles.formLabel}>Nama PT <span style={{ color: "red" }}>*</span></label>
                    <input
                      type="text"
                      placeholder="Nama PT... (contoh: PT. Maju Bersama)"
                      className={styles.inputField}
                      value={ptName}
                      onChange={(e) => setPtName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Alamat/Domisili PT */}
                  <div>
                    <label className={styles.formLabel}>Domisili / Alamat PT <span style={{ color: "red" }}>*</span></label>
                    <input
                      type="text"
                      placeholder="Alamat kantor PT..."
                      className={styles.inputField}
                      value={ptAddress}
                      onChange={(e) => setPtAddress(e.target.value)}
                      required
                    />
                  </div>

                  {/* KBLI / Maksud & Tujuan */}
                  <div>
                    <label className={styles.formLabel}>KBLI / Kegiatan Usaha</label>
                    <input
                      type="text"
                      placeholder="Contoh: 62019 - Jasa Pemrograman..."
                      className={styles.inputField}
                      value={kbli}
                      onChange={(e) => setKbli(e.target.value)}
                    />
                  </div>

                  {/* No Registrasi */}
                  <div>
                    <label className={styles.formLabel}>Nomor Registrasi / Pendaftaran</label>
                    <input
                      type="text"
                      placeholder="Misal: 03/PT/I/2026"
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
                      placeholder="Misal: 08"
                      className={styles.inputField}
                      value={deedNumber}
                      onChange={(e) => setDeedNumber(e.target.value)}
                    />
                  </div>

                  {/* Tanggal Pembuatan Akta */}
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
                  {/* Masa Jabatan Direksi */}
                  <div>
                    <label className={styles.formLabel}>Masa Jabatan Direksi</label>
                    <input
                      type="text"
                      placeholder="Contoh: 5 Tahun"
                      className={styles.inputField}
                      value={directorsTenure}
                      onChange={(e) => setDirectorsTenure(e.target.value)}
                    />
                  </div>

                  {/* Tahun Buku */}
                  <div>
                    <label className={styles.formLabel}>Tahun Buku</label>
                    <input
                      type="text"
                      placeholder="Contoh: Januari - Desember"
                      className={styles.inputField}
                      value={financialYear}
                      onChange={(e) => setFinancialYear(e.target.value)}
                    />
                  </div>
                </div>

                {/* Pasal-Pasal Anggaran Dasar */}
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0f172a", marginBottom: "1rem" }}>
                    Draf Anggaran Dasar (Pasal 1 s.d. Pasal 4)
                  </h4>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {/* Pasal 1 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <label className={styles.formLabel} style={{ fontWeight: "600" }}>Pasal 1: Nama & Tempat Kedudukan</label>
                      <textarea
                        className={styles.inputField}
                        style={{ minHeight: "100px", fontFamily: "monospace", fontSize: "0.85rem", resize: "vertical", padding: "0.5rem" }}
                        value={article1}
                        onChange={(e) => setArticle1(e.target.value)}
                      />
                    </div>

                    {/* Pasal 2 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <label className={styles.formLabel} style={{ fontWeight: "600" }}>Pasal 2: Jangka Waktu Berdirinya Perseroan</label>
                      <textarea
                        className={styles.inputField}
                        style={{ minHeight: "100px", fontFamily: "monospace", fontSize: "0.85rem", resize: "vertical", padding: "0.5rem" }}
                        value={article2}
                        onChange={(e) => setArticle2(e.target.value)}
                      />
                    </div>

                    {/* Pasal 3 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <label className={styles.formLabel} style={{ fontWeight: "600" }}>Pasal 3: Maksud & Tujuan serta Kegiatan Usaha</label>
                      <textarea
                        className={styles.inputField}
                        style={{ minHeight: "100px", fontFamily: "monospace", fontSize: "0.85rem", resize: "vertical", padding: "0.5rem" }}
                        value={article3}
                        onChange={(e) => setArticle3(e.target.value)}
                      />
                    </div>

                    {/* Pasal 4 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <label className={styles.formLabel} style={{ fontWeight: "600" }}>Pasal 4: Modal</label>
                      <textarea
                        className={styles.inputField}
                        style={{ minHeight: "100px", fontFamily: "monospace", fontSize: "0.85rem", resize: "vertical", padding: "0.5rem" }}
                        value={article4}
                        onChange={(e) => setArticle4(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {formStep === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>Permodalan & Alokasi Pemegang Saham</h3>

                <div className={styles.guestbookFormHorizontal} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                  {/* Modal Dasar */}
                  <div>
                    <label className={styles.formLabel}>Modal Dasar (Rp)</label>
                    <input
                      type="number"
                      placeholder="Masukkan modal dasar..."
                      className={styles.inputField}
                      value={modalDasar || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        handleModalDasarChange(val);
                      }}
                    />
                  </div>

                  {/* Nilai Nominal Per Lembar */}
                  <div>
                    <label className={styles.formLabel}>Nilai Nominal Per Saham (Rp)</label>
                    <input
                      type="number"
                      placeholder="Masukkan nilai nominal..."
                      className={styles.inputField}
                      value={nominalValue || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        handleNominalValueChange(val);
                      }}
                    />
                  </div>

                  {/* Jumlah Lembar Saham */}
                  <div>
                    <label className={styles.formLabel}>Jumlah Lembar Saham (Total)</label>
                    <input
                      type="number"
                      placeholder="Jumlah saham total..."
                      className={styles.inputField}
                      value={totalShares || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        handleTotalSharesChange(val);
                      }}
                    />
                  </div>

                  {/* Modal Disetor */}
                  <div>
                    <label className={styles.formLabel}>Modal Disetor (Rp)</label>
                    <input
                      type="number"
                      placeholder="Masukkan modal disetor..."
                      className={styles.inputField}
                      value={modalDisetor || ""}
                      onChange={(e) => setModalDisetor(parseInt(e.target.value, 10) || 0)}
                    />
                    <span style={{ fontSize: "0.7rem", color: modalDisetor < modalDasar * 0.25 ? "#b91c1c" : "#16a34a", fontWeight: "600", display: "block", marginTop: "0.25rem" }}>
                      Min. 25% Modal Dasar: Rp {(modalDasar * 0.25).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                
                {/* Komposisi Saham */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label className={styles.formLabel}>Komposisi Saham</label>
                  <input
                    type="text"
                    placeholder="Keterangan komposisi saham (misal: A: 50%, B: 50%)..."
                    className={styles.inputField}
                    value={shareComposition}
                    onChange={(e) => setShareComposition(e.target.value)}
                  />
                </div>

                {/* Pemegang Saham */}
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>Pembagian Lembar Saham & Pemegang Saham</h4>
                      <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>Daftarkan pemegang saham beserta alokasi lembar sahamnya.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const nameToUse = shareholdersList.length === 0 ? attendantName : "";
                        const nikToUse = shareholdersList.length === 0 ? attendantNik : "";
                        const positionToUse = shareholdersList.length === 0 ? attendantPosition : "Pemegang Saham";
                        setShareholdersList([...shareholdersList, { name: nameToUse, nik: nikToUse, sharesCount: 0, position: positionToUse }]);
                      }}
                      className={styles.quickActionBtn}
                      style={{ padding: "0.5rem 0.85rem", fontSize: "0.85rem" }}
                    >
                      + Tambah Pemegang Saham
                    </button>
                  </div>

                  {shareholdersList.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "1.5rem", border: "1px dashed #cbd5e1", borderRadius: "0.5rem", color: "#64748b", fontSize: "0.875rem" }}>
                      Tidak ada pemegang saham. Klik "+ Tambah Pemegang Saham" untuk menambahkan.
                    </div>
                  ) : (
                    <div className={styles.tableContainer} style={{ border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                            <th style={{ padding: "10px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Nama Pemegang Saham</th>
                            <th style={{ padding: "10px", textAlign: "left", fontWeight: "600", color: "#475569" }}>NIK</th>
                            <th style={{ padding: "10px", textAlign: "right", fontWeight: "600", color: "#475569" }}>Jumlah Lembar</th>
                            <th style={{ padding: "10px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Jabatan Akta</th>
                            <th style={{ padding: "10px", textAlign: "right", fontWeight: "600", color: "#475569" }}>Persentase (%)</th>
                            <th style={{ padding: "10px", textAlign: "right", fontWeight: "600", color: "#475569" }}>Nilai Saham (Rp)</th>
                            <th style={{ padding: "10px", width: "80px", textAlign: "center" }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shareholdersList.map((sh, idx) => {
                            const pct = totalShares > 0 ? ((sh.sharesCount / totalShares) * 100).toFixed(1) : "0.0";
                            const value = sh.sharesCount * nominalValue;
                            return (
                              <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                <td style={{ padding: "8px 10px" }}>
                                  <input
                                    type="text"
                                    placeholder="Nama pemegang saham..."
                                    className={styles.inputField}
                                    style={{ padding: "0.35rem 0.5rem", fontSize: "0.85rem" }}
                                    value={sh.name}
                                    onChange={(e) => {
                                      const updated = [...shareholdersList];
                                      updated[idx].name = e.target.value;
                                      setShareholdersList(updated);
                                    }}
                                  />
                                </td>
                                <td style={{ padding: "8px 10px" }}>
                                  <input
                                    type="text"
                                    placeholder="NIK..."
                                    className={styles.inputField}
                                    style={{ padding: "0.35rem 0.5rem", fontSize: "0.85rem" }}
                                    value={sh.nik}
                                    onChange={(e) => {
                                      const updated = [...shareholdersList];
                                      updated[idx].nik = e.target.value.replace(/\D/g, "").slice(0, 16);
                                      setShareholdersList(updated);
                                    }}
                                  />
                                </td>
                                <td style={{ padding: "8px 10px" }}>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    className={styles.inputField}
                                    style={{ padding: "0.35rem 0.5rem", fontSize: "0.85rem", textAlign: "right", width: "100px" }}
                                    value={sh.sharesCount || ""}
                                    onChange={(e) => {
                                      const updated = [...shareholdersList];
                                      updated[idx].sharesCount = parseInt(e.target.value, 10) || 0;
                                      setShareholdersList(updated);
                                    }}
                                  />
                                </td>
                                <td style={{ padding: "8px 10px" }}>
                                  <select
                                    className={styles.inputField}
                                    style={{ padding: "0.35rem 0.5rem", fontSize: "0.85rem", backgroundColor: "#ffffff" }}
                                    value={sh.position}
                                    onChange={(e) => {
                                      const updated = [...shareholdersList];
                                      updated[idx].position = e.target.value;
                                      setShareholdersList(updated);
                                    }}
                                  >
                                    <option value="Direktur Utama">Direktur Utama</option>
                                    <option value="Direktur">Direktur</option>
                                    <option value="Komisaris Utama">Komisaris Utama</option>
                                    <option value="Komisaris">Komisaris</option>
                                    <option value="Pemegang Saham">Pemegang Saham</option>
                                  </select>
                                </td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: "600", color: "#475569" }}>
                                  {pct}%
                                </td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: "600", color: "#0f172a" }}>
                                  {value.toLocaleString("id-ID")}
                                </td>
                                <td style={{ padding: "8px 10px", textAlign: "center" }}>
                                  <button
                                    type="button"
                                    onClick={() => setShareholdersList(shareholdersList.filter((_, i) => i !== idx))}
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                      color: "#ef4444",
                                      cursor: "pointer",
                                      fontWeight: "600",
                                      fontSize: "0.8rem"
                                    }}
                                  >
                                    Hapus
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Summary & Calculations Section */}
                  {shareholdersList.length > 0 && (
                    <div style={{ marginTop: "1rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.5rem", padding: "1rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div>
                          <h5 style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.5rem", textTransform: "uppercase" }}>Ringkasan Saham</h5>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.825rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Total Lembar Saham:</span>
                              <span style={{ fontWeight: "700" }}>{totalShares.toLocaleString("id-ID")} lembar</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Terdistribusi:</span>
                              <span style={{ fontWeight: "700", color: totalSharesAllocated > totalShares ? "#ef4444" : "#0f172a" }}>
                                {totalSharesAllocated.toLocaleString("id-ID")} lembar ({sharesPercentageAllocated}%)
                              </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "0.25rem", marginTop: "0.25rem" }}>
                              <span>Sisa Saham:</span>
                              <span style={{ fontWeight: "700", color: totalSharesAllocated === totalShares ? "#16a34a" : "#ca8a04" }}>
                                {(totalShares - totalSharesAllocated).toLocaleString("id-ID")} lembar
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.5rem", textTransform: "uppercase" }}>Ringkasan Nilai Nominal</h5>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.825rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Modal Disetor:</span>
                              <span style={{ fontWeight: "700" }}>Rp {modalDisetor.toLocaleString("id-ID")}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Nilai Alokasi Saham:</span>
                              <span style={{ fontWeight: "700", color: totalValueAllocated !== modalDisetor ? "#ca8a04" : "#16a34a" }}>
                                Rp {totalValueAllocated.toLocaleString("id-ID")}
                              </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "0.25rem", marginTop: "0.25rem" }}>
                              <span>Selisih:</span>
                              <span style={{ fontWeight: "700", color: totalValueAllocated === modalDisetor ? "#16a34a" : "#ef4444" }}>
                                Rp {(modalDisetor - totalValueAllocated).toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Warnings and Alerts */}
                      <div style={{ marginTop: "1rem", borderTop: "1px solid #e2e8f0", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {totalSharesAllocated !== totalShares && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#ca8a04", fontSize: "0.8rem", fontWeight: "600" }}>
                            <span>⚠️ Peringatan: Total lembar saham yang terbagi ({totalSharesAllocated.toLocaleString("id-ID")}) belum sama dengan Total Saham ({totalShares.toLocaleString("id-ID")}).</span>
                          </div>
                        )}
                        {totalValueAllocated !== modalDisetor && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#ef4444", fontSize: "0.8rem", fontWeight: "600" }}>
                            <span>❌ Peringatan: Total nilai saham teralokasi (Rp {totalValueAllocated.toLocaleString("id-ID")}) tidak sama dengan Modal Disetor (Rp {modalDisetor.toLocaleString("id-ID")}).</span>
                          </div>
                        )}
                        {totalSharesAllocated === totalShares && totalValueAllocated === modalDisetor && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#16a34a", fontSize: "0.8rem", fontWeight: "600" }}>
                            <span>✓ Alokasi permodalan dan saham 100% valid dan cocok!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stepper Footer Action Buttons */}
            <div style={{ display: "flex", gap: "0.75rem", width: "100%", borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem", marginTop: "1.5rem" }}>
              {formStep > 1 && (
                <button
                  type="button"
                  onClick={() => setFormStep(formStep - 1)}
                  className={styles.quickActionBtn}
                  style={{ justifyContent: "center", padding: "0.75rem 1.25rem", fontSize: "0.95rem", backgroundColor: "#64748b" }}
                >
                  Kembali
                </button>
              )}
              
              {formStep === 1 && (
                <button
                  type="button"
                  className={styles.quickActionBtn}
                  onClick={() => {
                    setShowForm(false);
                    setFormStep(1);
                    setSelectedClient(null);
                    setAttendantName("");
                    setAttendantNik("");
                    setAttendantPosition("Direktur Utama");
                    setAttendantStatus("Hadir Sendiri");
                    setOtherParties([]);
                    setPtName("");
                    setPtAddress("");
                    setKbli("");
                    setRegNumber("");
                    setDeedNumber("");
                    setDeedDate("");
                    setLegalization("");
                    setDescription("");
                    setArticle1("");
                    setArticle2("");
                    setArticle3("");
                    setArticle4("");
                    setModalDasar(0);
                    setModalDisetor(0);
                    setTotalShares(0);
                    setNominalValue(0);
                    setShareholdersList([]);
    setDirectorsTenure("");
    setShareComposition("");
    setFinancialYear("");
                  }}
                  style={{ justifyContent: "center", padding: "0.75rem 1.25rem", fontSize: "0.95rem", backgroundColor: "#64748b" }}
                >
                  Batal
                </button>
              )}

              {formStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className={styles.quickActionBtn}
                  style={{ justifyContent: "center", padding: "0.75rem 1.25rem", fontSize: "0.95rem", marginLeft: "auto" }}
                >
                  Lanjut
                </button>
              ) : (
                <button
                  type="submit"
                  className={styles.quickActionBtn}
                  style={{ justifyContent: "center", padding: "0.75rem 1.25rem", fontSize: "0.95rem", marginLeft: "auto" }}
                >
                  Simpan Register PT
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Main Table Card */}
      <div className={styles.cardSection}>
        <div className={styles.cardHeader} style={{ flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className={styles.cardTitle}>Daftar PT Terdaftar</h2>
            <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginTop: "0.25rem" }}>
              Total baris terdaftar (termasuk baris NIHIL bulanan): {ptRows.length} baris.
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Cari PT..."
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
              title="Unduh Daftar PT format PDF"
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
              title="Unduh Daftar PT format Excel"
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

        {/* PT Register Table */}
        <div className={styles.tableContainer} style={{ marginTop: "1rem" }}>
          <table className={styles.projectTable} style={{ borderCollapse: "collapse", minWidth: "1400px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", width: "60px", textAlign: "center" }}>NO. URUT</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "140px", textAlign: "left" }}>NO. REG</th>
                <th colSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", textAlign: "center" }}>AKTA</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "200px", textAlign: "left" }}>NAMA PT</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "180px", textAlign: "left" }}>PENDIRI</th>
                <th rowSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "200px", textAlign: "left" }}>ALAMAT PT</th>
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
              {pts.length === 0 ? (
                  <tr className={styles.guestRow}>
                    <td colSpan={10} style={{ textAlign: "center", color: "#64748b", padding: "2rem", fontWeight: "600" }}>
                      belum ada data
                    </td>
                  </tr>
                ) : ptRows.map((row, index) => {
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
                            const p = row.pt!;
                            setEditingNihilId(p.id);
                            if (p.date) {
                              const parts = p.date.split("-");
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
                          onClick={() => handleDeletePt(row.pt!.id)}
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

                const p = row.pt!;
                return (
                  <tr
                    key={p.id}
                    className={styles.guestRow}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedPtDetail(p);
                      setModalTab(1);
                      setShowDetailModal(true);
                    }}
                    title="Klik untuk melihat detail lengkap PT"
                  >
                    <td style={{ textAlign: "center", border: "1px solid #e2e8f0", fontWeight: "700", color: "#0f172a", padding: "12px 10px" }}>
                      {index + 1}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "700", padding: "12px 10px" }}>
                      {p.regNumber}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      {formatIndonesianDate(p.date)}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "600", padding: "12px 10px" }}>
                      {p.deedNumber}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "700", padding: "12px 10px" }}>
                      {p.ptName}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "600", padding: "12px 10px" }}>
                      {p.founders}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px" }}>
                      {p.ptAddress}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", fontWeight: "600" }}>
                      {p.legalization}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px" }}>
                      {p.description}
                    </td>
                    <td style={{ textAlign: "center", border: "1px solid #e2e8f0", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      <button 
                        className={styles.deleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePt(p.id);
                        }}
                        title="Hapus PT"
                        aria-label="Hapus PT"
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
              {ptRows.length === 0 && (
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

      {/* Detail PT Modal */}
      {showDetailModal && selectedPtDetail && (
        <>
          <style>{`
            @keyframes fadeInModal {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUpModal {
              from { transform: translateY(30px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
              padding: "1.5rem",
              animation: "fadeInModal 0.2s ease-out"
            }}
            onClick={() => setShowDetailModal(false)}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "1rem",
                width: "100%",
                maxWidth: "900px",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                overflow: "hidden",
                animation: "slideUpModal 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "1.5rem 2rem",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "linear-gradient(to right, #f8fafc, #ffffff)"
                }}
              >
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--primary-green)", letterSpacing: "1px" }}>
                    Detail Register PT
                  </span>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#0f172a", margin: "0.25rem 0 0 0" }}>
                    {selectedPtDetail.ptName}
                  </h2>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    border: "none",
                    background: "#f1f5f9",
                    color: "#64748b",
                    width: "2.25rem",
                    height: "2.25rem",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#e2e8f0";
                    e.currentTarget.style.color = "#0f172a";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                    e.currentTarget.style.color = "#64748b";
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Tabs Navigation */}
              <div
                style={{
                  display: "flex",
                  backgroundColor: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  padding: "0 1rem"
                }}
              >
                {[
                  { id: 1, label: "Penghadap & Para Pihak" },
                  { id: 2, label: "Struktur Usaha & Pasal" },
                  { id: 3, label: "Permodalan & Saham" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setModalTab(tab.id)}
                    style={{
                      padding: "1rem 1.5rem",
                      border: "none",
                      background: "none",
                      fontWeight: "700",
                      fontSize: "0.9rem",
                      color: modalTab === tab.id ? "var(--primary-green)" : "#64748b",
                      borderBottom: modalTab === tab.id ? "3px solid var(--primary-green)" : "3px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      marginBottom: "-1px"
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Content Scroll Area */}
              <div style={{ padding: "2rem", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                {/* TAB 1: PENGHADAP & PARA PIHAK */}
                {modalTab === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.85rem", borderBottom: "2px solid #f1f5f9", paddingBottom: "0.5rem" }}>
                        Penghadap Utama
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Nama Lengkap</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{selectedPtDetail.attendantName || "-"}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>NIK</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{selectedPtDetail.attendantNik || "-"}</strong>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Jabatan</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{selectedPtDetail.attendantPosition || "-"}</strong>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Status Kehadiran</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{selectedPtDetail.attendantStatus || "-"}</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.85rem", borderBottom: "2px solid #f1f5f9", paddingBottom: "0.5rem" }}>
                        Para Pihak Tambahan
                      </h3>
                      {!selectedPtDetail.otherParties || selectedPtDetail.otherParties.length === 0 ? (
                        <p style={{ fontSize: "0.875rem", color: "#64748b", fontStyle: "italic", margin: 0 }}>Tidak ada pihak tambahan yang didaftarkan.</p>
                      ) : (
                        <div className={styles.tableContainer} style={{ border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                            <thead>
                              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                <th style={{ padding: "10px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Nama Pihak</th>
                                <th style={{ padding: "10px", textAlign: "left", fontWeight: "600", color: "#475569" }}>NIK</th>
                                <th style={{ padding: "10px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Jabatan</th>
                                <th style={{ padding: "10px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Status Kehadiran</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPtDetail.otherParties.map((party, idx) => (
                                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                  <td style={{ padding: "10px", fontWeight: "700", color: "#0f172a" }}>{party.name}</td>
                                  <td style={{ padding: "10px", color: "#475569" }}>{party.nik}</td>
                                  <td style={{ padding: "10px", fontWeight: "600", color: "#0f172a" }}>{party.position}</td>
                                  <td style={{ padding: "10px", color: "#475569" }}>{party.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: STRUKTUR USAHA & PASAL */}
                {modalTab === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.85rem", borderBottom: "2px solid #f1f5f9", paddingBottom: "0.5rem" }}>
                        Informasi Akta & Perusahaan
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Nama PT</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{selectedPtDetail.ptName}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Domisili Kedudukan</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{selectedPtDetail.ptAddress}</strong>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>KBLI / Kegiatan Usaha</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{selectedPtDetail.kbli || "-"}</strong>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Tanggal Pembuatan Akta</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{formatIndonesianDate(selectedPtDetail.date)}</strong>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Nomor Registrasi Buku</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{selectedPtDetail.regNumber}</strong>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Nomor Akta</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{selectedPtDetail.deedNumber}</strong>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Pengesahan Kemenkumham (SK)</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{selectedPtDetail.legalization}</strong>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Keterangan</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{selectedPtDetail.description}</strong>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Masa Jabatan Direksi</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{selectedPtDetail.directorsTenure || "-"}</strong>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Tahun Buku</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{selectedPtDetail.financialYear || "-"}</strong>
                        </div>

                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.85rem", borderBottom: "2px solid #f1f5f9", paddingBottom: "0.5rem" }}>
                        Draf Anggaran Dasar (Pasal 1 s.d 4)
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {[
                          { num: 1, label: "Pasal 1: Nama & Tempat Kedudukan", text: selectedPtDetail.article1 },
                          { num: 2, label: "Pasal 2: Jangka Waktu Berdirinya Perseroan", text: selectedPtDetail.article2 },
                          { num: 3, label: "Pasal 3: Maksud & Tujuan serta Kegiatan Usaha", text: selectedPtDetail.article3 },
                          { num: 4, label: "Pasal 4: Modal", text: selectedPtDetail.article4 }
                        ].map(pasal => (
                          <div key={pasal.num} style={{ border: "1px solid #e2e8f0", borderRadius: "0.5rem", overflow: "hidden" }}>
                            <div style={{ backgroundColor: "#f8fafc", padding: "0.5rem 1rem", borderBottom: "1px solid #e2e8f0", fontWeight: "700", fontSize: "0.85rem", color: "#334155" }}>
                              {pasal.label}
                            </div>
                            <div style={{
                              padding: "1rem",
                              fontSize: "0.85rem",
                              fontFamily: "monospace",
                              lineHeight: "1.6",
                              color: "#1e293b",
                              backgroundColor: "#ffffff",
                              whiteSpace: "pre-wrap"
                            }}>
                              {pasal.text || `Belum ada draf pasal untuk PT ini.`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: PERMODALAN & PEMEGANG SAHAM */}
                {modalTab === 3 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.85rem", borderBottom: "2px solid #f1f5f9", paddingBottom: "0.5rem" }}>
                        Struktur Permodalan
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Modal Dasar</span>
                          <strong style={{ fontSize: "1.1rem", color: "var(--primary-green)" }}>
                            Rp {selectedPtDetail.modalDasar ? selectedPtDetail.modalDasar.toLocaleString("id-ID") : "0"}
                          </strong>
                          {selectedPtDetail.modalDasar && (
                            <span style={{ fontSize: "0.75rem", color: "#64748b", fontStyle: "italic", display: "block" }}>
                              ({terbilang(selectedPtDetail.modalDasar)} Rupiah)
                            </span>
                          )}
                        </div>
                        <div>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Modal Disetor / Ditempatkan</span>
                          <strong style={{ fontSize: "1.1rem", color: "var(--primary-green)" }}>
                            Rp {selectedPtDetail.modalDisetor ? selectedPtDetail.modalDisetor.toLocaleString("id-ID") : "0"}
                          </strong>
                          {selectedPtDetail.modalDisetor && (
                            <span style={{ fontSize: "0.75rem", color: "#64748b", fontStyle: "italic", display: "block" }}>
                              ({terbilang(selectedPtDetail.modalDisetor)} Rupiah)
                            </span>
                          )}
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Total Lembar Saham</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                            {selectedPtDetail.totalShares ? selectedPtDetail.totalShares.toLocaleString("id-ID") : "0"} lembar
                          </strong>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Nilai Nominal Per Saham</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                            Rp {selectedPtDetail.nominalValue ? selectedPtDetail.nominalValue.toLocaleString("id-ID") : "0"}
                          </strong>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Komposisi Saham</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                            {selectedPtDetail.shareComposition || "-"}
                          </strong>
                        </div>

                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.85rem", borderBottom: "2px solid #f1f5f9", paddingBottom: "0.5rem" }}>
                        Alokasi Pemegang Saham & Jabatan Akta
                      </h3>
                      {!selectedPtDetail.shareholdersList || selectedPtDetail.shareholdersList.length === 0 ? (
                        <p style={{ fontSize: "0.875rem", color: "#64748b", fontStyle: "italic", margin: 0 }}>belum ada data pembagian saham terperinci.</p>
                      ) : (
                        <div className={styles.tableContainer} style={{ border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                            <thead>
                              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                <th style={{ padding: "10px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Nama Pemegang Saham</th>
                                <th style={{ padding: "10px", textAlign: "left", fontWeight: "600", color: "#475569" }}>NIK</th>
                                <th style={{ padding: "10px", textAlign: "right", fontWeight: "600", color: "#475569" }}>Jumlah Lembar</th>
                                <th style={{ padding: "10px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Jabatan Akta</th>
                                <th style={{ padding: "10px", textAlign: "right", fontWeight: "600", color: "#475569" }}>Persentase (%)</th>
                                <th style={{ padding: "10px", textAlign: "right", fontWeight: "600", color: "#475569" }}>Total Nominal (Rp)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPtDetail.shareholdersList.map((sh, idx) => {
                                const pct = selectedPtDetail.totalShares && selectedPtDetail.totalShares > 0
                                  ? ((sh.sharesCount / selectedPtDetail.totalShares) * 100).toFixed(1)
                                  : "0.0";
                                const value = sh.sharesCount * (selectedPtDetail.nominalValue || 0);
                                return (
                                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "10px", fontWeight: "700", color: "#0f172a" }}>{sh.name}</td>
                                    <td style={{ padding: "10px", color: "#475569" }}>{sh.nik}</td>
                                    <td style={{ padding: "10px", textAlign: "right", fontWeight: "600" }}>{sh.sharesCount.toLocaleString("id-ID")} lbr</td>
                                    <td style={{ padding: "10px", fontWeight: "600", color: "#0f172a" }}>{sh.position}</td>
                                    <td style={{ padding: "10px", textAlign: "right", fontWeight: "700", color: "var(--primary-green)" }}>{pct}%</td>
                                    <td style={{ padding: "10px", textAlign: "right", fontWeight: "700", color: "#0f172a" }}>Rp {value.toLocaleString("id-ID")}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: "1rem 2rem",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "flex-end",
                  background: "#f8fafc"
                }}
              >
                <button
                  onClick={() => setShowDetailModal(false)}
                  className={styles.quickActionBtn}
                  style={{ padding: "0.625rem 1.25rem", fontSize: "0.9rem", backgroundColor: "#64748b" }}
                >
                  Tutup Detail
                </button>
              </div>
            </div>
          </div>
        </>
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
              {editingNihilId ? "Edit Registrasi NIHIL" : "Registrasi NIHIL Bulanan"}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 1.25rem 0" }}>
              {editingNihilId ? "Ubah bulan kosong (tidak ada akta PT) secara resmi." : "Catat bulan kosong (tidak ada akta PT) secara resmi untuk laporan bulanan."}
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

