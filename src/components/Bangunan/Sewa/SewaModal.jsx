import React from "react";
import { X, Loader2, Key } from "lucide-react";

export default function SewaModal({
  isOpen,
  editingId,
  formData = {},
  setFormData = () => {},
  isSaving = false,
  outletsList = [],
  onClose = () => {},
  onSave = () => {},
}) {
  if (!isOpen) return null;

  const handleOutletChange = (e) => {
    const val = e.target.value;
    const matched = outletsList.find((o) => o.nama?.toLowerCase() === val.toLowerCase());
    setFormData((p) => ({
      ...p,
      nama_outlet: val,
      outlet: val,
      idOutlet: matched ? matched.id : "",
      outlet_id: matched ? matched.id : "",
      kode_outlet: matched ? (matched.code || matched.kode || String(matched.id)) : p.kode_outlet || "",
      alamat: matched ? (matched.alamat || "") : p.alamat || "",
    }));
  };

  const inputCls =
    "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 placeholder:text-slate-500";
  const labelCls = "block text-[11px] font-semibold text-slate-300 mb-1";

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-950 p-2 rounded-xl text-emerald-400 border border-emerald-800/40">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-100">
              {editingId ? "Edit Sewa Bangunan" : "Tambah Sewa Bangunan Baru"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Nama Outlet / Instansi *</label>
                <input
                  type="text"
                  list="outlets-list-sewa"
                  value={formData.nama_outlet || formData.outlet || ""}
                  onChange={handleOutletChange}
                  disabled={isSaving}
                  required
                  className={inputCls}
                  placeholder="Ketik atau pilih nama outlet..."
                />
                <datalist id="outlets-list-sewa">
                  {outletsList.map((o) => (
                    <option key={o.id} value={o.nama} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className={labelCls}>Kode Outlet</label>
                <input
                  type="text"
                  value={formData.kode_outlet || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, kode_outlet: e.target.value }))}
                  disabled={isSaving}
                  className={inputCls}
                  placeholder="Contoh: 12350"
                />
              </div>

              <div>
                <label className={labelCls}>Type Outlet</label>
                <input
                  type="text"
                  value={formData.type_outlet || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, type_outlet: e.target.value }))}
                  disabled={isSaving}
                  className={inputCls}
                  placeholder="Cabang / UPC..."
                />
              </div>

              <div>
                <label className={labelCls}>Type Bangunan</label>
                <select
                  value={formData.type_bangunan || "Ruko"}
                  onChange={(e) => setFormData((p) => ({ ...p, type_bangunan: e.target.value }))}
                  disabled={isSaving}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="Ruko">Ruko</option>
                  <option value="Rumah">Rumah</option>
                  <option value="Gedung">Gedung</option>
                  <option value="Kios">Kios</option>
                  <option value="Mall">Mall</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Status Gedung</label>
                <select
                  value={formData.status_gedung || "Sewa"}
                  onChange={(e) => setFormData((p) => ({ ...p, status_gedung: e.target.value }))}
                  disabled={isSaving}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="Sewa">Sewa</option>
                  <option value="Milik Sendiri">Milik Sendiri</option>
                  <option value="Pinjam Pakai">Pinjam Pakai</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Tgl Kontrak Mulai</label>
                <input
                  type="date"
                  value={formData.tgl_kontrak_mulai || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, tgl_kontrak_mulai: e.target.value }))}
                  disabled={isSaving}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Tgl Kontrak Berakhir</label>
                <input
                  type="date"
                  value={formData.tgl_kontrak_berakhir || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, tgl_kontrak_berakhir: e.target.value }))}
                  disabled={isSaving}
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Harga Sewa (Rp)</label>
                <input
                  type="number"
                  value={formData.harga_sewa || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, harga_sewa: e.target.value }))}
                  disabled={isSaving}
                  className={inputCls}
                  placeholder="Harga sewa per periode..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Alamat Lengkap</label>
                <textarea
                  rows={2}
                  value={formData.alamat || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, alamat: e.target.value }))}
                  disabled={isSaving}
                  className={`${inputCls} resize-none`}
                  placeholder="Alamat lokasi bangunan..."
                />
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-slate-800 bg-slate-900 shrink-0 flex justify-end gap-3">
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
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl cursor-pointer disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingId ? "Simpan Perubahan" : "Simpan Sewa Bangunan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
