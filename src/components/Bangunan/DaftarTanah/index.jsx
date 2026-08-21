import React, { useState, useRef } from "react";
import { Map, Search, Plus, FileSpreadsheet, Edit, Trash2, X, Loader2 } from "lucide-react";
import ExcelActionButtons from "../../Common/ExcelActionButtons";
import { addAsetTanah, updateAsetTanah, deleteAsetTanah } from "../../../services/asetTanahService";

export default function BangunanTanah({ userRole = "admin", lands = [], landFilter = "", setLandFilter, loadAllData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredGroupNo, setHoveredGroupNo] = useState(null);

  const [formData, setFormData] = useState({
    unit_kerja: "",
    alamat: "",
    peruntukan: "",
    aset_sap: "",
    no_shgb: "",
    no_sertifikat: "",
    no_sertifikat_gabungan: "",
    no_imb: "",
    nama_pemilik_imb: "",
    tgl_mulai_shgb: "",
    tgl_berakhir_shgb: "",
    tahun_perolehan: "",
    luas_tanah: "",
    luas_pagar: "",
    luas_bangunan: "",
    keterangan: "",
  });

  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });

  const formatDate = (dateStr) => {
    if (!dateStr || String(dateStr).trim() === "" || String(dateStr).trim() === "-") return "-";
    if (dateStr.includes("/")) return dateStr;
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
    return dateStr;
  };

  const filteredLands = lands.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.unit_kerja && item.unit_kerja.toLowerCase().includes(q)) ||
      (item.alamat && item.alamat.toLowerCase().includes(q)) ||
      (item.peruntukan && item.peruntukan.toLowerCase().includes(q)) ||
      (item.no_shgb && item.no_shgb.toLowerCase().includes(q)) ||
      (item.no_sertifikat && item.no_sertifikat.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredLands.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredLands.slice(startIndex, startIndex + itemsPerPage);

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      unit_kerja: "", alamat: "", peruntukan: "", aset_sap: "",
      no_shgb: "", no_sertifikat: "", no_sertifikat_gabungan: "",
      no_imb: "", nama_pemilik_imb: "", tgl_mulai_shgb: "",
      tgl_berakhir_shgb: "", tahun_perolehan: "", luas_tanah: "",
      luas_pagar: "", luas_bangunan: "", keterangan: "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      unit_kerja: item.unit_kerja || "",
      alamat: item.alamat || "",
      peruntukan: item.peruntukan || "",
      aset_sap: item.aset_sap || "",
      no_shgb: item.no_shgb || "",
      no_sertifikat: item.no_sertifikat || "",
      no_sertifikat_gabungan: item.no_sertifikat_gabungan || "",
      no_imb: item.no_imb || "",
      nama_pemilik_imb: item.nama_pemilik_imb || "",
      tgl_mulai_shgb: item.tgl_mulai_shgb || "",
      tgl_berakhir_shgb: item.tgl_berakhir_shgb || "",
      tahun_perolehan: item.tahun_perolehan ? String(item.tahun_perolehan) : "",
      luas_tanah: item.luas_tanah ? String(item.luas_tanah) : "",
      luas_pagar: item.luas_pagar ? String(item.luas_pagar) : "",
      luas_bangunan: item.luas_bangunan ? String(item.luas_bangunan) : "",
      keterangan: item.keterangan || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      unit_kerja: formData.unit_kerja,
      alamat: formData.alamat,
      peruntukan: formData.peruntukan,
      aset_sap: formData.aset_sap,
      no_shgb: formData.no_shgb,
      no_sertifikat: formData.no_sertifikat,
      no_sertifikat_gabungan: formData.no_sertifikat_gabungan,
      no_imb: formData.no_imb,
      nama_pemilik_imb: formData.nama_pemilik_imb,
      tgl_shgb_mulai: formData.tgl_mulai_shgb || null,
      tgl_shgb_berakhir: formData.tgl_berakhir_shgb || null,
      tahun_perolehan: formData.tahun_perolehan ? Number(formData.tahun_perolehan) : null,
      luas_tanah_m2: formData.luas_tanah ? Number(formData.luas_tanah) : null,
      luas_pagar_m2: formData.luas_pagar ? Number(formData.luas_pagar) : null,
      luas_bangunan_m2: formData.luas_bangunan ? Number(formData.luas_bangunan) : null,
      keterangan: formData.keterangan,
    };

    try {
      if (editingId) {
        await updateAsetTanah(editingId, payload);
      } else {
        await addAsetTanah(payload);
      }
      setIsModalOpen(false);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menyimpan data tanah:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus aset tanah ini?")) return;
    try {
      await deleteAsetTanah(id);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menghapus aset tanah:", err);
    }
  };



  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-950 p-2.5 rounded-2xl border border-emerald-800/40">
            <Map className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Daftar Tanah & Sertifikat SHGB</h2>
            <p className="text-xs text-slate-400">Manajemen inventaris aset tanah instansi beserta legalitas SHGB.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <ExcelActionButtons
            data={filteredLands}
            fileName="Daftar_Tanah_Pegadaian"
            headersMap={{
              unit_kerja: "Unit Kerja",
              alamat: "Alamat",
              peruntukan: "Peruntukan",
              aset_sap: "Aset SAP",
              no_shgb: "No SHGB",
              no_sertifikat: "No Sertifikat",
              luas_tanah: "Luas Tanah",
            }}
            onImport={async (parsedRows) => {
              if (!parsedRows || parsedRows.length === 0) return;
              let count = 0;
              for (const row of parsedRows) {
                const unit_kerja = row.unit_kerja || row["Unit Kerja"] || row["unit_kerja"];
                if (!unit_kerja) continue;
                try {
                  await addAsetTanah({
                    unit_kerja,
                    alamat: row.alamat || row["Alamat"] || "-",
                    peruntukan: row.peruntukan || row["Peruntukan"] || "-",
                    aset_sap: row.aset_sap || row["Aset SAP"] || "-",
                    no_shgb: row.no_shgb || row["No SHGB"] || "-",
                    no_sertifikat: row.no_sertifikat || row["No Sertifikat"] || "-",
                    luas_tanah: row.luas_tanah || row["Luas Tanah"] || "0",
                  });
                  count++;
                } catch (err) {
                  console.error("Error import tanah:", err);
                }
              }
              alert(`${count} data aset tanah berhasil diimpor.`);
              if (loadAllData) loadAllData();
            }}
          />
          {userRole === "admin" && (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Tambah Tanah
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari unit kerja, alamat, No. SHGB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-xs text-slate-100"
            />
          </div>
          <span className="text-xs font-semibold text-slate-400">Total Aset Tanah: {filteredLands.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-center">No</th>
                <th className="px-4 py-3">Unit Kerja</th>
                <th className="px-4 py-3">Alamat</th>
                <th className="px-4 py-3">Peruntukan</th>
                <th className="px-4 py-3">No. SHGB</th>
                <th className="px-4 py-3">No. Sertifikat</th>
                <th className="px-4 py-3 text-center">Tgl Berakhir</th>
                <th className="px-4 py-3 text-center">Luas Lahan (m²)</th>
                {userRole === "admin" && <th className="px-4 py-3 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={userRole === "admin" ? "9" : "8"} className="px-6 py-8 text-center text-slate-500 italic">
                    Belum ada data tanah terdaftar.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-center text-slate-500 font-mono">{startIndex + idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-100">{item.unit_kerja || "-"}</td>
                    <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{item.alamat || "-"}</td>
                    <td className="px-4 py-3 text-slate-300">{item.peruntukan || "-"}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">{item.no_shgb || "-"}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{item.no_sertifikat || "-"}</td>
                    <td className="px-4 py-3 text-center text-slate-300 font-mono">{formatDate(item.tgl_shgb_berakhir || item.tgl_berakhir_shgb)}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-200">{item.luas_tanah_m2 || item.luas_tanah || "-"}</td>
                    {userRole === "admin" && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => openEdit(item)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg cursor-pointer">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
              <h3 className="font-bold text-lg text-slate-100">{editingId ? "Edit Aset Tanah" : "Tambah Aset Tanah"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 overflow-y-auto custom-scrollbar space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Kerja *</label>
                  <input
                    required
                    value={formData.unit_kerja}
                    onChange={(e) => setFormData({ ...formData, unit_kerja: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                    placeholder="Nama unit kerja..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Peruntukan</label>
                  <input
                    value={formData.peruntukan}
                    onChange={(e) => setFormData({ ...formData, peruntukan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                    placeholder="Kantor Cabang / Gudang..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Lengkap</label>
                  <textarea
                    rows={2}
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 resize-none"
                    placeholder="Alamat lokasi tanah..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No. SHGB</label>
                  <input
                    value={formData.no_shgb}
                    onChange={(e) => setFormData({ ...formData, no_shgb: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No. Sertifikat</label>
                  <input
                    value={formData.no_sertifikat}
                    onChange={(e) => setFormData({ ...formData, no_sertifikat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tgl SHGB Mulai</label>
                  <input
                    type="date"
                    value={formData.tgl_mulai_shgb}
                    onChange={(e) => setFormData({ ...formData, tgl_mulai_shgb: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tgl SHGB Berakhir</label>
                  <input
                    type="date"
                    value={formData.tgl_berakhir_shgb}
                    onChange={(e) => setFormData({ ...formData, tgl_berakhir_shgb: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Luas Lahan (m²)</label>
                  <input
                    type="number"
                    value={formData.luas_tanah}
                    onChange={(e) => setFormData({ ...formData, luas_tanah: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Keterangan</label>
                  <input
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer">Batal</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Simpan Perubahan" : "Simpan Aset Tanah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
