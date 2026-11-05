"use client";

import React, { useState, useEffect } from "react";
import { childAdoptionService } from "@/lib/services/supabaseService";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import styles from "../dashboard.module.css";

export interface AdoptionDocument {
  id: string;
  name: string;
  checked: boolean;
  fileName?: string;
  fileData?: string; // base64 representation of local scan file
}

export interface AdoptionTimeline {
  id: string;
  date: string;
  action: string;
}

export interface ChildAdoptionEntry {
  isNihil?: boolean;
  id: string;
  entryDate: string;             // Tanggal Masuk (YYYY-MM-DD)
  deedNumber: string;            // No. Akta / Penetapan
  childName: string;             // Nama Anak
  childBirthInfo: string;        // TTL / Usia Anak
  
  // Biological Parents
  bioParents: string;            // Nama Orang Tua Kandung
  bioParentsNik: string;         // NIK Orang Tua Kandung
  bioParentsJob: string;         // Pekerjaan Orang Tua Kandung
  bioParentsAddress: string;     // Alamat Orang Tua Kandung

  // Adoptive Parents
  adoptiveParents: string;       // Nama Orang Tua Angkat
  adoptiveParentsNik: string;    // NIK Orang Tua Angkat
  adoptiveParentsJob: string;    // Pekerjaan Orang Tua Angkat
  adoptiveParentsAddress: string;// Alamat Orang Tua Angkat

  contact: string;               // No. HP / Kontak
  description: string;           // Keterangan

  // Progress & Status
  status: "Selesai" | "Dalam Proses" | "Tertunda";
  progress: number;              // progress percentage, e.g., 50
  
  // Checklist documents & scanned files
  documents: AdoptionDocument[];
  timeline: AdoptionTimeline[];
}

interface ChildAdoptionRow {
  isNihil: boolean;
  dateLabel: string;
  entry?: ChildAdoptionEntry;
  serialNum?: number;
}

const DEFAULT_DOCUMENTS = [
  { id: "doc-1", name: "Akta Kelahiran Anak", checked: true },
  { id: "doc-2", name: "Surat Rekomendasi Dinas Sosial", checked: true },
  { id: "doc-3", name: "SKCK Orang Tua Angkat", checked: false },
  { id: "doc-4", name: "Surat Keterangan Sehat Fisik & Jiwa", checked: false },
  { id: "doc-5", name: "Akta Pernikahan Orang Tua Angkat", checked: true },
  { id: "doc-6", name: "KTP & KK Orang Tua Kandung", checked: false },
  { id: "doc-7", name: "KTP & KK Orang Tua Angkat", checked: true },
  { id: "doc-8", name: "Surat Keikhlasan Penyerahan Anak", checked: false }
];

