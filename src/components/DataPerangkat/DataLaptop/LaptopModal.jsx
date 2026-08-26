import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";

export default function LaptopModal({
  isOpen,
  editingId,
  formData = {},
  setFormData = () => {},
  isSaving = false,
  vendorsList = [],
  onClose = () => {},
  onSave = () => {},
}) {
  const [tglMulai, setTglMulai] = useState(formData.tanggalMulai || formData.tanggal_mulai || "");
  const [tglSelesai, setTglSelesai] = useState(formData.tanggalSelesai || formData.tanggal_selesai || "");

  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);

  const deptRef = useRef(null);
  const vendorRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTglMulai(formData.tanggalMulai || formData.tanggal_mulai || "");
      setTglSelesai(formData.tanggalSelesai || formData.tanggal_selesai || "");
    }
  }, [isOpen, editingId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (deptRef.current && !deptRef.current.contains(e.target)) setShowDeptDropdown(false);
      if (vendorRef.current && !vendorRef.current.contains(e.target)) setShowVendorDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { status, masaSewa } = useMemo(() => {
    if (!tglMulai || !tglSelesai) {
      return { status: "Sewa Berjalan", masaSewa: 24 };
    }
    const d1 = new Date(tglMulai);
    const d2 = new Date(tglSelesai);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      return { status: "Sewa Berjalan", masaSewa: 24 };
    }
    let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    if (months < 0) months = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const st = d2 >= today ? "Sewa Berjalan" : "Sewa Habis";
    return { status: st, masaSewa: months };
  }, [tglMulai, tglSelesai]);

  const defaultDeptList = [
    "Departemen Logistik & Umum",
    "Departemen Manajemen Risiko",
    "Departemen Business Support",
    "Departemen Keuangan",
    "Departemen Sumber Daya Manusia",
    "Departemen TI & Digital",
    "Departemen Operasional",
  ];

  const filteredDepts = useMemo(() => {
    const q = (formData.departemen || "").toLowerCase().trim();
    if (!q) return defaultDeptList;
    return defaultDeptList.filter((d) => d.toLowerCase().includes(q));
  }, [formData.departemen]);

  const filteredVendors = useMemo(() => {
    const masterVendors = vendorsList.length > 0 ? vendorsList : [
      { id: "v1", nama_perusahaan: "PT GLOBAL SOLUSINDO KOMPUDATA", pimpinan: "Global Solusindo", kota: "Bandung" },
      { id: "v2", nama_perusahaan: "PT PESONNA OPTIMA JASA", pimpinan: "Achmad Suadi", kota: "Jakarta Central" },
      { id: "v3", nama_perusahaan: "CV YODERINDO INTI PRIMA", pimpinan: "Yoderindo", kota: "Surabaya" },
      { id: "v4", nama_perusahaan: "PT DANAKAR", pimpinan: "Danakar", kota: "Jakarta" },
      { id: "v5", nama_perusahaan: "PT FRESH UTAMA PERKASA", pimpinan: "Fresh Utama", kota: "Jakarta" },
    ];
    const q = (formData.vendor || formData.penyedia || "").toLowerCase().trim();
    if (!q) return masterVendors;
    return masterVendors.filter(
      (v) => (v.nama_perusahaan || v.nama || "").toLowerCase().includes(q) || (v.pimpinan || "").toLowerCase().includes(q)
    );
  }, [vendorsList, formData.vendor, formData.penyedia]);

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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
          <h3 className="font-bold text-base text-slate-100">
            {editingId ? "Edit Data Laptop" : "Tambah Laptop Baru"}
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
          <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-5">
            
            {/* INFORMASI PENGGUNA */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-emerald-400 border-b border-slate-800 pb-2 uppercase tracking-wider">
                Informasi Pengguna & Jabatan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>NIK Pegawai</label>
                  <input
                    type="text"
                    value={formData.nik || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, nik: e.target.value }))}
                    disabled={isSaving}
                    className={`${inputCls} font-mono`}
                    placeholder="P80524..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Nama Pengguna</label>
                  <input
                    required
                    type="text"
                    value={formData.nama || formData.namaPengguna || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, nama: e.target.value }))}
                    disabled={isSaving}
                    className={inputCls}
                    placeholder="MAMAN SURATMAN..."
                  />
                </div>

                <div>
                  <label className={labelCls}>Nama Jabatan</label>
                  <input
                    type="text"
                    value={formData.jabatan || formData.namaJabatan || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, jabatan: e.target.value }))}
                    disabled={isSaving}
                    className={inputCls}
                    placeholder="Kepala Departemen / Staff..."
                  />
                </div>

                {/* Departemen Combobox */}
                <div className="relative sm:col-span-2" ref={deptRef}>
                  <label className={labelCls}>Departemen</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.departemen || ""}
                      onFocus={() => setShowDeptDropdown(true)}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, departemen: e.target.value }));
                        setShowDeptDropdown(true);
                      }}
                      disabled={isSaving}
                      className={`${inputCls} pr-8`}
                      placeholder="Pilih atau ketik departemen..."
                    />
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {showDeptDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto custom-scrollbar p-1">
                      {filteredDepts.map((dept, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData((p) => ({ ...p, departemen: dept }));
                            setShowDeptDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[#00753A]/30 hover:text-emerald-300 transition-colors cursor-pointer text-slate-200"
                        >
                          {dept}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* INFORMASI HARDWARE LAPTOP */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs text-emerald-400 border-b border-slate-800 pb-2 uppercase tracking-wider">
                Spesifikasi Laptop & Jaringan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Hostname / Device Name</label>
                  <input
                    type="text"
                    value={formData.hostname || formData.deviceName || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, hostname: e.target.value }))}
                    disabled={isSaving}
                    className={`${inputCls} font-mono`}
                    placeholder="NB-00108-P80524..."
                  />
                </div>

                <div>
                  <label className={labelCls}>Serial Number (S/N)</label>
                  <input
                    type="text"
                    value={formData.sn || formData.serialNumber || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, sn: e.target.value }))}
                    disabled={isSaving}
                    className={`${inputCls} font-mono`}
                    placeholder="5CG4222JJW..."
                  />
                </div>

                <div>
                  <label className={labelCls}>Operating System (OS)</label>
                  <select
                    value={formData.os || "Windows"}
                    onChange={(e) => setFormData((p) => ({ ...p, os: e.target.value }))}
                    disabled={isSaving}
                    className={`${inputCls} cursor-pointer`}
                  >
                    <option value="Windows">Windows</option>
                    <option value="Ubuntu / Linux">Ubuntu / Linux</option>
                    <option value="macOS">macOS</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Kondisi Laptop</label>
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
              </div>
            </div>

            {/* VENDOR & KONTRAK SEWA */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs text-emerald-400 border-b border-slate-800 pb-2 uppercase tracking-wider">
                Penyedia Vendor & Masa Kontrak
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Vendor Combobox */}
                <div className="relative sm:col-span-2" ref={vendorRef}>
                  <label className={labelCls}>Penyedia / Vendor</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.vendor || formData.penyedia || ""}
                      onFocus={() => setShowVendorDropdown(true)}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, vendor: e.target.value, penyedia: e.target.value }));
                        setShowVendorDropdown(true);
                      }}
                      disabled={isSaving}
                      className={`${inputCls} pr-8`}
                      placeholder="Pilih atau ketik vendor..."
                    />
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {showVendorDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto custom-scrollbar p-1">
                      {filteredVendors.map((v, idx) => (
                        <button
                          key={v.id || idx}
                          type="button"
                          onClick={() => {
                            setFormData((p) => ({ ...p, vendor: v.nama_perusahaan || v.nama, penyedia: v.nama_perusahaan || v.nama }));
                            setShowVendorDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[#00753A]/30 hover:text-emerald-300 transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <span className="font-bold text-slate-200 group-hover:text-emerald-300">
                            {v.nama_perusahaan || v.nama}
                          </span>
                        </button>
                      ))}
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
              {editingId ? "Simpan Perubahan" : "Simpan Data Laptop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
