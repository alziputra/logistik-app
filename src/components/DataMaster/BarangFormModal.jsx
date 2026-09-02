import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Edit,
  Database,
  Plus,
  Loader2,
  Package,
  Calendar,
  Building2,
  ChevronDown,
  Check,
  Sparkles,
  FileText,
  ArrowDownToLine,
  Search,
  CheckCircle2,
  RotateCcw,
  Boxes,
} from "lucide-react";
import { BARANG_CATEGORIES } from "../../constants/barangCategories";
import CategoryDropdown from "../Common/CategoryDropdown";
import { getSpkPksList } from "../../services/spkPksService";

export default function BarangFormModal({
  isOpen,
  editingInv,
  isSaving,
  inventory = [],
  vendors = [],
  spkList = [],
  onClose,
  onSubmit,
}) {
  const [namaBarang, setNamaBarang] = useState("");
  const [kategori, setKategori] = useState("IT Hardware & Komputer");
  const [kuantitas, setKuantitas] = useState(0);
  const [satuan, setSatuan] = useState("Unit");
  const [vendorNama, setVendorNama] = useState("");
  const [noSpk, setNoSpk] = useState("");
  const [noPks, setNoPks] = useState("");
  const [tglMulai, setTglMulai] = useState("");
  const [tglSelesai, setTglSelesai] = useState("");
  const [statusVal, setStatusVal] = useState("Inventaris");
  const [masaSewa, setMasaSewa] = useState(0);

  // Dropdowns & Pickers
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [isSpkPickerOpen, setIsSpkPickerOpen] = useState(false);
  const [spkSearchQuery, setSpkSearchQuery] = useState("");
  const [allSpkData, setAllSpkData] = useState(spkList || []);
  const [importedSpkInfo, setImportedSpkInfo] = useState(null);

  // Fetch SPK/PKS if empty
  useEffect(() => {
    if (isOpen) {
      if (spkList && spkList.length > 0) {
        setAllSpkData(spkList);
      } else {
        getSpkPksList().then((data) => {
          if (data && data.length > 0) {
            setAllSpkData(data);
          }
        });
      }
    }
  }, [isOpen, spkList]);

  useEffect(() => {
    if (editingInv) {
      setNamaBarang(editingInv.nama || "");
      const existingKategori = editingInv.kategori || "IT Hardware & Komputer";
      setKategori(existingKategori);
      setKuantitas(Number(editingInv.kuantitas !== undefined ? editingInv.kuantitas : editingInv.stok || 0));
      setSatuan(editingInv.satuan || "Unit");
      setVendorNama(editingInv.vendor_nama || editingInv.vendor?.nama || "");
      setNoSpk(editingInv.no_spk || "");
      setNoPks(editingInv.no_pks || "");
      setTglMulai(editingInv.tanggal_mulai || "");
      setTglSelesai(editingInv.tanggal_selesai || "");
      setMasaSewa(Number(editingInv.masa_sewa_bulan !== undefined ? editingInv.masa_sewa_bulan : 0));
      setStatusVal(editingInv.status || "Inventaris");
      setImportedSpkInfo(null);
    } else {
      setNamaBarang("");
      setKategori("IT Hardware & Komputer");
      setKuantitas(0);
      setSatuan("Unit");
      setVendorNama("");
      setNoSpk("");
      setNoPks("");
      setTglMulai("");
      setTglSelesai("");
      setMasaSewa(0);
      setStatusVal("Inventaris");
      setImportedSpkInfo(null);
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
      setStatusVal("Inventaris");
      setMasaSewa(0);
    }
  }, [isVendorFilled]);

  // Auto calculate masa sewa and auto update status when dates change
  useEffect(() => {
    if (isVendorFilled && tglMulai && tglSelesai) {
      const d1 = new Date(tglMulai);
      const d2 = new Date(tglSelesai);
      if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
        let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
        if (d2.getDate() < d1.getDate()) months--;
        const calcMonths = months < 0 ? 0 : months;
        setMasaSewa(calcMonths);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (d2 < today) {
          setStatusVal("Sewa Selesai");
        } else {
          setStatusVal("Sewa Berjalan");
        }
      }
    }
  }, [isVendorFilled, tglMulai, tglSelesai]);

  // Handle Import from SPK / PKS
  const handleSelectSpk = (spk) => {
    if (!spk) return;
    setNamaBarang(spk.nama_barang || spk.nama || "");
    if (spk.kategori) {
      setKategori(spk.kategori);
    }
    setKuantitas(Number(spk.jumlah || spk.kuantitas || 1));
    setSatuan(spk.satuan || "Unit");
    setVendorNama(spk.vendor_nama || "");
    setNoSpk(spk.no_spk || "");
    setNoPks(spk.no_pks || "");
    setTglMulai(spk.tanggal_mulai || "");
    setTglSelesai(spk.tanggal_selesai || "");
    setMasaSewa(Number(spk.masa_sewa_bulan !== undefined ? spk.masa_sewa_bulan : 0));
    setStatusVal(spk.status || "Sewa Berjalan");
    setImportedSpkInfo(spk);
    setIsSpkPickerOpen(false);
  };

  const handleResetImport = () => {
    setImportedSpkInfo(null);
  };

  // Filter SPK in Picker
  const filteredSpkList = useMemo(() => {
    const q = (spkSearchQuery || "").toLowerCase();
    return allSpkData.filter((s) => {
      const noSpkMatch = (s.no_spk || "").toLowerCase().includes(q);
      const noPksMatch = (s.no_pks || "").toLowerCase().includes(q);
      const namaMatch = (s.nama_barang || s.nama || "").toLowerCase().includes(q);
      const vendorMatch = (s.vendor_nama || "").toLowerCase().includes(q);
      const katMatch = (s.kategori || "").toLowerCase().includes(q);
      return noSpkMatch || noPksMatch || namaMatch || vendorMatch || katMatch;
    });
  }, [allSpkData, spkSearchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#E6F4EA] dark:bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-[#00753A] dark:text-emerald-400">
              {editingInv ? <Edit className="w-5 h-5" /> : <Database className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {editingInv ? "Edit Data Barang / Asset" : "Tambah Master Barang / Asset"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {editingInv ? "Perbarui informasi rincian katalog barang" : "Masukkan informasi barang baru ke dalam database master"}
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

        {/* Body Form */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* Quick Import from SPK Banner */}
          {!editingInv && (
            <div className="bg-linear-to-r from-[#E6F4EA] via-emerald-50/50 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#00753A] text-white rounded-xl shadow-xs shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Tarik / Import Data dari SPK & PKS
                    </h4>
                    <span className="text-[10px] bg-[#00753A] text-white font-extrabold px-2 py-0.5 rounded-full">
                      Auto-Fill
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    {importedSpkInfo ? (
                      <span className="text-[#00753A] dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 inline" /> Terhubung ke SPK:{" "}
                        <strong className="font-bold font-mono">{importedSpkInfo.no_spk}</strong> ({importedSpkInfo.nama_barang || importedSpkInfo.nama})
                      </span>
                    ) : (
                      "Isi otomatis nama barang, vendor, No. SPK/PKS, jumlah unit, dan masa sewa dari kontrak."
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                {importedSpkInfo && (
                  <button
                    type="button"
                    onClick={handleResetImport}
                    title="Lepas keterikatan SPK"
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsSpkPickerOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#00753A] hover:bg-[#005c2e] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-[#00753A]/20 transition-all cursor-pointer"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  {importedSpkInfo ? "Ganti Pilihan SPK" : "Pilih dari SPK / PKS"}
                </button>
              </div>
            </div>
          )}

          <form id="formBarang" onSubmit={onSubmit} className="space-y-6">
            {/* Section 1: Informasi Utama */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00753A] dark:text-emerald-400 uppercase tracking-wider">
                <Package className="w-4 h-4" /> Informasi Utama Barang
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60">
                {/* Nama Barang */}
                <div className="md:col-span-2 relative">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nama Barang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="nama"
                    type="text"
                    value={namaBarang}
                    onChange={(e) => setNamaBarang(e.target.value)}
                    required
                    placeholder="Contoh: Dell Optiplex SFF 7010"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 transition-all"
                  />
                </div>

                {/* Kategori Barang */}
                <div className="md:col-span-2">
                  <CategoryDropdown
                    name="kategori"
                    value={kategori}
                    onChange={(val) => setKategori(val)}
                    required
                  />
                </div>

                {/* Stok Barang */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Stok Barang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="kuantitas"
                    type="number"
                    value={kuantitas}
                    onChange={(e) => setKuantitas(Number(e.target.value))}
                    min="0"
                    required
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 transition-all font-mono"
                  />
                </div>

                {/* Satuan */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Satuan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="satuan"
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 transition-all cursor-pointer font-medium"
                  >
                    <option value="Unit">Unit</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Box">Box</option>
                    <option value="Rim">Rim</option>
                    <option value="Set">Set</option>
                    <option value="Paket">Paket</option>
                    <option value="Roll">Roll</option>
                    <option value="Lembar">Lembar</option>
                    <option value="Meter">Meter</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Vendor & Legalitas Kontrak */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00753A] dark:text-emerald-400 uppercase tracking-wider">
                <Building2 className="w-4 h-4" /> Vendor & Legalitas Kontrak
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60">
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Vendor</label>
                  <div className="relative">
                    <input
                      name="vendor_nama"
                      type="text"
                      value={vendorNama}
                      onChange={(e) => {
                        setVendorNama(e.target.value);
                        setIsVendorDropdownOpen(true);
                      }}
                      onFocus={() => setIsVendorDropdownOpen(true)}
                      placeholder="Pilih / ketik nama vendor..."
                      className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 transition-all"
                    />
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 transition-transform cursor-pointer ${isVendorDropdownOpen ? "rotate-180" : ""}`}
                      onClick={() => setIsVendorDropdownOpen(!isVendorDropdownOpen)}
                    />
                  </div>

                  {/* Custom Styled Vendor Dropdown Panel */}
                  {isVendorDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsVendorDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 rounded-xl shadow-2xl z-20 divide-y divide-slate-100 dark:divide-slate-800 text-xs custom-scrollbar">
                        {vendors.filter((v) => {
                          const q = (vendorNama || "").toLowerCase();
                          const name = (v.nama_perusahaan || v.nama || "").toLowerCase();
                          const pimpinan = (v.pimpinan || "").toLowerCase();
                          const ket = (v.keterangan || "").toLowerCase();
                          return name.includes(q) || pimpinan.includes(q) || ket.includes(q);
                        }).length === 0 ? (
                          <div className="p-3 text-center text-slate-400 italic">
                            Vendor baru: &quot;{vendorNama}&quot; (tekan simpan untuk menggunakan)
                          </div>
                        ) : (
                          vendors
                            .filter((v) => {
                              const q = (vendorNama || "").toLowerCase();
                              const name = (v.nama_perusahaan || v.nama || "").toLowerCase();
                              const pimpinan = (v.pimpinan || "").toLowerCase();
                              const ket = (v.keterangan || "").toLowerCase();
                              return name.includes(q) || pimpinan.includes(q) || ket.includes(q);
                            })
                            .map((v) => {
                              const displayName = v.nama_perusahaan || v.nama;
                              return (
                                <button
                                  key={v.id}
                                  type="button"
                                  onClick={() => {
                                    setVendorNama(displayName);
                                    setIsVendorDropdownOpen(false);
                                  }}
                                  className="w-full text-left p-3 hover:bg-[#E6F4EA] dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 hover:text-[#00753A] flex flex-col gap-1 transition-colors cursor-pointer group"
                                >
                                  <span className="font-bold group-hover:text-[#00753A] dark:group-hover:text-emerald-400">
                                    {displayName}
                                  </span>
                                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                                    {v.pimpinan && (
                                      <span>
                                        {v.pimpinan} ({v.jabatan || "Direktur"})
                                      </span>
                                    )}
                                    {v.kota && <span>• {v.kota}</span>}
                                    {v.keterangan && (
                                      <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded text-[9px] font-extrabold border border-emerald-200 dark:border-emerald-800/40">
                                        {v.keterangan}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">No. SPK</label>
                  <input
                    name="no_spk"
                    value={noSpk}
                    onChange={(e) => setNoSpk(e.target.value)}
                    placeholder="Contoh: PO/3567/00108.04/2026"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">No. PKS</label>
                  <input
                    name="no_pks"
                    value={noPks}
                    onChange={(e) => setNoPks(e.target.value)}
                    placeholder="Contoh: 2503/00108.04/2026"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Tanggal & Status Sewa */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00753A] dark:text-emerald-400 uppercase tracking-wider">
                <Calendar className="w-4 h-4" /> Jangka Waktu & Status Otomatis
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tgl Mulai Sewa</label>
                  <input
                    name="tanggal_mulai"
                    type="date"
                    disabled={!isVendorFilled}
                    value={tglMulai}
                    onChange={(e) => setTglMulai(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition-all ${
                      !isVendorFilled
                        ? "bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-400 cursor-not-allowed opacity-60"
                        : "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tgl Selesai Sewa</label>
                  <input
                    name="tanggal_selesai"
                    type="date"
                    disabled={!isVendorFilled}
                    value={tglSelesai}
                    onChange={(e) => setTglSelesai(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition-all ${
                      !isVendorFilled
                        ? "bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-400 cursor-not-allowed opacity-60"
                        : "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status Barang / Sewa</label>
                  <select
                    name="status"
                    value={statusVal}
                    disabled={!isVendorFilled}
                    onChange={(e) => setStatusVal(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all ${
                      !isVendorFilled
                        ? "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed opacity-60"
                        : statusVal === "Sewa Selesai"
                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800/60 cursor-pointer"
                        : statusVal === "Sewa Dibatalkan"
                        ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800/60 cursor-pointer"
                        : statusVal === "Sewa Berjalan"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60 cursor-pointer"
                        : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 cursor-pointer"
                    }`}
                  >
                    <option value="Inventaris">Inventaris</option>
                    <option value="Sewa Berjalan">Sewa Berjalan</option>
                    <option value="Sewa Selesai">Sewa Selesai</option>
                    <option value="Segera Berakhir">Segera Berakhir</option>
                    <option value="Sewa Dibatalkan">Sewa Dibatalkan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Masa Sewa (Bulan)</label>
                  <input
                    name="masa_sewa_bulan"
                    type="number"
                    min="0"
                    disabled={!isVendorFilled}
                    value={masaSewa}
                    onChange={(e) => setMasaSewa(Number(e.target.value))}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono outline-none border transition-all ${
                      !isVendorFilled
                        ? "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed opacity-60"
                        : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40"
                    }`}
                  />
                </div>
              </div>
              {!isVendorFilled && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400/90 mt-2 font-medium flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/40">
                  <span>💡</span> Isi atau pilih <strong className="font-bold text-amber-900 dark:text-amber-300">Nama Vendor</strong> atau gunakan tombol <strong className="text-[#00753A] dark:text-emerald-400 font-bold">Pilih dari SPK / PKS</strong> di atas untuk pengisian otomatis.
                </p>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#00753A] hover:bg-[#005c2e] rounded-xl flex items-center gap-2 shadow-lg shadow-[#00753A]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editingInv ? "Simpan Perubahan" : "Tambah Barang"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL PICKER SPK / PKS */}
      {isSpkPickerOpen && (
        <div className="fixed inset-0 bg-black/75 dark:bg-slate-950/85 backdrop-blur-sm z-60 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#E6F4EA] dark:bg-emerald-950/80 rounded-xl text-[#00753A] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Pilih Data SPK & PKS
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pilih salah satu kontrak untuk menarik data barang secara otomatis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSpkPickerOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={spkSearchQuery}
                  onChange={(e) => setSpkSearchQuery(e.target.value)}
                  placeholder="Cari No. SPK, No. PKS, Nama Barang, Vendor..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40"
                  autoFocus
                />
              </div>
            </div>

            {/* List of SPK Cards */}
            <div className="p-4 overflow-y-auto custom-scrollbar space-y-3 flex-1">
              {filteredSpkList.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-semibold">Tidak ada data SPK / PKS yang cocok</p>
                  <p className="text-[11px] mt-0.5">Coba cari dengan kata kunci nomor kontrak atau nama barang lain.</p>
                </div>
              ) : (
                filteredSpkList.map((spk) => (
                  <div
                    key={spk.id || spk.no_spk}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-slate-900/60 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                          {spk.no_spk || "-"}
                        </span>
                        {spk.no_pks && (
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            PKS: {spk.no_pks}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          {spk.kategori || "Barang"}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {spk.status || "Sewa Berjalan"}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 group-hover:text-[#00753A] dark:group-hover:text-emerald-400 transition-colors">
                        {spk.nama_barang || spk.nama}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-[#00753A]" /> {spk.vendor_nama || "-"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono font-bold text-[#00753A] dark:text-emerald-400">
                          <Boxes className="w-3.5 h-3.5" /> {spk.jumlah || 1} {spk.satuan || "Unit"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" /> {spk.tanggal_mulai || "-"} s/d {spk.tanggal_selesai || "-"} ({spk.masa_sewa_bulan || 0} Bln)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectSpk(spk)}
                      className="px-4 py-2 bg-[#00753A] hover:bg-[#005c2e] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shrink-0 shadow-xs transition-all cursor-pointer group-hover:shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" /> Gunakan Data Ini
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/90 shrink-0 text-xs text-slate-500">
              <span>Menampilkan {filteredSpkList.length} dari {allSpkData.length} data kontrak</span>
              <button
                type="button"
                onClick={() => setIsSpkPickerOpen(false)}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-300 font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
