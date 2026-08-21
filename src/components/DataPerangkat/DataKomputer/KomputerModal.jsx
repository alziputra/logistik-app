import React, { useState, useEffect, useMemo } from "react";
import { X, Loader2 } from "lucide-react";

export default function KomputerModal({
  isOpen,
  editingId,
  formData = {},
  setFormData = () => {},
  isSaving = false,
  outletsList = [],
  inventoryList = [],
  onClose = () => {},
  onSave = () => {},
  onOutletChange = () => {},
  onProdukChange = () => {},
}) {
  const [tglMulai, setTglMulai] = useState(formData.tanggalMulai || formData.tanggal_mulai || "");
  const [tglSelesai, setTglSelesai] = useState(formData.tanggalSelesai || formData.tanggal_selesai || "");

  useEffect(() => {
    setTglMulai(formData.tanggalMulai || formData.tanggal_mulai || "");
    setTglSelesai(formData.tanggalSelesai || formData.tanggal_selesai || "");
  }, [formData, isOpen]);

  const { status, masaSewa } = useMemo(() => {
    if (!tglMulai || !tglSelesai) {
      return { status: "Inventaris", masaSewa: 0 };
    }
    const d1 = new Date(tglMulai);
    const d2 = new Date(tglSelesai);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      return { status: "Inventaris", masaSewa: 0 };
    }
    let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    if (months < 0) months = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const st = d2 >= today ? "Sewa Berjalan" : "Sewa Habis";
    return { status: st, masaSewa: months };
  }, [tglMulai, tglSelesai]);

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        tanggalMulai: tglMulai,
        tanggalSelesai: tglSelesai,
        status: status,
      }));
    }
  }, [tglMulai, tglSelesai, status, isOpen]);

  if (!isOpen) return null;

  const inputCls =
    "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 placeholder:text-slate-500";
  const inputPurple =
    "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-purple-500 placeholder:text-slate-500";
  const labelCls = "block text-[11px] font-semibold text-slate-300 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
          <h3 className="font-bold text-base text-slate-100">
            {editingId ? "Edit Data Komputer" : "Tambah PC Baru"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={onSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* KOLOM KIRI: Hardware, Outlet & Sewa */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-emerald-400 border-b border-slate-800 pb-2 uppercase tracking-wider">
                  Informasi Hardware & Lokasi
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Nama Outlet / Lokasi</label>
                    <input
                      type="text"
                      list="outlets-list-comp"
                      value={formData.outlet || ""}
                      onChange={onOutletChange || ((e) => setFormData((p) => ({ ...p, outlet: e.target.value })))}
                      disabled={isSaving}
                      className={inputCls}
                      placeholder="Pilih atau ketik outlet..."
                    />
                    <datalist id="outlets-list-comp">
                      {outletsList.map((o) => (
                        <option key={o.id} value={o.nama} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className={labelCls}>ID Outlet (Kode)</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.idOutlet || ""}
                      className={`${inputCls} bg-slate-950 text-slate-400 cursor-not-allowed`}
                      placeholder="Otomatis"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Kondisi Hardware</label>
                    <select
                      value={formData.kondisi || "BAIK"}
                      onChange={(e) => setFormData((p) => ({ ...p, kondisi: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputCls} cursor-pointer`}
                    >
                      <option value="BAIK">BAIK</option>
                      <option value="KURANG BAIK">KURANG BAIK</option>
                      <option value="RUSAK">RUSAK</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Produk / Model PC</label>
                    <input
                      type="text"
                      list="produk-list-comp"
                      value={formData.produk || ""}
                      onChange={onProdukChange || ((e) => setFormData((p) => ({ ...p, produk: e.target.value })))}
                      disabled={isSaving}
                      className={inputCls}
                      placeholder="OptiPlex SFF 7010..."
                    />
                    <datalist id="produk-list-comp">
                      {inventoryList.map((inv) => (
                        <option key={inv.id} value={inv.nama} />
                      ))}
                    </datalist>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Serial Number (S/N)</label>
                    <input
                      required
                      type="text"
                      value={formData.sn || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, sn: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputCls} font-mono`}
                      placeholder="Ketik Serial Number..."
                    />
                  </div>
                </div>

                <h4 className="font-bold text-xs text-emerald-400 border-b border-slate-800 pb-2 pt-2 uppercase tracking-wider">
                  Vendor & Masa Kontrak
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Penyedia / Vendor</label>
                    <input
                      type="text"
                      value={formData.penyedia || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, penyedia: e.target.value }))}
                      disabled={isSaving}
                      className={inputCls}
                      placeholder="POJ / Vendor Swasta..."
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Tgl Mulai Sewa</label>
                    <input
                      type="date"
                      value={tglMulai}
                      onChange={(e) => setTglMulai(e.target.value)}
                      disabled={isSaving}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Tgl Selesai Sewa</label>
                    <input
                      type="date"
                      value={tglSelesai}
                      onChange={(e) => setTglSelesai(e.target.value)}
                      disabled={isSaving}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Status (Otomatis)</label>
                    <input
                      type="text"
                      readOnly
                      value={status}
                      className={`${inputCls} bg-slate-950 font-semibold text-emerald-400 cursor-not-allowed`}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Masa Sewa (Bln)</label>
                    <input
                      type="number"
                      readOnly
                      value={masaSewa}
                      className={`${inputCls} bg-slate-950 font-semibold text-slate-300 cursor-not-allowed`}
                    />
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN: Jaringan & Spesifikasi */}
              <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-xs text-purple-400 border-b border-slate-800 pb-2 uppercase tracking-wider">
                  Jaringan & Spesifikasi Teknis
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>IP Address</label>
                    <input
                      type="text"
                      value={formData.ipAddress || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, ipAddress: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputPurple} font-mono text-emerald-400`}
                      placeholder="10.81.58.23"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>MAC Address</label>
                    <input
                      type="text"
                      value={formData.macAddress || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, macAddress: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputPurple} font-mono`}
                      placeholder="cc:96:e5:3f:af:e8"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Processor (CPU)</label>
                    <input
                      type="text"
                      value={formData.cpu || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, cpu: e.target.value }))}
                      disabled={isSaving}
                      className={inputPurple}
                      placeholder="Intel Core i5-13600..."
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Kapasitas RAM</label>
                    <input
                      type="text"
                      value={formData.ram || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, ram: e.target.value }))}
                      disabled={isSaving}
                      className={inputPurple}
                      placeholder="16 GB"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Storage / Harddisk</label>
                    <input
                      type="text"
                      value={formData.storage || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, storage: e.target.value }))}
                      disabled={isSaving}
                      className={inputPurple}
                      placeholder="512GB SSD"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Operating System (OS)</label>
                    <input
                      type="text"
                      value={formData.os || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, os: e.target.value }))}
                      disabled={isSaving}
                      className={inputPurple}
                      placeholder="Ubuntu Pegadaian V.22 / Windows 11"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Keterangan / Catatan Tambahan</label>
                    <textarea
                      rows={3}
                      value={formData.keterangan || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, keterangan: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputPurple} resize-none`}
                      placeholder="Catatan kondisi atau kerusakan jika ada..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-5 py-4 border-t border-slate-800 bg-slate-900 shrink-0 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingId ? "Simpan Perubahan" : "Simpan Data Komputer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
