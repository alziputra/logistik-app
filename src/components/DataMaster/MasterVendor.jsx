import React, { useState } from "react";
import { Users, Plus, Search, Edit, Trash2, Building2, MapPin, Phone, User, Map, X } from "lucide-react";
import ExcelActionButtons from "../Common/ExcelActionButtons";
import ConfirmDeleteModal from "../Modal/ConfirmDeleteModal";
import Pagination from "../Common/Pagination";
import { addVendor, updateVendor, deleteVendor } from "../../services/vendorService";

export default function MasterVendor({ vendors = [], userRole = "admin", loadAllData }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama_perusahaan: "",
    pimpinan: "",
    jabatan: "Direktur",
    keterangan: "BANGUNAN",
    kota: "JAKARTA",
    no_telp: "",
    alamat: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    const namaComp = (v.nama_perusahaan || v.nama || "").toLowerCase();
    const pimpinan = (v.pimpinan || "").toLowerCase();
    const jabatan = (v.jabatan || "").toLowerCase();
    const ket = (v.keterangan || "").toLowerCase();
    const kota = (v.kota || "").toLowerCase();
    const telp = (v.no_telp || v.kontak || "").toLowerCase();
    const alamat = (v.alamat || "").toLowerCase();

    return (
      namaComp.includes(q) ||
      pimpinan.includes(q) ||
      jabatan.includes(q) ||
      ket.includes(q) ||
      kota.includes(q) ||
      telp.includes(q) ||
      alamat.includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      nama_perusahaan: "",
      pimpinan: "",
      jabatan: "Direktur",
      keterangan: "BANGUNAN",
      kota: "JAKARTA",
      no_telp: "",
      alamat: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingId(v.id);
    setFormData({
      nama_perusahaan: v.nama_perusahaan || v.nama || "",
      pimpinan: v.pimpinan || "",
      jabatan: v.jabatan || "Direktur",
      keterangan: v.keterangan || "BANGUNAN",
      kota: v.kota || "JAKARTA",
      no_telp: v.no_telp || v.kontak || "",
      alamat: v.alamat || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      ...formData,
      nama: formData.nama_perusahaan, // backward compatibility
      kontak: formData.no_telp, // backward compatibility
    };
    try {
      if (editingId) {
        await updateVendor(editingId, payload);
      } else {
        await addVendor(payload);
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
    if (!window.confirm("Apakah Anda yakin ingin menghapus data vendor ini?")) return;
    try {
      await deleteVendor(id);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menghapus vendor:", err);
    }
  };

  const getBadgeStyle = (ket = "") => {
    const k = ket.toUpperCase();
    if (k.includes("BANGUNAN")) return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800/40";
    if (k.includes("KOMPUTER") || k.includes("CCTV") || k.includes("ALARM") || k.includes("IT")) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40";
    if (k.includes("SERTIFIKASI") || k.includes("NOTARIS") || k.includes("EO")) return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800/40";
    if (k.includes("PERCETAKAN") || k.includes("BILLBOARD")) return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800/40";
    return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Control Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#E6F4EA] dark:bg-emerald-950/80 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/40">
            <Users className="w-6 h-6 text-[#00753A] dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Master Data Vendor & Penyedia ({vendors.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola daftar resmi 35+ mitra, vendor, dan kontraktor penyedia jasa Pegadaian.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari vendor, pimpinan, kota..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A]"
            />
          </div>

          <ExcelActionButtons
            data={filtered}
            fileName="Master_Vendor_Pegadaian"
            headersMap={{
              nama_perusahaan: "Nama Perusahaan / PT",
              pimpinan: "Pimpinan / Penanggung Jawab",
              jabatan: "Jabatan",
              keterangan: "Bidang / Keterangan",
              kota: "Kota",
              no_telp: "No. Telepon / WhatsApp",
              alamat: "Alamat Perusahaan",
            }}
            onImport={async (parsedRows) => {
              if (!parsedRows || parsedRows.length === 0) return;
              let successCount = 0;
              for (const row of parsedRows) {
                const nama_perusahaan = row.nama_perusahaan || row["Nama Perusahaan / PT"] || row["nama"] || row["Nama Vendor"];
                const pimpinan = row.pimpinan || row["Pimpinan / Penanggung Jawab"] || row["pimpinan"] || "-";
                const jabatan = row.jabatan || row["Jabatan"] || "Direktur";
                const keterangan = row.keterangan || row["Bidang / Keterangan"] || "BANGUNAN";
                const kota = row.kota || row["Kota"] || "JAKARTA";
                const no_telp = row.no_telp || row["No. Telepon / WhatsApp"] || row["kontak"] || "-";
                const alamat = row.alamat || row["Alamat Perusahaan"] || "-";

                if (!nama_perusahaan) continue;
                try {
                  await addVendor({
                    nama_perusahaan,
                    nama: nama_perusahaan,
                    pimpinan,
                    jabatan,
                    keterangan,
                    kota,
                    no_telp,
                    kontak: no_telp,
                    alamat,
                  });
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
              className="flex items-center gap-2 bg-[#00753A] hover:bg-[#005c2e] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Tambah Vendor
            </button>
          )}
        </div>
      </div>

      {/* Table Display */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-12 text-center">No</th>
                <th className="px-5 py-3.5">Nama Perusahaan / PT</th>
                <th className="px-5 py-3.5">Pimpinan & Jabatan</th>
                <th className="px-5 py-3.5">Bidang / Layanan</th>
                <th className="px-5 py-3.5">Kota</th>
                <th className="px-5 py-3.5">Kontak / Telepon</th>
                <th className="px-5 py-3.5">Alamat Perusahaan</th>
                {userRole === "admin" && <th className="px-5 py-3.5 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={userRole === "admin" ? "8" : "7"} className="px-6 py-10 text-center text-slate-400 italic">
                    Belum ada data vendor terdaftar.
                  </td>
                </tr>
              ) : (
                filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((v, idx) => (
                  <tr key={v.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 text-center text-slate-400 font-mono">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    
                    {/* Nama Perusahaan */}
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#00753A] shrink-0" />
                        <span className="truncate max-w-[220px]">{v.nama_perusahaan || v.nama || "-"}</span>
                      </div>
                    </td>

                    {/* Pimpinan & Jabatan */}
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {v.pimpinan || "-"}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {v.jabatan || "Direktur"}
                        </span>
                      </div>
                    </td>

                    {/* Bidang / Keterangan */}
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${getBadgeStyle(v.keterangan)}`}>
                        {v.keterangan || "-"}
                      </span>
                    </td>

                    {/* Kota */}
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase border border-slate-200 dark:border-slate-700 flex items-center gap-1 w-fit">
                        <Map className="w-3 h-3 text-slate-400" />
                        {v.kota || "-"}
                      </span>
                    </td>

                    {/* Telepon */}
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#00753A] shrink-0" />
                        <span>{v.no_telp || v.kontak || "-"}</span>
                      </div>
                    </td>

                    {/* Alamat */}
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[250px]" title={v.alamat}>{v.alamat || "-"}</span>
                      </div>
                    </td>

                    {/* Aksi */}
                    {userRole === "admin" && (
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(v)}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-[#00753A] dark:text-emerald-400 rounded-lg cursor-pointer transition-colors"
                            title="Edit Vendor"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-lg cursor-pointer transition-colors"
                            title="Hapus Vendor"
                          >
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

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filtered.length / itemsPerPage) || 1}
          totalItems={filtered.length}
          startIndex={(currentPage - 1) * itemsPerPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Form Modal Add / Edit Vendor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="bg-[#E6F4EA] dark:bg-emerald-950 p-2 rounded-xl text-[#00753A]">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {editingId ? "Edit Data Vendor" : "Tambah Vendor Baru"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Perusahaan */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Perusahaan / PT <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama_perusahaan}
                    onChange={(e) => setFormData({ ...formData, nama_perusahaan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A]"
                    placeholder="PT. DANAKAR"
                  />
                </div>

                {/* Pimpinan */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Pimpinan / Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    value={formData.pimpinan}
                    onChange={(e) => setFormData({ ...formData, pimpinan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A]"
                    placeholder="HUSEIN IZZATI"
                  />
                </div>

                {/* Jabatan */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A]"
                    placeholder="Direktur"
                  />
                </div>

                {/* Bidang Pekerjaan */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bidang Pekerjaan / Keterangan
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A]"
                    placeholder="BANGUNAN, CCTV, AC, LIFT, etc."
                  />
                </div>

                {/* Kota */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kota Operasional
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kota}
                    onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A]"
                    placeholder="JAKARTA / BEKASI / BOGOR"
                  />
                </div>

                {/* Telepon */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No. Telepon / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.no_telp}
                    onChange={(e) => setFormData({ ...formData, no_telp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A]"
                    placeholder="081297220944"
                  />
                </div>

                {/* Alamat */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Perusahaan
                  </label>
                  <textarea
                    rows={3}
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A]"
                    placeholder="Jl. Otista Raya No. 68A, Bidara Cina, Jatinegara"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 font-semibold text-white bg-[#00753A] hover:bg-[#005c2e] rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
