import React, { useState, useEffect, useMemo } from "react";
import { X, Loader2 } from "lucide-react";
import SearchableSelect from "../../Common/SearchableSelect";
import { calculateLease } from "../../../utils/deviceUtils";

const DEFAULT_MASTER_COMPUTERS = [
  { id: "p1", nama: "Dell Optiplex SFF 7010", kategori: "KOMPUTER" },
  { id: "p2", nama: "Dell OptiPlex 3070 MFF", kategori: "KOMPUTER" },
  { id: "p3", nama: "Dell OptiPlex 3060", kategori: "KOMPUTER" },
  { id: "p4", nama: "Dell OptiPlex 5090", kategori: "KOMPUTER" },
  { id: "p5", nama: "Lenovo ThinkCentre M720q", kategori: "KOMPUTER" },
  { id: "p6", nama: "HP ProDesk 400 G6", kategori: "KOMPUTER" },
];

const DEFAULT_MASTER_VENDORS = [
  { id: "v1", nama_perusahaan: "PT PESONNA OPTIMA JASA", pimpinan: "Achmad Suadi", kota: "Jakarta Central" },
  { id: "v2", nama_perusahaan: "CV YODERINDO INTI PRIMA", pimpinan: "Yoderindo", kota: "Surabaya" },
  { id: "v3", nama_perusahaan: "PT DANAKAR", pimpinan: "Danakar", kota: "Jakarta" },
  { id: "v4", nama_perusahaan: "PT GLOBAL SOLUSINDO KOMPUDATA", pimpinan: "Global Solusindo", kota: "Bandung" },
  { id: "v5", nama_perusahaan: "PT FRESH UTAMA PERKASA", pimpinan: "Fresh Utama", kota: "Jakarta" },
];

