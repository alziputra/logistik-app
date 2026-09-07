import React, { useState, useEffect, useRef } from "react";
import { FileText, ArrowRight, ArrowLeft, Plus, Trash2, AlertCircle, PackageCheck, PackageMinus, Hash, MapPin, Calendar, ClipboardList, Building2, ChevronDown, Check, Package, FileCheck, Users, LayoutList, Layers } from "lucide-react";
import { normalizeItemName } from "../../utils/inventoryMatcher";

const isNomorValid = (nomor, jenis = "Barang Keluar") => {
  if (!nomor || typeof nomor !== "string") return false;
  const trimmed = nomor.trim();
  const parts = trimmed.split("/");
  if (jenis === "Barang Masuk") {
    if (parts.length !== 3) return false;
    const [num, kode, year] = parts;
    if (!num || ["0", "00", "000"].includes(num) || num.trim() === "") return false;
    if (!kode || kode === "....." || kode.trim() === "") return false;
    if (!year || !/^\d{4}$/.test(year)) return false;
    return true;
  }
  if (parts.length < 4) return false;
  const num = parts[0];
  if (!num || ["0", "00", "000"].includes(num) || num.trim() === "") return false;
  const lastPart = parts[parts.length - 1];
  if (!lastPart || !/^\d{4}$/.test(lastPart)) return false;
  return true;
};

const Field = ({ label, icon: Icon, children, className = "" }) => (
  <div className={className}>
    {label && (
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />}
        {label}
      </label>
    )}
    {children}
  </div>
);

const inputCls =
  "w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium shadow-sm";

