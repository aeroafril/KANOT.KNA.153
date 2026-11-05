"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import GuestBookTab from "./components/GuestBookTab";
import DeedListTab from "./components/DeedListTab";
import WillsListTab from "./components/WillsListTab";
import PrivateAgreementListTab from "./components/PrivateAgreementListTab";
import LegalizedAgreementListTab from "./components/LegalizedAgreementListTab";
import ProtestListTab from "./components/ProtestListTab";
import KlapperListTab from "./components/KlapperListTab";
import KlapperLegalizedListTab from "./components/KlapperLegalizedListTab";
import CvListTab from "./components/CvListTab";
import PtListTab from "./components/PtListTab";
import YayasanListTab from "./components/YayasanListTab";
import HibahListTab from "./components/HibahListTab";
import JobProgressTab, { JobProgressEntry } from "./components/JobProgressTab";
import MailListTab from "./components/MailListTab";
import CopieCollationneeListTab from "./components/CopieCollationneeListTab";
import ChildAdoptionListTab from "./components/ChildAdoptionListTab";
import { guestBookService, profileService, jobProgressService } from "@/lib/services/supabaseService";
import { supabase } from "@/lib/supabase";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
  category: string;
  status: "Selesai" | "Dalam Proses" | "Tertunda";
  progress: number;
  dueDate: string;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: "blue" | "green" | "orange" | "red";
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "Aktif" | "Sibuk" | "Offline";
  initial: string;
  permissions?: string[];
  password?: string;
}

export interface GuestBookEntry {
  id: string;
  name: string;
  address: string;
  purpose: string;
  category: "Yayasan" | "PT" | "CV" | "Wasiat" | "Pengesahan" | "Pembukuan" | string;
  status: "Menunggu" | "Diproses" | "Selesai";
  timeIn: string;
  timeOut: string;
  date: string; // Format YYYY-MM-DD
}