export default function KomputerModal({ isOpen, editingId, formData = {}, setFormData = () => {}, isSaving = false, outletsList = [], inventoryList = [], vendorsList = [], onClose = () => {}, onSave = () => {} }) {
  // Normalisasi berbagai format tanggal → "YYYY-MM-DD" yang dibutuhkan <input type="date">
  const toDateInput = (val) => {
    if (!val) return "";
    // Firestore Timestamp object
    if (typeof val?.toDate === "function") return val.toDate().toISOString().slice(0, 10);
    // Firestore Timestamp {seconds, nanoseconds}
    if (val?.seconds) return new Date(val.seconds * 1000).toISOString().slice(0, 10);
    const str = String(val).trim();
    // Sudah format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
    // Format DD/MM/YYYY atau DD-MM-YYYY
    const dmy = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
    if (dmy) return `${dmy[3]}-${dmy[2].padStart(2,"0")}-${dmy[1].padStart(2,"0")}`;
    // Coba parse biasa
    const parsed = new Date(str);
    if (!isNaN(parsed)) return parsed.toISOString().slice(0, 10);
    return "";
  };

  const [tglMulai, setTglMulai] = useState(() => toDateInput(formData.tanggalMulai || formData.tanggal_mulai));
  const [tglSelesai, setTglSelesai] = useState(() => toDateInput(formData.tanggalSelesai || formData.tanggal_selesai));

  useEffect(() => {
    if (isOpen) {
      setTglMulai(toDateInput(formData.tanggalMulai || formData.tanggal_mulai));
      setTglSelesai(toDateInput(formData.tanggalSelesai || formData.tanggal_selesai));
    }
  }, [isOpen, editingId, formData.tanggalMulai, formData.tanggal_mulai, formData.tanggalSelesai, formData.tanggal_selesai]);

  const { status, masaSewa } = useMemo(() => {
    return calculateLease(tglMulai, tglSelesai);
  }, [tglMulai, tglSelesai]);

  const activeInventory = inventoryList.length > 0 ? inventoryList : DEFAULT_MASTER_COMPUTERS;
  const activeVendors = vendorsList.length > 0 ? vendorsList : DEFAULT_MASTER_VENDORS;

  const handleSelectProduct = (item) => {
    if (!item) return;
    const name = item.nama || item.produk || "";
    const spkNo = item.no_spk || item.no_pks || item.spkNo || "";
    const vendorName = item.vendor_nama || item.vendor?.nama || (typeof item.vendor === "string" ? item.vendor : "");
    const rawMulai = item.tanggal_mulai || item.tgl_mulai_sewa || item.tanggalMulai || item.tgl_mulai || item.tglMulai || "";
    const rawSelesai = item.tanggal_selesai || item.tgl_selesai_sewa || item.tanggalSelesai || item.tgl_selesai || item.tglSelesai || "";
    const parsedMulai = toDateInput(rawMulai);
    const parsedSelesai = toDateInput(rawSelesai);

    setFormData((p) => ({
      ...p,
      produk: name,
      vendor: vendorName || p.vendor || "",
      penyedia: vendorName || p.penyedia || "",
      no_spk: spkNo || p.no_spk || "",
      tanggalMulai: parsedMulai || p.tanggalMulai || "",
      tanggal_mulai: parsedMulai || p.tanggal_mulai || "",
      tanggalSelesai: parsedSelesai || p.tanggalSelesai || "",
      tanggal_selesai: parsedSelesai || p.tanggal_selesai || "",
    }));
    if (parsedMulai) setTglMulai(parsedMulai);
    if (parsedSelesai) setTglSelesai(parsedSelesai);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);
    const v = formData.penyedia || formData.vendor || "";
    setFormData((prev) => ({
      ...prev,
      penyedia: v,
      vendor: v,
      tanggalMulai: tglMulai,
      tanggal_mulai: tglMulai,
      tanggalSelesai: tglSelesai,
      tanggal_selesai: tglSelesai,
      status: status,
      lastUpdate: prev.lastUpdate || todayStr,
      timeUpdate: prev.timeUpdate || timeStr,
    }));
    if (onSave) onSave(e);
  };

  if (!isOpen) return null;

  const inputCls = "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 placeholder:text-slate-500 transition-colors";
  const inputPurple = "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-purple-500 placeholder:text-slate-500 transition-colors";
  const labelCls = "block text-[11px] font-semibold text-slate-300 mb-1";

  const setCurrentTimestamp = () => {
    const now = new Date();
    setFormData((p) => ({
      ...p,
      lastUpdate: now.toISOString().slice(0, 10),
      timeUpdate: now.toTimeString().slice(0, 8),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
          <h3 className="font-bold text-base text-slate-100">{editingId ? "Edit Data Komputer" : "Tambah PC Baru"}</h3>
          <button type="button" onClick={onClose} disabled={isSaving} className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* KOLOM KIRI: Hardware, Outlet & Sewa */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-emerald-400 border-b border-slate-800 pb-2 uppercase tracking-wider">Informasi Hardware & Lokasi</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Nama Outlet */}
                  <SearchableSelect
                    label="Nama Outlet / Lokasi"
                    className="sm:col-span-2"
                    inputClassName={inputCls}
                    labelClassName={labelCls}
                    value={formData.outlet || ""}
                    options={outletsList}
                    disabled={isSaving}
                    placeholder="Pilih atau ketik nama outlet..."
                    getOptionLabel={(o) => o.nama || ""}
                    getOptionSubLabel={(o) => o.idOutlet || o.kode || o.id || ""}
                    onChange={(val) => {
                      const found = outletsList.find((o) => o.nama?.toLowerCase() === val.toLowerCase());
                      setFormData((p) => ({
                        ...p,
                        outlet: val,
                        idOutlet: found ? found.idOutlet || found.kode || found.id || p.idOutlet || "" : p.idOutlet || "",
                      }));
                    }}
                    onSelect={(o) => {
                      setFormData((p) => ({
                        ...p,
                        outlet: o.nama,
                        idOutlet: o.idOutlet || o.kode || o.id || "",
                      }));
                    }}
                  />

                  {/* ID Outlet */}
                  <div>
                    <label className={labelCls}>Outlet Id (Kode)</label>
                    <input type="text" readOnly value={formData.idOutlet || ""} className={`${inputCls} bg-slate-950 text-slate-400 cursor-not-allowed`} placeholder="Otomatis" />
                  </div>

                  {/* Username */}
                  <div>
                    <label className={labelCls}>Username</label>
                    <input
                      type="text"
                      value={formData.username || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputCls} font-mono`}
                      placeholder="pegadaian..."
                    />
                  </div>

                  {/* Hostname */}
                  <div>
                    <label className={labelCls}>Hostname</label>
                    <input
                      type="text"
                      value={formData.hostname || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, hostname: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputCls} font-mono`}
                      placeholder="pc-12473-2.pegadaiann.co.id..."
                    />
                  </div>

                  {/* Kondisi Hardware */}
                  <div>
                    <label className={labelCls}>Kondisi Hardware</label>
                    <select value={formData.kondisi || "BAIK"} onChange={(e) => setFormData((p) => ({ ...p, kondisi: e.target.value }))} disabled={isSaving} className={`${inputCls} cursor-pointer`}>
                      <option value="BAIK">BAIK</option>
                      <option value="KURANG BAIK">KURANG BAIK</option>
                      <option value="RUSAK">RUSAK</option>
                    </select>
                  </div>

                  {/* Produk / Model PC */}
                  <SearchableSelect
                    label="Product Hardware / Model"
                    className="sm:col-span-2"
                    inputClassName={inputCls}
                    labelClassName={labelCls}
                    value={formData.produk || ""}
                    options={activeInventory}
                    disabled={isSaving}
                    placeholder="Pilih atau ketik model PC..."
                    onChange={(val) => {
                      const found = activeInventory.find(
                        (i) => (i.nama || i.produk)?.toLowerCase() === val.toLowerCase()
                      );
                      if (found) {
                        handleSelectProduct(found);
                      } else {
                        setFormData((p) => ({ ...p, produk: val }));
                      }
                    }}
                    onSelect={(item) => {
                      handleSelectProduct(item);
                    }}
                    renderOption={(item) => {
                      const name = item.nama || item.produk;
                      const spkNo = item.no_spk || item.no_pks || "";
                      const vendorName = item.vendor_nama || item.vendor?.nama || (typeof item.vendor === "string" ? item.vendor : "");
                      const stok = item.kuantitas !== undefined ? item.kuantitas : item.stok || 0;
                      return (
                        <div className="w-full text-left px-3 py-2.5 text-xs rounded-lg hover:bg-[#00753A]/30 hover:text-emerald-300 transition-colors border-b border-slate-700/50 last:border-0 group">
                          <div className="font-semibold text-slate-200 group-hover:text-emerald-300 truncate">{name}</div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {spkNo && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">SPK: {spkNo}</span>}
                            {vendorName && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">{vendorName}</span>}
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700 font-mono">Stok: {stok}</span>
                          </div>
                        </div>
                      );
                    }}
                  />

                  {/* Serial Number */}
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Serial Number (S/N)</label>
                    <input required type="text" value={formData.sn || ""} onChange={(e) => setFormData((p) => ({ ...p, sn: e.target.value }))} disabled={isSaving} className={`${inputCls} font-mono`} placeholder="8V63PD4..." />
                  </div>
                </div>

                <h4 className="font-bold text-xs text-emerald-400 border-b border-slate-800 pb-2 pt-2 uppercase tracking-wider">Vendor & Masa Kontrak</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* SPK */}
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Nomor SPK / Kontrak</label>
                    <input
                      type="text"
                      value={formData.no_spk || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, no_spk: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputCls} font-mono`}
                      placeholder="642/00108.04/2026..."
                    />
                  </div>

                  {/* Penyedia / Vendor */}
                  <SearchableSelect
                    label="Penyedia / Vendor"
                    className="sm:col-span-2"
                    inputClassName={inputCls}
                    labelClassName={labelCls}
                    value={formData.penyedia || formData.vendor || ""}
                    options={activeVendors}
                    disabled={isSaving}
                    placeholder="Pilih atau ketik vendor penyedia..."
                    onChange={(val) => setFormData((p) => ({ ...p, penyedia: val, vendor: val }))}
                    onSelect={(v) => {
                      const vName = v.nama_perusahaan || v.nama || "";
                      setFormData((p) => ({ ...p, penyedia: vName, vendor: vName }));
                    }}
                    renderOption={(v) => (
                      <div className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[#00753A]/30 hover:text-emerald-300 transition-colors flex items-center justify-between group">
                        <div>
                          <div className="font-bold text-slate-200 group-hover:text-emerald-300">{v.nama_perusahaan || v.nama}</div>
                          {v.pimpinan && (
                            <div className="text-[10px] text-slate-400">
                              Pimpinan: {v.pimpinan} {v.kota ? `• ${v.kota}` : ""}
                            </div>
                          )}
                        </div>
                        {v.kategori_bidang && <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">{v.kategori_bidang}</span>}
                      </div>
                    )}
                  />

                  <div>
                    <label className={labelCls}>Awal Sewa (Tgl Mulai)</label>
                    <input
                      type="date"
                      value={tglMulai}
                      onChange={(e) => {
                        setTglMulai(e.target.value);
                        setFormData((p) => ({ ...p, tanggalMulai: e.target.value, tanggal_mulai: e.target.value }));
                      }}
                      disabled={isSaving}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Akhir Sewa (Tgl Selesai)</label>
                    <input
                      type="date"
                      value={tglSelesai}
                      onChange={(e) => {
                        setTglSelesai(e.target.value);
                        setFormData((p) => ({ ...p, tanggalSelesai: e.target.value, tanggal_selesai: e.target.value }));
                      }}
                      disabled={isSaving}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Status (Otomatis)</label>
                    <input type="text" readOnly value={status} className={`${inputCls} bg-slate-950 font-semibold text-emerald-400 cursor-not-allowed`} />
                  </div>

                  <div>
                    <label className={labelCls}>Masa Sewa (Bln)</label>
                    <input type="number" readOnly value={masaSewa} className={`${inputCls} bg-slate-950 font-semibold text-slate-300 cursor-not-allowed`} />
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN: Jaringan, Spesifikasi & Update */}
              <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-xs text-purple-400 uppercase tracking-wider">Jaringan & Spesifikasi Teknis</h4>
                  <button
                    type="button"
                    onClick={setCurrentTimestamp}
                    className="text-[10px] px-2 py-0.5 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800/80 transition-colors cursor-pointer"
                    title="Set Last Update dan Time Update ke waktu sekarang"
                  >
                    Update Waktu Sekarang
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Ip Address</label>
                    <input
                      type="text"
                      value={formData.ipAddress || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, ipAddress: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputPurple} font-mono text-emerald-400`}
                      placeholder="10.81.182.30"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Mac Address</label>
                    <input
                      type="text"
                      value={formData.macAddress || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, macAddress: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputPurple} font-mono`}
                      placeholder="d4:a2:cd:a4:94:e0"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>CPU (Processor)</label>
                    <input type="text" value={formData.cpu || ""} onChange={(e) => setFormData((p) => ({ ...p, cpu: e.target.value }))} disabled={isSaving} className={inputPurple} placeholder="Intel(R) Core(TM) i5-14600..." />
                  </div>

                  <div>
                    <label className={labelCls}>Physical Memory (RAM)</label>
                    <input type="text" value={formData.ram || ""} onChange={(e) => setFormData((p) => ({ ...p, ram: e.target.value }))} disabled={isSaving} className={inputPurple} placeholder="7 GB" />
                  </div>

                  <div>
                    <label className={labelCls}>Physical Disk (Storage)</label>
                    <input type="text" value={formData.storage || ""} onChange={(e) => setFormData((p) => ({ ...p, storage: e.target.value }))} disabled={isSaving} className={inputPurple} placeholder="503GB" />
                  </div>

                  <div>
                    <label className={labelCls}>OS Name</label>
                    <input type="text" value={formData.os || ""} onChange={(e) => setFormData((p) => ({ ...p, os: e.target.value }))} disabled={isSaving} className={inputPurple} placeholder="Ubuntu 22.04 Build 2025.11.11" />
                  </div>

                  <div>
                    <label className={labelCls}>OS Version</label>
                    <input type="text" value={formData.osVersion || ""} onChange={(e) => setFormData((p) => ({ ...p, osVersion: e.target.value }))} disabled={isSaving} className={inputPurple} placeholder="22.04" />
                  </div>

                  <div>
                    <label className={labelCls}>Last Update</label>
                    <input type="date" value={formData.lastUpdate || ""} onChange={(e) => setFormData((p) => ({ ...p, lastUpdate: e.target.value }))} disabled={isSaving} className={inputPurple} />
                  </div>

                  <div>
                    <label className={labelCls}>Time Update</label>
                    <input type="text" value={formData.timeUpdate || ""} onChange={(e) => setFormData((p) => ({ ...p, timeUpdate: e.target.value }))} disabled={isSaving} className={`${inputPurple} font-mono`} placeholder="17:40:09" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Keterangan / Catatan Tambahan</label>
                    <textarea
                      rows={2}
                      value={formData.keterangan || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, keterangan: e.target.value }))}
                      disabled={isSaving}
                      className={`${inputPurple} resize-none`}
                      placeholder="Catatan kondisi atau keterangan tambahan..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-5 py-4 border-t border-slate-800 bg-slate-900 shrink-0 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer">
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
