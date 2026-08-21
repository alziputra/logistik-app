import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDeleteModal({ show, name, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-rose-400">
          <div className="p-3 bg-rose-950/80 border border-rose-800/40 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">Konfirmasi Hapus Data</h3>
            <p className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
        </div>

        <p className="text-sm text-slate-300">
          Apakah Anda yakin ingin menghapus data <strong className="text-rose-400">{name}</strong>?
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-950/50 transition-colors cursor-pointer"
          >
            Ya, Hapus Data
          </button>
        </div>
      </div>
    </div>
  );
}
