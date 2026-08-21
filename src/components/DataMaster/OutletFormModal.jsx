import React from "react";
import { MapPin, X, Edit, Plus, Loader2 } from "lucide-react";

export default function OutletFormModal({ isOpen, onClose, editingOutlet, onSubmit, isSaving }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-950 p-2 rounded-xl border border-emerald-800/40">
              {editingOutlet ? <Edit className="w-5 h-5 text-emerald-400" /> : <MapPin className="w-5 h-5 text-emerald-400" />}
            </div>
            <h3 className="font-bold text-lg text-slate-100">
              {editingOutlet ? "Edit Instansi / Outlet" : "Tambah Instansi Baru"}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kode Outlet *</label>
              <input
                name="kode"
                defaultValue={editingOutlet?.code || editingOutlet?.kode || ""}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 font-mono"
                placeholder="Contoh: 12447"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Outlet / Instansi *</label>
              <input
                name="nama"
                defaultValue={editingOutlet?.nama || ""}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                placeholder="Contoh: UPC TAMAN RAFLESIA"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status Outlet</label>
              <select
                name="status"
                defaultValue={editingOutlet?.status || "UPC"}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
              >
                <option value="UPC">UPC</option>
                <option value="Cabang">Cabang</option>
                <option value="Area">Area</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kode Cabang</label>
              <input
                name="kodeCabang"
                defaultValue={editingOutlet?.kodeCabang || ""}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 font-mono"
                placeholder="Contoh: 12473"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cabang Induk</label>
              <input
                name="cabangInduk"
                defaultValue={editingOutlet?.cabangInduk || ""}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                placeholder="Contoh: CP BEKASI TIMUR"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Clustering</label>
              <select
                name="clustering"
                defaultValue={editingOutlet?.clustering || "ANGGOTA CLUSTER"}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
              >
                <option value="ANGGOTA CLUSTER">ANGGOTA CLUSTER</option>
                <option value="INDUK CLUSTER">INDUK CLUSTER</option>
                <option value="NON CLUSTER">NON CLUSTER</option>
                <option value="MANDIRI">MANDIRI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Konven / Syariah</label>
              <select
                name="jenis"
                defaultValue={editingOutlet?.jenis || "KONVEN"}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
              >
                <option value="KONVEN">KONVEN</option>
                <option value="SYARIAH">SYARIAH</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Area</label>
              <input
                name="area"
                defaultValue={editingOutlet?.area || "AREA BEKASI"}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                placeholder="Contoh: AREA BEKASI"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-3 mt-4 border-t border-slate-800 pt-4 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editingOutlet ? "Simpan Perubahan" : "Simpan Instansi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
