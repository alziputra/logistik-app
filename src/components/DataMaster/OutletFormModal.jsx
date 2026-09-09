import React, { useState, useEffect } from "react";
import { MapPin, X, Edit, Plus, Loader2, Building, Info } from "lucide-react";

export default function OutletFormModal({ isOpen, onClose, editingOutlet, onSubmit, isSaving }) {
  const [status, setStatus] = useState("Kantor Wilayah");

  useEffect(() => {
    if (editingOutlet) {
      const currentStatus = editingOutlet.status || editingOutlet.tipe || editingOutlet.jenisOutlet || "UPC";
      setStatus(currentStatus);
    } else {
      setStatus("Kantor Wilayah");
    }
  }, [editingOutlet, isOpen]);

  if (!isOpen) return null;

  // Hanya status unit operasional cabang yang membutuhkan detail hierarki cabang
  const isBranchStatus = ["UPC", "CABANG", "UPS", "AREA"].includes(status.toUpperCase());

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#E6F4EA] dark:bg-emerald-950 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-[#00753A] dark:text-emerald-400">
              {editingOutlet ? <Edit className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                {editingOutlet ? "Edit Instansi / Outlet" : "Tambah Instansi / Outlet Baru"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {editingOutlet ? "Perbarui informasi data lokasi atau unit kerja" : "Tambahkan unit kerja baru ke database master"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl cursor-pointer transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Kode Outlet / Unit *
                </label>
                <input
                  name="kode"
                  defaultValue={editingOutlet?.code || editingOutlet?.kode || ""}
                  required
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono font-semibold placeholder:text-slate-400 focus:border-[#00753A] focus:ring-2 focus:ring-[#00753A]/20 outline-none transition-all"
                  placeholder="Contoh: 00108"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Nama Outlet / Instansi *
                </label>
                <input
                  name="nama"
                  defaultValue={editingOutlet?.nama || ""}
                  required
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold placeholder:text-slate-400 focus:border-[#00753A] focus:ring-2 focus:ring-[#00753A]/20 outline-none transition-all"
                  placeholder="Contoh: KANTOR WILAYAH VIII"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Status Outlet / Tipe Unit Kerja *
                </label>
                <select
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-bold focus:border-[#00753A] focus:ring-2 focus:ring-[#00753A]/20 outline-none transition-all cursor-pointer"
                >
                  <option value="Kantor Pusat">Kantor Pusat</option>
                  <option value="Kantor Wilayah">Kantor Wilayah</option>
                  <option value="Cabang">Cabang</option>
                  <option value="UPC">UPC</option>
                  <option value="UPS">UPS</option>
                  <option value="Area">Area</option>
                  <option value="Lainnya">Lainnya / Unit Khusus</option>
                </select>
              </div>
            </div>

            {/* Info Box untuk status non-cabang */}
            {!isBranchStatus ? (
              <div className="p-4 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-[#00753A] dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-emerald-300">
                    Unit Kerja: {status}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Untuk tipe <strong>{status}</strong>, informasi kode cabang, cabang induk, clustering, konven/syariah, dan area tidak diperlukan dan otomatis ditiadakan.
                  </p>
                </div>
              </div>
            ) : (
              /* Detail Hierarki khusus untuk Cabang / UPC / UPS / Area */
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#00753A] dark:text-emerald-400" /> Detail Hierarki & Operasional
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Kode Cabang
                    </label>
                    <input
                      name="kodeCabang"
                      defaultValue={editingOutlet?.kodeCabang && editingOutlet.kodeCabang !== "-" ? editingOutlet.kodeCabang : ""}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-[#00753A]"
                      placeholder="Contoh: 12473"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Cabang Induk
                    </label>
                    <input
                      name="cabangInduk"
                      defaultValue={editingOutlet?.cabangInduk && editingOutlet.cabangInduk !== "-" ? editingOutlet.cabangInduk : ""}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A]"
                      placeholder="Contoh: CP BEKASI TIMUR"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Clustering
                    </label>
                    <select
                      name="clustering"
                      defaultValue={editingOutlet?.clustering && editingOutlet.clustering !== "-" ? editingOutlet.clustering : "MANDIRI"}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A]"
                    >
                      <option value="MANDIRI">MANDIRI</option>
                      <option value="ANGGOTA CLUSTER">ANGGOTA CLUSTER</option>
                      <option value="INDUK CLUSTER">INDUK CLUSTER</option>
                      <option value="NON CLUSTER">NON CLUSTER</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Konven / Syariah
                    </label>
                    <select
                      name="jenis"
                      defaultValue={editingOutlet?.jenis && editingOutlet.jenis !== "-" ? editingOutlet.jenis : "KONVEN"}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A]"
                    >
                      <option value="KONVEN">KONVEN</option>
                      <option value="SYARIAH">SYARIAH</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Area
                    </label>
                    <input
                      name="area"
                      defaultValue={editingOutlet?.area && editingOutlet.area !== "-" ? editingOutlet.area : ""}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A]"
                      placeholder="Contoh: AREA BEKASI"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-5 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 text-xs font-bold bg-[#00753A] hover:bg-[#006030] text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 transition-colors"
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


