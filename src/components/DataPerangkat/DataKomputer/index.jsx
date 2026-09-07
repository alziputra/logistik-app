import React, { useCallback } from "react";
import { Monitor, Search, Plus } from "lucide-react";

import KomputerTable from "./KomputerTable";
import KomputerModal from "./KomputerModal";
import QrLabelModal from "../../Modal/QrLabelModal";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import ToastNotif from "../../Modal/ToastNotif";
import ExcelActionButtons from "../../Common/ExcelActionButtons";
import { addKomputer, updateKomputer, deleteKomputer } from "../../../services/komputerService";
import { useDeviceTableState } from "../../../hooks/useDeviceTableState";

export default function DataKomputer({
  userRole = "admin",
  computers = [],
  outlets = [],
  inventory = [],
  vendors = [],
  filterStatus: propFilterStatus = "Semua",
  computerFilter,
  setComputerFilter,
  setFilterStatus,
  computerSearch = "",
  setComputerSearch,
  loadAllData,
}) {
  const filterKomputerFn = useCallback((item, search, statusFilter) => {
    const q = (search || "").toLowerCase();
    const matchSearch = item.produk?.toLowerCase().includes(q) || item.sn?.toLowerCase().includes(q) || item.outlet?.toLowerCase().includes(q) || item.ipAddress?.toLowerCase().includes(q) || item.vendor?.toLowerCase().includes(q);

    let matchFilter = true;
    if (statusFilter === "warning" || statusFilter === "Sewa Habis" || statusFilter === "Habis") {
      const st = (item.status || "").toLowerCase();
      matchFilter = st.includes("habis") || st.includes("warning") || st.includes("akan habis") || (item.tanggalSelesai && new Date(item.tanggalSelesai) <= new Date(Date.now() + 30 * 86400000));
    } else if (statusFilter && statusFilter !== "Semua") {
      matchFilter = (item.status || "").toLowerCase() === statusFilter.toLowerCase();
    }
    return matchSearch && matchFilter;
  }, []);

  const {
    searchQuery,
    handleSearchChange,
    filterStatusState,
    handleFilterChange,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredData,
    totalPages,
    startIndex,
    paginatedData,
    isModalOpen,
    setIsModalOpen,
    editingId,
    formData,
    setFormData,
    isSaving,
    openAddModal,
    openEditModal,
    handleSave,
    qrModalData,
    setQrModalData,
    deleteConfirm,
    setDeleteConfirm,
    requestDelete,
    handleDeleteConfirm,
    notif,
    setNotif,
  } = useDeviceTableState({
    data: computers,
    filterFn: filterKomputerFn,
    externalSearch: computerSearch,
    onExternalSearchChange: setComputerSearch,
    externalFilter: computerFilter,
    onExternalFilterChange: (newSt) => {
      if (setComputerFilter) setComputerFilter(newSt);
      if (setFilterStatus) setFilterStatus(newSt);
    },
    initialFilter: propFilterStatus,
    loadAllData,
  });

  return (
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in duration-300 relative print:hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Monitor className="w-6 h-6 text-emerald-400" /> Manajemen Data Komputer (PC / Laptop)
          </h2>
          <p className="text-sm text-slate-400 mt-1">Kelola data perangkat komputer, IP address, spesifikasi teknis, dan masa sewa.</p>
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
            <button onClick={() => openAddModal({})} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors text-sm cursor-pointer">
              <Plus className="w-4 h-4" /> Tambah Komputer
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Cari model, S/N, IP, atau outlet..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-sm text-slate-100 placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-200 text-xs bg-slate-700 hover:bg-slate-600 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                  title="Hapus Pencarian"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Status Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => handleFilterChange("Semua")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filterStatusState === "Semua" ? "bg-slate-800 text-white font-bold shadow-xs" : "text-slate-400 hover:text-slate-200"}`}
              >
                Semua Data
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("Sewa Berjalan")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterStatusState === "Sewa Berjalan" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Sewa Berjalan
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("warning")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatusState === "warning" || filterStatusState === "Sewa Habis" ? "bg-rose-950 text-rose-400 border border-rose-800/60 font-bold" : "text-slate-400 hover:text-rose-400"
                }`}
              >
                <span>⚠️ Sewa Habis</span>
              </button>
            </div>
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
          onEdit={openEditModal}
          onDelete={(id, nama) => requestDelete(id, nama)}
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
        onSave={(e) => handleSave(e, addKomputer, updateKomputer, "Komputer")}
      />

      <QrLabelModal data={qrModalData} onClose={() => setQrModalData(null)} />

      <ConfirmDeleteModal show={deleteConfirm.show} name={deleteConfirm.name} onConfirm={() => handleDeleteConfirm(deleteKomputer, "Data komputer")} onCancel={() => setDeleteConfirm({ show: false, id: null, name: "" })} />

      <ToastNotif notif={notif} onClose={() => setNotif({ show: false, message: "", type: "success" })} />
    </div>
  );
}
