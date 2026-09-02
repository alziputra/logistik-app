import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  FileText,
  Loader2,
  Calendar,
  Building2,
  ChevronDown,
  Sparkles,
  Package,
  Plus,
  DollarSign,
  Edit,
} from "lucide-react";
import { BARANG_CATEGORIES } from "../../constants/barangCategories";
import { angkaTerbilang } from "../../utils/terbilang";
import CategoryDropdown from "../Common/CategoryDropdown";

export default function SpkPksFormModal({
  isOpen,
  editingItem,
  isSaving,
  inventory = [],
  vendors = [],
  onClose,
  onSubmit,
}) {
  const [noSpk, setNoSpk] = useState("");
  const [noPks, setNoPks] = useState("");
  const [namaBarang, setNamaBarang] = useState("");
  const [kategori, setKategori] = useState("Perangkat Cetak & Scan");
  const [spesifikasi, setSpesifikasi] = useState("");
  const [jumlah, setJumlah] = useState(1);
  const [satuan, setSatuan] = useState("Unit");
  const [hargaSatuan, setHargaSatuan] = useState(0);
  const [status, setStatus] = useState("Sewa Berjalan");
  const [masaSewa, setMasaSewa] = useState(24);
  const [vendorNama, setVendorNama] = useState("");
  const [tglMulai, setTglMulai] = useState("");
  const [tglSelesai, setTglSelesai] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [isBarangDropdownOpen, setIsBarangDropdownOpen] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setNoSpk(editingItem.no_spk || "");
      setNoPks(editingItem.no_pks || "");
      setNamaBarang(editingItem.nama_barang || editingItem.nama || "");
      setKategori(editingItem.kategori || "Perangkat Cetak & Scan");
      setSpesifikasi(editingItem.spesifikasi || "");
      setJumlah(editingItem.jumlah || editingItem.kuantitas || 1);
      setSatuan(editingItem.satuan || "Unit");
      setHargaSatuan(editingItem.harga_satuan || 0);
      setVendorNama(editingItem.vendor_nama || editingItem.vendor?.nama || "");
      setTglMulai(editingItem.tanggal_mulai || "");
      setTglSelesai(editingItem.tanggal_selesai || "");
      setMasaSewa(Number(editingItem.masa_sewa_bulan !== undefined ? editingItem.masa_sewa_bulan : 24));
      setStatus(editingItem.status || "Sewa Berjalan");
      setKeterangan(editingItem.keterangan || "");
    } else {
      setNoSpk("");
      setNoPks("");
      setNamaBarang("");
      setKategori("Perangkat Cetak & Scan");
      setSpesifikasi("");
      setJumlah(1);
      setSatuan("Unit");
      setHargaSatuan(0);
      setVendorNama("");
      setTglMulai("");
      setTglSelesai("");
      setMasaSewa(24);
      setStatus("Sewa Berjalan");
      setKeterangan("");
    }
  }, [editingItem, isOpen]);

  // Auto-calculate masa sewa & suggest status when dates change
  useEffect(() => {
    if (tglMulai && tglSelesai) {
      const d1 = new Date(tglMulai);
      const d2 = new Date(tglSelesai);
      if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
        let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
        if (d2.getDate() < d1.getDate()) months--;
        const calcMonths = months < 0 ? 0 : months;
        setMasaSewa(calcMonths);

        // Auto detect status if user hasn't explicitly set otherwise
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (d2 < today) {
          setStatus("Sewa Selesai");
        } else {
          setStatus("Sewa Berjalan");
        }
      }
    }
  }, [tglMulai, tglSelesai]);

  // Calculated totals based on user's current masaSewa
  const sewaPerbulan = useMemo(() => {
    return Number(jumlah || 0) * Number(hargaSatuan || 0);
  }, [jumlah, hargaSatuan]);

  const totalSewaKontrak = useMemo(() => {
    const durasi = Number(masaSewa) > 0 ? Number(masaSewa) : 1;
    return sewaPerbulan * durasi;
  }, [sewaPerbulan, masaSewa]);

  const terbilangText = useMemo(() => {
    if (totalSewaKontrak <= 0) return "";
    return angkaTerbilang(totalSewaKontrak);
  }, [totalSewaKontrak]);

  // Recommendation presets
  const presetTemplates = [
    {
      nama: "Printer Epson L4260",
      kategori: "Perangkat Cetak & Scan",
      satuan: "Unit",
      harga: 170000,
      spesifikasi: `- Compact Integrated Tank design\n- Print speeds up to 10.5 ipm for black and 5.0 ipm for colour\n- Wi-Fi & Wi-Fi Direct\n- Borderless Printing up to A4 size\n- Spill-free ink refilling\n- ISO 24734 Duplex A4 (Black or Color)\n- Warranty of 2 years or 30.000 pages, whichever comes first`,
    },
    {
      nama: "Dell Optiplex 3070 MFF",
      kategori: "IT Hardware & Komputer",
      satuan: "Unit",
      harga: 225000,
      spesifikasi: `- Intel Core i5-9500T 6-Core up to 3.7GHz\n- RAM 8GB DDR4\n- SSD 256GB NVMe M.2\n- Intel UHD Graphics 630\n- OS Windows 10 Pro 64-bit\n- Include Monitor Dell 21.5" Full HD & Keyboard Mouse USB`,
    },
    {
      nama: "LQ-310 DOT MATRIX",
      kategori: "Perangkat Cetak & Scan",
      satuan: "Unit",
      harga: 135000,
      spesifikasi: `- 24-Pin Narrow Carriage Impact Dot Matrix\n- Speed: up to 416 cps (12 cpi)\n- 1 Original + 3 Copies Continuous Form\n- USB 2.0, Bi-directional parallel (IEEE-1284), Serial`,
    },
    {
      nama: "PC Desktop Core i5",
      kategori: "IT Hardware & Komputer",
      satuan: "Unit",
      harga: 210000,
      spesifikasi: `- Intel Core i5 10th Gen\n- RAM 8GB DDR4\n- SSD 512GB\n- Monitor LED 21.5" Full HD\n- Keyboard & Mouse Optical`,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#E6F4EA] dark:bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-[#00753A] dark:text-emerald-400">
              {editingItem ? <Edit className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {editingItem ? "Edit Data SPK & PKS Kontrak" : "Tambah Dokumen SPK & PKS"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {editingItem
                  ? "Perbarui rincian kontrak sewa barang dan pengadaan"
                  : "Input Surat Perintah Kerja (SPK) dan Perjanjian Kerja Sama (PKS) baru"}
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
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="formSpkPks" onSubmit={onSubmit} className="space-y-6">
            <input type="hidden" name="sewa_perbulan" value={sewaPerbulan} />
            <input type="hidden" name="total_sewa" value={totalSewaKontrak} />
            <input type="hidden" name="terbilang" value={terbilangText} />

            {/* Section 1: Nomor Legalitas Kontrak & Vendor */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00753A] dark:text-emerald-400 uppercase tracking-wider">
                <FileText className="w-4 h-4" /> Legalitas Kontrak & Vendor Pelaksana
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    No. SPK <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="no_spk"
                    type="text"
                    required
                    value={noSpk}
                    onChange={(e) => setNoSpk(e.target.value)}
                    placeholder="Contoh: PO/3567/00108.04/2026"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    No. PKS <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="no_pks"
                    type="text"
                    required
                    value={noPks}
                    onChange={(e) => setNoPks(e.target.value)}
                    placeholder="Contoh: 2503/00108.04/2026"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 transition-all font-mono"
                  />
                </div>

                {/* Vendor Selector */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Vendor / Pelaksana <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="vendor_nama"
                      type="text"
                      required
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
                      className={`w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 transition-transform cursor-pointer ${
                        isVendorDropdownOpen ? "rotate-180" : ""
                      }`}
                      onClick={() => setIsVendorDropdownOpen(!isVendorDropdownOpen)}
                    />
                  </div>

                  {/* Vendor Dropdown */}
                  {isVendorDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsVendorDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 rounded-xl shadow-2xl z-20 divide-y divide-slate-100 dark:divide-slate-800 text-xs custom-scrollbar">
                        {vendors
                          .filter((v) => {
                            const q = (vendorNama || "").toLowerCase();
                            const name = (v.nama_perusahaan || v.nama || "").toLowerCase();
                            return name.includes(q);
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
                                className="w-full text-left p-3 hover:bg-[#E6F4EA] dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 hover:text-[#00753A] flex flex-col gap-0.5 transition-colors cursor-pointer"
                              >
                                <span className="font-bold">{displayName}</span>
                                <span className="text-[10px] text-slate-400">{v.pimpinan || v.kota || "Vendor Rekanan"}</span>
                              </button>
                            );
                          })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Rincian Barang & Spesifikasi */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00753A] dark:text-emerald-400 uppercase tracking-wider">
                  <Package className="w-4 h-4" /> Rincian Barang & Spesifikasi Teknis
                </div>
                {/* Template Preset Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsBarangDropdownOpen(!isBarangDropdownOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 rounded-lg text-[11px] font-semibold hover:bg-emerald-100 transition-colors border border-emerald-200 dark:border-emerald-800/40"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Pilih Template Spesifikasi
                  </button>

                  {isBarangDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsBarangDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-1.5 w-72 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 rounded-xl shadow-2xl z-20 divide-y divide-slate-100 dark:divide-slate-800 text-xs custom-scrollbar">
                        <div className="p-2 bg-slate-50 dark:bg-slate-950 text-[10px] font-bold text-slate-500 uppercase">
                          Pilih Preset Barang
                        </div>
                        {presetTemplates.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setNamaBarang(p.nama);
                              setKategori(p.kategori);
                              setSatuan(p.satuan);
                              setHargaSatuan(p.harga);
                              setSpesifikasi(p.spesifikasi);
                              setIsBarangDropdownOpen(false);
                            }}
                            className="w-full text-left p-2.5 hover:bg-[#E6F4EA] dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
                          >
                            <div className="font-bold text-[#00753A] dark:text-emerald-400">{p.nama}</div>
                            <div className="text-[10px] text-slate-400">Rp {p.harga.toLocaleString("id-ID")}/unit/bln</div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nama Barang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="nama_barang"
                    type="text"
                    required
                    value={namaBarang}
                    onChange={(e) => setNamaBarang(e.target.value)}
                    placeholder="Contoh: Printer Epson L4260"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 transition-all font-semibold"
                  />
                </div>

                <div className="md:col-span-2">
                  <CategoryDropdown
                    name="kategori"
                    value={kategori}
                    onChange={(val) => setKategori(val)}
                    required
                  />
                </div>

                {/* Spesifikasi Lengkap */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Spesifikasi / Uraian Barang <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="spesifikasi"
                    rows={4}
                    required
                    value={spesifikasi}
                    onChange={(e) => setSpesifikasi(e.target.value)}
                    placeholder="- Masukkan rincian spesifikasi barang (misal: Prosessor, RAM, Resolusi cetak, konektivitas, garansi)..."
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 transition-all font-mono leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Jumlah Barang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="jumlah"
                    type="number"
                    min="1"
                    required
                    value={jumlah}
                    onChange={(e) => setJumlah(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 transition-all font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Satuan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="satuan"
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 transition-all cursor-pointer"
                  >
                    <option value="Unit">Unit</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Set">Set</option>
                    <option value="Paket">Paket</option>
                    <option value="Box">Box</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Harga Sewa Satuan (Rp / Unit / Bulan) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="harga_satuan"
                    type="number"
                    min="0"
                    required
                    value={hargaSatuan}
                    onChange={(e) => setHargaSatuan(Number(e.target.value))}
                    placeholder="Contoh: 170000"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 transition-all font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Jangka Waktu Sewa & Kalkulasi Finansial Otomatis */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00753A] dark:text-emerald-400 uppercase tracking-wider">
                <Calendar className="w-4 h-4" /> Periode Sewa & Perhitungan Biaya Kontrak
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mulai Sewa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="tanggal_mulai"
                    type="date"
                    required
                    value={tglMulai}
                    onChange={(e) => setTglMulai(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Akhir Sewa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="tanggal_selesai"
                    type="date"
                    required
                    value={tglSelesai}
                    onChange={(e) => setTglSelesai(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Masa Sewa (Bulan) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="masa_sewa_bulan"
                      type="number"
                      min="0"
                      required
                      value={masaSewa}
                      onChange={(e) => setMasaSewa(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Status Kontrak <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all cursor-pointer ${
                      status === "Sewa Selesai"
                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800/60"
                        : status === "Sewa Dibatalkan"
                        ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800/60"
                        : "bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60"
                    }`}
                  >
                    <option value="Sewa Berjalan">Sewa Berjalan</option>
                    <option value="Sewa Selesai">Sewa Selesai</option>
                    <option value="Segera Berakhir">Segera Berakhir</option>
                    <option value="Sewa Dibatalkan">Sewa Dibatalkan</option>
                  </select>
                </div>

                {/* Financial Summary Highlight Box */}
                <div className="md:col-span-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/40 shadow-xs space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Jumlah Harga Sewa / Bulan
                      </span>
                      <div className="text-lg font-extrabold text-[#00753A] dark:text-emerald-400 font-mono">
                        Rp {sewaPerbulan.toLocaleString("id-ID")},-
                      </div>
                      <span className="text-[10px] text-slate-400">({jumlah} {satuan} × Rp {hargaSatuan.toLocaleString("id-ID")})</span>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Total Biaya Kontrak ({masaSewa || 0} Bulan)
                      </span>
                      <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
                        Rp {totalSewaKontrak.toLocaleString("id-ID")},-
                      </div>
                    </div>
                  </div>

                  {terbilangText && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs italic text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 not-italic">Terbilang:</span> ({terbilangText})
                    </div>
                  )}
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Keterangan Tambahan / Catatan Kontrak
                  </label>
                  <input
                    name="keterangan"
                    type="text"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Contoh: Pengadaan Sewa Printer Kantor Wilayah VIII Jakarta 1"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#00753A] focus:ring-1 focus:ring-[#00753A]/40 transition-all"
                  />
                </div>
              </div>
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
                {editingItem ? "Simpan Perubahan SPK" : "Simpan Dokumen SPK & PKS"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
