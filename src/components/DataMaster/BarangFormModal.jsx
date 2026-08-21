import React, { useState, useEffect, useMemo } from "react";
import { X, Edit, Database, Plus, Loader2, Package, Calendar, Building2 } from "lucide-react";

export default function BarangFormModal({
  isOpen,
  editingInv,
  isSaving,
  vendors = [],
  onClose,
  onSubmit,
}) {
  const [vendorNama, setVendorNama] = useState("");
  const [tglMulai, setTglMulai] = useState("");
  const [tglSelesai, setTglSelesai] = useState("");

  useEffect(() => {
    if (editingInv) {
      setVendorNama(editingInv.vendor_nama || editingInv.vendor?.nama || "");
      setTglMulai(editingInv.tanggal_mulai || "");
      setTglSelesai(editingInv.tanggal_selesai || "");
    } else {
      setVendorNama("");
      setTglMulai("");
      setTglSelesai("");
    }
  }, [editingInv, isOpen]);

  const isVendorFilled = useMemo(() => {
    const v = (vendorNama || "").trim();
    return v !== "" && v !== "-";
  }, [vendorNama]);

  useEffect(() => {
    if (!isVendorFilled) {
      setTglMulai("");
      setTglSelesai("");
    }
  }, [isVendorFilled]);

  // Masa sewa calculation in months from tanggal_mulai to tanggal_selesai
  const masaSewa = useMemo(() => {
    if (!tglMulai || !tglSelesai) return 0;
    const d1 = new Date(tglMulai);
    const d2 = new Date(tglSelesai);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    if (d2.getDate() < d1.getDate()) months--;
    return months < 0 ? 0 : months;
  }, [tglMulai, tglSelesai]);

  // Auto status calculated based on vendorNama & tanggal sewa
  const statusVal = useMemo(() => {
    if (!isVendorFilled || (!tglMulai && !tglSelesai)) {
      return "Inventaris";
    }

    if (tglSelesai) {
      const d2 = new Date(tglSelesai);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!isNaN(d2.getTime()) && d2 < today) {
        return "Sewa Selesai";
      }
      return "Sewa Berjalan";
    }

    return "Sewa Berjalan";
  }, [isVendorFilled, tglMulai, tglSelesai]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
              {editingInv ? <Edit className="w-5 h-5" /> : <Database className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">
                {editingInv ? "Edit Data Barang / Asset" : "Tambah Master Barang / Asset"}
              </h3>
              <p className="text-xs text-slate-400">
                {editingInv ? "Perbarui informasi rincian katalog barang" : "Masukkan informasi barang baru ke dalam database master"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-2 rounded-xl cursor-pointer transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="formBarang" onSubmit={onSubmit} className="space-y-6">
            
            {/* Section 1: Informasi Utama */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Package className="w-4 h-4" /> Informasi Utama Barang
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nama Barang <span className="text-rose-400">*</span>
                  </label>
                  <input
                    name="nama"
                    defaultValue={editingInv?.nama || ""}
                    required
                    placeholder="Contoh: Dell Optiplex SFF 7010"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Stok Barang <span className="text-rose-400">*</span>
                  </label>
                  <input
                    name="kuantitas"
                    type="number"
                    defaultValue={editingInv?.kuantitas !== undefined ? editingInv.kuantitas : (editingInv?.stok || 0)}
                    min="0"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Satuan <span className="text-rose-400">*</span>
                  </label>
                  <select
                    name="satuan"
                    defaultValue={editingInv?.satuan || "Pcs"}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all cursor-pointer"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Unit">Unit</option>
                    <option value="Box">Box</option>
                    <option value="Set">Set</option>
                    <option value="Paket">Paket</option>
                    <option value="Roll">Roll</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Vendor & Kontrak */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Building2 className="w-4 h-4" /> Vendor & Legalitas Kontrak
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Vendor</label>
                  <input
                    name="vendor_nama"
                    list="vendor-options-list"
                    value={vendorNama}
                    onChange={(e) => setVendorNama(e.target.value)}
                    placeholder="Pilih / ketik nama vendor..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                  <datalist id="vendor-options-list">
                    {vendors.map((v) => (
                      <option key={v.id} value={v.nama} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">No. SPK</label>
                  <input
                    name="no_spk"
                    defaultValue={editingInv?.no_spk || ""}
                    placeholder="Contoh: PO/3567/00108.04/2026"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">No. PKS</label>
                  <input
                    name="no_pks"
                    defaultValue={editingInv?.no_pks || ""}
                    placeholder="Contoh: 2503/00108.04/2026"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Tanggal & Status Sewa */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Calendar className="w-4 h-4" /> Jangka Waktu & Status Otomatis
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tgl Mulai Sewa</label>
                  <input
                    name="tanggal_mulai"
                    type="date"
                    disabled={!isVendorFilled}
                    value={tglMulai}
                    onChange={(e) => setTglMulai(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition-all ${
                      !isVendorFilled
                        ? "bg-slate-950 border border-slate-800/80 text-slate-500 cursor-not-allowed opacity-60"
                        : "bg-slate-900 border border-slate-700/80 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tgl Selesai Sewa</label>
                  <input
                    name="tanggal_selesai"
                    type="date"
                    disabled={!isVendorFilled}
                    value={tglSelesai}
                    onChange={(e) => setTglSelesai(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition-all ${
                      !isVendorFilled
                        ? "bg-slate-950 border border-slate-800/80 text-slate-500 cursor-not-allowed opacity-60"
                        : "bg-slate-900 border border-slate-700/80 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status (Otomatis)</label>
                  <input type="hidden" name="status" value={statusVal} />
                  <input
                    type="text"
                    readOnly
                    value={statusVal}
                    className={`w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold cursor-not-allowed transition-all ${
                      statusVal === "Sewa Selesai"
                        ? "text-amber-400"
                        : statusVal === "Sewa Dibatalkan"
                        ? "text-rose-400"
                        : "text-emerald-400"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Masa Sewa (Bulan)</label>
                  <input
                    name="masa_sewa_bulan"
                    type="number"
                    readOnly
                    value={masaSewa}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-bold cursor-not-allowed"
                  />
                </div>
              </div>
              {!isVendorFilled && (
                <p className="text-[11px] text-amber-400/90 mt-2 font-medium flex items-center gap-1.5">
                  <span>💡</span> Isi atau pilih <strong className="font-semibold text-amber-300">Nama Vendor</strong> terlebih dahulu untuk mengaktifkan tanggal sewa.
                </p>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-5 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editingInv ? "Simpan Perubahan" : "Tambah Barang"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
