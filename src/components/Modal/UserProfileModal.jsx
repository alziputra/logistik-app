import React, { useState } from "react";
import {
  X, User, Lock, ShieldCheck, Key, Info, CheckCircle2, AlertCircle, Loader2, Sparkles, Building2
} from "lucide-react";
import { auth } from "../../config/firebase";
import { updatePassword } from "firebase/auth";
import { useNotification } from "../../context/NotificationContext";

export default function UserProfileModal({ isOpen, onClose, user }) {
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState("info"); // 'info' | 'security' | 'app'

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  if (!isOpen || !user) return null;

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError("Password Tidak Cocok", "Password baru dan konfirmasi password tidak cocok.");
      return;
    }
    if (newPassword.length < 6) {
      showError("Password Terlalu Pendek", "Password baru minimal harus 6 karakter.");
      return;
    }

    setIsSavingPassword(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
      }
      showSuccess("Berhasil!", "Password akun Anda berhasil diperbarui di Firebase.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setActiveTab("info");
    } catch (err) {
      console.error("Gagal mengubah password:", err);
      showError(
        "Gagal Mengubah Password",
        err.message || "Password tidak dapat diperbarui. Pastikan Anda telah login ulang baru-baru ini."
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-colors">
        
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-950 p-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/40">
              <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Profil & Pengaturan Akun</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Informasi detail akun pengguna dan keamanan.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab("info")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "info"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" /> Detail Profil
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "security"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Key className="w-3.5 h-3.5" /> Keamanan & Password
          </button>
          <button
            onClick={() => setActiveTab("app")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "app"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Info className="w-3.5 h-3.5" /> Info Aplikasi
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* TAB 1: INFORMASI PROFIL */}
          {activeTab === "info" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* User Avatar Card */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                  {(user.name || user.email || "U").substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">{user.name || "User Logistik"}</h4>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                      {user.role || "User"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email || "-"}</p>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium mb-1">Peran / Hak Akses</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    {user.role === "admin" ? "Administrator Utama" : "Staff Operasional Logistik"}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium mb-1">Status Sesi Akun</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sesi Aktif (Online)
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 col-span-1 sm:col-span-2">
                  <span className="text-slate-400 block font-medium mb-1">Instansi / Unit Kerja</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    PT Pegadaian (Persero) — Departemen Logistik & Aset
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KEAMANAN & UBAH PASSWORD */}
          {activeTab === "security" && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>Gunakan kombinasi password yang kuat untuk menjaga keamanan data logistik Pegadaian.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password lama..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-70"
                >
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Memperbarui...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" /> Simpan Password Baru
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: INFO APLIKASI */}
          {activeTab === "app" && (
            <div className="space-y-3 text-xs animate-in fade-in duration-200">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
                <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 mb-1">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Sistem Logistik Pegadaian</h4>
                <p className="text-slate-500 dark:text-slate-400">Versi 1.5.0 Enterprise Edition</p>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between py-2 border-b border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400 font-medium">Framework Frontend:</span>
                  <span className="font-bold">React 18 & Vite + Tailwind CSS</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400 font-medium">Database System:</span>
                  <span className="font-bold">Firebase Cloud Firestore & Auth</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400 font-medium">Pengembang:</span>
                  <span className="font-bold">PT Pegadaian (Persero) Logistik IT Team</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
