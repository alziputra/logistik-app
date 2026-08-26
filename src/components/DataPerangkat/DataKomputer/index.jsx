import React, { useState } from "react";
import { Monitor, Search, Plus } from "lucide-react";

import KomputerTable from "./KomputerTable";
import KomputerModal from "./KomputerModal";
import QrLabelModal from "../../Modal/QrLabelModal";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import ToastNotif from "../../Modal/ToastNotif";
import ExcelActionButtons from "../../Common/ExcelActionButtons";
import { addKomputer, updateKomputer, deleteKomputer } from "../../../services/komputerService";

export default function DataKomputer({
  userRole = "admin",
  computers = [],
  outlets = [],
  inventory = [],
  vendors = [],
  filterStatus: propFilterStatus = "Semua",
  setFilterStatus,
  loadAllData,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatusState, setFilterStatusState] = useState(propFilterStatus);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [qrModalData, setQrModalData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
  const [notif, setNotif] = useState({ show: false, message: "", type: "success" });

  const filteredData = computers.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      item.produk?.toLowerCase().includes(q) ||
      item.sn?.toLowerCase().includes(q) ||
      item.outlet?.toLowerCase().includes(q) ||
      item.ipAddress?.toLowerCase().includes(q);
    const matchFilter = filterStatusState === "Semua" || item.status === filterStatusState;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await updateKomputer(editingId, formData);
        setNotif({ show: true, message: "Data komputer berhasil diupdate!", type: "success" });
      } else {
        await addKomputer(formData);
        setNotif({ show: true, message: "Komputer baru berhasil ditambahkan!", type: "success" });
      }
      setIsModalOpen(false);
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menyimpan data komputer:", err);
      setNotif({ show: true, message: "Gagal menyimpan data komputer.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return;
    setIsSaving(true);
    try {
      await deleteKomputer(deleteConfirm.id);
      setNotif({ show: true, message: "Data komputer berhasil dihapus!", type: "success" });
      setDeleteConfirm({ show: false, id: null, name: "" });
      if (loadAllData) loadAllData();
    } catch (err) {
      console.error("Gagal menghapus komputer:", err);
      setNotif({ show: true, message: "Gagal menghapus data komputer.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative print:hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Monitor className="w-6 h-6 text-emerald-400" /> Manajemen Data Komputer (PC / Laptop)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Kelola data perangkat komputer, IP address, spesifikasi teknis, dan masa sewa.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ExcelActionButtons
            data={filteredData}
            fileName="Data_Komputer_Pegadaian"
            headersMap={{
              produk: "Model / Perangkat",
              sn: "Serial Number",
              outlet: "Outlet / Unit Kerja",
              ipAddress: "IP Address",
              status: "Status",
            }}
            onImport={async (parsedRows) => {
              if (!parsedRows || parsedRows.length === 0) return;
              let count = 0;
              for (const row of parsedRows) {
                const produk = row.produk || row["Model / Perangkat"] || row["produk"];
                const sn = row.sn || row["Serial Number"] || row["sn"];
                if (!produk || !sn) continue;
                try {
                  await addKomputer({
                    produk,
                    sn,
                    outlet: row.outlet || row["Outlet / Unit Kerja"] || "-",
                    ipAddress: row.ipAddress || row["IP Address"] || "-",
                    status: row.status || row["Status"] || "Aktif",
                  });
                  count++;
                } catch (err) {
                  console.error("Error import komputer:", err);
                }
              }
              setNotif({ show: true, message: `${count} data komputer berhasil diimpor!`, type: "success" });
              if (loadAllData) loadAllData();
            }}
          />
          {userRole === "admin" && (
            <button
              onClick={() => { setEditingId(null); setFormData({}); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Komputer
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Cari model, S/N, IP, atau outlet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Total Komputer: {filteredData.length}</span>
          </div>
        </div>

        <KomputerTable
          isLoading={false}
          paginatedData={paginatedData}
          filteredData={filteredData}
          userRole={userRole}
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          onEdit={(comp) => { setEditingId(comp.id); setFormData(comp); setIsModalOpen(true); }}
          onDelete={(id, nama) => setDeleteConfirm({ show: true, id, name: nama })}
          onQr={setQrModalData}
        />
      </div>

      <KomputerModal
        isOpen={isModalOpen}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        isSaving={isSaving}
        outletsList={outlets}
        inventoryList={inventory}
        vendorsList={vendors}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      <QrLabelModal data={qrModalData} onClose={() => setQrModalData(null)} />

      <ConfirmDeleteModal
        show={deleteConfirm.show}
        name={deleteConfirm.name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ show: false, id: null, name: "" })}
      />

      <ToastNotif notif={notif} onClose={() => setNotif({ show: false, message: "", type: "success" })} />
    </div>
  );
}
