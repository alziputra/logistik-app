import React, { useState, useEffect, useRef } from "react";
import { FileText, ArrowRight, Plus, Trash2, AlertCircle, PackageCheck, PackageMinus, Hash, MapPin, Calendar, ClipboardList, Building2, ChevronDown, Check, Package } from "lucide-react";

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
    const q = query.toLowerCase();
    const nama = (inv.nama || inv.namaBarang || inv.name || "").toLowerCase();
    const merk = (inv.merk || inv.brand || "").toLowerCase();
    const sn = (inv.sn || inv.serialNumber || "").toLowerCase();
    const jenis = (inv.jenis || inv.kategori || "").toLowerCase();
    return nama.includes(q) || merk.includes(q) || sn.includes(q) || jenis.includes(q);
  });

  const handleSelect = (inv) => {
    const name = inv.nama || inv.namaBarang || inv.name;
    setQuery(name);
    onChange(name);
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
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[9999] min-w-[220px] max-h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-150">
          {filteredItems.length === 0 ? (
            <div className="px-3.5 py-2.5 text-xs text-slate-400 italic text-center">Tidak ada barang di master. Anda dapat mengetikkan nama barang manual.</div>
          ) : (
            filteredItems.map((inv, idx) => {
              const name = inv.nama || inv.namaBarang || inv.name;
              const isSelected = query === name;
              const metaText = [inv.jenis || inv.kategori, inv.merk || inv.brand, inv.sn ? `S/N: ${inv.sn}` : null].filter(Boolean).join(" • ");

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
                      {metaText && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{metaText}</p>}
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

      // Surat Masuk: inputan pihak harus kosong
      handleInputChange({ target: { name: "pihak1Nama", value: "" } });
      handleInputChange({ target: { name: "pihak1Jabatan", value: "" } });
      handleInputChange({ target: { name: "pihakMengetahuiNama", value: "" } });
      handleInputChange({ target: { name: "pihakMengetahuiJabatan", value: "" } });
      handleInputChange({ target: { name: "pihak2Nama", value: "" } });
      handleInputChange({ target: { name: "pihak2Jabatan", value: "" } });

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
      handleInputChange({ target: { name: "pihak1Nama", value: "Ahmad Dendy Syaputra" } });
      handleInputChange({ target: { name: "pihak1Jabatan", value: "Staff Pengadaan dan Logistik" } });
      handleInputChange({ target: { name: "pihakMengetahuiNama", value: "Zoni Rahmawan Putra" } });
      handleInputChange({ target: { name: "pihakMengetahuiJabatan", value: "Kabag Pengadaan dan Logistik" } });

      const newNomor = buildNomorSurat(nomorUrut, "", false);
      handleInputChange({ target: { name: "nomorSurat", value: newNomor } });
    }
  };

  const nomorIs000 = ["0", "00", "000"].includes(nomorUrut);
  const nomorIsEmpty = !nomorUrut || nomorUrut === "";
  const nomorIsValid = isNomorValid(formData.nomorSurat, jenisTransaksi);

  return (
    <div className="w-full pt-5 sm:pt-2 pb-6 print:hidden">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4 sm:space-y-6">
        {/* Header Card Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 dark:bg-emerald-950/50 p-2.5 rounded-2xl border border-emerald-500/20">
                <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{formData.id ? "Edit Surat Serah Terima" : "Buat Surat Serah Terima"}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formData.id ? "Perbarui data surat transaksi yang dipilih" : "Isi data surat di bawah untuk memperbarui pratinjau secara live"}</p>
              </div>
            </div>

            {/* Tombol Lanjut ke Preview (Tampil Khusus di Mobile < lg) */}
            <button
              type="button"
              onClick={() => setView("preview")}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <span>Lihat Preview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SECTION 1: INFORMASI DOKUMEN */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Jenis Transaksi Toggle */}
            <div className="md:col-span-12 xl:col-span-4">
              <Field label="Jenis Transaksi" icon={FileText}>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleJenisChange("Barang Keluar")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      jenisTransaksi === "Barang Keluar" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    <PackageMinus className="w-3.5 h-3.5" />
                    <span>Keluar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleJenisChange("Barang Masuk")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      jenisTransaksi === "Barang Masuk"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Masuk</span>
                  </button>
                </div>
              </Field>
            </div>

            {/* Nomor Surat */}
            <div className="md:col-span-12 xl:col-span-5">
              <Field label="Nomor Surat" icon={Hash}>
                <div
                  className={`flex items-center rounded-xl border overflow-hidden transition-all ${
                    nomorIsValid
                      ? "border-emerald-500 bg-white dark:bg-slate-800 shadow-sm"
                      : nomorIs000
                        ? "border-rose-500 bg-white dark:bg-slate-800 shadow-sm"
                        : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
                  }`}
                >
                  <input
                    type="text"
                    placeholder="001"
                    value={nomorUrut}
                    onChange={handleNomorChange}
                    className="w-20 sm:w-24 py-2 px-2.5 text-center font-mono font-bold text-sm outline-none bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 shrink-0"
                  />
                  <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px] px-2 border-l border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-2 select-none truncate flex-1 min-w-0" title={suffix}>
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
              </Field>
            </div>

            {/* Tanggal */}
            <div className="md:col-span-12 xl:col-span-3">
              <Field label="Tanggal" icon={Calendar}>
                <input type="date" name="tanggal" value={formData.tanggal || ""} onChange={handleInputChange} className={inputCls} />
              </Field>
            </div>

            {/* Lokasi */}
            <div className="md:col-span-4">
              <Field label="Lokasi" icon={MapPin}>
                <input type="text" name="lokasi" value={formData.lokasi || ""} onChange={handleInputChange} placeholder="Contoh: Jakarta" className={inputCls} />
              </Field>
            </div>

            {/* Kolom Khusus: Jika Barang Masuk -> Input Nama Outlet Asal Pembentuk Nomor Surat; Jika Keluar -> Tujuan (Instansi / Outlet) */}
            {isMasuk ? (
              <div className="md:col-span-8">
                <Field label="Nama Outlet (Asal Barang)" icon={Building2}>
                  <OutletCombobox outlets={outlets} value={selectedOutletName || formData.asalOutlet || ""} onChange={handleOutletAsalChange} name="asalOutlet" placeholder="Pilih nama outlet (kode otomatis masuk ke nomor surat)..." />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 px-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Penerima:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Logistik Kanwil VIII</span>
                    </span>
                    {kodeOutlet && kodeOutlet !== "....." && (
                      <span className="font-mono text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">Kode: {kodeOutlet}</span>
                    )}
                  </div>
                </Field>
              </div>
            ) : (
              <div className="md:col-span-8">
                <Field label="Tujuan (Instansi / Outlet)" icon={Building2}>
                  <OutletCombobox
                    outlets={outlets}
                    value={formData.tujuan || formData.outletTujuan || formData.pihak2Instansi || ""}
                    onChange={handleInputChange}
                    name="tujuan"
                    placeholder="Pilih dari daftar master instansi / outlet atau ketik manual..."
                  />
                </Field>
              </div>
            )}
          </div>
        </div>

        {/* PIHAK YANG TERLIBAT */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Pihak Yang Terlibat</h3>
          {isMasuk ? (
            /* Mode Barang Masuk: Cukup 2 Pihak (Yang Menyerahkan & Yang Menerima) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Yang Menyerahkan */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">1</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Yang Menyerahkan</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Nama</label>
                  <input type="text" name="pihak1Nama" value={formData.pihak1Nama || formData.pengirimNama || ""} onChange={handleInputChange} placeholder="Masukkan nama yang menyerahkan..." className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Jabatan</label>
                  <input type="text" name="pihak1Jabatan" value={formData.pihak1Jabatan || formData.pengirimJabatan || ""} onChange={handleInputChange} placeholder="Masukkan jabatan..." className={inputCls} />
                </div>
              </div>

              {/* Card 2: Yang Menerima */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">2</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Yang Menerima</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Nama</label>
                  <input type="text" name="pihak2Nama" value={formData.pihak2Nama || formData.penerimaNama || ""} onChange={handleInputChange} placeholder="Masukkan nama yang menerima..." className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Jabatan</label>
                  <input type="text" name="pihak2Jabatan" value={formData.pihak2Jabatan || formData.penerimaJabatan || ""} onChange={handleInputChange} placeholder="Masukkan jabatan..." className={inputCls} />
                </div>
              </div>
            </div>
          ) : (
            /* Mode Barang Keluar: 3 Pihak (Yang Menyerahkan, Mengetahui, Yang Menerima) */
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
              {/* Card 1: Yang Menyerahkan */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">1</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Yang Menyerahkan</span>
                </div>
                <input type="text" name="pihak1Nama" value={formData.pihak1Nama || formData.pengirimNama || ""} onChange={handleInputChange} placeholder="Nama pengirim..." className={inputCls} />
                <input type="text" name="pihak1Jabatan" value={formData.pihak1Jabatan || formData.pengirimJabatan || ""} onChange={handleInputChange} placeholder="Jabatan..." className={inputCls} />
              </div>

              {/* Card 2: Mengetahui */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">2</span>
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase">Mengetahui</span>
                </div>
                <input type="text" name="pihakMengetahuiNama" value={formData.pihakMengetahuiNama || formData.mengetahuiNama || ""} onChange={handleInputChange} placeholder="Nama pejabat mengetahui..." className={inputCls} />
                <input type="text" name="pihakMengetahuiJabatan" value={formData.pihakMengetahuiJabatan || formData.mengetahuiJabatan || ""} onChange={handleInputChange} placeholder="Jabatan..." className={inputCls} />
              </div>

              {/* Card 3: Yang Menerima */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">3</span>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">Yang Menerima</span>
                </div>
                <input type="text" name="pihak2Nama" value={formData.pihak2Nama || formData.penerimaNama || ""} onChange={handleInputChange} placeholder="Nama penerima..." className={inputCls} />
                <input type="text" name="pihak2Jabatan" value={formData.pihak2Jabatan || formData.penerimaJabatan || ""} onChange={handleInputChange} placeholder="Jabatan..." className={inputCls} />
              </div>
            </div>
          )}
        </div>

        {/* DAFTAR BARANG TABLE CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors overflow-visible pb-24">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Daftar Barang</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700">{items.length} baris</span>
            </div>

            <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95">
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baris</span>
            </button>
          </div>

          <div className="overflow-x-auto overflow-y-visible min-h-[260px]">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-2 text-center w-10">No</th>
                  <th className="py-2.5 px-2 w-52">Nama Barang</th>
                  <th className="py-2.5 px-2 w-28">S/N</th>
                  <th className="py-2.5 px-2 w-16 text-center">Qty</th>
                  <th className="py-2.5 px-2 w-20 text-center">Satuan</th>
                  <th className="py-2.5 px-2 w-48">{isMasuk ? "Outlet / Asal" : "Outlet Tujuan"}</th>
                  <th className="py-2.5 px-2">Keterangan</th>
                  <th className="py-2.5 px-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors relative">
                    <td className="py-2 px-2 text-center font-bold text-slate-400 text-[11px]">{idx + 1}</td>

                    {/* Nama Barang via ItemCombobox Kustom */}
                    <td className="py-2 px-2">
                      <ItemCombobox inventory={inventory} value={item.namaBarang || item.nama || ""} onChange={(val) => handleItemChange(item.id || idx, "namaBarang", val)} />
                    </td>

                    {/* S/N */}
                    <td className="py-2 px-2">
                      <input type="text" value={item.sn || ""} onChange={(e) => handleItemChange(item.id || idx, "sn", e.target.value)} placeholder="S/N..." className={`${inputCls} font-mono text-[11px]`} />
                    </td>

                    {/* Qty */}
                    <td className="py-2 px-2 text-center">
                      <input type="number" min="1" value={item.jumlah || item.kuantitas || 1} onChange={(e) => handleItemChange(item.id || idx, "jumlah", e.target.value)} className={`${inputCls} text-center font-bold`} />
                    </td>

                    {/* Satuan */}
                    <td className="py-2 px-2 text-center">
                      <input type="text" value={item.satuan || "Unit"} onChange={(e) => handleItemChange(item.id || idx, "satuan", e.target.value)} placeholder="Satuan..." className={`${inputCls} text-center`} />
                    </td>

                    {/* Outlet Tujuan / Asal via OutletCombobox Kustom */}
                    <td className="py-2 px-2">
                      <OutletCombobox
                        outlets={outlets}
                        value={item.outlet || ""}
                        placeholder={isMasuk ? (selectedOutletName ? `Asal: ${selectedOutletName}` : "Sesuai asal...") : "Sesuai tujuan..."}
                        onChange={(e) => handleItemChange(item.id || idx, "outlet", e.target.value)}
                      />
                    </td>

                    {/* Keterangan */}
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
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormView;
