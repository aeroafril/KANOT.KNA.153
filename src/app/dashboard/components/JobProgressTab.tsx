"use client";

import React, { useState, useEffect } from "react";
import { GuestBookEntry } from "../page";
import styles from "../dashboard.module.css";
import { jobProgressService } from "@/lib/services/supabaseService";

export interface RequirementItem {
  id: string;
  name: string;
  completed: boolean;
  photoUrl?: string; // Base64 image
}

export interface JobLogItem {
  id: string;
  date: string; // YYYY-MM-DD
  activity: string; // Deskripsi kegiatan
}

export interface JobProgressEntry {
  isNihil?: boolean;
  id: string;
  date: string; // YYYY-MM-DD
  owner: string; // Pemilik/Pemohon
  jobType: string; // Jenis pekerjaan
  progress: number; // 0-100%
  worker: string; // Yang mengerjakan
  description: string; // Keterangan
  phone: string; // Nomor HP Klien
  address: string; // Alamat Klien
  category: string; // Kategori pekerjaan (PT, CV, Yayasan, dll.)
  requirements: RequirementItem[]; // Daftar checklist persyaratan
  logs: JobLogItem[]; // Catatan riwayat / timeline pekerjaan
}

interface JobProgressRow {
  isNihil: boolean;
  dateLabel: string;
  job?: JobProgressEntry;
}

interface JobProgressTabProps {
  guestBook: GuestBookEntry[];
  jobs: JobProgressEntry[];
  setJobs: React.Dispatch<React.SetStateAction<JobProgressEntry[]>>;
}

export const INITIAL_CATEGORY_TEMPLATES: { [key: string]: string[] } = {
  PT: [
    "KTP Para Pendiri",
    "NPWP Para Pendiri",
    "Nama PT (3 Usulan)",
    "Modal Dasar & Setoran Modal",
    "Susunan Direksi & Komisaris"
  ],
  CV: [
    "KTP Sekutu Aktif & Pasif",
    "NPWP Sekutu Aktif & Pasif",
    "Nama CV (3 Usulan)",
    "Pembagian Tugas & Wewenang Sekutu"
  ],
  Yayasan: [
    "KTP Pembina, Pengurus & Pengawas",
    "NPWP Pembina, Pengurus & Pengawas",
    "Nama Yayasan (3 Usulan)",
    "Aset / Modal Awal Yayasan",
    "Draft Maksud & Tujuan AD/ART"
  ],
  Wasiat: [
    "KTP Pembuat Wasiat",
    "KTP Penerima Wasiat",
    "Bukti Kepemilikan Harta (Sertifikat/Tabungan)",
    "KTP 2 Orang Saksi"
  ],
  Lainnya: [
    "KTP Pemohon",
    "NPWP Pemohon",
    "Dokumen Pendukung Pekerjaan"
  ]
};

export const getRequirementsFromTemplate = (category: string, templates: { [key: string]: string[] }): RequirementItem[] => {
  // 1. Try exact match
  if (templates[category]) {
    return templates[category].map((item, index) => ({
      id: `req-${index + 1}-${Date.now()}`,
      name: item,
      completed: false
    }));
  }

  // 2. Try case-insensitive matching
  const keys = Object.keys(templates);
  const matchedKey = keys.find(k => k.toLowerCase() === category.toLowerCase());
  if (matchedKey) {
    return templates[matchedKey].map((item, index) => ({
      id: `req-${index + 1}-${Date.now()}`,
      name: item,
      completed: false
    }));
  }

  // 3. Try standard pattern match
  const cat = category.toUpperCase().trim();
  let key = "Lainnya";
  if (cat.includes("PT")) key = "PT";
  else if (cat.includes("CV")) key = "CV";
  else if (cat.includes("YAYASAN")) key = "Yayasan";
  else if (cat.includes("WASIAT") || cat.includes("WARIS")) key = "Wasiat";
  
  const list = templates[key] || templates["Lainnya"] || [];
  return list.map((item, index) => ({
    id: `req-${index + 1}-${Date.now()}`,
    name: item,
    completed: false
  }));
};

export const INITIAL_JOBS: JobProgressEntry[] = [
  {
    id: "JOB-001",
    date: "2026-07-20",
    owner: "Budi Gunawan",
    jobType: "Pendirian PT Maju Bersama",
    progress: 60,
    worker: "Budi Santoso",
    description: "Berkas minuta sedang disiapkan, menunggu tanda tangan pemegang saham",
    phone: "0812-3456-7890",
    address: "Jl. Sudirman No. 12, Jakarta",
    category: "PT",
    requirements: [
      { id: "req-1", name: "KTP Para Pendiri", completed: true },
      { id: "req-2", name: "NPWP Para Pendiri", completed: true },
      { id: "req-3", name: "Nama PT (3 Usulan)", completed: true },
      { id: "req-4", name: "Modal Dasar & Setoran Modal", completed: false },
      { id: "req-5", name: "Susunan Direksi & Komisaris", completed: false },
    ],
    logs: [
      { id: "log-1", date: "2026-07-18", activity: "Klien mengumpulkan berkas KTP, NPWP, dan usulan nama PT" },
      { id: "log-2", date: "2026-07-20", activity: "Penyusunan draft Anggaran Dasar PT selesai dibuat" },
    ]
  },
  {
    id: "JOB-002",
    date: "2026-07-22",
    owner: "Rina Lestari",
    jobType: "Pendirian CV Karya Mandiri",
    progress: 25,
    worker: "Siti Rahma",
    description: "Pengecekan nama CV di sistem SABH Kemendagri",
    phone: "0856-9876-5432",
    address: "Jl. Diponegoro No. 45, Bandung",
    category: "CV",
    requirements: [
      { id: "req-1", name: "KTP Sekutu Aktif & Pasif", completed: true },
      { id: "req-2", name: "NPWP Sekutu Aktif & Pasif", completed: false },
      { id: "req-3", name: "Nama CV (3 Usulan)", completed: false },
      { id: "req-4", name: "Pembagian Tugas & Wewenang Sekutu", completed: false },
    ],
    logs: [
      { id: "log-1", date: "2026-07-21", activity: "Pengecekan nama CV di sistem SABH Kementerian Hukum dan HAM" },
    ]
  },
  {
    id: "JOB-003",
    date: "2026-07-23",
    owner: "Hendra Wijaya",
    jobType: "Pengesahan AD Yayasan Kasih Ibu",
    progress: 100,
    worker: "Khairun Nisa, S.H., M.Kn.",
    description: "SK Kemenkumham telah terbit dan diserahkan kepada klien",
    phone: "0821-1122-3344",
    address: "Jl. Gajah Mada No. 8, Surabaya",
    category: "Yayasan",
    requirements: [
      { id: "req-1", name: "KTP Pembina, Pengurus & Pengawas", completed: true },
      { id: "req-2", name: "NPWP Pembina, Pengurus & Pengawas", completed: true },
      { id: "req-3", name: "Nama Yayasan (3 Usulan)", completed: true },
      { id: "req-4", name: "Aset / Modal Awal Yayasan", completed: true },
      { id: "req-5", name: "Draft Maksud & Tujuan AD/ART", completed: true },
    ],
    logs: [
      { id: "log-1", date: "2026-06-10", activity: "Pihak Notaris mendaftarkan akta pendirian ke Kemenkumham" },
      { id: "log-2", date: "2026-06-15", activity: "SK Pengesahan Badan Hukum Yayasan terbit dari Kemenkumham" },
      { id: "log-3", date: "2026-06-16", activity: "Berkas salinan akta dan SK Kemenkumham diserahkan ke Pendiri Yayasan" },
    ]
  },
];

