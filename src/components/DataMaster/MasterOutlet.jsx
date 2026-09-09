import React, { useState } from "react";
import { Building2, Search, Plus, Edit, Trash2, MapPin } from "lucide-react";
import { addInstansi, updateInstansi, deleteInstansi } from "../../services/instansiService";
import OutletFormModal from "./OutletFormModal";
import ExcelActionButtons from "../Common/ExcelActionButtons";
import Pagination from "../Common/Pagination";

export default function MasterOutlet({ outlets = [], userRole = "admin", loadAllData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredOutlets = outlets.filter((out) => {
    const q = searchQuery.toLowerCase();
    return (
      out.nama?.toLowerCase().includes(q) ||
      out.code?.toLowerCase().includes(q) ||
      out.kode?.toLowerCase().includes(q) ||
      out.kodeCabang?.toLowerCase().includes(q) ||
      out.cabangInduk?.toLowerCase().includes(q) ||
      out.clustering?.toLowerCase().includes(q) ||
      out.status?.toLowerCase().includes(q) ||
      out.area?.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingOutlet(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (out) => {
    setEditingOutlet(out);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const form = new FormData(e.target);
    const statusVal = form.get("status") || "UPC";
    const isBranch = ["UPC", "CABANG", "UPS", "AREA"].includes(statusVal.toUpperCase());

    const payload = {
      kode: (form.get("kode") || "").trim(),
      code: (form.get("kode") || "").trim(),
      nama: (form.get("nama") || "").trim(),
      status: statusVal,
      kodeCabang: form.get("kodeCabang")?.trim() || (isBranch ? "" : "-"),
      cabangInduk: form.get("cabangInduk")?.trim() || (isBranch ? "" : "-"),
      clustering: form.get("clustering") || (isBranch ? "NON CLUSTER" : "-"),
      jenis: form.get("jenis") || (isBranch ? "KONVEN" : "-"),
      area: form.get("area")?.trim() || (isBranch ? "AREA BEKASI" : "-"),
    };

    try {
      if (editingOutlet) {
        await updateInstansi(editingOutlet.id, payload);
      } else {
        await addInstansi(payload);
      }
      setIsModalOpen(false);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menyimpan data instansi:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus instansi ini?")) return;
    try {
      await deleteInstansi(id);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menghapus data instansi:", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#E6F4EA] dark:bg-emerald-950 p-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 text-[#00753A] dark:text-emerald-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Master Data Instansi / Outlet</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manajemen lokasi unit kerja & kantor cabang Pegadaian.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode / nama / cabang..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#00753A] placeholder:text-slate-400"
            />
          </div>
          <ExcelActionButtons
            data={filteredOutlets}
            fileName="Master_Instansi_Outlet_Pegadaian"
            headersMap={{
              kode: "Kode Outlet",
              nama: "Nama Outlet",
              status: "Status",
              kodeCabang: "Kode Cabang",
              cabangInduk: "Cabang Induk",
              clustering: "Clustering",
              jenis: "Konven / Syariah",
              area: "Area",
            }}
            onImport={async (parsedRows) => {
              if (!parsedRows || parsedRows.length === 0) return;
              let successCount = 0;
              for (const row of parsedRows) {
                const nama = row.nama || row["Nama Outlet"] || row["Nama Outlet / Instansi"] || row["Nama"];
                const kode = row.kode || row.code || row["Kode Outlet"] || row["Kode Instansi"] || row["Kode"];
                if (!nama) continue;

                const statusVal = row.status || row["Status"] || "UPC";
                const isBranch = ["UPC", "CABANG", "UPS", "AREA"].includes(String(statusVal).toUpperCase());
                const kodeCabangVal = row.kodeCabang || row["Kode Cabang"] || row["Kode_Cabang"] || row["kode_cabang"] || (isBranch ? "" : "-");
                const cabangIndukVal = row.cabangInduk || row["Cabang Induk"] || row["Cabang_Induk"] || row["cabang_induk"] || row["Induk"] || (isBranch ? "" : "-");
                const clusteringVal = row.clustering || row["Clustering"] || (isBranch ? "NON CLUSTER" : "-");
                const jenisVal = row.jenis || row["Konven / Syariah"] || row["Konven/Syariah"] || row["Jenis"] || (isBranch ? "KONVEN" : "-");
                const areaVal = row.area || row["Area"] || (isBranch ? "AREA BEKASI" : "-");

                try {
                  await addInstansi({
                    code: String(kode || "INST").trim(),
                    kode: String(kode || "INST").trim(),
                    nama: String(nama).trim(),
                    status: String(statusVal).trim(),
                    kodeCabang: String(kodeCabangVal).trim(),
                    cabangInduk: String(cabangIndukVal).trim(),
                    clustering: String(clusteringVal).trim(),
                    jenis: String(jenisVal).trim(),
                    area: String(areaVal).trim(),
                  });
                  successCount++;
                } catch (err) {
                  console.error("Error import outlet row:", err);
                }
              }
              alert(`${successCount} data instansi/outlet berhasil diimpor.`);
              if (loadAllData) loadAllData();
            }}
          />
          {userRole === "admin" && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-[#00753A] hover:bg-[#006030] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Tambah Instansi
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 w-12 text-center">No</th>
                <th className="px-5 py-4">Kode Outlet</th>
                <th className="px-5 py-4">Nama Outlet</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Kode Cabang</th>
                <th className="px-5 py-4">Cabang Induk</th>
                <th className="px-5 py-4">Clustering</th>
                <th className="px-5 py-4">Jenis</th>
                <th className="px-5 py-4">Area</th>
                {userRole === "admin" && <th className="px-5 py-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOutlets.length === 0 ? (
                <tr>
                  <td colSpan={userRole === "admin" ? "10" : "9"} className="px-6 py-8 text-center text-slate-500 italic">
                    Belum ada data outlet / unit kerja terdaftar.
                  </td>
                </tr>
              ) : (
                filteredOutlets
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5 text-center text-slate-500 font-mono font-bold">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-mono font-bold">{item.code || item.kode || "-"}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100">{item.nama || "-"}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                          ["UPC", "CABANG", "UPS", "AREA"].includes((item.status || item.tipe || "").toUpperCase())
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            : "bg-[#E6F4EA] dark:bg-emerald-950 text-[#00753A] dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                        }`}>
                          {item.status || item.tipe || item.jenisOutlet || "UPC"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-300">{item.kodeCabang || "-"}</td>
                      <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium">{item.cabangInduk || "-"}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-slate-700">
                          {item.clustering || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{item.jenis || "-"}</td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-[11px]">{item.area || "-"}</td>
                      {userRole === "admin" && (
                        <td className="px-5 py-3.5 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#00753A] dark:text-emerald-400 rounded-lg cursor-pointer transition-colors" title="Edit Instansi">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-500 rounded-lg cursor-pointer transition-colors" title="Hapus Instansi">
                              <Trash2 className="w-3.5 h-3.5" />
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
          totalPages={Math.ceil(filteredOutlets.length / itemsPerPage) || 1}
          totalItems={filteredOutlets.length}
          startIndex={(currentPage - 1) * itemsPerPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <OutletFormModal
        isOpen={isModalOpen}
        editingOutlet={editingOutlet}
        isSaving={isSaving}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