export default function ChildAdoptionListTab() {
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

  // Initial Simulated Database for Child Adoption Registry
  
  const [entries, setEntries] = useState<ChildAdoptionEntry[]>([]);

  // View states
  const [selectedEntry, setSelectedEntry] = useState<ChildAdoptionEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState("");

  // Input states for form
  const [entryDate, setEntryDate] = useState("");
  const [deedNumber, setDeedNumber] = useState("");
  const [childName, setChildName] = useState("");
  const [childBirthInfo, setChildBirthInfo] = useState("");
  
  const [bioParents, setBioParents] = useState("");
  const [bioParentsNik, setBioParentsNik] = useState("");
  const [bioParentsJob, setBioParentsJob] = useState("");
  const [bioParentsAddress, setBioParentsAddress] = useState("");

  const [adoptiveParents, setAdoptiveParents] = useState("");
  const [adoptiveParentsNik, setAdoptiveParentsNik] = useState("");
  const [adoptiveParentsJob, setAdoptiveParentsJob] = useState("");
  const [adoptiveParentsAddress, setAdoptiveParentsAddress] = useState("");

  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Selesai" | "Dalam Proses" | "Tertunda">("Dalam Proses");

  // Restore draft form values from localStorage on mount (hydration-safe)
  useEffect(() => {
    const savedDraft = localStorage.getItem("draft_child_adoption_form");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.showForm !== undefined) setShowForm(draft.showForm);
        if (draft.editMode !== undefined) setEditMode(draft.editMode);
        if (draft.currentEntryId !== undefined) setCurrentEntryId(draft.currentEntryId);
        if (draft.entryDate !== undefined) setEntryDate(draft.entryDate);
        if (draft.deedNumber !== undefined) setDeedNumber(draft.deedNumber);
        if (draft.childName !== undefined) setChildName(draft.childName);
        if (draft.childBirthInfo !== undefined) setChildBirthInfo(draft.childBirthInfo);
        if (draft.bioParents !== undefined) setBioParents(draft.bioParents);
        if (draft.bioParentsNik !== undefined) setBioParentsNik(draft.bioParentsNik);
        if (draft.bioParentsJob !== undefined) setBioParentsJob(draft.bioParentsJob);
        if (draft.bioParentsAddress !== undefined) setBioParentsAddress(draft.bioParentsAddress);
        if (draft.adoptiveParents !== undefined) setAdoptiveParents(draft.adoptiveParents);
        if (draft.adoptiveParentsNik !== undefined) setAdoptiveParentsNik(draft.adoptiveParentsNik);
        if (draft.adoptiveParentsJob !== undefined) setAdoptiveParentsJob(draft.adoptiveParentsJob);
        if (draft.adoptiveParentsAddress !== undefined) setAdoptiveParentsAddress(draft.adoptiveParentsAddress);
        if (draft.contact !== undefined) setContact(draft.contact);
        if (draft.description !== undefined) setDescription(draft.description);
        if (draft.status !== undefined) setStatus(draft.status);
      } catch (e) {
        console.error("Gagal memuat draf pendaftaran Pengangkatan Anak:", e);
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
        entryDate,
        deedNumber,
        childName,
        childBirthInfo,
        bioParents,
        bioParentsNik,
        bioParentsJob,
        bioParentsAddress,
        adoptiveParents,
        adoptiveParentsNik,
        adoptiveParentsJob,
        adoptiveParentsAddress,
        contact,
        description,
        status
      };
      localStorage.setItem("draft_child_adoption_form", JSON.stringify(draft));
    } else {
      localStorage.removeItem("draft_child_adoption_form");
    }
  }, [
    showForm, editMode, currentEntryId, entryDate, deedNumber, childName, childBirthInfo,
    bioParents, bioParentsNik, bioParentsJob, bioParentsAddress, adoptiveParents,
    adoptiveParentsNik, adoptiveParentsJob, adoptiveParentsAddress, contact, description, status
  ]);

  // Input states for timeline log in detail view
  const [newTimelineDate, setNewTimelineDate] = useState("");
  const [newTimelineAction, setNewTimelineAction] = useState("");

  const resetForm = () => {
    setEntryDate("");
    setDeedNumber("");
    setChildName("");
    setChildBirthInfo("");
    setBioParents("");
    setBioParentsNik("");
    setBioParentsJob("");
    setBioParentsAddress("");
    setAdoptiveParents("");
    setAdoptiveParentsNik("");
    setAdoptiveParentsJob("");
    setAdoptiveParentsAddress("");
    setContact("");
    setDescription("");
    setStatus("Dalam Proses");
    setEditMode(false);
    setCurrentEntryId("");
    setShowForm(false);
  };

  const handleOpenAddForm = () => {
    resetForm();
    const today = new Date().toISOString().split("T")[0];
    setEntryDate(today);
    setShowForm(true);
  };

  const handleEdit = (entry: ChildAdoptionEntry) => {
    setCurrentEntryId(entry.id);
    setEntryDate(entry.entryDate);
    setDeedNumber(entry.deedNumber);
    setChildName(entry.childName);
    setChildBirthInfo(entry.childBirthInfo);
    
    setBioParents(entry.bioParents);
    setBioParentsNik(entry.bioParentsNik);
    setBioParentsJob(entry.bioParentsJob || "");
    setBioParentsAddress(entry.bioParentsAddress || "");

    setAdoptiveParents(entry.adoptiveParents);
    setAdoptiveParentsNik(entry.adoptiveParentsNik);
    setAdoptiveParentsJob(entry.adoptiveParentsJob || "");
    setAdoptiveParentsAddress(entry.adoptiveParentsAddress || "");

    setContact(entry.contact);
    setDescription(entry.description);
    setStatus(entry.status);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus catatan pengangkatan anak ini?")) {
      const success = await childAdoptionService.delete(id);
      if (success) {
        setEntries(entries.filter(e => e.id !== id));
        if (selectedEntry?.id === id) {
          setSelectedEntry(null);
        }
      } else {
        alert("Gagal menghapus data dari database.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!childName || !adoptiveParents || !bioParents) {
      alert("Nama anak, orang tua kandung, dan orang tua angkat wajib diisi!");
      return;
    }

    if (editMode) {
      const updatedEntry = {
        entryDate,
        deedNumber,
        childName,
        childBirthInfo,
        bioParents,
        bioParentsNik,
        bioParentsJob,
        bioParentsAddress,
        adoptiveParents,
        adoptiveParentsNik,
        adoptiveParentsJob,
        adoptiveParentsAddress,
        contact,
        description,
        status
      };
      const success = await childAdoptionService.update(currentEntryId, updatedEntry);
      if (success) {
        setEntries(
          entries.map(item =>
            item.id === currentEntryId
              ? { ...item, ...updatedEntry }
              : item
          )
        );
        // Update selected entry too if currently open
        if (selectedEntry?.id === currentEntryId) {
          setSelectedEntry({
            ...selectedEntry,
            ...updatedEntry
          });
        }
        alert("Data pengangkatan anak berhasil diperbarui!");
      } else {
        alert("Gagal memperbarui data di database.");
      }
    } else {
      const newEntry: ChildAdoptionEntry = {
        id: `CA-${Date.now()}`,
        entryDate,
        deedNumber,
        childName,
        childBirthInfo,
        bioParents,
        bioParentsNik,
        bioParentsJob,
        bioParentsAddress,
        adoptiveParents,
        adoptiveParentsNik,
        adoptiveParentsJob,
        adoptiveParentsAddress,
        contact,
        description,
        status,
        progress: 50, // default documents 4/8 checked
        documents: DEFAULT_DOCUMENTS.map(d => ({ ...d })),
        timeline: [
          { id: `t-${Date.now()}`, date: entryDate, action: "Berkas masuk & registrasi pengangkatan anak" }
        ]
      };
      const success = await childAdoptionService.create(newEntry);
      if (success) {
        setEntries([newEntry, ...entries]);
        alert("Data pengangkatan anak baru berhasil disimpan!");
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
    
    const today = new Date();
    const endY = today.getFullYear();
    const endM = today.getMonth() + 1;

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
  const getRows = (): ChildAdoptionRow[] => {
    const rows: ChildAdoptionRow[] = [];
    let serialCounter = 1;

    const months = getMonthsRange().filter(m => {
      const matchesMonth = filterMonth === "" || m.monthStr === filterMonth;
      const matchesYear = filterYear === "" || String(m.year) === filterYear;
      return matchesMonth && matchesYear;
    });

    months.forEach((m) => {
      const listInMonth = entries.filter(e => {
        let dateYear = "";
        let dateMonthVal = -1;
        
        if (e.entryDate && e.entryDate.includes("-")) {
          const parts = e.entryDate.split("-");
          if (parts.length === 3) {
            dateYear = parts[0];
            dateMonthVal = parseInt(parts[1], 10);
          }
        }
        return String(m.year) === dateYear && dateMonthVal === m.month;
      });

      const filteredList = listInMonth.filter(e => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
          e.childName.toLowerCase().includes(query) ||
          e.deedNumber.toLowerCase().includes(query) ||
          e.bioParents.toLowerCase().includes(query) ||
          e.adoptiveParents.toLowerCase().includes(query) ||
          e.contact.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query)
        );
      });

      const sorted = [...filteredList].sort((a, b) => a.entryDate.localeCompare(b.entryDate));
        sorted.forEach((entry) => {
          rows.push({
            isNihil: entry.isNihil || false,
            dateLabel: m.label,
            entry,
            serialNum: entry.isNihil ? undefined : serialCounter++
        });
      });
    });
    return rows;
  };

  const rows = getRows();

  // Helper for Indonesian Date Format
    const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("child_adoptions_data");
    let fallbackData: ChildAdoptionEntry[] = [];
    if (saved) {
      try {
        fallbackData = JSON.parse(saved);
      } catch (e) {}
    }
    childAdoptionService.getAll(fallbackData).then((data) => {
      if (data && data.length > 0) {
        setEntries(data);
      } else {
        setEntries(fallbackData);
      }
    });
    setIsHydrated(true);
  }, []);

  useRealtimeSync("child_adoptions", () => {
    childAdoptionService.getAll().then((data) => {
      if (data && data.length > 0) setEntries(data);
    });
  });

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("child_adoptions_data", JSON.stringify(entries));
    }
  }, [entries, isHydrated]);

  const handleSaveNihil = async (e: React.FormEvent) => {
    e.preventDefault();
    const month = nihilMonth;
    const year = nihilYear;
    const newNihil: ChildAdoptionEntry = {
        id: `CA-NIHIL-${Date.now()}`,
        entryDate: `${year}-${month}-01`,
        deedNumber: "---",
        childName: "N I H I L",
        childBirthInfo: "---",
        bioParents: "---",
        bioParentsNik: "---",
        bioParentsJob: "---",
        bioParentsAddress: "---",
        adoptiveParents: "---",
        adoptiveParentsNik: "---",
        adoptiveParentsJob: "---",
        adoptiveParentsAddress: "---",
        contact: "---",
        description: "---",
        status: "Selesai",
        progress: 100,
        documents: [],
        timeline: []
      };
    
    const success = await childAdoptionService.create(newNihil);
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

  // Toggle checklist document status
  const handleToggleDoc = (docId: string) => {
    if (!selectedEntry) return;

    const updatedDocs = selectedEntry.documents.map(doc =>
      doc.id === docId ? { ...doc, checked: !doc.checked } : doc
    );

    // Recalculate progress percentage
    const checkedCount = updatedDocs.filter(d => d.checked).length;
    const progressPercent = Math.round((checkedCount / updatedDocs.length) * 100);

    const updatedEntry: ChildAdoptionEntry = {
      ...selectedEntry,
      documents: updatedDocs,
      progress: progressPercent
    };

    // Update state database
    setEntries(entries.map(e => e.id === selectedEntry.id ? updatedEntry : e));
    setSelectedEntry(updatedEntry);
  };

  // Handle local file scan uploader
  const handleUploadScan = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    if (!selectedEntry || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      const updatedDocs = selectedEntry.documents.map(doc =>
        doc.id === docId ? { ...doc, fileName: file.name, fileData: base64Data } : doc
      );

      const updatedEntry = { ...selectedEntry, documents: updatedDocs };
      setEntries(entries.map(e => e.id === selectedEntry.id ? updatedEntry : e));
      setSelectedEntry(updatedEntry);
      alert(`Berhasil mengunggah berkas scan: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Handle download of uploaded file or simulated text file
  const handleDownloadScan = (doc: AdoptionDocument) => {
    const link = document.createElement("a");
    if (doc.fileData) {
      link.href = doc.fileData;
      link.download = doc.fileName || `${doc.name}.pdf`;
    } else {
      // Create simulated PDF download
      const mockText = `SCAN DOKUMEN RESMI KANTOR NOTARIS & PPAT\n\nJenis Berkas: ${doc.name}\nKlien: ${selectedEntry?.childName || "Umum"}\nTanggal Unduh: ${new Date().toLocaleDateString()}\nStatus: VALID & TERVERIFIKASI`;
      const blob = new Blob([mockText], { type: "text/plain" });
      link.href = URL.createObjectURL(blob);
      link.download = `Scan_${doc.name.replace(/\s+/g, "_")}.txt`;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add timeline history record
  const handleAddTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry || !newTimelineAction || !newTimelineDate) {
      alert("Pilih tanggal dan isi detail aktivitas!");
      return;
    }

    const newLog = {
      id: `t-${Date.now()}`,
      date: newTimelineDate,
      action: newTimelineAction
    };

    const updatedTimeline = [...selectedEntry.timeline, newLog].sort((a, b) => a.date.localeCompare(b.date));
    const updatedEntry = { ...selectedEntry, timeline: updatedTimeline };

    setEntries(entries.map(e => e.id === selectedEntry.id ? updatedEntry : e));
    setSelectedEntry(updatedEntry);

    setNewTimelineDate("");
    setNewTimelineAction("");
  };

  // Delete timeline item
  const handleDeleteTimeline = (logId: string) => {
    if (!selectedEntry) return;

    const updatedTimeline = selectedEntry.timeline.filter(t => t.id !== logId);
    const updatedEntry = { ...selectedEntry, timeline: updatedTimeline };

    setEntries(entries.map(e => e.id === selectedEntry.id ? updatedEntry : e));
    setSelectedEntry(updatedEntry);
  };

  // PDF Export
  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const title = `Buku Daftar Pengangkatan Anak - ${filterMonth ? indonesianMonths[parseInt(filterMonth) - 1] : "Semua Bulan"} ${filterYear || "Semua Tahun"}`;
    
    let rowsHtml = "";
    rows.forEach((row, index) => {
        if (row.isNihil) {
          rowsHtml += `
            <tr style="background-color: #fafafa; text-align: center;">
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #ef4444; font-weight: bold; text-align: left; white-space: nowrap;">${row.dateLabel}</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #ef4444; font-weight: bold; letter-spacing: 2px;">N I H I L</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">--------------------</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
            </tr>
          `;
        } else {
          const e = row.entry!;
          rowsHtml += `
            <tr>
              <td style="text-align: center; font-weight: bold; border: 1px solid #ddd; padding: 8px;">${row.serialNum || '---'}</td>
              <td style="border: 1px solid #ddd; padding: 8px; white-space: nowrap;">${formatIndonesianDate(e.entryDate)}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${e.deedNumber}</td>
              <td style="border: 1px solid #ddd; padding: 8px;"><strong>${e.childName}</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px;">${e.bioParents}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${e.adoptiveParents}</td>
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
                ${["No. Urut","Tanggal Masuk","No. Akta / Penetapan","Nama Anak","Orang Tua Kandung","Orang Tua Angkat"].map(h => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-weight: bold;">${h}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="6" style="text-align: center; padding: 8px; font-style: italic; color: #94a3b8;">belum ada data</td></tr>`}
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
          ${["No. Urut","Tanggal Masuk","No. Akta / Penetapan","Nama Anak","Orang Tua Kandung","Orang Tua Angkat"].map(h => `<th style="background-color: #f2f2f2; font-weight: bold; border: 0.5pt solid #000000;">${h}</th>`).join("")}
        </tr>
      </thead>
      <tbody>`;

    rows.forEach((row, index) => {
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
          const e = row.entry!;
          tableHtml += `
            <tr>
              <td>${row.serialNum || '---'}</td>
              <td>${formatIndonesianDate(e.entryDate)}</td>
              <td>${e.deedNumber}</td>
              <td><strong>${e.childName}</strong></td>
              <td>${e.bioParents}</td>
              <td>${e.adoptiveParents}</td>
            </tr>
          `;
        }
      });

    if (!rows.length) {
      tableHtml += `<tr><td colspan="5" style="text-align: center; font-style: italic; color: #94a3b8;">belum ada data</td></tr>`;
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
    a.download = "ChildAdoption.xls";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Header section */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Buku Daftar Pengangkatan Anak</h1>
        <p className={styles.welcomeSubtitle}>
          Dokumentasi data berkas, akta, penetapan pengadilan, dan rincian identitas anak serta orang tua.
        </p>
      </div>

      {/* Detail View Panel */}
      {selectedEntry && (
        <div className={styles.cardSection} style={{ marginBottom: "1.5rem", border: "2px solid #2563eb", animation: "fadeIn 0.2s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <button 
                onClick={() => setSelectedEntry(null)} 
                style={{ 
                  border: "none", 
                  backgroundColor: "transparent", 
                  color: "#2563eb", 
                  fontWeight: "700", 
                  fontSize: "0.9rem", 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.25rem",
                  marginBottom: "0.5rem"
                }}
              >
                ← Kembali ke Daftar Pengangkatan
              </button>
              <h2 className={styles.cardTitle} style={{ fontSize: "1.6rem", color: "#1e3a8a" }}>
                Rincian Detail: {selectedEntry.childName}
              </h2>
            </div>
            
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button 
                onClick={() => handleEdit(selectedEntry)}
                className={styles.quickActionBtn}
                style={{ backgroundColor: "#0284c7" }}
              >
                Edit Berkas Utama
              </button>
              <button 
                onClick={() => setSelectedEntry(null)}
                style={{ padding: "0.55rem 1.25rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", fontSize: "0.85rem", backgroundColor: "#f1f5f9", cursor: "pointer", fontWeight: "700", color: "#475569" }}
              >
                Tutup Detail
              </button>
            </div>
          </div>

          {/* Grid Layout for details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            
            {/* Left Card: Parent Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              {/* Biological parents (Orang tua kandung) details */}
              <div style={{ padding: "1.25rem", backgroundColor: "#f8fafc", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
                <h4 style={{ fontSize: "1rem", color: "#1e3a8a", fontWeight: "800", borderBottom: "2px solid #cbd5e1", paddingBottom: "0.3rem", marginBottom: "0.75rem" }}>
                  IDENTITAS ORANG TUA KANDUNG
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                  <div><strong style={{ color: "#475569" }}>Nama Lengkap:</strong> <span style={{ color: "#0f172a", fontWeight: "600" }}>{selectedEntry.bioParents}</span></div>
                  <div><strong style={{ color: "#475569" }}>NIK:</strong> <span style={{ color: "#0f172a" }}>{selectedEntry.bioParentsNik || "-"}</span></div>
                  <div><strong style={{ color: "#475569" }}>Pekerjaan:</strong> <span style={{ color: "#0f172a" }}>{selectedEntry.bioParentsJob || "-"}</span></div>
                  <div><strong style={{ color: "#475569" }}>Alamat Lengkap:</strong> <span style={{ color: "#0f172a", lineHeight: 1.4 }}>{selectedEntry.bioParentsAddress || "-"}</span></div>
                </div>
              </div>

              {/* Adoptive parents (Orang tua angkat) details */}
              <div style={{ padding: "1.25rem", backgroundColor: "#f0f9ff", borderRadius: "0.75rem", border: "1px solid #bae6fd" }}>
                <h4 style={{ fontSize: "1rem", color: "#0369a1", fontWeight: "800", borderBottom: "2px solid #93c5fd", paddingBottom: "0.3rem", marginBottom: "0.75rem" }}>
                  IDENTITAS ORANG TUA ANGKAT
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                  <div><strong style={{ color: "#475569" }}>Nama Lengkap:</strong> <span style={{ color: "#0f172a", fontWeight: "600" }}>{selectedEntry.adoptiveParents}</span></div>
                  <div><strong style={{ color: "#475569" }}>NIK:</strong> <span style={{ color: "#0f172a" }}>{selectedEntry.adoptiveParentsNik || "-"}</span></div>
                  <div><strong style={{ color: "#475569" }}>Pekerjaan:</strong> <span style={{ color: "#0f172a" }}>{selectedEntry.adoptiveParentsJob || "-"}</span></div>
                  <div><strong style={{ color: "#475569" }}>Alamat Lengkap:</strong> <span style={{ color: "#0f172a", lineHeight: 1.4 }}>{selectedEntry.adoptiveParentsAddress || "-"}</span></div>
                </div>
              </div>

              {/* General Metadata */}
              <div style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "0.75rem", border: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.85rem" }}>
                <div><strong>No. Akta / Penetapan:</strong> <br/>{selectedEntry.deedNumber || "-"}</div>
                <div><strong>No. HP / Kontak:</strong> <br/>{selectedEntry.contact || "-"}</div>
                <div><strong>Tanggal Masuk:</strong> <br/>{formatIndonesianDate(selectedEntry.entryDate)}</div>
                <div><strong>Keterangan:</strong> <br/>{selectedEntry.description || "-"}</div>
              </div>

            </div>

            {/* Right Card: Checklist Documents & Scanned Files */}
            <div style={{ padding: "1.25rem", backgroundColor: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              {/* Document Progress Header */}
              <div>
                <h4 style={{ fontSize: "1rem", color: "#1e293b", fontWeight: "800", marginBottom: "0.5rem" }}>
                  CHECKLIST DOKUMEN PERSYARATAN & SCAN BERKAS
                </h4>
                <div className={styles.progressContainer} style={{ width: "100%", margin: "0.75rem 0" }}>
                  <div className={styles.progressBar} style={{ height: "12px", borderRadius: "6px" }}>
                    <div 
                      className={`${styles.progressFill} ${
                        selectedEntry.status === "Selesai" 
                          ? styles.progressFillGreen 
                          : selectedEntry.status === "Dalam Proses" 
                            ? styles.progressFillBlue 
                            : styles.progressFillOrange
                      }`}
                      style={{ width: `${selectedEntry.progress}%`, height: "100%", borderRadius: "6px" }}
                    ></div>
                  </div>
                  <span className={styles.progressText} style={{ fontSize: "0.9rem", fontWeight: "800" }}>{selectedEntry.progress}% Lengkap</span>
                </div>
              </div>

              {/* Checklist list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "380px", overflowY: "auto", paddingRight: "0.5rem" }}>
                {selectedEntry.documents.map((doc) => (
                  <div 
                    key={doc.id}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between", 
                      padding: "0.6rem 0.85rem", 
                      backgroundColor: doc.checked ? "#f0fdf4" : "#f8fafc", 
                      borderRadius: "0.5rem", 
                      border: doc.checked ? "1px solid #bbf7d0" : "1px solid #e2e8f0" 
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <input
                        type="checkbox"
                        checked={doc.checked}
                        onChange={() => handleToggleDoc(doc.id)}
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "0.85rem", fontWeight: "600", color: doc.checked ? "#15803d" : "#334155" }}>
                        {doc.name}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                      {/* Upload local scan */}
                      <label 
                        className={styles.quickActionBtn}
                        style={{ 
                          padding: "0.25rem 0.5rem", 
                          fontSize: "0.7rem", 
                          backgroundColor: "#475569", 
                          cursor: "pointer",
                          margin: 0,
                          textAlign: "center"
                        }}
                      >
                        Unggah Scan
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleUploadScan(e, doc.id)}
                          style={{ display: "none" }}
                        />
                      </label>

                      {/* Download Scan */}
                      <button
                        onClick={() => handleDownloadScan(doc)}
                        className={styles.quickActionBtn}
                        style={{ 
                          padding: "0.25rem 0.5rem", 
                          fontSize: "0.7rem", 
                          backgroundColor: doc.fileData ? "#16a34a" : "#0284c7"
                        }}
                        title={doc.fileName ? `Unduh berkas: ${doc.fileName}` : "Unduh berkas simulasi"}
                      >
                        {doc.fileData ? "Unduh Scan ✓" : "Unduh Scan"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Timeline History section inside detail view */}
          <div style={{ marginTop: "1.5rem", borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem" }}>
            <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1e3a8a", marginBottom: "1rem" }}>
              TIMELINE & RIWAYAT AKTIVITAS
            </h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
              
              {/* Form to add log */}
              <form onSubmit={handleAddTimeline} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
                <h5 style={{ margin: 0, fontWeight: "700", color: "#334155" }}>Tambah Log Riwayat</h5>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#475569" }}>Tanggal Aktivitas</label>
                  <input
                    type="date"
                    value={newTimelineDate}
                    onChange={(e) => setNewTimelineDate(e.target.value)}
                    required
                    style={{ padding: "0.45rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.85rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#475569" }}>Detail Kegiatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Sidang penetapan di PN Jakpus"
                    value={newTimelineAction}
                    onChange={(e) => setNewTimelineAction(e.target.value)}
                    required
                    style={{ padding: "0.45rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.85rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                  />
                </div>

                <button type="submit" className={styles.quickActionBtn} style={{ fontSize: "0.8rem", padding: "0.45rem", justifyContent: "center" }}>
                  + Simpan Log
                </button>
              </form>

              {/* Timeline display */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "250px", overflowY: "auto", paddingRight: "0.5rem" }}>
                {selectedEntry.timeline && selectedEntry.timeline.length > 0 ? (
                  selectedEntry.timeline.map((log) => (
                    <div 
                      key={log.id} 
                      style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        padding: "0.5rem 0.75rem", 
                        backgroundColor: "#ffffff", 
                        borderLeft: "4px solid #2563eb", 
                        borderRadius: "0 0.375rem 0.375rem 0", 
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)" 
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#2563eb", display: "block" }}>
                          {formatIndonesianDate(log.date)}
                        </span>
                        <span style={{ fontSize: "0.85rem", color: "#334155" }}>{log.action}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteTimeline(log.id)}
                        style={{ border: "none", background: "none", color: "#dc2626", fontWeight: "700", cursor: "pointer", fontSize: "0.75rem" }}
                      >
                        Hapus
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontStyle: "italic", fontSize: "0.85rem" }}>
                    Belum ada riwayat aktivitas untuk pengangkatan ini.
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Button to toggle add new Child Adoption form */}
      {!showForm && (
        <div style={{ display: "flex", justifyContent: "flex-start", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <button
            onClick={handleOpenAddForm}
            className={styles.quickActionBtn}
            style={{ padding: "0.75rem 1.25rem", fontSize: "0.95rem" }}
          >
            + Registrasi Pengangkatan Anak Baru
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
      )}

      {/* Adoption CRUD Form */}
      {showForm && (
        <div 
          className={styles.cardSection}
          style={{ 
            marginBottom: "1.5rem", 
            padding: "1.5rem", 
            backgroundColor: "#f8fafc", 
            borderRadius: "0.75rem", 
            border: "1px solid #e2e8f0" 
          }}
        >
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#1e3a8a" }}>
            {editMode ? "Edit Catatan Pengangkatan Anak" : "Pencatatan Baru Pengangkatan Anak"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
              
              {/* General Metadata */}
              <div style={{ gridColumn: "1 / -1", borderBottom: "1px dashed #cbd5e1", paddingBottom: "0.5rem" }}>
                <h4 style={{ fontSize: "0.9rem", color: "#2563eb", fontWeight: "700" }}>DATA ANAK & UMUM</h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>Tanggal Masuk</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  required
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>No. Akta / Penetapan</label>
                <input
                  type="text"
                  placeholder="Contoh: 12/Pdt.P/2026/PN.JKT"
                  value={deedNumber}
                  onChange={(e) => setDeedNumber(e.target.value)}
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>Nama Anak</label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap anak"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  required
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>TTL / Usia Anak</label>
                <input
                  type="text"
                  placeholder="Contoh: Jakarta, 12 Mei 2024 / 2 Tahun"
                  value={childBirthInfo}
                  onChange={(e) => setChildBirthInfo(e.target.value)}
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                />
              </div>

              {/* Bio Parents */}
              <div style={{ gridColumn: "1 / -1", borderBottom: "1px dashed #cbd5e1", paddingBottom: "0.5rem", marginTop: "0.5rem" }}>
                <h4 style={{ fontSize: "0.9rem", color: "#2563eb", fontWeight: "700" }}>DATA ORANG TUA KANDUNG</h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>Nama Orang Tua Kandung</label>
                <input
                  type="text"
                  placeholder="Contoh: Rahmat & Sri Wahyuni"
                  value={bioParents}
                  onChange={(e) => setBioParents(e.target.value)}
                  required
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>NIK Orang Tua Kandung</label>
                <input
                  type="text"
                  placeholder="Masukkan NIK 16 digit"
                  value={bioParentsNik}
                  onChange={(e) => setBioParentsNik(e.target.value)}
                  maxLength={16}
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>Pekerjaan Orang Tua Kandung</label>
                <input
                  type="text"
                  placeholder="Contoh: Buruh, Pedagang"
                  value={bioParentsJob}
                  onChange={(e) => setBioParentsJob(e.target.value)}
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>Alamat Lengkap Orang Tua Kandung</label>
                <input
                  type="text"
                  placeholder="Masukkan alamat kediaman ortu kandung"
                  value={bioParentsAddress}
                  onChange={(e) => setBioParentsAddress(e.target.value)}
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                />
              </div>

              {/* Adoptive Parents */}
              <div style={{ gridColumn: "1 / -1", borderBottom: "1px dashed #cbd5e1", paddingBottom: "0.5rem", marginTop: "0.5rem" }}>
                <h4 style={{ fontSize: "0.9rem", color: "#2563eb", fontWeight: "700" }}>DATA ORANG TUA ANGKAT</h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>Nama Orang Tua Angkat</label>
                <input
                  type="text"
                  placeholder="Contoh: Herman Wijaya & Shinta"
                  value={adoptiveParents}
                  onChange={(e) => setAdoptiveParents(e.target.value)}
                  required
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>NIK Orang Tua Angkat</label>
                <input
                  type="text"
                  placeholder="Masukkan NIK 16 digit"
                  value={adoptiveParentsNik}
                  onChange={(e) => setAdoptiveParentsNik(e.target.value)}
                  maxLength={16}
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>Pekerjaan Orang Tua Angkat</label>
                <input
                  type="text"
                  placeholder="Contoh: Pegawai, Guru"
                  value={adoptiveParentsJob}
                  onChange={(e) => setAdoptiveParentsJob(e.target.value)}
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>Alamat Lengkap Orang Tua Angkat</label>
                <input
                  type="text"
                  placeholder="Masukkan alamat kediaman ortu angkat"
                  value={adoptiveParentsAddress}
                  onChange={(e) => setAdoptiveParentsAddress(e.target.value)}
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                />
              </div>

              {/* General Metadata */}
              <div style={{ gridColumn: "1 / -1", borderBottom: "1px dashed #cbd5e1", paddingBottom: "0.5rem", marginTop: "0.5rem" }}>
                <h4 style={{ fontSize: "0.9rem", color: "#2563eb", fontWeight: "700" }}>KONTAK, STATUS & KETERANGAN</h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>No. HP / Kontak</label>
                <input
                  type="text"
                  placeholder="Contoh: 0812xxxxxxxx"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>Status Proses</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                >
                  <option value="Dalam Proses" style={{ color: "#0f172a" }}>Dalam Proses</option>
                  <option value="Selesai" style={{ color: "#0f172a" }}>Selesai</option>
                  <option value="Tertunda" style={{ color: "#0f172a" }}>Tertunda</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>Keterangan</label>
                <input
                  type="text"
                  placeholder="Catatan tambahan"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", backgroundColor: "#ffffff", color: "#0f172a" }}
                />
              </div>

            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit" className={styles.quickActionBtn}>
                {editMode ? "Simpan Perubahan" : "Simpan Berkas"}
              </button>
              <button type="button" onClick={resetForm} style={{ padding: "0.55rem 1.25rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", fontSize: "0.85rem", backgroundColor: "#f1f5f9", cursor: "pointer", fontWeight: "700", color: "#475569" }}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Table Card */}
      <div className={styles.cardSection}>
        <div className={styles.cardHeader} style={{ flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className={styles.cardTitle}>Daftar Pengangkatan Anak Terdaftar</h2>
            <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginTop: "0.25rem" }}>
              Total baris terdaftar (termasuk baris NIHIL bulanan): {rows.length} baris.
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Cari..."
              className={styles.inputField}
              style={{ padding: "0.375rem 0.75rem", fontSize: "0.85rem", width: "200px", color: "#0f172a", backgroundColor: "#ffffff" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={{ padding: "0.375rem 0.75rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.85rem", backgroundColor: "#ffffff", color: "#1e293b", fontWeight: "600" }}
            >
              <option value="">Semua Bulan</option>
              {indonesianMonths.map((m, idx) => (
                <option key={idx} value={String(idx + 1).padStart(2, "0")} style={{ color: "#0f172a" }}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              style={{ padding: "0.375rem 0.75rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.85rem", backgroundColor: "#ffffff", color: "#1e293b", fontWeight: "600" }}
            >
              <option value="">Semua Tahun</option>
              <option value="2026" style={{ color: "#0f172a" }}>2026</option>
              <option value="2027" style={{ color: "#0f172a" }}>2027</option>
            </select>

            <div style={{ width: "1px", height: "24px", backgroundColor: "#cbd5e1", margin: "0 0.25rem" }}></div>

            <button 
              onClick={handleDownloadPDF} 
              className={styles.quickActionBtn}
              style={{
                backgroundColor: "#dc2626",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.5rem 0.85rem",
                fontSize: "0.85rem",
                fontWeight: "700",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer"
              }}
              title="Cetak PDF"
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
                fontSize: "0.85rem",
                fontWeight: "700",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer"
              }}
              title="Ekspor Excel"
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

        {/* Adoption Main Register Table */}
        <div className={styles.tableContainer} style={{ marginTop: "1.5rem" }}>
          <table className={styles.projectTable} style={{ borderCollapse: "collapse", minWidth: "1300px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", width: "60px", textAlign: "center" }}>NO.</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "130px", textAlign: "left" }}>TANGGAL</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "160px", textAlign: "left" }}>NO. AKTA / PENETAPAN</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "160px", textAlign: "left" }}>NAMA ANAK</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "180px", textAlign: "left" }}>ORANG TUA KANDUNG</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "180px", textAlign: "left" }}>ORANG TUA ANGKAT</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "140px", textAlign: "center" }}>PROGRES BERKAS</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", minWidth: "130px", textAlign: "center" }}>STATUS PROSES</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", width: "180px", textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                if (row.isNihil) {
                  return (
                    <tr key={`nihil-${index}`} className={styles.guestRow} style={{ backgroundColor: "#fcfcfc" }}>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#ef4444", padding: "12px 10px", fontWeight: "700", whiteSpace: "nowrap" }}>{row.dateLabel}</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#ef4444", padding: "12px 10px", fontWeight: "700", letterSpacing: "2px" }}>N I H I L</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>--------------------</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px", textAlign: "center" }}>-</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px", textAlign: "center" }}>-</td>
                      <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px", textAlign: "center" }}>-</td>
                    </tr>
                  );
                }

                const e = row.entry!;
                return (
                  <tr key={e.id} className={styles.guestRow}>
                    <td style={{ textAlign: "center", border: "1px solid #e2e8f0", fontWeight: "700", color: "#0f172a", padding: "12px 10px" }}>
                      {row.serialNum}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#475569", padding: "12px 10px", whiteSpace: "nowrap" }}>
                      {formatIndonesianDate(e.entryDate)}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#0f172a", fontWeight: "600", padding: "12px 10px" }}>
                      {e.deedNumber || "-"}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#2563eb", fontWeight: "700", padding: "12px 10px" }}>
                      {e.childName}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#334155", padding: "12px 10px" }}>
                      {e.bioParents}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", color: "#1e3a8a", fontWeight: "600", padding: "12px 10px" }}>
                      {e.adoptiveParents}
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", padding: "12px 10px" }}>
                      <div className={styles.progressContainer} style={{ width: "100px", margin: "0 auto" }}>
                        <div className={styles.progressBar}>
                          <div 
                            className={`${styles.progressFill} ${
                              e.status === "Selesai" 
                                ? styles.progressFillGreen 
                                : e.status === "Dalam Proses" 
                                  ? styles.progressFillBlue 
                                  : styles.progressFillOrange
                            }`}
                            style={{ width: `${e.progress}%` }}
                          ></div>
                        </div>
                        <span className={styles.progressText}>{e.progress}%</span>
                      </div>
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", padding: "12px 10px", textAlign: "center" }}>
                      <span className={`${styles.badge} ${
                        e.status === "Selesai" 
                          ? styles.badgeSuccess 
                          : e.status === "Dalam Proses" 
                            ? styles.badgeInfo 
                            : styles.badgeWarning
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td style={{ border: "1px solid #e2e8f0", padding: "12px 10px" }}>
                      <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                        <button
                          onClick={() => {
                            setSelectedEntry(e);
                            // Scroll to top where the details panel is loaded
                            window.scrollTo({ top: 0, behavior: "smooth" });}}
                          className={styles.quickActionBtn}
                          style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", backgroundColor: "#1e3a8a" }}
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleEdit(e)}
                          className={styles.quickActionBtn}
                          style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", backgroundColor: "#0284c7" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className={styles.quickActionBtn}
                          style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", backgroundColor: "#dc2626" }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    Tidak ada catatan pengangkatan anak yang sesuai dengan filter atau pencarian Anda.
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

