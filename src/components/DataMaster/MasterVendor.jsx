import React, { useState } from "react";
import { Users, Search, Plus, Phone, MapPin, Edit, Trash2 } from "lucide-react";
import { addVendor, updateVendor, deleteVendor } from "../../services/vendorService";
import ExcelActionButtons from "../Common/ExcelActionButtons";

export default function MasterVendor({ vendors = [], userRole = "admin", loadAllData }) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nama: "", no_telp: "", alamat: "" });
  const [isSaving, setIsSaving] = useState(false);

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.nama?.toLowerCase().includes(q) ||
      v.no_telp?.toLowerCase().includes(q) ||
      v.alamat?.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ nama: "", no_telp: "", alamat: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingId(v.id);
    setFormData({ nama: v.nama || "", no_telp: v.no_telp || "", alamat: v.alamat || "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await updateVendor(editingId, formData);
      } else {
        await addVendor(formData);
      }
      setIsModalOpen(false);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menyimpan vendor:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus vendor ini?")) return;
    try {
      await deleteVendor(id);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menghapus vendor:", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-950 p-2.5 rounded-2xl border border-emerald-800/40">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Master Data Vendor & Penyedia</h2>
            <p className="text-xs text-slate-400">Kelola informasi mitra & penyedia layanan logistik.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari vendor / telp..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
            />
          </div>
          <ExcelActionButtons
            data={filtered}
            fileName="Master_Vendor_Pegadaian"
            headersMap={{
              nama: "Nama Vendor",
              no_telp: "No Telepon",
              alamat: "Alamat",
            }}
            onImport={async (parsedRows) => {
              if (!parsedRows || parsedRows.length === 0) return;
              let successCount = 0;
              for (const row of parsedRows) {
                const nama = row.nama || row["Nama Vendor"] || row["nama"];
                const no_telp = row.no_telp || row["No Telepon"] || row["telp"] || "-";
                const alamat = row.alamat || row["Alamat"] || "-";
                if (!nama) continue;
                try {
                  await addVendor({ nama, no_telp, alamat });
                  successCount++;
                } catch (err) {
                  console.error("Error import vendor row:", err);
                }
              }
              alert(`${successCount} data vendor berhasil diimpor.`);
              if (loadAllData) loadAllData();
            }}
          />
          {userRole === "admin" && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Tambah Vendor
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 w-12 text-center">No</th>
                <th className="px-6 py-4">Nama Vendor</th>
                <th className="px-6 py-4">No. Telepon</th>
                <th className="px-6 py-4">Alamat Kantor</th>
                {userRole === "admin" && <th className="px-6 py-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={userRole === "admin" ? "5" : "4"} className="px-6 py-8 text-center text-slate-500 italic">
                    Belum ada data vendor terdaftar.
                  </td>
                </tr>
              ) : (
                filtered.map((v, idx) => (
                  <tr key={v.id || idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-100">{v.nama || "-"}</td>
                    <td className="px-6 py-4 text-slate-300 font-mono flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      {v.no_telp || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-xs">{v.alamat || "-"}</span>
                      </div>
                    </td>
                    {userRole === "admin" && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleOpenEdit(v)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg cursor-pointer">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(v.id)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg cursor-pointer">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-100">{editingId ? "Edit Vendor" : "Tambah Vendor Baru"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Vendor / Perusahaan</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                  placeholder="PT. Sinergi Logistik Utama"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">No. Telepon</label>
                <input
                  type="text"
                  required
                  value={formData.no_telp}
                  onChange={(e) => setFormData({ ...formData, no_telp: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                  placeholder="021-5551234"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Kantor</label>
                <textarea
                  required
                  rows={3}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                  placeholder="Jl. Gatot Subroto No. 12, Jakarta"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
