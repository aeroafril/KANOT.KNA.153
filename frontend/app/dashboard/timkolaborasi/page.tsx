"use client";

import { useState } from "react";

const PERMISSIONS = [
  "Melihat Anggota",
  "Mengedit Anggota",
  "Menambahkan Anggota",
  "Menghapus Anggota",
  "Melihat Isi Data Web",
  "Mengedit Isi Data Web",
] as const;

type Permission = (typeof PERMISSIONS)[number];

type Member = {
  id: string;
  initial: string;
  name: string;
  role: string;
  email: string;
  online: boolean;
  isSelf: boolean;
  permissions: Permission[];
};

const members: Member[] = [
  {
    id: "T-1",
    initial: "PA",
    name: "Patricia",
    role: "Staff Notaris",
    email: "dedesk159@gmail.com",
    online: true,
    isSelf: true,
    permissions: [...PERMISSIONS],
  },
  {
    id: "T-2",
    initial: "BS",
    name: "Budi Santoso",
    role: "notaris",
    email: "budi.notaris@gmail.com",
    online: false,
    isSelf: false,
    permissions: ["Melihat Anggota", "Melihat Isi Data Web", "Mengedit Isi Data Web"],
  },
];

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2f6b4f] focus:ring-4 focus:ring-[#2f6b4f]/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const labelClass = "mb-1.5 block text-sm font-bold text-slate-700";

const primaryButton =
  "inline-flex items-center justify-center rounded-lg bg-[#2f6b4f] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-black/15 transition hover:bg-[#265a42] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2f6b4f]/30";

export default function TimKolaborasi() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);

  const openInvite = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (member: Member) => {
    setEditing(member);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Anggota Tim Kolaboratif</h2>
          <p className="mt-1 text-sm text-slate-500">Kelola dan lihat informasi kontak tim Anda.</p>
        </div>

        <button type="button" onClick={openInvite} className={primaryButton}>
          + Undang Anggota
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {members.map((m) => (
          <div key={m.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xl font-bold text-white">
                {m.initial}
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    m.online ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {m.online ? "Online" : "Offline"}
                </span>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(m)}
                    className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                  >
                    Edit
                  </button>
                  {!m.isSelf && (
                    <button
                      type="button"
                      className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-500 transition hover:bg-red-100"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[17px] font-bold text-slate-900">{m.name}</h3>
              <p className="mt-0.5 text-sm font-semibold text-blue-600">{m.role}</p>
              <p className="mt-2 break-all text-[13px] text-slate-500">{m.email}</p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="max-h-[92vh] w-full max-w-[500px] overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {editing ? "Edit Data Anggota" : "Undang Anggota Tim Baru"}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {editing
                    ? "Perbarui informasi dan hak akses anggota tim"
                    : "Mendaftarkan akun baru agar dapat masuk ke web"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Tutup"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div key={editing?.id ?? "new"} className="space-y-4 p-6">
              <div>
                <label htmlFor="memberName" className={labelClass}>
                  Nama Lengkap
                </label>
                <input
                  id="memberName"
                  type="text"
                  placeholder="Contoh: Rina Pratama, S.H."
                  defaultValue={editing?.name}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="memberEmail" className={labelClass}>
                  Email Gmail
                </label>
                <input
                  id="memberEmail"
                  type="email"
                  placeholder="Contoh: rina.notaris@gmail.com"
                  defaultValue={editing?.email}
                  className={inputClass}
                />
              </div>

              {!editing && (
                <div>
                  <label htmlFor="memberPassword" className={labelClass}>
                    Kata Sandi Masuk
                  </label>
                  <input
                    id="memberPassword"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label htmlFor="memberRole" className={labelClass}>
                  Peran Jabatan
                </label>
                <input
                  id="memberRole"
                  type="text"
                  placeholder="Contoh: Staf Lapangan, Arsiparis"
                  defaultValue={editing?.role}
                  className={inputClass}
                />
              </div>

              <div>
                <span className={labelClass}>Hak Akses Fitur</span>
                <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 rounded-lg border border-slate-300 p-3.5 sm:grid-cols-2">
                  {PERMISSIONS.map((p) => (
                    <label key={p} className="flex cursor-pointer items-center gap-2 text-[13px] text-slate-700">
                      <input
                        type="checkbox"
                        defaultChecked={editing ? editing.permissions.includes(p) : p === "Melihat Isi Data Web"}
                        className="h-4 w-4 rounded border-slate-300 text-[#2f6b4f] focus:ring-2 focus:ring-[#2f6b4f]/30"
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-500 transition hover:bg-slate-50"
                >
                  Batal
                </button>
                <button type="button" className={primaryButton}>
                  {editing ? "Simpan Perubahan" : "Undang Anggota"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}