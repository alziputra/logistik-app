import React, { useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";

export default function GlobalModal({
  isOpen,
  type = "success", // "success" | "error" | "confirm_delete"
  title = "",
  message = "",
  itemName = "",
  isProcessing = false,
  onClose,
  onConfirm,
  autoCloseDuration = 3500,
}) {
  useEffect(() => {
    if (isOpen && type !== "confirm_delete" && autoCloseDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, type, autoCloseDuration, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === "success";
  const isError = type === "error";
  const isConfirmDelete = type === "confirm_delete";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        {/* Top Gradient Decorative Bar */}
        <div
          className={`h-1.5 w-full ${
            isSuccess
              ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"
              : isError
              ? "bg-gradient-to-r from-rose-500 via-red-500 to-rose-600"
              : "bg-gradient-to-r from-rose-600 via-amber-500 to-red-500"
          }`}
        />

        <div className="p-6">
          {/* Header Action Button */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              {isSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              )}
              {isError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400">
                  <XCircle className="w-7 h-7" />
                </div>
              )}
              {isConfirmDelete && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400">
                  <AlertTriangle className="w-7 h-7" />
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  {title || (isSuccess ? "Berhasil!" : isError ? "Terjadi Kesalahan!" : "Konfirmasi Hapus")}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isConfirmDelete ? "Tindakan ini membutuhkan persetujuan Anda." : "Respon status sistem logistik."}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 my-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              {message}
            </p>
            {itemName && (
              <div className="mt-2.5 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-rose-300 truncate">
                "{itemName}"
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-5">
            {isConfirmDelete ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700/80 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isProcessing}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 rounded-xl shadow-lg shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? "Memproses..." : "Ya, Hapus Data"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all shadow-lg cursor-pointer ${
                  isSuccess
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/20"
                    : "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-600/20"
                }`}
              >
                OK, Mengerti
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
