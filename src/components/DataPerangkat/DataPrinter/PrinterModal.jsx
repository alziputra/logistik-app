// src/components/DataPerangkat/DataPrinter/PrinterModal.jsx
"use client";

import { X, Loader2 } from "lucide-react";

export default function PrinterModal({
  isOpen,
  editingId,
  formData,
  setFormData,
  isSaving,
  outletsList,
  inventoryList,
  snList,
  onClose,
  onSave,
  onOutletChange,
  onProdukChange,
  onDateChange,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">
            {editingId ? "Edit Data Printer" : "Tambah Printer Baru"}
          </h3>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSave} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Nama Outlet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Outlet</label>
              <input
                required
                type="text"
                list="outlets-suggestions"
                value={formData.outlet}
                onChange={onOutletChange}
                disabled={isSaving}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                placeholder="Ketik untuk mencari outlet..."
              />
              <datalist id="outlets-suggestions">
                {outletsList.map((o) => (
                  <option key={o.id} value={o.nama} />
                ))}
              </datalist>
            </div>

            {/* ID Outlet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Outlet (Kode)</label>
              <input
                required
                type="text"
                readOnly
                value={formData.idOutlet}
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500 outline-none cursor-not-allowed"
                placeholder="Otomatis terisi..."
              />
            </div>

            {/* Produk */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produk Hardware</label>
              <input
                required
                type="text"
                list="produk-suggestions"
                value={formData.produk}
                onChange={onProdukChange}
                disabled={isSaving}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                placeholder="Ketik untuk mencari produk..."
              />
              <datalist id="produk-suggestions">
                {inventoryList.map((inv) => (
                  <option key={inv.id} value={inv.nama} />
                ))}
              </datalist>
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number (SN)</label>
              <input
                required
                type="text"
                list="sn-suggestions"
                value={formData.sn}
                onChange={(e) => setFormData((p) => ({ ...p, sn: e.target.value }))}
                disabled={isSaving}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                placeholder="Ketik atau pilih SN..."
              />
              <datalist id="sn-suggestions">
                {snList.map((sn, idx) => (
                  <option key={idx} value={sn} />
                ))}
              </datalist>
            </div>

            {/* Penyedia */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Penyedia</label>
              <input
                required
                type="text"
                value={formData.penyedia}
                onChange={(e) => setFormData((p) => ({ ...p, penyedia: e.target.value }))}
                disabled={isSaving}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                placeholder="Otomatis terisi jika ada..."
              />
            </div>

            {/* Tgl Mulai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Mulai Sewa</label>
              <input
                type="date"
                value={formData.tanggalMulai}
                onChange={(e) => onDateChange("tanggalMulai", e.target.value)}
                disabled={isSaving}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
              />
            </div>

            {/* Tgl Selesai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Selesai Sewa</label>
              <input
                type="date"
                value={formData.tanggalSelesai}
                onChange={(e) => onDateChange("tanggalSelesai", e.target.value)}
                disabled={isSaving}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status (Otomatis)</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                disabled={isSaving}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100 font-medium"
              >
                <option value="Inventaris">Inventaris</option>
                <option value="Sewa Berjalan">Sewa Berjalan</option>
                <option value="Sewa Habis">Sewa Habis</option>
              </select>
            </div>

            {/* Kondisi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi</label>
              <select
                value={formData.kondisi}
                onChange={(e) => setFormData((p) => ({ ...p, kondisi: e.target.value }))}
                disabled={isSaving}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100"
              >
                <option value="BAIK">BAIK</option>
                <option value="KURANG BAIK">KURANG BAIK</option>
                <option value="RUSAK">RUSAK</option>
              </select>
            </div>

            {/* Deskripsi */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Tambahan</label>
              <input
                type="text"
                value={formData.deskripsi}
                onChange={(e) => setFormData((p) => ({ ...p, deskripsi: e.target.value }))}
                disabled={isSaving}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 disabled:bg-blue-400"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? "Simpan Perubahan" : "Simpan Printer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}