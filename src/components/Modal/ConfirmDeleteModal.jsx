import React from "react";
import { Trash2 } from "lucide-react";

/**
 * ConfirmDeleteModal - Modal konfirmasi hapus standar.
 * Props:
 *   isOpen   {boolean}  - Tampilkan/sembunyikan modal
 *   title    {string}   - Judul modal (opsional, ada default)
 *   message  {string}   - Pesan konfirmasi (opsional, ada default)
 *   onConfirm {function} - Callback ketika user klik "Ya, Hapus"
 *   onClose  {function} - Callback ketika user klik "Batal" atau tutup
 */
export default function ConfirmDeleteModal({
  isOpen,
  title = "Konfirmasi Hapus Data",
  message = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-950/80 border border-rose-800/40 rounded-xl text-rose-400">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">{title}</h3>
            <p className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-950/50 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
