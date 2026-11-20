"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type IconName =
  | "dashboard"
  | "book"
  | "progress"
  | "mail"
  | "folder"
  | "users"
  | "settings"
  | "search"
  | "bell"
  | "logout"
  | "chevron"
  | "menu"
  | "close";

const ICONS: Record<IconName, string[]> = {
  dashboard: ["M3 3h7v7H3z", "M14 3h7v7h-7z", "M14 14h7v7h-7z", "M3 14h7v7H3z"],
  book: [
    "M4 19.5A2.5 2.5 0 0 1 6.5 17H20",
    "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  ],
  progress: ["M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "M9 9h6", "M9 13h6", "M9 17h6"],
  mail: ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  folder: ["M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"],
  users: [
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
    "M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    "M23 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  settings: [
    "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  ],
  search: ["M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z", "M21 21l-4.35-4.35"],
  bell: ["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 0 1-3.46 0"],
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  chevron: ["M9 18l6-6-6-6"],
  menu: ["M3 12h18", "M3 6h18", "M3 18h18"],
  close: ["M18 6L6 18", "M6 6l12 12"],
};

function Icon({
  name,
  className = "h-5 w-5",
  strokeWidth = 2,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

type NavItem = { label: string; href: string; icon: IconName };

const BASE = "/dashboard";

const mainNav: NavItem[] = [
  { label: "Buku Tamu", href: `${BASE}/bukutamu`, icon: "book" },
  { label: "Buku Progres Pekerjaan", href: `${BASE}/progrespekerjaan`, icon: "progress" },
  { label: "Buku Daftar Surat", href: `${BASE}/bukudaftarsurat`, icon: "mail" },
];
    
const repertoriumNav = [
  { label: "Daftar Akta", href: `${BASE}/daftarakta` },
  { label: "Daftar Wasiat", href: `${BASE}/daftarwasiat` },
  { label: "Daftar Surat Dibukukan", href: `${BASE}/suratdibukukan` },
  { label: "Daftar Surat Disahkan", href: `${BASE}/suratdisahkan` },
  { label: "Daftar Protes", href: `${BASE}/daftarprotes` },
  { label: "Klapper Akta", href: `${BASE}/klapperakta` },
  { label: "Klapper Surat Disahkan", href: `${BASE}/klappersuratdisahkan` },
  { label: "Copie Collationnee", href: `${BASE}/copiecollationnee` },
];

const bookNav: NavItem[] = [
  { label: "Buku Daftar CV", href: `${BASE}/daftarcv`, icon: "book" },
  { label: "Buku Daftar PT", href: `${BASE}/daftarpt`, icon: "book" },
  { label: "Buku Daftar Yayasan", href: `${BASE}/daftaryayasan`, icon: "book" },
  { label: "Buku Daftar Hibah", href: `${BASE}/daftarhibah`, icon: "book" },
  { label: "Buku Daftar Pengangkatan Anak", href: `${BASE}/daftarank`, icon: "users" },
];

const navClass = (active: boolean) =>
  `flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition ${
    active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

const subNavClass = (active: boolean) =>
  `block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
    active ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [repertoriumOpen, setRepertoriumOpen] = useState(false);

  const isActive = (href: string) =>
    href === BASE ? pathname === BASE : pathname === href || pathname.startsWith(`${href}/`);

  const repertoriumActive = repertoriumNav.some((n) => isActive(n.href));
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={closeSidebar} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto p-5">
          <div>
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-lg font-bold text-white">
                  K
                </div>
                <span className="text-base font-semibold tracking-tight">Kanot.KNA.153</span>
              </div>
              <button
                type="button"
                onClick={closeSidebar}
                aria-label="Tutup sidebar"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
              >
                <Icon name="close" className="h-6 w-6" strokeWidth={2.5} />
              </button>
            </div>

            <nav className="space-y-1">
              <Link href={BASE} onClick={closeSidebar} className={navClass(isActive(BASE))}>
                <Icon name="dashboard" />
                Dashboard
              </Link>

              {mainNav.map((item) => (
                <Link key={item.href} href={item.href} onClick={closeSidebar} className={navClass(isActive(item.href))}>
                  <Icon name={item.icon} />
                  {item.label}
                </Link>
              ))}

              <div>
                <button
                  type="button"
                  onClick={() => setRepertoriumOpen(!repertoriumOpen)}
                  className={`${navClass(repertoriumActive)} justify-between`}
                >
                  <span className="flex items-center gap-3">
                    <Icon name="folder" />
                    Repertorium
                  </span>
                  <Icon
                    name="chevron"
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                      repertoriumOpen || repertoriumActive ? "rotate-90" : ""
                    }`}
                    strokeWidth={3}
                  />
                </button>

                {(repertoriumOpen || repertoriumActive) && (
                  <div className="ml-5 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
                    {repertoriumNav.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeSidebar}
                        className={subNavClass(isActive(item.href))}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {bookNav.map((item) => (
                <Link key={item.href} href={item.href} onClick={closeSidebar} className={navClass(isActive(item.href))}>
                  <Icon name={item.icon} />
                  {item.label}
                </Link>
              ))}

              <Link href={`${BASE}/tim`} onClick={closeSidebar} className={navClass(isActive(`${BASE}/tim`))}>
                <Icon name="users" />
                Tim Kolaborasi
              </Link>

              <Link
                href={`${BASE}/pengaturan`}
                onClick={closeSidebar}
                className={navClass(isActive(`${BASE}/pengaturan`))}
              >
                <Icon name="settings" />
                Pengaturan
              </Link>
            </nav>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                KN
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">User</p>
                <p className="truncate text-xs text-slate-500">Jabatan</p>
              </div>
            </div>
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <Icon name="logout" className="h-4 w-4" strokeWidth={2.5} />
              Keluar
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Icon name="menu" className="h-6 w-6" strokeWidth={2.5} />
            </button>

            <div className="relative w-full max-w-md">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                strokeWidth={2.5}
              />
              <input
                type="text"
                placeholder="Cari sesuatu..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/15"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              Live Sync Aktif
            </div>

            <button
              type="button"
              aria-label="Notifikasi"
              className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100"
            >
              <Icon name="bell" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <Link
              href={`${BASE}/bukutamu`}
              className="hidden items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 sm:inline-flex"
            >
              <Icon name="users" className="h-4 w-4" strokeWidth={2.5} />
              Buku Tamu
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}