export default function JobProgressTab({ guestBook, jobs, setJobs }: JobProgressTabProps) {
  const [showNihilModal, setShowNihilModal] = useState(false);
  const [nihilMonth, setNihilMonth] = useState("01");
  const [nihilYear, setNihilYear] = useState("2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // View state: list page vs detail client page
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Detail view local states
  const [detailPhone, setDetailPhone] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [detailCategory, setDetailCategory] = useState("");
  const [detailWorker, setDetailWorker] = useState("");
  const [detailDescription, setDetailDescription] = useState("");
  const [detailRequirements, setDetailRequirements] = useState<RequirementItem[]>([]);
  const [detailLogs, setDetailLogs] = useState<JobLogItem[]>([]);
  const [newLogDate, setNewLogDate] = useState("");
  const [newLogActivity, setNewLogActivity] = useState("");

  // Form states (For adding a new job progress)
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentJobId, setCurrentJobId] = useState("");
  const [selectedClient, setSelectedClient] = useState<GuestBookEntry | null>(null);
  
  const [owner, setOwner] = useState("");
  const [date, setDate] = useState("");
  const [jobType, setJobType] = useState("");
  const [progress, setProgress] = useState<number>(0);
  const [worker, setWorker] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("PT");

  // Restore draft form values from localStorage on mount (hydration-safe)
  useEffect(() => {
    const savedDraft = localStorage.getItem("draft_job_progress_form");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.showForm !== undefined) setShowForm(draft.showForm);
        if (draft.editMode !== undefined) setEditMode(draft.editMode);
        if (draft.currentJobId !== undefined) setCurrentJobId(draft.currentJobId);
        if (draft.selectedClient !== undefined) setSelectedClient(draft.selectedClient);
        if (draft.owner !== undefined) setOwner(draft.owner);
        if (draft.date !== undefined) setDate(draft.date);
        if (draft.jobType !== undefined) setJobType(draft.jobType);
        if (draft.progress !== undefined) setProgress(draft.progress);
        if (draft.worker !== undefined) setWorker(draft.worker);
        if (draft.description !== undefined) setDescription(draft.description);
        if (draft.phone !== undefined) setPhone(draft.phone);
        if (draft.address !== undefined) setAddress(draft.address);
        if (draft.category !== undefined) setCategory(draft.category);
      } catch (e) {
        console.error("Gagal memuat draf pendaftaran Progres Pekerjaan:", e);
      }
    }
  }, []);

  // Save current form values to localStorage whenever they change
  useEffect(() => {
    if (showForm) {
      const draft = {
        showForm,
        editMode,
        currentJobId,
        selectedClient,
        owner,
        date,
        jobType,
        progress,
        worker,
        description,
        phone,
        address,
        category
      };
      localStorage.setItem("draft_job_progress_form", JSON.stringify(draft));
    } else {
      localStorage.removeItem("draft_job_progress_form");
    }
  }, [
    showForm, editMode, currentJobId, selectedClient, owner, date, jobType,
    progress, worker, description, phone, address, category
  ]);

  // Dynamic category templates state
  const [categoryTemplates, setCategoryTemplates] = useState<{ [key: string]: string[] }>(INITIAL_CATEGORY_TEMPLATES);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [selectedTemplateCat, setSelectedTemplateCat] = useState("PT");
  const [newTemplateItem, setNewTemplateItem] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  // Detail view manual custom requirement name state
  const [newCustomReqName, setNewCustomReqName] = useState("");

  // Handlers for Template Manager
  const handleAddTemplateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateItem.trim()) return;
    const currentList = categoryTemplates[selectedTemplateCat] || [];
    setCategoryTemplates({
      ...categoryTemplates,
      [selectedTemplateCat]: [...currentList, newTemplateItem.trim()]
    });
    setNewTemplateItem("");
  };

  const handleRemoveTemplateItem = (cat: string, index: number) => {
    const currentList = categoryTemplates[cat] || [];
    const updated = currentList.filter((_, idx) => idx !== index);
    setCategoryTemplates({
      ...categoryTemplates,
      [cat]: updated
    });
  };

  const handleAddTemplateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const catName = newCategoryName.trim();
    if (categoryTemplates[catName]) {
      alert("Kategori templat sudah ada!");
      return;
    }
    setCategoryTemplates({
      ...categoryTemplates,
      [catName]: []
    });
    setSelectedTemplateCat(catName);
    setNewCategoryName("");
  };

  const handleRemoveTemplateCategory = (cat: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus templat kategori "${cat}"?`)) {
      const updated = { ...categoryTemplates };
      delete updated[cat];
      setCategoryTemplates(updated);
      setSelectedTemplateCat(Object.keys(updated)[0] || "Lainnya");
    }
  };

  const indonesianMonths = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Set local state when selectedJobId changes
  useEffect(() => {
    if (selectedJobId) {
      const selectedJob = jobs.find(j => j.id === selectedJobId);
      if (selectedJob) {
        setDetailPhone(selectedJob.phone || "");
        setDetailAddress(selectedJob.address || "");
        setDetailCategory(selectedJob.category || "Lainnya");
        setDetailWorker(selectedJob.worker || "");
        setDetailDescription(selectedJob.description || "");
        setDetailRequirements(selectedJob.requirements || []);
        setDetailLogs(selectedJob.logs || []);
        setNewLogDate(new Date().toISOString().split("T")[0]);
        setNewLogActivity("");
      }
    }
  }, [selectedJobId, jobs]);

  // Format YYYY-MM-DD to Indonesian Date
  const handleSaveNihil = async (e: React.FormEvent) => {
    e.preventDefault();
    const month = nihilMonth;
    const year = nihilYear;
    const newNihil: JobProgressEntry = {
        id: `JOB-NIHIL-${Date.now()}`,
        date: `${year}-${month}-01`,
        owner: "N I H I L",
        jobType: "Bulan Kosong",
        progress: 100,
        worker: "---",
        description: "---",
        phone: "---",
        address: "---",
        category: "PT",
        requirements: [],
        logs: [],
        isNihil: true
      };
      
    const success = await jobProgressService.create(newNihil);
    if (success) {
      setJobs([...jobs, newNihil]);
      setShowNihilModal(false);
      alert(`Registrasi NIHIL untuk bulan ${month} tahun ${year} berhasil disimpan!`);
    } else {
      alert("Gagal menyimpan pendaftaran NIHIL ke database.");
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

  // Get unique clients for auto-fill dropdown
  const uniquePastClients = React.useMemo(() => {
    const clientsMap = new Map<string, GuestBookEntry>();
    [...guestBook].reverse().forEach(g => {
      if (g.name && g.name.trim() !== "") {
        clientsMap.set(g.name.toLowerCase().trim(), g);
      }
    });
    return Array.from(clientsMap.values());
  }, [guestBook]);

  // Handle Edit Click from main table
  const handleEditClick = (job: JobProgressEntry) => {
    setEditMode(true);
    setCurrentJobId(job.id);
    setOwner(job.owner);
    setDate(job.date);
    setJobType(job.jobType);
    setProgress(job.progress);
    setWorker(job.worker);
    setDescription(job.description);
    setPhone(job.phone);
    setAddress(job.address);
    setCategory(job.category || "PT");
    setShowForm(true);
  };

  // Handle Delete Click
  const handleDeleteClick = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data progres pekerjaan untuk "${name}"?`)) {
      const success = await jobProgressService.delete(id);
      if (success) {
        setJobs(jobs.filter(job => job.id !== id));
        alert("Data progres pekerjaan berhasil dihapus!");
        if (selectedJobId === id) {
          setSelectedJobId(null);
        }
      } else {
        alert("Gagal menghapus data dari database.");
      }
    }
  };

  // Add/Edit Submit Handler
  const handleSaveJobProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner.trim()) {
      alert("Nama Pemilik/Pemohon wajib diisi!");
      return;
    }
    if (!jobType.trim()) {
      alert("Jenis Pekerjaan wajib diisi!");
      return;
    }
    if (!worker.trim()) {
      alert("Nama yang Mengerjakan wajib diisi!");
      return;
    }

    const jobDate = date || new Date().toISOString().split("T")[0];

    if (editMode) {
      const updatedJob = {
        date: jobDate,
        owner: owner.trim(),
        jobType: jobType.trim(),
        progress: Number(progress),
        worker: worker.trim(),
        description: description.trim() || "-",
        phone: phone.trim() || "-",
        address: address.trim() || "-",
        category: category,
      };

      const success = await jobProgressService.update(currentJobId, updatedJob);
      if (success) {
        setJobs(jobs.map(j => j.id === currentJobId ? { ...j, ...updatedJob } : j));
        alert("Data progres pekerjaan berhasil diperbarui!");
      } else {
        alert("Gagal memperbarui data progres pekerjaan di database.");
      }
    } else {
      const newJob: JobProgressEntry = {
        id: `JOB-${Date.now()}`,
        date: jobDate,
        owner: owner.trim(),
        jobType: jobType.trim(),
        progress: Number(progress),
        worker: worker.trim(),
        description: description.trim() || "-",
        phone: phone.trim() || "-",
        address: address.trim() || "-",
        category: category,
        requirements: getRequirementsFromTemplate(category, categoryTemplates),
        logs: [
          { id: `log-${Date.now()}`, date: jobDate, activity: "Pencatatan awal progres pekerjaan dibuat" }
        ],
      };
      
      const success = await jobProgressService.create(newJob);
      if (success) {
        setJobs([newJob, ...jobs]);
        alert("Data progres pekerjaan baru berhasil ditambahkan!");
      } else {
        alert("Gagal menyimpan data progres pekerjaan baru ke database.");
      }
    }

    // Reset Form States
    setShowForm(false);
    setEditMode(false);
    setCurrentJobId("");
    setSelectedClient(null);
    setOwner("");
    setDate("");
    setJobType("");
    setProgress(0);
    setWorker("");
    setDescription("");
    setPhone("");
    setAddress("");
    setCategory("PT");
  };

  // Save changes from Detail View
  const handleSaveDetailChanges = async () => {
    if (!selectedJobId) return;

    // Auto-calculate progress based on requirements checked
    const totalReq = detailRequirements.length;
    const completedReq = detailRequirements.filter(r => r.completed).length;
    const calculatedProgress = totalReq > 0 ? Math.round((completedReq / totalReq) * 100) : 0;

    const updates = {
      phone: detailPhone.trim(),
      address: detailAddress.trim(),
      category: detailCategory,
      worker: detailWorker.trim(),
      description: detailDescription.trim(),
      requirements: detailRequirements,
      progress: calculatedProgress,
      logs: detailLogs
    };

    const success = await jobProgressService.update(selectedJobId, updates);
    if (success) {
      setJobs(prev => prev.map(j => j.id === selectedJobId ? { ...j, ...updates } : j));
      alert("Detail berkas, data pribadi, dan riwayat aktivitas klien berhasil disimpan!");
      setSelectedJobId(null); // Return to list view
    } else {
      alert("Gagal menyimpan detail ke database.");
    }
  };

  // Add a new activity timeline log entry
  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogActivity.trim()) {
      alert("Aktivitas kegiatan wajib diisi!");
      return;
    }
    const newLog: JobLogItem = {
      id: `log-${Date.now()}`,
      date: newLogDate || new Date().toISOString().split("T")[0],
      activity: newLogActivity.trim()
    };
    const updatedLogs = [newLog, ...detailLogs].sort((a, b) => b.date.localeCompare(a.date)); // Sort date descending (newest first)
    setDetailLogs(updatedLogs);
    setNewLogActivity("");
  };

  // Remove a log entry from timeline
  const handleRemoveLog = (logId: string) => {
    setDetailLogs(prev => prev.filter(l => l.id !== logId));
  };

  // Add a manual custom requirement to the client's current checklist
  const handleAddCustomRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomReqName.trim()) {
      alert("Nama berkas persyaratan wajib diisi!");
      return;
    }
    const newItem: RequirementItem = {
      id: `req-custom-${Date.now()}`,
      name: newCustomReqName.trim(),
      completed: false
    };
    setDetailRequirements(prev => [...prev, newItem]);
    setNewCustomReqName("");
  };

  // Remove a manual custom requirement
  const handleRemoveCustomRequirement = (reqId: string) => {
    setDetailRequirements(prev => prev.filter(r => r.id !== reqId));
  };

  // Toggle single requirement checkbox in Detail View
  const handleToggleRequirement = (reqId: string) => {
    setDetailRequirements(prev =>
      prev.map(r => r.id === reqId ? { ...r, completed: !r.completed } : r)
    );
  };

  // Upload file for a specific requirement
  const handlePhotoUpload = (reqId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setDetailRequirements(prev =>
          prev.map(r => r.id === reqId ? { ...r, photoUrl: result } : r)
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove photo from requirement
  const handleRemovePhoto = (reqId: string) => {
    setDetailRequirements(prev =>
      prev.map(r => r.id === reqId ? { ...r, photoUrl: undefined } : r)
    );
  };

  // Generate monthly range for filtering and NIHIL rows
  const getMonthsRange = () => {
    const range: { year: number; month: number; label: string; monthStr: string }[] = [];
    const startYear = 2026;
    const startMonth = 1; // Januari
    
    const today = new Date();
    const endYear = today.getFullYear();
    const endMonth = today.getMonth() + 1;
    
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

  // Construct table rows with search filters (excluding NIHIL rows)
  const getJobRows = () => {
    const rows: JobProgressRow[] = [];
    const months = getMonthsRange().filter(m => {
      const matchesMonth = filterMonth === "" || m.monthStr === filterMonth;
      const matchesYear = filterYear === "" || String(m.year) === filterYear;
      return matchesMonth && matchesYear;
    });

    months.forEach((m) => {
      // Find all jobs in this month
      const listInMonth = jobs.filter(j => {
        let dateYear = "";
        let dateMonthVal = -1;
        
        const dateStr = j.date; // YYYY-MM-DD
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
      const filteredListInMonth = listInMonth.filter(j => {
        const matchesSearch = !searchQuery.trim() ||
          j.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.jobType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.worker.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      });

      const sorted = [...filteredListInMonth].sort((a, b) => a.id.localeCompare(b.id));
      sorted.forEach((job) => {
        rows.push({
          isNihil: job.isNihil || false,
          dateLabel: m.label,
          job,
        });
    });});

    return rows;
  };

  const jobRows = getJobRows();

  // Print PDF Layout
  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const title = `Buku Progres Pekerjaan - ${filterMonth ? indonesianMonths[parseInt(filterMonth) - 1] : "Semua Bulan"} ${filterYear || "Semua Tahun"}`;
    
    let rowsHtml = "";
    jobRows.forEach((row, index) => {
      if (row.isNihil) {
        rowsHtml += `
          <tr style="background-color: #fafafa; text-align: center;">
            <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #ef4444; font-weight: bold; text-align: left; white-space: nowrap;">${row.dateLabel}</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #ef4444; font-weight: bold; letter-spacing: 2px;">N I H I L</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">--------------------</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #94a3b8;">---</td>
          </tr>
        `;
      } else {
        const j = row.job!;
        rowsHtml += `
          <tr>
            <td style="text-align: center; font-weight: bold; border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${formatIndonesianDate(j.date)}</td>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>${j.owner}</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${j.jobType}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${j.progress}%</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${j.worker}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${j.description}</td>
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
            h2 { font-size: 12px; text-align: center; font-weight: normal; margin-top: 0; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 20px; }
            th { background-color: #f8fafc; padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; text-align: left; }
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
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-weight: bold; text-align: center; width: 40px;">No</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-weight: bold;">Tanggal Masuk</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-weight: bold;">Nama Klien</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-weight: bold;">Jenis Pekerjaan</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-weight: bold; text-align: center; width: 80px;">Progres</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-weight: bold;">Pekerja (Staf)</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; font-weight: bold;">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="7" style="text-align: center; padding: 8px; font-style: italic; color: #94a3b8;">belum ada data</td></tr>'}
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

  // Excel Mock Export
  const handleDownloadExcel = () => {
    alert("Mengunduh laporan Buku Progres Pekerjaan format Excel (Mock Download)...");
  };

  // Helper for progress styling
  const getProgressColor = (val: number) => {
    if (val === 100) return "#16a34a"; // green
    if (val >= 50) return "#2563eb"; // blue
    return "#ea580c"; // orange
  };

  // If a specific client is selected, render the Detail View
  if (selectedJobId) {
    const activeJob = jobs.find(j => j.id === selectedJobId);
    if (activeJob) {
      // Calculate completion progress stats for header
      const totalRequirementsCount = detailRequirements.length;
      const completedRequirementsCount = detailRequirements.filter(r => r.completed).length;
      const computedPercent = totalRequirementsCount > 0 ? Math.round((completedRequirementsCount / totalRequirementsCount) * 100) : 0;

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Header & Back Button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #e2e8f0", paddingBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={() => setSelectedJobId(null)}
                className={styles.quickActionBtn}
                style={{ backgroundColor: "#64748b", display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1rem" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Kembali ke Daftar
              </button>
              <div>
                <h1 className={styles.welcomeTitle} style={{ fontSize: "1.65rem", margin: 0 }}>
                  Detail Berkas Klien: {activeJob.owner}
                </h1>
                <p className={styles.welcomeSubtitle} style={{ marginTop: "0.25rem" }}>
                  Pekerjaan: <strong>{activeJob.jobType}</strong> | Progres Berkas: <strong>{computedPercent}%</strong> ({completedRequirementsCount}/{totalRequirementsCount} Dokumen Terpenuhi)
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handleSaveDetailChanges}
                className={styles.quickActionBtn}
                style={{ backgroundColor: "#10b981", padding: "0.6rem 1.2rem", fontSize: "0.95rem" }}
              >
                Simpan Perubahan
              </button>
              <button
                onClick={() => setSelectedJobId(null)}
                className={styles.quickActionBtn}
                style={{ backgroundColor: "#ef4444", padding: "0.6rem 1.2rem", fontSize: "0.95rem" }}
              >
                Batal
              </button>
            </div>
          </div>

          {/* Grid Layout Detail */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "1.5rem", alignItems: "start" }}>
            
            {/* Left Column: Data Pribadi & Detail Pekerjaan */}
            <div className={styles.cardSection} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", border: "1px solid #cbd5e1" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", margin: 0 }}>
                Data Pribadi & Detail Pekerjaan
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* No HP */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>Nomor HP / Telepon Klien</label>
                  <input
                    type="text"
                    value={detailPhone}
                    onChange={(e) => setDetailPhone(e.target.value)}
                    className={styles.inputField}
                    placeholder="Misal: 0812-3456-7890"
                  />
                </div>

                {/* Alamat */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>Alamat Lengkap Klien</label>
                  <textarea
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    className={styles.inputField}
                    style={{ minHeight: "80px", fontFamily: "inherit", resize: "vertical" }}
                    placeholder="Alamat lengkap kediaman/kantor..."
                  />
                </div>

                {/* Kategori Box */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>Kategori Pekerjaan</label>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <select
                      value={detailCategory}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setDetailCategory(newCat);
                        if (confirm(`Apakah Anda ingin mereset checklist persyaratan ke dokumen bawaan untuk kategori "${newCat}"?`)) {
                          setDetailRequirements(getRequirementsFromTemplate(newCat, categoryTemplates));
                        }
                      }}
                      className={styles.inputField}
                      style={{ flex: 1, backgroundColor: "#ffffff" }}
                    >
                      {Object.keys(categoryTemplates).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <span style={{
                      backgroundColor: "#eff6ff",
                      color: "#1d4ed8",
                      fontWeight: "700",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.375rem",
                      fontSize: "0.85rem",
                      border: "1px solid #bfdbfe"
                    }}>
                      {detailCategory}
                    </span>
                  </div>
                </div>

                {/* Yang Mengerjakan */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>Staf / Yang Mengerjakan</label>
                  <input
                    type="text"
                    value={detailWorker}
                    onChange={(e) => setDetailWorker(e.target.value)}
                    className={styles.inputField}
                    placeholder="Nama staf yang mengerjakan..."
                  />
                </div>

                {/* Keterangan */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>Keterangan / Catatan Tambahan</label>
                  <textarea
                    value={detailDescription}
                    onChange={(e) => setDetailDescription(e.target.value)}
                    className={styles.inputField}
                    style={{ minHeight: "100px", fontFamily: "inherit", resize: "vertical" }}
                    placeholder="Tulis kendala, status pengerjaan, atau catatan penting lainnya..."
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Persyaratan Checklist */}
            <div className={styles.cardSection} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", border: "1px solid #cbd5e1" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", margin: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Checklist Persyaratan Dokumen</span>
                <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "normal" }}>
                  {completedRequirementsCount} dari {totalRequirementsCount} Berkas Terpenuhi
                </span>
              </h3>

              {/* Progress Bar Visual */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <div style={{ height: "10px", width: "100%", backgroundColor: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${computedPercent}%`, backgroundColor: getProgressColor(computedPercent), transition: "width 0.4s ease", borderRadius: "999px" }}></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: "600", color: "#64748b" }}>
                  <span>Progres Kelengkapan</span>
                  <span>{computedPercent}%</span>
                </div>
              </div>

              {/* Form Tambah Persyaratan Khusus Klien secara manual */}
              <form onSubmit={handleAddCustomRequirement} style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="Tambah berkas persyaratan khusus..."
                  value={newCustomReqName}
                  onChange={(e) => setNewCustomReqName(e.target.value)}
                  className={styles.inputField}
                  style={{ flex: 1, padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
                />
                <button
                  type="submit"
                  className={styles.quickActionBtn}
                  style={{ padding: "0.5rem 0.85rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}
                >
                  + Tambah Syarat
                </button>
              </form>

              {/* Requirements Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
                {detailRequirements.map((req) => (
                  <div key={req.id} style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    padding: "1rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    backgroundColor: req.completed ? "#f0fdf4" : "#ffffff",
                    borderColor: req.completed ? "#bbf7d0" : "#e2e8f0",
                    transition: "all 0.2s ease"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      
                      {/* Checkbox & Name */}
                      <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", fontWeight: "700", color: "#0f172a", fontSize: "0.95rem", flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={req.completed}
                          onChange={() => handleToggleRequirement(req.id)}
                          style={{
                            width: "1.2rem",
                            height: "1.2rem",
                            cursor: "pointer",
                            accentColor: "#16a34a"
                          }}
                        />
                        <span style={{ textDecoration: req.completed ? "line-through" : "none", color: req.completed ? "#16a34a" : "#0f172a" }}>
                          {req.name}
                        </span>
                      </label>

                      {/* File Uploader & Delete Button */}
                      <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                        <input
                          type="file"
                          accept="image/*"
                          id={`upload-${req.id}`}
                          style={{ display: "none" }}
                          onChange={(e) => handlePhotoUpload(req.id, e)}
                        />
                        <label
                          htmlFor={`upload-${req.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            backgroundColor: "#3b82f6",
                            color: "#ffffff",
                            padding: "0.35rem 0.75rem",
                            borderRadius: "0.375rem",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                          {req.photoUrl ? "Ganti Foto" : "Unggah"}
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomRequirement(req.id)}
                          style={{
                            backgroundColor: "#ef4444",
                            color: "#ffffff",
                            border: "none",
                            padding: "0.35rem 0.6rem",
                            borderRadius: "0.375rem",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                          }}
                          title="Hapus berkas persyaratan ini"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail Preview Area */}
                    {req.photoUrl && (
                      <div style={{
                        position: "relative",
                        marginTop: "0.25rem",
                        width: "fit-content",
                        borderRadius: "0.375rem",
                        border: "1px solid #cbd5e1",
                        overflow: "hidden",
                        backgroundColor: "#f8fafc"
                      }}>
                        <img
                          src={req.photoUrl}
                          alt={`Berkas ${req.name}`}
                          style={{
                            display: "block",
                            maxHeight: "150px",
                            maxWidth: "100%",
                            objectFit: "contain"
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(req.id)}
                          style={{
                            position: "absolute",
                            top: "5px",
                            right: "5px",
                            backgroundColor: "rgba(239, 68, 68, 0.9)",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
                          }}
                          title="Hapus Foto"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Bottom Row: Timeline / Riwayat Aktivitas Pekerjaan */}
          <div className={styles.cardSection} style={{ border: "1px solid #cbd5e1", marginTop: "1rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", margin: "0 0 1rem 0" }}>
              Riwayat & Timeline Aktivitas Pekerjaan
            </h3>

            {/* Timeline input form */}
            <form onSubmit={handleAddLog} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem", backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", alignItems: "flex-end" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", width: "180px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#475569" }}>Tanggal Aktivitas</label>
                <input
                  type="date"
                  value={newLogDate}
                  onChange={(e) => setNewLogDate(e.target.value)}
                  className={styles.inputField}
                  style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", flex: 1, minWidth: "250px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#475569" }}>Kegiatan / Aktivitas</label>
                <input
                  type="text"
                  placeholder="Misal: Pergi ke BPN untuk cek sertifikat, Klien menyerahkan KTP berkas asli..."
                  value={newLogActivity}
                  onChange={(e) => setNewLogActivity(e.target.value)}
                  className={styles.inputField}
                />
              </div>
              <button
                type="submit"
                className={styles.quickActionBtn}
                style={{ padding: "0.7rem 1.25rem", height: "42px", display: "inline-flex", alignItems: "center" }}
              >
                + Tambah Riwayat
              </button>
            </form>

            {/* Timeline visualization */}
            {detailLogs.length === 0 ? (
              <p style={{ textAlign: "center", color: "#64748b", fontStyle: "italic", margin: "2rem 0" }}>
                Belum ada riwayat aktivitas yang dicatat untuk pekerjaan ini.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", position: "relative", paddingLeft: "1.5rem", borderLeft: "2px solid #cbd5e1", margin: "0.5rem 0.5rem 1.5rem 0.5rem" }}>
                {detailLogs.map((log) => (
                  <div key={log.id} style={{ position: "relative", marginBottom: "1.5rem" }}>
                    
                    {/* Timeline bullet circle */}
                    <div style={{
                      position: "absolute",
                      left: "-29px",
                      top: "2px",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: "#2563eb",
                      border: "2px solid #ffffff",
                      boxShadow: "0 0 0 2px #cbd5e1"
                    }}></div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", padding: "0.75rem 1rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}>
                      <div>
                        <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#2563eb", display: "block" }}>
                          {formatIndonesianDate(log.date)}
                        </span>
                        <p style={{ margin: "0.25rem 0 0 0", color: "#0f172a", fontSize: "0.9rem", fontWeight: "500", lineHeight: "1.4" }}>
                          {log.activity}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLog(log.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          fontSize: "1.25rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          padding: "0 0.25rem",
                          lineHeight: 1
                        }}
                        title="Hapus riwayat ini"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // Render the Main List View (when selectedJobId is null)
  return (
    <>
      {/* Header Section */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Buku Progres Pekerjaan</h1>
        <p className={styles.welcomeSubtitle}>
          Pantau dan kelola berkas persyaratan, riwayat aktivitas, serta progres penyelesaian berkas klien.
        </p>
      </div>

      {/* Button to toggle add new Progres form */}
      {!showForm && (
        <div style={{ display: "flex", justifyContent: "flex-start", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <button
            onClick={() => {
              setShowForm(true);
              setEditMode(false);
              setSelectedClient(null);
              setOwner("");
              setPhone("");
              setAddress("");
              setJobType("");
              setWorker("");
              setDescription("");
              setProgress(0);
            }}
            className={styles.quickActionBtn}
            style={{ padding: "0.75rem 1.25rem", fontSize: "0.95rem" }}
          >
            + Registrasi Progres Baru
          </button>
          <button
            onClick={() => setShowTemplateManager(!showTemplateManager)}
            className={styles.quickActionBtn}
            style={{ padding: "0.75rem 1.25rem", fontSize: "0.95rem", backgroundColor: "#0284c7" }}
          >
            ⚙️ Kelola Templat Syarat
          </button>
        </div>
      )}

      {/* Template Manager Section */}
      {showTemplateManager && (
        <div className={styles.cardSection} style={{ border: "1px solid #cbd5e1", backgroundColor: "#f8fafc" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", margin: "0 0 1rem 0" }}>
            ⚙️ Pengaturan Templat Persyaratan Dokumen
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
            {/* Left Col: Categories */}
            <div style={{ borderRight: "1px solid #e2e8f0", paddingRight: "1rem" }}>
              <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem", fontWeight: "600", color: "#475569" }}>Kategori Pekerjaan</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "1rem" }}>
                {Object.keys(categoryTemplates).map((cat) => (
                  <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateCat(cat)}
                      style={{
                        flex: 1,
                        textAlign: "left",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "0.375rem",
                        border: "none",
                        backgroundColor: selectedTemplateCat === cat ? "#3b82f6" : "transparent",
                        color: selectedTemplateCat === cat ? "#ffffff" : "#0f172a",
                        fontWeight: selectedTemplateCat === cat ? "700" : "500",
                        cursor: "pointer",
                        fontSize: "0.85rem"
                      }}
                    >
                      {cat}
                    </button>
                    {cat !== "PT" && cat !== "CV" && cat !== "Yayasan" && cat !== "Wasiat" && cat !== "Lainnya" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTemplateCategory(cat)}
                        style={{ border: "none", background: "none", color: "#ef4444", fontWeight: "bold", cursor: "pointer", padding: "0 0.5rem" }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddTemplateCategory} style={{ display: "flex", gap: "0.25rem" }}>
                <input
                  type="text"
                  placeholder="Kategori baru..."
                  className={styles.inputField}
                  style={{ padding: "0.375rem 0.5rem", fontSize: "0.8rem", flex: 1 }}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button type="submit" className={styles.quickActionBtn} style={{ padding: "0.375rem 0.75rem", fontSize: "0.8rem" }}>
                  +
                </button>
              </form>
            </div>

            {/* Right Col: Requirements items in Category */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600", color: "#475569" }}>
                  Dokumen Persyaratan untuk Kategori: <strong style={{ color: "#1e3a8a" }}>{selectedTemplateCat}</strong>
                </h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "180px", overflowY: "auto", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", backgroundColor: "#ffffff", marginBottom: "1rem" }}>
                {(categoryTemplates[selectedTemplateCat] || []).length === 0 ? (
                  <span style={{ fontSize: "0.85rem", color: "#64748b", fontStyle: "italic" }}>Belum ada dokumen persyaratan bawaan.</span>
                ) : (
                  (categoryTemplates[selectedTemplateCat] || []).map((item, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.35rem 0.5rem", borderBottom: "1px solid #f1f5f9", fontSize: "0.85rem" }}>
                      <span>{idx + 1}. {item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTemplateItem(selectedTemplateCat, idx)}
                        style={{ border: "none", background: "none", color: "#ef4444", fontWeight: "700", cursor: "pointer", fontSize: "1rem" }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddTemplateItem} style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="Tambah dokumen persyaratan baru..."
                  className={styles.inputField}
                  style={{ flex: 1, padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
                  value={newTemplateItem}
                  onChange={(e) => setNewTemplateItem(e.target.value)}
                />
                <button type="submit" className={styles.quickActionBtn} style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                  + Tambah
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manual Registration Form */}
      {showForm && (
        <div className={styles.cardSection} style={{ border: "1px solid #cbd5e1", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", margin: "0 0 1.25rem 0" }}>
            {editMode ? "Edit Data Progres Pekerjaan" : "Pendaftaran Progres Pekerjaan Baru"}
          </h3>
          <form onSubmit={handleSaveJobProgress}>
            {selectedClient && (
              <div style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                fontSize: "0.85rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span>Terhubung dengan Klien Buku Tamu: <strong>{selectedClient.name}</strong> ({selectedClient.purpose})</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClient(null);
                    setOwner("");
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

            <div className={styles.guestbookFormHorizontal}>
              {/* Tanggal Masuk */}
              <div>
                <label className={styles.formLabel}>Tanggal Masuk Berkas</label>
                <input
                  type="date"
                  className={styles.inputField}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                />
              </div>

              {/* Cari Nama Klien */}
              <div style={{ position: "relative" }}>
                <label className={styles.formLabel}>Nama Pemilik/Pemohon</label>
                <input
                  type="text"
                  placeholder="Ketik nama klien..."
                  className={styles.inputField}
                  value={owner}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOwner(val);
                    if (selectedClient && val !== selectedClient.name) {
                      setSelectedClient(null);
                    }
                  }}
                  required
                />

                {owner && !selectedClient && (
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
                    {uniquePastClients.filter(c => c.name.toLowerCase().includes(owner.toLowerCase())).length > 0 ? (
                      uniquePastClients
                        .filter(c => c.name.toLowerCase().includes(owner.toLowerCase()))
                        .map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedClient(c);
                              setOwner(c.name);
                              setPhone("");
                              setAddress(c.address);
                              setCategory(c.category || "Lainnya");
                              setJobType(c.purpose);
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

              {/* Jenis Pekerjaan */}
              <div>
                <label className={styles.formLabel}>Jenis Pekerjaan</label>
                <input
                  type="text"
                  placeholder="Misal: Pendirian PT Maju Bersama..."
                  className={styles.inputField}
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  required
                />
              </div>

              {/* Kategori */}
              <div>
                <label className={styles.formLabel}>Kategori Templat</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={styles.inputField}
                  style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
                >
                  <option value="PT">PT</option>
                  <option value="CV">CV</option>
                  <option value="Yayasan">Yayasan</option>
                  <option value="Wasiat">Wasiat</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Pekerja (Staf) */}
              <div>
                <label className={styles.formLabel}>Pekerja (Staf)</label>
                <input
                  type="text"
                  placeholder="Nama staf yang mengerjakan..."
                  className={styles.inputField}
                  value={worker}
                  onChange={(e) => setWorker(e.target.value)}
                  required
                />
              </div>

              {/* Progres Awal */}
              <div>
                <label className={styles.formLabel}>Progres Awal (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0 - 100"
                  className={styles.inputField}
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                />
              </div>

              {/* No Telepon */}
              <div>
                <label className={styles.formLabel}>No Telepon Klien</label>
                <input
                  type="text"
                  placeholder="Misal: 0812-3456-7890..."
                  className={styles.inputField}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Alamat Klien */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label className={styles.formLabel}>Alamat Lengkap Klien</label>
                <textarea
                  placeholder="Alamat klien..."
                  className={styles.inputField}
                  style={{ minHeight: "60px", fontFamily: "inherit", resize: "vertical" }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* Keterangan */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label className={styles.formLabel}>Keterangan Tambahan</label>
                <input
                  type="text"
                  placeholder="Keterangan awal mengenai berkas..."
                  className={styles.inputField}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit" className={styles.quickActionBtn}>
                {editMode ? "Simpan Perubahan" : "Simpan Progres"}
              </button>
              <button
                type="button"
                className={styles.quickActionBtn}
                style={{ backgroundColor: "#64748b" }}
                onClick={() => {
                  setShowForm(false);
                  setEditMode(false);
                  setOwner("");
                  setPhone("");
                  setAddress("");
                  setJobType("");
                  setWorker("");
                  setDescription("");
                  setProgress(0);
                }}
              >
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
            <h2 className={styles.cardTitle}>Daftar Progres Pekerjaan</h2>
            <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginTop: "0.25rem" }}>
              Total berkas dipantau: {jobRows.length} baris.
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Cari Pemilik/Pekerjaan/Pekerja..."
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
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>

            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ padding: "0.375rem 0.75rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.85rem", backgroundColor: "#ffffff", color: "#0f172a" }}
            >
              <option value="">Semua Kategori</option>
              <option value="PT">PT</option>
              <option value="CV">CV</option>
              <option value="Yayasan">Yayasan</option>
              <option value="Wasiat">Wasiat</option>
              <option value="Lainnya">Lainnya</option>
            </select>

            <button
              onClick={handleDownloadPDF}
              className={styles.quickActionBtn}
              style={{ backgroundColor: "#e11d48", padding: "0.375rem 0.75rem", fontSize: "0.85rem" }}
            >
              PDF
            </button>

            <button
              onClick={handleDownloadExcel}
              className={styles.quickActionBtn}
              style={{ backgroundColor: "#15803d", padding: "0.375rem 0.75rem", fontSize: "0.85rem" }}
            >
              Excel
            </button>
          </div>
        </div>

        <div className={styles.tableContainer} style={{ marginTop: "1rem" }}>
          <table className={styles.projectTable} style={{ borderCollapse: "collapse", minWidth: "1400px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", fontWeight: "700", width: "60px", textAlign: "center" }}>NO</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", fontWeight: "700", width: "140px", textAlign: "left" }}>TANGGAL MASUK</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", fontWeight: "700", minWidth: "220px", textAlign: "left" }}>NAMA KLIEN (PEMILIK/PEMOHON)</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", fontWeight: "700", minWidth: "240px", textAlign: "left" }}>JENIS PEKERJAAN</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", fontWeight: "700", width: "180px", textAlign: "left" }}>PROGRES PEKERJAAN</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", fontWeight: "700", minWidth: "160px", textAlign: "left" }}>PEKERJA (STAF)</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", fontWeight: "700", minWidth: "200px", textAlign: "left" }}>KETERANGAN</th>
                <th style={{ border: "1px solid #cbd5e1", padding: "12px 10px", fontSize: "0.8rem", fontWeight: "700", width: "230px", textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {jobRows.length === 0 ? (
                <tr className={styles.guestRow}>
                  <td colSpan={8} style={{ textAlign: "center", color: "#64748b", fontStyle: "italic", padding: "2rem", fontWeight: "600" }}>
                    Belum ada data progres pekerjaan atau tidak sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                jobRows.map((row, idx) => {
                  if (row.isNihil) {
                    return (
                      <tr key={`nihil-${idx}`} className={styles.guestRow} style={{ backgroundColor: "#fcfcfc" }}>
                        <td style={{ textAlign: "center", border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                        <td style={{ border: "1px solid #e2e8f0", color: "#ef4444", padding: "12px 10px", fontWeight: "700", whiteSpace: "nowrap" }}>{row.dateLabel}</td>
                        <td style={{ border: "1px solid #e2e8f0", color: "#ef4444", padding: "12px 10px", fontWeight: "700", letterSpacing: "2px" }}>N I H I L</td>
                        <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>Bulan Kosong</td>
                        <td style={{ border: "1px solid #e2e8f0", padding: "12px 10px" }}>
                          <div style={{ width: "100%", backgroundColor: "#e2e8f0", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: "100%", backgroundColor: "#ef4444", height: "100%" }} />
                          </div>
                        </td>
                        <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                        <td style={{ border: "1px solid #e2e8f0", color: "#94a3b8", padding: "12px 10px" }}>---</td>
                        <td style={{ textAlign: "center", border: "1px solid #e2e8f0", padding: "12px 10px" }}>
                          <button
                            onClick={() => handleDeleteClick(row.job!.id, "NIHIL")}
                            className={styles.actionBtnDelete}
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                          >
                            Hapus NIHIL
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  const j = row.job!;
                  return (
                    <tr key={j.id} className={styles.guestRow}>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", fontWeight: "600", padding: "12px 10px" }}>{idx + 1}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: "12px 10px" }}>{formatIndonesianDate(j.date)}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: "12px 10px" }}>
                        <strong>{j.owner}</strong>
                        {j.phone && j.phone !== "-" && (
                          <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", marginTop: "0.15rem" }}>
                            📞 {j.phone}
                          </span>
                        )}
                      </td>
                      <td style={{ border: "1px solid #e2e8f0", padding: "12px 10px" }}>
                        <span style={{
                          backgroundColor: j.category === "PT" ? "#eff6ff" : j.category === "CV" ? "#fdf2f8" : j.category === "Yayasan" ? "#f0fdf4" : j.category === "Wasiat" ? "#fff7ed" : "#f1f5f9",
                          color: j.category === "PT" ? "#1e40af" : j.category === "CV" ? "#9d174d" : j.category === "Yayasan" ? "#166534" : j.category === "Wasiat" ? "#9a3412" : "#475569",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "0.25rem",
                          marginRight: "0.5rem"
                        }}>
                          {j.category || "Lainnya"}
                        </span>
                        {j.jobType}
                      </td>
                      <td style={{ border: "1px solid #e2e8f0", padding: "12px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ flex: 1, backgroundColor: "#e2e8f0", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: `${j.progress}%`, backgroundColor: getProgressColor(j.progress), height: "100%", transition: "width 0.4s ease" }} />
                          </div>
                          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#334155", minWidth: "30px", textAlign: "right" }}>
                            {j.progress}%
                          </span>
                        </div>
                      </td>
                      <td style={{ border: "1px solid #e2e8f0", padding: "12px 10px" }}>{j.worker}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: "12px 10px", fontSize: "0.85rem", color: "#475569", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={j.description}>
                        {j.description}
                      </td>
                      <td style={{ textAlign: "center", border: "1px solid #e2e8f0", padding: "12px 10px" }}>
                        <div style={{ display: "flex", gap: "0.35rem", justifyContent: "center" }}>
                          <button
                            onClick={() => setSelectedJobId(j.id)}
                            className={styles.actionBtnEdit}
                            style={{ backgroundColor: "#2563eb", padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          >
                            Kelola Berkas
                          </button>
                          <button
                            onClick={() => handleEditClick(j)}
                            className={styles.actionBtnEdit}
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(j.id, j.owner)}
                            className={styles.actionBtnDelete}
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
