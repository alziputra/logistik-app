import React, { useState } from "react";
import { KeyRound, ShieldCheck, Eye, EyeOff, Lock, AlertCircle, LogOut, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ForceChangePasswordModal({ isOpen = true, onSuccess }) {
  const { user, changeUserPassword, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentPassword.trim()) {
      setErrorMsg("Password saat ini (dari Administrator) wajib diisi.");
      return;
    }

    if (!newPassword.trim()) {
      setErrorMsg("Password baru wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMsg("Password baru tidak boleh sama dengan password lama dari Administrator.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi password baru tidak cocok.");
      return;
    }

    setIsSubmitting(true);
    const res = await changeUserPassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg("Password Anda berhasil diperbarui! Membuka akses sistem...");
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1200);
    } else {
      setErrorMsg(res.message || "Gagal mengganti password. Pastikan password lama sesuai.");
    }
  };

  return (
    <div className="fixed inset-0 z-9999 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transition-all">
        {/* Top Header Banner */}
        <div className="bg-linear-to-r from-emerald-600 to-teal-600 p-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30 mb-1 uppercase tracking-wider">
                Wajib Ganti Password
              </span>
              <h2 className="text-xl font-black tracking-tight text-white">Buat Password Baru Akun</h2>
            </div>
          </div>
          <p className="mt-2 text-xs text-emerald-50 leading-relaxed font-medium">
            Halo <strong className="text-white">{user?.name || user?.email}</strong>, akun Anda didaftarkan oleh Administrator dengan password sementara. Demi keamanan, Anda wajib mengganti password akun Anda sendiri sebelum melanjutkan ke sistem.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          {/* Alert Error / Success */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="space-y-1">
                <span className="font-semibold block">{errorMsg}</span>
                {errorMsg.includes("Password saat ini") && (
                  <p className="text-[11px] text-rose-600/90 dark:text-rose-400/90 leading-relaxed">
                    💡 <strong>Tips:</strong> Pastikan tombol <em>Caps Lock</em> tidak aktif dan tidak ada spasi yang tidak sengaja terketik. Jika Anda merasa sudah mengetik sesuai namun tetap gagal, kemungkinan Administrator mengalami salah ketik (typo) saat membuat akun Anda.
                  </p>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* 1. Password Saat Ini (Current Password) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              1. Password Saat Ini (Diberikan Admin) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className={`w-4 h-4 ${errorMsg && errorMsg.includes("Password saat ini") ? "text-rose-500" : ""}`} />
              </div>
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (errorMsg && errorMsg.includes("Password saat ini")) setErrorMsg("");
                }}
                placeholder="Masukkan password dari admin"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium outline-none transition-all ${
                  errorMsg && errorMsg.includes("Password saat ini")
                    ? "border-2 border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/20"
                    : "border border-slate-300 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errorMsg && errorMsg.includes("Password saat ini") && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                Password tidak cocok dengan yang terdaftar. Periksa kembali huruf besar/kecil atau hubungi Admin.
              </p>
            )}
          </div>

          {/* 2. Password Baru (New Password) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              2. Password Baru Anda <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showNew ? "text" : "password"}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter baru"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Gunakan kombinasi huruf, angka, atau simbol (min. 6 karakter).
            </p>
          </div>

          {/* 3. Konfirmasi Password Baru (Confirm New Password) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              3. Konfirmasi Password Baru <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <input
                type={showConfirm ? "text" : "password"}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru Anda"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => logout("USER_CANCEL_PASSWORD_CHANGE")}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Keluar & Batalkan
            </button>

            <button
              type="submit"
              disabled={isSubmitting || Boolean(successMsg)}
              className="w-full sm:w-auto px-6 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Menyimpan Password...</span>
              ) : (
                <>
                  <span>Simpan & Lanjutkan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