export default function DashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Realtime Presence for Online/Offline Status
  useEffect(() => {
    if (!currentUser?.email) return;

    const channel = supabase.channel('online-users');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineEmails = new Set<string>();
        for (const id in state) {
          state[id].forEach((presence: any) => {
            if (presence.email) onlineEmails.add(presence.email.toLowerCase());
          });
        }
        setOnlineUsers(Array.from(onlineEmails));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            email: currentUser.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  useEffect(() => {
    // Izinkan akses langsung ke /dashboard tanpa wajib login atau registrasi.
    // Secara default masuk sebagai Patricia (Staff Notaris) dengan semua akses penuh.
    const defaultPatriciaProfile = {
      name: "Patricia",
      email: "dedesk159@gmail.com",
      role: "Staff Notaris",
      permissions: [
        "Melihat Anggota",
        "Menambahkan Anggota",
        "Mengedit Anggota",
        "Menghapus Anggota",
        "Melihat Isi Data Web",
        "Mengedit Isi Data Web",
      ],
    };

    const savedProfileStr = localStorage.getItem("super_admin_profile");
    let profileToUse = { ...defaultPatriciaProfile };
    if (savedProfileStr) {
      try {
        profileToUse = { ...profileToUse, ...JSON.parse(savedProfileStr) };
      } catch (e) {}
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user = session.user;
        const isDedesk = user.email?.toLowerCase() === "dedesk159@gmail.com";
        setCurrentUser({
          name: isDedesk ? "Patricia" : user.user_metadata?.name || user.email?.split("@")[0] || "Pengguna",
          email: user.email,
          role: isDedesk ? "Staff Notaris" : user.user_metadata?.role || "Notaris / Staf",
          permissions: [
            "Melihat Anggota",
            "Menambahkan Anggota",
            "Mengedit Anggota",
            "Menghapus Anggota",
            "Melihat Isi Data Web",
            "Mengedit Isi Data Web",
          ],
        });
      } else {
        // Langsung gunakan profil Patricia tanpa redirect ke /login
        setCurrentUser(profileToUse);
      }
    }).catch(() => {
      setCurrentUser(profileToUse);
    });
  }, []);

  // Team Members State & Effect (dummy collaborative team members with Patricia as Staff Notaris with all access)
  const defaultTeamMembers: TeamMember[] = [
    {
      id: "super-admin-id",
      name: "Patricia",
      email: "dedesk159@gmail.com",
      role: "Staff Notaris",
      status: "Aktif",
      initial: "PA",
      password: "patricia123",
      permissions: [
        "Melihat Anggota",
        "Menambahkan Anggota",
        "Mengedit Anggota",
        "Menghapus Anggota",
        "Melihat Isi Data Web",
        "Mengedit Isi Data Web",
      ],
    },
    {
      id: "knisa-admin-id",
      name: "Khairun Nisa",
      email: "knisa7816@gmail.com",
      role: "Notaris Utama",
      status: "Aktif",
      initial: "KN",
      password: "nisa1234",
      permissions: [
        "Melihat Anggota",
        "Menambahkan Anggota",
        "Mengedit Anggota",
        "Menghapus Anggota",
        "Melihat Isi Data Web",
        "Mengedit Isi Data Web",
      ],
    },
    {
      id: "T-2",
      name: "Khairun Nisa, S.H., M.Kn.",
      email: "khairun.nisa@gmail.com",
      role: "Notaris Utama",
      status: "Aktif",
      initial: "KN",
      password: "password123",
      permissions: [
        "Melihat Anggota",
        "Menambahkan Anggota",
        "Mengedit Anggota",
        "Menghapus Anggota",
        "Melihat Isi Data Web",
        "Mengedit Isi Data Web",
      ],
    },
    {
      id: "T-3",
      name: "Budi Santoso",
      email: "budi.notaris@gmail.com",
      role: "Asisten Notariat",
      status: "Aktif",
      initial: "BS",
      password: "password123",
      permissions: [
        "Melihat Anggota",
        "Menambahkan Anggota",
        "Mengedit Anggota",
        "Menghapus Anggota",
        "Melihat Isi Data Web",
        "Mengedit Isi Data Web",
      ],
    },
    {
      id: "T-4",
      name: "Siti Rahma",
      email: "siti.rahma.notaris@gmail.com",
      role: "Staf Administrasi",
      status: "Aktif",
      initial: "SR",
      password: "password123",
      permissions: ["Melihat Anggota"],
    },
    {
      id: "T-5",
      name: "Fajar Nugraha",
      email: "fajar.nugraha.notaris@gmail.com",
      role: "Arsiparis & Verifikator",
      status: "Aktif",
      initial: "FN",
      password: "password123",
      permissions: ["Melihat Anggota"],
    },
  ];

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(defaultTeamMembers);

  useEffect(() => {
    profileService.getAll().then((data) => {
      if (!data || data.length === 0) {
        setTeamMembers(defaultTeamMembers);
        return;
      }
      const superAdmin: TeamMember = defaultTeamMembers[0];
      const knisaAdmin: TeamMember = defaultTeamMembers[1];
      const hasSuper = data.some((m) => m.email.toLowerCase() === "dedesk159@gmail.com");
      const hasKnisa = data.some((m) => m.email.toLowerCase() === "knisa7816@gmail.com");

      let merged = [...data];
      if (!hasSuper) merged = [superAdmin, ...merged];
      if (!hasKnisa) merged = [knisaAdmin, ...merged];

      setTeamMembers(merged);
    });
  }, []);

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [invitePermissions, setInvitePermissions] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmail, setEditingEmail] = useState("");

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail || !invitePassword || !inviteRole) {
      alert("Semua field wajib diisi");
      return;
    }
    if (!inviteEmail.toLowerCase().endsWith("@gmail.com")) {
      alert("Email wajib menggunakan Gmail (@gmail.com)");
      return;
    }
    if (invitePassword.length < 6) {
      alert("Kata sandi harus minimal 6 karakter");
      return;
    }

    const saved = localStorage.getItem("registered_users");
    let currentUsers: any[] = [];
    if (saved) {
      currentUsers = JSON.parse(saved);
    }

    if (isEditing) {
      if (inviteEmail.toLowerCase() !== editingEmail.toLowerCase() && currentUsers.some(u => u.email.toLowerCase() === inviteEmail.toLowerCase())) {
        alert("Email tersebut sudah terdaftar di sistem.");
        return;
      }

      const updatedUsers = currentUsers.map((u: any) => {
        if (u.email.toLowerCase() === editingEmail.toLowerCase()) {
          return {
            name: inviteName,
            email: inviteEmail,
            password: invitePassword,
            role: inviteRole,
            permissions: invitePermissions
          };
        }
        return u;
      });
      localStorage.setItem("registered_users", JSON.stringify(updatedUsers));

      if (currentUser && currentUser.email.toLowerCase() === editingEmail.toLowerCase()) {
        const updatedSession = {
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
          permissions: invitePermissions
        };
        localStorage.setItem("current_user_session", JSON.stringify(updatedSession));
        setCurrentUser(updatedSession);
      }

      const initials = inviteName
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();

      setTeamMembers(teamMembers.map((m) => {
        if (m.email.toLowerCase() === editingEmail.toLowerCase()) {
          return {
            ...m,
            name: inviteName,
            role: inviteRole,
            email: inviteEmail,
            initial: initials || "U",
            permissions: invitePermissions
          };
        }
        return m;
      }));

      // Simpan pembaruan anggota ke Supabase Database (PostgreSQL)
      const targetMember = teamMembers.find(m => m.email.toLowerCase() === editingEmail.toLowerCase());
      profileService.upsertProfile({
        id: targetMember?.id || `user-id-${inviteEmail}`,
        email: inviteEmail,
        name: inviteName,
        role: inviteRole,
        initial: initials || "U",
        status: "Aktif",
        permissions: invitePermissions,
      }).catch(err => console.error("Gagal update profil di Supabase:", err));

      alert(`Data anggota ${inviteName} berhasil diperbarui!`);
    } else {
      if (currentUsers.some(u => u.email.toLowerCase() === inviteEmail.toLowerCase())) {
        alert("Email tersebut sudah terdaftar di sistem.");
        return;
      }

      const newUser = {
        name: inviteName,
        email: inviteEmail,
        password: invitePassword,
        role: inviteRole,
        permissions: invitePermissions
      };

      const updatedUsers = [...currentUsers, newUser];
      localStorage.setItem("registered_users", JSON.stringify(updatedUsers));

      const initials = inviteName
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();
        
      const newMember: TeamMember = {
        id: `T-${updatedUsers.length}`,
        name: inviteName,
        role: inviteRole,
        email: inviteEmail,
        status: "Aktif",
        initial: initials || "U",
        permissions: invitePermissions
      };

      setTeamMembers([...teamMembers, newMember]);

      // 1) Simpan anggota baru ke tabel Supabase (PostgreSQL) asli
      const newId = `user-id-${Date.now()}`;
      profileService.upsertProfile({
        id: newId,
        email: inviteEmail,
        name: inviteName,
        role: inviteRole,
        initial: initials || "U",
        status: "Aktif",
        permissions: invitePermissions,
      }).catch(err => console.error("Gagal menyimpan profil di Supabase:", err));

      // 2) Mendaftarkan akun di Supabase Auth secara otomatis
      supabase.auth.signUp({
        email: inviteEmail,
        password: invitePassword,
        options: {
          data: {
            name: inviteName,
            role: inviteRole,
            permissions: invitePermissions,
          },
        },
      }).catch(err => console.warn("Supabase Auth signUp info:", err));

      alert(`Anggota tim ${inviteName} berhasil diundang dan didaftarkan ke Supabase Database!`);
    }
    
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setInviteName("");
    setInviteEmail("");
    setInvitePassword("");
    setInviteRole("");
    setInvitePermissions([]);
    setIsEditing(false);
    setEditingEmail("");
    setShowInviteModal(false);
  };

  const handleOpenEditModal = (member: TeamMember) => {
    const saved = localStorage.getItem("registered_users");
    let password = "password123";
    if (saved) {
      try {
        const users = JSON.parse(saved);
        const match = users.find((u: any) => u.email.toLowerCase() === member.email.toLowerCase());
        if (match && match.password) {
          password = match.password;
        }
      } catch (e) {
        console.error(e);
      }
    }

    setInviteName(member.name);
    setInviteEmail(member.email);
    setInvitePassword(password);
    setInviteRole(member.role);
    setInvitePermissions(member.permissions || []);
    setIsEditing(true);
    setEditingEmail(member.email);
    setShowInviteModal(true);
  };

  const handleDeleteMember = (emailToDelete: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus anggota tim ini dari sistem?")) {
      const saved = localStorage.getItem("registered_users");
      if (saved) {
        try {
          const users = JSON.parse(saved);
          const updatedUsers = users.filter((u: any) => u.email.toLowerCase() !== emailToDelete.toLowerCase());
          localStorage.setItem("registered_users", JSON.stringify(updatedUsers));
          
          setTeamMembers(teamMembers.filter(m => m.email.toLowerCase() !== emailToDelete.toLowerCase()));

          // Hapus juga dari Supabase Database asli
          supabase.from("profiles").delete().eq("email", emailToDelete).then(() => {});

          alert("Anggota tim berhasil dihapus.");
        } catch (e) {
          console.error(e);
        }
      }
    }
  };
  

  const [activeTab, setActiveTab] = useState<"dashboard" | "bukutamu" | "daftarakta" | "proyek" | "analisis" | "tim" | "pengaturan" | "daftarwasiat" | "suratdibukukan" | "suratdisahkan" | "daftarprotes" | "klapperakta" | "klappersuratdisahkan" | "daftarcv" | "daftarpt" | "daftaryayasan" | "daftarhibah" | "progrespekerjaan" | "daftarsurat" | "copiecollationnee" | "daftarank">("dashboard");
  const [jobs, setJobs] = useState<JobProgressEntry[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [autoOpenForm, setAutoOpenForm] = useState(false);
  const [repertoriumOpen, setRepertoriumOpen] = useState(false);

  // Guestbook State
  const [guestBook, setGuestBook] = useState<GuestBookEntry[]>([]);

  // Edit coordinator state
  const [editInitialGuest, setEditInitialGuest] = useState<GuestBookEntry | null>(null);



  // Projects State for Project List tab
  const [projects, setProjects] = useState<Project[]>([]);

  // Activity Log State
  const [activities, setActivities] = useState<Activity[]>([]);





  // Handler to add a new project
  const handleAddNewProject = () => {
    const projectNames = [
      "Pembuatan Akta Waris Keluarga Harahap",
      "Pemberkasan Akta Jual Beli Ruko Harmoni",
      "Pendirian PT Nusantara Abadi",
      "Penyusunan Akta Hibah Kebun Kelapa",
      "Legalisasi Dokumen Kerja Sama Dagang"
    ];
    const categories = ["Wasiat & Waris", "PPAT / Agraria", "Notariat", "Hibah", "Legalisasi"];
    const statuses: Project["status"][] = ["Dalam Proses", "Tertunda", "Selesai"];

    const randomIdx = Math.floor(Math.random() * projectNames.length);
    const randomStatusIdx = Math.floor(Math.random() * statuses.length);
    const status = statuses[randomStatusIdx];
    const progress = status === "Selesai" ? 100 : Math.floor(Math.random() * 80) + 10;

    const newProj: Project = {
      id: `DOC-00${projects.length + 1}`,
      name: projectNames[randomIdx],
      category: categories[randomIdx],
      status: status,
      progress: progress,
      dueDate: "20 Agustus 2026",
    };

    setProjects([newProj, ...projects]);
  };

  // Filter projects by search query
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.id.toLowerCase().includes(searchQuery.toLowerCase())
  );





  // Compute guestbook stats
  const [isHydratedPage, setIsHydratedPage] = useState(false);

  useEffect(() => {
    const savedGB = localStorage.getItem("guestbook_data");
    const savedProj = localStorage.getItem("projects_data");
    const savedAct = localStorage.getItem("activities_data");
    const savedJobs = localStorage.getItem("jobs_data");

    let fallbackGB: GuestBookEntry[] = [];
    if (savedGB) {
      try { fallbackGB = JSON.parse(savedGB); } catch (e) {}
    }

    // Ambil data Buku Tamu dan Progres Pekerjaan asli dari database Supabase (tanpa data fiktif)
    guestBookService.getAll([]).then((data) => {
      setGuestBook(data);
    });
    jobProgressService.getAll().then((data) => {
      setJobs(data);
    });

    if (savedProj) { try { setProjects(JSON.parse(savedProj)); } catch (e) {} }
    if (savedAct) { try { setActivities(JSON.parse(savedAct)); } catch (e) {} }
    setIsHydratedPage(true);
  }, []);

  // Live Realtime Auto-Sync antar pengguna
  useRealtimeSync("guest_books", () => {
    guestBookService.getAll([]).then((data) => {
      setGuestBook(data);
    });
  });

  useRealtimeSync("job_progress", () => {
    jobProgressService.getAll().then((data) => {
      setJobs(data);
    });
  });

  useRealtimeSync("profiles", () => {
    profileService.getAll().then((data) => {
      if (data && data.length > 0) setTeamMembers(data);
    });
  });

  useEffect(() => {
    if (isHydratedPage) {
      localStorage.setItem("guestbook_data", JSON.stringify(guestBook));
    }
  }, [guestBook, isHydratedPage]);

  useEffect(() => {
    if (isHydratedPage) {
      localStorage.setItem("projects_data", JSON.stringify(projects));
    }
  }, [projects, isHydratedPage]);

  useEffect(() => {
    if (isHydratedPage) {
      localStorage.setItem("activities_data", JSON.stringify(activities));
    }
  }, [activities, isHydratedPage]);

  useEffect(() => {
    if (isHydratedPage) {
      localStorage.setItem("jobs_data", JSON.stringify(jobs));
    }
  }, [jobs, isHydratedPage]);

  const totalGuests = guestBook.length;
  const waitingCount = guestBook.filter(g => g.status === "Menunggu").length;
  const inProgressCount = guestBook.filter(g => g.status === "Diproses").length;
  const completedCount = guestBook.filter(g => g.status === "Selesai").length;

  return (
    <div className={styles.container}>

      {/* Sidebar Navigation */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarActive : ""}`}>
        <div className={styles.sidebarContent}>

          <div>
            <div className={styles.sidebarHeader}>
              <div className={styles.logoArea}>
                <div className={styles.logoIcon}>K</div>
                <span className={styles.brandName}>Kanot.KNA.153</span>
              </div>
              <button
                className={styles.closeSidebarBtn}
                onClick={() => setSidebarOpen(false)}
                aria-label="Tutup sidebar"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <nav className={styles.nav}>
              <button
                onClick={() => { setActiveTab("dashboard"); setSidebarOpen(false); }}
                className={`${styles.navLink} ${activeTab === "dashboard" ? styles.activeNavLink : ""}`}
              >
                <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Dashboard
              </button>

              {currentUser?.permissions?.includes("Melihat Isi Data Web") && (
                <>
                  <button
                    onClick={() => { setActiveTab("bukutamu"); setSidebarOpen(false); }}
                    className={`${styles.navLink} ${activeTab === "bukutamu" ? styles.activeNavLink : ""}`}
                  >
                    <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    Buku Tamu
                  </button>

              <button
                onClick={() => { setActiveTab("progrespekerjaan"); setSidebarOpen(false); }}
                className={`${styles.navLink} ${activeTab === "progrespekerjaan" ? styles.activeNavLink : ""}`}
              >
                <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="9"></line>
                  <line x1="9" y1="13" x2="15" y2="13"></line>
                  <line x1="9" y1="17" x2="15" y2="17"></line>
                </svg>
                Buku Progres Pekerjaan
              </button>

              <button
                onClick={() => { setActiveTab("daftarsurat"); setSidebarOpen(false); }}
                className={`${styles.navLink} ${activeTab === "daftarsurat" ? styles.activeNavLink : ""}`}
              >
                <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Buku Daftar Surat
              </button>


              {/* DROPDOWN: REPERTORIUM */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <button
                  type="button"
                  onClick={() => setRepertoriumOpen(!repertoriumOpen)}
                  className={`${styles.navLink} ${["daftarakta", "daftarwasiat", "suratdibukukan", "suratdisahkan", "daftarprotes", "klapperakta", "klappersuratdisahkan", "copiecollationnee"].includes(activeTab)
                      ? styles.activeNavLink
                      : ""
                    }`}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>Reportorium</span>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: (repertoriumOpen || ["daftarakta", "daftarwasiat", "suratdibukukan", "suratdisahkan", "daftarprotes", "klapperakta", "klappersuratdisahkan", "copiecollationnee"].includes(activeTab)) ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      color: "#94a3b8"
                    }}
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>

                {(repertoriumOpen || ["daftarakta", "daftarwasiat", "suratdibukukan", "suratdisahkan", "daftarprotes", "klapperakta", "klappersuratdisahkan", "copiecollationnee"].includes(activeTab)) && (
                  <div className={styles.subNavContainer}>
                    <button
                      onClick={() => { setActiveTab("daftarakta"); setSidebarOpen(false); }}
                      className={`${styles.subNavLink} ${activeTab === "daftarakta" ? styles.activeSubNavLink : ""}`}
                    >
                      Daftar Akta
                    </button>

                    <button
                      onClick={() => { setActiveTab("daftarwasiat"); setSidebarOpen(false); }}
                      className={`${styles.subNavLink} ${activeTab === "daftarwasiat" ? styles.activeSubNavLink : ""}`}
                    >
                      Daftar Wasiat
                    </button>

                    <button
                      onClick={() => { setActiveTab("suratdibukukan"); setSidebarOpen(false); }}
                      className={`${styles.subNavLink} ${activeTab === "suratdibukukan" ? styles.activeSubNavLink : ""}`}
                    >
                      Daftar Surat Dibukukan
                    </button>

                    <button
                      onClick={() => { setActiveTab("suratdisahkan"); setSidebarOpen(false); }}
                      className={`${styles.subNavLink} ${activeTab === "suratdisahkan" ? styles.activeSubNavLink : ""}`}
                    >
                      Daftar Surat Disahkan
                    </button>

                    <button
                      onClick={() => { setActiveTab("daftarprotes"); setSidebarOpen(false); }}
                      className={`${styles.subNavLink} ${activeTab === "daftarprotes" ? styles.activeSubNavLink : ""}`}
                    >
                      Daftar Protes
                    </button>

                    <button
                      onClick={() => { setActiveTab("klapperakta"); setSidebarOpen(false); }}
                      className={`${styles.subNavLink} ${activeTab === "klapperakta" ? styles.activeSubNavLink : ""}`}
                    >
                      Klapper Akta
                    </button>

                    <button
                      onClick={() => { setActiveTab("klappersuratdisahkan"); setSidebarOpen(false); }}
                      className={`${styles.subNavLink} ${activeTab === "klappersuratdisahkan" ? styles.activeSubNavLink : ""}`}
                    >
                      Klapper Surat Disahkan
                    </button>

                    <button
                      onClick={() => { setActiveTab("copiecollationnee"); setSidebarOpen(false); }}
                      className={`${styles.subNavLink} ${activeTab === "copiecollationnee" ? styles.activeSubNavLink : ""}`}
                    >
                      Copie Collationnee
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => { setActiveTab("daftarcv"); setSidebarOpen(false); }}
                className={`${styles.navLink} ${activeTab === "daftarcv" ? styles.activeNavLink : ""}`}
              >
                <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Buku Daftar CV
              </button>

              <button
                onClick={() => { setActiveTab("daftarpt"); setSidebarOpen(false); }}
                className={`${styles.navLink} ${activeTab === "daftarpt" ? styles.activeNavLink : ""}`}
              >
                <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Buku Daftar PT
              </button>

              <button
                onClick={() => { setActiveTab("daftaryayasan"); setSidebarOpen(false); }}
                className={`${styles.navLink} ${activeTab === "daftaryayasan" ? styles.activeNavLink : ""}`}
              >
                <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Buku Daftar Yayasan
              </button>

              <button
                onClick={() => { setActiveTab("daftarhibah"); setSidebarOpen(false); }}
                className={`${styles.navLink} ${activeTab === "daftarhibah" ? styles.activeNavLink : ""}`}
              >
                <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Buku Daftar Hibah
              </button>

              <button
                onClick={() => { setActiveTab("daftarank"); setSidebarOpen(false); }}
                className={`${styles.navLink} ${activeTab === "daftarank" ? styles.activeNavLink : ""}`}
              >
                <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Buku Daftar Pengangkatan Anak
              </button>
            </>
          )}



              {currentUser?.permissions?.includes("Melihat Anggota") && (
                <button
                  onClick={() => { setActiveTab("tim"); setSidebarOpen(false); }}
                  className={`${styles.navLink} ${activeTab === "tim" ? styles.activeNavLink : ""}`}
                >
                  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Tim Kolaborasi
                </button>
              )}

              <button
                onClick={() => { setActiveTab("pengaturan"); setSidebarOpen(false); }}
                className={`${styles.navLink} ${activeTab === "pengaturan" ? styles.activeNavLink : ""}`}
              >
                <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Pengaturan
              </button>
            </nav>
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>{currentUser?.name ? currentUser.name.split(" ").map((w: string) => w.charAt(0)).join("").substring(0, 2).toUpperCase() : "KN"}</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{currentUser ? currentUser.name : "Khairun Nisa, S.H., M.Kn."}</span>
                <span className={styles.userRole}>{currentUser ? currentUser.role : "Notaris Utama"}</span>
              </div>
            </div>

            <button
              className={styles.logoutBtn}
              onClick={async () => {
                document.cookie = "kanot_super_admin=; path=/; max-age=0";
                localStorage.removeItem("super_admin_session");
                await supabase.auth.signOut();
                router.replace("/login");
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Keluar
            </button>
          </div>

        </div>
      </aside>

      {/* Main Content Pane */}
      <div className={styles.mainContent}>

        {/* Header Bar */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.hamburgerBtn}
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            <div className={styles.searchBar}>
              <svg className={styles.searchIcon} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder={
                  activeTab === "dashboard"
                    ? "Cari nama, alamat, atau keperluan klien..."
                    : activeTab === "proyek"
                      ? "Cari nama proyek atau kategori..."
                      : "Cari sesuatu..."
                }
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.headerRight}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 0.85rem",
              borderRadius: "9999px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              color: "#059669",
              fontSize: "0.8rem",
              fontWeight: "600",
              cursor: "default"
            }} title="Sinkronisasi real-time cloud antar pengguna aktif">
              <span style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                display: "inline-block",
                boxShadow: "0 0 8px #10b981"
              }} />
              <span>Live Sync Aktif</span>
            </div>

            <button className={styles.notificationBtn} onClick={() => alert("Notifikasi (Mock)")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <div className={styles.notificationBadge}></div>
            </button>

            <button className={styles.quickActionBtn} onClick={() => setActiveTab("bukutamu")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              Buku Tamu
            </button>
          </div>
        </header>

        {/* Dashboard Dynamic Views */}
        <main className={`${styles.contentBody} ${!currentUser?.permissions?.includes("Mengedit Isi Data Web") && activeTab !== "tim" && activeTab !== "pengaturan" ? "readonly-content-container" : ""}`}>

          {!currentUser?.permissions?.includes("Mengedit Isi Data Web") && activeTab !== "tim" && activeTab !== "pengaturan" && (
            <div style={{
              backgroundColor: "#fffbeb",
              border: "1px solid #fef3c7",
              color: "#b45309",
              padding: "0.75rem 1.25rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.85rem",
              fontWeight: "600",
              width: "100%"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>Mode Baca-Saja: Akun Anda tidak memiliki hak akses untuk mengubah data web pada sistem ini.</span>
            </div>
          )}

          {!currentUser?.permissions?.includes("Mengedit Isi Data Web") && activeTab !== "tim" && activeTab !== "pengaturan" && (
            <style>{`
              .readonly-content-container button:not(.detail-btn):not(.close-btn):not(.view-btn), 
              .readonly-content-container input:not(.searchInput):not([type="search"]), 
              .readonly-content-container select:not(.yearSelect):not(.monthSelect), 
              .readonly-content-container textarea {
                pointer-events: none !important;
                opacity: 0.65;
                cursor: not-allowed !important;
              }
            `}</style>
          )}

          {!currentUser?.permissions?.includes("Melihat Isi Data Web") && activeTab !== "tim" && activeTab !== "pengaturan" && activeTab !== "dashboard" && (
            <div className={styles.cardSection} style={{ textAlign: "center", padding: "3rem", margin: "2rem auto", maxWidth: "500px" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
              <h2 className={styles.cardTitle} style={{ fontSize: "1.5rem", color: "#0f172a" }}>Akses Ditolak</h2>
              <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                Akun Anda tidak memiliki hak akses "Melihat Isi Data Web" yang diperlukan untuk melihat halaman ini. Silakan hubungi Notaris Utama untuk mendapatkan izin.
              </p>
            </div>
          )}

          {/* TAB 1: OVERVIEW DASHBOARD - Buku Tamu & Registrasi Klien */}
          {activeTab === "dashboard" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <>
              {/* Welcome Section */}
              <div className={styles.welcomeSection} style={{ marginBottom: "1.5rem" }}>
                <h1 className={styles.welcomeTitle}>Halo, {currentUser ? currentUser.name : "Khairun Nisa, S.H., M.Kn."}</h1>
                <p className={styles.welcomeSubtitle}>Berikut adalah ringkasan data buku tamu, kelengkapan berkas, dan aktivitas hari ini.</p>
              </div>

              {/* Row 1: Quick Access Grid (Top) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>

                {/* Access 1: Buku Tamu */}
                <div
                  onClick={() => setActiveTab("bukutamu")}
                  className={styles.cardSection}
                  style={{
                    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                    borderColor: "#bfdbfe",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "1.25rem",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(37, 99, 235, 0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <div style={{ backgroundColor: "#2563eb", color: "#ffffff", padding: "0.4rem", borderRadius: "0.375rem", display: "inline-flex" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <h4 style={{ margin: 0, fontWeight: "700", color: "#1e3a8a", fontSize: "0.95rem" }}>Buku Tamu Klien</h4>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#1e40af", lineHeight: "1.4", margin: 0 }}>
                      Registrasi kedatangan tamu, konsultasi awal, dan pencatatan keperluan kunjungan klien.
                    </p>
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#2563eb", marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    Buka Buku Tamu →
                  </span>
                </div>

                {/* Access 2: Buku Progres Pekerjaan */}
                <div
                  onClick={() => setActiveTab("progrespekerjaan")}
                  className={styles.cardSection}
                  style={{
                    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                    borderColor: "#bbf7d0",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "1.25rem",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(22, 163, 74, 0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <div style={{ backgroundColor: "#16a34a", color: "#ffffff", padding: "0.4rem", borderRadius: "0.375rem", display: "inline-flex" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="9" y1="9" x2="15" y2="9"></line>
                          <line x1="9" y1="13" x2="15" y2="13"></line>
                          <line x1="9" y1="17" x2="15" y2="17"></line>
                        </svg>
                      </div>
                      <h4 style={{ margin: 0, fontWeight: "700", color: "#14532d", fontSize: "0.95rem" }}>Progres Berkas</h4>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#15803d", lineHeight: "1.4", margin: 0 }}>
                      Pantau kelengkapan checklist dokumen persyaratan, riwayat aktivitas, dan upload foto berkas asli.
                    </p>
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#16a34a", marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    Buka Buku Progres →
                  </span>
                </div>

                {/* Access 3: Repertorium Akta */}
                <div
                  onClick={() => setActiveTab("daftarakta")}
                  className={styles.cardSection}
                  style={{
                    background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
                    borderColor: "#ddd6fe",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "1.25rem",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(124, 58, 237, 0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <div style={{ backgroundColor: "#7c3aed", color: "#ffffff", padding: "0.4rem", borderRadius: "0.375rem", display: "inline-flex" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                      <h4 style={{ margin: 0, fontWeight: "700", color: "#4c1d95", fontSize: "0.95rem" }}>Buku Daftar Akta</h4>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#6d28d9", lineHeight: "1.4", margin: 0 }}>
                      Catat lembaran Repertorium Akta Notaris resmi lengkap dengan nomor bulanan dan nama penghadap.
                    </p>
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#7c3aed", marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    Buka Daftar Akta →
                  </span>
                </div>

                {/* Access 4: Klapper Buku Daftar */}
                <div
                  onClick={() => setActiveTab("klapperakta")}
                  className={styles.cardSection}
                  style={{
                    background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                    borderColor: "#fed7aa",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "1.25rem",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(234, 88, 12, 0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <div style={{ backgroundColor: "#ea580c", color: "#ffffff", padding: "0.4rem", borderRadius: "0.375rem", display: "inline-flex" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="9" y1="9" x2="15" y2="9"></line>
                          <line x1="9" y1="13" x2="15" y2="13"></line>
                          <line x1="9" y1="17" x2="15" y2="17"></line>
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                      </div>
                      <h4 style={{ margin: 0, fontWeight: "700", color: "#7c2d12", fontSize: "0.95rem" }}>Klapper Abjad</h4>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#c2410c", lineHeight: "1.4", margin: 0 }}>
                      Indeksasi abjad nama klien dan penghadap berdasarkan huruf awal nama untuk mempercepat pencarian arsip.
                    </p>
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#ea580c", marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    Buka Klapper Akta →
                  </span>
                </div>

                {/* Access 5: Buku Daftar Surat */}
                <div
                  onClick={() => setActiveTab("daftarsurat")}
                  className={styles.cardSection}
                  style={{
                    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                    borderColor: "#cbd5e1",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "1.25rem",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(71, 85, 105, 0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <div style={{ backgroundColor: "#475569", color: "#ffffff", padding: "0.4rem", borderRadius: "0.375rem", display: "inline-flex" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                      <h4 style={{ margin: 0, fontWeight: "700", color: "#334155", fontSize: "0.95rem" }}>Buku Daftar Surat</h4>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#475569", lineHeight: "1.4", margin: 0 }}>
                      Registrasi persuratan kantor, kelola surat masuk & keluar, perihal, asal, dan tujuan surat.
                    </p>
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#475569", marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    Buka Daftar Surat →
                  </span>
                </div>

              </div>

              {/* Row 2: Metrics Grid (Middle) */}
              <div className={styles.metricsGrid} style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "1.5rem" }}>

                {/* Metric 1 */}
                <div className={styles.metricCard}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricTitle}>Total Klien Keseluruhan</span>
                    <div className={`${styles.metricIconWrapper} ${styles.blueIcon}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                  </div>
                  <div className={styles.metricValue}>{totalGuests}</div>
                  <div className={styles.metricFooter}>
                    <span className={styles.trendUp}>Buku Tamu</span>
                    <span className={styles.trendText}>kunjungan terdaftar</span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className={styles.metricCard}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricTitle}>Total Klien Bulan Ini</span>
                    <div className={`${styles.metricIconWrapper} ${styles.greenIcon}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                  </div>
                  <div className={styles.metricValue}>{totalGuests}</div>
                  <div className={styles.metricFooter}>
                    <span className={styles.trendUp} style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
                      {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                    </span>
                    <span className={styles.trendText}>periode bulan berjalan</span>
                  </div>
                </div>

                {/* Metric 3: Active Job Progresses */}
                <div className={styles.metricCard}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricTitle}>Pekerjaan Aktif Diproses</span>
                    <div className={`${styles.metricIconWrapper} ${styles.orangeIcon}`} style={{ backgroundColor: "#fff7ed", color: "#ea580c" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="9"></line>
                        <line x1="9" y1="13" x2="15" y2="13"></line>
                        <line x1="9" y1="17" x2="15" y2="17"></line>
                      </svg>
                    </div>
                  </div>
                  <div className={styles.metricValue}>
                    {jobs.filter((j) => j.progress < 100).length}
                  </div>
                  <div className={styles.metricFooter}>
                    <span className={styles.trendDown} style={{ backgroundColor: "#ffedd5", color: "#ea580c" }}>
                      Dalam Proses
                    </span>
                    <span className={styles.trendText}>butuh tindak lanjut</span>
                  </div>
                </div>

              </div>

              {/* Row 3: Activity & Staff Grid (Bottom) */}
              <div className={styles.activityGrid}>
                {/* Left Column: Recent Activities */}
                <div className={styles.cardSection}>
                  <h2 className={styles.cardTitle} style={{ marginBottom: "1.25rem" }}>Aktivitas Terbaru</h2>
                  <div className={styles.activityList}>
                    {activities.map((activity) => (
                      <div key={activity.id} className={styles.activityItem}>
                        <div className={`${styles.activityDot} ${activity.type === "green"
                            ? styles.dotGreen
                            : activity.type === "orange"
                              ? styles.dotOrange
                              : styles.dotBlue
                          }`}></div>
                        <div className={styles.activityDetails}>
                          <span className={styles.activityText}>
                            <strong>{activity.user}</strong> {activity.action} <strong>{activity.target}</strong>
                          </span>
                          <span className={styles.activityTime}>{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Active Staff Status */}
                <div className={styles.cardSection}>
                  <h2 className={styles.cardTitle} style={{ marginBottom: "1.25rem" }}>Tim Kolaborasi Aktif</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {teamMembers.map((member) => (
                      <div key={member.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: member.id !== "T-5" ? "1px solid #f1f5f9" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", backgroundColor: "#eff6ff", color: "#2563eb", fontWeight: "bold", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {member.initial}
                          </div>
                          <div>
                            <span style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#0f172a" }}>{member.name}</span>
                            <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b" }}>{member.role}</span>
                          </div>
                        </div>
                        <span style={{
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "9999px",
                          backgroundColor: member.status === "Aktif" ? "#dcfce7" : member.status === "Sibuk" ? "#fff7ed" : "#f1f5f9",
                          color: member.status === "Aktif" ? "#16a34a" : member.status === "Sibuk" ? "#ea580c" : "#64748b"
                        }}>
                          {member.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          )}

          {/* TAB: BUKU TAMU DENGAN FILTER TAHUN DAN BULAN */}
          {activeTab === "bukutamu" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <GuestBookTab
              guestBook={guestBook}
              setGuestBook={setGuestBook}
              activities={activities}
              setActivities={setActivities}
              editInitialGuest={editInitialGuest}
              onEditFinished={() => setEditInitialGuest(null)}
              autoOpenForm={autoOpenForm}
              onFormOpenedHandled={() => setAutoOpenForm(false)}
            />
          )}

          {/* TAB: BUKU DAFTAR AKTA */}
          {activeTab === "daftarakta" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <DeedListTab
              guestBook={guestBook}
              setGuestBook={setGuestBook}
              activities={activities}
              setActivities={setActivities}
              onTriggerEdit={(guest) => {
                setActiveTab("bukutamu");
                setEditInitialGuest(guest);
              }}
              onTriggerDelete={(id) => {
                const targetGuest = guestBook.find(g => g.id === id);
                if (confirm(`Apakah Anda yakin ingin menghapus data klien "${targetGuest?.name || id}"?`)) {
                  setGuestBook(guestBook.filter((guest) => guest.id !== id));

                  if (targetGuest) {
                    const newActivity: Activity = {
                      id: `act-${Date.now()}`,
                      user: "Anda",
                      action: "menghapus data klien",
                      target: targetGuest.name,
                      time: "Baru saja",
                      type: "red",
                    };
                    setActivities([newActivity, ...activities]);
                  }
                }
              }}
            />
          )}

          {/* TAB: DAFTAR WASIAT */}
          {activeTab === "daftarwasiat" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <WillsListTab guestBook={guestBook} />
          )}

          {/* TAB: SURAT DI BAWAH TANGAN YANG DIBUKUKAN */}
          {activeTab === "suratdibukukan" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <PrivateAgreementListTab guestBook={guestBook} />
          )}

          {/* TAB: SURAT DI BAWAH TANGAN YANG DISAHKAN */}
          {activeTab === "suratdisahkan" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <LegalizedAgreementListTab guestBook={guestBook} />
          )}

          {/* TAB: DAFTAR PROTES */}
          {activeTab === "daftarprotes" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <ProtestListTab guestBook={guestBook} />
          )}

          {/* TAB: KLAPPER AKTA */}
          {activeTab === "klapperakta" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <KlapperListTab guestBook={guestBook} />
          )}

          {/* TAB: KLAPPER SURAT DISAHKAN */}
          {activeTab === "klappersuratdisahkan" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <KlapperLegalizedListTab guestBook={guestBook} />
          )}

          {/* TAB: BUKU DAFTAR CV */}
          {activeTab === "daftarcv" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <CvListTab guestBook={guestBook} />
          )}

          {/* TAB: BUKU DAFTAR PT */}
          {activeTab === "daftarpt" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <PtListTab guestBook={guestBook} />
          )}

          {/* TAB: BUKU DAFTAR YAYASAN */}
          {activeTab === "daftaryayasan" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <YayasanListTab guestBook={guestBook} />
          )}

          {/* TAB: BUKU DAFTAR HIBAH */}
          {activeTab === "daftarhibah" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <HibahListTab guestBook={guestBook} />
          )}

          {/* TAB: BUKU PROGRES PEKERJAAN */}
          {activeTab === "progrespekerjaan" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <JobProgressTab guestBook={guestBook} jobs={jobs} setJobs={setJobs} />
          )}

          {/* TAB: BUKU DAFTAR SURAT */}
          {activeTab === "daftarsurat" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <MailListTab />
          )}

          {/* TAB: COPIE COLLATIONNEE */}
          {activeTab === "copiecollationnee" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <CopieCollationneeListTab />
          )}

          {/* TAB: BUKU DAFTAR PENGANGKATAN ANAK */}
          {activeTab === "daftarank" && currentUser?.permissions?.includes("Melihat Isi Data Web") && (
            <ChildAdoptionListTab />
          )}

          {/* TAB 2: PROJECTS VIEW */}
          {activeTab === "proyek" && (
            <div className={styles.cardSection}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle} style={{ fontSize: "1.5rem" }}>Semua Proyek Aktif</h2>
                  <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                    Menampilkan {filteredProjects.length} proyek yang terdaftar di workspace Anda.
                  </p>
                </div>
                <button className={styles.quickActionBtn} onClick={handleAddNewProject}>
                  + Tambah Proyek
                </button>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.projectTable}>
                  <thead>
                    <tr>
                      <th>ID Proyek</th>
                      <th>Nama Proyek</th>
                      <th>Kategori</th>
                      <th>Status</th>
                      <th>Progres</th>
                      <th>Batas Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr key={project.id}>
                        <td style={{ fontWeight: "700", color: "#64748b" }}>{project.id}</td>
                        <td style={{ fontWeight: "600", color: "#0f172a" }}>{project.name}</td>
                        <td style={{ color: "#475569" }}>{project.category}</td>
                        <td>
                          <span className={`${styles.badge} ${project.status === "Selesai"
                              ? styles.badgeSuccess
                              : project.status === "Dalam Proses"
                                ? styles.badgeInfo
                                : styles.badgeWarning
                            }`}>
                            {project.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.progressContainer} style={{ width: "150px" }}>
                            <div className={styles.progressBar}>
                              <div
                                className={`${styles.progressFill} ${project.status === "Selesai"
                                    ? styles.progressFillGreen
                                    : project.status === "Dalam Proses"
                                      ? styles.progressFillBlue
                                      : styles.progressFillOrange
                                  }`}
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className={styles.progressText}>{project.progress}%</span>
                          </div>
                        </td>
                        <td>{project.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PERFORMANCE ANALYTICS */}
          {activeTab === "analisis" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className={styles.cardSection}>
                <h2 className={styles.cardTitle} style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Statistik Produktivitas Tim</h2>
                <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "2rem" }}>
                  Kecepatan pengerjaan tugas selesai dalam 6 bulan terakhir.
                </p>

                {/* Mock Chart using CSS grid and bars */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "250px", padding: "1rem 2rem", backgroundColor: "#f8fafc", borderRadius: "0.75rem", border: "1px dashed #cbd5e1" }}>
                  {[
                    { month: "Januari", val: 45 },
                    { month: "Februari", val: 62 },
                    { month: "Maret", val: 55 },
                    { month: "April", val: 78 },
                    { month: "Mei", val: 90 },
                    { month: "Juni", val: 110 }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#2563eb" }}>{item.val} Tugas</span>
                      <div style={{
                        width: "60%",
                        height: `${(item.val / 120) * 180}px`,
                        background: "linear-gradient(to top, #2563eb, #60a5fa)",
                        borderRadius: "0.375rem 0.375rem 0 0",
                        boxShadow: "0 4px 10px rgba(37, 99, 235, 0.15)",
                        transition: "all 0.5s ease"
                      }}></div>
                      <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b" }}>{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div className={styles.cardSection}>
                  <h3 className={styles.cardTitle} style={{ marginBottom: "1rem" }}>Pembagian Beban Kerja</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {[
                      { name: "UI/UX Design", pct: 35, color: "#3b82f6" },
                      { name: "Backend Dev", pct: 40, color: "#10b981" },
                      { name: "Frontend Dev", pct: 15, color: "#f59e0b" },
                      { name: "Lainnya", pct: 10, color: "#8b5cf6" }
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: "600" }}>
                          <span>{item.name}</span>
                          <span style={{ color: item.color }}>{item.pct}%</span>
                        </div>
                        <div style={{ height: "8px", width: "100%", backgroundColor: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${item.pct}%`, backgroundColor: item.color, borderRadius: "999px" }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.cardSection}>
                  <h3 className={styles.cardTitle} style={{ marginBottom: "1rem" }}>Kepuasan Klien</h3>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "160px", gap: "1rem" }}>
                    <span style={{ fontSize: "3rem", fontWeight: "800", color: "#0f172a" }}>4.8<span style={{ fontSize: "1.5rem", color: "#94a3b8" }}>/5.0</span></span>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} width="24" height="24" viewBox="0 0 24 24" fill={s <= 4 ? "#eab308" : "#cbd5e1"}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "500" }}>Berdasarkan feedback 48 responden proyek</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEAM COLLABORATORS */}
          {activeTab === "tim" && currentUser?.permissions?.includes("Melihat Anggota") && (
            <div className={styles.cardSection}>
              <div className={styles.cardHeader} style={{ marginBottom: "2rem" }}>
                <div>
                  <h2 className={styles.cardTitle} style={{ fontSize: "1.5rem" }}>Anggota Tim Kolaboratif</h2>
                  <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                    Kelola dan lihat informasi kontak tim Anda.
                  </p>
                </div>
                {currentUser?.permissions?.includes("Menambahkan Anggota") && (
                  <button className={styles.quickActionBtn} onClick={() => setShowInviteModal(true)}>
                    + Undang Anggota
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
                {teamMembers.map((member) => (
                  <div key={member.id} style={{ display: "flex", flexDirection: "column", gap: "1rem", border: "1px solid #e2e8f0", padding: "1.5rem", borderRadius: "0.75rem", backgroundColor: "#ffffff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", fontWeight: "700" }}>
                        {member.initial}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                        <span style={{ 
                          fontSize: "0.75rem", 
                          fontWeight: "700", 
                          padding: "0.25rem 0.5rem", 
                          borderRadius: "999px",
                          backgroundColor: onlineUsers.includes(member.email.toLowerCase()) ? "#dcfce7" : member.status === "Sibuk" ? "#ffe4e6" : "#f1f5f9",
                          color: onlineUsers.includes(member.email.toLowerCase()) ? "#16a34a" : member.status === "Sibuk" ? "#e11d48" : "#475569"
                        }}>
                          {onlineUsers.includes(member.email.toLowerCase()) ? "Online" : (member.status === "Sibuk" ? "Sibuk" : "Offline")}
                        </span>
                        <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.25rem" }}>
                          {currentUser?.permissions?.includes("Mengedit Anggota") && (
                            <button
                              onClick={() => handleOpenEditModal(member)}
                              style={{
                                border: "none",
                                background: "none",
                                color: "#2563eb",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                padding: "0.15rem 0.35rem",
                                borderRadius: "0.375rem",
                                backgroundColor: "#eff6ff",
                                transition: "all 0.2s"
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#dbeafe"}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#eff6ff"}
                            >
                              Edit
                            </button>
                          )}
                          {currentUser?.permissions?.includes("Menghapus Anggota") && currentUser.email !== member.email && (
                            <button
                              onClick={() => handleDeleteMember(member.email)}
                              style={{
                                border: "none",
                                background: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                padding: "0.15rem 0.35rem",
                                borderRadius: "0.375rem",
                                backgroundColor: "#fef2f2",
                                transition: "all 0.2s"
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#0f172a" }}>{member.name}</h3>
                      <p style={{ fontSize: "0.85rem", color: "#2563eb", fontWeight: "600", marginTop: "0.125rem" }}>{member.role}</p>
                      <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem" }}>{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS PAGE */}
          {activeTab === "pengaturan" && (
            <div className={styles.cardSection} style={{ maxWidth: "600px" }}>
              <h2 className={styles.cardTitle} style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Pengaturan Akun</h2>
              <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "2rem" }}>
                Perbarui detail personal, profil, dan informasi akun Anda.
              </p>

              <form style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }} onSubmit={(e) => { e.preventDefault(); alert("Pengaturan berhasil disimpan! (Mock)"); }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#334155" }}>Nama Lengkap</label>
                  <input key={currentUser ? currentUser.name : "default-name"} type="text" defaultValue={currentUser ? currentUser.name : "Khairun Nisa, S.H., M.Kn."} style={{ padding: "0.75rem 1rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", outline: "none", fontSize: "0.95rem", backgroundColor: "#ffffff", color: "#000000" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#334155" }}>Email</label>
                  <input key={currentUser ? currentUser.email : "default-email"} type="email" defaultValue={currentUser ? currentUser.email : "khairun.nisa@gmail.com"} style={{ padding: "0.75rem 1rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", outline: "none", fontSize: "0.95rem", backgroundColor: "#ffffff", color: "#000000" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#334155" }}>Peran Jabatan</label>
                  <input key={currentUser ? currentUser.role : "default-role"} type="text" defaultValue={currentUser ? currentUser.role : "Notaris Utama"} style={{ padding: "0.75rem 1rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", outline: "none", fontSize: "0.95rem", backgroundColor: "#ffffff", color: "#000000" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#334155" }}>Zona Waktu</label>
                  <select style={{ padding: "0.75rem 1rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", outline: "none", fontSize: "0.95rem", backgroundColor: "#ffffff" }}>
                    <option>Waktu Indonesia Barat (WIB) - GMT+7</option>
                    <option>Waktu Indonesia Tengah (WITA) - GMT+8</option>
                    <option>Waktu Indonesia Timur (WIT) - GMT+9</option>
                  </select>
                </div>

                <button type="submit" className={styles.quickActionBtn} style={{ marginTop: "1rem", alignSelf: "flex-start" }}>
                  Simpan Perubahan
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* Modal Undang Anggota Baru */}
      {showInviteModal && (
        <div style={{
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
        }} onClick={handleCloseModal}>
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
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "1rem",
            width: "100%",
            maxWidth: "500px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            animation: "slideUpModal 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }} onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "linear-gradient(to right, #f8fafc, #ffffff)"
            }}>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  {isEditing ? "Edit Data Anggota" : "Undang Anggota Tim Baru"}
                </h3>
                <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.15rem 0 0 0" }}>
                  {isEditing ? "Perbarui informasi dan hak akses anggota tim" : "Mendaftarkan akun baru agar dapat masuk ke web"}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  color: "#64748b",
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "1rem"
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleInviteMember} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155" }}>Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rina Pratama, S.H."
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  style={{ padding: "0.625rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", outline: "none", backgroundColor: "#ffffff", color: "#000000" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155" }}>Email Gmail</label>
                <input
                  type="email"
                  required
                  placeholder="Contoh: rina.notaris@gmail.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={{ padding: "0.625rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", outline: "none", backgroundColor: "#ffffff", color: "#000000" }}
                />
              </div>

              {!isEditing && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155" }}>Kata Sandi Masuk</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    style={{ padding: "0.625rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", outline: "none", backgroundColor: "#ffffff", color: "#000000" }}
                  />
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155" }}>Peran Jabatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Staf Lapangan, Arsiparis"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{ padding: "0.625rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem", fontSize: "0.9rem", outline: "none", backgroundColor: "#ffffff", color: "#000000" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155" }}>Hak Akses Fitur</label>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                  padding: "0.75rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.375rem",
                  backgroundColor: "#ffffff",
                  color: "#000000"
                }}>
                  {[
                    "Melihat Anggota",
                    "Mengedit Anggota",
                    "Menambahkan Anggota",
                    "Menghapus Anggota",
                    "Melihat Isi Data Web",
                    "Mengedit Isi Data Web"
                  ].map((perm) => {
                    const isChecked = invitePermissions.includes(perm);
                    return (
                      <label key={perm} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", cursor: "pointer", color: "#334155" }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setInvitePermissions(invitePermissions.filter(p => p !== perm));
                            } else {
                              setInvitePermissions([...invitePermissions, perm]);
                            }
                          }}
                        />
                        {perm}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Form Actions */}
              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
                marginTop: "0.5rem"
              }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.85rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "0.375rem",
                    backgroundColor: "#ffffff",
                    color: "#64748b",
                    cursor: "pointer"
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={styles.quickActionBtn}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.85rem",
                    borderRadius: "0.375rem",
                    cursor: "pointer"
                  }}
                >
                  {isEditing ? "Simpan Perubahan" : "Undang Anggota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
