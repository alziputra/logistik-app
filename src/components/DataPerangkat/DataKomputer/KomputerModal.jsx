import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";

export default function KomputerModal({
  isOpen,
  editingId,
  formData = {},
  setFormData = () => { },
  isSaving = false,
  outletsList = [],
  inventoryList = [],
  vendorsList = [],
  onClose = () => { },
  onSave = () => { },
}) {
  const [tglMulai, setTglMulai] = useState(formData.tanggalMulai || formData.tanggal_mulai || "");
  const [tglSelesai, setTglSelesai] = useState(formData.tanggalSelesai || formData.tanggal_selesai || "");

  // State untuk custom dropdown combobox
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

  // Handle click outside untuk menutup dropdown
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

  // Master lists filter
  const filteredOutlets = useMemo(() => {
    const q = (formData.outlet || "").toLowerCase().trim();
    if (!q) return outletsList;
    return outletsList.filter((o) => (o.nama || "").toLowerCase().includes(q) || (o.kode || o.idOutlet || "").toLowerCase().includes(q));
  }, [outletsList, formData.outlet]);

  const filteredInventory = useMemo(() => {
    const masterList = inventoryList.length > 0 ? inventoryList : [
      { id: "p1", nama: "Dell Optiplex SFF 7010", kategori: "KOMPUTER" },
      { id: "p2", nama: "Dell OptiPlex 3070 MFF", kategori: "KOMPUTER" },
      { id: "p3", nama: "Dell OptiPlex 3060", kategori: "KOMPUTER" },
      { id: "p4", nama: "Dell OptiPlex 5090", kategori: "KOMPUTER" },
      { id: "p5", nama: "Lenovo ThinkCentre M720q", kategori: "KOMPUTER" },
      { id: "p6", nama: "HP ProDesk 400 G6", kategori: "KOMPUTER" },
    ];
    const q = (formData.produk || "").toLowerCase().trim();
    if (!q) return masterList;
    return masterList.filter((item) => (item.nama || item.produk || "").toLowerCase().includes(q));
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
  const inputPurple =
    "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-purple-500 placeholder:text-slate-500 transition-colors";
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
        <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* KOLOM KIRI: Hardware, Outlet & Sewa */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-emerald-400 border-b border-slate-800 pb-2 uppercase tracking-wider">
                  Informasi Hardware & Lokasi
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Nama Outlet Combobox Dropdown */}
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
                        placeholder="Pilih atau ketik nama outlet..."
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

                  {/* Kondisi Hardware */}
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

                  {/* Produk / Model PC Combobox Dropdown */}
                  <div className="relative sm:col-span-2" ref={produkRef}>
                    <label className={labelCls}>Produk / Model PC</label>
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
                        placeholder="Pilih atau ketik produk model PC..."
                      />
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {showProdukDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto custom-scrollbar p-1">
                        {filteredInventory.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-slate-400 italic">
                            Gunakan model custom: "{formData.produk}"
                          </div>
                        ) : (
                          filteredInventory.map((item, idx) => (
                            <button
                              key={item.id || idx}
                              type="button"
                              onClick={() => {
                                setFormData((p) => ({ ...p, produk: item.nama || item.produk }));
                                setShowProdukDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[#00753A]/30 hover:text-emerald-300 transition-colors flex items-center justify-between group cursor-pointer"
                            >
                              <span className="font-semibold text-slate-200 group-hover:text-emerald-300">
                                {item.nama || item.produk}
                              </span>
                              {item.kategori && (
                                <span className="text-[10px] bg-slate-900 text-emerald-400 px-2 py-0.5 rounded-full border border-slate-700">
                                  {item.kategori}
                                </span>
                              )}
                            </button>
                          ))
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
                      placeholder="Ketik Serial Number..."
                    />
                  </div>
                </div>

                <h4 className="font-bold text-xs text-emerald-400 border-b border-slate-800 pb-2 pt-2 uppercase tracking-wider">
                  Vendor & Masa Kontrak
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Penyedia / Vendor Combobox Dropdown */}
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
