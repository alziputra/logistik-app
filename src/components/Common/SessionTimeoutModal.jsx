import React from "react";
import { ShieldAlert, Clock, LogOut, CheckCircle2 } from "lucide-react";

export default function SessionTimeoutModal({ isOpen = false, secondsRemaining = 60, onExtend = () => {}, onLogout = () => {} }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-timeout-title"
      >
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 animate-pulse" />

        {/* Header with Security Icon */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 id="session-timeout-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
              Peringatan Keamanan Sesi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Sesi Anda akan segera berakhir demi keamanan</p>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
          Tidak ada aktivitas yang terdeteksi di perangkat Anda. Demi menjaga keamanan data logistik dan mencegah penyalahgunaan saat komputer ditinggalkan, sesi akan ditutup otomatis.
        </p>

        {/* Countdown Box */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-xl p-3.5 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
            <span>Sesi berakhir otomatis dalam:</span>
          </div>
          <span className="font-mono font-extrabold text-base sm:text-lg text-rose-600 dark:text-rose-400 px-2.5 py-0.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-300 dark:border-amber-800/80 shadow-xs">
            {secondsRemaining}s
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={onLogout}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sekarang</span>
          </button>

          <button
            type="button"
            onClick={onExtend}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#00753A] hover:bg-[#005c2e] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Tetap Masuk (Lanjutkan)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
