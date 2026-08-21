import React, { useState } from "react";
import { Hammer, Search, Plus, FileSpreadsheet, Edit, Trash2, X, Loader2 } from "lucide-react";
import ExcelActionButtons from "../../Common/ExcelActionButtons";
import { addRenovasi, updateRenovasi, deleteRenovasi } from "../../../services/renovasiService";

export default function BangunanRenovasi({
  userRole = "admin",
  renovations = [],
  loadAllData,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const filteredData = renovations.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.nama_pekerjaan && item.nama_pekerjaan.toLowerCase().includes(q)) ||
      (item.nama_outlet && item.nama_outlet.toLowerCase().includes(q)) ||
      (item.no_spk && item.no_spk.toLowerCase().includes(q)) ||
      (item.pelaksana_pekerjaan && item.pelaksana_pekerjaan.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const openAdd = () => {
    setEditingId(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await updateRenovasi(editingId, formData);
      } else {
        await addRenovasi(formData);
      }
      setIsModalOpen(false);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menyimpan data renovasi:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pekerjaan renovasi ini?")) return;
    try {
      await deleteRenovasi(id);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menghapus pekerjaan renovasi:", err);
    }
  };



  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-950 p-2.5 rounded-2xl border border-emerald-800/40">
            <Hammer className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Pekerjaan Renovasi & Pemeliharaan</h2>
            <p className="text-xs text-slate-400">Manajemen progres pekerjaan renovasi gedung, kantor, dan outlet.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <ExcelActionButtons
            data={filteredData}
            fileName="Renovasi_Bangunan_Pegadaian"
            headersMap={{
              nama_pekerjaan: "Nama Pekerjaan",
              nama_outlet: "Nama Outlet",
              no_spk: "No. SPK",
              pelaksana_pekerjaan: "Pelaksana Pekerjaan",
              nilai_pembayaran: "Nilai Pembayaran",
            }}
            onImport={async (parsedRows) => {
              if (!parsedRows || parsedRows.length === 0) return;
              let count = 0;
              for (const row of parsedRows) {
                const nama_pekerjaan = row.nama_pekerjaan || row["Nama Pekerjaan"] || row["nama_pekerjaan"];
                if (!nama_pekerjaan) continue;
                try {
                  await addRenovasi({
                    nama_pekerjaan,
                    nama_outlet: row.nama_outlet || row["Nama Outlet"] || "-",
                    no_spk: row.no_spk || row["No. SPK"] || "-",
                    pelaksana_pekerjaan: row.pelaksana_pekerjaan || row["Pelaksana Pekerjaan"] || "-",
                    nilai_pembayaran: Number(row.nilai_pembayaran || row["Nilai Pembayaran"] || 0),
                  });
                  count++;
                } catch (err) {
                  console.error("Error import renovasi:", err);
                }
              }
              alert(`${count} data renovasi berhasil diimpor.`);
              if (loadAllData) loadAllData();
            }}
          />
          {userRole === "admin" && (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Tambah Renovasi
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
              placeholder="Cari nama pekerjaan, outlet, SPK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-xs text-slate-100"
            />
          </div>
          <span className="text-xs font-semibold text-slate-400">Total Proyek: {filteredData.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-center">No</th>
                <th className="px-4 py-3">Nama Pekerjaan</th>
                <th className="px-4 py-3">Outlet / Cabang</th>
                <th className="px-4 py-3">No. Memo / SPK</th>
                <th className="px-4 py-3">Pelaksana / Kontraktor</th>
                <th className="px-4 py-3 text-right">Nilai SPK</th>
                <th className="px-4 py-3 text-center">Status</th>
                {userRole === "admin" && <th className="px-4 py-3 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={userRole === "admin" ? "8" : "7"} className="px-6 py-8 text-center text-slate-500 italic">
                    Belum ada data pekerjaan renovasi.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-center text-slate-500 font-mono">{startIndex + idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-100">{item.nama_pekerjaan || "-"}</td>
                    <td className="px-4 py-3 text-slate-300">{item.nama_outlet || item.cabang || "-"}</td>
                    <td className="px-4 py-3 text-emerald-400 font-mono">{item.no_spk || item.no_memo || "-"}</td>
                    <td className="px-4 py-3 text-slate-300">{item.pelaksana_pekerjaan || "-"}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                      {item.nilai_spk_pelaksanaan ? `Rp ${Number(item.nilai_spk_pelaksanaan).toLocaleString("id-ID")}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {item.status || "Berjalan"}
                      </span>
                    </td>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
              <h3 className="font-bold text-lg text-slate-100">{editingId ? "Edit Renovasi" : "Tambah Renovasi Baru"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 overflow-y-auto custom-scrollbar space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Pekerjaan *</label>
                  <input
                    required
                    value={formData.nama_pekerjaan || ""}
                    onChange={(e) => setFormData({ ...formData, nama_pekerjaan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                    placeholder="Judul pekerjaan renovasi..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Outlet / Cabang</label>
                  <input
                    value={formData.nama_outlet || ""}
                    onChange={(e) => setFormData({ ...formData, nama_outlet: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No. SPK</label>
                  <input
                    value={formData.no_spk || ""}
                    onChange={(e) => setFormData({ ...formData, no_spk: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pelaksana / Kontraktor</label>
                  <input
                    value={formData.pelaksana_pekerjaan || ""}
                    onChange={(e) => setFormData({ ...formData, pelaksana_pekerjaan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nilai SPK (Rp)</label>
                  <input
                    type="number"
                    value={formData.nilai_spk_pelaksanaan || ""}
                    onChange={(e) => setFormData({ ...formData, nilai_spk_pelaksanaan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer">Batal</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Simpan Perubahan" : "Simpan Renovasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
