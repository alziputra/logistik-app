import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";

export default function PrinterModal({
  isOpen,
  editingId,
  formData = {},
  setFormData = () => { },
  isSaving = false,
  outletsList = [],
  inventoryList = [],
  vendorsList = [],
  snList = [],
  onClose = () => { },
  onSave = () => { },
}) {
  const [tglMulai, setTglMulai] = useState(formData.tanggalMulai || formData.tanggal_mulai || "");
  const [tglSelesai, setTglSelesai] = useState(formData.tanggalSelesai || formData.tanggal_selesai || "");

  // State custom combobox dropdown
  const [showOutletDropdown, setShowOutletDropdown] = useState(false);
  const [showProdukDropdown, setShowProdukDropdown] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);

  const outletRef = useRef(null);
  const produkRef = useRef(null);
  const vendorRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTglMulai(formData.tanggalMulai || formData.tanggal_mulai || "");
      setTglSelesai(formData.tanggalSelesai || formData.tanggal_selesai || "");
    }
  }, [isOpen, editingId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (outletRef.current && !outletRef.current.contains(e.target)) setShowOutletDropdown(false);
      if (produkRef.current && !produkRef.current.contains(e.target)) setShowProdukDropdown(false);
      if (vendorRef.current && !vendorRef.current.contains(e.target)) setShowVendorDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const filteredOutlets = useMemo(() => {
    const q = (formData.outlet || "").toLowerCase().trim();
    if (!q) return outletsList;
    return outletsList.filter((o) => (o.nama || "").toLowerCase().includes(q) || (o.kode || o.idOutlet || "").toLowerCase().includes(q));
  }, [outletsList, formData.outlet]);

  const filteredInventory = useMemo(() => {
    const masterPrinters = inventoryList.length > 0 ? inventoryList : [
      { id: "pr1", nama: "EPSON L4260 ECO TANK", kategori: "PRINTER" },
      { id: "pr2", nama: "EPSON L4261 ECO TANK (2442)", kategori: "PRINTER" },
      { id: "pr3", nama: "LQ-310 DOT MATRIX", kategori: "PRINTER" },
      { id: "pr4", nama: "HP LaserJet Pro M404", kategori: "PRINTER" },
      { id: "pr5", nama: "Canon PIXMA G3010", kategori: "PRINTER" },
    ];
    const q = (formData.produk || "").toLowerCase().trim();
    if (!q) return masterPrinters;
    return masterPrinters.filter((item) => (item.nama || item.produk || "").toLowerCase().includes(q));
  }, [inventoryList, formData.produk]);

  const filteredVendors = useMemo(() => {
    const masterVendors = vendorsList.length > 0 ? vendorsList : [
      { id: "v1", nama_perusahaan: "PT PESONNA OPTIMA JASA", pimpinan: "Achmad Suadi", kota: "Jakarta Central" },
      { id: "v2", nama_perusahaan: "CV YODERINDO INTI PRIMA", pimpinan: "Yoderindo", kota: "Surabaya" },
      { id: "v3", nama_perusahaan: "PT DANAKAR", pimpinan: "Danakar", kota: "Jakarta" },
      { id: "v4", nama_perusahaan: "PT GLOBAL SOLUSINDO KOMPUDATA", pimpinan: "Global Solusindo", kota: "Bandung" },
      { id: "v5", nama_perusahaan: "PT FRESH UTAMA PERKASA", pimpinan: "Fresh Utama", kota: "Jakarta" },
    ];
    const q = (formData.penyedia || "").toLowerCase().trim();
    if (!q) return masterVendors;
    return masterVendors.filter(
      (v) => (v.nama_perusahaan || v.nama || "").toLowerCase().includes(q) || (v.pimpinan || "").toLowerCase().includes(q)
    );
  }, [vendorsList, formData.penyedia]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormData((prev) => ({
      ...prev,
      tanggalMulai: tglMulai,
      tanggal_mulai: tglMulai,
      tanggalSelesai: tglSelesai,
      tanggal_selesai: tglSelesai,
      status: status,
    }));
    if (onSave) onSave(e);
  };

  if (!isOpen) return null;

  const inputCls =
    "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 placeholder:text-slate-500 transition-colors";
  const labelCls = "block text-[11px] font-semibold text-slate-300 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
          <h3 className="font-bold text-base text-slate-100">
            {editingId ? "Edit Data Printer" : "Tambah Printer Baru"}
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
        <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Nama Outlet Combobox */}
              <div className="relative sm:col-span-2" ref={outletRef}>
                <label className={labelCls}>Nama Outlet / Lokasi</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.outlet || ""}
                    onFocus={() => setShowOutletDropdown(true)}
                    onChange={(e) => {
                      const val = e.target.value;
                      const found = outletsList.find((o) => o.nama?.toLowerCase() === val.toLowerCase());
                      setFormData((p) => ({
                        ...p,
                        outlet: val,
                        idOutlet: found ? found.idOutlet || found.kode || found.id || p.idOutlet || "" : p.idOutlet || "",
                      }));
                      setShowOutletDropdown(true);
                    }}
                    disabled={isSaving}
                    className={`${inputCls} pr-8`}
                    placeholder="Pilih atau ketik lokasi outlet..."
                  />
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {showOutletDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto custom-scrollbar p-1">
                    {filteredOutlets.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-slate-400 italic">
                        Gunakan outlet custom: "{formData.outlet}"
                      </div>
                    ) : (
                      filteredOutlets.map((o, idx) => (
                        <button
                          key={o.id || idx}
                          type="button"
                          onClick={() => {
                            setFormData((p) => ({
                              ...p,
                              outlet: o.nama,
                              idOutlet: o.idOutlet || o.kode || o.id || "",
                            }));
                            setShowOutletDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[#00753A]/30 hover:text-emerald-300 transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <span className="font-semibold text-slate-200 group-hover:text-emerald-300">
                            {o.nama}
                          </span>
                          {(o.idOutlet || o.kode || o.id) && (
                            <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 font-mono">
                              {o.idOutlet || o.kode || o.id}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* ID Outlet */}
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

              {/* Produk Hardware Combobox */}
              <div className="relative" ref={produkRef}>
                <label className={labelCls}>Produk Hardware / Model</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.produk || ""}
                    onFocus={() => setShowProdukDropdown(true)}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, produk: e.target.value }));
                      setShowProdukDropdown(true);
                    }}
                    disabled={isSaving}
                    className={`${inputCls} pr-8`}
                    placeholder="Pilih atau ketik model printer..."
                  />
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                    {showProdukDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto custom-scrollbar p-1.5">
                        {filteredInventory.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-slate-400 italic">
                            Gunakan model custom: "{formData.produk}"
                          </div>
                        ) : (
                          filteredInventory.map((item, idx) => {
                            const name = item.nama || item.produk;
                            const spkNo = item.no_spk || item.no_pks || "";
                            const vendorName = item.vendor_nama || item.vendor?.nama || (typeof item.vendor === "string" ? item.vendor : "");
                            const stok = item.kuantitas !== undefined ? item.kuantitas : (item.stok || 0);

                            return (
                              <button
                                key={item.id || idx}
                                type="button"
                                onClick={() => {
                                  setFormData((p) => ({
                                    ...p,
                                    produk: name,
                                    penyedia: vendorName || p.penyedia,
                                    no_spk: spkNo || p.no_spk,
                                    tanggalMulai: item.tgl_mulai_sewa || p.tanggalMulai,
                                    tanggalSelesai: item.tgl_selesai_sewa || p.tanggalSelesai,
                                  }));
                                  if (item.tgl_mulai_sewa) setTglMulai(item.tgl_mulai_sewa);
                                  if (item.tgl_selesai_sewa) setTglSelesai(item.tgl_selesai_sewa);
                                  setShowProdukDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2.5 text-xs rounded-lg hover:bg-[#00753A]/30 hover:text-emerald-300 transition-colors border-b border-slate-700/50 last:border-0 group cursor-pointer"
                              >
                                <div className="font-semibold text-slate-200 group-hover:text-emerald-300 truncate">
                                  {name}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  {spkNo && (
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                                      SPK: {spkNo}
                                    </span>
                                  )}
                                  {vendorName && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                                      {vendorName}
                                    </span>
                                  )}
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700 font-mono">
                                    Stok: {stok}
                                  </span>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
              </div>

              {/* Serial Number */}
              <div className="sm:col-span-2">
                <label className={labelCls}>Serial Number (S/N)</label>
                <input
                  required
                  type="text"
                  value={formData.sn || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, sn: e.target.value }))}
                  disabled={isSaving}
                  className={`${inputCls} font-mono`}
                  placeholder="X8SS028432..."
                />
              </div>

              {/* Penyedia / Vendor Combobox */}
              <div className="relative sm:col-span-2" ref={vendorRef}>
                <label className={labelCls}>Penyedia / Vendor</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.penyedia || ""}
                    onFocus={() => setShowVendorDropdown(true)}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, penyedia: e.target.value }));
                      setShowVendorDropdown(true);
                    }}
                    disabled={isSaving}
                    className={`${inputCls} pr-8`}
                    placeholder="Pilih atau ketik vendor penyedia..."
                  />
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {showVendorDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto custom-scrollbar p-1">
                    {filteredVendors.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-slate-400 italic">
                        Gunakan vendor custom: "{formData.penyedia}"
                      </div>
                    ) : (
                      filteredVendors.map((v, idx) => (
                        <button
                          key={v.id || idx}
                          type="button"
                          onClick={() => {
                            setFormData((p) => ({ ...p, penyedia: v.nama_perusahaan || v.nama }));
                            setShowVendorDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[#00753A]/30 hover:text-emerald-300 transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-slate-200 group-hover:text-emerald-300">
                              {v.nama_perusahaan || v.nama}
                            </div>
                            {v.pimpinan && (
                              <div className="text-[10px] text-slate-400">
                                Pimpinan: {v.pimpinan} {v.kota ? `• ${v.kota}` : ""}
                              </div>
                            )}
                          </div>
                          {v.kategori_bidang && (
                            <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">
                              {v.kategori_bidang}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Tgl Mulai Sewa */}
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

              {/* Tgl Selesai Sewa */}
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

              {/* Status */}
              <div>
                <label className={labelCls}>Status (Otomatis)</label>
                <input
                  type="text"
                  readOnly
                  value={status}
                  className={`${inputCls} bg-slate-950 font-semibold text-emerald-400 cursor-not-allowed`}
                />
              </div>

              {/* Masa Sewa */}
              <div>
                <label className={labelCls}>Masa Sewa (Bln)</label>
                <input
                  type="number"
                  readOnly
                  value={masaSewa}
                  className={`${inputCls} bg-slate-950 font-semibold text-slate-300 cursor-not-allowed`}
                />
              </div>

              {/* Kondisi */}
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

              {/* Deskripsi */}
              <div className="sm:col-span-2">
                <label className={labelCls}>Deskripsi Tambahan / Catatan</label>
                <textarea
                  rows={3}
                  value={formData.deskripsi || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, deskripsi: e.target.value }))}
                  disabled={isSaving}
                  className={`${inputCls} resize-none`}
                  placeholder="Catatan kondisi atau kerusakan printer..."
                />
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
              {editingId ? "Simpan Perubahan" : "Simpan Printer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
