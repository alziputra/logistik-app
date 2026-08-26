import React, { useState } from "react";
import { Key, Search, Plus, FileSpreadsheet } from "lucide-react";
import ExcelActionButtons from "../../Common/ExcelActionButtons";
import Pagination from "../../Common/Pagination";
import SewaTable from "./SewaTable";
import SewaModal from "./SewaModal";
import { addMenuSewa, updateMenuSewa, deleteMenuSewa } from "../../../services/menuSewaService";

export default function BangunanSewa({
  userRole = "admin",
  sewas = [],
  outlets = [],
  loadAllData,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const filteredSewas = sewas.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.nama_outlet && item.nama_outlet.toLowerCase().includes(q)) ||
      (item.kode_outlet && item.kode_outlet.toLowerCase().includes(q)) ||
      (item.alamat && item.alamat.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredSewas.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredSewas.slice(startIndex, startIndex + itemsPerPage);

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
        await updateMenuSewa(editingId, formData);
      } else {
        await addMenuSewa(formData);
      }
      setIsModalOpen(false);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menyimpan data sewa bangunan:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data sewa ini?")) return;
    try {
      await deleteMenuSewa(id);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menghapus data sewa:", err);
    }
  };



  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-950 p-2.5 rounded-2xl border border-emerald-800/40">
            <Key className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Daftar Sewa Gedung & Bangunan</h2>
            <p className="text-xs text-slate-400">Manajemen masa berlaku kontrak sewa outlet dan unit kantor.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <ExcelActionButtons
            data={filteredSewas}
            fileName="Sewa_Bangunan_Pegadaian"
            headersMap={{
              nama_outlet: "Nama Outlet",
              kode_outlet: "Kode Outlet",
              type_outlet: "Type Outlet",
              type_bangunan: "Type Bangunan",
              harga_sewa: "Harga Sewa",
              alamat: "Alamat",
            }}
            onImport={async (parsedRows) => {
              if (!parsedRows || parsedRows.length === 0) return;
              let count = 0;
              for (const row of parsedRows) {
                const nama_outlet = row.nama_outlet || row["Nama Outlet"] || row["nama_outlet"];
                if (!nama_outlet) continue;
                try {
                  await addMenuSewa({
                    nama_outlet,
                    kode_outlet: row.kode_outlet || row["Kode Outlet"] || "-",
                    type_outlet: row.type_outlet || row["Type Outlet"] || "CP",
                    type_bangunan: row.type_bangunan || row["Type Bangunan"] || "Ruko",
                    harga_sewa: Number(row.harga_sewa || row["Harga Sewa"] || 0),
                    alamat: row.alamat || row["Alamat"] || "-",
                  });
                  count++;
                } catch (err) {
                  console.error("Error import sewa:", err);
                }
              }
              alert(`${count} data sewa bangunan berhasil diimpor.`);
              if (loadAllData) loadAllData();
            }}
          />
          {userRole === "admin" && (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Tambah Sewa
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
              placeholder="Cari outlet, kode, atau alamat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-xs text-slate-100"
            />
          </div>
          <span className="text-xs font-semibold text-slate-400">Total Bangunan Sewa: {filteredSewas.length}</span>
        </div>

        <SewaTable
          paginatedData={paginatedData}
          userRole={userRole}
          startIndex={startIndex}
          onEdit={openEdit}
          onDelete={handleDelete}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSewas.length}
          startIndex={startIndex}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <SewaModal
        isOpen={isModalOpen}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        isSaving={isSaving}
        outletsList={outlets}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