/* Custom Searchable Combobox Component untuk Tujuan / Asal Instansi / Outlet */
const OutletCombobox = ({ outlets = [], value = "", onChange = () => {}, name = "tujuan", placeholder = "Pilih dari daftar master instansi / outlet atau ketik manual..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOutlets = outlets.filter((o) => {
    const q = query.toLowerCase();
    const nama = (o.nama || o.instansi || o.name || "").toLowerCase();
    const kode = (o.kode || o.code || "").toLowerCase();
    const status = (o.status || "").toLowerCase();
    const cabang = (o.cabangInduk || o.kodeCabang || "").toLowerCase();
    return nama.includes(q) || kode.includes(q) || status.includes(q) || cabang.includes(q);
  });

  const handleSelect = (outlet) => {
    const val = outlet.nama || outlet.instansi || outlet.name || outlet.kode;
    setQuery(val);
    onChange({ target: { name, value: val, outlet } });
    setIsOpen(false);
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange({ target: { name, value: val } });
    setIsOpen(true);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center">
        <input type="text" value={query} onFocus={() => setIsOpen(true)} onChange={handleTextChange} placeholder={placeholder} className={`${inputCls} pr-8`} />
        <div onClick={() => setIsOpen((prev) => !prev)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1">
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-500" : ""}`} />
        </div>
      </div>

      {/* Custom Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[9999] min-w-[220px] max-h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-150">
          {filteredOutlets.length === 0 ? (
            <div className="px-3.5 py-2.5 text-xs text-slate-400 italic text-center">Tidak ada instansi/outlet yang cocok. Anda dapat mengetikkan nama instansi manual.</div>
          ) : (
            filteredOutlets.map((o, idx) => {
              const name = o.nama || o.instansi || o.name;
              const isSelected = query === name;
              return (
                <div
                  key={o.id || idx}
                  onClick={() => handleSelect(o)}
                  className={`px-3.5 py-2.5 hover:bg-emerald-500/10 dark:hover:bg-emerald-950/40 cursor-pointer flex items-center justify-between transition-colors border-b border-slate-100 dark:border-slate-800/60 last:border-0 ${
                    isSelected ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Building2 className={`w-4 h-4 shrink-0 ${isSelected ? "text-emerald-500" : "text-slate-400"}`} />
                    <div className="truncate">
                      <p className="text-xs font-bold truncate">{name}</p>
                      {(o.cabangInduk || o.kode || o.status) && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {o.status && <span className="font-semibold text-slate-400">{o.status} • </span>}
                          {o.kode && <span>Kode: {o.kode} </span>}
                          {o.cabangInduk && <span>| Induk: {o.cabangInduk}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

/* Custom Searchable Combobox Component untuk Nama Barang */
const ItemCombobox = ({ inventory = [], value = "", onChange = () => {}, placeholder = "Nama barang..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = inventory.filter((inv) => {
    const qNorm = normalizeItemName(query);
    const namaNorm = normalizeItemName(inv.nama || inv.namaBarang || inv.name || "");
    const merkNorm = normalizeItemName(inv.merk || inv.brand || "");
    const sn = (inv.sn || inv.serialNumber || "").toLowerCase();
    const jenis = (inv.jenis || inv.kategori || "").toLowerCase();
    const spk = (inv.no_spk || inv.no_pks || "").toLowerCase();
    const vendor = (inv.vendor_nama || inv.vendor?.nama || (typeof inv.vendor === "string" ? inv.vendor : "")).toLowerCase();
    return namaNorm.includes(qNorm) || qNorm.includes(namaNorm) || merkNorm.includes(qNorm) || sn.includes(qNorm) || jenis.includes(qNorm) || spk.includes(qNorm) || vendor.includes(qNorm);
  });

  const handleSelect = (inv) => {
    const name = inv.nama || inv.namaBarang || inv.name;
    setQuery(name);
    onChange(name, inv);
    setIsOpen(false);
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setIsOpen(true);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center">
        <input type="text" value={query} onFocus={() => setIsOpen(true)} onChange={handleTextChange} placeholder={placeholder} className={`${inputCls} pr-8`} />
        <div onClick={() => setIsOpen((prev) => !prev)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1">
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-500" : ""}`} />
        </div>
      </div>

      {/* Custom Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[9999] min-w-[280px] max-h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-150">
          {filteredItems.length === 0 ? (
            <div className="px-3.5 py-2.5 text-xs text-slate-400 italic text-center">Tidak ada barang di master. Anda dapat mengetikkan nama barang manual.</div>
          ) : (
            filteredItems.map((inv, idx) => {
              const name = inv.nama || inv.namaBarang || inv.name;
              const isSelected = query === name;
              const spkNo = inv.no_spk || inv.no_pks || "";
              const vendorName = inv.vendor_nama || inv.vendor?.nama || (typeof inv.vendor === "string" ? inv.vendor : "");
              const stok = inv.kuantitas !== undefined ? inv.kuantitas : inv.stok || 0;

              return (
                <div
                  key={inv.id || idx}
                  onClick={() => handleSelect(inv)}
                  className={`px-3.5 py-2.5 hover:bg-emerald-500/10 dark:hover:bg-emerald-950/40 cursor-pointer flex items-center justify-between transition-colors border-b border-slate-100 dark:border-slate-800/60 last:border-0 ${
                    isSelected ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Package className={`w-4 h-4 shrink-0 ${isSelected ? "text-emerald-500" : "text-slate-400"}`} />
                    <div className="truncate">
                      <p className="text-xs font-bold truncate">{name}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {spkNo && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">SPK: {spkNo}</span>}
                        {vendorName && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">{vendorName}</span>}
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                          Stok: {stok} {inv.satuan || "Pcs"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const FormView = ({ formData = {}, handleInputChange = () => {}, items = [], handleItemChange = () => {}, addItem = () => {}, removeItem = () => {}, setView = () => {}, inventory = [], outlets = [] }) => {
  const [nomorUrut, setNomorUrut] = useState("");
  const [kodeOutlet, setKodeOutlet] = useState(formData.kodeOutlet || "");
  const [selectedOutletName, setSelectedOutletName] = useState(formData.asalOutlet || "");
  const [jenisTransaksi, setJenisTransaksi] = useState(formData.jenisTransaksi || "Barang Keluar");
  const [activeFormTab, setActiveFormTab] = useState("kop");
  const [itemViewMode, setItemViewMode] = useState(() => {
    try {
      return localStorage.getItem("bast_item_view_mode") || "table";
    } catch {
      return "table";
    }
  });

  const handleViewModeChange = (mode) => {
    setItemViewMode(mode);
    try {
      localStorage.setItem("bast_item_view_mode", mode);
    } catch {
      // ignore
    }
  };

  const tahun = new Date().getFullYear();
  const isMasuk = jenisTransaksi === "Barang Masuk";

  useEffect(() => {
    if (formData.nomorSurat) {
      const parts = formData.nomorSurat.split("/");
      if (parts.length >= 3) {
        const num = parts[0];
        setNomorUrut((prev) => (prev === num ? prev : num));
        if (formData.jenisTransaksi === "Barang Masuk") {
          const kode = parts[1];
          if (kode && kode !== ".....") {
            setKodeOutlet(kode);
            const found = outlets.find((o) => (o.kode || o.code || "").toString().toLowerCase() === kode.toLowerCase());
            if (found) {
              setSelectedOutletName(found.nama || found.name || kode);
            } else if (formData.asalOutlet) {
              setSelectedOutletName(formData.asalOutlet);
            } else {
              setSelectedOutletName(kode);
            }
          }
        }
      }
    } else if (formData.nomorSurat === "") {
      setNomorUrut((prev) => (prev === "" ? prev : ""));
      if (formData.jenisTransaksi === "Barang Masuk") {
        setKodeOutlet("");
        setSelectedOutletName("");
      }
    }
  }, [formData.nomorSurat, formData.jenisTransaksi, outlets]);

  useEffect(() => {
    if (formData.jenisTransaksi) {
      setJenisTransaksi(formData.jenisTransaksi);
    } else {
      setJenisTransaksi("Barang Keluar");
    }
  }, [formData.jenisTransaksi]);

  const suffix = isMasuk ? `/${kodeOutlet || "....."}/${tahun}` : `/00108.00/04/${tahun}`;

  const buildNomorSurat = (num, currentKode, currentIsMasuk) => {
    if (!num || ["0", "00", "000"].includes(num.trim())) return "";
    const cleanNum = num.trim();
    if (currentIsMasuk) {
      const kd = currentKode && currentKode !== "....." ? currentKode : ".....";
      return `${cleanNum}/${kd}/${tahun}`;
    }
    return `${cleanNum}/00108.00/04/${tahun}`;
  };

  const handleNomorChange = (e) => {
    const raw = e.target.value.replace(/[^a-zA-Z0-9-]/g, "");
    setNomorUrut(raw);
    const newNomor = buildNomorSurat(raw, kodeOutlet, isMasuk);
    handleInputChange({ target: { name: "nomorSurat", value: newNomor } });
  };

  const handleOutletAsalChange = (e) => {
    const val = e.target.value;
    const outletObj = e.target.outlet;

    let name = val;
    let code = "";

    if (outletObj) {
      name = outletObj.nama || outletObj.name || outletObj.instansi || val;
      code = outletObj.kode || outletObj.code || outletObj.kodeCabang || "";
    } else {
      const found = outlets.find((o) => (o.nama || "").toLowerCase() === (val || "").toLowerCase() || (o.kode || o.code || "").toString().toLowerCase() === (val || "").toLowerCase());
      if (found) {
        name = found.nama || found.name || val;
        code = found.kode || found.code || found.kodeCabang || "";
      } else {
        code = val ? val.trim() : "";
      }
    }

    setSelectedOutletName(name);
    setKodeOutlet(code);

    handleInputChange({ target: { name: "asalOutlet", value: name } });
    handleInputChange({ target: { name: "kodeOutlet", value: code } });

    if (nomorUrut) {
      const newNomor = buildNomorSurat(nomorUrut, code, true);
      handleInputChange({ target: { name: "nomorSurat", value: newNomor } });
    }
  };

  const handleJenisChange = (jenis) => {
    const nextIsMasuk = jenis === "Barang Masuk";
    setJenisTransaksi(jenis);

    if (nextIsMasuk) {
      handleInputChange({ target: { name: "jenisTransaksi", value: "Barang Masuk" } });
      handleInputChange({ target: { name: "tujuan", value: "Logistik Kanwil VIII" } });
      handleInputChange({ target: { name: "outletTujuan", value: "Logistik Kanwil VIII" } });
      handleInputChange({ target: { name: "penerimaInstansi", value: "Logistik Kanwil VIII" } });
      handleInputChange({ target: { name: "pihak2Instansi", value: "Logistik Kanwil VIII" } });

      // Surat Masuk: 3 Pihak (Yang Menyerahkan: Outlet, Mengetahui: Kabag, Yang Menerima: Logistik)
      handleInputChange({ target: { name: "pihak1Nama", value: "" } });
      handleInputChange({ target: { name: "pihak1Jabatan", value: "" } });
      handleInputChange({ target: { name: "pihakMengetahuiNama", value: "Zoni Rahmawan Putra" } });
      handleInputChange({ target: { name: "pihakMengetahuiJabatan", value: "Kabag Pengadaan dan Logistik" } });
      handleInputChange({ target: { name: "pihak2Nama", value: "Evi Noviawati" } });
      handleInputChange({ target: { name: "pihak2Jabatan", value: "Officer" } });

      const newNomor = buildNomorSurat(nomorUrut, kodeOutlet, true);
      handleInputChange({ target: { name: "nomorSurat", value: newNomor } });
    } else {
      handleInputChange({ target: { name: "jenisTransaksi", value: "Barang Keluar" } });
      if (formData.tujuan === "Logistik Kanwil VIII") {
        handleInputChange({ target: { name: "tujuan", value: "" } });
        handleInputChange({ target: { name: "outletTujuan", value: "" } });
        handleInputChange({ target: { name: "penerimaInstansi", value: "" } });
        handleInputChange({ target: { name: "pihak2Instansi", value: "" } });
      }

      // Surat Keluar: default 3 pihak Pegadaian
      handleInputChange({ target: { name: "pihak1Nama", value: "Evi Noviawati" } });
      handleInputChange({ target: { name: "pihak1Jabatan", value: "Officer" } });
      handleInputChange({ target: { name: "pihakMengetahuiNama", value: "Zoni Rahmawan Putra" } });
      handleInputChange({ target: { name: "pihakMengetahuiJabatan", value: "Kabag Pengadaan dan Logistik" } });
      handleInputChange({ target: { name: "pihak2Nama", value: "" } });
      handleInputChange({ target: { name: "pihak2Jabatan", value: "" } });

      const newNomor = buildNomorSurat(nomorUrut, "", false);
      handleInputChange({ target: { name: "nomorSurat", value: newNomor } });
    }
  };

  const nomorIs000 = ["0", "00", "000"].includes(nomorUrut);
  const nomorIsEmpty = !nomorUrut || nomorUrut === "";
  const nomorIsValid = isNomorValid(formData.nomorSurat, jenisTransaksi);

  return (
    <div className="w-full pt-4 sm:pt-2 pb-6 print:hidden">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {/* Editor Card Container */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex flex-col">
          {/* Header Editor (SPK Reference Style) */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#00753A] p-2.5 rounded-xl text-white">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">{formData.id ? "Edit Berita Acara (BAST)" : "Buat Berita Acara (BAST)"}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Editor Berita Acara Serah Terima Barang</p>
              </div>
            </div>

            {/* Tombol Lanjut ke Preview (Tampil Khusus di Mobile < lg) */}
            <button
              type="button"
              onClick={() => setView("preview")}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-[#00753A] hover:bg-[#005c2e] text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <span>Preview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form Section Tabs (Pill Container Sesuai Gambar) */}
          <div className="grid grid-cols-3 bg-[#00753A] text-white rounded-xl p-1 mb-5 text-center text-xs font-bold shadow-xs">
            <button
              type="button"
              onClick={() => setActiveFormTab("kop")}
              className={`py-2 rounded-lg transition-colors cursor-pointer ${activeFormTab === "kop" ? "bg-white text-[#00753A] shadow-sm font-bold" : "hover:bg-[#005c2e] text-emerald-100 font-semibold"}`}
            >
              Kop & Pihak
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab("pihak")}
              className={`py-2 rounded-lg transition-colors cursor-pointer ${activeFormTab === "pihak" ? "bg-white text-[#00753A] shadow-sm font-bold" : "hover:bg-[#005c2e] text-emerald-100 font-semibold"}`}
            >
              Pihak Terlibat
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab("barang")}
              className={`py-2 rounded-lg transition-colors cursor-pointer ${activeFormTab === "barang" ? "bg-white text-[#00753A] shadow-sm font-bold" : "hover:bg-[#005c2e] text-emerald-100 font-semibold"}`}
            >
              Daftar Barang ({items.length})
            </button>
          </div>

          {/* Tab 1: KOP & TANGGAL SURAT */}
          {activeFormTab === "kop" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-[#00753A] dark:text-emerald-400 uppercase tracking-wider">KOP & TANGGAL SURAT</h3>

                {/* Jenis Transaksi Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Jenis Transaksi Serah Terima <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => handleJenisChange("Barang Keluar")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        jenisTransaksi === "Barang Keluar" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      <PackageMinus className="w-3.5 h-3.5" />
                      <span>Barang Keluar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJenisChange("Barang Masuk")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        jenisTransaksi === "Barang Masuk"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Barang Masuk</span>
                    </button>
                  </div>
                </div>

                {/* Nomor Urut BAST (Running Number) Sesuai Referensi Gambar */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nomor Urut BAST (Running Number) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Contoh: 1506"
                      value={nomorUrut}
                      onChange={handleNomorChange}
                      className="w-28 sm:w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00753A]"
                    />
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 shrink-0 font-mono" title={suffix}>
                      {suffix}
                    </span>
                  </div>
                  {nomorIs000 && (
                    <p className="flex items-center gap-1 text-[11px] text-rose-500 dark:text-rose-400 mt-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> Nomor tidak boleh 000
                    </p>
                  )}
                  {isMasuk && !nomorIsEmpty && (!kodeOutlet || kodeOutlet === ".....") && (
                    <p className="flex items-center gap-1 text-[11px] text-amber-500 dark:text-amber-400 mt-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> Pilih nama outlet di bawah untuk melengkapi kode outlet
                    </p>
                  )}
                  {!nomorIsEmpty && nomorIsValid && <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono font-semibold truncate">✓ {formData.nomorSurat}</p>}
                </div>

                {/* Grid 2 Cols: Tempat Surat & Tanggal Surat */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tempat Surat <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lokasi"
                      placeholder="Contoh: Jakarta"
                      value={formData.lokasi || ""}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00753A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tanggal Surat <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="tanggal"
                      value={formData.tanggal || ""}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#00753A]"
                    />
                  </div>
                </div>

                {/* Outlet Asal (Masuk) / Tujuan (Keluar) */}
                {isMasuk ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nama Outlet Asal Barang <span className="text-rose-500">*</span>
                    </label>
                    <OutletCombobox
                      outlets={outlets}
                      value={selectedOutletName || formData.asalOutlet || ""}
                      onChange={handleOutletAsalChange}
                      name="asalOutlet"
                      placeholder="Pilih nama outlet asal (kode otomatis masuk ke nomor surat)..."
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 px-0.5">
                      <span className="flex items-center gap-1.5">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Penerima Barang:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">Logistik Kanwil VIII</span>
                      </span>
                      {kodeOutlet && kodeOutlet !== "....." && (
                        <span className="font-mono text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                          Kode Outlet: {kodeOutlet}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tujuan (Instansi / Outlet Penerima) <span className="text-rose-500">*</span>
                    </label>
                    <OutletCombobox
                      outlets={outlets}
                      value={formData.tujuan || formData.outletTujuan || formData.pihak2Instansi || ""}
                      onChange={handleInputChange}
                      name="tujuan"
                      placeholder="Pilih dari daftar master instansi / outlet atau ketik manual..."
                    />
                  </div>
                )}
              </div>

              {/* Next Navigation Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setActiveFormTab("pihak")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#00753A] hover:bg-[#005c2e] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span>Lanjut: Pihak Terlibat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: PIHAK YANG TERLIBAT */}
          {activeFormTab === "pihak" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-[#00753A] dark:text-emerald-400 uppercase tracking-wider">PIHAK YANG TERLIBAT</h3>

                <div className="space-y-3">
                  {/* Card 1: Yang Menyerahkan */}
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#00753A] text-white font-bold text-[10px] flex items-center justify-center shadow-xs">1</span>
                      <span className="text-[11px] font-bold text-[#00753A] dark:text-emerald-400 uppercase">Yang Menyerahkan (Pihak Pertama)</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        name="pihak1Nama"
                        value={formData.pihak1Nama || formData.pengirimNama || ""}
                        onChange={handleInputChange}
                        placeholder={isMasuk ? "Nama yang menyerahkan (Outlet)..." : "Nama pengirim (Logistik)..."}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Jabatan</label>
                      <input type="text" name="pihak1Jabatan" value={formData.pihak1Jabatan || formData.pengirimJabatan || ""} onChange={handleInputChange} placeholder="Jabatan pihak yang menyerahkan..." className={inputCls} />
                    </div>
                  </div>

                  {/* Card 2: Mengetahui */}
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">2</span>
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase">Pejabat Mengetahui</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Lengkap</label>
                      <input type="text" name="pihakMengetahuiNama" value={formData.pihakMengetahuiNama || formData.mengetahuiNama || ""} onChange={handleInputChange} placeholder="Nama pejabat mengetahui..." className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Jabatan</label>
                      <input
                        type="text"
                        name="pihakMengetahuiJabatan"
                        value={formData.pihakMengetahuiJabatan || formData.mengetahuiJabatan || ""}
                        onChange={handleInputChange}
                        placeholder="Jabatan pejabat mengetahui..."
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Card 3: Yang Menerima */}
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">3</span>
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">Yang Menerima (Pihak Kedua)</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        name="pihak2Nama"
                        value={formData.pihak2Nama || formData.penerimaNama || ""}
                        onChange={handleInputChange}
                        placeholder={isMasuk ? "Nama penerima (Logistik)..." : "Nama penerima..."}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Jabatan</label>
                      <input type="text" name="pihak2Jabatan" value={formData.pihak2Jabatan || formData.penerimaJabatan || ""} onChange={handleInputChange} placeholder="Jabatan penerima..." className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Prev & Next Navigation Buttons */}
              <div className="flex justify-between items-center pt-1">
                <button
                  type="button"
                  onClick={() => setActiveFormTab("kop")}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Kop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormTab("barang")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#00753A] hover:bg-[#005c2e] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span>Lanjut: Daftar Barang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: DAFTAR BARANG */}
          {activeFormTab === "barang" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex flex-wrap gap-2.5 justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold text-[#00753A] dark:text-emerald-400 uppercase tracking-wider">DAFTAR BARANG YANG DISERAHTERIMAKAN</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Total {items.length} rincian barang</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Mode Toggle: Tabel Lebar vs Form Kartu */}
                    <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => handleViewModeChange("table")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          itemViewMode === "table" ? "bg-white dark:bg-slate-700 text-[#00753A] dark:text-emerald-400 font-bold shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                        title="Tampilan Tabel Melebar (Panjang Baris Luas)"
                      >
                        <LayoutList className="w-3.5 h-3.5" />
                        <span>Tabel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleViewModeChange("card")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          itemViewMode === "card" ? "bg-white dark:bg-slate-700 text-[#00753A] dark:text-emerald-400 font-bold shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                        title="Tampilan Form Kartu (Lega & Nyaman Tanpa Scroll Horizontal)"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Form Kartu</span>
                      </button>
                    </div>

                    <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00753A] hover:bg-[#005c2e] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Baris</span>
                    </button>
                  </div>
                </div>

                {/* MODE 1: TABEL DENGAN PANJANG BARIS DIPERLEBAR */}
                {itemViewMode === "table" ? (
                  <div className="space-y-2">
                    <div className="overflow-x-auto overflow-y-visible min-h-[260px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 shadow-xs">
                      <table className="w-full text-left border-collapse min-w-[1220px]">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="py-2.5 px-2 text-center w-12">No</th>
                            <th className="py-2.5 px-2 min-w-[340px] w-[340px]">
                              Nama Barang <span className="text-rose-500">*</span>
                            </th>
                            <th className="py-2.5 px-2 min-w-[200px] w-[200px]">Nomor Seri (S/N)</th>
                            <th className="py-2.5 px-2 min-w-[85px] w-[85px] text-center">
                              Qty <span className="text-rose-500">*</span>
                            </th>
                            <th className="py-2.5 px-2 min-w-[110px] w-[110px] text-center">Satuan</th>
                            <th className="py-2.5 px-2 min-w-[260px] w-[260px]">{isMasuk ? "Outlet / Asal" : "Outlet Tujuan"}</th>
                            <th className="py-2.5 px-2 min-w-[220px]">Keterangan</th>
                            <th className="py-2.5 px-2 text-center w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                          {items.map((item, idx) => (
                            <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors relative">
                              <td className="py-2 px-2 text-center font-bold text-slate-400 text-[11px]">{idx + 1}</td>

                              {/* Nama Barang via ItemCombobox Kustom (340px) */}
                              <td className="py-2 px-2">
                                <ItemCombobox
                                  inventory={inventory}
                                  value={item.namaBarang || item.nama || ""}
                                  onChange={(val, selectedInv) => {
                                    handleItemChange(item.id || idx, "namaBarang", val);
                                    if (selectedInv) {
                                      if (selectedInv.id) handleItemChange(item.id || idx, "inventoryId", selectedInv.id);
                                      if (selectedInv.satuan) handleItemChange(item.id || idx, "satuan", selectedInv.satuan);
                                    }
                                  }}
                                  placeholder="Cari atau ketik nama barang..."
                                />
                              </td>

                              {/* S/N (200px) */}
                              <td className="py-2 px-2">
                                <input type="text" value={item.sn || ""} onChange={(e) => handleItemChange(item.id || idx, "sn", e.target.value)} placeholder="Nomor Seri / S/N..." className={`${inputCls} font-mono`} />
                              </td>

                              {/* Qty (85px) */}
                              <td className="py-2 px-2 text-center">
                                <input type="number" min="1" value={item.jumlah || item.kuantitas || 1} onChange={(e) => handleItemChange(item.id || idx, "jumlah", e.target.value)} className={`${inputCls} text-center font-bold`} />
                              </td>

                              {/* Satuan (110px) */}
                              <td className="py-2 px-2 text-center">
                                <input type="text" value={item.satuan || "Unit"} onChange={(e) => handleItemChange(item.id || idx, "satuan", e.target.value)} placeholder="Satuan..." className={`${inputCls} text-center`} />
                              </td>

                              {/* Outlet Tujuan / Asal (260px) */}
                              <td className="py-2 px-2">
                                <OutletCombobox
                                  outlets={outlets}
                                  value={item.outlet || ""}
                                  placeholder={isMasuk ? (selectedOutletName ? `Asal: ${selectedOutletName}` : "Sesuai asal...") : "Sesuai tujuan..."}
                                  onChange={(e) => handleItemChange(item.id || idx, "outlet", e.target.value)}
                                />
                              </td>

                              {/* Keterangan (220px) */}
                              <td className="py-2 px-2">
                                <input type="text" value={item.keterangan || ""} onChange={(e) => handleItemChange(item.id || idx, "keterangan", e.target.value)} placeholder="Catatan barang..." className={inputCls} />
                              </td>

                              {/* Hapus Baris */}
                              <td className="py-2 px-2 text-center">
                                {items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeItem(item.id || idx)}
                                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                    title="Hapus baris ini"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-400">
                      <span>
                        💡 <em>Geser ke kanan untuk melihat kolom Outlet & Keterangan</em>
                      </span>
                      <button type="button" onClick={() => handleViewModeChange("card")} className="text-[#00753A] dark:text-emerald-400 hover:underline font-semibold cursor-pointer">
                        Beralih ke Form Kartu agar tidak perlu geser →
                      </button>
                    </div>
                  </div>
                ) : (
                  /* MODE 2: FORM KARTU (PANJANG BARIS PENUH & SANGAT LEGA DIKETIK TANPA SCROLL) */
                  <div className="space-y-3.5">
                    {items.map((item, idx) => (
                      <div key={item.id || idx} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                        {/* Header Kartu Item */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#00753A] text-white font-bold text-[10px] flex items-center justify-center shadow-xs">{idx + 1}</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Barang #{idx + 1}</span>
                          </div>

                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(item.id || idx)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Hapus baris barang ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-semibold">Hapus Baris</span>
                            </button>
                          )}
                        </div>

                        {/* Baris 1: Nama Barang (100% Full-Width) */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                            Nama Barang <span className="text-rose-500">*</span>
                          </label>
                          <ItemCombobox
                            inventory={inventory}
                            value={item.namaBarang || item.nama || ""}
                            onChange={(val, selectedInv) => {
                              handleItemChange(item.id || idx, "namaBarang", val);
                              if (selectedInv) {
                                if (selectedInv.id) handleItemChange(item.id || idx, "inventoryId", selectedInv.id);
                                if (selectedInv.satuan) handleItemChange(item.id || idx, "satuan", selectedInv.satuan);
                              }
                            }}
                            placeholder="Cari di inventaris master atau ketik nama barang lengkap..."
                          />
                        </div>

                        {/* Baris 2: S/N (6 cols), Qty (3 cols), Satuan (3 cols) */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                          <div className="sm:col-span-6">
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Nomor Seri (S/N)</label>
                            <input type="text" value={item.sn || ""} onChange={(e) => handleItemChange(item.id || idx, "sn", e.target.value)} placeholder="Ketik nomor seri / S/N..." className={`${inputCls} font-mono`} />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                              Jumlah (Qty) <span className="text-rose-500">*</span>
                            </label>
                            <input type="number" min="1" value={item.jumlah || item.kuantitas || 1} onChange={(e) => handleItemChange(item.id || idx, "jumlah", e.target.value)} className={`${inputCls} text-center font-bold`} />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Satuan</label>
                            <input type="text" value={item.satuan || "Unit"} onChange={(e) => handleItemChange(item.id || idx, "satuan", e.target.value)} placeholder="Pcs / Unit..." className={`${inputCls} text-center`} />
                          </div>
                        </div>

                        {/* Baris 3: Outlet Tujuan / Asal & Keterangan */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">{isMasuk ? "Asal Barang / Outlet" : "Outlet Tujuan"}</label>
                            <OutletCombobox
                              outlets={outlets}
                              value={item.outlet || ""}
                              placeholder={isMasuk ? (selectedOutletName ? `Asal: ${selectedOutletName}` : "Sesuai asal...") : "Sesuai tujuan..."}
                              onChange={(e) => handleItemChange(item.id || idx, "outlet", e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Keterangan / Catatan</label>
                            <input type="text" value={item.keterangan || ""} onChange={(e) => handleItemChange(item.id || idx, "keterangan", e.target.value)} placeholder="Catatan kelengkapan / kondisi..." className={inputCls} />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Tombol Tambah Baris Bawah */}
                    <button
                      type="button"
                      onClick={addItem}
                      className="w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#00753A] dark:hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#00753A] dark:hover:text-emerald-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white/50 dark:bg-slate-900/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Rincian Barang Baru</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Prev & Next Navigation Buttons */}
              <div className="flex justify-between items-center pt-1">
                <button
                  type="button"
                  onClick={() => setActiveFormTab("pihak")}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali: Pihak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setView("preview")}
                  className="lg:hidden flex items-center gap-1.5 px-4 py-2 bg-[#00753A] hover:bg-[#005c2e] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span>Lihat Preview Dokumen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default FormView;
