import Link from "next/link";

type IconName = "book" | "progress" | "mail" | "folder" | "users" | "calendar";

const ICONS: Record<IconName, string[]> = {
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
  calendar: ["M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "M16 2v4", "M8 2v4", "M3 10h18"],
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

const quickCards = [
  {
    href: "/dashboard/bukutamu",
    icon: "users" as IconName,
    title: "Buku Tamu Klien",
    desc: "Registrasi kedatangan tamu, konsultasi awal, dan pencatatan keperluan kunjungan klien.",
    cta: "Buka Buku Tamu →",
    card: "from-blue-50 to-blue-100 border-blue-200 hover:shadow-blue-600/15",
    badge: "bg-blue-600",
    titleColor: "text-blue-900",
    descColor: "text-blue-800",
    ctaColor: "text-blue-600",
  },
  {
    href: "/dashboard/progrespekerjaan",
    icon: "progress" as IconName,
    title: "Progres Berkas",
    desc: "Pantau kelengkapan checklist dokumen persyaratan, riwayat aktivitas, dan foto berkas asli.",
    cta: "Buka Buku Progres →",
    card: "from-green-50 to-green-100 border-green-200 hover:shadow-green-600/15",
    badge: "bg-green-600",
    titleColor: "text-green-900",
    descColor: "text-green-800",
    ctaColor: "text-green-600",
  },
  {
    href: "/dashboard/daftarakta",
    icon: "folder" as IconName,
    title: "Buku Daftar Akta",
    desc: "Catat lembaran Repertorium Akta Notaris lengkap dengan nomor bulanan dan nama penghadap.",
    cta: "Buka Daftar Akta →",
    card: "from-violet-50 to-violet-100 border-violet-200 hover:shadow-violet-600/15",
    badge: "bg-violet-600",
    titleColor: "text-violet-900",
    descColor: "text-violet-800",
    ctaColor: "text-violet-600",
  },
  {
    href: "/dashboard/klapperakta",
    icon: "book" as IconName,
    title: "Klapper Abjad",
    desc: "Indeks abjad nama klien dan penghadap berdasarkan huruf awal untuk mempercepat pencarian arsip.",
    cta: "Buka Klapper Akta →",
    card: "from-orange-50 to-orange-100 border-orange-200 hover:shadow-orange-600/15",
    badge: "bg-orange-600",
    titleColor: "text-orange-900",
    descColor: "text-orange-800",
    ctaColor: "text-orange-600",
  },
  {
    href: "/dashboard/daftarsurat",
    icon: "mail" as IconName,
    title: "Buku Daftar Surat",
    desc: "Registrasi persuratan kantor, kelola surat masuk dan keluar beserta perihal, asal, dan tujuannya.",
    cta: "Buka Daftar Surat →",
    card: "from-slate-50 to-slate-200 border-slate-300 hover:shadow-slate-600/15",
    badge: "bg-slate-600",
    titleColor: "text-slate-800",
    descColor: "text-slate-600",
    ctaColor: "text-slate-600",
  },
];

const metrics = [
  {
    title: "Total Klien Keseluruhan",
    value: "48",
    icon: "users" as IconName,
    iconBox: "bg-blue-50 text-blue-600",
    tag: "Buku Tamu",
    tagClass: "bg-blue-50 text-blue-600",
    note: "kunjungan terdaftar",
  },
  {
    title: "Total Klien Bulan Ini",
    value: "12",
    icon: "calendar" as IconName,
    iconBox: "bg-green-50 text-green-600",
    tag: "November 2026",
    tagClass: "bg-green-100 text-green-600",
    note: "periode bulan berjalan",
  },
  {
    title: "Pekerjaan Aktif Diproses",
    value: "7",
    icon: "progress" as IconName,
    iconBox: "bg-orange-50 text-orange-600",
    tag: "Dalam Proses",
    tagClass: "bg-orange-100 text-orange-600",
    note: "butuh tindak lanjut",
  },
];

const activities = [
  { id: "a1", user: "Rina Pratama", action: "menambahkan data klien", target: "PT Maju Bersama", time: "10 menit lalu", dot: "bg-green-500" },
  { id: "a2", user: "Dimas Anggara", action: "memperbarui progres berkas", target: "Akta Pendirian CV Sinar", time: "45 menit lalu", dot: "bg-blue-500" },
  { id: "a3", user: "Siti Aminah", action: "mengarsipkan surat", target: "Surat Kuasa No. 112", time: "2 jam lalu", dot: "bg-orange-500" },
  { id: "a4", user: "Anda", action: "menyetujui", target: "Daftar Wasiat Bulan Ini", time: "Kemarin", dot: "bg-blue-500" },
];

const members = [
  { id: "T-1", initial: "KN", name: "Khairun Nisa, S.H., M.Kn.", role: "Notaris Utama", status: "Aktif", statusClass: "bg-green-100 text-green-700" },
  { id: "T-2", initial: "RP", name: "Rina Pratama, S.H.", role: "Notaris Pengganti", status: "Sibuk", statusClass: "bg-orange-100 text-orange-700" },
  { id: "T-3", initial: "DA", name: "Dimas Anggara", role: "Staf Lapangan", status: "Aktif", statusClass: "bg-green-100 text-green-700" },
  { id: "T-4", initial: "SA", name: "Siti Aminah", role: "Arsiparis", status: "Offline", statusClass: "bg-slate-100 text-slate-600" },
  { id: "T-5", initial: "BW", name: "Bagas Wicaksono", role: "Staf Administrasi", status: "Aktif", statusClass: "bg-green-100 text-green-700" },
];

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Halo, User</h1>
        <p className="mt-1 text-sm text-slate-500">
          Berikut adalah ringkasan data buku tamu, kelengkapan berkas, dan aktivitas hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {quickCards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`flex flex-col justify-between rounded-2xl border bg-gradient-to-br p-5 text-left transition duration-200 hover:-translate-y-1 hover:shadow-lg ${c.card}`}
          >
            <div>
              <div className="mb-2 flex items-center gap-2.5">
                <span className={`inline-flex rounded-md p-1.5 text-white ${c.badge}`}>
                  <Icon name={c.icon} className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <h4 className={`text-[15px] font-bold ${c.titleColor}`}>{c.title}</h4>
              </div>
              <p className={`text-[13px] leading-relaxed ${c.descColor}`}>{c.desc}</p>
            </div>
            <span className={`mt-4 text-[13px] font-bold ${c.ctaColor}`}>{c.cta}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.title} className={cardClass}>
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-slate-500">{m.title}</span>
              <span className={`rounded-xl p-2.5 ${m.iconBox}`}>
                <Icon name={m.icon} className="h-[18px] w-[18px]" />
              </span>
            </div>
            <p className="mt-3 text-4xl font-bold tracking-tight">{m.value}</p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className={`rounded-full px-2 py-0.5 font-semibold ${m.tagClass}`}>{m.tag}</span>
              <span className="text-slate-500">{m.note}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={cardClass}>
          <h2 className="mb-5 text-lg font-bold">Aktivitas Terbaru</h2>
          <ul className="space-y-4">
            {activities.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${a.dot}`} />
                <div>
                  <p className="text-sm text-slate-700">
                    <strong className="font-semibold text-slate-900">{a.user}</strong> {a.action}{" "}
                    <strong className="font-semibold text-slate-900">{a.target}</strong>
                  </p>
                  <p className="text-xs text-slate-400">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={cardClass}>
          <h2 className="mb-5 text-lg font-bold">Tim Kolaborasi Aktif</h2>
          <ul className="divide-y divide-slate-100">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[13px] font-bold text-blue-600">
                    {m.initial}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.role}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${m.statusClass}`}>{m.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}